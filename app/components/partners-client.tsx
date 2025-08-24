
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/search-filter";
import { Pagination } from "@/components/pagination";
import { Building2, MapPin, Calendar, ExternalLink, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { parseFilterParams } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

const ITEMS_PER_PAGE = 12;

interface PartnersClientProps {
  initialPartners: any[];
  initialCategories: string[];
  initialProducts?: any[];
}

export function PartnersClient({ initialPartners, initialCategories, initialProducts = [] }: PartnersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const urlParams = parseFilterParams(searchParams || new URLSearchParams());
  const [searchQuery, setSearchQuery] = React.useState(urlParams.search);
  const [selectedCategory, setSelectedCategory] = React.useState(urlParams.category);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [highlightedPartner, setHighlightedPartner] = React.useState(urlParams.partner);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Update state when URL parameters change
  React.useEffect(() => {
    const params = parseFilterParams(searchParams || new URLSearchParams());
    setSearchQuery(params.search);
    setSelectedCategory(params.category);
    setHighlightedPartner(params.partner);
  }, [searchParams]);

  // Navigation functions
  const navigateToProducts = React.useCallback((partnerName: string) => {
    const url = `/products?partner=${encodeURIComponent(partnerName)}`;
    router.push(url);
  }, [router]);

  const handleCategoryClick = React.useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  // Filter partners based on search and category
  const filteredPartners = React.useMemo(() => {
    let filtered = initialPartners;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(partner => 
        partner?.name?.toLowerCase().includes(query) ||
        partner?.description?.toLowerCase().includes(query) ||
        partner?.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(partner => partner?.category === selectedCategory);
    }

    // If a specific partner is highlighted, prioritize it
    if (highlightedPartner) {
      const priorityPartner = filtered.find(p => p?.name === highlightedPartner);
      if (priorityPartner) {
        filtered = [priorityPartner, ...filtered.filter(p => p?.name !== highlightedPartner)];
      }
    }

    return filtered;
  }, [initialPartners, searchQuery, selectedCategory, highlightedPartner]);

  // Paginate results
  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Function to update URL parameters
  const updateUrlParams = React.useCallback((params: { search?: string; category?: string; partner?: string }) => {
    const current = new URLSearchParams(Array.from((searchParams || new URLSearchParams()).entries()));
    
    // Update or remove search parameter
    if (params.search !== undefined) {
      if (params.search) {
        current.set('search', params.search);
      } else {
        current.delete('search');
      }
    }
    
    // Update or remove category parameter
    if (params.category !== undefined) {
      if (params.category && params.category !== 'all') {
        current.set('category', params.category);
      } else {
        current.delete('category');
      }
    }
    
    // Update or remove partner parameter
    if (params.partner !== undefined) {
      if (params.partner) {
        current.set('partner', params.partner);
      } else {
        current.delete('partner');
      }
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    router.push(`${window.location.pathname}${query}`, { scroll: false });
  }, [router, searchParams]);

  // Enhanced handlers that also update URL
  const handleSearchChange = React.useCallback((query: string) => {
    setSearchQuery(query);
    updateUrlParams({ search: query });
  }, [updateUrlParams]);

  const handleCategoryChange = React.useCallback((category: string) => {
    setSelectedCategory(category);
    updateUrlParams({ category });
  }, [updateUrlParams]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  return (
    <>
      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          categories={initialCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          placeholder="Search partners by name, description, or technology..."
        />
      </motion.div>

      {/* Results Summary */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mb-8"
      >
        <p className="text-muted-foreground font-poppins-light">
          Showing {paginatedPartners.length} of {filteredPartners.length} partners
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </p>
      </motion.div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {paginatedPartners.map((partner, index) => {
          // Find products for this partner from the provided products data
          const partnerProducts = initialProducts.filter(product => product?.partnerId === partner?.id);
          const isHighlighted = highlightedPartner === partner?.name;
          
          return (
            <motion.div
              key={partner?.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className={`h-full hover-lift cursor-pointer group ${isHighlighted ? 'ring-2 ring-accent shadow-lg' : ''}`}>
                {/* Partner Image */}
                <OptimizedImage
                  src={partner?.image}
                  alt={`${partner?.name} company overview` || 'Partner company overview'}
                  fallbackType="partner"
                  aspectRatio="video"
                  fill
                  className="group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-accent" />
                      </div>
                      {partner?.featured && (
                        <Badge variant="default" className="bg-accent">Featured</Badge>
                      )}
                      {isHighlighted && (
                        <Badge variant="default" className="bg-green-500">Highlighted</Badge>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(partner?.category || '');
                      }}
                    >
                      {partner?.category}
                    </Badge>
                  </div>
                  <CardTitle 
                    className="group-hover:text-accent transition-colors hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/partners/${partner?.slug}`);
                    }}
                  >
                    {partner?.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {partner?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {partner?.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Est. {partner?.founded}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{partner?.location}</span>
                      </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToProducts(partner?.name || '');
                          }}
                        >
                          See Products & Services ({partnerProducts.length})
                          <Package className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                      
                      <Button 
                        asChild
                        variant="outline" 
                        size="sm" 
                        className="w-full group"
                      >
                        <Link href={`/partners/${partner?.slug}`}>
                          Learn More
                          <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                      
                      {partner?.website && (
                        <Button variant="outline" size="sm" className="w-full group">
                          Visit Website
                          <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredPartners.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground font-poppins-light text-lg">
            No partners found matching your criteria. Try adjusting your search or filters.
          </p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      )}
    </>
  );
}
