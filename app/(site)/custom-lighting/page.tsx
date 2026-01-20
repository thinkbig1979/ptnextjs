import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PixelGridBackground } from "@/components/pixel-grid-background";
import { LightFieldGradient } from "@/components/light-field-gradient";
import { LightingConceptCard } from "@/components/lighting-concept-card";
import { ArrowRight, Grid3X3, Layers, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Lighting | Systems, Not Fixtures | Paul Thames",
  description: "Fully bespoke, engineered pixel LED lighting systems for high-end architectural and superyacht environments. Each pixel individually controlled, integrated into architecture.",
};

const coreConcepts = [
  {
    icon: Grid3X3,
    title: "Pixels as Addressable Elements",
    description: "Each pixel individually controlled. Thousands of discrete light sources orchestrated in perfect harmony, enabling infinite possibilities for dynamic scenes and atmospheric control.",
  },
  {
    icon: Layers,
    title: "Integration into Architecture",
    description: "Lighting becomes part of the structure itself. Seamlessly embedded into architectural elements, our systems disappear during the day and reveal their magic at night.",
  },
  {
    icon: Cpu,
    title: "Control & Mapping Behavior",
    description: "Intelligent lighting that responds. Advanced mapping and control systems translate creative vision into precise pixel behavior, from subtle ambient scenes to dramatic effects.",
  },
];

const navigationLinks = [
  {
    title: "Products",
    description: "Pixel LED profiles, drivers, and control systems engineered for demanding environments.",
    href: "/custom-lighting/products",
  },
  {
    title: "Services",
    description: "Design consultation, system engineering, installation support, and commissioning.",
    href: "/custom-lighting/services",
  },
  {
    title: "Applications",
    description: "Superyacht interiors, architectural facades, hospitality spaces, and beyond.",
    href: "/custom-lighting/applications",
  },
];

export default function CustomLightingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with PixelGridBackground */}
      <PixelGridBackground
        variant="prominent"
        as="section"
        aria-label="Custom Lighting Hero"
        className="py-24 md:py-32"
      >
        <div className="container max-w-screen-xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-cormorant font-bold mb-6 text-accent">
              Systems, Not Fixtures
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-poppins-light leading-relaxed">
              Fully bespoke, engineered pixel LED lighting systems for high-end architectural and superyacht environments.
            </p>
          </div>
        </div>
      </PixelGridBackground>

      {/* Core Concepts Section */}
      <section className="py-20">
        <div className="container max-w-screen-xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
              Core Principles
            </p>
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-accent">
              The Foundation of Our Approach
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreConcepts.map((concept) => (
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

      {/* Navigation Links Section with LightFieldGradient */}
      <LightFieldGradient
        position="center"
        intensity="soft"
        as="section"
        className="py-20"
      >
        <div className="container max-w-screen-xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
              Explore
            </p>
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-accent mb-2">
              Not a Catalogue. A Capability.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Discover how our integrated approach delivers lighting systems that transcend conventional solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group block">
                <Card className="h-full border-accent/10 hover:border-accent/30 transition-colors bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-cormorant font-bold text-accent mb-3 group-hover:text-accent/80 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground font-poppins-light mb-6">
                      {link.description}
                    </p>
                    <span className="inline-flex items-center text-accent font-poppins-medium text-sm group-hover:translate-x-1 transition-transform">
                      Explore
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </LightFieldGradient>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container max-w-screen-xl">
          <PixelGridBackground variant="subtle" className="rounded-2xl overflow-hidden">
            <div className="bg-accent/5 border border-accent/20 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
                Ready to Illuminate Your Vision?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
                Let&apos;s discuss your project requirements and explore how pixel-level control can transform your space.
              </p>
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
                <a href="mailto:info@paulthames.com?subject=Custom Lighting Inquiry">
                  Start a Conversation
                </a>
              </Button>
            </div>
          </PixelGridBackground>
        </div>
      </section>
    </div>
  );
}
