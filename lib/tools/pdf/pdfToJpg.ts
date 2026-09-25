export interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

export interface PdfToImageOptions {
  format: "image/jpeg" | "image/png";
  scale: number; // e.g. 1.5 for ~150 DPI, 2.0 for ~200 DPI
  quality: number; // 0.1 to 1.0 for JPEG
  selectedPages?: number[];
}

export async function renderPdfToImages(
  file: File,
  options: PdfToImageOptions,
  onPageRendered?: (page: RenderedPage, current: number, total: number) => void
): Promise<RenderedPage[]> {
  const pdfjsLib = await import("pdfjs-dist/build/pdf");
  
  // Set worker source
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const results: RenderedPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (options.selectedPages && !options.selectedPages.includes(i)) {
      continue;
    }

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: options.scale || 1.5 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error(`Failed to get canvas 2D context for page ${i}`);
    }

    // Fill white background for JPEG
    if (options.format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to export image blob"))),
        options.format,
        options.quality || 0.9
      );
    });

    const dataUrl = canvas.toDataURL(options.format, options.quality || 0.9);

    const rendered: RenderedPage = {
      pageNumber: i,
      blob,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    };

    results.push(rendered);
    onPageRendered?.(rendered, results.length, options.selectedPages ? options.selectedPages.length : numPages);
  }

  return results;
}
