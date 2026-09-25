import { PDFDocument } from "pdf-lib";

export interface SplitOutput {
  fileName: string;
  data: Uint8Array;
  pageCount: number;
}

/**
 * Parses user input like "1-3, 5, 8-10" into an array of page numbers (1-indexed).
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const clean = rangeStr.replace(/\s+/g, "");
  if (!clean) return [];

  const parts = clean.split(",");
  const pages = new Set<number>();

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range syntax: "${part}"`);
      }
      for (let p = start; p <= Math.min(end, totalPages); p++) {
        pages.add(p);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page) || page < 1 || page > totalPages) {
        throw new Error(`Page number ${part} is out of bounds (1 to ${totalPages})`);
      }
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Splits a PDF by custom page ranges (comma-separated ranges or single pages)
 */
export async function splitPdfByRanges(
  file: File,
  rangeStrings: string[]
): Promise<SplitOutput[]> {
  const buffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = sourceDoc.getPageCount();
  const baseName = file.name.replace(/\.pdf$/i, "");
  const outputs: SplitOutput[] = [];

  for (let i = 0; i < rangeStrings.length; i++) {
    const range = rangeStrings[i].trim();
    if (!range) continue;
    const pageNumbers = parsePageRange(range, totalPages);
    if (pageNumbers.length === 0) continue;

    const newDoc = await PDFDocument.create();
    // Convert 1-indexed to 0-indexed
    const indicesToCopy = pageNumbers.map((p) => p - 1);
    const copied = await newDoc.copyPages(sourceDoc, indicesToCopy);
    copied.forEach((p) => newDoc.addPage(p));

    const data = await newDoc.save();
    outputs.push({
      fileName: `${baseName}_part_${i + 1}.pdf`,
      data,
      pageCount: copied.length,
    });
  }

  return outputs;
}

/**
 * Splits a PDF into individual files every N pages.
 */
export async function splitPdfEveryNPages(
  file: File,
  n: number
): Promise<SplitOutput[]> {
  if (n <= 0) throw new Error("Interval must be at least 1 page.");
  const buffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = sourceDoc.getPageCount();
  const baseName = file.name.replace(/\.pdf$/i, "");
  const outputs: SplitOutput[] = [];

  let partNumber = 1;
  for (let i = 0; i < totalPages; i += n) {
    const newDoc = await PDFDocument.create();
    const end = Math.min(i + n, totalPages);
    const pageIndices: number[] = [];
    for (let p = i; p < end; p++) {
      pageIndices.push(p);
    }

    const copied = await newDoc.copyPages(sourceDoc, pageIndices);
    copied.forEach((page) => newDoc.addPage(page));

    const data = await newDoc.save();
    outputs.push({
      fileName: `${baseName}_pages_${i + 1}_to_${end}.pdf`,
      data,
      pageCount: copied.length,
    });
    partNumber++;
  }

  return outputs;
}
