# Task IMPL-BACKEND-RICHTEXT: Implement Markdown to Lexical Rich Text Converter

## Task Metadata
- **Task ID**: impl-backend-richtext
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: backend-nodejs-specialist
- **Estimated Time**: 4 hours
- **Dependencies**: pre-1
- **Status**: Ready for Implementation
- **Priority**: High

## Task Description

Implement a robust markdown-to-Lexical converter that transforms TinaCMS markdown content into Payload CMS Lexical rich text format. This converter must handle standard markdown syntax (headings, lists, links, images, code blocks, blockquotes) and produce valid Lexical editor JSON structure.

## Specifics

### File to Create
`/home/edwin/development/ptnextjs/src/lib/transformers/markdown-to-lexical.ts`

### Markdown Features to Support

1. **Headings** (h1-h6)
   - `# Heading 1` → Lexical heading node level 1
   - `## Heading 2` → Lexical heading node level 2
   - etc.

2. **Paragraphs**
   - Plain text → Lexical paragraph node
   - Multiple paragraphs separated by blank lines

3. **Text Formatting**
   - `**bold**` → Lexical text node with bold format
   - `*italic*` → Lexical text node with italic format
   - `~~strikethrough~~` → Lexical text node with strikethrough format
   - `` `code` `` → Lexical text node with code format

4. **Lists**
   - `- item` → Lexical unordered list
   - `1. item` → Lexical ordered list
   - Nested lists with indentation

5. **Links**
   - `[text](url)` → Lexical link node

6. **Images**
   - `![alt](url)` → Lexical image node

7. **Code Blocks**
   - ` ```language\ncode\n``` ` → Lexical code block node

8. **Blockquotes**
   - `> quote` → Lexical quote node

9. **Horizontal Rules**
   - `---` → Lexical horizontal rule node

### Lexical JSON Structure

The converter must produce valid Lexical EditorState JSON:

```typescript
interface LexicalEditorState {
  root: {
    type: 'root';
    format: '';
    indent: 0;
    version: 1;
    children: LexicalNode[];
    direction: 'ltr' | 'rtl';
  };
}

type LexicalNode =
  | ParagraphNode
  | HeadingNode
  | ListNode
  | ListItemNode
  | LinkNode
  | TextNode
  | CodeNode
  | QuoteNode
  | ImageNode;
```

### Implementation Approach

1. **Use markdown-it Library**
   - Parse markdown to AST
   - Walk AST to generate Lexical nodes
   - Handle nested structures

2. **Converter Function Signature**
```typescript
export async function markdownToLexical(
  markdown: string,
  options?: MarkdownToLexicalOptions
): Promise<any> {
  // Returns Lexical EditorState JSON
}

export interface MarkdownToLexicalOptions {
  preserveWhitespace?: boolean;
  allowUnsafeHtml?: boolean;
  imageUploadHandler?: (imagePath: string) => Promise<string>;
}
```

3. **Node Converters**
   - Create converter functions for each markdown node type
   - Handle inline formatting (bold, italic, code)
   - Support nested structures (lists within lists)

### Example Transformations

**Input Markdown:**
```markdown
# Welcome to Superyacht Tech

This is a **bold** statement with *italic* text.

## Features

- Advanced navigation
- Entertainment systems
- Automation

Visit [our website](https://example.com) for more info.
```

**Output Lexical JSON:**
```json
{
  "root": {
    "type": "root",
    "format": "",
    "indent": 0,
    "version": 1,
    "children": [
      {
        "type": "heading",
        "tag": "h1",
        "children": [{ "type": "text", "text": "Welcome to Superyacht Tech" }]
      },
      {
        "type": "paragraph",
        "children": [
          { "type": "text", "text": "This is a " },
          { "type": "text", "text": "bold", "format": 1 },
          { "type": "text", "text": " statement with " },
          { "type": "text", "text": "italic", "format": 2 },
          { "type": "text", "text": " text." }
        ]
      },
      {
        "type": "heading",
        "tag": "h2",
        "children": [{ "type": "text", "text": "Features" }]
      },
      {
        "type": "list",
        "listType": "bullet",
        "children": [
          { "type": "listitem", "children": [{ "type": "text", "text": "Advanced navigation" }] },
          { "type": "listitem", "children": [{ "type": "text", "text": "Entertainment systems" }] },
          { "type": "listitem", "children": [{ "type": "text", "text": "Automation" }] }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          { "type": "text", "text": "Visit " },
          { "type": "link", "url": "https://example.com", "children": [{ "type": "text", "text": "our website" }] },
          { "type": "text", "text": " for more info." }
        ]
      }
    ],
    "direction": "ltr"
  }
}
```

### Error Handling

1. **Invalid Markdown**
   - Handle malformed markdown gracefully
   - Return empty Lexical document for empty input
   - Log warnings for unrecognized syntax

2. **Fallback Strategies**
   - Unknown nodes → paragraph with text content
   - Invalid links → plain text
   - Missing image URLs → skip image node

3. **Image Path Transformation**
   - Support optional image upload handler
   - Transform TinaCMS media paths to Payload media URLs
   - Default: preserve image URLs as-is

### Dependencies to Install

```json
{
  "dependencies": {
    "markdown-it": "^14.0.0"
  },
  "devDependencies": {
    "@types/markdown-it": "^13.0.7"
  }
}
```

## Acceptance Criteria

- [ ] File created: `src/lib/transformers/markdown-to-lexical.ts`
- [ ] markdownToLexical function implemented with TypeScript types
- [ ] All 9 markdown features supported (headings, paragraphs, formatting, lists, links, images, code, quotes, rules)
- [ ] Output is valid Lexical EditorState JSON
- [ ] Error handling for invalid markdown
- [ ] Image path transformation support (optional handler)
- [ ] Dependencies installed (markdown-it)
- [ ] Exported from transformers index

## Testing Requirements

### Unit Tests
Create `src/lib/transformers/__tests__/markdown-to-lexical.test.ts`:

1. **Basic Markdown Conversion**
   - Test headings (h1-h6)
   - Test paragraphs
   - Test bold, italic, strikethrough, code formatting
   - Test unordered lists
   - Test ordered lists
   - Test links
   - Test images
   - Test code blocks
   - Test blockquotes
   - Test horizontal rules

2. **Complex Content**
   - Test nested lists
   - Test mixed formatting (bold + italic)
   - Test multiple paragraphs
   - Test combination of elements

3. **Edge Cases**
   - Test empty markdown → empty Lexical document
   - Test malformed markdown → graceful fallback
   - Test very long content
   - Test special characters

4. **Image Handling**
   - Test with default image URLs
   - Test with custom image upload handler
   - Test missing image URLs

### Integration Tests
- Convert actual TinaCMS markdown content samples
- Verify Lexical JSON renders correctly in Payload admin
- Test with real vendor/product descriptions from content/

### Manual Testing
1. Create test markdown file with all supported syntax
2. Convert to Lexical JSON
3. Import into Payload rich text field
4. Verify rendering in admin UI
5. Test editing converted content

## Evidence Required

**Code Files:**
1. `src/lib/transformers/markdown-to-lexical.ts` (main converter)
2. Updated `src/lib/transformers/index.ts` (export converter)

**Test Files:**
1. `src/lib/transformers/__tests__/markdown-to-lexical.test.ts` (unit tests)
2. Test fixtures with sample markdown content

**Test Results:**
- Unit test output showing all conversion tests passing
- Sample conversions from TinaCMS markdown content
- Screenshot of converted content in Payload admin UI

**Verification Checklist:**
- [ ] File exists: `src/lib/transformers/markdown-to-lexical.ts`
- [ ] All markdown features convert correctly
- [ ] Output is valid Lexical JSON structure
- [ ] Error handling works for invalid markdown
- [ ] TypeScript types are accurate
- [ ] Dependencies installed
- [ ] All unit tests pass
- [ ] Converted content renders in Payload admin

## Context Requirements

**Technical Spec Sections:**
- Lines 529-581: Markdown to Lexical Conversion Strategy

**Payload Documentation:**
- Lexical rich text editor documentation
- Lexical EditorState JSON format specification

**TinaCMS Content Samples:**
- Review actual markdown content in `content/vendors/*.md`
- Review actual markdown content in `content/products/*.md`
- Test converter with real-world examples

**Dependencies:**
- markdown-it library for markdown parsing
- Payload's Lexical editor types

**Related Tasks:**
- impl-backend-transformers (uses this converter)
- integ-migration-scripts (uses this for content migration)

## Quality Gates

- [ ] All 9 markdown features convert correctly
- [ ] Lexical JSON output is valid and renders in Payload
- [ ] Error handling is comprehensive
- [ ] No data loss in conversion (all markdown features preserved)
- [ ] TypeScript types are accurate
- [ ] No compilation errors
- [ ] No linting errors
- [ ] All unit tests pass (minimum 20 test cases)
- [ ] Integration tests pass with real content
- [ ] Performance is acceptable (<100ms for typical markdown)

## Notes

- Lexical format is different from Slate/ProseMirror (Payload's previous editor)
- Text formatting uses numeric flags (1=bold, 2=italic, etc.)
- Nested structures (lists, blockquotes) need careful handling
- Image paths may need transformation (TinaCMS public/ → Payload uploads/)
- Consider adding support for custom markdown extensions (if TinaCMS uses any)
- Test with actual content from `content/` directory to ensure real-world compatibility
- Document any markdown syntax that cannot be converted (if any)
- Performance matters: converter will run on ~100+ content items during migration
- Consider adding a reverse converter (Lexical → markdown) for future use
- Lexical version compatibility: ensure output works with Payload's Lexical version
