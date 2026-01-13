/**
 * Products API Route
 *
 * GET /api/products - List products with pagination
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sort: Sort field (default: '-createdAt')
 * - order: Sort order ('asc' | 'desc', default: 'desc')
 * - category: Filter by category
 * - vendorId: Filter by vendor ID
 * - featured: Filter by featured status ('true' | 'false')
 * - depth: Relationship depth (0-3, default: 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/lib/repositories/ProductRepository_new';
import { InMemoryCacheService } from '@/lib/cache';

const cache = new InMemoryCacheService();
const productRepo = new ProductRepository(cache);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = searchParams.get('sort') || '-createdAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Parse filter params
    const category = searchParams.get('category') || undefined;
    const vendorId = searchParams.get('vendorId') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const depth = parseInt(searchParams.get('depth') || '1', 10);

    // Fetch paginated products
    const result = await productRepo.getProductsPaginated({
      page,
      limit,
      sort,
      order,
      category,
      vendorId,
      featured,
      depth,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
