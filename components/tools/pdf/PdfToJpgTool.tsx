"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { FileUploader } from "@/components/tools/FileUploader";
import { renderPdfToImages, RenderedPage } from "@/lib/tools/pdf/pdfToJpg";
import {
  Download,
  Loader2,
  FileArchive,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function PdfToJpgTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(1.5);
  const [isRendering, setIsRendering] = useState(false);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsRendering(true);
    setRenderedPages([]);

    try {
      const results = await renderPdfToImages(files[0], {
        format,
        scale,
        quality,
      });
      setRenderedPages(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF pages.");
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadSingle = (page: RenderedPage) => {
    const ext = format === "image/jpeg" ? "jpg" : "png";
    const filename = `${files[0].name.replace(/\.pdf$/i, "")}_page_${page.pageNumber}.${ext}`;
    const url = URL.createObjectURL(page.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadZip = async () => {
    if (renderedPages.length === 0) return;
    const zip = new JSZip();
    const ext = format === "image/jpeg" ? "jpg" : "png";
    const baseName = files[0].name.replace(/\.pdf$/i, "");

    renderedPages.forEach((page) => {
      zip.file(`${baseName}_page_${page.pageNumber}.${ext}`, page.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setRenderedPages([]);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <FileUploader
        accept=".pdf,application/pdf"
        multiple={false}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setRenderedPages([]);
          setError(null);
        }}
        title="Select a PDF document to convert to images"
        description="Renders high-resolution vector PDF pages into crisp JPG or PNG images."
      />

      {files.length > 0 && renderedPages.length === 0 && (
        <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Format choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("image/jpeg")}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    format === "image/jpeg"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  JPG
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("image/png")}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    format === "image/png"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  PNG
                </button>
              </div>
            </div>

            {/* DPI / Scale */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Rendering Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              >
                <option value={1.0}>Standard (72 DPI)</option>
                <option value={1.5}>Medium (150 DPI - Recommended)</option>
                <option value={2.0}>High (200 DPI)</option>
                <option value={3.0}>Ultra (300 DPI)</option>
              </select>
            </div>

            {/* Quality for JPG */}
            {format === "image/jpeg" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>JPG Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleConvert}
              disabled={isRendering}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Converting Pages...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" /> Convert to Images
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Rendered pages gallery */}
      {renderedPages.length > 0 && (
        <div className="space-y-4 p-6 bg-card border border-border rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {renderedPages.length} {renderedPages.length === 1 ? "Page" : "Pages"} Converted
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download individual pages or save the full document as a ZIP.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZip}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <FileArchive className="w-4 h-4" /> Download All (ZIP)
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid of preview images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {renderedPages.map((page) => (
              <div
                key={page.pageNumber}
                className="group relative flex flex-col p-2.5 bg-muted/40 border border-border rounded-xl space-y-2 text-center"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background border border-border flex items-center justify-center">
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-medium text-foreground">Page {page.pageNumber}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatBytes(page.blob.size)}
                  </span>
                </div>
                <button
                  onClick={() => handleDownloadSingle(page)}
                  className="w-full py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Save Image
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
