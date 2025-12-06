/**
 * Vendors API Route
 *
 * GET /api/vendors - List vendors with pagination
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sort: Sort field (default: '-createdAt')
 * - order: Sort order ('asc' | 'desc', default: 'desc')
 * - category: Filter by category
 * - featured: Filter by featured status ('true' | 'false')
 * - partnersOnly: Filter partners only ('true' | 'false')
 * - depth: Relationship depth (0-3, default: 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { VendorRepository } from '@/lib/repositories/VendorRepository_new';
import { CacheService } from '@/lib/cache';

const cache = new CacheService();
const vendorRepo = new VendorRepository(cache);

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
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const partnersOnly = searchParams.get('partnersOnly') === 'true' ? true : undefined;
    const depth = parseInt(searchParams.get('depth') || '1', 10);

    // Fetch paginated vendors
    const result = await vendorRepo.getVendorsPaginated({
      page,
      limit,
      sort,
      order,
      category,
      featured,
      partnersOnly,
      depth,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}
