import * as React from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsClient } from "@/app/(site)/components/products-client";
import { ComparisonProvider } from "@/components/ui/product-comparison";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";
import type { Product, Vendor, SerializedProduct, SerializedVendorMinimal } from "@/lib/types";
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getServiceSchema } from '@/lib/seo-config';

/**
 * Extract only required fields for ProductsClient to minimize RSC serialization
 * This reduces the page weight by not sending unused product fields to the client
 */
function serializeProductForClient(product: Product): SerializedProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    image: product.image,
    category: product.category,
    tags: product.tags,
    features: product.features?.map(f => ({ id: f.id, title: f.title })),
    images: product.images?.map(img => ({ url: img.url, isMain: img.isMain, altText: img.altText })),
    vendorId: product.vendorId,
    partnerId: product.partnerId,
    partnerName: product.partnerName,
    vendorName: product.vendorName,
    vendor: product.vendor ? { id: product.vendor.id, partner: product.vendor.partner } : undefined,
    mainImage: product.mainImage ? { url: product.mainImage.url, altText: product.mainImage.altText } : undefined,
    // Fields used for "Comparable" badge display
    comparisonMetrics: product.comparisonMetrics,
    specifications: product.specifications,
    integrationCompatibility: product.integrationCompatibility,
  };
}

/**
 * Extract only required fields for vendor lookup in product filtering
 */
function serializeVendorForProductLookup(vendor: Vendor): SerializedVendorMinimal {
  return {
    id: vendor.id,
    partner: vendor.partner,
  };
}

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';
// ISR: Revalidate every 10s in dev, 5min in production
export const revalidate = 300; // ISR: Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Services & Products | Paul Thames Superyacht Solutions',
  description: 'Discover Paul Thames technical consultancy and creative lighting services for superyachts, including project advisory and custom programming.',
  openGraph: {
    title: 'Services & Products | Superyacht Solutions',
    description: 'Discover Paul Thames technical consultancy and creative lighting services for superyachts, including project advisory and custom programming.',
    url: 'https://paulthames.com/products',
  },
  twitter: {
    title: 'Services & Products | Superyacht Solutions',
    description: 'Discover Paul Thames technical consultancy and creative lighting services for superyachts, including project advisory and custom programming.',
  },
  alternates: {
    canonical: '/products',
  },
};

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

  // Fetch all data at build time for static generation
  const [products, categories, vendors] = await Promise.all([
    payloadCMSDataService.getAllProducts(),
    payloadCMSDataService.getCategories(),
    payloadCMSDataService.getAllVendors()
  ]);

  const categoryNames = categories.map(cat => cat.name);

  // Minimize RSC serialization by extracting only required fields
  const serializedProducts = products.map(serializeProductForClient);
  const serializedVendors = vendors.map(serializeVendorForProductLookup);

  const serviceSchema = getServiceSchema({
    name: 'Superyacht Technology Products & Services',
    description: 'Technical consultancy and creative lighting services for superyachts, including project advisory, custom programming, and a curated directory of marine technology products.',
  });

  return (
    <div className="min-h-screen py-12">
      <JsonLd data={serviceSchema} />
      <div className="container max-w-screen-xl">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
        ]} />

        {/* Static Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Products & Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Browse technology products and services from superyacht industry technology suppliers.
            Filter by category or location, compare specifications, and see what solution fits your needs best.
          </p>
        </div>

        {/* What You'll Find Here */}
        <div className="mb-12 max-w-3xl mx-auto space-y-4 text-muted-foreground font-poppins-light leading-relaxed">
          <h2 className="text-2xl font-cormorant font-bold text-accent">What You'll Find Here</h2>
          <p>
            This directory brings together products and services from manufacturers, integrators,
            and technology providers active in the superyacht sector. Each listing includes
            specifications, vendor information, and other relevant details.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-accent/5 rounded-xl p-5 border border-accent/10">
              <h3 className="font-poppins-medium text-foreground mb-2 text-sm">For specifiers and project teams</h3>
              <p className="text-sm">
                Use category filters and side-by-side comparison to evaluate options during the
                specification or tender phase. Products are listed by vendors with active industry presence.
              </p>
            </div>
            <div className="bg-accent/5 rounded-xl p-5 border border-accent/10">
              <h3 className="font-poppins-medium text-foreground mb-2 text-sm">For vendors</h3>
              <p className="text-sm">
                Products listed here are visible to designers, project managers, and owner's
                representatives browsing for solutions. Listing is available to registered vendors
                with an active directory profile.
              </p>
            </div>
          </div>
        </div>

        {/* Client component with minimized serialized data */}
        <ComparisonProvider>
          <Suspense fallback={<div className="space-y-8 animate-pulse">
            <div className="h-6 bg-muted/20 rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={`skeleton-${i}`} className="h-96 bg-muted/20 rounded-lg" />
              ))}
            </div>
          </div>}>
            <ProductsClient
              initialProducts={serializedProducts}
              initialCategories={categoryNames}
              initialVendors={serializedVendors}
            />
          </Suspense>
        </ComparisonProvider>
      </div>
    </div>
  );
}
