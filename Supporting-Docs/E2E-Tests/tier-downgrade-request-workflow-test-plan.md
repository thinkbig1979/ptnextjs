# Tier Downgrade Request Workflow - E2E Test Plan

**Test File**: `/home/edwin/development/ptnextjs/tests/e2e/tier-downgrade-request-workflow.spec.ts`

**Created**: 2025-12-06

**Beads Task**: ptnextjs-077e

## Overview

Comprehensive E2E test suite for the tier downgrade request workflow, covering vendor-initiated downgrade requests, admin approval/rejection, and data handling on tier changes.

## Test Coverage

### Suite 1: Vendor Downgrade Request Submission

Tests vendor-side request submission with validation.

#### Test 1.1: Submit tier downgrade request (tier2 → tier1)
- **Purpose**: Verify vendor can submit valid downgrade request
- **API**: `POST /api/portal/vendors/[id]/tier-downgrade-request`
- **Validation**:
  - Status 201 (Created)
  - Response includes requestType='downgrade'
  - Status is 'pending'
  - Vendor notes captured
- **Prerequisites**: Tier2 vendor with approved status

#### Test 1.2: Verify downgrade warnings are displayed
- **Purpose**: Confirm request metadata is correct for downgrade
- **API**: `GET /api/portal/vendors/[id]/tier-downgrade-request`
- **Validation**:
  - requestType='downgrade'
  - currentTier and requestedTier populated
  - Proper tier comparison (requested < current)

#### Test 1.3: Cannot request upgrade via downgrade endpoint
- **Purpose**: Prevent tier escalation through downgrade endpoint
- **API**: `POST /api/portal/vendors/[id]/tier-downgrade-request` (with higher tier)
- **Validation**:
  - Status 400 (Bad Request)
  - Validation error returned
- **Security**: Prevents endpoint misuse

#### Test 1.4: Cannot submit duplicate pending downgrade request
- **Purpose**: Enforce single pending downgrade per vendor
- **API**: `POST /api/portal/vendors/[id]/tier-downgrade-request` (duplicate)
- **Validation**:
  - Status 409 (Conflict)
  - Error message mentions 'pending'

### Suite 2: Admin Downgrade Approval

Tests admin review and approval/rejection workflow.

#### Test 2.1: Admin views downgrade request with details
- **Purpose**: Verify admin can list and view downgrade requests
- **API**: `GET /api/admin/tier-upgrade-requests?requestType=downgrade`
- **Validation**:
  - Downgrade requests filtered correctly
  - Request details include currentTier, requestedTier
  - Status is 'pending'
- **Note**: Skips if admin authentication not available

#### Test 2.2: Admin approves downgrade - tier updated
- **Purpose**: Verify approval workflow updates vendor tier
- **API**: `PUT /api/admin/tier-upgrade-requests/[id]/approve`
- **Validation**:
  - Approval succeeds (200 OK)
  - Vendor tier updated in database
  - Request marked as 'approved'
- **Side Effects**: Vendor tier atomically updated

#### Test 2.3: Admin rejects downgrade - reason required
- **Purpose**: Ensure rejection requires explanation
- **API**: `PUT /api/admin/tier-upgrade-requests/[id]/reject`
- **Validation**:
  - Rejection without reason fails (400)
  - Rejection with reason succeeds (200)
  - Rejection reason stored
- **Business Rule**: Admin must explain rejection

### Suite 3: Data Handling on Downgrade

Tests the "hide, don't delete" data handling strategy.

#### Test 3.1: Excess data hidden (not deleted) after downgrade
- **Purpose**: Verify downgrade hides tier-restricted data
- **Setup**: Tier3 vendor with 4 locations
- **Action**: Downgrade to tier1 (1 location limit)
- **Expected**: Excess locations hidden, not deleted
- **Note**: Requires vendor profile API for verification

#### Test 3.2: Data reappears after re-upgrade
- **Purpose**: Confirm hidden data is restored on re-upgrade
- **Setup**: Previously downgraded vendor
- **Action**: Submit upgrade request back to tier3
- **Expected**: All previously hidden data reappears
- **Note**: Validates data persistence strategy

#### Test 3.3: Tier restrictions enforced after downgrade
- **Purpose**: Verify tier limits apply immediately after downgrade
- **Setup**: Tier2 vendor downgraded to tier1
- **Action**: Attempt to exceed tier1 limits
- **Expected**: Tier1 restrictions enforced

### Suite 4: Edge Cases

Tests unusual scenarios and validation boundaries.

#### Test 4.1: Downgrade with more locations than new tier allows
- **Purpose**: Verify system handles excess data gracefully
- **Setup**: Tier3 vendor with 6 locations
- **Action**: Request tier2 downgrade (5 location limit)
- **Expected**: Request accepted with warnings

#### Test 4.2: Cancel pending downgrade request
- **Purpose**: Verify vendor can cancel pending requests
- **API**: `DELETE /api/portal/vendors/[id]/tier-downgrade-request/[requestId]`
- **Validation**:
  - Cancellation succeeds (200)
  - No pending request remains
  - Vendor tier unchanged

#### Test 4.3: Concurrent upgrade and downgrade request prevention
- **Purpose**: Test system behavior with both request types pending
- **Setup**: Submit upgrade request, then downgrade
- **Expected**: System allows both (separate request types)
- **Note**: Production may want to restrict this

#### Test 4.4: Invalid tier validation
- **Purpose**: Verify tier validation
- **API**: `POST /api/portal/vendors/[id]/tier-downgrade-request` (invalid tier)
- **Validation**: 400 error for invalid tier value

#### Test 4.5: Cannot downgrade to same tier
- **Purpose**: Prevent no-op requests
- **API**: `POST /api/portal/vendors/[id]/tier-downgrade-request` (same tier)
- **Validation**: 400 error for same tier

### Suite 5: Integration Tests

End-to-end lifecycle tests.

#### Test 5.1: Complete downgrade lifecycle (submit → approve → verify)
- **Purpose**: Full workflow validation
- **Steps**:
  1. Vendor submits downgrade request
  2. Admin approves request
  3. Verify tier updated
  4. Verify request marked approved
- **Validates**: Complete happy path

#### Test 5.2: Complete rejection lifecycle (submit → reject → verify)
- **Purpose**: Full rejection workflow
- **Steps**:
  1. Vendor submits downgrade request
  2. Admin rejects with reason
  3. Verify tier unchanged
  4. Verify no pending request
- **Validates**: Complete rejection path

## API Endpoints Tested

### Vendor Portal Endpoints
- `POST /api/portal/vendors/[id]/tier-downgrade-request` - Submit downgrade
- `GET /api/portal/vendors/[id]/tier-downgrade-request` - Get pending request
- `DELETE /api/portal/vendors/[id]/tier-downgrade-request/[requestId]` - Cancel request
- `POST /api/portal/vendors/[id]/tier-upgrade-request` - Submit upgrade (for re-upgrade test)

### Admin Endpoints
- `GET /api/admin/tier-upgrade-requests?requestType=downgrade` - List downgrades
- `PUT /api/admin/tier-upgrade-requests/[id]/approve` - Approve request
- `PUT /api/admin/tier-upgrade-requests/[id]/reject` - Reject request

## Test Data Strategy

### Seed API Usage
All tests use the seed API helpers (`/tests/e2e/helpers/seed-api-helpers.ts`) for fast test data creation:

```typescript
import { seedVendors, createTestVendor } from './helpers/seed-api-helpers';

// Create tier2 vendor
const vendor = createTestVendor({
  tier: 'tier2',
  status: 'approved',
  password: 'SecureTestPass123!@#'
});

const vendorIds = await seedVendors(page, [vendor]);
```

### Vendor Authentication
Tests use programmatic login via API:

```typescript
async function loginAsVendor(page, email, password) {
  const response = await page.request.post('/api/auth/login', {
    data: { email, password }
  });
  // Returns { success: boolean, vendorId?: string }
}
```

### Admin Authentication
Admin tests gracefully skip if authentication not available:

```typescript
const adminAuth = await loginAsAdmin(page);
if (!adminAuth) {
  console.log('⚠️  Admin authentication not available - skipping test');
  test.skip();
  return;
}
```

## Running the Tests

### Run all downgrade workflow tests
```bash
npm run test:e2e -- tier-downgrade-request-workflow.spec.ts
```

### Run specific suite
```bash
npm run test:e2e -- tier-downgrade-request-workflow.spec.ts -g "Suite 1"
```

### Run with UI
```bash
npm run test:e2e:ui -- tier-downgrade-request-workflow.spec.ts
```

### Run in headed mode (watch browser)
```bash
npm run test:e2e:headed -- tier-downgrade-request-workflow.spec.ts
```

## Known Limitations

### Admin Authentication
Some tests skip if admin authentication is not configured:
- Suite 2: Admin approval tests
- Suite 3: Data hiding tests (require admin approval)
- Suite 5: Integration tests

**Workaround**: Tests log warnings and skip gracefully.

### Vendor Profile API
Data hiding verification (Suite 3) requires vendor profile API endpoint. Tests validate tier changes but cannot fully verify data visibility without this endpoint.

### Concurrent Requests
Test 4.3 reveals that the system currently allows both pending upgrade and pending downgrade requests simultaneously. Production may want to restrict this behavior.

## Test Results Interpretation

### Success Criteria
- ✅ All vendor-side submission tests pass
- ✅ All validation tests pass
- ✅ All edge cases handled gracefully
- ⚠️  Admin tests may skip (expected if no admin auth)

### Common Failures
- **Admin auth failures**: Expected if admin login not configured
- **Port conflicts**: Ensure dev server is available on port 3000
- **Seed API failures**: Check test database is accessible

## Related Files

- **Test file**: `/home/edwin/development/ptnextjs/tests/e2e/tier-downgrade-request-workflow.spec.ts`
- **API routes**: `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-downgrade-request/`
- **Service**: `/home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts`
- **Seed helpers**: `/home/edwin/development/ptnextjs/tests/e2e/helpers/seed-api-helpers.ts`

## Future Enhancements

1. **Admin Authentication Helper**: Create reusable admin auth helper for E2E tests
2. **Data Visibility Verification**: Add vendor profile API and verify data hiding
3. **UI Tests**: Add Playwright UI tests for dashboard components
4. **Email Verification**: Verify notification emails sent (if email service enabled)
5. **Concurrent Request Prevention**: Consider restricting multiple pending requests
