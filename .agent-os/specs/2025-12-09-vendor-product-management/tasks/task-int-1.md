# Task: Frontend-Backend Data Flow Integration

## Metadata
- **ID**: task-int-1
- **Phase**: 4 - Integration
- **Agent**: integration-coordinator
- **Time**: 30-35 min
- **Dependencies**: task-fe-6, task-be-6
- **Status**: pending

## Description

Verify complete data flow from frontend components through API routes to database and back. Ensure all CRUD operations work end-to-end with proper error handling.

## Specifics

### Integration Test Scenarios

#### 1. Product Creation Flow
```
User clicks "Add New Product"
  → ProductForm opens (Sheet)
  → User fills name, description
  → User clicks "Create Product"
  → POST /api/portal/vendors/[id]/products
  → ProductService.createProduct()
  → Payload CMS creates product
  → Response returns new product
  → ProductList mutates (SWR revalidate)
  → New ProductCard appears in grid
  → Toast notification shows success
```

**Verification**:
- [ ] Form submits to correct endpoint
- [ ] Request body includes all form fields
- [ ] Response contains created product
- [ ] Product appears in list without refresh
- [ ] Toast shows success message

#### 2. Product Edit Flow
```
User clicks "Edit" on ProductCard
  → ProductForm opens with product data
  → Form fields pre-populated
  → User modifies fields
  → User clicks "Save Changes"
  → PUT /api/portal/vendors/[id]/products/[productId]
  → ProductService.updateProduct()
  → Payload CMS updates product
  → Response returns updated product
  → ProductList mutates
  → ProductCard shows updated data
  → Toast notification shows success
```

**Verification**:
- [ ] Form pre-populates with correct data
- [ ] Only changed fields sent in request
- [ ] Product updates in list
- [ ] Description Lexical conversion works

#### 3. Product Delete Flow
```
User clicks "Delete" on ProductCard
  → ProductDeleteDialog opens
  → User clicks "Delete" to confirm
  → DELETE /api/portal/vendors/[id]/products/[productId]
  → ProductService.deleteProduct()
  → Payload CMS deletes product
  → Response confirms deletion
  → ProductList mutates
  → ProductCard removed from grid
  → Toast notification shows success
```

**Verification**:
- [ ] Dialog shows product name
- [ ] Correct product ID in request
- [ ] Product removed from list
- [ ] No orphaned data

#### 4. Publish Toggle Flow
```
User toggles Switch on ProductCard
  → PATCH /api/portal/vendors/[id]/products/[productId]/publish
  → ProductService.togglePublish()
  → Payload CMS updates published field
  → Response returns updated product
  → ProductList mutates
  → Badge updates (Published/Draft)
  → Toast notification shows status change
```

**Verification**:
- [ ] Switch triggers correct API call
- [ ] Badge updates immediately (optimistic or after response)
- [ ] Status persists on page refresh

### Data Validation Points

| Point | Check |
|-------|-------|
| Form → API | Zod validation passes |
| API → Service | Authorization verified |
| Service → DB | Payload access control |
| DB → Response | Correct data shape |
| Response → UI | State updates correctly |

### Error Flow Integration

Test these error scenarios:

1. **Validation Error**:
   - Submit form with empty name
   - Expect inline field error
   - Form should not close

2. **Network Error**:
   - Simulate network failure
   - Expect toast error message
   - UI should not break

3. **Authorization Error**:
   - Try accessing other vendor's product
   - Expect 403 response
   - Proper error message shown

## Acceptance Criteria

- [ ] All CRUD operations complete end-to-end
- [ ] Data persists correctly in database
- [ ] UI updates reflect database state
- [ ] Error states handled gracefully
- [ ] Loading states appear during operations
- [ ] Toast notifications for all actions
- [ ] No console errors

## Testing Procedure

1. **Start fresh**:
   ```bash
   npm run dev
   ```

2. **Login as Tier 2+ vendor**

3. **Navigate to Products page**

4. **Test Create**:
   - Click "Add New Product"
   - Fill name: "Integration Test Product"
   - Fill description: "Testing the integration"
   - Click "Create Product"
   - Verify product appears

5. **Test Edit**:
   - Click "Edit" on new product
   - Change name to "Updated Integration Product"
   - Click "Save Changes"
   - Verify name updated

6. **Test Publish**:
   - Toggle publish switch
   - Verify badge changes to "Published"
   - Toggle again
   - Verify badge changes to "Draft"

7. **Test Delete**:
   - Click "Delete" on product
   - Click "Delete" in dialog
   - Verify product removed

8. **Test Error**:
   - Try creating product with empty name
   - Verify error message appears

## Related Files

All files from Phase 2 and Phase 3
