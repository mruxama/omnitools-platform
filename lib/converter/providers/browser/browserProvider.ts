import { ConversionJob, ConversionResult } from "../../types";
import { ConversionProvider } from "../providerInterface";
import { convertImage } from "./imageConverter";
import { convertAudio } from "./audioConverter";
import { convertDocumentOrData } from "./documentConverter";
import { convertArchive } from "./archiveConverter";
import { convertMedia } from "./mediaConverter";
import { parsePsdToCanvas } from "./imageAdvancedConverter";
import {
  parseDocx,
  createDocx,
  parseOdt,
  parseXlsx,
  createXlsxFromCsv,
  parseEpub,
} from "./officeConverter";
import { getFormatById } from "../../formatRegistry";

export class BrowserProvider implements ConversionProvider {
  id = "browser-native";
  name = "Client-Side Browser Engine";

  canHandle(inputFormat: string, outputFormat: string): boolean {
    const input = getFormatById(inputFormat);
    const output = getFormatById(outputFormat);

    if (!input || !output) return false;
    return output.canOutput;
  }

  async convert(job: ConversionJob): Promise<ConversionResult> {
    const startTime = performance.now();
    const { file, inputFormat, outputFormat } = job;
    const input = getFormatById(inputFormat);
    const output = getFormatById(outputFormat);

    if (!input || !output) {
      throw new Error(`Unsupported conversion format pair: ${inputFormat} to ${outputFormat}`);
    }

    // 1. PSD to Image (PNG, JPG, WEBP)
    if (inputFormat === "psd") {
      const canvas = await parsePsdToCanvas(file);
      const mimeType =
        outputFormat === "jpg" || outputFormat === "jpeg"
          ? "image/jpeg"
          : outputFormat === "webp"
          ? "image/webp"
          : "image/png";

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to encode PSD canvas"))), mimeType, 0.9);
      });

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: job.id,
        fileName: `${baseName}.${outputFormat}`,
        outputFormat,
        mimeType,
        blob,
        dataUrl: URL.createObjectURL(blob),
        originalSize: file.size,
        outputSize: blob.size,
        durationMs: Math.round(performance.now() - startTime),
        provider: "BrowserPsdDecoder",
      };
    }

    // 2. DOCX input
    if (inputFormat === "docx") {
      const { text, html } = await parseDocx(file);
      let outputBlob: Blob;
      let mimeType = "text/plain";

      if (outputFormat === "html") {
        mimeType = "text/html";
        outputBlob = new Blob([html], { type: mimeType });
      } else {
        outputBlob = new Blob([text], { type: mimeType });
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: job.id,
        fileName: `${baseName}.${outputFormat}`,
        outputFormat,
        mimeType,
        blob: outputBlob,
        originalSize: file.size,
        outputSize: outputBlob.size,
        durationMs: Math.round(performance.now() - startTime),
        provider: "BrowserDocxParser",
      };
    }

    // 3. Convert text/markdown to DOCX output
    if (outputFormat === "docx") {
      const text = await file.text();
      const docxBlob = await createDocx(text, file.name);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: job.id,
        fileName: `${baseName}.docx`,
        outputFormat: "docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        blob: docxBlob,
        originalSize: file.size,
        outputSize: docxBlob.size,
        durationMs: Math.round(performance.now() - startTime),
        provider: "BrowserDocxGenerator",
      };
    }

    // 4. ODT input
    if (inputFormat === "odt") {
      const { text, html } = await parseOdt(file);
      const mimeType = outputFormat === "html" ? "text/html" : "text/plain";
      const blob = new Blob([outputFormat === "html" ? html : text], { type: mimeType });
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: job.id,
        fileName: `${baseName}.${outputFormat}`,
        outputFormat,
        mimeType,
        blob,
        originalSize: file.size,
        outputSize: blob.size,
        durationMs: Math.round(performance.now() - startTime),
        provider: "BrowserOdtParser",
      };
    }

    // 5. XLSX input
    if (inputFormat === "xlsx") {
      const { csv, json } = await parseXlsx(file);
      let outputContent = csv;
      let mimeType = "text/csv";

      if (outputFormat === "json") {
        outputContent = JSON.stringify(json, null, 2);
        mimeType = "application/json";
      } else if (outputFormat === "tsv") {
        outputContent = csv.replace(/,/g, "\t");
        mimeType = "text/tab-separated-values";
      }

      const blob = new Blob([outputContent], { type: mimeType });
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: job.id,
        fileName: `${baseName}.${outputFormat}`,
        outputFormat,
        mimeType,
        blob,
        originalSize: file.size,
        outputSize: blob.size,
        durationMs: Math.round(performance.now() - startTime),
        provider: "BrowserXlsxParser",
      };
    }

    // 6. CSV or JSON to XLSX output
    if (outputFormat === "xlsx") {
      const text = await file.text();
      let csvData = text;
      if (inputFormat === "json") {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const headers = Object.keys(parsed[0]);
            csvData = [
              headers.join(","),
              ...parsed.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
            ].join("\n");
          }
        } catch {
          // fallback to raw text
        }
      }

      const blob = await createXlsxFromCsv(csvData);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: job.id,
        fileName: `${baseName}.xlsx`,
        outputFormat: "xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        blob,
        originalSize: file.size,
        outputSize: blob.size,
        durationMs: Math.round(performance.now() - startTime),
        provider: "BrowserXlsxGenerator",
      };
    }

    // 7. EPUB input
    if (inputFormat === "epub") {
      const { text, html } = await parseEpub(file);
      const mimeType = outputFormat === "html" ? "text/html" : "text/plain";
      const blob = new Blob([outputFormat === "html" ? html : text], { type: mimeType });
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: job.id,
        fileName: `${baseName}.${outputFormat}`,
        outputFormat,
        mimeType,
        blob,
        originalSize: file.size,
        outputSize: blob.size,
        durationMs: Math.round(performance.now() - startTime),
        provider: "BrowserEpubParser",
      };
    }

    // 8. Audio conversions (WAV, MP3, OGG, AAC, M4A, FLAC)
    if (input.category === "audio") {
      return await convertAudio(job);
    }

    // 9. Video frame / thumbnail / GIF conversions (MP4, WEBM, MOV)
    if (input.category === "video" && (output.category === "image" || output.id === "gif")) {
      return await convertMedia(job);
    }

    // 10. Document or Data conversions (CSV, JSON, Markdown, HTML, Image to PDF)
    if (
      input.category === "spreadsheet" ||
      input.category === "data" ||
      input.category === "document" ||
      output.id === "pdf"
    ) {
      return await convertDocumentOrData(job);
    }

    // 11. Archive conversions
    if (input.category === "archive" || output.category === "archive") {
      return await convertArchive(job);
    }

    // 12. Standard Image conversions (PNG, JPG, WEBP, AVIF, BMP, ICO)
    return await convertImage(job);
  }
}

export const defaultBrowserProvider = new BrowserProvider();
