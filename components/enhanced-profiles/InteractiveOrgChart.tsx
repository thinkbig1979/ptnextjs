"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  department: string;
  level: number;
  photoUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  reportsTo: string | null;
}


interface InteractiveOrgChartProps {
  teamMembers: TeamMember[];
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

export const InteractiveOrgChart = React.memo(function InteractiveOrgChart({
  teamMembers,
  compact = false,
  animated = false,
  className,
}: InteractiveOrgChartProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Always call hooks before any early returns
  // Group members by level and department
  const membersByLevel = useMemo(() => {
    if (teamMembers.length === 0) return {};
    return teamMembers.reduce((acc, member) => {
      if (!acc[member.level]) acc[member.level] = [];
      acc[member.level].push(member);
      return acc;
    }, {} as Record<number, TeamMember[]>);
  }, [teamMembers]);

  const departments = useMemo(() => {
    if (teamMembers.length === 0) return [];
    const deptCounts = teamMembers.reduce((acc, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(deptCounts);
  }, [teamMembers]);

  const filteredMembers = useMemo(() => {
    if (teamMembers.length === 0) return [];
    return selectedDepartment
      ? teamMembers.filter(member => member.department === selectedDepartment)
      : teamMembers;
  }, [teamMembers, selectedDepartment]);

  const maxLevel = useMemo(() => {
    if (teamMembers.length === 0) return 0;
    return Math.max(...teamMembers.map(m => m.level));
  }, [teamMembers]);

  if (teamMembers.length === 0) {
    return (
      <div
        data-testid="interactive-org-chart"
        className={cn("text-center py-8", className)}
      >
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground dark:text-muted-foreground">
          No team members to display.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="interactive-org-chart"
      className={cn(
        "space-y-6",
        compact && "compact",
        className
      )}
    >
      {/* Department filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedDepartment === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDepartment(null)}
        >
          All Departments
        </Button>
        {departments.map(([dept, count]) => (
          <Button
            key={dept}
            variant={selectedDepartment === dept ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDepartment(dept)}
          >
            {dept} ({count})
          </Button>
        ))}
      </div>

      {/* Organization chart */}
      <div className="relative">
        {/* Connection lines with animated drawing */}
        <svg
          data-testid="org-chart-connections"
          className={cn("absolute inset-0 pointer-events-none z-0", animated && "animate-draw")}
          style={{ zIndex: 0 }}
        >
          {/* Draw connections between levels */}
          {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
            <g key={level}>
              <motion.line
                x1="50%"
                y1={`${(level - 1) * 200 + 100}px`}
                x2="50%"
                y2={`${level * 200}px`}
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground dark:text-muted-foreground"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: level * 0.2,
                  ease: "easeInOut"
                }}
              />
            </g>
          ))}
        </svg>

        {/* Member levels */}
        <div className="relative z-10 space-y-12">
          {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => {
            const membersAtLevel = (membersByLevel[level] || []).filter(member =>
              filteredMembers.includes(member)
            );

            if (membersAtLevel.length === 0) return null;

            return (
              <div
                key={level}
                data-testid={`level-${level}`}
                className="flex justify-center"
              >
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                  <AnimatePresence>
                    {membersAtLevel.map((member, memberIndex) => (
                      <motion.div
                        key={member.id}
                        layout
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                          y: 50
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          y: -50
                        }}
                        transition={{
                          duration: 0.5,
                          delay: (level - 1) * 0.1 + memberIndex * 0.05,
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        }}
                        whileHover={{
                          scale: 1.05,
                          y: -8,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          data-testid={`member-${member.id}`}
                          className={cn(
                            "cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent",
                            compact ? "w-32" : "w-48",
                            hoveredMember === member.id && "ring-2 ring-blue-500 shadow-xl"
                          )}
                          tabIndex={0}
                          role="button"
                          aria-label={`View details for ${member.name}, ${member.title} in ${member.department}`}
                          onMouseEnter={() => setHoveredMember(member.id)}
                          onMouseLeave={() => setHoveredMember(null)}
                          onClick={() => setSelectedMember(member)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedMember(member);
                            }
                          }}
                        >
                      <CardContent className={cn("p-4 text-center", compact && "p-3")}>
                        {/* Member photo */}
                        <div className="relative mx-auto mb-3">
                          {member.photoUrl ? (
                            <Image
                              src={member.photoUrl}
                              alt={member.name}
                              width={compact ? 48 : 64}
                              height={compact ? 48 : 64}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={cn(
                                "bg-border dark:bg-border rounded-full flex items-center justify-center",
                                compact ? "w-12 h-12" : "w-16 h-16"
                              )}
                            >
                              <Users className={cn("text-muted-foreground", compact ? "w-6 h-6" : "w-8 h-8")} />
                            </div>
                          )}
                        </div>

                        {/* Member info */}
                        <h3 className={cn("font-semibold text-foreground dark:text-gray-100 mb-1", compact ? "text-sm" : "text-base")}>
                          {member.name}
                        </h3>
                        <p className={cn("text-muted-foreground dark:text-muted-foreground mb-2", compact ? "text-xs" : "text-sm")}>
                          {member.title}
                        </p>
                        <Badge variant="outline" className={compact ? "text-xs" : "text-sm"}>
                          {member.department}
                        </Badge>

                        {/* LinkedIn link */}
                        {member.linkedinUrl && (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent dark:text-accent hover:text-accent dark:hover:text-accent mt-2 text-xs transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Linkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}

                        {/* Bio preview on hover */}
                        {hoveredMember === member.id && member.bio && !compact && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-black text-white text-xs rounded-lg shadow-lg z-20 max-w-xs">
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                            {member.bio}
                          </div>
                        )}
                      </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member detail modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent
          data-testid="member-modal"
          className="max-w-md"
          aria-describedby={selectedMember?.bio ? "member-description" : undefined}
        >
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              {/* Photo and basic info */}
              <div className="flex items-center gap-4">
                {selectedMember.photoUrl ? (
                  <Image
                    src={selectedMember.photoUrl}
                    alt={selectedMember.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-border dark:bg-border rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
                    {selectedMember.name}
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    {selectedMember.title}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {selectedMember.department}
                  </Badge>
                </div>
              </div>

              {/* Bio */}
              {selectedMember.bio && (
                <div id="member-description">
                  <h4 className="font-medium text-foreground dark:text-gray-100 mb-2">About</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {selectedMember.bio}
                  </p>
                </div>
              )}

              {/* Contact links */}
              <div className="flex gap-2">
                {selectedMember.linkedinUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={selectedMember.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});