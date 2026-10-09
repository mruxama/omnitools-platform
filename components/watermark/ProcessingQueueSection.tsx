"use client";

import React from "react";
import { ProcessingJob, ExportOptions } from "@/lib/watermark/types";
import { formatBytes } from "@/lib/utils";
import JSZip from "jszip";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Archive,
  FileCheck,
  Film,
  Image as ImageIcon,
} from "lucide-react";

interface ProcessingQueueSectionProps {
  jobs: ProcessingJob[];
  isProcessing: boolean;
  exportOptions: ExportOptions;
  mediaCount?: number;
  activeMediaName?: string;
  activeMediaType?: "image" | "video";
  isDownloadingCurrent?: boolean;
  onDownloadCurrent?: () => void;
  onCancel: () => void;
  onRetryFailed: () => void;
  onStartProcessing: () => void;
}

export function ProcessingQueueSection({
  jobs,
  isProcessing,
  exportOptions,
  mediaCount = 0,
  activeMediaName,
  activeMediaType,
  isDownloadingCurrent = false,
  onDownloadCurrent,
  onCancel,
  onRetryFailed,
  onStartProcessing,
}: ProcessingQueueSectionProps) {
  // If no jobs have been started, but media files are loaded in library, show sticky quick-download bar
  if (jobs.length === 0) {
    if (mediaCount === 0) return null;

    return (
      <div className="border-t border-border/80 bg-background/95 backdrop-blur-md p-3.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg z-30">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground w-full sm:w-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-foreground truncate max-w-xs sm:max-w-md">
            {activeMediaName ? `Ready: ${activeMediaName}` : `${mediaCount} media files loaded`}
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {onDownloadCurrent && (
            <button
              type="button"
              onClick={onDownloadCurrent}
              disabled={isDownloadingCurrent}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isDownloadingCurrent ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Output...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Watermarked {activeMediaType === "video" ? "Video" : "Image"}</span>
                </>
              )}
            </button>
          )}

          {mediaCount > 1 && (
            <button
              type="button"
              onClick={onStartProcessing}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Archive className="w-4 h-4 text-primary" />
              <span>Process All ({mediaCount}) as ZIP</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed");
  const inProgressJobs = jobs.filter((j) => j.status === "processing");
  const pendingJobs = jobs.filter((j) => j.status === "pending");

  const overallPercent =
    jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0;

  // Single file download
  const handleDownloadSingle = (job: ProcessingJob) => {
    if (!job.resultBlob && !job.resultUrl) return;

    const url = job.resultUrl || URL.createObjectURL(job.resultBlob!);
    const a = document.createElement("a");
    a.href = url;
    a.download = job.outputName || `watermarked_${job.mediaName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Bulk ZIP Download
  const handleDownloadAllZip = async () => {
    if (completedJobs.length === 0) return;

    const zip = new JSZip();

    for (const job of completedJobs) {
      if (job.resultBlob) {
        zip.file(job.outputName || `watermarked_${job.mediaName}`, job.resultBlob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `watermarked_media_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="border-t border-border/80 bg-background/95 backdrop-blur-md p-4 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Counts */}
        <div className="flex items-center gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span>Batch Queue</span>
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
              <span className="text-emerald-600 dark:text-emerald-400">
                {completedJobs.length} Completed
              </span>
              <span>•</span>
              <span className="text-primary">{inProgressJobs.length} Processing</span>
              <span>•</span>
              <span>{pendingJobs.length} Pending</span>
              {failedJobs.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-destructive font-bold">{failedJobs.length} Failed</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isProcessing ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Batch
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartProcessing}
              disabled={jobs.length === 0}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-opacity"
            >
              <FileCheck className="w-4 h-4" /> Process All ({jobs.length})
            </button>
          )}

          {failedJobs.length > 0 && !isProcessing && (
            <button
              type="button"
              onClick={onRetryFailed}
              className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Failed ({failedJobs.length})
            </button>
          )}

          {completedJobs.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAllZip}
              className="px-4 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 flex items-center gap-2 transition-colors"
            >
              <Archive className="w-4 h-4" /> Download ZIP ({completedJobs.length})
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border/60">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      )}

      {/* Queue items list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
        {jobs.map((job) => {
          return (
            <div
              key={job.id}
              className="p-2.5 rounded-xl border border-border/70 bg-card flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {job.mediaType === "video" ? (
                  <Film className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
                <div className="truncate">
                  <p className="font-semibold text-foreground truncate">{job.mediaName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {job.status === "processing"
                      ? `Processing (${job.progress}%)`
                      : job.status === "completed"
                      ? `Completed • ${formatBytes(job.outputSize || 0)}`
                      : job.status === "failed"
                      ? `Failed: ${job.error}`
                      : "Pending"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {job.status === "processing" && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                )}
                {job.status === "completed" && (
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(job)}
                    className="p-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Download individual file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                {job.status === "failed" && (
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
