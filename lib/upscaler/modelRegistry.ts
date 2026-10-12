import { ModelMetadata } from './types';

/**
 * Registry of browser-compatible lightweight super-resolution models.
 * Weights are hosted on static CDN or HuggingFace / GitHub raw releases.
 */
export const MODEL_REGISTRY: Record<string, ModelMetadata> = {
  'realesrgan-x4-fast': {
    id: 'realesrgan-x4-fast',
    name: 'Real-ESRGAN Compact (4×)',
    description: 'High-speed super-resolution model optimized for web & e-commerce photography with crisp edge reconstruction.',
    nativeScale: 4,
    url: 'https://huggingface.co/rocca/real-esrgan-onnx/resolve/main/realesr-general-x4v3.onnx',
    fileSizeMB: 17.5,
    inputChannels: 3,
    supportsAlpha: true,
    defaultTileSize: 256,
    recommendedProvider: 'webgpu',
    license: 'BSD-3-Clause',
  },
  'realesrgan-anime-x4': {
    id: 'realesrgan-anime-x4',
    name: 'Real-ESRGAN Anime & Graphic (4×)',
    description: 'Sharp line reconstruction and artifact removal tailored for illustrations, logos, and graphic merchandise.',
    nativeScale: 4,
    url: 'https://huggingface.co/rocca/real-esrgan-onnx/resolve/main/realesrgan-x4plus-anime.onnx',
    fileSizeMB: 16.8,
    inputChannels: 3,
    supportsAlpha: true,
    defaultTileSize: 256,
    recommendedProvider: 'webgpu',
    license: 'BSD-3-Clause',
  },
  'swin2sr-light-x2': {
    id: 'swin2sr-light-x2',
    name: 'Swin2SR Fast Classical (2×)',
    description: 'Lightweight classical super-resolution preserving authentic fabric, label, and texture details.',
    nativeScale: 2,
    url: 'https://huggingface.co/rocca/real-esrgan-onnx/resolve/main/realesr-general-x4v3.onnx',
    fileSizeMB: 14.2,
    inputChannels: 3,
    supportsAlpha: true,
    defaultTileSize: 128,
    recommendedProvider: 'wasm',
    license: 'Apache-2.0',
  },
};

export const DEFAULT_MODEL_ID = 'realesrgan-x4-fast';

export function getModelById(id: string): ModelMetadata {
  return MODEL_REGISTRY[id] || MODEL_REGISTRY[DEFAULT_MODEL_ID];
}
