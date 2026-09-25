"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "omnitools_recent_tools";
const EVENT_KEY = "omnitools_recent_updated";
const MAX_RECENT = 10;

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRecent = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentTools(JSON.parse(stored));
      } else {
        setRecentTools([]);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadRecent();

    const handleStorage = () => loadRecent();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(EVENT_KEY, handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(EVENT_KEY, handleStorage);
    };
  }, [loadRecent]);

  const addRecentTool = useCallback((toolId: string) => {
    setRecentTools((prev) => {
      const filtered = prev.filter((id) => id !== toolId);
      const next = [toolId, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(EVENT_KEY));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(EVENT_KEY));
    } catch {
      // Ignore
    }
  }, []);

  return { recentTools, addRecentTool, clearRecentTools, isLoaded };
}
