# Task: Implement GET/PUT/DELETE Single Product API Route

## Metadata
- **ID**: task-be-4
- **Phase**: 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Time**: 35-45 min
- **Dependencies**: task-be-1, task-be-2
- **Status**: pending

## Description

Create the API route for single product operations: GET (fetch one product), PUT (update product), and DELETE (remove product).

## Specifics

### File to Create
`app/api/portal/vendors/[id]/products/[productId]/route.ts`

### Endpoint Specifications

#### GET /api/portal/vendors/[id]/products/[productId]

**Response (200)**:
```typescript
{
  success: true,
  data: Product
}
```

#### PUT /api/portal/vendors/[id]/products/[productId]

**Request Body**: UpdateProductInput (partial product data)

**Response (200)**:
```typescript
{
  success: true,
  data: {
    product: Product,
    message: 'Product updated successfully'
  }
}
```

#### DELETE /api/portal/vendors/[id]/products/[productId]

**Response (200)**:
```typescript
{
  success: true,
  data: {
    message: 'Product deleted successfully'
  }
}
```

### Code Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/ProductService';
import { UpdateProductSchema } from '@/lib/validation/product-schema';

interface RouteContext {
  params: Promise<{ id: string; productId: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { id: vendorId, productId } = params;

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const product = await ProductService.getProductById(
      productId,
      user.id,
      user.role === 'admin'
    );

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    if (error.message === 'Product not found') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to access this product' } },
        { status: 403 }
      );
    }
    // Server error
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { productId } = params;

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = UpdateProductSchema.safeParse(body);

    if (!validation.success) {
      const fields: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        fields[issue.path.join('.')] = issue.message;
      });
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields } },
        { status: 400 }
      );
    }

    const product = await ProductService.updateProduct(
      productId,
      validation.data,
      user.id,
      user.role === 'admin'
    );

    return NextResponse.json({
      success: true,
      data: { product, message: 'Product updated successfully' }
    });
  } catch (error) {
    // Error handling similar to GET
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { productId } = params;

    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    await ProductService.deleteProduct(
      productId,
      user.id,
      user.role === 'admin'
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Product deleted successfully' }
    });
  } catch (error) {
    // Error handling
  }
}
```

## Acceptance Criteria

- [ ] GET returns single product by ID
- [ ] PUT validates input and updates product
- [ ] DELETE removes product from database
- [ ] All endpoints verify product ownership
- [ ] 404 returned for non-existent products
- [ ] 403 returned for unauthorized access
- [ ] Error responses follow standard format

## Testing Requirements

```bash
# GET single product
curl -X GET "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID" \
  -H "Authorization: Bearer TOKEN"

# PUT update product
curl -X PUT "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# DELETE product
curl -X DELETE "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID" \
  -H "Authorization: Bearer TOKEN"
```

## Related Files

- `app/api/portal/vendors/[id]/products/route.ts` - Sibling route (task-be-3)
- `lib/services/ProductService.ts` - Business logic
