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
import dataService from "@/lib/data-service";
import { notFound } from "next/navigation";
import PartnerDetailClient from "./_components/partner-detail-client";

// Enable static generation
export const dynamic = 'auto';

// Generate static params for all partners
export async function generateStaticParams() {
  try {
    const partners = await dataService.getPartners();
    console.log(`generateStaticParams: Found ${partners.length} partners`);
    if (partners.length > 0) {
      console.log('First few partner slugs:', partners.slice(0, 3).map(p => p.slug));
    }
    return partners.map((partner) => ({
      slug: partner.slug,
    }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    // Return empty array as fallback
    return [];
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

  // Find the partner by slug using data service
  const partner = await dataService.getPartnerBySlug(slug);
  
  if (!partner) {
    notFound();
  }

  // Find products from this partner
  const partnerProducts = await dataService.getProductsByPartner(partner.id);

  // Generate placeholder data
  const achievements = [
    { icon: Award, title: "Industry Leader", description: "Over 20 years of marine technology excellence" },
    { icon: Users, title: "Global Reach", description: "Serving customers in 45+ countries worldwide" },
    { icon: CheckCircle, title: "Quality Certified", description: "ISO 9001:2015 and marine industry certifications" },
    { icon: Lightbulb, title: "Innovation Focus", description: "R&D investment of 15% of annual revenue" }
  ];

  const services = [
    "Custom System Design & Integration",
    "Professional Installation Services",
    "24/7 Technical Support",
    "Comprehensive Training Programs",
    "Preventive Maintenance Plans",
    "Warranty & Extended Service Options"
  ];

  const companyStats = [
    { label: "Years in Business", value: new Date().getFullYear() - (partner.founded || 2000) },
    { label: "Global Installations", value: "2,500+" },
    { label: "Certified Technicians", value: "150+" },
    { label: "Product Lines", value: partnerProducts.length || "10+" }
  ];

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
              <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-accent/60 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Company Overview Image</p>
                </div>
              </div>
            </div>

            {/* Company Stats */}
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

            {/* Key Achievements */}
            <div className="mb-8">
              <h2 className="text-2xl font-cormorant font-bold mb-4">Why Choose {partner.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
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

            {/* Services */}
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
                    <Card key={product.id} className="hover-lift cursor-pointer group">
                      <Link href={`/products/${product.id}`}>
                        <CardHeader>
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="w-4 h-4 text-accent" />
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
                          {product.features.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Star className="w-3 h-3" />
                                <span>{product.features[0]}</span>
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
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-accent" />
                    <span>Our Mission</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-poppins-light leading-relaxed">
                    At {partner.name}, we are dedicated to revolutionizing the superyacht industry through 
                    cutting-edge technology solutions. Our commitment to excellence drives us to deliver 
                    innovative products that enhance safety, efficiency, and luxury aboard the world's 
                    finest vessels. We partner with yacht owners, builders, and operators to create 
                    seamless integration of advanced marine technologies.
                  </p>
                </CardContent>
              </Card>
            </div>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}