import * as React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About Us | Paul Thames',
  description:
    'Edwin Edelenbos and Roel van der Zwet bring 25+ combined years in superyacht technology. Technical depth meets commercial expertise.',
};

const edwinExperience = [
  '18+ years in superyacht AV/IT, lighting, and control systems',
  'MSc Industrial Design Engineering, TU Delft',
  'Former Manager of Innovation at Oceanco',
  'Former CTO at Van Berge Henegouwen',
  'Project Lead on multiple Feadship newbuilds',
  "Owner's team representative on refit and newbuild projects",
];

const roelExperience = [
  '15+ years in commercial leadership and business development',
  'MBA, University of Amsterdam',
  'Former Managing Director at YachtCloud (8 years)',
  'Former Global Segment Manager Marine at Nexans',
  'Co-Founder of Diagram (asset management technology)',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
        ]} />

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            About Us
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Technical depth meets commercial expertise. Two founders with complementary backgrounds,
            a shared network, and a clear view of what this industry needs.
          </p>
        </div>

        {/* The Story */}
        <div className="mb-20">
          <div className="bg-secondary/30 rounded-2xl p-8 md:p-12 border border-border">
            <h2 className="text-2xl md:text-3xl font-cormorant font-bold mb-6 text-accent">
              Why Paul Thames Exists
            </h2>
            <div className="space-y-4 text-muted-foreground font-poppins-light leading-relaxed">
              <p>
                After years working across shipyards, integrators, and technology suppliers, we kept
                seeing the same pattern: projects struggling not because the technology was wrong,
                but because the right expertise wasn&apos;t connected to the right people at the
                right time.
              </p>
              <p>
                Owners&apos; teams needed independent guidance. Shipyards needed specialists they
                could trust. Suppliers needed access to decision-makers. The industry had all the
                pieces, but too much friction in bringing them together.
              </p>
              <p>
                Paul Thames exists to reduce that friction. We bring technical credibility,
                commercial relationships, and enough experience to know what actually works in
                superyacht projects.
              </p>
            </div>
          </div>
        </div>

        {/* Founders */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-accent">
              Who We Are
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Edwin */}
            <Card className="border-accent/10">
              <CardContent className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-accent/20">
                    <Image
                      src="/edwin.png"
                      alt="Edwin Edelenbos"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-cormorant font-bold text-accent mb-1">
                      Edwin Edelenbos
                    </h3>
                    <p className="text-muted-foreground font-poppins-medium">Technical Partner</p>
                  </div>
                </div>

                <div className="space-y-4 text-muted-foreground font-poppins-light mb-6">
                  <p>
                    Edwin has spent nearly two decades designing and delivering AV/IT, lighting, and
                    control systems for superyachts. His career spans hands-on project management at
                    Van Berge Henegouwen, innovation leadership at Oceanco, and project lead roles
                    on Feadship newbuilds.
                  </p>
                  <p>
                    Beyond his time with integrators and shipyards, Edwin has also worked directly
                    on owner&apos;s teams, representing owner interests on both refit and newbuild
                    projects. This gives him first-hand understanding of what owners actually need
                    from their technical advisors.
                  </p>
                  <p>
                    He specialises in system architecture, technical analysis, and translating
                    complex requirements into solutions that actually work. His engineering
                    background (MSc from TU Delft) combined with real project experience means he
                    can work across disciplines, from design teams to shipyards to owners&apos;
                    representatives.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-poppins-medium text-foreground mb-3">Background</h4>
                  <ul className="space-y-2">
                    {edwinExperience.map((item) => (
                      <li
                        key={item}
                        className="flex items-start text-sm text-muted-foreground font-poppins-light"
                      >
                        <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Roel */}
            <Card className="border-accent/10">
              <CardContent className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-accent/20">
                    <Image
                      src="/roel.png"
                      alt="Roel van der Zwet"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-cormorant font-bold text-accent mb-1">
                      Roel van der Zwet
                    </h3>
                    <p className="text-muted-foreground font-poppins-medium">Commercial Partner</p>
                  </div>
                </div>

                <div className="space-y-4 text-muted-foreground font-poppins-light mb-6">
                  <p>
                    Roel brings 15+ years of commercial leadership, including eight years at
                    YachtCloud where he grew from Commercial Director to Managing Director. Before
                    yachting, he held global commercial roles at Nexans and built experience across
                    B2B sales, marketing strategy, and business development.
                  </p>
                  <p>
                    His strength is connecting people and companies, understanding what suppliers
                    need to reach the market and what project teams need to find the right partners.
                    His MBA from the University of Amsterdam provides the strategic foundation; his
                    years in the industry provide the relationships and market knowledge.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-poppins-medium text-foreground mb-3">Background</h4>
                  <ul className="space-y-2">
                    {roelExperience.map((item) => (
                      <li
                        key={item}
                        className="flex items-start text-sm text-muted-foreground font-poppins-light"
                      >
                        <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What We Bring */}
        <div className="mb-20">
          <div className="bg-accent/5 rounded-2xl p-8 md:p-12 border border-accent/20">
            <h2 className="text-2xl md:text-3xl font-cormorant font-bold mb-6 text-accent text-center">
              What This Combination Means
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-lg font-cormorant font-bold text-foreground mb-2">
                  Technical Credibility
                </h3>
                <p className="text-sm text-muted-foreground font-poppins-light">
                  Deep system knowledge from years on actual yacht projects. We understand the
                  technical realities, not just the brochures.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-cormorant font-bold text-foreground mb-2">
                  Industry Relationships
                </h3>
                <p className="text-sm text-muted-foreground font-poppins-light">
                  Established connections across shipyards, integrators, suppliers, and owners&apos;
                  teams built over decades.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-cormorant font-bold text-foreground mb-2">
                  Commercial Clarity
                </h3>
                <p className="text-sm text-muted-foreground font-poppins-light">
                  Understanding of what it takes to succeed in this market, from positioning to
                  pricing to reaching the right people.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-secondary/30 rounded-2xl p-12 border border-border">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Get in Touch
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Whether you have a project question or want to explore working together.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full"
            >
              <a href="mailto:info@paulthames.com">Contact Us</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
