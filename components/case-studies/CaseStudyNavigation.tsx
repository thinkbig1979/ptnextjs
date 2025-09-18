"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VendorCaseStudy } from "@/lib/types";

interface CaseStudyNavigationProps {
  caseStudies: VendorCaseStudy[];
  currentSlug: string;
  vendorSlug: string;
  className?: string;
}

export function CaseStudyNavigation({
  caseStudies,
  currentSlug,
  vendorSlug,
  className
}: CaseStudyNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = caseStudies.findIndex(cs => cs.slug === currentSlug);
  const previousCase = currentIndex > 0 ? caseStudies[currentIndex - 1] : null;
  const nextCase = currentIndex < caseStudies.length - 1 ? caseStudies[currentIndex + 1] : null;

  const navigateToCase = (slug: string) => {
    router.push(`/vendors/${vendorSlug}/case-studies/${slug}`);
  };

  const handleKeyNavigation = (event: React.KeyboardEvent, slug: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToCase(slug);
    }
  };

  if (!caseStudies || caseStudies.length === 0) {
    return (
      <div
        className={cn("text-center py-8", className)}
        data-testid="no-case-studies"
      >
        <p className="text-muted-foreground">No case studies available.</p>
      </div>
    );
  }

  return (
    <nav
      className={cn("flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6", className)}
      data-testid="case-study-navigation"
    >
      {/* Case Study List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cormorant text-xl font-semibold">
            Case Studies
          </h3>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {caseStudies.length}
          </span>
        </div>

        <div className="space-y-2">
          {caseStudies.map((caseStudy, index) => {
            const isActive = caseStudy.slug === currentSlug;

            return (
              <Card
                key={caseStudy.slug}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  isActive
                    ? "bg-accent/10 border-accent shadow-sm"
                    : "hover:bg-muted/50 border-border"
                )}
                onClick={() => navigateToCase(caseStudy.slug)}
                onKeyDown={(e) => handleKeyNavigation(e, caseStudy.slug)}
                tabIndex={0}
                role="button"
                data-testid={`nav-item-${caseStudy.slug}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={cn(
                          "font-poppins-medium text-sm font-semibold leading-tight truncate",
                          isActive
                            ? "text-accent"
                            : "text-foreground group-hover:text-accent"
                        )}
                      >
                        {caseStudy.title}
                      </h4>

                      {caseStudy.client && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {caseStudy.client}
                        </p>
                      )}
                    </div>

                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Previous/Next Navigation */}
      <div className="flex flex-col lg:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => previousCase && navigateToCase(previousCase.slug)}
          onKeyDown={(e) => previousCase && handleKeyNavigation(e, previousCase.slug)}
          disabled={!previousCase}
          className="flex-1 justify-start"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="truncate">
            {previousCase ? `Previous: ${previousCase.title}` : 'Previous case study'}
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={() => nextCase && navigateToCase(nextCase.slug)}
          onKeyDown={(e) => nextCase && handleKeyNavigation(e, nextCase.slug)}
          disabled={!nextCase}
          className="flex-1 justify-end"
        >
          <span className="truncate">
            {nextCase ? `Next: ${nextCase.title}` : 'Next case study'}
          </span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Back to Vendor Profile */}
      <div className="pt-4 border-t">
        <Link
          href={`/vendors/${vendorSlug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to vendor profile
        </Link>
      </div>
    </nav>
  );
}