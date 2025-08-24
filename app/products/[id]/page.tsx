
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building2, 
  Package, 
  Star, 
  CheckCircle, 
  Zap, 
  Shield, 
  Wrench,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { staticDataService } from "@/lib/static-data-service";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { notFound, redirect } from "next/navigation";
import ProductDetailClient from "./_components/product-detail-client";

// Force static generation for optimal SEO and performance
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    console.log('🏗️  Generating static params for product pages...');
    const products = await staticDataService.getAllProducts();
    console.log(`📋 Found ${products.length} products for static generation`);
    
    // Generate params for both IDs and slugs for backward compatibility
    const params = products.flatMap((product) => {
      const result = [{ id: product.id }]; // Always include numeric ID
      if (product.slug && product.slug !== product.id) {
        result.push({ id: product.slug }); // Include slug-based URL
      }
      return result;
    });
    
    console.log(`✅ Generated ${params.length} static product params`);
    if (params.length > 0) {
      console.log('🔗 Sample product URLs:', params.slice(0, 3).map(p => p.id), '...');
    }
    
    return params;
  } catch (error) {
    console.error('❌ Failed to generate static params for products:', error);
    throw error; // Fail the build if we can't generate static params
  }
}

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Await the params in server component
  const { id } = await params;

  // Validate the parameter format (basic sanitization)
  if (!id || typeof id !== 'string' || id.length > 100) {
    notFound();
  }

  // Try to find product by slug first, then by ID
  let product = await staticDataService.getProductBySlug(id);
  
  if (!product) {
    // Try to find by ID if not found by slug
    product = await staticDataService.getProductById(id);
    
    // If found by ID and has a slug, redirect to slug-based URL for SEO
    if (product && product.slug && product.slug !== id) {
      redirect(`/products/${product.slug}`);
    }
  }
  
  if (!product) {
    console.warn(`⚠️  Product not found for ID/slug: ${id}`);
    notFound();
  }

  console.log(`✅ Loading product: ${product.name}`);

  // Find the partner information
  const partner = await staticDataService.getPartnerById(product.partnerId);
  if (partner) {
    console.log(`🤝 Partner found: ${partner.name}`);
  }
  
  // Generate placeholder specifications
  const specifications = [
    { label: "Power Rating", value: "50-100kW" },
    { label: "Operating Voltage", value: "12V/24V DC" },
    { label: "Temperature Range", value: "-20°C to +60°C" },
    { label: "IP Rating", value: "IP67 Marine Grade" },
    { label: "Certification", value: "CE, FCC, IMO Compliant" },
    { label: "Warranty", value: "3 Years Extended" },
  ];

  const benefits = [
    "Enhanced performance and reliability",
    "Reduced maintenance requirements",
    "Energy efficient operation", 
    "Seamless integration with existing systems",
    "24/7 technical support included",
    "Comprehensive training provided"
  ];

  // Get all product images (main + gallery)
  const allImages = product?.images && product.images.length > 0 ? product.images : [];
  const mainImage = product?.mainImage || allImages[0];
  const galleryImages = allImages.filter(img => !img.isMain);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="group">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Products
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">Professional Grade</Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-cormorant font-bold mb-4">
                {product.name}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6 font-poppins-light leading-relaxed">
                {product.description}
              </p>

              {/* Partner Info */}
              {partner && (
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Manufactured by {partner.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {partner.location} • Est. {partner.founded}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Image Gallery */}
            <div className="mb-8">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="rounded-lg border overflow-hidden">
                  <OptimizedImage
                    src={mainImage?.url}
                    alt={mainImage?.altText || product.name}
                    fallbackType="product"
                    aspectRatio="video"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  />
                </div>

                {/* Image Gallery */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.slice(0, 4).map((image) => (
                      <div key={image.id} className="cursor-pointer hover:opacity-80 transition-opacity rounded-lg border overflow-hidden">
                        <OptimizedImage
                          src={image.url}
                          alt={image.altText || product?.name || ''}
                          fallbackType="product"
                          aspectRatio="square"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-cormorant font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-card rounded-lg border">
                    <Star className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="font-poppins-light">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h2 className="text-2xl font-cormorant font-bold mb-4">Benefits</h2>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-poppins-light">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="mb-8">
              <h2 className="text-2xl font-cormorant font-bold mb-4">Technical Specifications</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="font-poppins-medium text-sm">{spec.label}</span>
                        <span className="font-poppins-light text-sm text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Installation & Support */}
            <div className="mb-8">
              <h2 className="text-2xl font-cormorant font-bold mb-4">Installation & Support</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="text-center">
                    <Wrench className="w-8 h-8 text-accent mx-auto mb-2" />
                    <CardTitle className="text-lg">Professional Installation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                      Certified technicians handle complete installation and system integration.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="text-center">
                    <Zap className="w-8 h-8 text-accent mx-auto mb-2" />
                    <CardTitle className="text-lg">Quick Setup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                      Streamlined installation process with minimal downtime for your vessel.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="text-center">
                    <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                    <CardTitle className="text-lg">Ongoing Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                      24/7 technical support and regular maintenance services available.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="mb-6">
              <Card className="sticky top-6 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="break-words">Get This Product</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 break-words">
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <div className="text-2xl font-cormorant font-bold text-accent mb-1 break-words">Contact for Pricing</div>
                    <div className="text-sm text-muted-foreground break-words">Custom quotes available</div>
                  </div>
                  
                  <ProductDetailClient product={product} partner={partner ?? undefined} />

                  <Separator />

                  {/* Partner Link */}
                  {partner && (
                    <div>
                      <h4 className="font-medium mb-2">About the Manufacturer</h4>
                      <div className="border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors">
                        <Link href={`/partners/${partner.slug}`} className="block">
                          <div className="flex items-start space-x-3">
                            <div className="text-left flex-1">
                              <div className="font-medium text-foreground mb-1 word-wrap break-words hyphens-auto">
                                {partner.name}
                              </div>
                              <div className="text-sm text-muted-foreground leading-relaxed word-wrap break-words hyphens-auto">
                                {partner.description.length > 120 
                                  ? `${partner.description.substring(0, 120)}...` 
                                  : partner.description}
                              </div>
                              <div className="flex items-center text-accent text-sm mt-2">
                                <span className="mr-1">Learn more</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs break-words">
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
