import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Package,
  MapPin,
  Info,
  Globe,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { notFound } from "next/navigation";
import VendorDetailClient from "./_components/vendor-detail-client";
import { Metadata } from "next";
import { formatVendorLocation } from "@/lib/utils/location";
import { isVendorLocationObject } from "@/lib/utils/type-guards";
import { VendorLocationSection } from "./_components/vendor-location-section";
import { LocationsDisplaySection } from "@/components/vendors/LocationsDisplaySection";
import { VendorHero } from "@/components/vendors/VendorHero";
import { VendorAboutSection } from "@/components/vendors/VendorAboutSection";
import { VendorCertificationsSection } from "@/components/vendors/VendorCertificationsSection";
import { VendorCaseStudiesSection } from "@/components/vendors/VendorCaseStudiesSection";
import { VendorTeamSection } from "@/components/vendors/VendorTeamSection";
import { VendorProductsSection } from "@/components/vendors/VendorProductsSection";
import { VendorMediaGallery } from "@/components/vendors/VendorMediaGallery";
import VendorReviewsWrapper from "./_components/vendor-reviews-wrapper";

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
// ISR: Revalidate every 60s in production, on-demand in dev
export const revalidate = 60;

// Generate static params for all vendors at build time
export async function generateStaticParams() {
  // Skip database calls during Docker builds (no DB available)
  if (process.env.SKIP_BUILD_DB === 'true') {
    console.log('📋 Skipping vendor static params (SKIP_BUILD_DB=true)');
    return [];
  }
  try {
    console.log('🏗️  Generating static params for vendor pages...');
    const vendors = await payloadCMSDataService.getAllVendors();
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
    // Return empty array on error - pages will be generated on-demand via ISR
    // This allows Docker builds to succeed without database access
    console.warn('⚠️  Could not generate static params for vendors (DB unavailable), using ISR:', error instanceof Error ? error.message : error);
    return [];
  }
}

// Generate metadata for each vendor page
export async function generateMetadata({ params }: VendorDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await payloadCMSDataService.getVendorBySlug(slug);

  if (!vendor) {
    return {
      title: 'Vendor Not Found',
    };
  }

  // Build tier-aware description
  const tierLabel = vendor.tier === 'tier3' ? 'Premium' : vendor.tier === 'tier2' ? 'Professional' : vendor.tier === 'tier1' ? 'Verified' : '';
  const description = vendor.longDescription || vendor.description;
  const enhancedDescription = tierLabel
    ? `${tierLabel} Vendor - ${description.slice(0, 140)}...`
    : description.slice(0, 160);

  // Build keywords including tier-specific features
  const keywords = [
    vendor.name,
    "superyacht vendor",
    "marine technology",
    "yacht equipment",
    vendor.category || "marine technology",
    ...(vendor.tags || [])
  ];

  // Add tier-specific keywords
  if (vendor.tier === 'tier3') {
    keywords.push('premium vendor', 'featured partner');
  } else if (vendor.tier === 'tier2') {
    keywords.push('professional vendor');
  } else if (vendor.tier === 'tier1') {
    keywords.push('verified vendor');
  }

  return {
    title: `${vendor.name}${tierLabel ? ` - ${tierLabel} Vendor` : ''} | Paul Thames - Superyacht Technology Solutions`,
    description: enhancedDescription,
    keywords,
    openGraph: {
      title: `${vendor.name} | Vendors | Paul Thames`,
      description: enhancedDescription,
      type: "website",
      url: `/vendors/${slug}`,
      images: vendor.image ? [{ url: vendor.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${vendor.name} | Vendors | Paul Thames`,
      description: enhancedDescription,
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
  const vendor = await payloadCMSDataService.getVendorBySlug(slug);

  if (!vendor) {
    console.warn(`⚠️  Vendor not found for slug: ${slug}`);
    notFound();
  }

  console.log(`✅ Loading vendor: ${vendor.name} (Tier: ${vendor.tier || 'free'})`);
  console.log(`🔍 DEBUG foundedYear:`, {
    hasFoundedYear: 'foundedYear' in vendor,
    foundedYearValue: vendor.foundedYear,
    vendorKeys: Object.keys(vendor).sort(),
  });

  // Find products from this vendor
  const vendorProducts = await payloadCMSDataService.getProductsByVendor(vendor.id);
  console.log(`📦 Found ${vendorProducts.length} products for vendor: ${vendor.name}`);

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
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section with Tier Badge */}
            <VendorHero vendor={vendor} productCount={vendorProducts.length} />

            {/* Tabbed Content Interface */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className={`grid w-full ${vendor.tier && ['tier2', 'tier3'].includes(vendor.tier) ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="about" aria-label="About" className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">About</span>
                </TabsTrigger>
                <TabsTrigger value="locations" aria-label="Locations" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Locations</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" aria-label="Reviews" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Reviews</span>
                </TabsTrigger>
                {/* Only show Products tab for Tier 2+ vendors */}
                {vendor.tier && ['tier2', 'tier3'].includes(vendor.tier) && (
                  <TabsTrigger value="products" aria-label="Products" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Products</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* About Tab - Shows tier-responsive content */}
              <TabsContent value="about" className="space-y-8 mt-6">
                <VendorAboutSection vendor={vendor} />
                <VendorCertificationsSection vendor={vendor} />
                <VendorCaseStudiesSection vendor={vendor} />
                <VendorTeamSection vendor={vendor} />
                <VendorMediaGallery mediaGallery={vendor.mediaGallery} vendorName={vendor.name} vendorTier={vendor.tier} />
              </TabsContent>

              {/* Locations Tab */}
              <TabsContent value="locations" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-cormorant font-bold mb-4">Vendor Locations</h2>
                  <p className="text-muted-foreground mb-6">
                    Find {vendor.name} locations and contact information worldwide.
                  </p>
                  <LocationsDisplaySection
                    locations={vendor.locations || []}
                    vendorTier={vendor.tier || 'free'}
                  />
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6 mt-6">
                <VendorReviewsWrapper
                  vendorId={vendor.id}
                  vendorSlug={vendor.slug || slug}
                  vendorReviews={vendor.vendorReviews}
                />
              </TabsContent>

              {/* Products Tab - Tier 2+ only */}
              {vendor.tier && ['tier2', 'tier3'].includes(vendor.tier) && (
                <TabsContent value="products" className="space-y-6 mt-6">
                  <VendorProductsSection
                    vendorName={vendor.name}
                    vendorTier={vendor.tier}
                    products={vendorProducts}
                  />
                </TabsContent>
              )}
            </Tabs>
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
                      {vendor.founded && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founded:</span>
                          <span>{vendor.founded}</span>
                        </div>
                      )}
                      {formatVendorLocation(vendor.location) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span>{formatVendorLocation(vendor.location)}</span>
                        </div>
                      )}
                      {/* Only show product count for Tier 2+ vendors */}
                      {vendor.tier && ['tier2', 'tier3'].includes(vendor.tier) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Products:</span>
                          <span>{vendorProducts.length}</span>
                        </div>
                      )}
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

            {/* Location Map and Info */}
            {vendor.location && isVendorLocationObject(vendor.location) &&
             vendor.location.latitude !== undefined && vendor.location.longitude !== undefined && (
              <VendorLocationSection
                vendorName={vendor.name}
                location={vendor.location}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}