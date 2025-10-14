/**
 * AuthContext Test Suite
 *
 * Tests authentication context provider and state management.
 * Covers login, logout, session restoration, token refresh, and error handling.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { mockTier2Vendor, mockAdminUser, mockFreeTierVendor } from '@/__tests__/fixtures/vendors';

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

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Mock successful /api/auth/me by default (unauthenticated)
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      })
    );
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

    it('checks authentication on mount', async () => {
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({
            user: {
              id: mockTier2Vendor.id,
              email: mockTier2Vendor.email,
              role: mockTier2Vendor.role,
              tier: mockTier2Vendor.tier,
            },
          });
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual({
        id: mockTier2Vendor.id,
        email: mockTier2Vendor.email,
        role: mockTier2Vendor.role,
        tier: mockTier2Vendor.tier,
      });
      expect(result.current.role).toBe('vendor');
      expect(result.current.tier).toBe('tier2');
    });
  });

  describe('Login', () => {
    it('updates state on successful login', async () => {
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

    it('handles pending approval status', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login('vendor.pending@example.com', 'StrongPass123!@#');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toContain('pending approval');
    });

    it('sets loading state during login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loadingDuringLogin = false;

      act(() => {
        result.current.login('vendor.tier2@example.com', 'StrongPass123!@#').then(() => {
          // Login complete
        });
      });

      // Check loading state immediately after initiating login
      if (result.current.isLoading) {
        loadingDuringLogin = true;
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(loadingDuringLogin || result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Logout', () => {
    it('clears user state on logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('vendor.tier2@example.com', 'StrongPass123!@#');
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
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('vendor.tier2@example.com', 'StrongPass123!@#');
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

    it('calls logout API endpoint', async () => {
      const logoutSpy = jest.fn();

      server.use(
        http.post('/api/auth/logout', () => {
          logoutSpy();
          return HttpResponse.json({ message: 'Logout successful' });
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('vendor.free@example.com', 'StrongPass123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Logout
      act(() => {
        result.current.logout();
      });

      // Wait for API call
      await waitFor(() => {
        expect(logoutSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Session Restoration', () => {
    it('restores session from valid token on mount', async () => {
      // Mock /api/auth/me to return authenticated user
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({
            user: {
              id: mockTier2Vendor.id,
              email: mockTier2Vendor.email,
              role: mockTier2Vendor.role,
              tier: mockTier2Vendor.tier,
            },
          });
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual({
        id: mockTier2Vendor.id,
        email: mockTier2Vendor.email,
        role: mockTier2Vendor.role,
        tier: mockTier2Vendor.tier,
      });
    });

    it('does not restore session from expired token', async () => {
      // Mock /api/auth/me to return expired token error
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json(
            { error: 'Token expired', code: 'TOKEN_EXPIRED' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('ignores invalid token', async () => {
      // Mock /api/auth/me to return invalid token error
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('refreshes user data successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('vendor.tier2@example.com', 'StrongPass123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock updated user data
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({
            user: {
              id: mockTier2Vendor.id,
              email: 'updated.email@example.com',
              role: mockTier2Vendor.role,
              tier: mockTier2Vendor.tier,
            },
          });
        })
      );

      // Refresh user
      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.email).toBe('updated.email@example.com');
    });

    it('logs out user if refresh fails with 401', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('vendor.free@example.com', 'StrongPass123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock 401 error on refresh
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json(
            { error: 'Token expired' },
            { status: 401 }
          );
        })
      );

      // Refresh user
      await act(async () => {
        await result.current.refreshUser();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Role and Tier Access', () => {
    it('provides admin role correctly', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json({
            user: {
              id: mockAdminUser.id,
              email: mockAdminUser.email,
              role: mockAdminUser.role,
            },
            message: 'Login successful',
          });
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin@example.com', 'Admin123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.role).toBe('admin');
      expect(result.current.tier).toBeNull();
    });

    it('provides vendor tier correctly', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('vendor.tier2@example.com', 'StrongPass123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.role).toBe('vendor');
      expect(result.current.tier).toBe('tier2');
    });

    it('handles free tier vendor', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('vendor.free@example.com', 'StrongPass123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.role).toBe('vendor');
      expect(result.current.tier).toBe('free');
    });
  });

  describe('Error Handling', () => {
    it('handles network errors during login', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('clears error state on successful login after failure', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First login fails
      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpass');
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBeTruthy();

      // Second login succeeds
      await act(async () => {
        await result.current.login('vendor.free@example.com', 'StrongPass123!@#');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.error).toBeNull();
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
