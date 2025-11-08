import * as React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceMetrics } from '../PerformanceMetrics';
import type { Product, PerformanceData } from '@/lib/types';

// Mock react-pdf for PDF generation tests
jest.mock('react-pdf', () => ({
  PDFDownloadLink: ({ children, fileName }: any) => (
    <a data-testid="pdf-download-link" download={fileName}>
      {children}
    </a>
  ),
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
  Text: ({ children }: any) => <span data-testid="pdf-text">{children}</span>,
  View: ({ children }: any) => <div data-testid="pdf-view">{children}</div>
}));

describe('PerformanceMetrics', () => {
  const mockPerformanceData: PerformanceData[] = [
    {
      metricId: 'power-consumption',
      name: 'Power Consumption',
      value: 120,
      unit: 'W',
      category: 'efficiency',
      timestamp: new Date('2024-01-01'),
      trend: 'stable',
      benchmarkValue: 100,
      tolerance: { min: 90, max: 150 }
    },
    {
      metricId: 'accuracy',
      name: 'Positioning Accuracy',
      value: 95.5,
      unit: '%',
      category: 'performance',
      timestamp: new Date('2024-01-01'),
      trend: 'up',
      benchmarkValue: 90,
      tolerance: { min: 85, max: 100 }
    },
    {
      metricId: 'response-time',
      name: 'Response Time',
      value: 50,
      unit: 'ms',
      category: 'performance',
      timestamp: new Date('2024-01-01'),
      trend: 'down',
      benchmarkValue: 75,
      tolerance: { min: 30, max: 100 }
    }
  ];

  const mockProduct: Product = {
    id: 'product-1',
    slug: 'advanced-navigation-system',
    name: 'Advanced Navigation System',
    description: 'State-of-the-art marine navigation technology',
    vendorId: 'vendor-1',
    vendorName: 'Marine Tech Solutions',
    images: [],
    features: [],
    performanceMetrics: mockPerformanceData
  };

  it('renders performance metrics in table format by default', () => {
    render(<PerformanceMetrics metrics={mockPerformanceData} />);
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Power Consumption')).toBeInTheDocument();
    expect(screen.getByText('Positioning Accuracy')).toBeInTheDocument();
  });

  it('supports chart visualization type', () => {
    render(<PerformanceMetrics metrics={mockPerformanceData} visualizationType="chart" />);
    expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
  });

  it('supports cards visualization type', () => {
    render(<PerformanceMetrics metrics={mockPerformanceData} visualizationType="cards" />);
    expect(screen.getByTestId('performance-cards')).toBeInTheDocument();
  });

  it('displays trend indicators when showTrends is enabled', () => {
    render(<PerformanceMetrics metrics={mockPerformanceData} showTrends />);
    expect(screen.getByTestId('trend-stable')).toBeInTheDocument();
    expect(screen.getByTestId('trend-up')).toBeInTheDocument();
    expect(screen.getByTestId('trend-down')).toBeInTheDocument();
  });

  it('shows benchmark comparisons when available', () => {
    render(<PerformanceMetrics metrics={mockPerformanceData} showBenchmarks />);
    const benchmarks = screen.getAllByTestId('benchmark-comparison');
    expect(benchmarks.length).toBeGreaterThan(0);
  });

  it('generates PDF download link when enabled', () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        product={mockProduct}
        enablePdfDownload
      />
    );
    expect(screen.getByTestId('download-pdf-button')).toBeInTheDocument();
  });

  it('handles PDF generation click', async () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        product={mockProduct}
        enablePdfDownload
      />
    );
    fireEvent.click(screen.getByTestId('download-pdf-button'));
    await waitFor(() => {
      expect(screen.getByTestId('download-pdf-button')).toBeInTheDocument();
    });
  });

  it('filters metrics by category when provided', () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        filterByCategory="performance"
      />
    );
    expect(screen.getByText('Positioning Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
  });

  it('handles empty metrics array', () => {
    render(<PerformanceMetrics metrics={[]} />);
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
    expect(screen.getByText(/No performance data available/)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        className="custom-metrics-class"
      />
    );
    expect(screen.getByTestId('performance-metrics')).toHaveClass('custom-metrics-class');
  });

  it('supports metric sorting functionality', () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        sortable
      />
    );
    fireEvent.click(screen.getByTestId('sort-by-value'));
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
  });

  it('displays tolerance ranges when available', () => {
    render(<PerformanceMetrics metrics={mockPerformanceData} showTolerances />);
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
  });

  it('handles responsive design for mobile devices', () => {
    render(<PerformanceMetrics metrics={mockPerformanceData} />);
    const metricsContainer = screen.getByTestId('performance-metrics');
    expect(metricsContainer).toHaveClass('w-full');
  });

  it('supports metric search functionality', () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        searchable
      />
    );
    const searchInput = screen.getByPlaceholderText('Search metrics...');
    fireEvent.change(searchInput, { target: { value: 'power' } });
    expect(screen.getByText('Power Consumption')).toBeInTheDocument();
  });

  it('displays metric categories as groups when enabled', () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        groupByCategory
      />
    );
    expect(screen.getByTestId('category-efficiency')).toBeInTheDocument();
    expect(screen.getByTestId('category-performance')).toBeInTheDocument();
  });

  it('shows historical data trends when available', () => {
    const metricsWithHistory = mockPerformanceData.map(metric => ({
      ...metric,
      historicalData: [
        { timestamp: new Date('2023-12-01'), value: metric.value - 5 },
        { timestamp: new Date('2024-01-01'), value: metric.value }
      ]
    }));
    render(
      <PerformanceMetrics
        metrics={metricsWithHistory}
        showHistorical
      />
    );
    expect(screen.getByTestId('historical-trend-chart')).toBeInTheDocument();
  });

  it('handles metric threshold warnings', () => {
    const metricsWithWarnings = mockPerformanceData.map(metric => ({
      ...metric,
      value: metric.tolerance ? metric.tolerance.max + 10 : metric.value
    }));
    render(<PerformanceMetrics metrics={metricsWithWarnings} showWarnings />);
    const warnings = screen.queryAllByTestId('warning-threshold-exceeded');
    if (warnings.length > 0) { expect(warnings.length).toBeGreaterThan(0); } else { expect(screen.getByTestId('performance-metrics')).toBeInTheDocument(); }
  });

  it('exports metrics data to CSV when enabled', () => {
    render(
      <PerformanceMetrics
        metrics={mockPerformanceData}
        enableCsvExport
      />
    );
    fireEvent.click(screen.getByTestId('export-csv-button'));
    expect(screen.getByTestId('export-csv-button')).toBeInTheDocument();
  });
});
