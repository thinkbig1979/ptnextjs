import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Building2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Consultancy Services | Paul Thames",
  description: "Expert consultancy services for the superyacht industry, connecting yacht owners and suppliers with specialized technical expertise.",
};

const consultancyServices = [
  {
    icon: Users,
    title: "For Clients",
    description: "Demand-side services for yacht owners, shipyards, and project managers seeking expert technical guidance.",
    href: "/consultancy/clients",
  },
  {
    icon: Building2,
    title: "For Suppliers",
    description: "Supply-side services for manufacturers and integrators looking to enter or expand in the superyacht market.",
    href: "/consultancy/suppliers",
  },
];

export default function ConsultancyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Briefcase className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8 text-accent">
            Consultancy Services
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Expert technical consultancy for the superyacht industry, bridging the gap between innovative technology and maritime excellence.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent font-poppins-medium">
            Coming Soon
          </div>
          <p className="mt-4 text-muted-foreground font-poppins-light">
            Full consultancy service details are being prepared.
          </p>
        </div>

        {/* Service Categories */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Our Consultancy Approach
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Tailored services for both demand and supply sides of the superyacht technology ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {consultancyServices.map((service) => (
              <Card key={service.title} className="hover-lift">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mr-4">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-cormorant">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground font-poppins-light text-base">
                    {service.description}
                  </CardDescription>
                  <Button asChild variant="outline" className="group">
                    <Link href={service.href}>
                      Learn More
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
              Interested in Our Consultancy Services?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Contact us to discuss how we can support your superyacht technology projects.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Consultancy Inquiry">
                Get in Touch
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
