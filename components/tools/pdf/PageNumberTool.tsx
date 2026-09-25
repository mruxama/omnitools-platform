"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import {
  addPageNumbersToPdf,
  PageNumberOptions,
  NumberPosition,
  NumberFormat,
} from "@/lib/tools/pdf/numbering";
import {
  Download,
  Loader2,
  Hash,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function PageNumberTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<PageNumberOptions>({
    position: "bottom-center",
    format: "Page {n} of {total}",
    startNumber: 1,
    fontSize: 10,
    skipFirstPage: false,
    colorHex: "#4b5563",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [numberedData, setNumberedData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      const data = await addPageNumbersToPdf(files[0], options);
      setNumberedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!numberedData) return;
    const blob = new Blob([numberedData as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `numbered_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setNumberedData(null);
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
          setNumberedData(null);
          setError(null);
        }}
        title="Select a PDF to add page numbers"
        description="Stamp page numbers into headers or footers with customized styling."
      />

      {files.length > 0 && !numberedData && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Numbering Preferences
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Position */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Position</label>
              <select
                value={options.position}
                onChange={(e) =>
                  setOptions({ ...options, position: e.target.value as NumberPosition })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
              >
                <option value="bottom-center">Bottom Center (Footer)</option>
                <option value="bottom-right">Bottom Right (Footer)</option>
                <option value="bottom-left">Bottom Left (Footer)</option>
                <option value="top-center">Top Center (Header)</option>
                <option value="top-right">Top Right (Header)</option>
                <option value="top-left">Top Left (Header)</option>
              </select>
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Format</label>
              <select
                value={options.format}
                onChange={(e) =>
                  setOptions({ ...options, format: e.target.value as NumberFormat })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
              >
                <option value="Page {n} of {total}">Page {options.startNumber} of Total</option>
                <option value="Page {n}">Page {options.startNumber}</option>
                <option value="{n}">{options.startNumber}</option>
                <option value="{n} / {total}">{options.startNumber} / Total</option>
              </select>
            </div>

            {/* Start Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Starting Number</label>
              <input
                type="number"
                min={1}
                value={options.startNumber}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    startNumber: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Font Size (pt)</label>
              <select
                value={options.fontSize}
                onChange={(e) =>
                  setOptions({ ...options, fontSize: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
              >
                <option value={8}>8 pt (Small)</option>
                <option value={10}>10 pt (Standard)</option>
                <option value={12}>12 pt (Medium)</option>
                <option value={14}>14 pt (Large)</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="pt-2 border-t border-border/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={options.skipFirstPage}
                onChange={(e) =>
                  setOptions({ ...options, skipFirstPage: e.target.checked })
                }
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Skip first page (useful for title / cover pages)</span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Numbering Pages...
                </>
              ) : (
                <>
                  <Hash className="w-4 h-4" /> Add Page Numbers
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

      {numberedData && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Page Numbers Applied!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              File size: {formatBytes(numberedData.byteLength)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Numbered PDF
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
