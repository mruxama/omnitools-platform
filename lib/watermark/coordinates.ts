import {
  WatermarkLayer,
  WatermarkAnchor,
  VideoTimingConfig,
} from "./types";

/**
 * Calculates watermark width and height in pixels for given target media dimensions.
 * Maintains aspect ratio for logos or locked dimensions.
 */
export function calculateWatermarkDimensions(
  layer: WatermarkLayer,
  mediaWidth: number,
  mediaHeight: number
): { width: number; height: number } {
  const sizeConfig = layer.size;
  let targetWidth = 100;
  let targetHeight = 100;

  // Compute original aspect ratio
  let originalRatio = 1.0;
  if (layer.type === "logo" && layer.originalWidth > 0 && layer.originalHeight > 0) {
    originalRatio = layer.originalWidth / layer.originalHeight;
  } else if (layer.type === "text") {
    // For text, estimate bounding box or use approx 3:1 default ratio before canvas measurement
    originalRatio = 3.2;
  }

  switch (sizeConfig.mode) {
    case "relative-width": {
      const pct = Math.max(1, Math.min(100, sizeConfig.percentage || 20));
      targetWidth = Math.round(mediaWidth * (pct / 100));
      targetHeight = Math.round(targetWidth / originalRatio);
      break;
    }
    case "relative-height": {
      const pct = Math.max(1, Math.min(100, sizeConfig.percentage || 20));
      targetHeight = Math.round(mediaHeight * (pct / 100));
      targetWidth = Math.round(targetHeight * originalRatio);
      break;
    }
    case "fixed-pixels": {
      targetWidth = Math.max(10, sizeConfig.fixedPx || 120);
      targetHeight = Math.round(targetWidth / originalRatio);
      break;
    }
    case "manual": {
      targetWidth = sizeConfig.manualWidth || Math.round(mediaWidth * 0.2);
      if (sizeConfig.lockAspectRatio) {
        targetHeight = Math.round(targetWidth / originalRatio);
      } else {
        targetHeight = sizeConfig.manualHeight || Math.round(targetWidth / originalRatio);
      }
      break;
    }
    default: {
      targetWidth = Math.round(mediaWidth * 0.2);
      targetHeight = Math.round(targetWidth / originalRatio);
    }
  }

  // Guard against 0 or negative values, clamp to bounds
  targetWidth = Math.max(10, Math.min(mediaWidth * 1.5, targetWidth));
  targetHeight = Math.max(10, Math.min(mediaHeight * 1.5, targetHeight));

  return { width: targetWidth, height: targetHeight };
}

/**
 * Calculates absolute media coordinates (x, y top-left) for a watermark layer.
 * Shared directly by real-time canvas preview and image/video exporters to prevent drift.
 */
export function calculateLayerMediaCoordinates(
  layer: WatermarkLayer,
  mediaWidth: number,
  mediaHeight: number
): {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rotation: number;
  opacity: number;
} {
  const { width, height } = calculateWatermarkDimensions(layer, mediaWidth, mediaHeight);

  const marginPercent = layer.position.marginPercent ?? 5; // default 5% margin
  const marginX = Math.round(mediaWidth * (marginPercent / 100));
  const marginY = Math.round(mediaHeight * (marginPercent / 100));

  const offsetX = Math.round(mediaWidth * ((layer.position.offsetXPercent ?? 0) / 100));
  const offsetY = Math.round(mediaHeight * ((layer.position.offsetYPercent ?? 0) / 100));

  let x = 0;
  let y = 0;

  switch (layer.position.anchor) {
    case "top-left":
      x = marginX + offsetX;
      y = marginY + offsetY;
      break;
    case "top-center":
      x = Math.round((mediaWidth - width) / 2) + offsetX;
      y = marginY + offsetY;
      break;
    case "top-right":
      x = mediaWidth - width - marginX + offsetX;
      y = marginY + offsetY;
      break;
    case "middle-left":
      x = marginX + offsetX;
      y = Math.round((mediaHeight - height) / 2) + offsetY;
      break;
    case "center":
      x = Math.round((mediaWidth - width) / 2) + offsetX;
      y = Math.round((mediaHeight - height) / 2) + offsetY;
      break;
    case "middle-right":
      x = mediaWidth - width - marginX + offsetX;
      y = Math.round((mediaHeight - height) / 2) + offsetY;
      break;
    case "bottom-left":
      x = marginX + offsetX;
      y = mediaHeight - height - marginY + offsetY;
      break;
    case "bottom-center":
      x = Math.round((mediaWidth - width) / 2) + offsetX;
      y = mediaHeight - height - marginY + offsetY;
      break;
    case "bottom-right":
      x = mediaWidth - width - marginX + offsetX;
      y = mediaHeight - height - marginY + offsetY;
      break;
    case "custom": {
      // Use normalized center coordinates
      const normCenterX = layer.position.x ?? 0.5;
      const normCenterY = layer.position.y ?? 0.5;
      const calculatedCenterX = normCenterX * mediaWidth + offsetX;
      const calculatedCenterY = normCenterY * mediaHeight + offsetY;
      x = Math.round(calculatedCenterX - width / 2);
      y = Math.round(calculatedCenterY - height / 2);
      break;
    }
  }

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const opacity = Math.max(0, Math.min(1, (layer.opacity ?? 60) / 100));

  return {
    x,
    y,
    width,
    height,
    centerX,
    centerY,
    rotation: layer.rotation || 0,
    opacity,
  };
}

/**
 * Calculates rotated bounding box size to account for margins and boundary constraints.
 */
export function calculateRotatedBoundingBox(
  width: number,
  height: number,
  rotationDegrees: number
): { boundingWidth: number; boundingHeight: number } {
  const rad = (Math.abs(rotationDegrees) * Math.PI) / 180;
  const boundingWidth = Math.round(width * Math.cos(rad) + height * Math.sin(rad));
  const boundingHeight = Math.round(width * Math.sin(rad) + height * Math.cos(rad));
  return { boundingWidth, boundingHeight };
}

/**
 * Computes opacity with video timing interval & fade-in/fade-out interpolation.
 */
export function calculateWatermarkAlpha(
  layerOpacityPercent: number,
  currentTime?: number,
  timing?: VideoTimingConfig
): number {
  const baseAlpha = Math.max(0, Math.min(1, layerOpacityPercent / 100));

  if (!timing || !timing.enabled || currentTime === undefined) {
    return baseAlpha;
  }

  const { startTime, endTime, fadeIn, fadeOut } = timing;

  if (currentTime < startTime || currentTime > endTime) {
    return 0.0;
  }

  let factor = 1.0;

  // Fade In
  if (fadeIn > 0 && currentTime < startTime + fadeIn) {
    factor = (currentTime - startTime) / fadeIn;
  }
  // Fade Out
  else if (fadeOut > 0 && currentTime > endTime - fadeOut) {
    factor = (endTime - currentTime) / fadeOut;
  }

  return Math.max(0, Math.min(baseAlpha, baseAlpha * factor));
}
