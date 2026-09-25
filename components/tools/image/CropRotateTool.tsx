"use client";

import React, { useState, useEffect } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { transformImage } from "@/lib/tools/image/cropRotate";
import {
  Download,
  Loader2,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  CheckCircle2,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function CropRotateTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    sizeBytes: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
      setRotationDegrees(0);
      setFlipH(false);
      setFlipV(false);
      setResult(null);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageUrl(null);
      setResult(null);
    }
  }, [files]);

  const handleRotate90 = (direction: "cw" | "ccw") => {
    setRotationDegrees((prev) => (prev + (direction === "cw" ? 90 : -90)) % 360);
  };

  const handleApply = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      const res = await transformImage(files[0], {
        rotationDegrees,
        flipHorizontal: flipH,
        flipVertical: flipV,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transformation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edited_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setImageUrl(null);
    setResult(null);
    setRotationDegrees(0);
    setFlipH(false);
    setFlipV(false);
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
        title="Select an image to rotate, flip, or edit"
        description="Rotate 90°, flip horizontally or vertically, or set arbitrary angle."
      />

      {files.length > 0 && imageUrl && !result && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-5">
          {/* Live Preview Canvas / Box */}
          <div className="relative aspect-video max-h-72 rounded-xl overflow-hidden bg-background border border-border flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt="Live transform preview"
              style={{
                transform: `rotate(${rotationDegrees}deg) scaleX(${flipH ? -1 : 1}) scaleY(${
                  flipV ? -1 : 1
                })`,
                transition: "transform 0.15s ease-out",
              }}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Transform Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotate90("ccw")}
                className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Rotate 90° counter-clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5" /> -90°
              </button>
              <button
                type="button"
                onClick={() => handleRotate90("cw")}
                className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Rotate 90° clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" /> +90°
              </button>
              <button
                type="button"
                onClick={() => setFlipH(!flipH)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  flipH
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-card border-border hover:bg-muted"
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
              </button>
              <button
                type="button"
                onClick={() => setFlipV(!flipV)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  flipV
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-card border-border hover:bg-muted"
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" /> Flip V
              </button>
            </div>

            <button
              onClick={() => {
                setRotationDegrees(0);
                setFlipH(false);
                setFlipV(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              Reset view
            </button>
          </div>

          {/* Fine angle slider */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex justify-between text-xs font-semibold text-foreground">
              <span>Fine Rotation Angle</span>
              <span className="font-mono">{rotationDegrees}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={rotationDegrees}
              onChange={(e) => setRotationDegrees(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Rendering...
                </>
              ) : (
                <>
                  <Crop className="w-4 h-4" /> Save Transformation
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
              <h3 className="text-lg font-bold text-foreground">Image Transformed!</h3>
              <p className="text-xs text-muted-foreground">
                Output: {result.width} × {result.height}px • {formatBytes(result.sizeBytes)}
              </p>
            </div>
          </div>

          <div className="relative aspect-video max-h-64 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
            <img
              src={result.dataUrl}
              alt="Transformed result"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Transformed Image
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
