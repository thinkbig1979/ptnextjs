# Product CRUD API Implementation

**Date**: 2025-12-10
**Task ID**: ptnextjs-0mg
**Feature**: Single Product CRUD Operations API

## Overview

Implemented the API route for single product CRUD operations to enable vendors to manage their products through the portal.

## Implementation Details

### File Created
- `/app/api/portal/vendors/[id]/products/[productId]/route.ts`

### Endpoints Implemented

#### 1. GET /api/portal/vendors/[id]/products/[productId]
- **Purpose**: Fetch single product by ID
- **Authorization**: Vendor can only access their own products; Admin can access any product
- **Response Codes**:
  - `200`: Success with product data
  - `401`: Authentication required
  - `403`: Forbidden (not owner)
  - `404`: Product not found
  - `500`: Server error

#### 2. PUT /api/portal/vendors/[id]/products/[productId]
- **Purpose**: Update existing product
- **Authorization**: Vendor can only update their own products; Admin can update any product
- **Validation**: Uses `UpdateProductSchema` from `@/lib/validation/product-schema`
- **Response Codes**:
  - `200`: Success with updated product data
  - `400`: Validation error with field-level errors
  - `401`: Authentication required
  - `403`: Forbidden (not owner)
  - `404`: Product not found
  - `500`: Server error

#### 3. DELETE /api/portal/vendors/[id]/products/[productId]
- **Purpose**: Delete product
- **Authorization**: Vendor can only delete their own products; Admin can delete any product
- **Response Codes**:
  - `200`: Success with deleted product ID
  - `401`: Authentication required
  - `403`: Forbidden (not owner)
  - `404`: Product not found
  - `500`: Server error

## Technical Approach

### Authentication Pattern
- Follows the same authentication pattern as `/app/api/portal/vendors/[id]/route.ts`
- Uses `getUserFromRequest()` helper
- Falls back to manual token validation if middleware hasn't set user headers
- Supports both `authorization` header and `access_token` cookie

### Service Layer
Uses `ProductService` methods:
- `getProductById()` - Fetch product with ownership verification
- `updateProduct()` - Update product with validation
- `deleteProduct()` - Delete product with ownership verification

### Error Handling
- Consistent error response structure with `success: false` and error codes
- Field-level validation errors for PUT requests
- Detailed logging for monitoring and debugging
- Proper HTTP status codes for each error type

### Route Context Type
```typescript
interface RouteContext {
  params: Promise<{
    id: string;
    productId: string;
  }>;
}
```

### Response Types
```typescript
interface SuccessResponse {
  success: true;
  data: Record<string, unknown>;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>;
    details?: string;
  };
}
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid authentication
2. **Ownership Verification**: ProductService verifies ownership before allowing operations
3. **Admin Override**: Admins can operate on any product
4. **Validation**: PUT endpoint validates all input against schema
5. **Error Messages**: Generic error messages to prevent information leakage

## Logging

All endpoints log operations with:
- Vendor ID
- Product ID
- User ID
- Timestamp
- Operation-specific data (product name, etc.)

## Next Steps

This implementation completes the single product CRUD API. The following related items may need attention:

1. **Bulk Operations**: Implement bulk update/delete endpoints if needed
2. **Integration Tests**: Add API contract tests for these endpoints
3. **E2E Tests**: Add Playwright tests for product management workflow
4. **Documentation**: Update API documentation with these new endpoints
5. **Frontend Integration**: Connect React components to these endpoints

## Related Files

- Service Layer: `/lib/services/ProductService.ts`
- Validation Schema: `/lib/validation/product-schema.ts`
- Auth Middleware: `/lib/middleware/auth-middleware.ts`
- Reference Pattern: `/app/api/portal/vendors/[id]/route.ts`
