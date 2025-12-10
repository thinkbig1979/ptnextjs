# Task: Verify Backend API Endpoints

## Metadata
- **ID**: task-be-6
- **Phase**: 2 - Backend Implementation
- **Agent**: quality-assurance
- **Time**: 20-25 min
- **Dependencies**: task-be-3, task-be-4, task-be-5
- **Status**: pending

## Description

Verify all backend API endpoints work correctly before proceeding to frontend implementation. This includes authentication, authorization, CRUD operations, and error handling.

## Specifics

### Verification Checklist

#### 1. Authentication Tests
- [ ] All endpoints return 401 when no token provided
- [ ] All endpoints return 401 with invalid token
- [ ] All endpoints accept valid Bearer token
- [ ] All endpoints accept token from httpOnly cookie

#### 2. GET /api/portal/vendors/[id]/products
- [ ] Returns empty array for vendor with no products
- [ ] Returns all products for vendor
- [ ] Filters by published=true correctly
- [ ] Filters by published=false correctly
- [ ] Pagination works (limit, page params)
- [ ] Returns 403 for wrong vendor's products (non-admin)
- [ ] Admin can access any vendor's products

#### 3. POST /api/portal/vendors/[id]/products
- [ ] Creates product with minimal required fields
- [ ] Creates product with all optional fields
- [ ] Returns 400 for missing name
- [ ] Returns 400 for missing description
- [ ] New product has published=false by default
- [ ] Slug is auto-generated from name
- [ ] Description is converted to Lexical JSON
- [ ] Vendor relationship is set correctly

#### 4. GET /api/portal/vendors/[id]/products/[productId]
- [ ] Returns product by ID
- [ ] Returns 404 for non-existent product
- [ ] Returns 403 for other vendor's product (non-admin)

#### 5. PUT /api/portal/vendors/[id]/products/[productId]
- [ ] Updates product name
- [ ] Updates product description
- [ ] Updates published status
- [ ] Returns 404 for non-existent product
- [ ] Returns 403 for other vendor's product
- [ ] Validates input fields

#### 6. DELETE /api/portal/vendors/[id]/products/[productId]
- [ ] Deletes product
- [ ] Returns 404 for non-existent product
- [ ] Returns 403 for other vendor's product
- [ ] Product no longer retrievable after delete

#### 7. PATCH /api/portal/vendors/[id]/products/[productId]/publish
- [ ] Publishes product (published: true)
- [ ] Unpublishes product (published: false)
- [ ] Returns 400 for invalid published value
- [ ] Returns 403 for other vendor's product

### Testing Commands

```bash
# Start dev server
npm run dev

# Create test vendor and get token (use existing seed API)
# Use browser or API client to login and copy token

# Test endpoints with curl (replace VENDOR_ID, PRODUCT_ID, TOKEN)

# List products
curl -X GET "http://localhost:3000/api/portal/vendors/VENDOR_ID/products" \
  -H "Authorization: Bearer TOKEN" | jq

# Create product
curl -X POST "http://localhost:3000/api/portal/vendors/VENDOR_ID/products" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test description"}' | jq

# Get single product
curl -X GET "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID" \
  -H "Authorization: Bearer TOKEN" | jq

# Update product
curl -X PUT "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}' | jq

# Toggle publish
curl -X PATCH "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID/publish" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"published":true}' | jq

# Delete product
curl -X DELETE "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID" \
  -H "Authorization: Bearer TOKEN" | jq
```

## Acceptance Criteria

- [ ] All endpoints return correct HTTP status codes
- [ ] All endpoints return consistent response format
- [ ] Authentication works correctly
- [ ] Authorization (ownership) works correctly
- [ ] CRUD operations complete successfully
- [ ] Error messages are descriptive
- [ ] No console errors in server logs

## Evidence Required

Document test results showing:
1. Screenshot or log of successful CRUD cycle
2. Screenshot or log of 401 response for unauthenticated request
3. Screenshot or log of 403 response for unauthorized access

## Related Files

- All files created in task-be-3, task-be-4, task-be-5
- `lib/services/ProductService.ts` (task-be-1)
