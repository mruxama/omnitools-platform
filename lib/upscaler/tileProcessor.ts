import { TileRect } from './types';

/**
 * Decomposes an image of (width x height) into safe tiles for in-browser processing.
 * Caps the maximum number of tiles to prevent runaway loops on large images.
 */
export function generateTileGrid(
  width: number,
  height: number,
  tileSize: number = 256,
  overlap: number = 8
): TileRect[] {
  // If the image is smaller than tileSize, process as a single tile
  if (width <= tileSize && height <= tileSize) {
    return [
      {
        x: 0,
        y: 0,
        width,
        height,
        paddedX: 0,
        paddedY: 0,
        paddedWidth: width,
        paddedHeight: height,
      },
    ];
  }

  const effectiveTileSize = Math.max(128, tileSize);
  const step = Math.max(64, effectiveTileSize - overlap * 2);
  const tiles: TileRect[] = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const tileW = Math.min(step, width - x);
      const tileH = Math.min(step, height - y);

      // Padded bounds
      const padLeft = Math.min(overlap, x);
      const padTop = Math.min(overlap, y);
      const padRight = Math.min(overlap, width - (x + tileW));
      const padBottom = Math.min(overlap, height - (y + tileH));

      const paddedX = x - padLeft;
      const paddedY = y - padTop;
      const paddedWidth = tileW + padLeft + padRight;
      const paddedHeight = tileH + padTop + padBottom;

      tiles.push({
        x,
        y,
        width: tileW,
        height: tileH,
        paddedX,
        paddedY,
        paddedWidth,
        paddedHeight,
      });
    }
  }

  return tiles;
}

/**
 * Calculates cropped coordinates from upscaled tile corresponding to the unpadded original area
 */
export function calculateOutputCrop(
  tile: TileRect,
  scaleFactor: number
): { srcX: number; srcY: number; srcW: number; srcH: number; destX: number; destY: number; destW: number; destH: number } {
  const padLeft = tile.x - tile.paddedX;
  const padTop = tile.y - tile.paddedY;

  return {
    srcX: Math.round(padLeft * scaleFactor),
    srcY: Math.round(padTop * scaleFactor),
    srcW: Math.round(tile.width * scaleFactor),
    srcH: Math.round(tile.height * scaleFactor),
    destX: Math.round(tile.x * scaleFactor),
    destY: Math.round(tile.y * scaleFactor),
    destW: Math.round(tile.width * scaleFactor),
    destH: Math.round(tile.height * scaleFactor),
  };
}
