

import * as React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Radio, Zap, Shield, Lightbulb, Settings } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Compass,
    title: "Navigation Systems",
    description: "Advanced GPS, radar, and chartplotter technologies for precise navigation and positioning.",
  },
  {
    icon: Radio,
    title: "Communication Solutions",
    description: "Satellite communication, Wi-Fi systems, and emergency communication equipment.",
  },
  {
    icon: Zap,
    title: "Entertainment Technology",
    description: "State-of-the-art audio-visual systems, smart cabin controls, and integrated entertainment platforms.",
  },
  {
    icon: Shield,
    title: "Safety Equipment",
    description: "Life-saving equipment, fire suppression systems, and advanced monitoring solutions.",
  },
  {
    icon: Lightbulb,
    title: "Lighting Systems",
    description: "LED lighting solutions, underwater illumination, and smart lighting control systems.",
  },
  {
    icon: Settings,
    title: "Automation & Control",
    description: "Smart yacht automation, HVAC control, and integrated bridge management systems.",
  },
];

export function ServicesOverviewSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-screen-xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-cormorant font-bold mb-4">
            Technology Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Browse vendors by system type or technology category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, _index) => (
            <div key={service.title}>
              <Card className="h-full hover-lift group cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <service.icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="group-hover:text-accent transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription>
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="accent" className="group">
            <Link href="/products">
              Explore All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
