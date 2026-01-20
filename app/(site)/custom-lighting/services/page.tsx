import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wrench,
  ArrowLeft,
  Lightbulb,
  Pencil,
  FlaskConical,
  Sliders,
  Truck
} from "lucide-react";

export const metadata: Metadata = {
  title: "Lighting Services | Paul Thames",
  description: "Full-service lighting development for superyachts - from concept and feasibility through engineering, prototyping, control integration, and project coordination.",
};

const serviceStages = [
  {
    number: 1,
    icon: Lightbulb,
    title: "Concept & Feasibility",
    tagline: "Can it be done? Should it?",
    details: [
      "Initial exploration and technical assessment",
      "Constraint identification",
    ],
  },
  {
    number: 2,
    icon: Pencil,
    title: "Engineering & Design",
    tagline: "Technical specification development",
    details: [
      "Detailed design documentation",
      "Integration planning",
    ],
  },
  {
    number: 3,
    icon: FlaskConical,
    title: "Prototyping & Validation",
    tagline: "Make it real, test it",
    details: [
      "Physical prototypes for approval",
      "Performance validation",
    ],
  },
  {
    number: 4,
    icon: Sliders,
    title: "Control Integration",
    tagline: "Mapping, behavior, interfaces",
    details: [
      "Control system configuration",
      "Scene and sequence programming",
    ],
  },
  {
    number: 5,
    icon: Truck,
    title: "Project Coordination",
    tagline: "Delivery without bothering the GC",
    details: [
      "Installation support",
      "Commissioning assistance",
    ],
  },
];

export default function CustomLightingServicesPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="group">
            <Link href="/custom-lighting">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Custom Lighting
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Wrench className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8 text-accent">
            From Concept to Coordination
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Full-service lighting development for projects that demand more than off-the-shelf.
          </p>
        </div>

        {/* Service Timeline */}
        <div className="mb-20">
          <div className="relative">
            {/* Vertical line connector (hidden on mobile, visible on md+) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent/20 -translate-x-1/2" />

            <div className="space-y-8 md:space-y-0">
              {serviceStages.map((stage, index) => {
                const IconComponent = stage.icon;
                const isEven = index % 2 === 0;

                return (
                  <div key={stage.number} className="relative md:flex md:items-center md:min-h-[200px]">
                    {/* Timeline dot (desktop only) */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                      <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-white font-cormorant font-bold text-xl shadow-lg border-4 border-background">
                        {stage.number}
                      </div>
                    </div>

                    {/* Card - alternating sides on desktop */}
                    <div className={`md:w-1/2 ${isEven ? 'md:pr-16' : 'md:ml-auto md:pl-16'}`}>
                      <Card className="hover-lift border-accent/10 hover:border-accent/30 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Mobile number badge */}
                            <div className="md:hidden flex-shrink-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-cormorant font-bold text-lg">
                              {stage.number}
                            </div>

                            {/* Icon */}
                            <div className="hidden md:flex flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg items-center justify-center">
                              <IconComponent className="w-6 h-6 text-accent" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl md:text-2xl font-cormorant font-bold text-foreground mb-1">
                                {stage.title}
                              </h3>
                              <p className="text-accent font-poppins-medium text-sm mb-3">
                                {stage.tagline}
                              </p>
                              <ul className="space-y-1.5">
                                {stage.details.map((detail, detailIndex) => (
                                  <li
                                    key={detailIndex}
                                    className="text-muted-foreground font-poppins-light text-sm flex items-start gap-2"
                                  >
                                    <span className="text-accent mt-1.5 text-xs">&#9679;</span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Ready to Start Your Lighting Project?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Contact us to discuss your custom lighting requirements and discover how we can bring your vision to life.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Lighting Services Inquiry">
                Start a Conversation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
