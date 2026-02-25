import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import type { Vendor } from '@/lib/types';

interface PromotionPackSectionProps {
  vendor: Vendor;
}

/**
 * PromotionPackSection - Displays Tier 3 vendor promotion content
 *
 * Only renders if vendor is tier3 and has promotion data.
 * Fields come from Payload CMS tier3-promotion fields:
 * promotionHeadline, promotionSubheadline, promotionBanner,
 * promotionVideo, promotionContent, promotionCTA, promotionCTALink
 */
export function PromotionPackSection({ vendor }: PromotionPackSectionProps) {
  // Only render for Tier 3 vendors with promotion data
  if (vendor.tier !== 'tier3') return null;

  // Check for any promotion content (these fields come directly from Payload)
  const vendorData = vendor as unknown as Record<string, unknown>;
  const headline = vendorData.promotionHeadline as string | undefined;
  const subheadline = vendorData.promotionSubheadline as string | undefined;
  const banner = vendorData.promotionBanner as string | undefined;
  const video = vendorData.promotionVideo as string | undefined;
  const cta = vendorData.promotionCTA as string | undefined;
  const ctaLink = vendorData.promotionCTALink as string | undefined;

  const hasContent = headline || subheadline || banner || video;
  if (!hasContent) return null;

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader>
        <CardTitle className="text-2xl font-cormorant">
          {headline || 'Featured Promotion'}
        </CardTitle>
        {subheadline ? (
          <p className="text-muted-foreground text-lg">{subheadline}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {banner ? (
          <div className="aspect-[21/9] relative rounded-lg overflow-hidden">
            <OptimizedImage
              src={banner}
              alt={headline || 'Promotion banner'}
              fill
              className="object-cover"
              fallbackType="company"
            />
          </div>
        ) : null}

        {video ? (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={video}
              title={headline || 'Promotional video'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {cta && ctaLink ? (
          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <a href={ctaLink} target="_blank" rel="noopener noreferrer">
                {cta}
              </a>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
