/**
 * URL utility functions using Payload CMS's built-in URL sanitization
 */

import { sanitizeUrl as payloadSanitizeUrl, validateUrl as payloadValidateUrl } from '@payloadcms/richtext-lexical';

/**
 * Ensures a URL has a proper protocol (http:// or https://)
 * Uses Payload CMS's built-in sanitization
 *
 * @param url - The URL to sanitize
 * @returns Sanitized URL with protocol, or 'https://' if invalid
 *
 * @example
 * ensureUrlProtocol('google.com') // 'https://google.com' (auto-adds https)
 * ensureUrlProtocol('http://google.com') // 'http://google.com'
 * ensureUrlProtocol('https://google.com') // 'https://google.com'
 * ensureUrlProtocol('') // 'https://'
 */
export function ensureUrlProtocol(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return 'https://';
  }

  return payloadSanitizeUrl(url.trim());
}

/**
 * Validates if a URL is properly formatted
 * Uses Payload CMS's built-in validation
 *
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return payloadValidateUrl(url.trim());
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
