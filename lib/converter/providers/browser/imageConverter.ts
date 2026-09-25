import { ConversionJob, ConversionResult } from "../../types";

export async function convertImage(job: ConversionJob): Promise<ConversionResult> {
  const startTime = performance.now();
  const { file, outputFormat, options } = job;

  // 1. Load image into HTMLImageElement
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to decode image "${file.name}"`));
    img.src = objectUrl;
  });

  // 2. Determine target dimensions
  let targetWidth = options?.width || img.naturalWidth;
  let targetHeight = options?.height || img.naturalHeight;

  if (options?.maintainAspectRatio && options?.width && !options?.height) {
    targetHeight = Math.round((img.naturalHeight / img.naturalWidth) * options.width);
  } else if (options?.maintainAspectRatio && options?.height && !options?.width) {
    targetWidth = Math.round((img.naturalWidth / img.naturalHeight) * options.height);
  }

  // 3. Render onto Canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Unable to create canvas 2D rendering context.");
  }

  // 4. Background filling (e.g. for JPEG without transparency)
  if (outputFormat === "jpg" || options?.backgroundColor) {
    ctx.fillStyle = options?.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // 5. Rotation if requested
  if (options?.rotate) {
    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((options.rotate * Math.PI) / 180);
    ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
    ctx.restore();
  } else {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }

  // 6. Grayscale filter
  if (options?.grayscale) {
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  URL.revokeObjectURL(objectUrl);

  // 7. Export to target format Blob
  let mimeType = "image/png";
  if (outputFormat === "jpg" || outputFormat === "jpeg") mimeType = "image/jpeg";
  else if (outputFormat === "webp") mimeType = "image/webp";
  else if (outputFormat === "bmp") mimeType = "image/bmp";
  else if (outputFormat === "ico") mimeType = "image/x-icon";
  else if (outputFormat === "avif") mimeType = "image/avif";

  const quality = (options?.quality || 90) / 100;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to encode canvas as ${mimeType}`));
      },
      mimeType,
      quality
    );
  });

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${outputFormat}`;
  const durationMs = Math.round(performance.now() - startTime);

  return {
    id: job.id,
    fileName: outputFileName,
    outputFormat,
    mimeType,
    blob,
    dataUrl: URL.createObjectURL(blob),
    originalSize: file.size,
    outputSize: blob.size,
    durationMs,
    provider: "BrowserCanvasProvider",
  };
}
