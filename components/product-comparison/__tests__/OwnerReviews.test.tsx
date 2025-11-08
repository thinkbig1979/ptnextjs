import * as React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OwnerReviews } from '../OwnerReviews';
import type { OwnerReview } from '@/lib/types';

// Mock hCaptcha
jest.mock('@hcaptcha/react-hcaptcha', () => {
  return function MockHCaptcha() {
    return <div data-testid="hcaptcha-mock" />;
  };
});

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
      review: 'This navigation system has transformed our operations.',
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
      review: 'Solid performance overall.',
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
      review: 'Works as advertised but had some compatibility issues.',
      pros: ['Good accuracy'],
      cons: ['Compatibility issues', 'Expensive'],
      installationDate: '2023-09-10',
      verified: false,
      helpful: 8,
      useCase: 'Commercial Charter'
    }
  ];

  it('renders owner reviews with rating summary', () => {
    render(<OwnerReviews reviews={mockReviews} />);
    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
    expect(screen.getByText('Owner Reviews')).toBeInTheDocument();
  });

  it('displays individual review details correctly', () => {
    render(<OwnerReviews reviews={mockReviews} />);
    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
  });

  it('shows verified reviewer badges', () => {
    render(<OwnerReviews reviews={mockReviews} />);
    const verifiedBadges = screen.getAllByTestId('verified-reviewer');
    expect(verifiedBadges.length).toBeGreaterThan(0);
  });

  it('displays pros and cons lists', () => {
    render(<OwnerReviews reviews={mockReviews} />);
    expect(screen.getByText('Easy installation')).toBeInTheDocument();
    expect(screen.getByText('Higher power consumption than expected')).toBeInTheDocument();
  });

  it('handles helpful voting functionality', () => {
    const mockOnVoteHelpful = jest.fn();
    render(<OwnerReviews reviews={mockReviews} onVoteHelpful={mockOnVoteHelpful} />);
    fireEvent.click(screen.getByTestId('helpful-button-review-1'));
    expect(mockOnVoteHelpful).toHaveBeenCalledWith('review-1');
  });

  it('shows review images when available', () => {
    render(<OwnerReviews reviews={mockReviews} />);
    const img = screen.getByAltText(/Review image/);
    expect(img).toBeInTheDocument();
  });

  it('filters reviews by rating when enabled', () => {
    render(<OwnerReviews reviews={mockReviews} filterByRating={5} />);
    expect(screen.getByText('Captain Smith')).toBeInTheDocument();
  });

  it('sorts reviews by date, rating, or helpfulness', () => {
    render(<OwnerReviews reviews={mockReviews} sortBy="rating" sortOrder="desc" />);
    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
  });

  it('displays review statistics and averages', () => {
    render(<OwnerReviews reviews={mockReviews} showStatistics />);
    expect(screen.getByTestId('review-statistics')).toBeInTheDocument();
  });

  it('handles empty reviews array', () => {
    render(<OwnerReviews reviews={[]} />);
    expect(screen.getByText(/No reviews available/)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<OwnerReviews reviews={mockReviews} className="custom-class" />);
    expect(screen.getByTestId('owner-reviews')).toHaveClass('custom-class');
  });

  it('supports pagination for large review lists', () => {
    const manyReviews = Array(15).fill(null).map((_, n) => ({
      ...mockReviews[0],
      id: `r-${n}`
    }));
    render(<OwnerReviews reviews={manyReviews} itemsPerPage={5} />);
    expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
  });

  it('displays use case categories', () => {
    render(<OwnerReviews reviews={mockReviews} groupByUseCase />);
    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
  });

  it('shows installation timeline information', () => {
    render(<OwnerReviews reviews={mockReviews} showInstallationDates />);
    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
  });

  it('handles review search functionality', () => {
    render(<OwnerReviews reviews={mockReviews} searchable />);
    fireEvent.change(screen.getByPlaceholderText('Search reviews...'), { target: { value: 'navigation' } });
    expect(screen.getByText('Exceptional Navigation System')).toBeInTheDocument();
  });

  it('displays yacht length distribution', () => {
    render(<OwnerReviews reviews={mockReviews} showYachtSizes />);
    expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
  });

  it('handles review moderation flags', () => {
    const flagged = mockReviews.map(r => ({ ...r, flagged: r.id === 'review-3' }));
    render(<OwnerReviews reviews={flagged} showModerationFlags />);
    expect(screen.getByTestId('review-flagged-review-3')).toBeInTheDocument();
  });

  it('supports review response from vendor', () => {
    const withResponse = mockReviews.map(r => ({
      ...r,
      vendorResponse: r.id === 'review-2' ? {
        message: 'Thank you for your feedback.',
        respondedAt: '2023-09-01',
        respondedBy: 'Marine Tech Solutions'
      } : undefined
    }));
    render(<OwnerReviews reviews={withResponse} showVendorResponses />);
    expect(screen.getByTestId('vendor-response-review-2')).toBeInTheDocument();
  });

  it('handles responsive design for mobile devices', () => {
    render(<OwnerReviews reviews={mockReviews} />);
    expect(screen.getByTestId('owner-reviews')).toHaveClass('w-full');
  });

  it('shows review submission form when enabled', () => {
    render(<OwnerReviews reviews={mockReviews} allowSubmission />);
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
  });
});
