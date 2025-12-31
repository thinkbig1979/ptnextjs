# Code Consistency & Style Review

## Summary
- **Files sampled**: ~200+ files across components, lib, app, hooks, and tests directories
- **Issues found**: 47 (High: 5, Medium: 18, Low: 24)

## ESLint/Prettier Configuration Status

### Current ESLint Configuration (`.eslintrc.json`)
```json
{
  "extends": ["next/core-web-vitals"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Missing Configuration
- **No Prettier configuration file** (`.prettierrc`) at project root
- No import ordering rules configured
- No quote style enforcement
- No semicolon enforcement

---

## Inconsistency Patterns Found

### 1. File Naming Conventions (HIGH)

**Service Files - Mixed patterns:**
- PascalCase: `GeocodingService.ts`, `VendorComputedFieldsService.ts`, `TierService.ts`
- kebab-case: `audit-service.ts`, `auth-service.ts`

| File Location | Naming Style | Files |
|--------------|--------------|-------|
| `lib/services/` | PascalCase | GeocodingService.ts, ProductService.ts, TierService.ts (12 files) |
| `lib/services/` | kebab-case | audit-service.ts, auth-service.ts (2 files) |

**Hook Files - Mixed patterns:**
- camelCase: `useVendorProducts.ts`, `useLocationFilter.ts`
- kebab-case: `use-toast.ts`

### 2. Quote Style Inconsistency (MEDIUM)

**'use client' directive:**
- Single quotes: **138 files** (`'use client'`)
- Double quotes: **61 files** (`"use client"`)

**Examples:**
```typescript
// Single quotes (138 files)
'use client';  // components/VendorMap.tsx

// Double quotes (61 files)
"use client";  // components/theme-toggle.tsx
```

### 3. Variable Naming Convention Violations (HIGH)

**snake_case variables in camelCase codebase:**

| File | Variables |
|------|-----------|
| `lib/services/audit-service.ts` | `forwarded_for`, `first_ip`, `real_ip`, `ip_address`, `user_agent`, `event_map` |
| `lib/auth/index.ts` | `auth_header`, `cookie_token`, `current_token_version`, `token_version`, `auth_user` |
| `app/api/auth/login/route.ts` | `email_attempt`, `login_response`, `token_id` |
| `app/api/auth/refresh/route.ts` | `refresh_token`, `old_decoded`, `new_decoded`, `new_token_id` |
| `app/api/auth/logout/route.ts` | `access_token` |
| `lib/transformers/CompanyTransformer.ts` | `social_media` |
| `lib/payload-cms-data-service.ts` | `social_media` |

**Total: ~25+ snake_case variable occurrences across 8+ files**

### 4. Error Variable Naming (MEDIUM)

Inconsistent catch block variable names:

| Pattern | Usage Count | Example Files |
|---------|-------------|---------------|
| `catch (error)` | 50+ | payload/collections/*.ts, scripts/*.ts |
| `catch (e)` | 30+ | app/(site)/layout.tsx, components/theme-*.tsx |
| `catch (err)` | 25+ | components/admin/*.tsx, lib/context/AuthContext.tsx |

### 5. React Import Patterns (LOW)

Two patterns used:
- `import React from 'react'` - **50 files**
- `import * as React from 'react'` - **178 files** (preferred by shadcn/ui)

The `import * as React from` pattern is more common and should be the standard.

### 6. Export Patterns (LOW)

Mixed export patterns for components:

| Pattern | Count | Common Usage |
|---------|-------|--------------|
| `export function ComponentName` | 145 files | Most components |
| `export default function` | 23 files | Page components, admin pages |
| `export const` | 40 files | Constants, page exports |

### 7. Type Import Patterns (LOW)

Two patterns for importing types:
- `import type { ... }` - **230 occurrences** (preferred)
- `import { type ... }` - **8 occurrences**

---

## High Priority Issues

### H1: snake_case Variable Names in Auth/Audit Code
**Files affected:**
- `/home/edwin/development/ptnextjs/lib/services/audit-service.ts` (Lines 49, 52, 59, 83, 84, 266)
- `/home/edwin/development/ptnextjs/lib/auth/index.ts` (Lines 50, 56, 113, 114, 126)
- `/home/edwin/development/ptnextjs/app/api/auth/login/route.ts` (Lines 16, 32, 36)
- `/home/edwin/development/ptnextjs/app/api/auth/refresh/route.ts` (Lines 25, 35, 44, 45)
- `/home/edwin/development/ptnextjs/app/api/auth/logout/route.ts` (Line 12)

**Impact:** Breaks camelCase convention used elsewhere in codebase.

### H2: Service File Naming Inconsistency
**Files to rename (kebab-case to PascalCase):**
- `/home/edwin/development/ptnextjs/lib/services/audit-service.ts` -> `AuditService.ts`
- `/home/edwin/development/ptnextjs/lib/services/auth-service.ts` -> `AuthService.ts`

### H3: Hook File Naming Inconsistency
**Files to rename (kebab-case to camelCase):**
- `/home/edwin/development/ptnextjs/hooks/use-toast.ts` -> `useToast.ts`
- `/home/edwin/development/ptnextjs/components/ui/use-toast.ts` -> `useToast.ts`
- `/home/edwin/development/ptnextjs/app/(site)/components/ui/use-toast.ts` -> `useToast.ts`
- `/home/edwin/development/ptnextjs/app/(site)/hooks/use-toast.ts` -> `useToast.ts`

### H4: Missing Prettier Configuration
**Impact:** No automated formatting enforcement leads to inconsistent code style.

### H5: 'use client' Quote Style Inconsistency
**Impact:** 199 files with mixed quote styles for the directive.

---

## Medium Priority Issues

### M1: Error Variable Naming Inconsistency
- Standardize to `error` across all catch blocks
- Affects 100+ catch blocks

### M2: Component Export Patterns
- Page components: Use `export default function`
- Reusable components: Use `export function`

### M3: Duplicate Component Files
Several components exist in both locations with minor variations:
- `components/theme-toggle.tsx` AND `app/(site)/components/theme-toggle.tsx`
- `components/theme-provider.tsx` AND `app/(site)/components/theme-provider.tsx`
- `components/navigation.tsx` AND `app/(site)/components/navigation.tsx`
- `components/pagination.tsx` AND `app/(site)/components/pagination.tsx`
- `components/footer.tsx` AND `app/(site)/components/footer.tsx`
- Full `components/ui/` duplicated in `app/(site)/components/ui/`

### M4: Import Ordering
No consistent import ordering pattern enforced. Recommended order:
1. React imports
2. Next.js imports
3. Third-party libraries
4. Internal absolute imports (@/...)
5. Relative imports (./)

---

## Low Priority Issues

### L1: React Import Pattern
- Standardize to `import * as React from 'react'` (already majority)

### L2: Type Import Pattern
- Standardize to `import type { ... }` (already majority)

### L3: Trailing Semicolons
- Some files missing semicolons after function declarations (shadcn/ui pattern)
- Example: `lib/utils.ts` lines 1-6 have no semicolons

### L4: Empty Lines at File Start
- Some files have blank lines before content
- Example: `components/hero-section.tsx` starts with blank lines

---

## Recommendations

### Immediate Actions (High Priority)

1. **Create `.prettierrc` configuration:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "useTabs": false
}
```

2. **Update `.eslintrc.json` with import ordering:**
```json
{
  "extends": ["next/core-web-vitals"],
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "pathGroups": [
          { "pattern": "react", "group": "builtin", "position": "before" },
          { "pattern": "next/**", "group": "builtin", "position": "after" },
          { "pattern": "@/**", "group": "internal" }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ],
    "quotes": ["error", "single", { "allowTemplateLiterals": true, "avoidEscape": true }]
  }
}
```

3. **Rename snake_case variables to camelCase in auth files**
   - Estimated effort: 2-3 hours
   - Use find-and-replace with verification

4. **Rename inconsistent service/hook files**
   - Update all imports referencing these files
   - Estimated effort: 1-2 hours

### Medium-Term Actions

5. **Consolidate duplicate components**
   - Keep components in `/components/` only
   - Update imports in `app/(site)/` to use `@/components/`
   - Remove duplicates from `app/(site)/components/`

6. **Standardize error variable names**
   - Run ESLint fix with custom rule
   - Manual review for edge cases

### Long-Term Actions

7. **Add pre-commit hooks with Husky + lint-staged**
   - Auto-format on commit
   - Prevent inconsistencies from being introduced

8. **Consider using eslint-plugin-unicorn**
   - Enforces consistent naming conventions
   - Provides many helpful rules

---

## Style Guide Alignment

Current documented conventions in `style_conventions` memory:

| Convention | Status | Notes |
|------------|--------|-------|
| TypeScript throughout | :white_check_mark: Followed | All .ts/.tsx files |
| Components: PascalCase | :white_check_mark: Followed | Component names consistent |
| Files: kebab-case | :warning: Partial | Services have mixed patterns |
| Variables: camelCase | :warning: Partial | Auth code uses snake_case |
| Constants: UPPER_SNAKE_CASE | :white_check_mark: Followed | tierConfig.ts is good example |
| Client components marked | :white_check_mark: Followed | But quote style varies |

---

## Files Requiring Review

| Priority | File Path | Issue |
|----------|-----------|-------|
| HIGH | `lib/services/audit-service.ts` | snake_case variables, kebab-case filename |
| HIGH | `lib/services/auth-service.ts` | kebab-case filename |
| HIGH | `lib/auth/index.ts` | snake_case variables |
| HIGH | `app/api/auth/login/route.ts` | snake_case variables |
| HIGH | `app/api/auth/refresh/route.ts` | snake_case variables |
| HIGH | `app/api/auth/logout/route.ts` | snake_case variables |
| MEDIUM | All `use-toast.ts` files | Should be `useToast.ts` |
| MEDIUM | `app/(site)/components/ui/*` | Duplicates of `/components/ui/*` |

---

*Report generated: 2025-12-31*
*Reviewer: Claude Code QC Review*
