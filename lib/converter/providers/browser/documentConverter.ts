import { ConversionJob, ConversionResult } from "../../types";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Creates a real multi-page PDF document from text using pdf-lib
 */
export async function createPdfFromText(text: string, title = "Document"): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(title);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  const lineHeight = 14;
  const margin = 40;
  const pageWidth = 595.28; // A4 portrait
  const pageHeight = 841.89; // A4 portrait
  const contentWidth = pageWidth - margin * 2;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

  // Sanitize non-standard chars for WinAnsi standard font
  const sanitized = text.replace(/[^\x20-\x7E\r\n\t]/g, " ");
  const rawLines = sanitized.split(/\r?\n/);
  const wrappedLines: string[] = [];

  for (const rawLine of rawLines) {
    if (rawLine.length === 0) {
      wrappedLines.push("");
      continue;
    }
    const words = rawLine.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      try {
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > contentWidth && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      } catch {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  const totalPages = Math.max(1, Math.ceil(wrappedLines.length / maxLinesPerPage));
  for (let p = 0; p < totalPages; p++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const pageLines = wrappedLines.slice(p * maxLinesPerPage, (p + 1) * maxLinesPerPage);

    pageLines.forEach((lineText, idx) => {
      if (lineText.trim().length > 0) {
        try {
          page.drawText(lineText, {
            x: margin,
            y: pageHeight - margin - (idx + 1) * lineHeight,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1),
          });
        } catch {
          // Ignore individual unrenderable line encoding errors
        }
      }
    });
  }

  const pdfData = await pdfDoc.save();
  return new Blob([pdfData as any], { type: "application/pdf" });
}

export function textToRtf(text: string): string {
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\r?\n/g, "\\par\n");
  return `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}\\f0\\fs22 ${escaped}}`;
}

export function rtfToText(rtf: string): string {
  return rtf
    .replace(/\\par[d]?\s?/g, "\n")
    .replace(/\{\\*?\\[^{}]+;?\}|[{}]|\\\w+\s?/g, "")
    .trim();
}

export async function convertDocumentOrData(job: ConversionJob): Promise<ConversionResult> {
  const startTime = performance.now();
  const { file, inputFormat, outputFormat } = job;

  let outputText = "";
  let mimeType = "text/plain";
  let outputBlob: Blob | null = null;

  // --- RTF input ---
  if (inputFormat === "rtf") {
    const rtfContent = await file.text();
    const plain = rtfToText(rtfContent);
    if (outputFormat === "html") {
      mimeType = "text/html";
      outputText = `<!DOCTYPE html><html><body><p>${plain.replace(/\n/g, "<br/>")}</p></body></html>`;
    } else if (outputFormat === "pdf") {
      outputBlob = await createPdfFromText(plain, file.name);
      mimeType = "application/pdf";
    } else {
      outputText = plain;
    }
  }
  // --- CSV / TSV / JSON ---
  else if (inputFormat === "csv" || inputFormat === "tsv") {
    const text = await file.text();
    const delimiter = inputFormat === "tsv" ? "\t" : ",";
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (outputFormat === "json") {
      mimeType = "application/json";
      if (lines.length > 0) {
        const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map((line) => {
          const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] || "";
          });
          return obj;
        });
        outputText = JSON.stringify(rows, null, 2);
      } else {
        outputText = "[]";
      }
    } else if (outputFormat === "tsv" || outputFormat === "csv") {
      const targetDelim = outputFormat === "tsv" ? "\t" : ",";
      mimeType = outputFormat === "tsv" ? "text/tab-separated-values" : "text/csv";
      outputText = lines
        .map((line) =>
          line
            .split(delimiter)
            .map((cell) => cell.trim())
            .join(targetDelim)
        )
        .join("\n");
    } else if (outputFormat === "html") {
      mimeType = "text/html";
      const headers = lines[0]?.split(delimiter).map((h) => `<th>${h.trim()}</th>`).join("") || "";
      const bodyRows = lines.slice(1).map(
        (line) =>
          `<tr>${line
            .split(delimiter)
            .map((c) => `<td>${c.trim()}</td>`)
            .join("")}</tr>`
      ).join("\n");
      outputText = `<!DOCTYPE html><html><head><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}</style></head><body><table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
    } else if (outputFormat === "pdf") {
      outputBlob = await createPdfFromText(text, file.name);
      mimeType = "application/pdf";
    }
  } else if (inputFormat === "json") {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (outputFormat === "csv" || outputFormat === "tsv") {
      const delimiter = outputFormat === "tsv" ? "\t" : ",";
      mimeType = outputFormat === "tsv" ? "text/tab-separated-values" : "text/csv";
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
        const headers = Object.keys(parsed[0]);
        const headerRow = headers.join(delimiter);
        const dataRows = parsed.map((item) =>
          headers.map((h) => JSON.stringify(item[h] ?? "")).join(delimiter)
        );
        outputText = [headerRow, ...dataRows].join("\n");
      } else {
        outputText = text;
      }
    } else if (outputFormat === "pdf") {
      outputBlob = await createPdfFromText(JSON.stringify(parsed, null, 2), file.name);
      mimeType = "application/pdf";
    } else {
      outputText = JSON.stringify(parsed, null, 2);
      mimeType = "application/json";
    }
  } else if (inputFormat === "md" || inputFormat === "markdown") {
    const md = await file.text();
    if (outputFormat === "html") {
      mimeType = "text/html";
      const parsedHtml = md
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*)\*/gim, "<em>$1</em>")
        .replace(/\n\n/gim, "</p><p>")
        .replace(/\n/gim, "<br/>");
      outputText = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title></head><body><p>${parsedHtml}</p></body></html>`;
    } else if (outputFormat === "txt") {
      mimeType = "text/plain";
      outputText = md
        .replace(/#+\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1");
    } else if (outputFormat === "pdf") {
      outputBlob = await createPdfFromText(md, file.name);
      mimeType = "application/pdf";
    } else if (outputFormat === "rtf") {
      outputText = textToRtf(md);
      mimeType = "application/rtf";
    }
  } else if (inputFormat === "html") {
    const html = await file.text();
    if (outputFormat === "txt") {
      mimeType = "text/plain";
      const doc = new DOMParser().parseFromString(html, "text/html");
      outputText = doc.body.textContent || "";
    } else if (outputFormat === "md") {
      mimeType = "text/markdown";
      const doc = new DOMParser().parseFromString(html, "text/html");
      outputText = (doc.body.textContent || "").trim();
    } else if (outputFormat === "pdf") {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const plain = doc.body.textContent || "";
      outputBlob = await createPdfFromText(plain, file.name);
      mimeType = "application/pdf";
    }
  } else if (["jpg", "jpeg", "png", "webp"].includes(inputFormat) && outputFormat === "pdf") {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = await file.arrayBuffer();
    let embeddedImg;

    if (inputFormat === "png") {
      embeddedImg = await pdfDoc.embedPng(imageBytes);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imageBytes);
    }

    const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: embeddedImg.width,
      height: embeddedImg.height,
    });

    const pdfData = await pdfDoc.save();
    outputBlob = new Blob([pdfData as any], { type: "application/pdf" });
    mimeType = "application/pdf";
  } else if (outputFormat === "pdf") {
    const text = await file.text();
    outputBlob = await createPdfFromText(text, file.name);
    mimeType = "application/pdf";
  } else if (outputFormat === "rtf") {
    const text = await file.text();
    outputText = textToRtf(text);
    mimeType = "application/rtf";
  } else {
    outputText = await file.text();
  }

  const finalBlob = outputBlob || new Blob([outputText], { type: mimeType });
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${outputFormat}`;

  return {
    id: job.id,
    fileName: outputFileName,
    outputFormat,
    mimeType,
    blob: finalBlob,
    originalSize: file.size,
    outputSize: finalBlob.size,
    durationMs: Math.round(performance.now() - startTime),
    provider: outputFormat === "pdf" ? "PdfLibProvider" : "BrowserDocumentProvider",
  };
}
