import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SupplierMap } from '../SupplierMap';
import type { YachtSupplierRole } from '@/lib/types';

describe('SupplierMap', () => {
  const mockSuppliers: YachtSupplierRole[] = [
    {
      vendorId: 'vendor-1',
      vendorName: 'Marine Electronics Ltd',
      discipline: 'Electronics',
      systems: ['Navigation', 'Communication', 'Entertainment'],
      role: 'primary',
      projectPhase: 'Installation'
    },
    {
      vendorId: 'vendor-2',
      vendorName: 'Lighting Solutions',
      discipline: 'Lighting',
      systems: ['Interior Lighting', 'Exterior Lighting'],
      role: 'subcontractor',
      projectPhase: 'Design'
    },
    {
      vendorId: 'vendor-3',
      vendorName: 'Security Systems Inc',
      discipline: 'Security',
      systems: ['CCTV', 'Access Control'],
      role: 'consultant',
      projectPhase: 'Planning'
    }
  ];

  it('renders supplier map with all suppliers', () => {
    render(<SupplierMap suppliers={mockSuppliers} />);

    expect(screen.getByText('Marine Electronics Ltd')).toBeInTheDocument();
    expect(screen.getByText('Lighting Solutions')).toBeInTheDocument();
    expect(screen.getByText('Security Systems Inc')).toBeInTheDocument();
  });

  it('displays disciplines correctly', () => {
    render(<SupplierMap suppliers={mockSuppliers} />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Lighting')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('shows systems for each supplier', () => {
    render(<SupplierMap suppliers={mockSuppliers} />);

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Interior Lighting')).toBeInTheDocument();
    expect(screen.getByText('CCTV')).toBeInTheDocument();
  });

  it('displays role badges with correct styling', () => {
    render(<SupplierMap suppliers={mockSuppliers} />);

    const primaryBadge = screen.getByText('Primary');
    const subcontractorBadge = screen.getByText('Subcontractor');
    const consultantBadge = screen.getByText('Consultant');

    expect(primaryBadge).toBeInTheDocument();
    expect(subcontractorBadge).toBeInTheDocument();
    expect(consultantBadge).toBeInTheDocument();

    expect(subcontractorBadge).toHaveClass('bg-green-100', 'text-green-800');
    expect(consultantBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('shows project phases when available', () => {
    render(<SupplierMap suppliers={mockSuppliers} />);

    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  it('groups suppliers by discipline', () => {
    render(<SupplierMap suppliers={mockSuppliers} groupByDiscipline={true} />);

    expect(screen.getByText('Electronics (1)')).toBeInTheDocument();
    expect(screen.getByText('Lighting (1)')).toBeInTheDocument();
    expect(screen.getByText('Security (1)')).toBeInTheDocument();
  });

  it('handles empty supplier list', () => {
    render(<SupplierMap suppliers={[]} />);

    expect(screen.getByText('No suppliers assigned to this project yet.')).toBeInTheDocument();
  });

  it('displays total supplier count', () => {
    render(<SupplierMap suppliers={mockSuppliers} />);

    expect(screen.getByText('3 Suppliers')).toBeInTheDocument();
  });

  it('displays total systems count', () => {
    render(<SupplierMap suppliers={mockSuppliers} />);

    // Total systems: 3 + 2 + 2 = 7
    expect(screen.getByText('7 Systems')).toBeInTheDocument();
  });

  it('allows filtering by role', () => {
    render(<SupplierMap suppliers={mockSuppliers} filterByRole="primary" />);

    expect(screen.getByText('Marine Electronics Ltd')).toBeInTheDocument();
    expect(screen.queryByText('Lighting Solutions')).not.toBeInTheDocument();
    expect(screen.queryByText('Security Systems Inc')).not.toBeInTheDocument();
  });

  it('allows filtering by discipline', () => {
    render(<SupplierMap suppliers={mockSuppliers} filterByDiscipline="Electronics" />);

    expect(screen.getByText('Marine Electronics Ltd')).toBeInTheDocument();
    expect(screen.queryByText('Lighting Solutions')).not.toBeInTheDocument();
    expect(screen.queryByText('Security Systems Inc')).not.toBeInTheDocument();
  });

  it('renders interactive supplier cards with click handlers', () => {
    const mockOnSupplierClick = jest.fn();
    render(<SupplierMap suppliers={mockSuppliers} onSupplierClick={mockOnSupplierClick} />);

    const supplierCard = screen.getByTestId('supplier-card-vendor-1');
    expect(supplierCard).toBeInTheDocument();

    supplierCard.click();
    expect(mockOnSupplierClick).toHaveBeenCalledWith(mockSuppliers[0]);
  });

  it('shows supplier links when viewMode is links', () => {
    render(<SupplierMap suppliers={mockSuppliers} viewMode="links" />);

    const supplierLinks = screen.getAllByRole('link');
    expect(supplierLinks).toHaveLength(3);
    expect(supplierLinks[0]).toHaveAttribute('href', '/vendors/vendor-1');
  });
});
