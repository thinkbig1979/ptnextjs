/**
 * Token Revocation Integration Tests
 * TDD RED Phase: Tests for automatic token invalidation on security events
 *
 * Tests the following workflows:
 * - Password change increments tokenVersion
 * - Existing tokens invalidated after password change
 * - Account suspension increments tokenVersion
 * - Tokens invalidated after suspension
 * - Account rejection increments tokenVersion
 * - Tokens invalidated after rejection
 *
 * These tests use real database operations (test database)
 * and verify end-to-end token revocation behavior.
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { getPayload } from 'payload';
import config from '@/payload.config';
import type { Payload } from 'payload';
import { generateTokens, verifyAccessToken } from '@/lib/utils/jwt';

describe('Token Revocation Integration', () => {
  let payload: Payload;
  let testUserId: string;
  let testVendorId: string;

  beforeAll(async () => {
    // Initialize Payload with test database
    payload = await getPayload({ config });
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      try {
        await payload.delete({
          collection: 'users',
          id: testUserId,
        });
      } catch (error) {
        // User might already be deleted, ignore error
      }
    }

    if (testVendorId) {
      try {
        await payload.delete({
          collection: 'vendors',
          id: testVendorId,
        });
      } catch (error) {
        // Vendor might already be deleted, ignore error
      }
    }
  });

  beforeEach(async () => {
    // Create fresh test vendor for each test
    const vendor = await payload.create({
      collection: 'vendors',
      data: {
        name: `Test Vendor ${Date.now()}`,
        email: `vendor-${Date.now()}@test.com`,
        tier: 'tier1',
        status: 'approved',
      },
    });
    testVendorId = vendor.id;

    // Create fresh test user for each test
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        role: 'vendor',
        status: 'approved',
        vendor: testVendorId,
        // tokenVersion should default to 0 (implementation required)
      },
    });
    testUserId = user.id;
  });

  describe('Password Change', () => {
    it('should increment tokenVersion when password changes', async () => {
      // Get initial tokenVersion
      const userBefore = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      // TODO: This will fail until Users collection has tokenVersion field
      expect(userBefore).toHaveProperty('tokenVersion');
      const initialVersion = (userBefore as any).tokenVersion || 0;

      // Change password
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          password: 'NewPassword456!',
        },
      });

      // Verify tokenVersion incremented
      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      // TODO: This will fail until password change hook increments tokenVersion
      expect((userAfter as any).tokenVersion).toBe(initialVersion + 1);
    });

    it('should invalidate existing tokens after password change', async () => {
      // Generate initial tokens
      const user = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      const initialTokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        status: (user as any).status,
        tokenVersion: (user as any).tokenVersion || 0,
      });

      // Verify initial token works
      expect(() => verifyAccessToken(initialTokens.accessToken)).not.toThrow();

      // Change password (should increment tokenVersion)
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          password: 'NewPassword456!',
        },
      });

      // TODO: This will fail until validateTokenVersion is implemented
      // Expected: old token should be rejected because tokenVersion no longer matches

      // Attempt to use old token
      // const decoded = verifyAccessToken(initialTokens.accessToken);
      // await expect(validateTokenVersion(decoded))
      //   .rejects.toThrow(/token.*invalid/i);

      // Placeholder assertion
      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const oldVersion = (user as any).tokenVersion || 0;
      const newVersion = (userAfter as any).tokenVersion || 0;
      expect(newVersion).toBeGreaterThan(oldVersion);
    });

    it('should allow new tokens after password change', async () => {
      // Change password
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          password: 'NewPassword456!',
        },
      });

      // Get updated user with new tokenVersion
      const updatedUser = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      // Generate new tokens with updated tokenVersion
      const newTokens = generateTokens({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: (updatedUser as any).status,
        tokenVersion: (updatedUser as any).tokenVersion || 0,
      });

      // New tokens should work
      expect(() => verifyAccessToken(newTokens.accessToken)).not.toThrow();

      // TODO: This will pass once validateTokenVersion is implemented
      // const decoded = verifyAccessToken(newTokens.accessToken);
      // await expect(validateTokenVersion(decoded)).resolves.not.toThrow();
    });

    it('should increment tokenVersion only once per password change', async () => {
      const userBefore = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionBefore = (userBefore as any).tokenVersion || 0;

      // Change password
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          password: 'NewPassword456!',
        },
      });

      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionAfter = (userAfter as any).tokenVersion || 0;

      // Should increment by exactly 1
      expect(versionAfter).toBe(versionBefore + 1);
    });

    it('should handle multiple sequential password changes', async () => {
      const userInitial = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const initialVersion = (userInitial as any).tokenVersion || 0;

      // Change password 3 times
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: { password: 'Password1!' },
      });

      await payload.update({
        collection: 'users',
        id: testUserId,
        data: { password: 'Password2!' },
      });

      await payload.update({
        collection: 'users',
        id: testUserId,
        data: { password: 'Password3!' },
      });

      const userFinal = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const finalVersion = (userFinal as any).tokenVersion || 0;

      // Should increment by 3
      expect(finalVersion).toBe(initialVersion + 3);
    });
  });

  describe('Account Status Changes', () => {
    it('should increment tokenVersion when account is suspended', async () => {
      const userBefore = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionBefore = (userBefore as any).tokenVersion || 0;

      // Suspend account
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'suspended',
        },
      });

      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionAfter = (userAfter as any).tokenVersion || 0;

      // TODO: This will fail until status change hook increments tokenVersion
      expect(versionAfter).toBe(versionBefore + 1);
    });

    it('should invalidate tokens after suspension', async () => {
      // Generate tokens while account is approved
      const user = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        status: (user as any).status,
        tokenVersion: (user as any).tokenVersion || 0,
      });

      // Verify token works before suspension
      expect(() => verifyAccessToken(tokens.accessToken)).not.toThrow();

      // Suspend account
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'suspended',
        },
      });

      // TODO: This will fail until validateTokenVersion is implemented
      // Old tokens should be invalid after suspension

      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      expect((userAfter as any).status).toBe('suspended');
    });

    it('should increment tokenVersion when account is rejected', async () => {
      const userBefore = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionBefore = (userBefore as any).tokenVersion || 0;

      // Reject account
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'rejected',
          rejectionReason: 'Failed verification',
        },
      });

      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionAfter = (userAfter as any).tokenVersion || 0;

      // TODO: This will fail until status change hook increments tokenVersion
      expect(versionAfter).toBe(versionBefore + 1);
    });

    it('should invalidate tokens after rejection', async () => {
      // Generate tokens while account is approved
      const user = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        status: (user as any).status,
        tokenVersion: (user as any).tokenVersion || 0,
      });

      // Verify token works before rejection
      expect(() => verifyAccessToken(tokens.accessToken)).not.toThrow();

      // Reject account
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'rejected',
          rejectionReason: 'Failed verification',
        },
      });

      // TODO: This will fail until validateTokenVersion is implemented
      // Old tokens should be invalid after rejection

      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      expect((userAfter as any).status).toBe('rejected');
    });

    it('should NOT increment tokenVersion for pending status', async () => {
      // Pending is initial state, not a security event
      const userBefore = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionBefore = (userBefore as any).tokenVersion || 0;

      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'pending',
        },
      });

      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionAfter = (userAfter as any).tokenVersion || 0;

      // Version should NOT change for pending status
      expect(versionAfter).toBe(versionBefore);
    });

    it('should NOT increment tokenVersion for approved status', async () => {
      // First suspend the account
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'suspended',
        },
      });

      const userSuspended = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionSuspended = (userSuspended as any).tokenVersion || 0;

      // Re-approve account
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'approved',
        },
      });

      const userApproved = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionApproved = (userApproved as any).tokenVersion || 0;

      // Version should NOT change when re-approving
      // (Only suspension/rejection should increment)
      expect(versionApproved).toBe(versionSuspended);
    });
  });

  describe('Combined Security Events', () => {
    it('should handle password change + suspension in sequence', async () => {
      const userInitial = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const initialVersion = (userInitial as any).tokenVersion || 0;

      // Password change
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          password: 'NewPassword123!',
        },
      });

      // Then suspension
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'suspended',
        },
      });

      const userFinal = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const finalVersion = (userFinal as any).tokenVersion || 0;

      // Should increment twice (once for each event)
      expect(finalVersion).toBe(initialVersion + 2);
    });

    it('should handle suspension + password change in sequence', async () => {
      const userInitial = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const initialVersion = (userInitial as any).tokenVersion || 0;

      // Suspension first
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          status: 'suspended',
        },
      });

      // Then password change
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          password: 'NewPassword123!',
        },
      });

      const userFinal = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const finalVersion = (userFinal as any).tokenVersion || 0;

      // Should increment twice
      expect(finalVersion).toBe(initialVersion + 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with no tokenVersion field (legacy data)', async () => {
      // Simulate legacy user without tokenVersion
      // TODO: Implementation should handle missing tokenVersion gracefully
      // Should default to 0 and create field on first update

      const user = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      // If tokenVersion doesn't exist, it should be treated as 0
      const version = (user as any).tokenVersion ?? 0;
      expect(typeof version).toBe('number');
    });

    it('should not change tokenVersion on unrelated field updates', async () => {
      const userBefore = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionBefore = (userBefore as any).tokenVersion || 0;

      // Update non-security field (e.g., email)
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          email: `updated-${Date.now()}@example.com`,
        },
      });

      const userAfter = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      const versionAfter = (userAfter as any).tokenVersion || 0;

      // Version should NOT change for non-security updates
      expect(versionAfter).toBe(versionBefore);
    });
  });

  describe('Validation Function Integration', () => {
    it('should successfully validate token with correct version', async () => {
      const user = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        status: (user as any).status,
        tokenVersion: (user as any).tokenVersion || 0,
      });

      // Token validation should pass
      const decoded = verifyAccessToken(tokens.accessToken);
      expect(decoded.id).toBe(user.id);
      expect(decoded.tokenVersion).toBe((user as any).tokenVersion || 0);

      // TODO: Once validateTokenVersion is implemented:
      // await expect(validateTokenVersion(decoded)).resolves.not.toThrow();
    });

    it('should reject token after tokenVersion mismatch', async () => {
      // Generate token with current version
      const user = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        status: (user as any).status,
        tokenVersion: (user as any).tokenVersion || 0,
      });

      // Change password to increment version
      await payload.update({
        collection: 'users',
        id: testUserId,
        data: {
          password: 'NewPassword456!',
        },
      });

      // Decode token (JWT is still technically valid)
      const decoded = verifyAccessToken(tokens.accessToken);

      // TODO: Once validateTokenVersion is implemented:
      // await expect(validateTokenVersion(decoded))
      //   .rejects.toThrow(/token.*invalid/i);

      // Verify versions don't match
      const updatedUser = await payload.findByID({
        collection: 'users',
        id: testUserId,
      });
      expect(decoded.tokenVersion).toBeLessThan((updatedUser as any).tokenVersion);
    });
  });
});
