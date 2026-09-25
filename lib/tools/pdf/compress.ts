import { PDFDocument } from "pdf-lib";

export interface CompressResult {
  originalSize: number;
  outputSize: number;
  data: Uint8Array;
  ratio: number;
  isLarger: boolean;
}

export async function compressPdfFile(file: File): Promise<CompressResult> {
  const originalSize = file.size;
  const buffer = await file.arrayBuffer();

  const doc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Optimize by saving with object streams enabled
  const data = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const outputSize = data.byteLength;
  const ratio = ((originalSize - outputSize) / originalSize) * 100;

  return {
    originalSize,
    outputSize,
    data,
    ratio: Math.round(ratio * 10) / 10,
    isLarger: outputSize > originalSize,
  };
}
