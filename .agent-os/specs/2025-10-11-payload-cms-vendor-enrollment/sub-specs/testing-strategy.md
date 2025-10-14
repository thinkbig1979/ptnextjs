# Testing Strategy

This is the testing strategy for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## Testing Framework

**Primary Testing Framework**: Jest 29.x with TypeScript support

**Justification**: Jest is the industry standard for JavaScript/TypeScript testing, has excellent TypeScript support, built-in mocking capabilities, and integrates seamlessly with Next.js. It provides a complete testing solution including test runner, assertion library, and coverage reporting.

**Testing Tool Ecosystem**:
- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing with user-centric queries
- **Playwright**: End-to-end browser testing
- **Supertest**: HTTP API testing
- **MSW (Mock Service Worker)**: API mocking for frontend tests
- **@testing-library/user-event**: User interaction simulation
- **jest-mock-extended**: Enhanced mocking for TypeScript

**Test Runner Configuration**:
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/api/**/*.ts',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
```

## Test Types and Coverage

### Unit Tests: Component-Level Testing Strategy

**Scope**: Individual functions, classes, and React components in isolation

**Target Coverage**: 85%+ for utility functions and services, 80%+ for components

**Test Patterns**:

#### Service Layer Unit Tests
```typescript
// lib/services/vendor-service.test.ts
describe('VendorService', () => {
  describe('validateTierAccess', () => {
    it('should allow free tier vendors to edit basic fields', () => {
      const service = new VendorService()
      const result = service.validateTierAccess('free', ['companyName', 'description'])
      expect(result.allowed).toBe(true)
    })

    it('should prevent free tier vendors from editing tier 1 fields', () => {
      const service = new VendorService()
      const result = service.validateTierAccess('free', ['website', 'certifications'])
      expect(result.allowed).toBe(false)
      expect(result.restrictedFields).toContain('website')
    })

    it('should allow tier 2 vendors to edit all fields', () => {
      const service = new VendorService()
      const result = service.validateTierAccess('tier2', ['companyName', 'website', 'products'])
      expect(result.allowed).toBe(true)
    })
  })
})
```

#### React Component Unit Tests
```typescript
// components/vendor/VendorRegistrationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VendorRegistrationForm from './VendorRegistrationForm'

describe('VendorRegistrationForm', () => {
  it('should render all required fields', () => {
    render(<VendorRegistrationForm />)
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should show validation error for invalid email', async () => {
    render(<VendorRegistrationForm />)
    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'invalid-email')
    fireEvent.blur(emailInput)
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const mockOnSubmit = jest.fn()
    render(<VendorRegistrationForm onSubmit={mockOnSubmit} />)

    await userEvent.type(screen.getByLabelText(/company name/i), 'Test Vendor')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123!')

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        companyName: 'Test Vendor',
        contactEmail: 'test@example.com',
        password: 'SecurePass123!',
      })
    })
  })
})
```

#### Custom Hook Unit Tests
```typescript
// lib/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  it('should initialize with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should update state on successful login', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('vendor@example.com', 'password123')
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toMatchObject({
      email: 'vendor@example.com',
      role: 'vendor',
    })
  })
})
```

### Integration Tests: System Interaction Validation

**Scope**: API endpoints, database interactions, service layer integration

**Target Coverage**: 100% of API routes, 90%+ of integration scenarios

**Test Patterns**:

#### API Route Integration Tests
```typescript
// app/api/vendors/register/route.test.ts
import { POST } from './route'
import { createMocks } from 'node-mocks-http'
import { testDb } from '@/tests/utils/test-db'

describe('POST /api/vendors/register', () => {
  beforeEach(async () => {
    await testDb.clean()
  })

  it('should register a new vendor with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        companyName: 'Test Vendor',
        contactEmail: 'test@example.com',
        password: 'SecurePass123!',
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.vendorId).toBeDefined()
    expect(data.data.status).toBe('pending')
  })

  it('should reject duplicate email registration', async () => {
    // Create existing vendor
    await testDb.vendors.create({
      email: 'existing@example.com',
      companyName: 'Existing Vendor',
      password: 'hashedpassword',
    })

    const { req } = createMocks({
      method: 'POST',
      body: {
        companyName: 'Another Vendor',
        contactEmail: 'existing@example.com',
        password: 'SecurePass123!',
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('DUPLICATE_EMAIL')
  })

  it('should enforce strong password requirements', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        companyName: 'Test Vendor',
        contactEmail: 'test@example.com',
        password: 'weak',
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.fields.password).toMatch(/password must be at least 12 characters/i)
  })
})
```

#### Database Integration Tests
```typescript
// lib/services/vendor-service.integration.test.ts
import { VendorService } from './vendor-service'
import { testDb } from '@/tests/utils/test-db'

describe('VendorService Integration', () => {
  let service: VendorService

  beforeEach(async () => {
    await testDb.clean()
    service = new VendorService()
  })

  it('should create vendor with cascading user creation', async () => {
    const vendorData = {
      companyName: 'Test Vendor',
      contactEmail: 'test@example.com',
      password: 'SecurePass123!',
    }

    const vendor = await service.createVendor(vendorData)

    expect(vendor.id).toBeDefined()
    expect(vendor.userId).toBeDefined()

    // Verify user was created
    const user = await testDb.users.findById(vendor.userId)
    expect(user.email).toBe('test@example.com')
    expect(user.role).toBe('vendor')
    expect(user.status).toBe('pending')
  })

  it('should enforce foreign key constraint on vendor deletion', async () => {
    const vendor = await testDb.vendors.create({
      companyName: 'Test Vendor',
      contactEmail: 'test@example.com',
    })

    await testDb.products.create({
      vendorId: vendor.id,
      name: 'Test Product',
    })

    // Delete vendor should cascade to products
    await service.deleteVendor(vendor.id)

    const products = await testDb.products.findByVendorId(vendor.id)
    expect(products).toHaveLength(0)
  })
})
```

### End-to-End Tests: Complete Workflow Validation

**Scope**: Full user workflows from browser interaction to database

**Target Coverage**: All critical paths, 80%+ of user scenarios

**Test Patterns**:

#### Vendor Registration E2E Test
```typescript
// tests/e2e/vendor-registration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Vendor Registration Flow', () => {
  test('complete vendor registration and approval workflow', async ({ page, context }) => {
    // Step 1: Vendor registers
    await page.goto('/vendor/register')
    await page.fill('[name="companyName"]', 'Marine Tech Solutions')
    await page.fill('[name="contactEmail"]', 'vendor@marinetech.com')
    await page.fill('[name="contactPhone"]', '+1-555-0123')
    await page.fill('[name="password"]', 'SecurePassword123!')
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator('text=Registration submitted for approval')).toBeVisible()
    await expect(page).toHaveURL('/vendor/registration-pending')

    // Step 2: Vendor cannot log in (status=pending)
    await page.goto('/vendor/login')
    await page.fill('[name="email"]', 'vendor@marinetech.com')
    await page.fill('[name="password"]', 'SecurePassword123!')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Account pending approval')).toBeVisible()

    // Step 3: Admin approves vendor (new browser context)
    const adminPage = await context.newPage()
    await adminPage.goto('/admin/login')
    await adminPage.fill('[name="email"]', 'admin@platform.com')
    await adminPage.fill('[name="password"]', 'AdminPass123!')
    await adminPage.click('button[type="submit"]')

    await adminPage.goto('/admin/vendors/pending')
    await adminPage.click('text=Marine Tech Solutions >> .. >> button:has-text("Approve")')
    await adminPage.click('button:has-text("Confirm Approval")')
    await expect(adminPage.locator('text=Vendor approved successfully')).toBeVisible()

    // Step 4: Vendor can now log in
    await page.goto('/vendor/login')
    await page.fill('[name="email"]', 'vendor@marinetech.com')
    await page.fill('[name="password"]', 'SecurePassword123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/vendor/dashboard')
    await expect(page.locator('text=Welcome, Marine Tech Solutions')).toBeVisible()
  })

  test('vendor cannot access tier 2 features with free tier', async ({ page }) => {
    await loginAsVendor(page, 'free-tier@example.com', 'password')
    await page.goto('/vendor/dashboard')

    // Verify products link is not visible (tier 2 only)
    await expect(page.locator('a:has-text("Products")')).not.toBeVisible()

    // Verify tier gate message is displayed
    await expect(page.locator('text=Upgrade to Tier 2 to manage products')).toBeVisible()
  })
})
```

#### Admin Approval Workflow E2E Test
```typescript
// tests/e2e/admin-approval.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Approval Workflow', () => {
  test('admin can approve pending vendor', async ({ page }) => {
    // Setup: Create pending vendor via API
    await createPendingVendor({
      companyName: 'Test Vendor',
      contactEmail: 'test@example.com',
    })

    // Admin logs in
    await loginAsAdmin(page)
    await page.goto('/admin/vendors/pending')

    // Verify vendor appears in list
    await expect(page.locator('td:has-text("Test Vendor")')).toBeVisible()

    // Approve vendor
    await page.click('tr:has-text("Test Vendor") button:has-text("Approve")')
    await page.selectOption('select[name="initialTier"]', 'free')
    await page.click('button:has-text("Confirm")')

    // Verify success
    await expect(page.locator('text=Vendor approved successfully')).toBeVisible()
    await expect(page.locator('td:has-text("Test Vendor")')).not.toBeVisible()
  })

  test('admin can reject vendor with reason', async ({ page }) => {
    await createPendingVendor({
      companyName: 'Suspicious Vendor',
      contactEmail: 'suspicious@example.com',
    })

    await loginAsAdmin(page)
    await page.goto('/admin/vendors/pending')

    await page.click('tr:has-text("Suspicious Vendor") button:has-text("Reject")')
    await page.fill('textarea[name="rejectionReason"]', 'Incomplete company information')
    await page.click('button:has-text("Confirm Rejection")')

    await expect(page.locator('text=Vendor rejected')).toBeVisible()
    await expect(page.locator('td:has-text("Suspicious Vendor")')).not.toBeVisible()
  })
})
```

### Performance Tests: Load and Stress Testing Approach

**Scope**: API response times, concurrent user handling, database query performance

**Target Performance**: < 500ms API response time (95th percentile), 100 concurrent users

**Test Patterns**:

#### Load Testing with k6
```javascript
// tests/performance/vendor-load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 100 }, // Sustain 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
}

export default function () {
  // Test vendor list endpoint
  const listResponse = http.get('https://yourdomain.com/api/vendors?page=1&limit=20')
  check(listResponse, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)

  // Test vendor detail endpoint
  const detailResponse = http.get('https://yourdomain.com/api/vendors/sample-vendor-id')
  check(detailResponse, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  })

  sleep(2)
}
```

#### Database Query Performance Tests
```typescript
// tests/performance/query-performance.test.ts
import { testDb } from '@/tests/utils/test-db'
import { performance } from 'perf_hooks'

describe('Database Query Performance', () => {
  beforeAll(async () => {
    // Seed database with 10,000 vendors
    await testDb.vendors.seedMany(10000)
  })

  it('should fetch paginated vendors in under 100ms', async () => {
    const start = performance.now()
    const vendors = await testDb.vendors.findMany({
      where: { published: true },
      limit: 20,
      offset: 0,
    })
    const duration = performance.now() - start

    expect(duration).toBeLessThan(100)
    expect(vendors).toHaveLength(20)
  })

  it('should search vendors by company name in under 200ms', async () => {
    const start = performance.now()
    const vendors = await testDb.vendors.search('Marine Tech', {
      fields: ['companyName'],
      limit: 50,
    })
    const duration = performance.now() - start

    expect(duration).toBeLessThan(200)
    expect(vendors.length).toBeGreaterThan(0)
  })
})
```

## Test Data Management

### Test Data Creation and Maintenance Strategy

**Test Data Approach**: Fixture-based test data with factories

**Fixture Organization**:
```
tests/
└── fixtures/
    ├── users.json          # Predefined user accounts
    ├── vendors.json        # Sample vendor data
    ├── products.json       # Sample product data
    └── categories.json     # Category hierarchy
```

**Data Factory Pattern**:
```typescript
// tests/factories/vendor-factory.ts
import { Vendor } from '@/lib/types'

export class VendorFactory {
  static create(overrides?: Partial<Vendor>): Vendor {
    return {
      id: generateUUID(),
      companyName: 'Test Vendor',
      slug: 'test-vendor',
      tier: 'free',
      description: 'A test vendor company',
      logo: '/images/test-logo.png',
      contactEmail: 'test@example.com',
      contactPhone: '+1-555-0123',
      published: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    }
  }

  static createMany(count: number, overrides?: Partial<Vendor>): Vendor[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        companyName: `Test Vendor ${i + 1}`,
        slug: `test-vendor-${i + 1}`,
        contactEmail: `vendor${i + 1}@example.com`,
        ...overrides,
      })
    )
  }
}
```

### Mock and Stub Management

**API Mocking with MSW**:
```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.post('/api/vendors/register', (req, res, ctx) => {
    const { companyName, contactEmail } = req.body as any
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          vendorId: 'mock-vendor-id',
          status: 'pending',
        },
      })
    )
  }),

  rest.get('/api/vendors', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          vendors: VendorFactory.createMany(5),
          pagination: {
            page: 1,
            limit: 20,
            total: 5,
            totalPages: 1,
          },
        },
      })
    )
  }),
]

// tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

**Database Mocking for Unit Tests**:
```typescript
// tests/mocks/payload-mock.ts
export const mockPayloadAPI = {
  find: jest.fn().mockResolvedValue({ docs: [], totalDocs: 0 }),
  findByID: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
```

### Test Environment Configuration

**Test Database Setup**:
```typescript
// tests/utils/test-db.ts
import { Client } from 'pg'

export class TestDatabase {
  private client: Client

  async connect() {
    this.client = new Client({
      connectionString: process.env.TEST_DATABASE_URL,
    })
    await this.client.connect()
  }

  async clean() {
    await this.client.query('TRUNCATE users, vendors, products, categories CASCADE')
  }

  async seed() {
    // Insert fixture data
    await this.seedUsers()
    await this.seedVendors()
    await this.seedProducts()
  }

  async disconnect() {
    await this.client.end()
  }
}

export const testDb = new TestDatabase()
```

**Jest Setup File**:
```typescript
// tests/setup.ts
import { testDb } from './utils/test-db'
import { server } from './mocks/server'

// MSW server setup
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Database setup
beforeAll(async () => {
  await testDb.connect()
})

beforeEach(async () => {
  await testDb.clean()
})

afterAll(async () => {
  await testDb.disconnect()
})
```

## Continuous Integration

### Automated Testing Pipeline Integration

**CI/CD Pipeline**:
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: testpassword
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm ci
      - run: npm run test:integration
        env:
          TEST_DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Reporting and Metrics

**Coverage Reporting**:
- Jest generates coverage reports in `coverage/` directory
- Upload to Codecov for trend analysis
- Enforce 80% coverage threshold in CI/CD pipeline

**Test Result Reporting**:
- Jest outputs JUnit XML reports for CI integration
- Playwright generates HTML reports with screenshots and videos
- Test failures block PR merges until resolved

**Performance Metrics**:
- k6 generates detailed performance reports with graphs
- Track API response times over time with trend analysis
- Set up alerts for performance regressions (> 500ms p95)

### Quality Gate Enforcement

**Pre-Merge Requirements**:
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage ≥ 80%
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Performance benchmarks met (< 500ms p95)
- [ ] 1 approving code review

**Post-Merge Monitoring**:
- Monitor error rates in production (< 1% error rate)
- Monitor API response times in production (< 500ms p95)
- Run E2E smoke tests against production after deployment
- Set up alerts for failed health checks or performance degradation

## Testing Best Practices

**General Best Practices**:
- Write tests before or alongside implementation (TDD/BDD)
- Test behavior, not implementation details
- Use descriptive test names that explain what is being tested
- Keep tests focused and isolated (one assertion per test when possible)
- Mock external dependencies to ensure test reliability
- Clean up test data after each test to prevent interference
- Use factories and fixtures for consistent test data
- Run tests frequently during development (watch mode)

**Component Testing Best Practices**:
- Test user-facing behavior, not internal state
- Use Testing Library queries that resemble user interactions
- Avoid testing implementation details (CSS classes, internal methods)
- Test accessibility (screen reader compatibility, keyboard navigation)
- Test responsive behavior on different viewports

**API Testing Best Practices**:
- Test all HTTP methods (GET, POST, PUT, DELETE)
- Test authentication and authorization enforcement
- Test input validation and error responses
- Test rate limiting and security controls
- Use test database with fixtures, clean after each test

**E2E Testing Best Practices**:
- Test critical user paths first (registration, login, core features)
- Test across multiple browsers (Chrome, Firefox, Safari)
- Test on mobile viewports for responsive design
- Use Page Object Model pattern for maintainability
- Run E2E tests in CI/CD but can be slower (run unit tests more frequently)
