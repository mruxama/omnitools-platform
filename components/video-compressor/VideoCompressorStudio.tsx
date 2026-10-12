'use client';

import React, { useState } from 'react';
import { VideoDropzone } from './VideoDropzone';
import { VideoPresetSelector } from './VideoPresetSelector';
import { CompressionSettingsPanel } from './CompressionSettingsPanel';
import { VideoPreviewComparison } from './VideoPreviewComparison';
import { BatchQueueManager } from './BatchQueueManager';
import { DEFAULT_COMPRESSION_SETTINGS, VIDEO_PRESETS } from '@/lib/video-compressor/presets';
import {
  CompressionJob,
  CompressionSettings,
  PresetProfile,
  VideoMetadata,
} from '@/lib/video-compressor/types';
import { compressVideoInBrowser } from '@/lib/video-compressor/browserCompressor';
import { estimateOutputSize, formatBytes } from '@/lib/video-compressor/bitrateCalculator';
import { Play, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const VideoCompressorStudio: React.FC = () => {
  const [jobs, setJobs] = useState<CompressionJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_COMPRESSION_SETTINGS);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  const handleVideosSelected = (
    incoming: { file: File; metadata: VideoMetadata }[]
  ) => {
    const newJobs: CompressionJob[] = incoming.map((item) => ({
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file: item.file,
      metadata: item.metadata,
      settings: { ...settings },
      status: 'queued',
      progress: 0,
      processingEngine: 'browser',
      createdAt: Date.now(),
    }));

    setJobs((prev) => [...prev, ...newJobs]);
    if (!activeJobId && newJobs.length > 0) {
      setActiveJobId(newJobs[0].id);
    }
  };

  const handleSelectPreset = (preset: PresetProfile) => {
    setSelectedPresetId(preset.id);
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
  };

  const compressSingleJob = async (jobToCompress: CompressionJob) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobToCompress.id ? { ...j, status: 'compressing', progress: 5 } : j))
    );

    try {
      const result = await compressVideoInBrowser(
        jobToCompress.file,
        jobToCompress.metadata,
        settings,
        (progress) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === jobToCompress.id ? { ...j, progress } : j))
          );
        }
      );

      const savingsPct = Math.max(
        0,
        Math.round(((jobToCompress.file.size - result.size) / jobToCompress.file.size) * 100)
      );

      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobToCompress.id
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                outputBlob: result.blob,
                outputUrl: result.url,
                compressedSize: result.size,
                savingsPercentage: savingsPct,
                completedAt: Date.now(),
              }
            : j
        )
      );
    } catch (err) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobToCompress.id
            ? { ...j, status: 'failed', error: (err as Error).message }
            : j
        )
      );
    }
  };

  const handleCompressBatch = async () => {
    if (jobs.length === 0) return;
    setIsProcessingAll(true);

    const queuedJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'failed');
    for (const job of queuedJobs) {
      await compressSingleJob(job);
    }

    setIsProcessingAll(false);
  };

  const estimated = activeJob
    ? estimateOutputSize(activeJob.metadata, settings)
    : null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          <Zap className="w-3.5 h-3.5" /> Client-Side Hardware-Accelerated Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Compress Videos Without Compromising Quality
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Reduce video file sizes up to 80% in seconds with fine-grained CRF, bitrate, and resolution controls.
          Zero software install. 100% private in-browser compression.
        </p>
      </div>

      {/* Upload Zone */}
      <VideoDropzone
        onVideosSelected={handleVideosSelected}
        isLoading={isProcessingAll}
      />

      {/* Main Workspace (when files are selected) */}
      {jobs.length > 0 && (
        <div className="space-y-6">
          {/* Smart Presets */}
          <VideoPresetSelector
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
          />

          {/* Settings Panel */}
          <CompressionSettingsPanel
            settings={settings}
            onChange={(s) => {
              setSettings(s);
              setSelectedPresetId('custom');
            }}
            originalFileSize={activeJob?.file.size}
          />

          {/* Estimated Savings Bar & Action Button */}
          {estimated && activeJob && (
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Estimated Output:
                </span>{' '}
                <span className="font-mono text-indigo-600 font-bold">
                  {estimated.estimatedMB} MB
                </span>{' '}
                <span className="text-xs text-slate-500">
                  (approx. -{estimated.estimatedSavingsPercent}% reduction from {formatBytes(activeJob.file.size)})
                </span>
              </div>

              <button
                type="button"
                onClick={handleCompressBatch}
                disabled={isProcessingAll}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-white" />
                {isProcessingAll
                  ? 'Processing Videos...'
                  : jobs.length > 1
                  ? `Compress All (${jobs.length} Videos)`
                  : 'Compress Video Now'}
              </button>
            </div>
          )}

          {/* Synchronized Player Comparison */}
          {activeJob && (
            <VideoPreviewComparison
              originalFile={activeJob.file}
              originalMetadata={activeJob.metadata}
              compressedBlob={activeJob.outputBlob}
              compressedUrl={activeJob.outputUrl}
              compressedSize={activeJob.compressedSize}
            />
          )}

          {/* Queue Manager */}
          <BatchQueueManager
            jobs={jobs}
            activeJobId={activeJob?.id}
            onSelectActiveJob={(j) => setActiveJobId(j.id)}
            onRemoveJob={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))}
            onClearQueue={() => {
              setJobs([]);
              setActiveJobId(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
