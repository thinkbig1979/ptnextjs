/**
 * Markdown to Lexical conversion utilities
 *
 * STUB IMPLEMENTATION - Basic conversion only
 * This provides a minimal viable transformation from Markdown to Lexical editor format.
 * A separate task will enhance this with full Markdown parsing capabilities.
 *
 * Lexical is Payload CMS's rich text editor format. It stores content as a JSON structure
 * representing document nodes (paragraphs, headings, lists, etc.).
 */

/**
 * Lexical document structure
 * Represents the root of a Lexical editor document
 */
export interface LexicalDocument {
  root: {
    type: 'root';
    format: string;
    indent: number;
    version: number;
    children: LexicalNode[];
    direction: 'ltr' | 'rtl' | null;
  };
}

/**
 * Lexical node types
 * Basic node structures supported in this stub implementation
 */
export interface LexicalNode {
  type: string;
  version: number;
  [key: string]: unknown;
}

/**
 * Lexical paragraph node
 */
export interface LexicalParagraphNode extends LexicalNode {
  type: 'paragraph';
  children: LexicalTextNode[];
  format: string;
  indent: number;
  direction: 'ltr' | 'rtl' | null;
}

/**
 * Lexical text node
 */
export interface LexicalTextNode extends LexicalNode {
  type: 'text';
  text: string;
  format: number;
  style: string;
  mode: 'normal' | 'token' | 'segmented';
  detail: number;
}

/**
 * Converts Markdown string to Lexical document format
 *
 * STUB IMPLEMENTATION:
 * - Converts text to simple paragraph nodes
 * - No advanced Markdown parsing (headings, lists, links, etc.)
 * - Preserves line breaks as separate paragraphs
 *
 * @param markdown - Markdown content string
 * @returns Lexical document structure
 *
 * @example
 * markdownToLexical("Hello world\n\nThis is a paragraph")
 * // Returns Lexical document with 2 paragraph nodes
 */
export function markdownToLexical(markdown: string | undefined): LexicalDocument {
  if (!markdown) {
    return createEmptyLexicalDocument();
  }

  // Split markdown into paragraphs (simple implementation)
  const paragraphs = markdown
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Convert each paragraph to a Lexical paragraph node
  const children: LexicalParagraphNode[] = paragraphs.map(text =>
    createParagraphNode(text)
  );

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: children.length > 0 ? children : [createParagraphNode('')],
      direction: 'ltr',
    },
  };
}

/**
 * Creates an empty Lexical document
 * Used when no content is provided
 *
 * @returns Empty Lexical document with single empty paragraph
 */
function createEmptyLexicalDocument(): LexicalDocument {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [createParagraphNode('')],
      direction: 'ltr',
    },
  };
}

/**
 * Creates a Lexical paragraph node with text content
 *
 * @param text - Text content for the paragraph
 * @returns Lexical paragraph node
 */
function createParagraphNode(text: string): LexicalParagraphNode {
  return {
    type: 'paragraph',
    version: 1,
    children: [createTextNode(text)],
    format: '',
    indent: 0,
    direction: 'ltr',
  };
}

/**
 * Creates a Lexical text node
 *
 * @param text - Text content
 * @returns Lexical text node
 */
function createTextNode(text: string): LexicalTextNode {
  return {
    type: 'text',
    version: 1,
    text,
    format: 0,
    style: '',
    mode: 'normal',
    detail: 0,
  };
}

/**
 * Converts Lexical document back to plain text
 * Useful for debugging and testing
 *
 * @param lexical - Lexical document
 * @returns Plain text representation
 */
export function lexicalToPlainText(lexical: LexicalDocument): string {
  const paragraphs: string[] = [];

  for (const node of lexical.root.children) {
    if (node.type === 'paragraph') {
      const paragraphNode = node as LexicalParagraphNode;
      const text = paragraphNode.children
        .map(child => (child as LexicalTextNode).text)
        .join('');
      paragraphs.push(text);
    }
  }

  return paragraphs.join('\n\n');
}
