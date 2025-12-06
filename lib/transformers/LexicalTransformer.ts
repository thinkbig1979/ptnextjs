/**
 * Lexical Transformer
 * Handles transformation of Payload's Lexical editor format to HTML and plain text
 */

import { lexicalToPlainText, type LexicalDocument } from './markdown-to-lexical';

interface PayloadLexicalNode {
  type: string;
  children?: PayloadLexicalNode[];
  text?: string;
  format?: number;
  url?: string;
  target?: string;
  tag?: string;
  listType?: string;
  newTab?: boolean;
  language?: string;
}

interface PayloadLexicalDocument {
  root?: PayloadLexicalNode;
  [key: string]: unknown;
}

/**
 * Transforms Lexical rich text format to HTML string
 * Handles the conversion of Payload's Lexical editor format to displayable HTML
 *
 * @param lexicalData - Lexical document, string, or null/undefined
 * @returns HTML string representation
 */
export function transformLexicalToHtml(lexicalData: PayloadLexicalDocument | string | null | undefined): string {
  if (!lexicalData) return '';

  // If it's already a string, return it
  if (typeof lexicalData === 'string') return lexicalData;

  // If it has a root node (Lexical document structure)
  if (lexicalData.root && lexicalData.root.children) {
    return lexicalNodeToHtml(lexicalData.root.children);
  }

  // Fallback to string conversion
  return String(lexicalData);
}

/**
 * Transforms Lexical rich text format to plain text string
 * Extracts only the text content without HTML tags
 *
 * @param lexicalData - Lexical document, string, or null/undefined
 * @returns Plain text string
 */
export function transformLexicalToPlainText(lexicalData: PayloadLexicalDocument | string | null | undefined): string {
  if (!lexicalData) return '';

  // If it's already a string, return it
  if (typeof lexicalData === 'string') {
    // Strip any HTML tags if present
    return lexicalData.replace(/<[^>]*>/g, '').trim();
  }

  // If it has a root node (Lexical document structure)
  if (lexicalData.root && lexicalData.root.children) {
    return lexicalToPlainText(lexicalData as unknown as LexicalDocument);
  }

  // Fallback to string conversion
  return String(lexicalData);
}

/**
 * Recursively converts Lexical nodes to HTML
 *
 * @param nodes - Array of Lexical nodes
 * @returns HTML string representation
 */
export function lexicalNodeToHtml(nodes: PayloadLexicalNode[]): string {
  if (!Array.isArray(nodes)) return '';

  return nodes.map(node => {
    if (!node || !node.type) return '';

    switch (node.type) {
      case 'paragraph':
        const pChildren = node.children ? lexicalNodeToHtml(node.children) : '';
        return `<p>${pChildren}</p>`;

      case 'heading':
        const hChildren = node.children ? lexicalNodeToHtml(node.children) : '';
        const tag = node.tag || 'h2';
        return `<${tag}>${hChildren}</${tag}>`;

      case 'text':
        let text = node.text || '';
        // Apply formatting
        if (node.format) {
          if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
          if (node.format & 2) text = `<em>${text}</em>`; // Italic
          if (node.format & 8) text = `<s>${text}</s>`; // Strikethrough
          if (node.format & 16) text = `<code>${text}</code>`; // Code
        }
        return text;

      case 'link':
        const linkChildren = node.children ? lexicalNodeToHtml(node.children) : '';
        return `<a href="${node.url || ''}"${node.target ? ` target="${node.target}"` : ''}>${linkChildren}</a>`;

      case 'list':
        const listTag = node.listType === 'number' || node.tag === 'ol' ? 'ol' : 'ul';
        const listChildren = node.children ? lexicalNodeToHtml(node.children) : '';
        return `<${listTag}>${listChildren}</${listTag}>`;

      case 'listitem':
        const itemChildren = node.children ? lexicalNodeToHtml(node.children) : '';
        return `<li>${itemChildren}</li>`;

      case 'quote':
        const quoteChildren = node.children ? lexicalNodeToHtml(node.children) : '';
        return `<blockquote>${quoteChildren}</blockquote>`;

      case 'code':
        const codeText = node.children ? node.children.map((c) => (c as { text?: string }).text || '').join('') : '';
        return `<pre><code${node.language ? ` class="language-${node.language}"` : ''}>${codeText}</code></pre>`;

      case 'horizontalrule':
        return '<hr />';

      default:
        // For unknown node types, try to render children
        if (node.children) {
          return lexicalNodeToHtml(node.children);
        }
        return '';
    }
  }).join('');
}
