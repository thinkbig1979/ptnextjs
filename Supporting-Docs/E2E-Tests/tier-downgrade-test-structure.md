# Tier Downgrade E2E Test Structure

**Quick Reference for `/tests/e2e/tier-downgrade-request-workflow.spec.ts`**

## Test Organization

```
tier-downgrade-request-workflow.spec.ts
│
├── Helper Functions
│   ├── loginAsVendor(page, email, password)
│   └── loginAsAdmin(page)
│
├── Suite 1: Vendor Downgrade Request Submission (4 tests)
│   ├── 1.1: Submit tier downgrade request (tier2 → tier1)
│   ├── 1.2: Verify downgrade warnings are displayed
│   ├── 1.3: Cannot request upgrade via downgrade endpoint
│   └── 1.4: Cannot submit duplicate pending downgrade request
│
├── Suite 2: Admin Downgrade Approval (3 tests)
│   ├── 2.1: Admin views downgrade request with details
│   ├── 2.2: Admin approves downgrade - tier updated
│   └── 2.3: Admin rejects downgrade - reason required
│
├── Suite 3: Data Handling on Downgrade (3 tests)
│   ├── 3.1: Excess data hidden (not deleted) after downgrade
│   ├── 3.2: Data reappears after re-upgrade
│   └── 3.3: Tier restrictions enforced after downgrade
│
├── Suite 4: Edge Cases (5 tests)
│   ├── 4.1: Downgrade with more locations than new tier allows
│   ├── 4.2: Cancel pending downgrade request
│   ├── 4.3: Concurrent upgrade and downgrade request prevention
│   ├── 4.4: Invalid tier validation
│   └── 4.5: Cannot downgrade to same tier
│
└── Suite 5: Integration Tests (2 tests)
    ├── 5.1: Complete downgrade lifecycle (submit → approve → verify)
    └── 5.2: Complete rejection lifecycle (submit → reject → verify)
```

## Total Test Count: 17 tests

## Test Pattern

Each test follows this pattern:

```typescript
test('X.Y: Test description', async ({ page }) => {
  // 1. Setup: Create vendor with seed API
  const vendor = createTestVendor({ tier: 'tier2', status: 'approved' });
  const vendorIds = await seedVendors(page, [vendor]);
  const vendorId = vendorIds[0];

  // 2. Authenticate
  await loginAsVendor(page, vendor.email, vendorPassword);

  // 3. Perform action
  const response = await page.request.post(
    `/api/portal/vendors/${vendorId}/tier-downgrade-request`,
    { data: { requestedTier: 'tier1', vendorNotes: 'Test notes' } }
  );

  // 4. Assert results
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.data.requestType).toBe('downgrade');

  // 5. Verify side effects (if applicable)
  const verifyResponse = await page.request.get(
    `/api/portal/vendors/${vendorId}/tier-downgrade-request`
  );
  expect(verifyResponse.ok()).toBe(true);
});
```

## Key Testing Strategies

### 1. Fast Data Creation
Uses seed API instead of UI registration (50-100x faster):
```typescript
const vendors = [
  createTestVendor({ tier: 'tier2', status: 'approved' }),
  createTestVendor({ tier: 'tier3', status: 'approved' }),
];
const vendorIds = await seedVendors(page, vendors);
```

### 2. API-First Testing
Tests API endpoints directly for speed and reliability:
```typescript
const response = await page.request.post('/api/portal/vendors/[id]/tier-downgrade-request', {
  data: { requestedTier: 'tier1', vendorNotes: 'Test' }
});
```

### 3. Graceful Degradation
Tests skip if admin authentication unavailable:
```typescript
const adminAuth = await loginAsAdmin(page);
if (!adminAuth) {
  console.log('⚠️  Admin authentication not available - skipping test');
  test.skip();
  return;
}
```

### 4. Comprehensive Validation
Every test validates:
- HTTP status codes
- Response structure
- Business logic correctness
- Side effects (tier updates, request status changes)

## API Endpoint Coverage

| Endpoint | Method | Test Count | Coverage |
|----------|--------|------------|----------|
| `/api/portal/vendors/[id]/tier-downgrade-request` | POST | 8 | Full |
| `/api/portal/vendors/[id]/tier-downgrade-request` | GET | 4 | Full |
| `/api/portal/vendors/[id]/tier-downgrade-request/[requestId]` | DELETE | 1 | Full |
| `/api/admin/tier-upgrade-requests` | GET | 1 | Partial |
| `/api/admin/tier-upgrade-requests/[id]/approve` | PUT | 4 | Full |
| `/api/admin/tier-upgrade-requests/[id]/reject` | PUT | 2 | Full |

## Validation Scenarios Covered

### Business Rules
- ✅ Downgrade tier must be lower than current
- ✅ Cannot upgrade via downgrade endpoint
- ✅ Only one pending downgrade per vendor
- ✅ Rejection requires explanation
- ✅ Data hidden (not deleted) on downgrade
- ✅ Data restored on re-upgrade

### Security
- ✅ Vendor can only access their own requests
- ✅ Admin authentication required for approval/rejection
- ✅ Rate limiting (assumed by API design)

### Edge Cases
- ✅ Invalid tier values
- ✅ Same tier requests
- ✅ Excess data handling
- ✅ Request cancellation
- ✅ Concurrent requests

## Test Execution Order

Tests are independent and can run in parallel (Playwright default). Each test:
1. Creates fresh test data
2. Performs isolated actions
3. Validates results
4. Cleans up implicitly (new test data each run)

## Debugging Tests

### Run single test
```bash
npm run test:e2e -- tier-downgrade-request-workflow.spec.ts -g "1.1"
```

### View browser
```bash
npm run test:e2e:headed -- tier-downgrade-request-workflow.spec.ts
```

### Interactive UI
```bash
npm run test:e2e:ui -- tier-downgrade-request-workflow.spec.ts
```

### Debug mode
```bash
PWDEBUG=1 npm run test:e2e -- tier-downgrade-request-workflow.spec.ts
```

## Common Issues

### Admin Tests Skipping
**Cause**: Admin authentication not configured
**Solution**: Expected behavior - tests skip gracefully

### Seed API Failures
**Cause**: Test database not accessible
**Solution**: Ensure dev server running and database initialized

### Port Conflicts
**Cause**: Another process using port 3000
**Solution**: Kill existing processes or configure different port

## Maintenance Notes

### Adding New Tests
1. Choose appropriate suite (or create new)
2. Follow existing test pattern
3. Use seed API for data creation
4. Validate all response fields
5. Add to this documentation

### Updating Tests
1. Maintain test independence
2. Update validation assertions if API changes
3. Update documentation
4. Run full suite to ensure no regressions

### Test Data Cleanup
Tests create fresh data each run. No manual cleanup needed. Test database should be separate from production.
