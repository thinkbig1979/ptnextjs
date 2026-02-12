/**
 * Unit tests for useNearbyVendorsByCategory hook
 *
 * Tests the custom hook for finding nearby vendors that offer products
 * in a specific category, combining location-based filtering with
 * product category matching.
 */

import { renderHook } from '@testing-library/react';
import {
  useNearbyVendorsByCategory,
  UseNearbyVendorsByCategoryOptions,
} from '@/hooks/useNearbyVendorsByCategory';
import { Vendor, Product, VendorCoordinates } from '@/lib/types';

describe('useNearbyVendorsByCategory', () => {
  // Mock coordinates
  const monacoCoords: VendorCoordinates = { latitude: 43.7384, longitude: 7.4246 };
  const niceCoords: VendorCoordinates = { latitude: 43.7102, longitude: 7.262 };
  const parisCoords: VendorCoordinates = { latitude: 48.8566, longitude: 2.3522 };
  const londonCoords: VendorCoordinates = { latitude: 51.5074, longitude: -0.1278 };

  // Mock vendors
  const mockVendors: Vendor[] = [
    {
      id: 'vendor-1',
      name: 'Monaco Marine Systems',
      description: 'Marine technology provider',
      category: [],
      featured: false,
      partner: false,
      tier: 'tier2',
      locations: [
        {
          latitude: monacoCoords.latitude,
          longitude: monacoCoords.longitude,
          isHQ: true,
          city: 'Monaco',
          country: 'Monaco',
        },
      ],
    },
    {
      id: 'vendor-2',
      name: 'Nice Navigation',
      description: 'Navigation specialists',
      category: [],
      featured: false,
      partner: false,
      tier: 'tier2',
      locations: [
        {
          latitude: niceCoords.latitude,
          longitude: niceCoords.longitude,
          isHQ: true,
          city: 'Nice',
          country: 'France',
        },
      ],
    },
    {
      id: 'vendor-3',
      name: 'Paris Safety Solutions',
      description: 'Safety equipment',
      category: [],
      featured: false,
      partner: false,
      tier: 'tier2',
      locations: [
        {
          latitude: parisCoords.latitude,
          longitude: parisCoords.longitude,
          isHQ: true,
          city: 'Paris',
          country: 'France',
        },
      ],
    },
    {
      id: 'vendor-4',
      name: 'London Marine Tech',
      description: 'Marine technology',
      category: [],
      featured: false,
      partner: false,
      tier: 'tier2',
      locations: [
        {
          latitude: londonCoords.latitude,
          longitude: londonCoords.longitude,
          isHQ: true,
          city: 'London',
          country: 'UK',
        },
      ],
    },
  ];

  // Mock products
  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'Advanced Navigation System',
      description: 'GPS and chart plotter',
      category: 'Navigation',
      vendorId: 'vendor-1',
    },
    {
      id: 'prod-2',
      name: 'Radar System',
      description: 'Marine radar',
      category: 'Navigation',
      vendorId: 'vendor-1',
    },
    {
      id: 'prod-3',
      name: 'Autopilot',
      description: 'Auto steering',
      category: 'Navigation',
      vendorId: 'vendor-2',
    },
    {
      id: 'prod-4',
      name: 'Life Raft',
      description: 'Emergency raft',
      category: 'Safety',
      vendorId: 'vendor-3',
    },
    {
      id: 'prod-5',
      name: 'Fire Suppression System',
      description: 'Fire safety',
      category: 'Safety',
      vendorId: 'vendor-3',
    },
    {
      id: 'prod-6',
      name: 'Communication Radio',
      description: 'VHF radio',
      category: 'Communication',
      vendorId: 'vendor-4',
    },
  ];

  describe('Category Filtering', () => {
    it('should return only vendors with products in the specified category', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null, // No location filter
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(2);
      expect(result.current.vendors.map((v) => v.id)).toEqual(
        expect.arrayContaining(['vendor-1', 'vendor-2'])
      );
      expect(result.current.vendors.map((v) => v.id)).not.toContain('vendor-3');
      expect(result.current.vendors.map((v) => v.id)).not.toContain('vendor-4');
    });

    it('should filter by Safety category correctly', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Safety',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-3');
      expect(result.current.vendors[0].name).toBe('Paris Safety Solutions');
    });

    it('should filter by Communication category correctly', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Communication',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-4');
    });
  });

  describe('Empty Results', () => {
    it('should return empty when no vendors match category', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'NonExistentCategory',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return empty when no products in category', () => {
      const emptyProducts: Product[] = [];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, emptyProducts, options)
      );

      expect(result.current.vendors).toHaveLength(0);
    });

    it('should return empty when all vendors are excluded', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Communication',
        excludeVendorId: 'vendor-4', // Only vendor with Communication products
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(0);
    });
  });

  describe('Location Filtering', () => {
    it('should filter by distance when location provided', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 50, // Only Monaco and Nice should be within 50km
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      // Should only include vendors within 50km of Monaco
      expect(result.current.vendors).toHaveLength(2);
      expect(result.current.vendors.map((v) => v.id)).toEqual(
        expect.arrayContaining(['vendor-1', 'vendor-2'])
      );
    });

    it('should return all category vendors when no location provided', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(2);
      // Without location, vendors should not have distance property
      expect(result.current.vendors[0].distance).toBeUndefined();
    });

    it('should exclude vendors beyond radius', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 10, // Only Monaco should be within 10km
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-1');
    });
  });

  describe('Radius Parameter', () => {
    it('should respect default radius of 500km', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        // radius not specified, should default to 500km
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      // All vendors should be included (Paris ~700km is beyond default 500km)
      expect(result.current.vendors.length).toBeGreaterThan(0);
    });

    it('should respect custom radius parameter', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 100, // Custom radius
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      // Should only include vendors within 100km
      expect(result.current.vendors).toHaveLength(2);
    });

    it('should handle very small radius (exclude all)', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 1, // 1km radius
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      // Only Monaco vendor should be included (distance = 0)
      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-1');
    });

    it('should handle very large radius (include all)', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 10000, // 10,000km radius
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      // All Navigation vendors should be included
      expect(result.current.vendors).toHaveLength(2);
    });
  });

  describe('Vendor Exclusion', () => {
    it('should exclude specified vendor ID', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        excludeVendorId: 'vendor-1',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-2');
      expect(result.current.vendors.map((v) => v.id)).not.toContain('vendor-1');
    });

    it('should work without excluding any vendor', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        // excludeVendorId not specified
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(2);
    });

    it('should exclude vendor even if closest to user location', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        excludeVendorId: 'vendor-1', // Monaco vendor (closest)
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors.map((v) => v.id)).not.toContain('vendor-1');
      expect(result.current.vendors[0].id).toBe('vendor-2'); // Nice should be first
    });
  });

  describe('productsInCategory Count', () => {
    it('should calculate correct product count per vendor', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      const vendor1 = result.current.vendors.find((v) => v.id === 'vendor-1');
      const vendor2 = result.current.vendors.find((v) => v.id === 'vendor-2');

      expect(vendor1?.productsInCategory).toBe(2); // prod-1, prod-2
      expect(vendor2?.productsInCategory).toBe(1); // prod-3
    });

    it('should count products in Safety category correctly', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Safety',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      const vendor3 = result.current.vendors.find((v) => v.id === 'vendor-3');

      expect(vendor3?.productsInCategory).toBe(2); // prod-4, prod-5
    });

    it('should handle vendors with zero products gracefully', () => {
      // This shouldn't happen in practice, but testing for robustness
      const productsWithMissingVendor: Product[] = [
        {
          id: 'prod-1',
          name: 'Test Product',
          description: 'Test',
          category: 'Navigation',
          vendorId: 'vendor-999', // Non-existent vendor
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, productsWithMissingVendor, options)
      );

      expect(result.current.vendors).toHaveLength(0);
    });

    it('should handle products with partnerId instead of vendorId', () => {
      const productsWithPartnerId: Product[] = [
        {
          id: 'prod-1',
          name: 'Partner Product',
          description: 'Test',
          category: 'Navigation',
          partnerId: 'vendor-1', // Using partnerId
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, productsWithPartnerId, options)
      );

      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-1');
      expect(result.current.vendors[0].productsInCategory).toBe(1);
    });
  });

  describe('Sorting', () => {
    it('should sort by distance ascending when location provided', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      const distances = result.current.vendors.map((v) => v.distance);

      // Distances should be in ascending order
      for (let i = 0; i < distances.length - 1; i++) {
        expect(distances[i]).toBeLessThanOrEqual(distances[i + 1]!);
      }
    });

    it('should have Monaco vendor first when searching from Monaco', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors[0].id).toBe('vendor-1');
      expect(result.current.vendors[0].distance).toBe(0);
    });

    it('should have Nice vendor first when searching from Nice', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: niceCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors[0].id).toBe('vendor-2');
      expect(result.current.vendors[0].distance).toBe(0);
    });
  });

  describe('Limiting Results', () => {
    it('should limit to maxResults (default 10)', () => {
      // Create more vendors than the limit
      const manyVendors: Vendor[] = Array.from({ length: 20 }, (_, i) => ({
        id: `vendor-${i}`,
        name: `Vendor ${i}`,
        description: 'Test vendor',
        category: [],
        featured: false,
        partner: false,
        tier: 'tier2',
        locations: [
          {
            latitude: monacoCoords.latitude,
            longitude: monacoCoords.longitude,
            isHQ: true,
            city: 'Monaco',
            country: 'Monaco',
          },
        ],
      }));

      const manyProducts: Product[] = Array.from({ length: 20 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        description: 'Test product',
        category: 'Navigation',
        vendorId: `vendor-${i}`,
      }));

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        // maxResults not specified, should default to 10
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(manyVendors, manyProducts, options)
      );

      expect(result.current.vendors).toHaveLength(10);
    });

    it('should respect custom maxResults parameter', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 1, // Only return 1 vendor
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(1);
    });

    it('should return all vendors if fewer than maxResults', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 100, // More than available vendors
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(2); // Only 2 Navigation vendors
    });

    it('should limit after distance filtering', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 1, // Limit to 1
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-1'); // Closest vendor
    });
  });

  describe('Error Handling', () => {
    it('should return error when exception occurs', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Create vendors that will cause an error (invalid data)
      const invalidVendors = null as any;

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(invalidVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in useNearbyVendorsByCategory:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle products array being null/undefined', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: null,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, null as any, options)
      );

      expect(result.current.vendors).toHaveLength(0);
      expect(result.current.error).not.toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should handle vendors without locations array', () => {
      const vendorsWithoutLocations: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'No Location Vendor',
          description: 'Test',
          category: [],
          featured: false,
          partner: false,
          tier: 'tier2',
          // No locations array
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(vendorsWithoutLocations, mockProducts, options)
      );

      // Should not crash, should exclude vendor without location
      expect(result.current.error).toBeNull();
      expect(result.current.vendors).toHaveLength(0);
    });

    it('should log warning for distance calculation errors', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const vendorsWithInvalidCoords: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'Invalid Coords Vendor',
          description: 'Test',
          category: [],
          featured: false,
          partner: false,
          tier: 'tier2',
          locations: [
            {
              latitude: undefined, // Invalid
              longitude: undefined, // Invalid
              isHQ: true,
              city: 'Test',
              country: 'Test',
            },
          ],
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(vendorsWithInvalidCoords, mockProducts, options)
      );

      // Should not crash
      expect(result.current.error).toBeNull();
      expect(result.current.vendors).toHaveLength(0);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Multi-Location Support (Tier-Based)', () => {
    it('should only consider HQ location for tier1 vendors', () => {
      const tier1Vendors: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'Tier 1 Vendor',
          description: 'Test',
          category: [],
          featured: false,
          partner: false,
          tier: 'tier1',
          locations: [
            {
              latitude: monacoCoords.latitude,
              longitude: monacoCoords.longitude,
              isHQ: true,
              city: 'Monaco',
              country: 'Monaco',
            },
            {
              latitude: niceCoords.latitude,
              longitude: niceCoords.longitude,
              isHQ: false,
              city: 'Nice',
              country: 'France',
            },
          ],
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: niceCoords, // User is in Nice
        category: 'Navigation',
        radius: 10, // Small radius
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(tier1Vendors, mockProducts, options)
      );

      // Tier1 should only see HQ (Monaco), not Nice office
      // Monaco is ~20km from Nice, so won't be in 10km radius
      expect(result.current.vendors).toHaveLength(0);
    });

    it('should only consider HQ location for free tier vendors', () => {
      const freeTierVendors: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'Free Tier Vendor',
          description: 'Test',
          category: [],
          featured: false,
          partner: false,
          tier: 'free',
          locations: [
            {
              latitude: monacoCoords.latitude,
              longitude: monacoCoords.longitude,
              isHQ: true,
              city: 'Monaco',
              country: 'Monaco',
            },
            {
              latitude: niceCoords.latitude,
              longitude: niceCoords.longitude,
              isHQ: false,
              city: 'Nice',
              country: 'France',
            },
          ],
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: niceCoords,
        category: 'Navigation',
        radius: 10,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(freeTierVendors, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(0);
    });

    it('should consider all locations for tier2 vendors', () => {
      const tier2Vendors: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'Tier 2 Vendor',
          description: 'Test',
          category: [],
          featured: false,
          partner: false,
          tier: 'tier2',
          locations: [
            {
              latitude: monacoCoords.latitude,
              longitude: monacoCoords.longitude,
              isHQ: true,
              city: 'Monaco',
              country: 'Monaco',
            },
            {
              latitude: niceCoords.latitude,
              longitude: niceCoords.longitude,
              isHQ: false,
              city: 'Nice',
              country: 'France',
            },
          ],
        },
      ];

      const tier2Products: Product[] = [
        {
          id: 'prod-1',
          name: 'Test Product',
          description: 'Test',
          category: 'Navigation',
          vendorId: 'vendor-1',
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: niceCoords,
        category: 'Navigation',
        radius: 10,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(tier2Vendors, tier2Products, options)
      );

      // Tier2 should see Nice office (distance = 0)
      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].distance).toBe(0);
      expect(result.current.vendors[0].matchedLocation?.city).toBe('Nice');
    });

    it('should select closest location for tier2+ vendors', () => {
      const tier2Vendors: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'Multi-Location Vendor',
          description: 'Test',
          category: [],
          featured: false,
          partner: false,
          tier: 'tier2',
          locations: [
            {
              latitude: monacoCoords.latitude,
              longitude: monacoCoords.longitude,
              isHQ: true,
              city: 'Monaco',
              country: 'Monaco',
            },
            {
              latitude: parisCoords.latitude,
              longitude: parisCoords.longitude,
              isHQ: false,
              city: 'Paris',
              country: 'France',
            },
          ],
        },
      ];

      const tier2Products: Product[] = [
        {
          id: 'prod-1',
          name: 'Test Product',
          description: 'Test',
          category: 'Navigation',
          vendorId: 'vendor-1',
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords, // User in Monaco
        category: 'Navigation',
        radius: 5000,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(tier2Vendors, tier2Products, options)
      );

      // Should match Monaco location (distance = 0), not Paris
      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].matchedLocation?.city).toBe('Monaco');
      expect(result.current.vendors[0].distance).toBe(0);
    });
  });

  describe('Vendors Without Locations', () => {
    it('should exclude vendors with empty locations array', () => {
      const vendorsWithoutLocations: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'No Location Vendor',
          description: 'Test',
          category: [],
          featured: false,
          partner: false,
          locations: [],
        },
      ];

      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 100,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(vendorsWithoutLocations, mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(0);
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should combine all filters: category + location + exclusion + limit', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        excludeVendorId: 'vendor-1',
        radius: 100,
        maxResults: 1,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      // Should only get vendor-2 (Nice), excluding vendor-1 (Monaco)
      expect(result.current.vendors).toHaveLength(1);
      expect(result.current.vendors[0].id).toBe('vendor-2');
      expect(result.current.vendors[0].productsInCategory).toBe(1);
    });

    it('should handle empty vendor list', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory([], mockProducts, options)
      );

      expect(result.current.vendors).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });

    it('should populate all result fields correctly', () => {
      const options: UseNearbyVendorsByCategoryOptions = {
        userLocation: monacoCoords,
        category: 'Navigation',
        radius: 500,
        maxResults: 10,
      };

      const { result } = renderHook(() =>
        useNearbyVendorsByCategory(mockVendors, mockProducts, options)
      );

      const vendor = result.current.vendors[0];

      expect(vendor.id).toBeDefined();
      expect(vendor.name).toBeDefined();
      expect(vendor.distance).toBeDefined();
      expect(vendor.matchedLocation).toBeDefined();
      expect(vendor.productsInCategory).toBeDefined();
      expect(typeof vendor.productsInCategory).toBe('number');
    });
  });
});
