import { PDFDocument, degrees } from "pdf-lib";

export interface PageAction {
  originalIndex: number; // 0-based
  rotation: number; // 0, 90, 180, 270
}

export async function organizePdfPages(
  file: File,
  pageOrder: PageAction[]
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  for (const item of pageOrder) {
    const [copiedPage] = await newDoc.copyPages(sourceDoc, [item.originalIndex]);
    if (item.rotation) {
      const current = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((current + item.rotation) % 360));
    }
    newDoc.addPage(copiedPage);
  }

  return await newDoc.save();
}
