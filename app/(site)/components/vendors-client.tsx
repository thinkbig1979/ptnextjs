"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Pagination } from "@/components/pagination";
import { VendorToggle } from "@/components/ui/vendor-toggle";
import { parseFilterParams } from "@/lib/utils";
import { VendorCard } from "@/components/vendors/VendorCard";
import { Vendor, Product, VendorCoordinates } from "@/lib/types";
import { VendorSearchBar } from "@/components/VendorSearchBar";
import {
  useLocationFilter,
  VendorWithDistance,
} from "@/hooks/useLocationFilter";

const ITEMS_PER_PAGE = 12;

interface VendorsClientProps {
  initialVendors: Vendor[];
  initialCategories: string[];
  initialProducts?: Product[];
  showPartnersOnly?: boolean; // Filter to show only partners (partner: true)
  showNonPartnersOnly?: boolean; // Filter to show only non-partners (partner: false or undefined)
  pageTitle?: string; // For dynamic page title in results
}

export function VendorsClient({
  initialVendors,
  initialCategories,
  initialProducts = [],
  showPartnersOnly = false,
  showNonPartnersOnly = false,
  pageTitle = "vendors",
}: VendorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const urlParams = parseFilterParams(searchParams || new URLSearchParams());
  const [searchQuery, setSearchQuery] = React.useState(urlParams.search);
  const [selectedCategory, setSelectedCategory] = React.useState(
    urlParams.category,
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [highlightedVendor, setHighlightedVendor] = React.useState(
    urlParams.partner,
  );
  const [vendorView, setVendorView] = React.useState<"partners" | "all">(
    searchParams?.get("view") === "partners" ? "partners" : "all",
  );

  // Location filter state
  const [userLocation, setUserLocation] =
    React.useState<VendorCoordinates | null>(null);
  const [maxDistance, setMaxDistance] = React.useState(100);

  // Content is always visible immediately (removed broken useInView hook)

  // Update state when URL parameters change
  React.useEffect(() => {
    const params = parseFilterParams(searchParams || new URLSearchParams());
    setSearchQuery(params.search);
    setSelectedCategory(params.category);
    setHighlightedVendor(params.partner);
    setVendorView(
      searchParams?.get("view") === "partners" ? "partners" : "all",
    );
  }, [searchParams]);


  // Apply location filter first (this adds distance data and filters by proximity)
  const {
    filteredVendors: locationFilteredVendors,
    isFiltering: isLocationFiltering,
  } = useLocationFilter(initialVendors, userLocation, maxDistance);

  // Use location-filtered vendors if location search is active, otherwise use all vendors
  const baseVendorsForFiltering = isLocationFiltering
    ? locationFilteredVendors
    : initialVendors;

  // Filter vendors based on search, category, and partner status
  const filteredVendors = React.useMemo(() => {
    let filtered: VendorWithDistance[] = baseVendorsForFiltering;

    // Apply partner filter based on vendorView toggle
    if (vendorView === "partners") {
      filtered = filtered.filter((vendor) => vendor.partner === true);
    }
    // For "all" view, no partner filtering needed - show all vendors

    // Apply partner filter if showPartnersOnly is true (legacy support)
    if (showPartnersOnly) {
      filtered = filtered.filter((vendor) => vendor.partner === true);
    }

    // Apply non-partner filter if showNonPartnersOnly is true (legacy support)
    if (showNonPartnersOnly) {
      filtered = filtered.filter((vendor) => vendor.partner !== true);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vendor) =>
          vendor?.name?.toLowerCase().includes(query) ||
          vendor?.description?.toLowerCase().includes(query) ||
          vendor?.tags?.some((tag: string) =>
            tag.toLowerCase().includes(query),
          ),
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (vendor) => vendor?.category === selectedCategory,
      );
    }

    // Sort vendors: Featured vendors first, then non-featured
    // Within each group, maintain the existing order (including location distance if applicable)
    filtered = filtered.sort((a, b) => {
      // First priority: highlighted vendor (from URL parameter)
      if (highlightedVendor) {
        if (a?.name === highlightedVendor) return -1;
        if (b?.name === highlightedVendor) return 1;
      }

      // Second priority: featured status
      const aFeatured = a?.featured === true ? 1 : 0;
      const bFeatured = b?.featured === true ? 1 : 0;

      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured; // Featured vendors come first
      }

      // Third priority: maintain existing order (location distance, etc.)
      return 0;
    });

    return filtered;
  }, [
    baseVendorsForFiltering,
    searchQuery,
    selectedCategory,
    highlightedVendor,
    showPartnersOnly,
    showNonPartnersOnly,
    vendorView,
  ]);

  // Paginate results
  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Function to update URL parameters
  const updateUrlParams = React.useCallback(
    (params: {
      search?: string;
      category?: string;
      partner?: string;
      view?: "partners" | "all";
    }) => {
      const current = new URLSearchParams(
        Array.from((searchParams || new URLSearchParams()).entries()),
      );

      // Update or remove search parameter
      if (params.search !== undefined) {
        if (params.search) {
          current.set("search", params.search);
        } else {
          current.delete("search");
        }
      }

      // Update or remove category parameter
      if (params.category !== undefined) {
        if (params.category && params.category !== "all") {
          current.set("category", params.category);
        } else {
          current.delete("category");
        }
      }

      // Update or remove partner parameter
      if (params.partner !== undefined) {
        if (params.partner) {
          current.set("partner", params.partner);
        } else {
          current.delete("partner");
        }
      }

      // Update or remove view parameter
      if (params.view !== undefined) {
        if (params.view === "partners") {
          current.set("view", "partners");
        } else {
          current.delete("view"); // Default is all, no URL param needed
        }
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";

      router.push(`${window.location.pathname}${query}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Enhanced handlers that also update URL
  const handleSearchChange = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateUrlParams({ search: query });
    },
    [updateUrlParams],
  );

  const handleCategoryChange = React.useCallback(
    (category: string) => {
      setSelectedCategory(category);
      updateUrlParams({ category });
    },
    [updateUrlParams],
  );

  const handleVendorViewChange = React.useCallback(
    (view: "partners" | "all") => {
      setVendorView(view);
      updateUrlParams({ view });
    },
    [updateUrlParams],
  );

  // Location search handlers
  const handleLocationSearch = React.useCallback(
    (location: VendorCoordinates, distance: number) => {
      setUserLocation(location);
      setMaxDistance(distance);
      setCurrentPage(1);
    },
    [],
  );

  const handleLocationReset = React.useCallback(() => {
    setUserLocation(null);
    setMaxDistance(100);
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, vendorView]);

  return (
    <>
      {/* Unified Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <VendorSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          categories={initialCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          onLocationSearch={handleLocationSearch}
          onLocationReset={handleLocationReset}
          locationResultCount={filteredVendors.length}
          locationTotalCount={initialVendors.length}
          placeholder={`Search ${pageTitle} by name, description, or technology...`}
        />
      </motion.div>

      {/* Vendor Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <VendorToggle
          value={vendorView}
          onValueChange={handleVendorViewChange}
          partnersLabel="Partners"
          allLabel="All Vendors"
        />
      </motion.div>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mb-8"
      >
        <p className="text-muted-foreground font-poppins-light">
          Showing {paginatedVendors.length} of {filteredVendors.length}{" "}
          {pageTitle}
          {vendorView === "partners" ? " (partners only)" : " (all vendors)"}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </p>
      </motion.div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {paginatedVendors.map((vendor) => {
          const isHighlighted = highlightedVendor === vendor?.name;

          return (
            <VendorCard
              key={vendor?.id}
              vendor={vendor}
              featured={vendor?.featured || isHighlighted}
              showTierBadge={true}
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
            No {pageTitle} found matching your criteria. Try adjusting your
            search or filters.
          </p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
