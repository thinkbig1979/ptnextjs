/**
 * Base transformation utilities for TinaCMS to Payload CMS migration
 *
 * This module provides shared utility functions used across all entity transformers.
 * It handles common operations like slug generation, date parsing, reference resolution,
 * media path transformation, and data validation.
 */

import type { Payload } from 'payload';

/**
 * Result type for transformation operations
 * Provides success/failure status with warnings for data quality issues
 */
export interface TransformResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Generates a URL-friendly slug from text
 *
 * @param text - Input text to convert to slug
 * @returns URL-safe slug with lowercase letters, numbers, and hyphens
 *
 * @example
 * generateSlug("Alfa Laval Marine Systems") // "alfa-laval-marine-systems"
 * generateSlug("Product #123 (2024)") // "product-123-2024"
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

/**
 * Parses date string into Date object
 * Handles multiple date formats from TinaCMS markdown frontmatter
 *
 * @param dateString - Date string in various formats (ISO, YYYY-MM-DD, etc.)
 * @returns Date object or null if invalid/undefined
 *
 * @example
 * parseDate("2024-01-15") // Date object
 * parseDate("2024-01-15T10:30:00Z") // Date object
 * parseDate(undefined) // null
 */
export function parseDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Resolves a TinaCMS file reference to Payload collection ID
 *
 * TinaCMS uses file paths like "content/vendors/company-name.md"
 * This resolves them to Payload document IDs by querying the collection
 *
 * @param filePath - TinaCMS file reference path
 * @param collection - Payload collection slug to query
 * @param payload - Payload CMS instance
 * @returns Payload document ID or null if not found
 *
 * @example
 * await resolveReference("content/vendors/alfa-laval.md", "vendors", payload)
 * // Returns: "507f1f77bcf86cd799439011" (Payload vendor ID)
 */
export async function resolveReference(
  filePath: string | undefined,
  collection: string,
  payload: Payload
): Promise<string | null> {
  if (!filePath) return null;

  try {
    // Extract slug from file path
    // "content/vendors/company-name.md" -> "company-name"
    const slug = filePath
      .replace(/^content\/[^/]+\//, '')  // Remove "content/collection/"
      .replace(/\.md$/, '');              // Remove .md extension

    if (!slug) return null;

    // Query Payload to find document by slug
    const result = await payload.find({
      collection,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    });

    if (result.docs.length > 0) {
      return result.docs[0].id as string;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to resolve reference ${filePath} in ${collection}:`, error);
    return null;
  }
}

/**
 * Resolves multiple TinaCMS file references to Payload collection IDs
 *
 * @param filePaths - Array of TinaCMS file reference paths
 * @param collection - Payload collection slug to query
 * @param payload - Payload CMS instance
 * @returns Array of resolved Payload document IDs (excludes failed resolutions)
 *
 * @example
 * await resolveReferences([
 *   "content/tags/sustainable.md",
 *   "content/tags/marine.md"
 * ], "tags", payload)
 * // Returns: ["507f...", "507f..."]
 */
export async function resolveReferences(
  filePaths: string[] | undefined,
  collection: string,
  payload: Payload
): Promise<string[]> {
  if (!filePaths || filePaths.length === 0) return [];

  const resolvedIds = await Promise.all(
    filePaths.map(path => resolveReference(path, collection, payload))
  );

  // Filter out null values
  return resolvedIds.filter((id): id is string => id !== null);
}

/**
 * Transforms TinaCMS media path to public URL
 *
 * TinaCMS stores media as "/media/path/file.jpg"
 * This ensures the path is properly formatted for public access
 *
 * @param mediaPath - TinaCMS media path
 * @returns Public URL for media file
 *
 * @example
 * transformMediaPath("/media/company/logo.png") // "/media/company/logo.png"
 * transformMediaPath("media/company/logo.png")  // "/media/company/logo.png"
 * transformMediaPath(undefined) // ""
 */
export function transformMediaPath(mediaPath: string | undefined): string {
  if (!mediaPath) return '';

  // Ensure path starts with /
  if (!mediaPath.startsWith('/')) {
    return `/${mediaPath}`;
  }

  return mediaPath;
}

/**
 * Validates email address format
 *
 * @param email - Email address to validate
 * @returns True if email format is valid
 *
 * @example
 * isValidEmail("contact@example.com") // true
 * isValidEmail("invalid-email") // false
 */
export function isValidEmail(email: string | undefined): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 *
 * @param url - URL to validate
 * @returns True if URL format is valid
 *
 * @example
 * isValidUrl("https://example.com") // true
 * isValidUrl("not a url") // false
 */
export function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts numeric value from string or number
 * Useful for parsing mixed-format data from TinaCMS
 *
 * @param value - Value to extract number from
 * @returns Numeric value or null if not parseable
 *
 * @example
 * extractNumericValue("123") // 123
 * extractNumericValue(456) // 456
 * extractNumericValue("15 meters") // 15
 * extractNumericValue("invalid") // null
 */
export function extractNumericValue(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null;

  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  // Try to extract first number from string
  const match = value.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
  }

  return null;
}
