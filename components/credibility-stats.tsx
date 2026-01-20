"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CredibilityStat {
  value: string | number;
  label: string;
  suffix?: string;
}

interface CredibilityStatsProps {
  stats: CredibilityStat[];
  title?: string;
  description?: string;
  className?: string;
}

function AnimatedNumber({ value, suffix }: { value: string | number; suffix?: string }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  const numericValue = typeof value === "number" ? value : parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);

  React.useEffect(() => {
    if (!isNumeric || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            const duration = 2000;
            const steps = 60;
            const increment = numericValue / steps;
            const stepDuration = duration / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
              currentStep++;
              if (currentStep >= steps) {
                setDisplayValue(numericValue);
                clearInterval(timer);
              } else {
                setDisplayValue(Math.floor(increment * currentStep));
              }
            }, stepDuration);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [numericValue, isNumeric, hasAnimated]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {isNumeric ? displayValue : value}
      {suffix && <span className="text-accent">{suffix}</span>}
    </span>
  );
}

export function CredibilityStats({
  stats,
  title,
  description,
  className,
}: CredibilityStatsProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-20 bg-secondary/30",
        className
      )}
      aria-label="Credibility statistics"
    >
      <div className="container max-w-screen-xl">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
                {description}
              </p>
            )}
          </div>
        )}

        <div
          className={cn(
            "grid gap-8 md:gap-12",
            stats.length === 2 && "grid-cols-1 sm:grid-cols-2",
            stats.length === 3 && "grid-cols-1 sm:grid-cols-3",
            stats.length === 4 && "grid-cols-2 md:grid-cols-4",
            stats.length > 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {stats.map((stat, index) => (
            <div
              key={`stat-${index}-${stat.label}`}
              className="text-center space-y-2 group"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-cormorant font-bold text-foreground transition-colors group-hover:text-accent">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-poppins-light uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
