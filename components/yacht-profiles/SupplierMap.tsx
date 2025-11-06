"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { YachtSupplierRole } from "@/lib/types";
import { usePerformanceMetrics } from "@/lib/hooks/use-lazy-loading";

interface SupplierMapProps {
  suppliers: YachtSupplierRole[];
  groupByDiscipline?: boolean;
  filterByRole?: 'primary' | 'subcontractor' | 'consultant';
  filterByDiscipline?: string;
  onSupplierClick?: (supplier: YachtSupplierRole) => void;
  viewMode?: 'cards' | 'links';
  className?: string;
}

// Memoized supplier card component for performance
const SupplierCard = React.memo(({
  supplier,
  onSupplierClick,
  getRoleBadgeClass
}: {
  supplier: YachtSupplierRole;
  onSupplierClick?: (supplier: YachtSupplierRole) => void;
  getRoleBadgeClass: (role: string) => string;
}) => {
  const handleClick = React.useCallback(() => {
    onSupplierClick?.(supplier);
  }, [supplier, onSupplierClick]);

  return (
    <Card data-testid={`supplier-card-${supplier.vendorId}`}
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {supplier.vendorName}
          </CardTitle>
          <Badge className={getRoleBadgeClass(supplier.role)}>
            {supplier.role.charAt(0).toUpperCase() + supplier.role.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{supplier.discipline}</p>
          {supplier.projectPhase && (
            <p className="text-xs text-muted-foreground">{supplier.projectPhase}</p>
          )}
          {supplier.systems && supplier.systems.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {supplier.systems.slice(0, 3).map((system, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {system}
                </Badge>
              ))}
              {supplier.systems.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{supplier.systems.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SupplierCard.displayName = 'SupplierCard';

export function SupplierMap({
  suppliers = [],
  groupByDiscipline: _groupByDiscipline = false,
  filterByRole,
  filterByDiscipline,
  onSupplierClick,
  viewMode = 'cards',
  className
}: SupplierMapProps) {
  // All hooks must be called before any early returns
  // Performance monitoring
  const { startMeasure, endMeasure } = usePerformanceMetrics({
    name: 'SupplierMap',
    enabled: process.env.NODE_ENV === 'development'
  });

  // Memoized filtering for performance
  const filteredSuppliers = React.useMemo(() => {
    if (!suppliers || suppliers.length === 0) {
      return [];
    }
    const filtered = suppliers.filter(supplier => {
      if (filterByRole && supplier.role !== filterByRole) return false;
      if (filterByDiscipline && supplier.discipline !== filterByDiscipline) return false;
      return true;
    });
    return filtered;
  }, [suppliers, filterByRole, filterByDiscipline]);

  // Performance measurement effect (separate from memoization)
  React.useEffect(() => {
    startMeasure();
    // Simulate the filtering operation for measurement
    filteredSuppliers.length;
    endMeasure();
  }, [filteredSuppliers, startMeasure, endMeasure]);

  // Memoized grouping by discipline
  const groupedSuppliers = React.useMemo(() => {
    const groups: Record<string, YachtSupplierRole[]> = {};
    filteredSuppliers.forEach(supplier => {
      if (!groups[supplier.discipline]) {
        groups[supplier.discipline] = [];
      }
      groups[supplier.discipline].push(supplier);
    });
    return groups;
  }, [filteredSuppliers]);

  const totalSystems = React.useMemo(() => {
    return filteredSuppliers.reduce((total, supplier) => total + (supplier.systems?.length || 0), 0);
  }, [filteredSuppliers]);

  // Memoized role badge class function
  const getRoleBadgeClass = React.useCallback((role: string) => {
    switch (role) {
      case 'primary':
        return 'bg-accent/10 text-accent';
      case 'subcontractor':
        return 'bg-green-100 text-green-800';
      case 'consultant':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-muted text-gray-800';
    }
  }, []);

  // Early return for empty suppliers - after all hooks
  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No suppliers assigned to this project yet.
        </p>
      </div>
    );
  }

  if (filteredSuppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No suppliers assigned to this project yet.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{filteredSuppliers.length} Suppliers</p>
          <p className="text-sm text-muted-foreground">{totalSystems} Systems</p>
        </div>
      </div>

      {_groupByDiscipline ? (
        // Grouped by discipline view
        <div className="space-y-6">
          {Object.entries(groupedSuppliers).map(([discipline, disciplineSuppliers]) => (
            <div key={discipline}>
              <h3 className="text-lg font-semibold mb-3">{discipline} ({disciplineSuppliers.length})</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {disciplineSuppliers.map((supplier, index) => (
                  <SupplierCard
                    key={`${supplier.vendorId}-${index}`}
                    supplier={supplier}
                    onSupplierClick={onSupplierClick}
                    getRoleBadgeClass={getRoleBadgeClass}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Standard view - check viewMode
        viewMode === 'links' ? (
          <div className="space-y-2">
            {filteredSuppliers.map((supplier, index) => (
              <Link
                key={`${supplier.vendorId}-${index}`}
                href={`/vendors/${supplier.vendorId}`}
                className="block p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{supplier.vendorName}</span>
                  <Badge className={getRoleBadgeClass(supplier.role)}>
                    {supplier.role.charAt(0).toUpperCase() + supplier.role.slice(1)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier, index) => (
              <SupplierCard
                key={`${supplier.vendorId}-${index}`}
                supplier={supplier}
                onSupplierClick={onSupplierClick}
                getRoleBadgeClass={getRoleBadgeClass}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}