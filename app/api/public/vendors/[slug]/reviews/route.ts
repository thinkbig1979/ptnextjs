/**
 * API Route: /api/vendors/[slug]/reviews
 * Handles vendor review submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { verifyHCaptchaToken, getHCaptchaErrorMessage } from '@/lib/utils/hcaptcha';
import { createLexicalContent } from '@/lib/utils/lexical-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
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
    if (!body.reviewerName || !body.rating || !body.review) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewerName, rating, and review are required' },
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

    const payload = await getPayloadClient();

    // Get the vendor by slug
    const vendorResult = await payload.find({
      collection: 'vendors',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    });

    if (!vendorResult.docs || vendorResult.docs.length === 0) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const vendor = vendorResult.docs[0];

    // Create new review object
    const newReview = {
      reviewerName: body.reviewerName,
      reviewerRole: body.role || 'Client',
      yachtName: body.yachtName || undefined,
      projectType: body.projectType || undefined,
      overallRating: body.rating,
      reviewText: createLexicalContent(body.review),
      pros: body.pros?.map((pro: string) => ({ pro })) || [],
      cons: body.cons?.map((con: string) => ({ con })) || [],
      reviewDate: new Date().toISOString(),
      verified: false, // New submissions are unverified by default
      featured: false,
    };

    // Get existing reviews
    const existingReviews = Array.isArray(vendor.vendorReviews) ? vendor.vendorReviews : [];

    // Add new review to existing reviews
    await payload.update({
      collection: 'vendors',
      id: vendor.id,
      data: {
        vendorReviews: [...existingReviews, newReview],
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
    console.error('Error submitting vendor review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch reviews for a vendor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const payload = await getPayloadClient();

    // Get the vendor by slug
    const vendorResult = await payload.find({
      collection: 'vendors',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    });

    if (!vendorResult.docs || vendorResult.docs.length === 0) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const vendor = vendorResult.docs[0];

    return NextResponse.json({
      reviews: vendor.vendorReviews || [],
      totalReviews: vendor.vendorReviews?.length || 0,
    });

  } catch (error) {
    console.error('Error fetching vendor reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
