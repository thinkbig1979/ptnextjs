import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building2, 
  Package, 
  MapPin, 
  Calendar, 
  Star,
  Users,
  Award,
  CheckCircle,
  Target,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { notFound } from "next/navigation";
import PartnerDetailClient from "./_components/partner-detail-client";
import { VendorService, CompanyInfo } from "@/lib/types";

// Force static generation for optimal SEO and performance
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

// Generate static params for all partners at build time
export async function generateStaticParams() {
  try {
    console.log('🏗️  Generating static params for partner pages...');
    const partners = await tinaCMSDataService.getAllPartners();
    console.log(`📋 Found ${partners.length} partners for static generation`);
    
    const params = partners
      .filter(partner => partner.slug) // Only include partners with valid slugs
      .map((partner) => ({
        slug: partner.slug,
      }));
    
    if (params.length > 0) {
      console.log('🔗 Partner slugs to generate:', params.slice(0, 3).map(p => p.slug), '...');
    }
    
    console.log(`✅ Generated ${params.length} static partner params`);
    return params;
  } catch (error) {
    console.error('❌ Failed to generate static params for partners:', error);
    throw error; // Fail the build if we can't generate static params
  }
}

interface PartnerDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  // Await the params in server component
  const { slug } = await params;

  // Validate slug format (basic sanitization)
  if (!slug || typeof slug !== 'string' || slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
    notFound();
  }

  // Find the partner by slug using static data service
  const partner = await tinaCMSDataService.getPartnerBySlug(slug);
  
  if (!partner) {
    console.warn(`⚠️  Partner not found for slug: ${slug}`);
    notFound();
  }

  console.log(`✅ Loading partner: ${partner.name}`);

  // Find products from this partner and get company info for mission
  const [partnerProducts, companyInfo] = await Promise.all([
    tinaCMSDataService.getProductsByPartner(partner.id),
    tinaCMSDataService.getCompanyInfo()
  ]);
  console.log(`📦 Found ${partnerProducts.length} products for partner: ${partner.name}`);

  // Icon mapping for achievements
  const iconMap: Record<string, typeof Award> = {
    Award,
    Users,
    CheckCircle,
    Lightbulb,
    Building2,
    Package,
    MapPin,
    Calendar,
    Star,
    Target
  };

  // Get company statistics from CMS or generate minimal fallback
  const companyStats = partner.statistics && partner.statistics.length > 0 
    ? partner.statistics.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
        { label: "Product Lines", value: partnerProducts.length.toString() }
      ].filter(stat => parseInt(stat.value) > 0); // Only show if there are actual products

  // Get achievements from CMS (no fallback - hide section if empty)
  const achievements = partner.achievements && partner.achievements.length > 0
    ? partner.achievements.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Get services from partner data (no fallback - hide section if empty)  
  const services = partner.services && partner.services.length > 0 
    ? partner.services.map((s: VendorService) => s.service)
    : [];

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="group">
            <Link href="/partners">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Partners
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary">{partner.category}</Badge>
                {partner.featured && <Badge variant="default" className="bg-accent">Featured Partner</Badge>}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-cormorant font-bold mb-4">
                {partner.name}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6 font-poppins-light leading-relaxed">
                {partner.description}
              </p>

              {/* Company Info */}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Founded {partner.founded}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{partner.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{partnerProducts.length} Products</span>
                </div>
              </div>
            </div>

            {/* Company Image */}
            <div className="mb-8">
              <div className="rounded-lg border overflow-hidden">
                <OptimizedImage
                  src={partner?.image}
                  alt={`${partner.name} company overview`}
                  fallbackType="partner"
                  aspectRatio="video"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />
              </div>
            </div>

            {/* Company Stats */}
            {companyStats.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {companyStats.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-cormorant font-bold text-accent">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Key Achievements */}
            {achievements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-cormorant font-bold mb-4">Why Choose {partner.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => {
                    const IconComponent = achievement.icon && iconMap[achievement.icon] ? iconMap[achievement.icon] : Award;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-card rounded-lg border">
                        <IconComponent className="w-6 h-6 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium mb-1">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-cormorant font-bold mb-4">Services & Support</h2>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="font-poppins-light">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {partnerProducts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-cormorant font-bold">Featured Products</h2>
                  <Button asChild variant="outline">
                    <Link href={`/products?partner=${encodeURIComponent(partner.name)}`}>
                      View All Products
                      <Package className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerProducts.slice(0, 4).map((product) => (
                    <Card key={product.id} className="hover-lift cursor-pointer group overflow-hidden">
                      <Link href={`/products/${product.slug || product.id}`}>
                        {/* Product Image */}
                        <OptimizedImage
                          src={product.mainImage?.url || product.image}
                          alt={product.mainImage?.altText || product.name}
                          fallbackType="product"
                          aspectRatio="video"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        
                        <CardHeader>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          </div>
                          <CardTitle className="text-lg group-hover:text-accent transition-colors line-clamp-2">
                            {product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                          {product.features && product.features.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Star className="w-3 h-3" />
                                <span>{product.features[0].title}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Company Mission */}
            {(partner.mission || (companyInfo as CompanyInfo)?.mission) && (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-accent" />
                      <span>{partner.mission ? `${partner.name} Mission` : 'Our Mission'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground font-poppins-light leading-relaxed"
                         dangerouslySetInnerHTML={{ 
                           __html: partner.mission || (companyInfo as CompanyInfo)?.mission || '' 
                         }} 
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="mb-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-accent" />
                    <span>Contact {partner.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PartnerDetailClient partner={partner} />

                  <Separator />

                  {/* Quick Info */}
                  <div>
                    <h4 className="font-medium mb-3">Quick Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{partner.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founded:</span>
                        <span>{partner.founded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{partner.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Products:</span>
                        <span>{partnerProducts.length}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Tags */}
                  {partner.tags && partner.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {partner.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}