# Task IMPL-BACKEND-SERVICES: Implement Backend Service Layer

**ID**: impl-backend-services
**Title**: Implement TierValidationService, VendorComputedFieldsService, VendorProfileService
**Agent**: backend-nodejs-specialist
**Estimated Time**: 2.5 hours
**Dependencies**: impl-backend-migrations
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 586-618, 1346-1418) - Service layer architecture and business logic
- @lib/services/LocationService.ts - Existing service pattern example
- @lib/payload-cms-data-service.ts - Existing data service patterns

## Objectives

### TierValidationService (lib/services/TierValidationService.ts)
1. Implement `validateFieldAccess(tier, fieldName): boolean` - checks if tier can access field
2. Implement `validateLocationLimit(tier, locationCount): {valid, maxAllowed}` - enforces location limits
3. Implement `canAccessFeature(tier, feature): boolean` - checks feature access
4. Implement `getTierFeatures(tier): TierFeature[]` - returns all features for tier
5. Implement `getLocationLimit(tier): number` - returns max locations for tier
6. Create tier configuration constants (lib/constants/tiers.ts)

### VendorComputedFieldsService (lib/services/VendorComputedFieldsService.ts)
1. Implement `computeYearsInBusiness(foundedYear): number | null` - calculates years in business
2. Implement `enrichVendorData(vendor): VendorWithComputed` - adds computed fields to vendor object
3. Handle edge cases: null foundedYear, future years (return null)

### VendorProfileService (lib/services/VendorProfileService.ts)
1. Implement `getVendorProfile(slug): Promise<Vendor>` - fetch public vendor profile with computed fields
2. Implement `getVendorForEdit(id, userId): Promise<Vendor>` - fetch vendor for dashboard editing with auth
3. Implement `updateVendorProfile(id, data, user): Promise<Vendor>` - update vendor with tier validation
4. Implement `validateTierData(vendor, newTier): Promise<ValidationResult>` - validate tier downgrade scenarios

## Acceptance Criteria

### TierValidationService
- [ ] All methods implemented with proper TypeScript types
- [ ] Tier configuration constants defined for all 4 tiers
- [ ] Location limits: Free=1, Tier1=3, Tier2=10, Tier3=unlimited
- [ ] Field access correctly checks tier hierarchy (Tier 3 includes all lower tier features)
- [ ] Unit tests cover all tier combinations

### VendorComputedFieldsService
- [ ] yearsInBusiness computed correctly (currentYear - foundedYear)
- [ ] Handles null foundedYear gracefully (returns null)
- [ ] Handles future years gracefully (returns null, logs warning)
- [ ] enrichVendorData adds computed fields without mutating original
- [ ] Unit tests cover edge cases

### VendorProfileService
- [ ] All methods use Payload CMS for data access
- [ ] Authorization checks enforce vendor ownership or admin role
- [ ] Tier validation runs before all updates
- [ ] Computed fields enriched before responses
- [ ] Error handling with proper error codes
- [ ] Integration tests with Payload CMS

## Testing Requirements

- Unit tests for all service methods
- Integration tests with Payload CMS database
- Test all tier combinations (16 combinations: 4 tiers × 4 access levels)
- Test authorization scenarios (owner, admin, other user)
- Test edge cases (null values, boundary conditions)
- Test tier downgrade validation (e.g., Tier 2 → Tier 1 with 5 locations should fail)

## Evidence Requirements

- lib/services/TierValidationService.ts
- lib/services/VendorComputedFieldsService.ts
- lib/services/VendorProfileService.ts
- lib/constants/tiers.ts
- lib/types/tier.ts (type definitions)
- Test files with 80%+ coverage
- Test execution results
