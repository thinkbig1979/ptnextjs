'use client';

import { useEffect, useState } from 'react';

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

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    // SSR safety: Only run on client
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setLocationState(null);
        setIsExpired(false);
        return;
      }

      const parsed: StoredLocation = JSON.parse(stored);

      // Validate structure
      if (
        typeof parsed.latitude !== 'number' ||
        typeof parsed.longitude !== 'number' ||
        typeof parsed.displayName !== 'string' ||
        typeof parsed.timestamp !== 'number'
      ) {
        console.warn('Invalid location data in localStorage, clearing');
        localStorage.removeItem(STORAGE_KEY);
        setLocationState(null);
        setIsExpired(false);
        return;
      }

      // Check expiry
      const age = Date.now() - parsed.timestamp;
      const expired = age > maxAge;

      if (expired) {
        // Auto-clear expired location
        localStorage.removeItem(STORAGE_KEY);
        setLocationState(null);
        setIsExpired(true);
      } else {
        setLocationState(parsed);
        setIsExpired(false);
      }
    } catch (error) {
      console.warn('Error reading location preference from localStorage:', error);
      // Clear corrupt data
      localStorage.removeItem(STORAGE_KEY);
      setLocationState(null);
      setIsExpired(false);
    }
  }, [maxAge]);

  const setLocation = (location: Omit<StoredLocation, 'timestamp'>) => {
    // SSR safety: Only run on client
    if (typeof window === 'undefined') return;

    const storedLocation: StoredLocation = {
      ...location,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLocation));
      setLocationState(storedLocation);
      setIsExpired(false);
    } catch (error) {
      console.error('Error saving location preference to localStorage:', error);
    }
  };

  const clearLocation = () => {
    // SSR safety: Only run on client
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      setLocationState(null);
      setIsExpired(false);
    } catch (error) {
      console.error('Error clearing location preference from localStorage:', error);
    }
  };

  return {
    location,
    setLocation,
    clearLocation,
    isExpired,
  };
}
