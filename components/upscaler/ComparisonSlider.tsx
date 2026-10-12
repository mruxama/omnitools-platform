'use client';

import React, { useState, useRef } from 'react';
import { Download, ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';
import { formatBytes } from '@/lib/video-compressor/bitrateCalculator';

interface ComparisonSliderProps {
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  upscaledUrl?: string;
  upscaledWidth?: number;
  upscaledHeight?: number;
  upscaledSize?: number;
  filename: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalUrl,
  originalWidth,
  originalHeight,
  originalSize,
  upscaledUrl,
  upscaledWidth,
  upscaledHeight,
  upscaledSize,
  filename,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Interactive Before / After Comparison
          </h3>
          <p className="text-xs text-slate-400">
            Slide horizontally to inspect super-resolution edge reconstruction.
          </p>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Main Interactive Split Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden bg-slate-950 select-none cursor-ew-resize border border-slate-200 dark:border-slate-800"
      >
        {/* Layer 1: Enhanced Image (Bottom) */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <img
            src={upscaledUrl || originalUrl}
            alt="Enhanced"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Layer 2: Original Image (Clipped Left by Slider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <img
              src={originalUrl}
              alt="Original"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Vertical Split Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] pointer-events-none z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center font-bold text-[10px]">
            ⇄
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-mono z-20">
          Original ({originalWidth}×{originalHeight})
        </div>
        <div className={`absolute top-3 right-3 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-mono font-bold z-20 ${
          upscaledUrl ? 'bg-emerald-600/90' : 'bg-slate-700/80'
        }`}>
          {upscaledUrl
            ? `Upscaled Result (${upscaledWidth}×${upscaledHeight})`
            : `Target Preview (${upscaledWidth || originalWidth * 2}×${upscaledHeight || originalHeight * 2}) — Click Upscale`}
        </div>
      </div>

      {/* Metrics & Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 font-mono space-y-0.5">
          <div>Input: {originalWidth}×{originalHeight} ({formatBytes(originalSize)})</div>
          {upscaledWidth && (
            <div className="text-indigo-600 font-semibold">
              Output: {upscaledWidth}×{upscaledHeight} ({upscaledSize ? formatBytes(upscaledSize) : ''})
            </div>
          )}
        </div>

        {upscaledUrl && (
          <a
            href={upscaledUrl}
            download={`upscaled_${filename}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Download Upscaled Image
          </a>
        )}
      </div>
    </div>
  );
};
