# Task: Integrate VendorsNearYou into Product Page

## Metadata
- **Task ID**: integrate-product-page
- **Phase**: 4 - Integration
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-40 min
- **Dependencies**: impl-vendors-near-you
- **Status**: pending

## Description

Add the VendorsNearYou component to the product detail page sidebar, positioned after the "About the Manufacturer" card.

## Specifics

### File to Modify
`app/(site)/products/[id]/page.tsx`

### Changes Required

1. **Add imports**
```typescript
import VendorsNearYou from "@/components/products/VendorsNearYou";
```

2. **Fetch additional data in server component**
```typescript
// After existing data fetching
const allVendors = await payloadCMSDataService.getAllVendors();
const allProducts = await payloadCMSDataService.getAllProducts();
const categories = await payloadCMSDataService.getCategories();
```

3. **Add VendorsNearYou to sidebar**
Position: After the "About the Manufacturer" section (line ~468), before the Tags section

```tsx
{/* Vendors Near You */}
<VendorsNearYou
  category={product.category}
  currentVendorId={product.partnerId}
  vendors={allVendors}
  products={allProducts}
  className="mt-6"
/>

<Separator />
```

### Integration Notes
- VendorsNearYou is a client component - will use "use client" directive
- Product page is already a server component with force-dynamic
- Data is passed as props to avoid client-side fetching
- Category comes from `product.category` field
- Exclude current vendor using `product.partnerId`

## Acceptance Criteria

- [ ] VendorsNearYou renders in sidebar
- [ ] Positioned after "About the Manufacturer" card
- [ ] Passes correct category from product
- [ ] Excludes current product's vendor from results
- [ ] All vendors and products data passed correctly
- [ ] No hydration errors
- [ ] Page still loads via ISR (revalidate: 300)
- [ ] Mobile responsive layout maintained

## Testing Requirements

### Manual Testing
- Visit product detail page
- Verify VendorsNearYou section appears
- Verify correct category filtering
- Verify vendor exclusion
- Test mobile layout

### E2E Test (`tests/e2e/vendors-near-you.spec.ts`)
- Test VendorsNearYou visibility on product page
- Test click-through to vendor page

## Related Files
- `components/products/VendorsNearYou.tsx`
- `lib/payload-cms-data-service.ts` - Data fetching methods
- Technical spec: `.agent-os/specs/2025-12-21-location-discovery/sub-specs/technical-spec.md`
