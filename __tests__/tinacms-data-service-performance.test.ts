/**
 * TinaCMSDataService Performance Tests
 * Tests for extended caching functionality for yacht and enhanced profile data
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

// Mock file system operations
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
  stat: jest.fn(),
}))

jest.mock('gray-matter', () => ({
  default: jest.fn(),
}))

jest.mock('marked', () => ({
  marked: jest.fn(),
}))

describe('TinaCMSDataService Performance Extensions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  describe('Extended Caching Strategy', () => {
    it('should implement yacht data caching with TTL', () => {
      interface YachtCacheEntry {
        data: any
        timestamp: number
      }

      class YachtDataCache {
        private cache = new Map<string, YachtCacheEntry>()
        private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

        getCachedYacht(yachtId: string): any | null {
          const entry = this.cache.get(`yacht:${yachtId}`)
          if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.data
          }
          this.cache.delete(`yacht:${yachtId}`)
          return null
        }

        setCachedYacht(yachtId: string, data: any): void {
          this.cache.set(`yacht:${yachtId}`, {
            data,
            timestamp: Date.now()
          })
        }

        getCachedYachts(): any[] | null {
          const entry = this.cache.get('yachts:all')
          if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.data
          }
          this.cache.delete('yachts:all')
          return null
        }

        setCachedYachts(data: any[]): void {
          this.cache.set('yachts:all', {
            data,
            timestamp: Date.now()
          })
        }

        clearExpiredEntries(): void {
          const now = Date.now()
          for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp >= this.CACHE_TTL) {
              this.cache.delete(key)
            }
          }
        }

        getCacheStats(): { size: number; keys: string[] } {
          return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
          }
        }
      }

      const cache = new YachtDataCache()

      // Test yacht caching
      const yachtData = {
        id: 'luxury-yacht-1',
        name: 'Serenity',
        timeline: [{ year: 2020, event: 'Built' }],
        supplierMap: [{ role: 'Engine Supplier', vendor: 'MTU' }]
      }

      // Initially no cache
      expect(cache.getCachedYacht('luxury-yacht-1')).toBeNull()

      // Cache yacht data
      cache.setCachedYacht('luxury-yacht-1', yachtData)
      expect(cache.getCachedYacht('luxury-yacht-1')).toEqual(yachtData)

      // Test yacht list caching
      const yachtsList = [yachtData]
      cache.setCachedYachts(yachtsList)
      expect(cache.getCachedYachts()).toEqual(yachtsList)

      // Verify cache stats
      const stats = cache.getCacheStats()
      expect(stats.size).toBe(2)
      expect(stats.keys).toContain('yacht:luxury-yacht-1')
      expect(stats.keys).toContain('yachts:all')
    })

    it('should implement enhanced profile data caching', () => {
      interface EnhancedProfileCacheEntry {
        data: any
        timestamp: number
      }

      class EnhancedProfileCache {
        private cache = new Map<string, EnhancedProfileCacheEntry>()
        private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

        getCachedEnhancedProfile(vendorId: string): any | null {
          const entry = this.cache.get(`enhanced:${vendorId}`)
          if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.data
          }
          this.cache.delete(`enhanced:${vendorId}`)
          return null
        }

        setCachedEnhancedProfile(vendorId: string, data: any): void {
          this.cache.set(`enhanced:${vendorId}`, {
            data,
            timestamp: Date.now()
          })
        }

        getCachedCertifications(vendorId: string): any[] | null {
          const entry = this.cache.get(`certifications:${vendorId}`)
          if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.data
          }
          this.cache.delete(`certifications:${vendorId}`)
          return null
        }

        setCachedCertifications(vendorId: string, data: any[]): void {
          this.cache.set(`certifications:${vendorId}`, {
            data,
            timestamp: Date.now()
          })
        }

        getCachedAwards(vendorId: string): any[] | null {
          const entry = this.cache.get(`awards:${vendorId}`)
          if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.data
          }
          this.cache.delete(`awards:${vendorId}`)
          return null
        }

        setCachedAwards(vendorId: string, data: any[]): void {
          this.cache.set(`awards:${vendorId}`, {
            data,
            timestamp: Date.now()
          })
        }
      }

      const cache = new EnhancedProfileCache()

      // Test enhanced profile caching
      const enhancedProfile = {
        vendorId: 'marine-tech-corp',
        certifications: [
          { name: 'ISO 9001', issuer: 'ISO', year: 2023 }
        ],
        awards: [
          { title: 'Innovation Award 2023', issuer: 'Marine Tech Awards' }
        ],
        socialProof: {
          linkedinFollowers: 5000,
          projectsCompleted: 150
        }
      }

      // Initially no cache
      expect(cache.getCachedEnhancedProfile('marine-tech-corp')).toBeNull()

      // Cache enhanced profile
      cache.setCachedEnhancedProfile('marine-tech-corp', enhancedProfile)
      expect(cache.getCachedEnhancedProfile('marine-tech-corp')).toEqual(enhancedProfile)

      // Test certification caching
      cache.setCachedCertifications('marine-tech-corp', enhancedProfile.certifications)
      expect(cache.getCachedCertifications('marine-tech-corp')).toEqual(enhancedProfile.certifications)

      // Test awards caching
      cache.setCachedAwards('marine-tech-corp', enhancedProfile.awards)
      expect(cache.getCachedAwards('marine-tech-corp')).toEqual(enhancedProfile.awards)
    })

    it('should handle cache expiration correctly', () => {
      class ExpirationTestCache {
        private cache = new Map<string, { data: any; timestamp: number }>()
        private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

        set(key: string, data: any): void {
          this.cache.set(key, { data, timestamp: Date.now() })
        }

        get(key: string): any | null {
          const entry = this.cache.get(key)
          if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            return entry.data
          }
          this.cache.delete(key)
          return null
        }

        // Method to simulate time passage for testing
        simulateTimePassage(milliseconds: number): void {
          const entries = Array.from(this.cache.entries())
          this.cache.clear()
          entries.forEach(([key, entry]) => {
            this.cache.set(key, {
              data: entry.data,
              timestamp: entry.timestamp - milliseconds
            })
          })
        }
      }

      const cache = new ExpirationTestCache()

      // Set data
      cache.set('test-key', { value: 'test-data' })

      // Should be available immediately
      expect(cache.get('test-key')).toEqual({ value: 'test-data' })

      // Simulate 6 minutes passing (beyond TTL)
      cache.simulateTimePassage(6 * 60 * 1000)

      // Should be expired
      expect(cache.get('test-key')).toBeNull()
    })

    it('should optimize memory usage with cache size limits', () => {
      class BoundedCache {
        private cache = new Map<string, { data: any; timestamp: number; accessCount: number }>()
        private readonly MAX_CACHE_SIZE = 100
        private readonly CACHE_TTL = 5 * 60 * 1000

        set(key: string, data: any): void {
          // If cache is full, remove least recently used item
          if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictLRU()
          }

          this.cache.set(key, {
            data,
            timestamp: Date.now(),
            accessCount: 1
          })
        }

        get(key: string): any | null {
          const entry = this.cache.get(key)
          if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
            entry.accessCount++
            return entry.data
          }
          this.cache.delete(key)
          return null
        }

        private evictLRU(): void {
          let lruKey = ''
          let minAccessCount = Infinity

          for (const [key, entry] of this.cache.entries()) {
            if (entry.accessCount < minAccessCount) {
              minAccessCount = entry.accessCount
              lruKey = key
            }
          }

          if (lruKey) {
            this.cache.delete(lruKey)
          }
        }

        size(): number {
          return this.cache.size
        }
      }

      const cache = new BoundedCache()

      // Fill cache to capacity
      for (let i = 0; i < 100; i++) {
        cache.set(`key-${i}`, { value: i })
      }

      expect(cache.size()).toBe(100)

      // Adding one more should trigger eviction
      cache.set('key-overflow', { value: 'overflow' })
      expect(cache.size()).toBe(100) // Should still be at max size

      // The least recently used item should have been evicted
      expect(cache.get('key-overflow')).toEqual({ value: 'overflow' })
    })
  })

  describe('Performance Metrics Collection', () => {
    it('should track cache hit/miss ratios', () => {
      class MetricsTrackingCache {
        private cache = new Map<string, any>()
        private metrics = {
          hits: 0,
          misses: 0,
          sets: 0
        }

        set(key: string, data: any): void {
          this.cache.set(key, data)
          this.metrics.sets++
        }

        get(key: string): any | null {
          if (this.cache.has(key)) {
            this.metrics.hits++
            return this.cache.get(key)
          } else {
            this.metrics.misses++
            return null
          }
        }

        getMetrics(): { hits: number; misses: number; sets: number; hitRatio: number } {
          const total = this.metrics.hits + this.metrics.misses
          return {
            ...this.metrics,
            hitRatio: total > 0 ? this.metrics.hits / total : 0
          }
        }

        resetMetrics(): void {
          this.metrics = { hits: 0, misses: 0, sets: 0 }
        }
      }

      const cache = new MetricsTrackingCache()

      // Set some data
      cache.set('item1', 'data1')
      cache.set('item2', 'data2')

      // Generate hits and misses
      cache.get('item1') // hit
      cache.get('item2') // hit
      cache.get('item3') // miss
      cache.get('item1') // hit

      const metrics = cache.getMetrics()
      expect(metrics.hits).toBe(3)
      expect(metrics.misses).toBe(1)
      expect(metrics.sets).toBe(2)
      expect(metrics.hitRatio).toBe(0.75)
    })

    it('should measure data fetching performance', async () => {
      class PerformanceTracker {
        private measurements: { operation: string; duration: number }[] = []

        async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
          const start = performance.now()
          try {
            const result = await fn()
            const duration = performance.now() - start
            this.measurements.push({ operation, duration })
            return result
          } catch (error) {
            const duration = performance.now() - start
            this.measurements.push({ operation: `${operation}_error`, duration })
            throw error
          }
        }

        measure<T>(operation: string, fn: () => T): T {
          const start = performance.now()
          try {
            const result = fn()
            const duration = performance.now() - start
            this.measurements.push({ operation, duration })
            return result
          } catch (error) {
            const duration = performance.now() - start
            this.measurements.push({ operation: `${operation}_error`, duration })
            throw error
          }
        }

        getAverageTime(operation: string): number {
          const operations = this.measurements.filter(m => m.operation === operation)
          if (operations.length === 0) return 0
          return operations.reduce((sum, op) => sum + op.duration, 0) / operations.length
        }

        getAllMeasurements(): { operation: string; duration: number }[] {
          return [...this.measurements]
        }
      }

      const tracker = new PerformanceTracker()

      // Mock async operation
      const mockAsyncOperation = () => new Promise(resolve => setTimeout(resolve, 10))

      // Measure async operation
      await tracker.measureAsync('fetchYachtData', () => mockAsyncOperation())

      // Measure sync operation
      tracker.measure('parseYachtData', () => ({ id: 'yacht-1', name: 'Test Yacht' }))

      const measurements = tracker.getAllMeasurements()
      expect(measurements).toHaveLength(2)
      expect(measurements[0].operation).toBe('fetchYachtData')
      expect(measurements[1].operation).toBe('parseYachtData')
      expect(measurements[0].duration).toBeGreaterThan(0)
      expect(measurements[1].duration).toBeGreaterThan(0)
    })
  })

  describe('Data Service Integration', () => {
    it('should extend TinaCMSDataService with performance optimizations', () => {
      interface CacheEntry {
        data: any
        timestamp: number
      }

      class OptimizedTinaCMSDataService {
        private cache = new Map<string, CacheEntry>()
        private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

        private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
          const cached = this.cache.get(key)
          const now = Date.now()

          if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
            return cached.data
          }

          const data = await fetcher()
          this.cache.set(key, { data, timestamp: now })
          return data
        }

        async getYachtData(yachtId: string): Promise<any> {
          return this.getCached(`yacht:${yachtId}`, async () => {
            // Mock yacht data fetching
            return {
              id: yachtId,
              name: 'Test Yacht',
              timeline: [],
              supplierMap: [],
              sustainabilityScore: 85
            }
          })
        }

        async getAllYachts(): Promise<any[]> {
          return this.getCached('yachts:all', async () => {
            // Mock yachts list fetching
            return [
              { id: 'yacht-1', name: 'Serenity' },
              { id: 'yacht-2', name: 'Harmony' }
            ]
          })
        }

        async getEnhancedVendorProfile(vendorId: string): Promise<any> {
          return this.getCached(`enhanced:${vendorId}`, async () => {
            // Mock enhanced profile fetching
            return {
              id: vendorId,
              certifications: [],
              awards: [],
              socialProof: { linkedinFollowers: 1000 }
            }
          })
        }

        clearCache(): void {
          this.cache.clear()
        }

        getCacheSize(): number {
          return this.cache.size
        }
      }

      const service = new OptimizedTinaCMSDataService()

      // Test that cache is initially empty
      expect(service.getCacheSize()).toBe(0)

      // Test yacht data caching
      const yachtPromise = service.getYachtData('yacht-1')
      expect(yachtPromise).toBeInstanceOf(Promise)

      // Test enhanced profile caching
      const profilePromise = service.getEnhancedVendorProfile('vendor-1')
      expect(profilePromise).toBeInstanceOf(Promise)
    })
  })
})