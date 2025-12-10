# Implementation Guide

## Development Approach

### TDD Enforcement Level: STANDARD

This feature has existing E2E tests that define the expected behavior. Implementation should follow the tests as the source of truth.

### Implementation Strategy

**Approach**: Backend-first, then frontend integration

1. Build API endpoints first (testable independently)
2. Create ProductService for business logic
3. Build UI components with mock data
4. Integrate UI with real API
5. Verify against E2E tests

---

## Architecture Overview

### Component Hierarchy

```
app/(site)/vendor/dashboard/products/page.tsx
└── ProductList (container)
    ├── ProductCard (presentational) × N
    │   ├── Switch (publish toggle)
    │   └── Button (edit, delete)
    ├── ProductForm (sheet/modal)
    │   └── Form fields
    └── ProductDeleteDialog
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Page                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ProductList                                            │ │
│  │  - useSWR('/api/portal/vendors/{id}/products')        │ │
│  │  - Local state: selectedProduct, isFormOpen, etc.     │ │
│  └───────────────────────────────────────────────────────┘ │
│           │                    │                   │        │
│           ▼                    ▼                   ▼        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ ProductCard │    │ ProductForm │    │ DeleteDialog    │ │
│  │ (display)   │    │ (create/edit│    │ (confirm)       │ │
│  │             │    │  submit)    │    │                 │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│           │                    │                   │        │
│           ▼                    ▼                   ▼        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    API Layer                            ││
│  │  POST/PUT/DELETE → ProductService → Payload CMS        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

### Phase 1: Backend (API + Service)

**Step 1.1**: Create ProductService
- File: `lib/services/ProductService.ts`
- Methods: getVendorProducts, createProduct, updateProduct, deleteProduct, togglePublish
- Follow patterns from `VendorProfileService.ts`

**Step 1.2**: Create Zod validation schemas
- File: `lib/validation/product-schema.ts`
- Schemas: CreateProductSchema, UpdateProductSchema
- Follow patterns from `vendor-update-schema.ts`

**Step 1.3**: Create GET/POST route
- File: `app/api/portal/vendors/[id]/products/route.ts`
- GET: List products for vendor
- POST: Create new product

**Step 1.4**: Create single product routes
- File: `app/api/portal/vendors/[id]/products/[productId]/route.ts`
- GET: Single product
- PUT: Update product
- DELETE: Delete product

**Step 1.5**: Create publish toggle route
- File: `app/api/portal/vendors/[id]/products/[productId]/publish/route.ts`
- PATCH: Toggle publish status

### Phase 2: Frontend (Components)

**Step 2.1**: Create ProductCard component
- File: `components/dashboard/ProductCard.tsx`
- Props: product, onEdit, onDelete, onPublishToggle
- Display: name, status badge, categories, actions

**Step 2.2**: Create ProductDeleteDialog component
- File: `components/dashboard/ProductDeleteDialog.tsx`
- Props: product, open, onConfirm, onCancel, isDeleting

**Step 2.3**: Create ProductForm component
- File: `components/dashboard/ProductForm.tsx`
- Props: product?, vendorId, onSuccess, onCancel, open
- Use react-hook-form + Zod for validation

**Step 2.4**: Create ProductList component
- File: `components/dashboard/ProductList.tsx`
- Props: vendorId
- SWR hook for data fetching
- State management for modals

**Step 2.5**: Create useVendorProducts hook
- File: `hooks/useVendorProducts.ts` or inline in ProductList
- SWR configuration with revalidation

### Phase 3: Integration

**Step 3.1**: Update dashboard page
- File: `app/(site)/vendor/dashboard/products/page.tsx`
- Import and use ProductList
- Pass vendorId from auth context

**Step 3.2**: Add Product TypeScript types
- File: `lib/types.ts` (if not present)
- Interface: Product, CreateProductRequest, UpdateProductRequest

### Phase 4: Testing & Verification

**Step 4.1**: Run E2E tests
```bash
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts
```

**Step 4.2**: Fix any selector mismatches
- Tests should pass without modification to test code
- Adjust component selectors if needed

---

## Development Workflow

### Before Starting Each Task

1. Read the relevant section of this guide
2. Review existing patterns in similar code
3. Check test expectations in E2E spec

### After Completing Each Task

1. Run TypeScript check: `npm run type-check`
2. Run linter: `npm run lint`
3. Test manually in browser
4. Run relevant E2E tests

### Code Review Checklist

- [ ] Follows existing API route patterns
- [ ] Uses established error response format
- [ ] Handles all error cases
- [ ] TypeScript types are complete
- [ ] No hardcoded values (use constants)
- [ ] Accessibility requirements met
- [ ] Responsive design implemented

---

## Key Implementation Notes

### API Route Patterns

Follow the pattern from `app/api/portal/vendors/[id]/route.ts`:

```typescript
// 1. Define interfaces for responses
interface SuccessResponse { success: true; data: {...} }
interface ErrorResponse { success: false; error: {...} }

// 2. Create authenticateUser helper (can reuse)
async function authenticateUser(request: NextRequest) {...}

// 3. Structure: try/catch with specific error handling
export async function GET(request, context) {
  try {
    const user = await authenticateUser(request);
    if (!user) return 401;

    // Business logic
    const result = await ProductService.getVendorProducts(...);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Error handling with specific codes
    return NextResponse.json({ success: false, error: {...} }, { status: 500 });
  }
}
```

### Rich Text Handling

Products use Lexical for description. When creating from form:

```typescript
// Convert plain text to simple Lexical format
function textToLexical(text: string): LexicalJSON {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text }],
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}
```

For v1, use Textarea and convert to Lexical on save. Rich text editor can be added later.

### Ownership Verification

Always verify vendor ownership before any operation:

```typescript
async function verifyProductOwnership(
  productId: string,
  userId: string,
  isAdmin: boolean
): Promise<Product> {
  const payload = await getPayload({ config });
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    depth: 1, // Include vendor relation
  });

  if (!product) throw new Error('Product not found');

  const vendorUserId = typeof product.vendor === 'object'
    ? product.vendor.user
    : null;

  if (!isAdmin && vendorUserId?.toString() !== userId) {
    throw new Error('Unauthorized: Product belongs to different vendor');
  }

  return product;
}
```

### SWR Data Fetching

```typescript
// hooks/useVendorProducts.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useVendorProducts(vendorId: string | null) {
  return useSWR(
    vendorId ? `/api/portal/vendors/${vendorId}/products` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
}
```

---

## Quality Assurance

### Manual Testing Checklist

Before running E2E tests, manually verify:

1. [ ] Free tier vendor sees upgrade message
2. [ ] Tier 2+ vendor sees products page
3. [ ] Empty state shows when no products
4. [ ] "Add New Product" opens form
5. [ ] Form validates required fields
6. [ ] Product appears after creation
7. [ ] Edit pre-populates form
8. [ ] Changes persist after edit
9. [ ] Delete shows confirmation
10. [ ] Product removed after confirm
11. [ ] Publish toggle changes status
12. [ ] Status badge updates

### Error Scenarios to Test

1. [ ] Network failure during API call
2. [ ] Validation error (empty name)
3. [ ] Unauthorized access attempt
4. [ ] Product not found (deleted elsewhere)
5. [ ] Concurrent edit conflict

---

## Troubleshooting

### Common Issues

**Issue**: Products not appearing after creation
- Check: API returns new product
- Check: mutate() called after success
- Check: ProductCard receives correct props

**Issue**: Form not pre-populating for edit
- Check: selectedProduct state set before opening
- Check: form.reset() called with product data
- Check: useEffect runs when product changes

**Issue**: Delete not working
- Check: productId passed correctly
- Check: DELETE endpoint returns 200
- Check: mutate() called after success

**Issue**: Publish toggle not updating
- Check: PATCH endpoint exists and works
- Check: optimistic update or refetch logic
- Check: Switch receives correct checked prop
