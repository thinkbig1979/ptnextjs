"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Pagination } from "@/components/pagination";
import { VendorToggle } from "@/components/ui/vendor-toggle";
import { parseFilterParams } from "@/lib/utils";
import { VendorCard } from "@/components/vendors/VendorCard";
import { CategorySelect } from "@/components/vendors/CategorySelect";
import { Vendor, Product, VendorCoordinates, Category } from "@/lib/types";
import { VendorSearchBar } from "@/components/VendorSearchBar";
import {
  useLocationFilter,
  VendorWithDistance,
} from "@/hooks/useLocationFilter";

const ITEMS_PER_PAGE = 12;

/**
 * Memoized vendor list item component
 * Prevents unnecessary re-renders when other vendors in the list change
 */
const MemoizedVendorListItem = React.memo(function VendorListItem({
  vendor,
  isHighlighted,
}: {
  vendor: VendorWithDistance;
  isHighlighted: boolean;
}) {
  return (
    <li
      className="list-none"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 180px',
      }}
    >
      <VendorCard
        vendor={vendor}
        featured={vendor?.featured || isHighlighted}
        showTierBadge={true}
      />
    </li>
  );
});

/**
 * Memoized vendor grid component
 * Prevents re-rendering the entire grid when unrelated parent state changes
 */
const MemoizedVendorGrid = React.memo(function VendorGrid({
  vendors,
  highlightedVendor,
}: {
  vendors: VendorWithDistance[];
  highlightedVendor: string;
}) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 list-none p-0 m-0"
      aria-label="Vendors list"
    >
      {vendors.map((vendor) => (
        <MemoizedVendorListItem
          key={vendor?.id}
          vendor={vendor}
          isHighlighted={highlightedVendor === vendor?.name}
        />
      ))}
    </ul>
  );
});

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
  const [productCategory, setProductCategory] = React.useState<string | null>(
    searchParams?.get("productCategory") || null,
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
    setProductCategory(searchParams?.get("productCategory") || null);
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

  // Extract unique product categories from products
  const productCategories = React.useMemo(() => {
    const uniqueCategories = new Set(
      initialProducts.map((p) => p.category).filter(Boolean) as string[]
    );
    return Array.from(uniqueCategories)
      .toSorted()
      .map((cat) => ({
        id: cat,
        name: cat,
        slug: cat,
        description: '',
        icon: '',
        color: '',
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
      }));
  }, [initialProducts]);

  // Build a pre-indexed Map of vendor product counts by category for O(1) lookups
  // This Map is built once and reused, avoiding re-iteration when productCategory changes
  const productCountsByCategory = React.useMemo(() => {
    const indexMap = new Map<string, Map<string, number>>();

    for (const product of initialProducts) {
      const category = product.category;
      const vendorId = product.vendorId || product.partnerId;

      if (!category || !vendorId) continue;

      if (!indexMap.has(category)) {
        indexMap.set(category, new Map());
      }

      const vendorCounts = indexMap.get(category)!;
      vendorCounts.set(vendorId, (vendorCounts.get(vendorId) || 0) + 1);
    }

    return indexMap;
  }, [initialProducts]);

  // Get product counts for selected category from pre-built index (O(1) lookup)
  const vendorProductCounts = React.useMemo(() => {
    if (!productCategory) return {};
    const categoryMap = productCountsByCategory.get(productCategory);
    if (!categoryMap) return {};
    return Object.fromEntries(categoryMap);
  }, [productCountsByCategory, productCategory]);

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

    // Apply category filter (vendor category)
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (vendor) => vendor?.category === selectedCategory,
      );
    }

    // Apply product category filter (filter to vendors who have products in this category)
    if (productCategory) {
      const vendorIdsWithCategory = new Set(
        initialProducts
          .filter((p) => p.category === productCategory)
          .map((p) => p.vendorId || p.partnerId)
          .filter(Boolean)
      );
      filtered = filtered.filter((vendor) =>
        vendorIdsWithCategory.has(vendor.id)
      );
    }

    // Sort vendors: Featured vendors first, then non-featured
    // Within each group, maintain the existing order (including location distance if applicable)
    // Using toSorted() for immutability safety - doesn't mutate the original array
    return filtered.toSorted((a, b) => {
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
  }, [
    baseVendorsForFiltering,
    searchQuery,
    selectedCategory,
    productCategory,
    highlightedVendor,
    showPartnersOnly,
    showNonPartnersOnly,
    vendorView,
    initialProducts,
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
      productCategory?: string | null;
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

      // Update or remove productCategory parameter
      if (params.productCategory !== undefined) {
        if (params.productCategory) {
          current.set("productCategory", params.productCategory);
        } else {
          current.delete("productCategory");
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
  // Use startTransition for non-urgent state updates to maintain UI responsiveness
  const handleSearchChange = React.useCallback(
    (query: string) => {
      React.startTransition(() => {
        setSearchQuery(query);
        updateUrlParams({ search: query });
      });
    },
    [updateUrlParams],
  );

  const handleCategoryChange = React.useCallback(
    (category: string) => {
      React.startTransition(() => {
        setSelectedCategory(category);
        updateUrlParams({ category });
      });
    },
    [updateUrlParams],
  );

  const handleProductCategoryChange = React.useCallback(
    (category: string | null) => {
      React.startTransition(() => {
        setProductCategory(category);
        updateUrlParams({ productCategory: category });
      });
    },
    [updateUrlParams],
  );

  const handleVendorViewChange = React.useCallback(
    (view: "partners" | "all") => {
      React.startTransition(() => {
        setVendorView(view);
        updateUrlParams({ view });
      });
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
  }, [searchQuery, selectedCategory, productCategory, vendorView]);

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

      {/* Product Category Filter */}
      {productCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label htmlFor="product-category-filter" className="text-sm font-medium text-foreground whitespace-nowrap">
              Filter by Product Type:
            </label>
            <CategorySelect
              categories={productCategories}
              value={productCategory}
              onChange={handleProductCategoryChange}
              className="w-full sm:w-64"
            />
            {productCategory && (
              <p className="text-xs text-muted-foreground">
                Showing vendors with {productCategory} products
              </p>
            )}
          </div>
        </motion.div>
      )}

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
        <p className="text-muted-foreground font-poppins-light" data-testid="result-count">
          Showing {paginatedVendors.length} of {filteredVendors.length}{" "}
          {pageTitle}
          {vendorView === "partners" ? " (partners only)" : " (all vendors)"}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {productCategory && ` offering ${productCategory} products`}
        </p>
      </motion.div>

      {/* Vendors Grid - Using memoized components to prevent unnecessary re-renders */}
      <MemoizedVendorGrid
        vendors={paginatedVendors}
        highlightedVendor={highlightedVendor}
      />

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
