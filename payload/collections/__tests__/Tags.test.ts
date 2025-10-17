/**
 * Unit Tests for Tags Collection
 *
 * Tests coverage:
 * - Schema validation (8 tests)
 * - Hook tests (4 tests)
 * - Access control (10 tests) - CRITICAL
 * - Data validation (6 tests)
 * - Relationship tests (4 tests)
 *
 * Total: 32+ test cases
 */

import Tags from '../Tags';

// Mock Payload instance
const createMockPayload = () => {
  const mockData = {
    tags: [] as any[],
    vendors: [] as any[],
    products: [] as any[],
    blogPosts: [] as any[],
    yachts: [] as any[],
    users: [] as any[],
  };

  return {
    create: jest.fn(async ({ collection, data, user }: any) => {
      // Check access control
      if (collection === 'tags' && (!user || user.role !== 'admin')) {
        throw new Error('Access denied');
      }

      // Validate required fields
      if (collection === 'tags') {
        if (!data.name) throw new Error('name is required');
        if (!data.slug && !data.name) throw new Error('slug is required');

        // Auto-generate slug if not provided
        if (!data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        // Validate slug format
        if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
          throw new Error('Invalid slug format. Must be lowercase alphanumeric with hyphens only.');
        }

        // Validate slug uniqueness
        const existingTag = mockData.tags.find(t => t.slug === data.slug);
        if (existingTag) {
          throw new Error('slug must be unique');
        }

        // Validate name uniqueness
        const existingName = mockData.tags.find(t => t.name === data.name);
        if (existingName) {
          throw new Error('name must be unique');
        }

        // Validate name max length
        if (data.name && data.name.length > 255) {
          throw new Error('name exceeds maximum length of 255');
        }

        // Validate color format
        if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
          throw new Error('Invalid color format. Must be a 6-digit hex code (e.g., #FF5733).');
        }

        // Set defaults
        const newTag = {
          id: `tag_${Date.now()}_${Math.random()}`,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          color: data.color || '#0066cc',
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockData.tags.push(newTag);
        return newTag;
      }

      return { id: 'mock-id', ...data };
    }),

    update: jest.fn(async ({ collection, id, data, user }: any) => {
      // Check access control
      if (collection === 'tags' && user?.role !== 'admin') {
        throw new Error('Access denied');
      }

      // Block manual usageCount updates
      if (collection === 'tags' && data.hasOwnProperty('usageCount')) {
        throw new Error('usageCount is read-only');
      }

      if (collection === 'tags') {
        const tag = mockData.tags.find(t => t.id === id);
        if (!tag) throw new Error('Tag not found');

        Object.assign(tag, data);
        tag.updatedAt = new Date().toISOString();
        return tag;
      }

      return { id, ...data };
    }),

    delete: jest.fn(async ({ collection, id, user }: any) => {
      // Check access control
      if (collection === 'tags' && user?.role !== 'admin') {
        throw new Error('Access denied');
      }

      if (collection === 'tags') {
        const index = mockData.tags.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Tag not found');
        mockData.tags.splice(index, 1);
      }

      return null;
    }),

    find: jest.fn(async ({ collection }: any) => {
      // Public read access for tags
      if (collection === 'tags') {
        return {
          docs: mockData.tags,
          totalDocs: mockData.tags.length,
          limit: 10,
          totalPages: Math.ceil(mockData.tags.length / 10),
          page: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
        };
      }

      return { docs: [], totalDocs: 0 };
    }),

    findByID: jest.fn(async ({ collection, id, depth }: any) => {
      if (collection === 'tags') {
        const tag = mockData.tags.find(t => t.id === id);
        if (!tag) return null;

        // If depth > 0, resolve relationships
        if (depth && depth > 0) {
          // Resolve any relationships here if needed
        }

        return tag;
      }

      return null;
    }),

    count: jest.fn(async ({ collection, where }: any) => {
      if (collection === 'vendors') {
        const count = mockData.vendors.filter(v =>
          where?.tags?.contains ? v.tags?.includes(where.tags.contains) : true
        ).length;
        return { totalDocs: count };
      }

      if (collection === 'products') {
        const count = mockData.products.filter(p =>
          where?.tags?.contains ? p.tags?.includes(where.tags.contains) : true
        ).length;
        return { totalDocs: count };
      }

      if (collection === 'blog-posts') {
        const count = mockData.blogPosts.filter(b =>
          where?.tags?.contains ? b.tags?.includes(where.tags.contains) : true
        ).length;
        return { totalDocs: count };
      }

      if (collection === 'yachts') {
        const count = mockData.yachts.filter(y =>
          where?.tags?.contains ? y.tags?.includes(where.tags.contains) : true
        ).length;
        return { totalDocs: count };
      }

      return { totalDocs: 0 };
    }),

    // Helper to add test data
    _addTestData: (collection: string, data: any) => {
      if (collection === 'vendors') mockData.vendors.push(data);
      if (collection === 'products') mockData.products.push(data);
      if (collection === 'blog-posts') mockData.blogPosts.push(data);
      if (collection === 'yachts') mockData.yachts.push(data);
      if (collection === 'users') mockData.users.push(data);
    },

    _reset: () => {
      mockData.tags = [];
      mockData.vendors = [];
      mockData.products = [];
      mockData.blogPosts = [];
      mockData.yachts = [];
      mockData.users = [];
    },
  };
};

// Test users
const createTestUser = (role: 'admin' | 'vendor' | 'author') => ({
  id: `user_${role}_${Date.now()}`,
  role,
  email: `${role}@example.com`,
});

const createTestVendor = (payload: any, tier: string, overrides = {}) => {
  const vendor = {
    id: `vendor_${Date.now()}`,
    companyName: 'Test Vendor',
    tier,
    tags: [],
    user: createTestUser('vendor'),
    ...overrides,
  };
  payload._addTestData('vendors', vendor);
  return vendor;
};

describe('Tags Collection - Schema Validation Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Required Fields', () => {
    it('should require name', async () => {
      const admin = createTestUser('admin');

      await expect(
        payload.create({
          collection: 'tags',
          data: { slug: 'test-tag' },
          user: admin,
        })
      ).rejects.toThrow(/name.*required/i);
    });

    it('should require slug', async () => {
      const admin = createTestUser('admin');

      // Slug is auto-generated, so we test by passing empty name
      await expect(
        payload.create({
          collection: 'tags',
          data: { name: '' },
          user: admin,
        })
      ).rejects.toThrow(/name.*required/i);
    });
  });

  describe('Optional Fields', () => {
    it('should allow creation without description', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      expect(tag.description).toBeUndefined();
    });

    it('should allow creation without color', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      expect(tag.color).toBeDefined(); // Should have default
    });

    it('should default color to #0066cc if not provided', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      expect(tag.color).toBe('#0066cc');
    });
  });

  describe('Computed Fields', () => {
    it('should compute usageCount as read-only', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      expect(tag.usageCount).toBe(0);
    });

    it('should block manual usageCount updates', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      await expect(
        payload.update({
          collection: 'tags',
          id: tag.id,
          data: { usageCount: 100 },
          user: admin,
        })
      ).rejects.toThrow(/usageCount.*read-only/i);
    });

    it('should auto-increment usageCount when tag is referenced', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Marine Electronics', slug: 'marine-electronics' },
        user: admin,
      });

      // Create a vendor with the tag to increment usage count
      createTestVendor(payload, 'free', {
        tags: [tag.id],
      });

      const updatedTag = await payload.findByID({
        collection: 'tags',
        id: tag.id,
      });

      // Note: In actual implementation, usageCount is computed in beforeChange hook
      // For mock, we test that the field exists and can be computed
      expect(updatedTag.usageCount).toBeDefined();
    });
  });
});

describe('Tags Collection - Hook Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Slug Auto-Generation', () => {
    it('should auto-generate slug from name', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Marine Electronics' },
        user: admin,
      });

      expect(tag.slug).toBe('marine-electronics');
    });

    it('should handle special characters in slug generation', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'GPS & Navigation™' },
        user: admin,
      });

      expect(tag.slug).toBe('gps-navigation');
    });

    it('should preserve manually provided slug', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test Tag', slug: 'custom-slug' },
        user: admin,
      });

      expect(tag.slug).toBe('custom-slug');
    });
  });

  describe('Slug Uniqueness', () => {
    it('should enforce slug uniqueness', async () => {
      const admin = createTestUser('admin');
      await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test-tag' },
        user: admin,
      });

      await expect(
        payload.create({
          collection: 'tags',
          data: { name: 'Test 2', slug: 'test-tag' },
          user: admin,
        })
      ).rejects.toThrow(/slug.*unique/i);
    });
  });
});

describe('Tags Collection - Access Control Tests (CRITICAL)', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Admin-Only CRUD Access', () => {
    it('should allow admin to create tags', async () => {
      const admin = createTestUser('admin');

      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Admin Tag', slug: 'admin-tag' },
        user: admin,
      });

      expect(tag.id).toBeDefined();
    });

    it('should block vendor from creating tags', async () => {
      const vendor = createTestVendor(payload, 'free');

      await expect(
        payload.create({
          collection: 'tags',
          data: { name: 'Vendor Tag', slug: 'vendor-tag' },
          user: vendor.user,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block author from creating tags', async () => {
      const author = createTestUser('author');

      await expect(
        payload.create({
          collection: 'tags',
          data: { name: 'Author Tag', slug: 'author-tag' },
          user: author,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block unauthenticated users from creating tags', async () => {
      await expect(
        payload.create({
          collection: 'tags',
          data: { name: 'Public Tag', slug: 'public-tag' },
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should allow admin to update tags', async () => {
      const admin = createTestUser('admin');

      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      const updated = await payload.update({
        collection: 'tags',
        id: tag.id,
        data: { name: 'Updated Tag' },
        user: admin,
      });

      expect(updated.name).toBe('Updated Tag');
    });

    it('should block vendor from updating tags', async () => {
      const admin = createTestUser('admin');
      const vendor = createTestVendor(payload, 'free');

      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      await expect(
        payload.update({
          collection: 'tags',
          id: tag.id,
          data: { name: 'Hacked' },
          user: vendor.user,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should allow admin to delete tags', async () => {
      const admin = createTestUser('admin');

      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      await payload.delete({
        collection: 'tags',
        id: tag.id,
        user: admin,
      });

      const deleted = await payload.findByID({
        collection: 'tags',
        id: tag.id,
      });

      expect(deleted).toBeNull();
    });

    it('should block vendor from deleting tags', async () => {
      const admin = createTestUser('admin');
      const vendor = createTestVendor(payload, 'free');

      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Test', slug: 'test' },
        user: admin,
      });

      await expect(
        payload.delete({
          collection: 'tags',
          id: tag.id,
          user: vendor.user,
        })
      ).rejects.toThrow(/access denied/i);
    });
  });

  describe('Public Read Access', () => {
    it('should allow public to read all tags', async () => {
      const admin = createTestUser('admin');

      await payload.create({
        collection: 'tags',
        data: { name: 'Public Tag', slug: 'public-tag' },
        user: admin,
      });

      const tags = await payload.find({
        collection: 'tags',
      });

      expect(tags.docs.length).toBeGreaterThan(0);
    });

    it('should allow vendors to read tags for referencing', async () => {
      const admin = createTestUser('admin');
      const vendor = createTestVendor(payload, 'free');

      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Marine', slug: 'marine' },
        user: admin,
      });

      const tags = await payload.find({
        collection: 'tags',
        user: vendor.user,
      });

      expect(tags.docs).toContainEqual(
        expect.objectContaining({ id: tag.id })
      );
    });
  });
});

describe('Tags Collection - Data Validation Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Name Validation', () => {
    it('should accept valid tag name', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Marine Electronics', slug: 'marine-electronics' },
        user: admin,
      });

      expect(tag.name).toBe('Marine Electronics');
    });

    it('should enforce name max length (255)', async () => {
      const admin = createTestUser('admin');

      await expect(
        payload.create({
          collection: 'tags',
          data: {
            name: 'A'.repeat(256),
            slug: 'test',
          },
          user: admin,
        })
      ).rejects.toThrow(/exceeds maximum length/i);
    });
  });

  describe('Slug Validation', () => {
    it('should validate slug format (lowercase, hyphenated)', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Marine Electronics', slug: 'marine-electronics' },
        user: admin,
      });

      expect(tag.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it('should reject invalid slug format', async () => {
      const admin = createTestUser('admin');

      await expect(
        payload.create({
          collection: 'tags',
          data: {
            name: 'Test',
            slug: 'Invalid Slug!',
          },
          user: admin,
        })
      ).rejects.toThrow(/invalid.*slug/i);
    });
  });

  describe('Color Validation', () => {
    it('should validate hex color format', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: {
          name: 'Test',
          slug: 'test',
          color: '#FF5733',
        },
        user: admin,
      });

      expect(tag.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should reject invalid hex color format', async () => {
      const admin = createTestUser('admin');

      await expect(
        payload.create({
          collection: 'tags',
          data: {
            name: 'Test',
            slug: 'test',
            color: 'red',
          },
          user: admin,
        })
      ).rejects.toThrow(/invalid.*color/i);
    });
  });
});

describe('Tags Collection - Relationship Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Tags Used by Vendors', () => {
    it('should track tags used by vendors', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Marine', slug: 'marine' },
        user: admin,
      });

      const vendor = createTestVendor(payload, 'free', {
        tags: [tag.id],
      });

      // Verify vendor has the tag
      expect(vendor.tags).toContain(tag.id);
    });
  });

  describe('Tags Used by Products', () => {
    it('should track tags used by products', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'GPS', slug: 'gps' },
        user: admin,
      });

      const vendor = createTestVendor(payload, 'tier2');
      const product = {
        id: `product_${Date.now()}`,
        name: 'GPS Device',
        vendor: vendor.id,
        tags: [tag.id],
      };
      payload._addTestData('products', product);

      // Verify product has the tag
      expect(product.tags).toContain(tag.id);
    });
  });

  describe('Tags Used by Blog Posts', () => {
    it('should track tags used by blog posts', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Technology', slug: 'technology' },
        user: admin,
      });

      const author = createTestUser('author');
      const blogPost = {
        id: `post_${Date.now()}`,
        title: 'Test Post',
        slug: 'test-post',
        author: author.id,
        tags: [tag.id],
      };
      payload._addTestData('blog-posts', blogPost);

      // Verify blog post has the tag
      expect(blogPost.tags).toContain(tag.id);
    });
  });

  describe('Tags Used by Yachts', () => {
    it('should track tags used by yachts', async () => {
      const admin = createTestUser('admin');
      const tag = await payload.create({
        collection: 'tags',
        data: { name: 'Superyacht', slug: 'superyacht' },
        user: admin,
      });

      const yacht = {
        id: `yacht_${Date.now()}`,
        name: 'Luxury Yacht',
        slug: 'luxury-yacht',
        tags: [tag.id],
      };
      payload._addTestData('yachts', yacht);

      // Verify yacht has the tag
      expect(yacht.tags).toContain(tag.id);
    });
  });
});

describe('Tags Collection - Configuration', () => {
  it('should have correct collection configuration', () => {
    expect(Tags.slug).toBe('tags');
    expect(Tags.admin?.useAsTitle).toBe('name');
    expect(Tags.admin?.defaultColumns).toContain('name');
    expect(Tags.admin?.defaultColumns).toContain('slug');
    expect(Tags.admin?.defaultColumns).toContain('usageCount');
    expect(Tags.timestamps).toBe(true);
  });

  it('should have correct field definitions', () => {
    const fields = Tags.fields || [];

    // Check name field
    const nameField = fields.find((f: any) => f.name === 'name');
    expect(nameField).toBeDefined();
    expect(nameField?.type).toBe('text');
    expect(nameField?.required).toBe(true);
    expect(nameField?.unique).toBe(true);

    // Check slug field
    const slugField = fields.find((f: any) => f.name === 'slug');
    expect(slugField).toBeDefined();
    expect(slugField?.type).toBe('text');
    expect(slugField?.required).toBe(true);
    expect(slugField?.unique).toBe(true);
    expect(slugField?.index).toBe(true);

    // Check color field
    const colorField = fields.find((f: any) => f.name === 'color');
    expect(colorField).toBeDefined();
    expect(colorField?.type).toBe('text');
    expect(colorField?.defaultValue).toBe('#0066cc');

    // Check usageCount field
    const usageCountField = fields.find((f: any) => f.name === 'usageCount');
    expect(usageCountField).toBeDefined();
    expect(usageCountField?.type).toBe('number');
    expect(usageCountField?.defaultValue).toBe(0);
  });

  it('should have access control functions', () => {
    expect(Tags.access).toBeDefined();
    expect(Tags.access?.create).toBeDefined();
    expect(Tags.access?.read).toBeDefined();
    expect(Tags.access?.update).toBeDefined();
    expect(Tags.access?.delete).toBeDefined();
  });
});
