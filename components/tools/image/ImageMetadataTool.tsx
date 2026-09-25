"use client";

import React, { useState, useEffect } from "react";
import exifr from "exifr";
import { FileUploader } from "@/components/tools/FileUploader";
import {
  Download,
  Loader2,
  Camera,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Layers,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ImageMetaState {
  width: number;
  height: number;
  fileSize: number;
  format: string;
  megapixels: string;
  make?: string;
  model?: string;
  lens?: string;
  iso?: number;
  fNumber?: number;
  exposureTime?: string;
  dateTimeOriginal?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export function ImageMetadataTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<ImageMetaState | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isStripping, setIsStripping] = useState(false);
  const [cleanBlob, setCleanBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      const file = files[0];
      setIsReading(true);
      setError(null);
      setCleanBlob(null);

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = async () => {
        URL.revokeObjectURL(url);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const mp = ((w * h) / 1000000).toFixed(2);

        try {
          const exif = await exifr.parse(file, {
            pick: [
              "Make",
              "Model",
              "LensModel",
              "ISO",
              "FNumber",
              "ExposureTime",
              "DateTimeOriginal",
              "latitude",
              "longitude",
            ],
          });

          setMetadata({
            width: w,
            height: h,
            fileSize: file.size,
            format: file.type || "image/jpeg",
            megapixels: mp,
            make: exif?.Make,
            model: exif?.Model,
            lens: exif?.LensModel,
            iso: exif?.ISO,
            fNumber: exif?.FNumber,
            exposureTime: exif?.ExposureTime ? `1/${Math.round(1 / exif.ExposureTime)}s` : undefined,
            dateTimeOriginal: exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toLocaleString() : undefined,
            gpsLatitude: exif?.latitude,
            gpsLongitude: exif?.longitude,
          });
        } catch {
          // If no EXIF data or parsing error, fallback to basic image metrics
          setMetadata({
            width: w,
            height: h,
            fileSize: file.size,
            format: file.type,
            megapixels: mp,
          });
        } finally {
          setIsReading(false);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("Failed to parse image file.");
        setIsReading(false);
      };

      img.src = url;
    } else {
      setMetadata(null);
      setCleanBlob(null);
    }
  }, [files]);

  const handleStripExif = async () => {
    if (files.length === 0) return;
    setIsStripping(true);

    try {
      const img = new Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) setCleanBlob(blob);
        setIsStripping(false);
      }, files[0].type || "image/jpeg", 0.95);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to strip metadata.");
      setIsStripping(false);
    }
  };

  const handleDownloadClean = () => {
    if (!cleanBlob) return;
    const url = URL.createObjectURL(cleanBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sanitized_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setMetadata(null);
    setCleanBlob(null);
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
          setCleanBlob(null);
          setError(null);
        }}
        title="Select a photo to view EXIF metadata"
        description="Inspect camera models, exposure settings, location, and dates."
      />

      {isReading && (
        <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Reading EXIF and technical tags...</span>
        </div>
      )}

      {metadata && !cleanBlob && (
        <div className="p-6 bg-muted/40 border border-border rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> Image Information & EXIF
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {metadata.width} × {metadata.height}px • {metadata.megapixels} Megapixels • {formatBytes(metadata.fileSize)}
              </p>
            </div>

            <button
              onClick={handleStripExif}
              disabled={isStripping}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
            >
              {isStripping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Stripping...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Strip All EXIF & Save
                </>
              )}
            </button>
          </div>

          {/* Categorized Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider block">
                Camera & Lens
              </span>
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">Make:</span>
                <span className="font-medium text-foreground">{metadata.make || "Not detected"}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium text-foreground">{metadata.model || "Not detected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lens:</span>
                <span className="font-medium text-foreground">{metadata.lens || "Not detected"}</span>
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider block">
                Exposure & Capture
              </span>
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">ISO:</span>
                <span className="font-medium text-foreground">{metadata.iso || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">Aperture:</span>
                <span className="font-medium text-foreground">
                  {metadata.fNumber ? `f/${metadata.fNumber}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shutter Speed:</span>
                <span className="font-medium text-foreground">{metadata.exposureTime || "—"}</span>
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider block">
                Date & Security
              </span>
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">Date Taken:</span>
                <span className="font-medium text-foreground">{metadata.dateTimeOriginal || "Not embedded"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GPS Coordinates:</span>
                <span className="font-medium text-foreground">
                  {metadata.gpsLatitude && metadata.gpsLongitude
                    ? `${metadata.gpsLatitude.toFixed(4)}, ${metadata.gpsLongitude.toFixed(4)}`
                    : "None embedded (Clean)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {error}
        </div>
      )}

      {cleanBlob && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Metadata Stripped Successfully!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Sanitized size: {formatBytes(cleanBlob.size)} • Location and camera identifiers removed
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadClean}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Sanitized Photo
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
