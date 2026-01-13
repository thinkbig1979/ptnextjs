/**
 * Optimized Avatar Component
 * Progressive loading avatar with fallbacks
 */

"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24"
};

export function OptimizedAvatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
  priority = false
}: OptimizedAvatarProps): React.ReactElement {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Get initials for fallback
  const initials = React.useMemo(() => {
    if (fallback) return fallback;

    if (!alt || typeof alt !== 'string') return '?';

    return alt
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  }, [alt, fallback]);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = React.useCallback(() => {
    setHasError(true);
  }, []);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium",
          sizeClasses[size],
          className
        )}
      >
        <span className={cn(
          "select-none",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base",
          size === "xl" && "text-lg"
        )}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        sizes={`${size === "sm" ? "32px" : size === "md" ? "48px" : size === "lg" ? "64px" : "96px"}`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-border animate-pulse rounded-full" />
      )}
    </div>
  );
}

/**
 * Avatar Group Component
 * Multiple avatars with overflow indicator
 */
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt: string;
    fallback?: string;
  }>;
  size?: "sm" | "md" | "lg" | "xl";
  max?: number;
  className?: string;
}

export function AvatarGroup({
  avatars,
  size = "md",
  max = 5,
  className
}: AvatarGroupProps): React.ReactElement {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  const overlapClass = {
    sm: "-ml-2",
    md: "-ml-3",
    lg: "-ml-4",
    xl: "-ml-5"
  };

  return (
    <div className={cn("flex items-center", className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={avatar.src ?? `avatar-${avatar.alt}-${index}`}
          className={cn(
            "relative ring-2 ring-white",
            index > 0 && overlapClass[size]
          )}
          style={{ zIndex: visibleAvatars.length - index }}
        >
          <OptimizedAvatar
            src={avatar.src}
            alt={avatar.alt}
            fallback={avatar.fallback}
            size={size}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-border text-muted-foreground font-medium ring-2 ring-white",
            sizeClasses[size],
            overlapClass[size]
          )}
          style={{ zIndex: 0 }}
        >
          <span className={cn(
            "select-none",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-lg"
          )}>
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}