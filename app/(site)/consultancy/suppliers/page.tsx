import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  TrendingUp,
  Eye,
  Flag,
  CheckCircle,
  ArrowRight,
  UserCheck,
  Building2,
  Network,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vendor Consultancy | Market Access for Marine Technology',
  description:
    'Market access and visibility for manufacturers, distributors, and technology providers in the superyacht industry. Proposition testing, market strategy, and directory listings.',
};

const services = [
  {
    icon: Target,
    title: 'Proposition Testing',
    description: 'Validate product-market fit for superyacht sector',
    includes: ['Market assessment', 'Competitive positioning', 'Pricing strategy review'],
    forWhom: 'Companies considering entering or expanding in superyacht market',
    outcome: 'Clear go/no-go recommendation with supporting analysis',
  },
  {
    icon: TrendingUp,
    title: 'Market Strategy',
    description: 'Go-to-market planning and execution support',
    includes: ['Brand positioning', 'Channel strategy', 'Lead generation approach'],
    forWhom: 'Companies ready to pursue superyacht opportunities',
    outcome: 'Actionable strategy with implementation roadmap',
  },
  {
    icon: Eye,
    title: 'Platform Visibility',
    description: 'Reach decision-makers through the industry directory',
    includes: ['Vendor profile listing', 'Product showcases', 'Featured placements'],
    forWhom: 'Companies wanting visibility with specifiers, designers, and project managers',
    outcome: 'Direct exposure to qualified project teams',
  },
  {
    icon: Flag,
    title: 'Waving the Flag',
    description: 'Ongoing market presence and brand visibility',
    includes: [
      'Exposure to 10k+ industry decision makers',
      'Inclusion in content, events, and sales meetings',
      'Regular reporting and direct outreach',
    ],
    forWhom: 'Companies wanting consistent visibility without building their own network',
    outcome: 'Sustained brand presence and warm introductions',
  },
];

const targetAudience = [
  'Equipment Manufacturers',
  'Technology Providers',
  'Distributors',
  'Startups',
];

const networkStats = [
  {
    icon: UserCheck,
    value: '21',
    label: 'Sales Agents',
    description: 'Across major yachting markets',
  },
  {
    icon: Building2,
    value: 'Direct',
    label: 'Yard Access',
    description: 'Contacts at every major shipyard',
  },
  {
    icon: Network,
    value: 'Global',
    label: 'Hub Network',
    description: 'Presence in all yachting hubs',
  },
];

export default function ConsultancySuppliersPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            For Industry Suppliers
          </p>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            Vendor Consultancy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            For manufacturers, distributors, and technology providers entering or expanding in the
            superyacht market. Practical guidance on positioning, pricing, and market access.
          </p>
        </div>

        {/* Target Audience */}
        <div className="mb-16 text-center">
          <div className="flex flex-wrap justify-center gap-3">
            {targetAudience.map((audience) => (
              <span
                key={audience}
                className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-poppins-medium"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>

        {/* Network Stats */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Our Network
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Direct access to decision-makers across the superyacht industry.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {networkStats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl bg-accent/5 border border-accent/20"
              >
                <div
                  className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3"
                  aria-hidden="true"
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-cormorant font-bold text-accent mb-1">{stat.value}</p>
                <p className="text-sm font-poppins-medium text-foreground mb-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground font-poppins-light">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Services
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service) => (
              <Card
                key={service.title}
                className="flex flex-col h-full border-accent/10 hover:border-accent/30 transition-colors"
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="w-7 h-7 text-accent" />
                  </div>
                  <CardTitle className="text-xl font-cormorant text-accent">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  {/* Includes */}
                  <div>
                    <h4 className="font-poppins-medium text-sm text-foreground mb-3">Includes</h4>
                    <ul className="space-y-2">
                      {service.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-start text-muted-foreground font-poppins-light text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* For Whom */}
                  <div>
                    <h4 className="font-poppins-medium text-sm text-foreground mb-2">For</h4>
                    <p className="text-muted-foreground font-poppins-light text-sm">
                      {service.forWhom}
                    </p>
                  </div>

                  {/* Outcome */}
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
                    <h4 className="font-poppins-medium text-sm text-accent mb-2">Outcome</h4>
                    <p className="text-foreground font-poppins-light text-sm">{service.outcome}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Note */}
        <div className="mb-20">
          <div className="bg-secondary/30 rounded-2xl p-8 border border-border text-center">
            <p className="text-xl text-muted-foreground font-poppins-light max-w-3xl mx-auto">
              Industry insights and relationships without full-time overhead. Candid feedback on
              what works in this market and what doesn&apos;t.
            </p>
          </div>
        </div>

        {/* Link to Clients */}
        <div className="mb-20">
          <div className="bg-secondary/30 rounded-2xl p-8 border border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-cormorant font-bold text-foreground mb-2">
                  Looking for project consultancy?
                </h3>
                <p className="text-muted-foreground font-poppins-light">
                  Services for yacht owners, designers, and shipyards.
                </p>
              </div>
              <Button asChild variant="outline" className="group whitespace-nowrap">
                <Link href="/consultancy/clients">
                  View Project Services
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Discuss Your Goals
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Share your product and target market. No obligation.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full"
            >
              <a href="mailto:info@paulthames.com?subject=Vendor Consultancy Inquiry">
                Get in Touch
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
