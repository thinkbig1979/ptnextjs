# Tier Upgrade Test Helpers Documentation

## Overview

The `tier-upgrade-helpers.ts` file provides comprehensive helper functions for E2E testing of tier upgrade and downgrade workflows. These helpers simplify common testing scenarios and reduce code duplication.

## File Location

- **Helper File**: `/home/edwin/development/ptnextjs/tests/e2e/helpers/tier-upgrade-helpers.ts`
- **Example Usage**: `/home/edwin/development/ptnextjs/tests/e2e/example-tier-upgrade-helpers-usage.spec.ts`

## Quick Start

```typescript
import {
  seedVendorWithUpgradeRequest,
  approveUpgradeRequest,
  waitForTierUpdate,
  verifyTierFeatures,
} from './helpers/tier-upgrade-helpers';

test('Upgrade workflow', async ({ page }) => {
  // Create vendor with pending upgrade request
  const { vendorId, requestId } = await seedVendorWithUpgradeRequest(
    page,
    { tier: 'free' },
    { requestedTier: 'tier1', vendorNotes: 'Growing business' }
  );

  // Approve the request (admin action)
  await approveUpgradeRequest(page, requestId);

  // Wait for tier update
  await waitForTierUpdate(page, vendorId, 'tier1');

  // Verify features
  const features = await verifyTierFeatures(page, vendorId, 'tier1');
  expect(features.hasExpectedFeatures).toBe(true);
});
```

## Helper Functions Reference

### 1. seedVendorWithUpgradeRequest()

Creates a vendor and immediately submits an upgrade request in one call.

**Signature:**
```typescript
async function seedVendorWithUpgradeRequest(
  page: Page,
  vendorConfig: VendorConfig = {},
  requestConfig: UpgradeRequestConfig
): Promise<{ vendorId: string; requestId: string; vendorData: VendorSeedData }>
```

**Parameters:**
- `page` - Playwright page object
- `vendorConfig` - Optional vendor configuration (defaults to free tier)
- `requestConfig` - Upgrade request configuration with `requestedTier` and optional `vendorNotes`

**Returns:** Object with `vendorId`, `requestId`, and `vendorData`

**Example:**
```typescript
const { vendorId, requestId, vendorData } = await seedVendorWithUpgradeRequest(
  page,
  {
    companyName: 'Test Company',
    tier: 'free',
    email: 'custom@example.com', // optional
  },
  {
    requestedTier: 'tier1',
    vendorNotes: 'Business justification',
  }
);
```

---

### 2. seedVendorWithDowngradeRequest()

Creates a vendor and immediately submits a downgrade request in one call.

**Signature:**
```typescript
async function seedVendorWithDowngradeRequest(
  page: Page,
  vendorConfig: VendorConfig = {},
  requestConfig: DowngradeRequestConfig
): Promise<{ vendorId: string; requestId: string; vendorData: VendorSeedData }>
```

**Parameters:**
- `page` - Playwright page object
- `vendorConfig` - Optional vendor configuration (defaults to tier2)
- `requestConfig` - Downgrade request configuration with `requestedTier` and optional `vendorNotes`

**Returns:** Object with `vendorId`, `requestId`, and `vendorData`

**Example:**
```typescript
const { vendorId, requestId } = await seedVendorWithDowngradeRequest(
  page,
  {
    tier: 'tier3',
    companyName: 'Downgrading Vendor',
  },
  {
    requestedTier: 'tier1',
    vendorNotes: 'Reducing costs',
  }
);
```

---

### 3. approveUpgradeRequest()

Approves a tier upgrade or downgrade request (admin action).

**Signature:**
```typescript
async function approveUpgradeRequest(
  page: Page,
  requestId: string
): Promise<{ success: boolean; data?: any; error?: string }>
```

**Parameters:**
- `page` - Playwright page object
- `requestId` - ID of the request to approve

**Returns:** Result object with `success`, optional `data`, and `error`

**Example:**
```typescript
const result = await approveUpgradeRequest(page, requestId);
if (result.success) {
  console.log('Request approved!');
}
```

**Note:** Requires admin authentication. Will return 401/403 if not authenticated.

---

### 4. rejectUpgradeRequest()

Rejects a tier upgrade or downgrade request with a reason (admin action).

**Signature:**
```typescript
async function rejectUpgradeRequest(
  page: Page,
  requestId: string,
  reason: string
): Promise<{ success: boolean; data?: any; error?: string }>
```

**Parameters:**
- `page` - Playwright page object
- `requestId` - ID of the request to reject
- `reason` - Rejection reason (required, 10-1000 characters)

**Returns:** Result object with `success`, optional `data`, and `error`

**Example:**
```typescript
const result = await rejectUpgradeRequest(
  page,
  requestId,
  'Insufficient business justification provided'
);
```

**Note:** Requires admin authentication. Will return 401/403 if not authenticated.

---

### 5. getUpgradeRequestStatus()

Gets the current upgrade request status for a vendor.

**Signature:**
```typescript
async function getUpgradeRequestStatus(
  page: Page,
  vendorId: string
): Promise<any | null>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID

**Returns:** Request data object or `null` if no pending request

**Example:**
```typescript
const status = await getUpgradeRequestStatus(page, vendorId);
if (status) {
  console.log(`Status: ${status.status}`);
  console.log(`Requested tier: ${status.requestedTier}`);
}
```

---

### 6. getDowngradeRequestStatus()

Gets the current downgrade request status for a vendor.

**Signature:**
```typescript
async function getDowngradeRequestStatus(
  page: Page,
  vendorId: string
): Promise<any | null>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID

**Returns:** Request data object or `null` if no pending downgrade request

**Example:**
```typescript
const status = await getDowngradeRequestStatus(page, vendorId);
if (status && status.requestType === 'downgrade') {
  console.log(`Downgrade to: ${status.requestedTier}`);
}
```

---

### 7. submitUpgradeRequest()

Submits a new upgrade request for a vendor.

**Signature:**
```typescript
async function submitUpgradeRequest(
  page: Page,
  vendorId: string,
  targetTier: 'tier1' | 'tier2' | 'tier3',
  notes?: string
): Promise<UpgradeRequestResult>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID
- `targetTier` - Requested tier (tier1, tier2, or tier3)
- `notes` - Optional vendor notes (max 500 characters)

**Returns:** Result with `success`, `requestId`, `status`, and `error`

**Example:**
```typescript
const result = await submitUpgradeRequest(
  page,
  vendorId,
  'tier2',
  'Expanding our operations'
);

if (result.success) {
  console.log(`Request ID: ${result.requestId}`);
}
```

---

### 8. submitDowngradeRequest()

Submits a new downgrade request for a vendor.

**Signature:**
```typescript
async function submitDowngradeRequest(
  page: Page,
  vendorId: string,
  targetTier: 'free' | 'tier1' | 'tier2',
  notes?: string
): Promise<UpgradeRequestResult>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID
- `targetTier` - Requested tier (free, tier1, or tier2)
- `notes` - Optional vendor notes (max 500 characters)

**Returns:** Result with `success`, `requestId`, `status`, and `error`

**Example:**
```typescript
const result = await submitDowngradeRequest(
  page,
  vendorId,
  'tier1',
  'Cost reduction needed'
);
```

---

### 9. cancelUpgradeRequest()

Cancels a pending upgrade request.

**Signature:**
```typescript
async function cancelUpgradeRequest(
  page: Page,
  vendorId: string,
  requestId: string
): Promise<boolean>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID
- `requestId` - Request ID to cancel

**Returns:** `true` if cancelled successfully, `false` otherwise

**Example:**
```typescript
const cancelled = await cancelUpgradeRequest(page, vendorId, requestId);
expect(cancelled).toBe(true);
```

---

### 10. cancelDowngradeRequest()

Cancels a pending downgrade request.

**Signature:**
```typescript
async function cancelDowngradeRequest(
  page: Page,
  vendorId: string,
  requestId: string
): Promise<boolean>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID
- `requestId` - Request ID to cancel

**Returns:** `true` if cancelled successfully, `false` otherwise

**Example:**
```typescript
const cancelled = await cancelDowngradeRequest(page, vendorId, requestId);
```

---

### 11. waitForTierUpdate()

Polls until vendor tier matches expected value.

**Signature:**
```typescript
async function waitForTierUpdate(
  page: Page,
  vendorId: string,
  expectedTier: 'free' | 'tier1' | 'tier2' | 'tier3',
  timeout?: number
): Promise<boolean>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID
- `expectedTier` - Expected tier value
- `timeout` - Timeout in milliseconds (default: 10000)

**Returns:** `true` if tier matches within timeout, `false` otherwise

**Example:**
```typescript
// Wait up to 10 seconds for tier to update
const updated = await waitForTierUpdate(page, vendorId, 'tier1', 10000);
expect(updated).toBe(true);
```

**Usage Pattern:**
```typescript
// After approving request
await approveUpgradeRequest(page, requestId);

// Wait for tier to be updated
const tierUpdated = await waitForTierUpdate(page, vendorId, 'tier1');
if (tierUpdated) {
  console.log('Tier successfully updated!');
}
```

---

### 12. verifyTierFeatures()

Verifies that tier-specific features are accessible.

**Signature:**
```typescript
async function verifyTierFeatures(
  page: Page,
  vendorId: string,
  tier: 'free' | 'tier1' | 'tier2' | 'tier3'
): Promise<TierFeatureValidation>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID
- `tier` - Tier to validate features for

**Returns:** Validation result with:
- `hasExpectedFeatures` - Boolean indicating if all features are correct
- `details` - String description of features
- `checkedFeatures` - Array of checked feature names

**Example:**
```typescript
const features = await verifyTierFeatures(page, vendorId, 'tier1');

expect(features.hasExpectedFeatures).toBe(true);
expect(features.details).toContain('Max products: 10');
expect(features.checkedFeatures).toContain('brandStory');
```

**Feature Limits by Tier:**
- **Free**: 3 products, 1 location, 2 team members, no brand story/certifications
- **Tier 1**: 10 products, 1 location, 5 team members, brand story, certifications
- **Tier 2**: 25 products, 5 locations, 10 team members, brand story, certifications
- **Tier 3**: Unlimited products/locations/team members, all features including promotion pack

---

### 13. listTierRequests()

Lists all tier upgrade/downgrade requests with optional filters (admin).

**Signature:**
```typescript
async function listTierRequests(
  page: Page,
  filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    vendorId?: string;
    requestedTier?: 'free' | 'tier1' | 'tier2' | 'tier3';
    requestType?: 'upgrade' | 'downgrade';
  }
): Promise<any[] | null>
```

**Parameters:**
- `page` - Playwright page object
- `filters` - Optional filters object

**Returns:** Array of requests or `null` if failed

**Example:**
```typescript
// List all pending requests
const pending = await listTierRequests(page, { status: 'pending' });

// List upgrade requests only
const upgrades = await listTierRequests(page, {
  status: 'pending',
  requestType: 'upgrade',
});

// List downgrade requests for specific vendor
const vendorDowngrades = await listTierRequests(page, {
  vendorId: vendorId,
  requestType: 'downgrade',
});
```

**Note:** Requires admin authentication.

---

### 14. getVendorTier()

Gets the current tier for a vendor.

**Signature:**
```typescript
async function getVendorTier(
  page: Page,
  vendorId: string
): Promise<'free' | 'tier1' | 'tier2' | 'tier3' | null>
```

**Parameters:**
- `page` - Playwright page object
- `vendorId` - Vendor ID

**Returns:** Current tier or `null` if failed

**Example:**
```typescript
const tier = await getVendorTier(page, vendorId);
expect(tier).toBe('tier1');
```

---

### 15. loginAsVendor()

Authenticates as a vendor user.

**Signature:**
```typescript
async function loginAsVendor(
  page: Page,
  email: string,
  password: string
): Promise<boolean>
```

**Parameters:**
- `page` - Playwright page object
- `email` - Vendor email
- `password` - Vendor password

**Returns:** `true` if login successful, `false` otherwise

**Example:**
```typescript
const { vendorData } = await seedVendorWithUpgradeRequest(page, {}, {
  requestedTier: 'tier1'
});

const loggedIn = await loginAsVendor(page, vendorData.email, vendorData.password);
expect(loggedIn).toBe(true);
```

## Common Testing Patterns

### Pattern 1: Complete Upgrade Workflow

```typescript
test('Complete upgrade workflow', async ({ page }) => {
  // 1. Create vendor with upgrade request
  const { vendorId, requestId, vendorData } = await seedVendorWithUpgradeRequest(
    page,
    { tier: 'free' },
    { requestedTier: 'tier1', vendorNotes: 'Growing business' }
  );

  // 2. Verify initial state
  expect(await getVendorTier(page, vendorId)).toBe('free');
  const status = await getUpgradeRequestStatus(page, vendorId);
  expect(status.status).toBe('pending');

  // 3. Approve request (as admin)
  const approved = await approveUpgradeRequest(page, requestId);
  expect(approved.success).toBe(true);

  // 4. Wait for tier update
  const updated = await waitForTierUpdate(page, vendorId, 'tier1');
  expect(updated).toBe(true);

  // 5. Verify features
  const features = await verifyTierFeatures(page, vendorId, 'tier1');
  expect(features.hasExpectedFeatures).toBe(true);
});
```

### Pattern 2: Complete Downgrade Workflow

```typescript
test('Complete downgrade workflow', async ({ page }) => {
  // 1. Create tier3 vendor with downgrade request
  const { vendorId, requestId } = await seedVendorWithDowngradeRequest(
    page,
    { tier: 'tier3' },
    { requestedTier: 'tier1', vendorNotes: 'Cost reduction' }
  );

  // 2. Verify initial state
  expect(await getVendorTier(page, vendorId)).toBe('tier3');
  const status = await getDowngradeRequestStatus(page, vendorId);
  expect(status.requestType).toBe('downgrade');

  // 3. Approve downgrade
  await approveUpgradeRequest(page, requestId);

  // 4. Wait for tier change
  await waitForTierUpdate(page, vendorId, 'tier1');

  // 5. Verify tier1 features
  const features = await verifyTierFeatures(page, vendorId, 'tier1');
  expect(features.details).toContain('Max products: 10');
});
```

### Pattern 3: Rejection Workflow

```typescript
test('Rejection workflow', async ({ page }) => {
  const { vendorId, requestId } = await seedVendorWithUpgradeRequest(
    page,
    { tier: 'free' },
    { requestedTier: 'tier3' }
  );

  // Reject with reason
  await rejectUpgradeRequest(
    page,
    requestId,
    'Please provide more business justification'
  );

  // Verify tier didn't change
  expect(await getVendorTier(page, vendorId)).toBe('free');

  // Verify rejection reason
  const status = await getUpgradeRequestStatus(page, vendorId);
  expect(status.status).toBe('rejected');
  expect(status.rejectionReason).toContain('justification');
});
```

### Pattern 4: Cancellation Workflow

```typescript
test('Vendor cancels request', async ({ page }) => {
  const { vendorId, requestId, vendorData } = await seedVendorWithUpgradeRequest(
    page,
    { tier: 'tier1' },
    { requestedTier: 'tier2' }
  );

  // Login as vendor
  await loginAsVendor(page, vendorData.email, vendorData.password);

  // Cancel request
  const cancelled = await cancelUpgradeRequest(page, vendorId, requestId);
  expect(cancelled).toBe(true);

  // Verify no pending request
  const status = await getUpgradeRequestStatus(page, vendorId);
  expect(status?.status).not.toBe('pending');
});
```

### Pattern 5: Admin Queue Management

```typescript
test('Admin manages request queue', async ({ page }) => {
  // Create multiple requests
  const vendor1 = await seedVendorWithUpgradeRequest(
    page,
    { tier: 'free' },
    { requestedTier: 'tier1' }
  );

  const vendor2 = await seedVendorWithDowngradeRequest(
    page,
    { tier: 'tier3' },
    { requestedTier: 'tier2' }
  );

  // List all pending requests
  const pending = await listTierRequests(page, { status: 'pending' });

  if (pending) {
    expect(pending.length).toBeGreaterThanOrEqual(2);

    // Filter by type
    const upgrades = pending.filter(r => r.requestType === 'upgrade');
    const downgrades = pending.filter(r => r.requestType === 'downgrade');

    expect(upgrades.length).toBeGreaterThan(0);
    expect(downgrades.length).toBeGreaterThan(0);
  }
});
```

## TypeScript Interfaces

```typescript
interface UpgradeRequestConfig {
  requestedTier: 'tier1' | 'tier2' | 'tier3';
  vendorNotes?: string;
}

interface DowngradeRequestConfig {
  requestedTier: 'free' | 'tier1' | 'tier2';
  vendorNotes?: string;
}

interface UpgradeRequestResult {
  success: boolean;
  requestId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  error?: string;
}

interface VendorConfig extends Partial<VendorSeedData> {
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
}

interface TierFeatureValidation {
  hasExpectedFeatures: boolean;
  details: string;
  checkedFeatures: string[];
}
```

## API Endpoints Used

The helpers interact with these API endpoints:

- `POST /api/portal/vendors/[id]/tier-upgrade-request` - Submit upgrade request
- `POST /api/portal/vendors/[id]/tier-downgrade-request` - Submit downgrade request
- `GET /api/portal/vendors/[id]/tier-upgrade-request` - Get upgrade request status
- `GET /api/portal/vendors/[id]/tier-downgrade-request` - Get downgrade request status
- `DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId]` - Cancel upgrade
- `DELETE /api/portal/vendors/[id]/tier-downgrade-request/[requestId]` - Cancel downgrade
- `PUT /api/admin/tier-upgrade-requests/[id]/approve` - Approve request (admin)
- `PUT /api/admin/tier-upgrade-requests/[id]/reject` - Reject request (admin)
- `GET /api/admin/tier-upgrade-requests` - List requests (admin)
- `GET /api/portal/vendors/[id]` - Get vendor data

## Environment Variables

```bash
BASE_URL=http://localhost:3000  # Optional, defaults to localhost:3000
```

## Best Practices

1. **Always check authentication requirements**: Admin operations (approve, reject, list) require admin authentication.

2. **Use waitForTierUpdate() after approval**: Don't assume immediate tier changes.

3. **Verify features after tier changes**: Use `verifyTierFeatures()` to ensure tier restrictions are applied correctly.

4. **Handle errors gracefully**: Most helpers return error information rather than throwing.

5. **Use consistent naming**: Vendor emails and company names should be unique per test.

6. **Clean up test data**: Consider the impact of test data on other tests.

7. **Log debugging info**: All helpers include console.log statements for debugging.

## Troubleshooting

### Request returns 401/403
- Admin operations require admin authentication
- Vendor operations require vendor authentication
- Use `loginAsVendor()` or implement admin login helper

### Tier not updating after approval
- Use `waitForTierUpdate()` with sufficient timeout
- Check database for pending updates
- Verify request was actually approved

### Request creation fails with 409
- Vendor already has pending request of same type
- Cancel existing request first or use different vendor

### Feature validation fails
- Ensure vendor tier matches expected tier
- Check that features are correctly implemented
- Verify tier limits in helper match application

## Related Files

- `/home/edwin/development/ptnextjs/tests/e2e/helpers/seed-api-helpers.ts` - Vendor/product seeding
- `/home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts` - Service layer
- `/home/edwin/development/ptnextjs/lib/types.ts` - TypeScript types
- `/home/edwin/development/ptnextjs/tests/e2e/tier-upgrade-request/` - Existing tier upgrade tests
