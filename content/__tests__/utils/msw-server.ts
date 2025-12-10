/**
 * MSW Server Setup for Integration Tests
 *
 * Configures Mock Service Worker for Node.js test environment
 */

import { setupServer } from 'msw/node';
import { handlers } from './msw-handlers';

// Setup MSW server with default handlers
export const server = setupServer(...handlers);

// Start server before all tests
export const setupMswServer = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

  // Reset handlers after each test
  afterEach(() => server.resetHandlers());

  // Clean up after all tests
  afterAll(() => server.close());
};
