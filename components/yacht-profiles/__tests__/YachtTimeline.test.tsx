import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { YachtTimeline } from '../YachtTimeline';
import type { YachtTimelineEvent } from '@/lib/types';

describe('YachtTimeline', () => {
  const mockTimelineEvents: YachtTimelineEvent[] = [
    {
      date: '2020-01-15',
      event: 'Keel Laying',
      description: 'Construction begins with the laying of the keel',
      category: 'milestone',
      location: 'Shipyard, Netherlands',
      images: ['/images/keel-laying.jpg']
    },
    {
      date: '2021-06-20',
      event: 'Launch',
      description: 'Yacht launched into water for the first time',
      category: 'launch',
      location: 'Shipyard, Netherlands'
    },
    {
      date: '2022-03-10',
      event: 'Delivery',
      description: 'Yacht delivered to owner after sea trials',
      category: 'delivery',
      location: 'Monaco'
    },
    {
      date: '2023-05-15',
      event: 'Annual Service',
      description: 'Complete annual service and maintenance',
      category: 'service',
      location: 'Service Marina, France'
    },
    {
      date: '2024-01-20',
      event: 'Interior Refit',
      description: 'Major interior renovation and modernization',
      category: 'refit',
      location: 'Refit Facility, Italy'
    }
  ];

  it('renders all timeline events', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    expect(screen.getByText('Keel Laying')).toBeInTheDocument();
    expect(screen.getByText('Launch')).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();
    expect(screen.getByText('Annual Service')).toBeInTheDocument();
    expect(screen.getByText('Interior Refit')).toBeInTheDocument();
  });

  it('displays event descriptions', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    expect(screen.getByText('Construction begins with the laying of the keel')).toBeInTheDocument();
    expect(screen.getByText('Yacht launched into water for the first time')).toBeInTheDocument();
    expect(screen.getByText('Yacht delivered to owner after sea trials')).toBeInTheDocument();
  });

  it('shows event locations', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    expect(screen.getByText('Shipyard, Netherlands')).toBeInTheDocument();
    expect(screen.getByText('Monaco')).toBeInTheDocument();
    expect(screen.getByText('Service Marina, France')).toBeInTheDocument();
    expect(screen.getByText('Refit Facility, Italy')).toBeInTheDocument();
  });

  it('displays formatted dates correctly', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    expect(screen.getByText('January 15, 2020')).toBeInTheDocument();
    expect(screen.getByText('June 20, 2021')).toBeInTheDocument();
    expect(screen.getByText('March 10, 2022')).toBeInTheDocument();
  });

  it('applies category-specific styling', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    const launchEvent = screen.getByTestId('timeline-event-launch');
    const deliveryEvent = screen.getByTestId('timeline-event-delivery');
    const milestoneEvent = screen.getByTestId('timeline-event-milestone');

    expect(launchEvent).toHaveClass('category-launch');
    expect(deliveryEvent).toHaveClass('category-delivery');
    expect(milestoneEvent).toHaveClass('category-milestone');
  });

  it('shows category badges with appropriate colors', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    const milestoneBadge = screen.getByText('Milestone');
    const launchBadge = screen.getByText('Launch');
    const deliveryBadge = screen.getByText('Delivery');
    const serviceBadge = screen.getByText('Service');
    const refitBadge = screen.getByText('Refit');

    expect(milestoneBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    expect(launchBadge).toHaveClass('bg-green-100', 'text-green-800');
    expect(deliveryBadge).toHaveClass('bg-purple-100', 'text-purple-800');
    expect(serviceBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(refitBadge).toHaveClass('bg-orange-100', 'text-orange-800');
  });

  it('sorts events chronologically (oldest first by default)', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    const eventElements = screen.getAllByTestId(/timeline-event-/);
    const dates = eventElements.map(el => el.getAttribute('data-date'));

    expect(dates).toEqual(['2020-01-15', '2021-06-20', '2022-03-10', '2023-05-15', '2024-01-20']);
  });

  it('can sort events in reverse chronological order', () => {
    render(<YachtTimeline events={mockTimelineEvents} sortOrder="desc" />);

    const eventElements = screen.getAllByTestId(/timeline-event-/);
    const dates = eventElements.map(el => el.getAttribute('data-date'));

    expect(dates).toEqual(['2024-01-20', '2023-05-15', '2022-03-10', '2021-06-20', '2020-01-15']);
  });

  it('displays timeline connector lines', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    const timelineConnectors = screen.getAllByTestId('timeline-connector');
    expect(timelineConnectors).toHaveLength(4); // n-1 connectors for n events
  });

  it('handles events with images', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    const eventWithImage = screen.getByTestId('timeline-event-milestone');
    const image = screen.getByRole('img', { name: /keel laying/i });

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('keel-laying.jpg'));
  });

  it('handles events without images gracefully', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    const launchEvent = screen.getByTestId('timeline-event-launch');
    expect(launchEvent.querySelector('img')).toBeNull();
  });

  it('filters events by category when specified', () => {
    render(<YachtTimeline events={mockTimelineEvents} filterByCategory="milestone" />);

    expect(screen.getByText('Keel Laying')).toBeInTheDocument();
    expect(screen.queryByText('Launch')).not.toBeInTheDocument();
    expect(screen.queryByText('Delivery')).not.toBeInTheDocument();
  });

  it('handles empty timeline gracefully', () => {
    render(<YachtTimeline events={[]} />);

    expect(screen.getByText('No timeline events available.')).toBeInTheDocument();
  });

  it('displays compact view when specified', () => {
    render(<YachtTimeline events={mockTimelineEvents} compact={true} />);

    const timeline = screen.getByTestId('yacht-timeline');
    expect(timeline).toHaveClass('compact-view');
  });

  it('shows year headers when groupByYear is enabled', () => {
    render(<YachtTimeline events={mockTimelineEvents} groupByYear={true} />);

    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('allows expanding event details', () => {
    render(<YachtTimeline events={mockTimelineEvents} expandable={true} />);

    const expandButton = screen.getByTestId('expand-event-0');
    expect(expandButton).toBeInTheDocument();

    expandButton.click();
    expect(screen.getByText('Event Details')).toBeInTheDocument();
  });

  it('shows construction progress when enabled', () => {
    render(<YachtTimeline events={mockTimelineEvents} showProgress={true} />);

    const progressBar = screen.getByTestId('construction-progress');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('data-progress', '100'); // All events completed
  });
});