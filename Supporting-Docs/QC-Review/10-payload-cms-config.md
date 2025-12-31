# Payload CMS Configuration Review

**Review Date:** 2025-12-31
**Reviewer:** Claude Code (QC Automation)
**Task ID:** ptnextjs-vshr

## Summary

| Metric | Count |
|--------|-------|
| Collections | 14 |
| High Priority Issues | 4 |
| Medium Priority Issues | 6 |
| Low Priority Issues | 5 |

The Payload CMS configuration is well-structured with comprehensive access control, tier-based field restrictions, and proper hook implementation. However, there are several areas that need attention, particularly around security, consistency, and potential edge cases.

---

## Collection Inventory

| Collection | Slug | Purpose | Admin Group |
|------------|------|---------|-------------|
| Users | `users` | Authentication and user management | User Management |
| Vendors | `vendors` | Vendor/partner company profiles | Content |
| Products | `products` | Product catalog with vendor relationships | Content |
| Categories | `categories` | Hierarchical category taxonomy | Content |
| BlogPosts | `blog-posts` | Blog content management | Content |
| TeamMembers | `team-members` | Platform team member profiles | Content |
| Tags | `tags` | Tagging system for content | Content |
| Yachts | `yachts` | Yacht profiles and supplier relationships | Content |
| CompanyInfo | `company-info` | Platform company information | Settings |
| TierUpgradeRequests | `tier_upgrade_requests` | Vendor tier change workflow | Administration |
| ImportHistory | `import_history` | Product import tracking | Vendor Management |
| AuditLogs | `audit_logs` | Authentication audit trail | System |
| Media | `media` | File uploads and external URLs | Media |
| Notifications | `notifications` | In-app user notifications | System |

---

## Access Control Analysis

### Collection-Level Access Summary

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| Users | Admin + First user | Admin + Self | Admin + Self | Admin |
| Vendors | Admin | Public | Admin + Owner | Admin |
| Products | Admin + Vendor | Public | Admin + Owner | Admin + Owner |
| Categories | Admin | Public | Admin | Admin |
| BlogPosts | Admin | Public | Admin | Admin |
| TeamMembers | Admin | Public | Admin | Admin |
| Tags | Admin | Public | Admin | Admin |
| Yachts | Admin | Public | Admin | Admin |
| CompanyInfo | Admin | Public | Admin | Admin |
| TierUpgradeRequests | Vendor | Admin + Owner | Admin | Admin |
| ImportHistory | Admin + Vendor | Admin + Owner | Admin | Admin |
| AuditLogs | None (server-only) | Admin | None | None |
| Media | Default | Public | Default | Default |
| Notifications | Admin + System | Admin + Owner | Admin + Owner | Admin |

### Role-Based Access Control

**Roles Defined:**
- `admin` - Full access to all collections
- `vendor` - Limited access to own data

**RBAC Functions (`payload/access/rbac.ts`):**
- `isAdmin` - Check admin role
- `isVendor` - Check vendor role
- `isAuthenticated` - Check any authenticated user
- `isAdminOrSelf` - Admin or document owner
- `hasTierAccess(minTier)` - Tier-based collection access
- `canAccessTierField(requiredTier)` - Tier-based field access

### Field-Level Access Control

The Vendors collection implements extensive field-level access control:

**Admin-Only Fields:**
- `user` (relationship)
- `tier`
- `featured`, `published`, `profileSubmitted`, `partner`
- `featuredInCategory`, `advancedAnalytics`, `apiAccess`, `customDomain`
- All `promotionPack` sub-fields
- `editorialContent`

**Tier-Based Fields (Tier 1+):**
- Social links (`website`, `linkedinUrl`, `twitterUrl`)
- Social proof metrics
- Video content
- Certifications, awards
- Case studies, innovation highlights
- Team members, yacht projects
- Media gallery

**Tier-Based Fields (Tier 2+):**
- Multiple locations
- Advanced analytics
- API access
- Custom domain

---

## Hooks Analysis

### Collection Hooks Inventory

| Collection | beforeChange | afterChange | afterDelete | beforeValidate |
|------------|--------------|-------------|-------------|----------------|
| Users | Timestamp + Token version | Audit logging + Email | - | - |
| Vendors | Tier validation | Email notifications | - | Slug generation |
| Products | Tier2 validation | - | - | Slug generation |
| Categories | Circular ref prevention | - | - | Slug generation |
| BlogPosts | PublishedAt auto-set | Cache + ISR revalidation | Cache clear | Slug generation |
| Tags | usageCount compute | - | - | Slug generation |
| Yachts | Timeline sorting | - | - | Slug generation |
| TierUpgradeRequests | Auto-populate + validation | Email notifications | - | - |
| ImportHistory | Status auto-detect | - | - | - |
| Notifications | Read status validation | - | - | - |
| Media | - | - | - | External URL handling |

### Hook Patterns Observed

1. **Slug Generation**: Consistent pattern across collections using `beforeValidate`
2. **Email Notifications**: Implemented in Users, Vendors, TierUpgradeRequests
3. **Tier Validation**: Products check vendor tier before creation
4. **Audit Logging**: Users collection logs security events
5. **Cache Management**: BlogPosts clears cache and triggers ISR

---

## High Priority Issues

### 1. Media Collection Missing Create/Update/Delete Access Control
**Severity:** HIGH
**File:** `payload/collections/Media.ts`

```typescript
access: {
  read: () => true, // Public read access
  // Missing: create, update, delete
}
```

**Risk:** Any authenticated user can upload and modify media files.

**Recommendation:**
```typescript
access: {
  read: () => true,
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => user?.role === 'admin',
  delete: ({ req: { user } }) => user?.role === 'admin',
}
```

### 2. Notifications Collection Allows Unauthenticated Create
**Severity:** HIGH
**File:** `payload/collections/Notifications.ts`

```typescript
create: ({ req: { user } }) => {
  if (!user) return true; // PROBLEM: Allows unauthenticated creation
  return user.role === 'admin';
}
```

**Risk:** Public API can create notifications for any user.

**Recommendation:**
```typescript
create: ({ req: { user } }) => {
  // Only allow server-side creation via local API (not REST/GraphQL)
  return user?.role === 'admin';
}
// Note: For server hooks, use `payload.create()` with `overrideAccess: true`
```

### 3. TierUpgradeRequests Uses Non-Standard User Property
**Severity:** HIGH
**File:** `payload/collections/TierUpgradeRequests.ts`

```typescript
read: ({ req: { user } }) => {
  // ...
  return {
    vendor: { equals: user.vendorId }, // `vendorId` not defined on User type
  };
}
```

**Risk:** Access control may fail silently if `vendorId` is undefined.

**Recommendation:** Query vendor relationship instead:
```typescript
read: async ({ req: { user, payload } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const vendor = await payload.find({
    collection: 'vendors',
    where: { user: { equals: user.id } },
    limit: 1
  });

  if (!vendor.docs[0]) return false;
  return { vendor: { equals: vendor.docs[0].id } };
}
```

### 4. Duplicate Vendor Hooks - Both `Vendors.ts` and `vendors/hooks/index.ts`
**Severity:** HIGH
**Files:**
- `payload/collections/Vendors.ts` (lines 1824-1946)
- `payload/collections/vendors/index.ts` (uses modular hooks)
- `payload/collections/vendors/hooks/index.ts`

**Issue:** There are TWO different Vendors collection definitions:
1. `Vendors.ts` - Monolithic file with inline hooks
2. `vendors/index.ts` - Modular structure with separate hook files

The `payload.config.ts` imports from `Vendors.ts`, not the modular version. The modular hooks reference `registrationStatus` field which doesn't exist in the main collection.

**Risk:** Email notifications may be sent incorrectly or duplicated.

**Recommendation:**
1. Consolidate to single collection definition
2. Remove unused modular structure OR migrate to it fully
3. Ensure hooks are consistent

---

## Medium Priority Issues

### 1. Categories Missing Recursive Circular Reference Check
**Severity:** MEDIUM
**File:** `payload/collections/Categories.ts`

```typescript
// TODO: Add recursive check to prevent circular dependencies
// (e.g., A -> B -> C -> A)
```

**Recommendation:** Implement recursive validation:
```typescript
beforeChange: [
  async ({ req, data, operation, originalDoc }) => {
    if (!data.parentCategory) return data;

    const visited = new Set([originalDoc?.id].filter(Boolean));
    let current = data.parentCategory;

    while (current) {
      if (visited.has(current)) {
        throw new Error('Circular category reference detected');
      }
      visited.add(current);

      const parent = await req.payload.findByID({
        collection: 'categories',
        id: current,
      });
      current = parent?.parentCategory;
    }
    return data;
  },
]
```

### 2. Products Tier Validation Only Checks Tier2
**Severity:** MEDIUM
**File:** `payload/collections/Products.ts`

```typescript
if (!vendor.docs[0] || vendor.docs[0].tier !== 'tier2') {
  throw new Error('Product creation requires Tier 2 subscription...');
}
```

**Issue:** Tier 3 vendors cannot create products.

**Fix:**
```typescript
if (!vendor.docs[0] || !['tier2', 'tier3'].includes(vendor.docs[0].tier)) {
```

### 3. Inconsistent Slug Generation Patterns
**Severity:** MEDIUM
**Files:** Multiple collections

Some collections allow slug editing after creation, others don't:
- Tags: `readOnly: true` on slug
- Yachts: `readOnly: true` on slug
- Vendors: No readOnly
- Products: No readOnly
- Categories: No readOnly

**Recommendation:** Standardize approach - either all slugs are immutable after creation or all allow editing with proper redirect handling.

### 4. RBAC Tier Type Missing `tier3`
**Severity:** MEDIUM
**File:** `payload/access/rbac.ts`

```typescript
type TierLevel = 'free' | 'tier1' | 'tier2';

const TIER_LEVELS: Record<TierLevel, number> = {
  free: 0,
  tier1: 1,
  tier2: 2,
  // Missing tier3!
};
```

**Impact:** `hasTierAccess()` and `canAccessTierField()` functions will fail for tier3 checks.

**Fix:**
```typescript
type TierLevel = 'free' | 'tier1' | 'tier2' | 'tier3';

const TIER_LEVELS: Record<TierLevel, number> = {
  free: 0,
  tier1: 1,
  tier2: 2,
  tier3: 3,
};
```

### 5. TypeScript Errors Suppressed with `@ts-expect-error`
**Severity:** MEDIUM
**File:** `payload/collections/Vendors.ts`

26 instances of `@ts-expect-error` comments suppressing type errors for field-level access.

**Example:**
```typescript
access: {
  // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
  update: isAdmin,
}
```

**Recommendation:**
1. Investigate Payload CMS 3.x type definitions
2. Use `isAdminFieldAccess` from rbac.ts instead of `isAdmin` for field access
3. Create properly typed field access functions

### 6. External URL Validation in Media Collection
**Severity:** MEDIUM
**File:** `payload/collections/Media.ts`

External URLs are validated but not sanitized for XSS or SSRF:

```typescript
validate: (val) => {
  if (val && !val.match(/^https?:\/\/.+/)) {
    return 'Must be a valid HTTP or HTTPS URL';
  }
  return true;
}
```

**Recommendation:** Add URL sanitization and domain allowlisting for external media.

---

## Low Priority Issues

### 1. AuditLogs Disables All Write Access via Access Control
**Severity:** LOW
**File:** `payload/collections/AuditLogs.ts`

```typescript
create: () => false, // Only server can create via local API
```

**Note:** This is correct, but requires using `payload.create({ overrideAccess: true })` in hooks. Verify all audit logging uses this pattern.

### 2. Tags usageCount Computation on Every Update
**Severity:** LOW
**File:** `payload/collections/Tags.ts`

The `usageCount` is recalculated on every tag update, even when only the name/color changes.

**Recommendation:** Consider background job or on-demand calculation.

### 3. Yachts Timeline Sorted Descending but No Index
**Severity:** LOW
**File:** `payload/collections/Yachts.ts`

```typescript
data.timeline.sort((a, b) => dateB - dateA);
```

This in-memory sort happens on every save. Consider adding `order` field like other arrays.

### 4. Media Image Sizes Use `undefined` Height
**Severity:** LOW
**File:** `payload/collections/Media.ts`

```typescript
{
  name: 'full',
  width: 1920,
  height: undefined, // May cause issues with some image processors
  position: 'centre',
}
```

**Recommendation:** Use explicit aspect ratio or null.

### 5. LogoutButton Uses Inline Styles
**Severity:** LOW
**File:** `payload/components/LogoutButton.tsx`

Inline styles are harder to maintain. Consider using Payload's built-in styling system.

---

## Recommendations (Prioritized)

### Immediate (Before Next Release)

1. **Fix Media collection access control** - Add create/update/delete restrictions
2. **Fix Notifications create access** - Remove unauthenticated creation
3. **Add tier3 to RBAC tier levels** - Ensure tier3 features work
4. **Fix Products tier validation** - Allow tier3 vendors to create products

### Short Term (Next Sprint)

5. **Resolve duplicate Vendors collection** - Choose monolithic or modular approach
6. **Fix TierUpgradeRequests access control** - Use proper vendor lookup
7. **Implement Categories circular reference check** - Prevent infinite loops
8. **Standardize slug mutability** - Document and enforce consistent pattern

### Medium Term (Next Quarter)

9. **Address TypeScript errors** - Remove `@ts-expect-error` comments
10. **Add external URL sanitization** - Security hardening for Media
11. **Optimize Tags usageCount** - Consider background computation
12. **Document access control patterns** - Create developer guide

### Long Term (Backlog)

13. **Consider Payload CMS Globals** - For CompanyInfo (singleton pattern)
14. **Add field-level encryption** - For sensitive vendor data
15. **Implement soft delete** - For audit trail on deletions
16. **Add rate limiting** - Per-collection API rate limits

---

## Additional Observations

### Positive Patterns

1. **Consistent hook patterns** - Email notifications follow same structure
2. **Comprehensive tier system** - Well-designed field restrictions
3. **Good admin UX** - Field grouping, sidebar placement, conditions
4. **Audit trail** - Authentication events are logged
5. **Cache management** - BlogPosts properly invalidates cache

### Architecture Notes

- Vendor collection is large (~1950 lines) - consider if modular structure is needed
- 4-tier subscription model (free, tier1, tier2, tier3) is well-implemented
- Static-first architecture works well with Payload CMS
- Relationship between Users and Vendors is 1:1

---

## Files Reviewed

| Path | Lines | Purpose |
|------|-------|---------|
| `payload.config.ts` | 185 | Main configuration |
| `payload/collections/Users.ts` | 307 | User authentication |
| `payload/collections/Vendors.ts` | 1950 | Vendor profiles |
| `payload/collections/Products.ts` | 1489 | Product catalog |
| `payload/collections/Categories.ts` | 131 | Category taxonomy |
| `payload/collections/BlogPosts.ts` | 227 | Blog content |
| `payload/collections/TeamMembers.ts` | 105 | Team profiles |
| `payload/collections/Tags.ts` | 186 | Tagging system |
| `payload/collections/Yachts.ts` | 579 | Yacht profiles |
| `payload/collections/CompanyInfo.ts` | 200 | Platform info |
| `payload/collections/TierUpgradeRequests.ts` | 378 | Tier workflow |
| `payload/collections/ImportHistory.ts` | 192 | Import tracking |
| `payload/collections/AuditLogs.ts` | 103 | Audit trail |
| `payload/collections/Media.ts` | 95 | File uploads |
| `payload/collections/Notifications.ts` | 147 | User notifications |
| `payload/access/rbac.ts` | 170 | Access control |
| `payload/collections/vendors/hooks/index.ts` | 84 | Vendor hooks |
| `payload/collections/vendors/access/tier-access.ts` | 78 | Tier access |
| `payload/components/LogoutButton.tsx` | 58 | Admin component |

---

*Review completed: 2025-12-31*
