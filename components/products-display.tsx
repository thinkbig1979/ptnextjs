"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Building2, ArrowRight, Star, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Product, Partner } from "@/lib/data";

const ITEMS_PER_PAGE = 12;

interface ProductsDisplayProps {
  products: Product[];
  partners: Partner[];
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function ProductsDisplay({ products, partners, categories }: ProductsDisplayProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category names for the filter
  const categoryNames = React.useMemo(() => 
    categories.map(cat => cat.name), [categories]
  );
  
  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedPartner, setSelectedPartner] = React.useState(searchParams.get('partner') || '');

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Update state when URL parameters change
  React.useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedPartner(searchParams.get('partner') || '');
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

  // Client-side filtering
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product?.name?.toLowerCase().includes(query) ||
        product?.description?.toLowerCase().includes(query) ||
        product?.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
        product?.category?.toLowerCase().includes(query) ||
        product?.partnerName?.toLowerCase().includes(query)
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
  }, [products, searchQuery, selectedCategory, selectedPartner]);

  // Paginate results
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Function to update URL parameters
  const updateUrlParams = React.useCallback((params: { search?: string; category?: string; partner?: string }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 mb-8"
        ref={ref}
      >
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products, partners, or categories..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-12 text-base border-2 border-border/50 focus:border-primary bg-background/50 backdrop-blur-sm font-poppins-light"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => handleCategoryChange("all")}
            className="font-poppins-medium transition-all duration-300 hover:scale-105"
          >
            All Categories
          </Button>
          {categoryNames.map((categoryName) => (
            <Button
              key={categoryName}
              variant={selectedCategory === categoryName ? "default" : "outline"}
              onClick={() => handleCategoryChange(categoryName)}
              className="font-poppins-medium transition-all duration-300 hover:scale-105"
            >
              {categoryName}
            </Button>
          ))}
        </div>

        {/* Results Summary */}
        <div className="text-center text-muted-foreground font-poppins-light">
          Showing {filteredProducts.length} of {products.length} products
          {searchQuery && (
            <span className="block mt-1 text-sm">
              Search results for "<span className="text-foreground font-poppins-medium">{searchQuery}</span>"
            </span>
          )}
        </div>
      </motion.div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {filteredProducts.length > 0 ? (
          <motion.div
            key="products-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {paginatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: inView ? 1 : 0, 
                  y: inView ? 0 : 20 
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 
                }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-poppins-semibold line-clamp-2 text-foreground">
                        {product.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-poppins-light mt-1">
                        by{' '}
                        <button
                          onClick={() => navigateToPartner(product.partnerName)}
                          className="text-primary hover:text-primary/80 transition-colors font-poppins-medium underline underline-offset-2"
                        >
                          {product.partnerName}
                        </button>
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 font-poppins-light">
                      {product.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {product.tags?.slice(0, 3).map((tag: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="text-xs font-poppins-light bg-secondary/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {product.tags?.length > 3 && (
                        <Badge variant="outline" className="text-xs font-poppins-light">
                          +{product.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-poppins-light">Category</span>
                        <Badge 
                          variant="outline"
                          className="font-poppins-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleCategoryClick(product.category)}
                        >
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-poppins-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground font-poppins-light mb-4">
              {searchQuery 
                ? `No products match your search for "${searchQuery}"`
                : "No products match your current filters"
              }
            </p>
            {(searchQuery || selectedCategory !== "all" || selectedPartner) && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedPartner("");
                  updateUrlParams({ search: "", category: "all", partner: "" });
                }}
                variant="outline"
                className="font-poppins-medium"
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mt-12"
        >
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="font-poppins-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 font-poppins-medium"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="font-poppins-medium"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}