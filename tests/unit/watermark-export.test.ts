import { describe, it, expect } from "vitest";

describe("Watermark Export Filename & Formatting", () => {
  function generateOutputFilename(
    originalName: string,
    mimeType: string,
    prefix = "",
    suffix = "_watermarked"
  ): string {
    const dotIdx = originalName.lastIndexOf(".");
    const base = dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName;
    const origExt = dotIdx !== -1 ? originalName.substring(dotIdx + 1) : "";

    let ext = origExt;
    if (mimeType === "image/jpeg") ext = "jpg";
    else if (mimeType === "image/png") ext = "png";
    else if (mimeType === "image/webp") ext = "webp";
    else if (mimeType === "video/mp4") ext = "mp4";
    else if (mimeType === "video/webm") ext = "webm";

    return `${prefix}${base}${suffix}.${ext}`;
  }

  it("appends default '_watermarked' suffix correctly", () => {
    const filename = generateOutputFilename("product-shot.jpg", "image/jpeg");
    expect(filename).toBe("product-shot_watermarked.jpg");
  });

  it("applies custom prefix and suffix to exported media", () => {
    const filename = generateOutputFilename(
      "camera_raw.png",
      "image/png",
      "BRAND_",
      "_FINAL"
    );
    expect(filename).toBe("BRAND_camera_raw_FINAL.png");
  });

  it("updates file extension when converting image format to WebP", () => {
    const filename = generateOutputFilename("banner.jpg", "image/webp");
    expect(filename).toBe("banner_watermarked.webp");
  });

  it("handles video filenames with MP4 and WebM correctly", () => {
    const mp4Name = generateOutputFilename("reel.mov", "video/mp4");
    expect(mp4Name).toBe("reel_watermarked.mp4");

    const webmName = generateOutputFilename("clip.mp4", "video/webm");
    expect(webmName).toBe("clip_watermarked.webm");
  });
});
