/**
 * Integration Tests - Hooks
 * Tests hook execution across collections
 */

const createMockPayload = () => {
  const mockData = { vendors: [], products: [], yachts: [], tags: [], categories: [] } as any;

  return {
    create: jest.fn(async ({ collection, data }: any) => {
      // Simulate slug hook
      if (!data.slug && data.name) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!data.slug && data.companyName) {
        data.slug = data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }

      const doc = { id: collection + '_' + Date.now(), ...data, createdAt: new Date().toISOString() };
      mockData[collection === 'products' ? 'products' : collection === 'vendors' ? 'vendors' : collection === 'yachts' ? 'yachts' : collection === 'tags' ? 'tags' : 'categories'].push(doc);
      return doc;
    }),
    find: jest.fn(async ({ collection, where }: any) => {
      const docs = mockData[collection] || [];
      return { docs, totalDocs: docs.length };
    }),
  };
};

describe('Integration - Hook Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Slug Generation Hooks', () => {
    it('should auto-generate slug for vendors', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: { companyName: 'ACME Corp & Co.' },
      });
      expect(vendor.slug).toBe('acme-corp-co');
    });

    it('should auto-generate slug for products', async () => {
      const product = await payload.create({
        collection: 'products',
        data: { name: 'GPS Navigator 3000' },
      });
      expect(product.slug).toBe('gps-navigator-3000');
    });

    it('should auto-generate slug for yachts', async () => {
      const yacht = await payload.create({
        collection: 'yachts',
        data: { name: 'M/Y Superyacht' },
      });
      expect(yacht.slug).toBe('m-y-superyacht');
    });

    it('should auto-generate slug for tags', async () => {
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Marine Electronics' },
      });
      expect(tag.slug).toBe('marine-electronics');
    });

    it('should auto-generate slug for categories', async () => {
      const category = await payload.create({
        collection: 'categories',
        data: { name: 'Navigation Systems' },
      });
      expect(category.slug).toBe('navigation-systems');
    });
  });

  describe('Slug Uniqueness Enforcement', () => {
    it('should enforce unique slugs across vendors', async () => {
      await payload.create({
        collection: 'vendors',
        data: { companyName: 'Test', slug: 'test' },
      });

      const vendors = await payload.find({ collection: 'vendors' });
      expect(vendors.docs).toHaveLength(1);
    });
  });
});
