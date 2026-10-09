"use client";

import React, { useState, useRef } from "react";
import {
  MediaItem,
  WatermarkLayer,
  TextWatermarkLayer,
  LogoWatermarkLayer,
  VideoTimingConfig,
  ExportOptions,
  WatermarkPreset,
  ProcessingJob,
} from "@/lib/watermark/types";
import { DEFAULT_TEXT_LAYER, BUILT_IN_PRESETS } from "@/lib/watermark/presets";
import { MediaLibraryPanel } from "./MediaLibraryPanel";
import { PreviewCanvas } from "./PreviewCanvas";
import { WatermarkControlsPanel } from "./WatermarkControlsPanel";
import { ProcessingQueueSection } from "./ProcessingQueueSection";
import { processImageWithWatermarks } from "@/lib/watermark/imageProcessor";
import { processVideoWithWatermarks } from "@/lib/watermark/videoProcessor";

export function BulkWatermarkStudio() {
  // Media items state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  // Layers state
  const [layers, setLayers] = useState<WatermarkLayer[]>([DEFAULT_TEXT_LAYER]);
  const [activeLayerId, setActiveLayerId] = useState<string>(DEFAULT_TEXT_LAYER.id);

  // Video timing
  const [videoTiming, setVideoTiming] = useState<VideoTimingConfig>({
    enabled: false,
    startTime: 0,
    endTime: 10,
    fadeIn: 0.5,
    fadeOut: 0.5,
  });

  // Export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    filenamePrefix: "",
    filenameSuffix: "_watermarked",
    imageFormat: "original",
    imageQuality: 0.85,
    videoFormat: "original",
    videoQuality: "high",
  });

  // Batch queue state
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cancelProcessingRef = useRef(false);

  // Add files handler
  const handleAddFiles = (files: File[]) => {
    const newItems: MediaItem[] = [];

    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isImage && !isVideo) return;

      const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const url = URL.createObjectURL(file);

      // Create dummy/initial item
      const item: MediaItem = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: isVideo ? "video" : "image",
        mimeType: file.type,
        width: isVideo ? 1920 : 1200,
        height: isVideo ? 1080 : 800,
        aspectRatio: isVideo ? 16 / 9 : 3 / 2,
        thumbnailUrl: url,
        selected: true,
      };

      // Probe actual dimensions
      if (isImage) {
        const img = new Image();
        img.onload = () => {
          setMediaItems((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight,
                  }
                : m
            )
          );
        };
        img.src = url;
      } else if (isVideo) {
        const vid = document.createElement("video");
        vid.onloadedmetadata = () => {
          setMediaItems((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    width: vid.videoWidth || 1920,
                    height: vid.videoHeight || 1080,
                    aspectRatio: (vid.videoWidth || 16) / (vid.videoHeight || 9),
                    duration: vid.duration || 0,
                  }
                : m
            )
          );
        };
        vid.src = url;
      }

      newItems.push(item);
    });

    if (newItems.length > 0) {
      setMediaItems((prev) => [...prev, ...newItems]);
      if (!activeMediaId) {
        setActiveMediaId(newItems[0].id);
      }
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (activeMediaId === id) {
        setActiveMediaId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setMediaItems([]);
    setActiveMediaId(null);
    setJobs([]);
  };

  const handleToggleSelectAll = () => {
    const allSelected = mediaItems.every((m) => m.selected);
    setMediaItems((prev) => prev.map((m) => ({ ...m, selected: !allSelected })));
  };

  const handleToggleSelectItem = (id: string) => {
    setMediaItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m))
    );
  };

  // Layer manipulations
  const handleUpdateLayer = (id: string, updates: Partial<WatermarkLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? ({ ...l, ...updates } as WatermarkLayer) : l))
    );
  };

  const handleAddLayer = (type: "text" | "logo") => {
    const newId = `layer_${Date.now()}`;
    if (type === "text") {
      const newLayer: TextWatermarkLayer = {
        ...DEFAULT_TEXT_LAYER,
        id: newId,
        name: `Text ${layers.length + 1}`,
      };
      setLayers((prev) => [...prev, newLayer]);
      setActiveLayerId(newId);
    } else {
      const newLayer: LogoWatermarkLayer = {
        id: newId,
        name: `Logo ${layers.length + 1}`,
        type: "logo",
        assetUrl: "",
        assetName: "",
        originalWidth: 200,
        originalHeight: 200,
        preserveAlpha: true,
        opacity: 80,
        rotation: 0,
        position: {
          anchor: "bottom-right",
          x: 0.85,
          y: 0.85,
          offsetXPercent: 0,
          offsetYPercent: 0,
          marginPercent: 5,
        },
        size: {
          mode: "relative-width",
          percentage: 20,
          fixedPx: 120,
          lockAspectRatio: true,
        },
        visible: true,
        locked: false,
        tiled: false,
        tileSpacing: 120,
      };
      setLayers((prev) => [...prev, newLayer]);
      setActiveLayerId(newId);
    }
  };

  const handleDuplicateLayer = (id: string) => {
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    const dupId = `layer_${Date.now()}`;
    const duplicate: WatermarkLayer = {
      ...target,
      id: dupId,
      name: `${target.name} (Copy)`,
      position: {
        ...target.position,
        offsetXPercent: (target.position.offsetXPercent || 0) + 2,
        offsetYPercent: (target.position.offsetYPercent || 0) + 2,
      },
    };
    setLayers((prev) => [...prev, duplicate]);
    setActiveLayerId(dupId);
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(next[0].id);
      }
      return next;
    });
  };

  const handleReorderLayer = (id: string, direction: "up" | "down") => {
    const idx = layers.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= layers.length) return;

    const copy = [...layers];
    const [removed] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, removed);
    setLayers(copy);
  };

  const handleApplyPreset = (preset: WatermarkPreset) => {
    setLayers(preset.layers);
    if (preset.layers.length > 0) {
      setActiveLayerId(preset.layers[0].id);
    }
    if (preset.videoTiming) {
      setVideoTiming(preset.videoTiming);
    }
    if (preset.exportOptions) {
      setExportOptions((prev) => ({ ...prev, ...preset.exportOptions }));
    }
  };

  // Helper to generate output filename
  const generateOutputFilename = (originalName: string, mimeType: string): string => {
    const dotIdx = originalName.lastIndexOf(".");
    const base = dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName;
    const origExt = dotIdx !== -1 ? originalName.substring(dotIdx + 1) : "";

    let ext = origExt;
    if (mimeType === "image/jpeg") ext = "jpg";
    else if (mimeType === "image/png") ext = "png";
    else if (mimeType === "image/webp") ext = "webp";
    else if (mimeType === "video/mp4") ext = "mp4";
    else if (mimeType === "video/webm") ext = "webm";

    const prefix = exportOptions.filenamePrefix || "";
    const suffix = exportOptions.filenameSuffix || "_watermarked";

    return `${prefix}${base}${suffix}.${ext}`;
  };

  // Start Batch Processing
  const handleStartProcessing = async () => {
    const selected = mediaItems.filter((m) => m.selected);
    if (selected.length === 0) return;

    cancelProcessingRef.current = false;
    setIsProcessing(true);

    const initialJobs: ProcessingJob[] = selected.map((item) => ({
      id: `job_${item.id}`,
      mediaId: item.id,
      mediaName: item.name,
      mediaType: item.type,
      originalSize: item.size,
      status: "pending",
      progress: 0,
    }));

    setJobs(initialJobs);

    // Bounded concurrency processor (2 at a time)
    const concurrency = 2;
    let jobIdx = 0;

    const processNext = async () => {
      if (cancelProcessingRef.current) return;
      if (jobIdx >= initialJobs.length) return;

      const currentJob = initialJobs[jobIdx++];
      const media = selected.find((m) => m.id === currentJob.mediaId);
      if (!media) return;

      // Update to processing
      setJobs((prev) =>
        prev.map((j) =>
          j.id === currentJob.id ? { ...j, status: "processing", progress: 10 } : j
        )
      );

      try {
        if (media.type === "image") {
          const res = await processImageWithWatermarks(
            media.file,
            layers,
            exportOptions
          );

          if (cancelProcessingRef.current) return;

          const outputName = generateOutputFilename(media.name, res.blob.type);
          setJobs((prev) =>
            prev.map((j) =>
              j.id === currentJob.id
                ? {
                    ...j,
                    status: "completed",
                    progress: 100,
                    resultBlob: res.blob,
                    outputSize: res.blob.size,
                    outputName,
                  }
                : j
            )
          );
        } else if (media.type === "video") {
          const res = await processVideoWithWatermarks(
            media.file,
            layers,
            videoTiming,
            exportOptions,
            (prog) => {
              setJobs((prev) =>
                prev.map((j) =>
                  j.id === currentJob.id ? { ...j, progress: prog.percentage } : j
                )
              );
            },
            () => cancelProcessingRef.current
          );

          if (cancelProcessingRef.current) return;

          const outputName = generateOutputFilename(media.name, res.mimeType);
          setJobs((prev) =>
            prev.map((j) =>
              j.id === currentJob.id
                ? {
                    ...j,
                    status: "completed",
                    progress: 100,
                    resultBlob: res.blob,
                    outputSize: res.blob.size,
                    outputName,
                  }
                : j
            )
          );
        }
      } catch (err: any) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === currentJob.id
              ? {
                  ...j,
                  status: "failed",
                  progress: 0,
                  error: err?.message || "Failed to process media",
                }
              : j
          )
        );
      }

      await processNext();
    };

    // Run parallel workers up to concurrency
    const workers = [];
    for (let i = 0; i < Math.min(concurrency, initialJobs.length); i++) {
      workers.push(processNext());
    }

    await Promise.all(workers);
    setIsProcessing(false);
  };

  const handleCancelProcessing = () => {
    cancelProcessingRef.current = true;
    setIsProcessing(false);
    setJobs((prev) =>
      prev.map((j) =>
        j.status === "processing" || j.status === "pending"
          ? { ...j, status: "cancelled", progress: 0 }
          : j
      )
    );
  };

  const handleRetryFailed = () => {
    setJobs((prev) =>
      prev.map((j) => (j.status === "failed" ? { ...j, status: "pending", error: undefined } : j))
    );
    handleStartProcessing();
  };

  const activeMedia = mediaItems.find((m) => m.id === activeMediaId) || null;
  const [isDownloadingCurrent, setIsDownloadingCurrent] = useState(false);

  const handleDownloadCurrent = async () => {
    if (!activeMedia) return;
    setIsDownloadingCurrent(true);

    try {
      if (activeMedia.type === "image") {
        const res = await processImageWithWatermarks(
          activeMedia.file,
          layers,
          exportOptions
        );
        const outputName = generateOutputFilename(activeMedia.name, res.blob.type);
        const url = URL.createObjectURL(res.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = outputName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else if (activeMedia.type === "video") {
        const res = await processVideoWithWatermarks(
          activeMedia.file,
          layers,
          videoTiming,
          exportOptions
        );
        const outputName = generateOutputFilename(activeMedia.name, res.mimeType);
        const url = URL.createObjectURL(res.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = outputName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to download watermarked file");
    } finally {
      setIsDownloadingCurrent(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* 3-Panel Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Media Library (280px - 320px) */}
        <div className="w-full lg:w-80 h-64 lg:h-full shrink-0">
          <MediaLibraryPanel
            mediaItems={mediaItems}
            activeMediaId={activeMediaId}
            onSelectMedia={setActiveMediaId}
            onAddFiles={handleAddFiles}
            onRemoveMedia={handleRemoveMedia}
            onClearAll={handleClearAll}
            onToggleSelectAll={handleToggleSelectAll}
            onToggleSelectItem={handleToggleSelectItem}
          />
        </div>

        {/* Center Panel: Interactive Preview Viewport */}
        <div className="flex-1 h-96 lg:h-full relative overflow-hidden">
          <PreviewCanvas
            activeMedia={activeMedia}
            layers={layers}
            activeLayerId={activeLayerId}
            videoTiming={videoTiming}
            onUpdateLayer={handleUpdateLayer}
            onSelectLayer={setActiveLayerId}
            onDownloadCurrent={handleDownloadCurrent}
            isDownloadingCurrent={isDownloadingCurrent}
          />
        </div>

        {/* Right Panel: Watermark Controls (320px - 360px) */}
        <div className="w-full lg:w-96 h-auto lg:h-full shrink-0">
          <WatermarkControlsPanel
            layers={layers}
            activeLayerId={activeLayerId}
            videoTiming={videoTiming}
            exportOptions={exportOptions}
            activeMediaType={activeMedia?.type}
            mediaCount={mediaItems.length}
            isDownloadingCurrent={isDownloadingCurrent}
            onDownloadCurrent={handleDownloadCurrent}
            onStartProcessing={handleStartProcessing}
            onUpdateLayer={handleUpdateLayer}
            onSelectLayer={setActiveLayerId}
            onAddLayer={handleAddLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onDeleteLayer={handleDeleteLayer}
            onReorderLayer={handleReorderLayer}
            onUpdateVideoTiming={(updates) => setVideoTiming((prev) => ({ ...prev, ...updates }))}
            onUpdateExportOptions={(updates) => setExportOptions((prev) => ({ ...prev, ...updates }))}
            onApplyPreset={handleApplyPreset}
          />
        </div>
      </div>

      {/* Bottom Panel: Processing Queue & Quick Download Bar */}
      <ProcessingQueueSection
        jobs={jobs}
        isProcessing={isProcessing}
        exportOptions={exportOptions}
        mediaCount={mediaItems.length}
        activeMediaName={activeMedia?.name}
        activeMediaType={activeMedia?.type}
        isDownloadingCurrent={isDownloadingCurrent}
        onDownloadCurrent={handleDownloadCurrent}
        onCancel={handleCancelProcessing}
        onRetryFailed={handleRetryFailed}
        onStartProcessing={handleStartProcessing}
      />
    </div>
  );
}
