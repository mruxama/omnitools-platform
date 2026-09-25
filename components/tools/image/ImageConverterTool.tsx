"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { convertImageFormat } from "@/lib/tools/image/convert";
import { BatchQueue } from "@/components/tools/BatchQueue";
import { BatchItem } from "@/lib/tools/batch";
import {
  Download,
  Loader2,
  RefreshCw,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function ImageConverterTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/webp");
  const [quality, setQuality] = useState(0.92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [singleResult, setSingleResult] = useState<{ blob: Blob; dataUrl: string; sizeBytes: number } | null>(null);
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

  const handleSingleConvert = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      const res = await convertImageFormat(files[0], {
        targetFormat,
        quality,
      });
      setSingleResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTargetExt = () => {
    if (targetFormat === "image/jpeg") return "jpg";
    if (targetFormat === "image/png") return "png";
    return "webp";
  };

  const handleDownloadSingle = () => {
    if (!singleResult) return;
    const url = URL.createObjectURL(singleResult.blob);
    const a = document.createElement("a");
    a.href = url;
    const base = files[0].name.replace(/\.[^/.]+$/, "");
    a.download = `${base}.${getTargetExt()}`;
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
        title="Select images to convert format"
        description="Convert single or multiple images between JPG, PNG, and WebP."
      />

      {files.length > 0 && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Target Format & Quality
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Convert to Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetFormat("image/webp")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    targetFormat === "image/webp"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  WebP
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFormat("image/jpeg")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    targetFormat === "image/jpeg"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  JPG
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFormat("image/png")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    targetFormat === "image/png"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  PNG
                </button>
              </div>
            </div>

            {targetFormat !== "image/png" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-primary mt-2"
                />
              </div>
            )}
          </div>

          {files.length === 1 && !singleResult && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSingleConvert}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Convert to {getTargetExt().toUpperCase()}
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

      {/* Single Output */}
      {singleResult && (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Converted to {getTargetExt().toUpperCase()}!</h3>
              <p className="text-xs text-muted-foreground">
                Output size: {formatBytes(singleResult.sizeBytes)}
              </p>
            </div>
          </div>

          <div className="relative aspect-video max-h-64 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
            <img
              src={singleResult.dataUrl}
              alt="Converted preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadSingle}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download {getTargetExt().toUpperCase()}
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

      {/* Batch Processing */}
      {files.length > 1 && batchItems.length > 0 && (
        <BatchQueue
          items={batchItems}
          onItemsChange={setBatchItems}
          processor={async (file) => {
            const res = await convertImageFormat(file, { targetFormat, quality });
            return { result: res.blob, outputSize: res.sizeBytes };
          }}
          downloadFilenameGenerator={(item) =>
            `${item.name.replace(/\.[^/.]+$/, "")}.${getTargetExt()}`
          }
          zipFilename={`converted_${getTargetExt()}_images.zip`}
          title={`Batch Convert (${batchItems.length} Files)`}
          actionButtonLabel={`Convert All to ${getTargetExt().toUpperCase()}`}
        />
      )}
    </div>
  );
}
