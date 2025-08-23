

import * as React from "react";
import { Suspense } from "react";
import { ProductsDisplay } from "@/components/products-display";
import dataService from "@/lib/data-service";

export default async function ProductsPage() {
  // Fetch data at build time
  const products = await dataService.getProducts();
  const partners = await dataService.getPartners();
  const categories = await dataService.getCategories();

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

        {/* Server-rendered content with client-side interactivity */}
        <Suspense fallback={<div className="space-y-8 animate-pulse">
          <div className="h-12 bg-muted/20 rounded" />
          <div className="h-6 bg-muted/20 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted/20 rounded-lg" />
            ))}
          </div>
        </div>}>
          <ProductsDisplay products={products} partners={partners} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
