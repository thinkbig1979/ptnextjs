"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import type { Product, SystemCompatibility } from "@/lib/types";

interface IntegrationNotesProps {
  product: Product;
  compatibilityMatrix?: SystemCompatibility[];
  className?: string;
  expandable?: boolean;
  searchable?: boolean;
  showComplexity?: boolean;
  showCosts?: boolean;
}

export function IntegrationNotes({
  product,
  compatibilityMatrix = [],
  className,
  expandable = false,
  searchable = false,
  showComplexity = false,
  showCosts = false
}: IntegrationNotesProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (systemName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(systemName)) {
      newExpanded.delete(systemName);
    } else {
      newExpanded.add(systemName);
    }
    setExpandedSections(newExpanded);
  };

  // Filter compatibility matrix based on search term
  const filteredMatrix = React.useMemo(() => {
    if (!searchTerm) return compatibilityMatrix;
    return compatibilityMatrix.filter(item =>
      item.system.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [compatibilityMatrix, searchTerm]);

  // Filter integration compatibility based on search term
  const filteredProtocols = React.useMemo(() => {
    if (!searchTerm || !product.integrationCompatibility) {
      return product.integrationCompatibility || [];
    }
    return product.integrationCompatibility.filter(protocol =>
      protocol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [product.integrationCompatibility, searchTerm]);

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'full':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'adapter':
        return 'bg-accent/10 text-accent border-blue-200';
      case 'none':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted text-gray-800 border-border';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-gray-800';
    }
  };

  const hasIntegrationInfo = product.integrationCompatibility?.length ||
                           product.systemRequirements ||
                           compatibilityMatrix.length;

  if (!hasIntegrationInfo) {
    return (
      <Card className={cn("w-full", className)} data-testid="integration-notes">
        <CardContent className="p-6 text-center text-muted-foreground">
          No integration information available for this product.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)} data-testid="integration-notes">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* System Compatibility */}
      {(filteredProtocols.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>System Compatibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filteredProtocols.map((protocol) => (
                <Badge key={protocol} variant="secondary">
                  {protocol}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Requirements */}
      {product.systemRequirements && (
        <Card>
          <CardHeader>
            <CardTitle>System Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.systemRequirements.powerSupply && (
                <div>
                  <span className="text-sm font-medium">Power Supply:</span>
                  <p className="text-sm text-muted-foreground">
                    {product.systemRequirements.powerSupply}
                  </p>
                </div>
              )}
              {product.systemRequirements.mounting && (
                <div>
                  <span className="text-sm font-medium">Mounting:</span>
                  <p className="text-sm text-muted-foreground">
                    {product.systemRequirements.mounting}
                  </p>
                </div>
              )}
              {product.systemRequirements.operatingTemp && (
                <div>
                  <span className="text-sm font-medium">Operating Temperature:</span>
                  <p className="text-sm text-muted-foreground">
                    {product.systemRequirements.operatingTemp}
                  </p>
                </div>
              )}
              {product.systemRequirements.certification && (
                <div>
                  <span className="text-sm font-medium">Certifications:</span>
                  <p className="text-sm text-muted-foreground">
                    {product.systemRequirements.certification}
                  </p>
                </div>
              )}
              {product.systemRequirements.ipRating && (
                <div>
                  <span className="text-sm font-medium">IP Rating:</span>
                  <p className="text-sm text-muted-foreground">
                    {product.systemRequirements.ipRating}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compatibility Matrix */}
      {filteredMatrix.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compatibility Details</CardTitle>
          </CardHeader>
          <CardContent data-testid="compatibility-matrix">
            <div className="space-y-4">
              {filteredMatrix.map((item) => (
                <div key={item.system} className="border rounded-lg p-4">
                  {expandable ? (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-0 h-auto"
                          onClick={() => toggleSection(item.system)}
                          data-testid={`expand-compatibility-${item.system}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{item.system}</span>
                            <Badge
                              className={cn("border", getCompatibilityColor(item.compatibility))}
                              data-testid={`compatibility-indicator-${item.compatibility}`}
                            >
                              {item.compatibility}
                            </Badge>
                          </div>
                          {expandedSections.has(item.system) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        )}
                        {item.requirements && item.requirements.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Requirements:</span>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                              {item.requirements.map((req, index) => (
                                <li key={`req-${item.system}-${index}`}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.system}</span>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={cn("border", getCompatibilityColor(item.compatibility))}
                            data-testid={`compatibility-indicator-${item.compatibility}`}
                          >
                            {item.compatibility}
                          </Badge>
                          {showComplexity && item.complexity && (
                            <Badge
                              className={getComplexityColor(item.complexity)}
                              data-testid={`complexity-${item.complexity}`}
                            >
                              {item.complexity}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      )}

                      {item.requirements && item.requirements.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Requirements:</span>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                            {item.requirements.map((req, index) => (
                              <li key={`req-${item.system}-${index}`}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {showCosts && item.estimatedCost && (
                        <div>
                          <span className="text-sm font-medium">Estimated Cost:</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {item.estimatedCost}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Compatibility Legend:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200" data-testid="compatibility-full">
                  Full - Ready to use
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" data-testid="compatibility-partial">
                  Partial - Limited features
                </Badge>
                <Badge className="bg-accent/10 text-accent border-blue-200" data-testid="compatibility-adapter">
                  Adapter - Additional hardware needed
                </Badge>
                <Badge className="bg-red-100 text-red-800 border-red-200" data-testid="compatibility-none">
                  None - Not compatible
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}