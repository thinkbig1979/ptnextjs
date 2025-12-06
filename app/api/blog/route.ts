/**
 * Blog Posts API Route
 *
 * GET /api/blog - List blog posts with pagination
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sort: Sort field (default: '-publishedAt')
 * - order: Sort order ('asc' | 'desc', default: 'desc')
 * - category: Filter by category
 * - featured: Filter by featured status ('true' | 'false')
 * - depth: Relationship depth (0-3, default: 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlogRepository } from '@/lib/repositories/BlogRepository_new';
import { CacheService } from '@/lib/cache';

const cache = new CacheService();
const blogRepo = new BlogRepository(cache);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = searchParams.get('sort') || '-publishedAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Parse filter params
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const depth = parseInt(searchParams.get('depth') || '1', 10);

    // Fetch paginated blog posts
    const result = await blogRepo.getBlogPostsPaginated({
      page,
      limit,
      sort,
      order,
      category,
      featured,
      depth,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
