

import * as React from "react";
import { Suspense } from "react";
import { PartnersClient } from "@/app/components/partners-client";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";

// Force static generation for optimal SEO and performance
export const dynamic = 'force-static';
export const revalidate = false;

interface PartnersPageProps {
  searchParams?: {
    category?: string;
    search?: string;
    partner?: string;
  };
}

export default async function PartnersPage({ searchParams }: PartnersPageProps) {
  console.log('🏗️  Rendering Partners page (static generation) with searchParams:', searchParams);
  
  // Fetch all data at build time for static generation
  const [partners, products, categories] = await Promise.all([
    tinaCMSDataService.getAllPartners(),
    tinaCMSDataService.getAllProducts(),
    tinaCMSDataService.getCategories()
  ]);
  
  const categoryNames = categories.map(cat => cat.name);
  
  console.log(`📋 Static generation: Loaded ${partners.length} partners, ${products.length} products, ${categories.length} categories`);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Static Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Technology Partners
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Discover our extensive network of leading superyacht technology providers and marine electronics specialists
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
          <PartnersClient 
            initialPartners={partners}
            initialCategories={categoryNames}
            initialProducts={products}
          />
        </Suspense>
      </div>
    </div>
  );
}
