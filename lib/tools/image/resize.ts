export interface ResizePreset {
  name: string;
  category: string;
  width: number;
  height: number;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  // Social Media
  { name: "Instagram Square", category: "Social", width: 1080, height: 1080 },
  { name: "Instagram Story / Reel", category: "Social", width: 1080, height: 1920 },
  { name: "Instagram Portrait", category: "Social", width: 1080, height: 1350 },
  { name: "YouTube Thumbnail", category: "Social", width: 1280, height: 720 },
  { name: "Twitter / X Header", category: "Social", width: 1500, height: 500 },
  { name: "Twitter / X Post", category: "Social", width: 1200, height: 675 },
  { name: "Facebook Cover", category: "Social", width: 820, height: 312 },
  { name: "LinkedIn Banner", category: "Social", width: 1584, height: 396 },
  // Web & Ecommerce
  { name: "Full HD (1080p)", category: "Display", width: 1920, height: 1080 },
  { name: "Standard HD (720p)", category: "Display", width: 1280, height: 720 },
  { name: "Ecommerce Product Square", category: "Ecommerce", width: 800, height: 800 },
  { name: "Website Favicon", category: "Web", width: 32, height: 32 },
  { name: "App Icon", category: "Web", width: 512, height: 512 },
];

export interface ResizeOptions {
  width: number;
  height: number;
  fitMode: "contain" | "cover" | "stretch";
  format?: string;
  quality?: number;
}

export interface ResizedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<ResizedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = options.width;
      canvas.height = options.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const dstW = options.width;
      const dstH = options.height;

      if (options.fitMode === "stretch") {
        ctx.drawImage(img, 0, 0, dstW, dstH);
      } else if (options.fitMode === "contain") {
        const scale = Math.min(dstW / srcW, dstH / srcH);
        const w = srcW * scale;
        const h = srcH * scale;
        const x = (dstW - w) / 2;
        const y = (dstH - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      } else if (options.fitMode === "cover") {
        const scale = Math.max(dstW / srcW, dstH / srcH);
        const w = srcW * scale;
        const h = srcH * scale;
        const x = (dstW - w) / 2;
        const y = (dstH - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      }

      const mimeType = options.format || file.type || "image/png";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to resize image"));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              blob,
              dataUrl: reader.result as string,
              width: options.width,
              height: options.height,
              sizeBytes: blob.size,
            });
          };
          reader.readAsDataURL(blob);
        },
        mimeType,
        options.quality || 0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for resizing"));
    };

    img.src = url;
  });
}
