export type FormatCategory =
  | "document"
  | "image"
  | "video"
  | "audio"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "vector"
  | "ebook"
  | "font"
  | "data";

export type SupportStatus = "AVAILABLE" | "BETA" | "COMING_SOON";

export type ProcessingMode = "browser" | "server" | "external";

export interface FormatDefinition {
  id: string; // e.g. "jpg", "png", "pdf", "docx"
  category: FormatCategory;
  displayName: string;
  extensions: string[]; // lowercase, without dot
  mimeTypes: string[];
  aliases?: string[];
  canInput: boolean;
  canOutput: boolean;
  status: SupportStatus;
  processingMode: ProcessingMode;
  engines: string[]; // e.g. ["canvas", "pdf-lib", "ffmpeg", "webaudio", "jszip"]
  supportedOptions?: {
    quality?: boolean;
    resolution?: boolean;
    width?: boolean;
    height?: boolean;
    bitrate?: boolean;
    sampleRate?: boolean;
    channels?: boolean;
    fps?: boolean;
    duration?: boolean;
    trim?: boolean;
    compressionLevel?: boolean;
    pageSize?: boolean;
    orientation?: boolean;
    margins?: boolean;
    backgroundColor?: boolean;
    grayscale?: boolean;
    volume?: boolean;
  };
  preview: boolean;
  compression: boolean;
  metadata: boolean;
  seoSlug: string;
  description: string;
}

export interface GenericConversionOptions {
  quality?: number; // 1 to 100
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  backgroundColor?: string;
  grayscale?: boolean;
  rotate?: number;
  // Audio / Video
  bitrate?: number; // kbps
  sampleRate?: number; // Hz
  channels?: 1 | 2;
  volume?: number; // multiplier 0.0 - 2.0
  trimStart?: number; // seconds
  trimEnd?: number; // seconds
  fps?: number;
  // Document / PDF
  pageSize?: "A4" | "Letter" | "Legal" | "fit";
  orientation?: "portrait" | "landscape";
  margins?: number; // points
  // Archive
  compressionLevel?: number; // 1 to 9
}

export interface ConversionJob {
  id: string;
  file: File;
  inputFormat: string; // id
  outputFormat: string; // id
  options?: GenericConversionOptions;
  onProgress?: (progressPercent: number) => void;
}

export interface ConversionResult {
  id: string;
  fileName: string;
  outputFormat: string;
  mimeType: string;
  blob: Blob;
  dataUrl?: string;
  originalSize: number;
  outputSize: number;
  durationMs: number;
  provider: string;
}

export interface ConversionHistoryItem {
  id: string;
  fileName: string;
  inputFormat: string;
  outputFormat: string;
  originalSize: number;
  outputSize?: number;
  timestamp: number;
  status: "success" | "error";
  optionsSummary?: string;
}

export interface WorkflowStep {
  id: string;
  action: "convert" | "compress" | "resize" | "watermark" | "rotate" | "archive";
  name: string;
  targetFormat?: string;
  options: Record<string, any>;
}
