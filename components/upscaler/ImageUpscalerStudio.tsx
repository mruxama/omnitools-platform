'use client';

import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { UpscaleSettingsPanel } from './UpscaleSettingsPanel';
import { ComparisonSlider } from './ComparisonSlider';
import { BatchQueue } from './BatchQueue';
import {
  UpscaleJob,
  UpscaleSettings,
  ImageMetadata,
} from '@/lib/upscaler/types';
import { DEFAULT_MODEL_ID } from '@/lib/upscaler/modelRegistry';
import { aiUpscale, faithfulUpscale, loadImage } from '@/lib/upscaler/inferenceEngine';
import { Play, Sparkles, ShieldCheck, Zap, Info } from 'lucide-react';

const DEFAULT_SETTINGS: UpscaleSettings = {
  mode: 'ai',
  scaleFactor: 4,
  modelId: DEFAULT_MODEL_ID,
  outputFormat: 'image/png',
  quality: 0.92,
  tileSize: 256,
  overlap: 16,
  preserveAlpha: true,
  sharpen: true,
  backgroundColor: '#ffffff',
};

export const ImageUpscalerStudio: React.FC = () => {
  const [jobs, setJobs] = useState<UpscaleJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UpscaleSettings>(DEFAULT_SETTINGS);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  const handleImagesSelected = (
    incoming: { file: File; metadata: ImageMetadata; previewUrl: string }[]
  ) => {
    const newJobs: UpscaleJob[] = incoming.map((item) => ({
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file: item.file,
      previewUrl: item.previewUrl,
      metadata: item.metadata,
      settings: { ...settings },
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
    }));

    setJobs((prev) => [...prev, ...newJobs]);
    if (!activeJobId && newJobs.length > 0) {
      setActiveJobId(newJobs[0].id);
    }
  };

  const processSingleJob = async (jobToProcess: UpscaleJob) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobToProcess.id ? { ...j, status: 'processing', progress: 5 } : j))
    );

    const startTime = performance.now();
    try {
      const img = await loadImage(jobToProcess.file);
      let res: { blob: Blob; width: number; height: number; provider?: any };

      if (settings.mode === 'ai') {
        res = await aiUpscale(img, settings, (pct) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === jobToProcess.id ? { ...j, progress: pct } : j))
          );
        });
      } else {
        res = await faithfulUpscale(
          img,
          settings.scaleFactor,
          settings.outputFormat,
          settings.quality,
          settings.sharpen
        );
      }

      const durationMs = Math.round(performance.now() - startTime);
      const outputUrl = URL.createObjectURL(res.blob);

      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobToProcess.id
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                outputBlob: res.blob,
                outputUrl,
                outputWidth: res.width,
                outputHeight: res.height,
                outputSize: res.blob.size,
                processingTimeMs: durationMs,
                completedAt: Date.now(),
              }
            : j
        )
      );
    } catch (err) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobToProcess.id
            ? { ...j, status: 'failed', error: (err as Error).message }
            : j
        )
      );
    }
  };

  const handleProcessBatch = async () => {
    if (jobs.length === 0) return;
    setIsProcessingAll(true);

    const queuedJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'failed');
    for (const job of queuedJobs) {
      await processSingleJob(job);
    }

    setIsProcessingAll(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
          <Zap className="w-3.5 h-3.5" /> 100% In-Browser AI • WebGPU &amp; WASM Accelerated
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI Image Upscaler &amp; Super-Resolution
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Enhance photos, graphics, and product shots up to 4× resolution directly on your GPU.
          Zero API costs, zero server uploads, and 100% confidential.
        </p>
      </div>

      {/* Upload Zone */}
      <ImageUploader onImagesSelected={handleImagesSelected} isLoading={isProcessingAll} />

      {/* Active Workspace */}
      {jobs.length > 0 && (
        <div className="space-y-6">
          {/* Settings Configuration */}
          <UpscaleSettingsPanel
            settings={settings}
            onChange={setSettings}
            hasAlpha={activeJob?.metadata.hasAlpha}
          />

          {/* Action Trigger Bar */}
          <div className="bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-violet-500/10 border border-violet-200 dark:border-violet-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-600 shrink-0" />
              <span>
                Target Resolution: {activeJob?.metadata.width ? activeJob.metadata.width * settings.scaleFactor : 0}×
                {activeJob?.metadata.height ? activeJob.metadata.height * settings.scaleFactor : 0} px ({settings.scaleFactor}× {settings.mode.toUpperCase()})
              </span>
            </div>

            <button
              type="button"
              onClick={handleProcessBatch}
              disabled={isProcessingAll}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              {isProcessingAll
                ? 'Processing Images...'
                : jobs.length > 1
                ? `Upscale All (${jobs.length} Images)`
                : 'Upscale Image Now'}
            </button>
          </div>

          {/* Before / After Comparison */}
          {activeJob && (
            <ComparisonSlider
              originalUrl={activeJob.previewUrl}
              originalWidth={activeJob.metadata.width}
              originalHeight={activeJob.metadata.height}
              originalSize={activeJob.metadata.fileSize}
              upscaledUrl={activeJob.outputUrl}
              upscaledWidth={activeJob.outputWidth}
              upscaledHeight={activeJob.outputHeight}
              upscaledSize={activeJob.outputSize}
              filename={activeJob.file.name}
            />
          )}

          {/* Queue Manager */}
          <BatchQueue
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

      {/* Privacy Footnote */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-4">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>
          Your images are processed locally in your browser and are not uploaded to our servers.
        </span>
      </div>
    </div>
  );
};
