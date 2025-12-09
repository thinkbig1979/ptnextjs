# Quick Start: Run Batch 2 E2E Syntax Fixes

## TL;DR - Just Run This

```bash
cd /home/edwin/development/ptnextjs
bash fix-e2e-syntax-batch2.sh
```

## What This Fixes

- **6 test files** with syntax errors
- **4 mixed quote errors** (template literals with wrong closing quote)
- **37 emoji encoding errors** (replaced with ASCII equivalents)

## Files Being Fixed

1. `tests/e2e/debug-products-page.spec.ts` - 16 fixes
2. `tests/e2e/debug-vendor-products.spec.ts` - 15 fixes
3. `tests/e2e/logout-functionality.spec.ts` - 1 fix
4. `tests/e2e/dual-auth-system.spec.ts` - 2 fixes
5. `tests/e2e/location-filter-debug.spec.ts` - 6 fixes
6. `tests/e2e/multi-location-test.spec.ts` - 1 fix

## Verify After Running

```bash
# Should return nothing (no more errors)
grep -r "\`\${BASE_URL}[^']*'" tests/e2e/
grep -r "[🌐📍📸📄📝⏳🎴❌🔧🔀🔗🔍🖱️📋📊✅✓✗👤🗺️🎯✨]" tests/e2e/
```

## Then Commit

```bash
git add tests/e2e/debug-*.spec.ts tests/e2e/logout-*.spec.ts tests/e2e/dual-*.spec.ts tests/e2e/location-*.spec.ts tests/e2e/multi-*.spec.ts
git commit -m "fix(tests): batch 2 - fix syntax errors in E2E tests"
```

## Full Details

See: `/home/edwin/development/ptnextjs/Supporting-Docs/batch2-fix-report.md`
