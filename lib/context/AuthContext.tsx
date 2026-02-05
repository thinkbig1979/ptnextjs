'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { JWTPayload } from '@/lib/utils/jwt';

/**
 * Authentication Context State
 */
interface AuthContextState {
  user: JWTPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: 'admin' | 'vendor' | null;
  tier: 'free' | 'tier1' | 'tier2' | 'tier3' | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Create Authentication Context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Manages global authentication state using React Context API.
 * Handles login, logout, token refresh, and automatic session restoration.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Check if user is authenticated on mount
   * Validates token from httpOnly cookie
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API endpoint that reads httpOnly cookie
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // Silently handle auth check failures (expected on public pages)
      // No logging needed - this is normal behavior for unauthenticated users
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login function
   * Calls backend API, which sets httpOnly cookie
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Update user state from response
      setUser(data.user);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout function
   * Clears httpOnly cookie and resets state
   */
  const logout = useCallback(() => {
    // Call logout API to clear cookies
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(console.error);

    // Reset state immediately
    setUser(null);
    setError(null);

    // Redirect to login page
    router.push('/vendor/login');
  }, [router]);

  /**
   * Refresh user data
   * Re-fetches current user from backend
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 401) {
        // Token expired or invalid
        setUser(null);
        router.push('/vendor/login');
      }
    } catch (err) {
      console.error('Refresh user failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to refresh user';
      setError(message);
    }
  }, [router]);

  /**
   * Check authentication on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Setup automatic token refresh and status sync
   * Refresh token every 50 minutes (tokens expire in 1 hour)
   * Sync user status every 5 minutes to catch approval status changes
   *
   * Note: Using user?.id as dependency instead of full user object
   * to avoid unnecessary effect re-runs on user property changes.
   */
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;

    // Token refresh interval (50 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          // Refresh failed, logout user
          logout();
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
        logout();
      }
    }, 50 * 60 * 1000); // 50 minutes

    // Status sync interval (5 minutes) - Syncs user status to catch approval changes
    const statusSyncInterval = setInterval(async () => {
      try {
        await refreshUser();
      } catch (err) {
        console.debug('Status sync failed:', err);
        // Don't logout on status sync failure, just log it
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(refreshInterval);
      clearInterval(statusSyncInterval);
    };
  }, [userId, logout, refreshUser]);

  const value: AuthContextState = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    role: user?.role || null,
    tier: user?.tier || null,
    status: user?.status || null,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 *
 * Custom hook to consume authentication context.
 * Must be used within AuthProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *
 *   return <div>Welcome {user.email}</div>;
 * }
 * ```
 */
export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
