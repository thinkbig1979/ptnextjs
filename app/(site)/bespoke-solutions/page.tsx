import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, Search, UserCheck, Zap, Users, Check } from "lucide-react";
import Image from "next/image";

const coreServices = [
  {
    icon: Search,
    title: "Paid Discovery",
    subtitle: "Idea to Feasible Concept",
    description: "Highly focused, solution oriented engagements that define feasibility, risks, and high-level cost models. Deliverables include a Scope & Recommendation document and roadmap for implementation.",
    features: [
      "Feasibility assessment",
      "Risk analysis",
      "Cost modeling",
      "Implementation roadmap"
    ]
  },
  {
    icon: UserCheck,
    title: "Fractional CTO",
    subtitle: "Focused Leadership",
    description: "Monthly retainer providing embedded senior technical leadership, vendor selection, architecture guidance, and ongoing oversight.",
    features: [
      "Senior technical leadership",
      "Vendor selection guidance",
      "Architecture oversight",
      "Ongoing project monitoring"
    ]
  },
  {
    icon: Zap,
    title: "Fast Pilot / Prototype",
    subtitle: "Making It Real",
    description: "Practical prototypes to validate assumptions and de-risk project rollout. Milestone-based delivery with 30–50% upfront payment.",
    features: [
      "Rapid prototyping",
      "Assumption validation",
      "Risk reduction",
      "Milestone-based delivery"
    ]
  },
  {
    icon: Users,
    title: "Specialist Matchmaking",
    subtitle: "Who To Work With?",
    description: "PT connects vetted product and service vendors to projects, coordinating introductions but not handling invoicing. Compensation is negotiated directly between client and specialist.",
    features: [
      "Curated specialist network",
      "Direct negotiation",
      "Quality vetting process",
      "Ongoing coordination"
    ]
  }
];

export default function BespokeSolutionsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Compass className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8">
            Expertise & Bespoke Solutions
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Founder-led, delivery-oriented services providing senior technical leadership, scoped discovery work, and fast pilots with access to our curated PT Collective.
          </p>
        </div>

        {/* Technical Leadership */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Led by Our Technical Founder
            </h2>
          </div>

          <div className="flex justify-center">
            <Card className="max-w-md hover-lift">
              <CardHeader className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6">
                  <Image
                    src="/edwin.png"
                    alt="Edwin"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-2xl font-cormorant">Edwin</CardTitle>
                <CardDescription className="text-lg text-accent font-poppins-medium">
                  Technical Founder / CTO
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground font-poppins-light">
                  Ensuring technical rigour and continuity from concept to delivery
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Services */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Core Services
            </h2>
          </div>

          <div className="space-y-8">
            {coreServices.map((service) => (
              <Card key={`service-${service.title}`} className="hover-lift">
                <CardContent className="p-8">
                  <div className="md:flex md:items-start md:space-x-8">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6 md:mb-0 flex-shrink-0">
                      <service.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <CardTitle className="text-2xl font-cormorant mb-2 md:mb-0">
                          {service.title}
                        </CardTitle>
                        <Badge className="bg-accent text-white hover:bg-accent/90 self-start">
                          {service.subtitle}
                        </Badge>
                      </div>
                      <CardDescription className="text-muted-foreground text-lg mb-6 font-poppins-light">
                        {service.description}
                      </CardDescription>
                      <ul className="space-y-2">
                        {service.features.map((feature) => (
                          <li key={`${service.title}-${feature}`} className="flex items-center">
                            <Check className="w-4 h-4 text-accent mr-3 flex-shrink-0" />
                            <span className="text-muted-foreground font-poppins-light">{feature}</span>
                          </li>
                        ))}
                      </ul>
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
              Need Expert Technical Leadership?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Let&apos;s discuss how our bespoke solutions can accelerate your yacht technology project.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Bespoke Solutions Inquiry">
                Start a Conversation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}