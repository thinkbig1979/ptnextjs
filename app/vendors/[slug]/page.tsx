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
import VendorDetailClient from "./_components/vendor-detail-client";
import { Metadata } from "next";

// Force static generation for optimal SEO and performance
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

// Generate static params for all vendors at build time
export async function generateStaticParams() {
  try {
    console.log('🏗️  Generating static params for vendor pages...');
    const vendors = await tinaCMSDataService.getAllVendors();
    console.log(`📋 Found ${vendors.length} vendors for static generation`);
    
    const params = vendors
      .filter(vendor => vendor.slug) // Only include vendors with valid slugs
      .map((vendor) => ({
        slug: vendor.slug,
      }));
    
    if (params.length > 0) {
      console.log('🔗 Vendor slugs to generate:', params.slice(0, 3).map(p => p.slug), '...');
    }
    
    console.log(`✅ Generated ${params.length} static vendor params`);
    return params;
  } catch (error) {
    console.error('❌ Failed to generate static params for vendors:', error);
    throw error; // Fail the build if we can't generate static params
  }
}

// Generate metadata for each vendor page
export async function generateMetadata({ params }: VendorDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await tinaCMSDataService.getVendorBySlug(slug);

  if (!vendor) {
    return {
      title: 'Vendor Not Found',
    };
  }

  return {
    title: `${vendor.name} | Vendors | Paul Thames - Superyacht Technology Solutions`,
    description: vendor.description,
    keywords: [
      vendor.name,
      "superyacht vendor",
      "marine technology", 
      "yacht equipment",
      vendor.category || "marine technology",
      ...(vendor.tags || [])
    ],
    openGraph: {
      title: `${vendor.name} | Vendors | Paul Thames`,
      description: vendor.description,
      type: "website",
      url: `/vendors/${slug}`,
      images: vendor.image ? [{ url: vendor.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${vendor.name} | Vendors | Paul Thames`,
      description: vendor.description,
      images: vendor.image ? [vendor.image] : undefined,
    },
    alternates: {
      canonical: `/vendors/${slug}`
    }
  };
}

interface VendorDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  // Await the params in server component
  const { slug } = await params;

  // Validate slug format (basic sanitization)
  if (!slug || typeof slug !== 'string' || slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
    notFound();
  }

  // Find the vendor by slug using static data service
  const vendor = await tinaCMSDataService.getVendorBySlug(slug);
  
  if (!vendor) {
    console.warn(`⚠️  Vendor not found for slug: ${slug}`);
    notFound();
  }

  console.log(`✅ Loading vendor: ${vendor.name}`);

  // Find products from this vendor and get company info for mission
  const [vendorProducts, companyInfo] = await Promise.all([
    tinaCMSDataService.getProductsByVendor(vendor.id),
    tinaCMSDataService.getCompanyInfo()
  ]);
  console.log(`📦 Found ${vendorProducts.length} products for vendor: ${vendor.name}`);

  // Generate placeholder data
  const achievements = [
    { icon: Award, title: "Industry Leader", description: "Over 20 years of marine technology excellence" },
    { icon: Users, title: "Global Reach", description: "Serving customers in 45+ countries worldwide" },
    { icon: CheckCircle, title: "Quality Certified", description: "ISO 9001:2015 and marine industry certifications" },
    { icon: Lightbulb, title: "Innovation Focus", description: "R&D investment of 15% of annual revenue" }
  ];

  // Get services from vendor data or use fallback
  const services = vendor.services && vendor.services.length > 0 
    ? vendor.services.map((s: any) => s.service)
    : [
        "Custom System Design & Integration",
        "Professional Installation Services",
        "24/7 Technical Support", 
        "Comprehensive Training Programs",
        "Preventive Maintenance Plans",
        "Warranty & Extended Service Options"
      ];

  const companyStats = [
    { label: "Years in Business", value: new Date().getFullYear() - (vendor.founded || 2000) },
    { label: "Global Installations", value: "2,500+" },
    { label: "Certified Technicians", value: "150+" },
    { label: "Product Lines", value: vendorProducts.length || "10+" }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="group">
            <Link href="/vendors">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Vendors
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary">{vendor.category}</Badge>
                {vendor.featured && <Badge variant="default" className="bg-accent">Featured Vendor</Badge>}
                {vendor.partner && <Badge variant="default" className="bg-green-600">Partner</Badge>}
              </div>
              
              {/* Company Logo and Name Header */}
              <div className="flex items-center space-x-6 mb-6">
                {vendor.logo && (
                  <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center bg-white rounded-lg border border-border p-2">
                    <img
                      src={vendor.logo}
                      alt={`${vendor.name} logo`}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxWidth: '64px', maxHeight: '64px' }}
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <h1 className="text-4xl md:text-5xl font-cormorant font-bold leading-tight">
                    {vendor.name}
                  </h1>
                </div>
              </div>
              
              <p className="text-xl text-muted-foreground mb-6 font-poppins-light leading-relaxed">
                {vendor.description}
              </p>

              {/* Company Info */}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Founded {vendor.founded}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{vendorProducts.length} Products</span>
                </div>
              </div>
            </div>

            {/* Company Image */}
            <div className="mb-8">
              <div className="rounded-lg border overflow-hidden">
                <OptimizedImage
                  src={vendor?.image}
                  alt={`${vendor.name} company overview`}
                  fallbackType="partner"
                  aspectRatio="video"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />
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
              <h2 className="text-2xl font-cormorant font-bold mb-4">Why Choose {vendor.name}</h2>
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
            {vendorProducts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-cormorant font-bold">Featured Products</h2>
                  <Button asChild variant="outline">
                    <Link href={`/products?partner=${encodeURIComponent(vendor.name)}`}>
                      View All Products
                      <Package className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendorProducts.slice(0, 4).map((product) => (
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
                    {(companyInfo as any)?.mission || `At ${vendor.name}, we are dedicated to revolutionizing the superyacht industry through 
                    cutting-edge technology solutions. Our commitment to excellence drives us to deliver 
                    innovative products that enhance safety, efficiency, and luxury aboard the world's 
                    finest vessels. We partner with yacht owners, builders, and operators to create 
                    seamless integration of advanced marine technologies.`}
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
                    <span>Contact {vendor.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <VendorDetailClient vendor={vendor} />

                  <Separator />

                  {/* Quick Info */}
                  <div>
                    <h4 className="font-medium mb-3">Quick Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{vendor.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founded:</span>
                        <span>{vendor.founded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{vendor.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Products:</span>
                        <span>{vendorProducts.length}</span>
                      </div>
                      {vendor.partner && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="default" className="bg-green-600 text-xs">Partner</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Tags */}
                  {vendor.tags && vendor.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {vendor.tags.map((tag) => (
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