/**
 * Lazy Loading Hooks Tests
 * Comprehensive tests for lazy loading, progressive image, and performance hooks
 */

import React from 'react'
import { renderHook, act, render } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  useLazyLoading,
  useProgressiveImage,
  usePerformanceMetrics,
  useMemoryMonitor
} from '@/lib/hooks/use-lazy-loading'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
const mockObserve = jest.fn()
const mockUnobserve = jest.fn()
const mockDisconnect = jest.fn()

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback, options) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    thresholds: options?.threshold ? [options.threshold] : [0],
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px',
    // Store callback for manual triggering
    _callback: callback
  }))

  global.IntersectionObserver = mockIntersectionObserver
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('useLazyLoading', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useLazyLoading())

    expect(result.current.isVisible).toBe(false)
    expect(result.current.wasVisible).toBe(false)
    expect(result.current.ref.current).toBe(null)
  })

  it('accepts custom options', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '100px',
      triggerOnce: false
    }

    renderHook(() => useLazyLoading(options))

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '100px'
      }
    )
  })

  it('observes element when ref is set', () => {
    const TestComponent = () => {
      const { ref } = useLazyLoading()
      return <div ref={ref} data-testid="observed-element" />
    }

    render(<TestComponent />)

    expect(mockObserve).toHaveBeenCalled()
  })

  it('updates visibility when element intersects', () => {
    const { result } = renderHook(() => useLazyLoading())

    // Simulate element being attached
    act(() => {
      result.current.ref.current = document.createElement('div')
    })

    // Get the observer instance and trigger intersection
    const observerInstance = mockIntersectionObserver.mock.results[0].value
    act(() => {
      observerInstance._callback([{ isIntersecting: true }])
    })

    expect(result.current.isVisible).toBe(true)
    expect(result.current.wasVisible).toBe(true)
  })

  it('disconnects observer when triggerOnce is true and element becomes visible', () => {
    const { result } = renderHook(() => useLazyLoading({ triggerOnce: true }))

    act(() => {
      result.current.ref.current = document.createElement('div')
    })

    const observerInstance = mockIntersectionObserver.mock.results[0].value
    act(() => {
      observerInstance._callback([{ isIntersecting: true }])
    })

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('continues observing when triggerOnce is false', () => {
    const { result } = renderHook(() => useLazyLoading({ triggerOnce: false }))

    act(() => {
      result.current.ref.current = document.createElement('div')
    })

    const observerInstance = mockIntersectionObserver.mock.results[0].value
    act(() => {
      observerInstance._callback([{ isIntersecting: true }])
    })

    // Should not disconnect when triggerOnce is false
    expect(mockDisconnect).not.toHaveBeenCalled()
  })

  it('handles IntersectionObserver not being supported', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    // Temporarily remove IntersectionObserver
    const originalIO = global.IntersectionObserver
    delete (global as any).IntersectionObserver

    const { result } = renderHook(() => useLazyLoading())

    expect(consoleSpy).toHaveBeenCalledWith(
      'IntersectionObserver not supported, falling back to immediate visibility'
    )
    expect(result.current.isVisible).toBe(true)
    expect(result.current.wasVisible).toBe(true)

    // Restore IntersectionObserver
    global.IntersectionObserver = originalIO
    consoleSpy.mockRestore()
  })

  it('cleans up observer on unmount', () => {
    const { unmount } = renderHook(() => useLazyLoading())

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })
})

describe('useProgressiveImage', () => {
  beforeEach(() => {
    // Mock Image constructor
    global.Image = jest.fn().mockImplementation(() => ({
      onload: null,
      onerror: null,
      src: '',
    }))
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useProgressiveImage({
      src: '/test-image.jpg'
    }))

    expect(result.current.imageSrc).toBe(null)
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.hasError).toBe(false)
  })

  it('validates image src format', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useProgressiveImage({
      src: 'invalid-src-format'
    }))

    // Simulate visibility
    act(() => {
      const observerInstance = mockIntersectionObserver.mock.results[0].value
      observerInstance._callback([{ isIntersecting: true }])
    })

    expect(consoleSpy).toHaveBeenCalledWith('Invalid image src format:', 'invalid-src-format')
    expect(result.current.hasError).toBe(true)

    consoleSpy.mockRestore()
  })

  it('loads placeholder image first', () => {
    const { result } = renderHook(() => useProgressiveImage({
      src: '/high-quality.jpg',
      placeholder: '/low-quality.jpg'
    }))

    // Simulate visibility
    act(() => {
      const observerInstance = mockIntersectionObserver.mock.results[0].value
      observerInstance._callback([{ isIntersecting: true }])
    })

    // Should initially set placeholder
    expect(result.current.imageSrc).toBe('/low-quality.jpg')
  })

  it('handles successful image loading', () => {
    const mockImage = {
      onload: null,
      onerror: null,
      src: '',
    }

    global.Image = jest.fn(() => mockImage)

    const { result } = renderHook(() => useProgressiveImage({
      src: '/test-image.jpg'
    }))

    // Simulate visibility
    act(() => {
      const observerInstance = mockIntersectionObserver.mock.results[0].value
      observerInstance._callback([{ isIntersecting: true }])
    })

    // Simulate successful image load
    act(() => {
      mockImage.onload?.()
    })

    expect(result.current.imageSrc).toBe('/test-image.jpg')
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.hasError).toBe(false)
  })

  it('handles image loading errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const mockImage = {
      onload: null,
      onerror: null,
      src: '',
    }

    global.Image = jest.fn(() => mockImage)

    const { result } = renderHook(() => useProgressiveImage({
      src: '/invalid-image.jpg'
    }))

    // Simulate visibility
    act(() => {
      const observerInstance = mockIntersectionObserver.mock.results[0].value
      observerInstance._callback([{ isIntersecting: true }])
    })

    // Simulate image error
    act(() => {
      mockImage.onerror?.(new Error('Failed to load'))
    })

    expect(result.current.hasError).toBe(true)
    expect(result.current.isLoaded).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load image:',
      '/invalid-image.jpg',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('resets state when src changes', () => {
    const { result, rerender } = renderHook(
      ({ src }) => useProgressiveImage({ src }),
      { initialProps: { src: '/image1.jpg' } }
    )

    // Set some state
    act(() => {
      const observerInstance = mockIntersectionObserver.mock.results[0].value
      observerInstance._callback([{ isIntersecting: true }])
    })

    // Change src
    rerender({ src: '/image2.jpg' })

    expect(result.current.hasError).toBe(false)
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.imageSrc).toBe(null)
  })

  it('cleans up image loading on unmount', () => {
    const mockImage = {
      onload: null,
      onerror: null,
      src: '',
    }

    global.Image = jest.fn(() => mockImage)

    const { unmount } = renderHook(() => useProgressiveImage({
      src: '/test-image.jpg'
    }))

    unmount()

    // onload and onerror should be cleared
    expect(mockImage.onload).toBe(null)
    expect(mockImage.onerror).toBe(null)
  })
})

describe('usePerformanceMetrics', () => {
  beforeEach(() => {
    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(1000)
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => usePerformanceMetrics({
      name: 'test-component'
    }))

    expect(result.current.duration).toBe(null)
    expect(typeof result.current.startMeasure).toBe('function')
    expect(typeof result.current.endMeasure).toBe('function')
  })

  it('measures performance correctly', () => {
    const { result } = renderHook(() => usePerformanceMetrics({
      name: 'test-component'
    }))

    act(() => {
      result.current.startMeasure()
    })

    // Mock time progression
    jest.spyOn(performance, 'now').mockReturnValue(1100)

    act(() => {
      result.current.endMeasure()
    })

    expect(result.current.duration).toBe(100)
  })

  it('logs performance in development mode', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const { result } = renderHook(() => usePerformanceMetrics({
      name: 'test-component'
    }))

    act(() => {
      result.current.startMeasure()
    })

    jest.spyOn(performance, 'now').mockReturnValue(1150)

    act(() => {
      result.current.endMeasure()
    })

    expect(consoleSpy).toHaveBeenCalledWith('Performance [test-component]: 150.00ms')

    process.env.NODE_ENV = originalEnv
    consoleSpy.mockRestore()
  })

  it('respects enabled flag', () => {
    const { result } = renderHook(() => usePerformanceMetrics({
      name: 'test-component',
      enabled: false
    }))

    act(() => {
      result.current.startMeasure()
      result.current.endMeasure()
    })

    expect(result.current.duration).toBe(null)
  })

  it('handles missing start measure gracefully', () => {
    const { result } = renderHook(() => usePerformanceMetrics({
      name: 'test-component'
    }))

    act(() => {
      result.current.endMeasure() // End without start
    })

    expect(result.current.duration).toBe(null)
  })
})

describe('useMemoryMonitor', () => {
  beforeEach(() => {
    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50000000,
        totalJSHeapSize: 100000000,
        jsHeapSizeLimit: 200000000
      },
      configurable: true
    })

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('initializes with null memory info', () => {
    const { result } = renderHook(() => useMemoryMonitor())

    expect(result.current.memoryInfo).toBe(null)
    expect(typeof result.current.updateMemoryInfo).toBe('function')
  })

  it('updates memory info in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const { result } = renderHook(() => useMemoryMonitor())

    act(() => {
      jest.advanceTimersByTime(1000) // Advance past initial delay
    })

    expect(result.current.memoryInfo).toEqual({
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000,
      jsHeapSizeLimit: 200000000
    })

    process.env.NODE_ENV = originalEnv
  })

  it('updates memory info periodically', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const { result } = renderHook(() => useMemoryMonitor())

    // Initial update
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.memoryInfo).toBeTruthy()

    // Update memory values
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 60000000,
        totalJSHeapSize: 120000000,
        jsHeapSizeLimit: 200000000
      },
      configurable: true
    })

    // Advance timer for periodic update
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current.memoryInfo?.usedJSHeapSize).toBe(60000000)

    process.env.NODE_ENV = originalEnv
  })

  it('does not monitor in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const { result } = renderHook(() => useMemoryMonitor())

    act(() => {
      jest.advanceTimersByTime(10000)
    })

    expect(result.current.memoryInfo).toBe(null)

    process.env.NODE_ENV = originalEnv
  })

  it('handles missing performance.memory gracefully', () => {
    delete (performance as any).memory

    const { result } = renderHook(() => useMemoryMonitor())

    act(() => {
      result.current.updateMemoryInfo()
    })

    expect(result.current.memoryInfo).toBe(null)
  })

  it('cleans up interval on unmount', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const { unmount } = renderHook(() => useMemoryMonitor())

    unmount()

    // Timer should be cleared, so advancing time shouldn't update anything
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    process.env.NODE_ENV = originalEnv
  })
})