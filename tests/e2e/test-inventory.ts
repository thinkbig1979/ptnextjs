/**
 * E2E Test Inventory - Tiered Test Configuration
 *
 * This file defines the test categorization for tiered execution:
 * - SMOKE: Critical user journeys (~5 min) - run on every commit
 * - CORE: Main feature tests (~15 min) - run on PR
 * - REGRESSION: Full coverage (~45 min) - run nightly/pre-release
 * - QUARANTINE: Debug/temp tests - skipped by default
 */

export const TEST_TIERS = {
  /**
   * SMOKE TESTS - Critical Path
   * These tests validate the core platform functionality.
   * If these fail, the application is fundamentally broken.
   * Target: < 5 minutes
   */
  smoke: [
    'vendor-onboarding/01-registration.spec.ts',
    'vendor-onboarding/02-admin-approval.spec.ts',
    'vendor-onboarding/03-authentication.spec.ts',
    'dual-auth-system.spec.ts',
  ],

  /**
   * CORE TESTS - Main Features
   * These tests cover the primary platform features.
   * Should pass before merging any PR.
   * Target: < 20 minutes
   */
  core: [
    // Mobile viewport (responsive design is essential)
    'mobile-viewport.spec.ts',

    // Vendor onboarding progression
    'vendor-onboarding/04-free-tier-profile.spec.ts',
    'vendor-onboarding/05-tier-upgrade.spec.ts',
    'vendor-onboarding/06-tier1-advanced-profile.spec.ts',
    'vendor-onboarding/07-tier2-locations.spec.ts',
    'vendor-onboarding/08-tier3-promotions.spec.ts',
    'vendor-onboarding/09-product-management.spec.ts',
    'vendor-onboarding/10-public-profile-display.spec.ts',
    'vendor-onboarding/11-security-access-control.spec.ts',
    'vendor-onboarding/12-e2e-happy-path.spec.ts',

    // Tier upgrade/downgrade system
    'tier-upgrade-request/happy-path.spec.ts',
    'tier-upgrade-request/vendor-workflow.spec.ts',
    'tier-upgrade-request/admin-workflow.spec.ts',
    'tier-downgrade-request-workflow.spec.ts',

    // Location management
    'vendor-location-mapping.spec.ts',
    'multi-location-test.spec.ts',
    'location-discovery.spec.ts',

    // Dashboard components
    'team-members-manager.spec.ts',
    'certifications-awards-manager.spec.ts',
    'vendor-dashboard-enhanced.spec.ts',
    'vendor-dashboard-flow.spec.ts',
    'vendor-dashboard.spec.ts',

    // Excel import/export
    'excel-import-happy-path.spec.ts',
    'excel-export.spec.ts',

    // Vendor profiles
    'vendor-profile-tiers.spec.ts',
  ],

  /**
   * REGRESSION TESTS - Full Coverage
   * These tests cover edge cases, detailed validations, and comprehensive scenarios.
   * Run nightly or before releases.
   * Target: < 60 minutes
   */
  regression: [
    // Edge cases and validation
    'tier-upgrade-request/edge-cases.spec.ts',
    'excel-import-validation-errors.spec.ts',
    'excel-import-tier-restrictions.spec.ts',
    'excel-template-download.spec.ts',
    'tier-restriction-flow.spec.ts',
    'vendor-tier-security.spec.ts',
    'auth/auth-security-enhancements.spec.ts',

    // Product features
    'product-review-submission.spec.ts',
    'product-review-modal-fix.spec.ts',
    'product-tabs-simplified.spec.ts',
    'product-description-rendering.spec.ts',
    'product-integration-tab.spec.ts',

    // Vendor listing/search
    'vendor-featured-sorting.spec.ts',
    'vendor-featured-visual.spec.ts',
    'vendor-card-listing.spec.ts',
    'vendor-search-ux.spec.ts',
    'vendor-search-visual-check.spec.ts',

    // Location search
    'location-search-flow.spec.ts',
    'location-search-focus.spec.ts',
    'location-search-improved-ux.spec.ts',
    'location-search-instant-execution.spec.ts',
    'location-search-nantes.spec.ts',
    'location-search-ux.spec.ts',
    'location-search-verification.spec.ts',

    // Reviews
    'vendor-review-submission.spec.ts',
    'vendor-review-display.spec.ts',
    'verify-product-reviews-display.spec.ts',
    'verify-product-reviews-full-display.spec.ts',
    'verify-free-tier-product-restrictions.spec.ts',

    // Data and mapping
    'verify-data-mapping.spec.ts',
    'verify-featured-priority.spec.ts',
    'verify-vendor-category.spec.ts',
    'verify-form-save.spec.ts',
    'verify-integration-seeded-data.spec.ts',
    'computed-fields.spec.ts',
    'dashboard-integration.spec.ts',
    'partner-filter-validation.spec.ts',
    'promotion-pack-form.spec.ts',

    // Maps
    'vendor-map-detailed-test.spec.ts',
    'vendor-map-tiles-test.spec.ts',
    'vendor-map-verification.spec.ts',

    // Bug fixes and misc
    'bug-fixes-verification.spec.ts',
    'migration.spec.ts',
    'blog-image-cache-fix.spec.ts',

    // Promoted from quarantine (fixed tests)
    'vendor-registration-integration.spec.ts',
    'logout-functionality.spec.ts',
    'admin-panel.spec.ts',

    // Accessibility (a11y) tests
    'accessibility/registration-a11y.spec.ts',
    'accessibility/dashboard-a11y.spec.ts',
    'accessibility/public-pages-a11y.spec.ts',

    // Data integrity tests (PostgreSQL migration)
    'data-integrity/vendor-cascade-delete.spec.ts',
    'data-integrity/concurrent-updates.spec.ts',
    'data-integrity/foreign-key-constraints.spec.ts',

    // API error handling tests
    'api-errors/rate-limit-behavior.spec.ts',
    'api-errors/auth-boundary.spec.ts',
    'api-errors/validation-errors.spec.ts',

    // Email notification tests
    'notifications/registration-email.spec.ts',
    'notifications/tier-change-email.spec.ts',
    'notifications/admin-notification.spec.ts',
  ],

  /**
   * QUARANTINE - Debug/Temporary Tests
   * These tests should be skipped in CI/CD.
   * Review periodically and either fix or remove.
   */
  quarantine: [],
} as const;

/**
 * Feature-based groupings for targeted testing
 */
export const FEATURE_GROUPS = {
  auth: [
    'vendor-onboarding/01-registration.spec.ts',
    'vendor-onboarding/03-authentication.spec.ts',
    'dual-auth-system.spec.ts',
    'logout-functionality.spec.ts',
    'auth/auth-security-enhancements.spec.ts',
  ],
  'vendor-onboarding': [
    'vendor-onboarding/01-registration.spec.ts',
    'vendor-onboarding/02-admin-approval.spec.ts',
    'vendor-onboarding/03-authentication.spec.ts',
    'vendor-onboarding/04-free-tier-profile.spec.ts',
    'vendor-onboarding/05-tier-upgrade.spec.ts',
    'vendor-onboarding/06-tier1-advanced-profile.spec.ts',
    'vendor-onboarding/07-tier2-locations.spec.ts',
    'vendor-onboarding/08-tier3-promotions.spec.ts',
    'vendor-onboarding/09-product-management.spec.ts',
    'vendor-onboarding/10-public-profile-display.spec.ts',
    'vendor-onboarding/11-security-access-control.spec.ts',
    'vendor-onboarding/12-e2e-happy-path.spec.ts',
  ],
  tiers: [
    'vendor-onboarding/05-tier-upgrade.spec.ts',
    'tier-upgrade-request/happy-path.spec.ts',
    'tier-upgrade-request/vendor-workflow.spec.ts',
    'tier-upgrade-request/admin-workflow.spec.ts',
    'tier-upgrade-request/edge-cases.spec.ts',
    'tier-downgrade-request-workflow.spec.ts',
    'tier-restriction-flow.spec.ts',
    'vendor-tier-security.spec.ts',
  ],
  locations: [
    'vendor-onboarding/07-tier2-locations.spec.ts',
    'vendor-location-mapping.spec.ts',
    'multi-location-test.spec.ts',
    'location-search-flow.spec.ts',
    'location-search-focus.spec.ts',
    'location-search-improved-ux.spec.ts',
    'location-search-instant-execution.spec.ts',
    'location-search-nantes.spec.ts',
    'location-search-ux.spec.ts',
    'location-search-verification.spec.ts',
    'location-discovery.spec.ts',
    'vendor-map-detailed-test.spec.ts',
    'vendor-map-tiles-test.spec.ts',
    'vendor-map-verification.spec.ts',
  ],
  products: [
    'vendor-onboarding/09-product-management.spec.ts',
    'product-review-submission.spec.ts',
    'product-review-modal-fix.spec.ts',
    'product-tabs-simplified.spec.ts',
    'product-description-rendering.spec.ts',
    'product-integration-tab.spec.ts',
    'verify-product-reviews-display.spec.ts',
    'verify-product-reviews-full-display.spec.ts',
    'verify-free-tier-product-restrictions.spec.ts',
  ],
  excel: [
    'excel-import-happy-path.spec.ts',
    'excel-import-validation-errors.spec.ts',
    'excel-import-tier-restrictions.spec.ts',
    'excel-export.spec.ts',
    'excel-template-download.spec.ts',
  ],
  dashboard: [
    'vendor-dashboard.spec.ts',
    'vendor-dashboard-flow.spec.ts',
    'vendor-dashboard-enhanced.spec.ts',
    'dashboard-integration.spec.ts',
    'team-members-manager.spec.ts',
    'certifications-awards-manager.spec.ts',
    'promotion-pack-form.spec.ts',
  ],
  search: [
    'vendor-search-ux.spec.ts',
    'vendor-search-visual-check.spec.ts',
    'location-search-flow.spec.ts',
    'location-search-focus.spec.ts',
    'location-search-improved-ux.spec.ts',
    'location-search-instant-execution.spec.ts',
    'location-search-nantes.spec.ts',
    'location-search-ux.spec.ts',
    'location-search-verification.spec.ts',
    'partner-filter-validation.spec.ts',
  ],
  accessibility: [
    'accessibility/registration-a11y.spec.ts',
    'accessibility/dashboard-a11y.spec.ts',
    'accessibility/public-pages-a11y.spec.ts',
  ],
  'data-integrity': [
    'data-integrity/vendor-cascade-delete.spec.ts',
    'data-integrity/concurrent-updates.spec.ts',
    'data-integrity/foreign-key-constraints.spec.ts',
  ],
  'api-errors': [
    'api-errors/rate-limit-behavior.spec.ts',
    'api-errors/auth-boundary.spec.ts',
    'api-errors/validation-errors.spec.ts',
  ],
  notifications: [
    'notifications/registration-email.spec.ts',
    'notifications/tier-change-email.spec.ts',
    'notifications/admin-notification.spec.ts',
  ],
  responsive: [
    'mobile-viewport.spec.ts',
  ],
} as const;

/**
 * Get glob patterns for a test tier
 */
export function getTierGlob(tier: keyof typeof TEST_TIERS): string[] {
  return TEST_TIERS[tier].map((file) => `tests/e2e/${file}`);
}

/**
 * Get glob patterns for a feature group
 */
export function getFeatureGlob(feature: keyof typeof FEATURE_GROUPS): string[] {
  return FEATURE_GROUPS[feature].map((file) => `tests/e2e/${file}`);
}

/**
 * Get all non-quarantined tests
 */
export function getActiveTests(): string[] {
  return [
    ...TEST_TIERS.smoke,
    ...TEST_TIERS.core,
    ...TEST_TIERS.regression,
  ].map((file) => `tests/e2e/${file}`);
}

/**
 * Test tier metadata
 */
export const TIER_METADATA = {
  smoke: {
    name: 'Smoke Tests',
    description: 'Critical user journeys - must always pass',
    targetDuration: '< 5 minutes',
    runOn: 'Every commit',
  },
  core: {
    name: 'Core Tests',
    description: 'Main feature tests - run on PR',
    targetDuration: '< 20 minutes',
    runOn: 'Pull requests',
  },
  regression: {
    name: 'Regression Tests',
    description: 'Full coverage including edge cases',
    targetDuration: '< 60 minutes',
    runOn: 'Nightly / Pre-release',
  },
  quarantine: {
    name: 'Quarantine Tests',
    description: 'Debug/temp tests - skipped by default',
    targetDuration: 'N/A',
    runOn: 'Manual only',
  },
} as const;
