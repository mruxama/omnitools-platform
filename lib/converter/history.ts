"use client";

import { ConversionHistoryItem } from "./types";

const HISTORY_STORAGE_KEY = "omnitools_converter_history";
const MAX_HISTORY_ITEMS = 30;

export function getConversionHistory(): ConversionHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversionHistory(item: Omit<ConversionHistoryItem, "id" | "timestamp">): ConversionHistoryItem {
  const newItem: ConversionHistoryItem = {
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  if (typeof window === "undefined") return newItem;

  try {
    const current = getConversionHistory();
    const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("omnitools_history_updated"));
  } catch {
    // Ignore quota errors
  }

  return newItem;
}

export function deleteConversionHistoryItem(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getConversionHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("omnitools_history_updated"));
  } catch {
    // Ignore
  }
}

export function clearConversionHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("omnitools_history_updated"));
  } catch {
    // Ignore
  }
}
