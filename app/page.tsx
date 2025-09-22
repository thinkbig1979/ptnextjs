
import { TwoPillarHero } from "@/components/two-pillar-hero";
import { CallPaulSection } from "@/components/call-paul-section";
import { FeaturedPartnersSection } from "@/components/featured-partners-section";
import { ServicesOverviewSection } from "@/components/services-overview-section";
import { FeaturedBlogSection } from "@/components/featured-blog-section";
import { CTASection } from "@/components/cta-section";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";

export default async function HomePage() {
  const [companyInfo, featuredPartners, featuredPosts] = await Promise.all([
    tinaCMSDataService.getCompanyInfo(),
    tinaCMSDataService.getFeaturedPartners(), // Optimized method for compound filtering
    tinaCMSDataService.getBlogPosts({ featured: true })
  ]);

  // Define the two-pillar data structure with exact pt2 content
  const leftPillarData = {
    title: "Discovery Platform",
    subtitle: "Enabling the industry to explore innovative tech products, services, and proven suppliers. Fast and transparent.",
    description: "Enabling the industry to explore innovative tech products, services, and proven suppliers. Fast and transparent.",
    founders: [],
    ctaText: "Learn More",
    ctaUrl: "/discovery-platform"
  };

  const rightPillarData = {
    title: "Expertise & Bespoke Solutions",
    subtitle: "Senior technical leadership, scoped discovery, and access to our curated PT Collective.",
    description: "Senior technical leadership, scoped discovery, and access to our curated PT Collective.",
    founders: [],
    ctaText: "Learn More",
    ctaUrl: "/bespoke-solutions"
  };

  return (
    <div className="min-h-screen">
      <TwoPillarHero
        introTitle="The Bridge Between Yachting Projects & Technology"
        introDescription="In a crowded market, we provide clarity by connecting stakeholders in yachting projects with the right technology and experts. When off-the-shelf simply will not do, we leverage our network to bring you high quality tailored solutions."
        leftPillar={leftPillarData}
        rightPillar={rightPillarData}
        heroImage="/heroimagePT-min.png"
      />
      <CallPaulSection />
      <FeaturedPartnersSection featuredPartners={featuredPartners} />
      <ServicesOverviewSection />
      <FeaturedBlogSection featuredPosts={featuredPosts} />
      <CTASection companyInfo={companyInfo} />
    </div>
  );
}
