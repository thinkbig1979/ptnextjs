import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useLazyLoading } from "@/lib/hooks/use-lazy-loading";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div data-testid="video-loading" className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface VideoData {
  url: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  duration?: number;
}


interface VideoIntroductionProps {
  video: VideoData;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const padded = String(secs).padStart(2, '0');
  return `${minutes}:${padded}`;
}

function isValidVideoUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS URLs for security
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Allow common video hosting platforms
    const allowedDomains = [
      'youtube.com',
      'www.youtube.com',
      'youtu.be',
      'vimeo.com',
      'player.vimeo.com',
      'wistia.com',
      'fast.wistia.net',
      'brightcove.com',
      'players.brightcove.net'
    ];

    return allowedDomains.some(domain =>
      parsedUrl.hostname === domain ||
      parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export function VideoIntroduction({
  video,
  autoplay = false,
  controls = true,
  className,
  onPlay,
  onPause,
  onEnded,
}: VideoIntroductionProps) {
  const [isPlaying, setIsPlaying] = React.useState(autoplay);
  const [hasStarted, setHasStarted] = React.useState(autoplay);
  const [hasEnded, setHasEnded] = React.useState(false);
  const [, setIsReady] = React.useState(false);

  // Enhanced lazy loading for video content
  const { ref: lazyRef, wasVisible } = useLazyLoading({
    threshold: 0.2,
    rootMargin: '100px',
    triggerOnce: true
  });

  // Validate video URL on mount
  const isValidUrl = React.useMemo(() => isValidVideoUrl(video.url), [video.url]);

  // Always call hooks before any early returns
  const handlePlayClick = React.useCallback(() => {
    setIsPlaying(true);
    setHasStarted(true);
    setHasEnded(false);
  }, []);

  const handlePlay = React.useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = React.useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleEnded = React.useCallback(() => {
    setIsPlaying(false);
    setHasEnded(true);
    onEnded?.();
  }, [onEnded]);

  const handleReplay = React.useCallback(() => {
    setIsPlaying(true);
    setHasEnded(false);
  }, []);

  const handleReady = React.useCallback(() => {
    setIsReady(true);
  }, []);

  const handleStart = React.useCallback(() => {
    setHasStarted(true);
  }, []);

  // Early return for invalid URLs
  if (!isValidUrl) {
    return (
      <Card
        data-testid="video-introduction"
        className={cn("overflow-hidden", className)}
      >
        <CardContent className="p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium">Invalid Video URL</p>
            <p className="text-sm mt-1">Only secure video URLs from trusted platforms are allowed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={lazyRef as React.RefObject<HTMLDivElement>}
      data-testid="video-introduction"
      className={cn("overflow-hidden", className)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black">
          {!wasVisible ? (
            // Lazy loading placeholder
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-border rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Video will load when visible</p>
              </div>
            </div>
          ) : (
            // Actual video content
            <div>
              {!hasStarted && video.thumbnailUrl ? (
                // Thumbnail view
                <div className="relative w-full h-full">
                  <Image
                    src={video.thumbnailUrl}
                    alt={`${video.title} thumbnail`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Button
                      data-testid="play-overlay"
                      onClick={handlePlayClick}
                      size="lg"
                      className="rounded-full w-16 h-16 bg-card bg-opacity-90 hover:bg-opacity-100 text-black"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
              ) : !hasStarted && !video.thumbnailUrl ? (
                // Default thumbnail
                <div
                  data-testid="default-thumbnail"
                  className="relative w-full h-full bg-gray-900 flex items-center justify-center"
                >
                  <Button
                    data-testid="play-overlay"
                    onClick={handlePlayClick}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-card bg-opacity-90 hover:bg-opacity-100 text-black"
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
              ) : (
                // Video player
                <div className="relative w-full h-full">
                  {React.createElement(ReactPlayer as any, {
                    url: video.url,
                    playing: isPlaying,
                    controls: controls,
                    width: "100%",
                    height: "100%",
                    onPlay: handlePlay,
                    onPause: handlePause,
                    onEnded: handleEnded,
                    onReady: handleReady,
                    onStart: handleStart,
                  })}

                  {hasEnded && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Button
                        data-testid="replay-button"
                        onClick={handleReplay}
                        size="lg"
                        className="rounded-full"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Replay
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-foreground dark:text-gray-100 mb-2">
            {video.title}
          </h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm leading-relaxed">
            {video.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
