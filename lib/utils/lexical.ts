/**
 * Lexical Rich Text Utilities
 *
 * Lightweight helpers for extracting text from Lexical JSON structures.
 */

/**
 * Extract plain text from a Lexical JSON description field.
 * Handles string, object (Lexical JSON), null, and undefined inputs.
 */
export function extractTextFromDescription(description: unknown): string {
  if (typeof description === 'string') return description;
  if (!description || typeof description !== 'object') return '';

  try {
    const root = (description as { root?: { children?: { children?: { text?: string }[] }[] } }).root;
    if (!root?.children) return '';

    return root.children
      .flatMap((para) => para.children?.map((child) => child.text || '') || [])
      .join(' ');
  } catch {
    return '';
  }
}
