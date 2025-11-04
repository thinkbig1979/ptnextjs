/**
 * API Route: /api/products/[id]/reviews
 * Handles product review submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { verifyHCaptchaToken, getHCaptchaErrorMessage } from '@/lib/utils/hcaptcha';

// Helper to create Lexical rich text content
function createLexicalContent(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: text,
              format: 0,
              version: 1
            }
          ],
          format: '',
          indent: 0,
          version: 1
        }
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1
    }
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify hCaptcha token first
    if (process.env.HCAPTCHA_SECRET_KEY) {
      if (!body.captchaToken) {
        return NextResponse.json(
          { error: 'Captcha verification required. Please complete the captcha challenge.' },
          { status: 400 }
        );
      }

      const captchaResult = await verifyHCaptchaToken(
        body.captchaToken,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      );

      if (!captchaResult.success) {
        const errorMessage = getHCaptchaErrorMessage(captchaResult['error-codes']);
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!body.ownerName || !body.rating || !body.review) {
      return NextResponse.json(
        { error: 'Missing required fields: ownerName, rating, and review are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Get the product
    const product = await payload.findByID({
      collection: 'products',
      id,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create new review object
    const newReview = {
      reviewerName: body.ownerName,
      reviewerRole: body.role || 'Owner',
      yachtName: body.yachtName || undefined,
      overallRating: body.rating,
      reviewText: createLexicalContent(body.review),
      pros: body.pros?.map((pro: string) => ({ pro })) || [],
      cons: body.cons?.map((con: string) => ({ con })) || [],
      reviewDate: new Date().toISOString(),
      verified: false, // New submissions are unverified by default
      featured: false,
    };

    // Get existing reviews
    const existingReviews = Array.isArray(product.ownerReviews) ? product.ownerReviews : [];

    // Add new review to existing reviews
    await payload.update({
      collection: 'products',
      id,
      data: {
        ownerReviews: [...existingReviews, newReview],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully! It will be reviewed by our team before being published.',
        review: newReview,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config });

    const product = await payload.findByID({
      collection: 'products',
      id,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      reviews: product.ownerReviews || [],
      totalReviews: product.ownerReviews?.length || 0,
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
