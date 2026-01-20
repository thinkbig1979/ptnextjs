import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PixelGridBackground } from "@/components/pixel-grid-background";
import { ArrowRight, Grid3X3, Layers, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomLightingPreviewSectionProps {
  className?: string;
}

const highlights = [
  {
    icon: Grid3X3,
    title: "Pixel Control",
    description: "Each pixel individually addressable",
  },
  {
    icon: Layers,
    title: "Architectural Integration",
    description: "Lighting that becomes part of the structure",
  },
  {
    icon: Cpu,
    title: "Intelligent Systems",
    description: "Advanced mapping and behavior control",
  },
];

/**
 * CustomLightingPreviewSection - A prominent homepage section showcasing
 * the custom lighting capability with pixel grid visual effects.
 *
 * Features:
 * - PixelGridBackground in prominent variant for visual impact
 * - "Systems, Not Fixtures" messaging aligned with custom-lighting page
 * - Three highlight cards showing core capabilities
 * - CTA linking to the full custom-lighting page
 */
export function CustomLightingPreviewSection({ className }: CustomLightingPreviewSectionProps) {
  return (
    <PixelGridBackground
      variant="prominent"
      as="section"
      aria-label="Custom Lighting Preview"
      className={cn("py-20 md:py-28", className)}
    >
      <div className="container max-w-screen-xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            Bespoke Engineering
          </p>
          <h2 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            Systems, Not Fixtures
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Fully bespoke, engineered pixel LED lighting systems for high-end architectural
            and superyacht environments. Each pixel individually controlled, integrated into architecture.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {highlights.map((highlight) => (
            <div
              key={highlight.title}
              className="text-center p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-colors"
            >
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
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
            <Link href="/custom-lighting">
              Explore Custom Lighting
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </PixelGridBackground>
  );
}

export default CustomLightingPreviewSection;
