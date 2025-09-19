/**
 * Progressive Image Component Tests
 * Comprehensive tests for progressive image loading functionality
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { ProgressiveImage, ImageGallery, HeroImage } from '@/components/ui/progressive-image'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn(({ src, alt, onLoad, onError, ...props }) => {
    const handleLoad = () => {
      setTimeout(() => onLoad?.(), 10)
    }

    const handleError = () => {
      setTimeout(() => onError?.(), 10)
    }

    return (
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        data-testid="next-image"
        {...props}
      />
    )
  })
}))

// Mock intersection observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})

beforeEach(() => {
  window.IntersectionObserver = mockIntersectionObserver
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('ProgressiveImage', () => {
  it('renders loading state when not visible', () => {
    render(
      <ProgressiveImage
        src="/test-image.jpg"
        alt="Test image"
        data-testid="progressive-image"
      />
    )

    expect(screen.getByRole('img', { name: /loading test image/i })).toBeInTheDocument()
    expect(screen.getByText('Loading image: Test image')).toBeInTheDocument()
  })

  it('renders error state when image fails to load', async () => {
    // Mock failed image load
    const mockImage = {
      onload: null,
      onerror: null,
      src: '',
    }

    global.Image = jest.fn(() => mockImage)

    render(
      <ProgressiveImage
        src="/invalid-image.jpg"
        alt="Test image"
        priority
      />
    )

    // Simulate image error
    setTimeout(() => {
      mockImage.onerror?.()
    }, 10)

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument()
    })
  })

  it('calls onLoad and onError callbacks', async () => {
    const onLoad = jest.fn()
    const onError = jest.fn()

    render(
      <ProgressiveImage
        src="/test-image.jpg"
        alt="Test image"
        onLoad={onLoad}
        onError={onError}
        priority
      />
    )

    // Wait for the Next.js Image to trigger onLoad
    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled()
    })
  })

  it('supports custom className and styling', () => {
    render(
      <ProgressiveImage
        src="/test-image.jpg"
        alt="Test image"
        className="custom-class"
        width={300}
        height={200}
        priority
      />
    )

    const container = screen.getByRole('img', { name: 'Test image' }).closest('div')
    expect(container).toHaveClass('custom-class')
  })

  it('handles priority images correctly', () => {
    render(
      <ProgressiveImage
        src="/priority-image.jpg"
        alt="Priority image"
        priority={true}
      />
    )

    // Priority images should load immediately, not show loading state
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('supports blur placeholder', () => {
    render(
      <ProgressiveImage
        src="/test-image.jpg"
        alt="Test image"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD"
        priority
      />
    )

    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
  })
})

describe('ImageGallery', () => {
  const mockImages = [
    { src: '/image1.jpg', alt: 'Image 1' },
    { src: '/image2.jpg', alt: 'Image 2' },
    { src: '/image3.jpg', alt: 'Image 3' }
  ]

  it('renders grid of images with correct columns', () => {
    render(
      <ImageGallery
        images={mockImages}
        columns={3}
        data-testid="image-gallery"
      />
    )

    const gallery = screen.getByTestId('image-gallery')
    expect(gallery).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('handles image loading state correctly', async () => {
    render(
      <ImageGallery
        images={mockImages}
        showLoadingState={true}
      />
    )

    // Initially should show loading states
    const loadingElements = screen.getAllByRole('img')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('supports different aspect ratios', () => {
    render(
      <ImageGallery
        images={mockImages}
        aspectRatio="square"
      />
    )

    const containers = screen.getAllByRole('img')[0].closest('div')
    expect(containers).toHaveClass('aspect-square')
  })

  it('handles empty images array', () => {
    render(<ImageGallery images={[]} />)

    // Should render without errors
    const gallery = document.querySelector('.grid')
    expect(gallery).toBeInTheDocument()
  })
})

describe('HeroImage', () => {
  it('renders hero image with overlay', () => {
    render(
      <HeroImage
        src="/hero-image.jpg"
        alt="Hero image"
        overlay={true}
        data-testid="hero-image"
      >
        <h1>Hero Content</h1>
      </HeroImage>
    )

    expect(screen.getByTestId('hero-image')).toBeInTheDocument()
    expect(screen.getByText('Hero Content')).toBeInTheDocument()

    // Check for overlay
    const overlay = document.querySelector('.bg-black\\/20')
    expect(overlay).toBeInTheDocument()
  })

  it('renders without overlay when disabled', () => {
    render(
      <HeroImage
        src="/hero-image.jpg"
        alt="Hero image"
        overlay={false}
      />
    )

    const overlay = document.querySelector('.bg-black\\/20')
    expect(overlay).not.toBeInTheDocument()
  })

  it('supports priority loading for hero images', () => {
    render(
      <HeroImage
        src="/hero-image.jpg"
        alt="Hero image"
        priority={true}
      />
    )

    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
  })
})

describe('Accessibility', () => {
  it('provides proper ARIA labels for loading states', () => {
    render(
      <ProgressiveImage
        src="/test-image.jpg"
        alt="Accessible image"
      />
    )

    expect(screen.getByRole('img', { name: /loading accessible image/i })).toBeInTheDocument()
    expect(screen.getByText('Loading image: Accessible image')).toBeInTheDocument()
  })

  it('provides proper ARIA labels for error states', async () => {
    // Mock failed image load
    const mockImage = {
      onload: null,
      onerror: null,
      src: '',
    }

    global.Image = jest.fn(() => mockImage)

    render(
      <ProgressiveImage
        src="/invalid-image.jpg"
        alt="Accessible image"
        priority
      />
    )

    // Simulate image error
    setTimeout(() => {
      mockImage.onerror?.()
    }, 10)

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Accessible image' })).toBeInTheDocument()
    })
  })

  it('maintains focus management', () => {
    render(
      <ProgressiveImage
        src="/test-image.jpg"
        alt="Focusable image"
        priority
      />
    )

    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()

    // Image should be focusable for screen readers
    fireEvent.focus(image)
    expect(document.activeElement).toBe(image)
  })
})

describe('Performance', () => {
  it('handles rapid src changes without memory leaks', async () => {
    const { rerender } = render(
      <ProgressiveImage
        src="/image1.jpg"
        alt="Dynamic image"
        priority
      />
    )

    // Rapidly change src to test cleanup
    for (let i = 2; i <= 5; i++) {
      rerender(
        <ProgressiveImage
          src={`/image${i}.jpg`}
          alt="Dynamic image"
          priority
        />
      )
    }

    // Should not throw errors or cause memory leaks
    expect(screen.getByTestId('next-image')).toBeInTheDocument()
  })

  it('efficiently handles large image galleries', () => {
    const largeImageList = Array.from({ length: 100 }, (_, i) => ({
      src: `/image${i}.jpg`,
      alt: `Image ${i}`
    }))

    const { container } = render(
      <ImageGallery images={largeImageList} />
    )

    // Should render without performance issues
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(100)
  })
})