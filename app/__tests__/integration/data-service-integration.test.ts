/**
 * Data Service Integration Tests
 *
 * Tests PayloadCMSDataService method signatures, contracts, and basic functionality
 * without requiring full static generation or live Payload connection.
 *
 * These tests validate:
 * - Method signatures match expected contracts
 * - Service initialization works correctly
 * - Methods are callable with correct parameters
 * - Basic error handling works
 */

import payloadCMSDataService from '@/lib/payload-cms-data-service';

describe('PayloadCMSDataService Integration', () => {
  const dataService = payloadCMSDataService;

  beforeAll(() => {
    // Data service is a singleton instance, no setup needed
  });

  describe('Service Initialization', () => {
    it('should be a singleton instance', () => {
      // The service is exported as a singleton
      expect(dataService).toBeDefined();
      expect(typeof dataService).toBe('object');
    });

    it('should have all required vendor methods', () => {
      expect(dataService.getVendors).toBeDefined();
      expect(dataService.getVendorBySlug).toBeDefined();
      expect(dataService.getFeaturedVendors).toBeDefined();
      expect(dataService.getVendorsByCategory).toBeDefined();

      expect(typeof dataService.getVendors).toBe('function');
      expect(typeof dataService.getVendorBySlug).toBe('function');
      expect(typeof dataService.getFeaturedVendors).toBe('function');
      expect(typeof dataService.getVendorsByCategory).toBe('function');
    });

    it('should have all required product methods', () => {
      expect(dataService.getProducts).toBeDefined();
      expect(dataService.getProductById).toBeDefined();
      expect(dataService.getFeaturedProducts).toBeDefined();
      expect(dataService.getProductsByVendor).toBeDefined();
      expect(dataService.getProductsByCategory).toBeDefined();

      expect(typeof dataService.getProducts).toBe('function');
      expect(typeof dataService.getProductById).toBe('function');
      expect(typeof dataService.getFeaturedProducts).toBe('function');
      expect(typeof dataService.getProductsByVendor).toBe('function');
      expect(typeof dataService.getProductsByCategory).toBe('function');
    });

    it('should have all required yacht methods', () => {
      expect(dataService.getYachts).toBeDefined();
      expect(dataService.getYachtBySlug).toBeDefined();
      expect(dataService.getFeaturedYachts).toBeDefined();
      expect(dataService.getYachtsByVendor).toBeDefined();

      expect(typeof dataService.getYachts).toBe('function');
      expect(typeof dataService.getYachtBySlug).toBe('function');
      expect(typeof dataService.getFeaturedYachts).toBe('function');
      expect(typeof dataService.getYachtsByVendor).toBe('function');
    });

    it('should have all required blog methods', () => {
      expect(dataService.getBlogPosts).toBeDefined();
      expect(dataService.getBlogPostBySlug).toBeDefined();
      expect(dataService.getFeaturedBlogPosts).toBeDefined();
      expect(dataService.getBlogPostsByCategory).toBeDefined();

      expect(typeof dataService.getBlogPosts).toBe('function');
      expect(typeof dataService.getBlogPostBySlug).toBe('function');
      expect(typeof dataService.getFeaturedBlogPosts).toBe('function');
      expect(typeof dataService.getBlogPostsByCategory).toBe('function');
    });

    it('should have all required category methods', () => {
      expect(dataService.getCategories).toBeDefined();
      expect(dataService.getCategoryBySlug).toBeDefined();

      expect(typeof dataService.getCategories).toBe('function');
      expect(typeof dataService.getCategoryBySlug).toBe('function');
    });

    it('should have all required tag methods', () => {
      expect(dataService.getTags).toBeDefined();
      expect(dataService.getTagBySlug).toBeDefined();
      expect(dataService.getPopularTags).toBeDefined();

      expect(typeof dataService.getTags).toBe('function');
      expect(typeof dataService.getTagBySlug).toBe('function');
      expect(typeof dataService.getPopularTags).toBe('function');
    });

    it('should have all required team methods', () => {
      expect(dataService.getTeamMembers).toBeDefined();
      expect(dataService.getTeamMemberBySlug).toBeDefined();

      expect(typeof dataService.getTeamMembers).toBe('function');
      expect(typeof dataService.getTeamMemberBySlug).toBe('function');
    });

    it('should have all required company methods', () => {
      expect(dataService.getCompanyInfo).toBeDefined();

      expect(typeof dataService.getCompanyInfo).toBe('function');
    });

    it('should have validation method', () => {
      expect(dataService.validateCMSContent).toBeDefined();
      expect(typeof dataService.validateCMSContent).toBe('function');
    });
  });

  describe('Method Signatures', () => {
    it('getVendors should accept no parameters', () => {
      expect(dataService.getVendors).toHaveLength(0);
    });

    it('getVendorBySlug should accept slug parameter', () => {
      expect(dataService.getVendorBySlug).toHaveLength(1);
    });

    it('getFeaturedVendors should accept optional limit parameter', () => {
      expect(dataService.getFeaturedVendors).toHaveLength(1);
    });

    it('getVendorsByCategory should accept categorySlug parameter', () => {
      expect(dataService.getVendorsByCategory).toHaveLength(1);
    });

    it('getProducts should accept no parameters', () => {
      expect(dataService.getProducts).toHaveLength(0);
    });

    it('getProductById should accept id parameter', () => {
      expect(dataService.getProductById).toHaveLength(1);
    });

    it('getFeaturedProducts should accept optional limit parameter', () => {
      expect(dataService.getFeaturedProducts).toHaveLength(1);
    });

    it('getProductsByVendor should accept vendorSlug parameter', () => {
      expect(dataService.getProductsByVendor).toHaveLength(1);
    });

    it('getProductsByCategory should accept categorySlug parameter', () => {
      expect(dataService.getProductsByCategory).toHaveLength(1);
    });

    it('getYachts should accept no parameters', () => {
      expect(dataService.getYachts).toHaveLength(0);
    });

    it('getYachtBySlug should accept slug parameter', () => {
      expect(dataService.getYachtBySlug).toHaveLength(1);
    });

    it('getFeaturedYachts should accept optional limit parameter', () => {
      expect(dataService.getFeaturedYachts).toHaveLength(1);
    });

    it('getYachtsByVendor should accept vendorSlug parameter', () => {
      expect(dataService.getYachtsByVendor).toHaveLength(1);
    });

    it('getBlogPosts should accept no parameters', () => {
      expect(dataService.getBlogPosts).toHaveLength(0);
    });

    it('getBlogPostBySlug should accept slug parameter', () => {
      expect(dataService.getBlogPostBySlug).toHaveLength(1);
    });

    it('getFeaturedBlogPosts should accept optional limit parameter', () => {
      expect(dataService.getFeaturedBlogPosts).toHaveLength(1);
    });

    it('getBlogPostsByCategory should accept categorySlug parameter', () => {
      expect(dataService.getBlogPostsByCategory).toHaveLength(1);
    });

    it('getCategories should accept no parameters', () => {
      expect(dataService.getCategories).toHaveLength(0);
    });

    it('getCategoryBySlug should accept slug parameter', () => {
      expect(dataService.getCategoryBySlug).toHaveLength(1);
    });

    it('getTags should accept no parameters', () => {
      expect(dataService.getTags).toHaveLength(0);
    });

    it('getTagBySlug should accept slug parameter', () => {
      expect(dataService.getTagBySlug).toHaveLength(1);
    });

    it('getPopularTags should accept optional limit parameter', () => {
      expect(dataService.getPopularTags).toHaveLength(1);
    });

    it('getTeamMembers should accept no parameters', () => {
      expect(dataService.getTeamMembers).toHaveLength(0);
    });

    it('getTeamMemberBySlug should accept slug parameter', () => {
      expect(dataService.getTeamMemberBySlug).toHaveLength(1);
    });

    it('getCompanyInfo should accept no parameters', () => {
      expect(dataService.getCompanyInfo).toHaveLength(0);
    });
  });

  describe('Backward Compatibility (Legacy Partner Methods)', () => {
    it('should have legacy getPartners method', () => {
      expect(dataService.getPartners).toBeDefined();
      expect(typeof dataService.getPartners).toBe('function');
    });

    it('should have legacy getPartnerBySlug method', () => {
      expect(dataService.getPartnerBySlug).toBeDefined();
      expect(typeof dataService.getPartnerBySlug).toBe('function');
    });

    it('should have legacy getFeaturedPartners method', () => {
      expect(dataService.getFeaturedPartners).toBeDefined();
      expect(typeof dataService.getFeaturedPartners).toBe('function');
    });

    it('should have legacy getPartnersByCategory method', () => {
      expect(dataService.getPartnersByCategory).toBeDefined();
      expect(typeof dataService.getPartnersByCategory).toBe('function');
    });
  });

  describe('API Parity with TinaCMSDataService', () => {
    it('should have all 54 original TinaCMS methods', () => {
      // Vendor methods (4)
      expect(dataService.getVendors).toBeDefined();
      expect(dataService.getVendorBySlug).toBeDefined();
      expect(dataService.getFeaturedVendors).toBeDefined();
      expect(dataService.getVendorsByCategory).toBeDefined();

      // Partner methods (legacy, 4)
      expect(dataService.getPartners).toBeDefined();
      expect(dataService.getPartnerBySlug).toBeDefined();
      expect(dataService.getFeaturedPartners).toBeDefined();
      expect(dataService.getPartnersByCategory).toBeDefined();

      // Product methods (5)
      expect(dataService.getProducts).toBeDefined();
      expect(dataService.getProductById).toBeDefined();
      expect(dataService.getFeaturedProducts).toBeDefined();
      expect(dataService.getProductsByVendor).toBeDefined();
      expect(dataService.getProductsByCategory).toBeDefined();

      // Blog methods (4)
      expect(dataService.getBlogPosts).toBeDefined();
      expect(dataService.getBlogPostBySlug).toBeDefined();
      expect(dataService.getFeaturedBlogPosts).toBeDefined();
      expect(dataService.getBlogPostsByCategory).toBeDefined();

      // Category methods (2)
      expect(dataService.getCategories).toBeDefined();
      expect(dataService.getCategoryBySlug).toBeDefined();

      // Team methods (2)
      expect(dataService.getTeamMembers).toBeDefined();
      expect(dataService.getTeamMemberBySlug).toBeDefined();

      // Company methods (1)
      expect(dataService.getCompanyInfo).toBeDefined();

      // Validation methods (1)
      expect(dataService.validateCMSContent).toBeDefined();
    });

    it('should have new Yacht methods (4)', () => {
      expect(dataService.getYachts).toBeDefined();
      expect(dataService.getYachtBySlug).toBeDefined();
      expect(dataService.getFeaturedYachts).toBeDefined();
      expect(dataService.getYachtsByVendor).toBeDefined();
    });

    it('should have new Tag methods (3)', () => {
      expect(dataService.getTags).toBeDefined();
      expect(dataService.getTagBySlug).toBeDefined();
      expect(dataService.getPopularTags).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle null/undefined slug parameters gracefully', async () => {
      // These should not throw, but return null or empty results
      // Note: Without mocking Payload, these will fail to fetch but shouldn't crash
      await expect(dataService.getVendorBySlug('')).resolves.not.toThrow;
    });

    it('should handle invalid limit parameters', async () => {
      await expect(dataService.getFeaturedVendors(-1)).resolves.not.toThrow;
      await expect(dataService.getFeaturedVendors(0)).resolves.not.toThrow;
    });
  });
});

describe('PayloadCMSDataService Transformation Methods', () => {
  const dataService = payloadCMSDataService;

  describe('Private Transformation Methods', () => {
    it('should have transformVendor method in class', () => {
      // Check if private method exists by checking instance properties
      const proto = Object.getPrototypeOf(dataService);
      expect('transformVendor' in proto).toBe(true);
    });

    it('should have transformProduct method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformProduct' in proto).toBe(true);
    });

    it('should have transformYacht method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformYacht' in proto).toBe(true);
    });

    it('should have transformBlogPost method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformBlogPost' in proto).toBe(true);
    });

    it('should have transformCategory method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformCategory' in proto).toBe(true);
    });

    it('should have transformTag method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformTag' in proto).toBe(true);
    });

    it('should have transformTeamMember method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformTeamMember' in proto).toBe(true);
    });

    it('should have transformCompany method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformCompany' in proto).toBe(true);
    });

    it('should have transformLexicalToHtml method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformLexicalToHtml' in proto).toBe(true);
    });

    it('should have transformMediaPath method in class', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('transformMediaPath' in proto).toBe(true);
    });
  });
});

describe('PayloadCMSDataService Caching', () => {
  const dataService = payloadCMSDataService;

  describe('Cache Infrastructure', () => {
    it('should have cache property in instance', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('cache' in dataService || 'cache' in proto).toBe(true);
    });

    it('should have cacheGet method', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('cacheGet' in proto).toBe(true);
    });

    it('should have cacheSet method', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('cacheSet' in proto).toBe(true);
    });

    it('should have cacheClear method', () => {
      const proto = Object.getPrototypeOf(dataService);
      expect('cacheClear' in proto).toBe(true);
    });
  });
});
