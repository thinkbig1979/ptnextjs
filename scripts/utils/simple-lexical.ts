/**
 * Simple markdown to Lexical converter
 *
 * Delegates to the full implementation in lib/transformers/markdown-to-lexical.ts
 * This file exists for convenience in migration scripts.
 */

import { markdownToLexical as fullMarkdownToLexical } from '../../lib/transformers/markdown-to-lexical';
import type { LexicalDocument } from '../../lib/transformers/markdown-to-lexical';

export function markdownToLexical(markdown: string): LexicalDocument {
  return fullMarkdownToLexical(markdown);
}
