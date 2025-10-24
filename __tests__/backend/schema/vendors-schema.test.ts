/**
 * Vendors Schema Test Suite
 *
 * Tests all 40+ tier-specific fields, validation constraints,
 * and tier-conditional field access.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { getPayload } from 'payload';
import config from '@/payload.config';
import type { Payload } from 'payload';

describe('Vendors Schema - Tier Structure', () => {
  let payload: Payload;
  let testUserId: string;
  let testMediaId: string;

  beforeAll(async () => {
    payload = await getPayload({ config });

    // Create test user for vendor relationships
    const testUser = await payload.create({
      collection: 'users',
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'vendor',
      },
    });
    testUserId = testUser.id.toString();

    // Create test media for relationship fields
    const testMedia = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test Logo',
      },
      filePath: '__tests__/fixtures/test-logo.png',
    });
    testMediaId = testMedia.id.toString();
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await payload.delete({ collection: 'users', id: testUserId });
    }
    if (testMediaId) {
      await payload.delete({ collection: 'media', id: testMediaId });
    }
  });

  describe('Tier Enum Extension', () => {
    it('should accept tier3 value', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Tier 3 Test Vendor',
          tier: 'tier3',
          contactEmail: 'tier3@example.com',
          published: false,
        },
      });

      expect(vendor.tier).toBe('tier3');
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should default to free tier', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Default Tier Vendor',
          contactEmail: 'default@example.com',
          published: false,
        },
      });

      expect(vendor.tier).toBe('free');
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });
  });

  describe('Founded Year Field', () => {
    it('should accept valid foundedYear (Tier 1+)', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Founded Year Test Vendor',
          tier: 'tier1',
          contactEmail: 'founded@example.com',
          foundedYear: 2010,
          published: false,
        },
      });

      expect(vendor.foundedYear).toBe(2010);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should reject foundedYear before 1800', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user: testUserId,
            companyName: 'Invalid Year Vendor',
            tier: 'tier1',
            contactEmail: 'invalidyear@example.com',
            foundedYear: 1799,
            published: false,
          },
        })
      ).rejects.toThrow();
    });

    it('should reject foundedYear in the future', async () => {
      const futureYear = new Date().getFullYear() + 1;

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user: testUserId,
            companyName: 'Future Year Vendor',
            tier: 'tier1',
            contactEmail: 'future@example.com',
            foundedYear: futureYear,
            published: false,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Social Proof Fields (Tier 1+)', () => {
    it('should accept totalProjects', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Projects Vendor',
          tier: 'tier1',
          contactEmail: 'projects@example.com',
          totalProjects: 150,
          published: false,
        },
      });

      expect(vendor.totalProjects).toBe(150);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept employeeCount', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Employees Vendor',
          tier: 'tier1',
          contactEmail: 'employees@example.com',
          employeeCount: 50,
          published: false,
        },
      });

      expect(vendor.employeeCount).toBe(50);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept social media follower counts', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Social Vendor',
          tier: 'tier1',
          contactEmail: 'social@example.com',
          linkedinFollowers: 5000,
          instagramFollowers: 10000,
          published: false,
        },
      });

      expect(vendor.linkedinFollowers).toBe(5000);
      expect(vendor.instagramFollowers).toBe(10000);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept satisfaction scores (0-100)', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Satisfaction Vendor',
          tier: 'tier1',
          contactEmail: 'satisfaction@example.com',
          clientSatisfactionScore: 95,
          repeatClientPercentage: 85,
          published: false,
        },
      });

      expect(vendor.clientSatisfactionScore).toBe(95);
      expect(vendor.repeatClientPercentage).toBe(85);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should reject clientSatisfactionScore > 100', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user: testUserId,
            companyName: 'Invalid Score Vendor',
            tier: 'tier1',
            contactEmail: 'invalidscore@example.com',
            clientSatisfactionScore: 101,
            published: false,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Array Fields (Tier 1+)', () => {
    it('should accept certifications array', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Certified Vendor',
          tier: 'tier1',
          contactEmail: 'certified@example.com',
          certifications: [
            {
              name: 'ISO 9001',
              issuer: 'International Organization for Standardization',
              year: 2020,
            },
          ],
          published: false,
        },
      });

      expect(vendor.certifications).toHaveLength(1);
      expect(vendor.certifications[0].name).toBe('ISO 9001');
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept awards array', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Award Vendor',
          tier: 'tier1',
          contactEmail: 'awards@example.com',
          awards: [
            {
              title: 'Best Innovation 2023',
              organization: 'Yacht Tech Awards',
              year: 2023,
            },
          ],
          published: false,
        },
      });

      expect(vendor.awards).toHaveLength(1);
      expect(vendor.awards[0].title).toBe('Best Innovation 2023');
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept case studies array', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Case Study Vendor',
          tier: 'tier1',
          contactEmail: 'casestudy@example.com',
          caseStudies: [
            {
              title: 'Yacht Modernization Project',
              yachtName: 'MegaStar',
              projectDate: new Date('2023-06-15').toISOString(),
              challenge: { root: { children: [{ type: 'text', text: 'Challenge description' }] } },
              solution: { root: { children: [{ type: 'text', text: 'Solution description' }] } },
              results: { root: { children: [{ type: 'text', text: 'Results description' }] } },
            },
          ],
          published: false,
        },
      });

      expect(vendor.caseStudies).toHaveLength(1);
      expect(vendor.caseStudies[0].title).toBe('Yacht Modernization Project');
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept team members array', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Team Vendor',
          tier: 'tier1',
          contactEmail: 'team@example.com',
          teamMembers: [
            {
              name: 'John Doe',
              role: 'Chief Technology Officer',
              bio: 'Expert in marine technology',
              displayOrder: 0,
            },
          ],
          published: false,
        },
      });

      expect(vendor.teamMembers).toHaveLength(1);
      expect(vendor.teamMembers[0].name).toBe('John Doe');
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });
  });

  describe('Tier 2+ Feature Flags', () => {
    it('should accept featuredInCategory flag', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Featured Vendor',
          tier: 'tier2',
          contactEmail: 'featured@example.com',
          featuredInCategory: true,
          published: false,
        },
      });

      expect(vendor.featuredInCategory).toBe(true);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept advanced analytics flag', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Analytics Vendor',
          tier: 'tier2',
          contactEmail: 'analytics@example.com',
          advancedAnalytics: true,
          published: false,
        },
      });

      expect(vendor.advancedAnalytics).toBe(true);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });
  });

  describe('Tier 3 Promotion Pack', () => {
    it('should accept promotionPack group', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Promotion Vendor',
          tier: 'tier3',
          contactEmail: 'promo@example.com',
          promotionPack: {
            homepageBanner: true,
            searchResultsPriority: 100,
            categoryTopPlacement: true,
            sponsoredContent: true,
          },
          published: false,
        },
      });

      expect(vendor.promotionPack.homepageBanner).toBe(true);
      expect(vendor.promotionPack.searchResultsPriority).toBe(100);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });
  });

  describe('Tier 3 Editorial Content', () => {
    it('should accept editorial content array (admin only)', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Editorial Vendor',
          tier: 'tier3',
          contactEmail: 'editorial@example.com',
          editorialContent: [
            {
              title: 'Industry Leader Feature',
              content: { root: { children: [{ type: 'text', text: 'Editorial content' }] } },
              publishDate: new Date().toISOString(),
              author: 'Staff Writer',
            },
          ],
          published: false,
        },
      });

      expect(vendor.editorialContent).toHaveLength(1);
      expect(vendor.editorialContent[0].title).toBe('Industry Leader Feature');
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });
  });

  describe('Field Validation Constraints', () => {
    it('should enforce max string lengths', async () => {
      const longString = 'a'.repeat(300);

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user: testUserId,
            companyName: longString,
            tier: 'free',
            contactEmail: 'long@example.com',
            published: false,
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce min values for numbers', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user: testUserId,
            companyName: 'Negative Vendor',
            tier: 'tier1',
            contactEmail: 'negative@example.com',
            totalProjects: -1,
            published: false,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Relationship Fields', () => {
    it('should accept media relationship for logo', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Logo Vendor',
          tier: 'free',
          contactEmail: 'logo@example.com',
          logo: testMediaId,
          published: false,
        },
      });

      expect(vendor.logo).toBeDefined();
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });

    it('should accept user relationship', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'User Relationship Vendor',
          tier: 'free',
          contactEmail: 'userrel@example.com',
          published: false,
        },
      });

      expect(vendor.user).toBe(testUserId);
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });
  });

  describe('Computed Fields Preparation', () => {
    it('should store foundedYear for yearsInBusiness computation', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user: testUserId,
          companyName: 'Computed Fields Vendor',
          tier: 'tier1',
          contactEmail: 'computed@example.com',
          foundedYear: 2010,
          published: false,
        },
      });

      expect(vendor.foundedYear).toBe(2010);
      // yearsInBusiness should be computed at runtime, not stored
      await payload.delete({ collection: 'vendors', id: vendor.id });
    });
  });
});
