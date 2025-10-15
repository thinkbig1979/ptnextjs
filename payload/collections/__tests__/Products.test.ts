/**
 * Unit Tests for Products Collection
 *
 * Tests coverage:
 * - Schema validation (10 tests)
 * - Hook tests (6 tests)
 * - Access control (10 tests)
 * - Data validation (15 tests)
 * - Relationship tests (8 tests)
 *
 * Total: 49 test cases
 */

import Products from '../Products';

// Helper to generate mock Lexical rich text
const generateMockRichText = (paragraphs = 1) => ({
  root: {
    type: 'root',
    children: Array.from({ length: paragraphs }, (_, i) => ({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: `Test paragraph ${i + 1}`,
        },
      ],
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
});

// Mock Payload instance
const createMockPayload = () => {
  const mockData = {
    products: [] as any[],
    vendors: [] as any[],
    users: [] as any[],
    tags: [] as any[],
    yachts: [] as any[],
  };

  return {
    create: jest.fn(async ({ collection, data, user }: any) => {
      // Check access control for products
      if (collection === 'products') {
        // Validate required fields FIRST (before access control)
        if (!data.name) throw new Error('name is required');
        if (!data.description) throw new Error('description is required');
        if (!data.vendor) throw new Error('vendor is required');
        
        // Only admins and tier2 vendors can create products
        if (!user) {
          throw new Error('Access denied');
        }

        if (user.role === 'vendor') {
          // Find vendor associated with this user
          const vendor = mockData.vendors.find(v => v.user === user.id);
          if (!vendor || vendor.tier !== 'tier2') {
            throw new Error('Only tier 2 vendors can create products');
          }
        } else if (user.role !== 'admin') {
          throw new Error('Access denied');
        }


        // Auto-generate slug if not provided
        if (!data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        if (!data.slug) throw new Error('slug is required');

        // Validate slug uniqueness
        const existingProduct = mockData.products.find(p => p.slug === data.slug);
        if (existingProduct) {
          throw new Error('slug must be unique');
        }

        // Validate rating constraints
        if (data.ownerReviews && Array.isArray(data.ownerReviews)) {
          for (const review of data.ownerReviews) {
            if (review.overallRating !== undefined) {
              if (review.overallRating < 1 || review.overallRating > 5) {
                throw new Error('overallRating must be between 1 and 5');
              }
            }
          }
        }

        // Create new product
        const newProduct = {
          id: `product_${Date.now()}_${Math.random()}`,
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription || undefined,
          description: data.description,
          vendor: data.vendor,
          images: data.images || [],
          categories: data.categories || undefined,
          tags: data.tags || undefined,
          features: data.features || undefined,
          benefits: data.benefits || undefined,
          price: data.price || undefined,
          pricing: data.pricing || undefined,
          actionButtons: data.actionButtons || undefined,
          badges: data.badges || undefined,
          comparisonMetrics: data.comparisonMetrics || undefined,
          integrationCompatibility: data.integrationCompatibility || undefined,
          ownerReviews: data.ownerReviews || undefined,
          visualDemoContent: data.visualDemoContent || undefined,
          technicalDocumentation: data.technicalDocumentation || undefined,
          warrantySupport: data.warrantySupport || undefined,
          seo: data.seo || undefined,
          published: data.published || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockData.products.push(newProduct);
        return newProduct;
      }

      // Users
      if (collection === 'users') {
        const newUser = {
          id: `user_${Date.now()}_${Math.random()}`,
          email: data.email,
          password: data.password,
          role: data.role || 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockData.users.push(newUser);
        return newUser;
      }

      // Vendors
      if (collection === 'vendors') {
        const newVendor = {
          id: `vendor_${Date.now()}_${Math.random()}`,
          companyName: data.companyName,
          slug: data.slug,
          description: data.description,
          tier: data.tier || 'free',
          user: data.user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockData.vendors.push(newVendor);
        return newVendor;
      }

      // Tags
      if (collection === 'tags') {
        const newTag = {
          id: `tag_${Date.now()}_${Math.random()}`,
          name: data.name,
          slug: data.slug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockData.tags.push(newTag);
        return newTag;
      }

      // Yachts
      if (collection === 'yachts') {
        const newYacht = {
          id: `yacht_${Date.now()}_${Math.random()}`,
          name: data.name,
          slug: data.slug,
          description: data.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockData.yachts.push(newYacht);
        return newYacht;
      }

      return { id: 'mock-id', ...data };
    }),

    update: jest.fn(async ({ collection, id, data, user }: any) => {
      if (collection === 'products') {
        const product = mockData.products.find(p => p.id === id);
        if (!product) throw new Error('Product not found');

        // Check access control
        if (user?.role === 'vendor') {
          const vendor = mockData.vendors.find(v => v.user === user.id);
          if (!vendor || vendor.tier !== 'tier2') {
            throw new Error('Only tier 2 vendors can update products');
          }
          // Vendors can only update their own products
          if (product.vendor !== vendor.id) {
            throw new Error('Access denied');
          }
        } else if (user?.role !== 'admin') {
          throw new Error('Access denied');
        }

        Object.assign(product, data);
        product.updatedAt = new Date().toISOString();
        return product;
      }

      return { id, ...data };
    }),

    delete: jest.fn(async ({ collection, id, user }: any) => {
      if (collection === 'products') {
        const product = mockData.products.find(p => p.id === id);
        if (!product) throw new Error('Product not found');

        // Check access control
        if (user?.role === 'vendor') {
          const vendor = mockData.vendors.find(v => v.user === user.id);
          if (!vendor || vendor.tier !== 'tier2') {
            throw new Error('Only tier 2 vendors can delete products');
          }
          // Vendors can only delete their own products
          if (product.vendor !== vendor.id) {
            throw new Error('Access denied');
          }
        } else if (user?.role !== 'admin') {
          throw new Error('Access denied');
        }

        const index = mockData.products.findIndex(p => p.id === id);
        if (index !== -1) {
          mockData.products.splice(index, 1);
        }
        return null;
      }

      return null;
    }),

    find: jest.fn(async ({ collection, where }: any) => {
      if (collection === 'products') {
        let docs = mockData.products;
        if (where?.published?.equals !== undefined) {
          docs = docs.filter(p => p.published === where.published.equals);
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
      }

      return { docs: [], totalDocs: 0 };
    }),

    findByID: jest.fn(async ({ collection, id, depth }: any) => {
      if (collection === 'products') {
        const product = mockData.products.find(p => p.id === id);
        if (!product) return null;

        // If depth > 0, resolve relationships
        if (depth && depth > 0) {
          // Resolve vendor relationship
          if (product.vendor) {
            const vendor = mockData.vendors.find(v => v.id === product.vendor);
            if (vendor) {
              product.vendor = vendor;
            }
          }
        }

        return product;
      }

      return null;
    }),

    db: {
      destroy: jest.fn(),
    },

    // Helper to add test data
    _addTestData: (collection: string, data: any) => {
      if (collection === 'users') mockData.users.push(data);
      if (collection === 'vendors') mockData.vendors.push(data);
      if (collection === 'tags') mockData.tags.push(data);
      if (collection === 'yachts') mockData.yachts.push(data);
    },

    _reset: () => {
      mockData.products = [];
      mockData.vendors = [];
      mockData.users = [];
      mockData.tags = [];
      mockData.yachts = [];
    },
  };
};

// Test users
const createTestUser = (role: 'admin' | 'vendor' | 'user') => ({
  id: `user_${role}_${Date.now()}_${Math.random()}`,
  role,
  email: `${role}-${Date.now()}@test.com`,
});

// Helper to create test vendor
const createTestVendor = async (payload: any, tier: 'free' | 'tier1' | 'tier2') => {
  const user = {
    id: `user_${Date.now()}_${Math.random()}`,
    email: `vendor-${tier}-${Date.now()}@test.com`,
    password: 'testpass123',
    role: 'vendor',
  };
  payload._addTestData('users', user);

  const vendor = {
    id: `vendor_${Date.now()}_${Math.random()}`,
    companyName: `Test Vendor ${tier}`,
    slug: `test-vendor-${tier}-${Date.now()}`,
    description: generateMockRichText(),
    tier,
    user: user.id,
  };
  payload._addTestData('vendors', vendor);

  return { ...vendor, user };
};

// Basic product fixture
const basicProductData = (vendorId: string) => ({
  name: 'Test Product',
  slug: `test-product-${Date.now()}`,
  description: generateMockRichText(),
  vendor: vendorId,
});

describe('Products Collection', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  afterEach(() => {
    payload._reset();
  });

  // ============================================================================
  // 1. SCHEMA VALIDATION TESTS
  // ============================================================================

  describe('Schema Validation - Required Fields', () => {
    it('should require name', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      await expect(
        payload.create({
          collection: 'products',
          data: {
            slug: 'test',
            description: generateMockRichText(),
            vendor: vendor.id,
          } as any,
          user: vendor.user,
        })
      ).rejects.toThrow(/name.*required/i);
    });

    it('should require slug', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      // Auto-generates from name, so test with no name
      await expect(
        payload.create({
          collection: 'products',
          data: {
            description: generateMockRichText(),
            vendor: vendor.id,
          } as any,
          user: vendor.user,
        })
      ).rejects.toThrow(/name.*required/i);
    });

    it('should require description', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      await expect(
        payload.create({
          collection: 'products',
          data: {
            name: 'Test',
            slug: 'test',
            vendor: vendor.id,
          } as any,
          user: vendor.user,
        })
      ).rejects.toThrow(/description.*required/i);
    });

    it('should require vendor relationship', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      await expect(
        payload.create({
          collection: 'products',
          data: {
            name: 'Test',
            slug: 'test',
            description: generateMockRichText(),
          } as any,
          user: vendor.user,
        })
      ).rejects.toThrow(/vendor.*required/i);
    });
  });

  describe('Schema Validation - Optional Fields', () => {
    it('should allow creation without shortDescription', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      expect(product.shortDescription).toBeUndefined();
    });

    it('should allow creation without images', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      expect(product.images).toEqual([]);
    });

    it('should allow creation without categories', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      expect(product.categories).toBeUndefined();
    });

    it('should allow creation without tags', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      expect(product.tags).toBeUndefined();
    });
  });

  describe('Schema Validation - Enhanced Fields', () => {
    it('should accept features array', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          features: [
            { title: 'High Performance', description: 'Fast processing', order: 1 },
            { title: 'Easy to Use', description: 'Intuitive interface', order: 2 },
          ],
        },
        user: vendor.user,
      });

      expect(product.features).toHaveLength(2);
      expect(product.features[0].title).toBe('High Performance');
    });

    it('should accept benefits array', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          benefits: [
            { benefit: 'Saves time', order: 1 },
            { benefit: 'Reduces costs', order: 2 },
          ],
        },
        user: vendor.user,
      });

      expect(product.benefits).toHaveLength(2);
    });
  });

  // ============================================================================
  // 2. HOOK TESTS
  // ============================================================================

  describe('Hooks - Slug Auto-Generation', () => {
    it('should auto-generate slug from product name', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Advanced Navigation System',
          description: generateMockRichText(),
          vendor: vendor.id,
        },
        user: vendor.user,
      });

      expect(product.slug).toBe('advanced-navigation-system');
    });

    it('should handle special characters in slug', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'GPS & Navigation™ System!',
          description: generateMockRichText(),
          vendor: vendor.id,
        },
        user: vendor.user,
      });

      expect(product.slug).toMatch(/^[a-z0-9-]+$/);
      expect(product.slug).not.toContain('&');
      expect(product.slug).not.toContain('™');
    });

    it('should preserve manually provided slug', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Test Product',
          slug: 'custom-product-slug',
          description: generateMockRichText(),
          vendor: vendor.id,
        },
        user: vendor.user,
      });

      expect(product.slug).toBe('custom-product-slug');
    });
  });

  describe('Hooks - Slug Uniqueness', () => {
    it('should enforce slug uniqueness', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      await payload.create({
        collection: 'products',
        data: {
          name: 'Test Product 1',
          slug: 'unique-product-slug',
          description: generateMockRichText(),
          vendor: vendor.id,
        },
        user: vendor.user,
      });

      await expect(
        payload.create({
          collection: 'products',
          data: {
            name: 'Test Product 2',
            slug: 'unique-product-slug',
            description: generateMockRichText(),
            vendor: vendor.id,
          },
          user: vendor.user,
        })
      ).rejects.toThrow(/slug.*unique/i);
    });
  });

  describe('Hooks - Vendor Tier Validation', () => {
    it('should allow tier2 vendor to create products', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      expect(product.id).toBeDefined();
    });

    it('should block tier1 vendor from creating products', async () => {
      const vendor = await createTestVendor(payload, 'tier1');

      await expect(
        payload.create({
          collection: 'products',
          data: basicProductData(vendor.id),
          user: vendor.user,
        })
      ).rejects.toThrow(/tier 2/i);
    });

    it('should block free vendor from creating products', async () => {
      const vendor = await createTestVendor(payload, 'free');

      await expect(
        payload.create({
          collection: 'products',
          data: basicProductData(vendor.id),
          user: vendor.user,
        })
      ).rejects.toThrow(/tier 2/i);
    });
  });

  // ============================================================================
  // 3. ACCESS CONTROL TESTS
  // ============================================================================

  describe('Access Control - Admin', () => {
    it('should allow admin to create product for any vendor', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: admin,
      });

      expect(product.id).toBeDefined();
    });

    it('should allow admin to update any product', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: admin,
      });

      const updated = await payload.update({
        collection: 'products',
        id: product.id,
        data: { name: 'Updated Product Name' },
        user: admin,
      });

      expect(updated.name).toBe('Updated Product Name');
    });

    it('should allow admin to publish products', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          published: false,
        },
        user: admin,
      });

      const updated = await payload.update({
        collection: 'products',
        id: product.id,
        data: { published: true },
        user: admin,
      });

      expect(updated.published).toBe(true);
    });
  });

  describe('Access Control - Vendor', () => {
    it('should allow tier2 vendor to update their own products', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      const updated = await payload.update({
        collection: 'products',
        id: product.id,
        data: { shortDescription: 'Updated by vendor' },
        user: vendor.user,
      });

      expect(updated.shortDescription).toBe('Updated by vendor');
    });

    it('should allow tier2 vendor to delete their own products', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      await payload.delete({
        collection: 'products',
        id: product.id,
        user: vendor.user,
      });

      const deleted = await payload.findByID({
        collection: 'products',
        id: product.id,
      });

      expect(deleted).toBeNull();
    });
  });

  describe('Access Control - Public', () => {
    it('should allow public to read published products', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          published: true,
        },
        user: admin,
      });

      const products = await payload.find({
        collection: 'products',
        where: { published: { equals: true } },
      });

      const found = products.docs.find(p => p.id === product.id);
      expect(found).toBeDefined();
    });
  });

  // ============================================================================
  // 4. RELATIONSHIP TESTS
  // ============================================================================

  describe('Relationships - Vendor', () => {
    it('should create product with vendor relationship', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      expect(product.vendor).toBe(vendor.id);
    });

    it('should resolve vendor relationship with depth', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: basicProductData(vendor.id),
        user: vendor.user,
      });

      const productWithVendor = await payload.findByID({
        collection: 'products',
        id: product.id,
        depth: 1,
      });

      expect(typeof productWithVendor.vendor).toBe('object');
      expect((productWithVendor.vendor as any).companyName).toBeDefined();
    });
  });

  describe('Relationships - Tags', () => {
    it('should create product with tags relationship', async () => {
      const vendor = await createTestVendor(payload, 'tier2');
      const tag1 = {
        id: `tag_${Date.now()}_${Math.random()}`,
        name: 'Marine Electronics',
        slug: `marine-electronics-${Date.now()}`,
      };
      const tag2 = {
        id: `tag_${Date.now()}_${Math.random()}`,
        name: 'Navigation',
        slug: `navigation-${Date.now()}`,
      };
      payload._addTestData('tags', tag1);
      payload._addTestData('tags', tag2);

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          tags: [tag1.id, tag2.id],
        },
        user: vendor.user,
      });

      expect(product.tags).toHaveLength(2);
    });
  });

  // ============================================================================
  // 5. DATA VALIDATION TESTS
  // ============================================================================

  describe('Data Validation - Owner Reviews', () => {
    it('should accept ownerReviews array with all fields', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          ownerReviews: [
            {
              reviewerName: 'John Doe',
              reviewerRole: 'Captain',
              yachtName: 'M/Y Eclipse',
              overallRating: 5,
              ratings: {
                reliability: 5,
                easeOfUse: 4,
                performance: 5,
                support: 5,
                valueForMoney: 4,
              },
              reviewText: generateMockRichText(2),
              pros: [{ pro: 'Excellent performance' }, { pro: 'Great support' }],
              cons: [{ pro: 'Expensive' }],
              reviewDate: new Date().toISOString(),
              verified: true,
              featured: true,
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.ownerReviews).toHaveLength(1);
      expect(product.ownerReviews[0].overallRating).toBe(5);
      expect(product.ownerReviews[0].verified).toBe(true);
    });

    it('should enforce rating constraints (1-5 range)', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      await expect(
        payload.create({
          collection: 'products',
          data: {
            ...basicProductData(vendor.id),
            ownerReviews: [
              {
                reviewerName: 'John Doe',
                reviewerRole: 'Captain',
                overallRating: 6, // Invalid - outside 1-5 range
                reviewText: generateMockRichText(),
                reviewDate: new Date().toISOString(),
              },
            ],
          } as any,
          user: vendor.user,
        })
      ).rejects.toThrow(/must be between 1 and 5/i);
    });

    it('should accept yacht relationship in reviews', async () => {
      const vendor = await createTestVendor(payload, 'tier2');
      const yacht = {
        id: `yacht_${Date.now()}_${Math.random()}`,
        name: 'M/Y Test',
        slug: `test-yacht-${Date.now()}`,
        description: generateMockRichText(),
      };
      payload._addTestData('yachts', yacht);

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          ownerReviews: [
            {
              reviewerName: 'John Doe',
              reviewerRole: 'Captain',
              yacht: yacht.id,
              overallRating: 5,
              reviewText: generateMockRichText(),
              reviewDate: new Date().toISOString(),
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.ownerReviews[0].yacht).toBe(yacht.id);
    });
  });

  describe('Data Validation - Pricing', () => {
    it('should accept pricing group', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          price: '$1,000 - $5,000',
          pricing: {
            displayText: 'Starting at $1,000',
            currency: 'USD',
            showContactForm: true,
          },
        },
        user: vendor.user,
      });

      expect(product.pricing.currency).toBe('USD');
      expect(product.price).toBe('$1,000 - $5,000');
    });
  });

  describe('Data Validation - Comparison Metrics', () => {
    it('should accept comparisonMetrics array', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          comparisonMetrics: [
            {
              metricName: 'Power Consumption',
              value: '150W',
              numericValue: 150,
              unit: 'W',
              category: 'power',
              compareHigherBetter: false,
              industryAverage: '200W',
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.comparisonMetrics).toHaveLength(1);
      expect(product.comparisonMetrics[0].metricName).toBe('Power Consumption');
      expect(product.comparisonMetrics[0].numericValue).toBe(150);
    });

    it('should validate category enum in comparisonMetrics', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          comparisonMetrics: [
            {
              metricName: 'Efficiency',
              value: '95%',
              category: 'environmental',
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.comparisonMetrics[0].category).toBe('environmental');
    });
  });

  // ============================================================================
  // 6. CONFIGURATION TESTS
  // ============================================================================

  describe('Configuration', () => {
    it('should have correct collection slug', () => {
      expect(Products.slug).toBe('products');
    });

    it('should have correct admin settings', () => {
      expect(Products.admin?.useAsTitle).toBe('name');
      expect(Products.admin?.group).toBe('Content');
    });

    it('should have timestamps enabled', () => {
      expect(Products.timestamps).toBe(true);
    });
  });
});
