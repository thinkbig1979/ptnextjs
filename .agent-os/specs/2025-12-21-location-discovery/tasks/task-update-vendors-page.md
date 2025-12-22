# Task: Update Vendors Page to Pass Categories Data

## Metadata
- **Task ID**: update-vendors-page
- **Phase**: 4 - Integration
- **Agent**: frontend-react-specialist
- **Estimated Time**: 15-20 min
- **Dependencies**: enhance-vendors-client
- **Status**: completed

## Description

Ensure the Vendors page server component passes all necessary data (products and categories) to VendorsClient for category filtering.

## Specifics

### File to Modify
`app/(site)/vendors/page.tsx`

### Changes Required

1. **Check current data fetching**
Verify what data is already being passed to VendorsClient.

2. **Ensure products are fetched and passed**
```typescript
// In the server component
const products = await payloadCMSDataService.getAllProducts();
const categories = await payloadCMSDataService.getCategories();
```

3. **Pass to VendorsClient**
```tsx
<VendorsClient
  initialVendors={vendors}
  initialProducts={products}
  initialCategories={vendorCategories}
  // ... other props
/>
```

### Note
The VendorsClientProps already accepts `initialProducts?: Product[]`, so this may already be partially implemented. Need to verify and complete if missing.

## Acceptance Criteria

- [ ] Products data fetched in server component
- [ ] Products passed to VendorsClient
- [ ] Categories passed if separate from vendor categories
- [ ] No additional client-side fetching needed
- [ ] Page still uses ISR/static generation

## Testing Requirements

### Manual Testing
- Visit /vendors page
- Verify CategorySelect shows product categories
- Verify filtering works with passed data

## Related Files
- `app/(site)/components/vendors-client.tsx`
- `lib/payload-cms-data-service.ts`
