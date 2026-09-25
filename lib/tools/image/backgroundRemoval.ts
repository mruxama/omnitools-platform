export interface BackgroundRemovalOptions {
  tolerance: number; // 5 to 100
  feather: number; // 0 to 10
  targetColor?: { r: number; g: number; b: number }; // sampled color
}

export async function removeImageBackground(
  file: File,
  options: BackgroundRemovalOptions
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample corners if targetColor not explicitly provided
      let bgR = 255;
      let bgG = 255;
      let bgB = 255;

      if (options.targetColor) {
        bgR = options.targetColor.r;
        bgG = options.targetColor.g;
        bgB = options.targetColor.b;
      } else {
        // Sample top-left corner
        bgR = data[0];
        bgG = data[1];
        bgB = data[2];
      }

      const tol = options.tolerance || 25;
      const tolSq = tol * tol;

      // Color distance Euclidean thresholding
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space
        const distSq =
          (r - bgR) * (r - bgR) +
          (g - bgG) * (g - bgG) +
          (b - bgB) * (b - bgB);

        if (distSq < tolSq) {
          // Inside tolerance: transparent
          data[i + 3] = 0;
        } else if (distSq < tolSq * 1.5 && options.feather > 0) {
          // Feathering transition edge
          const factor = (distSq - tolSq) / (tolSq * 0.5);
          data[i + 3] = Math.round(factor * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to export transparent PNG"));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            blob,
            dataUrl: reader.result as string,
            width: w,
            height: h,
            sizeBytes: blob.size,
          });
        };
        reader.readAsDataURL(blob);
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for background removal"));
    };

    img.src = url;
  });
}
