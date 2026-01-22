import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

interface Tag {
  id: number | string;
  name: string;
  slug: string;
  color?: string;
}

interface TagsResponse {
  docs: Tag[];
  totalDocs: number;
}

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/public/tags
 *
 * Public endpoint to fetch all tags
 * Returns tags sorted alphabetically by name
 * Includes caching headers for performance
 *
 * Note: This is separate from Payload's /api/tags endpoint
 * which is used by the admin panel for relationship queries.
 */
export async function GET(
  _request: NextRequest
): Promise<NextResponse<TagsResponse | ErrorResponse>> {
  try {
    const payload = await getPayload({ config: configPromise });

    const tags = await payload.find({
      collection: 'tags',
      limit: 100,
      sort: 'name',
      depth: 0,
    });

    const response = NextResponse.json<TagsResponse>({
      docs: tags.docs.map(tag => ({
        id: tag.id,
        name: tag.name as string,
        slug: tag.slug as string,
        color: tag.color as string | undefined,
      })),
      totalDocs: tags.totalDocs,
    });

    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('[Tags API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
