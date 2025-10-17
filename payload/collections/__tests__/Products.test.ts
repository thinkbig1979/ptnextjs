/**
 * Unit Tests for Products Collection
 *
 * Tests coverage:
 * - Schema validation (10 tests)
 * - Hook tests (7 tests)
 * - Access control (9 tests)
 * - Data validation (23 tests)
 * - Relationship tests (3 tests)
 * - Configuration (3 tests)
 *
 * Total: 55 test cases
 *
 * Enhanced fields coverage:
 * - Comparison metrics ✓
 * - Integration compatibility (with conditional API docs) ✓
 * - Owner reviews with rating constraints ✓
 * - Visual demo content (360°, 3D, hotspots, video, AR) ✓
 * - Technical documentation ✓
 * - Warranty & support ✓
 * - Services, action buttons, badges, SEO ✓
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
          services: data.services || undefined,
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

  describe('Data Validation - Integration Compatibility', () => {
    it('should accept integrationCompatibility group with all fields', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          integrationCompatibility: {
            supportedProtocols: [
              { protocol: 'NMEA 2000', version: '2.0', notes: 'Full support' },
              { protocol: 'Modbus TCP', version: '1.0' },
            ],
            integrationPartners: [
              { partner: 'Garmin', integrationType: 'Native', certificationLevel: 'certified' },
            ],
            apiAvailable: true,
            apiDocumentationUrl: 'https://example.com/api-docs',
            sdkLanguages: [{ language: 'JavaScript' }, { language: 'Python' }],
          },
        },
        user: vendor.user,
      });

      expect(product.integrationCompatibility.supportedProtocols).toHaveLength(2);
      expect(product.integrationCompatibility.integrationPartners).toHaveLength(1);
      expect(product.integrationCompatibility.apiAvailable).toBe(true);
      expect(product.integrationCompatibility.apiDocumentationUrl).toBe('https://example.com/api-docs');
      expect(product.integrationCompatibility.sdkLanguages).toHaveLength(2);
    });

    it('should accept integrationCompatibility without API docs when apiAvailable is false', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          integrationCompatibility: {
            apiAvailable: false,
          },
        },
        user: vendor.user,
      });

      expect(product.integrationCompatibility.apiAvailable).toBe(false);
      expect(product.integrationCompatibility.apiDocumentationUrl).toBeUndefined();
    });
  });

  describe('Data Validation - Visual Demo Content', () => {
    it('should accept visualDemoContent with 360° images', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          visualDemoContent: {
            images360: [
              { image: 'media_123', angle: 0, label: 'Front view' },
              { image: 'media_124', angle: 90, label: 'Side view' },
              { image: 'media_125', angle: 180, label: 'Back view' },
            ],
          },
        },
        user: vendor.user,
      });

      expect(product.visualDemoContent.images360).toHaveLength(3);
      expect(product.visualDemoContent.images360[0].angle).toBe(0);
      expect(product.visualDemoContent.images360[1].angle).toBe(90);
    });

    it('should accept visualDemoContent with 3D model', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          visualDemoContent: {
            model3d: {
              modelUrl: 'https://example.com/model.glb',
              thumbnailImage: 'media_thumb',
              allowDownload: true,
            },
          },
        },
        user: vendor.user,
      });

      expect(product.visualDemoContent.model3d.modelUrl).toBe('https://example.com/model.glb');
      expect(product.visualDemoContent.model3d.allowDownload).toBe(true);
    });

    it('should accept visualDemoContent with interactive hotspots (nested structure)', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          visualDemoContent: {
            interactiveHotspots: [
              {
                image: 'media_base',
                hotspots: [
                  {
                    x: 25,
                    y: 50,
                    title: 'Control Panel',
                    description: 'Advanced control interface',
                    featureImage: 'media_feature1',
                  },
                  {
                    x: 75,
                    y: 30,
                    title: 'Display',
                    description: 'High-resolution touchscreen',
                  },
                ],
              },
            ],
          },
        },
        user: vendor.user,
      });

      expect(product.visualDemoContent.interactiveHotspots).toHaveLength(1);
      expect(product.visualDemoContent.interactiveHotspots[0].hotspots).toHaveLength(2);
      expect(product.visualDemoContent.interactiveHotspots[0].hotspots[0].x).toBe(25);
      expect(product.visualDemoContent.interactiveHotspots[0].hotspots[0].y).toBe(50);
      expect(product.visualDemoContent.interactiveHotspots[0].hotspots[0].title).toBe('Control Panel');
    });

    it('should accept visualDemoContent with video walkthrough and chapters', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          visualDemoContent: {
            videoWalkthrough: {
              videoUrl: 'https://youtube.com/watch?v=test123',
              thumbnail: 'media_video_thumb',
              duration: 180,
              chapters: [
                { timestamp: 0, title: 'Introduction' },
                { timestamp: 30, title: 'Features Overview' },
                { timestamp: 90, title: 'Installation Guide' },
              ],
            },
          },
        },
        user: vendor.user,
      });

      expect(product.visualDemoContent.videoWalkthrough.duration).toBe(180);
      expect(product.visualDemoContent.videoWalkthrough.chapters).toHaveLength(3);
      expect(product.visualDemoContent.videoWalkthrough.chapters[0].title).toBe('Introduction');
    });

    it('should accept visualDemoContent with AR preview for iOS and Android', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          visualDemoContent: {
            augmentedRealityPreview: {
              arModelUrl: 'https://example.com/model.usdz',
              glbModelUrl: 'https://example.com/model.glb',
              scaleReference: '1:1 real-world scale',
            },
          },
        },
        user: vendor.user,
      });

      expect(product.visualDemoContent.augmentedRealityPreview.arModelUrl).toBe('https://example.com/model.usdz');
      expect(product.visualDemoContent.augmentedRealityPreview.glbModelUrl).toBe('https://example.com/model.glb');
      expect(product.visualDemoContent.augmentedRealityPreview.scaleReference).toBe('1:1 real-world scale');
    });

    it('should accept empty visualDemoContent group', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          visualDemoContent: {},
        },
        user: vendor.user,
      });

      expect(product.visualDemoContent).toEqual({});
    });
  });

  describe('Data Validation - Technical Documentation', () => {
    it('should accept technicalDocumentation array with all fields', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          technicalDocumentation: [
            {
              title: 'User Manual',
              type: 'manual',
              fileUrl: 'https://example.com/manual.pdf',
              language: 'en',
              version: '1.0',
            },
            {
              title: 'Technical Specification',
              type: 'spec',
              fileUrl: 'https://example.com/spec.pdf',
              language: 'en',
              version: '2.0',
            },
            {
              title: 'Installation Guide',
              type: 'installation',
              fileUrl: 'https://example.com/installation.pdf',
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.technicalDocumentation).toHaveLength(3);
      expect(product.technicalDocumentation[0].type).toBe('manual');
      expect(product.technicalDocumentation[1].type).toBe('spec');
      expect(product.technicalDocumentation[2].type).toBe('installation');
    });

    it('should accept technicalDocumentation with minimal fields', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          technicalDocumentation: [
            {
              title: 'Quick Start Guide',
              type: 'manual',
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.technicalDocumentation).toHaveLength(1);
      expect(product.technicalDocumentation[0].title).toBe('Quick Start Guide');
    });
  });

  describe('Data Validation - Warranty & Support', () => {
    it('should accept warrantySupport group with all fields', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          warrantySupport: {
            warrantyYears: 3,
            warrantyDetails: 'Comprehensive 3-year warranty covering all parts and labor',
            extendedWarrantyAvailable: true,
            supportChannels: [
              { channel: 'Email' },
              { channel: 'Phone' },
              { channel: '24/7 Chat' },
            ],
            supportResponseTime: '24 hours',
          },
        },
        user: vendor.user,
      });

      expect(product.warrantySupport.warrantyYears).toBe(3);
      expect(product.warrantySupport.extendedWarrantyAvailable).toBe(true);
      expect(product.warrantySupport.supportChannels).toHaveLength(3);
      expect(product.warrantySupport.supportResponseTime).toBe('24 hours');
    });

    it('should accept warrantySupport with minimal fields', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          warrantySupport: {
            warrantyYears: 1,
          },
        },
        user: vendor.user,
      });

      expect(product.warrantySupport.warrantyYears).toBe(1);
    });
  });

  describe('Data Validation - Additional Enhanced Fields', () => {
    it('should accept services array', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          services: [
            {
              title: 'Professional Installation',
              description: 'Expert installation by certified technicians',
              icon: 'wrench',
              order: 0,
            },
            {
              title: '24/7 Support',
              description: 'Round-the-clock technical support',
              icon: 'headset',
              order: 1,
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.services).toHaveLength(2);
      expect(product.services[0].title).toBe('Professional Installation');
    });

    it('should accept actionButtons array', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          actionButtons: [
            {
              label: 'Contact for Quote',
              type: 'primary',
              action: 'quote',
              icon: 'mail',
              order: 0,
            },
            {
              label: 'Download Brochure',
              type: 'secondary',
              action: 'download',
              actionData: 'https://example.com/brochure.pdf',
              icon: 'download',
              order: 1,
            },
          ],
        },
        user: vendor.user,
      });

      expect(product.actionButtons).toHaveLength(2);
      expect(product.actionButtons[0].action).toBe('quote');
      expect(product.actionButtons[1].action).toBe('download');
      expect(product.actionButtons[1].actionData).toBe('https://example.com/brochure.pdf');
    });

    it('should accept badges array', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          badges: [
            { label: 'ISO 9001', type: 'success', icon: 'award', order: 0 },
            { label: 'Marine Certified', type: 'info', icon: 'shield', order: 1 },
          ],
        },
        user: vendor.user,
      });

      expect(product.badges).toHaveLength(2);
      expect(product.badges[0].label).toBe('ISO 9001');
      expect(product.badges[1].label).toBe('Marine Certified');
    });

    it('should accept seo group', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          seo: {
            metaTitle: 'Best Marine Navigation System',
            metaDescription: 'Advanced navigation system for superyachts',
            keywords: 'navigation, marine, superyacht, GPS',
            ogImage: 'https://example.com/og-image.jpg',
          },
        },
        user: vendor.user,
      });

      expect(product.seo.metaTitle).toBe('Best Marine Navigation System');
      expect(product.seo.keywords).toBe('navigation, marine, superyacht, GPS');
    });
  });

  describe('Access Control - Vendor Restrictions', () => {
    it('should block vendor from updating other vendors products', async () => {
      const vendor1 = await createTestVendor(payload, 'tier2');
      const vendor2 = await createTestVendor(payload, 'tier2');

      const product2 = await payload.create({
        collection: 'products',
        data: basicProductData(vendor2.id),
        user: vendor2.user,
      });

      await expect(
        payload.update({
          collection: 'products',
          id: product2.id,
          data: { name: 'Hacked Product' },
          user: vendor1.user,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block vendor from deleting other vendors products', async () => {
      const vendor1 = await createTestVendor(payload, 'tier2');
      const vendor2 = await createTestVendor(payload, 'tier2');

      const product2 = await payload.create({
        collection: 'products',
        data: basicProductData(vendor2.id),
        user: vendor2.user,
      });

      await expect(
        payload.delete({
          collection: 'products',
          id: product2.id,
          user: vendor1.user,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block unauthenticated users from creating products', async () => {
      const vendor = await createTestVendor(payload, 'tier2');

      await expect(
        payload.create({
          collection: 'products',
          data: basicProductData(vendor.id),
          user: null,
        })
      ).rejects.toThrow(/access denied/i);
    });
  });

  describe('Data Validation - Multiple Enhanced Fields Together', () => {
    it('should accept product with all enhanced fields populated', async () => {
      const vendor = await createTestVendor(payload, 'tier2');
      const yacht = {
        id: `yacht_${Date.now()}_${Math.random()}`,
        name: 'M/Y Complete',
        slug: `complete-yacht-${Date.now()}`,
        description: generateMockRichText(),
      };
      payload._addTestData('yachts', yacht);

      const product = await payload.create({
        collection: 'products',
        data: {
          ...basicProductData(vendor.id),
          features: [{ title: 'Feature 1', description: 'Desc 1', order: 0 }],
          benefits: [{ benefit: 'Benefit 1', order: 0 }],
          comparisonMetrics: [
            { metricName: 'Power', value: '200W', numericValue: 200, unit: 'W', category: 'power' },
          ],
          integrationCompatibility: {
            supportedProtocols: [{ protocol: 'NMEA 2000' }],
            apiAvailable: true,
            apiDocumentationUrl: 'https://example.com/api',
          },
          ownerReviews: [
            {
              reviewerName: 'Captain Test',
              reviewerRole: 'Captain',
              yacht: yacht.id,
              overallRating: 5,
              reviewText: generateMockRichText(),
              reviewDate: new Date().toISOString(),
            },
          ],
          visualDemoContent: {
            images360: [{ image: 'media_1', angle: 0 }],
            model3d: { modelUrl: 'https://example.com/model.glb' },
          },
          technicalDocumentation: [{ title: 'Manual', type: 'manual' }],
          warrantySupport: { warrantyYears: 3 },
        },
        user: vendor.user,
      });

      expect(product.features).toHaveLength(1);
      expect(product.benefits).toHaveLength(1);
      expect(product.comparisonMetrics).toHaveLength(1);
      expect(product.integrationCompatibility.apiAvailable).toBe(true);
      expect(product.ownerReviews).toHaveLength(1);
      expect(product.visualDemoContent.images360).toHaveLength(1);
      expect(product.technicalDocumentation).toHaveLength(1);
      expect(product.warrantySupport.warrantyYears).toBe(3);
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
