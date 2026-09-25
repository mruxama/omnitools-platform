import { describe, it, expect } from "vitest";
import { FORMAT_REGISTRY, getAllFormats, getFormatById, getFormatByExtension } from "@/lib/converter/formatRegistry";
import { getSupportedOutputs, isConversionSupported } from "@/lib/converter/compatibilityMatrix";
import { detectFileFormat } from "@/lib/converter/detector";

describe("Converter Format Registry", () => {
  it("should contain definitions with required fields", () => {
    const formats = getAllFormats();
    expect(formats.length).toBeGreaterThan(20);

    for (const f of formats) {
      expect(f.id).toBeDefined();
      expect(f.displayName).toBeDefined();
      expect(f.category).toBeDefined();
      expect(f.extensions.length).toBeGreaterThan(0);
      expect(f.mimeTypes.length).toBeGreaterThan(0);
      expect(f.seoSlug).toBeDefined();
      expect(f.status).toMatch(/AVAILABLE|BETA|COMING_SOON/);
    }
  });

  it("should find format by ID or extension correctly", () => {
    expect(getFormatById("png")?.displayName).toBe("PNG Image");
    expect(getFormatById("PDF")?.category).toBe("document");
    expect(getFormatByExtension("jpeg")?.id).toBe("jpg");
    expect(getFormatByExtension(".wav")?.category).toBe("audio");
    expect(getFormatByExtension("unknown_ext")).toBeUndefined();
  });
});

describe("Converter Compatibility Matrix", () => {
  it("should return valid target formats for JPG", () => {
    const outputs = getSupportedOutputs("jpg");
    const outputIds = outputs.map((f) => f.id);

    expect(outputIds).toContain("webp");
    expect(outputIds).toContain("png");
    expect(outputIds).toContain("pdf");
    expect(outputIds).not.toContain("mp3");
    expect(outputIds).not.toContain("wav");
    expect(outputIds).not.toContain("jpg"); // cannot convert to self
  });

  it("should return valid target formats for WAV audio", () => {
    const outputs = getSupportedOutputs("wav");
    const outputIds = outputs.map((f) => f.id);

    expect(outputIds).toContain("mp3");
    expect(outputIds).not.toContain("jpg");
    expect(outputIds).not.toContain("docx");
  });

  it("should validate supported and unsupported conversion pairs", () => {
    expect(isConversionSupported("jpg", "webp")).toBe(true);
    expect(isConversionSupported("png", "jpg")).toBe(true);
    expect(isConversionSupported("png", "pdf")).toBe(true);
    expect(isConversionSupported("csv", "json")).toBe(true);
    expect(isConversionSupported("png", "mp3")).toBe(false);
    expect(isConversionSupported("wav", "jpg")).toBe(false);
  });
});

describe("Smart File Format Detector", () => {
  it("should detect PNG via magic bytes", async () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([pngHeader], "unnamed_file", { type: "" });
    const res = await detectFileFormat(file);

    expect(res.format.id).toBe("png");
    expect(res.confidence).toBe("high");
    expect(res.method).toBe("magic_bytes");
  });

  it("should detect JPEG via magic bytes", async () => {
    const jpgHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const file = new File([jpgHeader], "image_without_extension");
    const res = await detectFileFormat(file);

    expect(res.format.id).toBe("jpg");
    expect(res.confidence).toBe("high");
    expect(res.method).toBe("magic_bytes");
  });

  it("should detect PDF via magic bytes", async () => {
    const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    const file = new File([pdfHeader], "doc.dat");
    const res = await detectFileFormat(file);

    expect(res.format.id).toBe("pdf");
    expect(res.confidence).toBe("high");
  });

  it("should detect format by extension fallback", async () => {
    const file = new File(["dummy text content"], "notes.md");
    const res = await detectFileFormat(file);

    expect(res.format.id).toBe("md");
    expect(res.method).toBe("extension");
  });
});
