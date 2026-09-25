"use client";

import React, { useState, useEffect } from "react";
import {
  getConversionHistory,
  clearConversionHistory,
  deleteConversionHistoryItem,
} from "@/lib/converter/history";
import { ConversionHistoryItem } from "@/lib/converter/types";
import { X, History, Trash2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ConversionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConversionHistoryDrawer({
  isOpen,
  onClose,
}: ConversionHistoryDrawerProps) {
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

  const loadHistory = () => {
    setHistory(getConversionHistory());
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener("omnitools_history_updated", loadHistory);
    return () => window.removeEventListener("omnitools_history_updated", loadHistory);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-base text-foreground">Conversion History</h2>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={clearConversionHistory}
                  className="text-xs text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                  title="Clear all history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
                <History className="w-8 h-8 mx-auto opacity-30" />
                <p>No conversions yet.</p>
                <p className="text-[11px]">Converted files will appear here locally.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/20 border border-border rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.fileName}</p>
                      <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                        <span className="font-mono uppercase font-bold text-primary">
                          {item.inputFormat}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-mono uppercase font-bold text-foreground">
                          {item.outputFormat}
                        </span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteConversionHistoryItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50 text-muted-foreground font-mono">
                    <span>{formatBytes(item.originalSize)}</span>
                    {item.status === "success" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3 h-3" /> Success
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1 font-sans">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
