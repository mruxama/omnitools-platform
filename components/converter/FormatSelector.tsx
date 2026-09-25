"use client";

import React, { useState, useRef, useEffect } from "react";
import { FormatDefinition, FormatCategory } from "@/lib/converter/types";
import { ChevronDown, Search, Check } from "lucide-react";

interface FormatSelectorProps {
  availableFormats: FormatDefinition[];
  selectedFormatId: string;
  onSelectFormat: (formatId: string) => void;
  label?: string;
  disabled?: boolean;
}

const CATEGORY_NAMES: Record<FormatCategory, string> = {
  image: "Images",
  document: "Documents",
  audio: "Audio",
  video: "Video",
  spreadsheet: "Spreadsheets & Tables",
  presentation: "Presentations",
  archive: "Archives",
  vector: "Vector Graphics",
  ebook: "E-Books",
  font: "Fonts",
  data: "Data Interchange",
};

export function FormatSelector({
  availableFormats,
  selectedFormatId,
  onSelectFormat,
  label = "Convert to",
  disabled = false,
}: FormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFormat = availableFormats.find((f) => f.id === selectedFormatId);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = availableFormats.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.displayName.toLowerCase().includes(q) ||
      f.extensions.some((ext) => ext.includes(q))
    );
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, FormatDefinition[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-background hover:bg-muted/40 border border-border rounded-xl text-sm font-semibold text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <span className="flex items-center gap-2 truncate">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary uppercase text-xs font-mono font-bold">
            {selectedFormat?.id || "Select"}
          </span>
          <span className="truncate text-foreground text-xs sm:text-sm font-medium">
            {selectedFormat?.displayName || "Choose format..."}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 sm:w-80 max-h-96 overflow-hidden rounded-2xl bg-card border border-border shadow-xl p-2 animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="relative mb-2 px-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              placeholder="Search formats (e.g. webp, wav, pdf)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          {/* Grouped formats */}
          <div className="overflow-y-auto max-h-72 space-y-3 pr-1">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">
                No matching output formats found.
              </p>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_NAMES[category as FormatCategory] || category}
                  </div>
                  <div className="grid grid-cols-1 gap-0.5">
                    {items.map((format) => {
                      const isSelected = format.id === selectedFormatId;
                      return (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => {
                            onSelectFormat(format.id);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-1.5 py-0.5 rounded uppercase font-mono text-[10px] font-bold ${
                              isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              {format.id}
                            </span>
                            <span className="truncate">{format.displayName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {format.status === "BETA" && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-600 font-bold">
                                BETA
                              </span>
                            )}
                            {format.status === "COMING_SOON" && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-muted text-muted-foreground font-medium">
                                SOON
                              </span>
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
