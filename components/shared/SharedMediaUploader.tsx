"use client";

import React, { useRef } from "react";
import { UploadCloud, Folder, Plus, Trash2, ShieldCheck, FileCheck } from "lucide-react";
import { formatBytes } from "@/lib/shared/exportHelper";

interface SharedMediaUploaderProps {
  title?: string;
  description?: string;
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
  fileCount?: number;
  totalBytes?: number;
  onClearAll?: () => void;
}

export const SharedMediaUploader: React.FC<SharedMediaUploaderProps> = ({
  title = "Drop files here to start",
  description = "Support for single or batch processing • 100% In-Browser Privacy",
  accept,
  multiple = true,
  onFilesSelected,
  isLoading = false,
  fileCount = 0,
  totalBytes = 0,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isLoading
            ? "border-muted bg-muted/20 cursor-not-allowed opacity-70"
            : "border-primary/30 hover:border-primary bg-card/50 hover:bg-card hover:shadow-lg shadow-sm"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          // @ts-ignore
          directory=""
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner">
            <UploadCloud className="w-8 h-8 animate-bounce-short" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pointer-events-auto">
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Browse Files</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current?.click();
              }}
              className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Folder className="w-4 h-4 text-primary" />
              <span>Select Folder</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Files processed strictly on your device. Zero cloud uploads.</span>
          </div>
        </div>
      </div>

      {/* Top Batch Summary Bar if files exist */}
      {fileCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card border border-border rounded-2xl shadow-sm text-sm">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <FileCheck className="w-4 h-4 text-primary" />
            <span>
              {fileCount} {fileCount === 1 ? "file" : "files"} selected ({formatBytes(totalBytes)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add More
            </button>
            {onClearAll && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
