import { describe, it, expect } from "vitest";
import { BUILT_IN_PRESETS, DEFAULT_TEXT_LAYER } from "@/lib/watermark/presets";

describe("Watermark Presets Suite", () => {
  it("contains all essential built-in presets", () => {
    const ids = BUILT_IN_PRESETS.map((p) => p.id);
    expect(ids).toContain("preset-social-media");
    expect(ids).toContain("preset-product-photo");
    expect(ids).toContain("preset-center-shield");
    expect(ids).toContain("preset-diagonal-repeating");
    expect(ids).toContain("preset-youtube-video");
  });

  it("verifies every preset has valid layers, timing, and export options", () => {
    BUILT_IN_PRESETS.forEach((preset) => {
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.layers.length).toBeGreaterThan(0);

      preset.layers.forEach((layer) => {
        expect(layer.id).toBeTruthy();
        expect(layer.opacity).toBeGreaterThanOrEqual(0);
        expect(layer.opacity).toBeLessThanOrEqual(100);
        expect(layer.position.anchor).toBeDefined();
        expect(layer.size.percentage).toBeGreaterThan(0);
      });

      expect(preset.videoTiming).toBeDefined();
      expect(preset.exportOptions).toBeDefined();
    });
  });

  it("validates diagonal repeating pattern preset configuration", () => {
    const diagonal = BUILT_IN_PRESETS.find((p) => p.id === "preset-diagonal-repeating");
    expect(diagonal).toBeDefined();
    expect(diagonal?.layers[0].tiled).toBe(true);
    expect(diagonal?.layers[0].rotation).toBe(-30);
  });
});
