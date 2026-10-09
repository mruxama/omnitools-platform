import { describe, it, expect } from "vitest";
import {
  calculateWatermarkDimensions,
  calculateLayerMediaCoordinates,
  calculateRotatedBoundingBox,
  calculateWatermarkAlpha,
} from "@/lib/watermark/coordinates";
import {
  TextWatermarkLayer,
  LogoWatermarkLayer,
  WatermarkAnchor,
  VideoTimingConfig,
} from "@/lib/watermark/types";
import { DEFAULT_TEXT_LAYER } from "@/lib/watermark/presets";

describe("Watermark Coordinate & Dimensions Engine", () => {
  const sampleTextLayer: TextWatermarkLayer = {
    ...DEFAULT_TEXT_LAYER,
    size: {
      mode: "relative-width",
      percentage: 20,
      fixedPx: 120,
      lockAspectRatio: true,
    },
    position: {
      anchor: "bottom-right",
      x: 0.85,
      y: 0.85,
      offsetXPercent: 0,
      offsetYPercent: 0,
      marginPercent: 5,
    },
    opacity: 60,
  };

  const sampleLogoLayer: LogoWatermarkLayer = {
    id: "logo-1",
    name: "Brand Logo",
    type: "logo",
    assetUrl: "blob:mock",
    assetName: "logo.png",
    originalWidth: 400,
    originalHeight: 200, // 2:1 aspect ratio
    preserveAlpha: true,
    opacity: 80,
    rotation: 0,
    visible: true,
    locked: false,
    tiled: false,
    tileSpacing: 100,
    position: {
      anchor: "top-left",
      x: 0.1,
      y: 0.1,
      offsetXPercent: 0,
      offsetYPercent: 0,
      marginPercent: 5,
    },
    size: {
      mode: "relative-width",
      percentage: 20,
      fixedPx: 100,
      lockAspectRatio: true,
    },
  };

  it("calculates logo dimensions with preserved aspect ratio", () => {
    // 1920x1080 media, 20% width = 384px. Original logo ratio is 2:1 -> height should be 192px
    const dims = calculateWatermarkDimensions(sampleLogoLayer, 1920, 1080);
    expect(dims.width).toBe(384);
    expect(dims.height).toBe(192);
  });

  it("dynamically adapts when changing size from 10% to 40%", () => {
    const layer10: LogoWatermarkLayer = {
      ...sampleLogoLayer,
      size: { ...sampleLogoLayer.size, percentage: 10 },
    };
    const layer40: LogoWatermarkLayer = {
      ...sampleLogoLayer,
      size: { ...sampleLogoLayer.size, percentage: 40 },
    };

    const dims10 = calculateWatermarkDimensions(layer10, 1000, 1000);
    const dims40 = calculateWatermarkDimensions(layer40, 1000, 1000);

    expect(dims10.width).toBe(100);
    expect(dims40.width).toBe(400);
    expect(dims40.width).toBe(dims10.width * 4);
  });

  it("calculates all 9 anchor positions accurately without clipping", () => {
    const anchors: WatermarkAnchor[] = [
      "top-left",
      "top-center",
      "top-right",
      "middle-left",
      "center",
      "middle-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ];

    const mediaWidth = 1000;
    const mediaHeight = 1000;

    anchors.forEach((anchor) => {
      const layer: TextWatermarkLayer = {
        ...sampleTextLayer,
        position: { ...sampleTextLayer.position, anchor, marginPercent: 5 },
      };

      const coords = calculateLayerMediaCoordinates(layer, mediaWidth, mediaHeight);

      // Verify layer stays within media dimensions
      expect(coords.x).toBeGreaterThanOrEqual(0);
      expect(coords.y).toBeGreaterThanOrEqual(0);
      expect(coords.x + coords.width).toBeLessThanOrEqual(mediaWidth);
      expect(coords.y + coords.height).toBeLessThanOrEqual(mediaHeight);
    });
  });

  it("consistently computes placement across multiple aspect ratios (1:1, 4:5, 16:9, 9:16, 3:2, 2:3)", () => {
    const aspectRatios = [
      { name: "1:1 Square", width: 1080, height: 1080 },
      { name: "4:5 Instagram Portrait", width: 1080, height: 1350 },
      { name: "16:9 Landscape Video", width: 1920, height: 1080 },
      { name: "9:16 Vertical Reel", width: 1080, height: 1920 },
      { name: "3:2 Standard Photo", width: 1500, height: 1000 },
      { name: "2:3 Portrait Photo", width: 1000, height: 1500 },
    ];

    aspectRatios.forEach(({ width, height }) => {
      const coords = calculateLayerMediaCoordinates(sampleTextLayer, width, height);
      expect(coords.width).toBeGreaterThan(0);
      expect(coords.height).toBeGreaterThan(0);
      expect(coords.centerX).toBeGreaterThan(0);
      expect(coords.centerY).toBeGreaterThan(0);
      expect(coords.opacity).toBeCloseTo(0.6, 2);
    });
  });

  it("handles opacity changes from 0% to 100%", () => {
    const layer0 = { ...sampleTextLayer, opacity: 0 };
    const layer50 = { ...sampleTextLayer, opacity: 50 };
    const layer100 = { ...sampleTextLayer, opacity: 100 };

    expect(calculateLayerMediaCoordinates(layer0, 1000, 1000).opacity).toBe(0.0);
    expect(calculateLayerMediaCoordinates(layer50, 1000, 1000).opacity).toBe(0.5);
    expect(calculateLayerMediaCoordinates(layer100, 1000, 1000).opacity).toBe(1.0);
  });

  it("computes rotated bounding box geometry correctly", () => {
    // 0 degrees rotation: bounding box equals dimensions
    const box0 = calculateRotatedBoundingBox(100, 50, 0);
    expect(box0.boundingWidth).toBe(100);
    expect(box0.boundingHeight).toBe(50);

    // 90 degrees rotation: width and height swap
    const box90 = calculateRotatedBoundingBox(100, 50, 90);
    expect(box90.boundingWidth).toBe(50);
    expect(box90.boundingHeight).toBe(100);
  });

  it("computes video timing intervals and fade transitions", () => {
    const timing: VideoTimingConfig = {
      enabled: true,
      startTime: 2,
      endTime: 8,
      fadeIn: 1, // from 2 to 3 seconds
      fadeOut: 1, // from 7 to 8 seconds
    };

    // Before start time: alpha is 0
    expect(calculateWatermarkAlpha(100, 1.0, timing)).toBe(0);

    // Midpoint: full alpha (1.0)
    expect(calculateWatermarkAlpha(100, 5.0, timing)).toBe(1.0);

    // Fade-in at 2.5s: 50% of fade
    expect(calculateWatermarkAlpha(100, 2.5, timing)).toBeCloseTo(0.5, 2);

    // Fade-out at 7.5s: 50% of fade
    expect(calculateWatermarkAlpha(100, 7.5, timing)).toBeCloseTo(0.5, 2);

    // After end time: alpha is 0
    expect(calculateWatermarkAlpha(100, 9.0, timing)).toBe(0);
  });
});
