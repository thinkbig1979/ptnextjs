/**
 * Test Fixtures - Vendor Data
 *
 * Provides realistic vendor data for integration testing
 * with various tier levels and location configurations
 */

import { VendorLocation } from '@/lib/types';

export const mockLocationMonaco: VendorLocation = {
  id: 'loc-monaco-1',
  address: '7 Avenue de Grande Bretagne',
  city: 'Monaco',
  country: 'Monaco',
  latitude: 43.7384,
  longitude: 7.4246,
  isHQ: true,
  locationName: 'Monaco Headquarters',
};

export const mockLocationFortLauderdale: VendorLocation = {
  id: 'loc-ftl-1',
  address: '1635 SE 3rd Avenue',
  city: 'Fort Lauderdale',
  state: 'FL',
  country: 'USA',
  postalCode: '33316',
  latitude: 26.1224,
  longitude: -80.1373,
  isHQ: false,
  locationName: 'Florida Sales Office',
};

export const mockLocationNice: VendorLocation = {
  id: 'loc-nice-1',
  address: '10 Promenade des Anglais',
  city: 'Nice',
  country: 'France',
  latitude: 43.7102,
  longitude: 7.2620,
  isHQ: false,
  locationName: 'Nice Service Center',
};

export const mockLocationGenoa: VendorLocation = {
  id: 'loc-genoa-1',
  address: 'Via XX Settembre 41',
  city: 'Genoa',
  country: 'Italy',
  latitude: 44.4056,
  longitude: 8.9463,
  isHQ: false,
  locationName: 'Genoa Manufacturing',
};

// Tier 0 (Free) Vendor - No locations initially
export const mockVendorFree = {
  id: 'vendor-free-1',
  name: 'Free Tier Vendor',
  companyName: 'Free Tier Marine Supplies',
  tier: 'free' as const,
  slug: 'free-tier-vendor',
  locations: [] as VendorLocation[],
};

// Tier 1 Vendor - Single location (HQ only)
export const mockVendorTier1 = {
  id: 'vendor-tier1-1',
  name: 'Tier 1 Vendor',
  companyName: 'Standard Marine Equipment',
  tier: 'tier1' as const,
  slug: 'tier1-vendor',
  locations: [mockLocationMonaco],
};

// Tier 2 Vendor - Multiple locations
export const mockVendorTier2 = {
  id: 'vendor-tier2-1',
  name: 'Premium Marine Solutions',
  companyName: 'Premium Marine Solutions Ltd',
  tier: 'tier2' as const,
  slug: 'premium-marine-solutions',
  locations: [
    mockLocationMonaco,
    mockLocationFortLauderdale,
    mockLocationNice,
  ],
};

// Tier 3 (Enterprise) Vendor - Multiple global locations
export const mockVendorTier3 = {
  id: 'vendor-tier3-1',
  name: 'Enterprise Yachting Systems',
  companyName: 'Enterprise Yachting Systems International',
  tier: 'tier3' as const,
  slug: 'enterprise-yachting-systems',
  locations: [
    mockLocationMonaco,
    mockLocationFortLauderdale,
    mockLocationNice,
    mockLocationGenoa,
  ],
};

// Vendor with no locations (for testing empty state)
export const mockVendorNoLocations = {
  id: 'vendor-no-loc-1',
  name: 'Vendor Without Locations',
  companyName: 'No Locations Inc',
  tier: 'tier2' as const,
  slug: 'vendor-no-locations',
  locations: [],
};

// Vendor with single location (for testing single location display)
export const mockVendorSingleLocation = {
  id: 'vendor-single-loc-1',
  name: 'Single Location Vendor',
  companyName: 'Monaco Marine Services',
  tier: 'tier2' as const,
  slug: 'single-location-vendor',
  locations: [mockLocationMonaco],
};

// Helper to create a vendor with custom locations
export const createMockVendor = (
  tier: 'free' | 'tier1' | 'tier2' | 'tier3',
  locations: VendorLocation[]
) => ({
  id: `vendor-custom-${tier}`,
  name: `Custom ${tier} Vendor`,
  companyName: `Custom ${tier} Company`,
  tier,
  slug: `custom-${tier}-vendor`,
  locations,
});
