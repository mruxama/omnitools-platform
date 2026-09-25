import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "omnitools_favorites";
const EVENT_KEY = "omnitools_favorites_updated";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFavorites = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    } catch {
      // Ignore local storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    const handleStorage = () => loadFavorites();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(EVENT_KEY, handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(EVENT_KEY, handleStorage);
    };
  }, [loadFavorites]);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(EVENT_KEY));
      } catch {
        // Ignore quota/permission errors
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
