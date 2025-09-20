import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface FounderData {
  name: string;
  role: string;
  avatar?: string;
}

interface PillarData {
  title: string;
  subtitle: string;
  description: string;
  founders: FounderData[];
  ctaText: string;
  ctaUrl: string;
  features: string[];
}

interface TwoPillarHeroProps {
  introTitle?: string;
  introDescription?: string;
  leftPillar: PillarData;
  rightPillar: PillarData;
  className?: string;
}

export function TwoPillarHero({
  introTitle = "Marine Technology Excellence",
  introDescription = "Amsterdam's premier marine technology consultancy offering two distinct pathways to superyacht innovation",
  leftPillar,
  rightPillar,
  className,
}: TwoPillarHeroProps) {
  return (
    <section className={cn("relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background to-muted/20", className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary blur-3xl"></div>
      </div>

      <div className="container max-w-screen-xl px-4 py-20 relative z-10">
        <div className="text-center space-y-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="6xl" priority />
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

          {/* Two Pillars Section */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mt-16">
            {/* Left Pillar */}
            <PillarSection pillar={leftPillar} icon={<Search className="w-8 h-8 text-accent" />} />

            {/* Right Pillar */}
            <PillarSection pillar={rightPillar} icon={<Settings className="w-8 h-8 text-accent" />} />
          </div>
        </div>
      </div>
    </section>
  );
}

interface PillarSectionProps {
  pillar: PillarData;
  icon: React.ReactNode;
}

function PillarSection({ pillar, icon }: PillarSectionProps) {
  return (
    <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          {icon}
        </div>

        <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-primary text-center">
          {pillar.title}
        </h2>

        <p className="text-lg text-muted-foreground font-poppins-light leading-relaxed text-center">
          {pillar.description}
        </p>

        {/* Founder Team */}
        <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
          <p className="text-sm font-medium text-accent/80 mb-3">
            {pillar.founders.length === 1 ? "Led by our technical director:" : "Led by our founders:"}
          </p>
          <div className={cn(
            pillar.founders.length === 1 ? "flex justify-center" : "grid grid-cols-1 sm:grid-cols-3 gap-3"
          )}>
            {pillar.founders.map((founder, index) => (
              <div key={index} className="bg-card/50 rounded-lg p-4 border border-accent/20 hover:border-accent/40 transition-colors min-w-[120px]">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-semibold text-lg">
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{founder.name.split(' ')[0]}</p>
                    <p className="text-xs text-muted-foreground">{founder.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-3 text-left">
          {pillar.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-4 px-6 rounded-lg transition-colors group">
          {pillar.ctaText}
          <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}