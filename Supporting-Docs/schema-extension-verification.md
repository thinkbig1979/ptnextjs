# Schema Extension Verification Checklist

## Task: ptnextjs-i9x
**Status**: Implementation Complete - Awaiting File Replacement
**File**: payload/collections/TierUpgradeRequests.ts

## Changes Verification

### 1. requestType Field Added ✓
**Location**: Line 84-98 in TierUpgradeRequests_NEW.ts
```typescript
{
  name: 'requestType',
  type: 'select',
  options: [
    { label: 'Upgrade', value: 'upgrade' },
    { label: 'Downgrade', value: 'downgrade' },
  ],
  defaultValue: 'upgrade',  // Backward compatibility
  required: true,
  index: true,              // For efficient filtering
}
```

### 2. requestedTier Updated with 'free' Option ✓
**Location**: Line 100-114 in TierUpgradeRequests_NEW.ts
```typescript
{
  name: 'requestedTier',
  type: 'select',
  options: [
    { label: 'Free', value: 'free' },  // NEW - enables downgrades to free
    { label: 'Tier 1 - Enhanced Profile', value: 'tier1' },
    { label: 'Tier 2 - Full Product Management', value: 'tier2' },
    { label: 'Tier 3 - Premium Promoted Profile', value: 'tier3' },
  ],
}
```

### 3. Admin Display Updated ✓
**Location**: Line 14 in TierUpgradeRequests_NEW.ts
```typescript
defaultColumns: ['vendor', 'requestType', 'currentTier', 'requestedTier', 'status', 'requestedAt'],
//                         ^^^^^^^^^^^^^ ADDED
```

### 4. Auto-Detection Logic ✓
**Location**: Lines 227-236 in TierUpgradeRequests_NEW.ts
```typescript
// Auto-detect requestType if not explicitly set
if (!data.requestType) {
  if (requestedTierValue > currentTierValue) {
    data.requestType = 'upgrade';
  } else if (requestedTierValue < currentTierValue) {
    data.requestType = 'downgrade';
  } else {
    throw new Error('Requested tier must be different from current tier');
  }
}
```

### 5. Bidirectional Validation Logic ✓
**Location**: Lines 238-248 in TierUpgradeRequests_NEW.ts
```typescript
// Validate based on requestType
if (data.requestType === 'upgrade') {
  if (requestedTierValue <= currentTierValue) {
    throw new Error('Requested tier must be higher than current tier for upgrades');
  }
} else if (data.requestType === 'downgrade') {
  if (requestedTierValue >= currentTierValue) {
    throw new Error('Requested tier must be lower than current tier for downgrades');
  }
}
```

### 6. Updated Unique Constraint ✓
**Location**: Lines 255-278 in TierUpgradeRequests_NEW.ts
```typescript
// 4. Validate unique pending request per vendor per request type
// A vendor can have ONE pending upgrade AND ONE pending downgrade at the same time
// But NOT two pending upgrades or two pending downgrades
if (operation === 'create' && data.status === 'pending') {
  const vendorId = typeof data.vendor === 'object' ? data.vendor.id : data.vendor;
  const requestType = data.requestType || 'upgrade';

  const existingPending = await req.payload.find({
    collection: 'tier_upgrade_requests',
    where: {
      and: [
        { vendor: { equals: vendorId } },
        { status: { equals: 'pending' } },
        { requestType: { equals: requestType } },  // NEW - per-type uniqueness
      ],
    },
    limit: 1,
  });

  if (existingPending.docs.length > 0) {
    const requestTypeName = requestType === 'upgrade' ? 'upgrade' : 'downgrade';
    throw new Error(`Vendor already has a pending tier ${requestTypeName} request`);
  }
}
```

## Backward Compatibility Verification ✓

1. **Default Value**: requestType defaults to 'upgrade'
2. **Auto-Detection**: If requestType is omitted, it's auto-detected
3. **Existing Requests**: All existing upgrade requests will continue to work
4. **API Compatibility**: No breaking changes to existing API contracts

## Test Scenarios to Verify

### Scenario 1: Upgrade Request (Existing Behavior)
- Current: tier1, Requested: tier2, Type: upgrade (or auto-detected)
- Expected: ✓ Allowed

### Scenario 2: Downgrade Request (New Feature)
- Current: tier2, Requested: tier1, Type: downgrade (or auto-detected)
- Expected: ✓ Allowed

### Scenario 3: Downgrade to Free
- Current: tier1, Requested: free, Type: downgrade (or auto-detected)
- Expected: ✓ Allowed

### Scenario 4: Same Tier
- Current: tier2, Requested: tier2
- Expected: ✗ Error - "Requested tier must be different from current tier"

### Scenario 5: Wrong Direction for Upgrade
- Current: tier2, Requested: tier1, Type: upgrade
- Expected: ✗ Error - "Requested tier must be higher than current tier for upgrades"

### Scenario 6: Wrong Direction for Downgrade
- Current: tier1, Requested: tier2, Type: downgrade
- Expected: ✗ Error - "Requested tier must be lower than current tier for downgrades"

### Scenario 7: Concurrent Requests
- Vendor has pending upgrade request
- Vendor submits downgrade request
- Expected: ✓ Allowed (both can coexist)

### Scenario 8: Duplicate Upgrade
- Vendor has pending upgrade request
- Vendor submits another upgrade request
- Expected: ✗ Error - "Vendor already has a pending tier upgrade request"

### Scenario 9: Duplicate Downgrade
- Vendor has pending downgrade request
- Vendor submits another downgrade request
- Expected: ✗ Error - "Vendor already has a pending tier downgrade request"

## Files Modified
- `/home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests_NEW.ts` (ready to replace original)

## Acceptance Criteria Status
- [x] requestType field added with 'upgrade' | 'downgrade' options
- [x] requestedTier includes 'free' option
- [x] Validation allows downgrades when requestType is 'downgrade'
- [x] Unique constraint updated for separate upgrade/downgrade tracking
- [x] Existing upgrade functionality unchanged
- [x] Backward compatible with existing data
- [x] Auto-detection of requestType based on tier comparison
- [x] Clear error messages for all validation failures

## Next Agent Tasks
1. Update TierUpgradeRequestService.ts to handle downgrades
2. Update TypeScript interfaces in lib/types.ts to include requestType
3. Update API endpoints to support downgrade operations
4. Update frontend components to display and create downgrade requests
5. Add email templates for downgrade notifications
