# Quick Fix Guide - E2E Test Registration Timeout

## Problem
Test `02-admin-approval.spec.ts` Test 2.3 is failing with a timeout error.

## Quick Fix (30 seconds)

```bash
# Step 1: Apply the automated fix
cd /home/edwin/development/ptnextjs
python3 apply-e2e-test-fixes.py

# Step 2: Restart the dev server
npm run stop:dev
npm run dev

# Step 3: Run the test
npx playwright test tests/e2e/vendor-onboarding/02-admin-approval.spec.ts:33
```

## What Gets Fixed

1. **Helper Function** (`tests/e2e/helpers/vendor-onboarding-helpers.ts`):
   - Changes `registerVendor` to accept ALL HTTP responses (not just 200/201)
   - Prevents timeout when API returns error status codes
   - Uses proper `Promise.all` pattern

2. **Environment** (`.env`):
   - Adds `DISABLE_RATE_LIMIT=true` to prevent rate limit errors during testing

## Backups

Both files are automatically backed up with `.backup` extension before modification.

## More Details

- **Full Analysis**: `Supporting-Docs/E2E-TEST-FIX-REGISTRATION-TIMEOUT.md`
- **Quick Summary**: `E2E-FIX-SUMMARY.md`

## Manual Fix (if preferred)

See `Supporting-Docs/E2E-TEST-FIX-REGISTRATION-TIMEOUT.md` for exact code changes.
