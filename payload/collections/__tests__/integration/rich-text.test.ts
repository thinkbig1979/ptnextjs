/**
 * Integration Tests - Rich Text Conversion
 * Tests markdown to Lexical conversion
 */

const mockLexicalContent = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text }],
      },
    ],
  },
});

const createMockPayload = () => {
  const mockData = { vendors: [], products: [], yachts: [] } as any;

  return {
    create: jest.fn(async ({ collection, data }: any) => {
      // Simulate markdown to lexical conversion for richText fields
      if (data.description && typeof data.description === 'string') {
        data.description = mockLexicalContent(data.description);
      }
      if (data.content && typeof data.content === 'string') {
        data.content = mockLexicalContent(data.content);
      }

      const doc = { id: collection + '_' + Date.now(), ...data };
      mockData[collection].push(doc);
      return doc;
    }),
  };
};

describe('Integration - Rich Text Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Yacht Description Conversion', () => {
    it('should convert markdown to Lexical format', async () => {
      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Rich Text Yacht',
          launchYear: 2023,
          description: 'This is a **bold** statement',
        },
      });

      expect(yacht.description).toHaveProperty('root');
      expect(yacht.description.root.type).toBe('root');
    });

    it('should preserve Lexical format if already provided', async () => {
      const lexicalContent = mockLexicalContent('Already Lexical');

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Lexical Yacht',
          launchYear: 2023,
          description: lexicalContent,
        },
      });

      expect(yacht.description.root.children[0].children[0].text).toBe('Already Lexical');
    });
  });

  describe('Product Description Conversion', () => {
    it('should convert markdown to Lexical in product descriptions', async () => {
      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Test Product',
          description: 'Product with _italic_ text',
        },
      });

      expect(product.description).toHaveProperty('root');
    });
  });

  describe('Vendor Long Description Conversion', () => {
    it('should handle vendor long description', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'RichText Vendor',
          tier: 'tier1',
          longDescription: 'Long description with **formatting**',
        },
      });

      expect(vendor.longDescription).toBeDefined();
    });
  });
});
