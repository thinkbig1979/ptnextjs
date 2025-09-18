import * as React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractiveOrgChart } from '../InteractiveOrgChart';

describe('InteractiveOrgChart', () => {
  const mockTeamMembers = [
    {
      id: '1',
      name: 'John Smith',
      title: 'Chief Executive Officer',
      department: 'Executive',
      level: 1,
      photoUrl: '/images/john-smith.jpg',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
      bio: 'Experienced leader in marine technology',
      reportsTo: null
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      title: 'Chief Technology Officer',
      department: 'Engineering',
      level: 2,
      photoUrl: '/images/sarah-johnson.jpg',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      bio: 'Expert in sustainable yacht systems',
      reportsTo: '1'
    },
    {
      id: '3',
      name: 'Mike Chen',
      title: 'Senior Engineer',
      department: 'Engineering',
      level: 3,
      photoUrl: '/images/mike-chen.jpg',
      linkedinUrl: 'https://linkedin.com/in/mikechen',
      bio: 'Specialist in navigation systems',
      reportsTo: '2'
    }
  ];

  it('renders organization chart with all team members', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Mike Chen')).toBeInTheDocument();
  });

  it('displays team member titles and departments', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    expect(screen.getByText('Chief Executive Officer')).toBeInTheDocument();
    expect(screen.getByText('Chief Technology Officer')).toBeInTheDocument();
    expect(screen.getAllByText('Engineering')).toHaveLength(2); // Badge appears twice
  });

  it('shows team member photos', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    const johnPhoto = screen.getByAltText('John Smith');
    const sarahPhoto = screen.getByAltText('Sarah Johnson');

    expect(johnPhoto).toBeInTheDocument();
    expect(sarahPhoto).toBeInTheDocument();
    expect(johnPhoto.getAttribute('src')).toContain('john-smith.jpg');
  });

  it('links to LinkedIn profiles when available', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    const linkedinLinks = screen.getAllByRole('link', { name: /linkedin/i });
    expect(linkedinLinks).toHaveLength(3);
    expect(linkedinLinks[0]).toHaveAttribute('href', 'https://linkedin.com/in/johnsmith');
  });

  it('organizes members by hierarchy levels', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    const level1 = screen.getByTestId('level-1');
    const level2 = screen.getByTestId('level-2');
    const level3 = screen.getByTestId('level-3');

    expect(level1).toContainElement(screen.getByText('John Smith'));
    expect(level2).toContainElement(screen.getByText('Sarah Johnson'));
    expect(level3).toContainElement(screen.getByText('Mike Chen'));
  });

  it('shows reporting relationships with connecting lines', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    expect(screen.getByTestId('org-chart-connections')).toBeInTheDocument();
  });

  it('displays member details on hover', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    const memberCard = screen.getByTestId('member-1');
    fireEvent.mouseEnter(memberCard);

    expect(screen.getByText('Experienced leader in marine technology')).toBeInTheDocument();
  });

  it('filters by department when selected', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    const engineeringFilter = screen.getByRole('button', { name: /engineering/i });
    fireEvent.click(engineeringFilter);

    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} className="custom-chart" />);

    expect(screen.getByTestId('interactive-org-chart')).toHaveClass('custom-chart');
  });

  it('handles empty team members list', () => {
    render(<InteractiveOrgChart teamMembers={[]} />);

    expect(screen.getByText(/no team members/i)).toBeInTheDocument();
  });

  it('shows department counts in filter buttons', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    const engineeringFilter = screen.getByRole('button', { name: /engineering.*2/i });
    const executiveFilter = screen.getByRole('button', { name: /executive.*1/i });

    expect(engineeringFilter).toBeInTheDocument();
    expect(executiveFilter).toBeInTheDocument();
  });

  it('supports compact view mode', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} compact={true} />);

    expect(screen.getByTestId('interactive-org-chart')).toHaveClass('compact');
  });

  it('displays member modal on click', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} />);

    const memberCard = screen.getByTestId('member-1');
    fireEvent.click(memberCard);

    expect(screen.getByTestId('member-modal')).toBeInTheDocument();
    expect(screen.getByText('Experienced leader in marine technology')).toBeInTheDocument();
  });

  it('animates chart connections on mount', () => {
    render(<InteractiveOrgChart teamMembers={mockTeamMembers} animated={true} />);

    expect(screen.getByTestId('org-chart-connections')).toHaveClass('animate-draw');
  });
});