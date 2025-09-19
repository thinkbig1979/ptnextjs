"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, Search, MessageSquare, Verified, Flag, Calendar } from "lucide-react";
import type { OwnerReview } from "@/lib/types";

interface OwnerReviewsProps {
  reviews: OwnerReview[];
  onVoteHelpful?: (reviewId: string) => void;
  onSubmitReview?: (review: Partial<OwnerReview>) => void;
  filterByRating?: number;
  sortBy?: 'date' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  showStatistics?: boolean;
  className?: string;
  itemsPerPage?: number;
  groupByUseCase?: boolean;
  showInstallationDates?: boolean;
  searchable?: boolean;
  showYachtSizes?: boolean;
  showModerationFlags?: boolean;
  showVendorResponses?: boolean;
  allowSubmission?: boolean;
}

export function OwnerReviews({
  reviews,
  onVoteHelpful,
  onSubmitReview,
  filterByRating,
  sortBy = 'date',
  sortOrder = 'desc',
  showStatistics = false,
  className,
  itemsPerPage = 10,
  groupByUseCase = false,
  showInstallationDates = false,
  searchable = false,
  showYachtSizes = false,
  showModerationFlags = false,
  showVendorResponses = false,
  allowSubmission = false
}: OwnerReviewsProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedUseCase, setSelectedUseCase] = React.useState<string>('all');
  const [showSubmissionForm, setShowSubmissionForm] = React.useState(false);
  const [newReview, setNewReview] = React.useState<Partial<OwnerReview>>({
    rating: 5,
    title: '',
    review: '',
    ownerName: '',
    yachtName: '',
    yachtLength: ''
  });

  // Filter and sort reviews
  const processedReviews = React.useMemo(() => {
    let filtered = reviews;

    // Filter by rating
    if (filterByRating) {
      filtered = filtered.filter(r => r.rating === filterByRating);
    }

    // Filter by use case
    if (selectedUseCase !== 'all') {
      filtered = filtered.filter(r => r.useCase === selectedUseCase);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort reviews
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'helpful':
          aValue = a.helpful || 0;
          bValue = b.helpful || 0;
          break;
        default: // date
          aValue = new Date(a.installationDate || '').getTime();
          bValue = new Date(b.installationDate || '').getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [reviews, filterByRating, selectedUseCase, searchTerm, sortBy, sortOrder]);

  // Group by use case if enabled
  const groupedReviews = React.useMemo(() => {
    if (!groupByUseCase) return { all: processedReviews };

    return processedReviews.reduce((groups, review) => {
      const useCase = review.useCase || 'unspecified';
      if (!groups[useCase]) groups[useCase] = [];
      groups[useCase].push(review);
      return groups;
    }, {} as Record<string, OwnerReview[]>);
  }, [processedReviews, groupByUseCase]);

  // Pagination
  const totalPages = Math.ceil(processedReviews.length / itemsPerPage);
  const paginatedReviews = processedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const statistics = React.useMemo(() => {
    if (reviews.length === 0) return null;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: reviews.filter(r => r.rating === i + 1).length
    }));

    const yachtSizeDistribution = reviews.reduce((acc, r) => {
      if (!r.yachtLength) return acc;
      const length = parseInt(r.yachtLength);
      let category = '50m+';
      if (length < 30) category = '<30m';
      else if (length < 40) category = '30-40m';
      else if (length < 50) category = '40-50m';

      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      avgRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
      ratingDistribution,
      yachtSizeDistribution
    };
  }, [reviews]);

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const handleSubmitReview = () => {
    if (onSubmitReview && newReview.title && newReview.review && newReview.ownerName) {
      onSubmitReview({
        ...newReview,
        id: Date.now().toString(),
        productId: 'current-product',
        helpful: 0,
        verified: false
      });
      setNewReview({
        rating: 5,
        title: '',
        review: '',
        ownerName: '',
        yachtName: '',
        yachtLength: ''
      });
      setShowSubmissionForm(false);
    }
  };

  const getUseCaseLabel = (useCase: string) => {
    switch (useCase) {
      case 'commercial_charter': return 'Commercial Charter';
      case 'private_use': return 'Private Use';
      case 'racing': return 'Racing';
      case 'expedition': return 'Expedition';
      case 'day_sailing': return 'Day Sailing';
      default: return 'Unspecified';
    }
  };

  if (reviews.length === 0) {
    return (
      <Card className={cn("w-full", className)} data-testid="owner-reviews">
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No reviews available for this product yet.</p>
          {allowSubmission && (
            <Button onClick={() => setShowSubmissionForm(true)}>
              Write the First Review
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)} data-testid="owner-reviews">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Owner Reviews</CardTitle>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div data-testid="rating-summary">
                <h3 className="font-medium mb-2">Average Rating</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold">{statistics.avgRating}</span>
                  {renderStars(Math.round(parseFloat(statistics.avgRating)), 'md')}
                  <span className="text-muted-foreground">({statistics.totalReviews} reviews)</span>
                </div>
              </div>

              {showYachtSizes && (
                <div data-testid="yacht-size-distribution">
                  <h3 className="font-medium mb-2">Yacht Size Distribution</h3>
                  <div className="space-y-1">
                    {Object.entries(statistics.yachtSizeDistribution).map(([size, count]) => (
                      <div key={size} className="flex justify-between text-sm">
                        <span>{size}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by use case" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Use Cases</SelectItem>
            <SelectItem value="commercial_charter">Commercial Charter</SelectItem>
            <SelectItem value="private_use">Private Use</SelectItem>
            <SelectItem value="racing">Racing</SelectItem>
            <SelectItem value="expedition">Expedition</SelectItem>
            <SelectItem value="day_sailing">Day Sailing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {groupByUseCase ? (
        <div className="space-y-8">
          {Object.entries(groupedReviews).map(([useCase, useCaseReviews]) => (
            <div key={useCase} data-testid={`use-case-${useCase.replace('_', '-')}`}>
              <h3 className="text-lg font-semibold mb-4">{getUseCaseLabel(useCase)}</h3>
              <div className="space-y-4">
                {useCaseReviews.map((review) => (
                  <Card key={review.id} data-testid={`review-card-${review.id}`}>
                    {/* Review Card Content */}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <Card
              key={review.id}
              data-testid={`review-card-${review.id}`}
              className={cn(
                "hover:shadow-md transition-shadow",
                showModerationFlags && review.flagged && "border-red-200 bg-red-50"
              )}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {review.ownerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.ownerName}</span>
                          {review.verified && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800" data-testid="verified-reviewer">
                              <Verified className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        {review.yachtName && (
                          <div className="text-sm text-muted-foreground">
                            {review.yachtName} {review.yachtLength && `(${review.yachtLength})`}
                          </div>
                        )}
                        {showInstallationDates && review.installationDate && (
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Installed: {formatDate(review.installationDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="sr-only" data-testid={`review-rating-${review.rating}`}>
                        {review.rating} stars
                      </span>
                      {showModerationFlags && review.flagged && (
                        <Flag className="h-4 w-4 text-red-500" data-testid={`review-flagged-${review.id}`} />
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div>
                    <h3 className="font-medium mb-2">{review.title}</h3>
                    <p className="text-muted-foreground">{review.review}</p>
                  </div>

                  {/* Pros and Cons */}
                  {(review.pros?.length || review.cons?.length) && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {review.pros && review.pros.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2">Pros</h4>
                          <ul className="text-sm space-y-1">
                            {review.pros.map((pro, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-green-600 mt-0.5">+</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {review.cons && review.cons.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2">Cons</h4>
                          <ul className="text-sm space-y-1">
                            {review.cons.map((con, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-red-600 mt-0.5">-</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {review.images.map((image, index) => (
                        <div key={index} className="relative h-20 w-20 flex-shrink-0">
                          <Image
                            src={image}
                            alt={`Review image from ${review.ownerName}`}
                            fill
                            sizes="80px"
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vendor Response */}
                  {showVendorResponses && review.vendorResponse && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid={`vendor-response-${review.id}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-blue-700">
                          {review.vendorResponse.respondedBy}
                        </Badge>
                        <span className="text-xs text-blue-600">
                          {formatDate(review.vendorResponse.respondedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">{review.vendorResponse.message}</p>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      {onVoteHelpful && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onVoteHelpful(review.id)}
                          data-testid={`helpful-button-${review.id}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful ({review.helpful || 0})
                        </Button>
                      )}
                      {review.useCase && (
                        <Badge variant="outline" className="text-xs">
                          {getUseCaseLabel(review.useCase)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center" data-testid="pagination-controls">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review Submission Form */}
      {allowSubmission && showSubmissionForm && (
        <Card data-testid="review-submission-form">
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(newReview.rating || 5, 'md')}
                <Select
                  value={newReview.rating?.toString() || '5'}
                  onValueChange={(value) => setNewReview(prev => ({ ...prev, rating: parseInt(value) }))}
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
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  value={newReview.ownerName || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="Captain Smith"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Yacht Name (optional)</label>
                <Input
                  value={newReview.yachtName || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, yachtName: e.target.value }))}
                  placeholder="Ocean Dream"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Review Title</label>
              <Input
                value={newReview.title || ''}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Great navigation system"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Review</label>
              <Textarea
                value={newReview.review || ''}
                onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmissionForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={!newReview.title || !newReview.review || !newReview.ownerName}
              >
                Submit Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}