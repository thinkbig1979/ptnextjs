'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pt-favorites';

interface FavoriteItem {
  id: string;
  type: 'product' | 'vendor';
  addedAt: string;
}

function readFromStorage(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: FavoriteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(readFromStorage());
  }, []);

  const addFavorite = useCallback((id: string, type: 'product' | 'vendor') => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === id && f.type === type);
      if (exists) return prev;
      const next = [...prev, { id, type, addedAt: new Date().toISOString() }];
      writeToStorage(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string, type: 'product' | 'vendor') => {
    setFavorites((prev) => {
      const next = prev.filter((f) => !(f.id === id && f.type === type));
      writeToStorage(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string, type: 'product' | 'vendor') => {
    return favorites.some((f) => f.id === id && f.type === type);
  }, [favorites]);

  const toggleFavorite = useCallback((id: string, type: 'product' | 'vendor') => {
    if (isFavorite(id, type)) {
      removeFavorite(id, type);
    } else {
      addFavorite(id, type);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}
