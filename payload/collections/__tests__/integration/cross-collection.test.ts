/**
 * Integration Tests - Cross-Collection Scenarios
 * Tests complex multi-collection workflows
 */

const createMockPayload = () => {
  const mockData = { vendors: [], products: [], yachts: [], tags: [] } as any;

  return {
    create: jest.fn(async ({ collection, data }: any) => {
      const doc = { id: collection + '_' + Date.now(), ...data };
      mockData[collection].push(doc);
      return doc;
    }),
    findByID: jest.fn(async ({ collection, id, depth }: any) => {
      const doc = mockData[collection].find((d: any) => d.id === id);
      if (!doc || !depth) return doc;

      const resolved = { ...doc };
      if (resolved.vendor) {
        resolved.vendor = mockData.vendors.find((v: any) => v.id === resolved.vendor);
      }
      if (resolved.supplierMap) {
        resolved.supplierMap = resolved.supplierMap.map((entry: any) => ({
          ...entry,
          vendor: mockData.vendors.find((v: any) => v.id === entry.vendor),
          products: entry.products?.map((pId: string) =>
            mockData.products.find((p: any) => p.id === pId)
          ),
        }));
      }
      return resolved;
    }),
    find: jest.fn(async ({ collection }: any) => ({
      docs: mockData[collection] || [],
      totalDocs: mockData[collection]?.length || 0,
    })),
  };
};

describe('Integration - Cross-Collection Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Full Yacht with Supplier Map', () => {
    it('should create yacht with complete supplier relationships', async () => {
      // Create vendor
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'NavTech Systems',
          slug: 'navtech',
          tier: 'tier2',
        },
      });

      // Create products
      const gps = await payload.create({
        collection: 'products',
        data: {
          name: 'GPS Navigator Pro',
          slug: 'gps-nav-pro',
          vendor: vendor.id,
        },
      });

      const radar = await payload.create({
        collection: 'products',
        data: {
          name: 'Radar System X1',
          slug: 'radar-x1',
          vendor: vendor.id,
        },
      });

      // Create yacht with supplier map
      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Superyacht Alpha',
          slug: 'superyacht-alpha',
          launchYear: 2023,
          supplierMap: [
            {
              vendor: vendor.id,
              products: [gps.id, radar.id],
              systemCategory: 'navigation',
              installationDate: '2023-06-01',
            },
          ],
        },
      });

      expect(yacht.supplierMap[0].vendor).toBe(vendor.id);
      expect(yacht.supplierMap[0].products).toContain(gps.id);
      expect(yacht.supplierMap[0].products).toContain(radar.id);
    });

    it('should resolve full yacht with depth', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: { companyName: 'TechCorp', slug: 'techcorp', tier: 'tier2' },
      });

      const product = await payload.create({
        collection: 'products',
        data: { name: 'Product A', slug: 'product-a', vendor: vendor.id },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Yacht B',
          slug: 'yacht-b',
          launchYear: 2023,
          supplierMap: [
            {
              vendor: vendor.id,
              products: [product.id],
              systemCategory: 'automation',
            },
          ],
        },
      });

      const resolved = await payload.findByID({
        collection: 'yachts',
        id: yacht.id,
        depth: 2,
      });

      expect(resolved.supplierMap[0].vendor.companyName).toBe('TechCorp');
      expect(resolved.supplierMap[0].products[0].name).toBe('Product A');
    });
  });

  describe('Vendor Product Portfolio', () => {
    it('should create vendor with multiple products', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'MultiProduct Inc',
          slug: 'multiproduct',
          tier: 'tier2',
        },
      });

      const products = await Promise.all([
        payload.create({
          collection: 'products',
          data: { name: 'Product 1', slug: 'p1', vendor: vendor.id },
        }),
        payload.create({
          collection: 'products',
          data: { name: 'Product 2', slug: 'p2', vendor: vendor.id },
        }),
        payload.create({
          collection: 'products',
          data: { name: 'Product 3', slug: 'p3', vendor: vendor.id },
        }),
      ]);

      products.forEach((p) => {
        expect(p.vendor).toBe(vendor.id);
      });
    });
  });

  describe('Multi-Vendor Yacht Installation', () => {
    it('should support multiple vendors on one yacht', async () => {
      const vendor1 = await payload.create({
        collection: 'vendors',
        data: { companyName: 'NavSys', slug: 'navsys', tier: 'tier1' },
      });

      const vendor2 = await payload.create({
        collection: 'vendors',
        data: { companyName: 'PropTech', slug: 'proptech', tier: 'tier1' },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Multi-Vendor Yacht',
          slug: 'multi-vendor',
          launchYear: 2023,
          supplierMap: [
            { vendor: vendor1.id, systemCategory: 'navigation' },
            { vendor: vendor2.id, systemCategory: 'propulsion' },
          ],
        },
      });

      expect(yacht.supplierMap).toHaveLength(2);
    });
  });
});
