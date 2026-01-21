import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelinePhase {
  name: string;
  description: string;
  active?: boolean;
  /** Primary phases where impact is greatest */
  primary?: boolean;
}

export interface TimelineVisualizationProps {
  /** Array of phases to display in the timeline */
  phases: TimelinePhase[];
  /** Label to display on active phases (default: "We support here") */
  activeLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TimelineVisualization component displays a horizontal timeline of project phases.
 * On mobile, it displays in a 2-column grid with centered content.
 * On desktop (md+), it displays as a horizontal timeline with a connecting line.
 *
 * Supports variable number of phases with active/inactive state visualization.
 */
export function TimelineVisualization({
  phases,
  activeLabel = "We support here",
  className,
}: TimelineVisualizationProps) {
  // Dynamically set grid columns based on number of phases
  const gridColsClass =
    phases.length <= 2
      ? "md:grid-cols-2"
      : phases.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-4";

  return (
    <div className={cn("relative", className)} role="list" aria-label="Project phases timeline">
      {/* Timeline connecting line - horizontal on md+ only */}
      <div
        className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2"
        aria-hidden="true"
      />

      {/* Phases grid - 2 columns on mobile, dynamic columns on md+ */}
      <div
        className={cn(
          "grid grid-cols-2 gap-4 md:gap-8",
          gridColsClass
        )}
      >
        {phases.map((phase, index) => (
          <div key={phase.name} className="relative text-center" role="listitem">
            {/* Phase indicator circle */}
            <div
              className={cn(
                "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center relative z-10",
                phase.active
                  ? "bg-accent text-white ring-4 ring-accent/20"
                  : "bg-muted text-muted-foreground"
              )}
              aria-hidden="true"
            >
              <span className="text-lg font-bold">{index + 1}</span>
            </div>

            {/* Phase content */}
            <h3
              className={cn(
                "text-xl font-cormorant font-bold mb-2",
                phase.active ? "text-accent" : "text-muted-foreground"
              )}
            >
              {phase.name}
            </h3>
            <p className="text-sm text-muted-foreground font-poppins-light">
              {phase.description}
            </p>
            {phase.primary && activeLabel && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-poppins-medium rounded-full">
                  {activeLabel}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
