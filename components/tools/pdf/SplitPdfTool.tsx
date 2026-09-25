"use client";

import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { FileUploader } from "@/components/tools/FileUploader";
import {
  splitPdfByRanges,
  splitPdfEveryNPages,
  SplitOutput,
} from "@/lib/tools/pdf/split";
import { getPdfPageCount } from "@/lib/tools/pdf/merge";
import {
  Download,
  Loader2,
  FileArchive,
  CheckCircle2,
  RotateCcw,
  Scissors,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function SplitPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [splitMode, setSplitMode] = useState<"range" | "interval" | "all">("range");
  const [rangeInput, setRangeInput] = useState("1-2, 3-4");
  const [intervalPages, setIntervalPages] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputs, setOutputs] = useState<SplitOutput[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      getPdfPageCount(files[0])
        .then((count) => {
          setTotalPages(count);
          if (count > 2) {
            setRangeInput(`1-${Math.ceil(count / 2)}, ${Math.ceil(count / 2) + 1}-${count}`);
          } else {
            setRangeInput("1");
          }
        })
        .catch(() => setTotalPages(null));
    } else {
      setTotalPages(null);
      setOutputs([]);
    }
  }, [files]);

  const handleSplit = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      let results: SplitOutput[] = [];
      if (splitMode === "range") {
        const ranges = rangeInput.split(",").map((r) => r.trim()).filter(Boolean);
        results = await splitPdfByRanges(files[0], ranges);
      } else if (splitMode === "interval") {
        results = await splitPdfEveryNPages(files[0], intervalPages);
      } else if (splitMode === "all") {
        results = await splitPdfEveryNPages(files[0], 1);
      }

      setOutputs(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (output: SplitOutput) => {
    const blob = new Blob([output.data as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = output.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadZip = async () => {
    if (outputs.length === 0) return;
    const zip = new JSZip();
    outputs.forEach((out) => {
      zip.file(out.fileName, out.data);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${files[0].name.replace(/\.pdf$/i, "")}_split_pages.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setOutputs([]);
    setTotalPages(null);
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
          setOutputs([]);
          setError(null);
        }}
        title="Select a PDF document to split"
        description="Extract specific pages, page ranges, or separate all pages into individual files."
      />

      {totalPages !== null && (
        <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Document detected</span>
            <span>Total: <strong>{totalPages}</strong> {totalPages === 1 ? "page" : "pages"}</span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSplitMode("range")}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                splitMode === "range"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Ranges
            </button>
            <button
              onClick={() => setSplitMode("interval")}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                splitMode === "interval"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Every N Pages
            </button>
            <button
              onClick={() => setSplitMode("all")}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                splitMode === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Single Pages
            </button>
          </div>

          {/* Range Configuration */}
          {splitMode === "range" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Page ranges to extract (e.g., "1-2, 3-5, 8")
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="1-3, 5, 8-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Separate ranges or numbers with commas. Each range becomes a separate PDF file.
              </p>
            </div>
          )}

          {/* Interval Configuration */}
          {splitMode === "interval" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Split interval (pages per file)
              </label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={intervalPages}
                onChange={(e) => setIntervalPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Creates files with {intervalPages} pages each (approx{" "}
                {Math.ceil(totalPages / intervalPages)} output files).
              </p>
            </div>
          )}

          {/* All single pages info */}
          {splitMode === "all" && (
            <p className="text-xs text-muted-foreground">
              This will extract all {totalPages} pages into {totalPages} individual single-page PDF files.
            </p>
          )}

          {/* Split button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Splitting PDF...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" /> Split Document
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

      {/* Outputs List */}
      {outputs.length > 0 && (
        <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Generated {outputs.length} {outputs.length === 1 ? "File" : "Files"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download individual parts or save all as a ZIP archive.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZip}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <FileArchive className="w-4 h-4" /> Download ZIP
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {outputs.map((out, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl text-xs sm:text-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">{out.fileName}</p>
                  <span className="text-xs text-muted-foreground">
                    {out.pageCount} {out.pageCount === 1 ? "page" : "pages"} •{" "}
                    {formatBytes(out.data.byteLength)}
                  </span>
                </div>
                <button
                  onClick={() => handleDownloadSingle(out)}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
