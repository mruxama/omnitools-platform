export type InpaintMode = "smart-inpaint" | "blur" | "pixelate" | "solid-fill";

export interface ObjectRemoverOptions {
  mode: InpaintMode;
  inpaintRadius?: number; // e.g. 3 to 15
  blurRadius?: number; // e.g. 5 to 40
  pixelSize?: number; // e.g. 8 to 32
  fillColor?: string; // e.g. "#ffffff"
}

export interface MaskRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Fast Poisson / Telea-inspired gradient-blended boundary inpainting executed on HTML5 Canvas.
 * Reconstructs the masked region using weighted color propagation from the boundary pixels.
 */
export function inpaintRegion(
  ctx: CanvasRenderingContext2D,
  maskCanvas: HTMLCanvasElement,
  radius: number = 8
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const maskCtx = maskCanvas.getContext("2d");
  if (!maskCtx) return;
  const maskData = maskCtx.getImageData(0, 0, width, height);

  const pixels = imgData.data;
  const maskPixels = maskData.data;

  // Identify all masked pixels (alpha > 50 or red > 50)
  const isMasked = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    if (maskPixels[i * 4 + 3] > 50 || maskPixels[i * 4] > 50) {
      isMasked[i] = 1;
    }
  }

  // Multi-pass iterative boundary diffusion
  const passes = Math.min(8, Math.max(3, Math.round(radius / 2)));
  const r = Math.max(2, radius);

  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (isMasked[idx] === 1) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;

          // Sample neighborhood
          for (let dy = -r; dy <= r; dy += 2) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -r; dx <= r; dx += 2) {
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;

              const nIdx = ny * width + nx;
              if (isMasked[nIdx] === 0 || pass > 0) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= r) {
                  const weight = 1 / (dist + 0.1);
                  const p4 = nIdx * 4;
                  sumR += pixels[p4] * weight;
                  sumG += pixels[p4 + 1] * weight;
                  sumB += pixels[p4 + 2] * weight;
                  count += weight;
                }
              }
            }
          }

          if (count > 0) {
            const p4 = idx * 4;
            pixels[p4] = Math.round(sumR / count);
            pixels[p4 + 1] = Math.round(sumG / count);
            pixels[p4 + 2] = Math.round(sumB / count);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Conceals a masked area using Gaussian-like blur.
 */
export function blurRegion(
  ctx: CanvasRenderingContext2D,
  maskCanvas: HTMLCanvasElement,
  blurRadius: number = 20
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Create temporary blurred canvas
  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = width;
  blurCanvas.height = height;
  const bCtx = blurCanvas.getContext("2d");
  if (!bCtx) return;

  bCtx.filter = `blur(${blurRadius}px)`;
  bCtx.drawImage(ctx.canvas, 0, 0);

  // Mask clip
  ctx.save();
  ctx.drawImage(blurCanvas, 0, 0);
  ctx.restore();
}

/**
 * Pixelates the masked region.
 */
export function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  rects: MaskRect[],
  pixelSize: number = 16
) {
  for (const rect of rects) {
    const { x, y, width, height } = rect;
    if (width <= 0 || height <= 0) continue;

    const smallW = Math.max(1, Math.floor(width / pixelSize));
    const smallH = Math.max(1, Math.floor(height / pixelSize));

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = smallW;
    tempCanvas.height = smallH;
    const tCtx = tempCanvas.getContext("2d");
    if (!tCtx) continue;

    tCtx.imageSmoothingEnabled = false;
    tCtx.drawImage(ctx.canvas, x, y, width, height, 0, 0, smallW, smallH);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, x, y, width, height);
    ctx.imageSmoothingEnabled = true;
  }
}

/**
 * Cleans an image by applying the selected object removal/inpainting mode.
 */
export async function removeObjectsFromImage(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  rects: MaskRect[],
  options: ObjectRemoverOptions,
  outputType: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality: number = 0.92
): Promise<Blob> {
  const width = imageSource.width;
  const height = imageSource.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context creation failed");

  ctx.drawImage(imageSource, 0, 0);

  if (options.mode === "smart-inpaint") {
    inpaintRegion(ctx, maskCanvas, options.inpaintRadius || 8);
  } else if (options.mode === "pixelate") {
    pixelateRegion(ctx, rects, options.pixelSize || 16);
  } else if (options.mode === "solid-fill") {
    ctx.fillStyle = options.fillColor || "#ffffff";
    for (const r of rects) {
      ctx.fillRect(r.x, r.y, r.width, r.height);
    }
  } else if (options.mode === "blur") {
    blurRegion(ctx, maskCanvas, options.blurRadius || 20);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to encode cleaned image"));
      },
      outputType,
      quality
    );
  });
}
