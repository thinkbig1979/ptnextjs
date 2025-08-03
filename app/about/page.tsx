
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Calendar, Users, Ship, Target, Award } from "lucide-react";
import { companyInfo, teamMembers } from "@/lib/data";

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

export default function AboutPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [teamRef, teamInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6">
            About Paul Thames
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            {companyInfo.tagline}
          </p>
        </motion.div>

        {/* Company Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-cormorant font-bold">Our Story</h2>
              <div className="prose prose-lg text-muted-foreground font-poppins-light space-y-4">
                {companyInfo.story.split('\n\n').map((paragraph, index) => (
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
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-cormorant font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground font-poppins-light">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              The principles that guide our commitment to superyacht technology excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          ref={teamRef}
          initial={{ opacity: 0, y: 30 }}
          animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
              Meet the experts behind Paul Thames' success in superyacht technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member?.id}
                initial={{ opacity: 0, y: 30 }}
                animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover-lift">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-accent" />
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
                    {member?.email && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group"
                        onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                      >
                        <Mail className="mr-2 h-3 w-3" />
                        Contact
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
