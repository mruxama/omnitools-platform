"use client";

import React from "react";
import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import { ToolItem } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { useFavorites } from "@/lib/hooks/useFavorites";

interface ToolCardProps {
  tool: ToolItem;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(tool.id);

  return (
    <div className="group relative flex flex-col justify-between p-5 bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md rounded-2xl transition-all duration-200">
      <div>
        {/* Top bar: Icon, Badges, Favorite button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <ToolIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badges?.includes("popular") && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Popular
              </span>
            )}
            {tool.badges?.includes("featured") && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Featured
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(tool.id);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-muted/70 transition-colors"
              title={favorited ? "Remove from favorites" : "Add to favorites"}
              aria-label={favorited ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
            >
              <Star
                className={`w-4 h-4 ${
                  favorited ? "fill-amber-500 text-amber-500" : "hover:scale-110 transition-transform"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title and Category */}
        <div className="mb-2">
          <Link href={tool.path} className="focus:outline-none">
            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1">
              {tool.name}
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200" />
            </h3>
          </Link>
          <span className="block text-xs font-medium text-muted-foreground mt-0.5">
            {tool.categoryName}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      {/* Footer / CTA link */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground">Free & In-Browser</span>
        <Link
          href={tool.path}
          className="font-medium text-primary hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
        >
          Open Tool
        </Link>
      </div>
    </div>
  );
}
