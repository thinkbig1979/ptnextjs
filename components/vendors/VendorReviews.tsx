"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, ThumbsUp, Search, MessageSquare, Verified, Calendar } from "lucide-react";
import type { VendorReview } from "@/lib/types";
import { toast } from "sonner";

// Dynamically import HCaptcha to avoid SSR issues
const HCaptcha = dynamic(() => import("@hcaptcha/react-hcaptcha"), {
  ssr: false,
});

interface VendorReviewsProps {
  vendorId: string;
  reviews?: VendorReview[];
  onVoteHelpful?: (reviewId: string) => void;
  onSubmitReview?: (review: Partial<VendorReview> & { captchaToken?: string }) => Promise<void>;
  filterByRating?: number;
  sortBy?: 'date' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  showStatistics?: boolean;
  className?: string;
  itemsPerPage?: number;
  searchable?: boolean;
  allowSubmission?: boolean;
}

export function VendorReviews({
  vendorId,
  reviews = [],
  onVoteHelpful,
  onSubmitReview,
  filterByRating,
  sortBy = 'date',
  sortOrder = 'desc',
  showStatistics = true,
  className,
  itemsPerPage = 10,
  searchable = true,
  allowSubmission = true
}: VendorReviewsProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showSubmissionForm, setShowSubmissionForm] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newReview, setNewReview] = React.useState<Partial<VendorReview>>({
    overallRating: 5,
    title: '',
    review: '',
    reviewerName: '',
    reviewerRole: '',
    yachtName: '',
    projectType: '',
    pros: [],
    cons: []
  });

  // Filter and sort reviews
  const processedReviews = React.useMemo(() => {
    let filtered = Array.isArray(reviews) ? reviews : [];

    // Filter by rating
    if (filterByRating) {
      filtered = filtered.filter(r => r.overallRating === filterByRating);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(search) ||
        r.review?.toLowerCase().includes(search) ||
        r.reviewText?.toLowerCase().includes(search) ||
        r.reviewerName?.toLowerCase().includes(search)
      );
    }

    // Sort reviews
    if (filtered.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortBy) {
          case 'rating':
            aValue = a.overallRating;
            bValue = b.overallRating;
            break;
          case 'helpful':
            aValue = a.helpful || 0;
            bValue = b.helpful || 0;
            break;
          default: // date
            aValue = new Date(a.reviewDate || '').getTime();
            bValue = new Date(b.reviewDate || '').getTime();
        }

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [reviews, filterByRating, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedReviews.length / itemsPerPage);
  const paginatedReviews = processedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const statistics = React.useMemo(() => {
    if (processedReviews.length === 0) return null;

    const totalReviews = processedReviews.length;
    const avgRating = (processedReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews).toFixed(1);

    return {
      totalReviews,
      avgRating,
    };
  }, [processedReviews]);

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm'): React.JSX.Element => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = async (): Promise<void> => {
    if (!onSubmitReview || !newReview.reviewerName || !newReview.review || !newReview.reviewerRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check hCaptcha if configured
    if (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && !captchaToken) {
      toast.error("Please complete the captcha challenge");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmitReview({
        ...newReview,
        vendorId,
        captchaToken: captchaToken || undefined,
      });

      toast.success("Review submitted successfully! It will be reviewed before being published.");

      // Reset form
      setNewReview({
        overallRating: 5,
        title: '',
        review: '',
        reviewerName: '',
        reviewerRole: '',
        yachtName: '',
        projectType: '',
        pros: [],
        cons: []
      });
      setCaptchaToken(null);
      setShowSubmissionForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaVerify = (token: string): void => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = (): void => {
    setCaptchaToken(null);
  };

  const handleCaptchaError = (): void => {
    setCaptchaToken(null);
  };

  const hasReviews = reviews && reviews.length > 0;

  return (
    <>
      {!hasReviews ? (
        <Card className={cn("w-full", className)} data-testid="vendor-reviews">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No reviews available for this vendor yet.</p>
            {allowSubmission && (
              <Button onClick={() => setShowSubmissionForm(true)}>
                Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
    <div className={cn("w-full space-y-6", className)} data-testid="vendor-reviews">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Reviews</CardTitle>
            {allowSubmission && (
              <Button
                onClick={() => setShowSubmissionForm(true)}
                data-testid="submit-review-button"
              >
                Write a Review
              </Button>
            )}
          </div>
        </CardHeader>

        {showStatistics && statistics && (
          <CardContent data-testid="review-statistics">
            <div className="grid gap-6 md:grid-cols-2">
              <div data-testid="rating-summary">
                <h3 className="font-medium mb-2">Average Rating</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold">{statistics.avgRating}</span>
                  {renderStars(Math.round(parseFloat(statistics.avgRating)), 'md')}
                  <span className="text-muted-foreground">({statistics.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.map((review) => {
          const reviewText = review.reviewText || review.review || '';
          const prosArray = Array.isArray(review.pros)
            ? review.pros.map(p => typeof p === 'string' ? p : (p as { pro: string }).pro)
            : [];
          const consArray = Array.isArray(review.cons)
            ? review.cons.map(c => typeof c === 'string' ? c : (c as { con: string }).con)
            : [];

          return (
            <Card key={review.id} data-testid={`review-${review.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {review.reviewerName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{review.reviewerName}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Verified className="h-3 w-3 mr-1" />
                            Verified Client
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.reviewerRole}</p>
                      {review.yachtName && (
                        <p className="text-sm text-muted-foreground">Yacht: {review.yachtName}</p>
                      )}
                      {review.projectType && (
                        <p className="text-sm text-muted-foreground">Project: {review.projectType}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {renderStars(review.overallRating)}
                    {review.reviewDate && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}

                <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                  {reviewText}
                </p>

                {/* Pros and Cons */}
                {(prosArray.length > 0 || consArray.length > 0) && (
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    {prosArray.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2 text-green-600">Pros</h5>
                        <ul className="space-y-1">
                          {prosArray.map((pro, idx) => (
                            <li key={`pro-${idx}-${pro.slice(0, 20)}`} className="text-sm flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {consArray.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2 text-orange-600">Cons</h5>
                        <ul className="space-y-1">
                          {consArray.map((con, idx) => (
                            <li key={`con-${idx}-${con.slice(0, 20)}`} className="text-sm flex items-start">
                              <span className="text-orange-600 mr-2">−</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Helpful button */}
                {onVoteHelpful && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onVoteHelpful(review.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful {review.helpful ? `(${review.helpful})` : ''}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
      )}

      {/* Review Submission Modal - Always rendered so dialog can open */}
      {allowSubmission && (
        <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
          <DialogContent className="sm:max-w-[600px]" data-testid="review-submission-form">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Rating *</label>
                <div className="flex items-center space-x-2 mt-1">
                  {renderStars(newReview.overallRating || 5, 'md')}
                  <Select
                    value={newReview.overallRating?.toString() || '5'}
                    onValueChange={(value) => setNewReview(prev => ({ ...prev, overallRating: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Your Name *</label>
                  <Input
                    value={newReview.reviewerName || ''}
                    onChange={(e) => setNewReview(prev => ({ ...prev, reviewerName: e.target.value }))}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Your Role *</label>
                  <Input
                    value={newReview.reviewerRole || ''}
                    onChange={(e) => setNewReview(prev => ({ ...prev, reviewerRole: e.target.value }))}
                    placeholder="Yacht Owner, Captain, etc."
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Yacht Name (optional)</label>
                  <Input
                    value={newReview.yachtName || ''}
                    onChange={(e) => setNewReview(prev => ({ ...prev, yachtName: e.target.value }))}
                    placeholder="M/Y Ocean Dream"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Project Type (optional)</label>
                  <Input
                    value={newReview.projectType || ''}
                    onChange={(e) => setNewReview(prev => ({ ...prev, projectType: e.target.value }))}
                    placeholder="System Installation, Maintenance, etc."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Review Title (optional)</label>
                <Input
                  value={newReview.title || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Great service and professionalism"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Review *</label>
                <Textarea
                  value={newReview.review || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience working with this vendor..."
                  rows={4}
                  required
                />
              </div>

              {/* hCaptcha - Always use light theme for consistency across light/dark modes */}
              {process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && (
                <div className="flex justify-center">
                  <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                    theme="light"
                    onVerify={handleCaptchaVerify}
                    onExpire={handleCaptchaExpire}
                    onError={handleCaptchaError}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubmissionForm(false);
                  setCaptchaToken(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={
                  isSubmitting ||
                  !newReview.reviewerName ||
                  !newReview.review ||
                  !newReview.reviewerRole ||
                  (!!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && !captchaToken)
                }
                data-testid="submit-review-final-button"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
