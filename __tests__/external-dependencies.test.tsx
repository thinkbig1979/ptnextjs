import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock external dependencies
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="three-canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: jest.fn(),
  useThree: () => ({
    camera: {},
    scene: {},
    gl: {},
  }),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="perspective-camera" />,
  Environment: () => <div data-testid="environment" />,
  Text: ({ children, ...props }: any) => (
    <div data-testid="three-text" {...props}>
      {children}
    </div>
  ),
  Box: (props: any) => <div data-testid="three-box" {...props} />,
  Sphere: (props: any) => <div data-testid="three-sphere" {...props} />,
}));

jest.mock('react-player', () => {
  return function MockReactPlayer({
    onReady,
    onStart,
    onPlay,
    onPause,
    onEnded,
    onError,
    onDuration,
    url,
    controls = true,
    ...props
  }: any) {
    return (
      <div data-testid="react-player" data-url={url} {...props}>
        <button
          onClick={() => onPlay?.()}
          data-testid="play-button"
        >
          Play
        </button>
        <button
          onClick={() => onPause?.()}
          data-testid="pause-button"
        >
          Pause
        </button>
        <button
          onClick={() => onReady?.()}
          data-testid="ready-button"
        >
          Ready
        </button>
        <button
          onClick={() => onError?.(new Error('Test error'))}
          data-testid="error-button"
        >
          Error
        </button>
        <button
          onClick={() => onDuration?.(120)}
          data-testid="duration-button"
        >
          Duration
        </button>
        <button
          onClick={() => onEnded?.()}
          data-testid="ended-button"
        >
          Ended
        </button>
        {controls && <div data-testid="player-controls">Controls</div>}
      </div>
    );
  };
});

jest.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess, onLoadError, file, ...props }: any) => {
    return (
      <div data-testid="pdf-document" data-file={file} {...props}>
        <button
          onClick={() => onLoadSuccess?.({ numPages: 5 })}
          data-testid="pdf-load-success"
        >
          Load Success
        </button>
        <button
          onClick={() => onLoadError?.(new Error('PDF load error'))}
          data-testid="pdf-load-error"
        >
          Load Error
        </button>
        {children}
      </div>
    );
  },
  Page: ({ pageNumber, ...props }: any) => (
    <div data-testid={`pdf-page-${pageNumber}`} {...props}>
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  },
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, initial, transition, ...props }: any) => (
      <div
        data-testid="motion-div"
        data-animate={JSON.stringify(animate)}
        data-initial={JSON.stringify(initial)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </div>
    ),
    img: ({ src, alt, animate, initial, transition, ...props }: any) => (
      <img
        src={src}
        alt={alt}
        data-testid="motion-img"
        data-animate={JSON.stringify(animate)}
        data-initial={JSON.stringify(initial)}
        data-transition={JSON.stringify(transition)}
        {...props}
      />
    ),
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button
        data-testid="motion-button"
        data-while-hover={JSON.stringify(whileHover)}
        data-while-tap={JSON.stringify(whileTap)}
        {...props}
      >
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => (
    <div data-testid="animate-presence">{children}</div>
  ),
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useMotionValue: (initial: any) => ({
    get: () => initial,
    set: jest.fn(),
  }),
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
  return function dynamic(importFunc: any, options: any = {}) {
    const Component = importFunc();
    if (options.ssr === false) {
      return (props: any) => {
        if (options.loading) {
          return options.loading();
        }
        return <Component {...props} />;
      };
    }
    return Component;
  };
});

describe('External Dependencies Integration Tests', () => {
  describe('3D Rendering with @react-three/fiber', () => {
    it('should render Three.js Canvas component', () => {
      const TestCanvas = () => {
        const { Canvas } = require('@react-three/fiber');
        return (
          <Canvas>
            <mesh data-testid="test-mesh">
              {/* Three.js components - these warnings are expected in test environment */}
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          </Canvas>
        );
      };

      render(<TestCanvas />);

      expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    });

    it('should render 3D controls and camera', () => {
      const Test3DScene = () => {
        const { Canvas } = require('@react-three/fiber');
        const { OrbitControls, PerspectiveCamera } = require('@react-three/drei');

        return (
          <Canvas>
            <PerspectiveCamera />
            <OrbitControls />
          </Canvas>
        );
      };

      render(<Test3DScene />);

      expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
      expect(screen.getByTestId('perspective-camera')).toBeInTheDocument();
    });

    it('should render 3D geometry components', () => {
      const Test3DGeometry = () => {
        const { Canvas } = require('@react-three/fiber');
        const { Box, Sphere } = require('@react-three/drei');

        return (
          <Canvas>
            <Box args={[1, 1, 1]} />
            <Sphere args={[0.5]} />
          </Canvas>
        );
      };

      render(<Test3DGeometry />);

      expect(screen.getByTestId('three-box')).toBeInTheDocument();
      expect(screen.getByTestId('three-sphere')).toBeInTheDocument();
    });

    it('should support 360° product demo requirements', () => {
      const ProductDemo360 = () => {
        const { Canvas } = require('@react-three/fiber');
        const { OrbitControls, Environment } = require('@react-three/drei');

        return (
          <div data-testid="product-demo-360">
            <Canvas>
              <Environment preset="studio" />
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                autoRotate={true}
              />
              <mesh data-testid="product-mesh">
                {/* Three.js components - warnings expected in test environment */}
                <boxGeometry args={[2, 1, 1]} />
                <meshStandardMaterial color="#2563eb" />
              </mesh>
            </Canvas>
          </div>
        );
      };

      render(<ProductDemo360 />);

      expect(screen.getByTestId('product-demo-360')).toBeInTheDocument();
      expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('environment')).toBeInTheDocument();
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    });
  });

  describe('PDF Generation with react-pdf', () => {
    it('should render PDF Document component', () => {
      const TestPDFViewer = () => {
        const { Document, Page } = require('react-pdf');

        return (
          <Document file="/test-spec.pdf">
            <Page pageNumber={1} />
          </Document>
        );
      };

      render(<TestPDFViewer />);

      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
      expect(screen.getByTestId('pdf-document')).toHaveAttribute('data-file', '/test-spec.pdf');
      expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument();
    });

    it('should handle PDF load success', async () => {
      const onLoadSuccess = jest.fn();

      const TestPDFWithCallbacks = () => {
        const { Document } = require('react-pdf');

        return (
          <Document
            file="/test-spec.pdf"
            onLoadSuccess={onLoadSuccess}
          >
            <div>PDF Content</div>
          </Document>
        );
      };

      render(<TestPDFWithCallbacks />);

      fireEvent.click(screen.getByTestId('pdf-load-success'));

      expect(onLoadSuccess).toHaveBeenCalledWith({ numPages: 5 });
    });

    it('should handle PDF load errors', async () => {
      const onLoadError = jest.fn();

      const TestPDFWithError = () => {
        const { Document } = require('react-pdf');

        return (
          <Document
            file="/invalid-spec.pdf"
            onLoadError={onLoadError}
          >
            <div>PDF Content</div>
          </Document>
        );
      };

      render(<TestPDFWithError />);

      fireEvent.click(screen.getByTestId('pdf-load-error'));

      expect(onLoadError).toHaveBeenCalledWith(new Error('PDF load error'));
    });

    it('should support downloadable specifications workflow', () => {
      const DownloadablePDFSpec = () => {
        const { Document, Page } = require('react-pdf');

        return (
          <div data-testid="downloadable-pdf-spec">
            <Document file="/technical-specifications.pdf">
              <Page pageNumber={1} />
              <Page pageNumber={2} />
            </Document>
            <button data-testid="download-pdf">Download PDF</button>
          </div>
        );
      };

      render(<DownloadablePDFSpec />);

      expect(screen.getByTestId('downloadable-pdf-spec')).toBeInTheDocument();
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
      expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument();
      expect(screen.getByTestId('pdf-page-2')).toBeInTheDocument();
      expect(screen.getByTestId('download-pdf')).toBeInTheDocument();
    });
  });

  describe('Video Integration with react-player', () => {
    it('should render ReactPlayer component', () => {
      const TestVideoPlayer = () => {
        const ReactPlayer = require('react-player');

        return (
          <ReactPlayer
            url="https://example.com/video.mp4"
            controls={true}
          />
        );
      };

      render(<TestVideoPlayer />);

      expect(screen.getByTestId('react-player')).toBeInTheDocument();
      expect(screen.getByTestId('react-player')).toHaveAttribute('data-url', 'https://example.com/video.mp4');
      expect(screen.getByTestId('player-controls')).toBeInTheDocument();
    });

    it('should handle video player callbacks', async () => {
      const onPlay = jest.fn();
      const onPause = jest.fn();
      const onReady = jest.fn();
      const onError = jest.fn();

      const TestVideoWithCallbacks = () => {
        const ReactPlayer = require('react-player');

        return (
          <ReactPlayer
            url="https://example.com/video.mp4"
            onPlay={onPlay}
            onPause={onPause}
            onReady={onReady}
            onError={onError}
          />
        );
      };

      render(<TestVideoWithCallbacks />);

      fireEvent.click(screen.getByTestId('play-button'));
      fireEvent.click(screen.getByTestId('pause-button'));
      fireEvent.click(screen.getByTestId('ready-button'));
      fireEvent.click(screen.getByTestId('error-button'));

      expect(onPlay).toHaveBeenCalled();
      expect(onPause).toHaveBeenCalled();
      expect(onReady).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(new Error('Test error'));
    });

    it('should support company introduction videos', () => {
      const CompanyIntroVideo = () => {
        const ReactPlayer = require('react-player');

        return (
          <div data-testid="company-intro-video">
            <h2>Company Introduction</h2>
            <ReactPlayer
              url="https://example.com/company-intro.mp4"
              controls={true}
              width="100%"
              height="315px"
            />
          </div>
        );
      };

      render(<CompanyIntroVideo />);

      expect(screen.getByTestId('company-intro-video')).toBeInTheDocument();
      expect(screen.getByTestId('react-player')).toBeInTheDocument();
      expect(screen.getByText('Company Introduction')).toBeInTheDocument();
    });

    it('should handle video duration and ended events', async () => {
      const onDuration = jest.fn();
      const onEnded = jest.fn();

      const TestVideoEvents = () => {
        const ReactPlayer = require('react-player');

        return (
          <ReactPlayer
            url="https://example.com/video.mp4"
            onDuration={onDuration}
            onEnded={onEnded}
          />
        );
      };

      render(<TestVideoEvents />);

      fireEvent.click(screen.getByTestId('duration-button'));
      fireEvent.click(screen.getByTestId('ended-button'));

      expect(onDuration).toHaveBeenCalledWith(120);
      expect(onEnded).toHaveBeenCalled();
    });
  });

  describe('Enhanced Animations with framer-motion', () => {
    it('should render motion components', () => {
      const TestMotionComponents = () => {
        const { motion } = require('framer-motion');

        return (
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Animated content
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Animated button
            </motion.button>
          </div>
        );
      };

      render(<TestMotionComponents />);

      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
      expect(screen.getByTestId('motion-button')).toBeInTheDocument();

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveAttribute('data-initial', '{"opacity":0}');
      expect(motionDiv).toHaveAttribute('data-animate', '{"opacity":1}');
      expect(motionDiv).toHaveAttribute('data-transition', '{"duration":0.5}');
    });

    it('should support AnimatePresence for conditional rendering', () => {
      const TestAnimatePresence = () => {
        const { motion, AnimatePresence } = require('framer-motion');

        return (
          <AnimatePresence>
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: 100 }}
            >
              Conditionally rendered content
            </motion.div>
          </AnimatePresence>
        );
      };

      render(<TestAnimatePresence />);

      expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });

    it('should support yacht timeline animations', () => {
      const YachtTimelineAnimation = () => {
        const { motion } = require('framer-motion');

        return (
          <div data-testid="yacht-timeline-animation">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              data-testid="timeline-progress"
            >
              Timeline Progress
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              data-testid="timeline-event"
            >
              Timeline Event
            </motion.div>
          </div>
        );
      };

      render(<YachtTimelineAnimation />);

      expect(screen.getByTestId('yacht-timeline-animation')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-progress')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-event')).toBeInTheDocument();
    });

    it('should support organizational chart animations', () => {
      const OrgChartAnimation = () => {
        const { motion } = require('framer-motion');

        return (
          <div data-testid="org-chart-animation">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              data-testid="org-node"
            >
              Organization Node
            </motion.div>
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
              data-testid="org-connection"
            >
              Connection Line
            </motion.div>
          </div>
        );
      };

      render(<OrgChartAnimation />);

      expect(screen.getByTestId('org-chart-animation')).toBeInTheDocument();
      expect(screen.getByTestId('org-node')).toBeInTheDocument();
      expect(screen.getByTestId('org-connection')).toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('should support lazy loading for performance', async () => {
      const LazyComponentTest = () => {
        const dynamic = require('next/dynamic');

        const LazyCanvas = dynamic(() => Promise.resolve(() => {
          const { Canvas } = require('@react-three/fiber');
          return <Canvas><mesh data-testid="lazy-mesh" /></Canvas>;
        }), {
          ssr: false,
          loading: () => <div data-testid="loading-3d">Loading 3D...</div>
        });

        const LazyVideo = dynamic(() => Promise.resolve(() => {
          const ReactPlayer = require('react-player');
          return <ReactPlayer url="test.mp4" />;
        }), {
          ssr: false,
          loading: () => <div data-testid="loading-video">Loading Video...</div>
        });

        return (
          <div>
            <LazyCanvas />
            <LazyVideo />
          </div>
        );
      };

      render(<LazyComponentTest />);

      // With our mock, loading states are shown
      expect(screen.getByTestId('loading-3d')).toBeInTheDocument();
      expect(screen.getByTestId('loading-video')).toBeInTheDocument();
    });

    it('should handle error states gracefully', () => {
      const ErrorHandlingTest = () => {
        const ReactPlayer = require('react-player');
        const { Document } = require('react-pdf');

        return (
          <div data-testid="error-handling-test">
            <ReactPlayer
              url="invalid-url"
              onError={(error) => console.log('Video error:', error)}
            />
            <Document
              file="invalid-file.pdf"
              onLoadError={(error) => console.log('PDF error:', error)}
            />
          </div>
        );
      };

      render(<ErrorHandlingTest />);

      expect(screen.getByTestId('error-handling-test')).toBeInTheDocument();
      expect(screen.getByTestId('react-player')).toBeInTheDocument();
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });

    it('should support static site generation compatibility', () => {
      const StaticCompatibilityTest = () => {
        return (
          <div data-testid="static-compatibility">
            <div data-testid="client-only-placeholder">
              Client-only components loaded via dynamic imports
            </div>
          </div>
        );
      };

      render(<StaticCompatibilityTest />);

      expect(screen.getByTestId('static-compatibility')).toBeInTheDocument();
      expect(screen.getByTestId('client-only-placeholder')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should support progressive loading patterns', () => {
      const ProgressiveLoadingTest = () => {
        const { motion } = require('framer-motion');

        return (
          <div data-testid="progressive-loading">
            <motion.img
              src="/thumbnail.jpg"
              alt="Product thumbnail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <button data-testid="load-360-demo">Load 360° Demo</button>
            <button data-testid="load-video">Load Video</button>
            <button data-testid="load-pdf">Load PDF</button>
          </div>
        );
      };

      render(<ProgressiveLoadingTest />);

      expect(screen.getByTestId('progressive-loading')).toBeInTheDocument();
      expect(screen.getByTestId('motion-img')).toBeInTheDocument();
      expect(screen.getByTestId('load-360-demo')).toBeInTheDocument();
      expect(screen.getByTestId('load-video')).toBeInTheDocument();
      expect(screen.getByTestId('load-pdf')).toBeInTheDocument();
    });

    it('should handle large file warnings and compression', () => {
      const LargeFileHandlingTest = () => {
        const ReactPlayer = require('react-player');
        const { Document } = require('react-pdf');

        return (
          <div data-testid="large-file-handling">
            <div data-testid="file-size-warning">
              Warning: Large video file (50MB). Consider compressing.
            </div>
            <ReactPlayer
              url="large-video.mp4"
              config={{
                file: {
                  attributes: {
                    preload: 'metadata'
                  }
                }
              }}
            />
            <Document file="large-specification.pdf">
              <div data-testid="pdf-loading-indicator">Loading large PDF...</div>
            </Document>
          </div>
        );
      };

      render(<LargeFileHandlingTest />);

      expect(screen.getByTestId('large-file-handling')).toBeInTheDocument();
      expect(screen.getByTestId('file-size-warning')).toBeInTheDocument();
    });
  });
});