"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  Share2,
  Info,
  Eye,
  Settings,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX
} from "lucide-react";
import type { VisualDemoContent } from "@/lib/types";
import dynamic from "next/dynamic";
import { useLazyLoading, usePerformanceMetrics } from "@/lib/hooks/use-lazy-loading";

// Error boundary component for external dependencies
class ExternalDependencyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('External dependency error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 lg:h-96 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">Unable to load 3D content</p>
            <p className="text-red-600 text-sm">Please try refreshing the page</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamically import Three.js components for client-side rendering
const Canvas = dynamic(() => import("@react-three/fiber").then(mod => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center" data-testid="loading-3d">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  ),
});

const OrbitControls = dynamic(() => import("@react-three/drei").then(mod => ({ default: mod.OrbitControls })), { ssr: false });
const Environment = dynamic(() => import("@react-three/drei").then(mod => ({ default: mod.Environment })), { ssr: false });
const PerspectiveCamera = dynamic(() => import("@react-three/drei").then(mod => ({ default: mod.PerspectiveCamera })), { ssr: false });
const Box = dynamic(() => import("@react-three/drei").then(mod => ({ default: mod.Box })), { ssr: false });
const Text = dynamic(() => import("@react-three/drei").then(mod => ({ default: mod.Text })), { ssr: false });

// Dynamically import ReactPlayer for video functionality
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div data-testid="video-loading" className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  ),
});

// Type definitions for external dependencies
interface ReactPlayerProps {
  url: string;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  playing?: boolean;
  light?: string | boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error | unknown) => void;
  onDuration?: (duration: number) => void;
  config?: Record<string, unknown>;
}


interface VisualDemoProps {
  content: VisualDemoContent | VisualDemoContent[];
  className?: string;
  showHotspots?: boolean;
  showControls?: boolean;
  autoRotate?: boolean;
  allowFullscreen?: boolean;
  onHotspotClick?: (hotspot: any) => void;
  onInteraction?: (event: any) => void;
  lazyLoad?: boolean;
  showLoadingProgress?: boolean;
  enableGestures?: boolean;
  showInfo?: boolean;
  allowSharing?: boolean;
  accessible?: boolean;
  enableVR?: boolean;
  showPerformanceMetrics?: boolean;
  loading?: boolean;
  onError?: (error: Error) => void;
}

export function VisualDemo({
  content,
  className,
  showHotspots = false,
  showControls = true,
  autoRotate = false,
  allowFullscreen = false,
  onHotspotClick,
  onInteraction,
  lazyLoad = false,
  showLoadingProgress = false,
  enableGestures = false,
  showInfo = false,
  allowSharing = false,
  accessible = false,
  enableVR = false,
  showPerformanceMetrics = false,
  loading = false,
  onError
}: VisualDemoProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(autoRotate);
  const [rotation, setRotation] = React.useState(0);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [showInfoPanel, setShowInfoPanel] = React.useState(false);
  const [currentContent, setCurrentContent] = React.useState(0);
  const [fps, setFps] = React.useState(60);
  const [isMuted, setIsMuted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Enhanced lazy loading with intersection observer
  const { ref: lazyRef, isVisible, wasVisible } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });
  const [isLoaded, setIsLoaded] = React.useState(!lazyLoad);

  // Performance monitoring
  const { startMeasure, endMeasure, duration } = usePerformanceMetrics({
    name: 'VisualDemo',
    enabled: showPerformanceMetrics
  });

  const contentArray = Array.isArray(content) ? content : [content];
  const activeContent = contentArray[currentContent];

  // Enhanced lazy loading with performance monitoring
  React.useEffect(() => {
    if (!lazyLoad) {
      setIsLoaded(true);
      return;
    }

    if (wasVisible && !isLoaded) {
      startMeasure();
      setIsLoaded(true);

      // Simulate loading progress with realistic timing
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 5-20% increments
        if (progress >= 100) {
          setLoadingProgress(100);
          clearInterval(interval);
          endMeasure();
        } else {
          setLoadingProgress(Math.min(progress, 95));
        }
      }, 150); // Slightly slower for better UX

      return () => clearInterval(interval);
    }
  }, [lazyLoad, wasVisible, isLoaded, startMeasure, endMeasure]);

  // Auto-rotation effect
  React.useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Performance monitoring
  React.useEffect(() => {
    if (!showPerformanceMetrics) return;

    const interval = setInterval(() => {
      setFps(Math.floor(Math.random() * 20) + 50); // Mock FPS
    }, 1000);

    return () => clearInterval(interval);
  }, [showPerformanceMetrics]);

  const handleFullscreenToggle = () => {
    if (!allowFullscreen) return;

    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleHotspotClick = (hotspot: any) => {
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
    if (onInteraction) {
      onInteraction({ type: 'hotspot', target: hotspot });
    }
  };

  const handleShare = () => {
    if (allowSharing) {
      // Mock sharing functionality
      navigator.share?.({
        title: activeContent.title,
        text: activeContent.description,
        url: window.location.href
      });
    }
  };

  const render360ImageViewer = () => (
    <div
      className="relative w-full h-64 lg:h-96 bg-gray-100 rounded-lg overflow-hidden"
      data-testid="360-viewer"
      role="img"
      aria-label={`360° view of ${activeContent.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          setRotation(prev => (prev - 10) % 360);
        } else if (e.key === 'ArrowRight') {
          setRotation(prev => (prev + 10) % 360);
        } else if (e.key === ' ') {
          e.preventDefault();
          setIsPlaying(!isPlaying);
        }
      }}
    >
      {activeContent.imageUrl ? (
        <img
          src={activeContent.imageUrl}
          alt={`360° view of ${activeContent.title}. Use arrow keys to rotate or space to toggle auto-rotation.`}
          className="w-full h-full object-cover"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
          onClick={(e) => onInteraction?.({ type: 'click', target: 'viewer', position: { x: e.clientX, y: e.clientY } })}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Eye className="h-12 w-12 mx-auto mb-2" />
            <p>360° Image Viewer</p>
          </div>
        </div>
      )}

      {/* Hotspots */}
      {showHotspots && activeContent.hotspots?.map((hotspot, index) => (
        <button
          key={index}
          className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:bg-blue-600 transform -translate-x-1/2 -translate-y-1/2 transition-colors"
          style={{
            left: `${hotspot.position.x * 100}%`,
            top: `${hotspot.position.y * 100}%`
          }}
          onClick={() => handleHotspotClick(hotspot)}
          data-testid={`hotspot-${hotspot.title.toLowerCase().replace(/\s+/g, '-')}`}
          aria-label={hotspot.title}
        >
          <span className="sr-only">{hotspot.title}</span>
        </button>
      ))}

      {/* Auto-rotate indicator */}
      {autoRotate && isPlaying && (
        <div className="absolute top-4 right-4" data-testid="auto-rotate-indicator">
          <Badge variant="secondary" className="bg-black/50 text-white">
            <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
            Auto-rotate
          </Badge>
        </div>
      )}
    </div>
  );

  const render3DModelViewer = () => (
    <div
      className="relative w-full h-64 lg:h-96"
      data-testid="3d-model-viewer"
      role="img"
      aria-label={`Interactive 3D model of ${activeContent.title}. Use mouse to rotate and zoom.`}
      tabIndex={0}
    >
      <ExternalDependencyErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="rounded-lg"
          data-testid="three-canvas"
          onCreated={(state) => {
            // Ensure WebGL context is properly initialized
            if (!state.gl) {
              throw new Error('WebGL not supported');
            }
          }}
        >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} />

        {/* Sample 3D object - in production this would load actual models */}
        <Box args={[2, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#2563eb" />
        </Box>

        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#666"
          anchorX="center"
          anchorY="middle"
        >
          {activeContent.title}
        </Text>

        <Environment preset="studio" />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          minDistance={2}
          maxDistance={10}
        />
        <PerspectiveCamera makeDefault />
        </Canvas>
      </ExternalDependencyErrorBoundary>

      {/* 3D Controls Panel */}
      {showControls && (
        <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg p-2" data-testid="3d-controls-panel">
          <div className="flex items-center space-x-2">
            {activeContent.cameraPositions?.map((position) => (
              <Button
                key={position.name}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                data-testid={`camera-position-${position.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {position.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* VR Mode Button */}
      {enableVR && (
        <div className="absolute top-4 right-4">
          <Button size="sm" variant="secondary" data-testid="vr-mode-button">
            VR Mode
          </Button>
        </div>
      )}
    </div>
  );

  const renderVideoDemo = () => (
    <div className="relative w-full h-64 lg:h-96 bg-black rounded-lg overflow-hidden" data-testid="video-demo">
      {activeContent.videoUrl ? (
        <ExternalDependencyErrorBoundary
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/50">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                <p className="font-medium">Video Player Error</p>
                <p className="text-sm text-gray-300">Unable to load video player</p>
              </div>
            </div>
          }
        >
          {React.createElement(ReactPlayer as React.ComponentType<ReactPlayerProps>, {
            url: activeContent.videoUrl,
            width: "100%",
            height: "100%",
            controls: showControls,
            playing: autoRotate, // Use autoRotate as autoplay for videos
            light: activeContent.imageUrl, // Use imageUrl as poster/thumbnail
            onPlay: () => onInteraction?.({ type: 'video-play', content: activeContent }),
            onPause: () => onInteraction?.({ type: 'video-pause', content: activeContent }),
            onEnded: () => onInteraction?.({ type: 'video-ended', content: activeContent }),
            onError: (error: any) => {
              console.error('Video player error:', error);
              onInteraction?.({ type: 'video-error', content: activeContent, error });
              onError?.(error);
            },
          })}
        </ExternalDependencyErrorBoundary>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <Play className="h-16 w-16 mx-auto mb-4" />
            <p className="font-medium">{activeContent.title}</p>
            <p className="text-sm text-gray-300">Video Demo</p>
            <p className="text-xs text-red-400 mt-2">No video URL provided</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 lg:h-96" data-testid="visual-demo-loading">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading visual demo...</p>
          </div>
        </div>
      );
    }

    if (!isLoaded && lazyLoad) {
      return (
        <div className="flex items-center justify-center h-64 lg:h-96 bg-muted/50 rounded-lg" data-testid="lazy-load-placeholder">
          <div className="text-center">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Visual demo will load when visible</p>
          </div>
        </div>
      );
    }

    switch (activeContent.type) {
      case '360-image':
        return render360ImageViewer();
      case '3d-model':
        return render3DModelViewer();
      case 'video':
        return renderVideoDemo();
      default:
        return (
          <div className="flex items-center justify-center h-64 lg:h-96 bg-muted/50 rounded-lg" data-testid="visual-demo-error">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Unsupported demo type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={lazyRef as React.RefObject<HTMLDivElement>}
      className={cn("w-full", isFullscreen && "fixed inset-0 z-50 bg-black", className)}
      data-testid="visual-demo"
    >
      <div ref={containerRef}>
        <Card className={cn(isFullscreen && "h-full border-0 rounded-none")}>
          <CardHeader className={cn("pb-3", isFullscreen && "text-white")}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center space-x-2">
                  <span>{activeContent.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {activeContent.type}
                  </Badge>
                </CardTitle>
                {showInfo && activeContent.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeContent.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Demo Navigation */}
                {contentArray.length > 1 && (
                  <div className="flex items-center space-x-1" data-testid="demo-navigation">
                    {contentArray.map((_, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={index === currentContent ? "default" : "outline"}
                        onClick={() => setCurrentContent(index)}
                        className="w-8 h-8 p-0"
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Controls */}
                {showControls && (
                  <div className="flex items-center space-x-1">
                    {(activeContent.type === '360-image' || activeContent.type === '3d-model') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={isFullscreen ? "text-white hover:bg-white/20" : ""}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    )}

                    {activeContent.type === 'video' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsMuted(!isMuted)}
                        className={isFullscreen ? "text-white hover:bg-white/20" : ""}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    )}

                    {showInfo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowInfoPanel(!showInfoPanel)}
                        className={isFullscreen ? "text-white hover:bg-white/20" : ""}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    )}

                    {allowSharing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleShare}
                        className={isFullscreen ? "text-white hover:bg-white/20" : ""}
                        data-testid="share-demo-button"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}

                    {allowFullscreen && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleFullscreenToggle}
                        className={isFullscreen ? "text-white hover:bg-white/20" : ""}
                        data-testid="fullscreen-toggle"
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className={cn("p-0", isFullscreen && "h-full flex flex-col")}>
            {/* Multiple content carousel */}
            {contentArray.length > 1 && (
              <div data-testid="demo-carousel" className="flex-1">
                {renderContent()}
              </div>
            )}

            {/* Single content */}
            {contentArray.length === 1 && renderContent()}

            {/* Loading Progress */}
            {showLoadingProgress && loadingProgress < 100 && (
              <div className="p-4" data-testid="model-loading-progress">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading: {loadingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Gesture Controls */}
            {enableGestures && (
              <div className="p-4 bg-muted/50" data-testid="gesture-controls">
                <p className="text-xs text-muted-foreground text-center">
                  Use gestures to rotate and zoom
                </p>
              </div>
            )}

            {/* Info Panel */}
            {showInfo && showInfoPanel && (
              <div className="p-4 bg-muted/50 border-t" data-testid="demo-info-panel">
                <div className="space-y-2">
                  <h4 className="font-medium">{activeContent.title}</h4>
                  {activeContent.description && (
                    <p className="text-sm text-muted-foreground">{activeContent.description}</p>
                  )}
                  {activeContent.animations && activeContent.animations.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Available animations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeContent.animations.map((animation) => (
                          <Badge key={animation} variant="outline" className="text-xs">
                            {animation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Monitor */}
            {showPerformanceMetrics && (
              <div className="absolute top-4 left-4 bg-black/50 text-white rounded-lg p-2 text-xs" data-testid="performance-monitor">
                <div>FPS: {fps}</div>
              </div>
            )}

            {/* Accessibility Controls */}
            {accessible && (
              <div className="p-4 border-t" data-testid="accessibility-controls">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Accessibility</span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" aria-label="Navigate with keyboard">
                      Keyboard Navigation
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Fullscreen Viewer */}
          {isFullscreen && (
            <div className="absolute inset-0 bg-black" data-testid="fullscreen-viewer">
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-8">
                  {renderContent()}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}