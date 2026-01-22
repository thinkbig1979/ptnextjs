import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Handshake, Target, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorConsultancyPreviewSectionProps {
  className?: string;
}

const vendorHighlights = [
  {
    icon: Target,
    title: "Proposition Testing",
    description: "Candid evaluation of product positioning and market fit for superyacht projects",
  },
  {
    icon: TrendingUp,
    title: "Market Strategy",
    description: "Guidance on reaching specifiers, shipyards, and project decision-makers",
  },
  {
    icon: Users,
    title: "Platform Visibility",
    description: "Access to project teams through directory listings and curated introductions",
  },
];

/**
 * VendorConsultancyPreviewSection - Homepage preview of vendor consultancy services.
 *
 * Features:
 * - Key value proposition for manufacturers, distributors, and innovators
 * - Three highlight cards showing vendor-focused services
 * - CTA linking to the full vendor consultancy page
 */
export function VendorConsultancyPreviewSection({ className }: VendorConsultancyPreviewSectionProps) {
  return (
    <section
      aria-label="Vendor Consultancy Services Preview"
      className={cn("py-20 md:py-28 bg-background", className)}
    >
      <div className="container max-w-screen-xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            For Industry Suppliers
          </p>
          <h2 className="text-4xl md:text-5xl font-cormorant font-bold mb-6 text-accent">
            Vendor Consultancy
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            For manufacturers, distributors, and technology providers entering or expanding
            in the superyacht market. Practical guidance on positioning, pricing, and market access.
          </p>
        </div>

        {/* Vendor Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {vendorHighlights.map((highlight) => (
            <div
              key={highlight.title}
              className="text-center p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-colors"
            >
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <highlight.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-cormorant font-bold text-accent mb-2">
                {highlight.title}
              </h3>
              <p className="text-muted-foreground font-poppins-light text-sm">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full group"
          >
            <Link href="/consultancy/suppliers">
              View Supplier Services
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default VendorConsultancyPreviewSection;
