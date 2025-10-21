import * as React from "react";
import { Suspense } from "react";
import { VendorsClient } from "@/app/(site)/components/vendors-client";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";
import { Metadata } from "next";

// Force static generation for optimal SEO and performance
export const dynamic = 'force-static';
export const revalidate = false;

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

        {/* Client component with all data passed as props */}
        <Suspense fallback={<div className="space-y-8 animate-pulse">
          <div className="h-6 bg-muted/20 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted/20 rounded-lg" />
            ))}
          </div>
        </div>}>
          <VendorsClient
            initialVendors={vendors}
            initialCategories={categoryNames}
            initialProducts={products}
            baseUrl="/vendors"
            pageTitle="vendors"
          />
        </Suspense>
      </div>
    </div>
  );
}