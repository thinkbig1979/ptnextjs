import { describe, it, expect } from '@jest/globals';
import type {
  Yacht,
  YachtTimelineEvent,
  YachtSupplierRole,
  YachtSustainabilityMetrics,
  YachtCustomization,
  YachtMaintenanceRecord
} from '@/lib/types';

describe('Yacht Schema Types', () => {
  describe('YachtTimelineEvent', () => {
    it('should have all required fields', () => {
      const timelineEvent: YachtTimelineEvent = {
        date: '2023-06-15',
        event: 'Launch',
        category: 'launch'
      };

      expect(timelineEvent.date).toBe('2023-06-15');
      expect(timelineEvent.event).toBe('Launch');
      expect(timelineEvent.category).toBe('launch');
    });

    it('should support all category types', () => {
      const categories: YachtTimelineEvent['category'][] = [
        'launch', 'delivery', 'refit', 'milestone', 'service'
      ];

      categories.forEach(category => {
        const event: YachtTimelineEvent = {
          date: '2023-01-01',
          event: 'Test Event',
          category
        };
        expect(event.category).toBe(category);
      });
    });

    it('should support optional fields', () => {
      const timelineEvent: YachtTimelineEvent = {
        date: '2023-06-15',
        event: 'Launch',
        category: 'launch',
        description: 'Successful launch ceremony',
        location: 'Shipyard, Netherlands',
        images: ['/images/launch1.jpg', '/images/launch2.jpg']
      };

      expect(timelineEvent.description).toBe('Successful launch ceremony');
      expect(timelineEvent.location).toBe('Shipyard, Netherlands');
      expect(timelineEvent.images).toHaveLength(2);
    });
  });

  describe('YachtSupplierRole', () => {
    it('should have all required fields', () => {
      const supplierRole: YachtSupplierRole = {
        vendorId: 'vendor-123',
        vendorName: 'Marine Electronics Ltd',
        discipline: 'Electronics',
        systems: ['Navigation', 'Communication'],
        role: 'primary'
      };

      expect(supplierRole.vendorId).toBe('vendor-123');
      expect(supplierRole.vendorName).toBe('Marine Electronics Ltd');
      expect(supplierRole.discipline).toBe('Electronics');
      expect(supplierRole.systems).toEqual(['Navigation', 'Communication']);
      expect(supplierRole.role).toBe('primary');
    });

    it('should support all role types', () => {
      const roles: YachtSupplierRole['role'][] = ['primary', 'subcontractor', 'consultant'];

      roles.forEach(role => {
        const supplier: YachtSupplierRole = {
          vendorId: 'vendor-123',
          vendorName: 'Test Vendor',
          discipline: 'Test',
          systems: ['System1'],
          role
        };
        expect(supplier.role).toBe(role);
      });
    });
  });

  describe('YachtSustainabilityMetrics', () => {
    it('should support all sustainability rating levels', () => {
      const ratings: Array<'excellent' | 'good' | 'fair' | 'poor'> = [
        'excellent', 'good', 'fair', 'poor'
      ];

      ratings.forEach(rating => {
        const metrics: YachtSustainabilityMetrics = {
          wasteManagement: rating,
          waterConservation: rating,
          materialSustainability: rating
        };

        expect(metrics.wasteManagement).toBe(rating);
        expect(metrics.waterConservation).toBe(rating);
        expect(metrics.materialSustainability).toBe(rating);
      });
    });

    it('should handle numeric metrics correctly', () => {
      const metrics: YachtSustainabilityMetrics = {
        co2Emissions: 1200.5,
        energyEfficiency: 2.8,
        overallScore: 85
      };

      expect(typeof metrics.co2Emissions).toBe('number');
      expect(typeof metrics.energyEfficiency).toBe('number');
      expect(typeof metrics.overallScore).toBe('number');
      expect(metrics.overallScore).toBeGreaterThanOrEqual(0);
      expect(metrics.overallScore).toBeLessThanOrEqual(100);
    });

    it('should support certifications array', () => {
      const metrics: YachtSustainabilityMetrics = {
        certifications: ['Green Marine', 'ISO 14001', 'MARPOL Certified']
      };

      expect(Array.isArray(metrics.certifications)).toBe(true);
      expect(metrics.certifications).toHaveLength(3);
    });
  });

  describe('YachtMaintenanceRecord', () => {
    it('should support all maintenance types', () => {
      const types: YachtMaintenanceRecord['type'][] = [
        'routine', 'repair', 'upgrade', 'inspection'
      ];

      types.forEach(type => {
        const record: YachtMaintenanceRecord = {
          date: '2024-01-15',
          type,
          system: 'Engine',
          description: 'Maintenance work',
          status: 'completed'
        };
        expect(record.type).toBe(type);
      });
    });

    it('should support all status types', () => {
      const statuses: YachtMaintenanceRecord['status'][] = [
        'completed', 'in-progress', 'scheduled'
      ];

      statuses.forEach(status => {
        const record: YachtMaintenanceRecord = {
          date: '2024-01-15',
          type: 'routine',
          system: 'Engine',
          description: 'Maintenance work',
          status
        };
        expect(record.status).toBe(status);
      });
    });

    it('should handle optional fields', () => {
      const record: YachtMaintenanceRecord = {
        date: '2024-01-15',
        type: 'routine',
        system: 'Engine',
        description: 'Maintenance work',
        status: 'completed',
        vendor: 'Marine Service Co',
        cost: '$2,500',
        nextService: '2024-07-15'
      };

      expect(record.vendor).toBe('Marine Service Co');
      expect(record.cost).toBe('$2,500');
      expect(record.nextService).toBe('2024-07-15');
    });
  });

  describe('Yacht', () => {
    it('should have core required fields', () => {
      const yacht: Yacht = {
        id: 'yacht-123',
        name: 'M/Y Test Yacht',
        description: 'A luxury motor yacht'
      };

      expect(yacht.id).toBe('yacht-123');
      expect(yacht.name).toBe('M/Y Test Yacht');
      expect(yacht.description).toBe('A luxury motor yacht');
    });

    it('should support all yacht specifications', () => {
      const yacht: Yacht = {
        id: 'yacht-123',
        name: 'M/Y Test Yacht',
        description: 'A luxury motor yacht',
        length: 50.5,
        beam: 9.2,
        draft: 2.8,
        displacement: 485,
        cruisingSpeed: 12,
        maxSpeed: 16,
        range: 3500,
        guests: 12,
        crew: 8
      };

      expect(typeof yacht.length).toBe('number');
      expect(typeof yacht.beam).toBe('number');
      expect(typeof yacht.draft).toBe('number');
      expect(yacht.length).toBeGreaterThan(0);
      expect(yacht.guests).toBeGreaterThan(0);
      expect(yacht.crew).toBeGreaterThan(0);
    });

    it('should support yacht timeline integration', () => {
      const timeline: YachtTimelineEvent[] = [
        {
          date: '2023-06-15',
          event: 'Launch',
          category: 'launch'
        }
      ];

      const yacht: Yacht = {
        id: 'yacht-123',
        name: 'M/Y Test Yacht',
        description: 'A luxury motor yacht',
        timeline
      };

      expect(yacht.timeline).toBeDefined();
      expect(yacht.timeline).toHaveLength(1);
      expect(yacht.timeline?.[0].event).toBe('Launch');
    });

    it('should support supplier map integration', () => {
      const supplierMap: YachtSupplierRole[] = [
        {
          vendorId: 'vendor-123',
          vendorName: 'Marine Electronics Ltd',
          discipline: 'Electronics',
          systems: ['Navigation'],
          role: 'primary'
        }
      ];

      const yacht: Yacht = {
        id: 'yacht-123',
        name: 'M/Y Test Yacht',
        description: 'A luxury motor yacht',
        supplierMap
      };

      expect(yacht.supplierMap).toBeDefined();
      expect(yacht.supplierMap).toHaveLength(1);
      expect(yacht.supplierMap?.[0].vendorName).toBe('Marine Electronics Ltd');
    });

    it('should support sustainability metrics integration', () => {
      const sustainabilityScore: YachtSustainabilityMetrics = {
        overallScore: 85,
        co2Emissions: 1200,
        energyEfficiency: 2.5
      };

      const yacht: Yacht = {
        id: 'yacht-123',
        name: 'M/Y Test Yacht',
        description: 'A luxury motor yacht',
        sustainabilityScore
      };

      expect(yacht.sustainabilityScore).toBeDefined();
      expect(yacht.sustainabilityScore?.overallScore).toBe(85);
    });

    it('should support computed fields', () => {
      const yacht: Yacht = {
        id: 'yacht-123',
        name: 'M/Y Test Yacht',
        description: 'A luxury motor yacht',
        category: 'motor-yacht',
        tags: ['luxury', 'explorer'],
        image: '/images/yacht.jpg',
        supplierMap: [
          {
            vendorId: 'vendor-1',
            vendorName: 'Vendor 1',
            discipline: 'Electronics',
            systems: ['Nav', 'Comm'],
            role: 'primary'
          },
          {
            vendorId: 'vendor-2',
            vendorName: 'Vendor 2',
            discipline: 'Lighting',
            systems: ['Interior', 'Exterior', 'Emergency'],
            role: 'subcontractor'
          }
        ]
      };

      // These would be computed fields
      expect(yacht.categoryName).toBeUndefined(); // Would be computed from category
      expect(yacht.tagNames).toBeUndefined(); // Would be computed from tags
      expect(yacht.imageUrl).toBeUndefined(); // Would be computed from image
      expect(yacht.supplierCount).toBeUndefined(); // Would be computed as 2
      expect(yacht.totalSystems).toBeUndefined(); // Would be computed as 5 (2+3)
    });
  });

  describe('Schema Validation', () => {
    it('should enforce required fields at compile time', () => {
      // This test ensures TypeScript compilation catches missing required fields
      // If any of these fail to compile, the test will catch it

      // @ts-expect-error - Missing required fields
      const invalidYacht1: Yacht = {
        id: 'yacht-123'
        // Missing name and description
      };

      // @ts-expect-error - Missing required fields
      const invalidEvent1: YachtTimelineEvent = {
        date: '2023-01-01'
        // Missing event and category
      };

      // @ts-expect-error - Missing required fields
      const invalidSupplier1: YachtSupplierRole = {
        vendorId: 'vendor-123'
        // Missing other required fields
      };

      // Valid minimal objects
      const validYacht: Yacht = {
        id: 'yacht-123',
        name: 'Test Yacht',
        description: 'Test description'
      };

      const validEvent: YachtTimelineEvent = {
        date: '2023-01-01',
        event: 'Test Event',
        category: 'milestone'
      };

      expect(validYacht.id).toBe('yacht-123');
      expect(validEvent.event).toBe('Test Event');
    });

    it('should enforce enum constraints', () => {
      // These should compile correctly
      const validCategories: YachtTimelineEvent['category'][] = [
        'launch', 'delivery', 'refit', 'milestone', 'service'
      ];

      const validRoles: YachtSupplierRole['role'][] = [
        'primary', 'subcontractor', 'consultant'
      ];

      expect(validCategories).toHaveLength(5);
      expect(validRoles).toHaveLength(3);

      // @ts-expect-error - Invalid category
      const invalidCategory: YachtTimelineEvent['category'] = 'invalid';

      // @ts-expect-error - Invalid role
      const invalidRole: YachtSupplierRole['role'] = 'invalid';
    });
  });
});