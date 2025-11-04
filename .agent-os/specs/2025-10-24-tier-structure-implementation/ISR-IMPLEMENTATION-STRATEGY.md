# ISR Implementation Strategy

**Date**: 2025-10-25
**Status**: IN PROGRESS

---

## Current State Analysis

### Pages with `revalidate = false` (Permanent Cache):

1. ✅ **vendors/[slug]/page.tsx** - FIXED (now using 10s dev / 60s prod)
2. ❌ **vendors/page.tsx** - NEEDS ISR
3. ❌ **products/page.tsx** - NEEDS ISR
4. ❌ **products/[id]/page.tsx** - NEEDS ISR
5. ❌ **blog/[slug]/page.tsx** - NEEDS ISR

### Pages without explicit revalidate config (default behavior):

All other pages use Next.js default behavior (static with no revalidation).

---

## ISR Strategy by Content Type

### 🔴 High-Priority ISR (Content Updates Frequently):

**1. Vendor Detail Pages** - `vendors/[slug]/page.tsx`
- **Current**: ✅ Fixed (10s dev / 60s prod)
- **Rationale**: Vendors edit profiles regularly
- **Config**: `revalidate = 60` (1 minute)
- **On-Demand**: YES (when vendor updates via API)

**2. Vendors List Page** - `vendors/page.tsx`
- **Current**: ❌ `revalidate = false`
- **Rationale**: New vendors register, existing vendors update
- **Config**: `revalidate = 300` (5 minutes)
- **On-Demand**: YES (when vendor created/deleted)

**3. Products List Page** - `products/page.tsx`
- **Current**: ❌ `revalidate = false`
- **Rationale**: New products added, prices change
- **Config**: `revalidate = 300` (5 minutes)
- **On-Demand**: YES (when product created/updated/deleted)

**4. Product Detail Pages** - `products/[id]/page.tsx`
- **Current**: ❌ `revalidate = false`
- **Rationale**: Product specs, pricing, availability change
- **Config**: `revalidate = 300` (5 minutes)
- **On-Demand**: YES (when product updated)

---

### 🟡 Medium-Priority ISR (Content Updates Occasionally):

**5. Blog Post Pages** - `blog/[slug]/page.tsx`
- **Current**: ❌ `revalidate = false`
- **Rationale**: Posts edited after publication, comments added
- **Config**: `revalidate = 3600` (1 hour)
- **On-Demand**: YES (when post updated)

**6. Blog List Page** - `blog/page.tsx`
- **Current**: No explicit config
- **Rationale**: New blog posts published
- **Config**: `revalidate = 3600` (1 hour)
- **On-Demand**: YES (when post published)

**7. Homepage** - `page.tsx`
- **Current**: No explicit config
- **Rationale**: Featured content, latest posts, featured vendors
- **Config**: `revalidate = 300` (5 minutes)
- **On-Demand**: Optional

---

### 🟢 Low-Priority ISR (Content Rarely Changes):

**8. About Page** - `about/page.tsx`
- **Rationale**: Company info changes rarely
- **Config**: `revalidate = 86400` (24 hours)

**9. Contact Page** - `contact/page.tsx`
- **Rationale**: Contact info changes rarely
- **Config**: `revalidate = 86400` (24 hours)

**10. Info for Vendors** - `info-for-vendors/page.tsx`
- **Rationale**: Policy/info pages change rarely
- **Config**: `revalidate = 86400` (24 hours)

**11. Bespoke Solutions** - `bespoke-solutions/page.tsx`
- **Rationale**: Service offering pages change rarely
- **Config**: `revalidate = 86400` (24 hours)

**12. Discovery Platform** - `discovery-platform/page.tsx`
- **Rationale**: Feature pages change rarely
- **Config**: `revalidate = 86400` (24 hours)

**13. Yachts Pages** - `yachts/page.tsx`, `yachts/[slug]/page.tsx`
- **Rationale**: Yacht directory (if used)
- **Config**: `revalidate = 3600` (1 hour)

---

### 🔵 Dynamic (No ISR - User-Specific):

**14. Vendor Login** - `vendor/login/page.tsx`
- **Config**: `dynamic = 'force-dynamic'` (no caching)
- **Rationale**: Authentication state

**15. Vendor Register** - `vendor/register/page.tsx`
- **Config**: `dynamic = 'force-dynamic'` (no caching)
- **Rationale**: Form submission

**16. Vendor Dashboard** - `vendor/dashboard/page.tsx`
- **Config**: `dynamic = 'force-dynamic'` (no caching)
- **Rationale**: Personalized content, authentication required

**17. Vendor Profile Editor** - `vendor/dashboard/profile/page.tsx`
- **Config**: `dynamic = 'force-dynamic'` (no caching)
- **Rationale**: User-specific data, real-time editing

**18. Registration Pending** - `vendor/registration-pending/page.tsx`
- **Config**: `dynamic = 'force-dynamic'` (no caching)
- **Rationale**: User-specific status

---

## Implementation Plan

### Phase 1: High-Priority Content Pages (15 min)

```typescript
// vendors/page.tsx
export const revalidate = process.env.NODE_ENV === 'development' ? 10 : 300;

// products/page.tsx
export const revalidate = process.env.NODE_ENV === 'development' ? 10 : 300;

// products/[id]/page.tsx
export const revalidate = process.env.NODE_ENV === 'development' ? 10 : 300;

// blog/[slug]/page.tsx
export const revalidate = process.env.NODE_ENV === 'development' ? 10 : 3600;
```

### Phase 2: Medium-Priority Pages (10 min)

```typescript
// page.tsx (homepage)
export const revalidate = process.env.NODE_ENV === 'development' ? 10 : 300;

// blog/page.tsx
export const revalidate = process.env.NODE_ENV === 'development' ? 10 : 3600;
```

### Phase 3: Low-Priority Pages (10 min)

```typescript
// about/page.tsx, contact/page.tsx, info-for-vendors/page.tsx, etc.
export const revalidate = process.env.NODE_ENV === 'development' ? 10 : 86400;
```

### Phase 4: On-Demand Revalidation (30 min)

Add `revalidatePath()` to API routes:
- `app/api/portal/vendors/[id]/route.ts` → revalidate `/vendors/${slug}`
- Product update APIs → revalidate `/products/${id}`
- Blog update APIs → revalidate `/blog/${slug}`

---

## Recommended Revalidation Times Summary

| Content Type | Dev | Production | Rationale |
|--------------|-----|------------|-----------|
| Vendor profiles | 10s | 60s | Frequent edits by vendors |
| Product details | 10s | 300s | Pricing, specs change |
| Vendor/Product lists | 10s | 300s | New items added regularly |
| Blog posts | 10s | 3600s | Occasional edits |
| Homepage | 10s | 300s | Dynamic featured content |
| Static pages | 10s | 86400s | Rarely change |
| User dashboards | N/A | Dynamic | Personalized, no cache |

---

## Benefits of This Strategy

### ✅ Performance:
- Pages still load instantly from cache
- CDN caching maintained
- No database queries for cached requests

### ✅ Data Freshness:
- Content updates automatically without redeploys
- Dev: 10-second refresh (great DX)
- Prod: Appropriate delays per content type

### ✅ Developer Experience:
- No manual server restarts in development
- Content changes visible within seconds
- Faster iteration cycles

### ✅ Content Editor Experience:
- Changes visible within minutes (not hours/days)
- No technical knowledge required
- Predictable update times

---

## Testing Strategy

### Manual Testing:

1. **Before ISR**:
   ```bash
   npm run dev
   # Update vendor → Page shows old data forever
   # Must restart server
   ```

2. **After ISR**:
   ```bash
   npm run dev
   # Update vendor → Wait 10 seconds → Page shows new data
   # No restart needed
   ```

### Automated Testing (E2E):

```typescript
test('ISR revalidates vendor page', async ({ page }) => {
  // 1. Load vendor page (initial cache)
  await page.goto('/vendors/test-vendor');
  await expect(page).toHaveTitle(/Old Name/);

  // 2. Update vendor via API
  await updateVendor({ companyName: 'New Name' });

  // 3. Wait for revalidation (60s in prod, 10s in dev)
  await page.waitForTimeout(11000);  // Dev: 10s + buffer

  // 4. Reload page
  await page.reload();

  // 5. Verify new data
  await expect(page).toHaveTitle(/New Name/);
});
```

---

## Files to Modify

### Content Pages (Add ISR):
1. ✅ `app/(site)/vendors/[slug]/page.tsx` - DONE
2. `app/(site)/vendors/page.tsx`
3. `app/(site)/products/page.tsx`
4. `app/(site)/products/[id]/page.tsx`
5. `app/(site)/blog/[slug]/page.tsx`
6. `app/(site)/blog/page.tsx`
7. `app/(site)/page.tsx` (homepage)
8. `app/(site)/about/page.tsx`
9. `app/(site)/contact/page.tsx`
10. `app/(site)/info-for-vendors/page.tsx`
11. `app/(site)/bespoke-solutions/page.tsx`
12. `app/(site)/discovery-platform/page.tsx`

### API Routes (Add On-Demand Revalidation):
1. `app/api/portal/vendors/[id]/route.ts`
2. `app/api/portal/vendors/register/route.ts` (for new vendors)
3. Future: Product/Blog update APIs when available

---

## Deployment Checklist

- [ ] Enable ISR on all content pages
- [ ] Add on-demand revalidation to vendor API
- [ ] Test in development (10s revalidation)
- [ ] Test in staging (60s/300s/3600s revalidation)
- [ ] Monitor cache hit rates in production
- [ ] Document for content editors

---

**Next Steps**: Implement Phase 1 (high-priority pages) now, Phase 2-3 can follow.
