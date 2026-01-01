import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Building2, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";
import { Vendor } from "@/lib/types";

interface ProductsServerProps {
  searchParams?: {
    category?: string;
    search?: string;
    partner?: string;
  };
}

export async function ProductsServer({ searchParams }: ProductsServerProps) {
  console.log('🏗️  Loading products data for server-side rendering...');

  // Skip database calls during Docker builds
  if (process.env.SKIP_BUILD_DB === 'true') {
    console.log('📋 Skipping products server data (SKIP_BUILD_DB=true)');
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-poppins-light text-lg">
          Loading products...
        </p>
      </div>
    );
  }

  // Get all data at runtime
  const [allProducts, allVendors, categories] = await Promise.all([
    payloadCMSDataService.getAllProducts(),
    payloadCMSDataService.getAllVendors(),
    payloadCMSDataService.getCategories()
  ]);

  console.log(`📋 Loaded ${allProducts.length} products, ${allVendors.length} vendors, ${categories.length} categories`);

  // Apply server-side filtering based on searchParams
  let filteredProducts = allProducts;
  
  if (searchParams?.category && searchParams.category !== 'all') {
    filteredProducts = filteredProducts.filter(product => 
      product.category === searchParams.category
    );
  }

  if (searchParams?.partner) {
    filteredProducts = filteredProducts.filter(product => 
      product.partnerName === searchParams.partner
    );
  }

  if (searchParams?.search) {
    const query = searchParams.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (product.features && product.features.some(feature => feature.title.toLowerCase().includes(query)))
    );
  }

  // Create a map of vendors for quick lookup
  const vendorsMap = new Map<string, Vendor>();
  allVendors.forEach(vendor => {
    vendorsMap.set(vendor.id, vendor);
  });

  return (
    <div className="space-y-8">
      {/* Results Summary */}
      <div className="text-muted-foreground font-poppins-light">
        Showing {filteredProducts.length} of {allProducts.length} products
        {searchParams?.category && searchParams.category !== 'all' && ` in ${searchParams.category}`}
        {searchParams?.partner && ` from ${searchParams.partner}`}
        {searchParams?.search && ` matching "${searchParams.search}"`}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => {
          const vendorId = product.vendorId || product.partnerId;
          const vendor = vendorId ? vendorsMap.get(vendorId) : undefined;
          
          return (
            <Card 
              key={product.id} 
              className="h-full hover-lift group overflow-hidden"
            >
              {/* Product Image */}
              <Link href={`/products/${product.slug || product.id}`}>
                <div className="aspect-video relative overflow-hidden cursor-pointer">
                  {product.mainImage?.url || product.image ? (
                    <Image
                      src={product.mainImage?.url || product.image || ''}
                      alt={product.mainImage?.altText || product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <Package className="w-12 h-12 text-accent/60" />
                    </div>
                  )}
                </div>
              </Link>
              
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                <Link href={`/products/${product.slug || product.id}`}>
                  <CardTitle className="group-hover:text-accent transition-colors line-clamp-2 cursor-pointer">
                    {product.name}
                  </CardTitle>
                </Link>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-poppins-medium text-sm text-foreground">Key Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <li key={`feature-${feature.title}-${idx}`} className="flex items-center space-x-2">
                            <Star className="w-3 h-3 text-accent" />
                            <span className="font-poppins-light">{feature.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {product.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Partner Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3 h-3" />
                      <span className="font-poppins-light">{product.partnerName}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {vendor && (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full group bg-accent hover:bg-accent/90"
                        asChild
                      >
                        <Link href={`/vendors/${vendor.slug}`}>
                          Go to Vendor
                          <Building2 className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group"
                      asChild
                    >
                      <Link href={`/products/${product.slug || product.id}`}>
                        Learn More
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-poppins-light text-lg">
            No products found matching your criteria. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}