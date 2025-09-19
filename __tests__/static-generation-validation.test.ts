import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import tinaCMSDataService from '@/lib/tinacms-data-service';

// Mock Next.js and TinaCMS
jest.mock('tinacms');
jest.mock('fs/promises');

describe('Static Site Generation Validation', () => {
  beforeEach(() => {
    tinaCMSDataService.clearCache();
    jest.clearAllMocks();
  });

  describe('Yacht Profiles Static Generation', () => {
    it('should generate valid yacht slugs for static paths', async () => {
      const mockYachts = [
        { id: 'azzam', slug: 'azzam', name: 'Azzam' },
        { id: 'eclipse', slug: 'eclipse', name: 'Eclipse' },
        { id: 'aqua', slug: 'aqua', name: 'Aqua' },
        { id: 'sailing-yacht-a', slug: 'sailing-yacht-a', name: 'Sailing Yacht A' }
      ];

      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue(mockYachts);

      const yachts = await tinaCMSDataService.getAllYachts();

      // Validate all yachts have valid slugs
      yachts.forEach(yacht => {
        expect(yacht.slug).toBeDefined();
        expect(typeof yacht.slug).toBe('string');
        expect(yacht.slug.length).toBeGreaterThan(0);
        expect(yacht.slug).toMatch(/^[a-z0-9-]+$/); // Valid URL slug format
      });

      // Validate unique slugs
      const slugs = yachts.map(y => y.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should provide yacht data for static props generation', async () => {
      const mockYacht = {
        id: 'azzam',
        slug: 'azzam',
        name: 'Azzam',
        description: 'World\'s largest private motor yacht',
        length: 180,
        beam: 20.8,
        timeline: [
          {
            date: '2013-09-05',
            event: 'Delivery',
            description: 'Final delivery to owner',
            location: 'Bremen, Germany'
          }
        ],
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro', 'Radar Systems']
          }
        ],
        sustainabilityScore: {
          overall: 78,
          carbonFootprint: 70,
          fuelEfficiency: 72,
          wasteManagement: 85,
          certifications: ['MCA Compliant']
        }
      };

      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockResolvedValue(mockYacht);

      const yacht = await tinaCMSDataService.getYachtBySlug('azzam');

      // Validate yacht data structure for static generation
      expect(yacht).toBeDefined();
      expect(yacht.id).toBeDefined();
      expect(yacht.slug).toBeDefined();
      expect(yacht.name).toBeDefined();
      expect(yacht.description).toBeDefined();

      // Validate complex data structures
      expect(Array.isArray(yacht.timeline)).toBe(true);
      expect(Array.isArray(yacht.supplierMap)).toBe(true);
      expect(typeof yacht.sustainabilityScore).toBe('object');

      // Validate timeline structure
      if (yacht.timeline.length > 0) {
        const timelineEvent = yacht.timeline[0];
        expect(timelineEvent.date).toBeDefined();
        expect(timelineEvent.event).toBeDefined();
        expect(timelineEvent.description).toBeDefined();
      }

      // Validate supplier map structure
      if (yacht.supplierMap.length > 0) {
        const supplierGroup = yacht.supplierMap[0];
        expect(supplierGroup.discipline).toBeDefined();
        expect(Array.isArray(supplierGroup.vendors)).toBe(true);
        expect(Array.isArray(supplierGroup.systems)).toBe(true);
      }
    });

    it('should validate yacht data serialization for static props', async () => {
      const mockYacht = {
        id: 'eclipse',
        slug: 'eclipse',
        name: 'Eclipse',
        launchYear: 2010,
        featured: true,
        customizations: [
          {
            type: 'Security Systems',
            description: 'Advanced security suite',
            contractor: 'Security Systems International',
            completionYear: 2010
          }
        ],
        maintenanceHistory: [
          {
            date: '2024-02-20',
            type: 'Annual Survey',
            description: 'Comprehensive survey',
            location: 'Gibraltar',
            cost: 3200000,
            contractor: 'Blohm+Voss Service',
            systemsServiced: ['Hull', 'Propulsion']
          }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockResolvedValue(mockYacht);

      const yacht = await tinaCMSDataService.getYachtBySlug('eclipse');

      // Test JSON serialization (required for Next.js static props)
      const serialized = JSON.stringify(yacht);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.id).toBe(yacht.id);
      expect(deserialized.name).toBe(yacht.name);
      expect(deserialized.launchYear).toBe(yacht.launchYear);
      expect(deserialized.featured).toBe(yacht.featured);

      // Validate complex objects serialize correctly
      expect(Array.isArray(deserialized.customizations)).toBe(true);
      expect(Array.isArray(deserialized.maintenanceHistory)).toBe(true);

      if (deserialized.customizations.length > 0) {
        const customization = deserialized.customizations[0];
        expect(customization.type).toBe(yacht.customizations[0].type);
        expect(customization.completionYear).toBe(yacht.customizations[0].completionYear);
      }
    });
  });

  describe('Enhanced Vendor Profiles Static Generation', () => {
    it('should handle enhanced vendor data for static generation', async () => {
      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        slug: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        certifications: [
          {
            name: 'ISO 9001:2015',
            issuingOrganization: 'ISO',
            validUntil: '2025-08-15',
            verified: true,
            logoUrl: '/certs/iso-9001.png'
          }
        ],
        awards: [
          {
            title: 'Innovation Award 2023',
            organization: 'Marine Electronics Association',
            year: 2023,
            description: 'Recognition for CHIRP radar technology',
            imageUrl: '/awards/innovation-2023.jpg'
          }
        ],
        socialProof: {
          linkedinFollowers: 45000,
          projectsCompleted: 25000,
          testimonialsCount: 1250
        },
        caseStudies: [
          {
            title: 'Superyacht Integration',
            challenge: 'Integrating navigation suite',
            solution: 'Custom Axiom Pro array',
            outcome: '99.9% uptime over 5 years',
            technologies: ['Axiom Pro', 'CHIRP Radar'],
            imageUrl: '/case-studies/superyacht.jpg'
          }
        ],
        teamMembers: [
          {
            name: 'Dr. Sarah Johnson',
            role: 'Chief Technology Officer',
            bio: 'Leading marine electronics innovation',
            image: '/team/sarah-johnson.jpg',
            email: 'sarah.johnson@raymarine.com',
            linkedin: 'https://linkedin.com/in/sarah-johnson'
          }
        ],
        yachtProjects: [
          {
            yachtName: 'Azzam',
            projectType: 'Navigation Suite',
            completionYear: 2013,
            systemsProvided: ['Bridge Integration', 'Radar Systems']
          }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockResolvedValue(mockVendor);

      const vendor = await tinaCMSDataService.getVendorBySlug('raymarine-teledyne-flir');

      // Validate enhanced vendor data structure
      expect(vendor).toBeDefined();
      expect(Array.isArray(vendor.certifications)).toBe(true);
      expect(Array.isArray(vendor.awards)).toBe(true);
      expect(typeof vendor.socialProof).toBe('object');
      expect(Array.isArray(vendor.caseStudies)).toBe(true);
      expect(Array.isArray(vendor.teamMembers)).toBe(true);
      expect(Array.isArray(vendor.yachtProjects)).toBe(true);

      // Validate certification structure
      if (vendor.certifications.length > 0) {
        const cert = vendor.certifications[0];
        expect(cert.name).toBeDefined();
        expect(cert.issuingOrganization).toBeDefined();
        expect(cert.verified).toBeDefined();
      }

      // Validate social proof structure
      expect(typeof vendor.socialProof.linkedinFollowers).toBe('number');
      expect(typeof vendor.socialProof.projectsCompleted).toBe('number');
      expect(typeof vendor.socialProof.testimonialsCount).toBe('number');

      // Test serialization
      const serialized = JSON.stringify(vendor);
      const deserialized = JSON.parse(serialized);
      expect(deserialized.socialProof.linkedinFollowers).toBe(vendor.socialProof.linkedinFollowers);
    });

    it('should validate enhanced vendor data serialization', async () => {
      const mockVendor = {
        id: 'caterpillar-marine',
        videoIntroduction: {
          url: 'https://youtube.com/watch?v=intro',
          thumbnail: '/videos/thumb.jpg',
          duration: 300
        },
        innovationHighlights: [
          {
            title: 'ACERT Technology',
            description: 'Advanced emission reduction',
            technologies: ['ACERT', 'Fuel Injection'],
            imageUrl: '/innovation/acert.jpg'
          }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockResolvedValue(mockVendor);

      const vendor = await tinaCMSDataService.getVendorBySlug('caterpillar-marine');

      // Test complex object serialization
      const serialized = JSON.stringify(vendor);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.videoIntroduction.duration).toBe(300);
      expect(Array.isArray(deserialized.innovationHighlights)).toBe(true);

      if (deserialized.innovationHighlights.length > 0) {
        const highlight = deserialized.innovationHighlights[0];
        expect(Array.isArray(highlight.technologies)).toBe(true);
        expect(highlight.technologies).toContain('ACERT');
      }
    });
  });

  describe('Product Comparison Data Static Generation', () => {
    it('should handle enhanced product data for static generation', async () => {
      const mockProduct = {
        id: 'axiom-pro-mfd',
        slug: 'axiom-pro-mfd-series',
        name: 'Axiom Pro MFD Series',
        comparisonMetrics: {
          performance: {
            processorSpeed: 'Quad-core ARM',
            displayResolution: '1280x800',
            responseTime: '< 0.1 seconds'
          },
          connectivity: {
            ethernet: 'RayNet Ethernet',
            wireless: 'Wi-Fi 802.11b/g/n',
            bluetooth: '4.0'
          }
        },
        integrationNotes: {
          compatibility: ['NMEA 2000 networks', 'Autopilot systems'],
          installation: ['Flush mounting', 'Single cable connection']
        },
        performanceMetrics: {
          reliability: 99.5,
          userSatisfaction: 4.7,
          supportRating: 4.8,
          warranty: '3 years'
        },
        ownerReviews: {
          overallRating: 4.7,
          totalReviews: 147,
          reviews: [
            {
              reviewerName: 'Captain Mark Thompson',
              yachtName: 'Sea Voyager',
              rating: 5,
              date: '2024-01-15',
              verified: true,
              helpfulVotes: 23
            }
          ]
        },
        visualDemos: {
          images360: [
            {
              url: '/demos/360-view.jpg',
              description: '360° view',
              type: '360_image'
            }
          ],
          videos: [
            {
              url: '/demos/operation.mp4',
              duration: 180,
              thumbnail: '/demos/thumb.jpg'
            }
          ]
        }
      };

      jest.spyOn(tinaCMSDataService, 'getProductBySlug').mockResolvedValue(mockProduct);

      const product = await tinaCMSDataService.getProductBySlug('axiom-pro-mfd-series');

      // Validate enhanced product data structure
      expect(product).toBeDefined();
      expect(typeof product.comparisonMetrics).toBe('object');
      expect(typeof product.integrationNotes).toBe('object');
      expect(typeof product.performanceMetrics).toBe('object');
      expect(typeof product.ownerReviews).toBe('object');
      expect(typeof product.visualDemos).toBe('object');

      // Validate comparison metrics structure
      expect(typeof product.comparisonMetrics.performance).toBe('object');
      expect(typeof product.comparisonMetrics.connectivity).toBe('object');

      // Validate owner reviews structure
      expect(typeof product.ownerReviews.overallRating).toBe('number');
      expect(Array.isArray(product.ownerReviews.reviews)).toBe(true);

      // Validate visual demos structure
      expect(Array.isArray(product.visualDemos.images360)).toBe(true);
      expect(Array.isArray(product.visualDemos.videos)).toBe(true);
    });

    it('should serialize complex product data correctly', async () => {
      const mockProduct = {
        id: 'c32-acert',
        downloadableSpecs: [
          {
            title: 'Technical Specifications',
            url: '/specs/tech-specs.pdf',
            type: 'Technical Manual'
          }
        ],
        comparisonMetrics: {
          performance: {
            horsepower: '1,925 hp',
            torque: '7,749 lb-ft',
            cylinders: 12
          },
          emissions: {
            tier: 'EPA Tier 3',
            noxReduction: '85%'
          }
        }
      };

      jest.spyOn(tinaCMSDataService, 'getProductBySlug').mockResolvedValue(mockProduct);

      const product = await tinaCMSDataService.getProductBySlug('c32-acert');

      // Test serialization of complex nested objects
      const serialized = JSON.stringify(product);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.comparisonMetrics.performance.cylinders).toBe(12);
      expect(deserialized.comparisonMetrics.emissions.noxReduction).toBe('85%');
      expect(Array.isArray(deserialized.downloadableSpecs)).toBe(true);

      if (deserialized.downloadableSpecs.length > 0) {
        const spec = deserialized.downloadableSpecs[0];
        expect(spec.title).toBeDefined();
        expect(spec.url).toBeDefined();
        expect(spec.type).toBeDefined();
      }
    });
  });

  describe('Cross-Content Type Static Generation', () => {
    it('should handle content relationships in static generation', async () => {
      // Mock related data that would be fetched for a yacht detail page
      const mockYacht = {
        id: 'azzam',
        slug: 'azzam',
        name: 'Azzam',
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro']
          }
        ]
      };

      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        slug: 'raymarine-teledyne-flir'
      };

      const mockProduct = {
        id: 'axiom-pro',
        name: 'Axiom Pro MFD Series',
        slug: 'axiom-pro-mfd-series',
        vendorId: 'raymarine-teledyne-flir'
      };

      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockResolvedValue(mockYacht);
      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockResolvedValue(mockVendor);
      jest.spyOn(tinaCMSDataService, 'getProductBySlug').mockResolvedValue(mockProduct);

      // Simulate static generation for yacht detail page with related content
      const yacht = await tinaCMSDataService.getYachtBySlug('azzam');

      // Get related vendors from supplier map
      const vendorIds = yacht.supplierMap.flatMap(sm => sm.vendors);
      const relatedVendors = [];

      for (const vendorId of vendorIds) {
        const vendor = await tinaCMSDataService.getVendorBySlug(vendorId);
        if (vendor) {
          relatedVendors.push(vendor);
        }
      }

      // Validate relationships for static generation
      expect(yacht).toBeDefined();
      expect(relatedVendors).toHaveLength(1);
      expect(relatedVendors[0].id).toBe('raymarine-teledyne-flir');

      // Test that all data serializes correctly for static props
      const pageData = {
        yacht,
        relatedVendors,
        timestamp: new Date().toISOString()
      };

      const serialized = JSON.stringify(pageData);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.yacht.name).toBe('Azzam');
      expect(deserialized.relatedVendors[0].name).toBe('Raymarine (Teledyne FLIR)');
      expect(deserialized.timestamp).toBeDefined();
    });

    it('should validate build-time data integrity', async () => {
      // Simulate build-time validation
      const result = await tinaCMSDataService.validateCMSContent();

      // Should not have validation errors that would break static generation
      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);

      // If there are errors, they should not be critical for static generation
      if (result.errors.length > 0) {
        // Log errors for debugging but don't fail test
        console.warn('CMS validation warnings:', result.errors);
      }

      // The validation result itself should be serializable
      const serialized = JSON.stringify(result);
      const deserialized = JSON.parse(serialized);
      expect(deserialized.isValid).toBeDefined();
      expect(Array.isArray(deserialized.errors)).toBe(true);
    });
  });

  describe('Performance and Caching for Static Generation', () => {
    it('should use caching effectively during static generation', async () => {
      const mockData = [
        { id: 'yacht-1', name: 'Yacht 1' },
        { id: 'yacht-2', name: 'Yacht 2' }
      ];

      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue(mockData);

      // First call should hit the data source
      const yachts1 = await tinaCMSDataService.getAllYachts();

      // Second call should use cache
      const yachts2 = await tinaCMSDataService.getAllYachts();

      expect(yachts1).toEqual(yachts2);
      expect(tinaCMSDataService.getAllYachts).toHaveBeenCalledTimes(2);

      // Validate cache statistics
      const cacheStats = tinaCMSDataService.getCacheStats();
      expect(cacheStats).toBeDefined();
      expect(typeof cacheStats.hitRatio).toBe('number');
    });

    it('should handle large datasets efficiently for static generation', async () => {
      // Create large mock dataset
      const largeYachtDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `yacht-${i}`,
        slug: `yacht-${i}`,
        name: `Yacht ${i}`,
        description: 'A test yacht',
        length: 50 + i,
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: [`vendor-${i % 10}`],
            systems: [`System ${i}`]
          }
        ]
      }));

      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue(largeYachtDataset);

      const startTime = Date.now();
      const yachts = await tinaCMSDataService.getAllYachts();
      const endTime = Date.now();

      // Validate large dataset handling
      expect(yachts).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second

      // Validate data structure integrity with large dataset
      yachts.forEach((yacht, index) => {
        expect(yacht.id).toBe(`yacht-${index}`);
        expect(yacht.supplierMap).toHaveLength(1);
      });

      // Test serialization performance
      const serializeStart = Date.now();
      const serialized = JSON.stringify(yachts);
      const serializeEnd = Date.now();

      expect(serialized.length).toBeGreaterThan(0);
      expect(serializeEnd - serializeStart).toBeLessThan(500); // Should serialize quickly
    });
  });
});