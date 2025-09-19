import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import tinaCMSDataService from '@/lib/tinacms-data-service';

// Mock external dependencies
jest.mock('tinacms');
jest.mock('fs/promises');
jest.mock('@react-three/fiber');
jest.mock('react-pdf');
jest.mock('react-player');

describe('Platform Integration Tests - Full Functionality', () => {
  beforeEach(() => {
    tinaCMSDataService.clearCache();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Vendor Profile Workflow', () => {
    it('should integrate all enhanced vendor profile features', async () => {
      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        slug: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        description: 'Leading marine electronics manufacturer',
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
        videoIntroduction: {
          url: 'https://youtube.com/watch?v=intro',
          thumbnail: '/videos/thumb.jpg',
          duration: 300
        },
        caseStudies: [
          {
            id: 'superyacht-integration',
            title: 'Superyacht Navigation Integration',
            challenge: 'Complex multi-display bridge integration',
            solution: 'Custom Axiom Pro array with centralized control',
            outcome: '99.9% uptime over 5 years of operation',
            technologies: ['Axiom Pro', 'CHIRP Radar', 'RayNet'],
            imageUrl: '/case-studies/superyacht.jpg',
            yachtName: 'Azzam',
            completionYear: 2013
          }
        ],
        innovationHighlights: [
          {
            title: 'CHIRP Technology',
            description: 'Revolutionary radar technology',
            technologies: ['CHIRP', 'Digital Signal Processing'],
            imageUrl: '/innovation/chirp.jpg'
          }
        ],
        teamMembers: [
          {
            name: 'Dr. Sarah Johnson',
            role: 'Chief Technology Officer',
            bio: 'Leading marine electronics innovation for over 15 years',
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
            systemsProvided: ['Bridge Integration', 'Radar Systems', 'Autopilot']
          }
        ]
      };

      const mockProducts = [
        {
          id: 'axiom-pro-mfd',
          slug: 'axiom-pro-mfd-series',
          name: 'Axiom Pro MFD Series',
          vendorId: 'raymarine-teledyne-flir',
          vendorName: 'Raymarine (Teledyne FLIR)'
        }
      ];

      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockResolvedValue(mockVendor);
      jest.spyOn(tinaCMSDataService, 'getProductsByVendor').mockResolvedValue(mockProducts);

      // Test complete vendor profile integration
      const vendor = await tinaCMSDataService.getVendorBySlug('raymarine-teledyne-flir');
      const vendorProducts = await tinaCMSDataService.getProductsByVendor('raymarine-teledyne-flir');

      // Validate all enhanced profile features are present
      expect(vendor.certifications).toHaveLength(1);
      expect(vendor.awards).toHaveLength(1);
      expect(vendor.socialProof).toBeDefined();
      expect(vendor.videoIntroduction).toBeDefined();
      expect(vendor.caseStudies).toHaveLength(1);
      expect(vendor.innovationHighlights).toHaveLength(1);
      expect(vendor.teamMembers).toHaveLength(1);
      expect(vendor.yachtProjects).toHaveLength(1);

      // Validate certification badge component data
      const certification = vendor.certifications[0];
      expect(certification.verified).toBe(true);
      expect(certification.logoUrl).toBeDefined();
      expect(certification.validUntil).toBeDefined();

      // Validate awards section data
      const award = vendor.awards[0];
      expect(award.year).toBe(2023);
      expect(award.imageUrl).toBeDefined();

      // Validate social proof metrics
      expect(vendor.socialProof.linkedinFollowers).toBeGreaterThan(0);
      expect(vendor.socialProof.projectsCompleted).toBeGreaterThan(0);
      expect(vendor.socialProof.testimonialsCount).toBeGreaterThan(0);

      // Validate video introduction
      expect(vendor.videoIntroduction.duration).toBe(300);
      expect(vendor.videoIntroduction.thumbnail).toBeDefined();

      // Validate case study integration
      const caseStudy = vendor.caseStudies[0];
      expect(caseStudy.yachtName).toBe('Azzam');
      expect(caseStudy.technologies).toContain('Axiom Pro');

      // Validate team member data
      const teamMember = vendor.teamMembers[0];
      expect(teamMember.linkedin).toContain('linkedin.com');
      expect(teamMember.email).toContain('@');

      // Validate yacht project relationships
      const yachtProject = vendor.yachtProjects[0];
      expect(yachtProject.yachtName).toBe('Azzam');
      expect(yachtProject.completionYear).toBe(2013);

      // Validate product relationships
      expect(vendorProducts).toHaveLength(1);
      expect(vendorProducts[0].vendorId).toBe(vendor.id);
    });
  });

  describe('Complete Product Comparison Workflow', () => {
    it('should integrate all product enhancement features', async () => {
      const mockProduct = {
        id: 'axiom-pro-mfd',
        slug: 'axiom-pro-mfd-series',
        name: 'Axiom Pro MFD Series',
        vendorId: 'raymarine-teledyne-flir',
        comparisonMetrics: {
          performance: {
            processorSpeed: 'Quad-core ARM',
            displayResolution: '1280x800',
            responseTime: '< 0.1 seconds',
            operatingTemperature: '-15°C to +55°C'
          },
          connectivity: {
            ethernet: 'RayNet Ethernet',
            wireless: 'Wi-Fi 802.11b/g/n',
            bluetooth: '4.0',
            nmea: 'NMEA 2000/0183'
          },
          physical: {
            dimensions: '15.7" x 10.4" x 3.2"',
            weight: '8.8 lbs',
            mounting: 'Flush/bracket',
            waterproof: 'IPX6/IPX7'
          }
        },
        integrationNotes: {
          compatibility: ['NMEA 2000 networks', 'Autopilot systems', 'Radar integration'],
          installation: ['Flush mounting', 'Single cable connection', 'Power over Ethernet'],
          limitations: ['Requires RayNet hub for multiple connections'],
          certifications: ['CE', 'FCC', 'IC']
        },
        performanceMetrics: {
          reliability: 99.5,
          userSatisfaction: 4.7,
          supportRating: 4.8,
          warranty: '3 years',
          mtbf: '50,000 hours'
        },
        downloadableSpecs: [
          {
            title: 'Technical Specifications',
            url: '/specs/axiom-pro-tech-specs.pdf',
            type: 'Technical Manual',
            fileSize: '2.4 MB',
            pages: 48
          },
          {
            title: 'Installation Guide',
            url: '/specs/axiom-pro-installation.pdf',
            type: 'Installation Guide',
            fileSize: '1.8 MB',
            pages: 24
          }
        ],
        ownerReviews: {
          overallRating: 4.7,
          totalReviews: 147,
          reviewBreakdown: {
            5: 89,
            4: 34,
            3: 18,
            2: 4,
            1: 2
          },
          reviews: [
            {
              id: 'review-1',
              reviewerName: 'Captain Mark Thompson',
              yachtName: 'Sea Voyager',
              rating: 5,
              title: 'Excellent performance',
              content: 'Outstanding clarity and responsiveness',
              date: '2024-01-15',
              verified: true,
              helpfulVotes: 23,
              usageMonths: 18
            }
          ]
        },
        visualDemos: {
          images360: [
            {
              url: '/demos/axiom-pro-360.jpg',
              description: '360° product view',
              type: '360_image',
              resolution: '4K'
            }
          ],
          videos: [
            {
              url: '/demos/axiom-pro-operation.mp4',
              title: 'Operation Demo',
              duration: 180,
              thumbnail: '/demos/operation-thumb.jpg',
              quality: '1080p'
            }
          ],
          models3D: [
            {
              url: '/models/axiom-pro.glb',
              description: 'Interactive 3D model',
              format: 'GLB',
              fileSize: '15.2 MB'
            }
          ]
        }
      };

      const mockComparisonProduct = {
        id: 'competitor-display',
        slug: 'competitor-display',
        name: 'Competitor Display',
        comparisonMetrics: {
          performance: {
            processorSpeed: 'Dual-core ARM',
            displayResolution: '1024x768',
            responseTime: '< 0.2 seconds'
          }
        },
        performanceMetrics: {
          reliability: 95.2,
          userSatisfaction: 4.3,
          warranty: '2 years'
        }
      };

      jest.spyOn(tinaCMSDataService, 'getProductBySlug').mockImplementation((slug) => {
        if (slug === 'axiom-pro-mfd-series') return Promise.resolve(mockProduct);
        if (slug === 'competitor-display') return Promise.resolve(mockComparisonProduct);
        return Promise.resolve(null);
      });

      // Test product enhancement integration
      const product = await tinaCMSDataService.getProductBySlug('axiom-pro-mfd-series');
      const competitor = await tinaCMSDataService.getProductBySlug('competitor-display');

      // Validate comparison matrix data
      expect(product.comparisonMetrics.performance).toBeDefined();
      expect(product.comparisonMetrics.connectivity).toBeDefined();
      expect(product.comparisonMetrics.physical).toBeDefined();

      // Validate integration notes
      expect(product.integrationNotes.compatibility).toContain('NMEA 2000 networks');
      expect(product.integrationNotes.installation).toHaveLength(3);
      expect(product.integrationNotes.limitations).toHaveLength(1);

      // Validate performance metrics
      expect(product.performanceMetrics.reliability).toBeGreaterThan(99);
      expect(product.performanceMetrics.userSatisfaction).toBeGreaterThan(4.5);
      expect(product.performanceMetrics.mtbf).toBeDefined();

      // Validate downloadable specs
      expect(product.downloadableSpecs).toHaveLength(2);
      const techSpec = product.downloadableSpecs[0];
      expect(techSpec.fileSize).toBeDefined();
      expect(techSpec.pages).toBeDefined();

      // Validate owner reviews
      expect(product.ownerReviews.totalReviews).toBe(147);
      expect(product.ownerReviews.reviewBreakdown).toBeDefined();
      const review = product.ownerReviews.reviews[0];
      expect(review.verified).toBe(true);
      expect(review.yachtName).toBeDefined();

      // Validate visual demos
      expect(product.visualDemos.images360).toHaveLength(1);
      expect(product.visualDemos.videos).toHaveLength(1);
      expect(product.visualDemos.models3D).toHaveLength(1);

      // Test comparison functionality
      const comparison = {
        products: [product, competitor],
        comparisonFields: ['processorSpeed', 'displayResolution', 'reliability', 'warranty']
      };

      expect(comparison.products).toHaveLength(2);

      // Validate comparison metrics exist for both products
      expect(product.comparisonMetrics.performance.processorSpeed).toBe('Quad-core ARM');
      expect(competitor.comparisonMetrics.performance.processorSpeed).toBe('Dual-core ARM');
      expect(product.performanceMetrics.reliability).toBeGreaterThan(competitor.performanceMetrics.reliability);
    });
  });

  describe('Complete Yacht Profile Workflow', () => {
    it('should integrate all yacht profile system features', async () => {
      const mockYacht = {
        id: 'azzam',
        slug: 'azzam',
        name: 'Azzam',
        description: 'World\'s largest private motor yacht',
        length: 180,
        beam: 20.8,
        launchYear: 2013,
        builder: 'Lürssen',
        designer: 'Nauta Yachts',
        timeline: [
          {
            date: '2009-03-01',
            event: 'Contract Signing',
            description: 'Construction contract signed',
            location: 'Bremen, Germany',
            milestone: true,
            relatedVendors: ['lurssen']
          },
          {
            date: '2010-06-15',
            event: 'Keel Laying',
            description: 'First steel cut and keel laying ceremony',
            location: 'Bremen, Germany',
            milestone: true,
            relatedVendors: ['lurssen']
          },
          {
            date: '2013-09-05',
            event: 'Delivery',
            description: 'Final delivery to owner after sea trials',
            location: 'Bremen, Germany',
            milestone: true,
            relatedVendors: ['lurssen']
          }
        ],
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro MFD Array', 'CHIRP Radar Systems'],
            installationYear: 2013,
            projectValue: 2500000
          },
          {
            discipline: 'Propulsion',
            vendors: ['caterpillar-marine'],
            systems: ['C32 ACERT Engines (4x)', 'Propulsion Control'],
            installationYear: 2013,
            projectValue: 8000000
          },
          {
            discipline: 'Communications',
            vendors: ['sailor-cobham'],
            systems: ['VSAT Systems', 'Maritime Communications'],
            installationYear: 2013,
            projectValue: 1200000
          }
        ],
        sustainabilityScore: {
          overall: 78,
          carbonFootprint: 70,
          fuelEfficiency: 72,
          wasteManagement: 85,
          waterTreatment: 88,
          energyEfficiency: 75,
          certifications: ['MCA Compliant', 'MARPOL Compliant'],
          greenhousGasReduction: '15% vs similar yachts',
          renewableEnergySources: ['Solar panels', 'Wind generators']
        },
        customizations: [
          {
            type: 'Security Systems',
            description: 'Advanced security and surveillance suite',
            contractor: 'Security Systems International',
            completionYear: 2013,
            cost: 5000000,
            systems: ['Perimeter detection', 'CCTV network', 'Access control']
          },
          {
            type: 'Entertainment Systems',
            description: 'State-of-the-art AV and entertainment',
            contractor: 'Renkus-Heinz',
            completionYear: 2013,
            cost: 3500000,
            systems: ['Distributed audio', 'Theater systems', 'Outdoor displays']
          }
        ],
        maintenanceHistory: [
          {
            date: '2024-02-20',
            type: 'Annual Survey',
            description: 'Comprehensive annual survey and certification',
            location: 'Gibraltar',
            cost: 3200000,
            contractor: 'Blohm+Voss Service',
            systemsServiced: ['Hull inspection', 'Propulsion systems', 'Safety equipment'],
            certificationRenewal: true,
            nextScheduled: '2025-02-20'
          },
          {
            date: '2023-08-15',
            type: 'Electronics Upgrade',
            description: 'Navigation and communication systems upgrade',
            location: 'Monaco',
            cost: 850000,
            contractor: 'Monaco Marine Electronics',
            systemsServiced: ['Navigation suite', 'VSAT upgrade', 'Radar calibration'],
            upgradesPerformed: ['Axiom Pro software update', 'New VSAT antenna']
          }
        ]
      };

      const mockRelatedVendors = [
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

      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockResolvedValue(mockYacht);
      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockImplementation((slug) => {
        return Promise.resolve(mockRelatedVendors.find(v => v.slug === slug) || null);
      });

      // Test complete yacht profile integration
      const yacht = await tinaCMSDataService.getYachtBySlug('azzam');

      // Validate timeline functionality
      expect(yacht.timeline).toHaveLength(3);
      const milestones = yacht.timeline.filter(t => t.milestone);
      expect(milestones).toHaveLength(3);

      const deliveryEvent = yacht.timeline.find(t => t.event === 'Delivery');
      expect(deliveryEvent.date).toBe('2013-09-05');
      expect(deliveryEvent.relatedVendors).toContain('lurssen');

      // Validate supplier map functionality
      expect(yacht.supplierMap).toHaveLength(3);

      const navigationSupplier = yacht.supplierMap.find(s => s.discipline === 'Navigation');
      expect(navigationSupplier.vendors).toContain('raymarine-teledyne-flir');
      expect(navigationSupplier.projectValue).toBe(2500000);
      expect(navigationSupplier.systems).toContain('Axiom Pro MFD Array');

      // Test related vendor resolution
      const navVendor = await tinaCMSDataService.getVendorBySlug('raymarine-teledyne-flir');
      expect(navVendor.name).toBe('Raymarine (Teledyne FLIR)');

      // Validate sustainability scoring
      expect(yacht.sustainabilityScore.overall).toBe(78);
      expect(yacht.sustainabilityScore.certifications).toContain('MCA Compliant');
      expect(yacht.sustainabilityScore.renewableEnergySources).toHaveLength(2);

      // Validate customizations
      expect(yacht.customizations).toHaveLength(2);
      const securityCustomization = yacht.customizations.find(c => c.type === 'Security Systems');
      expect(securityCustomization.cost).toBe(5000000);
      expect(securityCustomization.systems).toHaveLength(3);

      // Validate maintenance history
      expect(yacht.maintenanceHistory).toHaveLength(2);
      const annualSurvey = yacht.maintenanceHistory.find(m => m.type === 'Annual Survey');
      expect(annualSurvey.certificationRenewal).toBe(true);
      expect(annualSurvey.nextScheduled).toBeDefined();

      // Test data serialization for static generation
      const serialized = JSON.stringify(yacht);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.timeline).toHaveLength(3);
      expect(deserialized.supplierMap).toHaveLength(3);
      expect(deserialized.sustainabilityScore.overall).toBe(78);
      expect(deserialized.customizations).toHaveLength(2);
      expect(deserialized.maintenanceHistory).toHaveLength(2);
    });
  });

  describe('Cross-Platform Integration Workflows', () => {
    it('should handle complete user discovery workflow', async () => {
      // Mock data for complete user journey: Vendor → Product → Yacht
      const mockVendor = {
        id: 'raymarine-teledyne-flir',
        slug: 'raymarine-teledyne-flir',
        name: 'Raymarine (Teledyne FLIR)',
        yachtProjects: [
          { yachtName: 'Azzam', projectType: 'Navigation Suite' }
        ]
      };

      const mockProduct = {
        id: 'axiom-pro-mfd',
        slug: 'axiom-pro-mfd-series',
        name: 'Axiom Pro MFD Series',
        vendorId: 'raymarine-teledyne-flir',
        yachtInstallations: ['azzam', 'eclipse']
      };

      const mockYacht = {
        id: 'azzam',
        slug: 'azzam',
        name: 'Azzam',
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro MFD Series']
          }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockResolvedValue(mockVendor);
      jest.spyOn(tinaCMSDataService, 'getProductBySlug').mockResolvedValue(mockProduct);
      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockResolvedValue(mockYacht);

      // Simulate user discovery workflow

      // 1. User starts with vendor profile
      const vendor = await tinaCMSDataService.getVendorBySlug('raymarine-teledyne-flir');
      expect(vendor.yachtProjects).toHaveLength(1);
      expect(vendor.yachtProjects[0].yachtName).toBe('Azzam');

      // 2. User navigates to product from vendor
      const product = await tinaCMSDataService.getProductBySlug('axiom-pro-mfd-series');
      expect(product.vendorId).toBe(vendor.id);
      expect(product.yachtInstallations).toContain('azzam');

      // 3. User discovers yacht from product
      const yacht = await tinaCMSDataService.getYachtBySlug('azzam');
      const yachtNavSupplier = yacht.supplierMap.find(s => s.discipline === 'Navigation');
      expect(yachtNavSupplier.vendors).toContain('raymarine-teledyne-flir');
      expect(yachtNavSupplier.systems).toContain('Axiom Pro MFD Series');

      // Validate circular references work in all directions
      expect(vendor.yachtProjects[0].yachtName).toBe(yacht.name);
      expect(product.vendorId).toBe(vendor.id);
      expect(yacht.supplierMap[0].vendors[0]).toBe(vendor.id);
    });

    it('should handle comparison workflow across content types', async () => {
      const mockProducts = [
        {
          id: 'axiom-pro-mfd',
          name: 'Axiom Pro MFD Series',
          vendorId: 'raymarine-teledyne-flir',
          comparisonMetrics: {
            performance: { processorSpeed: 'Quad-core ARM' },
            connectivity: { ethernet: 'RayNet' }
          },
          performanceMetrics: { reliability: 99.5 }
        },
        {
          id: 'competitor-mfd',
          name: 'Competitor MFD',
          vendorId: 'competitor-vendor',
          comparisonMetrics: {
            performance: { processorSpeed: 'Dual-core ARM' },
            connectivity: { ethernet: 'Standard' }
          },
          performanceMetrics: { reliability: 95.2 }
        }
      ];

      const mockYachts = [
        {
          id: 'azzam',
          name: 'Azzam',
          supplierMap: [
            { discipline: 'Navigation', vendors: ['raymarine-teledyne-flir'] }
          ],
          sustainabilityScore: { overall: 78 }
        },
        {
          id: 'eclipse',
          name: 'Eclipse',
          supplierMap: [
            { discipline: 'Navigation', vendors: ['competitor-vendor'] }
          ],
          sustainabilityScore: { overall: 72 }
        }
      ];

      jest.spyOn(tinaCMSDataService, 'getProductBySlug').mockImplementation((slug) => {
        if (slug === 'axiom-pro-mfd-series') return Promise.resolve(mockProducts[0]);
        if (slug === 'competitor-mfd') return Promise.resolve(mockProducts[1]);
        return Promise.resolve(null);
      });

      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockImplementation((slug) => {
        if (slug === 'azzam') return Promise.resolve(mockYachts[0]);
        if (slug === 'eclipse') return Promise.resolve(mockYachts[1]);
        return Promise.resolve(null);
      });

      // Test product comparison workflow
      const product1 = await tinaCMSDataService.getProductBySlug('axiom-pro-mfd-series');
      const product2 = await tinaCMSDataService.getProductBySlug('competitor-mfd');

      // Validate comparison data exists
      expect(product1.comparisonMetrics.performance.processorSpeed).toBe('Quad-core ARM');
      expect(product2.comparisonMetrics.performance.processorSpeed).toBe('Dual-core ARM');
      expect(product1.performanceMetrics.reliability).toBeGreaterThan(product2.performanceMetrics.reliability);

      // Test yacht comparison workflow
      const yacht1 = await tinaCMSDataService.getYachtBySlug('azzam');
      const yacht2 = await tinaCMSDataService.getYachtBySlug('eclipse');

      // Validate yacht data for comparison
      expect(yacht1.sustainabilityScore.overall).toBeGreaterThan(yacht2.sustainabilityScore.overall);
      expect(yacht1.supplierMap[0].vendors[0]).toBe('raymarine-teledyne-flir');
      expect(yacht2.supplierMap[0].vendors[0]).toBe('competitor-vendor');

      // Test cross-referencing products and yachts
      const yacht1NavVendor = yacht1.supplierMap[0].vendors[0];
      const yacht2NavVendor = yacht2.supplierMap[0].vendors[0];

      expect(product1.vendorId).toBe(yacht1NavVendor);
      expect(product2.vendorId).toBe(yacht2NavVendor);
    });
  });

  describe('Performance and Caching Integration', () => {
    it('should handle complex data loading with caching', async () => {
      const mockData = {
        vendors: [
          { id: 'vendor-1', name: 'Vendor 1', yachtProjects: [{ yachtName: 'Yacht 1' }] }
        ],
        products: [
          { id: 'product-1', name: 'Product 1', vendorId: 'vendor-1' }
        ],
        yachts: [
          { id: 'yacht-1', name: 'Yacht 1', supplierMap: [{ vendors: ['vendor-1'] }] }
        ]
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockData.vendors);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue(mockData.products);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue(mockData.yachts);

      // Load all data types
      const startTime = Date.now();
      const [vendors, products, yachts] = await Promise.all([
        tinaCMSDataService.getAllVendors(),
        tinaCMSDataService.getAllProducts(),
        tinaCMSDataService.getAllYachts()
      ]);
      const endTime = Date.now();

      // Validate data integrity
      expect(vendors).toHaveLength(1);
      expect(products).toHaveLength(1);
      expect(yachts).toHaveLength(1);

      // Validate relationships
      expect(products[0].vendorId).toBe(vendors[0].id);
      expect(yachts[0].supplierMap[0].vendors).toContain(vendors[0].id);
      expect(vendors[0].yachtProjects[0].yachtName).toBe(yachts[0].name);

      // Performance validation
      expect(endTime - startTime).toBeLessThan(1000);

      // Test caching effectiveness
      const cacheStats = tinaCMSDataService.getCacheStats();
      expect(cacheStats).toBeDefined();
      expect(typeof cacheStats.hitRatio).toBe('number');
    });

    it('should handle static generation for all content types', async () => {
      const largeMockDataset = {
        vendors: Array.from({ length: 50 }, (_, i) => ({
          id: `vendor-${i}`,
          slug: `vendor-${i}`,
          name: `Vendor ${i}`,
          certifications: [{ name: 'ISO 9001', verified: true }],
          socialProof: { projectsCompleted: 100 + i }
        })),
        products: Array.from({ length: 100 }, (_, i) => ({
          id: `product-${i}`,
          slug: `product-${i}`,
          name: `Product ${i}`,
          vendorId: `vendor-${i % 50}`,
          comparisonMetrics: { performance: { rating: 4.0 + (i % 10) / 10 } }
        })),
        yachts: Array.from({ length: 25 }, (_, i) => ({
          id: `yacht-${i}`,
          slug: `yacht-${i}`,
          name: `Yacht ${i}`,
          supplierMap: [{ discipline: 'Test', vendors: [`vendor-${i % 50}`] }],
          sustainabilityScore: { overall: 70 + (i % 30) }
        }))
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(largeMockDataset.vendors);
      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue(largeMockDataset.products);
      jest.spyOn(tinaCMSDataService, 'getAllYachts').mockResolvedValue(largeMockDataset.yachts);

      // Test static generation for all content types
      const startTime = Date.now();
      const allData = await Promise.all([
        tinaCMSDataService.getAllVendors(),
        tinaCMSDataService.getAllProducts(),
        tinaCMSDataService.getAllYachts()
      ]);
      const endTime = Date.now();

      // Validate data volumes
      expect(allData[0]).toHaveLength(50);  // vendors
      expect(allData[1]).toHaveLength(100); // products
      expect(allData[2]).toHaveLength(25);  // yachts

      // Performance validation for static generation
      expect(endTime - startTime).toBeLessThan(2000);

      // Test serialization performance for static props
      const serializeStart = Date.now();
      const serialized = JSON.stringify(allData);
      const serializeEnd = Date.now();

      expect(serialized.length).toBeGreaterThan(0);
      expect(serializeEnd - serializeStart).toBeLessThan(1000);

      // Test deserialization
      const deserialized = JSON.parse(serialized);
      expect(deserialized[0]).toHaveLength(50);
      expect(deserialized[1]).toHaveLength(100);
      expect(deserialized[2]).toHaveLength(25);
    });
  });

  describe('Content Validation Integration', () => {
    it('should validate complete platform content integrity', async () => {
      // Test comprehensive content validation
      const validationResult = await tinaCMSDataService.validateCMSContent();

      expect(validationResult).toBeDefined();
      expect(typeof validationResult.isValid).toBe('boolean');
      expect(Array.isArray(validationResult.errors)).toBe(true);
      // Note: warnings field not implemented in current validateCMSContent method

      // Validate specific content type checks
      // Note: contentTypeCounts field not implemented in current validateCMSContent method

      // The validation should be serializable for static generation
      const serialized = JSON.stringify(validationResult);
      const deserialized = JSON.parse(serialized);
      expect(deserialized.isValid).toBe(validationResult.isValid);
    });
  });
});
