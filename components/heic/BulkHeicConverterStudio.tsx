"use client";

import React, { useState } from "react";
import { SharedMediaUploader } from "@/components/shared/SharedMediaUploader";
import { convertHeicImage, HeicConversionOptions } from "@/lib/heic/heicConverter";
import { BaseMediaJob, BatchQueueManager, BatchProcessingStats, getRecommendedConcurrency } from "@/lib/shared/BatchQueueManager";
import { downloadBlob, downloadFilesAsZip, formatBytes } from "@/lib/shared/exportHelper";
import {
  Play,
  RotateCcw,
  Download,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Sparkles,
  Zap,
  Sliders,
} from "lucide-react";

export function BulkHeicConverterStudio() {
  const [jobs, setJobs] = useState<BaseMediaJob<HeicConversionOptions, any>[]>([]);
  const [stats, setStats] = useState<BatchProcessingStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    totalInputBytes: 0,
    totalOutputBytes: 0,
    percentOverall: 0,
    elapsedSeconds: 0,
    itemsPerSecond: 0,
  });

  // Global settings
  const [options, setOptions] = useState<HeicConversionOptions>({
    outputFormat: "image/jpeg",
    quality: 0.92,
    maintainAspectRatio: true,
  });

  const [queueManager] = useState(() => {
    return new BatchQueueManager<HeicConversionOptions, any>(
      async (job, onProgress) => {
        return await convertHeicImage(job.file, job.name, job.config, onProgress);
      },
      (updatedJobs, updatedStats) => {
        setJobs(updatedJobs);
        setStats(updatedStats);
      },
      getRecommendedConcurrency("heic")
    );
  });

  const handleFilesSelected = (files: File[]) => {
    const newJobs: BaseMediaJob<HeicConversionOptions, any>[] = files.map((file) => ({
      id: `heic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || "image/heic",
      status: "pending",
      progress: 0,
      config: { ...options },
    }));

    queueManager.addJobs(newJobs);
  };

  const handleStartBatch = () => {
    queueManager.start();
  };

  const handleCancelAll = () => {
    queueManager.cancelAll();
  };

  const handleRetryFailed = () => {
    queueManager.retryFailed();
  };

  const handleClearAll = () => {
    queueManager.clearAll();
  };

  const handleDownloadAllZip = async () => {
    const completed = jobs.filter(
      (j): j is typeof j & { result: any } =>
        j.status === "completed" && !!j.result && !!j.result.blob
    );
    if (completed.length === 0) return;

    const exportList = completed.map((j) => ({
      name: j.result.outputName,
      blob: j.result.blob,
    }));

    await downloadFilesAsZip(exportList, "heic_converted_photos.zip");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <Zap className="w-3.5 h-3.5" /> High-Speed WASM Engine • Up to 300+ iPhone Photos in Parallel
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Ultra-Fast Bulk HEIC to JPG & PNG Converter
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
          Convert hundreds of iPhone HEIC/HEIF photos into high-resolution JPG, PNG, or WebP in seconds.
          Zero uploads, zero subscriptions, 100% private in your browser.
        </p>
      </div>

      {/* Settings Bar */}
      <div className="p-4 sm:p-5 bg-card border border-border rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <Sliders className="w-4 h-4 text-primary" />
          <span>Conversion Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Format */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Target Format</label>
            <select
              value={options.outputFormat}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  outputFormat: e.target.value as any,
                }))
              }
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="image/jpeg">JPG / JPEG (Best for Photos & Space)</option>
              <option value="image/png">PNG (Lossless & Max Clarity)</option>
              <option value="image/webp">WebP (Modern Compact Web Format)</option>
            </select>
          </div>

          {/* Quality Preset */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">
              Quality Target ({Math.round((options.quality || 0.92) * 100)}%)
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.02"
              value={options.quality}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  quality: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* Max Width Resize Option */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Max Width / Resize</label>
            <select
              value={options.maxWidth || "original"}
              onChange={(e) => {
                const val = e.target.value;
                setOptions((prev) => ({
                  ...prev,
                  maxWidth: val === "original" ? undefined : parseInt(val),
                }));
              }}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="original">Original Resolution (Full Quality)</option>
              <option value="3840">4K Ultra HD (Max 3840px)</option>
              <option value="1920">Full HD (Max 1920px)</option>
              <option value="1280">HD (Max 1280px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <SharedMediaUploader
        accept=".heic,.heif,image/heic,image/heif"
        title="Drop HEIC or HEIF Photos Here"
        description="Select single images, folders, or hundreds of photos at once"
        onFilesSelected={handleFilesSelected}
        fileCount={stats.total}
        totalBytes={stats.totalInputBytes}
        onClearAll={handleClearAll}
      />

      {/* Batch Control & Overall Progress */}
      {jobs.length > 0 && (
        <div className="space-y-4 p-5 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Batch Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {stats.completed} of {stats.total} converted
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {stats.itemsPerSecond > 0 && (
                  <span>Speed: {stats.itemsPerSecond} img/sec • </span>
                )}
                {stats.estimatedRemainingSeconds !== undefined && stats.estimatedRemainingSeconds > 0 && (
                  <span>~{stats.estimatedRemainingSeconds}s remaining • </span>
                )}
                <span>Elapsed: {stats.elapsedSeconds}s</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {stats.pending > 0 && (
                <button
                  type="button"
                  onClick={handleStartBatch}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 shadow-sm flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Conversion</span>
                </button>
              )}

              {stats.processing > 0 && (
                <button
                  type="button"
                  onClick={handleCancelAll}
                  className="px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Batch</span>
                </button>
              )}

              {stats.failed > 0 && (
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Failed ({stats.failed})</span>
                </button>
              )}

              {stats.completed > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download All as ZIP ({stats.completed})</span>
                </button>
              )}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span className="font-medium text-foreground">{stats.percentOverall}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${stats.percentOverall}%` }}
              />
            </div>
          </div>

          {/* File Grid */}
          <div className="max-h-96 overflow-y-auto space-y-2 pt-2 pr-1">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background/50 hover:bg-background text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {job.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : job.status === "failed" ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : job.status === "processing" ? (
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{job.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatBytes(job.size)}
                      {job.result && ` → ${formatBytes(job.result.size)} (${job.result.width}×${job.result.height})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {job.status === "processing" && (
                    <div className="w-20 sm:w-28 text-right">
                      <span className="text-[11px] text-primary font-medium">{job.progress}%</span>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {job.status === "completed" && job.result?.blob && (
                    <button
                      type="button"
                      onClick={() => downloadBlob(job.result.blob, job.result.outputName)}
                      className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-primary font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}

                  {job.status === "failed" && (
                    <span className="text-red-500 font-medium truncate max-w-[120px]">
                      {job.error || "Failed"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
