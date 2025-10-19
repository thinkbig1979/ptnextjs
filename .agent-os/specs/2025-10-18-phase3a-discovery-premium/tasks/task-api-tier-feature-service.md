# Task: api-tier-feature-service - Implement Tier Feature Access Service

## Task Metadata
- **Task ID**: api-tier-feature-service
- **Phase**: Phase 3A: Backend API Development
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-40 minutes
- **Dependencies**: None
- **Status**: [ ] Not Started

## Task Description
Create TierFeatureService for managing tier-based feature access control. Define tier feature configuration mapping and implement methods to check feature access and retrieve tier limits.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/lib/services/tier-feature-service.ts` - Service class
  - `/home/edwin/development/ptnextjs/lib/config/tier-features.ts` - Feature configuration
- **Feature Configuration**:
  ```typescript
  // lib/config/tier-features.ts
  export const TIER_FEATURES = {
    free: [
      'basic_profile',
      'product_listings',
      'contact_form'
    ],
    tier1: [
      'basic_profile',
      'product_listings',
      'contact_form',
      'certifications',
      'basic_analytics',
      'team_members'
    ],
    tier2: [
      'basic_profile',
      'product_listings',
      'contact_form',
      'certifications',
      'basic_analytics',
      'team_members',
      'case_studies',
      'media_galleries',
      'service_maps',
      'product_catalogs',
      'performance_metrics',
      'advanced_analytics',
      'featured_placement',
      'priority_support'
    ]
  } as const
  
  export const TIER_LIMITS = {
    free: {
      maxProducts: 5,
      maxGalleryImages: 0,
      maxCaseStudies: 0,
      maxTeamMembers: 1,
      maxCertifications: 0
    },
    tier1: {
      maxProducts: 20,
      maxGalleryImages: 10,
      maxCaseStudies: 0,
      maxTeamMembers: 5,
      maxCertifications: 3
    },
    tier2: {
      maxProducts: -1,  // unlimited
      maxGalleryImages: 50,
      maxCaseStudies: 10,
      maxTeamMembers: 20,
      maxCertifications: 10
    }
  } as const
  ```
- **Service Methods**:
  ```typescript
  // lib/services/tier-feature-service.ts
  export class TierFeatureService {
    // Check if vendor has access to specific feature
    async checkFeatureAccess(vendorId: string, feature: string): Promise<boolean>
    
    // Get all available features for a tier
    getAvailableFeatures(tier: VendorTier): string[]
    
    // Get tier limits (max products, max images, etc.)
    getTierLimits(tier: VendorTier): TierLimits
    
    // Check if vendor has reached tier limit for a resource
    async checkTierLimit(
      vendorId: string, 
      resourceType: 'products' | 'galleryImages' | 'caseStudies' | 'teamMembers' | 'certifications',
      currentCount: number
    ): Promise<{ withinLimit: boolean, limit: number, current: number }>
  }
  ```

## Acceptance Criteria
- [ ] tier-features.ts config file created with complete feature mapping
- [ ] All three tiers (free, tier1, tier2) defined with features
- [ ] TIER_LIMITS defined for all resource types
- [ ] TierFeatureService class created with all methods
- [ ] checkFeatureAccess returns boolean based on vendor's tier
- [ ] getAvailableFeatures returns correct array for each tier
- [ ] getTierLimits returns limit config for tier
- [ ] checkTierLimit compares current count against tier limit
- [ ] Unlimited limits represented as -1
- [ ] TypeScript types exported for features and limits

## Testing Requirements
- **Unit Tests**:
  - Test getAvailableFeatures('free') returns only free tier features
  - Test getAvailableFeatures('tier2') includes all features
  - Test checkFeatureAccess with free vendor returns false for 'case_studies'
  - Test checkFeatureAccess with tier2 vendor returns true for 'case_studies'
  - Test getTierLimits('tier1') returns correct maxProducts (20)
  - Test checkTierLimit with unlimited (-1) always returns withinLimit=true
  - Test checkTierLimit with limit=5, current=4 returns withinLimit=true
  - Test checkTierLimit with limit=5, current=5 returns withinLimit=false
- **Integration Tests**:
  - Create test vendor with free tier
  - Call checkFeatureAccess('case_studies') → expect false
  - Upgrade vendor to tier2 in database
  - Call checkFeatureAccess('case_studies') → expect true
  - Test checkTierLimit with actual vendor premium content counts

## Evidence Required
- Feature configuration file with all tiers defined
- Service file with complete implementation
- Unit test results (>90% coverage)
- Example usage showing feature gating in action

## Context Requirements
- Vendor tier field in database (from Phase 2)
- Payload CMS API for querying vendor tier
- tasks-sqlite.md section 2.3 for implementation guidance
- Technical spec for tier feature requirements

## Implementation Notes
- **Configuration-Driven Design**:
  - All features defined in tier-features.ts config (not hardcoded)
  - Easy to add new features without changing service code
  - TypeScript const assertion ensures type safety
- **Feature Access Logic**:
  ```typescript
  async checkFeatureAccess(vendorId: string, feature: string): Promise<boolean> {
    const vendor = await db.vendors.findUnique({ where: { id: vendorId }})
    if (!vendor) throw new Error('Vendor not found')
    
    const tierFeatures = TIER_FEATURES[vendor.tier]
    return tierFeatures.includes(feature)
  }
  ```
- **Tier Limit Checking**:
  ```typescript
  async checkTierLimit(vendorId: string, resourceType: string, currentCount: number) {
    const vendor = await db.vendors.findUnique({ where: { id: vendorId }})
    const limits = TIER_LIMITS[vendor.tier]
    const limit = limits[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`]
    
    // -1 means unlimited
    if (limit === -1) return { withinLimit: true, limit: -1, current: currentCount }
    
    return {
      withinLimit: currentCount < limit,
      limit,
      current: currentCount
    }
  }
  ```
- **TypeScript Types**:
  ```typescript
  export type TierFeature = typeof TIER_FEATURES[keyof typeof TIER_FEATURES][number]
  
  export interface TierLimits {
    maxProducts: number
    maxGalleryImages: number
    maxCaseStudies: number
    maxTeamMembers: number
    maxCertifications: number
  }
  ```
- **Future Enhancements**:
  - Add feature flags for A/B testing
  - Support custom tier overrides for specific vendors
  - Add feature usage analytics

## Quality Gates
- [ ] Configuration is type-safe (TypeScript const assertion)
- [ ] All features documented with descriptions
- [ ] Tier hierarchy is correct (tier2 includes all tier1 features)
- [ ] Service methods handle vendor not found gracefully
- [ ] Unlimited limits (-1) work correctly in all cases

## Related Files
- Main Tasks: `tasks-sqlite.md` section 2.3
- Technical Spec: `sub-specs/technical-spec.md` (TierFeatureService)
- Vendors Schema: Payload vendors collection

## Next Steps After Completion
- Use in TierGate component for frontend gating (task-ui-enhanced-tier-gate)
- Use in API endpoints to enforce tier access (task-api-premium-content-endpoints)
- Display available features in tier comparison table (task-ui-tier-comparison-table)
