export type UpscaleMode = 'ai' | 'faithful';

export type ScaleFactor = 2 | 4;

export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export type ExecutionProvider = 'webgpu' | 'wasm' | 'canvas';

export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  nativeScale: ScaleFactor;
  url: string;
  fileSizeMB: number;
  inputChannels: 3; // RGB
  supportsAlpha: boolean;
  defaultTileSize: number;
  recommendedProvider: ExecutionProvider;
  license: string;
}

export interface BrowserCapabilities {
  hasWebGPU: boolean;
  hasWasm: boolean;
  hasSimd: boolean;
  hasOffscreenCanvas: boolean;
  estimatedMemoryGB?: number;
  recommendedTileSize: number;
}

export interface UpscaleSettings {
  mode: UpscaleMode;
  scaleFactor: ScaleFactor;
  modelId: string;
  outputFormat: OutputFormat;
  quality: number; // 0.1 to 1.0 (for JPEG and WebP)
  tileSize: number; // e.g. 128, 256, 512
  overlap: number; // e.g. 16, 24, 32 px
  preserveAlpha: boolean;
  sharpen: boolean;
  backgroundColor: string; // for JPEG export with transparent sources
}

export interface ImageMetadata {
  filename: string;
  width: number;
  height: number;
  fileSize: number; // bytes
  mimeType: string;
  aspectRatio: number;
  hasAlpha: boolean;
}

export type JobStatus = 'queued' | 'loading-model' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface UpscaleJob {
  id: string;
  file: File;
  previewUrl: string;
  metadata: ImageMetadata;
  settings: UpscaleSettings;
  status: JobStatus;
  progress: number; // 0 to 100
  currentTile?: number;
  totalTiles?: number;
  executionProvider?: ExecutionProvider;
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputWidth?: number;
  outputHeight?: number;
  outputSize?: number;
  processingTimeMs?: number;
  createdAt: number;
  completedAt?: number;
}

export interface TileRect {
  x: number;
  y: number;
  width: number;
  height: number;
  paddedX: number;
  paddedY: number;
  paddedWidth: number;
  paddedHeight: number;
}
