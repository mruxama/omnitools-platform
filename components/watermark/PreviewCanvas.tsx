"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MediaItem,
  WatermarkLayer,
  VideoTimingConfig,
} from "@/lib/watermark/types";
import {
  calculateLayerMediaCoordinates,
  calculateWatermarkAlpha,
} from "@/lib/watermark/coordinates";
import { renderWatermarkLayer } from "@/lib/watermark/imageProcessor";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Grid,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

interface PreviewCanvasProps {
  activeMedia: MediaItem | null;
  layers: WatermarkLayer[];
  activeLayerId: string;
  videoTiming: VideoTimingConfig;
  onUpdateLayer: (id: string, updates: Partial<WatermarkLayer>) => void;
  onSelectLayer: (id: string) => void;
}

export function PreviewCanvas({
  activeMedia,
  layers,
  activeLayerId,
  videoTiming,
  onUpdateLayer,
  onSelectLayer,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0 = fit, 0.5, 1.0, 2.0
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isMuted, setIsMuted] = useState(true);

  // Dragging and resizing state
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

  // Active layer
  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  // Draw preview loop onto HTML5 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMedia) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = activeMedia.width || 1280;
    const height = activeMedia.height || 720;
    canvas.width = width;
    canvas.height = height;

    const logoCache = new Map<string, HTMLImageElement>();

    const render = async () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw base media
      if (activeMedia.type === "image") {
        const img = new Image();
        img.src = activeMedia.thumbnailUrl;
        if (img.complete) {
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          await new Promise((r) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, width, height);
              r(null);
            };
          });
        }
      } else if (activeMedia.type === "video" && videoRef.current) {
        try {
          ctx.drawImage(videoRef.current, 0, 0, width, height);
        } catch {
          // ignore seek render errors
        }
      }

      // If Before/After mode is toggled, skip watermarks to show original
      if (showBeforeAfter) {
        return;
      }

      // Draw guidelines if enabled
      if (showGuidelines) {
        ctx.save();
        ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
        ctx.lineWidth = Math.max(1, Math.round(width * 0.0015));
        ctx.setLineDash([6, 6]);

        // Center lines
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Safe margins (5%)
        const marginX = width * 0.05;
        const marginY = height * 0.05;
        ctx.strokeRect(marginX, marginY, width - marginX * 2, height - marginY * 2);
        ctx.restore();
      }

      // Draw watermark layers
      const timeForAlpha = activeMedia.type === "video" ? currentTime : undefined;

      for (const layer of layers) {
        if (!layer.visible) continue;

        const effectiveAlpha = calculateWatermarkAlpha(layer.opacity, timeForAlpha, videoTiming);
        if (effectiveAlpha <= 0) continue;

        const adjustedLayer = {
          ...layer,
          opacity: Math.round(effectiveAlpha * 100),
        };

        await renderWatermarkLayer(ctx, adjustedLayer, width, height, logoCache);

        // Highlight active layer bounding box
        if (layer.id === activeLayerId && !layer.tiled) {
          const coords = calculateLayerMediaCoordinates(layer, width, height);
          ctx.save();
          ctx.translate(coords.centerX, coords.centerY);
          if (coords.rotation !== 0) ctx.rotate((coords.rotation * Math.PI) / 180);

          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = Math.max(2, Math.round(width * 0.002));
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(-coords.width / 2, -coords.height / 2, coords.width, coords.height);

          // Corner handles
          const handleSize = Math.max(8, Math.round(width * 0.01));
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);

          const corners = [
            [-coords.width / 2, -coords.height / 2],
            [coords.width / 2, -coords.height / 2],
            [coords.width / 2, coords.height / 2],
            [-coords.width / 2, coords.height / 2],
          ];

          corners.forEach(([cx, cy]) => {
            ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
          });

          ctx.restore();
        }
      }
    };

    render();
  }, [
    activeMedia,
    layers,
    activeLayerId,
    currentTime,
    videoTiming,
    showGuidelines,
    showBeforeAfter,
  ]);

  // Video time update listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedVideoMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  // Dragging on canvas to update position
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeMedia || !activeLayer || activeLayer.locked || activeLayer.tiled) return;
    setIsDraggingLayer(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingLayer || !dragStartPos || !activeMedia || !activeLayer) return;

    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert pixel delta into normalized percentage delta
    const deltaXPercent = (dx / rect.width) * 100;
    const deltaYPercent = (dy / rect.height) * 100;

    const newOffsetX = (activeLayer.position.offsetXPercent || 0) + deltaXPercent;
    const newOffsetY = (activeLayer.position.offsetYPercent || 0) + deltaYPercent;

    onUpdateLayer(activeLayer.id, {
      position: {
        ...activeLayer.position,
        offsetXPercent: Math.max(-50, Math.min(50, Math.round(newOffsetX))),
        offsetYPercent: Math.max(-50, Math.min(50, Math.round(newOffsetY))),
      },
    });

    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDraggingLayer(false);
    setDragStartPos(null);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-muted/20 relative select-none overflow-hidden"
    >
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Toolbar: Aspect ratio & info */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-background/80 backdrop-blur-md border border-border/80 rounded-xl shadow-sm text-xs font-semibold text-foreground">
          {activeMedia ? (
            <span className="px-2 py-0.5">
              {activeMedia.width} × {activeMedia.height}px
              {activeMedia.type === "video" ? ` (${Math.round(duration)}s)` : ""}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-muted-foreground">No media selected</span>
          )}
        </div>

        {/* Center & Right Toolbar: Zoom, Guides, Before/After, Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-background/80 backdrop-blur-md border border-border/80 rounded-xl shadow-sm">
          {/* Guidelines Toggle */}
          <button
            type="button"
            onClick={() => setShowGuidelines(!showGuidelines)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showGuidelines ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
            title="Toggle Alignment Guidelines"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Before / After Toggle */}
          <button
            type="button"
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              showBeforeAfter ? "bg-amber-500/10 text-amber-600" : "text-muted-foreground hover:bg-muted"
            }`}
            title="Toggle Before/After Comparison"
          >
            {showBeforeAfter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showBeforeAfter ? "Original" : "Preview"}</span>
          </button>

          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-1 text-muted-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.25))}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {activeMedia ? (
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            className="transition-transform duration-100 shadow-2xl rounded-lg overflow-hidden border border-border/80 bg-background relative"
          >
            {/* Hidden Video element for decoding frames */}
            {activeMedia.type === "video" && (
              <video
                ref={videoRef}
                src={activeMedia.thumbnailUrl}
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedVideoMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Render Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`max-w-full max-h-[70vh] object-contain block ${
                isDraggingLayer ? "cursor-grabbing" : "cursor-grab"
              }`}
            />
          </div>
        ) : (
          <div className="text-center p-8 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Interactive Preview</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select or upload an image or video from the left library to preview your watermark in real time.
            </p>
          </div>
        )}
      </div>

      {/* Video Player Bottom Bar (if active media is video) */}
      {activeMedia?.type === "video" && (
        <div className="p-3 border-t border-border/80 bg-background/90 backdrop-blur-md flex items-center gap-3">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Scrubber */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">
              {Math.floor(currentTime)}s
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleScrub}
              className="flex-1 accent-primary"
            />
            <span className="text-[11px] font-mono text-muted-foreground w-10">
              {Math.floor(duration)}s
            </span>
          </div>

          {/* Mute toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
