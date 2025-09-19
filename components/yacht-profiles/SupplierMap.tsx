"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { YachtSupplierRole } from "@/lib/types";

interface SupplierMapProps {
  suppliers: YachtSupplierRole[];
  groupByDiscipline?: boolean;
  filterByRole?: 'primary' | 'subcontractor' | 'consultant';
  filterByDiscipline?: string;
  onSupplierClick?: (supplier: YachtSupplierRole) => void;
  viewMode?: 'cards' | 'links';
  className?: string;
}

export function SupplierMap({
  suppliers,
  groupByDiscipline: _groupByDiscipline = false,
  filterByRole,
  filterByDiscipline,
  onSupplierClick,
  viewMode = 'cards',
  className
}: SupplierMapProps) {
  const filteredSuppliers = React.useMemo(() => {
    return suppliers.filter(supplier => {
      if (filterByRole && supplier.role !== filterByRole) return false;
      if (filterByDiscipline && supplier.discipline !== filterByDiscipline) return false;
      return true;
    });
  }, [suppliers, filterByRole, filterByDiscipline]);

  const totalSystems = React.useMemo(() => {
    return filteredSuppliers.reduce((total, supplier) => total + supplier.systems.length, 0);
  }, [filteredSuppliers]);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'subcontractor':
        return 'bg-green-100 text-green-800';
      case 'consultant':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

      <div className="grid gap-4 md:grid-cols-2">
        {filteredSuppliers.map((supplier, index) => (
          <Card
            key={index}
            className={cn(
              "transition-all duration-200",
              onSupplierClick && "cursor-pointer hover:shadow-md"
            )}
            data-testid={`supplier-card-${supplier.vendorId}`}
            onClick={() => onSupplierClick?.(supplier)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {viewMode === 'links' && supplier.vendorId ? (
                    <Link
                      href={`/vendors/${supplier.vendorId}`}
                      className="font-semibold hover:text-accent transition-colors"
                    >
                      {supplier.vendorName}
                    </Link>
                  ) : (
                    <CardTitle className="text-base">
                      {supplier.vendorName}
                    </CardTitle>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {supplier.discipline}
                  </p>
                </div>
                <Badge className={cn("text-xs", getRoleBadgeClass(supplier.role))}>
                  {supplier.role === 'primary' ? 'Primary' :
                   supplier.role === 'subcontractor' ? 'Subcontractor' : 'Consultant'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Systems Supplied
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {supplier.systems.map((system, systemIndex) => (
                      <Badge
                        key={systemIndex}
                        variant="outline"
                        className="text-xs"
                      >
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>

                {supplier.projectPhase && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Project Phase
                    </p>
                    <p className="text-sm">{supplier.projectPhase}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}