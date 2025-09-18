import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { YachtCard } from '../YachtCard';
import type { Yacht } from '@/lib/types';

describe('YachtCard', () => {
  const mockYacht: Yacht = {
    id: '1',
    slug: 'test-yacht',
    name: 'M/Y Test Yacht',
    description: 'A stunning motor yacht with cutting-edge technology.',
    image: '/images/yachts/test-yacht.jpg',
    length: 50,
    beam: 9.5,
    builder: 'Test Shipyard',
    launchYear: 2023,
    homePort: 'Monaco',
    guests: 12,
    crew: 8,
    featured: true,
    category: 'motor-yacht',
    tags: ['luxury', 'explorer'],
    timeline: [
      {
        date: '2023-06-15',
        event: 'Launch',
        category: 'launch',
        location: 'Test Shipyard, Netherlands'
      }
    ],
    supplierMap: [
      {
        vendorId: 'vendor-1',
        vendorName: 'Test Electronics',
        discipline: 'Electronics',
        systems: ['Navigation', 'Communication'],
        role: 'primary'
      }
    ],
    sustainabilityScore: {
      overallScore: 85,
      co2Emissions: 1200,
      energyEfficiency: 2.5
    }
  };

  it('renders yacht name and basic information', () => {
    render(<YachtCard yacht={mockYacht} />);

    expect(screen.getByText('M/Y Test Yacht')).toBeInTheDocument();
    expect(screen.getByText(/A stunning motor yacht/)).toBeInTheDocument();
    expect(screen.getByText('Test Shipyard')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('displays yacht specifications', () => {
    render(<YachtCard yacht={mockYacht} />);

    expect(screen.getByText('50m')).toBeInTheDocument();
    expect(screen.getByText(/12 guests/i)).toBeInTheDocument();
    expect(screen.getByText(/8 crew/i)).toBeInTheDocument();
  });

  it('shows featured badge when yacht is featured', () => {
    render(<YachtCard yacht={mockYacht} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not show featured badge when yacht is not featured', () => {
    const nonFeaturedYacht = { ...mockYacht, featured: false };
    render(<YachtCard yacht={nonFeaturedYacht} />);

    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('displays sustainability score when available', () => {
    render(<YachtCard yacht={mockYacht} />);

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/sustainability/i)).toBeInTheDocument();
  });

  it('shows supplier count when supplier map is available', () => {
    render(<YachtCard yacht={mockYacht} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/supplier/i)).toBeInTheDocument();
  });

  it('renders yacht image with correct alt text', () => {
    render(<YachtCard yacht={mockYacht} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'M/Y Test Yacht');
    expect(image).toHaveAttribute('src', expect.stringContaining('test-yacht.jpg'));
  });

  it('applies hover-lift class for card animation', () => {
    render(<YachtCard yacht={mockYacht} />);

    const card = screen.getByTestId('yacht-card');
    expect(card).toHaveClass('hover-lift');
  });

  it('handles missing optional data gracefully', () => {
    const minimalYacht: Yacht = {
      id: '2',
      name: 'Minimal Yacht',
      description: 'Basic yacht data.'
    };

    render(<YachtCard yacht={minimalYacht} />);

    expect(screen.getByText('Minimal Yacht')).toBeInTheDocument();
    expect(screen.getByText('Basic yacht data.')).toBeInTheDocument();
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('links to yacht detail page with correct href', () => {
    render(<YachtCard yacht={mockYacht} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/yachts/test-yacht');
  });

  it('displays tags when available', () => {
    render(<YachtCard yacht={mockYacht} />);

    expect(screen.getByText('luxury')).toBeInTheDocument();
    expect(screen.getByText('explorer')).toBeInTheDocument();
  });
});