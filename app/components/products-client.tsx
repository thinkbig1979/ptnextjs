
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/search-filter";
import { Pagination } from "@/components/pagination";
import { Package, Building2, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { parseFilterParams } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
const ITEMS_PER_PAGE = 12;

interface ProductsClientProps {
  initialProducts: any[];
  initialCategories: string[];
}

export function ProductsClient({ initialProducts, initialCategories }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const urlParams = parseFilterParams(searchParams || new URLSearchParams());
  const [searchQuery, setSearchQuery] = React.useState(urlParams.search);
  const [selectedCategory, setSelectedCategory] = React.useState(urlParams.category);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedPartner, setSelectedPartner] = React.useState(urlParams.partner);
  

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  // Update state when URL parameters change
  React.useEffect(() => {
    const params = parseFilterParams(searchParams || new URLSearchParams());
    setSearchQuery(params.search);
    setSelectedCategory(params.category);
    setSelectedPartner(params.partner);
  }, [searchParams]);

  // Navigation functions
  const navigateToPartner = React.useCallback((partnerName: string) => {
    const url = `/partners?partner=${encodeURIComponent(partnerName)}`;
    router.push(url);
  }, [router]);

  const handleCategoryClick = React.useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  // Filter products based on search, category, and partner
  const filteredProducts = React.useMemo(() => {
    let filtered = initialProducts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product?.name?.toLowerCase().includes(query) ||
        product?.description?.toLowerCase().includes(query) ||
        product?.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
        product?.features?.some((feature: string) => feature.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product?.category === selectedCategory);
    }

    // Apply partner filter
    if (selectedPartner) {
      filtered = filtered.filter(product => product?.partnerName === selectedPartner);
    }

    return filtered;
  }, [initialProducts, searchQuery, selectedCategory, selectedPartner]);

  // Paginate results
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
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
          placeholder="Search products and services..."
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
          Showing {paginatedProducts.length} of {filteredProducts.length} products
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {selectedPartner && ` from ${selectedPartner}`}
        </p>
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {paginatedProducts.map((product, index) => (
          <motion.div
            key={product?.id}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Card 
              className="h-full hover-lift cursor-pointer group overflow-hidden"
              onClick={() => {
                const url = product?.slug ? `/products/${product.slug}` : `/products/${product.id}`;
                router.push(url);
              }}
            >
              {/* Product Image */}
              <OptimizedImage
                src={product?.mainImage?.url || product?.image}
                alt={product?.mainImage?.altText || product?.name || 'Product image'}
                fallbackType="product"
                aspectRatio="video"
                fill
                className="group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(product?.category || '');
                      }}
                    >
                      {product?.category}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="group-hover:text-accent transition-colors line-clamp-2">
                  {product?.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {product?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  {product?.features && product.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-poppins-medium text-sm text-foreground">Key Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {product.features.slice(0, 3).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <Star className="w-3 h-3 text-accent" />
                            <span className="font-poppins-light">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {product?.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Partner Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3 h-3" />
                      <span className="font-poppins-light">{product?.partnerName}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full group bg-accent hover:bg-accent/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToPartner(product?.partnerName || '');
                      }}
                    >
                      Go to Partner
                      <Building2 className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm" 
                      className="w-full group"
                    >
                      <Link href={`/products/${product?.slug || product?.id}`}>
                        Learn More
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground font-poppins-light text-lg">
            No products found matching your criteria. Try adjusting your search or filters.
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
