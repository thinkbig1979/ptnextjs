/**
 * AuthContext Basic Test Suite (without MSW)
 *
 * Tests authentication context provider basic functionality
 * using mocked fetch to avoid MSW setup complexity.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

// Import the actual AuthContext
import { AuthProvider, useAuth } from '@/lib/context/AuthContext';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

/**
 * Wrapper component for testing hooks
 */
function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext - Basic Tests', () => {
  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Mock fetch with default unauthenticated response
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Not authenticated' }),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Initial State', () => {
    it('provides unauthenticated state by default', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.role).toBeNull();
      expect(result.current.tier).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('has login, logout, and refreshUser functions', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refreshUser).toBe('function');
    });
  });

  describe('Login', () => {
    it('updates state on successful login', async () => {
      // Mock successful login response
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          // Initial auth check
          ok: false,
          status: 401,
          json: async () => ({ error: 'Not authenticated' }),
        })
        .mockResolvedValueOnce({
          // Login request
          ok: true,
          status: 200,
          json: async () => ({
            user: {
              id: 'vendor-tier2-001',
              email: 'vendor.tier2@example.com',
              role: 'vendor',
              tier: 'tier2',
            },
            message: 'Login successful',
          }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('vendor.tier2@example.com', 'StrongPass123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual({
        id: 'vendor-tier2-001',
        email: 'vendor.tier2@example.com',
        role: 'vendor',
        tier: 'tier2',
      });
      expect(result.current.error).toBeNull();
    });

    it('handles login error with invalid credentials', async () => {
      // Mock failed login response
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          // Initial auth check
          ok: false,
          status: 401,
          json: async () => ({ error: 'Not authenticated' }),
        })
        .mockResolvedValueOnce({
          // Login request fails
          ok: false,
          status: 401,
          json: async () => ({ error: 'Invalid email or password' }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpass');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Logout', () => {
    it('clears user state on logout', async () => {
      // Mock login then logout
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Not authenticated' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            user: {
              id: 'vendor-001',
              email: 'test@example.com',
              role: 'vendor',
              tier: 'free',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ message: 'Logout successful' }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.role).toBeNull();
      expect(result.current.tier).toBeNull();
    });

    it('redirects to login page on logout', async () => {
      // Mock login then logout
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Not authenticated' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            user: {
              id: 'vendor-001',
              email: 'test@example.com',
              role: 'vendor',
              tier: 'free',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ message: 'Logout successful' }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Logout
      act(() => {
        result.current.logout();
      });

      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('useAuth Hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });
});
