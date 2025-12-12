/**
 * Single Product API Route
 *
 * GET /api/products/[id] - Get a single product by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  vendor: string | { id: string };
  published: boolean;
  [key: string]: unknown;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ProductResponse | ErrorResponse>> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    let product;
    try {
      product = await payload.findByID({
        collection: 'products',
        id,
        depth: 1,
      });
    } catch (findError) {
      // Payload throws when ID doesn't exist
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform to API response format
    const response: ProductResponse = {
      id: product.id as string,
      name: product.name,
      slug: product.slug,
      description: product.description || undefined,
      vendor: product.vendor as string | { id: string },
      published: product.published || false,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // If the error is a "not found" type error, return 404
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
