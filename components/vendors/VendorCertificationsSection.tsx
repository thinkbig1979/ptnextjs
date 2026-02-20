'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import type { Vendor } from '@/lib/types';
import { ensureUrlProtocol } from '@/lib/utils/url';

interface VendorCertificationsSectionProps {
  vendor: Vendor;
}

/**
 * VendorCertificationsSection Component
 *
 * Displays vendor certifications and awards
 * Available only for Tier 1+ vendors
 *
 * Features:
 * - Certifications grid with verification badges
 * - Awards section with year and organization
 * - Links to certificate URLs (if available)
 */
export function VendorCertificationsSection({ vendor }: VendorCertificationsSectionProps) {
  // Only show for Tier 1+
  if (!vendor.tier || vendor.tier === 'free') {
    return null;
  }

  const hasCertifications = vendor.certifications && vendor.certifications.length > 0;
  const hasAwards = vendor.awards && vendor.awards.length > 0;

  // If no certifications or awards, don't render the section
  if (!hasCertifications && !hasAwards) {
    return null;
  }

  return (
    <div className="space-y-8" data-testid="certifications-section">
      {/* Certifications */}
      {hasCertifications && (
        <div data-testid="certifications">
          <h2 className="text-2xl font-cormorant font-bold mb-4">
            Certifications & Compliance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.certifications!.map((cert, index) => (
              <Card key={`${cert.name}-${index}`} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{cert.name}</h3>
                  <Badge variant="outline">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Issued by: {cert.issuer}</p>
                {cert.expiryDate && (
                  <p className="text-xs text-muted-foreground">
                    Valid until: {new Date(cert.expiryDate).toLocaleDateString()}
                  </p>
                )}
                {cert.certificateUrl && (
                  <a
                    href={ensureUrlProtocol(cert.certificateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    View Certificate
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Awards Section */}
      {hasAwards && (
        <div data-testid="awards">
          <h2 className="text-2xl font-cormorant font-bold mb-4">Awards & Recognition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.awards!.map((award, index) => (
              <Card key={`${award.title}-${index}`} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{award.title}</h3>
                  {award.year && <Badge variant="outline">{award.year}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {award.organization || 'Industry Recognition'}
                </p>
                {award.description && <p className="text-sm">{award.description}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

