"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { mergePdfFiles } from "@/lib/tools/pdf/merge";
import { Download, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfData, setMergedPdfData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    setError(null);
    setIsMerging(true);

    try {
      const data = await mergePdfFiles(files);
      setMergedPdfData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDF files.");
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfData) return;
    const blob = new Blob([mergedPdfData as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged_document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setMergedPdfData(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <FileUploader
        accept=".pdf,application/pdf"
        multiple={true}
        maxFiles={30}
        maxSizeMB={100}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setMergedPdfData(null);
          setError(null);
        }}
        title="Select or drop multiple PDFs to merge"
        description="Arrange documents in your desired order using the arrow buttons."
        reorderable={true}
      />

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {error}
        </div>
      )}

      {files.length > 0 && !mergedPdfData && (
        <div className="flex justify-end">
          <button
            onClick={handleMerge}
            disabled={isMerging || files.length < 2}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Merging {files.length} PDFs...
              </>
            ) : (
              <>Merge {files.length} PDF Documents</>
            )}
          </button>
        </div>
      )}

      {mergedPdfData && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">PDFs Successfully Merged!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Final size: {formatBytes(mergedPdfData.byteLength)} • Preserved in original sequence
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Merged PDF
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
