"use client";

import { useState } from 'react';
import { OwnerReviews } from '@/components/product-comparison';
import type { OwnerReview, Product } from '@/lib/types';
import { toast } from 'sonner';

interface ProductReviewsClientProps {
  product: Product;
  initialReviews: OwnerReview[];
}

export default function ProductReviewsClient({ product, initialReviews }: ProductReviewsClientProps) {
  const [reviews, setReviews] = useState<OwnerReview[]>(initialReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const handleSubmitReview = async (reviewData: Partial<OwnerReview> & { captchaToken?: string }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/public/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: reviewData.ownerName,
          role: reviewData.title, // Using title field as role
          yachtName: reviewData.yachtName,
          rating: reviewData.rating,
          review: reviewData.review,
          pros: [], // Can be extended to collect pros/cons from form
          cons: [],
          captchaToken: reviewData.captchaToken, // Include captcha token
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Thank you for your review. It will be reviewed by our team before being published.");

        // Optimistically add the new review to the list
        const newReview: OwnerReview = {
          id: data.review?.id || Date.now().toString(),
          productId: product.id,
          ownerName: reviewData.ownerName || '',
          title: reviewData.title || '',
          yachtName: reviewData.yachtName || '',
          rating: reviewData.rating || 5,
          review: reviewData.review || '',
          installationDate: new Date().toISOString(),
          verified: false,
          pros: [],
          cons: [],
          yachtLength: reviewData.yachtLength || '',
          useCase: undefined,
          helpful: 0,
        };

        // Add new review to the beginning of the list
        setReviews(prevReviews => [newReview, ...prevReviews]);

      } else {
        throw new Error(data.error || 'Failed to submit review');
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter reviews by selected rating
  const filteredReviews = selectedRating 
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;

  return (
    <div className="space-y-4">
      {/* Rating Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by rating:</label>
          <select 
            value={selectedRating || ''} 
            onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>
        {selectedRating && (
          <span className="text-sm text-muted-foreground">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </span>
        )}
      </div>

      {/* Reviews Component */}
      <OwnerReviews
        reviews={filteredReviews}
        onSubmitReview={handleSubmitReview}
        showStatistics
        searchable={false}
        showInstallationDates
        showYachtSizes
        groupByUseCase={false}
        allowSubmission={!isSubmitting}
      />
    </div>
  );
}
