import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimelineVisualization } from '@/components/timeline-visualization';
import { ClipboardCheck, FileText, CheckSquare, Headphones, ArrowRight, Quote } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Project Consultancy | Technical Advisory for Superyacht Projects',
  description:
    'Technical clarity for owners, designers, and shipyards at critical decision points. Specification review, creation, and on-demand support for superyacht projects.',
};

const projectPhases = [
  { name: 'Concept', description: 'Initial ideas and requirements', active: true, primary: true },
  { name: 'Design', description: 'Architecture and specifications', active: true, primary: true },
  { name: 'Build', description: 'Construction and integration', active: true },
  { name: 'Deliver', description: 'Commissioning and handover', active: true },
];

const services = [
  {
    icon: ClipboardCheck,
    title: 'Specification Review',
    what: 'Audit existing specifications for gaps, ambiguities, and risks',
    who: 'Anyone with existing specs needing validation',
    when: 'Before going to tender',
  },
  {
    icon: FileText,
    title: 'Specification Creation',
    what: 'Build technical specifications from requirements',
    who: 'Projects starting without formal specs',
    when: 'Early design phase',
  },
  {
    icon: CheckSquare,
    title: 'Proposal Review',
    what: 'Evaluate vendor proposals against specifications',
    who: 'Procurement decisions',
    when: 'Tender evaluation phase',
  },
  {
    icon: Headphones,
    title: 'On-Demand Support',
    what: 'Technical guidance during build',
    who: 'Projects needing expert input without full-time commitment',
    when: 'Throughout build phase',
  },
];

const targetAudience = ['Yacht Owners', 'Interior Designers', 'Shipyards', 'Project Managers'];

export default function ConsultancyClientsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Consultancy', href: '/consultancy/clients' },
          { label: 'Project Clients', href: '/consultancy/clients' },
        ]} />

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            For Project Teams
          </p>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            Technical Project Consultancy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Decision support for owners, designers, and shipyards. Independent technical guidance
            when clarity matters most, before change becomes expensive.
          </p>
        </div>

        {/* Key Message Banner */}
        <div className="mb-20">
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 md:p-12 text-center">
            <p className="text-2xl md:text-3xl font-cormorant font-bold text-accent mb-4">
              &ldquo;Where change is still affordable&rdquo;
            </p>
            <p className="text-lg text-muted-foreground font-poppins-light max-w-2xl mx-auto">
              Early project phases where decisions have the biggest impact and corrections cost the
              least.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Support at Every Stage
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              The earlier the involvement, the greater the impact. But support is available at any
              stage.
            </p>
          </div>
          <TimelineVisualization phases={projectPhases} activeLabel="Greatest impact here" />
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

        {/* Services Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Services
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card
                key={service.title}
                className="h-full border-accent/10 hover:border-accent/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <service.icon className="w-7 h-7 text-accent" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-cormorant text-accent">
                      {service.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-foreground font-poppins-medium text-sm min-w-[4rem]">
                        What:
                      </span>
                      <span className="text-muted-foreground font-poppins-light text-base ml-2">
                        {service.what}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-foreground font-poppins-medium text-sm min-w-[4rem]">
                        For:
                      </span>
                      <span className="text-muted-foreground font-poppins-light text-base ml-2">
                        {service.who}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-foreground font-poppins-medium text-sm min-w-[4rem]">
                        When:
                      </span>
                      <span className="text-muted-foreground font-poppins-light text-base ml-2">
                        {service.when}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Client Testimonial */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Client Feedback
            </h2>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8 md:p-12">
            <Quote className="w-10 h-10 text-accent/30 mb-6" />

            <div className="space-y-6">
              <blockquote className="text-lg md:text-xl font-poppins-light text-foreground/90 leading-relaxed">
                His knowledge and advice on choosing the best equipment for our application was
                invaluable. Edwin has a deep well of knowledge, not only on the marketplace of this
                type of equipment, but also the equipment itself and the best and most effective
                method of integration.
              </blockquote>

              <blockquote className="text-lg md:text-xl font-poppins-light text-foreground/90 leading-relaxed">
                Due to some rather challenging changes in supply company project managers, Edwin
                handled and managed these changes in a very professional and calm manner, still
                ensuring that the finished project would meet the high standards required.
              </blockquote>

              <p className="text-xl md:text-2xl font-cormorant font-bold text-accent italic">
                &ldquo;In a nutshell, Edwin is a good chap who knows what he is talking
                about.&rdquo;
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-accent/10">
              <p className="font-poppins-medium text-foreground">Klaus Waibel</p>
              <p className="text-sm text-muted-foreground font-poppins-light">
                Captain / Owner&apos;s Representative &mdash; Project 823, Feadship Royal Van Lent
                Shipyard
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/testimonials"
              className="text-accent hover:text-accent/80 font-poppins-medium text-sm inline-flex items-center gap-2 transition-colors"
            >
              Read more client testimonials
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Link to Suppliers */}
        <div className="mb-20">
          <div className="bg-secondary/30 rounded-2xl p-8 border border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-cormorant font-bold text-foreground mb-2">
                  Looking for vendor consultancy?
                </h3>
                <p className="text-muted-foreground font-poppins-light">
                  Services for manufacturers, distributors, and technology providers.
                </p>
              </div>
              <Button asChild variant="outline" className="group whitespace-nowrap">
                <Link href="/consultancy/suppliers">
                  View Supplier Services
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
              Discuss Your Project
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Share your requirements and timeline. No obligation.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full"
            >
              <a href="mailto:info@paulthames.com?subject=Project Consultancy Inquiry">
                Get in Touch
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
