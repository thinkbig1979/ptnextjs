/**
 * Mock Service Worker (MSW) Server Setup
 *
 * This file configures MSW for Node.js environment (Jest tests).
 * It intercepts network requests during test execution.
 *
 * @see https://mswjs.io/docs/getting-started/integrate/node
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Create MSW server instance with all handlers
 *
 * Server lifecycle (beforeAll/afterEach/afterAll) is managed in test-setup.js
 * This ensures consistent setup across all tests.
 */
export const server = setupServer(...handlers);

/**
 * Export MSW utilities for use in individual tests
 * Tests can override handlers using: server.use(...)
 */
export { http, HttpResponse } from 'msw';
