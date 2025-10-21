

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { Partner } from "@/lib/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatVendorLocation } from "@/lib/utils/location";

interface FeaturedPartnersSectionProps {
  featuredPartners: Partner[];
}

export function FeaturedPartnersSection({ featuredPartners }: FeaturedPartnersSectionProps) {
  // Take first 6 partners from the passed data
  const displayPartners = featuredPartners.slice(0, 6);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container max-w-screen-xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-cormorant font-bold mb-4">
            Featured Technology Partners
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Discover our carefully curated selection of leading superyacht technology providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPartners.map((partner, _index) => (
            <Link key={partner?.id} href={`/vendors/${partner?.slug}`} className="block h-full">
              <Card className="h-full hover-lift cursor-pointer group overflow-hidden">
                {/* Partner Image */}
                <OptimizedImage
                  src={partner?.image}
                  alt={`${partner?.name} company overview`}
                  fallbackType="partner"
                  aspectRatio="video"
                  fill
                  className="group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-accent" />
                    </div>
                    <Badge variant="secondary">{partner?.category}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-accent transition-colors">
                    {partner?.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {partner?.description}
                  </CardDescription>
                </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {partner?.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>Est. {partner?.founded}</span>
                      <span>{formatVendorLocation(partner?.location)}</span>
                    </div>
                    <div className="flex items-center text-accent text-sm font-medium group-hover:text-accent/80 transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="accent" className="group">
            <Link href="/vendors">
              View All Partners
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
