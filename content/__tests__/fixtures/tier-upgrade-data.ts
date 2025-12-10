/**
 * Test Fixtures - Tier Upgrade Request Data
 *
 * Provides realistic tier upgrade request data for testing
 * the tier upgrade request system components
 */

import { TierUpgradeRequest } from '@/lib/types';

// Mock tier upgrade requests in different states
export const mockPendingRequest: TierUpgradeRequest = {
  id: 'req-pending-1',
  vendor: 'vendor-free-1',
  user: 'user-1',
  currentTier: 'free',
  requestedTier: 'tier1',
  status: 'pending',
  vendorNotes: 'We need to list more products to serve our growing customer base and expand our market reach.',
  requestedAt: '2024-01-15T10:30:00Z',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

// For backward compatibility with tests that expect vendorId
export const mockPendingRequestLegacy = {
  ...mockPendingRequest,
  vendorId: 'vendor-free-1',
  userId: 'user-1',
};

export const mockApprovedRequest: TierUpgradeRequest = {
  id: 'req-approved-1',
  vendor: 'vendor-tier1-1',
  user: 'user-2',
  currentTier: 'tier1',
  requestedTier: 'tier2',
  status: 'approved',
  vendorNotes: 'Expanding our operations to include multiple locations and need advanced features.',
  requestedAt: '2024-01-10T09:00:00Z',
  reviewedAt: '2024-01-11T14:30:00Z',
  reviewedBy: { id: 'admin-1', name: 'Admin User' } as any,
  createdAt: '2024-01-10T09:00:00Z',
  updatedAt: '2024-01-11T14:30:00Z',
};

export const mockRejectedRequest: TierUpgradeRequest = {
  id: 'req-rejected-1',
  vendor: 'vendor-tier1-1',
  user: 'user-3',
  currentTier: 'tier1',
  requestedTier: 'tier3',
  status: 'rejected',
  vendorNotes: 'Need enterprise features.',
  rejectionReason: 'Please provide more details about your business needs and why you require enterprise-level features. We recommend starting with Tier 2 first to ensure the features align with your requirements.',
  requestedAt: '2024-01-08T11:00:00Z',
  reviewedAt: '2024-01-09T16:45:00Z',
  reviewedBy: { id: 'admin-1', name: 'Admin User' } as any,
  createdAt: '2024-01-08T11:00:00Z',
  updatedAt: '2024-01-09T16:45:00Z',
};

export const mockCancelledRequest: TierUpgradeRequest = {
  id: 'req-cancelled-1',
  vendor: 'vendor-free-1',
  user: 'user-4',
  currentTier: 'free',
  requestedTier: 'tier2',
  status: 'cancelled',
  vendorNotes: 'Planning to upgrade to support our expansion plans.',
  requestedAt: '2024-01-12T13:15:00Z',
  createdAt: '2024-01-12T13:15:00Z',
  updatedAt: '2024-01-13T10:20:00Z',
};

// Mock API response payloads
export const mockApiSuccessResponse = {
  success: true,
  data: mockPendingRequest,
};

export const mockApiErrorResponse = {
  success: false,
  error: 'VALIDATION_ERROR',
  message: 'Vendor notes must be at least 20 characters',
};

export const mockApiDuplicateErrorResponse = {
  success: false,
  error: 'DUPLICATE_REQUEST',
  message: 'You already have a pending upgrade request',
  existingRequest: {
    id: 'req-pending-1',
    requestedTier: 'tier1',
    requestedAt: '2024-01-15T10:30:00Z',
  },
};

export const mockApiServerErrorResponse = {
  success: false,
  error: 'INTERNAL_ERROR',
  message: 'An unexpected error occurred. Please try again.',
};

// Mock vendors at different tiers for testing tier selection
export const mockVendorAtFree = {
  id: 'vendor-free-1',
  name: 'Free Tier Vendor',
  tier: 'free' as const,
  currentTier: 'free' as const,
};

export const mockVendorAtTier1 = {
  id: 'vendor-tier1-1',
  name: 'Tier 1 Vendor',
  tier: 'tier1' as const,
  currentTier: 'tier1' as const,
};

export const mockVendorAtTier2 = {
  id: 'vendor-tier2-1',
  name: 'Tier 2 Vendor',
  tier: 'tier2' as const,
  currentTier: 'tier2' as const,
};

export const mockVendorAtTier3 = {
  id: 'vendor-tier3-1',
  name: 'Tier 3 Vendor',
  tier: 'tier3' as const,
  currentTier: 'tier3' as const,
};

// Helper to create mock requests with custom data
export const createMockRequest = (
  overrides: Partial<TierUpgradeRequest>
): TierUpgradeRequest => ({
  id: 'req-custom-1',
  vendorId: 'vendor-1',
  userId: 'user-1',
  currentTier: 'free',
  requestedTier: 'tier1',
  status: 'pending',
  requestedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Mock form data for valid submissions
export const validFormData = {
  requestedTier: 'tier1' as const,
  vendorNotes: 'We are expanding our product catalog and need to list more items to serve our growing customer base effectively.',
};

export const validFormDataMinimal = {
  requestedTier: 'tier2' as const,
  vendorNotes: 'Need more features now', // Exactly 20 characters
};

// Mock form data for invalid submissions
export const invalidFormDataShortNotes = {
  requestedTier: 'tier1' as const,
  vendorNotes: 'Too short', // Less than 20 characters
};

export const invalidFormDataLongNotes = {
  requestedTier: 'tier1' as const,
  vendorNotes: 'x'.repeat(501), // More than 500 characters
};

export const invalidFormDataNoTier = {
  requestedTier: '' as any,
  vendorNotes: 'This is a valid note with more than twenty characters',
};
