export type CompressionMode = 'target-size' | 'quality' | 'bitrate' | 'resolution';

export type VideoCodec = 'h264' | 'h265' | 'vp9' | 'av1' | 'copy';
export type AudioCodec = 'aac' | 'mp3' | 'opus' | 'none' | 'copy';
export type ContainerFormat = 'mp4' | 'webm' | 'mkv' | 'mov';

export interface ResolutionConfig {
  width: number;
  height: number;
  label: string;
}

export interface VideoMetadata {
  filename: string;
  fileSize: number; // in bytes
  duration: number; // in seconds
  width: number;
  height: number;
  aspectRatio: number;
  fps: number;
  videoCodec?: string;
  audioCodec?: string;
  bitrate?: number; // bps
  thumbnailUrl?: string;
}

export interface CompressionSettings {
  mode: CompressionMode;
  targetSizeMB?: number; // Used for target-size mode
  percentageReduction?: number; // 0 to 90 %
  crf: number; // Constant Rate Factor: 0 - 51 (18-28 typical for H.264)
  videoBitrateKbps?: number; // Used for bitrate mode
  audioBitrateKbps: number; // e.g. 64, 96, 128, 192, 320
  resolutionScale?: number; // 1.0 (original), 0.75, 0.5, etc.
  targetResolution?: 'original' | '4k' | '1440p' | '1080p' | '720p' | '480p' | '360p' | 'custom';
  customWidth?: number;
  customHeight?: number;
  maintainAspectRatio: boolean;
  videoCodec: VideoCodec;
  audioCodec: AudioCodec;
  container: ContainerFormat;
  presetSpeed: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow';
  twoPass: boolean;
  stripAudio: boolean;
  fastStart: boolean; // movflags +faststart for web streaming
}

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  badge?: string;
  settings: Partial<CompressionSettings>;
}

export type JobStatus = 'queued' | 'analyzing' | 'compressing' | 'completed' | 'failed' | 'cancelled';

export interface CompressionJob {
  id: string;
  file: File;
  metadata: VideoMetadata;
  settings: CompressionSettings;
  status: JobStatus;
  progress: number; // 0 to 100
  speedMultiplier?: number; // e.g. 1.5x
  estimatedRemainingSec?: number;
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
  compressedSize?: number;
  savingsPercentage?: number;
  processingEngine: 'browser' | 'server';
  createdAt: number;
  completedAt?: number;
}

export interface ComparisonMetrics {
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savingsPercent: number;
  originalBitrate?: number;
  newBitrate?: number;
  compressionRatio: number;
}
