"use client";

import React, { useState } from "react";
import {
  WatermarkLayer,
  TextWatermarkLayer,
  LogoWatermarkLayer,
  WatermarkAnchor,
  VideoTimingConfig,
  ExportOptions,
  WatermarkPreset,
} from "@/lib/watermark/types";
import { LayerManager } from "./LayerManager";
import { BUILT_IN_PRESETS, loadUserPresets, saveUserPresets } from "@/lib/watermark/presets";
import {
  Type,
  Image as ImageIcon,
  Sliders,
  Move,
  Clock,
  Download,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Upload,
  RotateCw,
  Sparkles,
  Layers,
  FileCheck,
  Archive,
  Loader2,
} from "lucide-react";

interface WatermarkControlsPanelProps {
  layers: WatermarkLayer[];
  activeLayerId: string;
  videoTiming: VideoTimingConfig;
  exportOptions: ExportOptions;
  activeMediaType?: "image" | "video";
  mediaCount?: number;
  isDownloadingCurrent?: boolean;
  onDownloadCurrent?: () => void;
  onStartProcessing?: () => void;
  onUpdateLayer: (id: string, updates: Partial<WatermarkLayer>) => void;
  onSelectLayer: (id: string) => void;
  onAddLayer: (type: "text" | "logo") => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: "up" | "down") => void;
  onUpdateVideoTiming: (updates: Partial<VideoTimingConfig>) => void;
  onUpdateExportOptions: (updates: Partial<ExportOptions>) => void;
  onApplyPreset: (preset: WatermarkPreset) => void;
}

export function WatermarkControlsPanel({
  layers,
  activeLayerId,
  videoTiming,
  exportOptions,
  activeMediaType,
  mediaCount,
  isDownloadingCurrent,
  onDownloadCurrent,
  onStartProcessing,
  onUpdateLayer,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onReorderLayer,
  onUpdateVideoTiming,
  onUpdateExportOptions,
  onApplyPreset,
}: WatermarkControlsPanelProps) {
  // Accordion open states
  const [openSections, setOpenSections] = useState({
    layers: true,
    content: true,
    size: true,
    position: true,
    appearance: false,
    timing: false,
    presets: false,
    export: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];
  const isText = activeLayer?.type === "text";
  const textLayer = activeLayer as TextWatermarkLayer;
  const logoLayer = activeLayer as LogoWatermarkLayer;

  const fontFamilies = [
    { label: "Inter (Modern Sans)", value: "Inter, sans-serif" },
    { label: "Arial (Standard Sans)", value: "Arial, sans-serif" },
    { label: "Roboto (Clean)", value: "Roboto, sans-serif" },
    { label: "Montserrat (Geometric)", value: "Montserrat, sans-serif" },
    { label: "Georgia (Serif)", value: "Georgia, serif" },
    { label: "Courier New (Monospace)", value: "'Courier New', monospace" },
  ];

  const anchorGrid: WatermarkAnchor[] = [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const assetUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      onUpdateLayer(activeLayer.id, {
        assetUrl,
        assetName: file.name,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
      } as any);
    };
    img.src = assetUrl;
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border/80 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border/80">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" /> Watermark Inspector
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Precision controls applied to real exported media.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* PROMINENT DOWNLOAD ACTION CARD */}
        {onDownloadCurrent && (
          <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-2xl shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-primary" /> Export Output
              </span>
              {activeMediaType && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground uppercase">
                  {activeMediaType}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onDownloadCurrent}
              disabled={isDownloadingCurrent}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isDownloadingCurrent ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting {activeMediaType === "video" ? "Video" : "Image"}...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Watermarked {activeMediaType === "video" ? "Video" : "Image"}</span>
                </>
              )}
            </button>

            {mediaCount && mediaCount > 1 && onStartProcessing && (
              <button
                type="button"
                onClick={onStartProcessing}
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Archive className="w-3.5 h-3.5 text-primary" />
                <span>Process & Download All ({mediaCount}) as ZIP</span>
              </button>
            )}
          </div>
        )}

        {/* SECTION: Layers Manager */}
        <div className="border border-border/80 rounded-2xl p-3.5 bg-background">
          <LayerManager
            layers={layers}
            activeLayerId={activeLayerId}
            onSelectLayer={onSelectLayer}
            onUpdateLayer={onUpdateLayer}
            onAddLayer={onAddLayer}
            onDuplicateLayer={onDuplicateLayer}
            onDeleteLayer={onDeleteLayer}
            onReorderLayer={onReorderLayer}
          />
        </div>

        {/* SECTION: Text or Logo Content */}
        {activeLayer && (
          <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => toggleSection("content")}
              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                {isText ? <Type className="w-3.5 h-3.5 text-primary" /> : <ImageIcon className="w-3.5 h-3.5 text-primary" />}
                {isText ? "Text Settings" : "Logo Asset"}
              </span>
              {openSections.content ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSections.content && (
              <div className="p-3.5 space-y-3.5 border-t border-border/60">
                {isText ? (
                  <>
                    {/* Text Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Watermark Text</label>
                      <textarea
                        rows={2}
                        value={textLayer.text}
                        onChange={(e) => onUpdateLayer(activeLayer.id, { text: e.target.value })}
                        placeholder="Type watermark text..."
                        className="w-full px-3 py-2 text-xs bg-muted/30 border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    {/* Font Family */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Font Family</label>
                      <select
                        value={textLayer.fontFamily}
                        onChange={(e) => onUpdateLayer(activeLayer.id, { fontFamily: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-muted/30 border border-border rounded-xl"
                      >
                        {fontFamilies.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Weight & Color */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Weight</label>
                        <select
                          value={textLayer.fontWeight}
                          onChange={(e) => onUpdateLayer(activeLayer.id, { fontWeight: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs bg-muted/30 border border-border rounded-xl"
                        >
                          <option value="normal">Normal</option>
                          <option value="500">Medium</option>
                          <option value="bold">Bold</option>
                          <option value="900">Black</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={textLayer.color}
                            onChange={(e) => onUpdateLayer(activeLayer.id, { color: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                          />
                          <span className="text-xs font-mono text-foreground">{textLayer.color}</span>
                        </div>
                      </div>
                    </div>

                    {/* Text Shadow */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">Drop Shadow</span>
                        <input
                          type="checkbox"
                          checked={textLayer.shadow.enabled}
                          onChange={(e) =>
                            onUpdateLayer(activeLayer.id, {
                              shadow: { ...textLayer.shadow, enabled: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-primary rounded"
                        />
                      </div>
                      {textLayer.shadow.enabled && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-muted-foreground">Blur ({textLayer.shadow.blur}px)</span>
                            <input
                              type="range"
                              min={0}
                              max={20}
                              value={textLayer.shadow.blur}
                              onChange={(e) =>
                                onUpdateLayer(activeLayer.id, {
                                  shadow: { ...textLayer.shadow, blur: parseInt(e.target.value) },
                                })
                              }
                              className="w-full accent-primary"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground">Offset ({textLayer.shadow.offsetY}px)</span>
                            <input
                              type="range"
                              min={0}
                              max={15}
                              value={textLayer.shadow.offsetY}
                              onChange={(e) =>
                                onUpdateLayer(activeLayer.id, {
                                  shadow: {
                                    ...textLayer.shadow,
                                    offsetX: parseInt(e.target.value),
                                    offsetY: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-full accent-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Logo Asset Upload */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-muted-foreground">Upload Custom Logo</label>
                      <label className="border-2 border-dashed border-border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/80 transition-colors">
                        <Upload className="w-5 h-5 text-primary mb-1" />
                        <span className="text-xs font-semibold text-foreground">
                          {logoLayer.assetName || "Click to choose logo"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          PNG (Transparent), WebP, SVG, JPG
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {logoLayer.assetUrl && (
                        <div className="p-2 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Original Dimensions:</span>
                          <span className="font-semibold text-foreground">
                            {logoLayer.originalWidth} × {logoLayer.originalHeight}px
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION: Size & Opacity */}
        {activeLayer && (
          <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => toggleSection("size")}
              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-primary" /> Size & Opacity
              </span>
              {openSections.size ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSections.size && (
              <div className="p-3.5 space-y-4 border-t border-border/60">
                {/* Size Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Watermark Size</span>
                    <span className="text-primary font-bold">{activeLayer.size.percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={activeLayer.size.percentage}
                    onChange={(e) =>
                      onUpdateLayer(activeLayer.id, {
                        size: { ...activeLayer.size, percentage: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>5% (Small)</span>
                    <span>100% (Full Media)</span>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Opacity Level</span>
                    <span className="text-primary font-bold">{activeLayer.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={activeLayer.opacity}
                    onChange={(e) =>
                      onUpdateLayer(activeLayer.id, {
                        opacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0% (Invisible)</span>
                    <span>100% (Solid)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION: 3x3 Position Grid */}
        {activeLayer && (
          <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => toggleSection("position")}
              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Move className="w-3.5 h-3.5 text-primary" /> Placement & Grid
              </span>
              {openSections.position ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSections.position && (
              <div className="p-3.5 space-y-4 border-t border-border/60">
                {/* 3x3 Grid Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Anchor Position</label>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto p-2 bg-muted/40 rounded-xl border border-border">
                    {anchorGrid.map((anchor) => {
                      const isSelected = activeLayer.position.anchor === anchor;
                      return (
                        <button
                          key={anchor}
                          type="button"
                          onClick={() =>
                            onUpdateLayer(activeLayer.id, {
                              position: {
                                ...activeLayer.position,
                                anchor,
                                offsetXPercent: 0,
                                offsetYPercent: 0,
                              },
                            })
                          }
                          className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm scale-95"
                              : "bg-card border border-border/60 text-muted-foreground hover:bg-muted"
                          }`}
                          title={anchor}
                        >
                          <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-muted-foreground"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Margins */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Edge Margin</span>
                    <span className="text-primary font-bold">{activeLayer.position.marginPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={activeLayer.position.marginPercent}
                    onChange={(e) =>
                      onUpdateLayer(activeLayer.id, {
                        position: {
                          ...activeLayer.position,
                          marginPercent: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION: Rotation & Tiled Pattern */}
        {activeLayer && (
          <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => toggleSection("appearance")}
              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <RotateCw className="w-3.5 h-3.5 text-primary" /> Rotation & Pattern
              </span>
              {openSections.appearance ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSections.appearance && (
              <div className="p-3.5 space-y-4 border-t border-border/60">
                {/* Rotation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Rotation Angle</span>
                    <span className="text-primary font-bold">{activeLayer.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={activeLayer.rotation}
                    onChange={(e) => onUpdateLayer(activeLayer.id, { rotation: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex items-center gap-1 pt-1 justify-center">
                    {[-45, 0, 45, 90].map((angle) => (
                      <button
                        key={angle}
                        type="button"
                        onClick={() => onUpdateLayer(activeLayer.id, { rotation: angle })}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          activeLayer.rotation === angle
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {angle}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tiled Pattern */}
                <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-foreground">Tiled Pattern</span>
                      <p className="text-[10px] text-muted-foreground">Repeat diagonally across entire media</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={activeLayer.tiled}
                      onChange={(e) => onUpdateLayer(activeLayer.id, { tiled: e.target.checked })}
                      className="w-4 h-4 accent-primary rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION: Video Timing */}
        <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
          <button
            type="button"
            onClick={() => toggleSection("timing")}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-primary" /> Video Timing
            </span>
            {openSections.timing ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSections.timing && (
            <div className="p-3.5 space-y-3.5 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground">Interval Timing</span>
                  <p className="text-[10px] text-muted-foreground">Show only during specific timestamp</p>
                </div>
                <input
                  type="checkbox"
                  checked={videoTiming.enabled}
                  onChange={(e) => onUpdateVideoTiming({ enabled: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
              </div>

              {videoTiming.enabled && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Start Time (sec)</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={videoTiming.startTime}
                        onChange={(e) => onUpdateVideoTiming({ startTime: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs bg-muted/30 border border-border rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">End Time (sec)</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={videoTiming.endTime}
                        onChange={(e) => onUpdateVideoTiming({ endTime: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs bg-muted/30 border border-border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Fade In (sec)</span>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={videoTiming.fadeIn}
                        onChange={(e) => onUpdateVideoTiming({ fadeIn: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs bg-muted/30 border border-border rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Fade Out (sec)</span>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={videoTiming.fadeOut}
                        onChange={(e) => onUpdateVideoTiming({ fadeOut: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs bg-muted/30 border border-border rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION: Presets */}
        <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
          <button
            type="button"
            onClick={() => toggleSection("presets")}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Bookmark className="w-3.5 h-3.5 text-primary" /> Preset Library
            </span>
            {openSections.presets ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSections.presets && (
            <div className="p-3.5 space-y-2 border-t border-border/60">
              <p className="text-[11px] text-muted-foreground">Apply ready-made watermark layouts:</p>
              <div className="grid grid-cols-1 gap-1.5">
                {BUILT_IN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset)}
                    className="p-2.5 rounded-xl border border-border/70 hover:border-primary bg-card hover:bg-primary/5 text-left transition-all"
                  >
                    <p className="text-xs font-semibold text-foreground">{preset.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Export Settings */}
        <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
          <button
            type="button"
            onClick={() => toggleSection("export")}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Download className="w-3.5 h-3.5 text-primary" /> Output & Export Format
            </span>
            {openSections.export ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {openSections.export && (
            <div className="p-3.5 space-y-3.5 border-t border-border/60">
              {/* Suffix */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Filename Suffix</label>
                <input
                  type="text"
                  value={exportOptions.filenameSuffix}
                  onChange={(e) => onUpdateExportOptions({ filenameSuffix: e.target.value })}
                  placeholder="_watermarked"
                  className="w-full px-3 py-2 text-xs bg-muted/30 border border-border rounded-xl"
                />
              </div>

              {/* Format selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Image Format</label>
                <select
                  value={exportOptions.imageFormat}
                  onChange={(e) => onUpdateExportOptions({ imageFormat: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-muted/30 border border-border rounded-xl"
                >
                  <option value="original">Keep Original Format</option>
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/png">PNG (.png, preserves alpha)</option>
                  <option value="image/webp">WebP (.webp)</option>
                </select>
              </div>

              {/* Quality */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Compression Quality</span>
                  <span className="text-primary font-bold">{Math.round(exportOptions.imageQuality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  value={exportOptions.imageQuality}
                  onChange={(e) => onUpdateExportOptions({ imageQuality: parseFloat(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
