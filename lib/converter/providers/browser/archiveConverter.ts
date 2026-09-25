import { ConversionJob, ConversionResult } from "../../types";
import JSZip from "jszip";

export async function convertArchive(job: ConversionJob): Promise<ConversionResult> {
  const startTime = performance.now();
  const { file, outputFormat, options } = job;

  const zip = new JSZip();

  // If compressing single or unpacked file into ZIP
  const arrayBuffer = await file.arrayBuffer();
  zip.file(file.name, arrayBuffer);

  const compressionLevel = options?.compressionLevel || 6;
  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: compressionLevel },
  });

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${outputFormat || "zip"}`;

  return {
    id: job.id,
    fileName: outputFileName,
    outputFormat: outputFormat || "zip",
    mimeType: "application/zip",
    blob: content,
    originalSize: file.size,
    outputSize: content.size,
    durationMs: Math.round(performance.now() - startTime),
    provider: "JSZipProvider",
  };
}
