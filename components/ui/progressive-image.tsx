/**
 * Progressive Image Component
 * Optimized image loading with blur placeholder and lazy loading
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLazyLoading } from "@/lib/hooks/use-lazy-loading";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  quality?: number;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholder,
  quality = 10,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  blurDataURL,
  onLoad,
  onError
}: ProgressiveImageProps) {
  const { ref, isVisible } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isVisible && !priority) return;

    // Load low-quality placeholder first if provided
    if (placeholder && !isLoaded) {
      setImageSrc(placeholder);
    }

    // Then load high-quality image
    const img = new window.Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [isVisible, src, placeholder, priority, isLoaded, onLoad, onError]);

  if (hasError) {
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400 rounded",
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <div className="text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-xs">?</span>
          </div>
          <span className="text-sm">Failed to load image</span>
        </div>
      </div>
    );
  }

  if (!isVisible && !priority) {
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded",
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={`Loading ${alt}`}
        aria-busy="true"
      >
        <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
        <span className="sr-only">Loading image: {alt}</span>
      </div>
    );
  }

  const imageProps = {
    src: imageSrc || src,
    alt,
    className: cn(
      "transition-all duration-300",
      !isLoaded && placeholder && "filter blur-sm",
      isLoaded && "filter-none",
      className
    ),
    onLoad: () => {
      setIsLoaded(true);
      onLoad?.();
    },
    onError: () => {
      setHasError(true);
      onError?.();
    },
    placeholder: blurDataURL ? "blur" as const : undefined,
    blurDataURL,
    priority,
    sizes,
    quality,
    ...(fill ? { fill: true } : { width, height })
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn("relative overflow-hidden rounded", !fill && className)}
    >
      <Image {...imageProps} alt={alt} />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <span className="sr-only">Loading image: {alt}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced Image Gallery Component
 * Grid of progressive images with lazy loading
 */
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    placeholder?: string;
  }>;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  aspectRatio?: "square" | "video" | "portrait";
  showLoadingState?: boolean;
}

export function ImageGallery({
  images,
  className,
  columns = 3,
  aspectRatio = "video",
  showLoadingState = true
}: ImageGalleryProps) {
  const [loadedImages, setLoadedImages] = React.useState<Set<number>>(new Set());

  const handleImageLoad = React.useCallback((index: number) => {
    if (typeof index === 'number' && index >= 0) {
      setLoadedImages(prev => new Set(prev).add(index));
    }
  }, []);

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]"
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {images.map((image, index) => (
        <div
          key={index}
          className={cn("relative overflow-hidden rounded-lg", aspectClasses[aspectRatio])}
        >
          <ProgressiveImage
            src={image.src}
            alt={image.alt}
            placeholder={image.placeholder}
            fill
            sizes={`(max-width: 768px) 100vw, (max-width: 1200px) ${100/columns}vw, ${100/columns}vw`}
            onLoad={() => handleImageLoad(index)}
            className="object-cover"
          />
          {showLoadingState && !loadedImages.has(index) && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Hero Image Component
 * Large progressive image for hero sections
 */
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  children?: React.ReactNode;
  priority?: boolean;
}

export function HeroImage({
  src,
  alt,
  className,
  overlay = false,
  children,
  priority = true
}: HeroImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <ProgressiveImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/20" />
      )}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}