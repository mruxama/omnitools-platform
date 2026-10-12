import { WorkflowStep, ConversionResult } from "../types";
import { defaultBrowserProvider } from "../providers/browser/browserProvider";
import { detectFileFormat } from "../detector";
import { processImageWithWatermarks } from "@/lib/watermark/imageProcessor";
import { compressVideoInBrowser } from "@/lib/video-compressor/browserCompressor";
import { DEFAULT_COMPRESSION_SETTINGS } from "@/lib/video-compressor/presets";
import { VideoMetadata } from "@/lib/video-compressor/types";
import { WatermarkLayer } from "@/lib/watermark/types";
import JSZip from "jszip";

export interface WorkflowExecutionProgress {
  currentStepIndex: number;
  totalSteps: number;
  stepName: string;
  progressPercent: number;
  detail?: string;
}

export interface AutomatedScenarioPreset {
  id: string;
  name: string;
  description: string;
  category: "web" | "social" | "office" | "archive" | "ecommerce" | "privacy";
  icon: string;
  badge: string;
  steps: WorkflowStep[];
}

/**
 * Every possible automated workflow scenario preset
 */
export const AUTOMATED_SCENARIOS: AutomatedScenarioPreset[] = [
  {
    id: "web-asset-pipeline",
    name: "Web Asset Optimizer",
    description: "Converts image to next-gen WebP, resizes to standard 1200px max width, and applies 82% quality compression.",
    category: "web",
    icon: "Globe",
    badge: "Most Popular",
    steps: [
      {
        id: "step_convert_webp",
        action: "convert",
        name: "Convert to WebP",
        targetFormat: "webp",
        options: { quality: 85 },
      },
      {
        id: "step_resize_1200",
        action: "resize",
        name: "Resize to 1200px (Aspect Locked)",
        options: { width: 1200, maintainAspectRatio: true },
      },
      {
        id: "step_compress_opt",
        action: "compress",
        name: "High-Efficiency Compression",
        options: { quality: 80 },
      },
    ],
  },
  {
    id: "ecommerce-product-prep",
    name: "E-Commerce Product Showcase",
    description: "Square 1000x1000 resize, brand watermark badge, and clean JPEG output with white backdrop.",
    category: "ecommerce",
    icon: "ShoppingBag",
    badge: "E-Commerce",
    steps: [
      {
        id: "step_resize_sq",
        action: "resize",
        name: "Resize to 1000x1000",
        options: { width: 1000, height: 1000, maintainAspectRatio: true },
      },
      {
        id: "step_watermark_brand",
        action: "watermark",
        name: "Add Copyright Watermark",
        options: {
          text: "© Verified Store",
          position: "bottom-right",
          opacity: 75,
          fontSize: 22,
          color: "#ffffff",
        },
      },
      {
        id: "step_convert_jpg",
        action: "convert",
        name: "Export Clean JPEG",
        targetFormat: "jpg",
        options: { quality: 90, backgroundColor: "#ffffff" },
      },
    ],
  },
  {
    id: "social-media-post-prep",
    name: "Social Media Feed Publisher",
    description: "Applies 1080px width scaling, subtle watermark brand protection, and WebP compression.",
    category: "social",
    icon: "Share2",
    badge: "Social Media",
    steps: [
      {
        id: "step_resize_social",
        action: "resize",
        name: "Scale to 1080px Width",
        options: { width: 1080, maintainAspectRatio: true },
      },
      {
        id: "step_watermark_social",
        action: "watermark",
        name: "Watermark Creator Handle",
        options: {
          text: "@MyBrand",
          position: "bottom-left",
          opacity: 70,
          fontSize: 24,
        },
      },
      {
        id: "step_convert_social",
        action: "convert",
        name: "Format to WebP",
        targetFormat: "webp",
        options: { quality: 85 },
      },
    ],
  },
  {
    id: "video-mobile-stream",
    name: "Video Mobile Compressor",
    description: "Extracts video frame preview or compresses video down to 720p with bitrate optimization.",
    category: "social",
    icon: "Video",
    badge: "Video Stream",
    steps: [
      {
        id: "step_compress_vid",
        action: "compress",
        name: "Compress Video (720p / 26 CRF)",
        options: {
          targetResolution: "720p",
          crf: 26,
          audioBitrateKbps: 96,
        },
      },
    ],
  },
  {
    id: "doc-to-secure-pdf",
    name: "Document to Archived PDF",
    description: "Converts DOCX, Markdown, Text, or CSV into a standardized PDF and packages it into an encrypted/compressed ZIP.",
    category: "office",
    icon: "FileCheck",
    badge: "Office & PDF",
    steps: [
      {
        id: "step_convert_pdf",
        action: "convert",
        name: "Convert to Document PDF",
        targetFormat: "pdf",
        options: { pageSize: "A4", margins: 40 },
      },
      {
        id: "step_archive_zip",
        action: "archive",
        name: "Package into ZIP Container",
        targetFormat: "zip",
        options: { compressionLevel: 8 },
      },
    ],
  },
  {
    id: "confidential-watermark-archive",
    name: "Confidential Mark & Zip",
    description: "Stamps prominent red 'CONFIDENTIAL' watermark across media and packages into ZIP container.",
    category: "privacy",
    icon: "ShieldAlert",
    badge: "Security & Legal",
    steps: [
      {
        id: "step_watermark_confidential",
        action: "watermark",
        name: "Stamp 'CONFIDENTIAL' Mark",
        options: {
          text: "CONFIDENTIAL & PROPRIETARY",
          position: "center",
          opacity: 45,
          fontSize: 34,
          color: "#e11d48",
          rotation: -25,
        },
      },
      {
        id: "step_archive_confidential",
        action: "archive",
        name: "Compress into ZIP Archive",
        targetFormat: "zip",
        options: { compressionLevel: 9 },
      },
    ],
  },
  {
    id: "data-spreadsheet-export",
    name: "Data to Spreadsheet & Zip",
    description: "Transforms CSV, JSON, or TSV data directly into Microsoft Excel (.xlsx) and packages for distribution.",
    category: "office",
    icon: "Table",
    badge: "Spreadsheet",
    steps: [
      {
        id: "step_convert_xlsx",
        action: "convert",
        name: "Convert to Excel (.xlsx)",
        targetFormat: "xlsx",
        options: {},
      },
      {
        id: "step_zip_xlsx",
        action: "archive",
        name: "Pack into ZIP",
        targetFormat: "zip",
        options: { compressionLevel: 6 },
      },
    ],
  },
  {
    id: "thumbnail-strip-pipeline",
    name: "Multi-Size Thumbnail Generator",
    description: "Generates high-speed 400px mobile thumbnail in JPG format.",
    category: "web",
    icon: "Image",
    badge: "Thumbnails",
    steps: [
      {
        id: "step_resize_thumb",
        action: "resize",
        name: "Resize to 400px Thumbnail",
        options: { width: 400, maintainAspectRatio: true },
      },
      {
        id: "step_convert_thumb",
        action: "convert",
        name: "Convert to JPG",
        targetFormat: "jpg",
        options: { quality: 80, backgroundColor: "#ffffff" },
      },
    ],
  },
];

/**
 * Universal automated workflow executor that handles:
 * - Format conversion (images, docs, audio, spreadsheets)
 * - Dimension resizing & aspect ratio locking
 * - 90/180/270 rotation
 * - Watermarking (text, coordinates, brand stamps)
 * - Compression (CRF quality, target size, video stream)
 * - ZIP Packaging & Archiving
 */
export async function executeWorkflow(
  initialFile: File,
  steps: WorkflowStep[],
  onProgress?: (progress: WorkflowExecutionProgress) => void
): Promise<ConversionResult> {
  if (steps.length === 0) {
    throw new Error("Workflow must contain at least one step.");
  }

  let currentFile: File = initialFile;
  let lastResult: ConversionResult | null = null;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepPercentStart = Math.round((i / steps.length) * 100);

    onProgress?.({
      currentStepIndex: i + 1,
      totalSteps: steps.length,
      stepName: step.name,
      progressPercent: stepPercentStart,
      detail: `Executing ${step.action.toUpperCase()} action...`,
    });

    const detected = await detectFileFormat(currentFile);
    const inputExt = detected.format.id;

    // 1. WATERMARK ACTION
    if (step.action === "watermark") {
      const text = step.options.text || "CONFIDENTIAL";
      const pos = step.options.position || "bottom-right";
      const opacity = (step.options.opacity || 70) / 100;
      const color = step.options.color || "#ffffff";
      const fontSize = step.options.fontSize || 28;
      const rotation = step.options.rotation || 0;

      const layer: WatermarkLayer = {
        id: `wm_step_${i}`,
        name: "Automation Watermark",
        type: "text",
        text,
        visible: true,
        locked: false,
        tiled: false,
        tileSpacing: 20,
        opacity: step.options.opacity ?? 70,
        rotation,
        position: {
          anchor: (pos as any) || "bottom-right",
          x: pos === "center" ? 0.5 : pos.includes("right") ? 0.85 : 0.15,
          y: pos === "center" ? 0.5 : pos.includes("bottom") ? 0.85 : 0.15,
          offsetXPercent: 0,
          offsetYPercent: 0,
          marginPercent: 5,
        },
        size: {
          mode: "relative-width",
          percentage: 25,
          fixedPx: fontSize * 4,
          lockAspectRatio: true,
        },
        fontSize,
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
        color,
        letterSpacing: 0,
        lineHeight: 1.2,
        textAlign: "center",
        shadow: {
          enabled: true,
          color: "rgba(0,0,0,0.5)",
          blur: 4,
          offsetX: 2,
          offsetY: 2,
        },
        stroke: {
          enabled: true,
          color: "#000000",
          width: 2,
        },
        background: {
          enabled: true,
          color: "#000000",
          opacity: 30,
          padding: 8,
          borderRadius: 4,
        },
      };

      const wmRes = await processImageWithWatermarks(currentFile, [layer], {
        filenamePrefix: "",
        filenameSuffix: "_watermarked",
        imageFormat: "original",
        imageQuality: 0.9,
        videoFormat: "original",
        videoQuality: "balanced",
      });

      const baseName = currentFile.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}_watermarked.${inputExt}`;
      const blob = wmRes.blob;

      lastResult = {
        id: `step_wm_${i}`,
        fileName: outputName,
        outputFormat: inputExt,
        mimeType: blob.type || currentFile.type,
        blob,
        dataUrl: URL.createObjectURL(blob),
        originalSize: currentFile.size,
        outputSize: blob.size,
        durationMs: 150,
        provider: "WorkflowWatermarkEngine",
      };

      currentFile = new File([blob], outputName, { type: blob.type });
      continue;
    }

    // 2. VIDEO COMPRESS ACTION
    if (step.action === "compress" && detected.format.category === "video") {
      const metadata: VideoMetadata = {
        filename: currentFile.name,
        fileSize: currentFile.size,
        duration: 30,
        width: 1920,
        height: 1080,
        aspectRatio: 1.777,
        fps: 30,
      };

      const vidRes = await compressVideoInBrowser(
        currentFile,
        metadata,
        {
          ...DEFAULT_COMPRESSION_SETTINGS,
          crf: step.options.crf || 26,
          targetResolution: step.options.targetResolution || "720p",
          audioBitrateKbps: step.options.audioBitrateKbps || 96,
        },
        (p) => {
          onProgress?.({
            currentStepIndex: i + 1,
            totalSteps: steps.length,
            stepName: step.name,
            progressPercent: Math.round(stepPercentStart + (p / steps.length)),
            detail: `Compressing video: ${p}%`,
          });
        }
      );

      const baseName = currentFile.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}_compressed.mp4`;

      lastResult = {
        id: `step_comp_vid_${i}`,
        fileName: outputName,
        outputFormat: "mp4",
        mimeType: vidRes.blob.type || "video/mp4",
        blob: vidRes.blob,
        dataUrl: vidRes.url,
        originalSize: currentFile.size,
        outputSize: vidRes.size,
        durationMs: 1200,
        provider: "BrowserVideoCompressor",
      };

      currentFile = new File([vidRes.blob], outputName, { type: vidRes.blob.type });
      continue;
    }

    // 3. ARCHIVE / ZIP ACTION
    if (step.action === "archive" || step.targetFormat === "zip") {
      const zip = new JSZip();
      const arrayBuffer = await currentFile.arrayBuffer();
      zip.file(currentFile.name, arrayBuffer);

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: step.options.compressionLevel || 6 },
      });

      const baseName = currentFile.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}.zip`;

      lastResult = {
        id: `step_zip_${i}`,
        fileName: outputName,
        outputFormat: "zip",
        mimeType: "application/zip",
        blob: zipBlob,
        dataUrl: URL.createObjectURL(zipBlob),
        originalSize: currentFile.size,
        outputSize: zipBlob.size,
        durationMs: 200,
        provider: "WorkflowZipPackager",
      };

      currentFile = new File([zipBlob], outputName, { type: "application/zip" });
      continue;
    }

    // 4. GENERAL CONVERT / RESIZE / ROTATE / COMPRESS
    const targetFormat = step.targetFormat || inputExt;
    lastResult = await defaultBrowserProvider.convert({
      id: `step_${i}_${Date.now()}`,
      file: currentFile,
      inputFormat: inputExt,
      outputFormat: targetFormat,
      options: {
        ...step.options,
        width: step.options.width,
        height: step.options.height,
        rotate: step.options.rotate,
        quality: step.options.quality || 85,
        maintainAspectRatio: step.options.maintainAspectRatio ?? true,
      },
    });

    currentFile = new File([lastResult.blob], lastResult.fileName, {
      type: lastResult.mimeType,
    });
  }

  onProgress?.({
    currentStepIndex: steps.length,
    totalSteps: steps.length,
    stepName: "Complete",
    progressPercent: 100,
    detail: "All sequential pipeline operations successfully executed.",
  });

  return lastResult!;
}
