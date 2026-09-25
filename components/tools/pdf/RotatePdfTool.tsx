"use client";

import React, { useState, useEffect } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { rotatePdfPages } from "@/lib/tools/pdf/rotate";
import { getPdfPageCount } from "@/lib/tools/pdf/merge";
import { parsePageRange } from "@/lib/tools/pdf/split";
import {
  Download,
  Loader2,
  RotateCw,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function RotatePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [targetType, setTargetType] = useState<"all" | "custom">("all");
  const [customPagesInput, setCustomPagesInput] = useState("1");
  const [isRotating, setIsRotating] = useState(false);
  const [rotatedData, setRotatedData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      getPdfPageCount(files[0])
        .then((count) => {
          setTotalPages(count);
          setCustomPagesInput(`1-${count}`);
        })
        .catch(() => setTotalPages(null));
    } else {
      setTotalPages(null);
      setRotatedData(null);
    }
  }, [files]);

  const handleRotate = async () => {
    if (files.length === 0 || totalPages === null) return;
    setError(null);
    setIsRotating(true);

    try {
      let target: "all" | number[] = "all";
      if (targetType === "custom") {
        target = parsePageRange(customPagesInput, totalPages);
        if (target.length === 0) throw new Error("No valid page numbers provided.");
      }

      const data = await rotatePdfPages(files[0], rotationAngle, target);
      setRotatedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rotate PDF pages.");
    } finally {
      setIsRotating(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedData) return;
    const blob = new Blob([rotatedData as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rotated_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setRotatedData(null);
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
          setRotatedData(null);
          setError(null);
        }}
        title="Select a PDF to rotate"
        description="Permanently change orientation of all or specific pages."
      />

      {files.length > 0 && totalPages !== null && !rotatedData && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Document Info</span>
            <span>Total: <strong>{totalPages}</strong> {totalPages === 1 ? "page" : "pages"}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Rotation Angle</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRotationAngle(90)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                  rotationAngle === 90
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted"
                }`}
              >
                90° Clockwise
              </button>
              <button
                type="button"
                onClick={() => setRotationAngle(180)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                  rotationAngle === 180
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted"
                }`}
              >
                180° Flip
              </button>
              <button
                type="button"
                onClick={() => setRotationAngle(270)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                  rotationAngle === 270
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted"
                }`}
              >
                270° (90° Counter-CW)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Pages to Rotate</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("all")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                  targetType === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted"
                }`}
              >
                All Pages
              </button>
              <button
                type="button"
                onClick={() => setTargetType("custom")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                  targetType === "custom"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted"
                }`}
              >
                Specific Pages
              </button>
            </div>

            {targetType === "custom" && (
              <div className="pt-2">
                <input
                  type="text"
                  value={customPagesInput}
                  onChange={(e) => setCustomPagesInput(e.target.value)}
                  placeholder="e.g. 1, 3-5"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRotate}
              disabled={isRotating}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isRotating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Rotating Pages...
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" /> Apply Rotation
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

      {rotatedData && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">PDF Rotated Successfully!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              File size: {formatBytes(rotatedData.byteLength)} • Permanent rotation applied
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Rotated PDF
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
