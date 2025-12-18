/**
 * Lazy-loading Payload Config Utility
 *
 * This module provides a lazy-loaded version of the Payload CMS config to avoid
 * circular dependency issues that can occur in Next.js standalone builds.
 *
 * The problem: Top-level imports of `@/payload.config` can cause:
 *   "ReferenceError: Cannot access 'X' before initialization"
 *
 * The solution: Use dynamic imports to defer loading until runtime.
 *
 * Usage:
 *   import { getPayloadConfig, getPayloadClient } from '@/lib/utils/get-payload-config';
 *
 *   // Option 1: Get config for use with getPayload
 *   const config = await getPayloadConfig();
 *   const payload = await getPayload({ config });
 *
 *   // Option 2: Get initialized payload client directly (recommended)
 *   const payload = await getPayloadClient();
 */

import { getPayload, type Payload } from 'payload';

// Cached promises to ensure we only load once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let configPromise: Promise<any> | null = null;
let payloadPromise: Promise<Payload> | null = null;

/**
 * Lazily loads and returns the Payload CMS configuration.
 * The config is cached after first load for performance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPayloadConfig(): Promise<any> {
  if (!configPromise) {
    configPromise = import('@/payload.config').then(m => m.default);
  }
  return configPromise;
}

/**
 * Lazily initializes and returns the Payload CMS client.
 * This is the recommended way to get a Payload instance.
 * The client is cached after first initialization.
 */
export async function getPayloadClient(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = (async () => {
      const config = await getPayloadConfig();
      return getPayload({ config });
    })();
  }
  return payloadPromise;
}

/**
 * Resets the cached config and client.
 * Only use this in tests or when you need to reload the configuration.
 */
export function resetPayloadCache(): void {
  configPromise = null;
  payloadPromise = null;
}
