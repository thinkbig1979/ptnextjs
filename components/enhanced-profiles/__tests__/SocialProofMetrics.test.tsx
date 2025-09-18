import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocialProofMetrics } from '../SocialProofMetrics';

describe('SocialProofMetrics', () => {
  const mockMetrics = {
    linkedinFollowers: 15200,
    completedProjects: 127,
    yearsInBusiness: 18,
    clientSatisfactionRate: 98.5,
    industryRanking: 3,
    teamSize: 45,
    globalPresence: 12
  };

  it('renders all social proof metrics', () => {
    render(<SocialProofMetrics metrics={mockMetrics} />);

    expect(screen.getByText('15.2K')).toBeInTheDocument(); // LinkedIn followers
    expect(screen.getByText('127')).toBeInTheDocument(); // Completed projects
    expect(screen.getByText('18')).toBeInTheDocument(); // Years in business
    expect(screen.getByText('98.5%')).toBeInTheDocument(); // Client satisfaction
  });

  it('displays metric labels correctly', () => {
    render(<SocialProofMetrics metrics={mockMetrics} />);

    expect(screen.getByText('LinkedIn Followers')).toBeInTheDocument();
    expect(screen.getByText('Completed Projects')).toBeInTheDocument();
    expect(screen.getByText('Years in Business')).toBeInTheDocument();
    expect(screen.getByText('Client Satisfaction')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const largeMetrics = {
      ...mockMetrics,
      linkedinFollowers: 1234567,
      completedProjects: 2500
    };

    render(<SocialProofMetrics metrics={largeMetrics} />);

    expect(screen.getByText('1.2M')).toBeInTheDocument();
    expect(screen.getByText('2.5K')).toBeInTheDocument();
  });

  it('shows industry ranking with ordinal suffix', () => {
    render(<SocialProofMetrics metrics={mockMetrics} />);

    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('Industry Ranking')).toBeInTheDocument();
  });

  it('displays team size and global presence', () => {
    render(<SocialProofMetrics metrics={mockMetrics} />);

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Countries')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(<SocialProofMetrics metrics={null} loading={true} />);

    expect(screen.getByTestId('metrics-skeleton')).toBeInTheDocument();
  });

  it('handles missing metrics gracefully', () => {
    const partialMetrics = {
      linkedinFollowers: 1000,
      completedProjects: 50
    };

    render(<SocialProofMetrics metrics={partialMetrics} />);

    expect(screen.getByText('1.0K')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    // Should not crash when other metrics are missing
  });

  it('applies custom className when provided', () => {
    render(<SocialProofMetrics metrics={mockMetrics} className="custom-metrics" />);

    expect(screen.getByTestId('social-proof-metrics')).toHaveClass('custom-metrics');
  });

  it('shows animated counters on mount', () => {
    render(<SocialProofMetrics metrics={mockMetrics} animated={true} />);

    expect(screen.getAllByTestId('animated-counter')).toHaveLength(7);
  });

  it('displays icons for each metric type', () => {
    render(<SocialProofMetrics metrics={mockMetrics} />);

    expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
    expect(screen.getByTestId('projects-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
  });

  it('formats percentage values correctly', () => {
    render(<SocialProofMetrics metrics={mockMetrics} />);

    const satisfactionRate = screen.getByText('98.5%');
    expect(satisfactionRate).toBeInTheDocument();
    expect(satisfactionRate.closest('[data-testid="metric-item"]')).toHaveClass('text-green-600');
  });
});