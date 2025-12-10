# Task: Implement PATCH Publish Toggle API Route

## Metadata
- **ID**: task-be-5
- **Phase**: 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Time**: 20-25 min
- **Dependencies**: task-be-1
- **Status**: pending

## Description

Create a dedicated endpoint for toggling product publish status. This is a separate endpoint to support optimistic UI updates and clear intent.

## Specifics

### File to Create
`app/api/portal/vendors/[id]/products/[productId]/publish/route.ts`

### Endpoint Specification

#### PATCH /api/portal/vendors/[id]/products/[productId]/publish

**Request Body**:
```typescript
{
  published: boolean
}
```

**Response (200)**:
```typescript
{
  success: true,
  data: {
    product: Product,
    message: 'Product published successfully' | 'Product unpublished successfully'
  }
}
```

### Code Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/ProductService';
import { TogglePublishSchema } from '@/lib/validation/product-schema';

interface RouteContext {
  params: Promise<{ id: string; productId: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { productId } = params;

    // Authenticate
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = TogglePublishSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input: published must be a boolean' } },
        { status: 400 }
      );
    }

    // Toggle publish status
    const product = await ProductService.togglePublish(
      productId,
      validation.data.published,
      user.id,
      user.role === 'admin'
    );

    const message = validation.data.published
      ? 'Product published successfully'
      : 'Product unpublished successfully';

    return NextResponse.json({
      success: true,
      data: { product, message }
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this product' } },
        { status: 403 }
      );
    }
    console.error('Error toggling product publish status:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

## Acceptance Criteria

- [ ] PATCH toggles product publish status
- [ ] Validates published is boolean
- [ ] Verifies product ownership
- [ ] Returns updated product with appropriate message
- [ ] Error handling for all edge cases

## Testing Requirements

```bash
# Publish product
curl -X PATCH "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID/publish" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"published":true}'

# Unpublish product
curl -X PATCH "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID/publish" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"published":false}'

# Invalid body
curl -X PATCH "http://localhost:3000/api/portal/vendors/VENDOR_ID/products/PRODUCT_ID/publish" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"published":"yes"}'  # Should return 400
```

## Related Files

- `app/api/portal/vendors/[id]/products/[productId]/route.ts` - Parent route
- `lib/services/ProductService.ts` - togglePublish method
