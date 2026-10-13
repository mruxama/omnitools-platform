export interface VideoAnalysisResult {
  filename: string;
  fileSize: number;
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  fps: number;
  container: string; // e.g. "mov", "mp4", "m4v", "mkv", "webm"
  videoCodec: string; // e.g. "h264", "hevc", "prores", "unknown"
  audioCodec?: string; // e.g. "aac", "pcm", "opus", "mp3", "none"
  isHdr: boolean;
  colorTransfer?: string;
  canRemuxToMp4: boolean;
  recommendedMode: "remux" | "transcode";
  incompatibilityReason?: string;
  thumbnailUrl?: string;
}

export type ConversionModeOption =
  | "auto"
  | "remux"
  | "high-quality"
  | "compatibility"
  | "small-size"
  | "custom";

export type OutputContainerOption = "mp4" | "mov" | "webm" | "mkv";

export type TargetResolutionOption =
  | "original"
  | "4k"
  | "1080p"
  | "720p"
  | "custom";

export type TargetFpsOption = "original" | "60" | "30" | "custom";

export interface BulkVideoConverterConfig {
  outputContainer: OutputContainerOption;
  conversionMode: ConversionModeOption;
  resolution: TargetResolutionOption;
  customWidth?: number;
  customHeight?: number;
  fps: TargetFpsOption;
  customFps?: number;
  audioMode: "copy" | "aac" | "strip";
  audioBitrateKbps: number;
  qualityPreset: "maximum" | "high" | "balanced" | "small";
  crf: number; // 18 to 28
  fastStart: boolean; // optimize for web streaming
  preserveOrientation: boolean;
  preserveHdr: boolean;
  filenamePrefix: string;
  filenameSuffix: string;
}

export interface VideoConversionOutput {
  blob: Blob;
  outputName: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  usedRemux: boolean;
  format: string;
}
