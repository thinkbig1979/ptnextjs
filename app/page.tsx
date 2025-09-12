
import { TwoPillarHero } from "@/components/two-pillar-hero";
import { FeaturedPartnersSection } from "@/components/featured-partners-section";
import { ServicesOverviewSection } from "@/components/services-overview-section";
import { FeaturedBlogSection } from "@/components/featured-blog-section";
import { CTASection } from "@/components/cta-section";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";
import { Database, Cpu, Zap, Target, Users, Settings, TrendingUp, Globe, Shield } from "lucide-react";

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
    description: "Comprehensive database and analytics platform providing unprecedented access to superyacht market data, trends, and intelligence for informed decision-making across the marine industry.",
    founders: [
      {
        name: "Thijs van der Meer",
        role: "Sales Co-Founder",
        specialties: ["Business Development", "Market Strategy", "Client Relations"],
        description: "Driving growth through strategic partnerships and comprehensive market understanding of the superyacht ecosystem."
      },
      {
        name: "Nigel Roberts", 
        role: "Marketing Co-Founder",
        specialties: ["Brand Strategy", "Digital Marketing", "Content Creation"],
        description: "Building brand presence and market visibility through innovative marketing approaches and industry expertise."
      },
      {
        name: "Roel Janssen",
        role: "Operations Co-Founder", 
        specialties: ["Operations Management", "Process Optimization", "Quality Assurance"],
        description: "Ensuring operational excellence and streamlined processes across all business functions."
      }
    ],
    valuePropositions: [
      {
        icon: <Database className="h-5 w-5" />,
        title: "Comprehensive Data Access",
        description: "Real-time access to yacht specifications, market trends, ownership data, and industry analytics."
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Market Intelligence",
        description: "Advanced analytics and insights for strategic business decisions in the superyacht industry."
      },
      {
        icon: <Globe className="h-5 w-5" />,
        title: "Global Network",
        description: "Connect with key stakeholders, brokers, and decision-makers across the worldwide superyacht ecosystem."
      }
    ],
    ctaText: "Explore Discovery Platform",
    ctaUrl: "/discovery"
  };

  const rightPillarData = {
    title: "Bespoke Solutions",
    subtitle: "Custom Technology Development",
    description: "Tailored technology solutions designed specifically for your unique requirements, from advanced system integration to cutting-edge maritime applications and AI-powered innovations.",
    founders: [
      {
        name: "Edwin Thames",
        role: "Technical Co-Founder",
        specialties: ["System Architecture", "AI Integration", "Performance Optimization"],
        description: "Leading bespoke technology solutions with deep expertise in marine systems, advanced development practices, and cutting-edge innovation."
      }
    ],
    valuePropositions: [
      {
        icon: <Cpu className="h-5 w-5" />,
        title: "Custom Development",
        description: "Bespoke software and hardware solutions tailored to your specific operational and technical requirements."
      },
      {
        icon: <Shield className="h-5 w-5" />,
        title: "System Integration",
        description: "Seamless integration of new technologies with existing marine systems and operational workflows."
      },
      {
        icon: <Settings className="h-5 w-5" />,
        title: "Ongoing Partnership",
        description: "Comprehensive support, maintenance, and continuous evolution of your technology solutions."
      }
    ],
    ctaText: "Request Bespoke Solution",
    ctaUrl: "/bespoke"
  };

  return (
    <div className="min-h-screen">
      <TwoPillarHero
        introTitle="Paul Thames Superyacht Technology"
        introDescription="Pioneering innovation in marine technology with two distinct service pillars designed to elevate the superyacht industry through data intelligence and custom solutions."
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
