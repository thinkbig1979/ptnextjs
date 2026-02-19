import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package } from 'lucide-react';
import type { Product } from '@/lib/types';

interface FeaturedProductsSectionProps {
  featuredProducts: Product[];
}

export function FeaturedProductsSection({
  featuredProducts,
}: FeaturedProductsSectionProps): React.JSX.Element | null {
  // Don't render if no featured products
  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="py-20 bg-secondary/30"
      data-testid="featured-products"
      aria-label="Featured products"
    >
      <div className="container max-w-screen-xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-cormorant font-bold mb-4">Featured Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Cutting-edge solutions from our technology partners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="block h-full">
              <Card className="h-full hover-lift cursor-pointer group overflow-hidden">
                {/* Product Image */}
                {product.image && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={65}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    {product.category && <Badge variant="secondary">{product.category}</Badge>}
                  </div>
                  <CardTitle className="group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description?.replace(/<[^>]*>/g, '').slice(0, 150)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.vendorName && (
                    <p className="text-sm text-muted-foreground mb-4">By {product.vendorName}</p>
                  )}
                  <div className="flex items-center text-accent text-sm font-medium group-hover:text-accent/80 transition-colors">
                    <span>View {product.name}</span>
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="accent" className="group">
            <Link href="/products">
              Browse All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
