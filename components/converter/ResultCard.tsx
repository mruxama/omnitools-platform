"use client";

import React from "react";
import { ConversionResult } from "@/lib/converter/types";
import { Download, CheckCircle2, RotateCcw, FileText, ArrowRight } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ResultCardProps {
  result: ConversionResult;
  onReset: () => void;
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const isImage = result.mimeType.startsWith("image/");
  const isAudio = result.mimeType.startsWith("audio/");
  const sizeDiff = result.outputSize - result.originalSize;
  const isSmaller = sizeDiff < 0;
  const percentage = Math.abs(Math.round((sizeDiff / result.originalSize) * 100));

  return (
    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Conversion Complete!</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Processed in {result.durationMs}ms via {result.provider}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Convert another</span>
        </button>
      </div>

      {/* Preview if image or audio */}
      {isImage && result.dataUrl && (
        <div className="flex justify-center p-4 bg-muted/20 border border-border rounded-xl">
          <img
            src={result.dataUrl}
            alt={result.fileName}
            className="max-h-64 max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>
      )}

      {isAudio && (
        <div className="p-4 bg-muted/20 border border-border rounded-xl">
          <audio
            controls
            src={URL.createObjectURL(result.blob)}
            className="w-full"
          />
        </div>
      )}

      {/* File Info & Size metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">File Details</span>
          <p className="font-semibold text-sm text-foreground truncate">{result.fileName}</p>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
            {formatBytes(result.originalSize)} <ArrowRight className="w-3 h-3" /> {formatBytes(result.outputSize)}
          </span>
        </div>

        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Size Change</span>
          <p className={`font-bold text-lg font-mono ${isSmaller ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
            {isSmaller ? `-${percentage}% smaller` : `+${percentage}%`}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {isSmaller ? "Saved storage space" : "Uncompressed or higher quality output"}
          </span>
        </div>
      </div>

      {/* Download Action */}
      <div className="pt-2">
        <button
          onClick={handleDownload}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Download className="w-4 h-4" />
          <span>Download {result.fileName}</span>
        </button>
      </div>
    </div>
  );
}
