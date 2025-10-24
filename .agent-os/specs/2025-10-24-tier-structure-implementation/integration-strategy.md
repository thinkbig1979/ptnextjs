# Integration Strategy: Tier Structure Implementation

**Document Version**: 1.0
**Date**: 2025-10-24
**Status**: Approved for Execution
**Dependencies**: PRE-1 Codebase Analysis Complete

---

## Executive Summary

This integration strategy provides a comprehensive, phased approach to implementing the 4-tier vendor subscription system. The strategy prioritizes **backend-first implementation** to establish data integrity before frontend development, followed by systematic frontend component creation, and concluding with integration testing.

**Key Strategy Decisions**:
- **Phased Approach**: 4 distinct phases (Backend → Frontend → Integration → Validation)
- **Parallel Execution**: Identifies 12 parallelization opportunities to reduce timeline by 40%
- **Risk Mitigation**: Includes rollback procedures for each critical change
- **Data Preservation**: Migration strategy ensures zero data loss
- **Component Reuse**: Leverages existing LocationsManagerCard and TierUpgradePrompt patterns

**Estimated Timeline**: 60 hours total with parallelization, 85 hours sequential

---

## Phase-Based Implementation Plan

### Phase 1: Backend Foundation (16.5 hours)

**Objective**: Establish database schema, services, and API endpoints with complete tier validation

**Critical Path Tasks**:
1. TEST-BACKEND-SCHEMA → Design database schema tests (1.5h)
2. IMPL-BACKEND-SCHEMA → Extend Vendors collection with 40+ tier fields (3h)
3. IMPL-BACKEND-MIGRATIONS → Create foundedYear migration (1h)
4. IMPL-BACKEND-SERVICES → Build TierValidationService, VendorComputedFieldsService, VendorProfileService (2.5h)
5. IMPL-BACKEND-API-GET → Implement GET /api/portal/vendors/[id] (1.5h)
6. IMPL-BACKEND-API-PUT → Implement PUT /api/portal/vendors/[id] with tier validation (2h)
7. IMPL-BACKEND-API-PUBLIC → Implement GET /api/vendors/[slug] with tier filtering (1.5h)
8. TEST-BACKEND-INTEGRATION → Integration testing of backend APIs (2h)

**Parallel Execution Opportunities**:
- After IMPL-BACKEND-SERVICES completes, all 3 API endpoint tasks (GET, PUT, PUBLIC) can run in parallel
- **Savings**: 3 hours (from 6h sequential to 3h parallel, using longest path)

**Key Deliverables**:
- Extended Payload CMS Vendors collection with tier3 support
- Complete tier validation service layer
- Functional API endpoints with tier-aware CRUD operations
- Backend integration tests passing

**Success Criteria**:
- All new fields accessible via Payload CMS admin
- API endpoints return tier-filtered data correctly
- Tier validation blocks unauthorized field updates
- Backend test coverage ≥80%

---

### Phase 2: Frontend Components (25.5 hours)

**Objective**: Build dashboard UI components and public profile display with tier-responsive behavior

**Critical Path Tasks**:
1. TEST-FRONTEND-UI → Design frontend UI test suite (2h)
2. IMPL-FRONTEND-CONTEXTS → Create TierAccessContext and VendorDashboardContext (1.5h)
3. IMPL-FRONTEND-SERVICES → Build frontend tier validation utilities (1h)
4. IMPL-DASHBOARD-PAGE → Create VendorDashboard page container (1.5h)
5. IMPL-DASHBOARD-TABS → Build ProfileEditTabs with tier-aware tab visibility (1.5h)
6. IMPL-BASIC-INFO-FORM → BasicInfoForm component (2h)
7. IMPL-BRAND-STORY-FORM → BrandStoryForm with computed years in business (2.5h)
8. IMPL-CERTIFICATIONS-MANAGER → CertificationsAwardsManager array CRUD (3h)
9. IMPL-CASE-STUDIES-MANAGER → CaseStudiesManager with rich content (3h)
10. IMPL-TEAM-MANAGER → TeamMembersManager component (2h)
11. IMPL-PROMOTION-FORM → PromotionPackForm for tier3 (1h)
12. IMPL-PUBLIC-PROFILE → VendorProfilePage with tier sections (3h)
13. IMPL-VENDOR-CARD → VendorCard list item component (1.5h)
14. IMPL-TIER-COMPONENTS → TierBadge, YearsInBusinessDisplay, UpgradePromptCard (2h)
15. TEST-FRONTEND-INTEGRATION → Frontend integration tests (2.5h)

**Parallel Execution Opportunities**:
- After IMPL-DASHBOARD-TABS, forms can be developed in parallel groups:
  - Group 1: IMPL-BASIC-INFO-FORM + IMPL-BRAND-STORY-FORM (staggered, 4h → 3h)
  - Group 2: IMPL-CERTIFICATIONS-MANAGER + IMPL-CASE-STUDIES-MANAGER + IMPL-TEAM-MANAGER (parallel after form patterns established, 8h → 3.5h)
- IMPL-PUBLIC-PROFILE and IMPL-VENDOR-CARD can be developed in parallel after form components (3h + 1.5h → 3h)
- **Savings**: 7 hours total

**Key Deliverables**:
- Complete vendor dashboard with 7 form tabs
- Public vendor profile page with tier-responsive sections
- Reusable tier-aware components (TierBadge, UpgradePromptCard)
- Component test coverage ≥80%

**Success Criteria**:
- All dashboard forms render with correct tier visibility
- Upgrade prompts display for locked features
- Years in business displays correctly as computed field
- Public profiles show tier-appropriate content

---

### Phase 3: Frontend-Backend Integration (11 hours)

**Objective**: Connect frontend components to backend APIs and validate full-stack functionality

**Critical Path Tasks**:
1. INTEG-API-CONTRACT → Validate API contracts match frontend expectations (1h)
2. INTEG-FRONTEND-BACKEND → Wire dashboard forms to API endpoints (2h)
3. TEST-E2E-DASHBOARD → E2E test for vendor dashboard editing workflow (2h)
4. TEST-E2E-PUBLIC-PROFILE → E2E test for public profile display at each tier (1.5h)
5. TEST-E2E-COMPUTED-FIELDS → E2E test for years in business computation (0.75h)
6. VALID-FULL-STACK → Validate complete full-stack integration (2h)

**Parallel Execution Opportunities**:
- After INTEG-FRONTEND-BACKEND, all 3 E2E tests can run in parallel
- **Savings**: 2.25 hours (from 4.25h sequential to 2h parallel)

**Key Deliverables**:
- Functional end-to-end vendor profile editing workflow
- API integration working for all CRUD operations
- E2E tests passing for all tier scenarios

**Success Criteria**:
- Dashboard successfully saves vendor updates
- Tier validation enforced on both client and server
- Public profiles display correctly after updates
- All E2E tests passing

---

### Phase 4: Final Validation (3.5 hours)

**Objective**: Comprehensive system validation and production readiness verification

**Tasks**:
1. FINAL-INTEGRATION → Perform system-wide integration validation (1.5h)
2. FINAL-VALIDATION → Final quality validation and stakeholder approval (2h)

**Key Deliverables**:
- System integration report
- Performance benchmarks
- Security audit results
- Stakeholder sign-off

**Success Criteria**:
- All 30 tasks completed
- Test coverage ≥80%
- Performance requirements met (<2s dashboard, <1.5s profile)
- Security requirements validated
- Accessibility compliance (WCAG 2.1 AA)

---

## Dependency Graph

```mermaid
graph TD
    PRE1[PRE-1: Codebase Analysis] --> PRE2[PRE-2: Integration Strategy]
    PRE2 --> TEST_SCHEMA[TEST-BACKEND-SCHEMA]
    TEST_SCHEMA --> IMPL_SCHEMA[IMPL-BACKEND-SCHEMA]
    IMPL_SCHEMA --> IMPL_MIG[IMPL-BACKEND-MIGRATIONS]
    IMPL_MIG --> IMPL_SVC[IMPL-BACKEND-SERVICES]

    IMPL_SVC --> IMPL_GET[IMPL-BACKEND-API-GET]
    IMPL_SVC --> IMPL_PUT[IMPL-BACKEND-API-PUT]
    IMPL_SVC --> IMPL_PUBLIC[IMPL-BACKEND-API-PUBLIC]

    IMPL_GET --> TEST_BE_INT[TEST-BACKEND-INTEGRATION]
    IMPL_PUT --> TEST_BE_INT
    IMPL_PUBLIC --> TEST_BE_INT

    TEST_BE_INT --> TEST_FE_UI[TEST-FRONTEND-UI]
    TEST_FE_UI --> IMPL_CTX[IMPL-FRONTEND-CONTEXTS]
    IMPL_CTX --> IMPL_FE_SVC[IMPL-FRONTEND-SERVICES]
    IMPL_FE_SVC --> IMPL_PAGE[IMPL-DASHBOARD-PAGE]
    IMPL_PAGE --> IMPL_TABS[IMPL-DASHBOARD-TABS]

    IMPL_TABS --> IMPL_BASIC[IMPL-BASIC-INFO-FORM]
    IMPL_TABS --> IMPL_BRAND[IMPL-BRAND-STORY-FORM]
    IMPL_BASIC --> IMPL_CERT[IMPL-CERTIFICATIONS-MANAGER]
    IMPL_BRAND --> IMPL_CERT
    IMPL_CERT --> IMPL_CASE[IMPL-CASE-STUDIES-MANAGER]
    IMPL_CERT --> IMPL_TEAM[IMPL-TEAM-MANAGER]
    IMPL_CASE --> IMPL_PROMO[IMPL-PROMOTION-FORM]
    IMPL_TEAM --> IMPL_PROMO

    IMPL_PROMO --> IMPL_PROFILE[IMPL-PUBLIC-PROFILE]
    IMPL_PROMO --> IMPL_CARD[IMPL-VENDOR-CARD]
    IMPL_PROFILE --> IMPL_TIER_COMP[IMPL-TIER-COMPONENTS]
    IMPL_CARD --> IMPL_TIER_COMP

    IMPL_TIER_COMP --> TEST_FE_INT[TEST-FRONTEND-INTEGRATION]
    TEST_FE_INT --> INTEG_API[INTEG-API-CONTRACT]
    INTEG_API --> INTEG_FE_BE[INTEG-FRONTEND-BACKEND]

    INTEG_FE_BE --> TEST_E2E_DASH[TEST-E2E-DASHBOARD]
    INTEG_FE_BE --> TEST_E2E_PROF[TEST-E2E-PUBLIC-PROFILE]
    INTEG_FE_BE --> TEST_E2E_COMP[TEST-E2E-COMPUTED-FIELDS]

    TEST_E2E_DASH --> VALID_FS[VALID-FULL-STACK]
    TEST_E2E_PROF --> VALID_FS
    TEST_E2E_COMP --> VALID_FS

    VALID_FS --> FINAL_INT[FINAL-INTEGRATION]
    FINAL_INT --> FINAL_VAL[FINAL-VALIDATION]
```

**Critical Path** (highlighted in dependency graph):
PRE-1 → PRE-2 → TEST-BACKEND-SCHEMA → IMPL-BACKEND-SCHEMA → IMPL-BACKEND-MIGRATIONS → IMPL-BACKEND-SERVICES → IMPL-BACKEND-API-PUT → TEST-BACKEND-INTEGRATION → TEST-FRONTEND-UI → IMPL-FRONTEND-CONTEXTS → IMPL-FRONTEND-SERVICES → IMPL-DASHBOARD-PAGE → IMPL-DASHBOARD-TABS → IMPL-BRAND-STORY-FORM → TEST-FRONTEND-INTEGRATION → INTEG-API-CONTRACT → INTEG-FRONTEND-BACKEND → VALID-FULL-STACK → FINAL-INTEGRATION → FINAL-VALIDATION

**Total Critical Path Time**: 32.5 hours

---

## Database Migration Strategy

### Migration 1: foundedYear Field Migration

**Purpose**: Convert existing `yearsInBusiness` data to `foundedYear` field

**Migration Script**:
```typescript
// migrations/2025-10-24-add-founded-year.ts
import payload from 'payload'

export async function up() {
  const currentYear = new Date().getFullYear()

  // Fetch all vendors with yearsInBusiness
  const vendors = await payload.find({
    collection: 'vendors',
    limit: 0,
    where: {
      yearsInBusiness: {
        exists: true,
      },
    },
  })

  // Convert yearsInBusiness to foundedYear
  for (const vendor of vendors.docs) {
    if (vendor.yearsInBusiness && vendor.yearsInBusiness > 0) {
      const foundedYear = currentYear - vendor.yearsInBusiness

      // Validate year is reasonable (1800-current)
      if (foundedYear >= 1800 && foundedYear <= currentYear) {
        await payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: {
            foundedYear,
          },
        })
        console.log(`Migrated vendor ${vendor.id}: yearsInBusiness ${vendor.yearsInBusiness} → foundedYear ${foundedYear}`)
      } else {
        console.warn(`Skipped vendor ${vendor.id}: Invalid foundedYear ${foundedYear}`)
      }
    }
  }

  console.log(`Migration complete: ${vendors.docs.length} vendors processed`)
}

export async function down() {
  // Rollback: Compute yearsInBusiness from foundedYear
  const currentYear = new Date().getFullYear()

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 0,
    where: {
      foundedYear: {
        exists: true,
      },
    },
  })

  for (const vendor of vendors.docs) {
    if (vendor.foundedYear) {
      const yearsInBusiness = currentYear - vendor.foundedYear

      await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: {
          yearsInBusiness,
          foundedYear: null, // Clear foundedYear on rollback
        },
      })
      console.log(`Rolled back vendor ${vendor.id}: foundedYear ${vendor.foundedYear} → yearsInBusiness ${yearsInBusiness}`)
    }
  }

  console.log(`Rollback complete: ${vendors.docs.length} vendors restored`)
}
```

**Pre-Migration Checklist**:
- [ ] Backup production database
- [ ] Test migration on development database
- [ ] Verify data integrity after migration
- [ ] Confirm PayloadCMSDataService computes yearsInBusiness correctly

**Post-Migration Validation**:
- [ ] All vendors with yearsInBusiness have foundedYear populated
- [ ] Computed yearsInBusiness matches original values
- [ ] No data loss occurred

**Rollback Procedure**:
```bash
# If migration fails or produces incorrect data:
npm run payload migrate:down -- --file 2025-10-24-add-founded-year

# Verify rollback:
# - yearsInBusiness field restored to original values
# - foundedYear field cleared
```

---

### Migration 2: Tier 3 Schema Update

**Purpose**: Add Tier 3 option to tier select field and add new tier3-specific fields

**Migration Type**: Non-destructive schema extension

**Steps**:
1. Update Vendors.ts collection to include tier3 in select options
2. Add promotionPack group fields
3. Add editorialContent array
4. Add tier2+ feature flag fields (featuredInCategory, advancedAnalytics, apiAccess, customDomain)

**Data Impact**: No existing data modified, all new fields default to null/false

**Validation**:
- [ ] Tier select dropdown shows all 4 tiers in admin
- [ ] Tier3-specific fields only visible when tier='tier3'
- [ ] Existing vendors retain their current tier
- [ ] No breaking changes to existing API responses

---

## Component Integration Plan

### Reusing LocationsManagerCard

**Current Implementation**: `components/dashboard/LocationsManagerCard.tsx`

**Required Modifications**: None (already tier-aware)

**Integration Approach**:
1. Import LocationsManagerCard into ProfileEditTabs
2. Pass vendor.tier to enable tier-based limit enforcement
3. Use existing useTierAccess hook for feature check
4. Display TierUpgradePrompt when tier < tier2

**Integration Code**:
```typescript
// In ProfileEditTabs.tsx
import { LocationsManagerCard } from '@/components/dashboard/LocationsManagerCard'
import { useTierAccess } from '@/hooks/useTierAccess'

// Inside Locations tab content:
const { hasAccess, tier, upgradePath } = useTierAccess('multipleLocations', vendor.tier)

<TabsContent value="locations">
  {hasAccess ? (
    <LocationsManagerCard
      vendorId={vendor.id}
      locations={vendor.locations || []}
      tier={vendor.tier}
      onUpdate={(locations) => handleVendorUpdate({ locations })}
    />
  ) : (
    <TierUpgradePrompt
      currentTier={vendor.tier}
      requiredTier="tier2"
      featureName="Multiple Office Locations"
      upgradePath={upgradePath}
    />
  )}
</TabsContent>
```

**Testing Requirements**:
- [ ] LocationsManagerCard displays correctly in dashboard
- [ ] Tier limits enforced (Free: 1, Tier1: 3, Tier2+: unlimited)
- [ ] Upgrade prompt displays for Free/Tier1 vendors

---

### Reusing TierUpgradePrompt

**Current Implementation**: `components/dashboard/TierUpgradePrompt.tsx`

**Required Modifications**: Extend to show tier-specific benefits list

**Integration Approach**:
1. Use TierUpgradePrompt for all locked features across dashboard tabs
2. Pass feature-specific benefits list via props
3. Customize upgrade CTA based on feature

**Enhanced Component Interface**:
```typescript
interface TierUpgradePromptProps {
  currentTier: string
  requiredTier: string
  featureName: string
  benefits?: string[] // NEW: Optional benefits list
  upgradePath?: string
  className?: string
}
```

**Usage Examples**:
```typescript
// Brand Story tab (Tier 1 required)
<TierUpgradePrompt
  currentTier="free"
  requiredTier="tier1"
  featureName="Brand Story"
  benefits={[
    'Extended company description',
    'Social proof metrics',
    'Video introduction',
    'Company values showcase'
  ]}
/>

// Certifications tab (Tier 1 required)
<TierUpgradePrompt
  currentTier="free"
  requiredTier="tier1"
  featureName="Certifications & Awards"
  benefits={[
    'Showcase industry certifications',
    'Display awards and recognition',
    'Build credibility with proof points'
  ]}
/>
```

---

### PayloadCMSDataService Extension

**Current Implementation**: `lib/payload-cms-data-service.ts`

**Required Modifications**:
1. Add `computeYearsInBusiness` helper in transformation
2. Extend `transformPayloadVendor` to include computed field
3. Add tier3 field transformations

**Modified Code**:
```typescript
// In PayloadCMSDataService class

private static computeYearsInBusiness(foundedYear?: number | null): number | null {
  if (!foundedYear) return null
  const currentYear = new Date().getFullYear()
  if (foundedYear > currentYear || foundedYear < 1800) return null
  return currentYear - foundedYear
}

private static transformPayloadVendor(doc: VendorPayloadDoc): Vendor {
  // Existing transformations...

  return {
    // ... existing fields
    tier: doc.tier || 'free',
    foundedYear: doc.foundedYear,
    yearsInBusiness: this.computeYearsInBusiness(doc.foundedYear), // COMPUTED

    // Tier 1+ fields
    certifications: doc.certifications?.map(this.transformCertification),
    awards: doc.awards?.map(this.transformAward),
    videoIntroduction: doc.videoUrl ? {
      url: doc.videoUrl,
      thumbnail: this.resolveMediaUrl(doc.videoThumbnail),
      duration: doc.videoDuration,
      title: doc.videoTitle,
      description: doc.videoDescription,
    } : undefined,
    caseStudies: doc.caseStudies?.map(this.transformCaseStudy),
    // ... other tier1+ fields

    // Tier 2+ fields
    featuredInCategory: doc.featuredInCategory || false,
    advancedAnalytics: doc.advancedAnalytics || false,

    // Tier 3 fields
    promotionPack: doc.tier === 'tier3' ? {
      featuredPlacement: doc.promotionPack?.featuredPlacement || false,
      editorialCoverage: doc.promotionPack?.editorialCoverage || false,
      searchHighlight: doc.promotionPack?.searchHighlight || false,
    } : undefined,
    editorialContent: doc.editorialContent?.map(this.transformEditorial),
  }
}
```

**Testing Requirements**:
- [ ] yearsInBusiness computes correctly from foundedYear
- [ ] Tier3 fields only included when tier='tier3'
- [ ] All transformations backward compatible with existing data

---

## Risk Assessment & Mitigation

### Risk 1: Breaking Changes to Existing Vendor Profiles

**Severity**: HIGH
**Probability**: MEDIUM
**Impact**: Existing vendors unable to view/edit profiles

**Mitigation Strategies**:
1. **Schema Extension Only**: All new fields have null/false defaults, no required fields removed
2. **Backward Compatibility**: PayloadCMSDataService handles missing fields gracefully
3. **Gradual Rollout**: Deploy backend changes first, test with existing data before frontend
4. **Rollback Plan**: Keep yearsInBusiness field populated during transition period

**Rollback Procedure**:
```bash
# If breaking changes detected:
1. Revert Payload CMS Vendors.ts to previous version
2. Run migration down script to restore yearsInBusiness
3. Clear application cache
4. Restart Payload CMS
5. Verify existing vendors accessible
```

**Monitoring**:
- Watch error logs for "field not found" errors
- Monitor API error rates
- User-reported issues via support tickets

---

### Risk 2: Data Loss During foundedYear Migration

**Severity**: HIGH
**Probability**: LOW
**Impact**: Loss of years in business data for vendors

**Mitigation Strategies**:
1. **Pre-Migration Backup**: Full database backup before migration
2. **Dry Run**: Test migration on copy of production data
3. **Validation**: Compare pre/post migration yearsInBusiness computed values
4. **Dual Field Period**: Keep both foundedYear and yearsInBusiness for 30 days post-migration

**Rollback Procedure**:
```bash
# If data loss detected:
1. Stop application
2. Restore database from pre-migration backup
3. Run migration:down script to revert schema changes
4. Verify data integrity
5. Restart application
```

**Validation Checks**:
```sql
-- Pre-migration count
SELECT COUNT(*) FROM vendors WHERE yearsInBusiness IS NOT NULL;

-- Post-migration validation
SELECT
  id,
  yearsInBusiness AS old_value,
  YEAR(CURDATE()) - foundedYear AS computed_value
FROM vendors
WHERE foundedYear IS NOT NULL;

-- Should match within ±1 year (due to current year increment)
```

---

### Risk 3: Frontend Performance Degradation

**Severity**: MEDIUM
**Probability**: MEDIUM
**Impact**: Dashboard page load times >2s

**Mitigation Strategies**:
1. **Code Splitting**: Split tier-specific forms into separate bundles
2. **Lazy Loading**: Load form tabs on-demand, not all at once
3. **Memoization**: Use React.memo for expensive components
4. **SWR Caching**: Cache vendor data with 5-minute revalidation

**Performance Monitoring**:
- Lighthouse CI in build pipeline
- Sentry performance monitoring
- Real User Monitoring (RUM) for page load times

**Rollback Procedure**:
```bash
# If performance issues detected:
1. Identify slow components via React DevTools Profiler
2. Add React.memo to heavy components
3. Reduce initial bundle size via dynamic imports
4. Revert problematic components if unfixable
```

**Performance Benchmarks**:
- Dashboard initial load: <2s (target), <3s (acceptable), >3s (issue)
- Tab switch: <200ms
- Form save: <1s

---

### Risk 4: API Tier Validation Bypass

**Severity**: HIGH
**Probability**: LOW
**Impact**: Users editing fields above their tier

**Mitigation Strategies**:
1. **Server-Side Enforcement**: All tier checks server-side, client checks are UI-only
2. **Field Filtering**: TierValidationService filters request body before DB update
3. **Comprehensive Tests**: Test all tier scenarios (free, tier1, tier2, tier3, admin)
4. **Audit Logging**: Log all tier restriction violations for monitoring

**Testing Coverage**:
```typescript
// Required test scenarios:
- Free tier attempts to update tier1 field (certifications) → 403 Forbidden
- Tier1 attempts to update tier2 field (featuredInCategory) → 403 Forbidden
- Tier2 attempts to update tier3 field (promotionPack) → 403 Forbidden
- Admin bypasses all tier restrictions → Success
- User updates own tier fields → Success
```

**Monitoring**:
- Track 403 Forbidden responses by tier and field
- Alert on spike in tier violations (potential attack)

---

### Risk 5: Computed Field Inconsistency

**Severity**: LOW
**Probability**: LOW
**Impact**: yearsInBusiness displays incorrect value

**Mitigation Strategies**:
1. **Single Source of Truth**: foundedYear is only stored field, yearsInBusiness always computed
2. **Consistent Computation**: Same logic in frontend and backend
3. **Validation**: Ensure foundedYear in valid range (1800-current year)
4. **Unit Tests**: Test edge cases (null, future year, year 1800, current year)

**Edge Cases to Test**:
```typescript
// foundedYear = null → yearsInBusiness = null
computeYearsInBusiness(null) === null

// foundedYear = 2010, currentYear = 2025 → yearsInBusiness = 15
computeYearsInBusiness(2010) === 15

// foundedYear = 2026 (future) → yearsInBusiness = null
computeYearsInBusiness(2026) === null

// foundedYear = 1800 (edge) → yearsInBusiness = 225
computeYearsInBusiness(1800) === 225
```

---

## Testing Strategy

### Backend Testing

**Unit Tests** (TDD Approach):
```
lib/services/TierValidationService.test.ts
├─ validateFieldAccess(tier, field)
│  ├─ Free tier can access basic fields
│  ├─ Free tier cannot access tier1+ fields
│  ├─ Tier1 can access tier1 and basic fields
│  ├─ Tier1 cannot access tier2+ fields
│  └─ Admin can access all fields
├─ validateLocationLimit(tier, count)
│  ├─ Free tier limited to 1 location
│  ├─ Tier1 limited to 3 locations
│  └─ Tier2+ unlimited locations
└─ canAccessFeature(tier, feature)
   ├─ multipleLocations requires tier2
   ├─ advancedAnalytics requires tier2
   └─ featuredPlacement requires tier3

lib/services/VendorComputedFieldsService.test.ts
├─ computeYearsInBusiness(foundedYear)
│  ├─ Null input returns null
│  ├─ Valid year returns correct age
│  ├─ Future year returns null
│  └─ Ancient year (1800) returns valid age
└─ enrichVendorData(vendor)
   ├─ Adds yearsInBusiness to vendor object
   └─ Preserves all other fields

lib/services/VendorProfileService.test.ts (requires DB)
├─ updateVendorProfile(id, data, user)
│  ├─ User can update own profile
│  ├─ User cannot update other vendor's profile
│  ├─ Admin can update any profile
│  ├─ Tier validation enforced
│  └─ Computed fields returned in response
```

**Integration Tests** (API Level):
```
app/api/portal/vendors/[id]/route.test.ts
├─ GET /api/portal/vendors/[id]
│  ├─ Returns vendor with computed fields
│  ├─ 401 if not authenticated
│  ├─ 403 if accessing other vendor
│  └─ Admin can access any vendor
├─ PUT /api/portal/vendors/[id]
│  ├─ Updates allowed fields successfully
│  ├─ Returns 403 for tier-restricted fields
│  ├─ Returns 400 for invalid data
│  └─ Recomputes yearsInBusiness after foundedYear update
```

---

### Frontend Testing

**Component Unit Tests** (React Testing Library):
```
components/dashboard/BrandStoryForm.test.tsx
├─ Renders all fields for tier1+ vendors
├─ Shows upgrade prompt for free tier
├─ Computes years in business from founded year input
├─ Validates founded year range (1800-current)
└─ Submits form data correctly

components/dashboard/CertificationsAwardsManager.test.tsx
├─ Displays list of certifications
├─ Opens add dialog on button click
├─ Adds new certification to list
├─ Edits existing certification
├─ Deletes certification with confirmation
└─ Shows upgrade prompt for free tier

components/vendors/TierBadge.test.tsx
├─ Displays correct tier label (Free, Tier 1, Tier 2, Tier 3)
├─ Applies correct styling for each tier
└─ Renders in different sizes (sm, md, lg)
```

**Integration Tests** (Component Interaction):
```
app/portal/dashboard/page.test.tsx
├─ Fetches vendor data on mount
├─ Displays correct tabs based on tier
├─ Switches between tabs correctly
├─ Saves form data via API
├─ Shows success toast on save
└─ Shows error toast on save failure
```

---

### E2E Testing (Playwright)

**Test Suite 1: Dashboard Editing Workflow**
```typescript
// tests/e2e/vendor-dashboard.spec.ts

test('Free tier vendor sees limited tabs', async ({ page }) => {
  await loginAsVendor('free-tier-vendor@example.com')
  await page.goto('/portal/dashboard')

  // Should see Basic Info and Locations tabs only
  await expect(page.getByRole('tab', { name: 'Basic Info' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Locations' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Brand Story' })).not.toBeVisible()
})

test('Tier1 vendor can edit brand story', async ({ page }) => {
  await loginAsVendor('tier1-vendor@example.com')
  await page.goto('/portal/dashboard')

  // Navigate to Brand Story tab
  await page.click('text=Brand Story')

  // Fill founded year
  await page.fill('input[name="foundedYear"]', '2010')

  // Verify years in business computed
  await expect(page.getByText('Years in Business: 15')).toBeVisible()

  // Save form
  await page.click('button:has-text("Save Profile")')

  // Verify success toast
  await expect(page.getByText('Profile updated successfully')).toBeVisible()
})
```

**Test Suite 2: Public Profile Display**
```typescript
// tests/e2e/vendor-profile-tiers.spec.ts

test('Free tier public profile shows basic info only', async ({ page }) => {
  await page.goto('/vendors/free-tier-vendor-slug')

  // Basic info visible
  await expect(page.getByRole('heading', { name: 'Vendor Name' })).toBeVisible()
  await expect(page.getByText('Company description')).toBeVisible()

  // Tier1+ features not visible
  await expect(page.getByText('Certifications')).not.toBeVisible()
  await expect(page.getByText('Case Studies')).not.toBeVisible()
})

test('Tier1 profile shows certifications and awards', async ({ page }) => {
  await page.goto('/vendors/tier1-vendor-slug')

  // Basic info + tier1 features visible
  await expect(page.getByRole('heading', { name: 'Certifications' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Awards' })).toBeVisible()
  await expect(page.getByText('Years in Business: 12')).toBeVisible()
})

test('Tier3 profile shows all features including promotion', async ({ page }) => {
  await page.goto('/vendors/tier3-vendor-slug')

  // All sections visible
  await expect(page.getByText('Featured Vendor')).toBeVisible() // Badge
  await expect(page.getByRole('heading', { name: 'Editorial Coverage' })).toBeVisible()
})
```

**Test Suite 3: Computed Fields**
```typescript
// tests/e2e/computed-fields.spec.ts

test('Years in business updates when founded year changes', async ({ page }) => {
  await loginAsVendor('tier1-vendor@example.com')
  await page.goto('/portal/dashboard')
  await page.click('text=Brand Story')

  // Change founded year
  await page.fill('input[name="foundedYear"]', '2000')

  // Verify computed value updates
  await expect(page.getByText('Years in Business: 25')).toBeVisible()

  // Save and verify persisted
  await page.click('button:has-text("Save Profile")')
  await page.reload()

  await page.click('text=Brand Story')
  await expect(page.getByText('Years in Business: 25')).toBeVisible()
})
```

---

### Test Coverage Targets

**Backend**:
- Services: 90% coverage
- API routes: 85% coverage
- Overall: 80% minimum

**Frontend**:
- Critical components (forms, managers): 85% coverage
- UI components (badges, buttons): 70% coverage
- Overall: 80% minimum

**E2E**:
- Core user flows: 100% coverage (dashboard edit, profile view, tier upgrade flow)
- Edge cases: 80% coverage

---

## Rollback Procedures

### Phase 1: Backend Rollback

**Scenario**: Backend changes cause data corruption or API failures

**Rollback Steps**:
1. **Stop application**: `pm2 stop all` or Kubernetes rollback
2. **Revert database schema**:
   ```bash
   npm run payload migrate:down -- --file 2025-10-24-tier3-schema
   npm run payload migrate:down -- --file 2025-10-24-add-founded-year
   ```
3. **Restore code**:
   ```bash
   git revert <commit-range>
   git push origin main
   ```
4. **Restore database backup** (if migrations fail):
   ```bash
   # SQLite
   cp backups/vendors.db.2025-10-24.bak data/vendors.db

   # PostgreSQL
   pg_restore -d production backups/vendors_2025-10-24.dump
   ```
5. **Restart application**: `pm2 restart all`
6. **Verify rollback**: Test existing vendor profile access

**Post-Rollback Validation**:
- [ ] Existing vendors can access profiles
- [ ] API endpoints return expected data
- [ ] No 500 errors in logs
- [ ] Database integrity checks pass

**Time Estimate**: 15-30 minutes

---

### Phase 2: Frontend Rollback

**Scenario**: Frontend components cause errors or unusable UI

**Rollback Steps**:
1. **Revert frontend code**:
   ```bash
   git revert <commit-range>
   git push origin main
   ```
2. **Rebuild and redeploy**:
   ```bash
   npm run build
   npm run deploy
   ```
3. **Clear CDN cache**: Purge cached assets
4. **Verify rollback**: Test dashboard and public profiles

**Alternative**: Feature flag rollback (if implemented)
```typescript
// In feature flags config
{
  tierStructureV2: {
    enabled: false, // Disable new UI
    rollout: 0
  }
}
```

**Time Estimate**: 10-20 minutes

---

### Phase 3: Integration Rollback

**Scenario**: Integration between frontend and backend fails

**Rollback Steps**:
1. **Rollback frontend first** (see Phase 2)
2. **Wait 10 minutes** for cache to clear
3. **If issues persist, rollback backend** (see Phase 1)
4. **Verify old system functional**

**Time Estimate**: 20-40 minutes

---

### Emergency Hotfix Procedure

**Scenario**: Critical bug discovered in production

**Steps**:
1. **Create hotfix branch**: `git checkout -b hotfix/tier-structure-fix`
2. **Fix bug with minimal changes**
3. **Test fix locally**
4. **Deploy to staging**, run smoke tests
5. **Deploy to production**
6. **Monitor for 1 hour**
7. **Merge hotfix to main**

**Communication**:
- Notify team in #engineering Slack channel
- Post status update in #incidents
- Update status page if user-facing

---

## Component Integration Diagram

```mermaid
graph TB
    subgraph Backend
        API[API Routes]
        TierSvc[TierValidationService]
        CompSvc[VendorComputedFieldsService]
        ProfSvc[VendorProfileService]
        DataSvc[PayloadCMSDataService]
        PayloadDB[(Payload CMS DB)]
    end

    subgraph Frontend
        Page[VendorDashboard Page]
        Tabs[ProfileEditTabs]
        BasicForm[BasicInfoForm]
        BrandForm[BrandStoryForm]
        CertMgr[CertificationsManager]
        CaseMgr[CaseStudiesManager]
        TeamMgr[TeamMembersManager]
        PromForm[PromotionForm]
        LocMgr[LocationsManagerCard]
        TierCtx[TierAccessContext]
        VendorCtx[VendorDashboardContext]
    end

    subgraph ExistingComponents
        UpgradePrompt[TierUpgradePrompt]
        LocFormFields[LocationFormFields]
    end

    Page --> TierCtx
    Page --> VendorCtx
    Page --> Tabs

    Tabs --> BasicForm
    Tabs --> BrandForm
    Tabs --> CertMgr
    Tabs --> CaseMgr
    Tabs --> TeamMgr
    Tabs --> PromForm
    Tabs --> LocMgr

    BasicForm --> TierCtx
    BrandForm --> TierCtx
    BrandForm --> UpgradePrompt
    CertMgr --> TierCtx
    CertMgr --> UpgradePrompt
    LocMgr --> TierCtx
    LocMgr --> UpgradePrompt
    LocMgr --> LocFormFields

    VendorCtx --> API
    API --> ProfSvc
    ProfSvc --> TierSvc
    ProfSvc --> CompSvc
    ProfSvc --> DataSvc
    DataSvc --> PayloadDB
    CompSvc --> DataSvc
```

---

## Success Criteria Checklist

### Phase 1: Backend Foundation
- [ ] All 40+ tier-specific fields added to Vendors collection
- [ ] Tier3 option available in tier select
- [ ] foundedYear migration completes without data loss
- [ ] TierValidationService enforces tier restrictions
- [ ] VendorComputedFieldsService computes yearsInBusiness correctly
- [ ] GET /api/portal/vendors/[id] returns tier-filtered data
- [ ] PUT /api/portal/vendors/[id] validates tier permissions
- [ ] GET /api/vendors/[slug] shows tier-appropriate public data
- [ ] Backend test coverage ≥80%

### Phase 2: Frontend Components
- [ ] VendorDashboard page renders with authentication
- [ ] ProfileEditTabs shows tier-appropriate tabs
- [ ] Free tier: 2 tabs (Basic Info, Locations)
- [ ] Tier1: 7 tabs (adds Brand Story, Certifications, Case Studies, Team)
- [ ] Tier2: 8 tabs (adds Products)
- [ ] Tier3: 9 tabs (adds Promotion)
- [ ] BasicInfoForm edits free tier fields
- [ ] BrandStoryForm displays computed years in business
- [ ] CertificationsAwardsManager handles CRUD operations
- [ ] CaseStudiesManager supports rich text editing
- [ ] TeamMembersManager manages team with ordering
- [ ] PromotionPackForm visible only for tier3
- [ ] VendorProfilePage displays tier-responsive sections
- [ ] VendorCard shows tier badge
- [ ] TierUpgradePrompt displays for locked features
- [ ] YearsInBusinessDisplay shows computed value
- [ ] Frontend test coverage ≥80%

### Phase 3: Integration
- [ ] Dashboard forms successfully save to backend
- [ ] Tier validation enforced on both client and server
- [ ] Public profiles update after dashboard edits
- [ ] E2E dashboard editing test passes
- [ ] E2E public profile display test passes for all tiers
- [ ] E2E computed fields test passes
- [ ] Full-stack integration validated

### Phase 4: Final Validation
- [ ] All 30 tasks marked complete
- [ ] System integration report approved
- [ ] Performance benchmarks met:
  - [ ] Dashboard load <2s
  - [ ] Public profile load <1.5s
  - [ ] Form save <1s
- [ ] Security audit passed:
  - [ ] Tier validation cannot be bypassed
  - [ ] RBAC enforced on all endpoints
  - [ ] Input validation on client and server
- [ ] Accessibility compliance (WCAG 2.1 AA):
  - [ ] Keyboard navigation works
  - [ ] Screen reader labels present
  - [ ] Color contrast ratios pass
- [ ] Stakeholder sign-off obtained

---

## Timeline Summary

**With Parallelization**:
- Phase 1 (Backend): 13.5 hours (saved 3h via parallel API endpoint development)
- Phase 2 (Frontend): 18.5 hours (saved 7h via parallel form development)
- Phase 3 (Integration): 8.75 hours (saved 2.25h via parallel E2E testing)
- Phase 4 (Validation): 3.5 hours

**Total Time with Parallelization**: 44.25 hours

**Sequential Time**: 56.5 hours

**Time Saved**: 12.25 hours (21.7% reduction)

**Additional Time for Pre-Execution**:
- PRE-1 (Codebase Analysis): 0.5 hours
- PRE-2 (Integration Strategy): 0.75 hours

**Grand Total**: 45.5 hours with parallelization

---

## Approval & Next Steps

**Strategy Status**: ✅ APPROVED FOR EXECUTION

**Next Actions**:
1. Begin Phase 1: Backend Foundation with TEST-BACKEND-SCHEMA
2. Set up parallel execution environment for identified tasks
3. Create GitHub project board with all 30 tasks
4. Schedule daily standup for integration updates
5. Set up monitoring dashboards for performance and errors

**Stakeholders**:
- Backend Lead: Approves backend architecture
- Frontend Lead: Approves component design
- Product Owner: Approves feature scope
- QA Lead: Approves testing strategy

**Document Maintenance**:
- Update this document with actual timelines post-execution
- Document any deviations from planned approach
- Capture lessons learned for future features

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
