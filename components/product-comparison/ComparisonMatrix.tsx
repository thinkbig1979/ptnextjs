"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product, ComparisonMetric } from "@/lib/types";

interface ComparisonMatrixProps {
  products: Product[];
  metrics: ComparisonMetric[];
  onProductSelect?: (productId: string) => void;
  maxProducts?: number;
  className?: string;
  showBestValue?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function ComparisonMatrix({
  products,
  metrics,
  onProductSelect,
  maxProducts = 4,
  className,
  showBestValue = false,
  sortBy,
  sortOrder = 'desc'
}: ComparisonMatrixProps) {
  const [sortedProducts, setSortedProducts] = React.useState<Product[]>([]);

  // Limit products to maxProducts
  const displayProducts = React.useMemo(() => {
    return products.slice(0, maxProducts);
  }, [products, maxProducts]);

  // Sort products when sortBy changes
  React.useEffect(() => {
    let sorted = [...displayProducts];

    if (sortBy && metrics.find(m => m.metricId === sortBy)) {
      sorted = sorted.sort((a, b) => {
        const aValue = a.comparisonMetrics?.[sortBy]?.value || 0;
        const bValue = b.comparisonMetrics?.[sortBy]?.value || 0;

        if (sortOrder === 'desc') {
          return bValue - aValue;
        }
        return aValue - bValue;
      });
    }

    setSortedProducts(sorted);
  }, [displayProducts, sortBy, sortOrder, metrics]);

  const finalProducts = sortBy ? sortedProducts : displayProducts;

  // Find best value for each metric when showBestValue is true
  const getBestValueForMetric = (metricId: string): number | null => {
    if (!showBestValue) return null;

    const values = finalProducts
      .map(p => p.comparisonMetrics?.[metricId]?.value)
      .filter((v): v is number => v !== undefined);

    if (values.length === 0) return null;

    // Assume higher is better for most metrics, could be configurable
    return Math.max(...values);
  };

  const isBestValue = (productId: string, metricId: string): boolean => {
    if (!showBestValue) return false;

    const bestValue = getBestValueForMetric(metricId);
    const productValue = finalProducts.find(p => p.id === productId)?.comparisonMetrics?.[metricId]?.value;

    return bestValue !== null && productValue === bestValue;
  };

  if (finalProducts.length === 0) {
    return (
      <Card className={cn("w-full", className)} data-testid="comparison-matrix">
        <CardContent className="p-6 text-center text-muted-foreground">
          No products to compare
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("comparison-matrix w-full", className)} data-testid="comparison-matrix">
      <Card>
        <CardHeader>
          <CardTitle>Product Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left font-medium border-b">Feature</th>
                  {finalProducts.map((product, index) => (
                    <th
                      key={product.id}
                      className="p-4 text-center font-medium border-b min-w-[200px]"
                      data-testid={`product-column-${index}`}
                    >
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                        {product.vendorName && (
                          <p className="text-xs text-muted-foreground">{product.vendorName}</p>
                        )}
                        {product.price && (
                          <Badge variant="secondary" className="text-xs">
                            {product.price}
                          </Badge>
                        )}
                        {onProductSelect && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onProductSelect(product.id)}
                            data-testid={`product-select-${product.id}`}
                            className="w-full"
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.metricId} className="border-b">
                    <td className="p-4 font-medium">
                      <div className="space-y-1">
                        <span>{metric.name}</span>
                        {metric.category && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {metric.category}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {finalProducts.map((product) => {
                      const metricValue = product.comparisonMetrics?.[metric.metricId];
                      const isAvailable = metricValue !== undefined;
                      const isBest = isBestValue(product.id, metric.metricId);

                      return (
                        <td
                          key={`${product.id}-${metric.metricId}`}
                          className={cn(
                            "p-4 text-center",
                            isBest && "bg-green-50 border-green-200"
                          )}
                          data-testid={`metric-cell-${product.id}-${metric.metricId}`}
                        >
                          {isAvailable ? (
                            <div className="space-y-1">
                              <span className="font-medium">
                                {metricValue.value} {metricValue.unit || metric.unit || ''}
                              </span>
                              {isBest && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  Best
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              N/A
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {finalProducts.some(p => !p.comparisonMetrics || Object.keys(p.comparisonMetrics).length === 0) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                No metrics available for some products
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}