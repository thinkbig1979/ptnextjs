/**
 * TinaCMS to Payload CMS Transformation Layer
 *
 * Central export point for all transformation utilities used in the migration process.
 * This layer handles the conversion of TinaCMS markdown-based content to Payload CMS
 * database-backed content.
 *
 * @module transformers
 *
 * Usage:
 * ```typescript
 * import { transformVendorFromMarkdown, TransformResult } from '@/lib/transformers';
 *
 * const result = await transformVendorFromMarkdown(tinaCMSData, payload);
 * if (result.success) {
 *   console.log('Transformed:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */

// Base utilities
export {
  type TransformResult,
  generateSlug,
  parseDate,
  resolveReference,
  resolveReferences,
  transformMediaPath,
  isValidEmail,
  isValidUrl,
  extractNumericValue,
} from './base';

// Markdown to Lexical conversion
export {
  type LexicalDocument,
  type LexicalNode,
  type LexicalParagraphNode,
  type LexicalTextNode,
  markdownToLexical,
  lexicalToPlainText,
} from './markdown-to-lexical';

// Entity transformers
export {
  type TinaCMSVendor,
  transformVendorFromMarkdown,
} from './vendor';

export {
  type TinaCMSProduct,
  transformProductFromMarkdown,
} from './product';

export {
  type TinaCMSYacht,
  transformYachtFromMarkdown,
} from './yacht';
