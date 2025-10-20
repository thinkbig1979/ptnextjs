import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar, ExternalLink, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";
import { Product } from "@/lib/types";
import { formatVendorLocation } from "@/lib/utils/location";

interface PartnersServerProps {
  searchParams?: {
    category?: string;
    search?: string;
    partner?: string;
  };
}

export async function PartnersServer({ searchParams }: PartnersServerProps) {
  console.log('🏗️  Loading partners data for server-side rendering...');
  
  // Get all data at build time
  const [allPartners, allProducts, categories] = await Promise.all([
    tinaCMSDataService.getAllPartners(),
    tinaCMSDataService.getAllProducts(),
    tinaCMSDataService.getCategories()
  ]);

  console.log(`📋 Loaded ${allPartners.length} partners, ${allProducts.length} products, ${categories.length} categories`);

  // Apply server-side filtering based on searchParams
  let filteredPartners = allPartners;
  
  if (searchParams?.category && searchParams.category !== 'all') {
    filteredPartners = filteredPartners.filter(partner => 
      partner.category === searchParams.category
    );
  }

  if (searchParams?.search) {
    const query = searchParams.search.toLowerCase();
    filteredPartners = filteredPartners.filter(partner => 
      partner.name.toLowerCase().includes(query) ||
      partner.description.toLowerCase().includes(query) ||
      (partner.tags && partner.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  // Highlight specific partner if requested
  if (searchParams?.partner) {
    const priorityPartner = filteredPartners.find(p => p.name === searchParams.partner);
    if (priorityPartner) {
      filteredPartners = [priorityPartner, ...filteredPartners.filter(p => p.name !== searchParams.partner)];
    }
  }

  // Create a map of partner products for quick lookup
  const partnerProductsMap = new Map<string, Product[]>();
  allProducts.forEach(product => {
    if (product.partnerId && !partnerProductsMap.has(product.partnerId)) {
      partnerProductsMap.set(product.partnerId, []);
    }
    if (product.partnerId) {
      partnerProductsMap.get(product.partnerId)?.push(product);
    }
  });

  return (
    <div className="space-y-8">
      {/* Results Summary */}
      <div className="text-muted-foreground font-poppins-light">
        Showing {filteredPartners.length} of {allPartners.length} partners
        {searchParams?.category && searchParams.category !== 'all' && ` in ${searchParams.category}`}
        {searchParams?.search && ` matching "${searchParams.search}"`}
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPartners.map((partner) => {
          const partnerProducts = partnerProductsMap.get(partner.id) || [];
          const isHighlighted = searchParams?.partner === partner.name;
          
          return (
            <Card 
              key={partner.id} 
              className={`h-full hover-lift cursor-pointer group ${isHighlighted ? 'ring-2 ring-accent shadow-lg' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-accent" />
                    </div>
                    {partner.featured && (
                      <Badge variant="default" className="bg-accent">Featured</Badge>
                    )}
                    {isHighlighted && (
                      <Badge variant="default" className="bg-green-500">Highlighted</Badge>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {partner.category}
                  </Badge>
                </div>
                <CardTitle className="group-hover:text-accent transition-colors">
                  <Link href={`/partners/${partner.slug}`} className="hover:underline">
                    {partner.name}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {partner.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {partner.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Est. {partner.founded}</span>
                    </div>
                    {formatVendorLocation(partner.location) && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{formatVendorLocation(partner.location)}</span>
                      </div>
                    )}
                  </div>

                  {/* Products Count */}
                  {partnerProducts.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Package className="w-3 h-3" />
                      <span>{partnerProducts.length} product{partnerProducts.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {partnerProducts.length > 0 && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full group bg-accent hover:bg-accent/90"
                        asChild
                      >
                        <Link href={`/products?partner=${encodeURIComponent(partner.name)}`}>
                          See Products & Services ({partnerProducts.length})
                          <Package className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    )}
                    
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm" 
                      className="w-full group"
                    >
                      <Link href={`/partners/${partner.slug}`}>
                        Learn More
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    
                    {partner.website && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group"
                        asChild
                      >
                        <Link href={partner.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                          <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredPartners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-poppins-light text-lg">
            No partners found matching your criteria. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}