import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, Compass, Anchor, Settings, Box, Users } from "lucide-react";
import { AboutClient } from "./_components/about-client";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";

const valuePropositions = [
  {
    icon: Anchor,
    title: "Shipyards & Owners",
    description: "Fast access to senior technical leadership, reducing risk and cost",
  },
  {
    icon: Settings,
    title: "Integrators",
    description: "On-demand expertise and specialist capacity for niche challenges",
  },
  {
    icon: Box,
    title: "Manufacturers",
    description: "Platform visibility and market-entry partnership opportunities",
  },
  {
    icon: Users,
    title: "Specialists",
    description: "Visibility and curated referrals without losing independence",
  },
];

export default async function AboutPage() {
  // Fetch data at build time
  const teamMembers = await tinaCMSDataService.getTeamMembers();

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            About Paul Thames
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            A two-pillar, founder-led company that combines a product and services discovery platform for yachting project stakeholders, with hands-on expertise & bespoke solutions.
          </p>
        </div>

        {/* Core Identity */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Our Core Identity
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-poppins-light leading-relaxed">
              Paul Thames exists to make innovation in yachting more accessible and actionable by connecting the right people, products, and ideas at the right time. The founders&apos; combined experience gives PT a unique market awareness: knowing which projects are active, what solutions are relevant, and which relationships matter.
            </p>
          </div>
        </div>

        {/* Two Pillars Overview */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Two Complementary Business Units
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Discovery Platform Overview */}
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mr-4">
                    <Grid className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-cormorant">Discovery Platform</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground font-poppins-light">
                  A searchable online platform, listing yacht tech vendors, manufacturers, and solution providers.
                </p>
                <p className="text-sm text-muted-foreground/80 font-poppins-light">
                  Led by: Roel (sales & BD), Thijs (marketing strategy & digital), Nigel (relationships & events)
                </p>
                <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                  <a href="/discovery-platform">Learn More</a>
                </Button>
              </CardContent>
            </Card>

            {/* Bespoke Solutions Overview */}
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mr-4">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-cormorant">Expertise & Bespoke Solutions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground font-poppins-light">
                  Delivery-oriented services providing senior technical leadership, scoped discovery work, fast pilots, and guided access to specialist expertise.
                </p>
                <p className="text-sm text-muted-foreground/80 font-poppins-light">
                  Led by: Edwin (Technical Founder / CTO)
                </p>
                <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                  <a href="/bespoke-solutions">Learn More</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">
              Value Propositions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valuePropositions.map((value, index) => (
              <div key={index} className="text-center">
                <Card className="h-full hover-lift">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg font-cormorant">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center font-poppins-light">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Team - Using existing team data */}
        {teamMembers.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4 text-accent">Our Team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
                Meet the experts behind Paul Thames&apos; success in superyacht technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={member?.id || index}>
                  <Card className="h-full hover-lift">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                        <OptimizedImage
                          src={member?.image}
                          alt={member?.name || 'Team member'}
                          fallbackType="team"
                          aspectRatio="square"
                          fill
                          className="object-cover"
                          sizes="80px"
                          iconSize="md"
                        />
                      </div>
                      <CardTitle className="font-cormorant">{member?.name}</CardTitle>
                      <CardDescription className="font-poppins-medium text-accent">
                        {member?.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground font-poppins-light">
                        {member?.bio}
                      </p>
                      <AboutClient member={member} />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">Ready to Connect?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Let&apos;s discuss how Paul Thames can help your yacht technology project succeed.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com">Contact Us</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}