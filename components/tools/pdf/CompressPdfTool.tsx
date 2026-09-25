"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { compressPdfFile, CompressResult } from "@/lib/tools/pdf/compress";
import {
  Download,
  Loader2,
  Minimize2,
  CheckCircle2,
  RotateCcw,
  Info,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function CompressPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsCompressing(true);

    try {
      const res = await compressPdfFile(files[0]);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compress PDF.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.data as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
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
          setResult(null);
          setError(null);
        }}
        title="Select a PDF file to compress"
        description="Streamlines internal object streams and removes duplicate elements 100% locally."
      />

      {files.length > 0 && !result && (
        <div className="flex justify-end">
          <button
            onClick={handleCompress}
            disabled={isCompressing}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Optimizing PDF...
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4" /> Compress PDF
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {error}
        </div>
      )}

      {result && (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Optimization Complete</h3>
              <p className="text-xs text-muted-foreground">
                Document processed in browser memory with object stream packing.
              </p>
            </div>
          </div>

          {/* Size Comparison Card */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/40 border border-border rounded-xl text-center">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">Original</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {formatBytes(result.originalSize)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">Optimized</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {formatBytes(result.outputSize)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">Difference</span>
              <p
                className={`text-base font-bold mt-0.5 ${
                  result.ratio > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-500"
                }`}
              >
                {result.ratio > 0 ? `-${result.ratio}%` : "Already optimal"}
              </p>
            </div>
          </div>

          {result.isLarger && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                This document was already heavily optimized and compressed. Re-serializing added minimal structural bytes. We recommend keeping your original file.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Compressed PDF
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
