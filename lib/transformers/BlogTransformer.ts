/**
 * Blog Transformer
 * Transforms Payload blog post documents to the BlogPost type
 */

import type { BlogPost } from '../types';
import type { PayloadBlogDocument, PayloadLexicalDocument, PayloadLexicalNode, PayloadRecord } from './PayloadTypes';
import { transformMediaPath } from './MediaTransformer';

/**
 * Converts Lexical JSON to HTML
 * This is a dedicated method for blog posts that handles JSON parsing
 *
 * @param lexicalData - Lexical document or JSON string
 * @returns HTML string representation
 */
export function lexicalToHtml(lexicalData: PayloadLexicalDocument | string | null | undefined): string {
  if (!lexicalData) {
    return '';
  }

  // Parse JSON string if needed
  let data = lexicalData;
  if (typeof lexicalData === 'string') {
    try {
      data = JSON.parse(lexicalData);
    } catch (e) {
      // If it's not JSON, return as-is (might be plain HTML/text)
      console.error('Failed to parse Lexical JSON:', e);
      return lexicalData;
    }
  }

  // Basic Lexical to HTML converter
  // This handles the most common node types
  const convertNode = (node: PayloadLexicalNode): string => {
    if (!node) return '';

    switch (node.type) {
      case 'root':
        return node.children?.map(convertNode).join('') || '';

      case 'paragraph':
        const content = node.children?.map(convertNode).join('') || '';
        return `<p>${content}</p>`;

      case 'heading':
        const tag = node.tag || 'h2';
        const headingContent = node.children?.map(convertNode).join('') || '';
        return `<${tag}>${headingContent}</${tag}>`;

      case 'text':
        let text = node.text || '';
        if (node.format) {
          if (node.format & 1) text = `<strong>${text}</strong>`;
          if (node.format & 2) text = `<em>${text}</em>`;
          if (node.format & 4) text = `<u>${text}</u>`;
          if (node.format & 8) text = `<code>${text}</code>`;
        }
        return text;

      case 'link':
        const linkContent = node.children?.map(convertNode).join('') || '';
        return `<a href="${node.url || ''}" target="${node.newTab ? '_blank' : '_self'}" rel="${node.newTab ? 'noopener noreferrer' : ''}">${linkContent}</a>`;

      case 'list':
        const listTag = node.listType === 'number' ? 'ol' : 'ul';
        const listContent = node.children?.map(convertNode).join('') || '';
        return `<${listTag}>${listContent}</${listTag}>`;

      case 'listitem':
        const itemContent = node.children?.map(convertNode).join('') || '';
        return `<li>${itemContent}</li>`;

      case 'quote':
        const quoteContent = node.children?.map(convertNode).join('') || '';
        return `<blockquote>${quoteContent}</blockquote>`;

      case 'code':
        const codeContent = node.children?.map(convertNode).join('') || '';
        return `<pre><code>${codeContent}</code></pre>`;

      case 'linebreak':
        return '<br />';

      default:
        // For unknown node types, try to process children
        return node.children?.map(convertNode).join('') || '';
    }
  };

  try {
    // Start from root if data has a root property
    const rootNode = (typeof data === 'object' && 'root' in data) ? data.root : data;
    return convertNode(rootNode as PayloadLexicalNode);
  } catch (error) {
    console.error('Error converting Lexical to HTML:', error);
    return '';
  }
}

/**
 * Transforms a Payload blog post document to the BlogPost type
 *
 * @param doc - Payload blog document from database
 * @returns Transformed BlogPost object
 */
export function transformPayloadBlogPost(doc: PayloadBlogDocument): BlogPost {
  // Convert Lexical JSON to HTML string
  const content = lexicalToHtml(doc.content as PayloadLexicalDocument);

  return {
    id: doc.id.toString(),
    slug: doc.slug || '',
    title: doc.title || '',
    excerpt: doc.excerpt || '',
    content,
    author: doc.author?.email || '',
    publishedAt: doc.publishedAt || doc.createdAt || '',
    category: doc.categories?.[0]?.name || '',
    tags: doc.tags?.map((tag: PayloadRecord) => tag.tag) || [],
    // transformMediaPath handles both string URLs (legacy) and media objects (relationship)
    image: transformMediaPath(doc.featuredImage || ''),
    featured: doc.published || false,
    readTime: '5 min',
  };
}
