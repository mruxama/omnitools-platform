"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import {
  removeImageBackground,
  BackgroundRemovalOptions,
} from "@/lib/tools/image/backgroundRemoval";
import {
  Download,
  Loader2,
  Eraser,
  CheckCircle2,
  RotateCcw,
  Pipette,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function BackgroundRemoverTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [tolerance, setTolerance] = useState(25);
  const [feather, setFeather] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    sizeBytes: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      const res = await removeImageBackground(files[0], {
        tolerance,
        feather,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    const base = files[0].name.replace(/\.[^/.]+$/, "");
    a.download = `${base}_transparent.png`;
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
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple={false}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setResult(null);
          setError(null);
        }}
        title="Select an image to remove background"
        description="Creates transparent PNGs with smart edge detection. Runs 100% in your browser."
      />

      {files.length > 0 && !result && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Cutout Tuning
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Tolerance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>Color Tolerance</span>
                <span className="font-mono">{tolerance}</span>
              </div>
              <input
                type="range"
                min={5}
                max={90}
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                className="w-full accent-primary mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Strict (Exact color)</span>
                <span>Broad</span>
              </div>
            </div>

            {/* Edge Feather Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>Edge Smoothing (Feather)</span>
                <span className="font-mono">{feather}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={6}
                value={feather}
                onChange={(e) => setFeather(parseInt(e.target.value))}
                className="w-full accent-primary mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Sharp edge</span>
                <span>Soft edge</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Isolating Subject...
                </>
              ) : (
                <>
                  <Eraser className="w-4 h-4" /> Remove Background
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

      {result && (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Background Removed!</h3>
              <p className="text-xs text-muted-foreground">
                Transparent PNG ready • {result.width} × {result.height}px ({formatBytes(result.sizeBytes)})
              </p>
            </div>
          </div>

          {/* Checkerboard Pattern Background for Alpha Visuals */}
          <div
            className="relative aspect-video max-h-72 rounded-xl overflow-hidden border border-border flex items-center justify-center p-4"
            style={{
              backgroundImage: `linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          >
            <img
              src={result.dataUrl}
              alt="Transparent subject cutout"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Transparent PNG
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
