# Quality Gates

This is the quality gates specification for the spec detailed in @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md

> Created: 2025-11-04
> Version: 1.0.0

## Overview

Quality gates are checkpoints that must be passed before code can be merged and deployed. This document defines the specific criteria, thresholds, and validation processes for the tier upgrade request system.

## Code Coverage

### Minimum Coverage Requirements

**Overall project coverage:** ≥80%

**Per-component coverage:**
- Service layer: ≥90%
- API endpoints: ≥85%
- UI components: ≥75%
- Utilities/helpers: ≥90%

### Coverage Exclusions

The following are excluded from coverage calculations:
- Type definitions (`.d.ts` files, `interface` declarations)
- Configuration files (`*.config.ts`, `.env`)
- Test utilities and fixtures
- Generated code (Payload CMS types, Prisma client)
- Build scripts

### Coverage Validation

**Automated checks:**
```bash
# Run tests with coverage
npm run test:coverage

# Check coverage thresholds (fails if below targets)
npm run test:coverage:check
```

**CI enforcement:**
```yaml
# GitHub Actions
- name: Check code coverage
  run: |
    npm run test:coverage
    npm run test:coverage:check
  # Fails PR if coverage drops below thresholds
```

**Coverage report artifacts:**
- HTML report: `coverage/lcov-report/index.html`
- LCOV file: `coverage/lcov.info`
- JSON summary: `coverage/coverage-summary.json`

**PR requirements:**
- Coverage report posted as comment on PR
- New code must not decrease overall coverage
- All new files must meet per-component coverage targets

### Coverage Measurement

**Tools:**
- Jest with Istanbul for coverage collection
- Codecov for coverage tracking and visualization
- GitHub Actions for automated checks

**Example Jest configuration:**
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'lib/services/**/*.ts',
    'app/api/**/*.ts',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.ts',
    '!**/__tests__/**'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'lib/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'app/api/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
}
```

## Performance

### API Response Times

**Target SLA (95th percentile):**
- POST request submission: <500ms
- GET request list (vendor): <300ms
- GET request list (admin, 100 requests): <2s
- PATCH approve/reject: <500ms
- DELETE cancel request: <300ms

**Measurement:**
- Use Playwright performance API for E2E tests
- Use k6 or Artillery for load testing
- Track in production with APM (Application Performance Monitoring)

**Load testing scenarios:**
```javascript
// k6 load test
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 50 },  // Spike to 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
  }
}

export default function() {
  let response = http.post(
    'https://api.example.com/api/portal/vendors/123/tier-upgrade-requests',
    JSON.stringify({
      targetTier: 2,
      businessJustification: 'We need more locations...'
    }),
    { headers: { 'Authorization': 'Bearer token' } }
  )

  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500
  })
}
```

### Form Submission End-to-End

**Target:** <1s from submit button click to success message displayed

**Measurement:**
```typescript
// Playwright E2E performance test
test('tier upgrade request submission performance', async ({ page }) => {
  await page.goto('/portal/dashboard')

  const startTime = Date.now()

  await page.click('[data-testid="upgrade-tier-button"]')
  await page.selectOption('[data-testid="target-tier"]', '2')
  await page.fill('[data-testid="justification"]', 'Business justification...')
  await page.click('[data-testid="submit-request"]')

  await page.waitForSelector('[data-testid="success-message"]')

  const endTime = Date.now()
  const duration = endTime - startTime

  expect(duration).toBeLessThan(1000) // Must complete in <1s
})
```

### Admin List Load Performance

**Target:** <2s to load and render list of 100 requests

**Optimization strategies:**
- Implement pagination (default 10 per page, max 100)
- Use database indexes on `status`, `vendorId`, `createdAt`
- Lazy load relationships (vendor, user) only when needed
- Use virtual scrolling for large lists

**Measurement:**
```typescript
test('admin request list load performance', async ({ page }) => {
  // Seed database with 100 requests
  await seedTestRequests(100)

  const startTime = Date.now()

  await page.goto('/admin/tier-upgrade-requests')
  await page.waitForSelector('[data-testid="request-list"]')

  // Wait for all rows to be visible
  await page.waitForSelector('[data-testid="request-row"]')
  const rows = await page.$$('[data-testid="request-row"]')

  const endTime = Date.now()
  const duration = endTime - startTime

  expect(rows.length).toBe(10) // First page
  expect(duration).toBeLessThan(2000) // <2s to load
})
```

### Database Query Performance

**Query optimization:**
- Index on `vendor_id`, `status`, `created_at`
- Use `EXPLAIN ANALYZE` to validate query plans
- Avoid N+1 queries (use eager loading for relationships)

**Example query plan validation:**
```sql
-- Verify index usage for common queries
EXPLAIN ANALYZE
SELECT * FROM tier_upgrade_requests
WHERE vendor_id = '123' AND status = 'pending'
ORDER BY created_at DESC;

-- Expected: Index Scan using idx_tier_upgrade_requests_vendor_status
```

## Security

### Vulnerability Scanning

**Zero high/critical vulnerabilities allowed**

**Tools:**
- `npm audit` - Dependency vulnerability scanning
- Snyk - Real-time vulnerability monitoring
- OWASP ZAP - Dynamic security testing

**Automated checks:**
```bash
# Run on every PR
npm audit --audit-level=moderate

# Fix automatically if possible
npm audit fix

# Manual review required for high/critical
npm audit --audit-level=high
```

**CI enforcement:**
```yaml
- name: Security audit
  run: |
    npm audit --audit-level=moderate
  # Fails PR if moderate+ vulnerabilities found
```

### Input Validation

**All inputs must be validated:**

1. **Type validation** - TypeScript compile-time + runtime checks
2. **Length validation** - Min/max character limits
3. **Format validation** - UUIDs, emails, enums
4. **Sanitization** - XSS prevention, SQL injection prevention

**Validation library:** Zod

**Example validation schema:**
```typescript
import { z } from 'zod'

export const CreateTierUpgradeRequestSchema = z.object({
  targetTier: z.number().int().min(1).max(4),
  businessJustification: z.string()
    .min(50, 'Justification must be at least 50 characters')
    .max(1000, 'Justification must not exceed 1000 characters')
    .trim()
})

// Usage in API endpoint
const body = CreateTierUpgradeRequestSchema.parse(req.body)
// Throws validation error if invalid
```

**Validation coverage:**
- All API request bodies validated with Zod
- All query parameters validated
- All form inputs validated client-side and server-side
- Error messages are clear and actionable

### CSRF Protection

**All mutation endpoints protected:**

**Implementation:**
```typescript
// Next.js API route with CSRF protection
import { csrf } from 'lib/csrf'

export async function POST(req: NextRequest) {
  // Verify CSRF token
  await csrf.verify(req)

  // Process request
  // ...
}
```

**CSRF token flow:**
1. Form renders with hidden CSRF token
2. Token submitted with form data
3. Server validates token matches session
4. Request rejected if token missing/invalid

**Testing:**
```typescript
test('rejects request without CSRF token', async () => {
  const response = await fetch('/api/portal/vendors/123/tier-upgrade-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetTier: 2, businessJustification: '...' })
    // No CSRF token
  })

  expect(response.status).toBe(403)
  expect(await response.json()).toMatchObject({
    error: 'Invalid CSRF token'
  })
})
```

### Rate Limiting

**Enforced on all vendor endpoints:**

**Configuration:**
- POST (submit request): 10 requests/hour per vendor
- GET (list requests): 100 requests/hour per vendor
- Admin endpoints: 1000 requests/hour

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit'

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user.vendorId,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again in an hour.',
      code: 'RATE_LIMIT_EXCEEDED'
    })
  }
})
```

**Testing:**
```typescript
test('rate limits tier upgrade requests', async () => {
  const responses = []

  // Submit 11 requests in a row
  for (let i = 0; i < 11; i++) {
    responses.push(await submitTierUpgradeRequest())
  }

  // First 10 succeed
  expect(responses.slice(0, 10).every(r => r.status === 201)).toBe(true)

  // 11th fails with 429
  expect(responses[10].status).toBe(429)
  expect(responses[10].body.code).toBe('RATE_LIMIT_EXCEEDED')
})
```

### Authentication & Authorization

**Security matrix:**

| Endpoint | Auth Required | Role | Additional Checks |
|----------|---------------|------|-------------------|
| POST /api/portal/vendors/:id/tier-upgrade-requests | Yes | Vendor | Must own vendor |
| GET /api/portal/vendors/:id/tier-upgrade-requests | Yes | Vendor | Must own vendor |
| DELETE /api/portal/vendors/:id/tier-upgrade-requests/:requestId | Yes | Vendor | Must own vendor & request |
| GET /api/admin/tier-upgrade-requests | Yes | Admin | N/A |
| PATCH /api/admin/tier-upgrade-requests/:id/approve | Yes | Admin | N/A |
| PATCH /api/admin/tier-upgrade-requests/:id/reject | Yes | Admin | N/A |

**Testing:**
```typescript
describe('Authorization', () => {
  test('vendor cannot access another vendors requests', async () => {
    const vendor1Token = await getVendorToken('vendor1')
    const vendor2Id = 'vendor2-id'

    const response = await fetch(`/api/portal/vendors/${vendor2Id}/tier-upgrade-requests`, {
      headers: { 'Authorization': `Bearer ${vendor1Token}` }
    })

    expect(response.status).toBe(403)
  })

  test('non-admin cannot approve requests', async () => {
    const vendorToken = await getVendorToken('vendor1')

    const response = await fetch('/api/admin/tier-upgrade-requests/123/approve', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${vendorToken}` }
    })

    expect(response.status).toBe(403)
  })
})
```

## Maintainability

### TypeScript Strict Mode

**Requirement:** All code must pass TypeScript strict mode

**Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**CI enforcement:**
```yaml
- name: TypeScript type check
  run: npm run type-check
  # Fails PR if type errors exist
```

### ESLint Zero Errors

**Requirement:** No ESLint errors allowed (warnings acceptable)

**Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn'
  }
}
```

**CI enforcement:**
```yaml
- name: Lint code
  run: npm run lint -- --max-warnings 0
  # Fails PR if any errors (warnings allowed with flag)
```

### Code Complexity

**Requirement:** Cyclomatic complexity <10 for all functions

**Measurement:**
- Use ESLint plugin: `eslint-plugin-complexity`
- Measure with SonarQube or CodeClimate

**Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  plugins: ['complexity'],
  rules: {
    'complexity': ['error', { max: 10 }]
  }
}
```

**Refactoring strategy for complex functions:**
- Extract helper functions
- Use early returns to reduce nesting
- Replace complex conditionals with lookup tables
- Split large functions into smaller ones

**Example:**
```typescript
// Bad: Complexity = 12
function processRequest(request) {
  if (request.status === 'pending') {
    if (request.targetTier > request.currentTier) {
      if (request.businessJustification.length >= 50) {
        // ... nested logic
      } else {
        // ...
      }
    } else {
      // ...
    }
  } else {
    // ...
  }
}

// Good: Complexity = 3
function processRequest(request) {
  validateRequestStatus(request)
  validateTierProgression(request)
  validateJustification(request)
  return approveRequest(request)
}
```

### Documentation

**Required documentation:**
1. **Inline code comments** - Complex business logic
2. **JSDoc comments** - All exported functions
3. **README updates** - API endpoints, setup instructions
4. **Spec updates** - Any deviations from original spec

**JSDoc example:**
```typescript
/**
 * Approves a tier upgrade request and updates the vendor's tier.
 *
 * @param requestId - The ID of the request to approve
 * @param adminUserId - The ID of the admin approving the request
 * @returns The updated request object
 * @throws {RequestNotFoundError} If request does not exist
 * @throws {InvalidStatusError} If request is not pending
 * @throws {TierUpdateError} If vendor tier update fails
 */
async function approveTierUpgradeRequest(
  requestId: string,
  adminUserId: string
): Promise<TierUpgradeRequest> {
  // Implementation...
}
```

## Automated Checks

### Pre-commit Hooks

**Husky + lint-staged configuration:**

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Checks run on pre-commit:**
- ESLint auto-fix
- Prettier formatting
- Staged files only (fast)

**Checks run on pre-push:**
- TypeScript compilation
- Full test suite
- Coverage check

### Continuous Integration (CI)

**GitHub Actions workflow:**

```yaml
name: Quality Gates

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-gates:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint -- --max-warnings 0

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test -- --coverage

      - name: Check coverage
        run: npm run test:coverage:check

      - name: E2E tests
        run: npm run test:e2e

      - name: Security audit
        run: npm audit --audit-level=moderate

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Comment PR with results
        uses: actions/github-script@v6
        with:
          script: |
            // Post coverage report and test results as PR comment
```

**Required status checks:**
- All jobs must pass before merge allowed
- Branch protection rules enforce this

### Pull Request Checklist

**Automated:**
- [ ] All CI checks pass
- [ ] Code coverage ≥80%
- [ ] No ESLint errors
- [ ] TypeScript compiles without errors
- [ ] No security vulnerabilities (moderate+)

**Manual reviewer checklist:**
- [ ] Code follows project conventions
- [ ] Business logic is correct
- [ ] Error handling is comprehensive
- [ ] Security concerns addressed
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Tests are meaningful (not just for coverage)

## Manual Review

### Code Review Requirements

**All PRs must be reviewed by at least 1 team member**

**Review focus areas:**

1. **Correctness**
   - Logic errors
   - Edge cases handled
   - Error handling comprehensive

2. **Security**
   - Input validation
   - Authorization checks
   - Sensitive data handling

3. **Performance**
   - Database query efficiency
   - N+1 query problems
   - Unnecessary re-renders (React)

4. **Maintainability**
   - Code is readable
   - Naming is clear
   - Complexity is manageable
   - Tests are maintainable

**Review response time:**
- Target: Within 24 hours
- Blocking PRs: Within 4 hours

**Review guidelines:**
- Be constructive and respectful
- Explain *why* (not just *what*)
- Suggest alternatives
- Approve when "good enough" (don't block on nitpicks)

### UX Review

**Required for all UI changes:**

**Reviewer:** Product owner or UX designer

**Checklist:**
- [ ] UI matches design specifications
- [ ] User flows are intuitive
- [ ] Error messages are clear and actionable
- [ ] Loading states are appropriate
- [ ] Success states provide clear feedback
- [ ] Mobile responsive (test on real devices)
- [ ] Accessibility (keyboard navigation, screen readers)

**Review artifacts:**
- Screenshots of all UI states
- Video walkthrough of user flows
- Accessibility audit results

### Security Review

**Required for all PRs touching:**
- Authentication/authorization logic
- User input handling
- Database queries
- External API calls

**Reviewer:** Tech lead or security specialist

**Checklist:**
- [ ] Authentication verified on all protected routes
- [ ] Authorization checks prevent unauthorized access
- [ ] Input sanitization prevents XSS/SQL injection
- [ ] CSRF protection on all mutations
- [ ] Rate limiting prevents abuse
- [ ] Sensitive data not logged
- [ ] Secrets not committed to repo

**Security review tools:**
- Manual code inspection
- OWASP ZAP scan
- Penetration testing (for high-risk changes)

## Definition of Done

A feature is complete when:

**Automated checks:**
- [x] All tests pass (unit, integration, E2E)
- [x] Code coverage ≥80%
- [x] TypeScript compiles without errors
- [x] ESLint passes with zero errors
- [x] No security vulnerabilities (moderate+)
- [x] Performance tests pass
- [x] Build succeeds

**Manual checks:**
- [x] Code reviewed and approved (at least 1 reviewer)
- [x] UX reviewed and approved (for UI changes)
- [x] Security reviewed (for sensitive changes)
- [x] Documentation updated
- [x] Spec deviations documented
- [x] Tested manually in development environment

**Deployment readiness:**
- [x] Feature flag configured (if applicable)
- [x] Rollback plan documented
- [x] Monitoring/alerts configured
- [x] Stakeholder demo completed
- [x] Product owner sign-off

## Rollback Criteria

**Automatic rollback triggers:**
- Error rate >1% (>10 errors per 1000 requests)
- P95 latency >2s (more than 2x SLA)
- Critical bug discovered (data loss, security vulnerability)

**Manual rollback triggers:**
- User reports of critical issues
- Unexpected behavior in production
- Performance degradation
- Stakeholder request

**Rollback process:**
1. Disable feature flag (immediate)
2. Revert deployment (if needed)
3. Investigate root cause
4. Fix issue in development
5. Re-deploy after fix validated

## Monitoring and Alerting

**Metrics to monitor post-deployment:**
- Request submission rate
- Approval/rejection rate
- Average time to review
- Error rates (by endpoint)
- API response times (p50, p95, p99)
- Database query performance

**Alerts to configure:**
- Error rate >0.5% (warning)
- Error rate >1% (critical)
- P95 latency >1s (warning)
- P95 latency >2s (critical)
- Failed tier updates (critical)

**Alerting channels:**
- Slack #engineering-alerts
- PagerDuty (for critical alerts)
- Email to on-call engineer

## Continuous Improvement

**Post-launch review (1 week after deployment):**
- Review metrics and alerts
- Collect user feedback
- Identify performance bottlenecks
- Prioritize bugs and enhancements

**Quarterly quality review:**
- Review test coverage trends
- Analyze flaky tests
- Update quality gate thresholds
- Refactor technical debt

**Quality metrics dashboard:**
- Code coverage over time
- Test execution time trends
- Bug escape rate (bugs found in production)
- Mean time to resolution (MTTR)
- Deployment frequency
- Change failure rate
