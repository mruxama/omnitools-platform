import { describe, it, expect } from 'vitest';
import { generateTileGrid, calculateOutputCrop } from '@/lib/upscaler/tileProcessor';
import { MODEL_REGISTRY, getModelById, DEFAULT_MODEL_ID } from '@/lib/upscaler/modelRegistry';

describe('AI Image Upscaler Tile Processor', () => {
  it('generates correct tile grid covering full image dimensions with overlap', () => {
    // 500x300 image, 128 tile size, 16 overlap
    const tiles = generateTileGrid(500, 300, 128, 16);
    expect(tiles.length).toBeGreaterThan(0);

    // Verify all unpadded tiles cover from 0 to 500 and 0 to 300
    const minX = Math.min(...tiles.map((t) => t.x));
    const minY = Math.min(...tiles.map((t) => t.y));
    const maxX = Math.max(...tiles.map((t) => t.x + t.width));
    const maxY = Math.max(...tiles.map((t) => t.y + t.height));

    expect(minX).toBe(0);
    expect(minY).toBe(0);
    expect(maxX).toBe(500);
    expect(maxY).toBe(300);
  });

  it('calculates accurate unpadded output crop dimensions', () => {
    const tile = {
      x: 32,
      y: 32,
      width: 64,
      height: 64,
      paddedX: 16,
      paddedY: 16,
      paddedWidth: 96,
      paddedHeight: 96,
    };

    const crop = calculateOutputCrop(tile, 4);
    // padLeft = 32 - 16 = 16. srcX = 16 * 4 = 64
    expect(crop.srcX).toBe(64);
    expect(crop.srcY).toBe(64);
    expect(crop.srcW).toBe(256);
    expect(crop.srcH).toBe(256);
    expect(crop.destX).toBe(128);
    expect(crop.destY).toBe(128);
  });

  it('has verified models in model registry with valid metadata', () => {
    const defaultModel = getModelById(DEFAULT_MODEL_ID);
    expect(defaultModel).toBeDefined();
    expect(defaultModel.nativeScale).toBe(4);
    expect(defaultModel.url).toContain('.onnx');
    expect(defaultModel.fileSizeMB).toBeGreaterThan(0);
    expect(MODEL_REGISTRY['realesrgan-x4-fast']).toBeDefined();
    expect(MODEL_REGISTRY['swin2sr-light-x2']).toBeDefined();
  });
});
