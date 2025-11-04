/**
 * Lexical Content Helpers
 *
 * Utilities for working with Lexical JSON format from Payload CMS
 */

import { lexicalToPlainText, type LexicalDocument } from '@/lib/transformers';

/**
 * Safely extracts plain text from a description field that might be:
 * - HTML string
 * - A Lexical JSON object
 * - A stringified Lexical JSON
 * - Plain text
 * - undefined/null
 */
export function extractDescriptionText(description: any): string {
  if (!description) {
    return '';
  }

  // If it's already a string
  if (typeof description === 'string') {
    // Check if it contains HTML tags
    if (description.includes('<') && description.includes('>')) {
      // Strip HTML tags using regex
      return description
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' ') // Replace nbsp with space
        .replace(/&amp;/g, '&')  // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }

    // Check if it's a stringified JSON
    if (description.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(description);
        if (parsed.root && parsed.root.children) {
          return lexicalToPlainText(parsed as LexicalDocument);
        }
      } catch (e) {
        // If parsing fails, it's probably plain text with braces, return as is
        return description;
      }
    }
    return description;
  }

  // If it's a Lexical document object
  if (typeof description === 'object' && description.root && description.root.children) {
    return lexicalToPlainText(description as LexicalDocument);
  }

  // Fallback: try to convert to string
  return String(description);
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extract plain text from description and truncate
 */
export function getDescriptionPreview(description: any, maxLength: number = 150): string {
  const plainText = extractDescriptionText(description);
  return truncateText(plainText, maxLength);
}
