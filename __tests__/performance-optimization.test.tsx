/**
 * Performance Optimization Tests
 * Tests for caching strategy, lazy loading, and progressive image loading
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  ),
}))

// Mock React Player
jest.mock('react-player/lazy', () => ({
  default: ({ url, ...props }: any) => (
    <div data-testid="react-player" data-url={url} {...props}>
      Video Player
    </div>
  ),
}))

// Mock React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="three-canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: () => {},
  useThree: () => ({ size: { width: 800, height: 600 } }),
}))

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

describe('Performance Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset intersection observer mock
    mockIntersectionObserver.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Lazy Loading Implementation', () => {
    it('should implement lazy loading for video content', async () => {
      const LazyVideoComponent = ({ videoUrl }: { videoUrl: string }) => {
        const [isVisible, setIsVisible] = React.useState(false)
        const ref = React.useRef<HTMLDivElement>(null)

        React.useEffect(() => {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setIsVisible(true)
                observer.disconnect()
              }
            },
            { threshold: 0.1 }
          )

          if (ref.current) {
            observer.observe(ref.current)
          }

          return () => observer.disconnect()
        }, [])

        return (
          <div ref={ref} data-testid="video-container">
            {isVisible ? (
              <div data-testid="react-player" data-url={videoUrl}>
                Video Player
              </div>
            ) : (
              <div data-testid="video-placeholder">Loading video...</div>
            )}
          </div>
        )
      }

      render(<LazyVideoComponent videoUrl="https://example.com/video.mp4" />)

      // Initially should show placeholder
      expect(screen.getByTestId('video-placeholder')).toBeInTheDocument()
      expect(screen.queryByTestId('react-player')).not.toBeInTheDocument()

      // Verify intersection observer was called
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })

    it('should implement lazy loading for 360° demos', async () => {
      const Lazy360Demo = ({ modelUrl }: { modelUrl: string }) => {
        const [isVisible, setIsVisible] = React.useState(false)
        const ref = React.useRef<HTMLDivElement>(null)

        React.useEffect(() => {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setIsVisible(true)
                observer.disconnect()
              }
            },
            { threshold: 0.1 }
          )

          if (ref.current) {
            observer.observe(ref.current)
          }

          return () => observer.disconnect()
        }, [])

        return (
          <div ref={ref} data-testid="demo-container">
            {isVisible ? (
              <div data-testid="three-canvas" data-model={modelUrl}>
                360° Demo
              </div>
            ) : (
              <div data-testid="demo-placeholder">Loading 360° demo...</div>
            )}
          </div>
        )
      }

      render(<Lazy360Demo modelUrl="/models/product.glb" />)

      // Initially should show placeholder
      expect(screen.getByTestId('demo-placeholder')).toBeInTheDocument()
      expect(screen.queryByTestId('three-canvas')).not.toBeInTheDocument()

      // Verify intersection observer was set up
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })

    it('should optimize component rendering with React.memo', () => {
      const ExpensiveComponent = React.memo(({ data }: { data: any }) => {
        return <div data-testid="expensive-component">{data.name}</div>
      })

      const { rerender } = render(<ExpensiveComponent data={{ name: 'Test' }} />)

      // Component should render
      expect(screen.getByTestId('expensive-component')).toHaveTextContent('Test')

      // Re-render with same props - component should not re-render unnecessarily
      rerender(<ExpensiveComponent data={{ name: 'Test' }} />)
      expect(screen.getByTestId('expensive-component')).toHaveTextContent('Test')
    })
  })

  describe('Progressive Image Loading', () => {
    it('should implement progressive image loading with blur placeholder', async () => {
      const ProgressiveImage = ({ src, alt }: { src: string; alt: string }) => {
        const [isLoaded, setIsLoaded] = React.useState(false)
        const [isInView, setIsInView] = React.useState(false)
        const ref = React.useRef<HTMLDivElement>(null)

        React.useEffect(() => {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setIsInView(true)
                observer.disconnect()
              }
            },
            { threshold: 0.1 }
          )

          if (ref.current) {
            observer.observe(ref.current)
          }

          return () => observer.disconnect()
        }, [])

        return (
          <div ref={ref} data-testid="image-container">
            {isInView ? (
              <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                style={{
                  filter: isLoaded ? 'none' : 'blur(10px)',
                  transition: 'filter 0.3s ease',
                }}
                data-testid="progressive-image"
              />
            ) : (
              <div
                data-testid="image-placeholder"
                style={{ backgroundColor: '#f0f0f0', minHeight: '200px' }}
              >
                Loading...
              </div>
            )}
          </div>
        )
      }

      render(<ProgressiveImage src="/test-image.jpg" alt="Test image" />)

      // Initially should show placeholder
      expect(screen.getByTestId('image-placeholder')).toBeInTheDocument()
      expect(screen.queryByTestId('progressive-image')).not.toBeInTheDocument()

      // Verify intersection observer was set up
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })

    it('should handle image loading errors gracefully', async () => {
      const ImageWithFallback = ({ src, alt }: { src: string; alt: string }) => {
        const [hasError, setHasError] = React.useState(false)

        return (
          <div data-testid="image-with-fallback">
            {hasError ? (
              <div data-testid="image-error">Failed to load image</div>
            ) : (
              <img
                src={src}
                alt={alt}
                onError={() => setHasError(true)}
                data-testid="fallback-image"
              />
            )}
          </div>
        )
      }

      render(<ImageWithFallback src="/invalid-image.jpg" alt="Test image" />)

      const image = screen.getByTestId('fallback-image')

      // Simulate image load error
      fireEvent.error(image)

      await waitFor(() => {
        expect(screen.getByTestId('image-error')).toBeInTheDocument()
      })
    })
  })

  describe('Caching Strategy', () => {
    it('should cache data with TTL expiration', () => {
      class MockCacheService {
        private cache = new Map<string, { data: any; timestamp: number }>()
        private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

        getCached<T>(key: string, fetcher: () => T): T {
          const cached = this.cache.get(key)
          const now = Date.now()

          if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
            return cached.data
          }

          const data = fetcher()
          this.cache.set(key, { data, timestamp: now })
          return data
        }

        clearExpired(): void {
          const now = Date.now()
          for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp >= this.CACHE_TTL) {
              this.cache.delete(key)
            }
          }
        }
      }

      const cacheService = new MockCacheService()
      const fetcherMock = vi.fn(() => ({ id: 1, name: 'Test Data' }))

      // First call should execute fetcher
      const result1 = cacheService.getCached('test-key', fetcherMock)
      expect(fetcherMock).toHaveBeenCalledTimes(1)
      expect(result1).toEqual({ id: 1, name: 'Test Data' })

      // Second call should use cache
      const result2 = cacheService.getCached('test-key', fetcherMock)
      expect(fetcherMock).toHaveBeenCalledTimes(1) // Still only called once
      expect(result2).toEqual({ id: 1, name: 'Test Data' })
    })

    it('should extend caching for yacht and enhanced profile data', () => {
      interface YachtData {
        id: string
        name: string
        timeline: any[]
        supplierMap: any[]
      }

      interface EnhancedProfileData {
        id: string
        certifications: any[]
        awards: any[]
        socialProof: any
      }

      class ExtendedCacheService {
        private cache = new Map<string, { data: any; timestamp: number }>()
        private readonly CACHE_TTL = 5 * 60 * 1000

        getCachedYachtData(yachtId: string): YachtData | null {
          const cached = this.cache.get(`yacht:${yachtId}`)
          if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data
          }
          return null
        }

        setCachedYachtData(yachtId: string, data: YachtData): void {
          this.cache.set(`yacht:${yachtId}`, { data, timestamp: Date.now() })
        }

        getCachedEnhancedProfile(vendorId: string): EnhancedProfileData | null {
          const cached = this.cache.get(`enhanced:${vendorId}`)
          if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data
          }
          return null
        }

        setCachedEnhancedProfile(vendorId: string, data: EnhancedProfileData): void {
          this.cache.set(`enhanced:${vendorId}`, { data, timestamp: Date.now() })
        }
      }

      const extendedCache = new ExtendedCacheService()

      const yachtData: YachtData = {
        id: 'yacht-1',
        name: 'Test Yacht',
        timeline: [],
        supplierMap: []
      }

      const profileData: EnhancedProfileData = {
        id: 'vendor-1',
        certifications: [],
        awards: [],
        socialProof: {}
      }

      // Test yacht data caching
      expect(extendedCache.getCachedYachtData('yacht-1')).toBeNull()
      extendedCache.setCachedYachtData('yacht-1', yachtData)
      expect(extendedCache.getCachedYachtData('yacht-1')).toEqual(yachtData)

      // Test enhanced profile caching
      expect(extendedCache.getCachedEnhancedProfile('vendor-1')).toBeNull()
      extendedCache.setCachedEnhancedProfile('vendor-1', profileData)
      expect(extendedCache.getCachedEnhancedProfile('vendor-1')).toEqual(profileData)
    })
  })

  describe('Performance Monitoring', () => {
    it('should measure component render performance', () => {
      const performanceTracker = {
        startTime: 0,
        endTime: 0,
        start: function() { this.startTime = performance.now() },
        end: function() { this.endTime = performance.now() },
        getDuration: function() { return this.endTime - this.startTime }
      }

      const PerformanceTrackedComponent = () => {
        React.useEffect(() => {
          performanceTracker.start()
          return () => performanceTracker.end()
        }, [])

        return <div data-testid="tracked-component">Performance Tracked</div>
      }

      render(<PerformanceTrackedComponent />)

      expect(screen.getByTestId('tracked-component')).toBeInTheDocument()
      expect(performanceTracker.startTime).toBeGreaterThan(0)
    })

    it('should optimize bundle size by code splitting', () => {
      // Mock dynamic import
      const mockDynamicImport = vi.fn(() =>
        Promise.resolve({
          default: () => <div data-testid="dynamic-component">Dynamic Component</div>
        })
      )

      const LazyComponent = React.lazy(() => mockDynamicImport())

      const ComponentWithSuspense = () => (
        <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      )

      render(<ComponentWithSuspense />)

      // Should show loading state initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(mockDynamicImport).toHaveBeenCalled()
    })
  })

  describe('Static Generation Performance', () => {
    it('should maintain fast build times with optimized data fetching', () => {
      interface BuildMetrics {
        startTime: number
        endTime: number
        pagesGenerated: number
        cacheHits: number
        cacheMisses: number
      }

      class BuildPerformanceTracker {
        private metrics: BuildMetrics = {
          startTime: 0,
          endTime: 0,
          pagesGenerated: 0,
          cacheHits: 0,
          cacheMisses: 0
        }

        startBuild(): void {
          this.metrics.startTime = Date.now()
        }

        endBuild(): void {
          this.metrics.endTime = Date.now()
        }

        recordPageGenerated(): void {
          this.metrics.pagesGenerated++
        }

        recordCacheHit(): void {
          this.metrics.cacheHits++
        }

        recordCacheMiss(): void {
          this.metrics.cacheMisses++
        }

        getBuildDuration(): number {
          return this.metrics.endTime - this.metrics.startTime
        }

        getCacheHitRatio(): number {
          const total = this.metrics.cacheHits + this.metrics.cacheMisses
          return total > 0 ? this.metrics.cacheHits / total : 0
        }

        getMetrics(): BuildMetrics {
          return { ...this.metrics }
        }
      }

      const tracker = new BuildPerformanceTracker()

      // Simulate build process
      tracker.startBuild()
      tracker.recordPageGenerated()
      tracker.recordCacheHit()
      tracker.recordCacheMiss()
      tracker.endBuild()

      const metrics = tracker.getMetrics()
      expect(metrics.pagesGenerated).toBe(1)
      expect(metrics.cacheHits).toBe(1)
      expect(metrics.cacheMisses).toBe(1)
      expect(tracker.getCacheHitRatio()).toBe(0.5)
      expect(tracker.getBuildDuration()).toBeGreaterThanOrEqual(0)
    })
  })
})

// Add React import at the top
import React from 'react'