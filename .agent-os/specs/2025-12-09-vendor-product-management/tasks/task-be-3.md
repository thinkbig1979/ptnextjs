# Task: Implement GET/POST Products API Route

## Metadata
- **ID**: task-be-3
- **Phase**: 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Time**: 35-45 min
- **Dependencies**: task-be-1, task-be-2
- **Status**: pending

## Description

Create the API route for listing and creating products. This route handles GET (list all vendor products) and POST (create new product) operations.

## Specifics

### File to Create
`app/api/portal/vendors/[id]/products/route.ts`

### Endpoint Specifications

#### GET /api/portal/vendors/[id]/products

**Purpose**: List all products for the vendor
**Query Parameters**:
- `published` (optional): Filter by publish status ('true' | 'false')
- `limit` (optional): Page size (default: 20)
- `page` (optional): Page number (default: 1)

**Response (200)**:
```typescript
{
  success: true,
  data: {
    products: Product[],
    total: number,
    page: number,
    limit: number
  }
}
```

#### POST /api/portal/vendors/[id]/products

**Purpose**: Create a new product
**Request Body**: CreateProductInput (from task-be-2)

**Response (201)**:
```typescript
{
  success: true,
  data: {
    product: Product,
    message: 'Product created successfully'
  }
}
```

### Pattern Reference
Follow: `app/api/portal/vendors/[id]/route.ts`

### Code Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/ProductService';
import { CreateProductSchema } from '@/lib/validation/product-schema';
import { getUserFromRequest } from '@/lib/middleware/auth-middleware';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Response interfaces
interface SuccessResponse {
  success: true;
  data: object;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

// Auth helper (copy from existing route or import)
async function authenticateUser(request: NextRequest) {
  // Extract token from Authorization header or cookie
  // Validate with authService
  // Return user object or null
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const params = await context.params;
    const vendorId = params.id;

    // Authenticate
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Fetch products
    const result = await ProductService.getVendorProducts(
      vendorId,
      user.id,
      user.role === 'admin',
      {
        published: published === 'true' ? true : published === 'false' ? false : undefined,
        limit,
        page,
      }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Error handling
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const params = await context.params;
    const vendorId = params.id;

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
    const validation = CreateProductSchema.safeParse(body);

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

    // Create product
    const product = await ProductService.createProduct(
      vendorId,
      validation.data,
      user.id,
      user.role === 'admin'
    );

    return NextResponse.json(
      { success: true, data: { product, message: 'Product created successfully' } },
      { status: 201 }
    );
  } catch (error) {
    // Error handling
  }
}
```

## Acceptance Criteria

- [ ] GET returns paginated list of vendor's products
- [ ] GET filters by publish status when query param provided
- [ ] POST validates input with Zod schema
- [ ] POST creates product with correct vendor relationship
- [ ] Both endpoints require authentication
- [ ] Error responses follow standard format
- [ ] TypeScript types complete

## Testing Requirements

Test manually with curl or API client:

```bash
# GET products
curl -X GET "http://localhost:3000/api/portal/vendors/VENDOR_ID/products" \
  -H "Authorization: Bearer TOKEN"

# GET with filter
curl -X GET "http://localhost:3000/api/portal/vendors/VENDOR_ID/products?published=true" \
  -H "Authorization: Bearer TOKEN"

# POST new product
curl -X POST "http://localhost:3000/api/portal/vendors/VENDOR_ID/products" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test description"}'
```

## Related Files

- `app/api/portal/vendors/[id]/route.ts` - Pattern reference
- `lib/services/ProductService.ts` - Business logic (task-be-1)
- `lib/validation/product-schema.ts` - Validation schemas (task-be-2)
