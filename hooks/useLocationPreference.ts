'use client';

import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';

export interface StoredLocation {
  latitude: number;
  longitude: number;
  displayName: string;
  timestamp: number;
}

export interface UseLocationPreferenceResult {
  location: StoredLocation | null;
  setLocation: (location: Omit<StoredLocation, 'timestamp'>) => void;
  clearLocation: () => void;
  isExpired: boolean;
}

const STORAGE_KEY = 'pt_user_location';
const DEFAULT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Module-level cache for localStorage reads to avoid expensive I/O on each call
// Cache is invalidated on storage events (cross-tab sync) and direct updates
let locationCache: { value: StoredLocation | null; timestamp: number } | null = null;

// Subscribe to storage events for cross-tab synchronization
const storageSubscribers = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      // Invalidate cache on storage change
      locationCache = null;
      // Notify all subscribers
      storageSubscribers.forEach(callback => callback());
    }
  });
}

function invalidateCache() {
  locationCache = null;
  storageSubscribers.forEach(callback => callback());
}

function getCachedLocation(): StoredLocation | null {
  if (typeof window === 'undefined') return null;

  // Return cached value if available and recent (within 100ms to handle rapid reads)
  if (locationCache && (Date.now() - locationCache.timestamp) < 100) {
    return locationCache.value;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      locationCache = { value: null, timestamp: Date.now() };
      return null;
    }

    const parsed: StoredLocation = JSON.parse(stored);

    // Validate structure
    if (
      typeof parsed.latitude !== 'number' ||
      typeof parsed.longitude !== 'number' ||
      typeof parsed.displayName !== 'string' ||
      typeof parsed.timestamp !== 'number'
    ) {
      localStorage.removeItem(STORAGE_KEY);
      locationCache = { value: null, timestamp: Date.now() };
      return null;
    }

    locationCache = { value: parsed, timestamp: Date.now() };
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    locationCache = { value: null, timestamp: Date.now() };
    return null;
  }
}

/**
 * Custom hook for persisting user location preference to localStorage
 *
 * Features:
 * - Stores location with automatic timestamp
 * - Configurable expiry (default: 30 days)
 * - SSR-safe (returns null during server rendering)
 * - Auto-clears expired locations on read
 *
 * @param maxAge - Maximum age in milliseconds before location expires (default: 30 days)
 * @returns Hook result with location state and management functions
 *
 * @example
 * const { location, setLocation, clearLocation, isExpired } = useLocationPreference();
 *
 * // Set location
 * setLocation({
 *   latitude: 43.7384,
 *   longitude: 7.4246,
 *   displayName: 'Monaco'
 * });
 *
 * // Check if expired
 * if (isExpired) {
 *   console.log('Location preference has expired');
 * }
 */
export function useLocationPreference(
  maxAge: number = DEFAULT_MAX_AGE_MS
): UseLocationPreferenceResult {
  const [location, setLocationState] = useState<StoredLocation | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Initialize from cached localStorage on mount (client-side only)
  useEffect(() => {
    // SSR safety: Only run on client
    if (typeof window === 'undefined') return;

    // Subscribe to storage changes for cross-tab sync
    const handleStorageChange = () => {
      const cached = getCachedLocation();
      if (!cached) {
        setLocationState(null);
        setIsExpired(false);
        return;
      }

      // Check expiry
      const age = Date.now() - cached.timestamp;
      const expired = age > maxAge;

      if (expired) {
        localStorage.removeItem(STORAGE_KEY);
        invalidateCache();
        setLocationState(null);
        setIsExpired(true);
      } else {
        setLocationState(cached);
        setIsExpired(false);
      }
    };

    // Add to subscribers for cross-tab sync
    storageSubscribers.add(handleStorageChange);

    // Initial read from cache
    const cached = getCachedLocation();
    if (!cached) {
      setLocationState(null);
      setIsExpired(false);
    } else {
      // Check expiry
      const age = Date.now() - cached.timestamp;
      const expired = age > maxAge;

      if (expired) {
        // Auto-clear expired location
        localStorage.removeItem(STORAGE_KEY);
        invalidateCache();
        setLocationState(null);
        setIsExpired(true);
      } else {
        setLocationState(cached);
        setIsExpired(false);
      }
    }

    return () => {
      storageSubscribers.delete(handleStorageChange);
    };
  }, [maxAge]);

  const setLocation = useCallback((newLocation: Omit<StoredLocation, 'timestamp'>) => {
    // SSR safety: Only run on client
    if (typeof window === 'undefined') return;

    const storedLocation: StoredLocation = {
      ...newLocation,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLocation));
      // Update cache immediately
      locationCache = { value: storedLocation, timestamp: Date.now() };
      setLocationState(storedLocation);
      setIsExpired(false);
    } catch (error) {
      console.error('Error saving location preference to localStorage:', error);
    }
  }, []);

  const clearLocation = useCallback(() => {
    // SSR safety: Only run on client
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      invalidateCache();
      setLocationState(null);
      setIsExpired(false);
    } catch (error) {
      console.error('Error clearing location preference from localStorage:', error);
    }
  }, []);

  return {
    location,
    setLocation,
    clearLocation,
    isExpired,
  };
}
