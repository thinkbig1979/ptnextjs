import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InnovationHighlights } from '../InnovationHighlights';
import type { VendorInnovationHighlight } from '@/lib/types';

describe('InnovationHighlights', () => {
  const mockInnovations: VendorInnovationHighlight[] = [
    {
      technology: 'Autonomous Navigation AI',
      description: 'Machine learning algorithms for predictive route optimization',
      uniqueApproach: 'First-to-market integration of computer vision with traditional marine radar',
      benefitsToClients: [
        'Reduced fuel consumption by 15%',
        'Improved safety through predictive collision avoidance',
        'Automated weather routing optimization'
      ]
    },
    {
      technology: 'Quantum-Encrypted Communications',
      description: 'Ultra-secure satellite communication system for luxury yachts',
      uniqueApproach: 'Patent-pending quantum key distribution for marine environments',
      benefitsToClients: [
        'Unbreachable communication security',
        'Global coverage including polar regions',
        'Real-time crew coordination'
      ]
    },
    {
      technology: 'Smart Hull Monitoring',
      description: 'IoT sensor network for real-time structural analysis',
      benefitsToClients: [
        'Predictive maintenance scheduling',
        'Reduced insurance premiums'
      ]
    }
  ];

  it('renders all innovation highlights', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    expect(screen.getByText('Autonomous Navigation AI')).toBeInTheDocument();
    expect(screen.getByText('Quantum-Encrypted Communications')).toBeInTheDocument();
    expect(screen.getByText('Smart Hull Monitoring')).toBeInTheDocument();
  });

  it('displays technology descriptions when provided', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    expect(screen.getByText('Machine learning algorithms for predictive route optimization')).toBeInTheDocument();
    expect(screen.getByText('Ultra-secure satellite communication system for luxury yachts')).toBeInTheDocument();
  });

  it('shows unique approach when provided', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    expect(screen.getByText('First-to-market integration of computer vision with traditional marine radar')).toBeInTheDocument();
    expect(screen.getByText('Patent-pending quantum key distribution for marine environments')).toBeInTheDocument();
  });

  it('displays client benefits as list items', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    expect(screen.getByText('Reduced fuel consumption by 15%')).toBeInTheDocument();
    expect(screen.getByText('Improved safety through predictive collision avoidance')).toBeInTheDocument();
    expect(screen.getByText('Unbreachable communication security')).toBeInTheDocument();
    expect(screen.getByText('Predictive maintenance scheduling')).toBeInTheDocument();
  });

  it('handles innovation without unique approach', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    const smartHullSection = screen.getByText('Smart Hull Monitoring').closest('[data-testid="innovation-item"]');
    expect(smartHullSection).not.toHaveTextContent('Unique Approach');
  });

  it('handles innovation without description', () => {
    const innovationNoDescription = [
      {
        technology: 'Basic Tech',
        benefitsToClients: ['Some benefit']
      }
    ];

    render(<InnovationHighlights innovations={innovationNoDescription} />);

    expect(screen.getByText('Basic Tech')).toBeInTheDocument();
    expect(screen.getByText('Some benefit')).toBeInTheDocument();
  });

  it('renders with grid layout for multiple innovations', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    const container = screen.getByTestId('innovation-highlights');
    expect(container).toHaveClass('grid', 'gap-6', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('includes technology showcase icons', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    const techIcons = screen.getAllByTestId('tech-icon');
    expect(techIcons).toHaveLength(3);
  });

  it('applies hover effects to innovation cards', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    const innovationCards = screen.getAllByTestId('innovation-item');
    innovationCards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-lg', 'transition-all');
    });
  });

  it('handles empty innovations array', () => {
    render(<InnovationHighlights innovations={[]} />);

    expect(screen.getByTestId('no-innovations-message')).toBeInTheDocument();
    expect(screen.getByText(/No innovation highlights available/)).toBeInTheDocument();
  });

  it('includes section heading', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    expect(screen.getByRole('heading', { name: /Innovation Highlights/i })).toBeInTheDocument();
  });

  it('displays benefits with checkmark icons', () => {
    render(<InnovationHighlights innovations={mockInnovations} />);

    const benefitItems = screen.getAllByTestId('benefit-item');
    expect(benefitItems.length).toBeGreaterThan(0);

    benefitItems.forEach(item => {
      expect(item).toHaveClass('flex', 'items-center');
    });
  });

  it('applies custom className when provided', () => {
    render(<InnovationHighlights innovations={mockInnovations} className="custom-class" />);

    expect(screen.getByTestId('innovation-highlights')).toHaveClass('custom-class');
  });
});