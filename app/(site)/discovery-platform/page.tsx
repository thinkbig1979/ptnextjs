import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock, Users, FileText, MessageCircle, TrendingUp, Anchor, Settings, Wrench, Compass } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const platformFeatures = [
  {
    icon: Filter,
    title: "Vetted Solutions",
    description: "Access to pre-qualified vendors and products that meet yacht industry standards.",
  },
  {
    icon: Clock,
    title: "Fast Discovery",
    description: "Find what you need quickly with smart search, detailed filtering, and categorized listings tailored to yacht projects.",
  },
  {
    icon: Users,
    title: "Industry Expertise",
    description: "Benefit from Paul Thames' deep market knowledge and connections, ensuring you find solutions that actually work for yachting.",
  },
  {
    icon: FileText,
    title: "Detailed Information",
    description: "Access comprehensive product specs, case studies, technical documentation, and real project examples from each vendor.",
  },
  {
    icon: MessageCircle,
    title: "Direct Connection",
    description: "Connect directly with vendors or get introductions through Paul Thames for more complex requirements and partnerships.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Stay updated with the latest trends, new products, and emerging technologies in the yacht tech space.",
  },
];

const targetAudience = [
  {
    icon: Anchor,
    title: "Yacht Owners",
    description: "Find trusted technology solutions for your vessel upgrades and new builds.",
  },
  {
    icon: Settings,
    title: "Shipyards",
    description: "Discover the latest marine technologies and systems for your projects.",
  },
  {
    icon: Wrench,
    title: "Integrators",
    description: "Source specialized products and find expert partners for complex installations.",
  },
  {
    icon: Compass,
    title: "Project Managers",
    description: "Efficiently source solutions and manage vendor relationships for yacht projects.",
  },
];

const discoveryNavigation = [
  {
    title: "Partners",
    description: "Explore our network of vetted technology partners and their capabilities",
    href: "/vendors",
    icon: Users,
  },
  {
    title: "Vendors",
    description: "Browse our comprehensive directory of marine technology vendors",
    href: "/vendors",
    icon: Settings,
  },
  {
    title: "Products & Services",
    description: "Discover products and services categorized by yacht technology domains",
    href: "/products",
    icon: Wrench,
  },
  {
    title: "Yachts",
    description: "View yacht profiles showcasing technology implementations and case studies",
    href: "/yachts",
    icon: Anchor,
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

export default function DiscoveryPlatformPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8">
            Discovery Platform
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 font-poppins-light">
            Find the right yacht technology vendors, products, and services for your project.
          </p>
        </div>

        {/* Team Leadership - Moved to top */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Led By Our Commercial Team
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

        {/* Platform Value Proposition */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Why Use the Discovery Platform?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature) => (
              <Card key={`feature-${feature.title}`} className="hover-lift text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-cormorant">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-poppins-light">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Perfect For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {targetAudience.map((audience) => (
              <Card key={`audience-${audience.title}`} className="hover-lift text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <audience.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-cormorant">{audience.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm font-poppins-light">
                    {audience.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Discovery Platform Navigation - Moved to bottom */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Explore Our Discovery Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Navigate through our comprehensive platform to find exactly what you need for your yacht technology project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {discoveryNavigation.map((item) => (
              <Card key={`nav-${item.title}`} className="hover-lift group">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                      <item.icon className="w-8 h-8 text-accent group-hover:text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-cormorant">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="font-poppins-light">
                    {item.description}
                  </CardDescription>
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white">
                    <Link href={item.href}>Explore {item.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}