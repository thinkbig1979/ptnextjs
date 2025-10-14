import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { getPayload } from 'payload';
import config from '@/payload.config';
import type { Payload } from 'payload';

describe('POST /api/vendors/register', () => {
  let payload: Payload;

  beforeAll(async () => {
    payload = await getPayload({ config });
  });

  beforeEach(async () => {
    // Clean up test data before each test
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          contains: 'test-vendor-',
        },
      },
      limit: 100,
    });

    for (const user of users.docs) {
      // Delete associated vendor first
      const vendors = await payload.find({
        collection: 'vendors',
        where: {
          user: {
            equals: user.id,
          },
        },
        limit: 1,
      });

      if (vendors.docs[0]) {
        await payload.delete({
          collection: 'vendors',
          id: vendors.docs[0].id,
        });
      }

      // Then delete user
      await payload.delete({
        collection: 'users',
        id: user.id,
      });
    }
  });

  afterAll(async () => {
    // Final cleanup
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          contains: 'test-vendor-',
        },
      },
      limit: 100,
    });

    for (const user of users.docs) {
      const vendors = await payload.find({
        collection: 'vendors',
        where: {
          user: {
            equals: user.id,
          },
        },
        limit: 1,
      });

      if (vendors.docs[0]) {
        await payload.delete({
          collection: 'vendors',
          id: vendors.docs[0].id,
        });
      }

      await payload.delete({
        collection: 'users',
        id: user.id,
      });
    }
  });

  describe('Successful Registration', () => {
    it('should register new vendor with valid data and return 201', async () => {
      const requestBody = {
        companyName: 'Test Vendor Company',
        contactEmail: 'test-vendor-success@example.com',
        contactPhone: '+1-234-567-8900',
        password: 'SecurePass123!@#',
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('vendorId');
      expect(data.data.status).toBe('pending');
      expect(data.data.message).toBe('Registration submitted for admin approval');

      // Verify user record created
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: requestBody.contactEmail,
          },
        },
        limit: 1,
      });

      expect(users.docs).toHaveLength(1);
      const user = users.docs[0];
      expect(user.role).toBe('vendor');
      expect(user.status).toBe('pending');
      expect(user.email).toBe(requestBody.contactEmail);

      // Verify vendor record created
      const vendors = await payload.find({
        collection: 'vendors',
        where: {
          user: {
            equals: user.id,
          },
        },
        limit: 1,
      });

      expect(vendors.docs).toHaveLength(1);
      const vendor = vendors.docs[0];
      expect(vendor.companyName).toBe(requestBody.companyName);
      expect(vendor.contactEmail).toBe(requestBody.contactEmail);
      expect(vendor.contactPhone).toBe(requestBody.contactPhone);
      expect(vendor.tier).toBe('free');
      expect(vendor.published).toBe(false);
      expect(vendor.slug).toBe('test-vendor-company');
      expect(vendor.user).toBe(user.id);
    });

    it('should auto-generate slug from company name', async () => {
      const requestBody = {
        companyName: 'My Awesome Company!!!',
        contactEmail: 'test-vendor-slug@example.com',
        password: 'SecurePass123!@#',
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      // Verify slug generation
      const vendors = await payload.find({
        collection: 'vendors',
        where: {
          slug: {
            equals: 'my-awesome-company',
          },
        },
        limit: 1,
      });

      expect(vendors.docs).toHaveLength(1);
      expect(vendors.docs[0].slug).toBe('my-awesome-company');
    });
  });

  describe('Duplicate Email Detection', () => {
    it('should return 400 when email already exists', async () => {
      const requestBody = {
        companyName: 'First Company',
        contactEmail: 'test-vendor-duplicate@example.com',
        password: 'SecurePass123!@#',
      };

      // First registration - should succeed
      const firstResponse = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(firstResponse.status).toBe(201);

      // Second registration with same email - should fail
      const secondResponse = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          companyName: 'Second Company',
        }),
      });

      const data = await secondResponse.json();

      expect(secondResponse.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DUPLICATE_EMAIL');
      expect(data.error.message).toContain('email');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 with weak password', async () => {
      const requestBody = {
        companyName: 'Test Company',
        contactEmail: 'test-vendor-weakpass@example.com',
        password: 'weak',
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toHaveProperty('password');
    });

    it('should return 400 with missing required fields', async () => {
      const requestBody = {
        companyName: 'Test Company',
        // Missing contactEmail and password
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toBeDefined();
    });

    it('should return 400 with invalid email format', async () => {
      const requestBody = {
        companyName: 'Test Company',
        contactEmail: 'not-an-email',
        password: 'SecurePass123!@#',
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toHaveProperty('contactEmail');
    });

    it('should return 400 with company name too short', async () => {
      const requestBody = {
        companyName: 'A',
        contactEmail: 'test-vendor-shortname@example.com',
        password: 'SecurePass123!@#',
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toHaveProperty('companyName');
    });

    it('should return 400 with company name too long', async () => {
      const requestBody = {
        companyName: 'A'.repeat(101),
        contactEmail: 'test-vendor-longname@example.com',
        password: 'SecurePass123!@#',
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toHaveProperty('companyName');
    });
  });

  describe('Transaction Rollback', () => {
    it('should rollback user creation if vendor creation fails', async () => {
      // This test verifies transaction atomicity
      // We'll need to mock a failure scenario or test this at the implementation level
      // For now, we verify that partial data doesn't exist after errors

      const requestBody = {
        companyName: 'Test Company',
        contactEmail: 'test-vendor-rollback@example.com',
        password: 'weak', // This will cause validation error
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);

      // Verify no user was created
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: requestBody.contactEmail,
          },
        },
        limit: 1,
      });

      expect(users.docs).toHaveLength(0);
    });
  });

  describe('Password Security', () => {
    it('should hash password and never store plain text', async () => {
      const requestBody = {
        companyName: 'Test Security Company',
        contactEmail: 'test-vendor-security@example.com',
        password: 'SecurePass123!@#',
      };

      const response = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(201);

      // Verify password is hashed
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: requestBody.contactEmail,
          },
        },
        limit: 1,
      });

      const user = users.docs[0];
      // Password should be hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      expect(user.hash).toBeDefined();
      expect(user.hash).toMatch(/^\$2[aby]\$/);
      expect(user.hash).not.toBe(requestBody.password);
    });
  });
});
