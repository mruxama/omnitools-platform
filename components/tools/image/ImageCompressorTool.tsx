"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { compressImage, CompressedImageResult } from "@/lib/tools/image/compress";
import { BatchQueue } from "@/components/tools/BatchQueue";
import { BatchItem } from "@/lib/tools/batch";
import {
  Download,
  Loader2,
  FileDown,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function ImageCompressorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [targetFormat, setTargetFormat] = useState<"original" | "image/jpeg" | "image/webp" | "image/png">("original");
  const [isProcessing, setIsProcessing] = useState(false);
  const [singleResult, setSingleResult] = useState<CompressedImageResult | null>(null);
  const [batchItems, setBatchItems] = useState<BatchItem<File, Blob>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setSingleResult(null);
    setError(null);

    if (newFiles.length > 1) {
      setBatchItems(
        newFiles.map((file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          status: "pending",
          progress: 0,
        }))
      );
    } else {
      setBatchItems([]);
    }
  };

  const handleSingleCompress = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      const format = targetFormat === "original" ? undefined : targetFormat;
      const res = await compressImage(files[0], { quality, format });
      setSingleResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = () => {
    if (!singleResult) return;
    const url = URL.createObjectURL(singleResult.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setSingleResult(null);
    setBatchItems([]);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <FileUploader
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple={true}
        maxFiles={30}
        files={files}
        onFilesChange={handleFilesChange}
        title="Select one or multiple images to compress"
        description="Supports JPG, PNG, and WebP. Adjust quality slider for custom compression."
      />

      {files.length > 0 && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Compression Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quality Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>Quality Level</span>
                <span className="text-primary font-bold">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.95}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-primary mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Smaller size</span>
                <span>Best quality</span>
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Output Format</label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
              >
                <option value="original">Keep Original Format</option>
                <option value="image/webp">WebP (Most Efficient)</option>
                <option value="image/jpeg">JPG (Widely Compatible)</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
          </div>

          {files.length === 1 && !singleResult && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSingleCompress}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Compressing...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" /> Compress Image
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Single file result */}
      {singleResult && (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Image Compressed!</h3>
              <p className="text-xs text-muted-foreground">
                Optimized resolution: {singleResult.width} × {singleResult.height}px
              </p>
            </div>
          </div>

          {/* Size Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/40 border border-border rounded-xl text-center">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">Original</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {formatBytes(singleResult.originalSize)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">Compressed</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {formatBytes(singleResult.compressedSize)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-medium">Reduction</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {singleResult.percentageReduction > 0 ? `-${singleResult.percentageReduction}%` : "0%"}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="relative aspect-video max-h-64 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
            <img
              src={singleResult.dataUrl}
              alt="Compressed preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Download */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadSingle}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Compressed Image
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

      {/* Batch processing queue for multiple files */}
      {files.length > 1 && batchItems.length > 0 && (
        <BatchQueue
          items={batchItems}
          onItemsChange={setBatchItems}
          processor={async (file) => {
            const format = targetFormat === "original" ? undefined : targetFormat;
            const res = await compressImage(file, { quality, format });
            return { result: res.blob, outputSize: res.compressedSize };
          }}
          downloadFilenameGenerator={(item) => `compressed_${item.name}`}
          zipFilename="compressed_images.zip"
          title={`Batch Compression (${batchItems.length} Images)`}
          actionButtonLabel="Compress All Images"
        />
      )}
    </div>
  );
}
