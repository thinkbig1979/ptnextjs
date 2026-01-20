import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Anchor, Building2, Hotel, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Lighting Applications | Paul Thames",
  description: "Where custom lighting matters - applications where standard solutions fall short. Superyacht interiors, architectural installations, hospitality, and residential.",
};

interface ApplicationArea {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  challenge: string;
  approach: string;
  geometricElement: React.ReactNode;
}

const applicationAreas: ApplicationArea[] = [
  {
    icon: Anchor,
    title: "Superyacht Interiors",
    description: "Ceilings, stairs, architectural features",
    challenge: "Space constraints, motion, environment",
    approach: "Marine-grade, custom form factors",
    geometricElement: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="absolute w-16 h-16 border-2 border-accent/30 rounded-full" />
        <div className="absolute w-24 h-24 border border-accent/20 rounded-full" />
        <div className="absolute w-8 h-8 bg-accent/10 rounded-full" />
        <div className="absolute w-1 h-12 bg-accent/40 rotate-45 translate-x-4" />
        <div className="absolute w-1 h-12 bg-accent/40 -rotate-45 -translate-x-4" />
      </div>
    ),
  },
  {
    icon: Building2,
    title: "Architectural Installations",
    description: "Facades, lobbies, statement features",
    challenge: "Scale, integration, building systems",
    approach: "Modular systems, control integration",
    geometricElement: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="absolute w-20 h-20 border-2 border-accent/30" />
        <div className="absolute w-14 h-14 border border-accent/20 rotate-45" />
        <div className="absolute w-8 h-8 bg-accent/10" />
        <div className="absolute w-28 h-px bg-accent/30 -translate-y-8" />
        <div className="absolute w-28 h-px bg-accent/30 translate-y-8" />
      </div>
    ),
  },
  {
    icon: Hotel,
    title: "Hospitality",
    description: "Hotels, restaurants, bars",
    challenge: "Atmosphere, brand identity, maintenance",
    approach: "Scene-based control, serviceability",
    geometricElement: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="absolute w-6 h-6 bg-accent/20 rounded-full -translate-x-8 -translate-y-4" />
        <div className="absolute w-8 h-8 bg-accent/15 rounded-full translate-x-4 -translate-y-2" />
        <div className="absolute w-4 h-4 bg-accent/25 rounded-full -translate-x-2 translate-y-6" />
        <div className="absolute w-10 h-10 bg-accent/10 rounded-full translate-x-6 translate-y-4" />
        <div className="absolute w-5 h-5 bg-accent/30 rounded-full -translate-x-10 translate-y-2" />
        <div className="absolute w-24 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>
    ),
  },
  {
    icon: Home,
    title: "Residential",
    description: "High-end homes, private spaces",
    challenge: "Subtlety, personalization, longevity",
    approach: "Discreet integration, intuitive control",
    geometricElement: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="absolute w-16 h-12 border-2 border-accent/30 rounded-t-lg -translate-y-2" />
        <div className="absolute w-20 h-px bg-accent/40 translate-y-4" />
        <div className="absolute w-3 h-6 bg-accent/20 translate-y-1" />
        <div className="absolute w-1 h-8 bg-accent/30 -translate-x-6 translate-y-1" />
        <div className="absolute w-1 h-8 bg-accent/30 translate-x-6 translate-y-1" />
      </div>
    ),
  },
];

export default function CustomLightingApplicationsPage() {
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
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            Where Custom Lighting Matters
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Applications where standard solutions fall short.
          </p>
        </div>

        {/* Application Areas Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {applicationAreas.map((area) => (
            <Card key={area.title} className="overflow-hidden">
              <CardHeader className="pb-2">
                {/* Geometric Element */}
                <div className="mb-4">
                  {area.geometricElement}
                </div>

                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <area.icon className="w-5 h-5 text-accent" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl">{area.title}</CardTitle>
                </div>

                {/* Description */}
                <p className="text-muted-foreground font-poppins-light text-base pl-[52px]">
                  {area.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Challenge */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-poppins-medium text-foreground mb-1">
                    The Challenge
                  </p>
                  <p className="text-muted-foreground font-poppins-light">
                    {area.challenge}
                  </p>
                </div>

                {/* Approach */}
                <div className="bg-accent/5 border border-accent/10 rounded-lg p-4">
                  <p className="text-sm font-poppins-medium text-accent mb-1">
                    Our Approach
                  </p>
                  <p className="text-muted-foreground font-poppins-light">
                    {area.approach}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Have a Specific Application in Mind?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Every project presents unique challenges. Let us understand yours.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Custom Lighting Application Inquiry">
                Start a Conversation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
