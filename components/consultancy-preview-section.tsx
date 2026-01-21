import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TimelineVisualization, TimelinePhase } from "@/components/timeline-visualization";
import { ArrowRight, ClipboardCheck, FileSearch, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsultancyPreviewSectionProps {
  className?: string;
}

const projectPhases: TimelinePhase[] = [
  { name: "Concept", description: "Initial ideas and requirements", active: true, primary: true },
  { name: "Design", description: "Architecture and specifications", active: true, primary: true },
  { name: "Build", description: "Construction and integration", active: true },
  { name: "Deliver", description: "Commissioning and handover", active: true },
];

const serviceHighlights = [
  {
    icon: FileSearch,
    title: "Specification Review",
    description: "Independent analysis of technical specifications and equipment choices",
  },
  {
    icon: Settings,
    title: "Specification Creation",
    description: "Developing clear, unbiased specifications for complex systems",
  },
  {
    icon: MessageSquare,
    title: "On-Demand Support",
    description: "Technical guidance at critical decision points throughout the project",
  },
];

/**
 * ConsultancyPreviewSection - Homepage preview of the project consultancy services.
 *
 * Features:
 * - Key value proposition: "Where change is still affordable"
 * - TimelineVisualization showing where PT adds value (early phases)
 * - Three service highlight cards for project teams
 * - CTA linking to the full consultancy page
 */
export function ConsultancyPreviewSection({ className }: ConsultancyPreviewSectionProps) {
  return (
    <section
      aria-label="Project Consultancy Services Preview"
      className={cn("py-20 md:py-28 bg-secondary/30", className)}
    >
      <div className="container max-w-screen-xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            For Project Teams
          </p>
          <h2 className="text-4xl md:text-5xl font-cormorant font-bold mb-6 text-accent">
            Technical Project Consultancy
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Decision support for owners, designers, and shipyards. Independent technical guidance
            when clarity matters most, before change becomes expensive.
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
              Project Support at Every Stage
            </h3>
            <p className="text-muted-foreground font-poppins-light">
              The earlier we&apos;re involved, the greater the impact. But we can step in at any stage.
            </p>
          </div>
          <TimelineVisualization
            phases={projectPhases}
            activeLabel="Greatest impact here"
          />
        </div>

        {/* Service Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {serviceHighlights.map((highlight) => (
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
            <Link href="/consultancy/clients">
              View Client Services
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ConsultancyPreviewSection;
