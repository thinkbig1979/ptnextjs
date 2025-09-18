"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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

// Mock Three.js components - in a real implementation these would be from @react-three/fiber
const MockCanvas = ({ children, ...props }: any) => (
  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center" data-testid="three-canvas">
    {children}
  </div>
);

const MockOrbitControls = () => <div data-testid="orbit-controls" />;
const MockEnvironment = () => <div data-testid="environment" />;

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
  const [isLoaded, setIsLoaded] = React.useState(!lazyLoad);
  const [showInfoPanel, setShowInfoPanel] = React.useState(false);
  const [currentContent, setCurrentContent] = React.useState(0);
  const [fps, setFps] = React.useState(60);
  const [isMuted, setIsMuted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const intersectionRef = React.useRef<HTMLDivElement>(null);

  const contentArray = Array.isArray(content) ? content : [content];
  const activeContent = contentArray[currentContent];

  // Lazy loading with Intersection Observer
  React.useEffect(() => {
    if (!lazyLoad || isLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoaded(true);
          // Simulate loading progress
          const interval = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                return 100;
              }
              return prev + 10;
            });
          }, 100);
        }
      },
      { threshold: 0.1 }
    );

    if (intersectionRef.current) {
      observer.observe(intersectionRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, isLoaded]);

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
    <div className="relative w-full h-64 lg:h-96 bg-gray-100 rounded-lg overflow-hidden" data-testid="360-viewer">
      {activeContent.imageUrl ? (
        <img
          src={activeContent.imageUrl}
          alt={activeContent.title}
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
    <div className="relative w-full h-64 lg:h-96" data-testid="3d-model-viewer">
      <MockCanvas>
        <MockOrbitControls />
        <MockEnvironment />
        <div className="text-center text-muted-foreground">
          <div className="bg-white/90 rounded-lg p-6 inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <div className="text-white font-bold text-lg">3D</div>
            </div>
            <p className="font-medium">{activeContent.title}</p>
            <p className="text-sm text-muted-foreground">3D Model Viewer</p>
            {activeContent.modelUrl && (
              <p className="text-xs text-blue-600 mt-2">Model: {activeContent.modelUrl.split('/').pop()}</p>
            )}
          </div>
        </div>
      </MockCanvas>

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
    <div className="relative w-full h-64 lg:h-96 bg-black rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center">
          <Play className="h-16 w-16 mx-auto mb-4" />
          <p className="font-medium">{activeContent.title}</p>
          <p className="text-sm text-gray-300">Video Demo</p>
          {activeContent.videoUrl && (
            <p className="text-xs text-blue-400 mt-2">Source: {activeContent.videoUrl}</p>
          )}
        </div>
      </div>
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
      ref={containerRef}
      className={cn("w-full", isFullscreen && "fixed inset-0 z-50 bg-black", className)}
      data-testid="visual-demo"
    >
      <div ref={intersectionRef}>
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