"use client";

import React, { useState } from "react";
import { SharedMediaUploader } from "@/components/shared/SharedMediaUploader";
import { rotateVideoPhysically, VideoRotationOptions, VideoRotationResult, RotationAngle } from "@/lib/video-rotator/videoRotator";
import { BaseMediaJob, BatchQueueManager, BatchProcessingStats, getRecommendedConcurrency } from "@/lib/shared/BatchQueueManager";
import { downloadBlob, downloadFilesAsZip, formatBytes } from "@/lib/shared/exportHelper";
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Play,
  Download,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  Film,
  Zap,
} from "lucide-react";

export function BulkVideoRotatorStudio() {
  const [jobs, setJobs] = useState<BaseMediaJob<VideoRotationOptions, VideoRotationResult>[]>([]);
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

  // Global rotation configuration
  const [rotationConfig, setRotationConfig] = useState<VideoRotationOptions>({
    angle: 90,
    flipHorizontal: false,
    flipVertical: false,
    outputFormat: "video/mp4",
  });

  const [activePreviewJob, setActivePreviewJob] = useState<BaseMediaJob<VideoRotationOptions, VideoRotationResult> | null>(null);

  const [queueManager] = useState(() => {
    return new BatchQueueManager<VideoRotationOptions, VideoRotationResult>(
      async (job, onProgress, checkCancelled) => {
        return await rotateVideoPhysically(job.file, job.config, onProgress, checkCancelled);
      },
      (updatedJobs, updatedStats) => {
        setJobs(updatedJobs);
        setStats(updatedStats);
      },
      getRecommendedConcurrency("video")
    );
  });

  const handleFilesSelected = (files: File[]) => {
    const newJobs: BaseMediaJob<VideoRotationOptions, VideoRotationResult>[] = files.map((file) => ({
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || "video/mp4",
      status: "pending",
      progress: 0,
      config: { ...rotationConfig },
    }));

    queueManager.addJobs(newJobs);
    if (!activePreviewJob && newJobs.length > 0) {
      setActivePreviewJob(newJobs[0]);
    }
  };

  const handleRotatePreset = (angle: RotationAngle) => {
    setRotationConfig((prev) => ({ ...prev, angle }));
  };

  const handleApplyToAllQueued = () => {
    setJobs((prev) =>
      prev.map((j) => (j.status === "pending" ? { ...j, config: { ...rotationConfig } } : j))
    );
  };

  const handleStartBatch = () => {
    queueManager.start();
  };

  const handleCancelAll = () => {
    queueManager.cancelAll();
  };

  const handleClearAll = () => {
    queueManager.clearAll();
    setActivePreviewJob(null);
  };

  const handleDownloadAllZip = async () => {
    const completed = jobs.filter(
      (j): j is typeof j & { result: VideoRotationResult } =>
        j.status === "completed" && !!j.result && !!j.result.blob
    );
    if (completed.length === 0) return;

    const exportList = completed.map((j) => ({
      name: j.result.outputName,
      blob: j.result.blob,
    }));

    await downloadFilesAsZip(exportList, "rotated_videos.zip");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm">
          <Film className="w-3.5 h-3.5" /> High-Performance Hardware-Accelerated Video Orientation Fixer
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Bulk Video Rotator & Orientation Corrector
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
          Rotate sideways or upside-down smartphone & DSLR videos by 90°, 180°, or 270°.
          Maintains true dimensions, retains synchronized audio, and works 100% locally.
        </p>
      </div>

      {/* Rotation Control Bar */}
      <div className="p-5 bg-card border border-border rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-primary" />
              <span>Orientation Controls</span>
            </h3>
            <p className="text-xs text-muted-foreground">Choose rotation angle and mirror flips</p>
          </div>

          <button
            type="button"
            onClick={handleApplyToAllQueued}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Apply to all queued files
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => handleRotatePreset(90)}
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              rotationConfig.angle === 90
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-muted text-foreground"
            }`}
          >
            <RotateCw className="w-5 h-5" />
            <span>90° Clockwise</span>
          </button>

          <button
            type="button"
            onClick={() => handleRotatePreset(270)}
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              rotationConfig.angle === 270
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-muted text-foreground"
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            <span>90° Counter-CW</span>
          </button>

          <button
            type="button"
            onClick={() => handleRotatePreset(180)}
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              rotationConfig.angle === 180
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-muted text-foreground"
            }`}
          >
            <RotateCw className="w-5 h-5 rotate-180" />
            <span>180° Flip</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setRotationConfig((prev) => ({
                ...prev,
                flipHorizontal: !prev.flipHorizontal,
              }))
            }
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              rotationConfig.flipHorizontal
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-muted text-foreground"
            }`}
          >
            <FlipHorizontal className="w-5 h-5" />
            <span>Mirror H</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setRotationConfig((prev) => ({
                ...prev,
                flipVertical: !prev.flipVertical,
              }))
            }
            className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              rotationConfig.flipVertical
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border bg-background hover:bg-muted text-foreground"
            }`}
          >
            <FlipVertical className="w-5 h-5" />
            <span>Mirror V</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <SharedMediaUploader
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
        title="Drop Videos to Rotate"
        description="MP4, WebM, MOV, and MKV footage • Zero upload limits"
        onFilesSelected={handleFilesSelected}
        fileCount={stats.total}
        totalBytes={stats.totalInputBytes}
        onClearAll={handleClearAll}
      />

      {/* Interactive Preview Canvas */}
      {activePreviewJob && (
        <div className="p-5 bg-card border border-border rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>Orientation Preview: {activePreviewJob.name}</span>
            <span className="text-primary font-mono">{rotationConfig.angle}°</span>
          </div>

          <div className="relative w-full max-w-xl mx-auto aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
            <video
              src={URL.createObjectURL(activePreviewJob.file)}
              controls
              playsInline
              style={{
                transform: `rotate(${rotationConfig.angle}deg) scaleX(${
                  rotationConfig.flipHorizontal ? -1 : 1
                }) scaleY(${rotationConfig.flipVertical ? -1 : 1})`,
                transition: "transform 0.3s ease",
                maxHeight: "100%",
                maxWidth: "100%",
              }}
            />
          </div>
        </div>
      )}

      {/* Queue & Progress */}
      {jobs.length > 0 && (
        <div className="space-y-4 p-5 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Video Queue ({stats.completed} / {stats.total} processed)
              </h3>
              <p className="text-xs text-muted-foreground">
                Elapsed: {stats.elapsedSeconds}s • Active Workers: 1-2
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {stats.pending > 0 && (
                <button
                  type="button"
                  onClick={handleStartBatch}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 shadow-sm flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Rotating</span>
                </button>
              )}

              {stats.processing > 0 && (
                <button
                  type="button"
                  onClick={handleCancelAll}
                  className="px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs"
                >
                  Cancel
                </button>
              )}

              {stats.completed > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download All ZIP ({stats.completed})</span>
                </button>
              )}
            </div>
          </div>

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

          <div className="max-h-96 overflow-y-auto space-y-2 pt-2 pr-1">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setActivePreviewJob(job)}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-colors text-xs ${
                  activePreviewJob?.id === job.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background/50 hover:bg-background"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {job.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : job.status === "failed" ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : job.status === "processing" ? (
                      <Video className="w-4 h-4 text-primary animate-pulse" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{job.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatBytes(job.size)} • {job.config.angle}° rotation
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
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadBlob(job.result!.blob, job.result!.outputName);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-primary font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
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
