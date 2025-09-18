"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { YachtTimelineEvent } from "@/lib/types";

interface YachtTimelineProps {
  events: YachtTimelineEvent[];
  sortOrder?: 'asc' | 'desc';
  filterByCategory?: 'launch' | 'delivery' | 'refit' | 'milestone' | 'service';
  compact?: boolean;
  groupByYear?: boolean;
  expandable?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function YachtTimeline({
  events,
  sortOrder = 'asc',
  filterByCategory,
  compact = false,
  groupByYear = false,
  expandable = false,
  showProgress = false,
  className
}: YachtTimelineProps) {
  const [expandedEvent, setExpandedEvent] = React.useState<number | null>(null);

  const filteredAndSortedEvents = React.useMemo(() => {
    let filtered = events.filter(event => {
      if (filterByCategory && event.category !== filterByCategory) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [events, sortOrder, filterByCategory]);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'launch':
        return 'bg-green-100 text-green-800';
      case 'delivery':
        return 'bg-purple-100 text-purple-800';
      case 'refit':
        return 'bg-orange-100 text-orange-800';
      case 'milestone':
        return 'bg-blue-100 text-blue-800';
      case 'service':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progress = React.useMemo(() => {
    if (!showProgress) return 0;
    const completedEvents = filteredAndSortedEvents.filter(event =>
      new Date(event.date) <= new Date()
    ).length;
    return Math.round((completedEvents / filteredAndSortedEvents.length) * 100);
  }, [filteredAndSortedEvents, showProgress]);

  if (filteredAndSortedEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No timeline events available.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-6",
        compact && "compact-view",
        className
      )}
      data-testid="yacht-timeline"
    >
      {showProgress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Construction Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  data-testid="construction-progress"
                  data-progress={progress}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

        <div className="space-y-8">
          {filteredAndSortedEvents.map((event, index) => (
            <div key={index} className="relative">
              {/* Timeline connector */}
              {index < filteredAndSortedEvents.length - 1 && (
                <div
                  className="absolute left-8 top-16 w-0.5 h-8 bg-border"
                  data-testid="timeline-connector"
                />
              )}

              <Card
                className={cn(
                  "ml-16 transition-all duration-200 hover:shadow-md",
                  `category-${event.category}`
                )}
                data-testid={`timeline-event-${event.category}`}
                data-date={event.date}
              >
                {/* Timeline dot */}
                <div className="absolute -left-16 top-6 w-4 h-4 bg-background border-2 border-accent rounded-full"></div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryBadgeClass(event.category)}>
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold font-cormorant">
                          {event.event}
                        </h3>
                        {event.location && (
                          <p className="text-sm text-muted-foreground">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      {expandable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedEvent(expandedEvent === index ? null : index)}
                          data-testid={`expand-event-${index}`}
                        >
                          {expandedEvent === index ? 'Less' : 'More'}
                        </Button>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {event.images && event.images.length > 0 && (
                      <div className="grid gap-2 md:grid-cols-2">
                        {event.images.slice(0, 2).map((image, imageIndex) => (
                          <div key={imageIndex} className="aspect-video relative rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`${event.event} event`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {expandable && expandedEvent === index && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-2">Event Details</p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Category:</strong> {event.category}</p>
                          <p><strong>Date:</strong> {event.date}</p>
                          {event.location && <p><strong>Location:</strong> {event.location}</p>}
                          {event.description && <p><strong>Description:</strong> {event.description}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {groupByYear && (
        <div className="space-y-4">
          {Array.from(new Set(filteredAndSortedEvents.map(event => new Date(event.date).getFullYear())))
            .sort()
            .map(year => (
              <div key={year} className="text-center">
                <h3 className="text-2xl font-bold font-cormorant text-muted-foreground">
                  {year}
                </h3>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}