import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TimelineVisualization, TimelinePhase } from "@/components/timeline-visualization";
import { ArrowRight, Lightbulb, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsultancyPreviewSectionProps {
  className?: string;
}

const projectPhases: TimelinePhase[] = [
  { name: "Concept", description: "Initial ideas and requirements", active: true },
  { name: "Design", description: "Architecture and specifications", active: true },
  { name: "Build", description: "Construction and integration", active: false },
  { name: "Deliver", description: "Commissioning and handover", active: false },
];

const audienceCards = [
  {
    icon: Users,
    title: "For Clients",
    subtitle: "Demand Side",
    description: "Specification review, creation, and on-demand support for Owners, Designers, and Shipyards.",
  },
  {
    icon: Building2,
    title: "For Suppliers",
    subtitle: "Supply Side",
    description: "Business proposition testing and market strategy for Manufacturers and Innovators.",
  },
];

/**
 * ConsultancyPreviewSection - Homepage preview of the consultancy services.
 *
 * Features:
 * - Key value proposition: "Where change is still affordable"
 * - TimelineVisualization showing where PT adds value (early phases)
 * - Two audience cards (Clients & Suppliers)
 * - CTA linking to the full consultancy page
 */
export function ConsultancyPreviewSection({ className }: ConsultancyPreviewSectionProps) {
  return (
    <section
      aria-label="Consultancy Services Preview"
      className={cn("py-20 md:py-28 bg-secondary/30", className)}
    >
      <div className="container max-w-screen-xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            Decision-Point Support
          </p>
          <h2 className="text-4xl md:text-5xl font-cormorant font-bold mb-6 text-accent">
            Consultancy Services
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Lightweight, owner-aligned consultancy delivering clarity early — before change becomes expensive.
          </p>
        </div>

        {/* Key Message Banner */}
        <div className="mb-16">
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 md:p-8 text-center max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl font-cormorant font-bold text-accent">
              &ldquo;Where change is still affordable&rdquo;
            </p>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-cormorant font-bold mb-3">
              Where We Add Value
            </h3>
            <p className="text-muted-foreground font-poppins-light">
              Supporting early project phases when decisions matter most.
            </p>
          </div>
          <TimelineVisualization
            phases={projectPhases}
            activeLabel="We support here"
          />
        </div>

        {/* Audience Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          {audienceCards.map((card) => (
            <div
              key={card.title}
              className="text-center p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-colors"
            >
              <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <card.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-cormorant font-bold text-accent mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground font-poppins-medium uppercase tracking-wider mb-3">
                {card.subtitle}
              </p>
              <p className="text-muted-foreground font-poppins-light text-sm">
                {card.description}
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
            <Link href="/consultancy">
              Explore Consultancy Services
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ConsultancyPreviewSection;
