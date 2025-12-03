"use client";

import { VendorReviews } from "@/components/vendors/VendorReviews";
import type { VendorReview } from "@/lib/types";

interface VendorReviewsWrapperProps {
  vendorId: string;
  vendorSlug: string;
  vendorReviews?: any[];
}

export default function VendorReviewsWrapper({ vendorId, vendorSlug, vendorReviews }: VendorReviewsWrapperProps) {
  // Transform Payload CMS reviews to VendorReview format
  const transformedReviews: VendorReview[] = (vendorReviews || []).map((review: any) => ({
    id: review.id || String(Math.random()),
    vendorId,
    reviewerName: review.reviewerName || '',
    reviewerRole: review.reviewerRole || '',
    yachtName: review.yachtName,
    projectType: review.projectType,
    overallRating: review.overallRating || 0,
    title: review.title,
    review: review.reviewText?.root?.children?.[0]?.children?.[0]?.text || '',
    reviewText: review.reviewText?.root?.children?.[0]?.children?.[0]?.text,
    pros: review.pros || [],
    cons: review.cons || [],
    reviewDate: review.reviewDate,
    verified: review.verified || false,
    featured: review.featured || false,
    helpful: review.helpful || 0,
    ratings: review.ratings,
  }));

  const handleSubmitReview = async (review: Partial<VendorReview> & { captchaToken?: string }) => {
    const response = await fetch(`/api/public/vendors/${vendorSlug}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewerName: review.reviewerName,
        role: review.reviewerRole,
        yachtName: review.yachtName,
        projectType: review.projectType,
        rating: review.overallRating,
        title: review.title,
        review: review.review,
        pros: review.pros,
        cons: review.cons,
        captchaToken: review.captchaToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit review');
    }

    return response.json();
  };

  return (
    <VendorReviews
      vendorId={vendorId}
      reviews={transformedReviews}
      onSubmitReview={handleSubmitReview}
      allowSubmission={true}
      showStatistics={true}
      searchable={true}
    />
  );
}
