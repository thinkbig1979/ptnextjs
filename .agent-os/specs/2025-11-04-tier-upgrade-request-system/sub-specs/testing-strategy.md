# Testing Strategy

This is the testing strategy for the spec detailed in @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md

> Created: 2025-11-04
> Version: 1.0.0

## Testing Framework

### Primary tools:
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **Supertest** - API endpoint testing
- **MSW (Mock Service Worker)** - API mocking for frontend tests

### Test environments:
- **Development**: Local SQLite database with seed data
- **CI/CD**: Isolated SQLite database per test run
- **E2E**: Dedicated test environment with full stack

## Test Types

### 1. Unit Tests (Jest)

**Scope**: Individual functions, utilities, and business logic

**Target coverage**: 90%+

**What to test:**

**Service layer (`lib/services/TierUpgradeRequestService.ts`):**
```typescript
describe('TierUpgradeRequestService', () => {
  describe('validateRequest', () => {
    it('rejects request if vendor already has pending request')
    it('rejects request if target tier is lower than current tier')
    it('rejects request if target tier does not exist')
    it('accepts valid request with proper tier progression')
  })

  describe('create', () => {
    it('creates tier upgrade request with correct initial status')
    it('throws error if vendor has pending request')
    it('throws error if vendor does not exist')
    it('stores business justification correctly')
  })

  describe('approve', () => {
    it('updates vendor tier and request status atomically')
    it('stores reviewer user ID and timestamp')
    it('throws error if request already processed')
    it('throws error if request does not exist')
  })

  describe('reject', () => {
    it('updates request status to rejected with reason')
    it('does not change vendor tier')
    it('stores reviewer user ID and timestamp')
    it('requires rejection reason')
  })

  describe('cancel', () => {
    it('updates request status to cancelled')
    it('only allows cancellation of pending requests')
    it('throws error if request does not exist')
  })
})
```

**Validation utilities:**
```typescript
describe('tierValidation', () => {
  describe('canUpgradeToTier', () => {
    it('allows upgrade to next tier')
    it('allows skipping tiers')
    it('prevents downgrade')
    it('prevents upgrade to same tier')
  })

  describe('validateBusinessJustification', () => {
    it('rejects justification shorter than 50 characters')
    it('rejects justification longer than 1000 characters')
    it('accepts valid justification')
    it('trims whitespace')
  })
})
```

**Data transformers:**
```typescript
describe('TierUpgradeRequestTransformer', () => {
  it('transforms Payload document to TierUpgradeRequest')
  it('resolves vendor relationship')
  it('resolves user relationship')
  it('resolves reviewedBy relationship')
  it('handles missing relationships gracefully')
})
```

### 2. Integration Tests (Jest + Supertest)

**Scope**: API endpoints + database interactions

**Target coverage**: 85%+

**What to test:**

**Vendor API endpoints:**
```typescript
describe('POST /api/portal/vendors/:id/tier-upgrade-requests', () => {
  it('creates tier upgrade request for authenticated vendor')
  it('returns 401 if not authenticated')
  it('returns 403 if vendor ID does not match authenticated user')
  it('returns 400 if validation fails')
  it('returns 409 if vendor already has pending request')
  it('rate limits to 10 requests per hour')
  it('stores request in database with correct fields')
})

describe('GET /api/portal/vendors/:id/tier-upgrade-requests', () => {
  it('returns all requests for vendor')
  it('returns 401 if not authenticated')
  it('returns 403 if vendor ID does not match authenticated user')
  it('sorts by createdAt descending')
  it('includes vendor and reviewer relationships')
})

describe('DELETE /api/portal/vendors/:id/tier-upgrade-requests/:requestId', () => {
  it('cancels pending request')
  it('returns 401 if not authenticated')
  it('returns 403 if vendor ID does not match authenticated user')
  it('returns 400 if request is not pending')
  it('returns 404 if request does not exist')
  it('updates status to cancelled in database')
})
```

**Admin API endpoints:**
```typescript
describe('GET /api/admin/tier-upgrade-requests', () => {
  it('returns all requests for admin user')
  it('returns 401 if not authenticated')
  it('returns 403 if user is not admin')
  it('filters by status query parameter')
  it('filters by tier query parameter')
  it('filters by date range')
  it('paginates results')
  it('includes vendor and reviewer relationships')
})

describe('PATCH /api/admin/tier-upgrade-requests/:id/approve', () => {
  it('approves request and updates vendor tier')
  it('returns 401 if not authenticated')
  it('returns 403 if user is not admin')
  it('returns 400 if request is not pending')
  it('returns 404 if request does not exist')
  it('updates both request status and vendor tier atomically')
  it('stores reviewer user ID and timestamp')
  it('sends email notification to vendor')
})

describe('PATCH /api/admin/tier-upgrade-requests/:id/reject', () => {
  it('rejects request with reason')
  it('returns 401 if not authenticated')
  it('returns 403 if user is not admin')
  it('returns 400 if request is not pending')
  it('returns 400 if rejection reason is missing')
  it('returns 404 if request does not exist')
  it('does not change vendor tier')
  it('stores reviewer user ID and timestamp')
  it('sends email notification to vendor')
})
```

**Database integrity:**
```typescript
describe('Database transactions', () => {
  it('rolls back tier update if request status update fails')
  it('rolls back request status if tier update fails')
  it('prevents duplicate pending requests via constraint')
  it('cascades delete when vendor is deleted')
})
```

### 3. Component Tests (React Testing Library)

**Scope**: UI components in isolation

**Target coverage**: 75%+

**What to test:**

**TierUpgradeCard:**
```typescript
describe('TierUpgradeCard', () => {
  it('renders current tier information')
  it('shows upgrade CTA if no pending request')
  it('shows pending status if request is pending')
  it('shows approved status if request was approved')
  it('shows rejected status with reason if request was rejected')
  it('opens request form modal on CTA click')
  it('disables CTA if already at highest tier')
})
```

**TierUpgradeRequestForm:**
```typescript
describe('TierUpgradeRequestForm', () => {
  it('renders all form fields')
  it('validates target tier selection')
  it('validates business justification length')
  it('shows character count for justification')
  it('disables submit button while submitting')
  it('shows success message on successful submission')
  it('shows error message on failed submission')
  it('closes modal on cancel')
  it('clears form on successful submission')
})
```

**TierComparisonTable:**
```typescript
describe('TierComparisonTable', () => {
  it('renders all tier columns')
  it('highlights current tier')
  it('highlights target tier')
  it('shows all feature rows')
  it('indicates feature availability correctly')
  it('is responsive on mobile')
})
```

**Admin components:**
```typescript
describe('TierUpgradeRequestList', () => {
  it('renders table with all requests')
  it('filters by status')
  it('filters by tier')
  it('sorts by column click')
  it('shows pagination controls')
  it('navigates to detail view on row click')
})

describe('TierUpgradeRequestDetail', () => {
  it('renders request details')
  it('shows approve/reject buttons for pending requests')
  it('disables buttons for processed requests')
  it('shows confirmation dialog on approve')
  it('shows rejection reason input on reject')
  it('submits approval successfully')
  it('submits rejection with reason successfully')
})
```

### 4. End-to-End Tests (Playwright)

**Scope**: Complete user journeys through the application

**Target coverage**: Critical paths only

**What to test:**

**Vendor flow:**
```typescript
describe('Vendor tier upgrade request', () => {
  test('complete upgrade request submission flow', async ({ page }) => {
    // 1. Login as vendor
    // 2. Navigate to dashboard
    // 3. See current tier (Tier 1)
    // 4. Click "Upgrade Tier" button
    // 5. Select target tier (Tier 2)
    // 6. Enter business justification
    // 7. Submit form
    // 8. See success message
    // 9. See pending status on dashboard
  })

  test('cannot submit duplicate pending request', async ({ page }) => {
    // 1. Login as vendor with pending request
    // 2. Navigate to dashboard
    // 3. See pending status (no upgrade CTA)
    // 4. Verify upgrade button is disabled/hidden
  })

  test('cancel pending request', async ({ page }) => {
    // 1. Login as vendor with pending request
    // 2. Navigate to dashboard
    // 3. Click "Cancel Request" button
    // 4. Confirm cancellation
    // 5. See success message
    // 6. Upgrade CTA reappears
  })

  test('see approved request and updated tier', async ({ page }) => {
    // 1. Login as vendor with approved request
    // 2. Navigate to dashboard
    // 3. See "Request Approved" status
    // 4. See updated tier badge (Tier 2)
    // 5. Verify new tier features are accessible
  })

  test('see rejected request with reason', async ({ page }) => {
    // 1. Login as vendor with rejected request
    // 2. Navigate to dashboard
    // 3. See "Request Rejected" status
    // 4. See admin rejection reason
    // 5. Upgrade CTA reappears (can submit new request)
  })
})
```

**Admin flow:**
```typescript
describe('Admin tier upgrade request management', () => {
  test('approve tier upgrade request', async ({ page }) => {
    // 1. Login as admin
    // 2. Navigate to tier upgrade requests
    // 3. See list of pending requests
    // 4. Click on pending request
    // 5. Review vendor details and justification
    // 6. Click "Approve" button
    // 7. Confirm approval
    // 8. See success message
    // 9. Verify request status updated to "Approved"
    // 10. Verify vendor tier updated in database
  })

  test('reject tier upgrade request with reason', async ({ page }) => {
    // 1. Login as admin
    // 2. Navigate to tier upgrade requests
    // 3. Click on pending request
    // 4. Click "Reject" button
    // 5. Enter rejection reason
    // 6. Confirm rejection
    // 7. See success message
    // 8. Verify request status updated to "Rejected"
    // 9. Verify vendor tier unchanged
  })

  test('filter requests by status', async ({ page }) => {
    // 1. Login as admin
    // 2. Navigate to tier upgrade requests
    // 3. Select "Pending" filter
    // 4. Verify only pending requests shown
    // 5. Select "Approved" filter
    // 6. Verify only approved requests shown
  })

  test('bulk approve multiple requests', async ({ page }) => {
    // 1. Login as admin
    // 2. Navigate to tier upgrade requests
    // 3. Select multiple pending requests
    // 4. Click "Approve Selected" button
    // 5. Confirm bulk approval
    // 6. Verify all selected requests approved
    // 7. Verify all vendor tiers updated
  })
})
```

**Error scenarios:**
```typescript
describe('Error handling', () => {
  test('handles API error gracefully', async ({ page }) => {
    // 1. Mock API to return 500 error
    // 2. Attempt to submit request
    // 3. See user-friendly error message
    // 4. Form state preserved (can retry)
  })

  test('handles network timeout', async ({ page }) => {
    // 1. Mock slow network
    // 2. Attempt to submit request
    // 3. See loading indicator
    // 4. Eventually see timeout error
    // 5. Can retry submission
  })

  test('unauthorized access redirects to login', async ({ page }) => {
    // 1. Navigate to dashboard without login
    // 2. Redirected to login page
    // 3. After login, redirected back to dashboard
  })
})
```

## Coverage Targets

### Minimum coverage requirements:
- **Service layer**: 90%+
- **API endpoints**: 85%+
- **UI components**: 75%+
- **Overall project**: 80%+

### Coverage enforcement:
- CI pipeline fails if coverage drops below targets
- Coverage reports generated on every PR
- Coverage badges in README

### Coverage exclusions:
- Type definitions
- Configuration files
- Test utilities
- Generated code

## Test Data

### Seed data helpers:

**Test vendors:**
```typescript
const testVendors = {
  tier1Vendor: {
    id: 'test-vendor-tier1',
    name: 'Test Vendor Tier 1',
    tier: 1,
    email: 'tier1@test.com'
  },
  tier2Vendor: {
    id: 'test-vendor-tier2',
    name: 'Test Vendor Tier 2',
    tier: 2,
    email: 'tier2@test.com'
  },
  tier4Vendor: {
    id: 'test-vendor-tier4',
    name: 'Test Vendor Tier 4',
    tier: 4,
    email: 'tier4@test.com'
  }
}
```

**Test requests:**
```typescript
const testRequests = {
  pendingRequest: {
    id: 'test-request-pending',
    vendorId: 'test-vendor-tier1',
    currentTier: 1,
    targetTier: 2,
    status: 'pending',
    businessJustification: 'We need more locations...'
  },
  approvedRequest: {
    id: 'test-request-approved',
    vendorId: 'test-vendor-tier1',
    currentTier: 1,
    targetTier: 2,
    status: 'approved',
    reviewedBy: 'test-admin',
    reviewedAt: '2025-11-01T10:00:00Z'
  },
  rejectedRequest: {
    id: 'test-request-rejected',
    vendorId: 'test-vendor-tier1',
    currentTier: 1,
    targetTier: 2,
    status: 'rejected',
    reviewedBy: 'test-admin',
    reviewedAt: '2025-11-01T10:00:00Z',
    rejectionReason: 'Insufficient business case'
  }
}
```

**Test users:**
```typescript
const testUsers = {
  admin: {
    id: 'test-admin',
    email: 'admin@test.com',
    role: 'admin'
  },
  vendor: {
    id: 'test-vendor-user',
    email: 'vendor@test.com',
    role: 'vendor',
    vendorId: 'test-vendor-tier1'
  }
}
```

### Seed scripts:
- `scripts/seed-test-data.ts` - Populate test database
- `scripts/reset-test-data.ts` - Clear test database
- `scripts/generate-test-requests.ts` - Generate sample requests for load testing

## CI Integration

### GitHub Actions workflow:

```yaml
name: Test Suite

on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test -- --coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Check coverage threshold
        run: npm run test:coverage:check
```

### Pre-commit hooks:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run type-check",
      "pre-push": "npm run test"
    }
  }
}
```

### Merge requirements:
- All tests must pass
- Coverage must meet thresholds
- No linting errors
- Type checking passes
- At least 1 approval from code reviewer

## Key Test Scenarios

### Priority 1: Critical path (must pass for MVP)

1. **Vendor submits valid upgrade request**
   - Vendor logged in, current tier 1, no pending requests
   - Submits request for tier 2 with valid justification
   - Request created with status "pending"
   - Vendor sees pending status on dashboard

2. **Cannot submit duplicate pending request**
   - Vendor has existing pending request
   - Upgrade CTA disabled/hidden
   - API returns 409 if attempted via direct API call

3. **Admin approves request → tier updates**
   - Admin reviews pending request
   - Clicks approve button
   - Request status changes to "approved"
   - Vendor tier updates to target tier
   - Both updates happen atomically (no partial update)

4. **Admin rejects request → vendor sees reason**
   - Admin reviews pending request
   - Clicks reject button, enters reason
   - Request status changes to "rejected"
   - Vendor tier unchanged
   - Vendor sees rejection reason on dashboard

5. **Vendor cancels pending request**
   - Vendor has pending request
   - Clicks cancel button
   - Request status changes to "cancelled"
   - Upgrade CTA reappears

6. **Unauthorized access attempts fail**
   - Unauthenticated user cannot access APIs
   - Vendor cannot access other vendor's requests
   - Non-admin cannot access admin APIs

### Priority 2: Edge cases (should pass for production)

7. **Race condition: concurrent request submissions**
   - Two simultaneous requests from same vendor
   - Only one succeeds, other gets 409 error
   - Database constraint prevents duplicates

8. **Transaction rollback on partial failure**
   - Approval updates request status but tier update fails
   - Both operations roll back
   - Request remains pending, tier unchanged

9. **Large justification text handling**
   - Submit request with 1000-character justification
   - Text stored correctly without truncation
   - Displays properly in admin view

10. **Admin filters and pagination**
    - Create 50+ test requests
    - Filter by status, tier, date range
    - Pagination works correctly
    - Performance acceptable (<2s load time)

### Priority 3: Nice-to-have (can defer to post-MVP)

11. **Email notifications**
    - Request submitted → admin notified
    - Request approved → vendor notified
    - Request rejected → vendor notified

12. **Bulk actions**
    - Admin selects multiple requests
    - Approves all in one action
    - All tiers update correctly

13. **CSV export**
    - Admin exports request list
    - CSV contains all relevant fields
    - Properly formatted for Excel

## Performance Testing

### Load testing scenarios:

**API endpoints:**
- 100 concurrent request submissions
- 1000 requests in admin list view
- Response times within SLA:
  - Request submission: <500ms (p95)
  - Admin list: <2s (p95)
  - Approval/rejection: <500ms (p95)

**Database queries:**
- Index on `vendorId`, `status`, `createdAt`
- Explain plans for all queries
- No N+1 query issues

**Frontend performance:**
- Lighthouse score >90
- First Contentful Paint <1.5s
- Time to Interactive <3s
- No memory leaks (test with 100+ requests loaded)

## Security Testing

### Authentication tests:
- All endpoints require valid JWT
- Expired tokens rejected (401)
- Invalid tokens rejected (401)
- Missing tokens rejected (401)

### Authorization tests:
- Vendor can only access own requests (403 if attempted)
- Admin can access all requests
- Non-admin cannot access admin endpoints (403)

### Input validation tests:
- SQL injection attempts blocked
- XSS attempts sanitized
- CSRF protection enabled
- Rate limiting enforced

### Data integrity tests:
- Foreign key constraints enforced
- Cascade deletes work correctly
- No orphaned records
- Transaction isolation prevents race conditions

## Test Maintenance

### Test code quality:
- Tests are readable and well-documented
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- No magic numbers or hardcoded values
- DRY: extract common setup to helpers

### Flaky test prevention:
- No dependencies on test execution order
- Clean database state between tests
- No timing-based assertions (use waitFor)
- Mock external dependencies (APIs, time)

### Test review process:
- Tests reviewed alongside implementation code
- Coverage gaps identified in code review
- Flaky tests fixed immediately
- Test failures investigated (never ignored)

## Documentation

### Test documentation includes:
- Test plan overview (this document)
- API test scenarios with examples
- E2E test scenarios with user flows
- Test data seed scripts
- Coverage reports
- Performance test results

### Living documentation:
- Update test docs when adding new scenarios
- Document known issues/limitations
- Track flaky tests and resolution efforts
- Share test results in team meetings
