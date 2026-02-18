import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ClipboardCheck, Handshake, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { PixelGridBackground } from '@/components/pixel-grid-background';
import { LightFieldGradient } from '@/components/light-field-gradient';

interface ServiceCardData {
  icon: React.ReactNode;
  title: string;
  audienceTag: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
}

interface ThreeServiceHeroProps {
  headline?: string;
  intro?: string;
  services?: ServiceCardData[];
  heroImage?: string;
  className?: string;
}

const defaultServices: ServiceCardData[] = [
  {
    icon: <Sparkles className="w-7 h-7 text-accent" />,
    title: 'Creative Lighting',
    audienceTag: 'Bespoke Fixtures & Programming',
    description:
      "Pixel-based fixtures, custom content, and full programming for projects where traditional lighting won't do",
    ctaText: 'Learn More',
    ctaUrl: '/custom-lighting',
  },
  {
    icon: <ClipboardCheck className="w-7 h-7 text-accent" />,
    title: 'Project Consultancy',
    audienceTag: 'For Project Teams',
    description: 'Experienced guidance and practical advice where it counts',
    ctaText: 'Learn More',
    ctaUrl: '/consultancy/clients',
  },
  {
    icon: <Handshake className="w-7 h-7 text-accent" />,
    title: 'Supplier Consultancy',
    audienceTag: 'For Industry Vendors',
    description: 'Market positioning and access to decision makers and qualified specifiers',
    ctaText: 'Learn More',
    ctaUrl: '/consultancy/suppliers',
  },
];

export function ThreeServiceHero({
  headline = 'Experience and Expertise, Applied',
  intro = 'Bringing practical services and solutions to projects and vendors in the superyacht and high-end architecture industries.',
  services = defaultServices,
  heroImage = '/heroimagePT-min.png',
  className,
}: ThreeServiceHeroProps) {
  return (
    <PixelGridBackground
      variant="prominent"
      as="section"
      aria-label="Hero Section"
      className={cn(
        'relative min-h-screen flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Hero Background Image */}
      {heroImage && (
        <div className="absolute inset-0 -z-10 opacity-30">
          <Image src={heroImage} alt="Paul Thames superyacht technology hero background" fill className="object-cover" priority aria-hidden="true" />
        </div>
      )}

      {/* Light Field Gradient Overlays */}
      <LightFieldGradient
        position="center"
        intensity="soft"
        className="absolute inset-0 pointer-events-none"
      />
      <LightFieldGradient
        position="right"
        intensity="subtle"
        className="absolute inset-0 pointer-events-none"
      />

      <div className="container max-w-screen-xl px-4 py-20 relative z-10">
        <div className="text-center space-y-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="6xl" priority />
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-cormorant font-bold tracking-tight">
              <span className="text-primary">Experience and Expertise, </span>
              <span className="block text-accent">Applied</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-poppins-light leading-relaxed">
              {intro}
            </p>
          </div>

          {/* Three Service Cards */}
          <div className="mt-16">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {services.map((service) => (
                <ServiceCard key={service.title} service={service} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PixelGridBackground>
  );
}

interface ServiceCardProps {
  service: ServiceCardData;
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-accent/10 hover:border-accent/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
      {/* Icon */}
      <div
        className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto mb-4"
        aria-hidden="true"
      >
        {service.icon}
      </div>

      {/* Audience Tag */}
      <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-2 text-center">
        {service.audienceTag}
      </p>

      {/* Title */}
      <h2 className="text-2xl lg:text-3xl font-cormorant font-bold text-primary text-center mb-4">
        {service.title}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground font-poppins-light leading-relaxed text-center mb-6 flex-grow">
        {service.description}
      </p>

      {/* CTA Button */}
      <div className="text-center mt-auto">
        <Button
          asChild
          variant="outline"
          className="border-accent/30 hover:border-accent hover:bg-accent/10 text-accent font-medium rounded-full group"
        >
          <Link href={service.ctaUrl}>
            {service.ctaText}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default ThreeServiceHero;
