import * as React from "react";
import { Suspense } from "react";
import { VendorsClient } from "@/app/(site)/components/vendors-client";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";
import { Metadata } from "next";
import type { Vendor, Product } from "@/lib/types";

/**
 * Extract only required fields for VendorsClient to minimize RSC serialization
 * This reduces the page weight by not sending unused vendor fields to the client
 */
function serializeVendorForClient(vendor: Vendor) {
  return {
    id: vendor.id,
    slug: vendor.slug,
    name: vendor.name,
    description: vendor.description,
    logo: vendor.logo,
    tier: vendor.tier,
    featured: vendor.featured,
    partner: vendor.partner,
    foundedYear: vendor.foundedYear,
    founded: vendor.founded,
    category: vendor.category,
    tags: vendor.tags,
    locations: vendor.locations?.map(loc => ({
      id: loc.id,
      city: loc.city,
      country: loc.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
      isHQ: loc.isHQ,
    })),
  };
}

/**
 * Extract only required fields for product filtering
 */
function serializeProductForClient(product: Product) {
  return {
    id: product.id,
    category: product.category,
    vendorId: product.vendorId,
    partnerId: product.partnerId,
  };
}

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';
// ISR: Revalidate every 10s in dev, 5min in production
export const revalidate = 300; // ISR: Revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Vendors | Paul Thames - Superyacht Technology Solutions",
  description: "Explore our comprehensive directory of superyacht technology vendors and marine electronics suppliers. Find the right solutions for your yacht projects.",
  keywords: [
    "superyacht vendors",
    "marine technology suppliers", 
    "yacht equipment vendors",
    "marine electronics suppliers",
    "superyacht technology partners",
    "yacht systems vendors"
  ],
  openGraph: {
    title: "Vendors | Paul Thames - Superyacht Technology Solutions",
    description: "Explore our comprehensive directory of superyacht technology vendors and marine electronics suppliers.",
    type: "website",
    url: "/vendors",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vendors | Paul Thames - Superyacht Technology Solutions", 
    description: "Explore our comprehensive directory of superyacht technology vendors and marine electronics suppliers.",
  },
  alternates: {
    canonical: "/vendors"
  }
};

interface VendorsPageProps {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    partner?: string;
    view?: "partners" | "all";
  }>;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  console.log('🏗️  Rendering Vendors page (static generation) with searchParams:', resolvedSearchParams);
  
  // Fetch all data at build time for static generation
  const [vendors, products, categories] = await Promise.all([
    payloadCMSDataService.getAllVendors(),
    payloadCMSDataService.getAllProducts(),
    payloadCMSDataService.getCategories()
  ]);

  const categoryNames = categories.map(cat => cat.name);

  // Minimize RSC serialization by extracting only required fields
  const serializedVendors = vendors.map(serializeVendorForClient);
  const serializedProducts = products.map(serializeProductForClient);

  console.log(`📋 Static generation: Loaded ${vendors.length} vendors, ${products.length} products, ${categories.length} categories`);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Static Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Technology Vendors
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Discover our comprehensive directory of superyacht technology vendors and marine electronics suppliers
          </p>
        </div>

        {/* Client component with minimized serialized data */}
        <Suspense fallback={<div className="space-y-8 animate-pulse">
          <div className="h-6 bg-muted/20 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-96 bg-muted/20 rounded-lg" />
            ))}
          </div>
        </div>}>
          <VendorsClient
            initialVendors={serializedVendors as Vendor[]}
            initialCategories={categoryNames}
            initialProducts={serializedProducts as Product[]}
            pageTitle="vendors"
          />
        </Suspense>
      </div>
    </div>
  );
}