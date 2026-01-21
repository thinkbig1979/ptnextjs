import * as React from "react";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PixelGridBackground } from "@/components/pixel-grid-background";
import { LightingConceptCard } from "@/components/lighting-concept-card";
import { Grid3X3, Layers, Cpu, Anchor, Building2, Hotel, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Lighting | Bespoke Pixel LED Systems | Paul Thames",
  description: "Engineered pixel LED lighting systems for superyachts and high-end architecture. Each pixel individually controlled, designed and built per project.",
};

const coreApproach = [
  {
    icon: Grid3X3,
    title: "Pixel-Level Control",
    description: "Each pixel individually addressable. Thousands of discrete light sources orchestrated together, enabling dynamic scenes and precise atmospheric control.",
  },
  {
    icon: Layers,
    title: "Architectural Integration",
    description: "Lighting that becomes part of the structure. Embedded into architectural elements, invisible during the day, transformative at night.",
  },
  {
    icon: Cpu,
    title: "Intelligent Mapping",
    description: "Advanced control systems translate creative vision into precise pixel behavior, from subtle ambient scenes to dramatic effects.",
  },
];

const capabilities = [
  {
    title: "Custom Pixel Fixtures",
    description: "Bespoke form factors designed for specific applications. LED arrays in custom housings, optimized for integration.",
  },
  {
    title: "Modules & Assemblies",
    description: "Pre-assembled, tested components. Modular building blocks with scalable system architecture.",
  },
  {
    title: "Control-Ready Systems",
    description: "Complete solutions with integrated control interfaces, ready for building system integration.",
  },
];

const applications = [
  {
    icon: Anchor,
    title: "Superyachts",
    description: "Interior and exterior: decks, ceilings, stairs, architectural features. Marine-grade throughout.",
  },
  {
    icon: Building2,
    title: "Architecture",
    description: "Facades, lobbies, statement features. Modular systems with building control integration.",
  },
  {
    icon: Hotel,
    title: "Hospitality",
    description: "Hotels, restaurants, bars. Scene-based control for atmosphere and brand identity.",
  },
  {
    icon: Home,
    title: "Residential",
    description: "High-end homes and private spaces. Discreet integration with intuitive control.",
  },
];

export default function CustomLightingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PixelGridBackground
        variant="prominent"
        as="section"
        aria-label="Custom Lighting Hero"
        className="py-24 md:py-32"
      >
        <div className="container max-w-screen-xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-cormorant font-bold mb-6 text-accent">
              Bespoke Pixel LED Systems
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-poppins-light leading-relaxed">
              Engineered lighting systems, not catalogue fixtures. Designed and built per project
              for superyachts and high-end architecture, interior and exterior.
            </p>
          </div>
        </div>
      </PixelGridBackground>

      {/* Core Approach Section */}
      <section className="py-20">
        <div className="container max-w-screen-xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
              Technical Approach
            </p>
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-accent">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreApproach.map((concept) => (
              <LightingConceptCard
                key={concept.title}
                icon={concept.icon}
                title={concept.title}
                description={concept.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* What We Deliver Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-screen-xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
              Deliverables
            </p>
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-accent mb-4">
              What You Get
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Every component engineered to specification. Direct collaboration with design teams and system integrators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map((capability) => (
              <Card key={capability.title} className="border-accent/10 hover:border-accent/30 transition-colors">
                <CardContent className="p-8">
                  <h3 className="text-xl font-cormorant font-bold text-accent mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-muted-foreground font-poppins-light text-sm">
                    {capability.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-20">
        <div className="container max-w-screen-xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
              Applications
            </p>
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-accent mb-4">
              Where Custom Lighting Fits
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Environments where standard solutions fall short.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {applications.map((app) => (
              <Card key={app.title} className="border-accent/10 hover:border-accent/30 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <app.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-cormorant font-bold text-accent mb-2">
                    {app.title}
                  </h3>
                  <p className="text-muted-foreground font-poppins-light text-sm">
                    {app.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container max-w-screen-xl">
          <PixelGridBackground variant="subtle" className="rounded-2xl overflow-hidden">
            <div className="bg-accent/5 border border-accent/20 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
                Discuss Your Project
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
                Share your requirements and explore how pixel-level control can work for your space.
              </p>
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
                <a href="mailto:info@paulthames.com?subject=Custom Lighting Inquiry">
                  Get in Touch
                </a>
              </Button>
            </div>
          </PixelGridBackground>
        </div>
      </section>
    </div>
  );
}
