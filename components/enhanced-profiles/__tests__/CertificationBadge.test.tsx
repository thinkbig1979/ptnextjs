import * as React from "react";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CertificationBadge } from '../CertificationBadge';

describe('CertificationBadge', () => {
  const mockCertification = {
    name: 'ISO 9001:2015',
    issuer: 'International Organization for Standardization',
    validUntil: '2025-12-31',
    certificateUrl: 'https://example.com/cert.pdf',
    logoUrl: '/images/iso-logo.png',
    isVerified: true
  };

  it('renders certification name and issuer', () => {
    render(<CertificationBadge certification={mockCertification} />);

    expect(screen.getByText('ISO 9001:2015')).toBeInTheDocument();
    expect(screen.getByText('International Organization for Standardization')).toBeInTheDocument();
  });

  it('displays verification badge when certified', () => {
    render(<CertificationBadge certification={mockCertification} />);

    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
  });

  it('shows expiry date when provided', () => {
    render(<CertificationBadge certification={mockCertification} />);

    expect(screen.getByText(/Valid until/)).toBeInTheDocument();
    expect(screen.getByText(/12\/31\/2025/)).toBeInTheDocument();
  });

  it('renders logo when provided', () => {
    render(<CertificationBadge certification={mockCertification} />);

    const logo = screen.getByAltText('ISO 9001:2015 logo');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toContain('iso-logo.png');
  });

  it('links to certificate when url provided', () => {
    render(<CertificationBadge certification={mockCertification} />);

    const link = screen.getByRole('link', { name: /view certificate/i });
    expect(link).toHaveAttribute('href', 'https://example.com/cert.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('handles unverified certifications', () => {
    const unverifiedCert = { ...mockCertification, isVerified: false };
    render(<CertificationBadge certification={unverifiedCert} />);

    expect(screen.queryByTestId('verified-badge')).not.toBeInTheDocument();
  });

  it('handles expired certifications', () => {
    const expiredCert = { ...mockCertification, validUntil: '2020-12-31' };
    render(<CertificationBadge certification={expiredCert} />);

    expect(screen.getByTestId('certification-badge')).toHaveClass('opacity-60');
  });

  it('applies custom className when provided', () => {
    render(<CertificationBadge certification={mockCertification} className="custom-class" />);

    expect(screen.getByTestId('certification-badge')).toHaveClass('custom-class');
  });
});