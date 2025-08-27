
import { HeroSection } from "@/components/hero-section";
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

  return (
    <div className="min-h-screen">
      <HeroSection companyInfo={companyInfo} />
      <FeaturedPartnersSection featuredPartners={featuredPartners} />
      <ServicesOverviewSection />
      <FeaturedBlogSection featuredPosts={featuredPosts} />
      <CTASection companyInfo={companyInfo} />
    </div>
  );
}
