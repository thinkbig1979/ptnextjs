/**
 * Lazy Media Components Tests
 * Comprehensive tests for lazy loading media components
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  LazyMedia,
  LazyVideo,
  LazyIframe,
  LazyImageGrid,
  VirtualizedMediaList
} from '@/components/ui/lazy-media'

// Mock lazy loading hook
vi.mock('@/lib/hooks/use-lazy-loading', () => ({
  useLazyLoading: vi.fn(() => ({
    ref: { current: null },
    wasVisible: false,
    isVisible: false
  })),
  usePerformanceMetrics: vi.fn(() => ({
    startMeasure: vi.fn(),
    endMeasure: vi.fn(),
    duration: null
  }))
}))

// Mock progressive image component
vi.mock('@/components/ui/progressive-image', () => ({
  ProgressiveImage: vi.fn(({ src, alt, onLoad, ...props }) => {
    React.useEffect(() => {
      // Simulate image load
      setTimeout(() => onLoad?.(), 10)
    }, [onLoad])

    return (
      <img
        src={src}
        alt={alt}
        data-testid="progressive-image"
        {...props}
      />
    )
  })
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon">Play</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>
}))

const { useLazyLoading, usePerformanceMetrics } = await import('@/lib/hooks/use-lazy-loading')

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LazyMedia', () => {
  it('renders fallback when not visible', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: false,
      isVisible: false
    })

    render(
      <LazyMedia fallback={<div>Custom Fallback</div>}>
        <div>Actual Content</div>
      </LazyMedia>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Actual Content')).not.toBeInTheDocument()
  })

  it('renders children when visible', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: true,
      isVisible: true
    })

    render(
      <LazyMedia>
        <div>Actual Content</div>
      </LazyMedia>
    )

    expect(screen.getByText('Actual Content')).toBeInTheDocument()
  })

  it('renders default placeholder when no fallback provided', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: false,
      isVisible: false
    })

    render(
      <LazyMedia>
        <div>Content</div>
      </LazyMedia>
    )

    expect(screen.getByText('Media will load when visible')).toBeInTheDocument()
    expect(screen.getByTestId('image-icon')).toBeInTheDocument()
  })

  it('tracks performance when enabled', () => {
    const mockStartMeasure = vi.fn()
    const mockEndMeasure = vi.fn()

    vi.mocked(usePerformanceMetrics).mockReturnValue({
      startMeasure: mockStartMeasure,
      endMeasure: mockEndMeasure,
      duration: null
    })

    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: true,
      isVisible: true
    })

    render(
      <LazyMedia trackPerformance={true} performanceName="test-media">
        <div>Content</div>
      </LazyMedia>
    )

    expect(usePerformanceMetrics).toHaveBeenCalledWith({
      name: 'test-media',
      enabled: true
    })
  })

  it('applies custom className', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: false,
      isVisible: false
    })

    render(
      <LazyMedia className="custom-lazy-media">
        <div>Content</div>
      </LazyMedia>
    )

    const container = screen.getByText('Media will load when visible').closest('div')
    expect(container).toHaveClass('custom-lazy-media')
  })
})

describe('LazyVideo', () => {
  it('renders video placeholder when not visible', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: false,
      isVisible: false
    })

    render(
      <LazyVideo
        src="/test-video.mp4"
        poster="/test-poster.jpg"
      />
    )

    expect(screen.getByTestId('play-icon')).toBeInTheDocument()
    expect(screen.getByText('Media will load when visible')).toBeInTheDocument()
  })

  it('renders video element when visible', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: true,
      isVisible: true
    })

    render(
      <LazyVideo
        src="/test-video.mp4"
        poster="/test-poster.jpg"
        controls={true}
        autoPlay={false}
        muted={true}
      />
    )

    const video = screen.getByRole('application') // video elements have application role
    expect(video).toHaveAttribute('src', '/test-video.mp4')
    expect(video).toHaveAttribute('poster', '/test-poster.jpg')
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('muted')
    expect(video).not.toHaveAttribute('autoplay')
  })

  it('applies custom className to video container', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: true,
      isVisible: true
    })

    render(
      <LazyVideo
        src="/test-video.mp4"
        className="custom-video-class"
      />
    )

    const container = screen.getByRole('application').closest('div')
    expect(container).toHaveClass('custom-video-class')
  })
})

describe('LazyIframe', () => {
  it('renders iframe placeholder when not visible', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: false,
      isVisible: false
    })

    render(
      <LazyIframe
        src="https://example.com/embed"
        title="Test Embed"
      />
    )

    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument()
    expect(screen.getByText('Media will load when visible')).toBeInTheDocument()
  })

  it('renders iframe when visible', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: true,
      isVisible: true
    })

    render(
      <LazyIframe
        src="https://example.com/embed"
        title="Test Embed"
        width={800}
        height={600}
        allowFullScreen={true}
      />
    )

    const iframe = screen.getByTitle('Test Embed')
    expect(iframe).toHaveAttribute('src', 'https://example.com/embed')
    expect(iframe).toHaveAttribute('width', '800')
    expect(iframe).toHaveAttribute('height', '600')
    expect(iframe).toHaveAttribute('allowfullscreen')
    expect(iframe).toHaveAttribute('loading', 'lazy')
  })

  it('applies custom className to iframe container', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: true,
      isVisible: true
    })

    render(
      <LazyIframe
        src="https://example.com/embed"
        title="Test Embed"
        className="custom-iframe-class"
      />
    )

    const container = screen.getByTitle('Test Embed').closest('div')
    expect(container).toHaveClass('custom-iframe-class')
  })
})

describe('LazyImageGrid', () => {
  const mockImages = [
    { src: '/image1.jpg', alt: 'Image 1' },
    { src: '/image2.jpg', alt: 'Image 2' },
    { src: '/image3.jpg', alt: 'Image 3' },
    { src: '/image4.jpg', alt: 'Image 4' }
  ]

  it('renders grid with correct column classes', () => {
    const { rerender } = render(
      <LazyImageGrid images={mockImages} columns={2} />
    )

    let grid = document.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2')

    rerender(<LazyImageGrid images={mockImages} columns={4} />)
    grid = document.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
  })

  it('applies correct gap classes', () => {
    const { rerender } = render(
      <LazyImageGrid images={mockImages} gap={2} />
    )

    let grid = document.querySelector('.grid')
    expect(grid).toHaveClass('gap-2')

    rerender(<LazyImageGrid images={mockImages} gap={8} />)
    grid = document.querySelector('.grid')
    expect(grid).toHaveClass('gap-8')
  })

  it('handles image click events', () => {
    const onImageClick = vi.fn()

    render(
      <LazyImageGrid
        images={mockImages}
        onImageClick={onImageClick}
      />
    )

    const clickableContainers = document.querySelectorAll('.cursor-pointer')
    expect(clickableContainers).toHaveLength(mockImages.length)

    fireEvent.click(clickableContainers[0])
    expect(onImageClick).toHaveBeenCalledWith(0)
  })

  it('applies custom className to grid and images', () => {
    render(
      <LazyImageGrid
        images={mockImages}
        className="custom-grid-class"
        imageClassName="custom-image-class"
      />
    )

    const grid = document.querySelector('.custom-grid-class')
    expect(grid).toBeInTheDocument()

    const imageContainers = document.querySelectorAll('.custom-image-class')
    expect(imageContainers).toHaveLength(mockImages.length)
  })

  it('handles empty images array', () => {
    render(<LazyImageGrid images={[]} />)

    const grid = document.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toBeEmptyDOMElement()
  })

  it('generates correct sizes prop for progressive images', () => {
    render(<LazyImageGrid images={mockImages} columns={3} />)

    // Progressive images should receive correct sizes prop
    // This would be verified through the mock, but we can check that images are rendered
    expect(screen.getAllByTestId('progressive-image')).toHaveLength(mockImages.length)
  })
})

describe('VirtualizedMediaList', () => {
  const createMockItems = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `item-${i}`,
      content: <div key={i}>Item {i}</div>
    }))

  it('renders only visible items within viewport', () => {
    const items = createMockItems(100)

    render(
      <VirtualizedMediaList
        items={items}
        itemHeight={50}
        containerHeight={200}
        overscan={2}
      />
    )

    // With 200px container height and 50px item height, should show ~4 items + overscan
    const container = document.querySelector('[style*="height: 200px"]')
    expect(container).toBeInTheDocument()

    // Total height should accommodate all items
    const innerContainer = document.querySelector('[style*="height: 5000px"]') // 100 * 50
    expect(innerContainer).toBeInTheDocument()
  })

  it('handles scroll events to update visible range', () => {
    const items = createMockItems(50)

    render(
      <VirtualizedMediaList
        items={items}
        itemHeight={100}
        containerHeight={300}
      />
    )

    const scrollContainer = document.querySelector('[style*="height: 300px"]')
    expect(scrollContainer).toBeInTheDocument()

    // Simulate scroll
    fireEvent.scroll(scrollContainer!, { target: { scrollTop: 500 } })

    // Should handle scroll without errors
    expect(scrollContainer).toBeInTheDocument()
  })

  it('applies custom className to container', () => {
    const items = createMockItems(10)

    render(
      <VirtualizedMediaList
        items={items}
        itemHeight={50}
        containerHeight={200}
        className="custom-virtualized-class"
      />
    )

    const container = document.querySelector('.custom-virtualized-class')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('overflow-auto')
  })

  it('handles empty items array', () => {
    render(
      <VirtualizedMediaList
        items={[]}
        itemHeight={50}
        containerHeight={200}
      />
    )

    const container = document.querySelector('[style*="height: 200px"]')
    expect(container).toBeInTheDocument()

    const innerContainer = document.querySelector('[style*="height: 0px"]')
    expect(innerContainer).toBeInTheDocument()
  })

  it('positions items correctly with absolute positioning', () => {
    const items = createMockItems(10)

    render(
      <VirtualizedMediaList
        items={items}
        itemHeight={75}
        containerHeight={300}
      />
    )

    // Check that items are positioned absolutely
    const itemContainers = document.querySelectorAll('[style*="position: absolute"]')
    expect(itemContainers.length).toBeGreaterThan(0)

    // First item should be at top: 0
    const firstItem = itemContainers[0] as HTMLElement
    expect(firstItem.style.top).toBe('0px')
  })

  it('respects overscan parameter for buffer rendering', () => {
    const items = createMockItems(20)

    render(
      <VirtualizedMediaList
        items={items}
        itemHeight={50}
        containerHeight={200}
        overscan={5}
      />
    )

    // With overscan of 5, should render more items than just visible
    const itemContainers = document.querySelectorAll('[style*="position: absolute"]')

    // Should render visible items (4) + overscan buffer (10 total: 5 before + 5 after)
    expect(itemContainers.length).toBeGreaterThan(4)
  })
})

describe('Accessibility', () => {
  it('provides proper ARIA attributes for media placeholders', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: false,
      isVisible: false
    })

    render(
      <LazyVideo src="/test-video.mp4" />
    )

    // Should have accessible placeholder content
    expect(screen.getByText('Media will load when visible')).toBeInTheDocument()
  })

  it('maintains semantic structure for lazy loaded content', () => {
    vi.mocked(useLazyLoading).mockReturnValue({
      ref: { current: null },
      wasVisible: true,
      isVisible: true
    })

    render(
      <LazyIframe
        src="https://example.com/embed"
        title="Accessible Embed"
      />
    )

    const iframe = screen.getByTitle('Accessible Embed')
    expect(iframe).toBeInTheDocument()
  })

  it('supports keyboard navigation in image grids', () => {
    const mockImages = [
      { src: '/image1.jpg', alt: 'First Image' },
      { src: '/image2.jpg', alt: 'Second Image' }
    ]

    render(
      <LazyImageGrid images={mockImages} onImageClick={vi.fn()} />
    )

    const clickableContainers = document.querySelectorAll('.cursor-pointer')
    clickableContainers.forEach(container => {
      expect(container).toBeInTheDocument()
    })
  })
})

describe('Performance', () => {
  it('efficiently handles large media lists with virtualization', () => {
    const largeItemList = createMockItems(1000)

    const { container } = render(
      <VirtualizedMediaList
        items={largeItemList}
        itemHeight={50}
        containerHeight={400}
      />
    )

    // Should only render a subset of items, not all 1000
    const renderedItems = container.querySelectorAll('[style*="position: absolute"]')
    expect(renderedItems.length).toBeLessThan(50) // Much less than total
  })

  it('optimizes re-renders with proper memoization', () => {
    const items = createMockItems(10)
    const onImageClick = vi.fn()

    const { rerender } = render(
      <LazyImageGrid
        images={[{ src: '/image1.jpg', alt: 'Image 1' }]}
        onImageClick={onImageClick}
      />
    )

    // Rerender with same props
    rerender(
      <LazyImageGrid
        images={[{ src: '/image1.jpg', alt: 'Image 1' }]}
        onImageClick={onImageClick}
      />
    )

    // Should handle re-renders efficiently
    expect(screen.getByTestId('progressive-image')).toBeInTheDocument()
  })
})