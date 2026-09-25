export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  percentageReduction: number;
  width: number;
  height: number;
}

export interface CompressOptions {
  quality: number; // 0.1 to 1.0
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      const outputFormat = options.format || (file.type as any) || "image/jpeg";

      // If converting to JPEG, fill with white background so transparent pixels don't turn black
      if (outputFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const originalSize = file.size;
            const compressedSize = blob.size;
            const reduction = Math.round(
              ((originalSize - compressedSize) / originalSize) * 100
            );

            resolve({
              blob,
              dataUrl,
              originalSize,
              compressedSize,
              percentageReduction: reduction,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          };
          reader.readAsDataURL(blob);
        },
        outputFormat,
        options.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}
