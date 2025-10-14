/**
 * Custom Render Helper Utilities
 *
 * Additional helper functions for rendering components in tests
 * beyond the basic renderWithProviders function.
 */

import { ReactElement } from 'react';
import { RenderResult } from '@testing-library/react';
import { renderWithProviders, renderWithAuth, renderWithAdmin, renderWithTier } from '../setup/react-testing-library.config';

/**
 * Render with router context (Next.js App Router)
 *
 * Mocks Next.js useRouter hook for testing
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: {
    pathname?: string;
    query?: Record<string, string>;
    push?: jest.Mock;
    replace?: jest.Mock;
    back?: jest.Mock;
  }
): RenderResult {
  const mockRouter = {
    pathname: options?.pathname || '/',
    query: options?.query || {},
    push: options?.push || jest.fn(),
    replace: options?.replace || jest.fn(),
    back: options?.back || jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  };

  // Mock Next.js useRouter
  jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockRouter.pathname,
    useSearchParams: () => new URLSearchParams(mockRouter.query),
  }));

  return renderWithProviders(ui);
}

/**
 * Render with query parameters
 *
 * Useful for testing components that rely on URL query params
 */
export function renderWithQueryParams(
  ui: ReactElement,
  queryParams: Record<string, string>
): RenderResult {
  return renderWithRouter(ui, { query: queryParams });
}

/**
 * Render form component with Formik/React Hook Form wrapper
 *
 * Provides form context for testing form fields
 */
export function renderFormComponent(
  ui: ReactElement,
  options?: {
    initialValues?: Record<string, any>;
    onSubmit?: jest.Mock;
  }
): RenderResult {
  // This is a placeholder - implement based on your form library
  return renderWithProviders(ui);
}

/**
 * Re-export common render functions
 */
export { renderWithProviders, renderWithAuth, renderWithAdmin, renderWithTier };
