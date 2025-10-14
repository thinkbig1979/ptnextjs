/**
 * Vendor Test Fixtures
 *
 * Mock vendor data for testing frontend components
 */

export const mockFreeTierVendor = {
  id: 'vendor-free-001',
  email: 'vendor.free@example.com',
  role: 'vendor' as const,
  tier: 'free' as const,
  companyName: 'Free Tier Marine',
  contactName: 'John Free',
  phone: '+1-555-1111',
  website: 'https://freetier.com',
  description: 'Basic marine services',
  approvalStatus: 'approved' as const,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

export const mockTier1Vendor = {
  id: 'vendor-tier1-001',
  email: 'vendor.tier1@example.com',
  role: 'vendor' as const,
  tier: 'tier1' as const,
  companyName: 'Tier 1 Marine Tech',
  contactName: 'Jane Tier1',
  phone: '+1-555-2222',
  website: 'https://tier1marine.com',
  description: 'Advanced marine technology solutions',
  certifications: ['ISO 9001', 'ISO 14001'],
  approvalStatus: 'approved' as const,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

export const mockTier2Vendor = {
  id: 'vendor-tier2-001',
  email: 'vendor.tier2@example.com',
  role: 'vendor' as const,
  tier: 'tier2' as const,
  companyName: 'Tier 2 Premium Marine',
  contactName: 'Bob Tier2',
  phone: '+1-555-3333',
  website: 'https://tier2marine.com',
  description: 'Premium marine technology and innovation',
  certifications: ['ISO 9001', 'ISO 14001', 'CE Marking'],
  caseStudies: [
    {
      title: 'Superyacht Navigation System',
      description: 'Implemented advanced navigation for 100m yacht',
      image: '/images/case-study-1.jpg',
    },
  ],
  awards: ['Best Innovation 2024', 'Top Supplier Award'],
  approvalStatus: 'approved' as const,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

export const mockPendingVendor = {
  id: 'vendor-pending-001',
  email: 'vendor.pending@example.com',
  role: 'vendor' as const,
  tier: 'free' as const,
  companyName: 'Pending Marine Co',
  contactName: 'Alice Pending',
  phone: '+1-555-4444',
  website: 'https://pending.com',
  description: 'Awaiting approval',
  approvalStatus: 'pending' as const,
  createdAt: '2025-10-01T00:00:00Z',
  updatedAt: '2025-10-01T00:00:00Z',
};

export const mockRejectedVendor = {
  id: 'vendor-rejected-001',
  email: 'vendor.rejected@example.com',
  role: 'vendor' as const,
  tier: 'free' as const,
  companyName: 'Rejected Marine Co',
  contactName: 'Charlie Rejected',
  phone: '+1-555-5555',
  website: 'https://rejected.com',
  description: 'Did not meet requirements',
  approvalStatus: 'rejected' as const,
  createdAt: '2025-09-01T00:00:00Z',
  updatedAt: '2025-09-15T00:00:00Z',
};

export const mockAdminUser = {
  id: 'admin-001',
  email: 'admin@example.com',
  role: 'admin' as const,
  name: 'Admin User',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

/**
 * Mock pending vendors list for admin queue
 */
export const mockPendingVendorsList = [
  {
    id: 'pending-001',
    email: 'pending1@example.com',
    companyName: 'Pending Marine Co 1',
    contactName: 'Alice Pending',
    approvalStatus: 'pending' as const,
    createdAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'pending-002',
    email: 'pending2@example.com',
    companyName: 'Pending Marine Co 2',
    contactName: 'Bob Pending',
    approvalStatus: 'pending' as const,
    createdAt: '2025-10-05T14:30:00Z',
  },
  {
    id: 'pending-003',
    email: 'pending3@example.com',
    companyName: 'Pending Marine Co 3',
    contactName: 'Charlie Pending',
    approvalStatus: 'pending' as const,
    createdAt: '2025-10-08T09:15:00Z',
  },
];

/**
 * Vendor factory function for creating custom test vendors
 */
export function createMockVendor(overrides?: Partial<typeof mockFreeTierVendor>) {
  return {
    ...mockFreeTierVendor,
    ...overrides,
  };
}

/**
 * Create mock vendor with specific tier
 */
export function createMockVendorWithTier(tier: 'free' | 'tier1' | 'tier2') {
  const baseVendors = {
    free: mockFreeTierVendor,
    tier1: mockTier1Vendor,
    tier2: mockTier2Vendor,
  };

  return baseVendors[tier];
}
