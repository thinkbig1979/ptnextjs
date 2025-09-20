"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GitCompare, X, Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { toast } from "sonner";

interface ProductComparisonProps {
  products: Product[];
  trigger?: React.ReactNode;
}

interface ComparisonContextType {
  comparedProducts: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isComparing: (productId: string) => boolean;
}

const ComparisonContext = React.createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [comparedProducts, setComparedProducts] = React.useState<Product[]>([]);

  const addToComparison = React.useCallback((product: Product) => {
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

export function CompareButton({ product }: { product: Product }) {
  const { addToComparison, removeFromComparison, isComparing, comparedProducts } = useComparison();
  const isInComparison = isComparing(product.id);
  const isAtLimit = comparedProducts.length >= 3 && !isInComparison;

  const handleToggle = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  }, [product, isInComparison, addToComparison, removeFromComparison]);

  return (
    <Button
      variant={isInComparison ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className="gap-2"
      disabled={isAtLimit}
      title={isAtLimit ? "Maximum 3 products allowed for comparison" : undefined}
    >
      {isInComparison ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {isInComparison ? "Remove" : isAtLimit ? "Limit Reached" : "Compare"}
    </Button>
  );
}

export function ComparisonFloatingButton() {
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

function ProductComparisonTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No products selected for comparison</p>
      </div>
    );
  }

  // Extract all unique specification keys
  const allSpecKeys = React.useMemo(() => {
    const keys = new Set<string>();
    products.forEach(product => {
      product.specifications?.forEach(spec => {
        if (spec.label) keys.add(spec.label);
      });
      if (product.comparisonMetrics) {
        Object.keys(product.comparisonMetrics).forEach(key => keys.add(key));
      }
    });
    return Array.from(keys);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Product Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="text-center">
              <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={product.mainImage?.url || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  fallbackType="product"
                />
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.vendorName && (
                  <Badge variant="outline">{product.vendorName}</Badge>
                )}
              </div>
              {product.price && (
                <p className="text-lg font-semibold text-primary">{product.price}</p>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Features Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Features</h3>
        <div className="space-y-2">
          {products[0]?.features?.map((feature, index) => (
            <div key={feature.id || index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="font-medium">{feature.title}</div>
              {products.map((product, pIndex) => (
                <div key={`${product.id}-${index}`} className="text-sm text-muted-foreground">
                  {product.features?.[index]?.description || "—"}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Specifications Comparison */}
      {allSpecKeys.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Specifications</h3>
          <div className="space-y-3">
            {allSpecKeys.map((specKey) => (
              <div key={specKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="font-medium capitalize">{specKey.replace(/([A-Z])/g, ' $1').trim()}</div>
                {products.map((product) => {
                  const spec = product.specifications?.find(s => s.label === specKey);
                  const metric = product.comparisonMetrics?.[specKey];
                  const value = spec?.value || (metric ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}` : "—");
                  return (
                    <div key={`${product.id}-${specKey}`} className="text-sm">
                      {value}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Integration Compatibility */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Integration Compatibility</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="space-y-2">
              <h4 className="font-medium">{product.name}</h4>
              <div className="flex flex-wrap gap-1">
                {product.integrationCompatibility?.map((protocol) => (
                  <Badge key={protocol} variant="outline" className="text-xs">
                    {protocol}
                  </Badge>
                )) || (
                  <span className="text-sm text-muted-foreground">No compatibility data</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}