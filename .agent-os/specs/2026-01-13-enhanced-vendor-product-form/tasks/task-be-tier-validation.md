# Task: be-tier-validation

## Metadata
- **Phase**: 1 - Pre-Execution (CRITICAL - Security)
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 45-60 min
- **Dependencies**: none (BLOCKER for all frontend tasks)
- **Status**: pending
- **Priority**: P0 - Critical Security

## Description

**SECURITY CRITICAL**: Add backend tier validation to the products API. Currently, the `/api/portal/vendors/[id]/products` route has NO tier checking. A lower-tier vendor could bypass the frontend and submit tier-restricted fields (images, pricing, specifications, features, etc.) via direct API call.

## Specifics

### Files to Modify
- `app/api/portal/vendors/[id]/products/route.ts` - POST handler
- `app/api/portal/vendors/[id]/products/[productId]/route.ts` - PUT handler (if exists)

### Files to Reference
- `lib/services/TierValidationService.ts` - Backend tier validation
- `lib/services/TierService.ts` - Tier feature definitions
- `lib/validation/product-schema.ts` - Understand which fields exist

### Technical Details

**Required Validations:**

1. **Feature Access Check** (tier2+ for productManagement):
   ```typescript
   import { TierValidationService } from '@/lib/services/TierValidationService';

   // In POST/PUT handler, after authentication:
   const vendor = await getVendor(vendorId);
   const canManageProducts = TierValidationService.canAccessFeature(
     vendor.tier,
     'productManagement'
   );

   if (!canManageProducts) {
     return NextResponse.json({
       success: false,
       error: {
         code: 'TIER_RESTRICTED',
         message: 'Product management requires Tier 2 or higher',
         upgradePath: 'tier2',
       },
     }, { status: 403 });
   }
   ```

2. **Field-Level Tier Validation** (strip restricted fields for lower tiers):
   ```typescript
   // Define tier-restricted fields
   const TIER_RESTRICTED_FIELDS = {
     tier2: ['images', 'pricing', 'specifications', 'features',
             'categories', 'tags', 'actionButtons', 'badges', 'seo'],
   };

   // Strip restricted fields if vendor tier is below required
   function sanitizeProductData(data: CreateProductInput, vendorTier: string) {
     if (!TierService.isTierOrHigher(vendorTier, 'tier2')) {
       const sanitized = { ...data };
       TIER_RESTRICTED_FIELDS.tier2.forEach(field => {
         delete sanitized[field];
       });
       return sanitized;
     }
     return data;
   }
   ```

3. **Audit Logging**:
   - Log when tier-restricted fields are stripped
   - Log tier validation failures

## Acceptance Criteria

- [ ] POST /products returns 403 for free/tier1 vendors
- [ ] PUT /products returns 403 for free/tier1 vendors
- [ ] Tier2+ vendors can submit all fields successfully
- [ ] If somehow a lower-tier vendor submits extended fields, they are stripped (defense in depth)
- [ ] Tier validation errors return clear upgrade path message
- [ ] All tier checks use TierValidationService (not hardcoded)
- [ ] Audit logs capture tier restriction events

## Testing Requirements

```typescript
describe('Product API Tier Validation', () => {
  describe('POST /api/portal/vendors/[id]/products', () => {
    it('returns 403 for free tier vendor', async () => {
      // Create product as free tier vendor
      const response = await fetch('/api/portal/vendors/free-vendor-id/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: 'Test' }),
      });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error.code).toBe('TIER_RESTRICTED');
    });

    it('returns 403 for tier1 vendor', async () => {
      // Similar test for tier1
    });

    it('allows tier2 vendor to create product', async () => {
      const response = await fetch('/api/portal/vendors/tier2-vendor-id/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test',
          description: 'Test',
          images: [{ url: 'https://example.com/img.jpg' }],
        }),
      });
      expect(response.status).toBe(201);
    });

    it('strips tier-restricted fields for lower tiers (defense in depth)', async () => {
      // This tests the sanitization layer
      // If a lower-tier vendor somehow bypasses the 403 check,
      // their tier-restricted fields should be stripped
    });
  });
});
```

## Context Requirements

### Must Read Before Implementation
- `lib/services/TierValidationService.ts` - Full file
- `lib/services/TierService.ts` - Tier hierarchy
- `app/api/portal/vendors/[id]/products/route.ts` - Current POST implementation

### Security Considerations
- Never trust frontend-only validation
- Defense in depth: validate tier, then sanitize fields
- Log all tier restriction events for audit

## Implementation Notes

```typescript
// app/api/portal/vendors/[id]/products/route.ts

import { TierValidationService } from '@/lib/services/TierValidationService';
import { TierService } from '@/lib/services/TierService';
import { getPayload } from 'payload';

// Tier-restricted product fields
const TIER2_FIELDS = [
  'images', 'pricing', 'specifications', 'features',
  'categories', 'tags', 'actionButtons', 'badges', 'seo'
] as const;

// Helper to get vendor with tier
async function getVendorWithTier(vendorId: string) {
  const payload = await getPayload({ config: configPromise });
  const vendor = await payload.findByID({
    collection: 'vendors',
    id: vendorId,
  });
  return vendor;
}

// Sanitize product data based on tier
function sanitizeForTier(data: any, tier: string) {
  if (TierService.isTierOrHigher(tier, 'tier2')) {
    return data; // Tier2+ can use all fields
  }

  const sanitized = { ...data };
  TIER2_FIELDS.forEach(field => {
    if (field in sanitized) {
      console.log(`[TierValidation] Stripping field '${field}' for tier '${tier}'`);
      delete sanitized[field];
    }
  });
  return sanitized;
}

export async function POST(request: NextRequest, context: RouteContext) {
  // ... existing auth code ...

  // NEW: Tier validation
  const vendor = await getVendorWithTier(vendorId);

  if (!TierValidationService.canAccessFeature(vendor.tier || 'free', 'productManagement')) {
    console.log('[TierValidation] Product creation blocked:', {
      vendorId,
      tier: vendor.tier,
      feature: 'productManagement',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'TIER_RESTRICTED',
        message: 'Product management requires Tier 2 or higher',
        upgradePath: TierService.getUpgradePath('productManagement'),
      },
    }, { status: 403 });
  }

  // ... existing body parsing ...

  // NEW: Sanitize data based on tier (defense in depth)
  const sanitizedData = sanitizeForTier(body, vendor.tier || 'free');

  // Use sanitizedData for validation and creation
  const validation = CreateProductSchema.safeParse(sanitizedData);
  // ... rest of existing code ...
}
```

## Related Files
- `app/api/portal/vendors/[id]/products/route.ts` - Main target
- `app/api/portal/vendors/[id]/products/[productId]/route.ts` - Update handler
- `lib/services/TierValidationService.ts` - Validation service
- `lib/services/TierService.ts` - Tier definitions
