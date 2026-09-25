"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Star, Sparkles } from "lucide-react";
import { ToolItem } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useRecentTools } from "@/lib/hooks/useRecentTools";

interface ToolHeaderProps {
  tool: ToolItem;
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecentTool } = useRecentTools();
  const favorited = isFavorite(tool.id);

  // Automatically track recently used tool
  useEffect(() => {
    addRecentTool(tool.id);
  }, [tool.id, addRecentTool]);

  return (
    <div className="space-y-4 mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-primary transition-colors">
          Tools
        </Link>
        <span>/</span>
        <Link href={`/tools/${tool.category}`} className="hover:text-primary transition-colors">
          {tool.categoryName}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{tool.name}</span>
      </div>

      {/* Main Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
            <ToolIcon name={tool.icon} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {tool.name}
              </h1>
              {tool.badges?.includes("popular") && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-3 h-3" /> Popular
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
              {tool.shortDescription}
            </p>
          </div>
        </div>

        {/* Action badges: Privacy + Favorite */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% In-Browser</span>
          </div>
          <button
            onClick={() => toggleFavorite(tool.id)}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            title={favorited ? "Remove from favorites" : "Save to favorites"}
            aria-label="Toggle favorite"
          >
            <Star className={`w-4 h-4 ${favorited ? "fill-amber-500 text-amber-500" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
