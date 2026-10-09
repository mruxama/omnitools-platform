export type WatermarkAnchor =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "custom";

export type SizeMode =
  | "relative-width"
  | "relative-height"
  | "fixed-pixels"
  | "manual";

export interface NormalizedPosition {
  anchor: WatermarkAnchor;
  // Normalized center coordinates from 0.0 to 1.0
  x: number;
  y: number;
  offsetXPercent: number; // -50% to +50%
  offsetYPercent: number;
  marginPercent: number; // 0% to 20%
}

export interface WatermarkSizeConfig {
  mode: SizeMode;
  percentage: number; // 1 to 100
  fixedPx: number;
  manualWidth?: number;
  manualHeight?: number;
  lockAspectRatio: boolean;
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface StrokeConfig {
  enabled: boolean;
  color: string;
  width: number;
}

export interface BackgroundBadgeConfig {
  enabled: boolean;
  color: string;
  opacity: number; // 0 to 100
  padding: number;
  borderRadius: number;
}

export interface BaseWatermarkLayer {
  id: string;
  name: string;
  opacity: number; // 0 to 100
  rotation: number; // -180 to 180 degrees
  position: NormalizedPosition;
  size: WatermarkSizeConfig;
  visible: boolean;
  locked: boolean;
  tiled: boolean;
  tileSpacing: number; // spacing between repeating tiles in px or %
}

export interface TextWatermarkLayer extends BaseWatermarkLayer {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number; // Base point size
  fontWeight: "normal" | "500" | "600" | "bold" | "900";
  color: string;
  letterSpacing: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  shadow: ShadowConfig;
  stroke: StrokeConfig;
  background: BackgroundBadgeConfig;
}

export interface LogoWatermarkLayer extends BaseWatermarkLayer {
  type: "logo";
  assetUrl: string;
  assetName: string;
  originalWidth: number;
  originalHeight: number;
  preserveAlpha: boolean;
}

export type WatermarkLayer = TextWatermarkLayer | LogoWatermarkLayer;

export interface VideoTimingConfig {
  enabled: boolean; // if false, applies across entire video
  startTime: number; // in seconds
  endTime: number; // in seconds
  fadeIn: number; // fade in duration in seconds
  fadeOut: number; // fade out duration in seconds
}

export interface ExportOptions {
  filenamePrefix: string;
  filenameSuffix: string; // default "_watermarked"
  imageFormat: "original" | "image/jpeg" | "image/png" | "image/webp";
  imageQuality: number; // 0.1 to 1.0
  videoFormat: "original" | "video/mp4" | "video/webm";
  videoQuality: "balanced" | "high" | "small";
}

export interface WatermarkPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isCustom?: boolean;
  layers: WatermarkLayer[];
  videoTiming: VideoTimingConfig;
  exportOptions: Partial<ExportOptions>;
}

export interface MediaItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: "image" | "video";
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  duration?: number; // for videos
  thumbnailUrl: string;
  selected: boolean;
  customOverrides?: Partial<WatermarkGlobalConfig>;
}

export interface WatermarkGlobalConfig {
  layers: WatermarkLayer[];
  videoTiming: VideoTimingConfig;
  exportOptions: ExportOptions;
}

export type ProcessingStatus =
  | "idle"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface ProcessingJob {
  id: string;
  mediaId: string;
  mediaName: string;
  mediaType: "image" | "video";
  originalSize: number;
  status: ProcessingStatus;
  progress: number; // 0 to 100
  resultBlob?: Blob;
  resultUrl?: string;
  outputSize?: number;
  outputName?: string;
  error?: string;
  startTime?: number;
  durationMs?: number;
}
