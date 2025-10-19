/**
 * Comprehensive test suite for Markdown to Lexical converter
 *
 * Tests all 9 markdown features:
 * 1. Headings (h1-h6)
 * 2. Paragraphs
 * 3. Text Formatting (bold, italic, strikethrough, code)
 * 4. Lists (ordered, unordered, nested)
 * 5. Links
 * 6. Images
 * 7. Code Blocks
 * 8. Blockquotes
 * 9. Horizontal Rules
 */

import {
  markdownToLexical,
  lexicalToPlainText,
  TextFormat,
  type LexicalHeadingNode,
  type LexicalParagraphNode,
  type LexicalTextNode,
  type LexicalListNode,
  type LexicalLinkNode,
  type LexicalImageNode,
  type LexicalCodeNode,
  type LexicalQuoteNode,
  type LexicalHorizontalRuleNode,
} from '../markdown-to-lexical';

describe('markdownToLexical', () => {
  describe('Basic Features', () => {
    // Test 1: Empty input
    test('converts empty markdown to empty document', () => {
      const result = markdownToLexical('');
      expect(result.root.type).toBe('root');
      expect(result.root.children).toHaveLength(1);
      expect(result.root.children[0].type).toBe('paragraph');
    });

    // Test 2: Undefined input
    test('handles undefined input', () => {
      const result = markdownToLexical(undefined);
      expect(result.root.type).toBe('root');
      expect(result.root.children).toHaveLength(1);
    });

    // Test 3: Plain text
    test('converts plain text to paragraph', () => {
      const result = markdownToLexical('Hello world');
      expect(result.root.children).toHaveLength(1);
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      expect(paragraph.type).toBe('paragraph');
      expect(paragraph.children).toHaveLength(1);
      const text = paragraph.children[0] as LexicalTextNode;
      expect(text.type).toBe('text');
      expect(text.text).toBe('Hello world');
      expect(text.format).toBe(0);
    });

    // Test 4: Multiple paragraphs
    test('converts multiple paragraphs', () => {
      const markdown = 'First paragraph\n\nSecond paragraph';
      const result = markdownToLexical(markdown);
      expect(result.root.children).toHaveLength(2);
      expect(result.root.children[0].type).toBe('paragraph');
      expect(result.root.children[1].type).toBe('paragraph');
    });
  });

  describe('Headings (Feature 1)', () => {
    // Test 5-10: All heading levels
    test('converts h1 heading', () => {
      const result = markdownToLexical('# Heading 1');
      const heading = result.root.children[0] as LexicalHeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.tag).toBe('h1');
      expect((heading.children[0] as LexicalTextNode).text).toBe('Heading 1');
    });

    test('converts h2 heading', () => {
      const result = markdownToLexical('## Heading 2');
      const heading = result.root.children[0] as LexicalHeadingNode;
      expect(heading.tag).toBe('h2');
    });

    test('converts h3 heading', () => {
      const result = markdownToLexical('### Heading 3');
      const heading = result.root.children[0] as LexicalHeadingNode;
      expect(heading.tag).toBe('h3');
    });

    test('converts h4 heading', () => {
      const result = markdownToLexical('#### Heading 4');
      const heading = result.root.children[0] as LexicalHeadingNode;
      expect(heading.tag).toBe('h4');
    });

    test('converts h5 heading', () => {
      const result = markdownToLexical('##### Heading 5');
      const heading = result.root.children[0] as LexicalHeadingNode;
      expect(heading.tag).toBe('h5');
    });

    test('converts h6 heading', () => {
      const result = markdownToLexical('###### Heading 6');
      const heading = result.root.children[0] as LexicalHeadingNode;
      expect(heading.tag).toBe('h6');
    });
  });

  describe('Text Formatting (Feature 3)', () => {
    // Test 11: Bold text
    test('converts bold text', () => {
      const result = markdownToLexical('This is **bold** text');
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      expect(paragraph.children).toHaveLength(3);
      const boldText = paragraph.children[1] as LexicalTextNode;
      expect(boldText.text).toBe('bold');
      expect(boldText.format).toBe(TextFormat.BOLD);
    });

    // Test 12: Italic text
    test('converts italic text', () => {
      const result = markdownToLexical('This is *italic* text');
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      const italicText = paragraph.children[1] as LexicalTextNode;
      expect(italicText.text).toBe('italic');
      expect(italicText.format).toBe(TextFormat.ITALIC);
    });

    // Test 13: Inline code
    test('converts inline code', () => {
      const result = markdownToLexical('This is `code` text');
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      const codeText = paragraph.children[1] as LexicalTextNode;
      expect(codeText.text).toBe('code');
      expect(codeText.format).toBe(TextFormat.CODE);
    });

    // Test 14: Mixed formatting
    test('converts text with multiple formatting', () => {
      const result = markdownToLexical('Text with **bold** and *italic* and `code`');
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      expect(paragraph.children.length).toBeGreaterThan(3);

      // Check that we have bold, italic, and code formatted text
      const formats = paragraph.children
        .filter(child => child.type === 'text')
        .map(child => (child as LexicalTextNode).format);
      expect(formats).toContain(TextFormat.BOLD);
      expect(formats).toContain(TextFormat.ITALIC);
      expect(formats).toContain(TextFormat.CODE);
    });
  });

  describe('Lists (Feature 4)', () => {
    // Test 15: Unordered list
    test('converts unordered list', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const result = markdownToLexical(markdown);
      const list = result.root.children[0] as LexicalListNode;
      expect(list.type).toBe('list');
      expect(list.listType).toBe('bullet');
      expect(list.tag).toBe('ul');
      expect(list.children).toHaveLength(3);
      expect(list.children[0].type).toBe('listitem');
    });

    // Test 16: Ordered list
    test('converts ordered list', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      const result = markdownToLexical(markdown);
      const list = result.root.children[0] as LexicalListNode;
      expect(list.type).toBe('list');
      expect(list.listType).toBe('number');
      expect(list.tag).toBe('ol');
      expect(list.children).toHaveLength(3);
    });

    // Test 17: Nested lists
    test('converts nested lists', () => {
      const markdown = '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2';
      const result = markdownToLexical(markdown);
      const list = result.root.children[0] as LexicalListNode;
      expect(list.type).toBe('list');
      expect(list.children).toHaveLength(2);

      // Check first item has nested list
      const firstItem = list.children[0];
      expect(firstItem.children.length).toBeGreaterThan(0);
    });
  });

  describe('Links (Feature 5)', () => {
    // Test 18: Simple link
    test('converts link', () => {
      const result = markdownToLexical('Visit [our website](https://example.com) for info');
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      const link = paragraph.children.find(child => child.type === 'link') as LexicalLinkNode;
      expect(link).toBeDefined();
      expect(link.url).toBe('https://example.com');
      expect((link.children[0] as LexicalTextNode).text).toBe('our website');
    });

    // Test 19: Link with title
    test('converts link with title attribute', () => {
      const result = markdownToLexical('[Link](https://example.com "Title")');
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      const link = paragraph.children[0] as LexicalLinkNode;
      expect(link.type).toBe('link');
      expect(link.url).toBe('https://example.com');
      expect(link.title).toBe('Title');
    });
  });

  describe('Images (Feature 6)', () => {
    // Test 20: Image
    test('converts image', () => {
      const result = markdownToLexical('![Alt text](/path/to/image.jpg)');
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      const image = paragraph.children[0] as LexicalImageNode;
      expect(image.type).toBe('image');
      expect(image.src).toBe('/path/to/image.jpg');
      expect(image.altText).toBe('Alt text');
    });

    // Test 21: Image with path transformer
    test('transforms image path with custom handler', () => {
      const transformer = (path: string) => path.replace('/uploads/', '/media/');
      const result = markdownToLexical('![Image](/uploads/test.jpg)', {
        imagePathTransformer: transformer,
      });
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      const image = paragraph.children[0] as LexicalImageNode;
      expect(image.src).toBe('/media/test.jpg');
    });
  });

  describe('Code Blocks (Feature 7)', () => {
    // Test 22: Code block without language
    test('converts code block', () => {
      const markdown = '```\nconst x = 1;\n```';
      const result = markdownToLexical(markdown);
      const code = result.root.children[0] as LexicalCodeNode;
      expect(code.type).toBe('code');
      expect(code.language).toBeNull();
      expect((code.children[0] as LexicalTextNode).text).toContain('const x = 1;');
    });

    // Test 23: Code block with language
    test('converts code block with language', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = markdownToLexical(markdown);
      const code = result.root.children[0] as LexicalCodeNode;
      expect(code.type).toBe('code');
      expect(code.language).toBe('javascript');
    });
  });

  describe('Blockquotes (Feature 8)', () => {
    // Test 24: Simple blockquote
    test('converts blockquote', () => {
      const markdown = '> This is a quote';
      const result = markdownToLexical(markdown);
      const quote = result.root.children[0] as LexicalQuoteNode;
      expect(quote.type).toBe('quote');
      expect(quote.children).toHaveLength(1);
      expect(quote.children[0].type).toBe('paragraph');
    });

    // Test 25: Multi-line blockquote
    test('converts multi-line blockquote', () => {
      const markdown = '> Line 1\n> Line 2';
      const result = markdownToLexical(markdown);
      const quote = result.root.children[0] as LexicalQuoteNode;
      expect(quote.type).toBe('quote');
      expect(quote.children.length).toBeGreaterThan(0);
    });
  });

  describe('Horizontal Rules (Feature 9)', () => {
    // Test 26: Horizontal rule
    test('converts horizontal rule', () => {
      const markdown = '---';
      const result = markdownToLexical(markdown);
      const hr = result.root.children[0] as LexicalHorizontalRuleNode;
      expect(hr.type).toBe('horizontalrule');
    });

    // Test 27: HR between paragraphs
    test('converts horizontal rule between paragraphs', () => {
      const markdown = 'Before\n\n---\n\nAfter';
      const result = markdownToLexical(markdown);
      expect(result.root.children).toHaveLength(3);
      expect(result.root.children[0].type).toBe('paragraph');
      expect(result.root.children[1].type).toBe('horizontalrule');
      expect(result.root.children[2].type).toBe('paragraph');
    });
  });

  describe('Complex Content', () => {
    // Test 28: Real-world content example
    test('converts complex markdown with multiple features', () => {
      const markdown = `# Welcome to Superyacht Tech

This is a **bold** statement with *italic* text and \`code\`.

## Features

- Advanced navigation
- Entertainment systems
- Automation

Visit [our website](https://example.com) for more info.

---

> Quality is not an act, it is a habit.`;

      const result = markdownToLexical(markdown);
      expect(result.root.children.length).toBeGreaterThan(5);

      // Verify we have different node types
      const types = result.root.children.map(child => child.type);
      expect(types).toContain('heading');
      expect(types).toContain('paragraph');
      expect(types).toContain('list');
      expect(types).toContain('horizontalrule');
      expect(types).toContain('quote');
    });

    // Test 29: Content with special characters
    test('handles special characters correctly', () => {
      const markdown = 'Text with & < > " \' characters';
      const result = markdownToLexical(markdown);
      const paragraph = result.root.children[0] as LexicalParagraphNode;
      const text = paragraph.children[0] as LexicalTextNode;
      expect(text.text).toContain('&');
      expect(text.text).toContain('<');
      expect(text.text).toContain('>');
    });

    // Test 30: Very long content
    test('handles long content efficiently', () => {
      const longParagraph = 'Lorem ipsum '.repeat(100);
      const start = Date.now();
      const result = markdownToLexical(longParagraph);
      const duration = Date.now() - start;

      expect(result.root.children).toHaveLength(1);
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Edge Cases', () => {
    // Test 31: Malformed markdown
    test('handles malformed markdown gracefully', () => {
      const malformed = '**bold text without closing';
      const result = markdownToLexical(malformed);
      expect(result.root.type).toBe('root');
      expect(result.root.children.length).toBeGreaterThan(0);
    });

    // Test 32: Empty headings
    test('handles empty heading', () => {
      const result = markdownToLexical('##');
      expect(result.root.type).toBe('root');
      // Should create a heading node even if empty
      const firstChild = result.root.children[0];
      expect(['heading', 'paragraph']).toContain(firstChild.type);
    });

    // Test 33: Whitespace handling
    test('handles excessive whitespace', () => {
      const markdown = '   \n\n\n   Text   \n\n\n   ';
      const result = markdownToLexical(markdown);
      expect(result.root.children.length).toBeGreaterThan(0);
    });
  });

  describe('lexicalToPlainText', () => {
    // Test 34: Convert back to plain text
    test('converts Lexical document to plain text', () => {
      const markdown = '# Hello\n\nWorld';
      const lexical = markdownToLexical(markdown);
      const plainText = lexicalToPlainText(lexical);
      expect(plainText).toContain('Hello');
      expect(plainText).toContain('World');
    });

    // Test 35: Empty document to plain text
    test('handles empty document', () => {
      const lexical = markdownToLexical('');
      const plainText = lexicalToPlainText(lexical);
      expect(plainText).toBe('');
    });
  });

  describe('Document Structure', () => {
    // Test 36: Root structure
    test('creates valid root structure', () => {
      const result = markdownToLexical('Test');
      expect(result.root.type).toBe('root');
      expect(result.root.format).toBe('');
      expect(result.root.indent).toBe(0);
      expect(result.root.version).toBe(1);
      expect(result.root.direction).toBe('ltr');
    });

    // Test 37: Node versions
    test('all nodes have version 1', () => {
      const markdown = '# Heading\n\nParagraph\n\n- List item';
      const result = markdownToLexical(markdown);

      for (const child of result.root.children) {
        expect(child.version).toBe(1);
      }
    });
  });

  describe('Performance', () => {
    // Test 38: Performance with typical content
    test('converts typical content within performance threshold', () => {
      const typicalContent = `# Product Overview

The **advanced** navigation system provides *exceptional* accuracy.

## Key Features

1. GPS tracking
2. Radar integration
3. Auto-pilot

Learn more at [our website](https://example.com).

\`\`\`typescript
const system = new NavigationSystem();
\`\`\`

> Industry leading performance`;

      const start = Date.now();
      const result = markdownToLexical(typicalContent);
      const duration = Date.now() - start;

      expect(result.root.children.length).toBeGreaterThan(5);
      expect(duration).toBeLessThan(100); // Must complete in <100ms
    });
  });

  describe('Real-World Content Samples', () => {
    // Test 39: Yacht description style content
    test('converts yacht description markdown', () => {
      const yachtContent = `# Azzam: The World's Largest Private Yacht

Azzam represents the pinnacle of modern yacht engineering, holding the distinction as the world's largest private motor yacht at 180 meters.

## Engineering Marvel

The yacht's design philosophy centers on achieving **maximum speed** while maintaining the *luxury and comfort* expected from a vessel of this caliber.

## Technology Integration

Azzam showcases cutting-edge marine technology across all systems:

- **Advanced Propulsion**: Twin MTU engines
- **Integrated Navigation**: State-of-the-art bridge systems
- **Smart Automation**: Centralized control systems

Visit [our website](https://example.com) for specifications.`;

      const result = markdownToLexical(yachtContent);
      expect(result.root.children.length).toBeGreaterThan(5);

      // Verify structure
      const hasHeading = result.root.children.some(child => child.type === 'heading');
      const hasList = result.root.children.some(child => child.type === 'list');
      const hasParagraph = result.root.children.some(child => child.type === 'paragraph');

      expect(hasHeading).toBe(true);
      expect(hasList).toBe(true);
      expect(hasParagraph).toBe(true);
    });

    // Test 40: Product description with technical specs
    test('converts product description with technical content', () => {
      const productContent = `## Ray Marine Radar System

Advanced radar technology for superyacht navigation.

### Technical Specifications

- **Range**: 72 nautical miles
- **Power**: 25W
- **Frequency**: X-band

\`\`\`javascript
const radar = {
  model: 'Quantum 2',
  range: 72
};
\`\`\`

---

> Trusted by leading yacht manufacturers worldwide.`;

      const result = markdownToLexical(productContent);
      expect(result.root.children.length).toBeGreaterThan(4);

      // Verify all expected components
      const types = result.root.children.map(child => child.type);
      expect(types).toContain('heading');
      expect(types).toContain('list');
      expect(types).toContain('code');
      expect(types).toContain('horizontalrule');
      expect(types).toContain('quote');
    });
  });
});
