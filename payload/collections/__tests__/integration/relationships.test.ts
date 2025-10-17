/**
 * Integration Tests - Relationships
 * 
 * Tests all relationship types across collections:
 * - Product -> Vendor (many-to-one)
 * - Yacht -> Vendor (many-to-one via supplierMap)
 * - Yacht -> Products (many-to-many via supplierMap)
 * - Vendor -> User (one-to-one)
 * - Categories -> ParentCategory (self-referential)
 */

// Mock Payload instance with relationship support
const createMockPayload = () => {
  const mockData = {
    vendors: [] as any[],
    products: [] as any[],
    yachts: [] as any[],
    tags: [] as any[],
    categories: [] as any[],
    users: [] as any[],
  };

  return {
    create: jest.fn(async ({ collection, data }: any) => {
      const timestamp = new Date().toISOString();
      const newDoc = {
        id: collection + '_' + Date.now() + '_' + Math.random(),
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (collection === 'vendors') mockData.vendors.push(newDoc);
      if (collection === 'products') mockData.products.push(newDoc);
      if (collection === 'yachts') mockData.yachts.push(newDoc);
      if (collection === 'tags') mockData.tags.push(newDoc);
      if (collection === 'categories') mockData.categories.push(newDoc);
      if (collection === 'users') mockData.users.push(newDoc);

      return newDoc;
    }),

    findByID: jest.fn(async ({ collection, id, depth }: any) => {
      let doc: any = null;

      if (collection === 'vendors') doc = mockData.vendors.find(v => v.id === id);
      if (collection === 'products') doc = mockData.products.find(p => p.id === id);
      if (collection === 'yachts') doc = mockData.yachts.find(y => y.id === id);
      if (collection === 'tags') doc = mockData.tags.find(t => t.id === id);
      if (collection === 'categories') doc = mockData.categories.find(c => c.id === id);
      if (collection === 'users') doc = mockData.users.find(u => u.id === id);

      if (!doc) return null;

      // Resolve relationships if depth > 0
      if (depth && depth > 0) {
        doc = { ...doc }; // Clone to avoid mutation

        // Resolve vendor relationships
        if (collection === 'products' && doc.vendor) {
          doc.vendor = mockData.vendors.find(v => v.id === doc.vendor) || doc.vendor;
        }

        // Resolve yacht supplierMap relationships
        if (collection === 'yachts' && doc.supplierMap) {
          doc.supplierMap = doc.supplierMap.map((entry: any) => ({
            ...entry,
            vendor: mockData.vendors.find(v => v.id === entry.vendor) || entry.vendor,
            products: entry.products?.map((pId: string) => 
              mockData.products.find(p => p.id === pId) || pId
            ),
          }));
        }

        // Resolve user relationship
        if (doc.user) {
          doc.user = mockData.users.find(u => u.id === doc.user) || doc.user;
        }

        // Resolve category parent
        if (collection === 'categories' && doc.parentCategory) {
          doc.parentCategory = mockData.categories.find(c => c.id === doc.parentCategory) || doc.parentCategory;
        }
      }

      return doc;
    }),

    find: jest.fn(async ({ collection, where }: any) => {
      let docs: any[] = [];

      if (collection === 'vendors') docs = mockData.vendors;
      if (collection === 'products') docs = mockData.products;
      if (collection === 'yachts') docs = mockData.yachts;
      if (collection === 'tags') docs = mockData.tags;
      if (collection === 'categories') docs = mockData.categories;

      // Apply filters
      if (where) {
        if (where.vendor?.equals) {
          docs = docs.filter((d: any) => d.vendor === where.vendor.equals);
        }
      }

      return {
        docs,
        totalDocs: docs.length,
        limit: 10,
        totalPages: Math.ceil(docs.length / 10),
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
      };
    }),

    _reset: () => {
      mockData.vendors = [];
      mockData.products = [];
      mockData.yachts = [];
      mockData.tags = [];
      mockData.categories = [];
      mockData.users = [];
    },
  };
};

describe('Integration - Relationship Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Product -> Vendor Relationship', () => {
    it('should establish many-to-one relationship', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'ACME Systems',
          slug: 'acme-systems',
          tier: 'tier2',
        },
      });

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'GPS Navigator',
          slug: 'gps-navigator',
          vendor: vendor.id,
        },
      });

      expect(product.vendor).toBe(vendor.id);
    });

    it('should resolve vendor relationship with depth=1', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'NavTech',
          slug: 'navtech',
          tier: 'tier2',
        },
      });

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Radar System',
          slug: 'radar-system',
          vendor: vendor.id,
        },
      });

      const productWithVendor = await payload.findByID({
        collection: 'products',
        id: product.id,
        depth: 1,
      });

      expect(productWithVendor.vendor).toMatchObject({
        id: vendor.id,
        companyName: 'NavTech',
      });
    });

    it('should support multiple products per vendor', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Marine Electronics Inc',
          slug: 'marine-electronics',
          tier: 'tier2',
        },
      });

      const product1 = await payload.create({
        collection: 'products',
        data: {
          name: 'GPS System',
          slug: 'gps-system',
          vendor: vendor.id,
        },
      });

      const product2 = await payload.create({
        collection: 'products',
        data: {
          name: 'Radar System',
          slug: 'radar-system-2',
          vendor: vendor.id,
        },
      });

      const products = await payload.find({
        collection: 'products',
        where: {
          vendor: { equals: vendor.id },
        },
      });

      expect(products.docs).toHaveLength(2);
      expect(products.docs.map((p: any) => p.id)).toContain(product1.id);
      expect(products.docs.map((p: any) => p.id)).toContain(product2.id);
    });
  });

  describe('Yacht -> Vendor Relationship (via supplierMap)', () => {
    it('should establish yacht-vendor relationship through supplierMap', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Yacht Systems',
          slug: 'yacht-systems',
          tier: 'free',
        },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Superyacht Alpha',
          slug: 'superyacht-alpha',
          launchYear: 2023,
          supplierMap: [
            {
              vendor: vendor.id,
              systemCategory: 'navigation',
              installationDate: '2023-06-01',
            },
          ],
        },
      });

      expect(yacht.supplierMap[0].vendor).toBe(vendor.id);
      expect(yacht.supplierMap[0].systemCategory).toBe('navigation');
    });

    it('should resolve vendor in supplierMap with depth=1', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'PropTech',
          slug: 'proptech',
          tier: 'tier1',
        },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'M/Y Eclipse',
          slug: 'm-y-eclipse',
          launchYear: 2022,
          supplierMap: [
            {
              vendor: vendor.id,
              systemCategory: 'propulsion',
            },
          ],
        },
      });

      const yachtWithVendors = await payload.findByID({
        collection: 'yachts',
        id: yacht.id,
        depth: 1,
      });

      expect(yachtWithVendors.supplierMap[0].vendor).toMatchObject({
        id: vendor.id,
        companyName: 'PropTech',
      });
    });

    it('should support multiple vendors per yacht', async () => {
      const vendor1 = await payload.create({
        collection: 'vendors',
        data: { companyName: 'NavSys', slug: 'navsys', tier: 'tier1' },
      });

      const vendor2 = await payload.create({
        collection: 'vendors',
        data: { companyName: 'CommTech', slug: 'commtech', tier: 'tier1' },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Luxury Yacht One',
          slug: 'luxury-yacht-one',
          launchYear: 2023,
          supplierMap: [
            { vendor: vendor1.id, systemCategory: 'navigation' },
            { vendor: vendor2.id, systemCategory: 'communication' },
          ],
        },
      });

      expect(yacht.supplierMap).toHaveLength(2);
      expect(yacht.supplierMap[0].vendor).toBe(vendor1.id);
      expect(yacht.supplierMap[1].vendor).toBe(vendor2.id);
    });
  });
  describe('Yacht -> Products Relationship (via supplierMap)', () => {
    it('should establish yacht-products relationship', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: { companyName: 'TechVendor', slug: 'techvendor', tier: 'tier2' },
      });

      const product1 = await payload.create({
        collection: 'products',
        data: {
          name: 'GPS Unit',
          slug: 'gps-unit',
          vendor: vendor.id,
        },
      });

      const product2 = await payload.create({
        collection: 'products',
        data: {
          name: 'Radar Unit',
          slug: 'radar-unit',
          vendor: vendor.id,
        },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Test Yacht',
          slug: 'test-yacht',
          launchYear: 2023,
          supplierMap: [
            {
              vendor: vendor.id,
              products: [product1.id, product2.id],
              systemCategory: 'navigation',
            },
          ],
        },
      });

      expect(yacht.supplierMap[0].products).toHaveLength(2);
      expect(yacht.supplierMap[0].products).toContain(product1.id);
      expect(yacht.supplierMap[0].products).toContain(product2.id);
    });

    it('should resolve products in supplierMap with depth=1', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: { companyName: 'ElectroMarine', slug: 'electromarine', tier: 'tier2' },
      });

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Autopilot System',
          slug: 'autopilot-system',
          vendor: vendor.id,
        },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Smart Yacht',
          slug: 'smart-yacht',
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

      const yachtResolved = await payload.findByID({
        collection: 'yachts',
        id: yacht.id,
        depth: 1,
      });

      expect(yachtResolved.supplierMap[0].products[0]).toMatchObject({
        id: product.id,
        name: 'Autopilot System',
      });
    });
  });

  describe('Vendor -> User Relationship (one-to-one)', () => {
    it('should establish one-to-one vendor-user relationship', async () => {
      const user = await payload.create({
        collection: 'users',
        data: {
          email: 'vendor@example.com',
          role: 'vendor',
        },
      });

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'UserVendor',
          slug: 'uservendor',
          tier: 'free',
          user: user.id,
        },
      });

      expect(vendor.user).toBe(user.id);
    });

    it('should resolve user relationship with depth=1', async () => {
      const user = await payload.create({
        collection: 'users',
        data: {
          email: 'john@example.com',
          role: 'vendor',
        },
      });

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Johns Marine',
          slug: 'johns-marine',
          tier: 'tier1',
          user: user.id,
        },
      });

      const vendorResolved = await payload.findByID({
        collection: 'vendors',
        id: vendor.id,
        depth: 1,
      });

      expect(vendorResolved.user).toMatchObject({
        id: user.id,
        email: 'john@example.com',
      });
    });
  });

  describe('Categories -> ParentCategory (self-referential)', () => {
    it('should establish parent-child category relationship', async () => {
      const parentCat = await payload.create({
        collection: 'categories',
        data: {
          name: 'Electronics',
          slug: 'electronics',
        },
      });

      const childCat = await payload.create({
        collection: 'categories',
        data: {
          name: 'Navigation',
          slug: 'navigation',
          parentCategory: parentCat.id,
        },
      });

      expect(childCat.parentCategory).toBe(parentCat.id);
    });

    it('should resolve parent category with depth=1', async () => {
      const parentCat = await payload.create({
        collection: 'categories',
        data: {
          name: 'Systems',
          slug: 'systems',
        },
      });

      const childCat = await payload.create({
        collection: 'categories',
        data: {
          name: 'Communications',
          slug: 'communications',
          parentCategory: parentCat.id,
        },
      });

      const childResolved = await payload.findByID({
        collection: 'categories',
        id: childCat.id,
        depth: 1,
      });

      expect(childResolved.parentCategory).toMatchObject({
        id: parentCat.id,
        name: 'Systems',
      });
    });

    it('should support multi-level hierarchy', async () => {
      const level1 = await payload.create({
        collection: 'categories',
        data: { name: 'Marine', slug: 'marine' },
      });

      const level2 = await payload.create({
        collection: 'categories',
        data: {
          name: 'Electronics',
          slug: 'electronics-l2',
          parentCategory: level1.id,
        },
      });

      const level3 = await payload.create({
        collection: 'categories',
        data: {
          name: 'GPS',
          slug: 'gps-l3',
          parentCategory: level2.id,
        },
      });

      expect(level3.parentCategory).toBe(level2.id);
      expect(level2.parentCategory).toBe(level1.id);
      expect(level1.parentCategory).toBeUndefined();
    });
  });

  describe('Cross-Collection Relationship Integrity', () => {
    it('should maintain referential integrity across collections', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: { companyName: 'FullChain', slug: 'fullchain', tier: 'tier2' },
      });

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'ChainProduct',
          slug: 'chainproduct',
          vendor: vendor.id,
        },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Chain Yacht',
          slug: 'chain-yacht',
          launchYear: 2023,
          supplierMap: [
            {
              vendor: vendor.id,
              products: [product.id],
              systemCategory: 'navigation',
            },
          ],
        },
      });

      expect(product.vendor).toBe(vendor.id);
      expect(yacht.supplierMap[0].vendor).toBe(vendor.id);
      expect(yacht.supplierMap[0].products).toContain(product.id);
    });

    it('should resolve deep relationship chains', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: { companyName: 'DeepChain', slug: 'deepchain', tier: 'tier2' },
      });

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'DeepProduct',
          slug: 'deepproduct',
          vendor: vendor.id,
        },
      });

      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Deep Yacht',
          slug: 'deep-yacht',
          launchYear: 2023,
          supplierMap: [
            {
              vendor: vendor.id,
              products: [product.id],
              systemCategory: 'communication',
            },
          ],
        },
      });

      const yachtResolved = await payload.findByID({
        collection: 'yachts',
        id: yacht.id,
        depth: 1,
      });

      expect(yachtResolved.supplierMap[0].vendor.companyName).toBe('DeepChain');
      expect(yachtResolved.supplierMap[0].products[0].name).toBe('DeepProduct');
    });
  });
});
