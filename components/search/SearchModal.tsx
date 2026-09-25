"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, CornerDownLeft, Clock, Sparkles } from "lucide-react";
import { TOOLS_REGISTRY, ToolItem, searchTools, getPopularTools } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tools/ToolIcon";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("omnitools_recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const saveRecentSearch = (text: string) => {
    if (!text.trim()) return;
    const updated = [text, ...recentSearches.filter((s) => s.toLowerCase() !== text.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("omnitools_recent_searches", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const results: ToolItem[] = query.trim() ? searchTools(query) : getPopularTools().slice(0, 6);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (tool: ToolItem) => {
    if (query.trim()) saveRecentSearch(query.trim());
    onClose();
    router.push(tool.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-primary font-medium px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search all tools, categories, or keywords (e.g. merge, compress, percentage)..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted border border-border rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Recent Searches chips */}
        {!query.trim() && recentSearches.length > 0 && (
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-muted-foreground flex items-center gap-1 shrink-0 font-medium">
              <Clock className="w-3.5 h-3.5" /> Recent:
            </span>
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuery(s)}
                className="px-2 py-1 rounded bg-background border border-border hover:border-primary text-foreground shrink-0 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query.trim() && (
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Popular Tools
            </div>
          )}

          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-foreground">No tools found for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for general terms like "pdf", "image", "calculate", or "units"
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((tool, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleSelect(tool)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-card-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <ToolIcon name={tool.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {highlightMatch(tool.name, query)}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {tool.categoryName}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {highlightMatch(tool.shortDescription, query)}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="hidden sm:flex items-center gap-1 text-xs opacity-90 shrink-0">
                        <span>Open</span>
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation Instructions */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono">ESC</kbd> Close
            </span>
          </div>
          <span>100% Client-side Processing</span>
        </div>
      </div>
    </div>
  );
}
