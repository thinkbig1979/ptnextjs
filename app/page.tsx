
import { HeroSection } from "@/components/hero-section";
import { FeaturedPartnersSection } from "@/components/featured-partners-section";
import { ServicesOverviewSection } from "@/components/services-overview-section";
import { FeaturedBlogSection } from "@/components/featured-blog-section";
import { CTASection } from "@/components/cta-section";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedPartnersSection />
      <ServicesOverviewSection />
      <FeaturedBlogSection />
      <CTASection />
    </div>
  );
}
