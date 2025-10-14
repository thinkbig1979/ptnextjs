"use client";

/**
 * Lazy Loading Hook
 * Custom hook for implementing intersection observer-based lazy loading
 */

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseLazyLoadingOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface UseLazyLoadingReturn {
  ref: React.RefObject<HTMLElement | null>
  isVisible: boolean
  wasVisible: boolean
}

export function useLazyLoading({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: UseLazyLoadingOptions = {}): UseLazyLoadingReturn {
  const [isVisible, setIsVisible] = useState(false)
  const [wasVisible, setWasVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported, falling back to immediate visibility')
      setIsVisible(true)
      setWasVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting

        setIsVisible(isIntersecting)

        if (isIntersecting && !wasVisible) {
          setWasVisible(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, wasVisible])

  return { ref, isVisible, wasVisible }
}

/**
 * Progressive Image Loading Hook
 * Handles image loading with blur placeholder
 */
interface UseProgressiveImageOptions {
  src: string
  placeholder?: string
  quality?: number
}

interface UseProgressiveImageReturn {
  ref: React.RefObject<HTMLElement | null>
  imageSrc: string | null
  isLoaded: boolean
  isVisible: boolean
  hasError: boolean
}

export function useProgressiveImage({
  src,
  placeholder
}: UseProgressiveImageOptions): UseProgressiveImageReturn {
  const { ref, isVisible } = useLazyLoading({ threshold: 0.1, triggerOnce: true })
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!isVisible || !src) return

    // Reset error state when src changes
    setHasError(false)
    setIsLoaded(false)

    // Validate src format
    if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
      console.warn('Invalid image src format:', src)
      setHasError(true)
      return
    }

    // Load low-quality placeholder first if provided
    if (placeholder && placeholder !== src) {
      setImageSrc(placeholder)
    }

    // Create new image element for loading
    const img = new Image()
    imgRef.current = img

    // Set up load handlers
    img.onload = () => {
      // Only update if this is still the current image being loaded
      if (imgRef.current === img) {
        setImageSrc(src)
        setIsLoaded(true)
        setHasError(false)
      }
    }

    img.onerror = (error) => {
      console.error('Failed to load image:', src, error)
      // Only update if this is still the current image being loaded
      if (imgRef.current === img) {
        setHasError(true)
        setIsLoaded(false)
      }
    }

    // Start loading the image
    img.src = src

    // Cleanup function
    return () => {
      if (imgRef.current === img) {
        img.onload = null
        img.onerror = null
        imgRef.current = null
      }
    }
  }, [isVisible, src, placeholder])

  // Reset states when src changes
  useEffect(() => {
    setHasError(false)
    setIsLoaded(false)
    setImageSrc(null)
  }, [src])

  return { ref, imageSrc, isLoaded, isVisible, hasError }
}

/**
 * Performance Metrics Hook
 * Tracks component render performance
 */
interface UsePerformanceMetricsOptions {
  name: string
  enabled?: boolean
}

interface UsePerformanceMetricsReturn {
  startMeasure: () => void
  endMeasure: () => void
  duration: number | null
}

export function usePerformanceMetrics({
  name,
  enabled = true
}: UsePerformanceMetricsOptions): UsePerformanceMetricsReturn {
  const [duration, setDuration] = useState<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const startMeasure = () => {
    if (!enabled) return
    startTimeRef.current = performance.now()
  }

  const endMeasure = () => {
    if (!enabled || !startTimeRef.current) return
    const endTime = performance.now()
    const measureDuration = endTime - startTimeRef.current
    setDuration(measureDuration)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance [${name}]: ${measureDuration.toFixed(2)}ms`)
    }
  }

  return { startMeasure, endMeasure, duration }
}

/**
 * Memory Usage Monitoring Hook
 * Monitors component memory usage (development only)
 */
interface UseMemoryMonitorReturn {
  memoryInfo: MemoryInfo | null
  updateMemoryInfo: () => void
}

export function useMemoryMonitor(): UseMemoryMonitorReturn {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null)

  const updateMemoryInfo = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      try {
        setMemoryInfo((performance as Performance & { memory?: MemoryInfo }).memory || null)
      } catch (error) {
        console.warn('Unable to access memory information:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      updateMemoryInfo()
      const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds
      return () => {
        clearInterval(interval)
        // Clear memory info on unmount to prevent memory leaks
        setMemoryInfo(null)
      }
    }
  }, [updateMemoryInfo])

  return { memoryInfo, updateMemoryInfo }
}

// Type for performance.memory
interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}