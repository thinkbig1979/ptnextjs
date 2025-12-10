# Technical Specification

## Feature Classification

**Feature Type**: FULL_STACK
**Frontend Required**: YES
**Backend Required**: YES
**Justification**: Requires new API endpoints for CRUD operations and new UI components for dashboard product management interface.

---

## Backend Implementation

### API Endpoints

#### **GET /api/portal/vendors/[id]/products**

**Purpose**: Retrieve all products belonging to the authenticated vendor
**Authentication**: Required (JWT token)
**Authorization**: Vendor can only access their own products; Admin can access any vendor's products

**Request**:
```typescript
// Query Parameters
interface QueryParams {
  published?: 'true' | 'false';  // Optional filter by publish status
  limit?: string;                 // Optional pagination limit
  page?: string;                  // Optional pagination page
}
```

**Response**:
```typescript
interface GetProductsSuccessResponse {
  success: true;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: LexicalJSON;
  shortDescription?: string;
  categories?: Category[];
  images?: ProductImage[];
  specifications?: Specification[];
  published: boolean;
  vendor: string | Vendor;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
  };
}
```

**Status Codes**:
- 200: Success with products array
- 401: Unauthorized (no valid token)
- 403: Forbidden (not vendor's products)
- 500: Server error

---

#### **POST /api/portal/vendors/[id]/products**

**Purpose**: Create a new product for the vendor
**Authentication**: Required
**Authorization**: Vendor can only create products for their own profile; Admin can create for any vendor

**Request**:
```typescript
interface CreateProductRequest {
  name: string;                    // Required, max 255 chars
  description: string | LexicalJSON; // Required, converted to Lexical if string
  shortDescription?: string;       // Optional, max 500 chars
  categories?: string[];           // Optional, array of category IDs
  images?: ProductImage[];         // Optional
  specifications?: Specification[];// Optional
  published?: boolean;             // Optional, defaults to false
}

interface ProductImage {
  url: string;
  altText?: string;
  isMain?: boolean;
  caption?: string;
}

interface Specification {
  label: string;
  value: string;
}
```

**Response**:
```typescript
interface CreateProductSuccessResponse {
  success: true;
  data: {
    product: Product;
    message: string;
  };
}
```

**Status Codes**:
- 201: Created successfully
- 400: Validation error (missing/invalid fields)
- 401: Unauthorized
- 403: Forbidden (tier restriction or ownership)
- 500: Server error

**Validation Rules**:
- `name`: Required, 1-255 characters
- `description`: Required, will be converted to Lexical JSON format
- `shortDescription`: Max 500 characters
- `categories`: Must be valid category IDs
- `images[].url`: Required if images array provided, max 500 chars
- `specifications[].label`: Required if spec provided, max 100 chars
- `specifications[].value`: Required if spec provided, max 500 chars

---

#### **GET /api/portal/vendors/[id]/products/[productId]**

**Purpose**: Retrieve a single product by ID
**Authentication**: Required
**Authorization**: Vendor can only access their own products

**Response**:
```typescript
interface GetProductSuccessResponse {
  success: true;
  data: Product;
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 403: Forbidden
- 404: Product not found
- 500: Server error

---

#### **PUT /api/portal/vendors/[id]/products/[productId]**

**Purpose**: Update an existing product
**Authentication**: Required
**Authorization**: Vendor can only update their own products

**Request**:
```typescript
interface UpdateProductRequest {
  name?: string;
  description?: string | LexicalJSON;
  shortDescription?: string;
  categories?: string[];
  images?: ProductImage[];
  specifications?: Specification[];
  published?: boolean;
}
```

**Response**:
```typescript
interface UpdateProductSuccessResponse {
  success: true;
  data: {
    product: Product;
    message: string;
  };
}
```

**Status Codes**:
- 200: Updated successfully
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Product not found
- 500: Server error

---

#### **DELETE /api/portal/vendors/[id]/products/[productId]**

**Purpose**: Delete a product permanently
**Authentication**: Required
**Authorization**: Vendor can only delete their own products

**Response**:
```typescript
interface DeleteProductSuccessResponse {
  success: true;
  data: {
    message: string;
  };
}
```

**Status Codes**:
- 200: Deleted successfully
- 401: Unauthorized
- 403: Forbidden
- 404: Product not found
- 500: Server error

---

#### **PATCH /api/portal/vendors/[id]/products/[productId]/publish**

**Purpose**: Toggle product publish status
**Authentication**: Required
**Authorization**: Vendor can only toggle their own products

**Request**:
```typescript
interface TogglePublishRequest {
  published: boolean;
}
```

**Response**:
```typescript
interface TogglePublishSuccessResponse {
  success: true;
  data: {
    product: Product;
    message: string;
  };
}
```

**Status Codes**:
- 200: Status changed
- 400: Invalid request body
- 401: Unauthorized
- 403: Forbidden
- 404: Product not found
- 500: Server error

---

### Business Logic

**Core Rules**:
1. Only Tier 2+ vendors can create/manage products (enforced by existing Payload hook)
2. Vendors can only CRUD products where `product.vendor.user === currentUser.id`
3. Admins bypass all ownership restrictions
4. Slug is auto-generated from product name if not provided
5. Products default to `published: false` (draft state)
6. Description must be stored in Lexical JSON format

**Validation**:
- Server-side validation using Zod schemas
- Tier validation performed before product creation
- Ownership validation on all CRUD operations
- Reference integrity for categories relationship

**Service Layer**:
- **ProductService** (`lib/services/ProductService.ts`):
  - `getVendorProducts(vendorId, userId, isAdmin, filters)`: List products
  - `getProductById(productId, userId, isAdmin)`: Single product
  - `createProduct(vendorId, data, userId, isAdmin)`: Create product
  - `updateProduct(productId, data, userId, isAdmin)`: Update product
  - `deleteProduct(productId, userId, isAdmin)`: Delete product
  - `togglePublish(productId, published, userId, isAdmin)`: Toggle status

---

### Database Schema

**Existing Table**: `products` (Payload CMS collection)

Already defined in `payload/collections/Products.ts` with:
- `vendor` (relationship to vendors, required)
- `name` (text, required, max 255)
- `slug` (text, required, unique, auto-generated)
- `description` (richText/Lexical, required)
- `shortDescription` (textarea, max 500)
- `images` (array of url, altText, isMain, caption)
- `categories` (relationship to categories, hasMany)
- `specifications` (array of label/value pairs)
- `published` (checkbox, default false)
- `createdAt`, `updatedAt` (auto-managed)

**No schema changes required** - existing collection matches requirements.

---

## Frontend Implementation

### UI Components

#### **ProductList**
- Type: Container Component
- Purpose: Fetches and displays vendor's product list
- File: `components/dashboard/ProductList.tsx`
- State: API data via SWR or React Query
- Props:
  ```typescript
  interface ProductListProps {
    vendorId: string;
  }
  ```

#### **ProductCard**
- Type: Presentational Component
- Purpose: Individual product display with action buttons
- File: `components/dashboard/ProductCard.tsx`
- Props:
  ```typescript
  interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onPublishToggle: (product: Product, published: boolean) => void;
  }
  ```

#### **ProductForm**
- Type: Form Component (Modal or Sheet)
- Purpose: Create/edit product with validation
- File: `components/dashboard/ProductForm.tsx`
- Props:
  ```typescript
  interface ProductFormProps {
    product?: Product;  // Undefined for create, defined for edit
    vendorId: string;
    onSuccess: (product: Product) => void;
    onCancel: () => void;
    open: boolean;
  }
  ```

#### **ProductDeleteDialog**
- Type: Modal Component
- Purpose: Confirm product deletion
- File: `components/dashboard/ProductDeleteDialog.tsx`
- Props:
  ```typescript
  interface ProductDeleteDialogProps {
    product: Product | null;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
  }
  ```

---

### Frontend State Management

**Pattern**: React state + SWR for data fetching

**Local State** (component-level):
- `selectedProduct`: Product being edited/deleted
- `isFormOpen`: Boolean for form modal visibility
- `isDeleteDialogOpen`: Boolean for delete confirmation
- `isSubmitting`: Loading state during API calls

**Data Fetching** (SWR):
```typescript
// Hook: useVendorProducts
const { data, error, mutate } = useSWR<GetProductsResponse>(
  vendorId ? `/api/portal/vendors/${vendorId}/products` : null,
  fetcher
);
```

---

### Frontend Routing

**Routes**:
- `/vendor/dashboard/products` - Product management page (exists, needs update)

**Guards**:
- Requires authenticated vendor (existing)
- Requires Tier 2+ (existing check in page)

---

### UI Specifications

**Design**:
- Responsive: Mobile-first grid layout
- Accessibility: WCAG 2.1 AA compliance
- Loading: Skeleton cards during data fetch
- Error: Toast notifications + inline error display
- Empty: Illustrated empty state with CTA

**Form Validations**:
- `name`: Required, shows error if empty
- `description`: Required, shows error if empty
- `categories`: Optional, multi-select combobox

---

### Component Architecture

**Strategy**: shadcn/ui components

**Library**: shadcn/ui (already installed)

**Components to Use**:
- `Card, CardHeader, CardTitle, CardContent, CardFooter` - Product cards
- `Button` - Actions
- `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter` - Delete confirmation
- `Sheet, SheetContent, SheetHeader, SheetTitle` - Product form (slide-out)
- `Form, FormField, FormItem, FormLabel, FormControl, FormMessage` - Form structure
- `Input` - Text inputs
- `Textarea` - Short description
- `Switch` - Publish toggle
- `Badge` - Status badges
- `Select, SelectTrigger, SelectContent, SelectItem` - Category select
- `Skeleton` - Loading states
- `Alert, AlertDescription` - Tier restriction message

---

### Page Layout Architecture

**Page**: `/vendor/dashboard/products`

**Structure**:
```
┌─────────────────────────────────────┐
│ Header: "Product Management"        │
│ Description + "Add New Product" btn │
├─────────────────────────────────────┤
│ Product Grid/List                   │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │Card 1│ │Card 2│ │Card 3│        │
│ └──────┘ └──────┘ └──────┘        │
│ ┌──────┐ ┌──────┐                  │
│ │Card 4│ │Card 5│ ...             │
│ └──────┘ └──────┘                  │
└─────────────────────────────────────┘
```

**Responsive**:
- Desktop (≥1024): 3-column grid
- Tablet (768-1023): 2-column grid
- Mobile (<768): 1-column stack

---

### User Flow & Interaction

#### Flow 1: View Products
1. **Start**: Dashboard products page
2. **Trigger**: Page load
3. **Action**: SWR fetches `GET /api/portal/vendors/{id}/products`
4. **Loads**: ProductList renders with ProductCards
5. **States**: Loading (skeleton) → Success (grid) | Error (alert)

#### Flow 2: Create Product
1. **Start**: Products page
2. **Trigger**: Click "Add New Product" button
3. **Action**: Opens ProductForm Sheet
4. **Loads**: Empty form with validation
5. **Interaction**: Fill name, description, optionally categories
6. **Submit**: POST to API
7. **Success**: Toast + close sheet + revalidate list
8. **Error**: Inline form errors

#### Flow 3: Edit Product
1. **Start**: Products page with ProductCard visible
2. **Trigger**: Click "Edit" button on card
3. **Action**: Opens ProductForm Sheet with product data
4. **Loads**: Pre-populated form
5. **Interaction**: Modify fields
6. **Submit**: PUT to API
7. **Success**: Toast + close sheet + revalidate list
8. **Error**: Inline form errors

#### Flow 4: Delete Product
1. **Start**: Products page with ProductCard
2. **Trigger**: Click "Delete" button on card
3. **Action**: Opens ProductDeleteDialog
4. **Loads**: Confirmation message with product name
5. **Interaction**: Click "Delete" or "Cancel"
6. **Submit**: DELETE to API
7. **Success**: Toast + close dialog + revalidate list
8. **Error**: Toast with error message

#### Flow 5: Toggle Publish
1. **Start**: Products page with ProductCard
2. **Trigger**: Toggle publish Switch
3. **Action**: PATCH to publish endpoint
4. **Success**: Badge updates, toast notification
5. **Error**: Revert switch, show toast error

---

## Frontend-Backend Integration

### API Contract

**Owner**: Backend provides, Frontend consumes

**Type Sharing**: TypeScript interfaces in `lib/types.ts`

**Data Flow**:
1. User action in Frontend →
2. API call via fetch/SWR →
3. Backend validates, processes, responds →
4. Frontend updates UI (optimistic or after response)

### Integration Points

**Frontend Calls Backend For**:
- Page load → GET products list
- Create form submit → POST new product
- Edit form submit → PUT update product
- Delete confirm → DELETE product
- Publish toggle → PATCH publish status

**Error Handling**:
- Network: Toast "Unable to connect. Please try again."
- 400 Validation: Show field-level errors in form
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Toast "You don't have permission"
- 404 Not Found: Toast "Product not found"
- 500 Server: Toast "Something went wrong"

---

## Implementation Patterns

### Design Patterns

**Primary**:
- **Service Pattern**: ProductService encapsulates business logic
- **Repository Pattern**: Payload CMS handles data access
- **Container/Presentational**: ProductList (container) vs ProductCard (presentational)

### Code Organization

```
app/
├── api/portal/vendors/[id]/products/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [productId]/
│       ├── route.ts                # GET, PUT, DELETE
│       └── publish/route.ts        # PATCH (toggle publish)
├── (site)/vendor/dashboard/products/
│   └── page.tsx                    # Updated dashboard page

components/dashboard/
├── ProductList.tsx
├── ProductCard.tsx
├── ProductForm.tsx
└── ProductDeleteDialog.tsx

lib/
├── services/ProductService.ts      # Business logic
├── validation/product-schema.ts    # Zod schemas
└── types.ts                        # Add Product interfaces if missing
```

### Naming Conventions

- Components: PascalCase (`ProductCard.tsx`)
- Services: PascalCase (`ProductService.ts`)
- API routes: kebab-case directories (`products/route.ts`)
- Types: PascalCase interfaces (`Product`, `CreateProductRequest`)
- Constants: UPPER_SNAKE_CASE

---

## Security Requirements

### Authentication
- **Method**: JWT tokens via cookies or Authorization header
- **Token Validation**: `authService.validateToken()` or `getUserFromRequest()`
- **Session Handling**: Existing auth context

### Authorization
- **Model**: Role-based (vendor, admin) + ownership check
- **Permission Validation**: Check `vendor.user === currentUser.id`
- **Access Control**: Payload CMS access control + API-level checks

### Data Protection
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Prevented by Payload CMS ORM
- **XSS**: React escapes output by default; sanitize rich text
- **CSRF**: Existing protection in Next.js

---

## Performance Criteria

### Response Time
- **Target**: <500ms for list, <300ms for single product
- **Measurement**: API response time
- **Optimization**: Use Payload `depth: 0` for list, selective field queries

### Caching
- **Client**: SWR with stale-while-revalidate
- **Server**: No additional caching (rely on Payload)
- **Invalidation**: Revalidate on mutations

---

## Quality Validation

### Technical Depth
- Implementation follows existing `app/api/portal/vendors/[id]/route.ts` patterns
- Uses established auth helpers and error response formats
- Leverages existing Payload CMS Products collection

### Integration
- Compatible with existing vendor dashboard layout
- Uses same shadcn/ui components as rest of dashboard
- Follows established API response format

### Testing
- E2E tests already exist and define expected behavior
- Implementation must pass tests without modifying them (except selector fixes)
