import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CaseStudyDetail } from '../CaseStudyDetail';
import type { VendorCaseStudy } from '@/lib/types';

describe('CaseStudyDetail', () => {
  const mockCaseStudy: VendorCaseStudy = {
    title: 'Advanced Navigation System Integration',
    slug: 'advanced-navigation-system',
    client: 'Luxury Yacht Manufacturer',
    challenge: 'The client required integration of multiple navigation systems including radar, GPS, AIS, and electronic chart systems into a unified interface for their new 80m superyacht. The existing systems were from different manufacturers with incompatible protocols.',
    solution: 'We developed a custom integration software platform that connects all navigation systems through standardized NMEA 2000 protocols. The solution includes a React Native dashboard with real-time data visualization and automated collision avoidance alerts.',
    results: 'The integrated system reduced navigation workload by 40%, improved safety ratings, and received certification from major maritime authorities. The client reported significant improvements in crew efficiency and operational safety.',
    images: [
      '/images/case-studies/nav-system-1.jpg',
      '/images/case-studies/nav-system-2.jpg',
      '/images/case-studies/nav-system-3.jpg'
    ],
    technologies: ['React Native', 'NMEA 2000', 'Chart APIs', 'Real-time Systems', 'TypeScript']
  };

  const mockVendor = {
    name: 'Marine Tech Solutions',
    slug: 'marine-tech-solutions'
  };

  it('renders case study title and client', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    expect(screen.getByRole('heading', { name: 'Advanced Navigation System Integration' })).toBeInTheDocument();
    expect(screen.getByText('Client: Luxury Yacht Manufacturer')).toBeInTheDocument();
  });

  it('displays challenge section with full content', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    expect(screen.getByRole('heading', { name: 'Challenge' })).toBeInTheDocument();
    expect(screen.getByText(/The client required integration of multiple navigation systems/)).toBeInTheDocument();
  });

  it('displays solution section with full content', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    expect(screen.getByRole('heading', { name: 'Solution' })).toBeInTheDocument();
    expect(screen.getByText(/We developed a custom integration software platform/)).toBeInTheDocument();
  });

  it('displays results section when provided', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    expect(screen.getByRole('heading', { name: 'Results' })).toBeInTheDocument();
    expect(screen.getByText(/The integrated system reduced navigation workload by 40%/)).toBeInTheDocument();
  });

  it('renders image gallery when images provided', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0].getAttribute('src')).toContain('nav-system-1.jpg');
    expect(images[1].getAttribute('src')).toContain('nav-system-2.jpg');
    expect(images[2].getAttribute('src')).toContain('nav-system-3.jpg');
  });

  it('displays technology tags', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    expect(screen.getByText('React Native')).toBeInTheDocument();
    expect(screen.getByText('NMEA 2000')).toBeInTheDocument();
    expect(screen.getByText('Chart APIs')).toBeInTheDocument();
    expect(screen.getByText('Real-time Systems')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('includes breadcrumb navigation', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    expect(screen.getByRole('link', { name: 'Marine Tech Solutions' })).toBeInTheDocument();
    expect(screen.getByText('Case Studies')).toBeInTheDocument();
    expect(screen.getAllByText('Advanced Navigation System Integration')).toHaveLength(2); // Breadcrumb + heading
  });

  it('includes back to vendor profile link', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    const backLink = screen.getByRole('link', { name: /back to Marine Tech Solutions/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/vendors/marine-tech-solutions');
  });

  it('handles case study without results', () => {
    const caseStudyNoResults = { ...mockCaseStudy, results: undefined };
    render(<CaseStudyDetail caseStudy={caseStudyNoResults} vendor={mockVendor} />);

    expect(screen.queryByRole('heading', { name: 'Results' })).not.toBeInTheDocument();
  });

  it('handles case study without images', () => {
    const caseStudyNoImages = { ...mockCaseStudy, images: [] };
    render(<CaseStudyDetail caseStudy={caseStudyNoImages} vendor={mockVendor} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('handles case study without technologies', () => {
    const caseStudyNoTech = { ...mockCaseStudy, technologies: [] };
    render(<CaseStudyDetail caseStudy={caseStudyNoTech} vendor={mockVendor} />);

    expect(screen.queryByTestId('technology-tags')).not.toBeInTheDocument();
  });

  it('includes share functionality', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    expect(screen.getByRole('button', { name: /share case study/i })).toBeInTheDocument();
  });

  it('applies responsive layout classes', () => {
    render(<CaseStudyDetail caseStudy={mockCaseStudy} vendor={mockVendor} />);

    const container = screen.getByTestId('case-study-detail');
    expect(container).toHaveClass('container', 'max-w-4xl', 'mx-auto');
  });
});