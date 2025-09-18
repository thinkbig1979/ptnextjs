import * as React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CaseStudyNavigation } from '../CaseStudyNavigation';
import type { VendorCaseStudy } from '@/lib/types';

// Mock Next.js useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/vendors/marine-tech-solutions/case-studies/advanced-navigation',
}));

describe('CaseStudyNavigation', () => {
  const mockCaseStudies: VendorCaseStudy[] = [
    {
      title: 'Advanced Navigation System Integration',
      slug: 'advanced-navigation-system',
      challenge: 'Navigation system integration',
      solution: 'Custom software platform'
    },
    {
      title: 'Luxury Yacht Entertainment Network',
      slug: 'luxury-yacht-entertainment',
      challenge: 'Entertainment system setup',
      solution: 'Integrated media platform'
    },
    {
      title: 'Security System Implementation',
      slug: 'security-system-implementation',
      challenge: 'Security infrastructure',
      solution: 'Comprehensive security suite'
    }
  ];

  const defaultProps = {
    caseStudies: mockCaseStudies,
    currentSlug: 'advanced-navigation-system',
    vendorSlug: 'marine-tech-solutions'
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders all case study navigation items', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    expect(screen.getByText('Advanced Navigation System Integration')).toBeInTheDocument();
    expect(screen.getByText('Luxury Yacht Entertainment Network')).toBeInTheDocument();
    expect(screen.getByText('Security System Implementation')).toBeInTheDocument();
  });

  it('highlights current case study', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const currentItem = screen.getByTestId('nav-item-advanced-navigation-system');
    expect(currentItem).toHaveClass('bg-accent/10', 'border-accent');
  });

  it('shows inactive state for other case studies', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const inactiveItem = screen.getByTestId('nav-item-luxury-yacht-entertainment');
    expect(inactiveItem).not.toHaveClass('bg-accent/10', 'border-accent');
    expect(inactiveItem).toHaveClass('hover:bg-muted/50');
  });

  it('includes previous and next navigation buttons', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('disables previous button on first case study', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('enables next button when not on last case study', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('disables next button on last case study', () => {
    const lastCaseProps = { ...defaultProps, currentSlug: 'security-system-implementation' };
    render(<CaseStudyNavigation {...lastCaseProps} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('navigates to previous case study when clicked', () => {
    const middleCaseProps = { ...defaultProps, currentSlug: 'luxury-yacht-entertainment' };
    render(<CaseStudyNavigation {...middleCaseProps} />);

    const prevButton = screen.getByRole('button', { name: /Previous:/i });
    fireEvent.click(prevButton);

    expect(mockPush).toHaveBeenCalledWith('/vendors/marine-tech-solutions/case-studies/advanced-navigation-system');
  });

  it('navigates to next case study when clicked', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const nextButton = screen.getByRole('button', { name: /Next:/i });
    fireEvent.click(nextButton);

    expect(mockPush).toHaveBeenCalledWith('/vendors/marine-tech-solutions/case-studies/luxury-yacht-entertainment');
  });

  it('navigates to case study when navigation item clicked', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const navItem = screen.getByTestId('nav-item-security-system-implementation');
    fireEvent.click(navItem);

    expect(mockPush).toHaveBeenCalledWith('/vendors/marine-tech-solutions/case-studies/security-system-implementation');
  });

  it('includes back to vendor profile link', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const backLink = screen.getByRole('link', { name: /back to vendor profile/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/vendors/marine-tech-solutions');
  });

  it('displays case study count', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('updates case study count based on current position', () => {
    const middleCaseProps = { ...defaultProps, currentSlug: 'luxury-yacht-entertainment' };
    render(<CaseStudyNavigation {...middleCaseProps} />);

    expect(screen.getByText('2 of 3')).toBeInTheDocument();
  });

  it('handles single case study scenario', () => {
    const singleCaseProps = {
      ...defaultProps,
      caseStudies: [mockCaseStudies[0]]
    };

    render(<CaseStudyNavigation {...singleCaseProps} />);

    expect(screen.getByText('1 of 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('handles empty case studies array', () => {
    const emptyProps = { ...defaultProps, caseStudies: [] };
    render(<CaseStudyNavigation {...emptyProps} />);

    expect(screen.getByTestId('no-case-studies')).toBeInTheDocument();
  });

  it('includes keyboard navigation support', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const nextButton = screen.getByRole('button', { name: /Next:/i });
    fireEvent.keyDown(nextButton, { key: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/vendors/marine-tech-solutions/case-studies/luxury-yacht-entertainment');
  });

  it('applies mobile-responsive layout', () => {
    render(<CaseStudyNavigation {...defaultProps} />);

    const container = screen.getByTestId('case-study-navigation');
    expect(container).toHaveClass('flex', 'flex-col', 'lg:flex-row');
  });

  it('applies custom className when provided', () => {
    render(<CaseStudyNavigation {...defaultProps} className="custom-class" />);

    expect(screen.getByTestId('case-study-navigation')).toHaveClass('custom-class');
  });
});