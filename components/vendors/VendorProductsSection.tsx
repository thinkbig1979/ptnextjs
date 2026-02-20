'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ArrowRight, Star, Package } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';

interface VendorProductsSectionProps {
  vendorName: string;
  vendorTier?: string;
  products: Product[];
}

/**
 * VendorProductsSection Component
 *
 * Displays vendor products grid
 * Available only for Tier 2+ vendors
 *
 * Features:
 * - Product cards with images
 * - Category badges
 * - Feature highlights
 * - "View All Products" link
 * - Responsive grid layout
 */
export function VendorProductsSection({
  vendorName,
  vendorTier,
  products,
}: VendorProductsSectionProps) {
  // Only show for Tier 2+
  if (!vendorTier || (vendorTier !== 'tier2' && vendorTier !== 'tier3')) {
    return null;
  }

  const hasProducts = products && products.length > 0;

  // If no products, don't render the section
  if (!hasProducts) {
    return null;
  }

  // Show up to 4 products on profile page
  const displayProducts = products.slice(0, 4);

  return (
    <div className="space-y-6" data-testid="vendor-products">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-cormorant font-bold">Featured Products</h2>
        {products.length > 4 && (
          <Button asChild variant="outline">
            <Link href={`/products?partner=${encodeURIComponent(vendorName)}`}>
              View All Products
              <Package className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayProducts.map((product) => (
          <Card
            key={product.id}
            className="hover-lift group overflow-hidden flex flex-col"
          >
            {/* Product Image */}
            <Link
              href={`/products/${product.slug || product.id}`}
              className="aspect-video relative overflow-hidden block"
            >
              <OptimizedImage
                src={product.mainImage?.url || product.image}
                alt={product.mainImage?.altText || product.name}
                fallbackType="product"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </Link>

            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              <Link href={`/products/${product.slug || product.id}`}>
                <CardTitle className="text-lg group-hover:text-accent transition-colors line-clamp-2 hover:text-accent cursor-pointer">
                  {product.name}
                </CardTitle>
              </Link>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
              {product.features && product.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    <span>{product.features[0].title}</span>
                  </div>
                </div>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full group mt-auto"
              >
                <Link href={`/products/${product.slug || product.id}`}>
                  Learn More
                  <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

