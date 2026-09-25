export interface TransformOptions {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotationDegrees: number; // e.g. 0, 90, 180, 270 or arbitrary
  flipHorizontal: boolean;
  flipVertical: boolean;
  format?: string;
  quality?: number;
}

export async function transformImage(
  file: File,
  options: TransformOptions
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;

      // First canvas for rotation & flipping
      const rotRad = (options.rotationDegrees * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(rotRad));
      const absSin = Math.abs(Math.sin(rotRad));

      const rotW = Math.round(srcW * absCos + srcH * absSin);
      const rotH = Math.round(srcW * absSin + srcH * absCos);

      const canvas1 = document.createElement("canvas");
      canvas1.width = rotW;
      canvas1.height = rotH;
      const ctx1 = canvas1.getContext("2d");

      if (!ctx1) {
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      ctx1.translate(rotW / 2, rotH / 2);
      ctx1.rotate(rotRad);
      ctx1.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
      ctx1.drawImage(img, -srcW / 2, -srcH / 2);

      // Second canvas for crop if specified
      let finalCanvas = canvas1;

      if (options.crop && options.crop.width > 0 && options.crop.height > 0) {
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = options.crop.width;
        cropCanvas.height = options.crop.height;
        const cropCtx = cropCanvas.getContext("2d");

        if (!cropCtx) {
          reject(new Error("Unable to create crop canvas context"));
          return;
        }

        cropCtx.drawImage(
          canvas1,
          options.crop.x,
          options.crop.y,
          options.crop.width,
          options.crop.height,
          0,
          0,
          options.crop.width,
          options.crop.height
        );
        finalCanvas = cropCanvas;
      }

      const mimeType = options.format || file.type || "image/png";
      finalCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image transformation failed"));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              blob,
              dataUrl: reader.result as string,
              width: finalCanvas.width,
              height: finalCanvas.height,
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
      reject(new Error("Failed to load image for transformation"));
    };

    img.src = url;
  });
}
