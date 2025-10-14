

import * as React from "react";
import { Suspense } from "react";
import { ProductsClient } from "@/app/components/products-client";
import { ComparisonProvider } from "@/components/ui/product-comparison";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";

// Force static generation for optimal SEO and performance
export const dynamic = 'force-static';
export const revalidate = false;

interface ProductsPageProps {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    partner?: string;
    view?: "partners" | "all";
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  console.log('🏗️  Rendering Products page (static generation) with searchParams:', resolvedSearchParams);
  
  // Fetch all data at build time for static generation
  const [products, categories, vendors] = await Promise.all([
    tinaCMSDataService.getAllProducts(),
    tinaCMSDataService.getCategories(),
    tinaCMSDataService.getAllVendors()
  ]);
  
  const categoryNames = categories.map(cat => cat.name);
  
  console.log(`📋 Static generation: Loaded ${products.length} products, ${categories.length} categories, ${vendors.length} vendors`);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Static Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Products & Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Explore cutting-edge superyacht technology solutions from our trusted partners across all categories
          </p>
        </div>

        {/* Client component with all data passed as props */}
        <ComparisonProvider>
          <Suspense fallback={<div className="space-y-8 animate-pulse">
            <div className="h-6 bg-muted/20 rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-muted/20 rounded-lg" />
              ))}
            </div>
          </div>}>
            <ProductsClient
              initialProducts={products}
              initialCategories={categoryNames}
              initialVendors={vendors}
            />
          </Suspense>
        </ComparisonProvider>
      </div>
    </div>
  );
}
