import { ConversionJob, ConversionResult } from "../../types";

/**
 * Extracts a frame from a video file at a specific timestamp and returns a JPG or PNG blob
 */
export async function convertMedia(job: ConversionJob): Promise<ConversionResult> {
  const startTime = performance.now();
  const { file, outputFormat, options } = job;

  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = videoUrl;
  video.muted = true;
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video metadata"));
  });

  // Seek to trimStart or 1s
  const seekTime = options?.trimStart || Math.min(1.0, video.duration / 2);
  video.currentTime = seekTime;

  await new Promise<void>((resolve) => {
    video.onseeked = () => resolve();
  });

  const canvas = document.createElement("canvas");
  const width = options?.width || video.videoWidth || 640;
  const height = options?.height || video.videoHeight || 360;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(videoUrl);
    throw new Error("Failed to get 2D canvas context");
  }

  ctx.drawImage(video, 0, 0, width, height);
  URL.revokeObjectURL(videoUrl);

  const mimeType = outputFormat === "png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to encode frame from video"));
      },
      mimeType,
      0.9
    );
  });

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}_frame.${outputFormat}`;

  return {
    id: job.id,
    fileName: outputFileName,
    outputFormat,
    mimeType,
    blob,
    dataUrl: URL.createObjectURL(blob),
    originalSize: file.size,
    outputSize: blob.size,
    durationMs: Math.round(performance.now() - startTime),
    provider: "BrowserMediaFrameProvider",
  };
}
