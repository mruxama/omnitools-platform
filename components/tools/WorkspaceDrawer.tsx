"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Clock, X, ArrowRight, Trash2, Shield } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useRecentTools } from "@/lib/hooks/useRecentTools";
import { getToolById } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tools/ToolIcon";

interface WorkspaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceDrawer({ isOpen, onClose }: WorkspaceDrawerProps) {
  const [activeTab, setActiveTab] = useState<"favorites" | "recent">("favorites");
  const { favorites, toggleFavorite } = useFavorites();
  const { recentTools, clearRecentTools } = useRecentTools();

  const favoriteItems = favorites.map((id) => getToolById(id)).filter(Boolean);
  const recentItems = recentTools.map((id) => getToolById(id)).filter(Boolean);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            My Workspace
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close workspace drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Preferences stored locally. No documents or data leave your device.</span>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "favorites"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === "favorites" ? "fill-primary" : ""}`} />
            Favorites ({favoriteItems.length})
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === "recent"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" />
            Recently Used ({recentItems.length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === "favorites" && (
            <>
              {favoriteItems.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-30 stroke-1" />
                  <p className="font-medium text-sm text-foreground">No favorite tools yet</p>
                  <p className="text-xs mt-1">
                    Click the star icon on any tool card to quickly access it here anytime.
                  </p>
                </div>
              ) : (
                favoriteItems.map((tool) =>
                  tool ? (
                    <div
                      key={tool.id}
                      className="group flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                    >
                      <Link
                        href={tool.path}
                        onClick={onClose}
                        className="flex items-center gap-3 min-w-0 flex-1"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <ToolIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {tool.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">{tool.categoryName}</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => toggleFavorite(tool.id)}
                        className="p-1.5 rounded-lg text-amber-500 hover:bg-muted ml-2"
                        title="Remove from favorites"
                      >
                        <Star className="w-4 h-4 fill-amber-500" />
                      </button>
                    </div>
                  ) : null
                )
              )}
            </>
          )}

          {activeTab === "recent" && (
            <>
              {recentItems.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-30 stroke-1" />
                  <p className="font-medium text-sm text-foreground">No recently used tools</p>
                  <p className="text-xs mt-1">
                    Tools you open will automatically appear here for quick reopening.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end pb-2">
                    <button
                      onClick={clearRecentTools}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear history
                    </button>
                  </div>
                  {recentItems.map((tool) =>
                    tool ? (
                      <Link
                        key={tool.id}
                        href={tool.path}
                        onClick={onClose}
                        className="group flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
                            <ToolIcon name={tool.icon} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {tool.name}
                            </h4>
                            <span className="text-xs text-muted-foreground">{tool.categoryName}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                      </Link>
                    ) : null
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
