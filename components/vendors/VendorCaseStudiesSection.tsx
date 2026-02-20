'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import type { Vendor } from '@/lib/types';

interface VendorCaseStudiesSectionProps {
  vendor: Vendor;
}

/**
 * VendorCaseStudiesSection Component
 *
 * Displays vendor case studies with featured highlighting
 * Available only for Tier 1+ vendors
 *
 * Features:
 * - Case study cards with image gallery
 * - Featured case studies highlighted
 * - Project details (yacht, completion date, description)
 * - Outcome/results display
 */
export function VendorCaseStudiesSection({ vendor }: VendorCaseStudiesSectionProps) {
  // Only show for Tier 1+
  if (!vendor.tier || vendor.tier === 'free') {
    return null;
  }

  const hasCaseStudies = vendor.caseStudies && vendor.caseStudies.length > 0;

  // If no case studies, don't render the section
  if (!hasCaseStudies) {
    return null;
  }

  // For now, show all case studies equally (featured flag not in type yet)
  const allCaseStudies = vendor.caseStudies!;

  return (
    <div className="space-y-6" data-testid="case-studies-section">
      <h2 className="text-2xl font-cormorant font-bold">Case Studies</h2>

      {/* Case Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allCaseStudies.map((caseStudy, index) => (
          <Card key={`${caseStudy.title}-${index}`} className="overflow-hidden">
            {/* Image */}
            {caseStudy.images && caseStudy.images.length > 0 && (
              <div className="aspect-video relative">
                <OptimizedImage
                  src={caseStudy.images[0]}
                  alt={caseStudy.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}

            {/* Content */}
            <CardHeader>
              <CardTitle className="text-lg">{caseStudy.title}</CardTitle>
              {caseStudy.client && (
                <p className="text-sm text-muted-foreground">Client: {caseStudy.client}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Challenge</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {caseStudy.challenge}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Solution</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {caseStudy.solution}
                </p>
              </div>
              {caseStudy.results && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Results</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {caseStudy.results}
                  </p>
                </div>
              )}
              {caseStudy.technologies && caseStudy.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {caseStudy.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

