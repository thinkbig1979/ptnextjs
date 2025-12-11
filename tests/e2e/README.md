# E2E Test Suite - Tiered Execution Guide

This document explains how to effectively run E2E tests using the tiered test architecture.

## Quick Reference

```bash
# Quick validation (5 min)
npm run test:e2e:smoke

# PR validation (20 min)
npm run test:e2e:core

# Full regression (60 min)
npm run test:e2e:full

# Feature-specific
npm run test:e2e:auth
npm run test:e2e:tiers
npm run test:e2e:locations
```

## Test Tiers

### Smoke Tests (7 files, ~5 min)
**Run on:** Every commit / Quick validation

Critical user journeys that validate basic platform operation:
- Vendor registration
- Admin approval
- Authentication (login/logout)
- Basic dashboard access

```bash
npm run test:e2e:smoke
```

### Core Tests (29 files, ~20 min)
**Run on:** Pull requests

Main feature tests covering:
- Smoke tests +
- Tier upgrade/downgrade system
- Location management
- Team members & certifications
- Excel import/export
- Dashboard functionality

```bash
npm run test:e2e:core
```

### Regression Tests (44 files, ~45 min)
**Run on:** Nightly / Pre-release

Edge cases and comprehensive coverage:
- Validation error handling
- Security edge cases
- Search functionality
- Map features
- Product reviews

```bash
npm run test:e2e:regression
```

### Full Suite (73 files, ~60 min)
**Run on:** Release validation

Complete test suite (smoke + core + regression):

```bash
npm run test:e2e:full
```

### Quarantine (20 files)
**Run on:** Manual only

Debug and temporary tests that need cleanup or are unreliable:

```bash
npm run test:e2e:quarantine
```

## Feature Groups

Run tests for specific features:

| Feature | Command | Description |
|---------|---------|-------------|
| auth | `npm run test:e2e:auth` | Authentication & security |
| tiers | `npm run test:e2e:tiers` | Tier upgrade/downgrade |
| locations | `npm run test:e2e:locations` | Multi-location & maps |
| products | `npm run test:e2e:products` | Product management |
| excel | `npm run test:e2e:excel` | Excel import/export |
| dashboard | `npm run test:e2e:dashboard` | Vendor dashboard |
| search | `npm run test:e2e:search` | Search functionality |
| onboarding | `npm run test:e2e:onboarding` | Full vendor onboarding |

## Advanced Usage

### Using the E2E Runner

```bash
# Show available tiers and test counts
npm run test:e2e:list

# Run with custom options
npm run test:e2e:run -- --tier=core --workers=4

# Run in headed mode
npm run test:e2e:run -- --tier=smoke --headed

# Debug mode
npm run test:e2e:run -- --tier=smoke --debug
```

### Environment Variables

```bash
# Select tier
TEST_TIER=smoke|core|regression|full|quarantine

# Select feature
TEST_FEATURE=auth|tiers|locations|products|excel|dashboard|search|vendor-onboarding
```

### Parallel Execution

Tests run in parallel by default. Control workers:

```bash
# Use all available CPUs (default)
npm run test:e2e:smoke

# Limit workers
npm run test:e2e:run -- --tier=smoke --workers=2
```

## Prerequisites

1. **Dev server must be running:**
   ```bash
   DISABLE_EMAILS=true npm run dev
   ```

2. **Rate limits are cleared automatically** by the test runner

## Test Organization

```
tests/e2e/
├── test-inventory.ts      # Test categorization
├── global-setup.ts        # Pre-test setup
├── helpers/               # Test utilities
│   ├── seed-api-helpers.ts
│   ├── tier-upgrade-helpers.ts
│   └── ...
├── vendor-onboarding/     # Onboarding flow tests
├── tier-upgrade-request/  # Tier system tests
├── auth/                  # Security tests
└── *.spec.ts              # Feature tests
```

## Adding New Tests

1. **Create test file** in appropriate location
2. **Add to test-inventory.ts** in the correct tier:
   - `smoke` - Critical path tests
   - `core` - Main feature tests
   - `regression` - Edge cases, detailed validation
   - `quarantine` - Debug/temporary tests

3. **Add to feature group** if applicable

## Recommended Workflows

### During Development
```bash
# Run related feature tests
npm run test:e2e:auth  # If working on auth

# Quick smoke check before commit
npm run test:e2e:smoke
```

### Before PR
```bash
npm run test:e2e:core
```

### Before Release
```bash
npm run test:e2e:full
```

## Troubleshooting

### Tests fail to start
```bash
# Check if server is running
curl http://localhost:3000

# Start dev server
DISABLE_EMAILS=true npm run dev
```

### View test report
```bash
npx playwright show-report
```

### Run single test file
```bash
npx playwright test tests/e2e/dual-auth-system.spec.ts
```

### Debug a test
```bash
npx playwright test tests/e2e/dual-auth-system.spec.ts --debug
```
