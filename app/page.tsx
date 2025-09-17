
import { TwoPillarHero } from "@/components/two-pillar-hero";
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

  // Define the two-pillar data structure
  const leftPillarData = {
    title: "Discovery Platform",
    subtitle: "Public Yacht Data Intelligence",
    description: "Explore our comprehensive marketplace of vetted marine technology partners and proven solutions. Perfect for yacht owners and builders seeking established technologies.",
    founders: [
      {
        name: "Thijs van der Meer",
        role: "Co-founder"
      },
      {
        name: "Nigel Roberts",
        role: "Co-founder"
      },
      {
        name: "Roel Janssen",
        role: "Co-founder"
      }
    ],
    features: [
      "50+ Vetted Technology Partners",
      "500+ Proven Technology Solutions",
      "Expert Consultation & Matching"
    ],
    ctaText: "Explore Technology Partners",
    ctaUrl: "/partners"
  };

  const rightPillarData = {
    title: "Bespoke Solutions",
    subtitle: "Custom Technology Development",
    description: "Custom-engineered marine technology solutions tailored to your unique requirements. From concept to completion, we design and integrate cutting-edge systems.",
    founders: [
      {
        name: "Edwin Thames",
        role: "CTO & Technical Co-founder"
      }
    ],
    features: [
      "Audio Visual System Integration",
      "IT Infrastructure & Networking",
      "Intelligent Control Systems",
      "Custom Lighting Solutions"
    ],
    ctaText: "Discuss Your Project",
    ctaUrl: "/contact"
  };

  return (
    <div className="min-h-screen">
      <TwoPillarHero
        leftPillar={leftPillarData}
        rightPillar={rightPillarData}
      />
      <FeaturedPartnersSection featuredPartners={featuredPartners} />
      <ServicesOverviewSection />
      <FeaturedBlogSection featuredPosts={featuredPosts} />
      <CTASection companyInfo={companyInfo} />
    </div>
  );
}
