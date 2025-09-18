"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Yacht } from "@/lib/types";

interface YachtCardProps {
  yacht: Yacht;
  className?: string;
}

export function YachtCard({
  yacht,
  className
}: YachtCardProps) {
  const mainImage = yacht.image || yacht.images?.[0];
  const href = `/yachts/${yacht.slug}`;

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover-lift",
        className
      )}
      data-testid="yacht-card"
    >
      <Link href={href} className="block">
        <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={yacht.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center"
              data-testid="yacht-placeholder"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">Yacht Profile</p>
              </div>
            </div>
          )}

          {yacht.featured && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-cormorant text-xl font-semibold leading-tight group-hover:text-accent transition-colors">
              {yacht.name}
            </h3>

            <div className="flex items-center gap-3 text-sm text-muted-foreground font-poppins-light">
              {yacht.builder && (
                <span>{yacht.builder}</span>
              )}
              {yacht.launchYear && (
                <span>• {yacht.launchYear}</span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <p
              className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-poppins-light"
              data-testid="yacht-description"
            >
              {yacht.description}
            </p>

            {/* Yacht Specifications */}
            <div className="grid grid-cols-2 gap-3 py-3 border-t border-border/50">
              <div className="text-center">
                <p className="text-lg font-cormorant font-semibold text-foreground">
                  {yacht.length ? `${yacht.length}m` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Length
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-cormorant font-semibold text-foreground">
                  {yacht.guests ? `${yacht.guests} guests` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Capacity
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {yacht.sustainabilityScore?.overallScore && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs font-poppins-medium text-muted-foreground">
                      {yacht.sustainabilityScore.overallScore} sustainability
                    </span>
                  </div>
                )}
                {yacht.supplierCount && yacht.supplierCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-poppins-medium text-muted-foreground">
                      {yacht.supplierCount} supplier{yacht.supplierCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {yacht.tags && yacht.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {yacht.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
                {yacht.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    +{yacht.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center text-accent text-sm font-poppins-medium pt-2">
              <span>View yacht profile</span>
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