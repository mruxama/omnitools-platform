import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { createDocx } from "@/lib/converter/providers/browser/officeConverter";
import { createXlsxFromCsv } from "@/lib/converter/providers/browser/officeConverter";
import {
  createPdfFromText,
  textToRtf,
  rtfToText,
} from "@/lib/converter/providers/browser/documentConverter";
import { getAllFormats, getFormatById } from "@/lib/converter/formatRegistry";
import { getSupportedOutputs, isConversionSupported } from "@/lib/converter/compatibilityMatrix";

describe("Office & Document Generators", () => {
  it("should generate a valid DOCX zip archive containing word/document.xml", async () => {
    const textContent = "Hello from OmniTools\nThis is a second line of text.";
    const blob = await createDocx(textContent, "Test Doc");

    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(500);

    const buffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    expect(zip.file("word/document.xml")).not.toBeNull();
    const xml = await zip.file("word/document.xml")!.async("string");
    expect(xml).toContain("Hello from OmniTools");
    expect(xml).toContain("This is a second line of text.");
  });

  it("should generate a valid XLSX zip archive from CSV data", async () => {
    const csv = "Name,Age,Role\nAlice,30,Developer\nBob,25,Designer";
    const blob = await createXlsxFromCsv(csv);

    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(500);

    const buffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    expect(zip.file("xl/worksheets/sheet1.xml")).not.toBeNull();
    const sheetXml = await zip.file("xl/worksheets/sheet1.xml")!.async("string");
    expect(sheetXml).toContain("Alice");
    expect(sheetXml).toContain("Developer");
  });

  it("should generate a valid PDF blob from text using pdf-lib", async () => {
    const text = "OmniTools Universal Converter\nHigh Performance Engine.";
    const blob = await createPdfFromText(text, "Test Title");

    expect(blob).toBeDefined();
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(200);

    const buffer = await blob.arrayBuffer();
    const header = new Uint8Array(buffer.slice(0, 5));
    const headerStr = String.fromCharCode(...header);
    expect(headerStr).toBe("%PDF-");
  });

  it("should round-trip text to RTF and back to plain text", () => {
    const sample = "Line 1: Special Characters & Testing\nLine 2: Another paragraph";
    const rtf = textToRtf(sample);

    expect(rtf).toContain("{\\rtf1");
    expect(rtf).toContain("\\par");

    const decoded = rtfToText(rtf);
    expect(decoded).toContain("Line 1: Special Characters & Testing");
    expect(decoded).toContain("Line 2: Another paragraph");
  });
});

describe("All 7 Format Categories Coverage", () => {
  const categories = [
    {
      name: "Images",
      formats: ["png", "jpg", "webp", "avif", "bmp", "ico", "gif", "tiff", "heic", "psd"],
    },
    {
      name: "Audio",
      formats: ["wav", "mp3", "ogg", "aac", "m4a", "flac"],
    },
    {
      name: "Video",
      formats: ["mp4", "webm", "mov", "avi", "mkv"],
    },
    {
      name: "Documents",
      formats: ["pdf", "txt", "md", "html", "docx", "doc", "odt", "rtf"],
    },
    {
      name: "Spreadsheets & Data",
      formats: ["csv", "tsv", "json", "xlsx"],
    },
    {
      name: "Archives",
      formats: ["zip", "tar", "7z", "rar"],
    },
    {
      name: "Vector, Ebooks & Fonts",
      formats: ["svg", "epub", "mobi", "ttf", "woff2"],
    },
  ];

  for (const cat of categories) {
    it(`should include all registered formats for ${cat.name}`, () => {
      for (const formatId of cat.formats) {
        const f = getFormatById(formatId);
        expect(f, `Format ${formatId} should be in FORMAT_REGISTRY`).toBeDefined();
        expect(f?.id).toBe(formatId);
        expect(f?.extensions.length).toBeGreaterThan(0);
      }
    });
  }

  it("should support conversion paths across document and spreadsheet formats", () => {
    // DOCX conversions
    expect(isConversionSupported("docx", "txt")).toBe(true);
    expect(isConversionSupported("docx", "pdf")).toBe(true);
    expect(isConversionSupported("docx", "html")).toBe(true);

    // XLSX conversions
    expect(isConversionSupported("xlsx", "csv")).toBe(true);
    expect(isConversionSupported("xlsx", "json")).toBe(true);
    expect(isConversionSupported("csv", "xlsx")).toBe(true);

    // EPUB conversions
    expect(isConversionSupported("epub", "html")).toBe(true);
    expect(isConversionSupported("epub", "txt")).toBe(true);
    expect(isConversionSupported("epub", "pdf")).toBe(true);

    // PSD conversions
    expect(isConversionSupported("psd", "png")).toBe(true);
    expect(isConversionSupported("psd", "jpg")).toBe(true);
    expect(isConversionSupported("psd", "pdf")).toBe(true);
  });
});

describe("Category Registry & Dedicated Category Hubs", () => {
  it("should define all 7 categories with required metadata and formats", async () => {
    const { getAllCategories, getCategoryBySlug, getFormatsForCategory } = await import(
      "@/lib/converter/categoryRegistry"
    );
    const categories = getAllCategories();
    expect(categories.length).toBe(7);

    const expectedSlugs = ["image", "audio", "video", "document", "spreadsheet", "archive", "vector-fonts"];

    for (const slug of expectedSlugs) {
      const cat = getCategoryBySlug(slug);
      expect(cat, `Category ${slug} should exist`).toBeDefined();
      expect(cat?.name).toBeDefined();
      expect(cat?.formatIds.length).toBeGreaterThan(0);
      expect(cat?.defaultInput).toBeDefined();
      expect(cat?.defaultOutput).toBeDefined();
      expect(cat?.popularPairs.length).toBeGreaterThan(0);
      expect(cat?.features.length).toBeGreaterThan(0);

      const formats = getFormatsForCategory(cat!);
      expect(formats.length).toBe(cat!.formatIds.length);
    }
  });
});
