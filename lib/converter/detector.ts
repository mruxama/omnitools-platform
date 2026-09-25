import { FormatDefinition } from "./types";
import { getFormatByExtension, getFormatById, getFormatByMimeType } from "./formatRegistry";

interface MagicByteSignature {
  formatId: string;
  bytes: number[];
  offset?: number;
  mask?: number[];
}

// Common file signatures
const MAGIC_SIGNATURES: MagicByteSignature[] = [
  { formatId: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { formatId: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { formatId: "gif", bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { formatId: "webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF....WEBP checked in logic
  { formatId: "bmp", bytes: [0x42, 0x4d] }, // BM
  { formatId: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { formatId: "zip", bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK..
  { formatId: "wav", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF....WAVE checked in logic
  { formatId: "mp3", bytes: [0x49, 0x44, 0x33] }, // ID3
  { formatId: "tar", bytes: [0x75, 0x73, 0x74, 0x61, 0x72], offset: 257 }, // ustar
];

export interface DetectedFormatResult {
  format: FormatDefinition;
  confidence: "high" | "medium" | "low";
  method: "magic_bytes" | "mime_type" | "extension" | "fallback";
}

/**
 * Inspects a File using magic bytes, MIME type, and file extension
 */
export async function detectFileFormat(file: File): Promise<DetectedFormatResult> {
  // 1. Try reading the first 512 bytes for magic byte verification
  try {
    const buffer = await file.slice(0, 512).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Special check for WEBP: RIFF + 'WEBP' at offset 8
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      const format = getFormatById("webp");
      if (format) return { format, confidence: "high", method: "magic_bytes" };
    }

    // Special check for WAV: RIFF + 'WAVE' at offset 8
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x41 &&
      bytes[10] === 0x56 &&
      bytes[11] === 0x45
    ) {
      const format = getFormatById("wav");
      if (format) return { format, confidence: "high", method: "magic_bytes" };
    }

    for (const sig of MAGIC_SIGNATURES) {
      const offset = sig.offset || 0;
      if (bytes.length < offset + sig.bytes.length) continue;

      let match = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        if (bytes[offset + i] !== sig.bytes[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        const format = getFormatById(sig.formatId);
        if (format) {
          return { format, confidence: "high", method: "magic_bytes" };
        }
      }
    }
  } catch {
    // If magic byte reading fails, fall through to MIME & Extension
  }

  // 2. MIME type check
  if (file.type) {
    const byMime = getFormatByMimeType(file.type);
    if (byMime) {
      return { format: byMime, confidence: "medium", method: "mime_type" };
    }
  }

  // 3. File extension check
  const dotIndex = file.name.lastIndexOf(".");
  if (dotIndex !== -1) {
    const ext = file.name.slice(dotIndex + 1);
    const byExt = getFormatByExtension(ext);
    if (byExt) {
      return { format: byExt, confidence: "medium", method: "extension" };
    }
  }

  // 4. Fallback default
  const defaultFmt = getFormatById("bin") || getFormatById("txt") || Object.values(MAGIC_SIGNATURES)[0];
  return {
    format: (getFormatById("txt") as FormatDefinition),
    confidence: "low",
    method: "fallback",
  };
}
