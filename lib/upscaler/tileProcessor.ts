import { TileRect } from './types';

/**
 * Decomposes an image of (width x height) into conservative tiles with
 * overlap padding to avoid boundary seam artifacts during AI super-resolution.
 */
export function generateTileGrid(
  width: number,
  height: number,
  tileSize: number,
  overlap: number = 16
): TileRect[] {
  const tiles: TileRect[] = [];
  const step = Math.max(32, tileSize - overlap * 2);

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
