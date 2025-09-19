import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import tinaCMSDataService from '@/lib/tinacms-data-service';
import type { Vendor, Product, Yacht } from '@/lib/types';

// Mock TinaCMS and fs modules
jest.mock('tinacms');
jest.mock('fs/promises');

describe('Reference Integrity and Content Relationships', () => {
  beforeEach(() => {
    tinaCMSDataService.clearCache();
    jest.clearAllMocks();
  });

  describe('Vendor-Product Reference Integrity', () => {
    it('should maintain consistent vendor references across products', async () => {
      const mockVendors: Vendor[] = [
        {
          id: 'garmin-marine',
          slug: 'garmin-marine',
          name: 'Garmin Marine',
          description: 'Leading marine electronics manufacturer',
          category: 'Electronics',
          logo: '/logos/garmin.png',
          image: '/images/garmin-facility.jpg',
          website: 'https://www.garmin.com/marine',
          founded: 1989,
          location: 'Olathe, Kansas, USA',
          tags: ['navigation', 'electronics', 'chartplotters'],
          featured: true,
          partner: true,
          services: ['Navigation Systems', 'Fish Finders', 'Autopilot'],
          certifications: [
            {
              name: 'NMEA 2000 Certified',
              issuingOrganization: 'NMEA',
              validUntil: '2025-12-31',
              verified: true,
              logoUrl: '/certs/nmea-logo.png'
            }
          ],
          awards: [
            {
              title: 'Innovation Award 2023',
              organization: 'Marine Electronics Association',
              year: 2023,
              description: 'Recognition for advanced chartplotter technology',
              imageUrl: '/awards/innovation-2023.jpg'
            }
          ],
          socialProof: {
            linkedinFollowers: 25000,
            projectsCompleted: 1500,
            testimonialsCount: 250
          },
          videoIntroduction: {
            url: 'https://www.youtube.com/watch?v=garmin-intro',
            thumbnail: '/videos/garmin-thumb.jpg',
            duration: 180
          },
          caseStudies: [],
          innovationHighlights: [
            {
              title: 'Advanced Sonar Technology',
              description: 'Revolutionary CHIRP sonar technology',
              technologies: ['CHIRP', 'ClearVü', 'SideVü'],
              imageUrl: '/tech/sonar-tech.jpg'
            }
          ],
          teamMembers: [],
          yachtProjects: []
        }
      ];

      const mockProducts: Product[] = [
        {
          id: 'garmin-gpsmap-8617',
          slug: 'garmin-gpsmap-8617',
          name: 'GPSMAP 8617 Chartplotter',
          vendorId: 'garmin-marine',
          vendorName: 'Garmin Marine',
          partnerId: 'garmin-marine',
          partnerName: 'Garmin Marine',
          category: 'Navigation',
          description: 'Professional 17" touchscreen chartplotter with worldwide basemap',
          image: '/products/gpsmap-8617.jpg',
          images: ['/products/gpsmap-8617.jpg', '/products/gpsmap-8617-installed.jpg'],
          features: [
            '17" touchscreen display',
            'Worldwide basemap',
            'NMEA 2000 compatible',
            'WiFi connectivity'
          ],
          price: '$4,999',
          tags: ['chartplotter', 'navigation', 'touchscreen']
        },
        {
          id: 'garmin-echomap-ultra-126sv',
          slug: 'garmin-echomap-ultra-126sv',
          name: 'ECHOMAP Ultra 126sv',
          vendorId: 'garmin-marine',
          vendorName: 'Garmin Marine',
          partnerId: 'garmin-marine',
          partnerName: 'Garmin Marine',
          category: 'Fish Finders',
          description: 'Advanced fishfinder with CHIRP sonar and mapping',
          image: '/products/echomap-ultra-126sv.jpg',
          images: ['/products/echomap-ultra-126sv.jpg'],
          features: [
            'CHIRP sonar',
            'ClearVü scanning sonar',
            'SideVü scanning sonar',
            'Preloaded maps'
          ],
          price: '$1,799',
          tags: ['fishfinder', 'sonar', 'mapping']
        }
      ];

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockVendors);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue(mockProducts);

      // Test that all products have valid vendor references
      const vendorIds = new Set(mockVendors.map(v => v.id));
      const orphanedProducts = mockProducts.filter(p =>
        !vendorIds.has(p.vendorId) || !vendorIds.has(p.partnerId!)
      );

      expect(orphanedProducts).toHaveLength(0);

      // Test that vendor names match
      for (const product of mockProducts) {
        const vendor = mockVendors.find(v => v.id === product.vendorId);
        expect(vendor).toBeDefined();
        expect(product.vendorName).toBe(vendor!.name);
        expect(product.partnerName).toBe(vendor!.name);
      }
    });

    it('should detect inconsistent vendor name references', async () => {
      const mockVendors: Vendor[] = [
        {
          id: 'vendor-1',
          slug: 'test-vendor',
          name: 'Correct Vendor Name',
          description: 'A test vendor',
          category: 'Electronics',
          logo: '/test-logo.png',
          image: '/test-image.png',
          website: 'https://test.com',
          founded: 2020,
          location: 'Test Location',
          tags: ['test'],
          featured: false,
          partner: true,
          services: ['Service 1'],
          certifications: [],
          awards: [],
          socialProof: {
            linkedinFollowers: 0,
            projectsCompleted: 0,
            testimonialsCount: 0
          },
          videoIntroduction: null,
          caseStudies: [],
          innovationHighlights: [],
          teamMembers: [],
          yachtProjects: []
        }
      ];

      const mockProducts: Product[] = [
        {
          id: 'product-1',
          slug: 'test-product',
          name: 'Test Product',
          vendorId: 'vendor-1',
          vendorName: 'Wrong Vendor Name', // Inconsistent name
          partnerId: 'vendor-1',
          partnerName: 'Correct Vendor Name',
          category: 'Electronics',
          description: 'A test product',
          image: '/test-product.png',
          images: ['/test-product.png'],
          features: [],
          price: '$100',
          tags: ['test']
        }
      ];

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockVendors);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue(mockProducts);

      // Custom validation for name consistency
      const vendor = mockVendors[0];
      const product = mockProducts[0];

      expect(product.vendorId).toBe(vendor.id);
      expect(product.vendorName).not.toBe(vendor.name); // This should fail
      expect(product.partnerName).toBe(vendor.name); // This should pass
    });
  });

  describe('Yacht-Vendor Reference Integrity', () => {
    it('should validate yacht supplier map references', async () => {
      const mockVendors: Vendor[] = [
        {
          id: 'caterpillar-marine',
          slug: 'caterpillar-marine',
          name: 'Caterpillar Marine',
          description: 'Leading marine engine manufacturer',
          category: 'Propulsion',
          logo: '/logos/caterpillar.png',
          image: '/images/caterpillar.jpg',
          website: 'https://www.cat.com/marine',
          founded: 1925,
          location: 'Lafayette, Indiana, USA',
          tags: ['engines', 'propulsion', 'power'],
          featured: true,
          partner: true,
          services: ['Marine Engines', 'Power Generation', 'Maintenance'],
          certifications: [],
          awards: [],
          socialProof: {
            linkedinFollowers: 50000,
            projectsCompleted: 5000,
            testimonialsCount: 500
          },
          videoIntroduction: null,
          caseStudies: [],
          innovationHighlights: [],
          teamMembers: [],
          yachtProjects: []
        },
        {
          id: 'rolls-royce-marine',
          slug: 'rolls-royce-marine',
          name: 'Rolls-Royce Marine',
          description: 'Premium marine propulsion systems',
          category: 'Propulsion',
          logo: '/logos/rolls-royce.png',
          image: '/images/rolls-royce.jpg',
          website: 'https://www.rolls-royce.com/marine',
          founded: 1884,
          location: 'Bergen, Norway',
          tags: ['propulsion', 'luxury', 'systems'],
          featured: true,
          partner: true,
          services: ['Propulsion Systems', 'Control Systems'],
          certifications: [],
          awards: [],
          socialProof: {
            linkedinFollowers: 30000,
            projectsCompleted: 2000,
            testimonialsCount: 300
          },
          videoIntroduction: null,
          caseStudies: [],
          innovationHighlights: [],
          teamMembers: [],
          yachtProjects: []
        }
      ];

      const mockYacht: Yacht = {
        id: 'eclipse-yacht',
        slug: 'eclipse',
        name: 'Eclipse',
        description: 'One of the world\'s largest private yachts',
        length: 162.5,
        beam: 22.0,
        draft: 5.5,
        displacement: 13500,
        builder: 'Blohm+Voss',
        designer: 'Terence Disdale',
        launchYear: 2010,
        deliveryYear: 2010,
        homePort: 'Hamilton, Bermuda',
        flag: 'Bermuda',
        classification: 'MCA',
        guests: 36,
        crew: 70,
        cruisingSpeed: 16,
        maxSpeed: 25,
        range: 6000,
        featured: true,
        image: '/yachts/eclipse-main.jpg',
        images: ['/yachts/eclipse-main.jpg', '/yachts/eclipse-profile.jpg'],
        timeline: [
          {
            date: '2010-06-15',
            event: 'Launch',
            description: 'Eclipse was launched at Blohm+Voss shipyard',
            location: 'Hamburg, Germany'
          }
        ],
        supplierMap: [
          {
            discipline: 'Main Engines',
            vendors: ['caterpillar-marine'],
            systems: ['C32 Marine Engines', 'Power Management System']
          },
          {
            discipline: 'Propulsion',
            vendors: ['rolls-royce-marine'],
            systems: ['Azipod Propulsion', 'Dynamic Positioning']
          },
          {
            discipline: 'Mixed Systems',
            vendors: ['caterpillar-marine', 'rolls-royce-marine'],
            systems: ['Integrated Control', 'Monitoring Systems']
          }
        ],
        sustainabilityScore: {
          overall: 75,
          carbonFootprint: 65,
          fuelEfficiency: 70,
          wasteManagement: 85,
          certifications: ['MCA Compliant']
        },
        customizations: [],
        maintenanceHistory: [],
        category: 'Superyacht',
        categoryName: 'Superyacht',
        tags: ['luxury', 'private'],
        tagNames: ['luxury', 'private'],
        imageUrl: '/yachts/eclipse-main.jpg',
        mainImage: '/yachts/eclipse-main.jpg',
        supplierCount: 2,
        totalSystems: 5
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockVendors);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue([mockYacht]);

      // Validate supplier map references
      const vendorIds = new Set(mockVendors.map(v => v.id));

      for (const supplierGroup of mockYacht.supplierMap) {
        for (const vendorId of supplierGroup.vendors) {
          expect(vendorIds.has(vendorId)).toBe(true);
        }
      }

      // Validate supplier count matches unique vendors in supplier map
      const uniqueVendors = new Set();
      for (const supplierGroup of mockYacht.supplierMap) {
        for (const vendorId of supplierGroup.vendors) {
          uniqueVendors.add(vendorId);
        }
      }
      expect(mockYacht.supplierCount).toBe(uniqueVendors.size);

      // Validate total systems count
      const totalSystems = mockYacht.supplierMap.reduce((sum, group) => sum + group.systems.length, 0);
      expect(mockYacht.totalSystems).toBe(totalSystems);
    });

    it('should detect broken vendor references in yacht supplier map', async () => {
      const mockVendors: Vendor[] = [
        {
          id: 'existing-vendor',
          slug: 'existing-vendor',
          name: 'Existing Vendor',
          description: 'A valid vendor',
          category: 'Electronics',
          logo: '/test-logo.png',
          image: '/test-image.png',
          website: 'https://test.com',
          founded: 2020,
          location: 'Test Location',
          tags: ['test'],
          featured: false,
          partner: true,
          services: ['Service 1'],
          certifications: [],
          awards: [],
          socialProof: {
            linkedinFollowers: 0,
            projectsCompleted: 0,
            testimonialsCount: 0
          },
          videoIntroduction: null,
          caseStudies: [],
          innovationHighlights: [],
          teamMembers: [],
          yachtProjects: []
        }
      ];

      const mockYacht: Yacht = {
        id: 'yacht-1',
        slug: 'test-yacht',
        name: 'Test Yacht',
        description: 'A test yacht',
        length: 50,
        beam: 10,
        draft: 3,
        displacement: 200,
        builder: 'Test Builder',
        designer: 'Test Designer',
        launchYear: 2023,
        deliveryYear: 2023,
        homePort: 'Monaco',
        flag: 'Monaco',
        classification: 'MCA',
        guests: 12,
        crew: 8,
        cruisingSpeed: 12,
        maxSpeed: 16,
        range: 4000,
        featured: false,
        image: '/yacht-image.png',
        images: ['/yacht-image.png'],
        timeline: [],
        supplierMap: [
          {
            discipline: 'Electronics',
            vendors: ['existing-vendor'], // Valid reference
            systems: ['System 1']
          },
          {
            discipline: 'Propulsion',
            vendors: ['non-existent-vendor'], // Invalid reference
            systems: ['System 2']
          }
        ],
        sustainabilityScore: {
          overall: 85,
          carbonFootprint: 75,
          fuelEfficiency: 80,
          wasteManagement: 90,
          certifications: ['Green Marine']
        },
        customizations: [],
        maintenanceHistory: [],
        category: 'Superyacht',
        categoryName: 'Superyacht',
        tags: ['luxury'],
        tagNames: ['luxury'],
        imageUrl: '/yacht-image.png',
        mainImage: '/yacht-image.png',
        supplierCount: 2,
        totalSystems: 2
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockVendors);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue([mockYacht]);

      // Check for broken references
      const vendorIds = new Set(mockVendors.map(v => v.id));
      const brokenReferences: string[] = [];

      for (const supplierGroup of mockYacht.supplierMap) {
        for (const vendorId of supplierGroup.vendors) {
          if (!vendorIds.has(vendorId)) {
            brokenReferences.push(vendorId);
          }
        }
      }

      expect(brokenReferences).toContain('non-existent-vendor');
      expect(brokenReferences).not.toContain('existing-vendor');
    });
  });

  describe('Cross-Content Type References', () => {
    it('should validate product-yacht relationships through vendor connections', async () => {
      const sharedVendorId = 'shared-vendor';

      const mockVendors: Vendor[] = [
        {
          id: sharedVendorId,
          slug: 'shared-vendor',
          name: 'Shared Vendor',
          description: 'Vendor with both products and yacht projects',
          category: 'Electronics',
          logo: '/logos/shared.png',
          image: '/images/shared.jpg',
          website: 'https://shared.com',
          founded: 2015,
          location: 'Global',
          tags: ['electronics', 'marine'],
          featured: true,
          partner: true,
          services: ['Navigation', 'Communication'],
          certifications: [],
          awards: [],
          socialProof: {
            linkedinFollowers: 5000,
            projectsCompleted: 100,
            testimonialsCount: 50
          },
          videoIntroduction: null,
          caseStudies: [],
          innovationHighlights: [],
          teamMembers: [],
          yachtProjects: [
            {
              yachtName: 'Test Yacht',
              projectType: 'Electronics Installation',
              completionYear: 2023,
              systemsProvided: ['Navigation', 'Communication']
            }
          ]
        }
      ];

      const mockProducts: Product[] = [
        {
          id: 'product-1',
          slug: 'shared-product',
          name: 'Navigation System',
          vendorId: sharedVendorId,
          vendorName: 'Shared Vendor',
          partnerId: sharedVendorId,
          partnerName: 'Shared Vendor',
          category: 'Navigation',
          description: 'Advanced navigation system',
          image: '/products/nav-system.jpg',
          images: ['/products/nav-system.jpg'],
          features: ['GPS', 'Chart Display'],
          price: '$5,000',
          tags: ['navigation', 'marine']
        }
      ];

      const mockYachts: Yacht[] = [
        {
          id: 'yacht-1',
          slug: 'test-yacht',
          name: 'Test Yacht',
          description: 'A yacht with shared vendor systems',
          length: 60,
          beam: 12,
          draft: 3.5,
          displacement: 300,
          builder: 'Test Builder',
          designer: 'Test Designer',
          launchYear: 2023,
          deliveryYear: 2023,
          homePort: 'Monaco',
          flag: 'Monaco',
          classification: 'MCA',
          guests: 14,
          crew: 10,
          cruisingSpeed: 14,
          maxSpeed: 18,
          range: 5000,
          featured: false,
          image: '/yachts/test-yacht.jpg',
          images: ['/yachts/test-yacht.jpg'],
          timeline: [],
          supplierMap: [
            {
              discipline: 'Navigation',
              vendors: [sharedVendorId],
              systems: ['Navigation System', 'Communication System']
            }
          ],
          sustainabilityScore: {
            overall: 80,
            carbonFootprint: 70,
            fuelEfficiency: 75,
            wasteManagement: 85,
            certifications: ['MCA']
          },
          customizations: [],
          maintenanceHistory: [],
          category: 'Yacht',
          categoryName: 'Yacht',
          tags: ['luxury'],
          tagNames: ['luxury'],
          imageUrl: '/yachts/test-yacht.jpg',
          mainImage: '/yachts/test-yacht.jpg',
          supplierCount: 1,
          totalSystems: 2
        }
      ];

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockVendors);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue(mockProducts);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue(mockYachts);

      // Validate cross-references
      const vendor = mockVendors[0];
      const product = mockProducts[0];
      const yacht = mockYachts[0];

      // Product should reference the vendor
      expect(product.vendorId).toBe(vendor.id);

      // Yacht should reference the vendor in supplier map
      const yachtVendors = yacht.supplierMap.flatMap(sm => sm.vendors);
      expect(yachtVendors).toContain(vendor.id);

      // Vendor should have yacht project for this yacht
      expect(vendor.yachtProjects[0].yachtName).toBe(yacht.name);
    });
  });

  describe('File Path Reference Resolution', () => {
    it('should resolve content file references correctly', async () => {
      const mockReference = 'content/vendors/garmin-marine.md';
      const expectedVendor = {
        id: 'garmin-marine',
        name: 'Garmin Marine',
        slug: 'garmin-marine'
      };

      // Mock fs.readFile to return mock content
      const mockFs = require('fs/promises');
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        data: expectedVendor
      }));

      // Mock fs.access to indicate file exists
      mockFs.access.mockResolvedValue(undefined);

      const resolved = await (tinaCMSDataService as any).resolveReference(mockReference);

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('garmin-marine.md'),
        'utf8'
      );
    });

    it('should handle missing file references', async () => {
      const mockReference = 'content/vendors/non-existent.md';

      // Mock fs.access to throw error (file doesn't exist)
      const mockFs = require('fs/promises');
      mockFs.access.mockRejectedValue(new Error('File not found'));

      const resolved = await (tinaCMSDataService as any).resolveReference(mockReference);

      expect(resolved).toBeNull();
    });
  });
});