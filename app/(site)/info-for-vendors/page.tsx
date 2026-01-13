import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, Layers, Star, Edit3, BarChart } from "lucide-react";
import Image from "next/image";

const tieredStructure = [
  {
    number: 1,
    title: "Free Basic Profile",
    description: "Simple company listing, searchable by category. Self-service onboarding for convenience.",
  },
  {
    number: 2,
    title: "Enhanced Profile",
    description: "Brand story, images, and case highlights (more signal for buyers).",
  },
  {
    number: 3,
    title: "Product Pages",
    description: "Detailed product specs, downloads, product/service assets.",
  },
  {
    number: 4,
    title: "On-Platform Promotion",
    description: "Editorial spotlights, featured placements, and category banners.",
  },
  {
    number: 5,
    title: "Off-Platform Activation",
    description: "Marketing and sales support from PT, including campaigns, roadshows, PR, and direct outreach options.",
  },
];

const premiumOptions = [
  {
    icon: Layers,
    title: "Tiered Listings",
    description: "Subscription fees for enhanced profiles and features",
  },
  {
    icon: Star,
    title: "Featured Placements",
    description: "Premium positioning and sponsored content",
  },
  {
    icon: Edit3,
    title: "Editorial Content",
    description: "Sponsored articles and case studies",
  },
  {
    icon: BarChart,
    title: "Analytics & Leads",
    description: "Performance data insight",
  },
];

const teamLeaders = [
  {
    name: "Roel",
    role: "Sales & Business Development",
    image: "/roel.png",
  },
  {
    name: "Thijs",
    role: "Marketing Strategy & Digital",
    image: "/thijs.png",
  },
  {
    name: "Nigel",
    role: "Relationships & Events",
    image: "/nigel.jpg",
  },
];

export default function InfoForVendorsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Grid className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8">
            Info For Vendors
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Make sure you are a part of our searchable online platform of yacht tech vendors, manufacturers, and solution providers.
          </p>
        </div>

        {/* Team Leadership */}
        <div className="mb-20">
          <div className="bg-secondary/30 rounded-2xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
                Reach Out To Our Commercial Team
              </h2>
            </div>

            <div className="flex justify-center space-x-12">
              {teamLeaders.map((leader) => (
                <div key={`leader-${leader.name}`} className="text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 mx-auto">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-lg font-semibold font-cormorant">{leader.name}</p>
                  <p className="text-sm text-muted-foreground font-poppins-light">
                    {leader.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tiered Platform Structure */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Tiered Platform Structure
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-poppins-light">
              You decide what level of industry visibility you want to achieve, and we work with you to achieve that.
            </p>
          </div>

          <div className="space-y-6">
            {tieredStructure.map((tier) => (
              <Card key={`tier-${tier.title}`} className="hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl mr-6 flex-shrink-0">
                      {tier.number}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-cormorant mb-4">
                        {tier.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-lg font-poppins-light">
                        {tier.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Premium Platform Options */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Premium Platform Options
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {premiumOptions.map((option) => (
              <Card key={`option-${option.title}`} className="hover-lift text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <option.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-cormorant">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm font-poppins-light">
                    {option.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Ready to Get Discovered?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Join the Discovery Platform and connect with yacht technology stakeholders.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Discovery Platform Inquiry">
                Get Started
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}