import { PDFDocument, degrees } from "pdf-lib";

export async function rotatePdfPages(
  file: File,
  rotationAngle: 90 | 180 | 270,
  targetPages: "all" | number[]
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = doc.getPageCount();

  for (let i = 0; i < total; i++) {
    const pageNumber = i + 1;
    const shouldRotate =
      targetPages === "all" || targetPages.includes(pageNumber);

    if (shouldRotate) {
      const page = doc.getPage(i);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  }

  return await doc.save();
}
