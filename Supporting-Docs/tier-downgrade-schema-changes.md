# Tier Downgrade Schema Changes

## Task: ptnextjs-i9x
**Date**: 2025-12-05
**Agent**: Backend Developer

## Changes Made to TierUpgradeRequests Collection

### 1. Added `requestType` Field
- **Type**: select
- **Options**: 'upgrade' | 'downgrade'
- **Default**: 'upgrade' (backward compatibility)
- **Required**: true
- **Indexed**: true
- **Position**: After `currentTier`, before `requestedTier`

### 2. Updated `requestedTier` Field
- **Added Option**: Free tier now available
- **Options**: 'free' | 'tier1' | 'tier2' | 'tier3'
- **Updated Description**: "Requested tier (must be different from current tier based on request type)"

### 3. Updated Admin Display
- **defaultColumns**: Added 'requestType' to column list
- **Order**: ['vendor', 'requestType', 'currentTier', 'requestedTier', 'status', 'requestedAt']

### 4. Updated beforeChange Hook Logic

#### Auto-Detection of requestType
- If `requestType` is not explicitly set, it's auto-detected:
  - requestedTier > currentTier → 'upgrade'
  - requestedTier < currentTier → 'downgrade'
  - requestedTier === currentTier → Error

#### Validation Logic
- **For upgrades**: requestedTier must be > currentTier
- **For downgrades**: requestedTier must be < currentTier
- **Error messages** updated to include request type context

#### Unique Pending Request Validation
- **Old behavior**: Only ONE pending request per vendor
- **New behavior**: ONE pending upgrade AND ONE pending downgrade allowed simultaneously
- **Validation**: Checks for duplicate pending requests of the same type
- **Query**: Added `requestType` filter to existing pending request check

### 5. Backward Compatibility
- Default value 'upgrade' for `requestType` ensures existing upgrade flow works unchanged
- Existing API endpoints will continue to work
- Auto-detection logic fills in `requestType` if not provided

## Testing Recommendations
1. Test upgrade request creation (should default to 'upgrade')
2. Test downgrade request creation with explicit 'downgrade' type
3. Test that vendor can have 1 pending upgrade AND 1 pending downgrade
4. Test that vendor cannot have 2 pending upgrades or 2 pending downgrades
5. Test auto-detection logic with various tier combinations
6. Verify validation error messages are clear and helpful

## Files Modified
- `/home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts`

## Next Steps (Other Tasks)
- Update TierUpgradeRequestService.ts to support downgrades
- Update API endpoints to handle downgrades
- Update frontend components to support downgrade requests
- Update TypeScript interfaces in lib/types.ts
