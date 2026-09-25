import { PDFDocument, rgb } from "pdf-lib";

export interface JpgToPdfOptions {
  pageSize: "a4" | "letter" | "fit";
  orientation: "portrait" | "landscape" | "auto";
  marginPt: number;
  backgroundColorHex: string;
}

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 1;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 1;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 1;
  return rgb(r, g, b);
}

export async function convertImagesToPdf(
  imageFiles: File[],
  options: JpgToPdfOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const bgColor = hexToRgb(options.backgroundColorHex || "#ffffff");

  for (const file of imageFiles) {
    const buffer = await file.arrayBuffer();
    const isJpg = file.type.includes("jpeg") || file.name.match(/\.jpe?g$/i);
    const isPng = file.type.includes("png") || file.name.match(/\.png$/i);

    let embeddedImage;
    if (isJpg) {
      embeddedImage = await doc.embedJpg(buffer);
    } else if (isPng) {
      embeddedImage = await doc.embedPng(buffer);
    } else {
      // For WebP or other formats, convert to PNG via canvas first
      const pngBlob = await convertImageFileToPngBlob(file);
      const pngBuffer = await pngBlob.arrayBuffer();
      embeddedImage = await doc.embedPng(pngBuffer);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = imgWidth;
    let pageHeight = imgHeight;

    if (options.pageSize !== "fit") {
      const base = PAGE_SIZES[options.pageSize];
      let isLandscape = options.orientation === "landscape";
      if (options.orientation === "auto") {
        isLandscape = imgWidth > imgHeight;
      }
      pageWidth = isLandscape ? base.height : base.width;
      pageHeight = isLandscape ? base.width : base.height;
    }

    const page = doc.addPage([pageWidth, pageHeight]);

    // Draw background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: bgColor,
    });

    // Calculate dimensions with margin
    const margin = options.marginPt || 0;
    const availWidth = Math.max(10, pageWidth - margin * 2);
    const availHeight = Math.max(10, pageHeight - margin * 2);

    const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const drawX = margin + (availWidth - drawWidth) / 2;
    const drawY = margin + (availHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return await doc.save();
}

async function convertImageFileToPngBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context creation failed"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG blob conversion failed"));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file"));
    };
    img.src = url;
  });
}
