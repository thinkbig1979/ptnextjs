import * as React from "react";
import { Suspense } from "react";
import { VendorsClient } from "@/app/(site)/components/vendors-client";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";
import { Metadata } from "next";
import type { Vendor, Product, SerializedVendor, SerializedVendorLocation, SerializedProductMinimal } from "@/lib/types";
import Breadcrumbs from '@/components/Breadcrumbs';

/**
 * Extract only required fields for VendorsClient to minimize RSC serialization
 * This reduces the page weight by not sending unused vendor fields to the client
 */
function serializeVendorForClient(vendor: Vendor): SerializedVendor {
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
    locations: vendor.locations?.map((loc): SerializedVendorLocation => ({
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
function serializeProductForClient(product: Product): SerializedProductMinimal {
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
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Vendors', href: '/vendors' },
        ]} />

        {/* Static Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Technology Vendors
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            A curated directory of superyacht technology vendors, marine electronics suppliers,
            and specialist service providers. Search by category, location, or capability.
          </p>
        </div>

        {/* About the Directory */}
        <div className="mb-12 max-w-3xl mx-auto space-y-4 text-muted-foreground font-poppins-light leading-relaxed">
          <h2 className="text-2xl font-cormorant font-bold text-accent">About the Directory</h2>
          <p>
            The vendor directory connects project teams with qualified suppliers across the
            superyacht industry. Each profile includes company information, product listings,
            service areas, and direct contact details.
          </p>
          <p>
            Vendors range from established integrators and equipment manufacturers to specialist
            providers in areas like AV/IT, lighting, security, navigation, and communications.
            Profiles are maintained by the vendors themselves, keeping information current and accurate.
          </p>
          <p>
            <span className="font-poppins-medium text-foreground">Looking to list your company?</span>{' '}
            Vendor registration is open to manufacturers, distributors, integrators, and technology
            providers serving the superyacht market.{' '}
            <a href="/contact" className="text-accent hover:text-accent/80 transition-colors underline">
              Contact us
            </a>{' '}
            to discuss listing options.
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
            initialVendors={serializedVendors}
            initialCategories={categoryNames}
            initialProducts={serializedProducts}
            pageTitle="vendors"
          />
        </Suspense>
      </div>
    </div>
  );
}