import { heicTo } from "heic-to";

export interface HeicConversionOptions {
  outputFormat: "image/jpeg" | "image/png" | "image/webp";
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  preserveMetadata?: boolean;
}

export interface HeicConversionResult {
  blob: Blob;
  width: number;
  height: number;
  outputName: string;
  size: number;
}

/**
 * Checks if a file is a HEIC/HEIF image by extension or MIME type.
 */
export function isHeicFile(file: File): boolean {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    name.endsWith(".heics") ||
    name.endsWith(".heifs") ||
    name.endsWith(".hif") ||
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence"
  );
}

/**
 * Converts a HEIC/HEIF File or Blob to JPEG, PNG, or WebP.
 * Uses client-side WebAssembly libheif decoding via `heic-to`.
 */
export async function convertHeicImage(
  file: File | Blob,
  fileName: string,
  options: HeicConversionOptions,
  onProgress?: (percent: number) => void
): Promise<HeicConversionResult> {
  if (onProgress) onProgress(15);

  const targetType = options.outputFormat || "image/jpeg";
  const quality = options.quality !== undefined ? options.quality : 0.92;

  // 1. Decode HEIC to standard Blob using WASM
  const convertedBlob = await heicTo({
    blob: file,
    type: targetType,
    quality: quality,
  });

  if (onProgress) onProgress(65);

  // 2. If resize or aspect ratio control is specified, handle via OffscreenCanvas / Canvas
  let finalBlob = convertedBlob;
  let finalWidth = 0;
  let finalHeight = 0;

  const imgBitmap = await createImageBitmap(convertedBlob);
  finalWidth = imgBitmap.width;
  finalHeight = imgBitmap.height;

  if (
    options.maxWidth ||
    options.maxHeight
  ) {
    let targetW = finalWidth;
    let targetH = finalHeight;

    if (options.maxWidth && targetW > options.maxWidth) {
      const ratio = options.maxWidth / targetW;
      targetW = options.maxWidth;
      if (options.maintainAspectRatio !== false) {
        targetH = Math.round(targetH * ratio);
      }
    }

    if (options.maxHeight && targetH > options.maxHeight) {
      const ratio = options.maxHeight / targetH;
      targetH = options.maxHeight;
      if (options.maintainAspectRatio !== false) {
        targetW = Math.round(targetW * ratio);
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgBitmap, 0, 0, targetW, targetH);
      finalWidth = targetW;
      finalHeight = targetH;

      finalBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Failed to encode canvas blob"));
          },
          targetType,
          quality
        );
      });
    }
  }

  imgBitmap.close();
  if (onProgress) onProgress(100);

  // Generate output filename
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
  const ext = targetType === "image/png" ? "png" : targetType === "image/webp" ? "webp" : "jpg";
  const outputName = `${baseName}.${ext}`;

  return {
    blob: finalBlob,
    width: finalWidth,
    height: finalHeight,
    outputName,
    size: finalBlob.size,
  };
}
