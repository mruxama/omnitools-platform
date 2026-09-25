"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { addWatermarkToPdf, WatermarkOptions } from "@/lib/tools/pdf/watermark";
import {
  Download,
  Loader2,
  Stamp,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function WatermarkPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<WatermarkOptions>({
    text: "CONFIDENTIAL",
    opacity: 0.3,
    rotationAngle: 45,
    fontSize: 48,
    colorHex: "#6b7280",
    allPages: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedData, setWatermarkedData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (files.length === 0 || !options.text.trim()) return;
    setError(null);
    setIsProcessing(true);

    try {
      const data = await addWatermarkToPdf(files[0], options);
      setWatermarkedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stamp watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedData) return;
    const blob = new Blob([watermarkedData as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `watermarked_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setWatermarkedData(null);
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
          setWatermarkedData(null);
          setError(null);
        }}
        title="Select a PDF to watermark"
        description="Stamp custom text overlays onto pages with angle and transparency control."
      />

      {files.length > 0 && !watermarkedData && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Watermark Customization
          </h4>

          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Watermark Text</label>
            <input
              type="text"
              value={options.text}
              onChange={(e) => setOptions({ ...options, text: e.target.value })}
              placeholder="CONFIDENTIAL, DRAFT, SAMPLE..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-bold tracking-wider uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rotation Angle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Angle</label>
              <select
                value={options.rotationAngle}
                onChange={(e) =>
                  setOptions({ ...options, rotationAngle: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl"
              >
                <option value={45}>45° Diagonal Up</option>
                <option value={-45}>-45° Diagonal Down</option>
                <option value={0}>0° Horizontal</option>
              </select>
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
                <option value={32}>32 pt (Small)</option>
                <option value={48}>48 pt (Medium)</option>
                <option value={64}>64 pt (Large)</option>
                <option value={80}>80 pt (Huge)</option>
              </select>
            </div>

            {/* Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>Opacity</span>
                <span>{Math.round(options.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.8}
                step={0.05}
                value={options.opacity}
                onChange={(e) =>
                  setOptions({ ...options, opacity: parseFloat(e.target.value) })
                }
                className="w-full accent-primary mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApply}
              disabled={isProcessing || !options.text.trim()}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Stamping Watermark...
                </>
              ) : (
                <>
                  <Stamp className="w-4 h-4" /> Apply Watermark
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

      {watermarkedData && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Watermark Stamped Successfully!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              File size: {formatBytes(watermarkedData.byteLength)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Watermarked PDF
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
