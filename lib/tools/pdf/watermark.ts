import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export interface WatermarkOptions {
  text: string;
  opacity: number; // 0.1 to 1.0
  rotationAngle: number; // e.g. -45 or 45
  fontSize: number;
  colorHex: string;
  allPages: boolean;
  selectedPages?: number[];
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0.5;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0.5;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0.5;
  return rgb(r, g, b);
}

export async function addWatermarkToPdf(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgb(options.colorHex || "#9ca3af");

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    if (!options.allPages && options.selectedPages && !options.selectedPages.includes(pageNum)) {
      continue;
    }

    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    // Center of page
    const centerX = width / 2;
    const centerY = height / 2;

    page.drawText(options.text, {
      x: centerX - textWidth / 2,
      y: centerY - textHeight / 2,
      size: options.fontSize,
      font,
      color,
      opacity: options.opacity,
      rotate: degrees(options.rotationAngle),
    });
  }

  return await doc.save();
}
