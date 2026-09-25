import JSZip from "jszip";

/**
 * Extracts plain text and HTML from a Microsoft Word .docx file using JSZip
 */
export async function parseDocx(file: File): Promise<{ text: string; html: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const documentXmlFile = zip.file("word/document.xml");
  if (!documentXmlFile) {
    throw new Error("Invalid DOCX file: word/document.xml not found in archive.");
  }

  const xmlText = await documentXmlFile.async("string");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");

  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  const textLines: string[] = [];
  const htmlParagraphs: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textNodes = p.getElementsByTagName("w:t");
    let line = "";

    for (let j = 0; j < textNodes.length; j++) {
      line += textNodes[j].textContent || "";
    }

    if (line.trim().length > 0) {
      textLines.push(line);
      htmlParagraphs.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  const text = textLines.join("\n\n");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(
    file.name
  )}</title></head><body>${htmlParagraphs.join("\n")}</body></html>`;

  return { text, html };
}

/**
 * Generates a valid Microsoft Word .docx file from plain text using JSZip
 */
export async function createDocx(textContent: string, title = "Document"): Promise<Blob> {
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/document.xml
  const paragraphsXml = textContent
    .split(/\r?\n/)
    .map(
      (line) =>
        `<w:p><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>`
    )
    .join("");

  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphsXml}
  </w:body>
</w:document>`
  );

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * Extracts plain text and HTML from an OpenDocument .odt file
 */
export async function parseOdt(file: File): Promise<{ text: string; html: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const contentXmlFile = zip.file("content.xml");
  if (!contentXmlFile) {
    throw new Error("Invalid ODT file: content.xml not found.");
  }

  const xmlText = await contentXmlFile.async("string");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");

  const paragraphs = xmlDoc.querySelectorAll("text\\:p, p");
  const textLines: string[] = [];
  const htmlParagraphs: string[] = [];

  paragraphs.forEach((p) => {
    const content = p.textContent || "";
    if (content.trim().length > 0) {
      textLines.push(content);
      htmlParagraphs.push(`<p>${escapeHtml(content)}</p>`);
    }
  });

  const text = textLines.join("\n\n");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(
    file.name
  )}</title></head><body>${htmlParagraphs.join("\n")}</body></html>`;

  return { text, html };
}

/**
 * Parses an Excel .xlsx workbook into 2D grid of rows and cells
 */
export async function parseXlsx(file: File): Promise<{ rows: string[][]; csv: string; json: any[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Shared Strings Table
  const sharedStrings: string[] = [];
  const sstFile = zip.file("xl/sharedStrings.xml");
  if (sstFile) {
    const sstXml = await sstFile.async("string");
    const parser = new DOMParser();
    const doc = parser.parseFromString(sstXml, "application/xml");
    const siNodes = doc.getElementsByTagName("si");
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName("t");
      let str = "";
      for (let j = 0; j < tNodes.length; j++) {
        str += tNodes[j].textContent || "";
      }
      sharedStrings.push(str);
    }
  }

  // 2. Read first worksheet (xl/worksheets/sheet1.xml)
  const sheetFile = zip.file("xl/worksheets/sheet1.xml") || zip.file("xl/worksheets/sheet.xml");
  if (!sheetFile) {
    throw new Error("Invalid XLSX file: sheet1.xml not found in archive.");
  }

  const sheetXml = await sheetFile.async("string");
  const parser = new DOMParser();
  const sheetDoc = parser.parseFromString(sheetXml, "application/xml");

  const rowNodes = sheetDoc.getElementsByTagName("row");
  const rows: string[][] = [];

  for (let r = 0; r < rowNodes.length; r++) {
    const rowEl = rowNodes[r];
    const cellNodes = rowEl.getElementsByTagName("c");
    const rowData: string[] = [];

    for (let c = 0; c < cellNodes.length; c++) {
      const cell = cellNodes[c];
      const type = cell.getAttribute("t");
      const vNode = cell.getElementsByTagName("v")[0];
      const isNode = cell.getElementsByTagName("is")[0];

      let val = "";
      if (vNode) {
        const rawVal = vNode.textContent || "";
        if (type === "s") {
          // Shared string lookup
          const idx = parseInt(rawVal, 10);
          val = sharedStrings[idx] || "";
        } else {
          val = rawVal;
        }
      } else if (isNode) {
        val = isNode.textContent || "";
      }

      rowData.push(val);
    }

    if (rowData.some((cell) => cell.trim().length > 0)) {
      rows.push(rowData);
    }
  }

  // Convert rows to CSV
  const csv = rows
    .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  // Convert rows to JSON
  let json: any[] = [];
  if (rows.length > 1) {
    const headers = rows[0];
    json = rows.slice(1).map((r) => {
      const item: Record<string, string> = {};
      headers.forEach((h, idx) => {
        item[h || `column_${idx + 1}`] = r[idx] || "";
      });
      return item;
    });
  }

  return { rows, csv, json };
}

/**
 * Creates an Excel .xlsx workbook from CSV or tabular data using JSZip
 */
export async function createXlsxFromCsv(csvText: string): Promise<Blob> {
  const zip = new JSZip();
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  // xl/_rels/workbook.xml.rels
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  );

  // xl/workbook.xml
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
  );

  // xl/worksheets/sheet1.xml
  let sheetDataXml = "";
  lines.forEach((line, rIndex) => {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    let rowXml = `<row r="${rIndex + 1}">`;

    cells.forEach((cellVal, cIndex) => {
      const colLetter = String.fromCharCode(65 + (cIndex % 26));
      const cellRef = `${colLetter}${rIndex + 1}`;
      rowXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(cellVal)}</t></is></c>`;
    });

    rowXml += `</row>`;
    sheetDataXml += rowXml;
  });

  zip.file(
    "xl/worksheets/sheet1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${sheetDataXml}
  </sheetData>
</worksheet>`
  );

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Extracts HTML/Text chapters from an EPUB electronic book
 */
export async function parseEpub(file: File): Promise<{ text: string; html: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Look for container.xml to locate rootfile
  let rootFilePath = "OEBPS/content.opf";
  const containerFile = zip.file("META-INF/container.xml");
  if (containerFile) {
    const cXml = await containerFile.async("string");
    const m = cXml.match(/full-path="([^"]+)"/);
    if (m && m[1]) rootFilePath = m[1];
  }

  // Find all XHTML/HTML chapter files in archive
  const htmlFiles = Object.keys(zip.files).filter(
    (name) => name.endsWith(".xhtml") || name.endsWith(".html") || name.endsWith(".htm")
  );

  const chaptersText: string[] = [];
  const chaptersHtml: string[] = [];

  for (const filename of htmlFiles) {
    const content = await zip.files[filename].async("string");
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const bodyText = doc.body.textContent || "";
    if (bodyText.trim().length > 0) {
      chaptersText.push(bodyText.trim());
      chaptersHtml.push(`<section>${doc.body.innerHTML}</section>`);
    }
  }

  const text = chaptersText.join("\n\n---\n\n");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(
    file.name
  )}</title></head><body>${chaptersHtml.join("\n<hr/>\n")}</body></html>`;

  return { text, html };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
