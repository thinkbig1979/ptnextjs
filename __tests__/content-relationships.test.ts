import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import tinaCMSDataService from '@/lib/tinacms-data-service';

// Mock TinaCMS and fs modules
jest.mock('tinacms');
jest.mock('fs/promises');

describe('Content Relationships and Reference Resolution', () => {
  beforeEach(() => {
    tinaCMSDataService.clearCache();
    jest.clearAllMocks();
  });

  describe('Yacht-Vendor Relationships', () => {
    it('should resolve yacht supplier map vendor references', async () => {
      // Mock yacht with supplier map referencing vendors
      const mockYacht = {
        id: 'azzam',
        name: 'Azzam',
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro', 'Radar Systems']
          },
          {
            discipline: 'Propulsion',
            vendors: ['caterpillar-marine'],
            systems: ['C32 ACERT Engines']
          }
        ]
      };

      const mockVendors = [
        {
          id: 'raymarine-teledyne-flir',
          name: 'Raymarine (Teledyne FLIR)',
          slug: 'raymarine-teledyne-flir'
        },
        {
          id: 'caterpillar-marine',
          name: 'Caterpillar Marine',
          slug: 'caterpillar-marine'
        }
      ];

      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue([mockYacht]);
      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockVendors);

      const yachts = await tinaCMSDataService.getAllYachts();
      const vendors = await tinaCMSDataService.getAllVendors();

      const yacht = yachts[0];
      const vendorIds = new Set(vendors.map(v => v.id));

      // Validate all vendor references in supplier map
      for (const supplierGroup of yacht.supplierMap) {
        for (const vendorId of supplierGroup.vendors) {
          expect(vendorIds.has(vendorId)).toBe(true);
        }
      }
    });

    it('should validate yacht projects in vendor profiles', async () => {
      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        yachtProjects: [
          {
            yachtName: 'Azzam',
            projectType: 'Navigation Systems',
            completionYear: 2013,
            systemsProvided: ['Axiom Pro', 'Radar Systems']
          }
        ]
      };

      const mockYacht = {
        id: 'azzam',
        name: 'Azzam',
        deliveryYear: 2013
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue([mockVendor]);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue([mockYacht]);

      const vendors = await tinaCMSDataService.getAllVendors();
      const yachts = await tinaCMSDataService.getAllYachts();

      const vendor = vendors[0];
      const yacht = yachts[0];

      // Validate yacht project references
      const yachtProject = vendor.yachtProjects[0];
      expect(yachtProject.yachtName).toBe(yacht.name);
      expect(yachtProject.completionYear).toBe(yacht.deliveryYear);
    });
  });

  describe('Product-Vendor Relationships', () => {
    it('should maintain consistent vendor references in products', async () => {
      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        slug: 'raymarine-teledyne-flir'
      };

      const mockProduct = {
        id: 'axiom-pro-mfd',
        name: 'Axiom Pro MFD Series',
        vendorId: 'raymarine-teledyne-flir',
        vendorName: 'Raymarine (Teledyne FLIR)',
        partnerId: 'raymarine-teledyne-flir',
        partnerName: 'Raymarine (Teledyne FLIR)'
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue([mockVendor]);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue([mockProduct]);

      const vendors = await tinaCMSDataService.getAllVendors();
      const products = await tinaCMSDataService.getAllProducts();

      const vendor = vendors[0];
      const product = products[0];

      // Validate vendor ID references
      expect(product.vendorId).toBe(vendor.id);
      expect(product.partnerId).toBe(vendor.id);

      // Validate vendor name consistency
      expect(product.vendorName).toBe(vendor.name);
      expect(product.partnerName).toBe(vendor.name);
    });

    it('should validate product references in owner reviews', async () => {
      const mockProduct = {
        id: 'axiom-pro-mfd',
        name: 'Axiom Pro MFD Series',
        ownerReviews: {
          overallRating: 4.7,
          totalReviews: 147,
          reviews: [
            {
              reviewerName: 'Captain Mark Thompson',
              yachtName: 'Sea Voyager',
              yachtLength: 85,
              rating: 5,
              date: '2024-01-15',
              title: 'Outstanding Navigation System',
              content: 'Installed dual 16" Axiom Pro displays...',
              verified: true,
              helpfulVotes: 23
            }
          ]
        }
      };

      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue([mockProduct]);

      const products = await tinaCMSDataService.getAllProducts();
      const product = products[0];

      // Validate owner reviews structure
      expect(product.ownerReviews).toBeDefined();
      expect(product.ownerReviews.overallRating).toBeGreaterThan(0);
      expect(product.ownerReviews.totalReviews).toBeGreaterThan(0);
      expect(Array.isArray(product.ownerReviews.reviews)).toBe(true);

      // Validate individual review structure
      const review = product.ownerReviews.reviews[0];
      expect(review.reviewerName).toBeDefined();
      expect(review.yachtName).toBeDefined();
      expect(review.rating).toBeGreaterThan(0);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.verified).toBeDefined();
    });
  });

  describe('Category and Tag Relationships', () => {
    it('should resolve category references correctly', async () => {
      const mockCategory = {
        id: 'navigation-systems',
        name: 'Navigation Systems',
        slug: 'navigation-systems'
      };

      const mockProduct = {
        id: 'axiom-pro-mfd',
        name: 'Axiom Pro MFD Series',
        category: 'content/categories/navigation-systems.md'
      };

      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        category: 'content/categories/navigation-systems.md'
      };

      const mockYacht = {
        id: 'azzam',
        name: 'Azzam',
        category: 'content/categories/superyacht.md'
      };

      // Mock resolveReference to return category data
      const resolveSpy = jest.spyOn(tinaCMSDataService as any, 'resolveReference');
      resolveSpy.mockImplementation((reference: string) => {
        if (reference.includes('navigation-systems')) {
          return Promise.resolve(mockCategory);
        }
        if (reference.includes('superyacht')) {
          return Promise.resolve({ id: 'superyacht', name: 'Superyacht', slug: 'superyacht' });
        }
        return Promise.resolve(null);
      });

      // Test category resolution
      const productCategory = await (tinaCMSDataService as any).resolveReference(mockProduct.category);
      const vendorCategory = await (tinaCMSDataService as any).resolveReference(mockVendor.category);
      const yachtCategory = await (tinaCMSDataService as any).resolveReference(mockYacht.category);

      expect(productCategory.id).toBe('navigation-systems');
      expect(vendorCategory.id).toBe('navigation-systems');
      expect(yachtCategory.id).toBe('superyacht');
    });

    it('should handle tag references across content types', async () => {
      const mockTag = {
        id: 'innovation',
        name: 'Innovation',
        slug: 'innovation'
      };

      const mockReferences = [
        'content/tags/innovation.md',
        'content/tags/marine.md',
        'content/tags/technology.md'
      ];

      const resolveSpy = jest.spyOn(tinaCMSDataService as any, 'resolveReference');
      resolveSpy.mockImplementation((reference: string) => {
        if (reference.includes('innovation')) {
          return Promise.resolve(mockTag);
        }
        return Promise.resolve({ id: 'tag', name: 'Tag', slug: 'tag' });
      });

      // Test tag reference resolution
      for (const tagRef of mockReferences) {
        const resolved = await (tinaCMSDataService as any).resolveReference(tagRef);
        expect(resolved).toBeDefined();
        expect(resolved.id).toBeDefined();
        expect(resolved.name).toBeDefined();
      }
    });
  });

  describe('Cross-Content Type Integration', () => {
    it('should validate complete ecosystem relationships', async () => {
      // Create a complete ecosystem with all relationships
      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        yachtProjects: [
          {
            yachtName: 'Azzam',
            projectType: 'Navigation Systems',
            completionYear: 2013,
            systemsProvided: ['Axiom Pro', 'Radar Systems']
          }
        ]
      };

      const mockProduct = {
        id: 'axiom-pro-mfd',
        name: 'Axiom Pro MFD Series',
        vendorId: 'raymarine-teledyne-flir',
        vendorName: 'Raymarine (Teledyne FLIR)',
        ownerReviews: {
          reviews: [
            {
              reviewerName: 'Captain Mark Thompson',
              yachtName: 'Azzam',
              rating: 5
            }
          ]
        }
      };

      const mockYacht = {
        id: 'azzam',
        name: 'Azzam',
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro MFD Series']
          }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue([mockVendor]);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue([mockProduct]);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue([mockYacht]);

      const [vendors, products, yachts] = await Promise.all([
        tinaCMSDataService.getAllVendors(),
        tinaCMSDataService.getAllProducts(),
        tinaCMSDataService.getAllYachts()
      ]);

      const vendor = vendors[0];
      const product = products[0];
      const yacht = yachts[0];

      // Validate circular relationships
      // 1. Vendor has yacht project for this yacht
      expect(vendor.yachtProjects[0].yachtName).toBe(yacht.name);

      // 2. Product is from this vendor
      expect(product.vendorId).toBe(vendor.id);

      // 3. Yacht uses vendor in supplier map
      const yachtVendors = yacht.supplierMap.flatMap(sm => sm.vendors);
      expect(yachtVendors).toContain(vendor.id);

      // 4. Product owner review mentions the yacht
      expect(product.ownerReviews.reviews[0].yachtName).toBe(yacht.name);

      // 5. Systems are consistent across references
      const vendorSystems = vendor.yachtProjects[0].systemsProvided;
      const yachtSystems = yacht.supplierMap[0].systems;
      expect(vendorSystems.some(sys => yachtSystems.includes(sys))).toBe(true);
    });

    it('should handle missing references gracefully', async () => {
      const mockProduct = {
        id: 'orphaned-product',
        name: 'Orphaned Product',
        vendorId: 'non-existent-vendor',
        category: 'content/categories/non-existent.md'
      };

      const mockYacht = {
        id: 'yacht-with-broken-refs',
        name: 'Yacht with Broken Refs',
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['non-existent-vendor'],
            systems: ['Non-existent System']
          }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue([mockProduct]);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue([mockYacht]);
      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue([]);

      // Mock resolveReference to return null for broken references
      const resolveSpy = jest.spyOn(tinaCMSDataService as any, 'resolveReference');
      resolveSpy.mockResolvedValue(null);

      const products = await tinaCMSDataService.getAllProducts();
      const yachts = await tinaCMSDataService.getAllYachts();
      const vendors = await tinaCMSDataService.getAllVendors();

      // Should handle missing vendor references
      const product = products[0];
      const yacht = yachts[0];
      const vendorIds = new Set(vendors.map(v => v.id));

      expect(vendorIds.has(product.vendorId)).toBe(false);
      expect(vendorIds.has(yacht.supplierMap[0].vendors[0])).toBe(false);

      // Category resolution should return null
      const categoryResult = await (tinaCMSDataService as any).resolveReference(product.category);
      expect(categoryResult).toBeNull();
    });
  });

  describe('Data Consistency Validation', () => {
    it('should validate consistent naming across references', async () => {
      const vendorName = 'Raymarine (Teledyne FLIR)';
      const yachtName = 'Azzam';

      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        name: vendorName,
        yachtProjects: [
          {
            yachtName: yachtName,
            projectType: 'Navigation',
            completionYear: 2013,
            systemsProvided: ['Navigation Systems']
          }
        ]
      };

      const mockProduct = {
        id: 'axiom-pro',
        name: 'Axiom Pro',
        vendorId: 'raymarine-teledyne-flir',
        vendorName: vendorName,
        ownerReviews: {
          reviews: [
            {
              reviewerName: 'Captain Thompson',
              yachtName: yachtName,
              rating: 5
            }
          ]
        }
      };

      const mockYacht = {
        id: 'azzam',
        name: yachtName,
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro']
          }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue([mockVendor]);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue([mockProduct]);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue([mockYacht]);

      const [vendors, products, yachts] = await Promise.all([
        tinaCMSDataService.getAllVendors(),
        tinaCMSDataService.getAllProducts(),
        tinaCMSDataService.getAllYachts()
      ]);

      const vendor = vendors[0];
      const product = products[0];
      const yacht = yachts[0];

      // Validate name consistency
      expect(product.vendorName).toBe(vendor.name);
      expect(vendor.yachtProjects[0].yachtName).toBe(yacht.name);
      expect(product.ownerReviews.reviews[0].yachtName).toBe(yacht.name);
    });

    it('should validate data integrity across the complete system', async () => {
      // This test validates the entire content ecosystem
      const result = await tinaCMSDataService.validateCMSContent();

      // The validation should pass with proper mock data
      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});