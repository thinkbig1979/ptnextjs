# Quality Gates

## Overview

Quality gates that must pass before the feature is considered complete.

---

## Gate 1: Code Quality

### TypeScript Compliance
- [ ] `npm run type-check` passes with no errors
- [ ] All new code has proper TypeScript types
- [ ] No `any` types used (except where absolutely necessary)
- [ ] Interfaces defined for all API request/response types

### Linting
- [ ] `npm run lint` passes with no errors
- [ ] No eslint-disable comments without justification
- [ ] Consistent code formatting

### Code Standards
- [ ] Follows existing patterns from `app/api/portal/vendors/[id]/route.ts`
- [ ] Service layer for business logic
- [ ] Zod schemas for validation
- [ ] Proper error handling with specific error codes

---

## Gate 2: Functionality

### API Endpoints
- [ ] GET /api/portal/vendors/[id]/products returns vendor's products
- [ ] POST /api/portal/vendors/[id]/products creates product
- [ ] PUT /api/portal/vendors/[id]/products/[productId] updates product
- [ ] DELETE /api/portal/vendors/[id]/products/[productId] deletes product
- [ ] PATCH /api/portal/vendors/[id]/products/[productId]/publish toggles status

### Access Control
- [ ] Free tier vendors cannot access products page
- [ ] Tier 1 vendors cannot access products page
- [ ] Tier 2+ vendors can access products page
- [ ] Vendors cannot see other vendors' products
- [ ] Vendors cannot modify other vendors' products
- [ ] Admin can access any vendor's products

### UI Components
- [ ] ProductList displays products from API
- [ ] ProductCard shows name, status, actions
- [ ] ProductForm creates new products
- [ ] ProductForm edits existing products
- [ ] ProductDeleteDialog confirms deletion
- [ ] Publish toggle changes product status

---

## Gate 3: Testing

### E2E Tests (Required: 6/6 pass)
- [ ] Test 9.1: Access product management (tier 2+ only) - PASS
- [ ] Test 9.2: View product list for vendor - PASS
- [ ] Test 9.3: Add new product with all fields - PASS
- [ ] Test 9.4: Edit existing product details - PASS
- [ ] Test 9.5: Delete product with confirmation - PASS
- [ ] Test 9.6: Publish/unpublish product toggle - PASS

### Unit Tests (Target: 80%)
- [ ] ProductService methods tested
- [ ] Validation schemas tested
- [ ] Error handling tested

### Manual Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested on mobile viewport
- [ ] Tested error scenarios

---

## Gate 4: Security

### Authentication
- [ ] All endpoints require authentication
- [ ] Invalid tokens return 401
- [ ] Missing tokens return 401

### Authorization
- [ ] Ownership verified before update
- [ ] Ownership verified before delete
- [ ] Tier checked before access
- [ ] Admin bypass works correctly

### Input Validation
- [ ] All inputs validated with Zod
- [ ] XSS prevented (React escaping)
- [ ] SQL injection prevented (Payload ORM)
- [ ] No sensitive data in error messages

---

## Gate 5: Performance

### Response Times
- [ ] GET products list < 500ms
- [ ] Single product operations < 300ms
- [ ] UI feels responsive (no janky updates)

### Caching
- [ ] SWR caching implemented
- [ ] Proper revalidation after mutations

---

## Gate 6: Accessibility

### WCAG 2.1 AA
- [ ] All interactive elements focusable
- [ ] Focus visible on all elements
- [ ] Form inputs have labels
- [ ] Error messages associated with fields
- [ ] Color not only indicator of status
- [ ] Switch has aria-label

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Enter submits forms
- [ ] Escape closes dialogs/sheets
- [ ] All actions available via keyboard

---

## Gate 7: Documentation

### Code Comments
- [ ] Complex logic commented
- [ ] API route purposes documented
- [ ] Service methods documented

### Type Documentation
- [ ] Interface properties have JSDoc (if complex)
- [ ] Public APIs documented

---

## Verification Checklist

Before marking feature complete:

```bash
# 1. TypeScript check
npm run type-check

# 2. Linting
npm run lint

# 3. Build
npm run build

# 4. E2E Tests
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts

# 5. Manual verification
# - Log in as Tier 2 vendor
# - Navigate to Products
# - Create, edit, delete, publish products
# - Verify all operations work
```

---

## Definition of Done

This feature is **DONE** when:

1. ✅ All 6 quality gates pass
2. ✅ All 6 E2E tests pass
3. ✅ Code reviewed and approved
4. ✅ No P1/P2 bugs open
5. ✅ Deployed to staging environment
6. ✅ Smoke tested in staging

---

## Escalation

If a gate cannot be passed:

1. **Blocking issue**: Create issue in tracker with `priority: high`
2. **Workaround available**: Document workaround, create follow-up issue
3. **Scope change needed**: Discuss with stakeholders before proceeding
