import bcrypt from 'bcryptjs';
import type { JWTPayload } from '@/lib/utils/jwt';

/**
 * Test user fixtures for authentication testing
 * Passwords are pre-hashed with bcrypt (12 rounds) for consistency
 */

export const TEST_PASSWORDS = {
  ADMIN: 'Admin123!@#Strong',
  VENDOR_TIER2: 'Vendor2Pass!@#123',
  VENDOR_TIER1: 'Vendor1Pass!@#123',
  VENDOR_FREE: 'VendorFreePass!@#123',
  PENDING: 'PendingPass!@#123',
  REJECTED: 'RejectedPass!@#123',
};

// Pre-hashed passwords for testing (bcrypt rounds = 12)
export const HASHED_PASSWORDS = {
  ADMIN: '$2a$12$vw4.BIpZTJ5zxI8ewICTPe8u4rgUdq5cu3mEZH3FWBK54iepU.0Vq', // Admin123!@#Strong
  VENDOR_TIER2: '$2a$12$IQP4fggmQUPmhl1kkmb/OOyUSmrl6IuoEgGKImc4TaLTA9Bx20vLG', // Vendor2Pass!@#123
  VENDOR_TIER1: '$2a$12$XrjWoQQjDK5mxAvbhfpMC.HMRYQwnu844VUFesHENh6dzLFxhUesC', // Vendor1Pass!@#123
  VENDOR_FREE: '$2a$12$nSjnBiknIxMCyZkqdG610OWNhxtazvO0Lzm47R8rJDUG1bBYbNHJi', // VendorFreePass!@#123
  PENDING: '$2a$12$wf1tu59ejKkmHJyl5vd2qu5aK.xBPNN5X44P3rmczWNZE5ChKMrCO', // PendingPass!@#123
  REJECTED: '$2a$12$ggK5bwbZlcfyhEY5BmFtq.rfSaxILnmlAk.39tP3umQObMqEjoJtO', // RejectedPass!@#123
};

export interface MockUser {
  id: string;
  email: string;
  hash: string;
  role: 'admin' | 'vendor';
  status: 'active' | 'pending' | 'rejected';
  tier?: 'free' | 'tier1' | 'tier2';
}

export const MOCK_ADMIN_USER: MockUser = {
  id: 'admin-001',
  email: 'admin@superyacht.com',
  hash: HASHED_PASSWORDS.ADMIN,
  role: 'admin',
  status: 'active',
};

export const MOCK_VENDOR_TIER2: MockUser = {
  id: 'vendor-tier2-001',
  email: 'vendor.tier2@example.com',
  hash: HASHED_PASSWORDS.VENDOR_TIER2,
  role: 'vendor',
  status: 'active',
  tier: 'tier2',
};

export const MOCK_VENDOR_TIER1: MockUser = {
  id: 'vendor-tier1-001',
  email: 'vendor.tier1@example.com',
  hash: HASHED_PASSWORDS.VENDOR_TIER1,
  role: 'vendor',
  status: 'active',
  tier: 'tier1',
};

export const MOCK_VENDOR_FREE: MockUser = {
  id: 'vendor-free-001',
  email: 'vendor.free@example.com',
  hash: HASHED_PASSWORDS.VENDOR_FREE,
  role: 'vendor',
  status: 'active',
  tier: 'free',
};

export const MOCK_VENDOR_PENDING: MockUser = {
  id: 'vendor-pending-001',
  email: 'vendor.pending@example.com',
  hash: HASHED_PASSWORDS.PENDING,
  role: 'vendor',
  status: 'pending',
  tier: 'free',
};

export const MOCK_VENDOR_REJECTED: MockUser = {
  id: 'vendor-rejected-001',
  email: 'vendor.rejected@example.com',
  hash: HASHED_PASSWORDS.REJECTED,
  role: 'vendor',
  status: 'rejected',
  tier: 'free',
};

// JWT Payloads for each user type
export const MOCK_ADMIN_JWT_PAYLOAD: JWTPayload = {
  id: MOCK_ADMIN_USER.id,
  email: MOCK_ADMIN_USER.email,
  role: 'admin',
};

export const MOCK_VENDOR_TIER2_JWT_PAYLOAD: JWTPayload = {
  id: MOCK_VENDOR_TIER2.id,
  email: MOCK_VENDOR_TIER2.email,
  role: 'vendor',
  tier: 'tier2',
};

export const MOCK_VENDOR_TIER1_JWT_PAYLOAD: JWTPayload = {
  id: MOCK_VENDOR_TIER1.id,
  email: MOCK_VENDOR_TIER1.email,
  role: 'vendor',
  tier: 'tier1',
};

export const MOCK_VENDOR_FREE_JWT_PAYLOAD: JWTPayload = {
  id: MOCK_VENDOR_FREE.id,
  email: MOCK_VENDOR_FREE.email,
  role: 'vendor',
  tier: 'free',
};

// Mock vendor documents for Payload CMS responses
export const MOCK_VENDOR_TIER2_DOC = {
  id: 'vendor-doc-tier2-001',
  user: MOCK_VENDOR_TIER2.id,
  companyName: 'Tier 2 Vendor Company',
  tier: 'tier2' as const,
  status: 'active' as const,
};

export const MOCK_VENDOR_TIER1_DOC = {
  id: 'vendor-doc-tier1-001',
  user: MOCK_VENDOR_TIER1.id,
  companyName: 'Tier 1 Vendor Company',
  tier: 'tier1' as const,
  status: 'active' as const,
};

export const MOCK_VENDOR_FREE_DOC = {
  id: 'vendor-doc-free-001',
  user: MOCK_VENDOR_FREE.id,
  companyName: 'Free Tier Vendor Company',
  tier: 'free' as const,
  status: 'active' as const,
};

/**
 * Helper to generate pre-hashed passwords for new test users
 * This is a utility function for test development, not used in tests themselves
 */
export async function generateHashedPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Helper to get all mock users as array
 */
export const ALL_MOCK_USERS = [
  MOCK_ADMIN_USER,
  MOCK_VENDOR_TIER2,
  MOCK_VENDOR_TIER1,
  MOCK_VENDOR_FREE,
  MOCK_VENDOR_PENDING,
  MOCK_VENDOR_REJECTED,
];
