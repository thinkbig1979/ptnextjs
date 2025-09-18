"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { YachtSustainabilityMetrics } from "@/lib/types";

interface SustainabilityScoreProps {
  metrics: YachtSustainabilityMetrics;
  compact?: boolean;
  showProgressBars?: boolean;
  showInterpretation?: boolean;
  className?: string;
}

export function SustainabilityScore({
  metrics,
  compact = false,
  showProgressBars = false,
  showInterpretation = false,
  className
}: SustainabilityScoreProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreInterpretation = (score?: number) => {
    if (!score) return 'No sustainability data available';
    if (score >= 80) return 'Excellent environmental performance with industry-leading practices';
    if (score >= 60) return 'Good environmental practices with room for improvement';
    return 'Basic environmental compliance, significant improvements needed';
  };

  return (
    <div
      className={cn(
        "space-y-4",
        compact && "compact-view",
        className
      )}
      data-testid="sustainability-score"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sustainability Metrics</span>
            <div
              className={cn(
                "text-3xl font-bold",
                getScoreColor(metrics.overallScore)
              )}
              data-testid="overall-score"
            >
              {metrics.overallScore || 'N/A'}
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overall Sustainability Score
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {showProgressBars && metrics.overallScore && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Environmental Performance</span>
                <span>{metrics.overallScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    metrics.overallScore >= 80 ? "bg-green-500" :
                    metrics.overallScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${metrics.overallScore}%` }}
                  data-testid="score-progress-bar"
                />
              </div>
            </div>
          )}

          {showInterpretation && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {getScoreInterpretation(metrics.overallScore)}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {metrics.co2Emissions && (
              <div className="space-y-1">
                <p className="text-sm font-medium">CO₂ Emissions</p>
                <p className="text-lg font-semibold">
                  {metrics.co2Emissions.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">kg CO₂ equivalent</p>
              </div>
            )}

            {metrics.energyEfficiency && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Energy Efficiency</p>
                <p className="text-lg font-semibold">{metrics.energyEfficiency}</p>
                <p className="text-xs text-muted-foreground">kWh per nautical mile</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {metrics.wasteManagement && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Waste Management</span>
                <Badge className={getRatingColor(metrics.wasteManagement)}>
                  {metrics.wasteManagement.charAt(0).toUpperCase() + metrics.wasteManagement.slice(1)}
                </Badge>
              </div>
            )}

            {metrics.waterConservation && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Water Conservation</span>
                <Badge className={getRatingColor(metrics.waterConservation)}>
                  {metrics.waterConservation.charAt(0).toUpperCase() + metrics.waterConservation.slice(1)}
                </Badge>
              </div>
            )}

            {metrics.materialSustainability && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Material Sustainability</span>
                <Badge className={getRatingColor(metrics.materialSustainability)}>
                  {metrics.materialSustainability.charAt(0).toUpperCase() + metrics.materialSustainability.slice(1)}
                </Badge>
              </div>
            )}
          </div>

          {metrics.certifications && metrics.certifications.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {metrics.certifications.map((certification, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {certification}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(!metrics.certifications || metrics.certifications.length === 0) && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                No certifications listed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}