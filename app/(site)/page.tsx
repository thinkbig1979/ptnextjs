import { TwoPillarHero } from "@/components/two-pillar-hero";
import { CallPaulSection } from "@/components/call-paul-section";
import { CustomLightingPreviewSection } from "@/components/custom-lighting-preview-section";
import { ConsultancyPreviewSection } from "@/components/consultancy-preview-section";
import { VendorConsultancyPreviewSection } from "@/components/vendor-consultancy-preview-section";
import { FeaturedPartnersSection } from "@/components/featured-partners-section";
import { ServicesOverviewSection } from "@/components/services-overview-section";
import { FeaturedBlogSection } from "@/components/featured-blog-section";
import { CTASection } from "@/components/cta-section";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [companyInfo, featuredPartners, featuredPosts] = await Promise.all([
    payloadCMSDataService.getCompanyInfo(),
    payloadCMSDataService.getFeaturedPartners(), // Optimized method for compound filtering
    payloadCMSDataService.getBlogPosts({ featured: true })
  ]);

  // Define the two-pillar data structure - updated for rebrand
  const leftPillarData = {
    title: "Custom Pixel LED Lighting",
    subtitle: "Engineered systems, not catalogue fixtures. Designed and built per project for superyachts and high-end architecture, interior and exterior.",
    description: "Engineered systems, not catalogue fixtures. Designed and built per project for superyachts and high-end architecture, interior and exterior.",
    founders: [],
    ctaText: "View Projects",
    ctaUrl: "/custom-lighting"
  };

  const rightPillarData = {
    title: "Technical Consultancy",
    subtitle: "Decision support for project teams and industry vendors. Clarity before change becomes expensive.",
    description: "Decision support for project teams and industry vendors. Clarity before change becomes expensive.",
    founders: [],
    ctaText: "View Services",
    ctaUrl: "/consultancy"
  };

  return (
    <div className="min-h-screen">
      <TwoPillarHero
        introTitle="Clarity at Critical Decision Points"
        introDescription="Independent technical consultancy and bespoke pixel LED lighting for superyachts and high-end architecture. Project teams gain clarity at critical decision points. Suppliers gain access to qualified specifiers."
        leftPillar={leftPillarData}
        rightPillar={rightPillarData}
        heroImage="/heroimagePT-min.png"
      />
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
