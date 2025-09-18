"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VendorYachtProject } from "@/lib/types";

interface YachtProjectPortfolioProps {
  projects: VendorYachtProject[];
  className?: string;
}

export function YachtProjectPortfolio({
  projects,
  className
}: YachtProjectPortfolioProps) {
  // Sort projects by year (most recent first)
  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      if (!a.projectYear && !b.projectYear) return 0;
      if (!a.projectYear) return 1;
      if (!b.projectYear) return -1;
      return b.projectYear - a.projectYear;
    });
  }, [projects]);

  if (!projects || projects.length === 0) {
    return (
      <div
        className={cn("text-center py-12", className)}
        data-testid="no-projects-message"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
        <p className="text-muted-foreground">
          No yacht projects available at this time.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="font-cormorant text-3xl lg:text-4xl font-bold mb-4">
          Yacht Project Portfolio
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Showcasing our expertise across luxury yacht technology integrations and marine systems.
        </p>
      </div>

      {/* Portfolio Statistics */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
        data-testid="portfolio-stats"
      >
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-cormorant font-bold text-accent mb-2">
              {projects.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-cormorant font-bold text-accent mb-2">
              {new Set(projects.flatMap(p => p.systems)).size}
            </div>
            <p className="text-sm text-muted-foreground">System Types</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-cormorant font-bold text-accent mb-2">
              {Math.max(...projects.map(p => p.projectYear || 0).filter(Boolean))}
            </div>
            <p className="text-sm text-muted-foreground">Latest Project</p>
          </CardContent>
        </Card>
      </div>

      {/* Systems Breakdown */}
      <div className="max-w-4xl mx-auto" data-testid="systems-breakdown">
        <h3 className="font-cormorant text-2xl font-semibold mb-6 text-center">
          Systems Expertise
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from(new Set(projects.flatMap(p => p.systems)))
            .sort()
            .map((system, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1"
                data-testid="system-tag"
              >
                <svg
                  className="w-3 h-3 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {system}
              </Badge>
            ))}
        </div>
      </div>

      {/* Project Timeline */}
      <div className="max-w-6xl mx-auto" data-testid="project-timeline">
        <h3 className="font-cormorant text-2xl font-semibold mb-8 text-center">
          Project Timeline
        </h3>

        <div
          className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}
          data-testid="yacht-portfolio"
        >
          {sortedProjects.map((project, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/50"
              data-testid="yacht-project"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="font-cormorant text-xl font-semibold leading-tight group-hover:text-accent transition-colors">
                    {project.yachtName}
                  </CardTitle>

                  {project.projectYear && (
                    <Badge variant="outline" data-testid="project-year">
                      {project.projectYear}
                    </Badge>
                  )}
                </div>

                {project.role && (
                  <p className="text-sm text-muted-foreground font-poppins-medium">
                    {project.role}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {project.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                )}

                {project.systems && project.systems.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-poppins-medium text-sm font-semibold text-accent">
                      Systems Delivered
                    </h4>
                    <div className="space-y-2">
                      {project.systems.map((system, systemIndex) => (
                        <div
                          key={systemIndex}
                          className="flex items-center gap-2 text-sm"
                          data-testid="system-tag"
                        >
                          <svg
                            className="w-3 h-3 text-accent flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-muted-foreground">
                            {system}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}