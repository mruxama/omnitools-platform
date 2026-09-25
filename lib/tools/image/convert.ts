export interface ConvertImageOptions {
  targetFormat: "image/jpeg" | "image/png" | "image/webp";
  quality: number;
  backgroundColor?: string;
}

export async function convertImageFormat(
  file: File,
  options: ConvertImageOptions
): Promise<{ blob: Blob; dataUrl: string; sizeBytes: number }> {
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
        reject(new Error("Canvas context initialization failed"));
        return;
      }

      // If converting to JPEG, render background color to prevent black transparency
      if (options.targetFormat === "image/jpeg") {
        ctx.fillStyle = options.backgroundColor || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Format conversion failed"));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              blob,
              dataUrl: reader.result as string,
              sizeBytes: blob.size,
            });
          };
          reader.readAsDataURL(blob);
        },
        options.targetFormat,
        options.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for conversion"));
    };

    img.src = url;
  });
}
