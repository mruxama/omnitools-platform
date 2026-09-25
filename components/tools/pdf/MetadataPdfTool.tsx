"use client";

import React, { useState, useEffect } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import {
  extractPdfMetadata,
  updatePdfMetadata,
  PdfMetadataInfo,
} from "@/lib/tools/pdf/metadata";
import {
  Download,
  Loader2,
  Info,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Save,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function MetadataPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<PdfMetadataInfo | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedData, setSavedData] = useState<Uint8Array | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      setIsReading(true);
      setError(null);
      extractPdfMetadata(files[0])
        .then((meta) => {
          setMetadata(meta);
          setSavedData(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to read PDF metadata.");
        })
        .finally(() => setIsReading(false));
    } else {
      setMetadata(null);
      setSavedData(null);
    }
  }, [files]);

  const handleUpdate = async (stripAll = false) => {
    if (files.length === 0 || !metadata) return;
    setError(null);
    setIsSaving(true);

    try {
      const data = await updatePdfMetadata(files[0], metadata, stripAll);
      setSavedData(data);
      setStatusMessage(
        stripAll ? "All metadata stripped! Document is sanitized." : "Metadata updated successfully!"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update metadata.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!savedData) return;
    const blob = new Blob([savedData as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
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
    setSavedData(null);
    setError(null);
    setStatusMessage(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <FileUploader
        accept=".pdf,application/pdf"
        multiple={false}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setSavedData(null);
          setError(null);
        }}
        title="Select a PDF to view or edit metadata"
        description="Inspect hidden document information and remove identifiers before sharing."
      />

      {isReading && (
        <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Extracting PDF metadata...</span>
        </div>
      )}

      {metadata && !savedData && (
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
            <span>
              Document has <strong>{metadata.pageCount}</strong> pages ({formatBytes(metadata.fileSizeBytes)})
            </span>
            <button
              onClick={() => handleUpdate(true)}
              disabled={isSaving}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Strip All Metadata
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Document Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Author</label>
              <input
                type="text"
                value={metadata.author}
                onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Subject</label>
              <input
                type="text"
                value={metadata.subject}
                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Keywords</label>
              <input
                type="text"
                value={metadata.keywords}
                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                placeholder="Comma separated"
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Creator / Application</label>
              <input
                type="text"
                value={metadata.creator}
                disabled
                className="w-full px-3 py-1.5 text-xs bg-muted border border-border rounded-lg opacity-80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Producer / Library</label>
              <input
                type="text"
                value={metadata.producer}
                disabled
                className="w-full px-3 py-1.5 text-xs bg-muted border border-border rounded-lg opacity-80"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              onClick={() => handleUpdate(false)}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Metadata
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

      {savedData && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {statusMessage || "PDF Saved Successfully!"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Clean file size: {formatBytes(savedData.byteLength)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download PDF
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
