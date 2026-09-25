import { PDFDocument } from "pdf-lib";

export interface PdfMetadataInfo {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  producer: string;
  creator: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount: number;
  fileSizeBytes: number;
}

export async function extractPdfMetadata(file: File): Promise<PdfMetadataInfo> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  return {
    title: doc.getTitle() || "",
    author: doc.getAuthor() || "",
    subject: doc.getSubject() || "",
    keywords: doc.getKeywords() || "",
    producer: doc.getProducer() || "",
    creator: doc.getCreator() || "",
    creationDate: doc.getCreationDate()?.toISOString() || "",
    modificationDate: doc.getModificationDate()?.toISOString() || "",
    pageCount: doc.getPageCount(),
    fileSizeBytes: file.size,
  };
}

export async function updatePdfMetadata(
  file: File,
  metadata: Partial<PdfMetadataInfo>,
  stripAll = false
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  if (stripAll) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
  } else {
    if (metadata.title !== undefined) doc.setTitle(metadata.title);
    if (metadata.author !== undefined) doc.setAuthor(metadata.author);
    if (metadata.subject !== undefined) doc.setSubject(metadata.subject);
    if (metadata.keywords !== undefined) {
      doc.setKeywords(metadata.keywords.split(",").map((s) => s.trim()).filter(Boolean));
    }
    if (metadata.producer !== undefined) doc.setProducer(metadata.producer);
    if (metadata.creator !== undefined) doc.setCreator(metadata.creator);
  }

  return await doc.save();
}
