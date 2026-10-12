import { BrowserCapabilities, ExecutionProvider } from './types';

/**
 * Detects browser hardware capabilities including WebGPU support,
 * WebAssembly, OffscreenCanvas, and available memory.
 */
export async function detectBrowserCapabilities(): Promise<BrowserCapabilities> {
  let hasWebGPU = false;
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        hasWebGPU = true;
      }
    } catch {
      hasWebGPU = false;
    }
  }

  const hasWasm = typeof WebAssembly !== 'undefined';
  let hasSimd = false;
  if (hasWasm && typeof WebAssembly.validate === 'function') {
    // Basic SIMD feature detection bytes
    const simdBytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 26, 11]);
    try {
      hasSimd = WebAssembly.validate(simdBytes);
    } catch {
      hasSimd = false;
    }
  }

  const hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
  const memoryGB = typeof navigator !== 'undefined' && 'deviceMemory' in navigator
    ? (navigator as any).deviceMemory
    : 4;

  // Conservative tile size: 256 for WebGPU/high-mem, 128 for WASM/low-mem
  const recommendedTileSize = hasWebGPU ? 256 : 128;

  return {
    hasWebGPU,
    hasWasm,
    hasSimd,
    hasOffscreenCanvas,
    estimatedMemoryGB: memoryGB,
    recommendedTileSize,
  };
}

export function getPreferredExecutionProvider(caps: BrowserCapabilities): ExecutionProvider {
  if (caps.hasWebGPU) return 'webgpu';
  if (caps.hasWasm) return 'wasm';
  return 'canvas';
}
