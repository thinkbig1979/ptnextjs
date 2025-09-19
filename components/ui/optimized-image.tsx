"use client";

import * as React from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Package, Building2, Users, Ship, Briefcase, FileText, Tag } from "lucide-react";

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  alt: string;
  fallbackType?: 'product' | 'partner' | 'team' | 'company' | 'generic' | 'blog' | 'category';
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  showIcon?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
}

// Placeholder SVGs removed - now using contextual icons only

const fallbackIcons = {
  product: Package,
  partner: Building2,
  team: Users,
  company: Ship,
  generic: Briefcase,
  blog: FileText,
  category: Tag,
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
};

export function OptimizedImage({
  src,
  alt,
  fallbackType = 'generic',
  className,
  aspectRatio,
  showIcon: _showIcon = true,
  iconSize = 'md',
  fill,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  // Determine if we should show the image or fallback
  const shouldShowImage = src && !imageError;
  const FallbackIcon = fallbackIcons[fallbackType];

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle image error
  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Build container classes
  const containerClasses = cn(
    'relative overflow-hidden bg-gradient-to-br from-accent/10 to-primary/10',
    aspectRatio && aspectRatioClasses[aspectRatio],
    className
  );

  if (shouldShowImage) {
    return (
      <div className={containerClasses}>
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="animate-pulse">
              <FallbackIcon className={cn(iconSizes[iconSize], 'text-muted-foreground/50')} />
            </div>
          </div>
        )}
        
        {/* Actual image */}
        <Image
          src={src}
          alt={alt}
          fill={fill}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          {...props}
        />
      </div>
    );
  }

  // Contextual icon fallback (no more placeholder SVGs)
  return (
    <div className={containerClasses}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <FallbackIcon className={cn(iconSizes[iconSize], 'text-accent/60 mx-auto')} />
          <p className="text-xs text-muted-foreground capitalize">
            {fallbackType === 'partner' ? 'Vendor' : fallbackType}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OptimizedImage;