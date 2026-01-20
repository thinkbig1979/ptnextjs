import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, ClipboardCheck, FileText, CheckSquare, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Consultancy for Clients | Paul Thames",
  description: "Technical clarity for owners, designers, and shipyards at critical decision points. Expert consultancy services for superyacht technology specifications and project support.",
};

const clientServices = [
  {
    icon: ClipboardCheck,
    title: "Specification Review & Improvement",
    what: "Audit existing specifications for gaps, ambiguities, and risks",
    who: "Anyone with existing specs needing validation",
    when: "Before going to tender",
  },
  {
    icon: FileText,
    title: "Specification Creation",
    what: "Build technical specifications from requirements",
    who: "Projects starting without formal specs",
    when: "Early design phase",
  },
  {
    icon: CheckSquare,
    title: "Proposal / Compliance Review",
    what: "Evaluate vendor proposals against specifications",
    who: "Procurement decisions",
    when: "Tender evaluation phase",
  },
  {
    icon: Headphones,
    title: "On-Demand Project Support",
    what: "Technical guidance during build",
    who: "Projects needing expert input without full-time commitment",
    when: "Throughout build phase",
  },
];

export default function ConsultancyClientsPage() {
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
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8 text-accent">
            For Clients
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Technical clarity for owners, designers, and shipyards at critical decision points.
          </p>
        </div>

        {/* Target Audience */}
        <div className="mb-16 text-center">
          <div className="flex flex-wrap justify-center gap-3">
            {["Yacht Owners", "Interior Designers", "Shipyards", "Project Managers"].map((audience) => (
              <span key={audience} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-poppins-medium">
                {audience}
              </span>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-8">
            {clientServices.map((service) => (
              <Card key={service.title} className="h-full">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-cormorant">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-accent font-poppins-medium text-sm min-w-[4rem]">What:</span>
                      <span className="text-muted-foreground font-poppins-light text-base ml-2">{service.what}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-accent font-poppins-medium text-sm min-w-[4rem]">For:</span>
                      <span className="text-muted-foreground font-poppins-light text-base ml-2">{service.who}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-accent font-poppins-medium text-sm min-w-[4rem]">When:</span>
                      <span className="text-muted-foreground font-poppins-light text-base ml-2">{service.when}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Need Technical Guidance?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Contact us to discuss your superyacht technology requirements.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Client Consultancy Inquiry">
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
