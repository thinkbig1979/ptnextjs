/**
 * Integration Tests - Enhanced Fields
 * Tests enhanced field functionality across Vendors and Products
 */

const createMockPayload = () => {
  const mockData = { vendors: [], products: [], yachts: [] } as any;

  return {
    create: jest.fn(async ({ collection, data }: any) => {
      const doc = { id: collection + '_' + Date.now(), ...data };
      mockData[collection].push(doc);
      return doc;
    }),
    findByID: jest.fn(async ({ collection, id }: any) => {
      return mockData[collection].find((d: any) => d.id === id);
    }),
  };
};

describe('Integration - Enhanced Fields Tests', () => {
  let payload: any;

  beforeEach(() => {
    payload = createMockPayload();
  });

  describe('Vendor Enhanced Fields', () => {
    it('should store certifications array', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'CertVendor',
          tier: 'tier1',
          certifications: [
            { name: 'ISO 9001', issuer: 'ISO', year: 2023 },
          ],
        },
      });

      expect(vendor.certifications).toHaveLength(1);
      expect(vendor.certifications[0].name).toBe('ISO 9001');
    });

    it('should store awards array', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'AwardVendor',
          tier: 'tier1',
          awards: [
            { title: 'Best Innovation', organization: 'Tech Awards', year: 2023 },
          ],
        },
      });

      expect(vendor.awards).toHaveLength(1);
      expect(vendor.awards[0].title).toBe('Best Innovation');
    });

    it('should store social proof metrics', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'MetricsVendor',
          tier: 'tier1',
          totalProjects: 150,
          yearsInBusiness: 25,
          employeeCount: 50,
          clientSatisfactionScore: 9.2,
        },
      });

      expect(vendor.totalProjects).toBe(150);
      expect(vendor.clientSatisfactionScore).toBe(9.2);
    });

    it('should store team members array', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'TeamVendor',
          tier: 'tier1',
          teamMembers: [
            { name: 'John Doe', role: 'CEO', displayOrder: 0 },
            { name: 'Jane Smith', role: 'CTO', displayOrder: 1 },
          ],
        },
      });

      expect(vendor.teamMembers).toHaveLength(2);
      expect(vendor.teamMembers[0].name).toBe('John Doe');
    });
  });

  describe('Product Enhanced Fields', () => {
    it('should store comparison metrics', async () => {
      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'GPS Pro',
          comparisonMetrics: [
            { metricName: 'Range', value: '50nm', numericValue: 50, unit: 'nm' },
          ],
        },
      });

      expect(product.comparisonMetrics).toHaveLength(1);
      expect(product.comparisonMetrics[0].metricName).toBe('Range');
    });

    it('should store owner reviews', async () => {
      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Radar X1',
          ownerReviews: [
            {
              reviewerName: 'Captain Jack',
              reviewerRole: 'Captain',
              overallRating: 5,
              verified: true,
            },
          ],
        },
      });

      expect(product.ownerReviews).toHaveLength(1);
      expect(product.ownerReviews[0].overallRating).toBe(5);
    });

    it('should store integration compatibility', async () => {
      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Nav System',
          integrationCompatibility: {
            supportedProtocols: [
              { protocol: 'NMEA 2000', version: '1.0' },
            ],
            apiAvailable: true,
          },
        },
      });

      expect(product.integrationCompatibility.apiAvailable).toBe(true);
      expect(product.integrationCompatibility.supportedProtocols).toHaveLength(1);
    });

    it('should store visual demo content', async () => {
      const product = await payload.create({
        collection: 'products',
        data: {
          name: 'Demo Product',
          visualDemoContent: {
            model3d: {
              modelUrl: 'https://example.com/model.glb',
              allowDownload: true,
            },
          },
        },
      });

      expect(product.visualDemoContent.model3d.allowDownload).toBe(true);
    });
  });

  describe('Yacht Enhanced Fields', () => {
    it('should store timeline events', async () => {
      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Timeline Yacht',
          launchYear: 2023,
          timeline: [
            { date: '2023-01-01', title: 'Design Started', category: 'design' },
            { date: '2023-06-01', title: 'Construction Began', category: 'construction' },
          ],
        },
      });

      const found = await payload.findByID({ collection: 'yachts', id: yacht.id });
      expect(found.timeline).toHaveLength(2);
    });

    it('should store sustainability metrics', async () => {
      const yacht = await payload.create({
        collection: 'yachts',
        data: {
          name: 'Green Yacht',
          launchYear: 2023,
          hybridPropulsion: true,
          solarPanelCapacityKw: 50,
          batteryStorageKwh: 200,
          energyEfficiencyRating: 'a_plus',
        },
      });

      expect(yacht.hybridPropulsion).toBe(true);
      expect(yacht.solarPanelCapacityKw).toBe(50);
    });
  });
});
