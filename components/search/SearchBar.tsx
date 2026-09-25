"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onOpenSearch: () => void;
  className?: string;
}

export function SearchBar({ onOpenSearch, className = "" }: SearchBarProps) {
  return (
    <div
      onClick={onOpenSearch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenSearch();
        }
      }}
      className={`group relative flex items-center w-full max-w-2xl px-4 py-3.5 bg-card/90 hover:bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md rounded-2xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mr-3" />
      <span className="text-muted-foreground text-sm sm:text-base flex-1 truncate text-left">
        Search 30+ free tools (e.g., merge pdf, compress image, percentage, unit converter)...
      </span>
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-lg border border-border/80 font-mono font-medium shrink-0">
        <span className="text-[10px]">Ctrl</span>
        <span>+</span>
        <span>K</span>
      </div>
    </div>
  );
}
