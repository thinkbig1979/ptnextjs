import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CaseStudyCard } from '../CaseStudyCard';
import type { VendorCaseStudy } from '@/lib/types';

describe('CaseStudyCard', () => {
  const mockCaseStudy: VendorCaseStudy = {
    title: 'Advanced Navigation System Integration',
    slug: 'advanced-navigation-system',
    client: 'Luxury Yacht Manufacturer',
    challenge: 'Integrate multiple navigation systems with unified interface for 80m superyacht',
    solution: 'Developed custom integration software connecting radar, GPS, AIS, and chart systems',
    results: 'Reduced navigation workload by 40% and improved safety ratings',
    images: [
      '/images/case-studies/nav-system-1.jpg',
      '/images/case-studies/nav-system-2.jpg'
    ],
    technologies: ['React Native', 'NMEA 2000', 'Chart APIs', 'Real-time Systems']
  };

  it('renders case study title and client', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} />);

    expect(screen.getByText('Advanced Navigation System Integration')).toBeInTheDocument();
    expect(screen.getByText('Luxury Yacht Manufacturer')).toBeInTheDocument();
  });

  it('displays challenge summary', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} />);

    expect(screen.getByText(/Integrate multiple navigation systems/)).toBeInTheDocument();
  });

  it('shows technology tags', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} />);

    expect(screen.getByText('React Native')).toBeInTheDocument();
    expect(screen.getByText('NMEA 2000')).toBeInTheDocument();
    expect(screen.getByText('Chart APIs')).toBeInTheDocument();
    expect(screen.getByText('Real-time Systems')).toBeInTheDocument();
  });

  it('renders main image when provided', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} />);

    const image = screen.getByAltText('Advanced Navigation System Integration case study');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toContain('nav-system-1.jpg');
  });

  it('links to case study detail page', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} vendorSlug="marine-tech-solutions" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/vendors/marine-tech-solutions/case-studies/advanced-navigation-system');
  });

  it('handles case study without images', () => {
    const caseStudyNoImages = { ...mockCaseStudy, images: [] };
    render(<CaseStudyCard caseStudy={caseStudyNoImages} />);

    expect(screen.getByTestId('case-study-placeholder')).toBeInTheDocument();
  });

  it('handles case study without client', () => {
    const caseStudyNoClient = { ...mockCaseStudy, client: undefined };
    render(<CaseStudyCard caseStudy={caseStudyNoClient} />);

    expect(screen.queryByText('Luxury Yacht Manufacturer')).not.toBeInTheDocument();
    expect(screen.getByText('Advanced Navigation System Integration')).toBeInTheDocument();
  });

  it('truncates long challenge text', () => {
    const longChallenge = 'This is a very long challenge description that should be truncated to maintain card layout consistency and prevent overflow issues in the grid layout system used for displaying multiple case studies on the vendor profile page';
    const caseStudyLongText = { ...mockCaseStudy, challenge: longChallenge };

    render(<CaseStudyCard caseStudy={caseStudyLongText} />);

    const challengeElement = screen.getByTestId('case-study-challenge');
    expect(challengeElement).toHaveClass('line-clamp-3');
  });

  it('applies custom className when provided', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} className="custom-class" />);

    expect(screen.getByTestId('case-study-card')).toHaveClass('custom-class');
  });

  it('handles hover interactions', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} />);

    const card = screen.getByTestId('case-study-card');
    expect(card).toHaveClass('hover:shadow-xl', 'transition-all');
  });

  it('displays read more indicator', () => {
    render(<CaseStudyCard caseStudy={mockCaseStudy} />);

    expect(screen.getByText(/Read case study/i)).toBeInTheDocument();
  });
});