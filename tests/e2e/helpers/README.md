# E2E Test Helpers - Quick Reference

Complete helper library for vendor onboarding E2E tests.

## Files

- **vendor-onboarding-helpers.ts** - Core helper functions (520 lines)
- **database-seed-helpers.ts** - Database seeding utilities (350 lines)
- **test-data-factories.ts** - Data generation with builder pattern (800 lines)
- **test-vendors.ts** - Pre-seeded test vendor configurations

## Quick Start

```typescript
import { test, expect } from '@playwright/test';
import {
  createAndApproveVendor,
  loginVendor,
  fillBrandStory,
  addLocation,
  expectToast,
} from './helpers/vendor-onboarding-helpers';
import { VendorFactory, LocationFactory } from './helpers/test-data-factories';

test('tier 1 vendor setup', async ({ page }) => {
  // Create vendor
  const vendor = VendorFactory.create().withTier('tier1').build();
  const approvedVendor = await createAndApproveVendor(page, vendor);

  // Login
  await loginVendor(page, approvedVendor.email, approvedVendor.password);

  // Fill profile
  await fillBrandStory(page, {
    website: 'https://example.com',
    foundedYear: '2010',
  });

  // Add location
  await addLocation(page, LocationFactory.monaco().build());

  // Assert
  await expectToast(page, 'saved');
});
```

## Common Patterns

### Create Test Vendor

```typescript
// Simple
const vendor = VendorFactory.create().build();

// With tier
const vendor = VendorFactory.create()
  .withTier('tier2')
  .withFeatured(true)
  .build();

// Complete setup
const vendor = await createAndApproveVendor(page, {
  tier: 'tier1',
  companyName: 'Test Company',
});
```

### Add Profile Content

```typescript
// Brand story
await fillBrandStory(page, {
  website: 'https://example.com',
  foundedYear: '2015',
  totalProjects: '100',
});

// Certification
await addCertification(page, {
  name: 'ISO 9001',
  issuer: 'ISO',
});

// Location (with geocoding)
await addLocation(page, {
  name: 'Monaco Office',
  city: 'Monaco',
  country: 'Monaco',
  // Geocoding happens automatically
});

// Team member
await addTeamMember(page, {
  name: 'John Doe',
  title: 'CEO',
  bio: 'Company founder',
});

// Case study
await addCaseStudy(page, {
  title: 'Major Project',
  description: 'Description here',
  client: 'Confidential',
});

// Product
await addProduct(page, {
  name: 'Navigation System',
  description: 'Advanced navigation',
  category: 'Navigation Systems',
});
```

### Pre-Configured Data

```typescript
// Locations
LocationFactory.monaco().build()
LocationFactory.barcelona().build()
LocationFactory.fortLauderdale().build()

// Certifications
CertificationFactory.iso9001().build()
CertificationFactory.solas().build()

// Team members
TeamMemberFactory.ceo().build()
TeamMemberFactory.cto().build()

// Case studies
CaseStudyFactory.luxuryRefit().build()
CaseStudyFactory.navigationUpgrade().build()

// Products
ProductFactory.navigationSystem().build()
ProductFactory.entertainmentSystem().build()
```

### Complete Scenarios

```typescript
// Tier 1 vendor with all data
const scenario = TestScenarioFactory.tier1VendorComplete();
// Returns: { vendor, locations, certifications, teamMembers, caseStudies }

// Tier 2 vendor with products
const scenario = TestScenarioFactory.tier2VendorComplete();
// Returns: { vendor, locations, certifications, teamMembers, caseStudies, products }
```

### Database Seeding

```typescript
// Seed vendor
const vendorId = await seedVendor(page, vendorData);

// Seed from fixture
const vendorIds = await seedVendorsFromFixture(page, 'tests/fixtures/sample-vendors.json');

// Seed complete profile
const vendorId = await seedCompleteVendorProfile(page, vendorData, {
  products: [product1, product2],
  locations: [location1, location2],
});
```

## Helper Function Categories

### Registration & Setup
- `generateUniqueVendorData(overrides?)` - Generate unique vendor data
- `registerVendor(page, data?)` - Complete registration flow
- `createAndApproveVendor(page, overrides?)` - Register + approve
- `createVendorWithTier(page, tier, overrides?)` - Create with specific tier

### Authentication
- `loginVendor(page, email, password)` - Login vendor
- `loginVendorWithData(page, vendor)` - Login with VendorTestData
- `logoutVendor(page)` - Logout current vendor
- `getAuthCookies(context)` - Get auth cookies

### Admin Actions
- `approveVendor(page, vendorId)` - Approve pending vendor
- `upgradeTier(page, vendorId, tier)` - Upgrade vendor tier

### Profile Editing
- `navigateToProfileEditor(page)` - Go to profile edit page
- `updateBasicInfo(page, data)` - Update basic info fields
- `fillBrandStory(page, data)` - Fill brand story (Tier 1+)

### Entity Management
- `addCertification(page, data)` - Add certification
- `addLocation(page, data)` - Add location with geocoding
- `addTeamMember(page, data)` - Add team member
- `addCaseStudy(page, data)` - Add case study
- `addProduct(page, data)` - Add product

### Assertions & Waits
- `expectToast(page, message)` - Wait for toast notification
- `waitForAPIResponse(page, urlPattern)` - Wait for API call
- `waitForCacheRevalidation(page, ms?)` - Wait for ISR cache

### Navigation
- `navigateToPublicProfile(page, slug)` - Go to public vendor page

### Cleanup
- `cleanupVendor(page, vendorId)` - Delete test vendor
- `cleanupTestData(page, { vendorIds, productIds })` - Bulk cleanup

## Factory Pattern Examples

### Vendor Factory

```typescript
VendorFactory.create()
  .withTier('tier2')
  .withEmail('custom@example.com')
  .withCompanyName('Custom Company')
  .withFeatured(true)
  .withWebsite('https://example.com')
  .build()
```

### Location Factory

```typescript
LocationFactory.create()
  .withName('Custom Office')
  .withCity('Monaco')
  .withCountry('Monaco')
  .withCoordinates(43.7384, 7.4246)
  .asHeadquarters()
  .build()
```

### Custom Certification

```typescript
CertificationFactory.create()
  .withName('Custom Cert')
  .withIssuer('Issuing Body')
  .withDateIssued('2020-01-01')
  .withExpirationDate('2025-01-01')
  .build()
```

## Tips & Best Practices

1. **Use Factories** - Always use factories for data generation
2. **Pre-configured Data** - Use pre-configured factories when possible
3. **Wait for Toasts** - Always wait for success toasts after mutations
4. **Cache Revalidation** - Use `waitForCacheRevalidation()` after updates
5. **Cleanup** - Clean up test data in `afterEach` hooks
6. **Unique Data** - Factories generate unique data automatically
7. **Error Handling** - All helpers throw errors with detailed messages
8. **Console Logs** - Helpers log actions to console for debugging

## Debugging

```typescript
// Enable headed mode
npx playwright test --headed

// Use UI mode
npm run test:e2e:ui

// Pause execution
await page.pause();

// Capture state
await page.screenshot({ path: 'debug.png' });
console.log(await page.content());
```

## Examples

See test plan: `COMPREHENSIVE-VENDOR-ONBOARDING-TEST-PLAN.md`

## Support

- Test Plan: `/.agent-os/specs/2025-10-24-tier-structure-implementation/COMPREHENSIVE-VENDOR-ONBOARDING-TEST-PLAN.md`
- Review: `/.agent-os/specs/2025-10-24-tier-structure-implementation/TEST-TEAM-LEAD-REVIEW.md`
- Summary: `/.agent-os/specs/2025-10-24-tier-structure-implementation/TEST-INFRASTRUCTURE-SUMMARY.md`
