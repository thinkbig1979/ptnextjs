import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Users,
  Building2,
  ArrowRight,
  FileSearch,
  FileText,
  MessageSquare,
  Headphones,
  Target,
  TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "Consultancy Services | Paul Thames",
  description: "Decision-point support services for the superyacht industry. Lightweight, owner-aligned consultancy delivering clarity early - before change becomes expensive.",
};

const clientServices = [
  { name: "Specification Review", icon: FileSearch },
  { name: "Specification Creation", icon: FileText },
  { name: "Proposal Review", icon: MessageSquare },
  { name: "On-Demand Support", icon: Headphones },
];

const supplierServices = [
  { name: "Business Proposition Testing", icon: Target },
  { name: "Marketing Strategy & BD", icon: TrendingUp },
];

const projectPhases = [
  { name: "Concept", description: "Initial ideas and requirements", active: true },
  { name: "Design", description: "Architecture and specifications", active: true },
  { name: "Build", description: "Construction and integration", active: false },
  { name: "Deliver", description: "Commissioning and handover", active: false },
];

const teamLeads = [
  {
    name: "Edwin",
    role: "Technical Lead",
    description: "Technical strategy and specification expertise",
  },
  {
    name: "Roel",
    role: "Commercial Lead",
    description: "Market positioning and business development",
  },
];

export default function ConsultancyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Lightbulb className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            Decision-Point Support Services
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 font-poppins-light leading-relaxed">
            Lightweight, owner-aligned consultancy delivering clarity early — before change becomes expensive.
          </p>
        </div>

        {/* Key Message Banner */}
        <div className="mb-20">
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 md:p-12 text-center">
            <p className="text-2xl md:text-3xl font-cormorant font-bold text-accent mb-4">
              &ldquo;Where change is still affordable&rdquo;
            </p>
            <p className="text-lg text-muted-foreground font-poppins-light max-w-2xl mx-auto">
              Our services focus on early project phases where decisions have the biggest impact and corrections cost the least.
            </p>
          </div>
        </div>

        {/* Project Timeline Visualization */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Where We Add Value
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Our consultancy services are designed to support you during the early phases when decisions matter most.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {projectPhases.map((phase, index) => (
                <div key={phase.name} className="relative text-center">
                  {/* Phase indicator */}
                  <div className={`
                    w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center relative z-10
                    ${phase.active
                      ? 'bg-accent text-white ring-4 ring-accent/20'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <span className="text-lg font-bold">{index + 1}</span>
                  </div>
                  <h3 className={`text-xl font-cormorant font-bold mb-2 ${phase.active ? 'text-accent' : 'text-muted-foreground'}`}>
                    {phase.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-poppins-light">
                    {phase.description}
                  </p>
                  {phase.active && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-poppins-medium rounded-full">
                        We support here
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two Paths Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Two Paths to Clarity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Whether you are specifying requirements or positioning products, we bring focused expertise to your decision points.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Clients (Demand Side) */}
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mr-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-cormorant">For Clients</CardTitle>
                    <p className="text-sm text-muted-foreground font-poppins-light">Demand Side</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-muted-foreground font-poppins-light text-base">
                  Services for Owners, Designers, and Shipyards who need clear specifications and informed decisions.
                </CardDescription>

                {/* Services List */}
                <div className="space-y-3">
                  {clientServices.map((service) => (
                    <div key={service.name} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <service.icon className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-sm font-poppins-medium">{service.name}</span>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white group">
                  <Link href="/consultancy/clients">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* For Suppliers (Supply Side) */}
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mr-4">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-cormorant">For Suppliers</CardTitle>
                    <p className="text-sm text-muted-foreground font-poppins-light">Supply Side</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-muted-foreground font-poppins-light text-base">
                  Services for Manufacturers, Distributors, and Innovators entering or expanding in the superyacht market.
                </CardDescription>

                {/* Services List */}
                <div className="space-y-3">
                  {supplierServices.map((service) => (
                    <div key={service.name} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <service.icon className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-sm font-poppins-medium">{service.name}</span>
                    </div>
                  ))}
                </div>

                {/* Spacer to align buttons */}
                <div className="h-[76px]" />

                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white group">
                  <Link href="/consultancy/suppliers">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Your Consultancy Team
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            {teamLeads.map((lead) => (
              <div key={lead.name} className="text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-cormorant font-bold text-accent">{lead.name[0]}</span>
                </div>
                <h3 className="text-xl font-cormorant font-bold mb-1">{lead.name}</h3>
                <p className="text-accent font-poppins-medium mb-2">{lead.role}</p>
                <p className="text-sm text-muted-foreground font-poppins-light max-w-xs mx-auto">
                  {lead.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Ready for Clarity?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Let&apos;s discuss how we can support your decision points — before change becomes expensive.
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
