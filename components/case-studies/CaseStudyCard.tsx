"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VendorCaseStudy } from "@/lib/types";

interface CaseStudyCardProps {
  caseStudy: VendorCaseStudy;
  vendorSlug?: string;
  className?: string;
}

export function CaseStudyCard({
  caseStudy,
  vendorSlug,
  className
}: CaseStudyCardProps) {
  const mainImage = caseStudy.images?.[0];
  const href = vendorSlug
    ? `/vendors/${vendorSlug}/case-studies/${caseStudy.slug}`
    : `#${caseStudy.slug}`;

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
      data-testid="case-study-card"
    >
      <Link href={href} className="block">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={`${caseStudy.title} case study`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center"
              data-testid="case-study-placeholder"
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">Case Study</p>
              </div>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-cormorant text-xl font-semibold leading-tight group-hover:text-accent transition-colors">
              {caseStudy.title}
            </h3>

            {caseStudy.client && (
              <p className="text-sm text-muted-foreground font-poppins-medium">
                {caseStudy.client}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <p
              className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
              data-testid="case-study-challenge"
            >
              {caseStudy.challenge}
            </p>

            {caseStudy.technologies && caseStudy.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {caseStudy.technologies.slice(0, 4).map((tech, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    {tech}
                  </Badge>
                ))}
                {caseStudy.technologies.length > 4 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    +{caseStudy.technologies.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center text-accent text-sm font-poppins-medium">
              <span>Read case study</span>
              <svg
                className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}