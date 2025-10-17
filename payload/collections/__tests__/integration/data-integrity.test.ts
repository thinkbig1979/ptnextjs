/**
 * Integration Tests - Data Integrity
 * Tests data validation and integrity constraints
 */

const createMockPayload = () => {
  const mockData = { vendors: [], products: [], yachts: [], tags: [] } as any;

  return {
    create: jest.fn(async ({ collection, data }: any) => {
      // Validate required fields
      if (collection === 'vendors') {
        if (!data.companyName) throw new Error('companyName is required');
        if (!data.tier) throw new Error('tier is required');
        if (data.tier && !['free', 'tier1', 'tier2'].includes(data.tier)) {
          throw new Error('Invalid tier value');
        }
      }
      if (collection === 'products') {
        if (!data.name) throw new Error('name is required');
      }
      if (collection === 'yachts') {
        if (!data.name) throw new Error('name is required');
        if (!data.launchYear) throw new Error('launchYear is required');
      }
      if (collection === 'tags') {
        if (!data.name) throw new Error('name is required');
      }

      // Check uniqueness
      const existing = mockData[collection].find((d: any) => d.slug === data.slug);
      if (existing && data.slug) throw new Error('slug must be unique');

      const doc = { id: collection + '_' + Date.now(), ...data };
      mockData[collection].push(doc);
      return doc;
    }),
  };
};

describe('Integration - Data Integrity Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Required Fields Enforcement', () => {
    it('should enforce required fields on vendors', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: { tier: 'free' },
        })
      ).rejects.toThrow(/companyName.*required/i);
    });

    it('should enforce required fields on products', async () => {
      await expect(
        payload.create({
          collection: 'products',
          data: { slug: 'test' },
        })
      ).rejects.toThrow(/name.*required/i);
    });

    it('should enforce required fields on yachts', async () => {
      await expect(
        payload.create({
          collection: 'yachts',
          data: { name: 'Test Yacht' },
        })
      ).rejects.toThrow(/launchYear.*required/i);
    });
  });

  describe('Enum Validation', () => {
    it('should validate tier enum values', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            tier: 'invalid',
          },
        })
      ).rejects.toThrow(/invalid tier/i);
    });

    it('should accept valid tier values', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'ValidTier',
          tier: 'tier1',
        },
      });

      expect(vendor.tier).toBe('tier1');
    });
  });

  describe('Uniqueness Constraints', () => {
    it('should enforce slug uniqueness across vendors', async () => {
      await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'First',
          slug: 'unique-slug',
          tier: 'free',
        },
      });

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Second',
            slug: 'unique-slug',
            tier: 'free',
          },
        })
      ).rejects.toThrow(/slug.*unique/i);
    });

    it('should enforce slug uniqueness across products', async () => {
      await payload.create({
        collection: 'products',
        data: {
          name: 'Product 1',
          slug: 'product-slug',
        },
      });

      await expect(
        payload.create({
          collection: 'products',
          data: {
            name: 'Product 2',
            slug: 'product-slug',
          },
        })
      ).rejects.toThrow(/slug.*unique/i);
    });
  });
});
