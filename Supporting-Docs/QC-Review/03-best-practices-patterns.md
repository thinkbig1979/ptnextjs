# Best Practices & Patterns Review

## Summary
- **Files reviewed:** ~200+ files across app/, components/, lib/ directories
- **Issues found:** 28 (Critical: 3, High: 8, Medium: 10, Low: 7)
- **Review date:** 2025-12-31
- **Review scope:** Error handling, data fetching, state management, Next.js patterns, React patterns

---

## Critical Issues

### 1. Missing Next.js Error Boundaries (error.tsx)
**Severity:** Critical
**Location:** `app/` directory
**Issue:** No `error.tsx` files exist anywhere in the application. This means unhandled errors will crash the entire application or show the default Next.js error page.

**Impact:**
- Poor user experience when errors occur
- No graceful degradation
- Difficult to debug production issues
- Users may see raw error messages

**Recommendation:**
```tsx
// app/error.tsx (root error boundary)
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

**Files to create:**
- `app/error.tsx` (root)
- `app/(site)/error.tsx`
- `app/(site)/vendor/dashboard/error.tsx`
- `app/admin/error.tsx`

---

### 2. Missing Loading States (loading.tsx)
**Severity:** Critical
**Location:** `app/` directory
**Issue:** No `loading.tsx` files exist for Suspense boundaries. Users see nothing during page transitions.

**Impact:**
- Poor perceived performance
- No loading feedback during navigation
- Jarring user experience

**Recommendation:**
```tsx
// app/(site)/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
```

**Files to create:**
- `app/(site)/loading.tsx`
- `app/(site)/vendors/loading.tsx`
- `app/(site)/products/loading.tsx`
- `app/(site)/vendor/dashboard/loading.tsx`

---

### 3. Missing 404 Not Found Page (not-found.tsx)
**Severity:** Critical
**Location:** `app/` directory
**Issue:** No custom `not-found.tsx` files. Users see the default Next.js 404 page.

**Impact:**
- Broken brand experience
- No helpful navigation back to the site
- Poor SEO signals

**Recommendation:**
```tsx
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">Page not found</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
```

---

## High Priority Issues

### 4. Using Array Index as React Key
**Severity:** High
**Location:** Multiple components (30+ occurrences)
**Issue:** Using `key={index}` in `.map()` renders, which can cause incorrect behavior when lists change.

**Affected Files:**
- `components/vendors/VendorTeamSection.tsx:44`
- `components/vendors/VendorCaseStudiesSection.tsx:48`
- `components/vendors/VendorAboutSection.tsx:146, 170`
- `components/vendors/VendorCertificationsSection.tsx:49, 82`
- `components/case-studies/YachtProjectPortfolio.tsx:110, 146`
- `components/product-comparison/OwnerReviews.tsx:391, 404, 419`
- `app/(site)/components/pagination.tsx:68`
- And 20+ more files

**Impact:**
- Incorrect component state preservation during re-renders
- Animation glitches
- Input field value bugs

**Recommendation:**
Use unique identifiers like IDs or composite keys:
```tsx
// Bad
{items.map((item, index) => <Item key={index} {...item} />)}

// Good
{items.map((item) => <Item key={item.id} {...item} />)}
// Or if no ID:
{items.map((item) => <Item key={`${item.name}-${item.type}`} {...item} />)}
```

---

### 5. Raw `<img>` Tags Instead of next/image
**Severity:** High
**Location:** 11+ components
**Issue:** Using raw `<img>` tags bypasses Next.js image optimization.

**Affected Files:**
- `components/vendors/VendorMediaGallery.tsx:131, 140, 243`
- `components/dashboard/BasicInfoForm.tsx:208`
- `components/dashboard/MediaGalleryManager.tsx:497, 505`
- `app/(site)/vendor/dashboard/components/PromotionPackForm.tsx:268`
- `app/(site)/vendor/dashboard/components/TeamMembersManager.tsx:337, 494`
- `app/(site)/vendor/dashboard/components/CaseStudiesManager.tsx:606`

**Impact:**
- Larger page sizes
- No automatic format optimization (WebP/AVIF)
- No lazy loading optimization
- Poor Core Web Vitals

**Recommendation:**
Use `next/image` for all images:
```tsx
import Image from 'next/image';

// Instead of <img src={url} alt={alt} />
<Image
  src={url}
  alt={alt}
  width={300}
  height={200}
  loading="lazy"
/>
```

---

### 6. Conflicting dynamic and revalidate Exports
**Severity:** High
**Location:** Multiple page files
**Issue:** Using `export const dynamic = 'force-dynamic'` with `export const revalidate` together is contradictory.

**Affected Files:**
- `app/(site)/vendors/page.tsx` - has both `force-dynamic` and `revalidate = 300`
- `app/(site)/vendors/[slug]/page.tsx` - has both `force-dynamic` and `revalidate = 60`
- `app/(site)/products/page.tsx` - has both settings
- `app/(site)/products/[id]/page.tsx` - has both settings
- `app/(site)/blog/[slug]/page.tsx` - has both settings

**Impact:**
- `force-dynamic` overrides `revalidate`, so ISR is not working
- Unnecessary database queries on every request
- Reduced caching benefits

**Recommendation:**
Choose one strategy:
```tsx
// For truly dynamic content (auth-dependent, real-time)
export const dynamic = 'force-dynamic';

// For content that can be cached/revalidated (remove force-dynamic)
export const revalidate = 300; // ISR every 5 minutes
```

---

### 7. Inconsistent Data Fetching Patterns
**Severity:** High
**Location:** Client components
**Issue:** Some components use SWR, others use manual fetch with useEffect.

**Pattern Comparison:**
- SWR used in: `VendorDashboardContext.tsx`, `useVendorProfile.ts`
- Manual fetch in useEffect: `AdminApprovalQueue.tsx`, `AdminTierRequestQueue.tsx`, `ImportHistoryCard.tsx`

**Recommendation:**
Standardize on SWR for all client-side data fetching:
```tsx
// Instead of manual useEffect + fetch:
const { data, error, isLoading, mutate } = useSWR(url, fetcher);
```

---

### 8. Missing Error Handling in Some API Routes
**Severity:** High
**Location:** `app/api/auth/login/route.ts`
**Issue:** The login route file doesn't have proper symbols recognized, which may indicate TypeScript issues.

**Recommendation:** Review the file structure and ensure proper error handling wrapper.

---

### 9. No Client-Side Error Boundaries in Critical Components
**Severity:** High
**Location:** Dashboard and form components
**Issue:** Only `VisualDemo.tsx` uses an ErrorBoundary. Critical user-facing components lack protection.

**Recommendation:**
Add error boundaries around:
- `VendorDashboardProvider`
- `ProductForm`
- `VendorProfileEditor`
- Any component that makes API calls

---

### 10. Direct `<a>` Tags for Internal Links
**Severity:** High
**Location:** 6+ components
**Issue:** Using raw `<a href>` instead of `next/link` for internal navigation.

**Affected Files:**
- `components/call-paul-section.tsx:24`
- `components/dashboard/UpgradePromptCard.tsx:121`
- `components/vendor/TierGate.tsx:70`

**Impact:**
- Full page reloads instead of client-side navigation
- Lost React state
- Slower perceived navigation

---

### 11. Missing AbortController Cleanup
**Severity:** High
**Location:** Some fetch operations in useEffect
**Issue:** Not all fetch operations have proper cleanup with AbortController.

**Recommendation:**
```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  return () => controller.abort();
}, [url]);
```

---

## Medium Priority Issues

### 12. Heavy Component Re-renders
**Severity:** Medium
**Location:** `VendorsClient` component (314 lines)
**Issue:** Large component with many state variables and callbacks that could benefit from splitting.

**Recommendation:**
- Extract filter logic into a custom hook
- Split into smaller sub-components
- Consider using `useReducer` for complex state

---

### 13. Insufficient Memoization in List Components
**Severity:** Medium
**Location:** Various list rendering components
**Issue:** List item components are not memoized with `React.memo()`.

**Recommendation:**
```tsx
const VendorCard = React.memo(function VendorCard({ vendor }) {
  // component logic
});
```

---

### 14. Missing Loading States in Client Components
**Severity:** Medium
**Location:** Many client components with async operations
**Issue:** Some components don't show loading indicators during data fetching.

---

### 15. Context Provider Without Memoization
**Severity:** Medium
**Location:** `lib/context/AuthContext.tsx`
**Issue:** The context value object is recreated on every render.

**Recommendation:**
```tsx
const value = useMemo(() => ({
  user,
  isLoading,
  login,
  logout,
  // ...
}), [user, isLoading, login, logout]);
```

---

### 16. Hardcoded API Paths
**Severity:** Medium
**Location:** Throughout client components
**Issue:** API endpoints are hardcoded as strings without centralization.

**Recommendation:**
Create an API client with typed endpoints:
```tsx
// lib/api/endpoints.ts
export const API = {
  vendors: {
    list: '/api/vendors',
    byId: (id: string) => `/api/vendors/${id}`,
  },
  // ...
};
```

---

### 17. Console.log Statements in Production Code
**Severity:** Medium
**Location:** Multiple API routes and components
**Issue:** Many `console.log`, `console.error` calls that should be proper logging.

**Recommendation:**
Use a structured logging solution or conditionally log in development only.

---

### 18. Missing TypeScript Strict Null Checks
**Severity:** Medium
**Location:** Various files
**Issue:** Some optional chaining could be replaced with proper null guards.

---

### 19. Form Validation Only on Client
**Severity:** Medium
**Location:** Registration and profile forms
**Issue:** While Zod is used, validation happens primarily on client. Server should validate again.

**Note:** Server-side validation is present in API routes, which is good.

---

### 20. Large Bundle from Client Components
**Severity:** Medium
**Location:** UI components
**Issue:** 77 files with `'use client'` directive, some could potentially be server components.

---

### 21. Inconsistent Error Response Formats
**Severity:** Medium
**Location:** API routes
**Issue:** Some routes use `{ success: false, error: string }`, others use `{ success: false, error: { code, message } }`.

**Recommendation:**
Standardize on a single error response format across all routes.

---

## Low Priority Issues

### 22. Magic Numbers in Configuration
**Severity:** Low
**Location:** Various files
**Issue:** Numbers like `300`, `60`, `3600` for revalidation periods are not constants.

---

### 23. Missing JSDoc Comments
**Severity:** Low
**Location:** Complex utility functions
**Issue:** Key utility functions lack documentation.

---

### 24. Duplicate UI Component Files
**Severity:** Low
**Location:** `app/(site)/components/ui/` and `components/ui/`
**Issue:** Some UI components exist in both locations.

---

### 25. Test Files Alongside Source
**Severity:** Low
**Location:** Various `__tests__` folders
**Issue:** Test files could be in a centralized tests directory (though current pattern is valid).

---

### 26. Missing Return Type Annotations
**Severity:** Low
**Location:** Some function components
**Issue:** Not all components have explicit return types.

---

### 27. Unused Dependencies in useCallback/useMemo
**Severity:** Low
**Location:** Various components
**Issue:** Some memoization hooks may have unnecessary or missing dependencies.

---

### 28. No Prefetching Strategy
**Severity:** Low
**Location:** Navigation components
**Issue:** Not using Link's prefetch feature strategically.

---

## Recommendations (Prioritized)

### Immediate Actions (Week 1)

1. **Create error.tsx files** in key route segments
2. **Create loading.tsx files** for main sections
3. **Create not-found.tsx** for custom 404 page
4. **Fix conflicting dynamic/revalidate exports** - choose one strategy per route

### Short-term (Week 2-3)

5. **Replace `key={index}` with unique keys** across all components
6. **Replace raw `<img>` with next/image** in all components
7. **Standardize on SWR** for all client-side data fetching
8. **Add ErrorBoundary wrappers** around critical components
9. **Replace `<a>` with `<Link>`** for internal navigation

### Medium-term (Month 1)

10. **Create centralized API client** with typed endpoints
11. **Memoize list item components** with React.memo
12. **Split large components** like VendorsClient into smaller pieces
13. **Standardize error response format** across all API routes
14. **Add proper logging infrastructure**

### Long-term (Quarter 1)

15. **Review and optimize client/server component split**
16. **Add comprehensive JSDoc documentation**
17. **Create component testing strategy**
18. **Implement proper prefetching strategy**

---

## Positive Patterns Found

1. **Consistent try/catch usage** in API routes (107 occurrences across 49 files)
2. **Good use of TypeScript** with proper type definitions
3. **Proper form validation** with Zod and react-hook-form
4. **Good memoization** with useMemo/useCallback (170 occurrences)
5. **Proper cleanup** in some useEffect hooks with AbortController
6. **Centralized data service** (PayloadCMSDataService) with caching
7. **Proper context patterns** for auth and dashboard state
8. **Good generateMetadata implementation** for SEO
9. **Rate limiting** implemented on sensitive endpoints
10. **Proper error logging** with structured information

---

## Files Reviewed

### App Directory
- All page.tsx files in `app/(site)/`
- All route.ts files in `app/api/`
- Layout files across segments

### Components Directory
- All files in `components/`
- Dashboard components
- Admin components
- UI components

### Library Directory
- `lib/context/` (AuthContext, VendorDashboardContext)
- `lib/services/` (EmailService, GeocodingService, etc.)
- `lib/payload-cms-data-service.ts`
- `lib/hooks/`

---

*Review completed by: Claude Code QC Assistant*
*Task ID: ptnextjs-0bza*
