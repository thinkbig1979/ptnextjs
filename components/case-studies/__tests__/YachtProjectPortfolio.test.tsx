import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { YachtProjectPortfolio } from '../YachtProjectPortfolio';
import type { VendorYachtProject } from '@/lib/types';

describe('YachtProjectPortfolio', () => {
  const mockYachtProjects: VendorYachtProject[] = [
    {
      yachtName: 'Azzam',
      systems: ['Navigation Systems', 'Communication Array', 'Stabilization Control'],
      projectYear: 2023,
      role: 'Primary Systems Integrator',
      description: 'Complete navigation and communication systems integration for 180m superyacht'
    },
    {
      yachtName: 'Eclipse',
      systems: ['Security Systems', 'Entertainment Network', 'Bridge Integration'],
      projectYear: 2022,
      role: 'Technology Consultant',
      description: 'Advanced security and entertainment systems for luxury yacht'
    },
    {
      yachtName: 'Dilbar',
      systems: ['Propulsion Control', 'Environmental Monitoring'],
      projectYear: 2021,
      role: 'Technical Specialist'
    }
  ];

  it('renders all yacht projects', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getByText('Azzam')).toBeInTheDocument();
    expect(screen.getByText('Eclipse')).toBeInTheDocument();
    expect(screen.getByText('Dilbar')).toBeInTheDocument();
  });

  it('displays yacht project years', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getAllByText('2023')).toHaveLength(2); // Stats and project badge
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
  });

  it('shows vendor roles in projects', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getByText('Primary Systems Integrator')).toBeInTheDocument();
    expect(screen.getByText('Technology Consultant')).toBeInTheDocument();
    expect(screen.getByText('Technical Specialist')).toBeInTheDocument();
  });

  it('displays systems breakdown for each project', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getAllByText('Navigation Systems')).toHaveLength(2); // Systems breakdown + project detail
    expect(screen.getAllByText('Communication Array')).toHaveLength(2);
    expect(screen.getAllByText('Security Systems')).toHaveLength(2);
    expect(screen.getAllByText('Entertainment Network')).toHaveLength(2);
    expect(screen.getAllByText('Propulsion Control')).toHaveLength(2);
  });

  it('shows project descriptions when provided', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getByText('Complete navigation and communication systems integration for 180m superyacht')).toBeInTheDocument();
    expect(screen.getByText('Advanced security and entertainment systems for luxury yacht')).toBeInTheDocument();
  });

  it('handles project without description', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    const dilbarProject = screen.getByText('Dilbar').closest('[data-testid="yacht-project"]');
    expect(dilbarProject).toBeInTheDocument();
    expect(dilbarProject).not.toHaveTextContent('Complete navigation and communication systems integration');
  });

  it('handles project without year', () => {
    const projectNoYear = [
      {
        yachtName: 'Test Yacht',
        systems: ['Test System'],
        role: 'Test Role'
      }
    ];

    render(<YachtProjectPortfolio projects={projectNoYear} />);

    expect(screen.getByText('Test Yacht')).toBeInTheDocument();
    expect(screen.queryByTestId('project-year')).not.toBeInTheDocument();
  });

  it('renders systems as organized breakdown', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    const systemsBreakdown = screen.getByTestId('systems-breakdown');
    expect(systemsBreakdown).toBeInTheDocument();

    const systemTags = screen.getAllByTestId('system-tag');
    expect(systemTags.length).toBeGreaterThan(0);
  });

  it('sorts projects by year in descending order', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    const projectCards = screen.getAllByTestId('yacht-project');
    const firstProject = projectCards[0];
    const lastProject = projectCards[projectCards.length - 1];

    expect(firstProject).toHaveTextContent('2023');
    expect(lastProject).toHaveTextContent('2021');
  });

  it('includes portfolio section heading', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getByRole('heading', { name: /Yacht Project Portfolio/i })).toBeInTheDocument();
  });

  it('displays project timeline visualization', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getByTestId('project-timeline')).toBeInTheDocument();
  });

  it('handles empty projects array', () => {
    render(<YachtProjectPortfolio projects={[]} />);

    expect(screen.getByTestId('no-projects-message')).toBeInTheDocument();
    expect(screen.getByText(/No yacht projects available/)).toBeInTheDocument();
  });

  it('applies grid layout for project cards', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    const container = screen.getByTestId('yacht-portfolio');
    expect(container).toHaveClass('grid', 'gap-6');
  });

  it('includes yacht project statistics', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    expect(screen.getByTestId('portfolio-stats')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Total projects
  });

  it('applies hover effects to project cards', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    const projectCards = screen.getAllByTestId('yacht-project');
    projectCards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-lg', 'transition-all');
    });
  });

  it('displays systems with appropriate icons', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} />);

    const systemTags = screen.getAllByTestId('system-tag');
    expect(systemTags.length).toBeGreaterThan(0);

    // In the systems breakdown, they are badges; in project details, they are flex items-center
    const projectSystemTags = systemTags.filter(tag => tag.querySelector('svg'));
    expect(projectSystemTags.length).toBeGreaterThan(0);
  });

  it('applies custom className when provided', () => {
    render(<YachtProjectPortfolio projects={mockYachtProjects} className="custom-class" />);

    expect(screen.getByTestId('yacht-portfolio')).toHaveClass('custom-class');
  });
});