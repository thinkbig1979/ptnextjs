/**
 * Unit Tests for PayloadCMSDataService
 * Tests transform methods, caching, error handling, and reference resolution
 */

import { mockVendorDocs, mockProductDocs, mockCategoryDocs, mockBlogPostDocs, mockTeamMemberDocs, mockCompanyInfoDocs } from '../../fixtures/payload-documents';

// Mock payload and config before imports
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

jest.mock('@/payload.config', () => ({
  default: {},
}));

// Now import the service after mocks are set up
import { payloadCMSDataService } from '@/lib/payload-cms-data-service';

describe('PayloadCMSDataService', () => {
  let service: any;
  let mockPayload: any;

  beforeEach(() => {
    // Use the singleton service instance
    service = payloadCMSDataService;

    // Clear cache
    service.clearCache();

    // Setup mock Payload instance
    mockPayload = {
      find: jest.fn(),
      findByID: jest.fn(),
    };

    const { getPayload } = require('payload');
    (getPayload as jest.Mock).mockResolvedValue(mockPayload);
  });

  describe('Transform Methods', () => {
    describe('transformPayloadVendor', () => {
      it('should transform Payload vendor document to Vendor interface', () => {
        const doc = mockVendorDocs.docs[0];
        const result = service.transformPayloadVendor(doc);

        expect(result).toMatchObject({
          id: '1',
          slug: 'test-vendor-1',
          name: 'Test Vendor 1',
          description: 'Test vendor description 1',
          logo: '/media/logos/test-vendor-1.png',
          image: '/media/images/test-vendor-1.jpg',
          website: 'https://testvendor1.com',
          founded: 2010,
          location: 'Test Location 1',
          featured: true,
          partner: true,
        });
        expect(result.certifications).toBeDefined();
      });

      it('should handle missing optional fields', () => {
        const doc = {
          id: '3',
          slug: 'minimal-vendor',
          companyName: 'Minimal Vendor',
          contactEmail: 'contact@minimal.com',
        };

        const result = service.transformPayloadVendor(doc);

        expect(result).toMatchObject({
          id: '3',
          slug: 'minimal-vendor',
          name: 'Minimal Vendor',
          description: '',
          logo: '',
          image: '',
          website: '',
          location: '',
          featured: false,
          partner: true,
        });
      });

      it('should transform certifications array', () => {
        const doc = mockVendorDocs.docs[0];
        const result = service.transformPayloadVendor(doc);

        expect(result.certifications).toHaveLength(2);
        expect(result.certifications[0]).toHaveProperty('certification');
      });
    });

    describe('transformPayloadProduct', () => {
      it('should transform Payload product document to Product interface', () => {
        const doc = mockProductDocs.docs[0];
        const result = service.transformPayloadProduct(doc);

        expect(result).toMatchObject({
          id: '1',
          slug: 'test-product-1',
          name: 'Test Product 1',
          vendorId: '1',
          vendorName: 'Test Vendor 1',
          partnerId: '1',
          partnerName: 'Test Vendor 1',
          category: 'Navigation',
          description: '<p>Test product description 1</p>',
        });
      });

      it('should identify main image correctly', () => {
        const doc = mockProductDocs.docs[0];
        const result = service.transformPayloadProduct(doc);

        expect(result.image).toBe('/media/products/test-product-1-main.jpg');
        expect(result.images).toHaveLength(2);
        expect(result.images[0].isMain).toBe(true);
        expect(result.images[1].isMain).toBe(false);
      });

      it('should handle product without main image', () => {
        const doc = {
          ...mockProductDocs.docs[0],
          images: [
            {
              url: '/media/products/no-main.jpg',
              altText: 'No main image',
              isMain: false,
            }
          ],
        };

        const result = service.transformPayloadProduct(doc);

        expect(result.image).toBe('/media/products/no-main.jpg');
      });

      it('should resolve vendor relationship', () => {
        const doc = mockProductDocs.docs[0];
        const result = service.transformPayloadProduct(doc);

        expect(result.vendor).toBeDefined();
        expect(result.vendor?.name).toBe('Test Vendor 1');
        expect(result.partner).toBeDefined();
        expect(result.partner?.name).toBe('Test Vendor 1');
      });
    });

    describe('transformPayloadBlogPost', () => {
      it('should transform Payload blog post document to BlogPost interface', () => {
        const doc = mockBlogPostDocs.docs[0];
        const result = service.transformPayloadBlogPost(doc);

        expect(result).toMatchObject({
          id: '1',
          slug: 'test-blog-post-1',
          title: 'Test Blog Post 1',
          excerpt: 'Test blog post excerpt 1',
          content: '<p>Test blog post content 1</p>',
          author: 'author@example.com',
          publishedAt: '2024-01-15T00:00:00.000Z',
          category: 'Industry News',
          featured: true,
        });
      });

      it('should handle missing author', () => {
        const doc = {
          ...mockBlogPostDocs.docs[0],
          author: undefined,
        };

        const result = service.transformPayloadBlogPost(doc);

        expect(result.author).toBe('');
      });

      it('should transform tags correctly', () => {
        const doc = mockBlogPostDocs.docs[0];
        const result = service.transformPayloadBlogPost(doc);

        expect(result.tags).toEqual(['technology', 'innovation']);
      });
    });

    describe('transformPayloadTeamMember', () => {
      it('should transform Payload team member document to TeamMember interface', () => {
        const doc = mockTeamMemberDocs.docs[0];
        const result = service.transformPayloadTeamMember(doc);

        expect(result).toMatchObject({
          id: '1',
          name: 'John Doe',
          role: 'CEO',
          bio: 'Test bio for John Doe',
          image: '/media/team/john-doe.jpg',
          email: 'john.doe@example.com',
          linkedin: 'https://linkedin.com/in/johndoe',
          order: 1,
        });
      });
    });
  });

  describe('Media Path Transformation', () => {
    it('should handle absolute URLs', () => {
      const result = service.transformMediaPath('https://example.com/image.jpg');
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should handle /media/ prefix', () => {
      const result = service.transformMediaPath('/media/test.jpg');
      expect(result).toBe('/media/test.jpg');
    });

    it('should handle paths without prefix', () => {
      const result = service.transformMediaPath('test.jpg');
      expect(result).toBe('/media/test.jpg');
    });

    it('should handle empty paths', () => {
      const result = service.transformMediaPath('');
      expect(result).toBe('');
    });

    it('should handle paths starting with /', () => {
      const result = service.transformMediaPath('/images/test.jpg');
      expect(result).toBe('/images/test.jpg');
    });
  });

  describe('Caching Behavior', () => {
    it('should cache data on first fetch', async () => {
      mockPayload.find.mockResolvedValueOnce(mockVendorDocs);

      const result1 = await service.getAllVendors();

      expect(mockPayload.find).toHaveBeenCalledTimes(1);
      expect(result1).toHaveLength(2);
      expect(service.cache.has('vendors')).toBe(true);
    });

    it('should return cached data on second fetch', async () => {
      mockPayload.find.mockResolvedValueOnce(mockVendorDocs);

      const result1 = await service.getAllVendors();
      const result2 = await service.getAllVendors();

      expect(mockPayload.find).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should increment access count on cache hit', async () => {
      mockPayload.find.mockResolvedValueOnce(mockVendorDocs);

      await service.getAllVendors();
      await service.getAllVendors();
      await service.getAllVendors();

      const cacheEntry = service.cache.get('vendors');
      expect(cacheEntry.accessCount).toBe(3);
    });

    it('should expire cache after TTL', async () => {
      mockPayload.find
        .mockResolvedValueOnce(mockVendorDocs)
        .mockResolvedValueOnce(mockVendorDocs);

      const result1 = await service.getAllVendors();

      // Simulate cache expiration
      const cacheEntry = service.cache.get('vendors');
      cacheEntry.timestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago

      const result2 = await service.getAllVendors();

      expect(mockPayload.find).toHaveBeenCalledTimes(2);
    });

    it('should clear cache on clearCache()', async () => {
      mockPayload.find.mockResolvedValueOnce(mockVendorDocs);

      await service.getAllVendors();
      expect(service.cache.size).toBeGreaterThan(0);

      service.clearCache();
      expect(service.cache.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPayload.find.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(service.getAllVendors()).rejects.toThrow();
    });

    it('should handle missing documents', async () => {
      mockPayload.find.mockResolvedValueOnce({ docs: [], totalDocs: 0 });

      const result = await service.getAllVendors();
      expect(result).toEqual([]);
    });

    it('should handle malformed documents', () => {
      const malformedDoc = {
        id: null,
        slug: undefined,
        // Missing required fields
      };

      expect(() => service.transformPayloadVendor(malformedDoc)).not.toThrow();
    });
  });

  describe('Reference Resolution', () => {
    it('should resolve vendor in product', () => {
      const doc = mockProductDocs.docs[0];
      const result = service.transformPayloadProduct(doc);

      expect(result.vendorId).toBe('1');
      expect(result.vendorName).toBe('Test Vendor 1');
      expect(result.vendor).toBeDefined();
      expect(result.vendor?.slug).toBe('test-vendor-1');
    });

    it('should resolve category in product', () => {
      const doc = mockProductDocs.docs[0];
      const result = service.transformPayloadProduct(doc);

      expect(result.category).toBe('Navigation');
    });

    it('should resolve author in blog post', () => {
      const doc = mockBlogPostDocs.docs[0];
      const result = service.transformPayloadBlogPost(doc);

      expect(result.author).toBe('author@example.com');
    });

    it('should handle missing relationships', () => {
      const doc = {
        ...mockProductDocs.docs[0],
        vendor: null,
        categories: [],
      };

      const result = service.transformPayloadProduct(doc);

      expect(result.vendorId).toBe('');
      expect(result.vendorName).toBe('');
      expect(result.category).toBe('');
    });
  });

  describe('Filtering Methods', () => {
    beforeEach(() => {
      mockPayload.find.mockResolvedValue(mockVendorDocs);
    });

    it('should filter vendors by category', async () => {
      const vendors = await service.getAllVendors();
      const filtered = vendors.filter((v: any) => v.category === 'Test Category');

      expect(filtered).toBeInstanceOf(Array);
    });

    it('should filter vendors by featured', async () => {
      const result = await service.getVendors({ featured: true });

      expect(result.every((v: any) => v.featured === true)).toBe(true);
    });

    it('should filter vendors by partnersOnly', async () => {
      const result = await service.getVendors({ partnersOnly: true });

      expect(result.every((v: any) => v.partner === true)).toBe(true);
    });
  });

  describe('Cache Statistics', () => {
    it('should return cache stats', () => {
      const stats = service.getCacheStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('size');
    });

    it('should track cache size', async () => {
      mockPayload.find.mockResolvedValueOnce(mockVendorDocs);

      await service.getAllVendors();

      const stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });
});
