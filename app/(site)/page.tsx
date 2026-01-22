import { ThreeServiceHero } from '@/components/three-service-hero';
import { CallPaulSection } from '@/components/call-paul-section';
import { CustomLightingPreviewSection } from '@/components/custom-lighting-preview-section';
import { ConsultancyPreviewSection } from '@/components/consultancy-preview-section';
import { VendorConsultancyPreviewSection } from '@/components/vendor-consultancy-preview-section';
import { FeaturedPartnersSection } from '@/components/featured-partners-section';
import { ServicesOverviewSection } from '@/components/services-overview-section';
import { FeaturedBlogSection } from '@/components/featured-blog-section';
import { CTASection } from '@/components/cta-section';
import { payloadCMSDataService } from '@/lib/payload-cms-data-service';

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredPartners, featuredPosts] = await Promise.all([
    payloadCMSDataService.getFeaturedPartners(),
    payloadCMSDataService.getBlogPosts({ featured: true }),
  ]);

  return (
    <div className="min-h-screen">
      <ThreeServiceHero />
      <CallPaulSection />
      <CustomLightingPreviewSection />
      <ConsultancyPreviewSection />
      <VendorConsultancyPreviewSection />
      <FeaturedPartnersSection featuredPartners={featuredPartners} />
      <ServicesOverviewSection />
      <FeaturedBlogSection featuredPosts={featuredPosts} />
      <CTASection />
    </div>
  );
}
