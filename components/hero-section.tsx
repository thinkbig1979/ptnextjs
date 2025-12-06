

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Ship, Zap } from "lucide-react";
import Link from "next/link";
import { HeroClient } from "./hero-client";
import type { CompanyInfo } from "@/lib/types";

const stats = [
  { icon: Users, label: "Partner Companies", value: 50, suffix: "+" },
  { icon: Ship, label: "Yachts Equipped", value: 200, suffix: "+" },
  { icon: Zap, label: "Technology Solutions", value: 500, suffix: "+" },
];

interface HeroSectionProps {
  companyInfo?: CompanyInfo;
}

export function HeroSection({ companyInfo }: HeroSectionProps): React.JSX.Element {

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden" aria-label="Hero section">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary blur-3xl"></div>
      </div>

      <div className="container max-w-screen-xl px-4 py-20 relative z-10">
        <div className="text-center space-y-8">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <HeroClient />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-cormorant font-bold tracking-tight">
              Superyacht Technology
              <span className="block text-accent">Excellence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
              {companyInfo?.description || "Amsterdam's premier superyacht technology consultancy, connecting discerning yacht owners with cutting-edge marine technology solutions."}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="accent" className="group">
              <Link href="/vendors">
                Explore Vendors
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Learn Our Story</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-20 border-t border-border/50">
            {stats.map((stat, _index) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-cormorant font-bold">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-muted-foreground font-poppins-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
