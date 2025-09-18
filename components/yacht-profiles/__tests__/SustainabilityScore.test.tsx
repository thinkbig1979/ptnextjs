import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SustainabilityScore } from '../SustainabilityScore';
import type { YachtSustainabilityMetrics } from '@/lib/types';

describe('SustainabilityScore', () => {
  const mockSustainabilityData: YachtSustainabilityMetrics = {
    overallScore: 85,
    co2Emissions: 1200,
    energyEfficiency: 2.5,
    wasteManagement: 'excellent',
    waterConservation: 'good',
    materialSustainability: 'good',
    certifications: ['Green Marine', 'ISO 14001']
  };

  it('renders overall sustainability score', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} />);

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Overall Sustainability Score')).toBeInTheDocument();
  });

  it('displays CO2 emissions correctly', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} />);

    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('kg CO₂ equivalent')).toBeInTheDocument();
  });

  it('shows energy efficiency metrics', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} />);

    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('kWh per nautical mile')).toBeInTheDocument();
  });

  it('displays waste management rating', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} />);

    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('Waste Management')).toBeInTheDocument();
  });

  it('shows water conservation rating', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} />);

    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Water Conservation')).toBeInTheDocument();
  });

  it('displays material sustainability rating', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} />);

    const goodRatings = screen.getAllByText('Good');
    expect(goodRatings).toHaveLength(2); // Water conservation and material sustainability
    expect(screen.getByText('Material Sustainability')).toBeInTheDocument();
  });

  it('shows sustainability certifications', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} />);

    expect(screen.getByText('Green Marine')).toBeInTheDocument();
    expect(screen.getByText('ISO 14001')).toBeInTheDocument();
    expect(screen.getByText('Certifications')).toBeInTheDocument();
  });

  it('applies correct color classes based on score ranges', () => {
    // Test high score (excellent - green)
    render(<SustainabilityScore metrics={mockSustainabilityData} />);
    const scoreElement = screen.getByTestId('overall-score');
    expect(scoreElement).toHaveClass('text-green-600');

    // Test medium score (good - yellow)
    const mediumScore = { ...mockSustainabilityData, overallScore: 70 };
    render(<SustainabilityScore metrics={mediumScore} />);
    const mediumScoreElement = screen.getByTestId('overall-score');
    expect(mediumScoreElement).toHaveClass('text-yellow-600');

    // Test low score (poor - red)
    const lowScore = { ...mockSustainabilityData, overallScore: 40 };
    render(<SustainabilityScore metrics={lowScore} />);
    const lowScoreElement = screen.getByTestId('overall-score');
    expect(lowScoreElement).toHaveClass('text-red-600');
  });

  it('handles missing overall score', () => {
    const incompleteData = { ...mockSustainabilityData, overallScore: undefined };
    render(<SustainabilityScore metrics={incompleteData} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('Overall Sustainability Score')).toBeInTheDocument();
  });

  it('handles missing CO2 emissions data', () => {
    const incompleteData = { ...mockSustainabilityData, co2Emissions: undefined };
    render(<SustainabilityScore metrics={incompleteData} />);

    expect(screen.queryByText('kg CO₂ equivalent')).not.toBeInTheDocument();
  });

  it('handles missing energy efficiency data', () => {
    const incompleteData = { ...mockSustainabilityData, energyEfficiency: undefined };
    render(<SustainabilityScore metrics={incompleteData} />);

    expect(screen.queryByText('kWh per nautical mile')).not.toBeInTheDocument();
  });

  it('handles empty certifications array', () => {
    const noCertifications = { ...mockSustainabilityData, certifications: [] };
    render(<SustainabilityScore metrics={noCertifications} />);

    expect(screen.getByText('No certifications listed')).toBeInTheDocument();
  });

  it('shows progress bars for score visualization', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} showProgressBars={true} />);

    const progressBar = screen.getByTestId('score-progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle('width: 85%');
  });

  it('displays score interpretation text', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} showInterpretation={true} />);

    expect(screen.getByText(/excellent environmental performance/i)).toBeInTheDocument();
  });

  it('renders compact view when specified', () => {
    render(<SustainabilityScore metrics={mockSustainabilityData} compact={true} />);

    const compactElement = screen.getByTestId('sustainability-score');
    expect(compactElement).toHaveClass('compact-view');
  });
});