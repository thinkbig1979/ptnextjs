# UX/UI Specification

## Phase 1: Application Architecture

### 1.1 Feature Classification
```
Feature Type: FULL_STACK
Frontend Required: YES
Backend Required: YES
Justification: Product management requires new API endpoints and dashboard UI components
```

### 1.2 Route Structure
```
/vendor/dashboard/products    → ProductManagementPage - Manage vendor products

Integration: Existing dashboard navigation already has Products link
Parent Route: /vendor/dashboard
Guards: Authenticated vendor, Tier 2+ required
```

### 1.3 Global Layout Integration
```
Strategy: USE_EXISTING

Existing: app/(site)/vendor/dashboard/layout.tsx
No changes: Uses existing vendor dashboard layout with sidebar navigation
```

### 1.4 Navigation Structure
```
Primary Nav: Existing dashboard sidebar
Component: components/dashboard/DashboardSidebar.tsx (assumed)

Items Already Present:
- Products: /vendor/dashboard/products - Package icon - Products section

Active State: ROUTER_HOOK (usePathname)
Mobile: Existing responsive handling

Entry Points:
1. Dashboard sidebar "Products" link
2. Direct URL navigation
```

### 1.5 User Flow Architecture

#### Flow 1: View Products
```
1. Start: /vendor/dashboard/products
2. Trigger: Page load
3. Navigation: Already on products page
4. Page Loads: ProductList component with products from API
5. States:
   - Loading: Skeleton grid (3 cards)
   - Success: Grid of ProductCards
   - Empty: EmptyState with CTA
   - Error: Alert with retry option
```

#### Flow 2: Create Product
```
1. Start: /vendor/dashboard/products
2. Trigger: Click "Add New Product" (Button)
3. Navigation: None (Sheet opens over current page)
4. Sheet Loads: ProductForm with empty fields
5. User Interaction: Fill name, description, optionally categories
6. Validation: Client-side on blur, full validation on submit
7. Submit: POST /api/portal/vendors/[id]/products
8. Success:
   - Notification: Toast "Product created successfully"
   - Navigation: Close sheet
   - UI Update: New product appears in grid
9. Error:
   - Display: Inline field errors in form
   - Form State: PRESERVED
   - Recovery: CAN_RETRY
```

#### Flow 3: Edit Product
```
1. Start: /vendor/dashboard/products (ProductCard visible)
2. Trigger: Click "Edit" button on ProductCard
3. Navigation: None (Sheet opens)
4. Sheet Loads: ProductForm with product data pre-filled
5. User Interaction: Modify any fields
6. Validation: Same as create
7. Submit: PUT /api/portal/vendors/[id]/products/[productId]
8. Success:
   - Notification: Toast "Product updated successfully"
   - Navigation: Close sheet
   - UI Update: Product card reflects changes
9. Error:
   - Display: Inline field errors
   - Form State: PRESERVED
   - Recovery: CAN_RETRY
```

#### Flow 4: Delete Product
```
1. Start: /vendor/dashboard/products (ProductCard visible)
2. Trigger: Click "Delete" button (trash icon) on ProductCard
3. Navigation: None (Dialog opens)
4. Dialog Loads: ProductDeleteDialog with product name
5. User Interaction: Click "Delete" or "Cancel"
6. Submit: DELETE /api/portal/vendors/[id]/products/[productId]
7. Success:
   - Notification: Toast "Product deleted"
   - Navigation: Close dialog
   - UI Update: Product removed from grid
9. Error:
   - Display: Toast error
   - Form State: N/A
   - Recovery: Close dialog, retry
```

#### Flow 5: Toggle Publish
```
1. Start: /vendor/dashboard/products (ProductCard visible)
2. Trigger: Toggle Switch on ProductCard
3. Navigation: None
4. Submit: PATCH /api/portal/vendors/[id]/products/[productId]/publish
5. Success:
   - Notification: Toast "Product published/unpublished"
   - UI Update: Badge changes from Draft to Published (or vice versa)
6. Error:
   - Display: Toast error
   - UI Update: Switch reverts to previous state
```

---

## Phase 2: Layout Systems

### 2.1 Container Specifications

**Page Container**:
```tsx
<div className="container max-w-6xl py-8">
```

| Breakpoint | H Padding | V Padding | Max Width | Tailwind |
|------------|-----------|-----------|-----------|----------|
| Mobile (<768) | 16px | 32px | 100% | px-4 py-8 |
| Tablet (768-1023) | 24px | 32px | 100% | md:px-6 py-8 |
| Desktop (≥1024) | 32px | 32px | 1152px | lg:px-8 py-8 max-w-6xl |

### 2.2 Spacing System

| Context | Desktop | Tablet | Mobile | Tailwind | Use Case |
|---------|---------|--------|--------|----------|----------|
| Page header margin | 32px | 32px | 24px | mb-8 | Below page title |
| Section spacing | 24px | 24px | 16px | space-y-6 | Between sections |
| Card grid gaps | 24px | 16px | 16px | gap-6 md:gap-4 | Between product cards |
| Card padding | 24px | 16px | 16px | p-6 md:p-4 | Inside product card |
| Form field spacing | 24px | 24px | 20px | space-y-6 | Between form fields |
| Button group gap | 12px | 12px | 8px | gap-3 | Between action buttons |

### 2.3 Typography System

**H1 - Page Title**:
```tsx
<h1 className="text-3xl font-bold mb-2">Product Management</h1>
```
- Size: 30px (1.875rem)
- Weight: 700 (bold)
- Line Height: 1.2
- Use: Page header
- Spacing After: 8px (`mb-2`)

**H2 - Card Title / Form Section**:
```tsx
<h2 className="text-xl font-semibold">Your Products</h2>
```
- Size: 20px (1.25rem)
- Weight: 600 (semibold)
- Use: Card headers, form section titles
- Spacing After: 8px (`mb-2`)

**Body - Default**:
```tsx
<p className="text-muted-foreground">Description text...</p>
```
- Size: 14px (0.875rem)
- Line Height: 1.5
- Color: muted-foreground
- Use: Descriptions, helper text

**Body - Small**:
```tsx
<span className="text-sm text-muted-foreground">Metadata</span>
```
- Size: 12px (0.75rem) or 14px
- Use: Timestamps, status badges, metadata

### 2.4 Page Layout Pattern

**ProductManagementPage Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Header                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ H1: Product Management                              │ │
│ │ Body: Manage your product listings...               │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Actions                                                  │
│ ┌───────────────────┐                                   │
│ │ + Add New Product │                                   │
│ └───────────────────┘                                   │
├─────────────────────────────────────────────────────────┤
│ Product Grid                                            │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐              │
│ │ Card 1    │ │ Card 2    │ │ Card 3    │              │
│ │           │ │           │ │           │              │
│ │ [Actions] │ │ [Actions] │ │ [Actions] │              │
│ └───────────┘ └───────────┘ └───────────┘              │
│ ┌───────────┐ ┌───────────┐                            │
│ │ Card 4    │ │ Card 5    │                            │
│ └───────────┘ └───────────┘                            │
└─────────────────────────────────────────────────────────┘
```

**Responsive Grid**:
- Desktop (≥1024): 3 columns - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Tablet (768-1023): 2 columns
- Mobile (<768): 1 column (stack)

---

## Phase 3: Component Patterns

### 3.1 Component Library Strategy

**Library**: shadcn/ui (already installed)

| Component | Import | Purpose | Variants | Props |
|-----------|--------|---------|----------|-------|
| Card | `@/components/ui/card` | Product container | - | className |
| Button | `@/components/ui/button` | Actions | default, destructive, outline, ghost | variant, size |
| Badge | `@/components/ui/badge` | Status display | default, secondary, outline, destructive | variant |
| Switch | `@/components/ui/switch` | Publish toggle | - | checked, onCheckedChange |
| Dialog | `@/components/ui/dialog` | Delete confirmation | - | open, onOpenChange |
| Sheet | `@/components/ui/sheet` | Product form | - | open, onOpenChange, side |
| Form | `@/components/ui/form` | Form structure | - | form (react-hook-form) |
| Input | `@/components/ui/input` | Text fields | - | type, placeholder |
| Textarea | `@/components/ui/textarea` | Multi-line text | - | placeholder, rows |
| Skeleton | `@/components/ui/skeleton` | Loading state | - | className |

### 3.2 Component Specifications

#### ProductCard

**Purpose**: Display individual product with actions
**File**: `components/dashboard/ProductCard.tsx`

**Props**:
```typescript
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPublishToggle: (product: Product, published: boolean) => void;
}
```

**Structure & Spacing**:
```tsx
<Card className="overflow-hidden hover:shadow-md transition-shadow">
  <CardHeader className="pb-2">
    <div className="flex items-start justify-between">
      <CardTitle className="text-lg font-semibold line-clamp-1">
        {product.name}
      </CardTitle>
      <Badge variant={product.published ? "default" : "secondary"}>
        {product.published ? "Published" : "Draft"}
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="pb-4">
    <p className="text-sm text-muted-foreground line-clamp-2">
      {product.shortDescription || "No description"}
    </p>
    {product.categories?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {product.categories.slice(0, 3).map(cat => (
          <Badge key={cat.id} variant="outline" className="text-xs">
            {cat.name}
          </Badge>
        ))}
      </div>
    )}
  </CardContent>
  <CardFooter className="pt-0 flex items-center justify-between border-t pt-4">
    <div className="flex items-center gap-2">
      <Switch
        checked={product.published}
        onCheckedChange={(checked) => onPublishToggle(product, checked)}
        aria-label="Publish product"
      />
      <span className="text-xs text-muted-foreground">
        {product.published ? "Published" : "Draft"}
      </span>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
        Edit
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onDelete(product)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  </CardFooter>
</Card>
```

**State Variations**:
- Default: Base card styling
- Hover: `hover:shadow-md transition-shadow`
- Loading: Skeleton placeholder for entire card
- Publishing: Switch disabled during API call

**Responsive**:
- All breakpoints: Full-width within grid cell
- Content adapts via line-clamp

**Accessibility**:
- Switch has aria-label
- Buttons have visible text or aria-label
- Focusable elements have visible focus rings

---

#### ProductForm

**Purpose**: Create/edit product form in Sheet
**File**: `components/dashboard/ProductForm.tsx`

**Props**:
```typescript
interface ProductFormProps {
  product?: Product;  // undefined = create, defined = edit
  vendorId: string;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
  open: boolean;
}
```

**Structure**:
```tsx
<Sheet open={open} onOpenChange={(open) => !open && onCancel()}>
  <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
    <SheetHeader className="mb-6">
      <SheetTitle>{product ? "Edit Product" : "Add New Product"}</SheetTitle>
      <SheetDescription>
        {product
          ? "Update your product details below."
          : "Fill in the details to create a new product."}
      </SheetDescription>
    </SheetHeader>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Advanced Navigation System" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Short Description */}
        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Input placeholder="Brief summary for listings" {...field} />
              </FormControl>
              <FormDescription>Max 500 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categories - Future: Multi-select combobox */}
        {/* Simplified for v1 */}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  </SheetContent>
</Sheet>
```

**State Variations**:
- Create Mode: Empty fields, "Create Product" button
- Edit Mode: Pre-filled fields, "Save Changes" button
- Submitting: Button disabled with spinner
- Error: Field-level error messages

---

#### ProductDeleteDialog

**Purpose**: Confirm product deletion
**File**: `components/dashboard/ProductDeleteDialog.tsx`

**Props**:
```typescript
interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}
```

**Structure**:
```tsx
<Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Product</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete "{product?.name}"? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="gap-2 sm:gap-0">
      <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### ProductList

**Purpose**: Container component that fetches and displays products
**File**: `components/dashboard/ProductList.tsx`

**Props**:
```typescript
interface ProductListProps {
  vendorId: string;
}
```

**Structure**:
```tsx
export function ProductList({ vendorId }: ProductListProps) {
  const { data, error, isLoading, mutate } = useVendorProducts(vendorId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load products. <Button variant="link" onClick={() => mutate()}>Try again</Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!data?.products?.length) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">No products yet</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Product
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Products grid
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={(p) => { setSelectedProduct(p); setIsFormOpen(true); }}
            onDelete={(p) => { setSelectedProduct(p); setIsDeleteOpen(true); }}
            onPublishToggle={handlePublishToggle}
          />
        ))}
      </div>

      <ProductForm
        product={selectedProduct}
        vendorId={vendorId}
        open={isFormOpen}
        onSuccess={() => { setIsFormOpen(false); setSelectedProduct(null); mutate(); }}
        onCancel={() => { setIsFormOpen(false); setSelectedProduct(null); }}
      />

      <ProductDeleteDialog
        product={selectedProduct}
        open={isDeleteOpen}
        onConfirm={handleDelete}
        onCancel={() => { setIsDeleteOpen(false); setSelectedProduct(null); }}
        isDeleting={isDeleting}
      />
    </>
  );
}
```

---

## Phase 4: Interaction Patterns

### 4.1 Interactive States

**Hover**:
- Cards: `hover:shadow-md transition-shadow duration-200`
- Buttons: `hover:bg-[color]/90` (handled by shadcn)
- Links: `hover:underline`

**Active**:
- Buttons: `active:scale-95` (subtle press effect)

**Focus** (WCAG 2.1 AA):
- All interactive: `focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Tab order: Natural document order

**Loading**:
- Buttons: Disabled + Loader2 spinner
- Cards: Skeleton placeholders
- Page: Grid of 3 skeleton cards

**Error**:
- Form fields: Red border, error message below
- Toast: Red background, error icon

**Empty**:
- Products: Package icon, "No products yet" message, CTA button

### 4.2 Animations

**Sheet Open/Close**:
- Slide in from right
- Duration: 300ms
- Easing: ease-out

**Dialog**:
- Fade + scale
- Duration: 200ms

**Toast**:
- Slide from top-right
- Auto-dismiss: 5 seconds

**Card Hover**:
- Shadow transition: 200ms

**Switch Toggle**:
- Background color transition: 150ms

### 4.3 Form Validation

**Approach**: React Hook Form + Zod

**Timing**:
- On blur: Validate individual field
- On submit: Validate entire form
- On change (after first submit): Re-validate

**Error Display**:
- Inline: `<FormMessage>` below each field
- Field: Red border on invalid fields

**Success**:
- Toast: "Product created/updated successfully"
- Form closes automatically
- List updates with new/changed product

---

## Validation Gates

✅ **Phase 1**:
- [x] Route explicit: `/vendor/dashboard/products`
- [x] Navigation fully specified (existing sidebar)
- [x] Layout integration: USE_EXISTING
- [x] User entry points identified
- [x] User flows step-by-step

✅ **Phase 2**:
- [x] Container specs with responsive
- [x] Spacing usage matrix with Tailwind
- [x] Typography with hierarchy rules
- [x] Page layout with component hierarchy

✅ **Phase 3**:
- [x] Component library strategy (shadcn/ui)
- [x] All components: markup, spacing, states
- [x] Accessibility for each
- [x] Integration examples

✅ **Phase 4**:
- [x] Interactive states defined
- [x] Animations/transitions specified
- [x] Form validation approach documented

✅ **Code Readiness**:
- [x] No ambiguity in specifications
- [x] No missing architectural decisions
- [x] Complete code examples with Tailwind
- [x] Developer can implement without questions
