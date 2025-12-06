/**
 * Lazy Media Components
 * Lazy loading for various media types with performance optimization
 */

"use client";

import * as React from "react";
import { FileText, Image as ImageIcon, Play } from "lucide-react";

import { useLazyLoading, usePerformanceMetrics } from "@/lib/hooks/use-lazy-loading";
import { cn } from "@/lib/utils";

import { ProgressiveImage } from "./progressive-image";

interface LazyMediaProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  trackPerformance?: boolean;
  performanceName?: string;
}

/**
 * Generic Lazy Loading Wrapper
 */
export function LazyMedia({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  trackPerformance = false,
  performanceName = 'LazyMedia'
}: LazyMediaProps): React.ReactElement {
  const { ref, wasVisible } = useLazyLoading({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const { startMeasure, endMeasure } = usePerformanceMetrics({
    name: performanceName,
    enabled: trackPerformance
  });

  React.useEffect(() => {
    if (wasVisible && trackPerformance) {
      startMeasure();
      return () => endMeasure();
    }
  }, [wasVisible, trackPerformance, startMeasure, endMeasure]);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {wasVisible ? children : (fallback || <MediaPlaceholder />)}
    </div>
  );
}

/**
 * Media Placeholder Component
 */
function MediaPlaceholder({ type = 'image' }: { type?: 'image' | 'video' | 'document' }): React.ReactElement {
  const icons = {
    image: ImageIcon,
    video: Play,
    document: FileText
  };

  const messages = {
    image: 'Image will load when visible',
    video: 'Video will load when visible',
    document: 'Content will load when visible'
  };

  const Icon = icons[type];
  const message = messages[type];

  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg min-h-[200px]"
      role="img"
      aria-label={message}
      aria-busy="true"
    >
      <div className="text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 bg-border rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm" id="loading-message">
          {message}
        </p>
        <span className="sr-only">Loading {type} content</span>
      </div>
    </div>
  );
}

/**
 * Lazy Video Component
 */
interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export function LazyVideo({
  src,
  poster,
  className,
  autoPlay = false,
  muted = false,
  controls = true,
  loop = false,
  preload = 'none'
}: LazyVideoProps): React.ReactElement {
  // Validate video src
  if (!src || typeof src !== 'string') {
    console.warn('LazyVideo: Invalid or missing src prop');
    return <MediaPlaceholder type="video" />;
  }

  return (
    <LazyMedia
      fallback={<MediaPlaceholder type="video" />}
      trackPerformance
      performanceName="LazyVideo"
      className={className}
    >
      <video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        controls={controls}
        loop={loop}
        preload={preload}
        className="w-full h-full object-cover rounded-lg"
        onError={() => console.error('Failed to load video:', src)}
      />
    </LazyMedia>
  );
}

/**
 * Lazy Iframe Component
 */
interface LazyIframeProps {
  src: string;
  title: string;
  className?: string;
  width?: number;
  height?: number;
  allowFullScreen?: boolean;
}

export function LazyIframe({
  src,
  title,
  className,
  width,
  height,
  allowFullScreen = false
}: LazyIframeProps): React.ReactElement {
  // Validate iframe src and title
  if (!src || typeof src !== 'string') {
    console.warn('LazyIframe: Invalid or missing src prop');
    return <MediaPlaceholder type="document" />;
  }

  if (!title || typeof title !== 'string') {
    console.warn('LazyIframe: Missing title prop required for accessibility');
  }

  return (
    <LazyMedia
      fallback={<MediaPlaceholder type="document" />}
      trackPerformance
      performanceName="LazyIframe"
      className={className}
    >
      <iframe
        src={src}
        title={title || 'Embedded content'}
        width={width}
        height={height}
        allowFullScreen={allowFullScreen}
        className="w-full h-full border-0 rounded-lg"
        loading="lazy"
        onError={() => console.error('Failed to load iframe:', src)}
      />
    </LazyMedia>
  );
}

/**
 * Lazy Image Grid Component
 */
interface LazyImageGridProps {
  images: Array<{
    src: string;
    alt: string;
    placeholder?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
  imageClassName?: string;
  onImageClick?: (index: number) => void;
}

export function LazyImageGrid({
  images,
  columns = 3,
  gap = 4,
  className,
  imageClassName,
  onImageClick
}: LazyImageGridProps): React.ReactElement {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  const gapClasses = {
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8"
  };

  return (
    <div className={cn("grid", gridClasses[columns], gapClasses[gap], className)}>
      {images.map((image, index) => (
        <LazyMedia
          key={index}
          fallback={<MediaPlaceholder type="image" />}
          className="aspect-video"
        >
          <button
            className={cn(
              "relative overflow-hidden rounded-lg cursor-pointer group w-full h-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              imageClassName
            )}
            onClick={() => onImageClick?.(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onImageClick?.(index)
              }
            }}
            aria-label={`View image: ${image.alt}`}
            type="button"
          >
            <ProgressiveImage
              src={image.src}
              alt={image.alt}
              placeholder={image.placeholder}
              fill
              sizes={`(max-width: 768px) 100vw, (max-width: 1200px) ${100/columns}vw, ${100/columns}vw`}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 group-focus:bg-black/10 transition-colors duration-300" />
          </button>
        </LazyMedia>
      ))}
    </div>
  );
}

/**
 * Virtualized List Component for Large Media Sets
 */
interface VirtualizedMediaListProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
  }>;
  itemHeight: number;
  containerHeight: number;
  className?: string;
  overscan?: number;
}

export function VirtualizedMediaList({
  items,
  itemHeight,
  containerHeight,
  className,
  overscan = 3
}: VirtualizedMediaListProps): React.ReactElement {
  const [scrollTop, setScrollTop] = React.useState(0);
  const scrollElementRef = React.useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Memoize calculations to avoid recalculating on every render
  const { visibleItems, startIndex } = React.useMemo(() => {
    const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
    const calculatedStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      calculatedStartIndex + visibleItemsCount + overscan * 2
    );

    return {
      visibleItems: items.slice(calculatedStartIndex, endIndex + 1),
      startIndex: calculatedStartIndex
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  // Debounced scroll handler to improve performance
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll updates to reduce re-renders
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollTop(newScrollTop);
    }, 16); // ~60fps
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            <LazyMedia threshold={0.1} rootMargin="200px">
              {item.content}
            </LazyMedia>
          </div>
        ))}
      </div>
    </div>
  );
}