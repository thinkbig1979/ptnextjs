import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Target, Rocket, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "For Suppliers | Consultancy | Paul Thames",
  description: "Strategic support for manufacturers, distributors, and innovators entering the superyacht market.",
};

const services = [
  {
    icon: Target,
    title: "Business Proposition Testing",
    description: "Validate product-market fit for superyacht sector",
    includes: [
      "Market assessment",
      "Competitive positioning",
      "Pricing strategy",
    ],
    forWhom: "Companies considering entering or expanding in superyacht market",
    outcome: "Clear go/no-go recommendation with supporting analysis",
  },
  {
    icon: Rocket,
    title: "Marketing Strategy & Business Development",
    description: "Go-to-market strategy and execution support",
    includes: [
      "Brand positioning",
      "Channel strategy",
      "Lead generation",
    ],
    forWhom: "Companies ready to actively pursue superyacht opportunities",
    outcome: "Actionable strategy with implementation roadmap",
  },
];

const targetAudience = [
  "Equipment Manufacturers",
  "Technology Providers",
  "Distributors",
  "Startups",
];

export default function ConsultancySuppliersPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="group">
            <Link href="/consultancy">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Consultancy
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8 text-accent">
            For Suppliers
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Strategic support for manufacturers, distributors, and innovators entering the superyacht market.
          </p>
        </div>

        {/* Target Audience */}
        <div className="mb-16 text-center">
          <p className="text-lg text-muted-foreground font-poppins-light mb-6">
            Services designed for:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {targetAudience.map((audience) => (
              <span key={audience} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-poppins-medium">
                {audience}
              </span>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Two focused offerings to help you succeed in the superyacht market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.title} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-cormorant">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  {/* Includes */}
                  <div>
                    <h4 className="font-poppins-medium text-sm text-foreground mb-3 uppercase tracking-wide">
                      Includes
                    </h4>
                    <ul className="space-y-2">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start text-muted-foreground font-poppins-light">
                          <CheckCircle className="w-4 h-4 text-accent mr-2 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* For Whom */}
                  <div>
                    <h4 className="font-poppins-medium text-sm text-foreground mb-2 uppercase tracking-wide">
                      For
                    </h4>
                    <p className="text-muted-foreground font-poppins-light text-sm">
                      {service.forWhom}
                    </p>
                  </div>

                  {/* Outcome */}
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
                    <h4 className="font-poppins-medium text-sm text-accent mb-2 uppercase tracking-wide">
                      Outcome
                    </h4>
                    <p className="text-foreground font-poppins-light text-sm">
                      {service.outcome}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mb-20">
          <div className="bg-muted/30 rounded-2xl p-12 border border-border text-center">
            <h2 className="text-2xl md:text-3xl font-cormorant font-bold mb-6 text-foreground">
              Why Work With Us?
            </h2>
            <p className="text-xl md:text-2xl text-accent font-poppins-light max-w-3xl mx-auto italic">
              &ldquo;Access to industry insights and relationships without full-time commitment.&rdquo;
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Ready to Enter the Superyacht Market?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Contact us to discuss how we can help you reach the superyacht industry.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Supplier Consultancy Inquiry">
                Get in Touch
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
