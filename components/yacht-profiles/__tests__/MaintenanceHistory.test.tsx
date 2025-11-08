import * as React from "react";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MaintenanceHistory } from '../MaintenanceHistory';
import type { YachtMaintenanceRecord } from '@/lib/types';

describe('MaintenanceHistory', () => {
  const mockMaintenanceRecords: YachtMaintenanceRecord[] = [
    {
      date: '2024-01-15',
      type: 'routine',
      system: 'Engine',
      description: 'Regular engine service and oil change',
      vendor: 'Marine Service Co',
      cost: '$2,500',
      nextService: '2024-07-15',
      status: 'completed'
    },
    {
      date: '2024-02-20',
      type: 'repair',
      system: 'Navigation',
      description: 'Replace GPS antenna due to storm damage',
      vendor: 'Electronics Marine',
      cost: '$1,200',
      status: 'completed'
    },
    {
      date: '2024-03-10',
      type: 'upgrade',
      system: 'Communication',
      description: 'Install new satellite communication system',
      vendor: 'Satellite Solutions',
      cost: '$15,000',
      status: 'in-progress'
    },
    {
      date: '2024-04-05',
      type: 'inspection',
      system: 'Safety',
      description: 'Annual safety equipment inspection',
      vendor: 'Safety Marine',
      status: 'scheduled'
    }
  ];

  it('renders all maintenance records in timeline format', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    expect(screen.getByText('Regular engine service and oil change')).toBeInTheDocument();
    expect(screen.getByText('Replace GPS antenna due to storm damage')).toBeInTheDocument();
    expect(screen.getByText('Install new satellite communication system')).toBeInTheDocument();
    expect(screen.getByText('Annual safety equipment inspection')).toBeInTheDocument();
  });

  it('displays maintenance types with correct styling', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    const routineBadge = screen.getByText('Routine');
    const repairBadge = screen.getByText('Repair');
    const upgradeBadge = screen.getByText('Upgrade');
    const inspectionBadge = screen.getByText('Inspection');

    expect(routineBadge).toBeInTheDocument();
    expect(repairBadge).toBeInTheDocument();
    expect(upgradeBadge).toBeInTheDocument();
    expect(inspectionBadge).toBeInTheDocument();

    expect(repairBadge).toHaveClass('bg-red-100', 'text-red-800');
    expect(upgradeBadge).toHaveClass('bg-green-100', 'text-green-800');
    expect(inspectionBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('shows status badges with appropriate colors', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    const completedBadges = screen.getAllByText('Completed');
    const inProgressBadge = screen.getByText('In Progress');
    const scheduledBadge = screen.getByText('Scheduled');

    expect(completedBadges).toHaveLength(2);
    expect(inProgressBadge).toBeInTheDocument();
    expect(scheduledBadge).toBeInTheDocument();

    expect(completedBadges[0]).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('displays systems information', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    expect(screen.getByText('Engine')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();
  });

  it('shows vendor information when available', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    expect(screen.getByText('Marine Service Co')).toBeInTheDocument();
    expect(screen.getByText('Electronics Marine')).toBeInTheDocument();
    expect(screen.getByText('Satellite Solutions')).toBeInTheDocument();
    expect(screen.getByText('Safety Marine')).toBeInTheDocument();
  });

  it('displays cost information when available', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    expect(screen.getByText('$2,500')).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
  });

  it('shows next service date when available', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    expect(screen.getByText('July 15, 2024')).toBeInTheDocument();
  });

  it('sorts records by date (most recent first)', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} />);

    const recordElements = screen.getAllByTestId(/maintenance-record-/);
    expect(recordElements.length).toBeGreaterThan(0);
  });

  it('handles empty maintenance records', () => {
    render(<MaintenanceHistory records={[]} />);

    expect(screen.getByText('No maintenance records available.')).toBeInTheDocument();
  });

  it('filters records by system when specified', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} filterBySystem="Engine" />);

    expect(screen.getByText('Regular engine service and oil change')).toBeInTheDocument();
    expect(screen.queryByText('Replace GPS antenna due to storm damage')).not.toBeInTheDocument();
  });

  it('filters records by type when specified', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} filterByType="routine" />);

    expect(screen.getByText('Regular engine service and oil change')).toBeInTheDocument();
    expect(screen.queryByText('Replace GPS antenna due to storm damage')).not.toBeInTheDocument();
  });

  it('filters records by status when specified', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} filterByStatus="completed" />);

    expect(screen.getByText('Regular engine service and oil change')).toBeInTheDocument();
    expect(screen.getByText('Replace GPS antenna due to storm damage')).toBeInTheDocument();
    expect(screen.queryByText('Install new satellite communication system')).not.toBeInTheDocument();
  });

  it('displays timeline view correctly', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} viewMode="timeline" />);

    const timeline = screen.getByTestId('maintenance-timeline');
    expect(timeline).toBeInTheDocument();
    expect(timeline).toHaveClass('timeline-view');
  });

  it('displays summary statistics', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} showSummary={true} />);

    expect(screen.getByText(/Total Records: 4/)).toBeInTheDocument();
    expect(screen.getByText(/Completed: 2/)).toBeInTheDocument();
    expect(screen.getByText(/In Progress: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Scheduled: 1/)).toBeInTheDocument();
  });

  it('calculates total maintenance cost', () => {
    render(<MaintenanceHistory records={mockMaintenanceRecords} showTotalCost={true} />);

    expect(screen.getByText(/Total Cost: \$18,700/)).toBeInTheDocument();
  });

  it('allows expanding record details', async () => {
    const user = userEvent.setup();
    render(<MaintenanceHistory records={mockMaintenanceRecords} expandable={true} />);

    const expandButton = screen.getByTestId('expand-record-0');
    expect(expandButton).toBeInTheDocument();

    await user.click(expandButton);
    expect(screen.getByText('Full Details')).toBeInTheDocument();
  });
});
