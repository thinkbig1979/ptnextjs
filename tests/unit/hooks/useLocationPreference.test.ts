/**
 * Unit tests for useLocationPreference hook
 *
 * Tests the custom hook for persisting user location preference to localStorage
 * with automatic expiry handling and SSR safety.
 */

import { renderHook, act } from '@testing-library/react';
import {
  useLocationPreference,
  StoredLocation,
} from '@/hooks/useLocationPreference';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocationPreference', () => {
  const STORAGE_KEY = 'pt_user_location';
  const DEFAULT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  const mockLocation = {
    latitude: 43.7384,
    longitude: 7.4246,
    displayName: 'Monaco',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should return null when no stored location exists', () => {
      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(result.current.isExpired).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return stored location when valid', () => {
      const storedLocation: StoredLocation = {
        ...mockLocation,
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toEqual(storedLocation);
      expect(result.current.isExpired).toBe(false);
    });

    it('should load location with all required fields', () => {
      const storedLocation: StoredLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
        displayName: 'Paris, France',
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location?.latitude).toBe(48.8566);
      expect(result.current.location?.longitude).toBe(2.3522);
      expect(result.current.location?.displayName).toBe('Paris, France');
      expect(result.current.location?.timestamp).toBeDefined();
    });
  });

  describe('Expiry Handling', () => {
    it('should clear expired location automatically (default 30 days)', () => {
      const thirtyOneDaysAgo = Date.now() - (31 * 24 * 60 * 60 * 1000);
      const expiredLocation: StoredLocation = {
        ...mockLocation,
        timestamp: thirtyOneDaysAgo,
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(expiredLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(result.current.isExpired).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should NOT clear location within expiry period', () => {
      const twentyNineDaysAgo = Date.now() - (29 * 24 * 60 * 60 * 1000);
      const validLocation: StoredLocation = {
        ...mockLocation,
        timestamp: twentyNineDaysAgo,
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toEqual(validLocation);
      expect(result.current.isExpired).toBe(false);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should handle custom maxAge parameter', () => {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
      const expiredLocation: StoredLocation = {
        ...mockLocation,
        timestamp: eightDaysAgo,
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(expiredLocation));

      const { result } = renderHook(() => useLocationPreference(sevenDaysInMs));

      // Should be expired (8 days old, maxAge is 7 days)
      expect(result.current.location).toBeNull();
      expect(result.current.isExpired).toBe(true);
    });

    it('should NOT expire with custom maxAge if within range', () => {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const sixDaysAgo = Date.now() - (6 * 24 * 60 * 60 * 1000);
      const validLocation: StoredLocation = {
        ...mockLocation,
        timestamp: sixDaysAgo,
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validLocation));

      const { result } = renderHook(() => useLocationPreference(sevenDaysInMs));

      expect(result.current.location).toEqual(validLocation);
      expect(result.current.isExpired).toBe(false);
    });

    it('should treat location at exact expiry boundary as expired', () => {
      const exactlyThirtyDaysAgo = Date.now() - DEFAULT_MAX_AGE_MS - 1; // 1ms over
      const expiredLocation: StoredLocation = {
        ...mockLocation,
        timestamp: exactlyThirtyDaysAgo,
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(expiredLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.isExpired).toBe(true);
      expect(result.current.location).toBeNull();
    });
  });

  describe('Invalid Data Handling', () => {
    it('should handle invalid JSON gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      localStorageMock.setItem(STORAGE_KEY, 'invalid-json{{{');

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(result.current.isExpired).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error reading location preference from localStorage:',
        expect.any(Error)
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);

      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed location data (missing latitude)', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const malformedLocation = {
        // latitude missing
        longitude: 7.4246,
        displayName: 'Monaco',
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(malformedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid location data in localStorage, clearing'
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);

      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed location data (missing longitude)', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const malformedLocation = {
        latitude: 43.7384,
        // longitude missing
        displayName: 'Monaco',
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(malformedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);

      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed location data (missing displayName)', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const malformedLocation = {
        latitude: 43.7384,
        longitude: 7.4246,
        // displayName missing
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(malformedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);

      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed location data (missing timestamp)', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const malformedLocation = {
        latitude: 43.7384,
        longitude: 7.4246,
        displayName: 'Monaco',
        // timestamp missing
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(malformedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);

      consoleWarnSpy.mockRestore();
    });

    it('should handle location with wrong data types', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const wrongTypeLocation = {
        latitude: '43.7384', // Should be number
        longitude: 7.4246,
        displayName: 'Monaco',
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(wrongTypeLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('setLocation', () => {
    it('should store location with timestamp', () => {
      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.setLocation(mockLocation);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"latitude":43.7384')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"longitude":7.4246')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"displayName":"Monaco"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"timestamp"')
      );
    });

    it('should update state immediately after setting location', () => {
      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();

      act(() => {
        result.current.setLocation(mockLocation);
      });

      expect(result.current.location).toMatchObject(mockLocation);
      expect(result.current.location?.timestamp).toBeDefined();
      expect(result.current.isExpired).toBe(false);
    });

    it('should overwrite existing location', () => {
      const firstLocation = {
        latitude: 43.7384,
        longitude: 7.4246,
        displayName: 'Monaco',
      };

      const secondLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
        displayName: 'Paris',
      };

      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.setLocation(firstLocation);
      });

      expect(result.current.location?.displayName).toBe('Monaco');

      act(() => {
        result.current.setLocation(secondLocation);
      });

      expect(result.current.location?.displayName).toBe('Paris');
      expect(result.current.location?.latitude).toBe(48.8566);
    });

    it('should reset isExpired flag when setting new location', () => {
      // First, create an expired location
      const expiredLocation: StoredLocation = {
        ...mockLocation,
        timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(expiredLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.isExpired).toBe(true);

      // Now set a new location
      act(() => {
        result.current.setLocation({
          latitude: 48.8566,
          longitude: 2.3522,
          displayName: 'Paris',
        });
      });

      expect(result.current.isExpired).toBe(false);
    });

    it('should handle localStorage.setItem errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock setItem to throw error (e.g., quota exceeded)
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.setLocation(mockLocation);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error saving location preference to localStorage:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearLocation', () => {
    it('should remove from localStorage', () => {
      const storedLocation: StoredLocation = {
        ...mockLocation,
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toEqual(storedLocation);

      act(() => {
        result.current.clearLocation();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should update state to null', () => {
      const storedLocation: StoredLocation = {
        ...mockLocation,
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toEqual(storedLocation);

      act(() => {
        result.current.clearLocation();
      });

      expect(result.current.location).toBeNull();
      expect(result.current.isExpired).toBe(false);
    });

    it('should reset isExpired flag when clearing', () => {
      // Create an expired location
      const expiredLocation: StoredLocation = {
        ...mockLocation,
        timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(expiredLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.isExpired).toBe(true);

      act(() => {
        result.current.clearLocation();
      });

      expect(result.current.isExpired).toBe(false);
    });

    it('should handle clearing when no location exists', () => {
      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();

      act(() => {
        result.current.clearLocation();
      });

      expect(result.current.location).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should handle localStorage.removeItem errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock removeItem to throw error
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.clearLocation();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error clearing location preference from localStorage:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('SSR Behavior (Server-Side Rendering Safety)', () => {
    // Note: True SSR testing requires Next.js server rendering context.
    // JSDOM always has window defined, so we test the initial hydration state
    // and verify the hook is marked as a client component.

    it('should have null initial state before effect runs (simulates SSR hydration)', () => {
      // The hook returns null synchronously before useEffect runs,
      // which is the same behavior as SSR rendering
      const { result } = renderHook(() => useLocationPreference());

      // Initial synchronous render should be null (SSR-safe default)
      // The state updates happen in useEffect which runs after hydration
      expect(result.current.location).toBeNull();
      expect(result.current.isExpired).toBe(false);
    });

    it('should handle localStorage being unavailable gracefully', () => {
      // Mock localStorage to throw
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = jest.fn(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.location).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error reading location preference from localStorage:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
      localStorageMock.getItem = originalGetItem;
    });

    it('should not throw when calling setLocation with no localStorage', () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('localStorage full');
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useLocationPreference());

      expect(() => {
        act(() => {
          result.current.setLocation(mockLocation);
        });
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('isExpired Flag Tracking', () => {
    it('should set isExpired to true when location expires', () => {
      const expiredLocation: StoredLocation = {
        ...mockLocation,
        timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(expiredLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.isExpired).toBe(true);
      expect(result.current.location).toBeNull();
    });

    it('should set isExpired to false for valid location', () => {
      const validLocation: StoredLocation = {
        ...mockLocation,
        timestamp: Date.now(),
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validLocation));

      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.isExpired).toBe(false);
      expect(result.current.location).toEqual(validLocation);
    });

    it('should set isExpired to false when no location exists', () => {
      const { result } = renderHook(() => useLocationPreference());

      expect(result.current.isExpired).toBe(false);
      expect(result.current.location).toBeNull();
    });

    it('should track expiry state through the lifecycle', () => {
      // Start with no location
      const { result } = renderHook(() => useLocationPreference());
      expect(result.current.isExpired).toBe(false);

      // Set a location
      act(() => {
        result.current.setLocation(mockLocation);
      });
      expect(result.current.isExpired).toBe(false);

      // Clear the location
      act(() => {
        result.current.clearLocation();
      });
      expect(result.current.isExpired).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle location with negative coordinates', () => {
      const southernLocation = {
        latitude: -33.8688,
        longitude: 151.2093,
        displayName: 'Sydney, Australia',
      };

      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.setLocation(southernLocation);
      });

      expect(result.current.location?.latitude).toBe(-33.8688);
      expect(result.current.location?.longitude).toBe(151.2093);
    });

    it('should handle location with zero coordinates', () => {
      const zeroLocation = {
        latitude: 0,
        longitude: 0,
        displayName: 'Null Island',
      };

      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.setLocation(zeroLocation);
      });

      expect(result.current.location?.latitude).toBe(0);
      expect(result.current.location?.longitude).toBe(0);
    });

    it('should handle very long displayName', () => {
      const longName = 'A'.repeat(1000);
      const locationWithLongName = {
        ...mockLocation,
        displayName: longName,
      };

      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.setLocation(locationWithLongName);
      });

      expect(result.current.location?.displayName).toBe(longName);
      expect(result.current.location?.displayName.length).toBe(1000);
    });

    it('should handle displayName with special characters', () => {
      const specialLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
        displayName: 'Paris, Île-de-France, 🇫🇷',
      };

      const { result } = renderHook(() => useLocationPreference());

      act(() => {
        result.current.setLocation(specialLocation);
      });

      expect(result.current.location?.displayName).toBe('Paris, Île-de-France, 🇫🇷');
    });
  });
});
