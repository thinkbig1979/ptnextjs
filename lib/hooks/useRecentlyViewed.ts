'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pt-recently-viewed';
const MAX_ITEMS = 20;

interface RecentItem {
  id: string;
  type: 'product' | 'vendor';
  name: string;
  image?: string;
  slug?: string;
  viewedAt: string;
}

function readFromStorage(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: RecentItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setRecentItems(readFromStorage());
  }, []);

  const trackView = useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setRecentItems((prev) => {
      // Remove existing entry for this item
      const filtered = prev.filter((r) => !(r.id === item.id && r.type === item.type));
      // Add to front
      const next = [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS);
      writeToStorage(next);
      return next;
    });
  }, []);

  const getByType = useCallback((type: 'product' | 'vendor') => {
    return recentItems.filter((item) => item.type === type);
  }, [recentItems]);

  const clearAll = useCallback(() => {
    setRecentItems([]);
    writeToStorage([]);
  }, []);

  return {
    recentItems,
    trackView,
    getByType,
    clearAll,
  };
}
