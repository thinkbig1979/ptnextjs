import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AwardsSection } from '../AwardsSection';

describe('AwardsSection', () => {
  const mockAwards = [
    {
      id: '1',
      title: 'Innovation Excellence Award',
      organization: 'Marine Technology Association',
      year: 2023,
      description: 'Recognized for breakthrough in sustainable yacht systems',
      category: 'Innovation',
      imageUrl: '/images/award1.jpg',
      certificateUrl: 'https://example.com/cert1.pdf'
    },
    {
      id: '2',
      title: 'Best Supplier Award',
      organization: 'Yacht Industry Council',
      year: 2022,
      description: 'Outstanding performance in client satisfaction',
      category: 'Service',
      imageUrl: '/images/award2.jpg'
    }
  ];

  it('renders section title', () => {
    render(<AwardsSection awards={mockAwards} />);

    expect(screen.getByRole('heading', { name: /awards/i })).toBeInTheDocument();
  });

  it('displays all awards in timeline format', () => {
    render(<AwardsSection awards={mockAwards} />);

    expect(screen.getByText('Innovation Excellence Award')).toBeInTheDocument();
    expect(screen.getByText('Best Supplier Award')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
  });

  it('shows award organizations and descriptions', () => {
    render(<AwardsSection awards={mockAwards} />);

    expect(screen.getByText('Marine Technology Association')).toBeInTheDocument();
    expect(screen.getByText('Yacht Industry Council')).toBeInTheDocument();
    expect(screen.getByText('Recognized for breakthrough in sustainable yacht systems')).toBeInTheDocument();
  });

  it('renders award images when provided', () => {
    render(<AwardsSection awards={mockAwards} />);

    const image1 = screen.getByAltText('Innovation Excellence Award');
    const image2 = screen.getByAltText('Best Supplier Award');

    expect(image1).toBeInTheDocument();
    expect(image2).toBeInTheDocument();
    expect(image1.getAttribute('src')).toContain('award1.jpg');
  });

  it('displays award categories', () => {
    render(<AwardsSection awards={mockAwards} />);

    expect(screen.getByText('Innovation')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('links to certificates when available', () => {
    render(<AwardsSection awards={mockAwards} />);

    const certificateLink = screen.getByRole('link', { name: /view certificate/i });
    expect(certificateLink).toHaveAttribute('href', 'https://example.com/cert1.pdf');
    expect(certificateLink).toHaveAttribute('target', '_blank');
  });

  it('renders empty state when no awards provided', () => {
    render(<AwardsSection awards={[]} />);

    expect(screen.getByText(/no awards/i)).toBeInTheDocument();
  });

  it('sorts awards by year in descending order', () => {
    render(<AwardsSection awards={mockAwards} />);

    const years = screen.getAllByTestId('award-year');
    expect(years[0]).toHaveTextContent('2023');
    expect(years[1]).toHaveTextContent('2022');
  });

  it('applies custom className when provided', () => {
    render(<AwardsSection awards={mockAwards} className="custom-awards" />);

    expect(screen.getByTestId('awards-section')).toHaveClass('custom-awards');
  });

  it('displays timeline connector between awards', () => {
    render(<AwardsSection awards={mockAwards} />);

    expect(screen.getByTestId('timeline-connector')).toBeInTheDocument();
  });
});