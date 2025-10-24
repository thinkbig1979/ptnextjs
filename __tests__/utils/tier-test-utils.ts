/**
 * Tier-Specific Test Utilities
 *
 * Helper functions for testing tier-based access control,
 * field visibility, and feature gating.
 */

import type { TierLevel } from '@/lib/types';

/**
 * Tier test case structure for parameterized tests
 */
export interface TierTestCase {
  tier: TierLevel;
  expectedTabs: number;
  expectedTabNames: string[];
  expectedFields: string[];
  lockedFields: string[];
  locationLimit: number;
  features: {
    certifications: boolean;
    caseStudies: boolean;
    team: boolean;
    products: boolean;
    promotionPack: boolean;
    featured: boolean;
  };
}

/**
 * Generate comprehensive tier test cases for parameterized testing
 *
 * @returns Array of tier test cases with expected behavior
 *
 * @example
 * ```typescript
 * describe('Tier-Based Access', () => {
 *   it.each(generateTierTestCases())(
 *     '$tier tier shows $expectedTabs tabs',
 *     ({ tier, expectedTabs }) => {
 *       // Test implementation
 *     }
 *   );
 * });
 * ```
 */
export function generateTierTestCases(): TierTestCase[] {
  return [
    {
      tier: 'free',
      expectedTabs: 2,
      expectedTabNames: ['Basic Info', 'Locations'],
      expectedFields: [
        'companyName',
        'slug',
        'description',
        'logo',
        'email',
        'phone',
      ],
      lockedFields: [
        'foundedYear',
        'certifications',
        'awards',
        'caseStudies',
        'teamMembers',
        'products',
        'promotionPack',
      ],
      locationLimit: 1,
      features: {
        certifications: false,
        caseStudies: false,
        team: false,
        products: false,
        promotionPack: false,
        featured: false,
      },
    },
    {
      tier: 'tier1',
      expectedTabs: 7,
      expectedTabNames: [
        'Basic Info',
        'Locations',
        'Brand Story',
        'Certifications',
        'Case Studies',
        'Team',
        'Products',
      ],
      expectedFields: [
        'companyName',
        'slug',
        'description',
        'logo',
        'email',
        'phone',
        'foundedYear',
        'website',
        'linkedinUrl',
        'twitterUrl',
        'totalProjects',
        'employeeCount',
        'linkedinFollowers',
        'instagramFollowers',
        'clientSatisfactionScore',
        'certifications',
        'awards',
        'caseStudies',
        'teamMembers',
        'videoIntroduction',
        'serviceAreas',
        'companyValues',
      ],
      lockedFields: ['promotionPack'],
      locationLimit: 5,
      features: {
        certifications: true,
        caseStudies: true,
        team: true,
        products: true,
        promotionPack: false,
        featured: false,
      },
    },
    {
      tier: 'tier2',
      expectedTabs: 8,
      expectedTabNames: [
        'Basic Info',
        'Locations',
        'Brand Story',
        'Certifications',
        'Case Studies',
        'Team',
        'Products',
        'Promotion',
      ],
      expectedFields: [
        'companyName',
        'slug',
        'description',
        'logo',
        'email',
        'phone',
        'foundedYear',
        'website',
        'certifications',
        'awards',
        'caseStudies',
        'teamMembers',
        'products',
        'featuredInCategory',
        'advancedAnalytics',
        'apiAccess',
      ],
      lockedFields: ['customDomain'],
      locationLimit: 10,
      features: {
        certifications: true,
        caseStudies: true,
        team: true,
        products: true,
        promotionPack: false,
        featured: true,
      },
    },
    {
      tier: 'tier3',
      expectedTabs: 9,
      expectedTabNames: [
        'Basic Info',
        'Locations',
        'Brand Story',
        'Certifications',
        'Case Studies',
        'Team',
        'Products',
        'Promotion',
        'Advanced',
      ],
      expectedFields: [
        'companyName',
        'slug',
        'description',
        'logo',
        'email',
        'phone',
        'foundedYear',
        'website',
        'certifications',
        'awards',
        'caseStudies',
        'teamMembers',
        'products',
        'featuredInCategory',
        'advancedAnalytics',
        'apiAccess',
        'customDomain',
        'promotionPack',
      ],
      lockedFields: [],
      locationLimit: -1, // Unlimited
      features: {
        certifications: true,
        caseStudies: true,
        team: true,
        products: true,
        promotionPack: true,
        featured: true,
      },
    },
  ];
}

/**
 * Validate field access for a specific tier
 *
 * @param tier - Tier level to check
 * @param field - Field name to validate
 * @param shouldAccess - Expected access result
 *
 * @example
 * ```typescript
 * assertFieldAccess('tier1', 'foundedYear', true);
 * assertFieldAccess('free', 'foundedYear', false);
 * ```
 */
export function assertFieldAccess(
  tier: TierLevel,
  field: string,
  shouldAccess: boolean
): void {
  const testCase = generateTierTestCases().find(tc => tc.tier === tier);
  if (!testCase) {
    throw new Error(`Unknown tier: ${tier}`);
  }

  const hasAccess = testCase.expectedFields.includes(field);
  expect(hasAccess).toBe(shouldAccess);
}

/**
 * Get tier display label
 *
 * @param tier - Tier level
 * @returns Human-readable tier label
 *
 * @example
 * ```typescript
 * getTierLabel('tier1'); // Returns "Tier 1"
 * getTierLabel('free'); // Returns "Free"
 * ```
 */
export function getTierLabel(tier: TierLevel): string {
  const labels: Record<TierLevel, string> = {
    free: 'Free',
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
  };
  return labels[tier];
}

/**
 * Get tier badge color for visual testing
 *
 * @param tier - Tier level
 * @returns Color identifier for tier
 *
 * @example
 * ```typescript
 * getTierColor('tier3'); // Returns "gold"
 * ```
 */
export function getTierColor(tier: TierLevel): string {
  const colors: Record<TierLevel, string> = {
    free: 'gray',
    tier1: 'blue',
    tier2: 'purple',
    tier3: 'gold',
  };
  return colors[tier];
}

/**
 * Get tier icon name for component testing
 *
 * @param tier - Tier level
 * @returns Icon name/component identifier
 *
 * @example
 * ```typescript
 * getTierIcon('tier3'); // Returns "Crown"
 * ```
 */
export function getTierIcon(tier: TierLevel): string {
  const icons: Record<TierLevel, string> = {
    free: 'Circle',
    tier1: 'Star',
    tier2: 'Sparkles',
    tier3: 'Crown',
  };
  return icons[tier];
}

/**
 * Get location limit for tier
 *
 * @param tier - Tier level
 * @returns Maximum number of locations (-1 for unlimited)
 *
 * @example
 * ```typescript
 * getLocationLimit('tier1'); // Returns 5
 * getLocationLimit('tier3'); // Returns -1 (unlimited)
 * ```
 */
export function getLocationLimit(tier: TierLevel): number {
  const limits: Record<TierLevel, number> = {
    free: 1,
    tier1: 5,
    tier2: 10,
    tier3: -1, // Unlimited
  };
  return limits[tier];
}

/**
 * Check if tier can access a specific feature
 *
 * @param tier - Tier level
 * @param feature - Feature name
 * @returns True if tier has access to feature
 *
 * @example
 * ```typescript
 * canAccessFeature('tier1', 'certifications'); // Returns true
 * canAccessFeature('free', 'certifications'); // Returns false
 * ```
 */
export function canAccessFeature(
  tier: TierLevel,
  feature: keyof TierTestCase['features']
): boolean {
  const testCase = generateTierTestCases().find(tc => tc.tier === tier);
  return testCase?.features[feature] ?? false;
}

/**
 * Get tier upgrade path (next tier level)
 *
 * @param currentTier - Current tier level
 * @returns Next tier in upgrade path, or null if already at max
 *
 * @example
 * ```typescript
 * getTierUpgradePath('free'); // Returns "tier1"
 * getTierUpgradePath('tier3'); // Returns null
 * ```
 */
export function getTierUpgradePath(currentTier: TierLevel): TierLevel | null {
  const upgradePath: Record<TierLevel, TierLevel | null> = {
    free: 'tier1',
    tier1: 'tier2',
    tier2: 'tier3',
    tier3: null,
  };
  return upgradePath[currentTier];
}

/**
 * Generate tier comparison data for upgrade prompts
 *
 * @param currentTier - Current tier level
 * @param targetTier - Target tier level
 * @returns Comparison object with added features
 *
 * @example
 * ```typescript
 * const comparison = getTierComparison('free', 'tier1');
 * console.log(comparison.addedFields); // ['foundedYear', 'certifications', ...]
 * console.log(comparison.addedFeatures); // ['certifications', 'caseStudies', ...]
 * ```
 */
export function getTierComparison(
  currentTier: TierLevel,
  targetTier: TierLevel
): {
  currentTier: TierLevel;
  targetTier: TierLevel;
  addedFields: string[];
  addedFeatures: string[];
  addedTabs: string[];
} {
  const currentTestCase = generateTierTestCases().find(tc => tc.tier === currentTier);
  const targetTestCase = generateTierTestCases().find(tc => tc.tier === targetTier);

  if (!currentTestCase || !targetTestCase) {
    throw new Error(`Invalid tier comparison: ${currentTier} -> ${targetTier}`);
  }

  return {
    currentTier,
    targetTier,
    addedFields: targetTestCase.expectedFields.filter(
      field => !currentTestCase.expectedFields.includes(field)
    ),
    addedFeatures: Object.keys(targetTestCase.features).filter(
      feature =>
        targetTestCase.features[feature as keyof TierTestCase['features']] &&
        !currentTestCase.features[feature as keyof TierTestCase['features']]
    ),
    addedTabs: targetTestCase.expectedTabNames.filter(
      tab => !currentTestCase.expectedTabNames.includes(tab)
    ),
  };
}

/**
 * Validate years in business computation
 *
 * @param foundedYear - Year company was founded
 * @param expectedYears - Expected computed years (null if invalid)
 *
 * @example
 * ```typescript
 * validateYearsInBusinessComputation(2010, 15); // Assumes current year is 2025
 * validateYearsInBusinessComputation(1799, null); // Invalid (below minimum)
 * validateYearsInBusinessComputation(2030, null); // Invalid (future year)
 * ```
 */
export function validateYearsInBusinessComputation(
  foundedYear: number | null,
  expectedYears: number | null
): void {
  if (foundedYear === null) {
    expect(expectedYears).toBeNull();
    return;
  }

  const currentYear = new Date().getFullYear();

  // Invalid if before 1800 or in the future
  if (foundedYear < 1800 || foundedYear > currentYear) {
    expect(expectedYears).toBeNull();
    return;
  }

  // Valid computation
  const computedYears = currentYear - foundedYear;
  expect(expectedYears).toBe(computedYears);
}

/**
 * Generate test data for years in business edge cases
 *
 * @returns Array of test cases for years in business computation
 *
 * @example
 * ```typescript
 * it.each(generateYearsInBusinessTestCases())(
 *   '$description',
 *   ({ foundedYear, expectedYears, shouldBeValid }) => {
 *     // Test implementation
 *   }
 * );
 * ```
 */
export function generateYearsInBusinessTestCases() {
  const currentYear = new Date().getFullYear();

  return [
    {
      description: 'Valid: Founded 10 years ago',
      foundedYear: currentYear - 10,
      expectedYears: 10,
      shouldBeValid: true,
    },
    {
      description: 'Valid: Founded 50 years ago',
      foundedYear: currentYear - 50,
      expectedYears: 50,
      shouldBeValid: true,
    },
    {
      description: 'Valid: Founded this year',
      foundedYear: currentYear,
      expectedYears: 0,
      shouldBeValid: true,
    },
    {
      description: 'Valid: Founded at minimum year (1800)',
      foundedYear: 1800,
      expectedYears: currentYear - 1800,
      shouldBeValid: true,
    },
    {
      description: 'Invalid: Below minimum year (1799)',
      foundedYear: 1799,
      expectedYears: null,
      shouldBeValid: false,
    },
    {
      description: 'Invalid: Future year',
      foundedYear: currentYear + 1,
      expectedYears: null,
      shouldBeValid: false,
    },
    {
      description: 'Invalid: Null founded year',
      foundedYear: null,
      expectedYears: null,
      shouldBeValid: false,
    },
  ];
}

/**
 * Mock tier validation service for testing
 *
 * @returns Mock implementation of TierValidationService
 *
 * @example
 * ```typescript
 * jest.mock('@/lib/services/TierValidationService', () => ({
 *   TierValidationService: mockTierValidationService()
 * }));
 * ```
 */
export function mockTierValidationService() {
  return {
    validateFieldAccess: jest.fn((tier: TierLevel, field: string) => {
      const testCase = generateTierTestCases().find(tc => tc.tier === tier);
      return testCase?.expectedFields.includes(field) ?? false;
    }),
    canAccessFeature: jest.fn((tier: TierLevel, feature: string) => {
      return canAccessFeature(tier, feature as keyof TierTestCase['features']);
    }),
    getLocationLimit: jest.fn((tier: TierLevel) => {
      return getLocationLimit(tier);
    }),
    validateTierTransition: jest.fn((fromTier: TierLevel, toTier: TierLevel) => {
      const tierOrder: TierLevel[] = ['free', 'tier1', 'tier2', 'tier3'];
      const fromIndex = tierOrder.indexOf(fromTier);
      const toIndex = tierOrder.indexOf(toTier);
      return toIndex > fromIndex; // Can only upgrade, not downgrade
    }),
  };
}

/**
 * Assert that an upgrade prompt is displayed correctly
 *
 * @param currentTier - Current user tier
 * @param requiredTier - Required tier for feature
 * @param featureName - Name of locked feature
 *
 * @example
 * ```typescript
 * assertUpgradePromptDisplayed('free', 'tier1', 'Brand Story');
 * ```
 */
export function assertUpgradePromptDisplayed(
  currentTier: TierLevel,
  requiredTier: TierLevel,
  featureName: string
): void {
  // Check for upgrade prompt container
  const upgradePrompt = screen.getByTestId('tier-upgrade-prompt');
  expect(upgradePrompt).toBeInTheDocument();

  // Check current tier badge
  expect(screen.getByText(getTierLabel(currentTier))).toBeInTheDocument();

  // Check required tier badge
  expect(screen.getByText(getTierLabel(requiredTier))).toBeInTheDocument();

  // Check feature name
  expect(screen.getByText(new RegExp(featureName, 'i'))).toBeInTheDocument();

  // Check CTA button
  expect(screen.getByRole('button', { name: /contact sales|upgrade/i })).toBeInTheDocument();
}

/**
 * Get all tiers for iteration in tests
 *
 * @returns Array of all tier levels
 *
 * @example
 * ```typescript
 * getAllTiers().forEach(tier => {
 *   it(`handles ${tier} tier correctly`, () => {
 *     // Test implementation
 *   });
 * });
 * ```
 */
export function getAllTiers(): TierLevel[] {
  return ['free', 'tier1', 'tier2', 'tier3'];
}

/**
 * Check if field should be visible for tier
 *
 * @param tier - Tier level
 * @param field - Field name
 * @returns True if field should be visible
 */
export function isFieldVisibleForTier(tier: TierLevel, field: string): boolean {
  const testCase = generateTierTestCases().find(tc => tc.tier === tier);
  return testCase?.expectedFields.includes(field) ?? false;
}

/**
 * Check if tab should be visible for tier
 *
 * @param tier - Tier level
 * @param tabName - Tab name
 * @returns True if tab should be visible
 */
export function isTabVisibleForTier(tier: TierLevel, tabName: string): boolean {
  const testCase = generateTierTestCases().find(tc => tc.tier === tier);
  return testCase?.expectedTabNames.includes(tabName) ?? false;
}
