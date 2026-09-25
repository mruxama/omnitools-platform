"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { convertImagesToPdf, JpgToPdfOptions } from "@/lib/tools/pdf/jpgToPdf";
import {
  Download,
  Loader2,
  FilePlus,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function JpgToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<JpgToPdfOptions>({
    pageSize: "a4",
    orientation: "auto",
    marginPt: 18,
    backgroundColorHex: "#ffffff",
  });
  const [isConverting, setIsConverting] = useState(false);
  const [generatedPdfData, setGeneratedPdfData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsConverting(true);

    try {
      const data = await convertImagesToPdf(files, options);
      setGeneratedPdfData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF from images.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfData) return;
    const blob = new Blob([generatedPdfData as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_images.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setGeneratedPdfData(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <FileUploader
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple={true}
        maxFiles={50}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setGeneratedPdfData(null);
          setError(null);
        }}
        title="Select images to convert into a PDF"
        description="Supports JPG, PNG, and WebP. Reorder images to arrange pages."
        reorderable={true}
      />

      {files.length > 0 && !generatedPdfData && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Document Layout Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Page Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Page Size</label>
              <select
                value={options.pageSize}
                onChange={(e) =>
                  setOptions({ ...options, pageSize: e.target.value as any })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
              >
                <option value="a4">A4 (Standard)</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit to Image</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Orientation</label>
              <select
                value={options.orientation}
                disabled={options.pageSize === "fit"}
                onChange={(e) =>
                  setOptions({ ...options, orientation: e.target.value as any })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl disabled:opacity-50"
              >
                <option value="auto">Auto (Match Image)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Margin</label>
              <select
                value={options.marginPt}
                onChange={(e) =>
                  setOptions({ ...options, marginPt: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
              >
                <option value={0}>No Margin (0 pt)</option>
                <option value={18}>Small Margin (18 pt)</option>
                <option value={36}>Standard Margin (36 pt)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Building PDF...
                </>
              ) : (
                <>
                  <FilePlus className="w-4 h-4" /> Create PDF from {files.length} Images
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

      {generatedPdfData && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">PDF Created Successfully!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {files.length} images compiled • {formatBytes(generatedPdfData.byteLength)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
