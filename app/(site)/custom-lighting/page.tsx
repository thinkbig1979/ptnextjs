import * as React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PixelGridBackground } from '@/components/pixel-grid-background';
import { LightingConceptCard } from '@/components/lighting-concept-card';
import { Grid3X3, Layers, Cpu, Anchor, Building2, Hotel, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Creative Lighting Solutions | Paul Thames',
  description:
    "Pixel-based fixtures, custom content, and complete programming for superyachts and high-end architecture. When traditional lighting won't do.",
};

const coreApproach = [
  {
    icon: Grid3X3,
    title: 'Bespoke Fixtures',
    description:
      'Pixel-based fixtures custom-designed for each project. Form factors, materials, and pixel density tailored to the application.',
  },
  {
    icon: Layers,
    title: 'Custom Content',
    description:
      'Animations, scenes, and behaviors designed to bring fixtures to life. From subtle ambience to dramatic effects.',
  },
  {
    icon: Cpu,
    title: 'Full Programming',
    description:
      'Complete system integration and control. Ready to work with building management systems and user interfaces.',
  },
];

const capabilities = [
  {
    title: 'Bespoke Fixtures',
    description:
      'Custom form factors designed for specific applications. Housings, optics, and materials optimized for each project.',
  },
  {
    title: 'Content Creation',
    description:
      'Custom animations, scenes, and dynamic behaviors. Visual storytelling through light.',
  },
  {
    title: 'Programming & Integration',
    description:
      'Complete control system programming. Building management and user interface integration.',
  },
];

const applications = [
  {
    icon: Anchor,
    title: 'Superyachts',
    description:
      'Interior and exterior: decks, ceilings, stairs, architectural features. Marine-grade throughout.',
  },
  {
    icon: Building2,
    title: 'Architecture',
    description:
      'Facades, lobbies, statement features. Modular systems with building control integration.',
  },
  {
    icon: Hotel,
    title: 'Hospitality',
    description:
      'Hotels, restaurants, bars. Scene-based control for atmosphere and brand identity.',
  },
  {
    icon: Home,
    title: 'Residential',
    description: 'High-end homes and private spaces. Discreet integration with intuitive control.',
  },
];

const showcaseImages = [
  {
    src: '/media/creative-lighting/bar-with-dj.webp',
    alt: 'LED pixel lighting in a yacht bar area with DJ booth',
    title: 'Bar & Entertainment',
  },
  {
    src: '/media/creative-lighting/exterioir-sofa.webp',
    alt: 'Exterior sofa area with ambient pixel lighting',
    title: 'Exterior Lounges',
  },
  {
    src: '/media/creative-lighting/gangway.webp',
    alt: 'Yacht gangway with integrated LED lighting',
    title: 'Gangways',
  },
  {
    src: '/media/creative-lighting/table.webp',
    alt: 'Custom illuminated table with pixel LED integration',
    title: 'Custom Furniture',
  },
];

export default function CustomLightingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PixelGridBackground
        variant="prominent"
        as="section"
        aria-label="Creative Lighting Hero"
        className="py-24 md:py-32"
      >
        <div className="container max-w-screen-xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-cormorant font-bold mb-6 text-accent">
              Creative Lighting Solutions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-poppins-light leading-relaxed">
              Pixel-based fixtures with custom content and complete programming for superyachts and
              high-end architecture. Pixel-level control enables effects traditional lighting can't
              achieve.
            </p>
          </div>
        </div>
      </PixelGridBackground>

      {/* Image Showcase */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-screen-xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
              Project Examples
            </p>
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-accent">
              Creative Lighting in Action
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {showcaseImages.map((image) => (
              <div
                key={image.src}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-poppins-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              Every component engineered to specification. Direct collaboration with design teams
              and system integrators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map((capability) => (
              <Card
                key={capability.title}
                className="border-accent/10 hover:border-accent/30 transition-colors"
              >
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
              Where Creative Lighting Fits
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Environments where traditional lighting falls short.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {applications.map((app) => (
              <Card
                key={app.title}
                className="border-accent/10 hover:border-accent/30 transition-colors"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <app.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-cormorant font-bold text-accent mb-2">{app.title}</h3>
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
                Share your requirements and explore how creative lighting can work for your project.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full"
              >
                <a href="mailto:info@paulthames.com?subject=Creative Lighting Inquiry">
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
