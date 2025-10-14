import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { getPayload } from 'payload';
import config from '@/payload.config';
import type { Payload } from 'payload';
import { authService } from '@/lib/services/auth-service';

describe('PATCH /api/vendors/{id}', () => {
  let payload: Payload;
  let testVendorFree: any;
  let testVendorTier1: any;
  let testVendorTier2: any;
  let testUserFree: any;
  let testUserTier1: any;
  let testUserTier2: any;
  let testAdmin: any;
  let tokenFree: string;
  let tokenTier1: string;
  let tokenTier2: string;
  let tokenAdmin: string;

  beforeAll(async () => {
    payload = await getPayload({ config });

    // Create admin user
    const adminHash = await authService.hashPassword('AdminPass123!@#');
    testAdmin = await payload.create({
      collection: 'users',
      data: {
        email: 'test-admin-update@example.com',
        password: adminHash,
        hash: adminHash,
        role: 'admin',
        status: 'active',
      },
    });

    // Create free tier vendor
    const hashFree = await authService.hashPassword('VendorPass123!@#');
    testUserFree = await payload.create({
      collection: 'users',
      data: {
        email: 'test-vendor-free-update@example.com',
        password: hashFree,
        hash: hashFree,
        role: 'vendor',
        status: 'active',
      },
    });

    testVendorFree = await payload.create({
      collection: 'vendors',
      data: {
        user: testUserFree.id,
        companyName: 'Free Tier Company',
        slug: 'free-tier-company',
        contactEmail: 'test-vendor-free-update@example.com',
        description: 'Original description',
        tier: 'free',
        published: true,
        featured: false,
      },
    });

    // Create tier1 vendor
    const hashTier1 = await authService.hashPassword('VendorPass123!@#');
    testUserTier1 = await payload.create({
      collection: 'users',
      data: {
        email: 'test-vendor-tier1-update@example.com',
        password: hashTier1,
        hash: hashTier1,
        role: 'vendor',
        status: 'active',
      },
    });

    testVendorTier1 = await payload.create({
      collection: 'vendors',
      data: {
        user: testUserTier1.id,
        companyName: 'Tier1 Company',
        slug: 'tier1-company',
        contactEmail: 'test-vendor-tier1-update@example.com',
        tier: 'tier1',
        published: true,
        featured: false,
      },
    });

    // Create tier2 vendor
    const hashTier2 = await authService.hashPassword('VendorPass123!@#');
    testUserTier2 = await payload.create({
      collection: 'users',
      data: {
        email: 'test-vendor-tier2-update@example.com',
        password: hashTier2,
        hash: hashTier2,
        role: 'vendor',
        status: 'active',
      },
    });

    testVendorTier2 = await payload.create({
      collection: 'vendors',
      data: {
        user: testUserTier2.id,
        companyName: 'Tier2 Company',
        slug: 'tier2-company',
        contactEmail: 'test-vendor-tier2-update@example.com',
        tier: 'tier2',
        published: true,
        featured: false,
      },
    });

    // Generate tokens
    const loginFree = await authService.login('test-vendor-free-update@example.com', 'VendorPass123!@#');
    tokenFree = loginFree.tokens.accessToken;

    const loginTier1 = await authService.login('test-vendor-tier1-update@example.com', 'VendorPass123!@#');
    tokenTier1 = loginTier1.tokens.accessToken;

    const loginTier2 = await authService.login('test-vendor-tier2-update@example.com', 'VendorPass123!@#');
    tokenTier2 = loginTier2.tokens.accessToken;

    const loginAdmin = await authService.login('test-admin-update@example.com', 'AdminPass123!@#');
    tokenAdmin = loginAdmin.tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testVendorFree) {
      await payload.delete({ collection: 'vendors', id: testVendorFree.id });
    }
    if (testVendorTier1) {
      await payload.delete({ collection: 'vendors', id: testVendorTier1.id });
    }
    if (testVendorTier2) {
      await payload.delete({ collection: 'vendors', id: testVendorTier2.id });
    }
    if (testUserFree) {
      await payload.delete({ collection: 'users', id: testUserFree.id });
    }
    if (testUserTier1) {
      await payload.delete({ collection: 'users', id: testUserTier1.id });
    }
    if (testUserTier2) {
      await payload.delete({ collection: 'users', id: testUserTier2.id });
    }
    if (testAdmin) {
      await payload.delete({ collection: 'users', id: testAdmin.id });
    }
  });

  describe('Authentication', () => {
    it('should return 401 when no token provided', async () => {
      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: 'Updated Name' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when invalid token provided', async () => {
      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid-token',
        },
        body: JSON.stringify({ companyName: 'Updated Name' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Successful Updates', () => {
    it('should allow vendor to update own profile with free tier fields', async () => {
      const updateData = {
        companyName: 'Updated Free Company',
        description: 'Updated description',
        contactPhone: '+1-555-0123',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.vendor.companyName).toBe(updateData.companyName);
      expect(data.data.vendor.description).toBe(updateData.description);
      expect(data.data.vendor.contactPhone).toBe(updateData.contactPhone);
    });

    it('should allow tier1 vendor to update tier1+ fields', async () => {
      const updateData = {
        companyName: 'Updated Tier1 Company',
        website: 'https://updated-tier1.com',
        linkedinUrl: 'https://linkedin.com/company/updated-tier1',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorTier1.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenTier1}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.vendor.website).toBe(updateData.website);
      expect(data.data.vendor.linkedinUrl).toBe(updateData.linkedinUrl);
    });

    it('should allow tier2 vendor to update all fields', async () => {
      const updateData = {
        companyName: 'Updated Tier2 Company',
        website: 'https://updated-tier2.com',
        certifications: [{ certification: 'ISO 9001' }, { certification: 'CE Marking' }],
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorTier2.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenTier2}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.vendor.website).toBe(updateData.website);
      expect(data.data.vendor.certifications).toHaveLength(2);
    });

    it('should support partial updates (PATCH semantics)', async () => {
      const updateData = {
        description: 'Only updating description',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.vendor.description).toBe(updateData.description);
      // Other fields should remain unchanged
      expect(data.data.vendor.companyName).toBeDefined();
    });
  });

  describe('Tier Restrictions', () => {
    it('should return 403 when free tier vendor attempts to update tier1+ fields', async () => {
      const updateData = {
        companyName: 'Updated Name',
        website: 'https://example.com', // Tier1+ field
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toContain('website');
      expect(data.error.message).toContain('tier');
    });

    it('should return 403 when free tier vendor attempts multiple tier1+ fields', async () => {
      const updateData = {
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/company/test',
        twitterUrl: 'https://twitter.com/test',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Authorization', () => {
    it('should return 403 when vendor attempts to update another vendors profile', async () => {
      const updateData = {
        companyName: 'Unauthorized Update',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorTier1.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`, // Using free tier token to update tier1 vendor
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toContain('your own');
    });
  });

  describe('Admin Override', () => {
    it('should allow admin to update any vendor profile', async () => {
      const updateData = {
        companyName: 'Admin Updated Company',
        description: 'Updated by admin',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.vendor.companyName).toBe(updateData.companyName);
    });

    it('should allow admin to update tier-restricted fields for free tier vendor', async () => {
      const updateData = {
        website: 'https://admin-updated.com',
        linkedinUrl: 'https://linkedin.com/company/admin-updated',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.vendor.website).toBe(updateData.website);
      expect(data.data.vendor.linkedinUrl).toBe(updateData.linkedinUrl);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when no fields provided', async () => {
      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when invalid email format provided', async () => {
      const updateData = {
        contactEmail: 'invalid-email',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toHaveProperty('contactEmail');
    });

    it('should return 400 when invalid URL format provided', async () => {
      const updateData = {
        website: 'not-a-url',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorTier1.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenTier1}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toHaveProperty('website');
    });

    it('should return 400 when company name too short', async () => {
      const updateData = {
        companyName: 'A',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toHaveProperty('companyName');
    });
  });

  describe('Not Found', () => {
    it('should return 404 when vendor ID does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

      const response = await fetch(`http://localhost:3000/api/vendors/${fakeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify({ companyName: 'Updated' }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Response Format', () => {
    it('should return updated vendor data in response', async () => {
      const updateData = {
        companyName: 'Response Format Test',
        description: 'Testing response structure',
      };

      const response = await fetch(`http://localhost:3000/api/vendors/${testVendorFree.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenFree}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify response structure
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('vendor');
      expect(data.data).toHaveProperty('message');

      // Verify vendor data
      expect(data.data.vendor).toHaveProperty('id');
      expect(data.data.vendor).toHaveProperty('companyName');
      expect(data.data.vendor).toHaveProperty('tier');
      expect(data.data.vendor.companyName).toBe(updateData.companyName);
    });
  });
});
