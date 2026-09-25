"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, X, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  title?: string;
  description?: string;
  reorderable?: boolean;
}

export function FileUploader({
  accept = "*",
  multiple = false,
  maxFiles = 20,
  maxSizeMB = 100,
  files,
  onFilesChange,
  title = "Drop your files here",
  description = "or browse from your device",
  reorderable = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const valid: File[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (file.size > maxBytes) {
        setErrorMessage(`"${file.name}" exceeds the ${maxSizeMB}MB file size limit.`);
        continue;
      }
      valid.push(file);
    }

    if (multiple) {
      const combined = [...files, ...valid].slice(0, maxFiles);
      if (files.length + valid.length > maxFiles) {
        setErrorMessage(`Maximum of ${maxFiles} files allowed.`);
      }
      onFilesChange(combined);
    } else {
      if (valid.length > 0) {
        onFilesChange([valid[0]]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    if (!reorderable) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const copy = [...files];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onFilesChange(copy);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center ${
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border hover:border-primary/50 hover:bg-muted/30 bg-card"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) validateAndAddFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-foreground">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border">
          <span>Max size: {maxSizeMB}MB</span>
          <span>•</span>
          <span>100% In-Browser Privacy</span>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              {files.length} {files.length === 1 ? "file" : "files"} selected (
              {formatBytes(files.reduce((acc, f) => acc + f.size, 0))})
            </span>
            <button
              onClick={() => onFilesChange([])}
              className="text-destructive hover:underline font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-xl shadow-sm text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                      {file.name}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {reorderable && files.length > 1 && (
                    <>
                      <button
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                        className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors ml-1"
                    title="Remove file"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
