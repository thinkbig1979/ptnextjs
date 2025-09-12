import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FounderCard } from "@/components/founder-card";
import { ArrowRight, Users, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface FounderData {
  name: string;
  role: string;
  avatar?: string;
  specialties?: string[];
  description?: string;
}

interface ValueProposition {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PillarData {
  title: string;
  subtitle: string;
  description: string;
  founders: FounderData[];
  ctaText: string;
  ctaUrl: string;
  valuePropositions?: ValueProposition[];
}

interface TwoPillarHeroProps {
  introTitle?: string;
  introDescription?: string;
  leftPillar: PillarData;
  rightPillar: PillarData;
  className?: string;
}

export function TwoPillarHero({
  introTitle = "Paul Thames Superyacht Technology",
  introDescription = "Pioneering innovation in marine technology with two distinct service pillars designed to elevate the superyacht industry.",
  leftPillar,
  rightPillar,
  className,
}: TwoPillarHeroProps) {
  return (
    <section className={cn("py-16 px-4 bg-gradient-to-br from-background to-muted/20", className)}>
      <div className="container mx-auto max-w-7xl">
        {/* Intro Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-cormorant">
            {introTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-poppins-light">
            {introDescription}
          </p>
        </div>

        {/* Two-Pillar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Pillar */}
          <PillarSection pillar={leftPillar} side="left" />
          
          {/* Right Pillar */}
          <PillarSection pillar={rightPillar} side="right" />
        </div>
      </div>
    </section>
  );
}

interface PillarSectionProps {
  pillar: PillarData;
  side: "left" | "right";
}

function PillarSection({ pillar, side }: PillarSectionProps) {
  return (
    <Card className="h-full flex flex-col border-2 hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-6">
        <CardTitle className="text-3xl font-bold mb-2 font-cormorant">
          {pillar.title}
        </CardTitle>
        <p className="text-lg text-primary font-medium font-poppins">
          {pillar.subtitle}
        </p>
        <p className="text-muted-foreground leading-relaxed font-poppins-light">
          {pillar.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-8">
        {/* Founders Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold font-cormorant">
              Leadership Team
            </h3>
          </div>
          <div className={cn(
            "grid gap-4",
            pillar.founders.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
          )}>
            {pillar.founders.map((founder, index) => (
              <FounderCard
                key={index}
                name={founder.name}
                role={founder.role}
                avatar={founder.avatar}
                specialties={founder.specialties}
                description={founder.description}
                className="w-full max-w-none"
              />
            ))}
          </div>
        </div>

        {/* Value Propositions */}
        {pillar.valuePropositions && pillar.valuePropositions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold font-cormorant">
                Key Capabilities
              </h3>
            </div>
            <div className="space-y-4">
              {pillar.valuePropositions.map((prop, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <div className="text-primary mt-1 flex-shrink-0">
                    {prop.icon}
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 font-poppins">
                      {prop.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-poppins-light">
                      {prop.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-6">
          <Button 
            className="w-full h-12 text-base font-medium group" 
            size="lg"
          >
            <span>{pillar.ctaText}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}