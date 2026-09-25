import { FormatDefinition } from "./types";
import { getAllFormats, getFormatById } from "./formatRegistry";

/**
 * Returns an array of valid target FormatDefinitions for a given input format ID.
 * Reads directly from the format catalog and rules matrix.
 */
export function getSupportedOutputs(inputFormatId: string): FormatDefinition[] {
  const input = getFormatById(inputFormatId);
  if (!input) return [];

  const allFormats = getAllFormats();

  return allFormats.filter((target) => {
    // Cannot convert to itself
    if (target.id === input.id) return false;

    // Target must be capable of being an output format
    if (!target.canOutput) return false;

    // Data & Spreadsheet cross-conversion (CSV, TSV, JSON, XLSX)
    const isDataInput = input.category === "spreadsheet" || input.category === "data";
    const isDataTarget = target.category === "spreadsheet" || target.category === "data";
    if (isDataInput && isDataTarget) {
      return ["csv", "tsv", "json", "xlsx"].includes(target.id);
    }

    // Rule 1: Same category conversion (e.g. image -> image, audio -> audio)
    if (input.category === target.category) {
      // Audio to Audio (WAV, MP3, OGG)
      if (input.category === "audio") {
        return ["wav", "mp3", "ogg"].includes(target.id);
      }
      // Image to Image (JPG, PNG, WEBP, AVIF, BMP, ICO)
      if (input.category === "image") {
        return ["jpg", "png", "webp", "avif", "bmp", "ico"].includes(target.id);
      }
      // Document to Document (PDF, DOCX, TXT, MD, HTML, RTF)
      if (input.category === "document") {
        return ["pdf", "docx", "txt", "md", "html", "rtf"].includes(target.id);
      }
      // Archive to Archive
      if (input.category === "archive") {
        return ["zip", "tar"].includes(target.id);
      }
      // Video to Video
      if (input.category === "video") {
        return ["webm", "mp4"].includes(target.id);
      }
      return true;
    }

    // Rule 2: Cross-category conversions:
    // Image / PSD -> Document (e.g. JPG/PNG/PSD -> PDF)
    if ((input.category === "image" || input.id === "psd") && target.id === "pdf") {
      return true;
    }

    // PSD -> Image (PNG, JPG, WEBP)
    if (input.id === "psd" && ["png", "jpg", "webp"].includes(target.id)) {
      return true;
    }

    // Document (PDF) -> Image (e.g. PDF -> JPG, PNG)
    if (input.id === "pdf" && ["jpg", "png"].includes(target.id)) {
      return true;
    }

    // Video -> Image (e.g. MP4/MOV -> GIF, JPG, PNG thumbnail)
    if (input.category === "video" && ["gif", "jpg", "png"].includes(target.id)) {
      return true;
    }

    // Data (CSV, XLSX) -> Document (PDF, HTML, TXT)
    if ((input.category === "spreadsheet" || input.category === "data") && ["html", "txt"].includes(target.id)) {
      return true;
    }

    // Ebook (EPUB) -> Document (HTML, TXT, PDF)
    if (input.id === "epub" && ["html", "txt", "pdf"].includes(target.id)) {
      return true;
    }

    // Vector (SVG) -> Image (PNG, JPG, WEBP, PDF)
    if (input.id === "svg" && ["png", "jpg", "webp", "pdf"].includes(target.id)) {
      return true;
    }

    return false;
  });
}

/**
 * Validates whether a specific input -> output conversion is supported
 */
export function isConversionSupported(inputFormatId: string, outputFormatId: string): boolean {
  const supported = getSupportedOutputs(inputFormatId);
  return supported.some((f) => f.id === outputFormatId.toLowerCase());
}

/**
 * Returns popular conversion pairs for SEO and Quick Links
 */
export const POPULAR_CONVERSION_PAIRS = [
  { from: "jpg", to: "webp", name: "JPG to WebP" },
  { from: "png", to: "jpg", name: "PNG to JPG" },
  { from: "pdf", to: "jpg", name: "PDF to JPG" },
  { from: "jpg", to: "pdf", name: "JPG to PDF" },
  { from: "png", to: "webp", name: "PNG to WebP" },
  { from: "webp", to: "png", name: "WebP to PNG" },
  { from: "mp4", to: "gif", name: "MP4 to GIF" },
  { from: "wav", to: "mp3", name: "WAV to MP3" },
  { from: "mp3", to: "wav", name: "MP3 to WAV" },
  { from: "csv", to: "json", name: "CSV to JSON" },
  { from: "json", to: "csv", name: "JSON to CSV" },
  { from: "md", to: "html", name: "Markdown to HTML" },
  { from: "svg", to: "png", name: "SVG to PNG" },
  { from: "png", to: "ico", name: "PNG to ICO" },
];
