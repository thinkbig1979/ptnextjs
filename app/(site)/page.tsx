import { TwoPillarHero } from "@/components/two-pillar-hero";
import { CredibilityStats } from "@/components/credibility-stats";
import { CallPaulSection } from "@/components/call-paul-section";
import { CustomLightingPreviewSection } from "@/components/custom-lighting-preview-section";
import { ConsultancyPreviewSection } from "@/components/consultancy-preview-section";
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
    title: "Discovery Platform",
    subtitle: "Enabling the industry to explore innovative tech products, services, and proven suppliers. Fast and transparent.",
    description: "Enabling the industry to explore innovative tech products, services, and proven suppliers. Fast and transparent.",
    founders: [],
    ctaText: "Explore Vendors",
    ctaUrl: "/vendors"
  };

  const rightPillarData = {
    title: "Consultancy Services",
    subtitle: "Lightweight, owner-aligned consultancy delivering clarity early — before change becomes expensive.",
    description: "Lightweight, owner-aligned consultancy delivering clarity early — before change becomes expensive.",
    founders: [],
    ctaText: "Learn More",
    ctaUrl: "/consultancy"
  };

  // Credibility stats for the homepage
  const credibilityStats = [
    { value: 15, label: "Years Experience", suffix: "+" },
    { value: 200, label: "Projects Delivered", suffix: "+" },
    { value: 50, label: "Industry Partners", suffix: "+" },
    { value: 100, label: "Client Satisfaction", suffix: "%" },
  ];

  return (
    <div className="min-h-screen">
      <TwoPillarHero
        introTitle="The Bridge Between Yachting Projects & Technology"
        introDescription="In a crowded market, we provide clarity by connecting stakeholders in yachting projects with the right technology and experts. When off-the-shelf simply will not do, we leverage our network to bring you high quality tailored solutions."
        leftPillar={leftPillarData}
        rightPillar={rightPillarData}
        heroImage="/heroimagePT-min.png"
      />
      <CredibilityStats
        stats={credibilityStats}
        title="Trusted by the Industry"
        description="Building lasting relationships through expertise and dedication to excellence."
      />
      <CallPaulSection />
      <CustomLightingPreviewSection />
      <ConsultancyPreviewSection />
      <FeaturedPartnersSection featuredPartners={featuredPartners} />
      <ServicesOverviewSection />
      <FeaturedBlogSection featuredPosts={featuredPosts} />
      <CTASection />
    </div>
  );
}
