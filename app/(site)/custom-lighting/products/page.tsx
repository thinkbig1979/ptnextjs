import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Grid3X3, Boxes, Settings2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Lighting Products | Paul Thames",
  description: "Engineered lighting components and systems designed per project. Custom pixel fixtures, modules, assemblies, and control-ready systems for superyacht applications.",
};

const productCategories = [
  {
    icon: Grid3X3,
    title: "Custom Pixel Fixtures",
    description: "Bespoke form factors designed for specific applications",
    features: [
      "LED arrays in custom housings",
      "Optimized for integration into architecture",
      "Project-specific dimensions and specifications",
    ],
  },
  {
    icon: Boxes,
    title: "Custom Modules & Assemblies",
    description: "Integration-ready components for complex installations",
    features: [
      "Modular building blocks",
      "Pre-assembled and tested",
      "Scalable system architecture",
    ],
  },
  {
    icon: Settings2,
    title: "Control-Ready Systems",
    description: "Complete lighting solutions with integrated control",
    features: [
      "Hardware + control interfaces",
      "Ready for building system integration",
      "End-to-end commissioning support",
    ],
  },
];

export default function CustomLightingProductsPage() {
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
            <Package className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8 text-accent">
            Custom Lighting Products
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Engineered components and systems, designed per project.
          </p>
        </div>

        {/* Pixel Grid Accent - Decorative Element */}
        <div className="mb-16 flex justify-center">
          <div className="grid grid-cols-8 gap-1 opacity-20">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-accent rounded-sm"
                style={{ opacity: Math.random() * 0.5 + 0.5 }}
              />
            ))}
          </div>
        </div>

        {/* Product Categories */}
        <div className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {productCategories.map((category) => (
              <Card key={category.title} className="relative overflow-hidden">
                {/* Subtle pixel grid accent in background */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-full aspect-square bg-accent rounded-sm" />
                    ))}
                  </div>
                </div>

                <CardHeader className="text-center relative">
                  <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-10 h-10 text-accent" />
                  </div>
                  <CardTitle className="text-2xl font-cormorant text-foreground">
                    {category.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground font-poppins-light text-base text-center">
                    {category.description}
                  </CardDescription>

                  {/* Technical Features List */}
                  <ul className="space-y-2 pt-4 border-t border-border">
                    {category.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-muted-foreground font-poppins-light"
                      >
                        <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Note */}
        <div className="mb-20">
          <div className="bg-muted/30 rounded-2xl p-8 md:p-12 border border-border">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center shrink-0">
                <Grid3X3 className="w-8 h-8 text-accent" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-cormorant font-bold mb-3 text-foreground">
                  Engineering-First Approach
                </h3>
                <p className="text-muted-foreground font-poppins-light">
                  Every product is engineered to specification. We work directly with design teams and system integrators to ensure seamless integration with your project requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Discuss Your Project Requirements
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Contact us to explore custom lighting products for your application.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Custom Lighting Products Inquiry">
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
