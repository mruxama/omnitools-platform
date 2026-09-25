import { PDFDocument } from "pdf-lib";

export interface MergePdfProgress {
  currentFile: number;
  totalFiles: number;
  fileName: string;
}

export async function mergePdfFiles(
  files: File[],
  onProgress?: (progress: MergePdfProgress) => void
): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error("At least 2 PDF files are required to merge.");
  }

  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.({
      currentFile: i + 1,
      totalFiles: files.length,
      fileName: file.name,
    });

    const fileBuffer = await file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());

    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  return await mergedDoc.save();
}

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return doc.getPageCount();
}
