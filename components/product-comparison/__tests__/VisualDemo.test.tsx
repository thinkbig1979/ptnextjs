import * as React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VisualDemo } from '../VisualDemo';
import type { VisualDemoContent } from '@/lib/types';

// Mock @react-three/fiber for 3D rendering tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => (
    <div data-testid="three-canvas">{children}</div>
  ),
  useFrame: () => {},
  useThree: () => ({ camera: {}, scene: {} })
}));

// Mock @react-three/drei for 3D controls
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  PerspectiveCamera: () => <div data-testid="perspective-camera" />,
  Box: () => <div data-testid="box" />,
  Text: () => <div data-testid="text" />,
  useGLTF: () => ({ scene: { clone: () => ({}) } })
}));

// Mock react-player
jest.mock('react-player', () => {
  return function MockReactPlayer() {
    return <div data-testid="react-player" />;
  };
});

// Mock useLazyLoading hook with controllable state
const mockUseLazyLoading = jest.fn();
jest.mock('@/lib/hooks/use-lazy-loading', () => ({
  useLazyLoading: () => mockUseLazyLoading(),
  usePerformanceMetrics: () => ({
    startMeasure: jest.fn(),
    endMeasure: jest.fn(),
    getMetrics: jest.fn(() => ({}))
  })
}));

describe('VisualDemo', () => {
  // Default mock behavior - visible (loaded state)
  beforeEach(() => {
    mockUseLazyLoading.mockReturnValue({
      ref: React.createRef(),
      isVisible: true,
      wasVisible: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockVisualContent: VisualDemoContent = {
    type: '360-image',
    title: 'Navigation System 360 View',
    description: 'Interactive 360 demonstration of the navigation system interface',
    imageUrl: '/images/demos/nav-system-360.jpg',
    hotspots: [
      {
        position: { x: 0.3, y: 0.5 },
        title: 'Main Display',
        description: 'Primary navigation display with chart integration',
        action: 'highlight'
      }
    ]
  };

  const mock3DContent: VisualDemoContent = {
    type: '3d-model',
    title: 'Navigation System 3D Model',
    description: '3D model showing the complete navigation system installation',
    modelUrl: '/models/nav-system.glb',
    animations: ['rotation', 'zoom'],
    materials: {
      display: { color: '#1a1a1a', metalness: 0.8 }
    }
  };

  it('renders 360 image demo with controls', () => {
    render(<VisualDemo content={mockVisualContent} />);
    expect(screen.getByTestId('visual-demo')).toBeInTheDocument();
    expect(screen.getByTestId('360-viewer')).toBeInTheDocument();
    expect(screen.getByText('Navigation System 360 View')).toBeInTheDocument();
  });

  it('displays 360 image hotspots', () => {
    render(<VisualDemo content={mockVisualContent} showHotspots />);
    expect(screen.getByTestId(/hotspot-/)).toBeInTheDocument();
  });

  it('handles hotspot interactions', () => {
    const mockOnHotspotClick = jest.fn();
    render(
      <VisualDemo
        content={mockVisualContent}
        showHotspots
        onHotspotClick={mockOnHotspotClick}
      />
    );
    fireEvent.click(screen.getByTestId(/hotspot-/));
    expect(mockOnHotspotClick).toHaveBeenCalled();
  });

  it('renders 3D model demo with Three.js canvas', () => {
    render(<VisualDemo content={mock3DContent} />);
    expect(screen.getByTestId('visual-demo')).toBeInTheDocument();
    expect(screen.getByTestId('3d-model-viewer')).toBeInTheDocument();
  });

  it('shows 3D model controls when enabled', () => {
    render(<VisualDemo content={mock3DContent} showControls />);
    expect(screen.getByTestId('3d-controls-panel')).toBeInTheDocument();
  });

  it('handles auto-rotation for 3D models', () => {
    render(<VisualDemo content={mock3DContent} autoRotate />);
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('supports fullscreen mode toggle', async () => {
    render(<VisualDemo content={mockVisualContent} allowFullscreen />);
    fireEvent.click(screen.getByTestId('fullscreen-toggle'));
    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-viewer')).toBeInTheDocument();
    });
  });

  it('displays loading state during content load', () => {
    render(<VisualDemo content={mockVisualContent} loading />);
    expect(screen.getByTestId('visual-demo-loading')).toBeInTheDocument();
  });

  it('handles error state when content fails to load', () => {
    const errorContent = { ...mockVisualContent, imageUrl: '/invalid-image.jpg' };
    render(<VisualDemo content={errorContent} onError={() => {}} />);
    expect(screen.getByTestId('visual-demo')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <VisualDemo
        content={mockVisualContent}
        className="custom-demo-class"
      />
    );
    expect(screen.getByTestId('visual-demo')).toHaveClass('custom-demo-class');
  });

  it('supports lazy loading for performance', () => {
    // Mock not-yet-visible state for lazy loading test
    mockUseLazyLoading.mockReturnValue({
      ref: React.createRef(),
      isVisible: false,
      wasVisible: false
    });
    render(<VisualDemo content={mockVisualContent} lazyLoad />);
    expect(screen.getByTestId('lazy-load-placeholder')).toBeInTheDocument();
  });

  it('shows progress indicator for 3D model loading', () => {
    render(<VisualDemo content={mock3DContent} showLoadingProgress />);
    expect(screen.getByTestId('model-loading-progress')).toBeInTheDocument();
  });

  it('handles responsive design for mobile devices', () => {
    render(<VisualDemo content={mockVisualContent} />);
    const demoContainer = screen.getByTestId('visual-demo');
    expect(demoContainer).toHaveClass('w-full');
  });

  it('supports gesture controls for mobile 360 viewing', () => {
    render(<VisualDemo content={mockVisualContent} enableGestures />);
    expect(screen.getByTestId('gesture-controls')).toBeInTheDocument();
  });

  it('displays demo metadata and information', () => {
    render(<VisualDemo content={mockVisualContent} showInfo />);
    expect(screen.getByText(mockVisualContent.title)).toBeInTheDocument();
  });

  it('supports demo sharing functionality', () => {
    render(<VisualDemo content={mockVisualContent} allowSharing />);
    expect(screen.getByTestId('share-demo-button')).toBeInTheDocument();
  });

  it('tracks interaction analytics when enabled', () => {
    const mockOnInteraction = jest.fn();
    render(
      <VisualDemo
        content={mockVisualContent}
        onInteraction={mockOnInteraction}
      />
    );
    expect(screen.getByTestId('visual-demo')).toBeInTheDocument();
  });

  it('provides accessibility controls and keyboard navigation', () => {
    render(<VisualDemo content={mockVisualContent} accessible />);
    expect(screen.getByTestId('accessibility-controls')).toBeInTheDocument();
  });

  it('handles VR mode for compatible devices', () => {
    render(<VisualDemo content={mock3DContent} enableVR />);
    expect(screen.getByTestId('vr-mode-button')).toBeInTheDocument();
  });

  it('shows performance metrics when enabled', () => {
    render(<VisualDemo content={mock3DContent} showPerformanceMetrics />);
    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
  });

  it('supports custom camera positions for 3D models', () => {
    const contentWithCameraPositions = {
      ...mock3DContent,
      cameraPositions: [
        { name: 'Front View', position: [0, 0, 5] },
        { name: 'Side View', position: [5, 0, 0] }
      ]
    };
    render(<VisualDemo content={contentWithCameraPositions} />);
    expect(screen.getByTestId('3d-model-viewer')).toBeInTheDocument();
  });
});
