import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  /** Optional icon to display in the accent-colored header area */
  icon?: React.ReactNode;
  /** Main title of the service */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Description text for the service */
  description: string;
  /** Optional list of features/services to display with checkmarks */
  features?: string[];
  /** Optional CTA button text */
  ctaText?: string;
  /** Optional CTA button URL - can be internal or external */
  ctaUrl?: string;
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * ServiceCard - A reusable card component for displaying services.
 *
 * Features:
 * - Optional icon with accent background
 * - Title and subtitle with proper typography hierarchy
 * - Description text
 * - Optional features list with checkmarks
 * - Optional CTA button with hover animation
 * - Hover-lift animation on the card
 *
 * @example
 * ```tsx
 * <ServiceCard
 *   icon={<Lightbulb className="w-6 h-6 text-white" />}
 *   title="Consultancy"
 *   subtitle="Expert Guidance"
 *   description="Technical clarity for your superyacht projects."
 *   features={["Specification Review", "Proposal Analysis", "On-Demand Support"]}
 *   ctaText="Learn More"
 *   ctaUrl="/consultancy"
 * />
 * ```
 */
export function ServiceCard({
  icon,
  title,
  subtitle,
  description,
  features,
  ctaText,
  ctaUrl,
  className,
}: ServiceCardProps) {
  const isExternalUrl = ctaUrl?.startsWith("http") || ctaUrl?.startsWith("mailto:");

  return (
    <Card
      className={cn(
        "h-full transition-transform duration-300 hover:-translate-y-1",
        className
      )}
    >
      <CardHeader>
        {/* Icon and Title Row */}
        <div className="flex items-start gap-4">
          {icon && (
            <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl md:text-2xl font-cormorant leading-tight">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground font-poppins-light mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-muted-foreground font-poppins-light text-base leading-relaxed">
          {description}
        </p>

        {/* Features List */}
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-poppins-medium text-foreground">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA Button */}
        {ctaText && ctaUrl && (
          <div className="pt-2">
            {isExternalUrl ? (
              <Button
                asChild
                className="w-full bg-accent hover:bg-accent/90 text-white group"
              >
                <a href={ctaUrl}>
                  {ctaText}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            ) : (
              <Button
                asChild
                className="w-full bg-accent hover:bg-accent/90 text-white group"
              >
                <Link href={ctaUrl}>
                  {ctaText}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ServiceCard;
