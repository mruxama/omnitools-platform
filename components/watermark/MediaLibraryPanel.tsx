"use client";

import React, { useState, useRef } from "react";
import { MediaItem } from "@/lib/watermark/types";
import { formatBytes } from "@/lib/utils";
import {
  Upload,
  Image as ImageIcon,
  Film,
  Trash2,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  Filter,
  Plus,
  AlertCircle,
} from "lucide-react";

interface MediaLibraryPanelProps {
  mediaItems: MediaItem[];
  activeMediaId: string | null;
  onSelectMedia: (id: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveMedia: (id: string) => void;
  onClearAll: () => void;
  onToggleSelectAll: () => void;
  onToggleSelectItem: (id: string) => void;
}

export function MediaLibraryPanel({
  mediaItems,
  activeMediaId,
  onSelectMedia,
  onAddFiles,
  onRemoveMedia,
  onClearAll,
  onToggleSelectAll,
  onToggleSelectItem,
}: MediaLibraryPanelProps) {
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = mediaItems.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const allSelected =
    filteredItems.length > 0 && filteredItems.every((item) => item.selected);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/80">
      {/* Top Header */}
      <div className="p-4 border-b border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">Media Library</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {mediaItems.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg border transition-colors ${
                viewMode === "grid"
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg border transition-colors ${
                viewMode === "list"
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filterType === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({mediaItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("image")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filterType === "image"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Images ({mediaItems.filter((i) => i.type === "image").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("video")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filterType === "video"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Videos ({mediaItems.filter((i) => i.type === "video").length})
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="p-3 border-b border-border/80">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/10 scale-[0.99]"
              : "border-border/80 hover:border-primary/60 hover:bg-muted/30"
          }`}
        >
          <Upload className="w-5 h-5 mx-auto text-primary mb-1.5" />
          <p className="text-xs font-semibold text-foreground">
            Drop images & videos here
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            JPG, PNG, WebP, MP4, MOV, WebM
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Action buttons below dropzone */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[11px]">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span>Select All</span>
          </button>

          {mediaItems.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-destructive hover:underline flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Media Items List/Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No media added yet</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Upload images or videos above to begin watermarking.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredItems.map((item) => {
              const isActive = item.id === activeMediaId;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectMedia(item.id)}
                  className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                    isActive
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-muted/40 relative overflow-hidden flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === "video" ? (
                      <Film className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}

                    {/* Checkbox overlay */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectItem(item.id);
                      }}
                      className="absolute top-1.5 left-1.5 z-10"
                    >
                      <button
                        type="button"
                        className="w-5 h-5 rounded bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background"
                      >
                        {item.selected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Media Type Badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-background/80 backdrop-blur-sm border border-border text-foreground uppercase">
                      {item.type}
                    </div>

                    {/* Remove button hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMedia(item.id);
                      }}
                      className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2 space-y-0.5">
                    <p className="text-[11px] font-semibold text-foreground truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{item.width}×{item.height}</span>
                      <span>{formatBytes(item.size)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredItems.map((item) => {
              const isActive = item.id === activeMediaId;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectMedia(item.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectItem(item.id);
                      }}
                    >
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : item.type === "video" ? (
                        <Film className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.width}×{item.height} • {formatBytes(item.size)}
                        {item.duration ? ` • ${Math.round(item.duration)}s` : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMedia(item.id);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
