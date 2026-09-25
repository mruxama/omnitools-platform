"use client";

import React, { useState, useEffect } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { organizePdfPages, PageAction } from "@/lib/tools/pdf/organize";
import { getPdfPageCount } from "@/lib/tools/pdf/merge";
import {
  Download,
  Loader2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Copy,
  Trash2,
  Grid,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface PageTile {
  id: string;
  originalIndex: number;
  rotation: number;
}

export function OrganizePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageTile[]>([]);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizedData, setOrganizedData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      getPdfPageCount(files[0])
        .then((count) => {
          const initialTiles: PageTile[] = Array.from({ length: count }, (_, i) => ({
            id: `page-${i}-${Date.now()}`,
            originalIndex: i,
            rotation: 0,
          }));
          setPages(initialTiles);
        })
        .catch(() => setPages([]));
    } else {
      setPages([]);
      setOrganizedData(null);
    }
  }, [files]);

  const movePage = (index: number, direction: "left" | "right") => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= pages.length) return;
    const copy = [...pages];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setPages(copy);
  };

  const rotatePage = (index: number) => {
    const copy = [...pages];
    copy[index].rotation = (copy[index].rotation + 90) % 360;
    setPages(copy);
  };

  const duplicatePage = (index: number) => {
    const copy = [...pages];
    const item = copy[index];
    copy.splice(index + 1, 0, {
      ...item,
      id: `page-${item.originalIndex}-${Date.now()}-${Math.random()}`,
    });
    setPages(copy);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setError("A PDF must contain at least 1 page.");
      return;
    }
    const copy = pages.filter((_, i) => i !== index);
    setPages(copy);
  };

  const handleSave = async () => {
    if (files.length === 0 || pages.length === 0) return;
    setError(null);
    setIsOrganizing(true);

    try {
      const pageActions: PageAction[] = pages.map((p) => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation,
      }));

      const data = await organizePdfPages(files[0], pageActions);
      setOrganizedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorganize PDF.");
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleDownload = () => {
    if (!organizedData) return;
    const blob = new Blob([organizedData as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organized_${files[0].name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setFiles([]);
    setPages([]);
    setOrganizedData(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <FileUploader
        accept=".pdf,application/pdf"
        multiple={false}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setOrganizedData(null);
          setError(null);
        }}
        title="Select a PDF to organize"
        description="Reorder, rotate, duplicate, or delete pages visually with instant export."
      />

      {pages.length > 0 && !organizedData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Grid className="w-4 h-4 text-primary" /> {pages.length} Pages in Document
              </h3>
              <p className="text-xs text-muted-foreground">
                Use arrows to move pages, rotate individual sheets, or delete unwanted pages.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isOrganizing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isOrganizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving PDF...
                </>
              ) : (
                <>Save Reorganized PDF</>
              )}
            </button>
          </div>

          {/* Grid of pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                className="relative p-3 bg-muted/40 border border-border rounded-xl space-y-3 flex flex-col justify-between"
              >
                {/* Page card preview box */}
                <div className="aspect-[3/4] bg-card border border-border/80 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
                  <div
                    className="flex flex-col items-center justify-center transition-transform duration-200"
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                  >
                    <span className="text-2xl font-black text-foreground/40">
                      {p.originalIndex + 1}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-1">Page</span>
                  </div>
                  {p.rotation > 0 && (
                    <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {p.rotation}°
                    </span>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 text-[10px] font-medium text-muted-foreground">
                    Pos #{idx + 1}
                  </div>
                </div>

                {/* Page Action Toolbar */}
                <div className="flex items-center justify-between gap-1 text-muted-foreground pt-1 border-t border-border/60">
                  <button
                    onClick={() => movePage(idx, "left")}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-card hover:text-foreground disabled:opacity-20"
                    title="Move earlier"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => rotatePage(idx)}
                    className="p-1 rounded hover:bg-card hover:text-primary"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicatePage(idx)}
                    className="p-1 rounded hover:bg-card hover:text-foreground"
                    title="Duplicate page"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePage(idx)}
                    className="p-1 rounded hover:bg-card hover:text-destructive"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => movePage(idx, "right")}
                    disabled={idx === pages.length - 1}
                    className="p-1 rounded hover:bg-card hover:text-foreground disabled:opacity-20"
                    title="Move later"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
          {error}
        </div>
      )}

      {organizedData && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4 text-center animate-in fade-in duration-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Reorganized PDF Ready!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Final page count: {pages.length} • Size: {formatBytes(organizedData.byteLength)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Reorganized PDF
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
