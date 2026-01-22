"use client";

import * as React from "react";
import { GitCompare, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { SerializedProduct } from "@/lib/types";

// Hoisted RegExp for camelCase to Title Case conversion (avoids recreation on each render)
const CAMEL_CASE_REGEX = /([A-Z])/g;

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { OptimizedImage } from "./optimized-image";


interface ComparisonContextType {
  comparedProducts: SerializedProduct[];
  addToComparison: (product: SerializedProduct) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isComparing: (productId: string) => boolean;
}

const ComparisonContext = React.createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [comparedProducts, setComparedProducts] = React.useState<SerializedProduct[]>([]);

  const addToComparison = React.useCallback((product: SerializedProduct) => {
    setComparedProducts(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev; // Already in comparison
      }
      if (prev.length >= 3) {
        // Show warning toast instead of replacing
        toast.warning("Maximum 3 products allowed", {
          description: "Please remove a product from comparison before adding a new one.",
          duration: 4000,
        });
        return prev; // Don't add the product
      }
      return [...prev, product];
    });
  }, []);

  const removeFromComparison = React.useCallback((productId: string) => {
    setComparedProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearComparison = React.useCallback(() => {
    setComparedProducts([]);
  }, []);

  const isComparing = React.useCallback((productId: string) => {
    return comparedProducts.some(p => p.id === productId);
  }, [comparedProducts]);

  const value = {
    comparedProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isComparing,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = React.useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}

export function CompareButton({ product }: { product: SerializedProduct }): React.ReactElement {
  const { addToComparison, removeFromComparison, isComparing, comparedProducts } = useComparison();
  const isInComparison = isComparing(product.id);
  const isAtLimit = comparedProducts.length >= 3 && !isInComparison;

  const handleToggle = React.useCallback((e: React.MouseEvent) => {
    // Always stop propagation first, regardless of state
    e.stopPropagation();
    e.preventDefault();

    // Access the native event for stopImmediatePropagation
    e.nativeEvent.stopImmediatePropagation();

    // Don't do anything if we're at the limit and this product is not in comparison
    if (isAtLimit) {
      return false;
    }

    if (isInComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  }, [product, isInComparison, addToComparison, removeFromComparison, isAtLimit]);

  // Create a bulletproof event blocker for disabled state
  const blockAllEvents = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    return false;
  }, []);

  if (isAtLimit) {
    // When at limit, render a completely non-interactive disabled button wrapped in event blocker
    return (
      <div
        className="relative"
        onClick={blockAllEvents}
        onMouseDown={blockAllEvents}
        onMouseUp={blockAllEvents}
        onDoubleClick={blockAllEvents}
        onContextMenu={blockAllEvents}
        style={{ pointerEvents: 'all' }}
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2 cursor-not-allowed opacity-50 pointer-events-none"
          disabled={true}
          tabIndex={-1}
          aria-disabled={true}
          title="Maximum 3 products allowed for comparison"
        >
          <Plus className="h-3 w-3" />
          Limit Reached
        </Button>
      </div>
    );
  }

  // Normal interactive button
  return (
    <Button
      variant={isInComparison ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className="gap-2"
      title={isInComparison ? "Remove from comparison" : "Add to comparison"}
    >
      {isInComparison ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {isInComparison ? "Remove" : "Compare"}
    </Button>
  );
}

export function ComparisonFloatingButton(): React.ReactElement | null {
  const { comparedProducts, clearComparison } = useComparison();

  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg">
            <GitCompare className="h-4 w-4 mr-2" />
            Compare ({comparedProducts.length}/3)
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Comparison</DialogTitle>
            <DialogDescription>
              Compare features, specifications, and metrics across selected products ({comparedProducts.length}/3 maximum)
            </DialogDescription>
          </DialogHeader>
          <ProductComparisonTable products={comparedProducts} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={clearComparison}>
              Clear All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductComparisonTable({ products }: { products: SerializedProduct[] }): React.ReactElement {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No products selected for comparison</p>
      </div>
    );
  }

  // Get all unique categories and specs from comparisonMetrics
  const allCategories = Array.from(new Set(
    products.flatMap(product =>
      product.comparisonMetrics ? Object.keys(product.comparisonMetrics) : []
    )
  ));

  // Get all unique specification keys from all products
  const allSpecificationKeys = Array.from(new Set(
    products.flatMap(product =>
      product.specifications?.map(s => s.label) || []
    )
  ));

  // Helper function to format spec names (uses hoisted regex)
  const formatSpecName = (name: string) => {
    return name
      .replace(CAMEL_CASE_REGEX, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Helper function to format category names (uses hoisted regex)
  const formatCategoryName = (category: string) => {
    return category
      .replace(CAMEL_CASE_REGEX, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-background">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-4 px-4 font-semibold text-foreground w-1/4 sticky left-0 bg-background z-10">
                <div className="border-r border-border pr-4">
                  Specification
                </div>
              </th>
              {products.map((product) => (
                <th key={product.id} className="text-center py-4 px-4 min-w-64">
                  <div className="space-y-3">
                    <div className="relative w-16 h-16 mx-auto rounded-lg overflow-hidden bg-muted">
                      <OptimizedImage
                        src={product.mainImage?.url || product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        fallbackType="product"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground leading-tight">{product.name}</h4>
                      <div className="flex justify-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                      </div>
                      {product.vendorName && (
                        <p className="text-xs text-muted-foreground mt-1">{product.vendorName}</p>
                      )}
                      {product.price && (
                        <p className="text-sm font-semibold text-primary mt-1">{product.price}</p>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Basic Information */}
            <tr className="border-b border-border bg-muted/50">
              <td className="py-3 px-4 font-semibold text-foreground sticky left-0 bg-muted/50 z-10">
                <div className="border-r border-border pr-4">Description</div>
              </td>
              {products.map((product) => (
                <td key={product.id} className="py-3 px-4 text-center text-sm">
                  <div className="max-w-xs mx-auto text-left">
                    {product.description ? (
                      product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description
                    ) : "—"}
                  </div>
                </td>
              ))}
            </tr>

            {/* Technical Specifications from comparisonMetrics */}
            {allCategories.map((category) => {
              // Get all unique specs for this category across all products
              const categorySpecs = Array.from(new Set(
                products.flatMap(product =>
                  product.comparisonMetrics?.[category]
                    ? Object.keys(product.comparisonMetrics[category])
                    : []
                )
              ));

              return categorySpecs.map((specKey, index) => (
                <tr key={`${category}-${specKey}`} className={`border-b border-border ${index === 0 ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                  <td className={`py-3 px-4 font-medium sticky left-0 z-10 ${index === 0 ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-background'}`}>
                    <div className="border-r border-border pr-4">
                      {index === 0 && (
                        <div className="text-xs font-semibold text-accent dark:text-accent uppercase tracking-wide mb-1">
                          {formatCategoryName(category)}
                        </div>
                      )}
                      <div className="text-foreground">
                        {formatSpecName(specKey)}
                      </div>
                    </div>
                  </td>
                  {products.map((product) => {
                    const categoryData = product.comparisonMetrics?.[category] as Record<string, unknown> | undefined;
                    const value = categoryData?.[specKey];

                    // Format arrays nicely
                    let displayValue: React.ReactNode;
                    if (Array.isArray(value)) {
                      displayValue = value.length > 3
                        ? `${value.slice(0, 3).join(', ')} +${value.length - 3} more`
                        : value.join(', ');
                    } else if (typeof value === 'boolean') {
                      displayValue = value ? 'Yes' : 'No';
                    } else if (value === null || value === undefined) {
                      displayValue = "—";
                    } else if (typeof value === 'object') {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = String(value);
                    }

                    return (
                      <td key={`${product.id}-${specKey}`} className={`py-3 px-4 text-center text-sm ${index === 0 ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                        <span className="font-medium text-foreground">
                          {displayValue}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ));
            })}

            {/* Additional Specifications from specifications array */}
            {allSpecificationKeys.length > 0 && allSpecificationKeys.map((specKey, index) => (
              <tr key={`additional-${specKey}`} className={`border-b border-border ${index === 0 ? 'bg-green-50 dark:bg-green-950/30' : ''}`}>
                <td className={`py-3 px-4 font-medium sticky left-0 z-10 ${index === 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-background'}`}>
                  <div className="border-r border-border pr-4">
                    {index === 0 && (
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                        Additional Specs
                      </div>
                    )}
                    <div className="text-foreground">{specKey}</div>
                  </div>
                </td>
                {products.map((product) => {
                  const spec = product.specifications?.find(s => s.label === specKey);
                  return (
                    <td key={`${product.id}-${specKey}`} className={`py-3 px-4 text-center text-sm ${index === 0 ? 'bg-green-50 dark:bg-green-950/30' : ''}`}>
                      <span className="font-medium text-foreground">
                        {spec?.value || "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Integration Compatibility */}
            {products.some(p => p.integrationCompatibility?.length) && (
              <tr className="border-b border-border bg-purple-50 dark:bg-purple-950/30">
                <td className="py-3 px-4 font-medium sticky left-0 bg-purple-50 dark:bg-purple-950/30 z-10">
                  <div className="border-r border-border pr-4">
                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                      Integration
                    </div>
                    <div className="text-foreground">Compatibility</div>
                  </div>
                </td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4 text-center bg-purple-50 dark:bg-purple-950/30">
                    <div className="flex flex-wrap justify-center gap-1">
                      {product.integrationCompatibility?.slice(0, 3).map((protocol) => (
                        <Badge key={protocol} variant="outline" className="text-xs">
                          {protocol}
                        </Badge>
                      )) || (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                      {(product.integrationCompatibility?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(product.integrationCompatibility?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}