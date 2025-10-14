/**
 * Mock Service Worker (MSW) Browser Setup
 *
 * This file configures MSW for browser environment (Storybook, manual testing).
 * It uses a service worker to intercept network requests in the browser.
 *
 * To use in development:
 * 1. Run: npx msw init public/
 * 2. Import this file in your app entry point
 * 3. Call: worker.start()
 *
 * @see https://mswjs.io/docs/getting-started/integrate/browser
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Create MSW worker instance with all handlers
 */
export const worker = setupWorker(...handlers);

/**
 * Start worker (call this in your app entry point for development)
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn',
  });
}
