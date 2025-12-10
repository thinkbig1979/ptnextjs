# Spec Requirements Document

> Spec: Vendor Product Management
> Created: 2025-12-09

## Overview

Implement complete CRUD functionality for vendor product management, allowing Tier 2+ vendors to create, view, edit, delete, and publish/unpublish their product listings through the vendor dashboard.

## User Stories

### Product List Viewing
As a **Tier 2+ vendor**, I want to **view all my products on the dashboard**, so that **I can manage my product catalog and see their publication status**.

**Workflow:**
1. Vendor logs into their dashboard
2. Navigates to Products section via dashboard navigation
3. Sees a list/grid of all their products
4. Each product shows: name, status (published/draft), and action buttons
5. Empty state shows when no products exist with CTA to add first product

### Product Creation
As a **Tier 2+ vendor**, I want to **add new products with details**, so that **I can showcase my offerings to potential customers**.

**Workflow:**
1. Vendor clicks "Add New Product" button
2. Product form modal/page opens with fields:
   - Name (required)
   - Description (rich text, required)
   - Short Description (optional)
   - Categories (multi-select, optional)
   - Model/SKU (optional)
   - Price (optional)
   - Images (optional)
   - Specifications (key-value pairs, optional)
3. Vendor fills required fields and submits
4. Product is created in draft (unpublished) state
5. Vendor sees success message and product appears in list

### Product Editing
As a **Tier 2+ vendor**, I want to **edit my existing products**, so that **I can keep product information accurate and up-to-date**.

**Workflow:**
1. Vendor clicks "Edit" button on a product card
2. Edit form opens pre-populated with current values
3. Vendor modifies fields as needed
4. Saves changes
5. Product list updates with new information

### Product Deletion
As a **Tier 2+ vendor**, I want to **delete products I no longer offer**, so that **my catalog stays current and relevant**.

**Workflow:**
1. Vendor clicks "Delete" button on a product card
2. Confirmation dialog appears warning about permanent deletion
3. Vendor confirms deletion
4. Product is removed from database
5. Product disappears from list

### Product Publishing
As a **Tier 2+ vendor**, I want to **publish/unpublish my products**, so that **I can control which products are visible to the public**.

**Workflow:**
1. Vendor sees current publication status on each product (Published/Draft badge)
2. Vendor toggles publish switch or clicks publish/unpublish button
3. Status updates immediately
4. Public-facing product pages reflect the change

## Spec Scope

1. **API Endpoints** - Complete REST API for product CRUD operations:
   - `GET /api/portal/vendors/[id]/products` - List vendor's products
   - `POST /api/portal/vendors/[id]/products` - Create new product
   - `PUT /api/portal/vendors/[id]/products/[productId]` - Update product
   - `DELETE /api/portal/vendors/[id]/products/[productId]` - Delete product
   - `PATCH /api/portal/vendors/[id]/products/[productId]/publish` - Toggle publish status

2. **Dashboard UI Components** - Product management interface:
   - ProductList component (grid/list view of products)
   - ProductCard component (individual product display with actions)
   - ProductForm component (create/edit form with validation)
   - ProductDeleteDialog component (confirmation modal)
   - PublishToggle component (switch for publication status)

3. **Data Integration** - Connect to existing Payload CMS Products collection:
   - Leverage existing schema and access control
   - Use existing tier validation hooks
   - Maintain vendor ownership relationships

4. **Access Control** - Enforce tier-based restrictions:
   - Only Tier 2+ vendors can access product management
   - Vendors can only CRUD their own products
   - Admin override for all operations

## Out of Scope

- **Product image upload** - Use URL-based images initially (file upload can be added later)
- **Bulk product operations** - No bulk delete/publish in v1
- **Product import/export** - Excel/CSV functionality not included
- **Product variants** - No size/color variations in v1
- **Inventory tracking** - No stock/quantity management
- **Product ordering** - No drag-and-drop reordering
- **Product search/filter** - Basic list only, filtering can be added later
- **Product analytics** - No view counts or engagement metrics
- **Admin approval workflow** - Products publish immediately without admin review
- **Product templates** - No pre-filled templates for common product types

## Expected Deliverables

1. **API Routes Created:**
   - `app/api/portal/vendors/[id]/products/route.ts` (GET, POST)
   - `app/api/portal/vendors/[id]/products/[productId]/route.ts` (GET, PUT, DELETE)
   - `app/api/portal/vendors/[id]/products/[productId]/publish/route.ts` (PATCH)

2. **UI Components Created:**
   - `components/dashboard/ProductList.tsx`
   - `components/dashboard/ProductCard.tsx`
   - `components/dashboard/ProductForm.tsx`
   - `components/dashboard/ProductDeleteDialog.tsx`
   - `components/dashboard/PublishToggle.tsx` (if not using shared Switch)

3. **Dashboard Page Updated:**
   - `app/(site)/vendor/dashboard/products/page.tsx` - Fetches and displays products

4. **Types/Validation Created:**
   - `lib/types.ts` - Product-related TypeScript interfaces (if not already present)
   - `lib/validation/product-schema.ts` - Zod schemas for product validation

5. **Tests Passing:**
   - All 6 E2E tests in `tests/e2e/vendor-onboarding/09-product-management.spec.ts` pass:
     - Test 9.1: Access product management (tier 2+ only) - Currently PASSING
     - Test 9.2: View product list for vendor - Currently FAILING
     - Test 9.3: Add new product with all fields - Currently FAILING
     - Test 9.4: Edit existing product details - Currently FAILING
     - Test 9.5: Delete product with confirmation - Currently FAILING
     - Test 9.6: Publish/unpublish product toggle - Currently FAILING
     - Test 9.7: Product categories assignment - Currently PASSING (soft assertions)

## Acceptance Criteria

### AC1: Product List Display
- [ ] Products page fetches vendor's products from API
- [ ] Products display in grid/list format with name, status badge, actions
- [ ] Empty state shows "No products yet" with CTA button
- [ ] Loading state shows skeleton/spinner during fetch
- [ ] Error state handles API failures gracefully

### AC2: Product Creation
- [ ] "Add New Product" button opens product form
- [ ] Form validates required fields (name, description)
- [ ] Form submits to POST endpoint
- [ ] Success creates product in draft state
- [ ] New product appears in list without page refresh
- [ ] Error messages display for validation failures

### AC3: Product Editing
- [ ] "Edit" button opens form pre-populated with product data
- [ ] Form submits to PUT endpoint with changed fields
- [ ] Success updates product in list
- [ ] Original data restored on cancel/dismiss

### AC4: Product Deletion
- [ ] "Delete" button opens confirmation dialog
- [ ] Confirmation dialog warns about permanent deletion
- [ ] Confirm triggers DELETE endpoint
- [ ] Product removed from list on success
- [ ] Cancel closes dialog without action

### AC5: Product Publishing
- [ ] Each product shows Published/Draft status badge
- [ ] Toggle switch or button changes publish status
- [ ] PATCH endpoint updates `published` field
- [ ] Status badge updates immediately on success
- [ ] Published products visible on public site

### AC6: Access Control
- [ ] Free/Tier 1 vendors cannot access products page (redirect or message)
- [ ] Vendors can only see/modify their own products
- [ ] API endpoints return 403 for unauthorized access attempts
- [ ] Admin users can access any vendor's products

## Technical Constraints

1. **Must follow existing API patterns** from `app/api/portal/vendors/[id]/route.ts`
2. **Must use Payload CMS** `products` collection (already defined in `payload/collections/Products.ts`)
3. **Must integrate with existing auth** using `getUserFromRequest()` and `authService`
4. **Must handle Lexical JSON** for rich text description field
5. **Must maintain test compatibility** with existing E2E test selectors
6. **Must use shadcn/ui components** for consistency with dashboard UI
