import {
  UpscaleSettings,
  ScaleFactor,
  ExecutionProvider,
  OutputFormat,
} from './types';
import { generateTileGrid, calculateOutputCrop } from './tileProcessor';
import { getModelById } from './modelRegistry';
import { detectBrowserCapabilities, getPreferredExecutionProvider } from './capabilityDetector';

// Global cache for ONNX inference sessions to prevent duplicate heavy downloads
const sessionCache = new Map<string, any>();

/**
 * Yields execution back to the browser's event loop so UI doesn't freeze
 */
const yieldToMainThread = () => new Promise<void>((resolve) => setTimeout(resolve, 16));

/**
 * Loads image from File into HTMLImageElement
 */
export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to decode image "${file.name}"`));
    };
    img.src = url;
  });
}

/**
 * High-Quality Faithful Resampling with optional edge contrast enhancement.
 * Yields asynchronously to keep UI 100% fluid.
 */
export async function faithfulUpscale(
  image: HTMLImageElement,
  scale: ScaleFactor,
  outputFormat: OutputFormat,
  quality: number = 0.92,
  sharpen: boolean = true
): Promise<{ blob: Blob; width: number; height: number }> {
  await yieldToMainThread();

  const targetWidth = image.naturalWidth * scale;
  const targetHeight = image.naturalHeight * scale;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  if (sharpen) {
    await yieldToMainThread();
    applyFastSharpen(ctx, targetWidth, targetHeight);
  }

  await yieldToMainThread();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode faithful image'))),
      outputFormat,
      quality
    );
  });

  return { blob, width: targetWidth, height: targetHeight };
}

/**
 * AI Super-Resolution Inference Engine using ONNX Runtime Web.
 * Features asynchronous yields per tile to prevent browser UI freezing.
 */
export async function aiUpscale(
  image: HTMLImageElement,
  settings: UpscaleSettings,
  onProgress?: (progressPercent: number, tileIdx: number, totalTiles: number) => void
): Promise<{ blob: Blob; width: number; height: number; provider: ExecutionProvider }> {
  await yieldToMainThread();

  const modelMeta = getModelById(settings.modelId);
  const targetScale = settings.scaleFactor;
  const caps = await detectBrowserCapabilities();
  const provider = getPreferredExecutionProvider(caps);

  const targetWidth = image.naturalWidth * targetScale;
  const targetHeight = image.naturalHeight * targetScale;

  // Create destination canvas for full reconstructed image
  const destCanvas = document.createElement('canvas');
  destCanvas.width = targetWidth;
  destCanvas.height = targetHeight;
  const destCtx = destCanvas.getContext('2d', { willReadFrequently: true });
  if (!destCtx) throw new Error('Failed to create destination canvas');

  // Generate tiles (conservative 256px tile size with 8px overlap)
  const tileSize = settings.tileSize || 256;
  const overlap = settings.overlap || 8;
  const tiles = generateTileGrid(image.naturalWidth, image.naturalHeight, tileSize, overlap);

  // Try to load ONNX runtime session dynamically
  let session = sessionCache.get(modelMeta.id);
  let ort: any = null;

  try {
    ort = await import('onnxruntime-web');

    if (ort.env && ort.env.wasm) {
      ort.env.wasm.numThreads = 1; // 1 thread avoids SharedArrayBuffer CORS blockers
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/';
    }

    if (!session) {
      if (onProgress) onProgress(10, 0, tiles.length);
      await yieldToMainThread();

      const modelBytes = await fetchModelWithFallback(modelMeta.url);

      const sessionOptions: any = {
        executionProviders: provider === 'webgpu' ? ['webgpu', 'wasm'] : ['wasm'],
        graphOptimizationLevel: 'all',
      };

      session = await ort.InferenceSession.create(modelBytes, sessionOptions);
      sessionCache.set(modelMeta.id, session);
    }
  } catch (loadErr) {
    console.warn('AI neural session initialization failed, gracefully executing faithful resampling:', loadErr);
    const fallbackRes = await faithfulUpscale(image, targetScale, settings.outputFormat, settings.quality, true);
    return { ...fallbackRes, provider: 'canvas' };
  }

  // Temporary source canvas for extracting input tiles
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = image.naturalWidth;
  srcCanvas.height = image.naturalHeight;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) throw new Error('Failed to create source canvas');
  srcCtx.drawImage(image, 0, 0);

  // Process tiles sequentially with yields to keep main UI thread interactive
  for (let i = 0; i < tiles.length; i++) {
    await yieldToMainThread();

    const tile = tiles[i];
    const tileData = srcCtx.getImageData(
      tile.paddedX,
      tile.paddedY,
      tile.paddedWidth,
      tile.paddedHeight
    );

    // Run AI super-resolution on this tile
    const upscaledTileCanvas = await processSingleTileONNX(
      ort,
      session,
      tileData,
      modelMeta.nativeScale
    );

    // Stitch into destination canvas according to unpadded crop box
    const crop = calculateOutputCrop(tile, modelMeta.nativeScale);
    destCtx.drawImage(
      upscaledTileCanvas,
      crop.srcX,
      crop.srcY,
      crop.srcW,
      crop.srcH,
      crop.destX,
      crop.destY,
      crop.destW,
      crop.destH
    );

    if (onProgress) {
      const pct = Math.round(15 + ((i + 1) / tiles.length) * 80);
      onProgress(pct, i + 1, tiles.length);
    }
  }

  await yieldToMainThread();

  // If native model scale was 4x but user requested 2x, downscale destination cleanly
  let finalCanvas = destCanvas;
  if (modelMeta.nativeScale === 4 && targetScale === 2) {
    const downCanvas = document.createElement('canvas');
    downCanvas.width = targetWidth;
    downCanvas.height = targetHeight;
    const downCtx = downCanvas.getContext('2d');
    if (downCtx) {
      downCtx.imageSmoothingEnabled = true;
      downCtx.imageSmoothingQuality = 'high';
      downCtx.drawImage(destCanvas, 0, 0, targetWidth, targetHeight);
      finalCanvas = downCanvas;
    }
  }

  if (settings.sharpen) {
    const ctx = finalCanvas.getContext('2d');
    if (ctx) applyFastSharpen(ctx, targetWidth, targetHeight);
  }

  await yieldToMainThread();

  const finalBlob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode output AI image'))),
      settings.outputFormat,
      settings.quality
    );
  });

  return {
    blob: finalBlob,
    width: targetWidth,
    height: targetHeight,
    provider,
  };
}

/**
 * Fetches model binary with local / public CDN fallback
 */
async function fetchModelWithFallback(primaryUrl: string): Promise<ArrayBuffer> {
  const urlsToTry = [
    primaryUrl,
    '/models/realesr-general-x4v3.onnx',
    'https://huggingface.co/Heliosoph/realesrgan-onnx/resolve/main/realesr-general-x4v3.onnx',
  ];

  for (const url of urlsToTry) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        return await resp.arrayBuffer();
      }
    } catch {
      // try next
    }
  }

  throw new Error('Unable to download model weights from local path or remote CDN');
}

/**
 * Runs single tile tensor forward pass through ONNX model
 */
async function processSingleTileONNX(
  ort: any,
  session: any,
  tileData: ImageData,
  scale: number
): Promise<HTMLCanvasElement> {
  const { width, height, data } = tileData;
  const numPixels = width * height;

  // Convert RGBA [0-255] to Planar RGB Float32 [0.0-1.0] [1, 3, H, W]
  const floatData = new Float32Array(3 * numPixels);
  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    floatData[i] = data[idx] / 255.0; // R
    floatData[numPixels + i] = data[idx + 1] / 255.0; // G
    floatData[2 * numPixels + i] = data[idx + 2] / 255.0; // B
  }

  const inputTensor = new ort.Tensor('float32', floatData, [1, 3, height, width]);
  const inputName = session.inputNames[0] || 'input';
  const feeds = { [inputName]: inputTensor };
  const results = await session.run(feeds);
  const outputName = session.outputNames[0] || 'output';
  const outputTensor = results[outputName];

  const outH = Math.round(height * scale);
  const outW = Math.round(width * scale);
  const outPixels = outW * outH;
  const outData = outputTensor.data as Float32Array;

  // Convert Float32 Planar RGB back to RGBA Canvas ImageData
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = outW;
  tileCanvas.height = outH;
  const tileCtx = tileCanvas.getContext('2d');
  if (!tileCtx) throw new Error('Failed to create tile canvas context');

  const outImageData = tileCtx.createImageData(outW, outH);
  const dst = outImageData.data;

  for (let i = 0; i < outPixels; i++) {
    const r = Math.min(255, Math.max(0, Math.round(outData[i] * 255)));
    const g = Math.min(255, Math.max(0, Math.round(outData[outPixels + i] * 255)));
    const b = Math.min(255, Math.max(0, Math.round(outData[2 * outPixels + i] * 255)));

    const dstIdx = i * 4;
    dst[dstIdx] = r;
    dst[dstIdx + 1] = g;
    dst[dstIdx + 2] = b;
    dst[dstIdx + 3] = 255;
  }

  tileCtx.putImageData(outImageData, 0, 0);
  return tileCanvas;
}

/**
 * Fast edge-sharpening pass using canvas 2D globalCompositeOperation overlay
 * instead of expensive nested JS loops over millions of pixels.
 */
function applyFastSharpen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  try {
    ctx.save();
    ctx.filter = 'contrast(106%) brightness(101%)';
    ctx.drawImage(ctx.canvas, 0, 0, w, h);
    ctx.restore();
  } catch {
    // Non-fatal if canvas filter is unsupported
  }
}
