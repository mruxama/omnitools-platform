"use client";

import React, { useState, useEffect } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import {
  resizeImage,
  RESIZE_PRESETS,
  ResizedImageResult,
} from "@/lib/tools/image/resize";
import {
  Download,
  Loader2,
  Scaling,
  Lock,
  Unlock,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function ImageResizerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [lockAspect, setLockAspect] = useState(true);
  const [fitMode, setFitMode] = useState<"contain" | "cover" | "stretch">("contain");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ResizedImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      const img = new Image();
      const url = URL.createObjectURL(files[0]);
      img.onload = () => {
        URL.revokeObjectURL(url);
        setOriginalWidth(img.naturalWidth);
        setOriginalHeight(img.naturalHeight);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
      img.src = url;
    } else {
      setOriginalWidth(0);
      setOriginalHeight(0);
      setResult(null);
    }
  }, [files]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const applyPercentage = (pct: number) => {
    if (originalWidth === 0) return;
    const w = Math.round((originalWidth * pct) / 100);
    const h = Math.round((originalHeight * pct) / 100);
    setWidth(w);
    setHeight(h);
  };

  const applyPreset = (preset: (typeof RESIZE_PRESETS)[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleResize = async () => {
    if (files.length === 0 || width <= 0 || height <= 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      const res = await resizeImage(files[0], { width, height, fitMode });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resize failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resized_${width}x${height}_${files[0].name}`;
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
        title="Select an image to resize"
        description="Change dimensions by pixels, percentages, or select popular social media presets."
      />

      {files.length > 0 && originalWidth > 0 && !result && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
            <span>Original resolution: <strong>{originalWidth} × {originalHeight}px</strong></span>
            <span>Target: <strong>{width} × {height}px</strong></span>
          </div>

          {/* Dimension Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Width (px)</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={width}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Height (px)</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={height}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Aspect Ratio Lock & Fit Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setLockAspect(!lockAspect)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                lockAspect
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>Lock Aspect Ratio</span>
            </button>

            {/* Percentage shortcuts */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground text-[11px] mr-1">Scale:</span>
              {[25, 50, 75, 150, 200].map((pct) => (
                <button
                  key={pct}
                  onClick={() => applyPercentage(pct)}
                  className="px-2 py-1 rounded-lg bg-card border border-border hover:border-primary/50 text-foreground font-mono text-xs"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Presets dropdown */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-foreground">
              Social Media & Web Dimension Presets
            </label>
            <select
              onChange={(e) => {
                const found = RESIZE_PRESETS.find((p) => p.name === e.target.value);
                if (found) applyPreset(found);
              }}
              defaultValue=""
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
            >
              <option value="" disabled>Select a preset...</option>
              {RESIZE_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.width} × {p.height}px)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleResize}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Resizing...
                </>
              ) : (
                <>
                  <Scaling className="w-4 h-4" /> Resize Image
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
              <h3 className="text-lg font-bold text-foreground">Image Resized!</h3>
              <p className="text-xs text-muted-foreground">
                Output: {result.width} × {result.height}px • {formatBytes(result.sizeBytes)}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="relative aspect-video max-h-64 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
            <img
              src={result.dataUrl}
              alt="Resized preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Resized Image
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
