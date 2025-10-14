/**
 * React Testing Library Custom Configuration
 *
 * This file provides custom render functions that wrap components with
 * all necessary providers (Auth, Theme, Toast, etc.).
 *
 * Usage:
 * import { renderWithProviders, renderWithAuth } from '@/__tests__/setup/react-testing-library.config';
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

/**
 * Type definition for mock auth context value
 */
export interface MockAuthContextValue {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'vendor';
    tier?: 'free' | 'tier1' | 'tier2';
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: 'admin' | 'vendor' | null;
  tier: 'free' | 'tier1' | 'tier2' | null;
  login: jest.Mock;
  logout: jest.Mock;
  refreshUser: jest.Mock;
  updateProfile?: jest.Mock;
}

/**
 * Default mock auth context value (unauthenticated)
 */
const defaultAuthContext: MockAuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null,
  tier: null,
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
  updateProfile: jest.fn(),
};

/**
 * Mock AuthContext for testing
 *
 * Note: This should be replaced with actual AuthContext once implemented
 */
const MockAuthContext = React.createContext<MockAuthContextValue>(defaultAuthContext);

/**
 * Mock Auth Provider for testing
 */
export const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  value?: Partial<MockAuthContextValue>;
}> = ({ children, value }) => {
  const contextValue = { ...defaultAuthContext, ...value };
  return <MockAuthContext.Provider value={contextValue}>{children}</MockAuthContext.Provider>;
};

/**
 * All Providers Wrapper
 *
 * Wraps components with all necessary providers for testing
 */
interface AllProvidersProps {
  children: React.ReactNode;
  authValue?: Partial<MockAuthContextValue>;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children, authValue }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <MockAuthProvider value={authValue}>
        {children}
      </MockAuthProvider>
    </ThemeProvider>
  );
};

/**
 * Custom render options
 */
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: Partial<MockAuthContextValue>;
  authContext?: Partial<MockAuthContextValue>;
}

/**
 * Custom render function with all providers
 *
 * @example
 * const { getByRole } = renderWithProviders(<MyComponent />);
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  const { authValue, authContext, ...renderOptions } = options || {};

  // Support both authValue and authContext for backward compatibility
  const authContextValue = authContext || authValue;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders authValue={authContextValue}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Render with authenticated user
 *
 * @example
 * const { getByText } = renderWithAuth(<MyComponent />, {
 *   user: { id: '1', email: 'test@example.com', role: 'vendor', tier: 'tier2' }
 * });
 */
export function renderWithAuth(
  ui: ReactElement,
  options?: {
    user?: {
      id?: string;
      email?: string;
      role?: 'admin' | 'vendor';
      tier?: 'free' | 'tier1' | 'tier2';
    };
    renderOptions?: Omit<RenderOptions, 'wrapper'>;
  }
): RenderResult {
  const defaultUser = {
    id: 'test-user-001',
    email: 'test@example.com',
    role: 'vendor' as const,
    tier: 'free' as const,
  };

  const user = { ...defaultUser, ...options?.user };

  return renderWithProviders(ui, {
    authValue: {
      user,
      isAuthenticated: true,
      isLoading: false,
    },
    ...options?.renderOptions,
  });
}

/**
 * Render with admin user
 *
 * @example
 * const { getByRole } = renderWithAdmin(<AdminComponent />);
 */
export function renderWithAdmin(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return renderWithAuth(ui, {
    user: {
      id: 'admin-001',
      email: 'admin@example.com',
      role: 'admin',
    },
    renderOptions: options,
  });
}

/**
 * Render with specific tier vendor
 *
 * @example
 * const { getByRole } = renderWithTier(<ProfileEditor />, 'tier2');
 */
export function renderWithTier(
  ui: ReactElement,
  tier: 'free' | 'tier1' | 'tier2',
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return renderWithAuth(ui, {
    user: {
      id: `vendor-${tier}-001`,
      email: `vendor.${tier}@example.com`,
      role: 'vendor',
      tier,
    },
    renderOptions: options,
  });
}

/**
 * Wait for loading to finish
 *
 * Useful for components that show loading states
 *
 * @example
 * renderWithProviders(<MyComponent />);
 * await waitForLoadingToFinish();
 * expect(screen.getByText('Content')).toBeInTheDocument();
 */
export async function waitForLoadingToFinish(): Promise<void> {
  const { waitForElementToBeRemoved, queryByTestId, queryByText } = await import('@testing-library/react');

  // Wait for common loading indicators to disappear
  const loadingSpinner = queryByTestId('loading-spinner');
  const loadingText = queryByText(/loading/i);

  if (loadingSpinner) {
    await waitForElementToBeRemoved(() => queryByTestId('loading-spinner'));
  }

  if (loadingText) {
    await waitForElementToBeRemoved(() => queryByText(/loading/i));
  }
}

/**
 * Custom screen utilities with additional helpers
 */
export { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';
