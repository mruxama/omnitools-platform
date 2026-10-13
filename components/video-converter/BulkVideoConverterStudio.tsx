"use client";

import React, { useState } from "react";
import { SharedMediaUploader } from "@/components/shared/SharedMediaUploader";
import {
  BulkVideoConverterConfig,
  ConversionModeOption,
  OutputContainerOption,
  TargetResolutionOption,
  TargetFpsOption,
  VideoAnalysisResult,
  VideoConversionOutput,
} from "@/lib/video-converter/types";
import { inspectVideoFile } from "@/lib/video-converter/videoAnalyzer";
import { convertVideo } from "@/lib/video-converter/converterEngine";
import {
  BaseMediaJob,
  BatchQueueManager,
  BatchProcessingStats,
  getRecommendedConcurrency,
} from "@/lib/shared/BatchQueueManager";
import { downloadBlob, downloadFilesAsZip, formatBytes } from "@/lib/shared/exportHelper";
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Video,
  Film,
  Eye,
  Info,
  ShieldCheck,
  ChevronDown,
  Layers,
} from "lucide-react";

interface ConverterJobItem extends BaseMediaJob<BulkVideoConverterConfig, VideoConversionOutput> {
  analysis?: VideoAnalysisResult;
}

export function BulkVideoConverterStudio() {
  const [jobs, setJobs] = useState<ConverterJobItem[]>([]);
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

  // Global Config
  const [config, setConfig] = useState<BulkVideoConverterConfig>({
    outputContainer: "mp4",
    conversionMode: "auto",
    resolution: "original",
    fps: "original",
    audioMode: "copy",
    audioBitrateKbps: 192,
    qualityPreset: "high",
    crf: 22,
    fastStart: true,
    preserveOrientation: true,
    preserveHdr: true,
    filenamePrefix: "",
    filenameSuffix: "_converted",
  });

  const [activePreviewJob, setActivePreviewJob] = useState<ConverterJobItem | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Queue Manager
  const [queueManager] = useState(() => {
    return new BatchQueueManager<BulkVideoConverterConfig, VideoConversionOutput>(
      async (job, onProgress, checkCancelled) => {
        const item = job as ConverterJobItem;
        const analysis = item.analysis || (await inspectVideoFile(item.file));
        return await convertVideo(item.file, analysis, item.config, onProgress, checkCancelled);
      },
      (updatedJobs, updatedStats) => {
        setJobs(updatedJobs as ConverterJobItem[]);
        setStats(updatedStats);
      },
      getRecommendedConcurrency("fast-video")
    );
  });

  const handleFilesSelected = async (files: File[]) => {
    const newJobs: ConverterJobItem[] = files.map((file) => ({
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || "video/mp4",
      status: "pending",
      progress: 0,
      config: { ...config },
    }));

    // Trigger asynchronous metadata and codec inspection
    newJobs.forEach(async (job) => {
      try {
        const analysis = await inspectVideoFile(job.file);
        queueManager.updateJobs((current) =>
          current.map((j) => (j.id === job.id ? { ...j, analysis } : j))
        );
      } catch (err) {
        console.warn("Analysis failed for", job.name, err);
      }
    });

    queueManager.addJobs(newJobs);
    if (!activePreviewJob && newJobs.length > 0) {
      setActivePreviewJob(newJobs[0]);
    }
  };

  const handleStartBatch = () => {
    queueManager.start();
  };

  const handlePauseBatch = () => {
    queueManager.pause();
  };

  const handleResumeBatch = () => {
    queueManager.resume();
  };

  const handleCancelAll = () => {
    queueManager.cancelAll();
  };

  const handleRetryFailed = () => {
    queueManager.retryFailed();
  };

  const handleClearAll = () => {
    queueManager.clearAll();
    setActivePreviewJob(null);
  };

  const handleApplyConfigToAllQueued = () => {
    queueManager.updateJobs((current) =>
      current.map((j) => (j.status === "pending" ? { ...j, config: { ...config } } : j))
    );
  };

  const handleDownloadAllZip = async () => {
    const completed = jobs.filter(
      (j): j is typeof j & { result: VideoConversionOutput } =>
        j.status === "completed" && !!j.result && !!j.result.blob
    );
    if (completed.length === 0) return;

    const exportList = completed.map((j) => ({
      name: j.result.outputName,
      blob: j.result.blob,
    }));

    await downloadFilesAsZip(exportList, "converted_iphone_videos.zip");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm">
          <Zap className="w-3.5 h-3.5" /> Ultra-Fast Remux Engine • Instant Lossless MOV to MP4 Stream Copy
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Bulk iPhone Video Converter
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
          Convert hundreds of iPhone MOV, HEVC and other videos to MP4 with smart quality preservation.
          Zero cloud uploads, hardware-accelerated processing, 100% private in your browser.
        </p>
      </div>

      {/* Settings Panel */}
      <div className="p-5 bg-card border border-border rounded-3xl shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Conversion Settings</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleApplyConfigToAllQueued}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Apply to all queued files
            </button>
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <span>Advanced</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Primary Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Output Container */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Output Format</label>
            <select
              value={config.outputContainer}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  outputContainer: e.target.value as OutputContainerOption,
                }))
              }
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="mp4">MP4 (Default & Universal)</option>
              <option value="mov">MOV (QuickTime)</option>
              <option value="webm">WebM (Open Web Format)</option>
              <option value="mkv">MKV (Matroska)</option>
            </select>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Conversion Mode</label>
            <select
              value={config.conversionMode}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  conversionMode: e.target.value as ConversionModeOption,
                }))
              }
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="auto">Auto / Smart (Recommended)</option>
              <option value="remux">Fast Remux (Lossless Stream Copy)</option>
              <option value="high-quality">High Quality Transcoding</option>
              <option value="compatibility">Maximum Compatibility (H.264/AAC)</option>
              <option value="small-size">Smaller File Size</option>
            </select>
          </div>

          {/* Resolution */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Resolution</label>
            <select
              value={config.resolution}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  resolution: e.target.value as TargetResolutionOption,
                }))
              }
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="original">Keep Original Resolution (Full Quality)</option>
              <option value="4k">4K (Max 3840x2160)</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
            </select>
          </div>

          {/* Frame Rate */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Frame Rate (FPS)</label>
            <select
              value={config.fps}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  fps: e.target.value as TargetFpsOption,
                }))
              }
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="original">Keep Original FPS</option>
              <option value="60">60 FPS (Smooth)</option>
              <option value="30">30 FPS (Standard)</option>
            </select>
          </div>
        </div>

        {/* Advanced Drawer */}
        {isAdvancedOpen && (
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in-50">
            {/* Audio Settings */}
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Audio Track</label>
              <select
                value={config.audioMode}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    audioMode: e.target.value as any,
                  }))
                }
                className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground"
              >
                <option value="copy">Preserve Original Audio</option>
                <option value="aac">Encode to AAC (192 kbps)</option>
                <option value="strip">Remove Audio (Mute)</option>
              </select>
            </div>

            {/* Quality Preset */}
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Transcode Quality</label>
              <select
                value={config.qualityPreset}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    qualityPreset: e.target.value as any,
                  }))
                }
                className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground"
              >
                <option value="maximum">Maximum Visual Quality (8 Mbps)</option>
                <option value="high">High Quality (4.5 Mbps)</option>
                <option value="balanced">Balanced (2.5 Mbps)</option>
                <option value="small">Smaller File (1.2 Mbps)</option>
              </select>
            </div>

            {/* Filename Suffix */}
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Output Filename Suffix</label>
              <input
                type="text"
                value={config.filenameSuffix}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, filenameSuffix: e.target.value }))
                }
                placeholder="_converted"
                className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <SharedMediaUploader
        accept="video/quicktime,video/mp4,video/m4v,video/x-matroska,video/webm,video/*,.mov,.mp4,.m4v,.mkv,.avi"
        title="Drop iPhone Videos or Folders Here"
        description="Select 200–300+ MOV, MP4, or HEVC videos • Zero cloud uploads"
        onFilesSelected={handleFilesSelected}
        fileCount={stats.total}
        totalBytes={stats.totalInputBytes}
        onClearAll={handleClearAll}
      />

      {/* Batch Control Bar */}
      {jobs.length > 0 && (
        <div className="space-y-4 p-5 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Batch Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {stats.completed} of {stats.total} processed
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {stats.itemsPerSecond > 0 && (
                  <span>Speed: {stats.itemsPerSecond} vid/sec • </span>
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
                  <span>Start Batch</span>
                </button>
              )}

              {stats.processing > 0 && (
                <button
                  type="button"
                  onClick={handlePauseBatch}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {stats.processing > 0 && (
                <button
                  type="button"
                  onClick={handleCancelAll}
                  className="px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}

              {stats.failed > 0 && (
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  className="px-4 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry ({stats.failed})</span>
                </button>
              )}

              {stats.completed > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All as ZIP</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 transition-all duration-300"
              style={{ width: `${stats.percentOverall}%` }}
            />
          </div>

          {/* File Queue Table */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">File</th>
                  <th className="p-3">Original Size</th>
                  <th className="p-3">Detected Codec</th>
                  <th className="p-3">Conversion Mode</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => {
                  const isRemux =
                    job.result?.usedRemux ??
                    (job.config.conversionMode === "remux" ||
                      (job.config.conversionMode === "auto" && job.analysis?.canRemuxToMp4));

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 font-medium text-foreground max-w-[200px] truncate">
                        {job.name}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatBytes(job.size)}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-muted font-mono text-[11px]">
                          {job.analysis?.videoCodec?.toUpperCase() || "ANALYZING"}
                        </span>
                        {job.analysis?.isHdr && (
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold text-[9px]">
                            HDR
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isRemux ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Lossless Stream Copy
                          </span>
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            Transcode (H.264)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary h-1.5 transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {job.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {job.status === "completed" && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                        {job.status === "processing" && (
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> Converting...
                          </span>
                        )}
                        {job.status === "pending" && (
                          <span className="text-muted-foreground">Waiting</span>
                        )}
                        {job.status === "failed" && (
                          <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {job.result && job.result.blob ? (
                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(job.result!.blob, job.result!.outputName)
                            }
                            className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Download className="w-3.5 h-3.5" /> Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActivePreviewJob(job)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Preview Drawer */}
      {activePreviewJob && (
        <div className="p-5 bg-card border border-border rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>Video Inspection: {activePreviewJob.name}</span>
            <span className="text-muted-foreground">{formatBytes(activePreviewJob.size)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <video
                src={URL.createObjectURL(activePreviewJob.file)}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2.5 text-xs">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary" /> Track & Codec Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Duration: <span className="text-foreground font-mono">{activePreviewJob.analysis?.duration ? `${Math.round(activePreviewJob.analysis.duration)}s` : "Unknown"}</span></div>
                <div>Dimensions: <span className="text-foreground font-mono">{activePreviewJob.analysis?.width}x{activePreviewJob.analysis?.height}</span></div>
                <div>Video Codec: <span className="text-foreground font-mono">{activePreviewJob.analysis?.videoCodec?.toUpperCase() || "H.264/HEVC"}</span></div>
                <div>Audio Codec: <span className="text-foreground font-mono">{activePreviewJob.analysis?.audioCodec?.toUpperCase() || "AAC"}</span></div>
                <div>HDR / Dolby: <span className="text-foreground font-mono">{activePreviewJob.analysis?.isHdr ? "Yes (Dolby/HLG)" : "SDR"}</span></div>
                <div>Remux Ready: <span className="text-emerald-600 font-bold">{activePreviewJob.analysis?.canRemuxToMp4 !== false ? "100% Compatible" : "Requires Transcode"}</span></div>
              </div>

              {activePreviewJob.result && (
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-emerald-600 font-semibold">Converted ({formatBytes(activePreviewJob.result.size)})</span>
                  <button
                    type="button"
                    onClick={() => downloadBlob(activePreviewJob.result!.blob, activePreviewJob.result!.outputName)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
