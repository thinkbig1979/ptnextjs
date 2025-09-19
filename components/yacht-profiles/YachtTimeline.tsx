"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { YachtTimelineEvent } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { usePerformanceMetrics } from "@/lib/hooks/use-lazy-loading";

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

// Memoized timeline event component for performance
const TimelineEventItem = React.memo(({
  event,
  index,
  isExpanded,
  onToggleExpand,
  compact,
  getCategoryBadgeClass
}: {
  event: YachtTimelineEvent;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (index: number) => void;
  compact: boolean;
  getCategoryBadgeClass: (category: string) => string;
}) => {
  const handleToggle = React.useCallback(() => {
    onToggleExpand(index);
  }, [index, onToggleExpand]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      className="relative"
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className={cn("p-4", compact && "p-3")}>
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getCategoryBadgeClass(event.category)}>
                  {event.category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <h4 className={cn("font-medium", compact ? "text-sm" : "text-base")}>
                {event.event}
              </h4>
              {!compact && event.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {event.description}
                </p>
              )}
              {isExpanded && event.description && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-muted rounded-lg"
                >
                  <p className="text-sm">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Location: {event.location}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
            {event.description && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="shrink-0"
              >
                {isExpanded ? 'Less' : 'More'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

TimelineEventItem.displayName = 'TimelineEventItem';

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

  // Performance monitoring
  const { startMeasure, endMeasure } = usePerformanceMetrics({
    name: 'YachtTimeline',
    enabled: process.env.NODE_ENV === 'development'
  });

  // Memoized event filtering and sorting for performance
  const filteredAndSortedEvents = React.useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      startMeasure();
    }

    let filtered = events;

    // Only filter if category filter is provided
    if (filterByCategory) {
      filtered = events.filter(event => event.category === filterByCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    if (process.env.NODE_ENV === 'development') {
      endMeasure();
    }

    return sorted;
  }, [events, sortOrder, filterByCategory, endMeasure, startMeasure]);

  // Memoized category badge class function for performance
  const getCategoryBadgeClass = React.useCallback((category: string) => {
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
  }, []);

  // Optimized toggle handler using useCallback
  const handleToggleExpand = React.useCallback((index: number) => {
    setExpandedEvent(prev => prev === index ? null : index);
  }, []);

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
        {/* Timeline line with animated progress */}
        <motion.div
          className="absolute left-8 top-0 bottom-0 w-0.5 bg-border/30"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ transformOrigin: "top" }}
        />

        {showProgress && (
          <motion.div
            className="absolute left-8 top-0 w-0.5 bg-primary"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: progress / 100 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{
              transformOrigin: "top",
              height: `${(progress / 100) * 100}%`
            }}
          />
        )}

        <div className="space-y-6">
          <AnimatePresence>
            {filteredAndSortedEvents.map((event, index) => (
              <div key={`${event.date}-${index}`} className="relative">
                {/* Timeline connector */}
                {index < filteredAndSortedEvents.length - 1 && (
                  <motion.div
                    className="absolute left-8 top-16 w-0.5 h-6 bg-border"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
                    style={{ transformOrigin: "top" }}
                  />
                )}

                {/* Timeline dot */}
                <motion.div
                  className="absolute left-6 top-6 w-4 h-4 bg-background border-2 border-accent rounded-full z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 + 0.2 }}
                >
                  <motion.div
                    className={cn(
                      "absolute inset-1 rounded-full",
                      event.category === 'launch' && "bg-green-500",
                      event.category === 'delivery' && "bg-purple-500",
                      event.category === 'refit' && "bg-orange-500",
                      event.category === 'milestone' && "bg-blue-500",
                      event.category === 'service' && "bg-yellow-500"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 + 0.4 }}
                  />
                </motion.div>

                {/* Event content */}
                <div className="ml-16">
                  <TimelineEventItem
                    event={event}
                    index={index}
                    isExpanded={expandable && expandedEvent === index}
                    onToggleExpand={handleToggleExpand}
                    compact={compact}
                    getCategoryBadgeClass={getCategoryBadgeClass}
                  />
                </div>
              </div>
            ))}
          </AnimatePresence>
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