# Backend Test Suite Design Document
## Payload CMS Vendor Enrollment System

> **Version:** 1.0
> **Date:** 2025-10-11
> **Target Coverage:** 80%+ for services and critical paths

---

## Executive Summary

This document defines the comprehensive testing strategy for the Payload CMS backend implementation, including unit tests, integration tests, and database tests. The test suite will validate Payload CMS collections, API endpoints, authentication, authorization, tier restrictions, and migration scripts.

**Key Testing Frameworks:**
- **Unit Testing:** Jest with TypeScript
- **API Testing:** Supertest for HTTP endpoint testing
- **Database Testing:** In-memory SQLite for isolated tests
- **Mocking:** Jest mocks for Payload CMS local API

---

## 1. Test Suite Architecture

### 1.1 Testing Pyramid

```
                    E2E Tests (10%)
                 /                  \
           Integration Tests (30%)
          /                          \
     Unit Tests (60%)
```

**Distribution Rationale:**
- **Unit Tests (60%):** Fast, isolated tests for business logic and utilities
- **Integration Tests (30%):** API endpoint tests with real database interactions
- **E2E Tests (10%):** Critical user flows from frontend to database (future: Playwright)

### 1.2 Test Directory Structure

```
/home/edwin/development/ptnextjs/
├── __tests__/
│   ├── setup.ts                          # Global test setup
│   ├── fixtures/                         # Test data fixtures
│   │   ├── users.ts                      # User test data
│   │   ├── vendors.ts                    # Vendor test data
│   │   ├── products.ts                   # Product test data
│   │   └── categories.ts                 # Category test data
│   ├── mocks/                            # Mock implementations
│   │   ├── payload-api.ts                # Payload CMS API mocks
│   │   └── auth.ts                       # Authentication mocks
│   ├── utils/                            # Test utilities
│   │   ├── database.ts                   # Database setup/teardown
│   │   ├── auth-helpers.ts               # JWT token generation for tests
│   │   └── api-client.ts                 # Test API client
│   ├── unit/                             # Unit tests
│   │   ├── services/
│   │   │   ├── vendor-service.test.ts
│   │   │   ├── auth-service.test.ts
│   │   │   ├── approval-service.test.ts
│   │   │   └── migration-service.test.ts
│   │   ├── utils/
│   │   │   ├── tier-validation.test.ts
│   │   │   ├── slug-generation.test.ts
│   │   │   └── password-validation.test.ts
│   │   └── access/
│   │       ├── tier-restrictions.test.ts
│   │       └── rbac.test.ts
│   ├── integration/                      # Integration tests
│   │   ├── api/
│   │   │   ├── vendors/
│   │   │   │   ├── register.test.ts      # POST /api/vendors/register
│   │   │   │   ├── update.test.ts        # PUT /api/vendors/{id}
│   │   │   │   └── list.test.ts          # GET /api/vendors
│   │   │   ├── auth/
│   │   │   │   ├── login.test.ts         # POST /api/auth/login
│   │   │   │   └── refresh.test.ts       # POST /api/auth/refresh
│   │   │   └── admin/
│   │   │       └── vendors/
│   │   │           ├── pending.test.ts   # GET /api/admin/vendors/pending
│   │   │           ├── approve.test.ts   # POST /api/admin/vendors/{id}/approve
│   │   │           └── reject.test.ts    # POST /api/admin/vendors/{id}/reject
│   │   ├── payload/
│   │   │   └── collections/
│   │   │       ├── users.test.ts
│   │   │       ├── vendors.test.ts
│   │   │       ├── products.test.ts
│   │   │       └── categories.test.ts
│   │   └── database/
│   │       ├── relationships.test.ts     # Foreign key constraints
│   │       └── migrations.test.ts        # Schema migrations
│   └── migration/                        # Migration script tests
│       ├── migrate-vendors.test.ts
│       ├── migrate-products.test.ts
│       ├── migrate-categories.test.ts
│       └── validation.test.ts
└── jest.config.js                        # Jest configuration
```

---

## 2. Test Configuration

### 2.1 Jest Configuration

```javascript
// File: /home/edwin/development/ptnextjs/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/payload/(.*)$': '<rootDir>/payload/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'lib/services/**/*.ts',
    'lib/utils/**/*.ts',
    'payload/access/**/*.ts',
    'payload/collections/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  testTimeout: 10000, // 10 seconds for integration tests
};

module.exports = createJestConfig(customJestConfig);
```

### 2.2 Global Test Setup

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/setup.ts
import '@testing-library/jest-dom';
import { setupTestDatabase, teardownTestDatabase } from './utils/database';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'sqlite://./data/test-payload.db';
  process.env.PAYLOAD_SECRET = 'test-secret-key-for-testing-only';

  // Setup test database
  await setupTestDatabase();
});

// Global test teardown
afterAll(async () => {
  await teardownTestDatabase();
});

// Reset database between tests
afterEach(async () => {
  // Clear all collections but preserve schema
  await clearTestData();
});
```

### 2.3 Test Database Utilities

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/utils/database.ts
import { getPayload } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';

let payload: any;

export async function setupTestDatabase() {
  // Initialize Payload with test database
  payload = await getPayload({
    config: {
      db: sqliteAdapter({
        client: {
          url: process.env.DATABASE_URL,
        },
      }),
      collections: [], // Import collections here
    },
  });

  // Run migrations
  await payload.db.migrate();
}

export async function teardownTestDatabase() {
  // Close database connection
  if (payload) {
    await payload.db.destroy();
  }

  // Delete test database file
  const fs = require('fs');
  if (fs.existsSync('./data/test-payload.db')) {
    fs.unlinkSync('./data/test-payload.db');
  }
}

export async function clearTestData() {
  // Delete all records from all collections
  await payload.delete({ collection: 'users', where: {} });
  await payload.delete({ collection: 'vendors', where: {} });
  await payload.delete({ collection: 'products', where: {} });
  await payload.delete({ collection: 'categories', where: {} });
  await payload.delete({ collection: 'blog-posts', where: {} });
  await payload.delete({ collection: 'team-members', where: {} });
  await payload.delete({ collection: 'company-info', where: {} });
}

export function getPayloadInstance() {
  return payload;
}
```

---

## 3. Unit Tests

### 3.1 Service Layer Tests

#### VendorService Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/unit/services/vendor-service.test.ts
import { VendorService } from '@/lib/services/vendor-service';
import { TierRestrictedError, ValidationError } from '@/lib/errors';
import { vendorFixtures } from '@/__tests__/fixtures/vendors';

describe('VendorService', () => {
  let vendorService: VendorService;

  beforeEach(() => {
    vendorService = new VendorService();
  });

  describe('createVendor', () => {
    it('should create a vendor with valid data', async () => {
      const vendorData = vendorFixtures.validFreeVendor;
      const vendor = await vendorService.createVendor(vendorData);

      expect(vendor).toMatchObject({
        company_name: vendorData.company_name,
        slug: expect.stringMatching(/^[a-z0-9-]+$/),
        tier: 'free',
      });
    });

    it('should auto-generate slug from company name', async () => {
      const vendorData = {
        ...vendorFixtures.validFreeVendor,
        company_name: 'Marine Tech Solutions',
      };
      const vendor = await vendorService.createVendor(vendorData);

      expect(vendor.slug).toBe('marine-tech-solutions');
    });

    it('should throw ValidationError for missing required fields', async () => {
      const invalidData = { ...vendorFixtures.validFreeVendor };
      delete invalidData.company_name;

      await expect(vendorService.createVendor(invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for duplicate slug', async () => {
      await vendorService.createVendor(vendorFixtures.validFreeVendor);

      await expect(
        vendorService.createVendor(vendorFixtures.validFreeVendor)
      ).rejects.toThrow('Slug already exists');
    });
  });

  describe('updateVendor', () => {
    it('should update basic fields for free tier vendor', async () => {
      const vendor = await vendorService.createVendor(vendorFixtures.validFreeVendor);
      const updates = { description: 'Updated description' };

      const updatedVendor = await vendorService.updateVendor(vendor.id, updates);

      expect(updatedVendor.description).toBe('Updated description');
    });

    it('should throw TierRestrictedError when free tier tries to set tier1 fields', async () => {
      const vendor = await vendorService.createVendor(vendorFixtures.validFreeVendor);
      const updates = { website: 'https://example.com' }; // Tier 1 field

      await expect(vendorService.updateVendor(vendor.id, updates)).rejects.toThrow(
        TierRestrictedError
      );
    });

    it('should allow tier1 vendor to update enhanced profile fields', async () => {
      const vendor = await vendorService.createVendor(vendorFixtures.validTier1Vendor);
      const updates = {
        website: 'https://example.com',
        linkedin_url: 'https://linkedin.com/company/example',
      };

      const updatedVendor = await vendorService.updateVendor(vendor.id, updates);

      expect(updatedVendor.website).toBe('https://example.com');
      expect(updatedVendor.linkedin_url).toBe('https://linkedin.com/company/example');
    });
  });

  describe('validateTierAccess', () => {
    it('should return true for free tier accessing free tier field', () => {
      const hasAccess = vendorService.validateTierAccess('free', 'description');
      expect(hasAccess).toBe(true);
    });

    it('should return false for free tier accessing tier1 field', () => {
      const hasAccess = vendorService.validateTierAccess('free', 'website');
      expect(hasAccess).toBe(false);
    });

    it('should return true for tier1 accessing tier1 field', () => {
      const hasAccess = vendorService.validateTierAccess('tier1', 'website');
      expect(hasAccess).toBe(true);
    });

    it('should return false for tier1 accessing tier2 field', () => {
      const hasAccess = vendorService.validateTierAccess('tier1', 'products');
      expect(hasAccess).toBe(false);
    });

    it('should return true for tier2 accessing all fields', () => {
      expect(vendorService.validateTierAccess('tier2', 'description')).toBe(true);
      expect(vendorService.validateTierAccess('tier2', 'website')).toBe(true);
      expect(vendorService.validateTierAccess('tier2', 'products')).toBe(true);
    });
  });

  describe('getVendorBySlug', () => {
    it('should return vendor by slug', async () => {
      const createdVendor = await vendorService.createVendor(
        vendorFixtures.validFreeVendor
      );
      const vendor = await vendorService.getVendorBySlug(createdVendor.slug);

      expect(vendor).toMatchObject({
        id: createdVendor.id,
        slug: createdVendor.slug,
      });
    });

    it('should return null for non-existent slug', async () => {
      const vendor = await vendorService.getVendorBySlug('non-existent-slug');
      expect(vendor).toBeNull();
    });
  });
});
```

#### AuthService Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/unit/services/auth-service.test.ts
import { AuthService } from '@/lib/services/auth-service';
import { InvalidCredentialsError, AccountPendingError } from '@/lib/errors';
import { userFixtures } from '@/__tests__/fixtures/users';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      // Create approved user
      const user = await authService.createUser({
        ...userFixtures.approvedVendor,
        password: 'SecurePassword123!',
      });

      const result = await authService.login(user.email, 'SecurePassword123!');

      expect(result).toMatchObject({
        user: {
          id: user.id,
          email: user.email,
          role: 'vendor',
        },
        token: expect.any(String),
      });
    });

    it('should throw InvalidCredentialsError for wrong password', async () => {
      const user = await authService.createUser({
        ...userFixtures.approvedVendor,
        password: 'SecurePassword123!',
      });

      await expect(
        authService.login(user.email, 'WrongPassword')
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError for non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw AccountPendingError for pending user', async () => {
      const user = await authService.createUser({
        ...userFixtures.pendingVendor,
        password: 'SecurePassword123!',
      });

      await expect(
        authService.login(user.email, 'SecurePassword123!')
      ).rejects.toThrow(AccountPendingError);
    });

    it('should throw error for rejected user', async () => {
      const user = await authService.createUser({
        ...userFixtures.rejectedVendor,
        password: 'SecurePassword123!',
      });

      await expect(
        authService.login(user.email, 'SecurePassword123!')
      ).rejects.toThrow('Account has been rejected');
    });
  });

  describe('validateToken', () => {
    it('should return user payload for valid token', async () => {
      const user = await authService.createUser({
        ...userFixtures.approvedVendor,
        password: 'SecurePassword123!',
      });
      const { token } = await authService.login(user.email, 'SecurePassword123!');

      const payload = await authService.validateToken(token);

      expect(payload).toMatchObject({
        id: user.id,
        email: user.email,
        role: 'vendor',
      });
    });

    it('should throw error for expired token', async () => {
      const expiredToken = 'expired-token-here';

      await expect(authService.validateToken(expiredToken)).rejects.toThrow(
        'Token expired'
      );
    });

    it('should throw error for invalid token signature', async () => {
      const invalidToken = 'invalid.token.signature';

      await expect(authService.validateToken(invalidToken)).rejects.toThrow(
        'Invalid token'
      );
    });
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'SecurePassword123!';
      const hash = await authService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // bcrypt uses random salt
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const password = 'SecurePassword123!@#';
      const result = authService.validatePasswordStrength(password);
      expect(result.valid).toBe(true);
    });

    it('should reject password shorter than 12 characters', () => {
      const password = 'Short1!';
      const result = authService.validatePasswordStrength(password);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters');
    });

    it('should reject password without uppercase letter', () => {
      const password = 'lowercase123!';
      const result = authService.validatePasswordStrength(password);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain uppercase letter');
    });

    it('should reject password without number', () => {
      const password = 'SecurePassword!';
      const result = authService.validatePasswordStrength(password);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain number');
    });

    it('should reject password without special character', () => {
      const password = 'SecurePassword123';
      const result = authService.validatePasswordStrength(password);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain special character');
    });
  });
});
```

#### ApprovalService Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/unit/services/approval-service.test.ts
import { ApprovalService } from '@/lib/services/approval-service';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { userFixtures, vendorFixtures } from '@/__tests__/fixtures';

describe('ApprovalService', () => {
  let approvalService: ApprovalService;

  beforeEach(() => {
    approvalService = new ApprovalService();
  });

  describe('getPendingVendors', () => {
    it('should return list of pending vendors', async () => {
      // Create pending vendors
      await createPendingVendor('Vendor 1');
      await createPendingVendor('Vendor 2');

      const result = await approvalService.getPendingVendors();

      expect(result.vendors).toHaveLength(2);
      expect(result.vendors[0].status).toBe('pending');
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
      });
    });

    it('should return empty list when no pending vendors', async () => {
      const result = await approvalService.getPendingVendors();

      expect(result.vendors).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should support pagination', async () => {
      // Create 25 pending vendors
      for (let i = 0; i < 25; i++) {
        await createPendingVendor(`Vendor ${i}`);
      }

      const page1 = await approvalService.getPendingVendors({ page: 1, limit: 10 });
      const page2 = await approvalService.getPendingVendors({ page: 2, limit: 10 });

      expect(page1.vendors).toHaveLength(10);
      expect(page2.vendors).toHaveLength(10);
      expect(page1.pagination.totalPages).toBe(3);
    });
  });

  describe('approveVendor', () => {
    it('should approve vendor and set status to approved', async () => {
      const vendor = await createPendingVendor('Test Vendor');

      const result = await approvalService.approveVendor(vendor.id);

      expect(result.vendor.status).toBe('approved');
      expect(result.vendor.approved_at).toBeDefined();
    });

    it('should set initial tier when approving', async () => {
      const vendor = await createPendingVendor('Test Vendor');

      const result = await approvalService.approveVendor(vendor.id, {
        initialTier: 'tier1',
      });

      expect(result.vendor.tier).toBe('tier1');
    });

    it('should throw NotFoundError for non-existent vendor', async () => {
      await expect(
        approvalService.approveVendor('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw error when approving already approved vendor', async () => {
      const vendor = await createApprovedVendor('Test Vendor');

      await expect(approvalService.approveVendor(vendor.id)).rejects.toThrow(
        'Vendor is already approved'
      );
    });
  });

  describe('rejectVendor', () => {
    it('should reject vendor and set status to rejected', async () => {
      const vendor = await createPendingVendor('Test Vendor');

      const result = await approvalService.rejectVendor(vendor.id, {
        reason: 'Incomplete information',
      });

      expect(result.vendor.status).toBe('rejected');
      expect(result.vendor.rejected_at).toBeDefined();
      expect(result.vendor.rejection_reason).toBe('Incomplete information');
    });

    it('should throw ValidationError when rejection reason is missing', async () => {
      const vendor = await createPendingVendor('Test Vendor');

      await expect(
        approvalService.rejectVendor(vendor.id, { reason: '' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError for non-existent vendor', async () => {
      await expect(
        approvalService.rejectVendor('non-existent-id', {
          reason: 'Test reason',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
```

### 3.2 Utility Function Tests

#### Tier Validation Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/unit/utils/tier-validation.test.ts
import {
  canAccessTier,
  getTierRestrictedFields,
  validateTierUpdate,
} from '@/lib/utils/tier-validation';

describe('Tier Validation Utils', () => {
  describe('canAccessTier', () => {
    it('should allow free tier to access free features', () => {
      expect(canAccessTier('free', 'free')).toBe(true);
    });

    it('should deny free tier access to tier1 features', () => {
      expect(canAccessTier('free', 'tier1')).toBe(false);
    });

    it('should allow tier1 to access tier1 and free features', () => {
      expect(canAccessTier('tier1', 'free')).toBe(true);
      expect(canAccessTier('tier1', 'tier1')).toBe(true);
    });

    it('should deny tier1 access to tier2 features', () => {
      expect(canAccessTier('tier1', 'tier2')).toBe(false);
    });

    it('should allow tier2 to access all features', () => {
      expect(canAccessTier('tier2', 'free')).toBe(true);
      expect(canAccessTier('tier2', 'tier1')).toBe(true);
      expect(canAccessTier('tier2', 'tier2')).toBe(true);
    });
  });

  describe('getTierRestrictedFields', () => {
    it('should return tier1+ fields for free tier', () => {
      const restrictedFields = getTierRestrictedFields('free');
      expect(restrictedFields).toContain('website');
      expect(restrictedFields).toContain('linkedin_url');
      expect(restrictedFields).toContain('certifications');
      expect(restrictedFields).not.toContain('description');
    });

    it('should return tier2 fields for tier1', () => {
      const restrictedFields = getTierRestrictedFields('tier1');
      expect(restrictedFields).not.toContain('website');
      expect(restrictedFields).toContain('products');
    });

    it('should return empty array for tier2', () => {
      const restrictedFields = getTierRestrictedFields('tier2');
      expect(restrictedFields).toHaveLength(0);
    });
  });

  describe('validateTierUpdate', () => {
    it('should pass validation for free tier updating basic fields', () => {
      const updates = { description: 'Updated', contact_email: 'test@example.com' };
      const result = validateTierUpdate('free', updates);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for free tier updating tier1 fields', () => {
      const updates = { website: 'https://example.com' };
      const result = validateTierUpdate('free', updates);
      expect(result.valid).toBe(false);
      expect(result.restrictedFields).toContain('website');
    });

    it('should pass validation for tier1 updating enhanced fields', () => {
      const updates = { website: 'https://example.com', linkedin_url: 'https://linkedin.com' };
      const result = validateTierUpdate('tier1', updates);
      expect(result.valid).toBe(true);
    });
  });
});
```

#### Slug Generation Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/unit/utils/slug-generation.test.ts
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slug-generation';

describe('Slug Generation Utils', () => {
  describe('generateSlug', () => {
    it('should convert spaces to hyphens', () => {
      expect(generateSlug('Marine Navigation System')).toBe('marine-navigation-system');
    });

    it('should convert to lowercase', () => {
      expect(generateSlug('UPPERCASE TEXT')).toBe('uppercase-text');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Company! @#$% Name')).toBe('company-name');
    });

    it('should handle multiple consecutive spaces', () => {
      expect(generateSlug('Multiple    Spaces')).toBe('multiple-spaces');
    });

    it('should trim leading and trailing hyphens', () => {
      expect(generateSlug('  Leading Trailing  ')).toBe('leading-trailing');
    });

    it('should handle Unicode characters', () => {
      expect(generateSlug('Café Résumé')).toBe('cafe-resume');
    });
  });

  describe('ensureUniqueSlug', () => {
    it('should return original slug if unique', async () => {
      const slug = await ensureUniqueSlug('unique-slug', 'vendors');
      expect(slug).toBe('unique-slug');
    });

    it('should append number if slug exists', async () => {
      // Create vendor with slug
      await createVendor({ slug: 'existing-slug' });

      const slug = await ensureUniqueSlug('existing-slug', 'vendors');
      expect(slug).toBe('existing-slug-2');
    });

    it('should increment number for multiple duplicates', async () => {
      await createVendor({ slug: 'duplicate-slug' });
      await createVendor({ slug: 'duplicate-slug-2' });
      await createVendor({ slug: 'duplicate-slug-3' });

      const slug = await ensureUniqueSlug('duplicate-slug', 'vendors');
      expect(slug).toBe('duplicate-slug-4');
    });
  });
});
```

---

## 4. Integration Tests

### 4.1 API Endpoint Tests

#### Vendor Registration Endpoint Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/integration/api/vendors/register.test.ts
import request from 'supertest';
import { app } from '@/app/api';

describe('POST /api/vendors/register', () => {
  it('should register new vendor with valid data', async () => {
    const response = await request(app)
      .post('/api/vendors/register')
      .send({
        companyName: 'Marine Tech Solutions',
        contactEmail: 'contact@marinetech.com',
        contactPhone: '+1-555-0100',
        password: 'SecurePassword123!',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        vendorId: expect.any(String),
        status: 'pending',
        message: 'Registration submitted for admin approval',
      },
    });
  });

  it('should reject registration with weak password', async () => {
    const response = await request(app)
      .post('/api/vendors/register')
      .send({
        companyName: 'Marine Tech Solutions',
        contactEmail: 'contact@marinetech.com',
        password: 'weak',
      })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('password'),
      },
    });
  });

  it('should reject registration with duplicate email', async () => {
    const vendorData = {
      companyName: 'Marine Tech Solutions',
      contactEmail: 'duplicate@marinetech.com',
      password: 'SecurePassword123!',
    };

    // First registration
    await request(app).post('/api/vendors/register').send(vendorData).expect(201);

    // Duplicate registration
    const response = await request(app)
      .post('/api/vendors/register')
      .send(vendorData)
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'DUPLICATE_EMAIL',
        message: 'Email address is already registered',
      },
    });
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/vendors/register')
      .send({
        contactEmail: 'contact@marinetech.com',
        // Missing companyName and password
      })
      .expect(400);

    expect(response.body.error.fields).toHaveProperty('companyName');
    expect(response.body.error.fields).toHaveProperty('password');
  });
});
```

#### Authentication Endpoint Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/integration/api/auth/login.test.ts
import request from 'supertest';
import { app } from '@/app/api';
import { createApprovedVendor } from '@/__tests__/fixtures/vendors';

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const vendor = await createApprovedVendor('Test Vendor', 'SecurePassword123!');

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: vendor.email,
        password: 'SecurePassword123!',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        user: {
          id: vendor.id,
          email: vendor.email,
          role: 'vendor',
          tier: 'free',
        },
        token: expect.any(String),
      },
    });

    // Verify JWT token in cookie
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('access_token');
  });

  it('should reject login with invalid password', async () => {
    const vendor = await createApprovedVendor('Test Vendor', 'SecurePassword123!');

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: vendor.email,
        password: 'WrongPassword',
      })
      .expect(401);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  });

  it('should reject login for pending vendor', async () => {
    const vendor = await createPendingVendor('Test Vendor', 'SecurePassword123!');

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: vendor.email,
        password: 'SecurePassword123!',
      })
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'ACCOUNT_PENDING',
        message: 'Your account is pending admin approval',
      },
    });
  });

  it('should reject login for rejected vendor', async () => {
    const vendor = await createRejectedVendor('Test Vendor', 'SecurePassword123!');

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: vendor.email,
        password: 'SecurePassword123!',
      })
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'ACCOUNT_REJECTED',
        message: 'Your account has been rejected',
      },
    });
  });
});
```

#### Vendor Update Endpoint Tests (Tier Restrictions)

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/integration/api/vendors/update.test.ts
import request from 'supertest';
import { app } from '@/app/api';
import { createApprovedVendor, generateAuthToken } from '@/__tests__/fixtures';

describe('PUT /api/vendors/{id}', () => {
  it('should update basic fields for free tier vendor', async () => {
    const vendor = await createApprovedVendor('Test Vendor', 'free');
    const token = generateAuthToken(vendor.user);

    const response = await request(app)
      .put(`/api/vendors/${vendor.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Updated description',
        contact_phone: '+1-555-0200',
      })
      .expect(200);

    expect(response.body.data.vendor).toMatchObject({
      description: 'Updated description',
      contact_phone: '+1-555-0200',
    });
  });

  it('should reject tier1 field update for free tier vendor', async () => {
    const vendor = await createApprovedVendor('Test Vendor', 'free');
    const token = generateAuthToken(vendor.user);

    const response = await request(app)
      .put(`/api/vendors/${vendor.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        website: 'https://example.com', // Tier 1 field
      })
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'TIER_RESTRICTED',
        message: expect.stringContaining('requires'),
        restrictedFields: ['website'],
      },
    });
  });

  it('should allow tier1 vendor to update enhanced profile fields', async () => {
    const vendor = await createApprovedVendor('Test Vendor', 'tier1');
    const token = generateAuthToken(vendor.user);

    const response = await request(app)
      .put(`/api/vendors/${vendor.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        website: 'https://example.com',
        linkedin_url: 'https://linkedin.com/company/example',
        certifications: ['ISO 9001', 'IMO Certified'],
      })
      .expect(200);

    expect(response.body.data.vendor).toMatchObject({
      website: 'https://example.com',
      linkedin_url: 'https://linkedin.com/company/example',
      certifications: ['ISO 9001', 'IMO Certified'],
    });
  });

  it('should reject unauthorized vendor from updating another vendor', async () => {
    const vendor1 = await createApprovedVendor('Vendor 1', 'free');
    const vendor2 = await createApprovedVendor('Vendor 2', 'free');
    const token = generateAuthToken(vendor1.user);

    const response = await request(app)
      .put(`/api/vendors/${vendor2.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Unauthorized update',
      })
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow admin to update any vendor', async () => {
    const vendor = await createApprovedVendor('Test Vendor', 'free');
    const adminToken = generateAuthToken({ role: 'admin' });

    const response = await request(app)
      .put(`/api/vendors/${vendor.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tier: 'tier1', // Admin can change tier
      })
      .expect(200);

    expect(response.body.data.vendor.tier).toBe('tier1');
  });

  it('should require authentication', async () => {
    const vendor = await createApprovedVendor('Test Vendor', 'free');

    const response = await request(app)
      .put(`/api/vendors/${vendor.id}`)
      .send({
        description: 'Update without auth',
      })
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
```

#### Admin Approval Endpoint Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/integration/api/admin/vendors/approve.test.ts
import request from 'supertest';
import { app } from '@/app/api';
import { createPendingVendor, generateAdminToken } from '@/__tests__/fixtures';

describe('POST /api/admin/vendors/{id}/approve', () => {
  it('should approve pending vendor', async () => {
    const vendor = await createPendingVendor('Test Vendor');
    const adminToken = generateAdminToken();

    const response = await request(app)
      .post(`/api/admin/vendors/${vendor.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        initialTier: 'free',
        welcomeMessage: 'Welcome to the platform!',
      })
      .expect(200);

    expect(response.body.data.vendor).toMatchObject({
      id: vendor.id,
      status: 'approved',
      tier: 'free',
      approved_at: expect.any(String),
    });
  });

  it('should set tier1 when approving', async () => {
    const vendor = await createPendingVendor('Test Vendor');
    const adminToken = generateAdminToken();

    const response = await request(app)
      .post(`/api/admin/vendors/${vendor.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        initialTier: 'tier1',
      })
      .expect(200);

    expect(response.body.data.vendor.tier).toBe('tier1');
  });

  it('should reject non-admin user', async () => {
    const vendor = await createPendingVendor('Test Vendor');
    const vendorToken = generateAuthToken({ role: 'vendor' });

    const response = await request(app)
      .post(`/api/admin/vendors/${vendor.id}/approve`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('should require authentication', async () => {
    const vendor = await createPendingVendor('Test Vendor');

    const response = await request(app)
      .post(`/api/admin/vendors/${vendor.id}/approve`)
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /api/admin/vendors/{id}/reject', () => {
  it('should reject pending vendor with reason', async () => {
    const vendor = await createPendingVendor('Test Vendor');
    const adminToken = generateAdminToken();

    const response = await request(app)
      .post(`/api/admin/vendors/${vendor.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Incomplete company information',
      })
      .expect(200);

    expect(response.body.data.vendor).toMatchObject({
      id: vendor.id,
      status: 'rejected',
      rejection_reason: 'Incomplete company information',
      rejected_at: expect.any(String),
    });
  });

  it('should require rejection reason', async () => {
    const vendor = await createPendingVendor('Test Vendor');
    const adminToken = generateAdminToken();

    const response = await request(app)
      .post(`/api/admin/vendors/${vendor.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields).toHaveProperty('reason');
  });
});
```

### 4.2 Payload CMS Collection Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/integration/payload/collections/vendors.test.ts
import { getPayloadInstance } from '@/__tests__/utils/database';

describe('Vendors Collection', () => {
  let payload: any;

  beforeAll(() => {
    payload = getPayloadInstance();
  });

  describe('Schema Validation', () => {
    it('should create vendor with all required fields', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user_id: 'test-user-id',
          company_name: 'Marine Tech Solutions',
          slug: 'marine-tech-solutions',
          tier: 'free',
          contact_email: 'contact@marinetech.com',
        },
      });

      expect(vendor).toMatchObject({
        id: expect.any(String),
        company_name: 'Marine Tech Solutions',
        slug: 'marine-tech-solutions',
        tier: 'free',
      });
    });

    it('should reject vendor without required fields', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            // Missing company_name, contact_email
            slug: 'incomplete-vendor',
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique slug constraint', async () => {
      await payload.create({
        collection: 'vendors',
        data: {
          user_id: 'test-user-1',
          company_name: 'Vendor 1',
          slug: 'duplicate-slug',
          contact_email: 'vendor1@example.com',
        },
      });

      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user_id: 'test-user-2',
            company_name: 'Vendor 2',
            slug: 'duplicate-slug', // Duplicate slug
            contact_email: 'vendor2@example.com',
          },
        })
      ).rejects.toThrow('Slug already exists');
    });

    it('should validate tier enum values', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user_id: 'test-user-id',
            company_name: 'Test Vendor',
            slug: 'test-vendor',
            tier: 'invalid-tier', // Invalid tier value
            contact_email: 'test@example.com',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Relationships', () => {
    it('should link vendor to user via user_id', async () => {
      const user = await payload.create({
        collection: 'users',
        data: {
          email: 'vendor@example.com',
          password: 'SecurePassword123!',
          role: 'vendor',
          status: 'approved',
        },
      });

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user_id: user.id,
          company_name: 'Test Vendor',
          slug: 'test-vendor',
          contact_email: 'vendor@example.com',
        },
      });

      expect(vendor.user_id).toBe(user.id);
    });

    it('should cascade delete vendor when user is deleted', async () => {
      const user = await payload.create({
        collection: 'users',
        data: {
          email: 'cascade@example.com',
          password: 'SecurePassword123!',
          role: 'vendor',
          status: 'approved',
        },
      });

      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          user_id: user.id,
          company_name: 'Cascade Vendor',
          slug: 'cascade-vendor',
          contact_email: 'cascade@example.com',
        },
      });

      // Delete user
      await payload.delete({ collection: 'users', id: user.id });

      // Verify vendor is also deleted
      const deletedVendor = await payload.findByID({
        collection: 'vendors',
        id: vendor.id,
      });

      expect(deletedVendor).toBeNull();
    });
  });

  describe('Access Control', () => {
    it('should allow admin to read all vendors', async () => {
      const vendors = await payload.find({
        collection: 'vendors',
        user: { role: 'admin' },
      });

      expect(vendors.docs).toBeDefined();
    });

    it('should restrict vendor to read only own profile', async () => {
      const vendor1 = await createVendor('Vendor 1');
      const vendor2 = await createVendor('Vendor 2');

      const result = await payload.find({
        collection: 'vendors',
        user: { role: 'vendor', vendorId: vendor1.id },
      });

      // Vendor should only see their own profile
      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].id).toBe(vendor1.id);
    });
  });
});
```

### 4.3 Database Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/integration/database/relationships.test.ts
import { getPayloadInstance } from '@/__tests__/utils/database';

describe('Database Relationships', () => {
  let payload: any;

  beforeAll(() => {
    payload = getPayloadInstance();
  });

  describe('Foreign Key Constraints', () => {
    it('should enforce foreign key constraint on vendor.user_id', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            user_id: 'non-existent-user-id',
            company_name: 'Test Vendor',
            slug: 'test-vendor',
            contact_email: 'test@example.com',
          },
        })
      ).rejects.toThrow('Foreign key constraint');
    });

    it('should enforce foreign key constraint on product.vendor_id', async () => {
      await expect(
        payload.create({
          collection: 'products',
          data: {
            vendor_id: 'non-existent-vendor-id',
            name: 'Test Product',
            slug: 'test-product',
          },
        })
      ).rejects.toThrow('Foreign key constraint');
    });

    it('should enforce foreign key constraint on category.parent_id', async () => {
      await expect(
        payload.create({
          collection: 'categories',
          data: {
            name: 'Test Category',
            slug: 'test-category',
            parent_id: 'non-existent-category-id',
          },
        })
      ).rejects.toThrow('Foreign key constraint');
    });
  });

  describe('Cascading Deletes', () => {
    it('should cascade delete products when vendor is deleted', async () => {
      const vendor = await createVendor('Test Vendor');
      const product = await createProduct('Test Product', vendor.id);

      // Delete vendor
      await payload.delete({ collection: 'vendors', id: vendor.id });

      // Verify product is deleted
      const deletedProduct = await payload.findByID({
        collection: 'products',
        id: product.id,
      });

      expect(deletedProduct).toBeNull();
    });

    it('should set null on blog_post.author_id when user is deleted', async () => {
      const user = await createUser({ role: 'admin' });
      const blogPost = await createBlogPost('Test Post', user.id);

      // Delete user
      await payload.delete({ collection: 'users', id: user.id });

      // Verify blog post still exists but author_id is null
      const updatedPost = await payload.findByID({
        collection: 'blog-posts',
        id: blogPost.id,
      });

      expect(updatedPost).toBeDefined();
      expect(updatedPost.author_id).toBeNull();
    });
  });

  describe('Index Performance', () => {
    it('should use index for slug lookup', async () => {
      // Create many vendors
      for (let i = 0; i < 1000; i++) {
        await createVendor(`Vendor ${i}`);
      }

      const startTime = Date.now();
      const vendor = await payload.find({
        collection: 'vendors',
        where: { slug: { equals: 'vendor-500' } },
      });
      const duration = Date.now() - startTime;

      expect(vendor.docs).toHaveLength(1);
      expect(duration).toBeLessThan(100); // Should be fast with index
    });

    it('should use index for status filtering', async () => {
      const startTime = Date.now();
      const pendingVendors = await payload.find({
        collection: 'users',
        where: {
          status: { equals: 'pending' },
        },
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // Fast with index
    });
  });
});
```

---

## 5. Migration Script Tests

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/migration/migrate-vendors.test.ts
import { migrateVendors } from '@/scripts/migration/migrate-vendors';
import { readMarkdownFiles } from '@/scripts/migration/utils/markdown-parser';
import { validateMigration } from '@/scripts/migration/utils/validation';

describe('Vendor Migration', () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearTestData();
  });

  describe('Markdown Parsing', () => {
    it('should parse vendor markdown files', async () => {
      const files = await readMarkdownFiles('content/vendors');
      expect(files.length).toBeGreaterThan(0);
      expect(files[0]).toHaveProperty('frontmatter');
      expect(files[0]).toHaveProperty('content');
    });

    it('should extract vendor fields from frontmatter', () => {
      const markdown = `---
name: Marine Tech Solutions
description: Leading provider of marine navigation systems
logo: /images/vendors/logo.png
website: https://marinetech.com
partner: true
---

Additional vendor content here.`;

      const parsed = parseMarkdown(markdown);
      expect(parsed.frontmatter).toMatchObject({
        name: 'Marine Tech Solutions',
        description: expect.any(String),
        partner: true,
      });
    });
  });

  describe('Data Transformation', () => {
    it('should transform TinaCMS vendor to Payload CMS format', () => {
      const tinaCMSVendor = {
        name: 'Marine Tech Solutions',
        description: 'Test description',
        logo: '/images/vendors/logo.png',
        partner: true,
      };

      const payloadVendor = transformVendorData(tinaCMSVendor);

      expect(payloadVendor).toMatchObject({
        company_name: 'Marine Tech Solutions',
        description: 'Test description',
        logo: '/media/logo.png', // Transformed path
        tier: 'tier1', // partner=true → tier1
      });
    });

    it('should auto-generate slug if missing', () => {
      const tinaCMSVendor = {
        name: 'Marine Navigation Systems',
        description: 'Test',
      };

      const payloadVendor = transformVendorData(tinaCMSVendor);
      expect(payloadVendor.slug).toBe('marine-navigation-systems');
    });

    it('should map partner flag to tier', () => {
      const partner = transformVendorData({ name: 'Partner', partner: true });
      const vendor = transformVendorData({ name: 'Vendor', partner: false });

      expect(partner.tier).toBe('tier1');
      expect(vendor.tier).toBe('free');
    });
  });

  describe('Migration Execution', () => {
    it('should migrate all vendors successfully', async () => {
      const result = await migrateVendors();

      expect(result.success).toBeGreaterThan(0);
      expect(result.errors).toBe(0);
      expect(result.skipped).toBe(0);
    });

    it('should handle missing optional fields', async () => {
      const vendorData = {
        name: 'Minimal Vendor',
        description: 'Test',
        // Missing logo, website, etc.
      };

      const result = await migrateVendor(vendorData);
      expect(result.success).toBe(true);
    });

    it('should skip vendors with missing required fields', async () => {
      const invalidVendor = {
        description: 'Test',
        // Missing name (required)
      };

      const result = await migrateVendor(invalidVendor);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required field: name');
    });

    it('should handle duplicate slugs by auto-incrementing', async () => {
      await createVendor({ slug: 'duplicate-vendor' });

      const result = await migrateVendor({
        name: 'Duplicate Vendor',
        slug: 'duplicate-vendor',
      });

      expect(result.success).toBe(true);
      expect(result.vendor.slug).toBe('duplicate-vendor-2');
    });
  });

  describe('Validation', () => {
    it('should validate all vendors migrated', async () => {
      const markdownFiles = await readMarkdownFiles('content/vendors');
      await migrateVendors();

      const validation = await validateMigration('vendors');

      expect(validation.success).toBe(true);
      expect(validation.sourceCount).toBe(markdownFiles.length);
      expect(validation.targetCount).toBe(markdownFiles.length);
    });

    it('should detect missing vendors', async () => {
      const markdownFiles = await readMarkdownFiles('content/vendors');
      await migrateVendors();

      // Delete one vendor from database
      const vendors = await getPayloadInstance().find({ collection: 'vendors' });
      await getPayloadInstance().delete({
        collection: 'vendors',
        id: vendors.docs[0].id,
      });

      const validation = await validateMigration('vendors');

      expect(validation.success).toBe(false);
      expect(validation.missingRecords).toHaveLength(1);
    });
  });

  describe('Rollback', () => {
    it('should rollback migration on error', async () => {
      // Force migration error
      jest.spyOn(console, 'error').mockImplementation();
      const mockCreate = jest.fn().mockRejectedValue(new Error('Database error'));
      getPayloadInstance().create = mockCreate;

      await expect(migrateVendors()).rejects.toThrow();

      // Verify no partial data left in database
      const vendors = await getPayloadInstance().find({ collection: 'vendors' });
      expect(vendors.docs).toHaveLength(0);
    });
  });
});
```

---

## 6. Test Fixtures

### 6.1 User Fixtures

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/fixtures/users.ts
export const userFixtures = {
  approvedVendor: {
    email: 'vendor@example.com',
    role: 'vendor',
    status: 'approved',
  },
  pendingVendor: {
    email: 'pending@example.com',
    role: 'vendor',
    status: 'pending',
  },
  rejectedVendor: {
    email: 'rejected@example.com',
    role: 'vendor',
    status: 'rejected',
    rejection_reason: 'Incomplete information',
  },
  admin: {
    email: 'admin@example.com',
    role: 'admin',
    status: 'approved',
  },
};
```

### 6.2 Vendor Fixtures

```typescript
// File: /home/edwin/development/ptnextjs/__tests__/fixtures/vendors.ts
export const vendorFixtures = {
  validFreeVendor: {
    company_name: 'Marine Tech Solutions',
    slug: 'marine-tech-solutions',
    tier: 'free',
    description: 'Leading provider of marine technology',
    contact_email: 'contact@marinetech.com',
    contact_phone: '+1-555-0100',
  },
  validTier1Vendor: {
    company_name: 'Advanced Marine Systems',
    slug: 'advanced-marine-systems',
    tier: 'tier1',
    description: 'Premium marine systems provider',
    contact_email: 'info@advancedmarine.com',
    website: 'https://advancedmarine.com',
    linkedin_url: 'https://linkedin.com/company/advanced-marine',
    certifications: ['ISO 9001', 'IMO Certified'],
  },
  validTier2Vendor: {
    company_name: 'Elite Yacht Technology',
    slug: 'elite-yacht-technology',
    tier: 'tier2',
    description: 'Full-service yacht technology solutions',
    contact_email: 'sales@eliteyacht.com',
    website: 'https://eliteyacht.com',
    linkedin_url: 'https://linkedin.com/company/elite-yacht',
    certifications: ['ISO 9001', 'CE Marked'],
  },
};

export async function createPendingVendor(name: string, password = 'SecurePassword123!') {
  // Implementation here
}

export async function createApprovedVendor(name: string, tier = 'free') {
  // Implementation here
}
```

---

## 7. Test Execution Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- __tests__/unit/services/vendor-service.test.ts
npm test -- __tests__/integration/api/vendors/

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run only integration tests
npm test -- --testPathPattern=integration

# Run only unit tests
npm test -- --testPathPattern=unit
```

---

## 8. Continuous Integration

### 8.1 GitHub Actions Workflow

```yaml
# File: .github/workflows/test.yml
name: Backend Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm test -- --testPathPattern=unit --coverage

      - name: Run integration tests
        run: npm test -- --testPathPattern=integration

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: backend
```

---

## 9. Success Criteria

### 9.1 Test Coverage Goals

✅ **Unit Test Coverage**
- Services: 90%+ coverage
- Utilities: 85%+ coverage
- Access Control: 90%+ coverage

✅ **Integration Test Coverage**
- All API endpoints tested
- All Payload CMS collections tested
- Database relationships validated
- Migration scripts tested

✅ **E2E Test Coverage** (Future)
- Critical user flows tested
- Error scenarios validated

### 9.2 Quality Gates

✅ **All Tests Pass**
- Zero failing tests in CI/CD pipeline
- All critical paths covered

✅ **Performance Benchmarks**
- Unit tests complete in < 10 seconds
- Integration tests complete in < 60 seconds
- Database tests complete in < 30 seconds

✅ **Code Quality**
- TypeScript strict mode enabled
- No linting errors
- No type errors

---

**Document Status:** ✅ Complete
**Review Status:** Pending User Verification
**Next Action:** Proceed to Task 3 (impl-payload-install)
