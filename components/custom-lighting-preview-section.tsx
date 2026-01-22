import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PixelGridBackground } from '@/components/pixel-grid-background';
import { ArrowRight, Grid3X3, Layers, Cpu, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomLightingPreviewSectionProps {
  className?: string;
}

const highlights = [
  {
    icon: Grid3X3,
    title: 'Bespoke Fixtures',
    description: "Custom-designed for each project's unique requirements",
  },
  {
    icon: Layers,
    title: 'Custom Content',
    description: 'Animations and scenes designed to bring fixtures to life',
  },
  {
    icon: Cpu,
    title: 'Full Programming',
    description: 'Complete system integration and control',
  },
];

/**
 * CustomLightingPreviewSection - A prominent homepage section showcasing
 * the creative lighting capability with pixel grid visual effects.
 *
 * Features:
 * - PixelGridBackground in prominent variant for visual impact
 * - Clear messaging about creative lighting solutions
 * - Three highlight cards showing core capabilities: fixtures, content, programming
 * - CTA linking to the full custom-lighting page
 */
export function CustomLightingPreviewSection({ className }: CustomLightingPreviewSectionProps) {
  return (
    <PixelGridBackground
      variant="prominent"
      as="section"
      aria-label="Creative Lighting Preview"
      className={cn('py-20 md:py-28', className)}
    >
      <div className="container max-w-screen-xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
            aria-hidden="true"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            Beyond Traditional Lighting
          </p>
          <h2 className="text-4xl md:text-5xl font-cormorant font-bold mb-6 text-accent">
            Creative Lighting Solutions
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Pixel-based fixtures with custom content and complete programming for superyachts and
            high-end architecture. When traditional lighting won't do.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {highlights.map((highlight) => (
            <div
              key={highlight.title}
              className="text-center p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-colors"
            >
              <div
                className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
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
              See How It Works
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </PixelGridBackground>
  );
}

export default CustomLightingPreviewSection;
