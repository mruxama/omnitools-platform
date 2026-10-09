"use client";

import React from "react";
import {
  WatermarkLayer,
  TextWatermarkLayer,
  LogoWatermarkLayer,
} from "@/lib/watermark/types";
import {
  Type,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
} from "lucide-react";

interface LayerManagerProps {
  layers: WatermarkLayer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<WatermarkLayer>) => void;
  onAddLayer: (type: "text" | "logo") => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: "up" | "down") => void;
}

export function LayerManager({
  layers,
  activeLayerId,
  onSelectLayer,
  onUpdateLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onReorderLayer,
}: LayerManagerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <span>Watermark Layers</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
            {layers.length}
          </span>
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddLayer("text")}
            className="px-2 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-semibold text-foreground flex items-center gap-1 transition-colors"
            title="Add text watermark"
          >
            <Type className="w-3 h-3 text-primary" /> + Text
          </button>
          <button
            type="button"
            onClick={() => onAddLayer("logo")}
            className="px-2 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-semibold text-foreground flex items-center gap-1 transition-colors"
            title="Add logo watermark"
          >
            <ImageIcon className="w-3 h-3 text-primary" /> + Logo
          </button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {layers.map((layer, index) => {
          const isActive = layer.id === activeLayerId;
          const isText = layer.type === "text";

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                isActive
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/70 bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isText ? <Type className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="truncate text-xs font-medium text-foreground">
                  {layer.name || (isText ? (layer as TextWatermarkLayer).text : (layer as LogoWatermarkLayer).assetName || "Logo")}
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Visibility */}
                <button
                  type="button"
                  onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                  className={`p-1 rounded hover:bg-muted text-muted-foreground ${
                    !layer.visible ? "opacity-40" : ""
                  }`}
                  title={layer.visible ? "Hide layer" : "Show layer"}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Lock */}
                <button
                  type="button"
                  onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
                  className={`p-1 rounded hover:bg-muted text-muted-foreground ${
                    layer.locked ? "text-amber-500" : ""
                  }`}
                  title={layer.locked ? "Unlock layer" : "Lock layer"}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                {/* Move Up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onReorderLayer(layer.id, "up")}
                  className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                  title="Bring forward"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={index === layers.length - 1}
                  onClick={() => onReorderLayer(layer.id, "down")}
                  className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                  title="Send backward"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => onDuplicateLayer(layer.id)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                  title="Duplicate layer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                {layers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteLayer(layer.id)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title="Delete layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
