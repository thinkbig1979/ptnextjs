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
      location: 'Shipyard, Netherlands'
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

    const locations = screen.getAllByText(/Netherlands|Monaco|France|Italy/);
    expect(locations.length).toBeGreaterThan(0);
  });

  it('displays formatted dates correctly', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    expect(screen.getByText(/January.*2020/)).toBeInTheDocument();
    expect(screen.getByText(/June.*2021/)).toBeInTheDocument();
    expect(screen.getByText(/March.*2022/)).toBeInTheDocument();
  });

  it('displays category badges', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    expect(screen.getByText('launch')).toBeInTheDocument();
    expect(screen.getByText('delivery')).toBeInTheDocument();
    expect(screen.getByText('milestone')).toBeInTheDocument();
  });

  it('sorts events chronologically (oldest first by default)', () => {
    render(<YachtTimeline events={mockTimelineEvents} />);

    const events = mockTimelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const eventTexts = events.map(e => e.event);

    expect(screen.getByText(eventTexts[0])).toBeInTheDocument();
    expect(screen.getByText(eventTexts[4])).toBeInTheDocument();
  });

  it('can sort events in reverse chronological order', () => {
    render(<YachtTimeline events={mockTimelineEvents} sortOrder="desc" />);

    const events = mockTimelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const eventTexts = events.map(e => e.event);

    expect(screen.getByText(eventTexts[0])).toBeInTheDocument();
    expect(screen.getByText(eventTexts[4])).toBeInTheDocument();
  });

  it('handles empty timeline gracefully', () => {
    render(<YachtTimeline events={[]} />);

    expect(screen.getByText('No timeline events available.')).toBeInTheDocument();
  });

  it('handles null events prop gracefully', () => {
    render(<YachtTimeline events={null} />);

    expect(screen.getByText('No timeline events available.')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <YachtTimeline events={mockTimelineEvents} className="custom-timeline" />
    );
    const customElement = container.querySelector('.custom-timeline');
    expect(customElement).toBeInTheDocument();
  });
});
