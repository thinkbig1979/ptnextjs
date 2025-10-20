"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SearchFilter } from "@/components/search-filter";
import { Pagination } from "@/components/pagination";
import { parseFilterParams } from "@/lib/utils";
import { VendorCard } from "./vendor-card";
import { Vendor, Product, VendorCoordinates } from "@/lib/types";
import { LocationSearchFilter } from "@/components/LocationSearchFilter";
import { useLocationFilter, VendorWithDistance } from "@/hooks/useLocationFilter";

const ITEMS_PER_PAGE = 12;

interface VendorsClientProps {
  initialVendors: Vendor[];
  initialCategories: string[];
  initialProducts?: Product[];
  showPartnersOnly?: boolean; // Filter to show only partners (partner: true)
  showNonPartnersOnly?: boolean; // Filter to show only non-partners (partner: false or undefined)
  baseUrl?: string; // "/partners" or "/vendors"
  pageTitle?: string; // For dynamic page title in results
}

export function VendorsClient({ 
  initialVendors, 
  initialCategories, 
  initialProducts = [],
  showPartnersOnly = false,
  showNonPartnersOnly = false,
  baseUrl = "/vendors",
  pageTitle = "vendors"
}: VendorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const urlParams = parseFilterParams(searchParams || new URLSearchParams());
  const [searchQuery, setSearchQuery] = React.useState(urlParams.search);
  const [selectedCategory, setSelectedCategory] = React.useState(urlParams.category);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [highlightedVendor, setHighlightedVendor] = React.useState(urlParams.partner);

  // Location filter state
  const [userLocation, setUserLocation] = React.useState<VendorCoordinates | null>(null);
  const [maxDistance, setMaxDistance] = React.useState(100);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Update state when URL parameters change
  React.useEffect(() => {
    const params = parseFilterParams(searchParams || new URLSearchParams());
    setSearchQuery(params.search);
    setSelectedCategory(params.category);
    setHighlightedVendor(params.partner);
  }, [searchParams]);

  // Navigation functions
  const navigateToProducts = React.useCallback((vendor: Vendor) => {
    let url = `/products?partner=${encodeURIComponent(vendor.name)}`;
    
    // If vendor is not a partner, add view=all to show all vendors' products by default
    if (!vendor.partner) {
      url += '&view=all';
    }
    
    router.push(url);
  }, [router]);

  const handleCategoryClick = React.useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  // Apply location filter first (this adds distance data and filters by proximity)
  const {
    filteredVendors: locationFilteredVendors,
    vendorsWithCoordinates,
    isFiltering: isLocationFiltering
  } = useLocationFilter(initialVendors, userLocation, maxDistance);

  // Use location-filtered vendors if location search is active, otherwise use all vendors
  const baseVendorsForFiltering = isLocationFiltering ? locationFilteredVendors : initialVendors;

  // Filter vendors based on search, category, and partner status
  const filteredVendors = React.useMemo(() => {
    let filtered: VendorWithDistance[] = baseVendorsForFiltering;

    // Apply partner filter if showPartnersOnly is true
    if (showPartnersOnly) {
      filtered = filtered.filter(vendor => vendor.partner === true);
    }

    // Apply non-partner filter if showNonPartnersOnly is true
    if (showNonPartnersOnly) {
      filtered = filtered.filter(vendor => vendor.partner !== true);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor?.name?.toLowerCase().includes(query) ||
        vendor?.description?.toLowerCase().includes(query) ||
        vendor?.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(vendor => vendor?.category === selectedCategory);
    }

    // If a specific vendor is highlighted, prioritize it
    if (highlightedVendor) {
      const priorityVendor = filtered.find(v => v?.name === highlightedVendor);
      if (priorityVendor) {
        filtered = [priorityVendor, ...filtered.filter(v => v?.name !== highlightedVendor)];
      }
    }

    return filtered;
  }, [baseVendorsForFiltering, searchQuery, selectedCategory, highlightedVendor, showPartnersOnly, showNonPartnersOnly]);

  // Paginate results
  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
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

  // Location search handlers
  const handleLocationSearch = React.useCallback((location: VendorCoordinates, distance: number) => {
    setUserLocation(location);
    setMaxDistance(distance);
    setCurrentPage(1);
  }, []);

  const handleLocationReset = React.useCallback(() => {
    setUserLocation(null);
    setMaxDistance(100);
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  return (
    <>
      {/* Location Search Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <LocationSearchFilter
          onSearch={handleLocationSearch}
          onReset={handleLocationReset}
          resultCount={filteredVendors.length}
          totalCount={initialVendors.length}
        />
        {isLocationFiltering && vendorsWithCoordinates > 0 && (
          <div className="mt-4 text-sm text-muted-foreground font-poppins-light">
            Showing vendors within {maxDistance} km • {vendorsWithCoordinates} vendors have location data
          </div>
        )}
      </motion.div>

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
          placeholder={`Search ${pageTitle} by name, description, or technology...`}
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
          Showing {paginatedVendors.length} of {filteredVendors.length} {pageTitle}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </p>
      </motion.div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {paginatedVendors.map((vendor, index) => {
          // Find products for this vendor from the provided products data
          const vendorProducts = initialProducts.filter(product => 
            product?.partnerId === vendor?.id || product?.vendorId === vendor?.id
          );
          const isHighlighted = highlightedVendor === vendor?.name;
          
          return (
            <VendorCard
              key={vendor?.id}
              vendor={vendor}
              vendorProducts={vendorProducts}
              isHighlighted={isHighlighted}
              animationIndex={index}
              inView={inView}
              onCategoryClick={handleCategoryClick}
              onNavigateToProducts={navigateToProducts}
              baseUrl={baseUrl}
            />
          );
        })}
      </div>

      {/* No Results */}
      {filteredVendors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground font-poppins-light text-lg">
            No {pageTitle} found matching your criteria. Try adjusting your search or filters.
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