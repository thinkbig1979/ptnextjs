import * as React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComparisonMatrix } from '../ComparisonMatrix';
import type { Product, ComparisonMetric } from '@/lib/types';

describe('ComparisonMatrix', () => {
  const mockProducts: Product[] = [
    {
      id: 'product-1',
      slug: 'advanced-navigation-system',
      name: 'Advanced Navigation System',
      description: 'State-of-the-art marine navigation technology',
      price: '$25,000',
      vendorId: 'vendor-1',
      vendorName: 'Marine Tech Solutions',
      category: 'navigation',
      images: [],
      features: [],
      comparisonMetrics: {
        'power-consumption': { value: 120, unit: 'W' },
        'accuracy': { value: 95, unit: '%' },
        'response-time': { value: 50, unit: 'ms' }
      },
      integrationCompatibility: ['NMEA 2000', 'Chart APIs', 'Radar Systems']
    },
    {
      id: 'product-2',
      slug: 'marine-autopilot-pro',
      name: 'Marine Autopilot Pro',
      description: 'Professional autopilot system for superyachts',
      price: '$35,000',
      vendorId: 'vendor-2',
      vendorName: 'Ocean Dynamics',
      category: 'navigation',
      images: [],
      features: [],
      comparisonMetrics: {
        'power-consumption': { value: 150, unit: 'W' },
        'accuracy': { value: 98, unit: '%' },
        'response-time': { value: 30, unit: 'ms' }
      },
      integrationCompatibility: ['NMEA 2000', 'GPS Systems', 'Wind Sensors']
    }
  ];

  const mockMetrics: ComparisonMetric[] = [
    {
      metricId: 'power-consumption',
      name: 'Power Consumption',
      category: 'performance',
      unit: 'W',
      weight: 0.8
    },
    {
      metricId: 'accuracy',
      name: 'Accuracy',
      category: 'performance',
      unit: '%',
      weight: 1.0
    },
    {
      metricId: 'response-time',
      name: 'Response Time',
      category: 'performance',
      unit: 'ms',
      weight: 0.9
    }
  ];

  it('renders comparison matrix with product headers', () => {
    render(<ComparisonMatrix products={mockProducts} metrics={mockMetrics} />);

    expect(screen.getByText('Advanced Navigation System')).toBeInTheDocument();
    expect(screen.getByText('Marine Autopilot Pro')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-matrix')).toBeInTheDocument();
  });

  it('displays metric names and values correctly', () => {
    render(<ComparisonMatrix products={mockProducts} metrics={mockMetrics} />);

    expect(screen.getByText('Power Consumption')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('120 W')).toBeInTheDocument();
    expect(screen.getByText('95 %')).toBeInTheDocument();
    expect(screen.getByText('50 ms')).toBeInTheDocument();
  });

  it('handles product selection callback', () => {
    const mockOnProductSelect = jest.fn();
    render(
      <ComparisonMatrix
        products={mockProducts}
        metrics={mockMetrics}
        onProductSelect={mockOnProductSelect}
      />
    );

    const productButton = screen.getByTestId('product-select-product-1');
    fireEvent.click(productButton);
    expect(mockOnProductSelect).toHaveBeenCalledWith('product-1');
  });

  it('respects maximum product limit', () => {
    const manyProducts = [...mockProducts, ...mockProducts, ...mockProducts];
    render(<ComparisonMatrix products={manyProducts} metrics={mockMetrics} maxProducts={2} />);

    const displayedProducts = screen.getAllByTestId(/product-column-/);
    expect(displayedProducts).toHaveLength(2);
  });

  it('handles empty products array', () => {
    render(<ComparisonMatrix products={[]} metrics={mockMetrics} />);

    expect(screen.getByTestId('comparison-matrix')).toBeInTheDocument();
    expect(screen.getByText(/No products to compare/)).toBeInTheDocument();
  });

  it('handles missing comparison metrics gracefully', () => {
    const productsWithoutMetrics = [
      { ...mockProducts[0], comparisonMetrics: undefined }
    ];
    render(<ComparisonMatrix products={productsWithoutMetrics} metrics={mockMetrics} />);

    expect(screen.getByText('Advanced Navigation System')).toBeInTheDocument();
    expect(screen.getByText(/No metrics available/)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <ComparisonMatrix
        products={mockProducts}
        metrics={mockMetrics}
        className="custom-matrix-class"
      />
    );

    expect(screen.getByTestId('comparison-matrix')).toHaveClass('custom-matrix-class');
  });

  it('displays vendor information for each product', () => {
    render(<ComparisonMatrix products={mockProducts} metrics={mockMetrics} />);

    expect(screen.getByText('Marine Tech Solutions')).toBeInTheDocument();
    expect(screen.getByText('Ocean Dynamics')).toBeInTheDocument();
  });

  it('shows pricing information when available', () => {
    render(<ComparisonMatrix products={mockProducts} metrics={mockMetrics} />);

    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$35,000')).toBeInTheDocument();
  });

  it('handles responsive design with horizontal scroll', () => {
    render(<ComparisonMatrix products={mockProducts} metrics={mockMetrics} />);

    const scrollContainer = screen.getByTestId('comparison-matrix').querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('highlights best value for each metric', () => {
    render(<ComparisonMatrix products={mockProducts} metrics={mockMetrics} showBestValue />);

    // Should highlight best accuracy (98% vs 95%)
    const bestAccuracyCell = screen.getByTestId('metric-cell-product-2-accuracy');
    expect(bestAccuracyCell).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('supports metric sorting and highlighting', () => {
    render(<ComparisonMatrix products={mockProducts} metrics={mockMetrics} sortBy="accuracy" />);

    const sortedMatrix = screen.getByTestId('comparison-matrix');
    expect(sortedMatrix).toBeInTheDocument();

    // First product column should be the one with highest accuracy
    const firstProduct = screen.getByTestId('product-column-0');
    expect(firstProduct).toHaveTextContent('Marine Autopilot Pro');
  });
});
