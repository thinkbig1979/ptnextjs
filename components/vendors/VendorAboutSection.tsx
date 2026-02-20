'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import type { Vendor } from '@/lib/types';
import { ensureUrlProtocol } from '@/lib/utils/url';

interface VendorAboutSectionProps {
  vendor: Vendor;
}

/**
 * VendorAboutSection Component
 *
 * Displays vendor about content including:
 * - Company image
 * - Long description (if available)
 * - Video introduction (Tier 1+)
 * - Social proof metrics (Tier 1+)
 * - Service areas (Tier 1+)
 * - Company values (Tier 1+)
 *
 * Available to all tiers, but richer content for higher tiers
 */
export function VendorAboutSection({ vendor }: VendorAboutSectionProps) {
  // Show video only for Tier 1+
  const showVideo = vendor.tier && vendor.tier !== 'free' && vendor.videoUrl;

  // Show social proof only for Tier 1+
  const showSocialProof =
    vendor.tier &&
    vendor.tier !== 'free' &&
    (vendor.totalProjects || vendor.employeeCount || vendor.linkedinFollowers);

  // Show service areas and values only for Tier 1+
  const showServiceAreas =
    vendor.tier && vendor.tier !== 'free' && vendor.serviceAreas && vendor.serviceAreas.length > 0;
  const showCompanyValues =
    vendor.tier &&
    vendor.tier !== 'free' &&
    vendor.companyValues &&
    vendor.companyValues.length > 0;

  return (
    <div className="space-y-8">
      {/* Company Image */}
      {vendor.image && (
        <div className="aspect-video relative rounded-lg border overflow-hidden">
          <OptimizedImage
            src={vendor.image}
            alt={`${vendor.name} company overview`}
            fallbackType="partner"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
          />
        </div>
      )}

      {/* Long Description */}
      {vendor.longDescription && (
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: vendor.longDescription }} />
        </div>
      )}

      {/* Video Introduction (Tier 1+) */}
      {showVideo && (
        <div>
          <h2 className="text-2xl font-cormorant font-bold mb-4">Company Video</h2>
          <Card className="p-4">
            {vendor.videoTitle && <h3 className="font-semibold mb-2">{vendor.videoTitle}</h3>}
            {vendor.videoDescription && (
              <p className="text-muted-foreground mb-4">{vendor.videoDescription}</p>
            )}
            <Button asChild className="mt-4">
              <a href={ensureUrlProtocol(vendor.videoUrl!)} target="_blank" rel="noopener noreferrer">
                Watch Video
                {vendor.videoDuration && (
                  <span className="ml-2 text-xs">({vendor.videoDuration})</span>
                )}
              </a>
            </Button>
          </Card>
        </div>
      )}

      {/* Social Proof Metrics (Tier 1+) */}
      {showSocialProof && (
        <div>
          <h2 className="text-2xl font-cormorant font-bold mb-4">Company Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendor.totalProjects && vendor.totalProjects > 0 && (
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {vendor.totalProjects.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </Card>
            )}
            {vendor.employeeCount && vendor.employeeCount > 0 && (
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {vendor.employeeCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </Card>
            )}
            {vendor.linkedinFollowers && vendor.linkedinFollowers > 0 && (
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {vendor.linkedinFollowers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">LinkedIn Followers</div>
              </Card>
            )}
            {vendor.clientSatisfactionScore && vendor.clientSatisfactionScore > 0 && (
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {vendor.clientSatisfactionScore}%
                </div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </Card>
            )}
            {vendor.repeatClientPercentage && vendor.repeatClientPercentage > 0 && (
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {vendor.repeatClientPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Repeat Clients</div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Service Areas (Tier 1+) */}
      {showServiceAreas && (
        <div>
          <h2 className="text-2xl font-cormorant font-bold mb-4">Service Areas</h2>
          <div className="space-y-3">
            {vendor.serviceAreas?.map((service, index) => (
              <div key={`${typeof service === 'string' ? service : service.area}-${index}`} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">
                    {typeof service === 'string' ? service : service.area}
                  </div>
                  {typeof service !== 'string' && service.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Values (Tier 1+) */}
      {showCompanyValues && (
        <div>
          <h2 className="text-2xl font-cormorant font-bold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.companyValues?.map((val, index) => (
              <Card key={`${typeof val === 'string' ? val : val.value}-${index}`} className="p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {typeof val === 'string' ? val : val.value}
                    </div>
                    {typeof val !== 'string' && val.description && (
                      <div className="text-sm text-muted-foreground mt-1">{val.description}</div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

