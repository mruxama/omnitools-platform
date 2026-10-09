import {
  WatermarkLayer,
  TextWatermarkLayer,
  LogoWatermarkLayer,
  ExportOptions,
} from "./types";
import {
  calculateLayerMediaCoordinates,
  calculateWatermarkDimensions,
} from "./coordinates";

/**
 * Loads an image from a URL or Blob into an HTMLImageElement safely.
 */
export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image asset"));
    img.src = src;
  });
}

/**
 * Draws rounded rectangle path on canvas.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Renders a single watermark layer onto the given canvas context.
 */
export async function renderWatermarkLayer(
  ctx: CanvasRenderingContext2D,
  layer: WatermarkLayer,
  canvasWidth: number,
  canvasHeight: number,
  loadedLogosCache: Map<string, HTMLImageElement>
): Promise<void> {
  if (!layer.visible) return;

  const coords = calculateLayerMediaCoordinates(layer, canvasWidth, canvasHeight);
  const layerOpacity = coords.opacity;
  if (layerOpacity <= 0) return;

  ctx.save();

  // If layer is tiled repeating pattern
  if (layer.tiled) {
    ctx.globalAlpha = layerOpacity;
    const spacing = Math.max(80, layer.tileSpacing || 140);
    const rad = ((layer.rotation || -30) * Math.PI) / 180;

    // Grid covering canvas with margin
    for (let py = -canvasHeight; py < canvasHeight * 2; py += spacing) {
      for (let px = -canvasWidth; px < canvasWidth * 2; px += spacing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rad);

        if (layer.type === "text") {
          ctx.font = `${layer.fontWeight} ${Math.max(14, Math.round(canvasWidth * 0.025))}px ${layer.fontFamily}`;
          ctx.fillStyle = layer.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(layer.text, 0, 0);
        } else if (layer.type === "logo" && layer.assetUrl) {
          let logoImg = loadedLogosCache.get(layer.assetUrl);
          if (!logoImg) {
            try {
              logoImg = await loadImageElement(layer.assetUrl);
              loadedLogosCache.set(layer.assetUrl, logoImg);
            } catch {
              // skip if logo cannot be loaded
            }
          }
          if (logoImg) {
            const logoW = Math.max(30, Math.round(canvasWidth * 0.08));
            const logoH = Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth));
            ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
          }
        }
        ctx.restore();
      }
    }

    ctx.restore();
    return;
  }

  // Position and transform for standard (single) placement
  ctx.translate(coords.centerX, coords.centerY);
  if (coords.rotation !== 0) {
    ctx.rotate((coords.rotation * Math.PI) / 180);
  }
  ctx.globalAlpha = layerOpacity;

  const halfW = coords.width / 2;
  const halfH = coords.height / 2;

  if (layer.type === "text") {
    const textLayer = layer as TextWatermarkLayer;
    const lines = textLayer.text.split("\n");

    // Dynamic font size proportional to calculated dimensions
    const computedFontSize = Math.max(12, Math.round(coords.height * 0.45));
    ctx.font = `${textLayer.fontWeight} ${computedFontSize}px ${textLayer.fontFamily}`;

    // Measure text bounds
    let maxLineWidth = 0;
    lines.forEach((line) => {
      const metrics = ctx.measureText(line);
      if (metrics.width > maxLineWidth) maxLineWidth = metrics.width;
    });

    const lineHeightPx = computedFontSize * (textLayer.lineHeight || 1.2);
    const totalTextHeight = lines.length * lineHeightPx;
    const boxW = maxLineWidth + (textLayer.background.padding || 8) * 2;
    const boxH = totalTextHeight + (textLayer.background.padding || 8) * 2;

    // Optional background badge box
    if (textLayer.background.enabled) {
      ctx.save();
      ctx.fillStyle = textLayer.background.color;
      ctx.globalAlpha = layerOpacity * ((textLayer.background.opacity || 50) / 100);
      drawRoundedRect(
        ctx,
        -boxW / 2,
        -boxH / 2,
        boxW,
        boxH,
        textLayer.background.borderRadius || 6
      );
      ctx.fill();
      ctx.restore();
    }

    // Shadow
    if (textLayer.shadow.enabled) {
      ctx.shadowColor = textLayer.shadow.color;
      ctx.shadowBlur = textLayer.shadow.blur;
      ctx.shadowOffsetX = textLayer.shadow.offsetX;
      ctx.shadowOffsetY = textLayer.shadow.offsetY;
    }

    ctx.textAlign = textLayer.textAlign || "center";
    ctx.textBaseline = "middle";

    const startY = -((lines.length - 1) * lineHeightPx) / 2;

    lines.forEach((line, idx) => {
      const lineY = startY + idx * lineHeightPx;

      // Stroke outline
      if (textLayer.stroke.enabled) {
        ctx.strokeStyle = textLayer.stroke.color;
        ctx.lineWidth = textLayer.stroke.width;
        ctx.strokeText(line, 0, lineY);
      }

      // Text fill
      ctx.fillStyle = textLayer.color;
      ctx.fillText(line, 0, lineY);
    });
  } else if (layer.type === "logo") {
    const logoLayer = layer as LogoWatermarkLayer;
    if (logoLayer.assetUrl) {
      let logoImg = loadedLogosCache.get(logoLayer.assetUrl);
      if (!logoImg) {
        try {
          logoImg = await loadImageElement(logoLayer.assetUrl);
          loadedLogosCache.set(logoLayer.assetUrl, logoImg);
        } catch (err) {
          console.error("Failed to load logo watermark", err);
        }
      }

      if (logoImg) {
        ctx.drawImage(logoImg, -halfW, -halfH, coords.width, coords.height);
      }
    }
  }

  ctx.restore();
}

/**
 * Processes an image file with all watermark layers applied.
 */
export async function processImageWithWatermarks(
  file: File,
  layers: WatermarkLayer[],
  exportOptions: ExportOptions
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      // Determine output mime type
      let outputMime = file.type || "image/jpeg";
      if (exportOptions.imageFormat !== "original") {
        outputMime = exportOptions.imageFormat;
      }

      // If output is JPEG, paint white background for transparent areas
      if (outputMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render all visible watermark layers
      const logoCache = new Map<string, HTMLImageElement>();
      for (const layer of layers) {
        await renderWatermarkLayer(ctx, layer, canvas.width, canvas.height, logoCache);
      }

      const quality = Math.max(0.1, Math.min(1.0, exportOptions.imageQuality || 0.85));

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to encode watermarked image"));
            return;
          }
          resolve({ blob, width: canvas.width, height: canvas.height });
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file"));
    };

    img.src = url;
  });
}
