import * as React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntegrationNotes } from '../IntegrationNotes';
import type { Product, SystemCompatibility } from '@/lib/types';

describe('IntegrationNotes', () => {
  const mockProduct: Product = {
    id: 'product-1',
    slug: 'advanced-navigation-system',
    name: 'Advanced Navigation System',
    description: 'State-of-the-art marine navigation technology',
    vendorId: 'vendor-1',
    vendorName: 'Marine Tech Solutions',
    images: [],
    features: [],
    integrationCompatibility: [
      'NMEA 2000',
      'Chart APIs',
      'Radar Systems',
      'AIS Transponders',
      'Wind Sensors'
    ],
    systemRequirements: {
      powerSupply: '12V DC / 24V DC',
      mounting: 'Standard 19" rack mount',
      operatingTemp: '-20°C to +70°C',
      certification: 'CE, FCC, RoHS'
    }
  };

  const mockCompatibilityMatrix: SystemCompatibility[] = [
    {
      system: 'NMEA 2000',
      compatibility: 'full',
      notes: 'Native NMEA 2000 support with all message types',
      requirements: ['NMEA 2000 backbone', 'Terminating resistors']
    },
    {
      system: 'Chart APIs',
      compatibility: 'partial',
      notes: 'Supports most major chart formats, requires API licensing',
      requirements: ['Valid chart subscription', 'Internet connectivity']
    },
    {
      system: 'Legacy NMEA 0183',
      compatibility: 'adapter',
      notes: 'Requires NMEA 0183 to 2000 converter',
      requirements: ['NMEA 0183 converter device', 'Additional wiring']
    },
    {
      system: 'Proprietary System XYZ',
      compatibility: 'none',
      notes: 'No direct compatibility available',
      requirements: []
    }
  ];

  it('renders integration notes with product compatibility list', () => {
    render(<IntegrationNotes product={mockProduct} />);

    expect(screen.getByTestId('integration-notes')).toBeInTheDocument();
    expect(screen.getByText('System Compatibility')).toBeInTheDocument();
    expect(screen.getByText('NMEA 2000')).toBeInTheDocument();
    expect(screen.getByText('Chart APIs')).toBeInTheDocument();
    expect(screen.getByText('Radar Systems')).toBeInTheDocument();
  });

  it('displays system requirements when provided', () => {
    render(<IntegrationNotes product={mockProduct} />);

    expect(screen.getByText('System Requirements')).toBeInTheDocument();
    expect(screen.getByText('12V DC / 24V DC')).toBeInTheDocument();
    expect(screen.getByText('Standard 19" rack mount')).toBeInTheDocument();
    expect(screen.getByText('-20°C to +70°C')).toBeInTheDocument();
  });

  it('shows detailed compatibility matrix when provided', () => {
    render(
      <IntegrationNotes
        product={mockProduct}
        compatibilityMatrix={mockCompatibilityMatrix}
      />
    );

    expect(screen.getByText('Compatibility Details')).toBeInTheDocument();
    expect(screen.getByTestId('compatibility-matrix')).toBeInTheDocument();

    // Check compatibility levels are displayed correctly
    expect(screen.getByTestId('compatibility-full')).toBeInTheDocument();
    expect(screen.getByTestId('compatibility-partial')).toBeInTheDocument();
    expect(screen.getByTestId('compatibility-adapter')).toBeInTheDocument();
    expect(screen.getByTestId('compatibility-none')).toBeInTheDocument();
  });

  it('displays compatibility notes and requirements', () => {
    render(
      <IntegrationNotes
        product={mockProduct}
        compatibilityMatrix={mockCompatibilityMatrix}
      />
    );

    expect(screen.getByText('Native NMEA 2000 support with all message types')).toBeInTheDocument();
    expect(screen.getByText('NMEA 2000 backbone')).toBeInTheDocument();
    expect(screen.getByText('Terminating resistors')).toBeInTheDocument();
  });

  it('handles expandable compatibility sections', () => {
    render(
      <IntegrationNotes
        product={mockProduct}
        compatibilityMatrix={mockCompatibilityMatrix}
        expandable
      />
    );

    const expandButton = screen.getByTestId('expand-compatibility-NMEA 2000');
    fireEvent.click(expandButton);

    expect(screen.getByText('Native NMEA 2000 support with all message types')).toBeInTheDocument();
  });

  it('shows color-coded compatibility indicators', () => {
    render(
      <IntegrationNotes
        product={mockProduct}
        compatibilityMatrix={mockCompatibilityMatrix}
      />
    );

    const fullCompatibility = screen.getByTestId('compatibility-indicator-full');
    const partialCompatibility = screen.getByTestId('compatibility-indicator-partial');
    const adapterCompatibility = screen.getByTestId('compatibility-indicator-adapter');
    const noCompatibility = screen.getByTestId('compatibility-indicator-none');

    expect(fullCompatibility).toHaveClass('bg-green-100', 'text-green-800');
    expect(partialCompatibility).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(adapterCompatibility).toHaveClass('bg-blue-100', 'text-blue-800');
    expect(noCompatibility).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('handles product without integration compatibility', () => {
    const productNoIntegration = { ...mockProduct, integrationCompatibility: undefined };
    render(<IntegrationNotes product={productNoIntegration} />);

    expect(screen.getByTestId('integration-notes')).toBeInTheDocument();
    expect(screen.getByText(/No integration information available/)).toBeInTheDocument();
  });

  it('handles product without system requirements', () => {
    const productNoRequirements = { ...mockProduct, systemRequirements: undefined };
    render(<IntegrationNotes product={productNoRequirements} />);

    expect(screen.queryByText('System Requirements')).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <IntegrationNotes
        product={mockProduct}
        className="custom-integration-class"
      />
    );

    expect(screen.getByTestId('integration-notes')).toHaveClass('custom-integration-class');
  });

  it('supports integration search functionality', () => {
    render(
      <IntegrationNotes
        product={mockProduct}
        compatibilityMatrix={mockCompatibilityMatrix}
        searchable
      />
    );

    const searchInput = screen.getByPlaceholderText('Search integrations...');
    fireEvent.change(searchInput, { target: { value: 'NMEA' } });

    expect(screen.getByText('NMEA 2000')).toBeInTheDocument();
    expect(screen.queryByText('Chart APIs')).not.toBeInTheDocument();
  });

  it('displays installation complexity indicators', () => {
    const complexityMatrix = mockCompatibilityMatrix.map(item => ({
      ...item,
      complexity: item.compatibility === 'full' ? 'simple' :
                  item.compatibility === 'partial' ? 'moderate' : 'complex'
    }));

    render(
      <IntegrationNotes
        product={mockProduct}
        compatibilityMatrix={complexityMatrix}
        showComplexity
      />
    );

    expect(screen.getByTestId('complexity-simple')).toBeInTheDocument();
    expect(screen.getByTestId('complexity-moderate')).toBeInTheDocument();
    expect(screen.getByTestId('complexity-complex')).toBeInTheDocument();
  });

  it('handles responsive design for mobile devices', () => {
    render(<IntegrationNotes product={mockProduct} />);

    const integrationNotes = screen.getByTestId('integration-notes');
    expect(integrationNotes).toHaveClass('w-full');
  });

  it('shows integration cost estimates when available', () => {
    const matrixWithCosts = mockCompatibilityMatrix.map(item => ({
      ...item,
      estimatedCost: item.compatibility === 'adapter' ? '$500-1000' : undefined
    }));

    render(
      <IntegrationNotes
        product={mockProduct}
        compatibilityMatrix={matrixWithCosts}
        showCosts
      />
    );

    expect(screen.getByText('$500-1000')).toBeInTheDocument();
  });
});