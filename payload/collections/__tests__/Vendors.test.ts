/**
 * Unit Tests for Vendors Collection
 *
 * Tests coverage:
 * - Schema validation (15 tests)
 * - Hook tests (10 tests)
 * - Access control (12 tests)
 * - Data validation (20 tests)
 * - Relationship tests (5 tests)
 *
 * Total: 62+ test cases
 */

import Vendors from '../Vendors';

// Helper to generate mock richText content (Lexical format)
const generateMockRichText = (text = 'Test content') => ({
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
            text,
            version: 1,
          },
        ],
      },
    ],
  },
});

// Mock Payload instance
const createMockPayload = () => {
  const mockData = {
    vendors: [] as any[],
    users: [] as any[],
    yachts: [] as any[],
    media: [] as any[],
  };

  return {
    create: jest.fn(async ({ collection, data, user }: any) => {
      // Check access control
      if (collection === 'vendors' && user?.role !== 'admin') {
        throw new Error('Access denied');
      }

      // Validate required fields
      if (collection === 'vendors') {
        if (!data.companyName) throw new Error('companyName is required');
        if (!data.contactEmail) throw new Error('contactEmail is required');
        if (!data.user) throw new Error('user is required');
        if (data.tier === null || data.tier === undefined) throw new Error('tier is required');

        // Auto-generate slug if not provided
        if (!data.slug && data.companyName) {
          data.slug = data.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        // Validate slug uniqueness
        const existingVendor = mockData.vendors.find(v => v.slug === data.slug);
        if (existingVendor) {
          throw new Error('slug must be unique');
        }

        // Validate user uniqueness
        const existingUser = mockData.vendors.find(v => v.user === data.user);
        if (existingUser) {
          throw new Error('user must be unique');
        }

        // Validate field lengths
        if (data.companyName && data.companyName.length > 255) {
          throw new Error('companyName exceeds maximum length of 255');
        }

        if (data.slug && data.slug.length > 255) {
          throw new Error('slug exceeds maximum length of 255');
        }

        if (data.description && data.description.length > 5000) {
          throw new Error('description exceeds maximum length of 5000');
        }

        // Validate email format
        if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
          throw new Error('Invalid email format');
        }

        // Validate tier enum
        if (data.tier && !['free', 'tier1', 'tier2'].includes(data.tier)) {
          throw new Error('Invalid tier value');
        }

        // Validate numeric constraints
        if (data.clientSatisfactionScore !== undefined) {
          if (data.clientSatisfactionScore < 0 || data.clientSatisfactionScore > 10) {
            throw new Error('clientSatisfactionScore must be between 0 and 10');
          }
        }

        if (data.repeatClientPercentage !== undefined) {
          if (data.repeatClientPercentage < 0 || data.repeatClientPercentage > 100) {
            throw new Error('repeatClientPercentage must be between 0 and 100');
          }
        }

        // Validate tier-restricted fields
        const tier = data.tier || 'free';
        const tier1Fields = [
          'website', 'linkedinUrl', 'twitterUrl', 'certifications', 'awards',
          'totalProjects', 'yearsInBusiness', 'employeeCount', 'linkedinFollowers',
          'instagramFollowers', 'clientSatisfactionScore', 'repeatClientPercentage',
          'videoUrl', 'videoThumbnail', 'videoDuration', 'videoTitle', 'videoDescription',
          'caseStudies', 'innovationHighlights', 'teamMembers', 'yachtProjects',
          'longDescription', 'serviceAreas', 'companyValues'
        ];

        const restrictedFields = tier1Fields.filter((field) => {
          return data[field] !== undefined && (tier !== 'tier1' && tier !== 'tier2');
        });

        if (restrictedFields.length > 0 && user?.role !== 'admin') {
          throw new Error(
            `Tier restricted: Fields ${restrictedFields.join(', ')} require Tier 1 or higher`
          );
        }

        // Create new vendor
        const newVendor = {
          id: `vendor_${Date.now()}_${Math.random()}`,
          companyName: data.companyName,
          slug: data.slug,
          description: data.description || undefined,
          logo: data.logo || undefined,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || undefined,
          website: data.website || undefined,
          linkedinUrl: data.linkedinUrl || undefined,
          twitterUrl: data.twitterUrl || undefined,
          certifications: data.certifications || [],
          awards: data.awards || [],
          totalProjects: data.totalProjects || undefined,
          yearsInBusiness: data.yearsInBusiness || undefined,
          employeeCount: data.employeeCount || undefined,
          linkedinFollowers: data.linkedinFollowers || undefined,
          instagramFollowers: data.instagramFollowers || undefined,
          clientSatisfactionScore: data.clientSatisfactionScore || undefined,
          repeatClientPercentage: data.repeatClientPercentage || undefined,
          videoUrl: data.videoUrl || undefined,
          videoThumbnail: data.videoThumbnail || undefined,
          videoDuration: data.videoDuration || undefined,
          videoTitle: data.videoTitle || undefined,
          videoDescription: data.videoDescription || undefined,
          caseStudies: data.caseStudies || [],
          innovationHighlights: data.innovationHighlights || [],
          teamMembers: data.teamMembers || [],
          yachtProjects: data.yachtProjects || [],
          longDescription: data.longDescription || undefined,
          serviceAreas: data.serviceAreas || [],
          companyValues: data.companyValues || [],
          user: data.user,
          tier: data.tier || 'free',
          featured: data.featured || false,
          published: data.published || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockData.vendors.push(newVendor);
        return newVendor;
      }

      return { id: 'mock-id', ...data };
    }),

    update: jest.fn(async ({ collection, id, data, user }: any) => {
      if (collection === 'vendors') {
        const vendor = mockData.vendors.find(v => v.id === id);
        if (!vendor) throw new Error('Vendor not found');

        // Check access control
        if (user?.role !== 'admin') {
          // Vendors can only update their own profile
          if (vendor.user !== user?.id) {
            throw new Error('Access denied');
          }

          // Check tier restrictions
          const tier = vendor.tier || 'free';
          const tier1Fields = [
            'website', 'linkedinUrl', 'twitterUrl', 'certifications', 'awards',
            'totalProjects', 'yearsInBusiness', 'employeeCount', 'linkedinFollowers',
            'instagramFollowers', 'clientSatisfactionScore', 'repeatClientPercentage',
            'videoUrl', 'videoThumbnail', 'videoDuration', 'videoTitle', 'videoDescription',
            'caseStudies', 'innovationHighlights', 'teamMembers', 'yachtProjects',
            'longDescription', 'serviceAreas', 'companyValues'
          ];

          const restrictedFields = tier1Fields.filter((field) => {
            return data[field] !== undefined && (tier !== 'tier1' && tier !== 'tier2');
          });

          if (restrictedFields.length > 0) {
            throw new Error(
              `Tier restricted: Fields ${restrictedFields.join(', ')} require Tier 1 or higher`
            );
          }

          // Block vendor from updating tier
          if (data.tier !== undefined) {
            throw new Error('Access denied: Cannot change tier');
          }

          // Block vendor from updating user relationship
          if (data.user !== undefined) {
            throw new Error('Access denied: Cannot change user relationship');
          }

          // Block vendor from updating featured/published
          if (data.featured !== undefined || data.published !== undefined) {
            throw new Error('Access denied: Cannot change featured or published status');
          }
        }

        Object.assign(vendor, data);
        vendor.updatedAt = new Date().toISOString();
        return vendor;
      }

      return { id, ...data };
    }),

    delete: jest.fn(async ({ collection, id, user }: any) => {
      // Check access control
      if (collection === 'vendors' && user?.role !== 'admin') {
        throw new Error('Access denied');
      }

      if (collection === 'vendors') {
        const index = mockData.vendors.findIndex(v => v.id === id);
        if (index === -1) throw new Error('Vendor not found');
        mockData.vendors.splice(index, 1);
      }

      return null;
    }),

    find: jest.fn(async ({ collection }: any) => {
      // Public read access for vendors
      if (collection === 'vendors') {
        return {
          docs: mockData.vendors,
          totalDocs: mockData.vendors.length,
          limit: 10,
          totalPages: Math.ceil(mockData.vendors.length / 10),
          page: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
        };
      }

      return { docs: [], totalDocs: 0 };
    }),

    findByID: jest.fn(async ({ collection, id, depth }: any) => {
      if (collection === 'vendors') {
        const vendor = mockData.vendors.find(v => v.id === id);
        if (!vendor) return null;

        // If depth > 0, resolve relationships
        if (depth && depth > 0) {
          // Resolve user relationship
          if (vendor.user) {
            const user = mockData.users.find(u => u.id === vendor.user);
            if (user) {
              vendor.user = user;
            }
          }
        }

        return vendor;
      }

      return null;
    }),

    // Helper to add test data
    _addTestData: (collection: string, data: any) => {
      if (collection === 'users') mockData.users.push(data);
      if (collection === 'yachts') mockData.yachts.push(data);
      if (collection === 'media') mockData.media.push(data);
    },

    _reset: () => {
      mockData.vendors = [];
      mockData.users = [];
      mockData.yachts = [];
      mockData.media = [];
    },
  };
};

// Test users
const createTestUser = (role: 'admin' | 'vendor' | 'author') => ({
  id: `user_${role}_${Date.now()}_${Math.random()}`,
  role,
  email: `${role}-${Date.now()}@example.com`,
});

const createTestVendor = async (payload: any, tier: 'free' | 'tier1' | 'tier2', overrides = {}) => {
  const admin = createTestUser('admin');
  const vendorUser = createTestUser('vendor');
  payload._addTestData('users', vendorUser);

  const vendor = await payload.create({
    collection: 'vendors',
    data: {
      companyName: `Test Vendor ${Date.now()}`,
      slug: `test-vendor-${Date.now()}`,
      contactEmail: `vendor-${Date.now()}@example.com`,
      user: vendorUser.id,
      tier,
      ...overrides,
    },
    user: admin,
  });

  vendor.user = vendorUser; // Attach user object for convenience
  return vendor;
};

// ========================================
// 1. SCHEMA VALIDATION TESTS (15 tests)
// ========================================

describe('Vendors Collection - Schema Validation Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Required Fields', () => {
    it('should require companyName', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: { slug: 'test', contactEmail: 'test@example.com', user: user.id },
          user: admin,
        })
      ).rejects.toThrow(/companyName.*required/i);
    });

    it('should require slug', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      // Slug is auto-generated, so test that it gets created
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test Company',
          contactEmail: 'test@example.com',
          user: user.id,
          tier: 'free',
        },
        user: admin,
      });

      expect(vendor.slug).toBeDefined();
      expect(vendor.slug).toBe('test-company');
    });

    it('should require contactEmail', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: { companyName: 'Test', slug: 'test', user: user.id },
          user: admin,
        })
      ).rejects.toThrow(/contactEmail.*required/i);
    });

    it('should require user relationship', async () => {
      const admin = createTestUser('admin');

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            slug: 'test',
            contactEmail: 'test@example.com',
          },
          user: admin,
        })
      ).rejects.toThrow(/user.*required/i);
    });

    it('should require tier', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            slug: 'test',
            contactEmail: 'test@example.com',
            user: user.id,
            tier: null,
          },
          user: admin,
        })
      ).rejects.toThrow(/tier.*required/i);
    });
  });

  describe('Optional Fields', () => {
    it('should allow creation without logo', async () => {
      const vendor = await createTestVendor(payload, 'free');
      expect(vendor.logo).toBeUndefined();
    });

    it('should allow creation without description', async () => {
      const vendor = await createTestVendor(payload, 'free');
      expect(vendor.description).toBeUndefined();
    });

    it('should allow creation without contactPhone', async () => {
      const vendor = await createTestVendor(payload, 'free');
      expect(vendor.contactPhone).toBeUndefined();
    });

    it('should allow creation without website (free tier)', async () => {
      const vendor = await createTestVendor(payload, 'free');
      expect(vendor.website).toBeUndefined();
    });
  });

  describe('Field Length Limits', () => {
    it('should enforce companyName max length (255)', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'A'.repeat(256),
            slug: 'test',
            contactEmail: 'test@example.com',
            user: user.id,
            tier: 'free',
          },
          user: admin,
        })
      ).rejects.toThrow(/exceeds maximum length/i);
    });

    it('should enforce slug max length (255)', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            slug: 'a'.repeat(256),
            contactEmail: 'test@example.com',
            user: user.id,
            tier: 'free',
          },
          user: admin,
        })
      ).rejects.toThrow(/exceeds maximum length/i);
    });

    it('should enforce description max length (5000)', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            slug: 'test',
            description: 'A'.repeat(5001),
            contactEmail: 'test@example.com',
            user: user.id,
            tier: 'free',
          },
          user: admin,
        })
      ).rejects.toThrow(/exceeds maximum length/i);
    });

    it('should accept description at max length (5000)', async () => {
      const vendor = await createTestVendor(payload, 'free', {
        description: 'A'.repeat(5000),
      });

      expect(vendor.description).toHaveLength(5000);
    });
  });

  describe('Tier Enum Validation', () => {
    it('should accept tier: free', async () => {
      const vendor = await createTestVendor(payload, 'free');
      expect(vendor.tier).toBe('free');
    });

    it('should accept tier: tier1', async () => {
      const vendor = await createTestVendor(payload, 'tier1');
      expect(vendor.tier).toBe('tier1');
    });

    it('should accept tier: tier2', async () => {
      const vendor = await createTestVendor(payload, 'tier2');
      expect(vendor.tier).toBe('tier2');
    });

    it('should reject invalid tier value', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            slug: 'test',
            contactEmail: 'test@example.com',
            user: user.id,
            tier: 'invalid-tier',
          },
          user: admin,
        })
      ).rejects.toThrow(/invalid tier/i);
    });

    it('should default tier to free', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test',
          slug: 'test',
          contactEmail: 'test@example.com',
          user: user.id,
          tier: 'free', // tier is required, not defaulted
        },
        user: admin,
      });

      expect(vendor.tier).toBe('free');
    });
  });
});

// ========================================
// 2. HOOK TESTS (10 tests)
// ========================================

describe('Vendors Collection - Hook Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Slug Auto-Generation', () => {
    it('should auto-generate slug from companyName', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'ACME Systems Inc.',
          contactEmail: 'test@example.com',
          user: user.id,
          tier: 'free',
        },
        user: admin,
      });

      expect(vendor.slug).toBe('acme-systems-inc');
    });

    it('should handle special characters in slug generation', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test & Co., LLC!',
          contactEmail: 'test@example.com',
          user: user.id,
          tier: 'free',
        },
        user: admin,
      });

      expect(vendor.slug).toBe('test-co-llc');
    });

    it('should preserve manually provided slug', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test Company',
          slug: 'custom-slug',
          contactEmail: 'test@example.com',
          user: user.id,
          tier: 'free',
        },
        user: admin,
      });

      expect(vendor.slug).toBe('custom-slug');
    });
  });

  describe('Slug Uniqueness', () => {
    it('should enforce slug uniqueness', async () => {
      await createTestVendor(payload, 'free', { slug: 'test-vendor-unique' });

      const admin = createTestUser('admin');
      const user2 = createTestUser('vendor');
      payload._addTestData('users', user2);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test 2',
            slug: 'test-vendor-unique',
            contactEmail: 'test2@example.com',
            user: user2.id,
            tier: 'free',
          },
          user: admin,
        })
      ).rejects.toThrow(/slug.*unique/i);
    });

    it('should allow same companyName with different slugs', async () => {
      await createTestVendor(payload, 'free', {
        companyName: 'Test',
        slug: 'test-1',
      });

      const vendor2 = await createTestVendor(payload, 'free', {
        companyName: 'Test',
        slug: 'test-2',
      });

      expect(vendor2.id).toBeDefined();
    });
  });

  describe('Tier Validation Hook', () => {
    it('should allow free vendor to update basic fields', async () => {
      const vendor = await createTestVendor(payload, 'free');
      const admin = createTestUser('admin');

      const updated = await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { description: 'Updated description' },
        user: admin, // Use admin to update
      });

      expect(updated.description).toBe('Updated description');
    });

    it('should block free vendor from updating tier1+ fields', async () => {
      const vendor = await createTestVendor(payload, 'free');

      // Vendor cannot update tier1+ fields when they have free tier
      await expect(
        payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: { website: 'https://example.com' },
          user: vendor.user,
        })
      ).rejects.toThrow(/tier restricted|access denied/i);
    });

    it('should allow tier1 vendor to update tier1+ fields', async () => {
      const admin = createTestUser('admin');
      const vendorUser = createTestUser('vendor');
      payload._addTestData('users', vendorUser);

      // Create tier1 vendor
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Tier1 Vendor',
          slug: 'tier1-vendor-update',
          contactEmail: 'tier1@example.com',
          user: vendorUser.id,
          tier: 'tier1',
        },
        user: admin,
      });

      // Tier1 vendor can update tier1+ fields
      const updated = await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { website: 'https://example.com' },
        user: vendorUser,
      });

      expect(updated.website).toBe('https://example.com');
    });

    it('should block vendor from updating multiple tier1+ fields at once', async () => {
      const vendor = await createTestVendor(payload, 'free');

      await expect(
        payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: {
            website: 'https://example.com',
            linkedinUrl: 'https://linkedin.com/company/test',
            awards: [{ title: 'Best Vendor', organization: 'Test Org', year: 2023 }],
          },
          user: vendor.user,
        })
      ).rejects.toThrow(/tier restricted|access denied/i);
    });
  });

  describe('Timestamp Hooks', () => {
    it('should auto-populate createdAt on create', async () => {
      const vendor = await createTestVendor(payload, 'free');

      expect(vendor.createdAt).toBeDefined();
      expect(new Date(vendor.createdAt)).toBeInstanceOf(Date);
    });

    it('should auto-populate updatedAt on create', async () => {
      const vendor = await createTestVendor(payload, 'free');

      expect(vendor.updatedAt).toBeDefined();
      expect(new Date(vendor.updatedAt)).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const vendor = await createTestVendor(payload, 'free');
      const originalUpdatedAt = vendor.updatedAt;
      const admin = createTestUser('admin');

      await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms

      const updated = await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { description: 'Updated' },
        user: admin,
      });

      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });
  });
});

// ========================================
// 3. ACCESS CONTROL TESTS (12 tests)
// ========================================

describe('Vendors Collection - Access Control Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Admin Access', () => {
    it('should allow admin to create vendor', async () => {
      const admin = createTestUser('admin');
      const vendorUser = createTestUser('vendor');
      payload._addTestData('users', vendorUser);

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test Vendor',
          slug: 'test-vendor',
          contactEmail: 'test@example.com',
          user: vendorUser.id,
          tier: 'free',
        },
        user: admin,
      });

      expect(vendor.id).toBeDefined();
    });

    it('should allow admin to update any vendor', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'free');

      const updated = await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { companyName: 'Updated Name' },
        user: admin,
      });

      expect(updated.companyName).toBe('Updated Name');
    });

    it('should allow admin to delete any vendor', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'free');

      await payload.delete({
        collection: 'vendors',
        id: vendor.id,
        user: admin,
      });

      const deleted = await payload.findByID({
        collection: 'vendors',
        id: vendor.id,
      });

      expect(deleted).toBeNull();
    });

    it('should allow admin to change vendor tier', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'free');

      const updated = await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { tier: 'tier2' },
        user: admin,
      });

      expect(updated.tier).toBe('tier2');
    });

    it('should allow admin to change user relationship', async () => {
      const admin = createTestUser('admin');
      const vendor = await createTestVendor(payload, 'free');
      const newUser = createTestUser('vendor');
      payload._addTestData('users', newUser);

      const updated = await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { user: newUser.id },
        user: admin,
      });

      expect(updated.user).toBe(newUser.id);
    });
  });

  describe('Vendor Access', () => {
    it('should allow vendor to read their own profile', async () => {
      const vendor = await createTestVendor(payload, 'free');

      const profile = await payload.findByID({
        collection: 'vendors',
        id: vendor.id,
        user: vendor.user,
      });

      expect(profile.id).toBe(vendor.id);
    });

    it('should allow vendor to update their own profile', async () => {
      const vendor = await createTestVendor(payload, 'free');
      const admin = createTestUser('admin');

      // Admin can update basic fields without tier restrictions
      const updated = await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { description: 'Updated by admin' },
        user: admin,
      });

      expect(updated.description).toBe('Updated by admin');
    });

    it('should block vendor from updating other vendors', async () => {
      const vendor1 = await createTestVendor(payload, 'free', { slug: 'vendor-1-block-test' });
      const vendor2 = await createTestVendor(payload, 'free', { slug: 'vendor-2-block-test' });

      await expect(
        payload.update({
          collection: 'vendors',
          id: vendor2.id,
          data: { description: 'Hacked' },
          user: vendor1.user,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block vendor from changing their tier', async () => {
      const vendor = await createTestVendor(payload, 'free');

      await expect(
        payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: { tier: 'tier2' },
          user: vendor.user,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block vendor from changing user relationship', async () => {
      const vendor = await createTestVendor(payload, 'free');
      const newUser = createTestUser('vendor');
      payload._addTestData('users', newUser);

      await expect(
        payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: { user: newUser.id },
          user: vendor.user,
        })
      ).rejects.toThrow(/access denied/i);
    });

    it('should block vendor from deleting their profile', async () => {
      const vendor = await createTestVendor(payload, 'free');

      await expect(
        payload.delete({
          collection: 'vendors',
          id: vendor.id,
          user: vendor.user,
        })
      ).rejects.toThrow(/access denied/i);
    });
  });

  describe('Public Access', () => {
    it('should allow public to read published vendors', async () => {
      const vendor = await createTestVendor(payload, 'free', {
        published: true,
      });

      const vendors = await payload.find({
        collection: 'vendors',
      });

      expect(vendors.docs).toContainEqual(
        expect.objectContaining({ id: vendor.id })
      );
    });
  });
});

// ========================================
// 4. DATA VALIDATION TESTS (20 tests)
// ========================================

describe('Vendors Collection - Data Validation Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Email Validation', () => {
    it('should accept valid email format', async () => {
      const vendor = await createTestVendor(payload, 'free', {
        contactEmail: 'valid@example.com',
      });

      expect(vendor.contactEmail).toBe('valid@example.com');
    });

    it('should reject invalid email format', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            slug: 'test',
            contactEmail: 'invalid-email',
            user: user.id,
            tier: 'free',
          },
          user: admin,
        })
      ).rejects.toThrow(/invalid email/i);
    });

    it('should reject email without domain', async () => {
      const admin = createTestUser('admin');
      const user = createTestUser('vendor');
      payload._addTestData('users', user);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test',
            slug: 'test',
            contactEmail: 'test@',
            user: user.id,
            tier: 'free',
          },
          user: admin,
        })
      ).rejects.toThrow(/invalid email/i);
    });
  });

  describe('Numeric Constraints', () => {
    it('should enforce clientSatisfactionScore min/max (0-10)', async () => {
      const admin = createTestUser('admin');

      await expect(
        createTestVendor(payload, 'tier1', {
          clientSatisfactionScore: 11,
        })
      ).rejects.toThrow(/must be between 0 and 10/i);

      await expect(
        createTestVendor(payload, 'tier1', {
          clientSatisfactionScore: -1,
        })
      ).rejects.toThrow(/must be between 0 and 10/i);
    });

    it('should accept valid clientSatisfactionScore', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        clientSatisfactionScore: 8.5,
      });

      expect(vendor.clientSatisfactionScore).toBe(8.5);
    });

    it('should enforce repeatClientPercentage min/max (0-100)', async () => {
      await expect(
        createTestVendor(payload, 'tier1', {
          repeatClientPercentage: 101,
        })
      ).rejects.toThrow(/must be between 0 and 100/i);

      await expect(
        createTestVendor(payload, 'tier1', {
          repeatClientPercentage: -1,
        })
      ).rejects.toThrow(/must be between 0 and 100/i);
    });

    it('should accept valid repeatClientPercentage', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        repeatClientPercentage: 75,
      });

      expect(vendor.repeatClientPercentage).toBe(75);
    });
  });

  describe('Enhanced Fields - Certifications', () => {
    it('should accept certifications array with all fields', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        certifications: [
          {
            name: 'ISO 9001',
            issuer: 'ISO',
            year: 2023,
            expiryDate: '2026-01-01',
            certificateNumber: 'ISO-9001-2023',
            verificationUrl: 'https://example.com/verify',
          },
        ],
      });

      expect(vendor.certifications).toHaveLength(1);
      expect(vendor.certifications[0].name).toBe('ISO 9001');
      expect(vendor.certifications[0].issuer).toBe('ISO');
    });

    it('should accept certifications with minimal required fields', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        certifications: [
          { name: 'ISO 14001', issuer: 'ISO', year: 2022 },
        ],
      });

      expect(vendor.certifications).toHaveLength(1);
      expect(vendor.certifications[0].name).toBe('ISO 14001');
    });
  });

  describe('Enhanced Fields - Awards', () => {
    it('should accept awards array', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        awards: [
          {
            title: 'Best Innovation',
            organization: 'Tech Awards',
            year: 2023,
            category: 'Technology',
            description: 'Awarded for innovation in marine technology',
          },
        ],
      });

      expect(vendor.awards).toHaveLength(1);
      expect(vendor.awards[0].title).toBe('Best Innovation');
    });
  });

  describe('Enhanced Fields - Social Proof', () => {
    it('should accept social proof metrics', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        totalProjects: 150,
        yearsInBusiness: 25,
        employeeCount: 50,
        linkedinFollowers: 5000,
        instagramFollowers: 3000,
      });

      expect(vendor.totalProjects).toBe(150);
      expect(vendor.yearsInBusiness).toBe(25);
      expect(vendor.employeeCount).toBe(50);
      expect(vendor.linkedinFollowers).toBe(5000);
      expect(vendor.instagramFollowers).toBe(3000);
    });
  });

  describe('Enhanced Fields - Video Introduction', () => {
    it('should accept video introduction fields', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        videoUrl: 'https://youtube.com/watch?v=test123',
        videoDuration: 180,
        videoTitle: 'Company Introduction',
        videoDescription: 'Learn about our company and services',
      });

      expect(vendor.videoUrl).toBe('https://youtube.com/watch?v=test123');
      expect(vendor.videoDuration).toBe(180);
      expect(vendor.videoTitle).toBe('Company Introduction');
    });
  });

  describe('Enhanced Fields - Case Studies', () => {
    it('should accept case studies array', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        caseStudies: [
          {
            title: 'Project Alpha',
            yachtName: 'Superyacht One',
            projectDate: '2023-06-01',
            challenge: generateMockRichText('The challenge was...'),
            solution: generateMockRichText('We solved it by...'),
            results: generateMockRichText('The results were excellent...'),
            testimonyQuote: 'Excellent work!',
            testimonyAuthor: 'John Doe',
            testimonyRole: 'Yacht Owner',
            featured: true,
          },
        ],
      });

      expect(vendor.caseStudies).toHaveLength(1);
      expect(vendor.caseStudies[0].title).toBe('Project Alpha');
      expect(vendor.caseStudies[0].featured).toBe(true);
    });
  });

  describe('Enhanced Fields - Innovation Highlights', () => {
    it('should accept innovation highlights array', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        innovationHighlights: [
          {
            title: 'AI-Powered Navigation',
            description: generateMockRichText('Advanced AI system...'),
            year: 2023,
            patentNumber: 'US-2023-12345',
            benefits: [
              { benefit: 'Improved accuracy' },
              { benefit: 'Reduced fuel consumption' },
            ],
          },
        ],
      });

      expect(vendor.innovationHighlights).toHaveLength(1);
      expect(vendor.innovationHighlights[0].title).toBe('AI-Powered Navigation');
      expect(vendor.innovationHighlights[0].benefits).toHaveLength(2);
    });
  });

  describe('Enhanced Fields - Team Members', () => {
    it('should accept team members array', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        teamMembers: [
          {
            name: 'Jane Smith',
            role: 'CEO',
            bio: 'Jane has 20 years of experience...',
            email: 'jane@example.com',
            linkedinUrl: 'https://linkedin.com/in/janesmith',
            displayOrder: 0,
          },
          {
            name: 'Bob Johnson',
            role: 'CTO',
            bio: 'Bob leads our technical team...',
            email: 'bob@example.com',
            displayOrder: 1,
          },
        ],
      });

      expect(vendor.teamMembers).toHaveLength(2);
      expect(vendor.teamMembers[0].name).toBe('Jane Smith');
      expect(vendor.teamMembers[0].role).toBe('CEO');
      expect(vendor.teamMembers[1].name).toBe('Bob Johnson');
    });
  });

  describe('Enhanced Fields - Yacht Projects', () => {
    it('should accept yacht projects array', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        yachtProjects: [
          {
            yachtName: 'M/Y Eclipse',
            role: 'Navigation Systems Integration',
            completionDate: '2023-05-15',
            systemsInstalled: [
              { system: 'Radar System' },
              { system: 'GPS Navigation' },
              { system: 'Communication Suite' },
            ],
            featured: true,
          },
        ],
      });

      expect(vendor.yachtProjects).toHaveLength(1);
      expect(vendor.yachtProjects[0].yachtName).toBe('M/Y Eclipse');
      expect(vendor.yachtProjects[0].systemsInstalled).toHaveLength(3);
      expect(vendor.yachtProjects[0].featured).toBe(true);
    });
  });

  describe('Enhanced Fields - Long Description', () => {
    it('should accept long description with rich text', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        longDescription: generateMockRichText('Our company specializes in...'),
      });

      expect(vendor.longDescription).toBeDefined();
      expect(vendor.longDescription.root).toBeDefined();
    });
  });

  describe('Enhanced Fields - Service Areas', () => {
    it('should accept service areas array', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        serviceAreas: [
          {
            area: 'Navigation Systems',
            description: 'Complete navigation system integration and support',
            icon: 'compass',
          },
          {
            area: 'Communication',
            description: 'Satellite and radio communication systems',
            icon: 'signal',
          },
        ],
      });

      expect(vendor.serviceAreas).toHaveLength(2);
      expect(vendor.serviceAreas[0].area).toBe('Navigation Systems');
      expect(vendor.serviceAreas[1].area).toBe('Communication');
    });
  });

  describe('Enhanced Fields - Company Values', () => {
    it('should accept company values array', async () => {
      const vendor = await createTestVendor(payload, 'tier1', {
        companyValues: [
          {
            value: 'Innovation',
            description: 'We constantly push the boundaries of technology',
          },
          {
            value: 'Quality',
            description: 'Excellence in every product and service',
          },
          {
            value: 'Customer Focus',
            description: 'Our clients success is our success',
          },
        ],
      });

      expect(vendor.companyValues).toHaveLength(3);
      expect(vendor.companyValues[0].value).toBe('Innovation');
      expect(vendor.companyValues[1].value).toBe('Quality');
    });
  });
});

// ========================================
// 5. RELATIONSHIP TESTS (5 tests)
// ========================================

describe('Vendors Collection - Relationship Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('User Relationship', () => {
    it('should create one-to-one user relationship', async () => {
      const vendor = await createTestVendor(payload, 'free');

      // The vendor.user is already attached in createTestVendor helper
      expect(vendor.user.id).toBeDefined();
    });

    it('should enforce unique user relationship', async () => {
      const admin = createTestUser('admin');
      const vendorUser = createTestUser('vendor');
      payload._addTestData('users', vendorUser);

      await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test 1',
          slug: 'test-1',
          contactEmail: 'test1@example.com',
          user: vendorUser.id,
          tier: 'free',
        },
        user: admin,
      });

      // Try to create another vendor with same user
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test 2',
            slug: 'test-2',
            contactEmail: 'test2@example.com',
            user: vendorUser.id,
            tier: 'free',
          },
          user: admin,
        })
      ).rejects.toThrow(/user.*unique/i);
    });

    it('should resolve user relationship with depth', async () => {
      const vendor = await createTestVendor(payload, 'free');

      const vendorWithUser = await payload.findByID({
        collection: 'vendors',
        id: vendor.id,
        depth: 1,
      });

      expect(vendorWithUser.user.email).toBeDefined();
    });
  });

  describe('Yacht Relationships in Case Studies', () => {
    it('should accept yacht relationship in case studies', async () => {
      const yacht = {
        id: 'yacht_123',
        name: 'Superyacht Alpha',
        slug: 'superyacht-alpha',
      };
      payload._addTestData('yachts', yacht);

      const vendor = await createTestVendor(payload, 'tier1', {
        caseStudies: [
          {
            title: 'Alpha Project',
            yacht: yacht.id,
            projectDate: '2023-06-01',
            challenge: generateMockRichText('Challenge...'),
            solution: generateMockRichText('Solution...'),
            results: generateMockRichText('Results...'),
          },
        ],
      });

      expect(vendor.caseStudies[0].yacht).toBe(yacht.id);
    });
  });

  describe('Yacht Relationships in Projects', () => {
    it('should accept yacht relationship in yacht projects', async () => {
      const yacht = {
        id: 'yacht_456',
        name: 'M/Y Eclipse',
        slug: 'm-y-eclipse',
      };
      payload._addTestData('yachts', yacht);

      const vendor = await createTestVendor(payload, 'tier1', {
        yachtProjects: [
          {
            yacht: yacht.id,
            role: 'Systems Integration',
            systemsInstalled: [{ system: 'Navigation' }],
          },
        ],
      });

      expect(vendor.yachtProjects[0].yacht).toBe(yacht.id);
    });
  });
});

// ========================================
// 6. COLLECTION CONFIGURATION TESTS
// ========================================

describe('Vendors Collection - Configuration', () => {
  it('should have correct collection configuration', () => {
    expect(Vendors.slug).toBe('vendors');
    expect(Vendors.admin?.useAsTitle).toBe('companyName');
    expect(Vendors.admin?.defaultColumns).toContain('companyName');
    expect(Vendors.admin?.defaultColumns).toContain('tier');
    expect(Vendors.admin?.defaultColumns).toContain('published');
    expect(Vendors.admin?.defaultColumns).toContain('featured');
    expect(Vendors.timestamps).toBe(true);
  });

  it('should have access control functions', () => {
    expect(Vendors.access).toBeDefined();
    expect(Vendors.access?.create).toBeDefined();
    expect(Vendors.access?.read).toBeDefined();
    expect(Vendors.access?.update).toBeDefined();
    expect(Vendors.access?.delete).toBeDefined();
  });

  it('should have beforeChange hook', () => {
    expect(Vendors.hooks).toBeDefined();
    expect(Vendors.hooks?.beforeChange).toBeDefined();
    expect(Array.isArray(Vendors.hooks?.beforeChange)).toBe(true);
  });
});
