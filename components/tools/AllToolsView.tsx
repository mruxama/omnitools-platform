"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";
import {
  CATEGORIES,
  getAllTools,
  ToolCategory,
  ToolItem,
} from "@/lib/tools/registry";

interface AllToolsViewProps {
  initialCategory?: ToolCategory | "all";
}

export function AllToolsView({ initialCategory = "all" }: AllToolsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState("");

  const allTools = useMemo(() => getAllTools(), []);

  const filteredTools = useMemo(() => {
    return allTools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.categoryName.toLowerCase().includes(q) ||
        tool.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [allTools, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          All Online Tools
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl">
          Browse our complete catalog of {allTools.length} free browser-based productivity utilities.
          Filter by category or search by keyword.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 bg-card border border-border rounded-2xl shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All Tools ({allTools.length})
          </button>
          {(Object.keys(CATEGORIES) as ToolCategory[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const count = allTools.filter((t) => t.category === catKey).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 ${
                  selectedCategory === catKey
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tools..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl">
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="text-base font-semibold text-foreground">No tools matched your criteria</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or selecting another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
