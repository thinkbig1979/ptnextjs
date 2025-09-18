import * as React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OwnerReviews } from '../OwnerReviews';
import type { Product, OwnerReview } from '@/lib/types';

describe('OwnerReviews', () => {
  const mockReviews: OwnerReview[] = [
    {
      id: 'review-1',
      productId: 'product-1',
      ownerName: 'Captain Smith',
      yachtName: 'Ocean Dream',
      yachtLength: '45m',
      rating: 5,
      title: 'Exceptional Navigation System',
      review: 'This navigation system has transformed our operations. The accuracy is outstanding and the integration with our existing systems was seamless.',
      pros: ['Easy installation', 'Accurate positioning', 'Great support'],
      cons: ['Higher power consumption than expected'],
      installationDate: '2023-06-15',
      verified: true,
      helpful: 24,
      images: ['/images/reviews/ocean-dream-nav.jpg'],
      useCase: 'Commercial Charter'
    },
    {
      id: 'review-2',
      productId: 'product-1',
      ownerName: 'Marina Rodriguez',
      yachtName: 'Sea Breeze',
      yachtLength: '38m',
      rating: 4,
      title: 'Good Value for Money',
      review: 'Solid performance overall. Setup took longer than expected but customer service was helpful throughout the process.',
      pros: ['Reliable performance', 'Good customer service'],
      cons: ['Complex installation', 'Manual could be clearer'],
      installationDate: '2023-08-20',
      verified: true,
      helpful: 18,
      useCase: 'Private Use'
    },
    {
      id: 'review-3',
      productId: 'product-1',
      ownerName: 'James Thompson',
      yachtName: 'Freedom',
      yachtLength: '52m',
      rating: 3,
      title: 'Mixed Experience',
      review: 'Works as advertised but had some compatibility issues with our older radar system.',
      pros: ['Good accuracy'],
      cons: ['Compatibility issues', 'Expensive'],
      installationDate: '2023-09-10',
      verified: false,
      helpful: 8,
      useCase: 'Commercial Charter'
    }
  ];

  const mockProduct: Product = {
    id: 'product-1',
    slug: 'advanced-navigation-system',
    name: 'Advanced Navigation System',
    description: 'State-of-the-art marine navigation technology',
    vendorId: 'vendor-1',
    vendorName: 'Marine Tech Solutions',
    images: [],
    features: [],
    ownerReviews: mockReviews,
    averageRating: 4.0,
    totalReviews: 3
  };

  it('renders owner reviews with rating summary', () => {
    render(<OwnerReviews reviews={mockReviews} />);

    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
    expect(screen.getByText('Owner Reviews')).toBeInTheDocument();
    expect(screen.getByTestId('rating-summary')).toBeInTheDocument();
  });

  it('displays individual review details correctly', () => {
    render(<OwnerReviews reviews={mockReviews} />);

    expect(screen.getByText('Captain Smith')).toBeInTheDocument();
    expect(screen.getByText('Ocean Dream')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
    expect(screen.getByText('Exceptional Navigation System')).toBeInTheDocument();
    expect(screen.getByTestId('review-rating-5')).toBeInTheDocument();
  });

  it('shows verified reviewer badges', () => {
    render(<OwnerReviews reviews={mockReviews} />);

    const verifiedBadges = screen.getAllByTestId('verified-reviewer');
    expect(verifiedBadges).toHaveLength(2); // Two verified reviews
  });

  it('displays pros and cons lists', () => {
    render(<OwnerReviews reviews={mockReviews} />);

    expect(screen.getByText('Easy installation')).toBeInTheDocument();
    expect(screen.getByText('Accurate positioning')).toBeInTheDocument();
    expect(screen.getByText('Higher power consumption than expected')).toBeInTheDocument();
  });

  it('handles helpful voting functionality', async () => {
    const mockOnVoteHelpful = jest.fn();
    render(<OwnerReviews reviews={mockReviews} onVoteHelpful={mockOnVoteHelpful} />);

    const helpfulButton = screen.getByTestId('helpful-button-review-1');
    fireEvent.click(helpfulButton);

    expect(mockOnVoteHelpful).toHaveBeenCalledWith('review-1');
  });

  it('shows review images when available', () => {
    render(<OwnerReviews reviews={mockReviews} />);

    const reviewImage = screen.getByAltText('Review image from Captain Smith');
    expect(reviewImage).toBeInTheDocument();
    expect(reviewImage.getAttribute('src')).toContain('ocean-dream-nav.jpg');
  });

  it('filters reviews by rating when enabled', () => {
    render(<OwnerReviews reviews={mockReviews} filterByRating={5} />);

    expect(screen.getByText('Captain Smith')).toBeInTheDocument();
    expect(screen.queryByText('Marina Rodriguez')).not.toBeInTheDocument();
    expect(screen.queryByText('James Thompson')).not.toBeInTheDocument();
  });

  it('sorts reviews by date, rating, or helpfulness', () => {
    render(<OwnerReviews reviews={mockReviews} sortBy="rating" sortOrder="desc" />);

    const reviewCards = screen.getAllByTestId(/review-card-/);
    expect(reviewCards[0]).toHaveTextContent('Captain Smith'); // 5-star review first
  });

  it('displays review statistics and averages', () => {
    render(<OwnerReviews reviews={mockReviews} showStatistics />);

    expect(screen.getByTestId('review-statistics')).toBeInTheDocument();
    expect(screen.getByText(/Average Rating/)).toBeInTheDocument();
    expect(screen.getByText(/Total Reviews/)).toBeInTheDocument();
  });

  it('handles empty reviews array', () => {
    render(<OwnerReviews reviews={[]} />);

    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
    expect(screen.getByText(/No reviews available/)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<OwnerReviews reviews={mockReviews} className="custom-reviews-class" />);

    expect(screen.getByTestId('owner-reviews')).toHaveClass('custom-reviews-class');
  });

  it('supports pagination for large review lists', () => {
    const manyReviews = Array.from({ length: 15 }, (_, i) => ({
      ...mockReviews[0],
      id: `review-${i + 1}`,
      ownerName: `Owner ${i + 1}`
    }));

    render(<OwnerReviews reviews={manyReviews} itemsPerPage={5} />);

    const reviewCards = screen.getAllByTestId(/review-card-/);
    expect(reviewCards).toHaveLength(5);
    expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
  });

  it('displays use case categories', () => {
    render(<OwnerReviews reviews={mockReviews} groupByUseCase />);

    expect(screen.getByTestId('use-case-commercial-charter')).toBeInTheDocument();
    expect(screen.getByTestId('use-case-private-use')).toBeInTheDocument();
  });

  it('shows installation timeline information', () => {
    render(<OwnerReviews reviews={mockReviews} showInstallationDates />);

    expect(screen.getByText(/Installed: June 2023/)).toBeInTheDocument();
    expect(screen.getByText(/Installed: August 2023/)).toBeInTheDocument();
  });

  it('handles review search functionality', () => {
    render(<OwnerReviews reviews={mockReviews} searchable />);

    const searchInput = screen.getByPlaceholderText('Search reviews...');
    fireEvent.change(searchInput, { target: { value: 'navigation' } });

    expect(screen.getByText('Exceptional Navigation System')).toBeInTheDocument();
    expect(screen.queryByText('Good Value for Money')).not.toBeInTheDocument();
  });

  it('displays yacht length distribution', () => {
    render(<OwnerReviews reviews={mockReviews} showYachtSizes />);

    expect(screen.getByTestId('yacht-size-distribution')).toBeInTheDocument();
    expect(screen.getByText(/30-40m/)).toBeInTheDocument();
    expect(screen.getByText(/40-50m/)).toBeInTheDocument();
    expect(screen.getByText(/50m+/)).toBeInTheDocument();
  });

  it('handles review moderation flags', () => {
    const reviewsWithFlags = mockReviews.map(review => ({
      ...review,
      flagged: review.id === 'review-3'
    }));

    render(<OwnerReviews reviews={reviewsWithFlags} showModerationFlags />);

    expect(screen.getByTestId('review-flagged-review-3')).toBeInTheDocument();
  });

  it('supports review response from vendor', () => {
    const reviewsWithResponses = mockReviews.map(review => ({
      ...review,
      vendorResponse: review.id === 'review-2' ? {
        message: 'Thank you for your feedback. We have updated our installation guide.',
        respondedAt: '2023-09-01',
        respondedBy: 'Marine Tech Solutions'
      } : undefined
    }));

    render(<OwnerReviews reviews={reviewsWithResponses} showVendorResponses />);

    expect(screen.getByTestId('vendor-response-review-2')).toBeInTheDocument();
    expect(screen.getByText('Thank you for your feedback')).toBeInTheDocument();
  });

  it('handles responsive design for mobile devices', () => {
    render(<OwnerReviews reviews={mockReviews} />);

    const reviewsContainer = screen.getByTestId('owner-reviews');
    expect(reviewsContainer).toHaveClass('w-full');
  });

  it('shows review submission form when enabled', () => {
    render(<OwnerReviews reviews={mockReviews} allowSubmission />);

    expect(screen.getByTestId('review-submission-form')).toBeInTheDocument();
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
  });

  it('handles review submission', async () => {
    const mockOnSubmitReview = jest.fn();
    render(
      <OwnerReviews
        reviews={mockReviews}
        allowSubmission
        onSubmitReview={mockOnSubmitReview}
      />
    );

    const submitButton = screen.getByTestId('submit-review-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmitReview).toHaveBeenCalled();
    });
  });
});