"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VendorInnovationHighlight } from "@/lib/types";

interface InnovationHighlightsProps {
  innovations: VendorInnovationHighlight[];
  className?: string;
}

export function InnovationHighlights({
  innovations,
  className
}: InnovationHighlightsProps) {
  if (!innovations || innovations.length === 0) {
    return (
      <div
        className={cn("text-center py-12", className)}
        data-testid="no-innovations-message"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground">
          No innovation highlights available at this time.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="font-cormorant text-3xl lg:text-4xl font-bold mb-4">
          Innovation Highlights
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Cutting-edge technologies and unique approaches that set us apart in the marine industry.
        </p>
      </div>

      <div
        className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}
        data-testid="innovation-highlights"
      >
        {innovations.map((innovation, index) => (
          <Card
            key={index}
            className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/50"
            data-testid="innovation-item"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"
                  data-testid="tech-icon"
                >
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>

                <Badge variant="outline" className="ml-2">
                  Innovation
                </Badge>
              </div>

              <CardTitle className="font-cormorant text-xl font-semibold leading-tight group-hover:text-accent transition-colors">
                {innovation.technology}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {innovation.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {innovation.description}
                </p>
              )}

              {innovation.uniqueApproach && (
                <div className="space-y-2">
                  <h4 className="font-poppins-medium text-sm font-semibold text-accent">
                    Unique Approach
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {innovation.uniqueApproach}
                  </p>
                </div>
              )}

              {innovation.benefitsToClients && innovation.benefitsToClients.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-poppins-medium text-sm font-semibold text-accent">
                    Client Benefits
                  </h4>
                  <ul className="space-y-2">
                    {innovation.benefitsToClients.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-center gap-2 text-sm"
                        data-testid="benefit-item"
                      >
                        <svg
                          className="w-4 h-4 text-accent flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-muted-foreground leading-relaxed">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}