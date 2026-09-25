"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import {
  Play,
  RotateCcw,
  Download,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { BatchItem, processBatch } from "@/lib/tools/batch";
export type { BatchItem };

interface BatchQueueProps<TInput, TOutput> {
  items: BatchItem<TInput, TOutput>[];
  onItemsChange: (items: BatchItem<TInput, TOutput>[]) => void;
  processor: (file: TInput, item: BatchItem<TInput, TOutput>) => Promise<{ result: TOutput; outputSize?: number }>;
  downloadFilenameGenerator: (item: BatchItem<TInput, TOutput>) => string;
  zipFilename?: string;
  title?: string;
  actionButtonLabel?: string;
}

export function BatchQueue<TInput, TOutput extends Blob | Uint8Array | string>({
  items,
  onItemsChange,
  processor,
  downloadFilenameGenerator,
  zipFilename = "processed_files.zip",
  title = "Batch Processing Queue",
  actionButtonLabel = "Start Processing",
}: BatchQueueProps<TInput, TOutput>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const completedCount = items.filter((i) => i.status === "success").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  const handleStart = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const updatedQueue = await processBatch(
      items,
      processor,
      {
        concurrency: 2,
        onItemUpdate: (updatedItem) => {
          onItemsChange(items.map((i) => (i.id === updatedItem.id ? { ...updatedItem } : i)));
        },
      }
    );

    onItemsChange(updatedQueue);
    setIsProcessing(false);
  };

  const handleDownloadSingle = (item: BatchItem<TInput, TOutput>) => {
    if (!item.result) return;
    const filename = downloadFilenameGenerator(item);
    const blob =
      item.result instanceof Blob
        ? item.result
        : typeof item.result === "string"
        ? new Blob([item.result], { type: "text/plain" })
        : new Blob([item.result as any]);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadZip = async () => {
    const successfulItems = items.filter((i) => i.status === "success" && i.result);
    if (successfulItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const item of successfulItems) {
        const filename = downloadFilenameGenerator(item);
        zip.file(filename, item.result as any);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("ZIP creation error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleRemove = (id: string) => {
    onItemsChange(items.filter((i) => i.id !== id));
  };

  const handleClear = () => {
    onItemsChange([]);
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-4 p-5 bg-card border border-border rounded-2xl shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="font-semibold text-base text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount} of {items.length} completed • {errorCount} errors
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleStart}
            disabled={isProcessing || pendingCount === 0}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-primary-foreground" /> {actionButtonLabel}
              </>
            )}
          </button>

          {completedCount > 0 && (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              {isZipping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileArchive className="w-4 h-4 text-primary" />
              )}
              <span>Download ZIP ({completedCount})</span>
            </button>
          )}

          <button
            onClick={handleClear}
            disabled={isProcessing}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
            title="Clear queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue items list */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl text-xs sm:text-sm"
          >
            <div className="min-w-0 flex-1 mr-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">{item.name}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatBytes(item.size)}
                  {item.outputSize !== undefined && (
                    <> → <strong className="text-foreground">{formatBytes(item.outputSize)}</strong></>
                  )}
                </span>
              </div>

              {/* Status and error */}
              <div className="mt-1 flex items-center gap-2 text-xs">
                {item.status === "pending" && (
                  <span className="text-muted-foreground">Queued</span>
                )}
                {item.status === "processing" && (
                  <span className="text-primary flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                  </span>
                )}
                {item.status === "success" && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for download
                  </span>
                )}
                {item.status === "error" && (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {item.error || "Failed"}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {item.status === "success" && (
                <button
                  onClick={() => handleDownloadSingle(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
              <button
                onClick={() => handleRemove(item.id)}
                disabled={isProcessing}
                className="p-1 rounded text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
