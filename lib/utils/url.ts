/**
 * URL utility functions for client and server components
 *
 * IMPORTANT: This file must work in both client and server contexts,
 * so we cannot import Payload CMS modules here (they're server-only)
 */

/**
 * Ensures a URL has a proper protocol (http:// or https://)
 * Pure JavaScript implementation that works in both client and server
 *
 * @param url - The URL to sanitize
 * @returns Sanitized URL with protocol, or 'https://' if invalid
 *
 * @example
 * ensureUrlProtocol('google.com') // 'https://google.com'
 * ensureUrlProtocol('http://google.com') // 'http://google.com'
 * ensureUrlProtocol('https://google.com') // 'https://google.com'
 * ensureUrlProtocol('') // 'https://'
 */
export function ensureUrlProtocol(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return 'https://';
  }

  const trimmed = url.trim();

  // If URL already has a protocol, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If URL starts with '//', add https:
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Otherwise, add https://
  return `https://${trimmed}`;
}

/**
 * Validates if a URL is properly formatted
 * Pure JavaScript implementation that works in both client and server
 *
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Payload CMS hook to automatically sanitize URL fields before saving
 * Add this to any URL field in your Payload collection config
 *
 * @example
 * {
 *   name: 'website',
 *   type: 'text',
 *   hooks: {
 *     beforeChange: [sanitizeUrlHook]
 *   }
 * }
 */
export const sanitizeUrlHook = ({ value }: { value?: string }) => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return value;
  }

  const trimmed = value.trim();

  // If URL already has a protocol, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If URL starts with '//', add https:
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Otherwise, add https://
  return `https://${trimmed}`;
};
