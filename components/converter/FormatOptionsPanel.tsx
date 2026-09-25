"use client";

import React from "react";
import { FormatDefinition, GenericConversionOptions } from "@/lib/converter/types";
import { Sliders, Volume2, Image as ImageIcon, FileText, Archive } from "lucide-react";

interface FormatOptionsPanelProps {
  format: FormatDefinition;
  options: GenericConversionOptions;
  onChangeOptions: (newOptions: GenericConversionOptions) => void;
}

export function FormatOptionsPanel({
  format,
  options,
  onChangeOptions,
}: FormatOptionsPanelProps) {
  const supported = format.supportedOptions;
  if (!supported || Object.keys(supported).length === 0) {
    return null;
  }

  const update = (patch: Partial<GenericConversionOptions>) => {
    onChangeOptions({ ...options, ...patch });
  };

  return (
    <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground pb-2 border-b border-border">
        <Sliders className="w-3.5 h-3.5 text-primary" />
        <span>Conversion Options for {format.displayName}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Quality slider */}
        {supported.quality && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <label>Quality</label>
              <span className="font-mono text-foreground font-bold">{options.quality ?? 85}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={options.quality ?? 85}
              onChange={(e) => update({ quality: parseInt(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        )}

        {/* Width & Height */}
        {supported.width && (
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Width (px)</label>
            <input
              type="number"
              min={1}
              placeholder="Auto / Original"
              value={options.width || ""}
              onChange={(e) => update({ width: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {supported.height && (
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Height (px)</label>
            <input
              type="number"
              min={1}
              placeholder="Auto / Original"
              value={options.height || ""}
              onChange={(e) => update({ height: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Grayscale */}
        {supported.grayscale && (
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="opt_grayscale"
              checked={options.grayscale || false}
              onChange={(e) => update({ grayscale: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="opt_grayscale" className="text-muted-foreground font-medium cursor-pointer">
              Convert to Grayscale (B&W)
            </label>
          </div>
        )}

        {/* Audio Sample Rate */}
        {supported.sampleRate && (
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Sample Rate</label>
            <select
              value={options.sampleRate || 44100}
              onChange={(e) => update({ sampleRate: parseInt(e.target.value) })}
              className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={44100}>44.1 kHz (CD Quality)</option>
              <option value={48000}>48.0 kHz (Studio / Broadcast)</option>
              <option value={22050}>22.05 kHz (Low Bitrate)</option>
              <option value={16000}>16.0 kHz (Voice / Speech)</option>
            </select>
          </div>
        )}

        {/* Audio Channels */}
        {supported.channels && (
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Audio Channels</label>
            <select
              value={options.channels || 2}
              onChange={(e) => update({ channels: parseInt(e.target.value) as 1 | 2 })}
              className="w-full px-2.5 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={2}>Stereo (2 Channels)</option>
              <option value={1}>Mono (1 Channel)</option>
            </select>
          </div>
        )}

        {/* Volume */}
        {supported.volume && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <label>Volume</label>
              <span className="font-mono text-foreground font-bold">
                {Math.round((options.volume ?? 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={2.0}
              step={0.1}
              value={options.volume ?? 1.0}
              onChange={(e) => update({ volume: parseFloat(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        )}

        {/* Archive Compression Level */}
        {supported.compressionLevel && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <label>Compression Level</label>
              <span className="font-mono text-foreground font-bold">{options.compressionLevel ?? 6}</span>
            </div>
            <input
              type="range"
              min={1}
              max={9}
              step={1}
              value={options.compressionLevel ?? 6}
              onChange={(e) => update({ compressionLevel: parseInt(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
