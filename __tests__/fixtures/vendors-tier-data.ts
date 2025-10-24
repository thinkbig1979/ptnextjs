/**
 * Mock vendor data fixtures for tier structure testing
 * Provides sample vendors for all 4 tier levels
 */

import type { Vendor } from '@/lib/types';

export const mockFreeTierVendor: Partial<Vendor> = {
  id: 'vendor-free-1',
  companyName: 'Free Tier Marine Services',
  slug: 'free-tier-marine',
  tier: 'free',
  email: 'contact@freetier.com',
  phone: '+1-555-0100',
  website: 'https://freetier.com',
  description: 'Basic marine services provider',
  published: true,
  featured: false,
  // Free tier only gets basic fields
  // No foundedYear, no certifications, no advanced features
};

export const mockTier1Vendor: Partial<Vendor> = {
  id: 'vendor-tier1-1',
  companyName: 'Tier 1 Yacht Solutions',
  slug: 'tier1-yacht-solutions',
  tier: 'tier1',
  email: 'contact@tier1yacht.com',
  phone: '+1-555-0101',
  website: 'https://tier1yacht.com',
  description: 'Premium yacht solutions provider',
  published: true,
  featured: false,

  // Tier 1+ fields
  foundedYear: 2010,
  totalProjects: 150,
  employeeCount: 25,
  linkedinFollowers: 5000,
  instagramFollowers: 3000,
  clientSatisfactionScore: 92,

  // Arrays (Tier 1+)
  certifications: [
    {
      id: 'cert-1',
      name: 'ISO 9001:2015',
      issuingOrganization: 'International Organization for Standardization',
      dateObtained: '2020-06-15',
      expiryDate: '2023-06-15',
      credentialId: 'ISO-9001-2020-12345',
      credentialUrl: 'https://iso.org/verify/12345',
    },
    {
      id: 'cert-2',
      name: 'Marine Industry Certification',
      issuingOrganization: 'Marine Trade Association',
      dateObtained: '2019-03-20',
      credentialId: 'MTA-2019-67890',
    },
  ],

  awards: [
    {
      id: 'award-1',
      title: 'Best Marine Service Provider 2022',
      awardingOrganization: 'Yachting Excellence Awards',
      dateReceived: '2022-11-10',
      description: 'Recognized for outstanding service quality',
    },
  ],

  videoIntroduction: {
    url: 'https://vimeo.com/123456789',
    thumbnail: 'https://example.com/video-thumb.jpg',
    duration: 120,
    title: 'Company Introduction',
    description: 'Learn about our services',
  },

  caseStudies: [
    {
      id: 'case-1',
      title: '150ft Mega Yacht Refit',
      client: 'Confidential Owner',
      projectDate: '2022-05',
      description: 'Complete interior and exterior refit',
      challenge: 'Tight deadline and complex requirements',
      solution: 'Assembled specialized team and streamlined workflow',
      results: 'Delivered 2 weeks ahead of schedule',
      testimonial: 'Exceptional work and professionalism',
      images: ['https://example.com/case1-1.jpg', 'https://example.com/case1-2.jpg'],
    },
  ],

  innovationHighlights: [
    {
      id: 'innovation-1',
      title: 'Eco-Friendly Coating System',
      description: 'Developed sustainable coating technology',
      dateIntroduced: '2021-09',
      impactDescription: 'Reduced environmental impact by 40%',
    },
  ],

  teamMembers: [
    {
      id: 'team-1',
      name: 'John Smith',
      role: 'Lead Marine Engineer',
      bio: '20 years of experience in yacht engineering',
      photo: 'https://example.com/john.jpg',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
      displayOrder: 1,
    },
  ],

  yachtProjects: [
    {
      id: 'yacht-1',
      yachtName: 'Sea Serenity',
      yachtLength: 45,
      projectType: 'Full Refit',
      completionYear: 2022,
      description: 'Complete modernization project',
      images: ['https://example.com/yacht1.jpg'],
    },
  ],

  serviceAreas: ['Mediterranean', 'Caribbean', 'Southeast Asia'],
  companyValues: ['Quality', 'Innovation', 'Sustainability', 'Customer Focus'],
};

export const mockTier2Vendor: Partial<Vendor> = {
  id: 'vendor-tier2-1',
  companyName: 'Tier 2 Marine Technologies',
  slug: 'tier2-marine-tech',
  tier: 'tier2',
  email: 'contact@tier2marine.com',
  phone: '+1-555-0102',
  website: 'https://tier2marine.com',
  description: 'Advanced marine technology solutions',
  published: true,
  featured: true,

  // All Tier 1 fields (inherited)
  foundedYear: 2005,
  totalProjects: 300,
  employeeCount: 50,
  linkedinFollowers: 15000,
  instagramFollowers: 10000,
  clientSatisfactionScore: 95,

  certifications: [
    {
      id: 'cert-t2-1',
      name: 'ISO 14001:2015',
      issuingOrganization: 'ISO',
      dateObtained: '2021-01-15',
    },
  ],

  awards: [
    {
      id: 'award-t2-1',
      title: 'Innovation Leader 2023',
      awardingOrganization: 'Marine Technology Forum',
      dateReceived: '2023-06-01',
    },
  ],

  // Tier 2+ feature flags
  featuredInCategory: true,
  advancedAnalytics: true,
  apiAccess: false,
  customDomain: false,
};

export const mockTier3Vendor: Partial<Vendor> = {
  id: 'vendor-tier3-1',
  companyName: 'Tier 3 Elite Yacht Services',
  slug: 'tier3-elite-yacht',
  tier: 'tier3',
  email: 'contact@tier3elite.com',
  phone: '+1-555-0103',
  website: 'https://tier3elite.com',
  description: 'Premier yacht services with global reach',
  published: true,
  featured: true,

  // All lower tier fields
  foundedYear: 2000,
  totalProjects: 500,
  employeeCount: 100,
  linkedinFollowers: 25000,
  instagramFollowers: 20000,
  clientSatisfactionScore: 98,

  certifications: [
    {
      id: 'cert-t3-1',
      name: 'ISO 9001:2015',
      issuingOrganization: 'ISO',
      dateObtained: '2020-01-01',
    },
    {
      id: 'cert-t3-2',
      name: 'ISO 14001:2015',
      issuingOrganization: 'ISO',
      dateObtained: '2020-01-01',
    },
  ],

  awards: [
    {
      id: 'award-t3-1',
      title: 'Industry Leader Award',
      awardingOrganization: 'Global Marine Association',
      dateReceived: '2023-12-01',
    },
  ],

  // Tier 2 features
  featuredInCategory: true,
  advancedAnalytics: true,
  apiAccess: true,
  customDomain: true,

  // Tier 3 exclusive: Promotion Pack
  promotionPack: {
    featuredPlacement: true,
    editorialCoverage: true,
    searchHighlight: true,
    newsletterSpotlight: true,
    socialMediaPromotion: true,
  },

  // Tier 3 exclusive: Editorial Content (admin-only in CMS)
  editorialContent: [
    {
      id: 'editorial-1',
      title: 'Setting New Standards in Yacht Excellence',
      contentType: 'Feature Article',
      publishedDate: '2024-01-15',
      author: 'Editorial Team',
      excerpt: 'How Tier 3 Elite is revolutionizing yacht services',
      fullContent: '<p>Full editorial content here...</p>',
      featured: true,
    },
  ],
};

// Edge case fixtures for validation testing
export const mockVendorInvalidFoundedYear: Partial<Vendor> = {
  id: 'vendor-invalid-year',
  companyName: 'Invalid Year Vendor',
  tier: 'tier1',
  foundedYear: 1799, // Below minimum (1800)
};

export const mockVendorFutureFoundedYear: Partial<Vendor> = {
  id: 'vendor-future-year',
  companyName: 'Future Year Vendor',
  tier: 'tier1',
  foundedYear: 2030, // Future year
};

export const mockVendorNullFoundedYear: Partial<Vendor> = {
  id: 'vendor-null-year',
  companyName: 'Null Year Vendor',
  tier: 'tier1',
  foundedYear: null,
};

export const mockVendorMaxSatisfactionScore: Partial<Vendor> = {
  id: 'vendor-max-score',
  companyName: 'Max Score Vendor',
  tier: 'tier1',
  clientSatisfactionScore: 100, // Maximum valid score
};

export const mockVendorInvalidSatisfactionScore: Partial<Vendor> = {
  id: 'vendor-invalid-score',
  companyName: 'Invalid Score Vendor',
  tier: 'tier1',
  clientSatisfactionScore: 101, // Above maximum (100)
};

// Helper function to compute years in business
export function computeYearsInBusiness(foundedYear?: number | null): number | null {
  if (!foundedYear) return null;
  const currentYear = new Date().getFullYear();
  if (foundedYear > currentYear || foundedYear < 1800) return null;
  return currentYear - foundedYear;
}

// Expected computed values for test assertions
export const expectedComputedValues = {
  mockTier1Vendor: {
    yearsInBusiness: computeYearsInBusiness(mockTier1Vendor.foundedYear),
  },
  mockTier2Vendor: {
    yearsInBusiness: computeYearsInBusiness(mockTier2Vendor.foundedYear),
  },
  mockTier3Vendor: {
    yearsInBusiness: computeYearsInBusiness(mockTier3Vendor.foundedYear),
  },
  mockVendorNullFoundedYear: {
    yearsInBusiness: null,
  },
  mockVendorInvalidFoundedYear: {
    yearsInBusiness: null,
  },
  mockVendorFutureFoundedYear: {
    yearsInBusiness: null,
  },
};

// Array of all mock vendors for iteration in tests
export const allMockVendors = [
  mockFreeTierVendor,
  mockTier1Vendor,
  mockTier2Vendor,
  mockTier3Vendor,
];

export const allEdgeCaseVendors = [
  mockVendorInvalidFoundedYear,
  mockVendorFutureFoundedYear,
  mockVendorNullFoundedYear,
  mockVendorMaxSatisfactionScore,
  mockVendorInvalidSatisfactionScore,
];
