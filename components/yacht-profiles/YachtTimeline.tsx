"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface YachtTimelineEvent {
  date: string;
  event: string;
  description?: string;
  location?: string;
  category?: string;
}

interface YachtTimelineProps {
  events?: YachtTimelineEvent[] | null;
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

export function YachtTimeline({
  events,
  sortOrder = 'asc',
  className
}: YachtTimelineProps) {
  // Safely handle events array
  const safeEvents = events || [];

  // Sort events by date
  const sortedEvents = React.useMemo(() => {
    if (safeEvents.length === 0) return [];

    return [...safeEvents].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [safeEvents, sortOrder]);

  // Return early if no events
  if (sortedEvents.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <CardContent>
          <p className="text-muted-foreground text-center">
            No timeline events available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'launch':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delivery':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'refit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'milestone':
        return 'bg-accent/10 text-accent dark:bg-accent/10 dark:text-blue-200';
      default:
        return 'bg-muted text-gray-800 dark:bg-muted dark:text-gray-200';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {sortedEvents.map((event, index) => (
        <Card key={index} className="relative">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full mt-2" />
                {index < sortedEvents.length - 1 && (
                  <div className="w-px h-16 bg-border mt-2" />
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{event.event}</h3>
                  {event.category && (
                    <Badge
                      variant="secondary"
                      className={getCategoryColor(event.category)}
                    >
                      {event.category}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {formatDate(event.date)}
                  {event.location && ` • ${event.location}`}
                </p>

                {event.description && (
                  <p className="text-sm text-foreground">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}