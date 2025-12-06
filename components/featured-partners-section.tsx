

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { formatVendorLocation } from "@/lib/utils/location";
import type { Vendor } from "@/lib/types";

interface FeaturedPartnersSectionProps {
  featuredPartners: Vendor[];
}

export function FeaturedPartnersSection({ featuredPartners }: FeaturedPartnersSectionProps): React.JSX.Element {

  return (
    <section className="py-20 bg-secondary/30" data-testid="featured-vendors" aria-label="Featured technology partners">
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
          {featuredPartners.map((partner, _index) => (
            <Link key={partner?.id} href={`/vendors/${partner?.slug}`} className="block h-full">
              <Card className="h-full hover-lift cursor-pointer group">
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
                    {partner?.tags?.slice(0, 3).map((tag: string) => (
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
              View All Vendors
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
