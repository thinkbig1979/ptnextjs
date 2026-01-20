import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Package, Wrench, Layout, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Lighting Solutions | Paul Thames",
  description: "Bespoke lighting solutions for superyachts, combining cutting-edge LED technology with maritime-grade engineering for exceptional onboard ambiance.",
};

const lightingSections = [
  {
    icon: Package,
    title: "Products",
    description: "Explore our range of custom lighting products designed specifically for the marine environment.",
    href: "/custom-lighting/products",
  },
  {
    icon: Wrench,
    title: "Services",
    description: "From design consultation to installation and commissioning, we support every stage of your lighting project.",
    href: "/custom-lighting/services",
  },
  {
    icon: Layout,
    title: "Applications",
    description: "Discover how our lighting solutions enhance different areas of superyacht interiors and exteriors.",
    href: "/custom-lighting/applications",
  },
];

export default function CustomLightingPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Lightbulb className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8 text-accent">
            Custom Lighting Solutions
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Bespoke lighting solutions for superyachts, combining cutting-edge LED technology with maritime-grade engineering for exceptional onboard ambiance.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent font-poppins-medium">
            Coming Soon
          </div>
          <p className="mt-4 text-muted-foreground font-poppins-light">
            Full custom lighting portfolio details are being prepared.
          </p>
        </div>

        {/* Section Categories */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Explore Our Lighting Expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              From product selection to installation, we deliver complete lighting solutions tailored to your vessel.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {lightingSections.map((section) => (
              <Card key={section.title} className="hover-lift">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <section.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-cormorant">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <CardDescription className="text-muted-foreground font-poppins-light text-base">
                    {section.description}
                  </CardDescription>
                  <Button asChild variant="outline" className="group">
                    <Link href={section.href}>
                      Explore
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Illuminate Your Vision
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Contact us to discuss custom lighting solutions for your superyacht project.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Custom Lighting Inquiry">
                Start a Conversation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
