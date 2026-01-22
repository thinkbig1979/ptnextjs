import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
}

interface CategoriesResponse {
  docs: Category[];
  totalDocs: number;
}

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/public/categories
 *
 * Public endpoint to fetch all published categories
 * Returns categories sorted alphabetically by name
 * Includes caching headers for performance
 *
 * Note: This is separate from Payload's /api/categories endpoint
 * which is used by the admin panel for relationship queries.
 */
export async function GET(
  _request: NextRequest
): Promise<NextResponse<CategoriesResponse | ErrorResponse>> {
  try {
    const payload = await getPayload({ config: configPromise });

    const categories = await payload.find({
      collection: 'categories',
      where: {
        published: {
          equals: true,
        },
      },
      limit: 100,
      sort: 'name',
      depth: 0,
    });

    const response = NextResponse.json<CategoriesResponse>({
      docs: categories.docs.map(cat => ({
        id: cat.id,
        name: cat.name as string,
        slug: cat.slug as string,
        description: cat.description as string | undefined,
      })),
      totalDocs: categories.totalDocs,
    });

    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
