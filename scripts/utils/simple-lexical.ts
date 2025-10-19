/**
 * Simple markdown to Lexical converter stub
 * TODO: Implement proper markdown to Lexical conversion
 */

export function markdownToLexical(markdown: string): any {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'text',
              format: 0,
              detail: 0,
              mode: 'normal',
              style: '',
              text: markdown,
              version: 1,
            },
          ],
        },
      ],
      direction: 'ltr',
    },
  };
}
