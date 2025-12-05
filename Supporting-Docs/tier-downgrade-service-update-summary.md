# TierUpgradeRequestService Downgrade Support Update Summary

## Overview
Updated `/home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts` to support both tier upgrade AND downgrade requests.

## File Status
- **New Version**: `/home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts.new` (CREATED)
- **Original**: `/home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts` (NEEDS REPLACEMENT)

## To Apply Changes
```bash
cd /home/edwin/development/ptnextjs
cp lib/services/TierUpgradeRequestService.ts lib/services/TierUpgradeRequestService.ts.backup
mv lib/services/TierUpgradeRequestService.ts.new lib/services/TierUpgradeRequestService.ts
```

## Changes Made

### 1. New Type Export
```typescript
export type RequestType = 'upgrade' | 'downgrade';
```

### 2. Updated Interfaces

#### TierUpgradeRequestData
Added: `requestType?: RequestType;`

#### CreateUpgradeRequestPayload
Added: `requestType?: RequestType;`

#### TierUpgradeRequest
Added: `requestType: RequestType;` (required field)

#### ListRequestsFilters
Added: `requestType?: RequestType;`

### 3. New Type Alias (Backward Compatible)
```typescript
export type CreateTierRequestPayload = CreateUpgradeRequestPayload;
```

### 4. Updated Constants
```typescript
// Separate constants for upgrade vs downgrade valid tiers
const VALID_UPGRADE_TIERS = ['tier1', 'tier2', 'tier3']; // Cannot upgrade to 'free'
const VALID_DOWNGRADE_TIERS = ['free', 'tier1', 'tier2']; // Cannot downgrade to 'tier3'
const VALID_REQUESTED_TIERS = ['tier1', 'tier2', 'tier3']; // Legacy - kept for backward compatibility
```

### 5. New/Updated Functions

#### validateTierRequest (NEW - replaces old logic)
- Accepts optional `requestType` parameter
- Auto-detects requestType if not provided (based on tier comparison)
- Validates based on request type:
  - upgrade: requestedTier > currentTier
  - downgrade: requestedTier < currentTier
- Type-aware error messages

#### validateTierUpgradeRequest (UPDATED - now deprecated wrapper)
```typescript
/**
 * Legacy function name - kept for backward compatibility
 * @deprecated Use validateTierRequest instead
 */
export function validateTierUpgradeRequest(request: TierUpgradeRequestData): ValidationResult {
  return validateTierRequest(request, 'upgrade');
}
```

#### checkUniquePendingRequest (UPDATED signature)
```typescript
export async function checkUniquePendingRequest(
  vendorId: string,
  existingRequests: Array<{ vendor: string; status: string; requestType?: string }>,
  requestType: RequestType = 'upgrade'  // NEW parameter
): Promise<UniqueCheckResult>
```
- Now checks uniqueness PER request type
- Vendors can have 1 pending upgrade + 1 pending downgrade simultaneously
- Updated error messages to be type-aware

#### createUpgradeRequest (UPDATED)
- Now explicitly sets `requestType: 'upgrade'` in database
- Updated query to filter by requestType when checking for existing pending requests
- Validates requestedTier > currentTier

#### createDowngradeRequest (NEW)
```typescript
export async function createDowngradeRequest(
  payload: CreateUpgradeRequestPayload
): Promise<TierUpgradeRequest>
```
- Validates requestedTier < currentTier
- Sets `requestType: 'downgrade'` in database
- Checks for existing pending downgrade (not upgrade)

#### createTierChangeRequest (NEW - unified interface)
```typescript
export async function createTierChangeRequest(
  payload: CreateUpgradeRequestPayload & { requestType: RequestType }
): Promise<TierUpgradeRequest>
```
- Dispatches to createUpgradeRequest or createDowngradeRequest based on requestType

#### getPendingRequest (UPDATED signature)
```typescript
export async function getPendingRequest(
  vendorId: string,
  requestType?: RequestType  // NEW optional parameter
): Promise<TierUpgradeRequest | null>
```
- Can now filter by requestType
- If requestType not provided, returns any pending request

#### getMostRecentRequest (UPDATED signature)
```typescript
export async function getMostRecentRequest(
  vendorId: string,
  requestType?: RequestType  // NEW optional parameter
): Promise<TierUpgradeRequest | null>
```
- Can now filter by requestType

#### listRequests (UPDATED)
- Now includes `requestType` in where clause filtering
- Added `requestType: true` to select fields for performance optimization

#### approveRequest (UPDATED - logic unchanged but comment updated)
- Works for BOTH upgrades and downgrades
- Simply changes vendor.tier to requested tier (works for up or down)
- Comment updated to clarify it works for both types

### 6. Documentation Updates
- File header comment updated to mention "tier change request management"
- Function comments updated to be type-aware
- Performance optimization comments preserved

## Backward Compatibility

### Maintained
- All existing function exports still available
- `validateTierUpgradeRequest` still works (calls new validateTierRequest)
- `createUpgradeRequest` still works exactly as before
- `checkUniquePendingRequest` still works with default 'upgrade' parameter
- Existing code using namespace imports (`import * as TierUpgradeRequestService`) will continue to work

### New Functionality
- New `RequestType` export for type safety
- New `createDowngradeRequest` function
- New `createTierChangeRequest` unified function
- Enhanced validation via `validateTierRequest`
- requestType filtering in getPendingRequest and getMostRecentRequest

## API Endpoints That Import This Service
The following files import this service (all use namespace imports, so backward compatible):
- `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/route.ts`
- `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts`
- `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route.ts`
- `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/approve/route.ts`
- `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/reject/route.ts`

## Testing Checklist
- [ ] Type check passes: `npm run type-check`
- [ ] Existing upgrade request tests pass
- [ ] New downgrade request tests pass
- [ ] Validation tests for both types pass
- [ ] API endpoints still work

## Next Steps
1. Replace the original file with the new version (see bash commands above)
2. Run type check to verify TypeScript compilation
3. Update API endpoints to support downgrade requests (separate task)
4. Update frontend components to support downgrade requests (separate task)
5. Run full test suite
