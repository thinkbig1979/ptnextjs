import * as React from "react";
import { Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import Image from "next/image";
import { PixelGridBackground } from "@/components/pixel-grid-background";
import { LightFieldGradient } from "@/components/light-field-gradient";

interface FounderData {
  name: string;
  role: string;
  image?: string;
  avatar?: string;
}

interface PillarData {
  title: string;
  subtitle: string;
  description: string;
  founders: FounderData[];
  ctaText: string;
  ctaUrl: string;
  features?: string[];
}

interface TwoPillarHeroProps {
  introTitle?: string;
  introDescription?: string;
  leftPillar: PillarData;
  rightPillar: PillarData;
  heroImage?: string;
  logo?: string;
  className?: string;
}

export function TwoPillarHero({
  introTitle = "Marine Technology Excellence",
  introDescription = "Amsterdam's premier marine technology consultancy offering two distinct pathways to superyacht innovation",
  leftPillar,
  rightPillar,
  heroImage,
  logo,
  className,
}: TwoPillarHeroProps) {
  return (
    <PixelGridBackground
      variant="prominent"
      as="section"
      aria-label="Two Pillar Hero"
      className={cn("relative min-h-screen flex items-center justify-center overflow-hidden", className)}
    >
      {/* Hero Background Image - rendered below the pixel grid */}
      {heroImage && (
        <div className="absolute inset-0 -z-10 opacity-30">
          <Image
            src={heroImage}
            alt="" // Decorative background image
            fill
            className="object-cover"
            priority
            aria-hidden="true"
          />
        </div>
      )}

      {/* Light Field Gradient Overlay - adds ambient glow effect */}
      <LightFieldGradient
        position="center"
        intensity="soft"
        className="absolute inset-0 pointer-events-none"
      />

      {/* Secondary Light Field for depth - positioned right */}
      <LightFieldGradient
        position="right"
        intensity="subtle"
        className="absolute inset-0 pointer-events-none"
      />

      <div className="container max-w-screen-xl px-4 py-20 relative z-10">
        <div className="text-center space-y-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            {logo ? (
              <Image
                src={logo}
                alt="Paul Thames Logo"
                width={400}
                height={200}
                className="h-32 w-auto object-contain"
                priority
              />
            ) : (
              <Logo size="6xl" priority />
            )}
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-cormorant font-bold tracking-tight">
              {introTitle.split(' ').slice(0, 2).join(' ')}
              <span className="block text-accent">{introTitle.split(' ').slice(2).join(' ')}</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-poppins-light leading-relaxed">
              {introDescription}
            </p>
          </div>

          {/* Our Two Pillars Section */}
          <div className="mt-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-cormorant font-bold text-center mb-12 text-accent">
              Our Two Pillars
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Pillar */}
            <PillarSection pillar={leftPillar} icon={<Search className="w-8 h-8 text-accent" />} />

            {/* Right Pillar */}
            <PillarSection pillar={rightPillar} icon={<Settings className="w-8 h-8 text-accent" />} />
            </div>
          </div>
        </div>
      </div>
    </PixelGridBackground>
  );
}

interface PillarSectionProps {
  pillar: PillarData;
  icon: React.ReactNode;
}

function PillarSection({ pillar, icon }: PillarSectionProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-accent/10 hover:border-accent/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
          {icon}
        </div>

        <h3 className="text-3xl md:text-4xl font-cormorant font-bold text-primary text-center">
          {pillar.title}
        </h3>

        <p className="text-lg text-muted-foreground font-poppins-light leading-relaxed text-center">
          {pillar.description}
        </p>

        {/* Decorative border */}
        <div className="border-b-2 border-dotted border-border w-24 mx-auto mb-6"></div>

        {/* Founder Team */}
        <div className="flex justify-center space-x-6 mb-6">
          {pillar.founders.map((founder) => (
            <div key={`founder-${founder.name}`} className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2 mx-auto">
                {founder.image ? (
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-semibold text-lg">
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{founder.name}</p>
            </div>
          ))}
        </div>

        {/* Decorative border */}
        <div className="border-b-2 border-dotted border-border w-48 mx-auto mb-6"></div>

        {/* Features List - Only show if features exist */}
        {pillar.features && pillar.features.length > 0 && (
          <ul className="space-y-3 text-left">
            {pillar.features.map((feature) => (
              <li key={`feature-${feature}`} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}