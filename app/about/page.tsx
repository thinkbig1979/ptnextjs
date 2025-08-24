

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Ship, Target, Award } from "lucide-react";
import { AboutClient } from "./_components/about-client";
import { staticDataService } from "@/lib/static-data-service";
import { OptimizedImage } from "@/components/ui/optimized-image";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We maintain the highest standards in everything we do, from partner selection to client service.",
  },
  {
    icon: Users,
    title: "Trust",
    description: "Building long-term relationships based on transparency, reliability, and mutual respect.",
  },
  {
    icon: Ship,
    title: "Innovation",
    description: "Staying at the forefront of marine technology to provide cutting-edge solutions.",
  },
  {
    icon: Award,
    title: "Quality",
    description: "Ensuring every technology solution meets the exacting standards of superyacht excellence.",
  },
];

const stats = [
  { label: "Years of Experience", value: "6+", icon: Calendar },
  { label: "Partner Companies", value: "50+", icon: Users },
  { label: "Yachts Equipped", value: "200+", icon: Ship },
  { label: "Countries Served", value: "25+", icon: MapPin },
];

export default async function AboutPage() {
  // Fetch data at build time
  const companyInfo = await staticDataService.getCompanyInfo();
  const teamMembers = await staticDataService.getTeamMembers();

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6">
            About Paul Thames
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            {companyInfo?.tagline || "Excellence in superyacht technology solutions"}
          </p>
        </div>

        {/* Company Story */}
        {companyInfo && (
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-cormorant font-bold">Our Story</h2>
                <div className="prose prose-lg text-muted-foreground font-poppins-light space-y-4">
                  {companyInfo.story.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{companyInfo.location}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Est. {companyInfo.founded}</span>
                  </Badge>
                </div>
              </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto">
                    <Ship className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-cormorant font-bold">Maritime Excellence</h3>
                  <p className="text-muted-foreground font-poppins-light">
                    Bridging innovation and tradition in superyacht technology
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Stats - Static content */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-cormorant font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground font-poppins-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values - Static content */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              The principles that guide our commitment to superyacht technology excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={value.title}>
                <Card className="h-full hover-lift">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Team - Static content */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Meet the experts behind Paul Thames' success in superyacht technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={member?.id}>
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
                    <CardTitle>{member?.name}</CardTitle>
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
      </div>
    </div>
  );
}
