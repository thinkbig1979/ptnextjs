/**
 * Integration Tests - Access Control
 * Tests access control across collections
 */

const createMockPayload = () => {
  const mockData = { vendors: [], products: [], tags: [] } as any;

  return {
    create: jest.fn(async ({ collection, data, user }: any) => {
      if (collection === 'tags' && user?.role !== 'admin') throw new Error('Access denied');
      if (collection === 'vendors' && user?.role !== 'admin') throw new Error('Access denied');
      
      const doc = { id: collection + '_' + Date.now(), ...data };
      mockData[collection].push(doc);
      return doc;
    }),
    update: jest.fn(async ({ collection, id, user }: any) => {
      if (collection === 'tags' && user?.role !== 'admin') throw new Error('Access denied');
      return { id };
    }),
    delete: jest.fn(async ({ collection, id, user }: any) => {
      if (collection === 'tags' && user?.role !== 'admin') throw new Error('Access denied');
      if (collection === 'vendors' && user?.role !== 'admin') throw new Error('Access denied');
      return null;
    }),
    find: jest.fn(async ({ collection }: any) => ({
      docs: mockData[collection] || [],
      totalDocs: mockData[collection]?.length || 0,
    })),
  };
};

describe('Integration - Access Control Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Tags Admin-Only Access', () => {
    it('should allow admin to create tags', async () => {
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: { role: 'admin' },
      });
      expect(tag.id).toBeDefined();
    });

    it('should block vendor from creating tags', async () => {
      await expect(
        payload.create({
          collection: 'tags',
          data: { name: 'Test', slug: 'test' },
          user: { role: 'vendor' },
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block vendor from updating tags', async () => {
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: { role: 'admin' },
      });

      await expect(
        payload.update({
          collection: 'tags',
          id: tag.id,
          user: { role: 'vendor' },
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block vendor from deleting tags', async () => {
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: { role: 'admin' },
      });

      await expect(
        payload.delete({
          collection: 'tags',
          id: tag.id,
          user: { role: 'vendor' },
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should allow public to read tags', async () => {
      await payload.create({
        collection: 'tags',
        data: { name: 'Public', slug: 'public' },
        user: { role: 'admin' },
      });

      const tags = await payload.find({ collection: 'tags' });
      expect(tags.docs.length).toBeGreaterThan(0);
    });
  });

  describe('Vendor Isolation', () => {
    it('should allow admin to create vendors', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: { companyName: 'Test' },
        user: { role: 'admin' },
      });
      expect(vendor.id).toBeDefined();
    });

    it('should block non-admin from creating vendors', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: { companyName: 'Test' },
          user: { role: 'vendor' },
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should allow public to read vendors', async () => {
      const vendors = await payload.find({ collection: 'vendors' });
      expect(vendors).toBeDefined();
    });
  });
});
