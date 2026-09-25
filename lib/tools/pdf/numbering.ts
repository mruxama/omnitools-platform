import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type NumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

export type NumberFormat = "Page {n} of {total}" | "Page {n}" | "{n}" | "{n} / {total}";

export interface PageNumberOptions {
  position: NumberPosition;
  format: NumberFormat;
  startNumber: number;
  fontSize: number;
  skipFirstPage: boolean;
  colorHex?: string;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const textColor = hexToRgb(options.colorHex || "#4b5563");

  for (let i = 0; i < totalPages; i++) {
    if (i === 0 && options.skipFirstPage) continue;

    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const currentNum = options.startNumber + (options.skipFirstPage ? i - 1 : i);

    let text = options.format
      .replace("{n}", currentNum.toString())
      .replace("{total}", totalPages.toString());

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const margin = 36; // 0.5 inch margin

    let x = (width - textWidth) / 2;
    let y = margin;

    if (options.position.includes("left")) x = margin;
    else if (options.position.includes("right")) x = width - textWidth - margin;
    else x = (width - textWidth) / 2;

    if (options.position.includes("top")) y = height - margin;
    else y = margin;

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: textColor,
    });
  }

  return await doc.save();
}
