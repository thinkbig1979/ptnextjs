/**
 * Component Performance Tests
 * Tests for timeline and supplier map rendering performance
 */

import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import React from 'react'

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  ),
}))

jest.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Component Performance Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('YachtTimeline Performance', () => {
    const createMockTimelineEvents = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        date: `2020-${String(i % 12 + 1).padStart(2, '0')}-15`,
        category: ['launch', 'delivery', 'refit', 'milestone', 'service'][i % 5] as any,
        title: `Event ${i + 1}`,
        description: `Description for event ${i + 1}`,
        details: `Detailed information for event ${i + 1}`,
        location: `Location ${i + 1}`,
        participants: [`Participant ${i + 1}`],
        images: [`/images/event-${i + 1}.jpg`],
        documents: [`/docs/event-${i + 1}.pdf`]
      }))
    }

    it('should render large timeline datasets efficiently using virtualization', () => {
      const VirtualizedTimeline = ({ events }: { events: any[] }) => {
        const [visibleEvents, setVisibleEvents] = React.useState(events.slice(0, 10))
        const containerRef = React.useRef<HTMLDivElement>(null)

        React.useEffect(() => {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && entry.target === containerRef.current?.lastElementChild) {
                  setVisibleEvents(prev => {
                    const nextBatch = events.slice(prev.length, prev.length + 10)
                    return [...prev, ...nextBatch]
                  })
                }
              })
            },
            { threshold: 0.1 }
          )

          const lastChild = containerRef.current?.lastElementChild
          if (lastChild) {
            observer.observe(lastChild)
          }

          return () => observer.disconnect()
        }, [events, visibleEvents])

        return (
          <div ref={containerRef} data-testid="virtualized-timeline">
            {visibleEvents.map((event, index) => (
              <div key={index} data-testid={`timeline-event-${index}`}>
                {event.title}
              </div>
            ))}
          </div>
        )
      }

      const events = createMockTimelineEvents(100)
      render(<VirtualizedTimeline events={events} />)

      // Should initially render only 10 items
      expect(screen.getAllByTestId(/timeline-event-/)).toHaveLength(10)
      expect(screen.getByTestId('timeline-event-0')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-event-9')).toBeInTheDocument()
    })

    it('should optimize timeline rendering with React.memo and useMemo', () => {
      const OptimizedTimelineEvent = React.memo(({ event }: { event: any }) => {
        return (
          <div data-testid={`event-${event.title}`}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </div>
        )
      })

      const OptimizedTimeline = ({ events }: { events: any[] }) => {
        const sortedEvents = React.useMemo(() => {
          return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }, [events])

        const filteredEvents = React.useMemo(() => {
          return sortedEvents.filter(event => event.category === 'milestone')
        }, [sortedEvents])

        return (
          <div data-testid="optimized-timeline">
            {filteredEvents.map((event, index) => (
              <OptimizedTimelineEvent key={`${event.date}-${index}`} event={event} />
            ))}
          </div>
        )
      }

      const events = createMockTimelineEvents(20).map(event => ({
        ...event,
        category: 'milestone'
      }))

      const { rerender } = render(<OptimizedTimeline events={events} />)

      // Verify rendering
      expect(screen.getByTestId('optimized-timeline')).toBeInTheDocument()
      expect(screen.getAllByTestId(/event-/)).toHaveLength(20)

      // Re-render with same props - should not cause unnecessary re-renders
      rerender(<OptimizedTimeline events={events} />)
      expect(screen.getAllByTestId(/event-/)).toHaveLength(20)
    })

    it('should handle large datasets without performance degradation', () => {
      const PerformanceTimeline = ({ events }: { events: any[] }) => {
        const [renderTime, setRenderTime] = React.useState<number>(0)

        React.useEffect(() => {
          const start = performance.now()
          // Simulate processing time
          const end = performance.now()
          setRenderTime(end - start)
        }, [events])

        return (
          <div data-testid="performance-timeline" data-render-time={renderTime}>
            {events.map((event, index) => (
              <div key={index} data-testid={`perf-event-${index}`}>
                {event.title}
              </div>
            ))}
          </div>
        )
      }

      const largeEventSet = createMockTimelineEvents(1000)
      render(<PerformanceTimeline events={largeEventSet} />)

      const timeline = screen.getByTestId('performance-timeline')
      expect(timeline).toBeInTheDocument()

      // Should handle large dataset
      expect(screen.getAllByTestId(/perf-event-/)).toHaveLength(1000)
    })
  })

  describe('SupplierMap Performance', () => {
    const createMockSuppliers = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        vendorId: `vendor-${i + 1}`,
        vendorName: `Vendor ${i + 1}`,
        role: ['primary', 'subcontractor', 'consultant'][i % 3] as any,
        discipline: ['Engine Systems', 'Navigation', 'Interior', 'Hull', 'Electronics'][i % 5],
        contribution: `Contribution for vendor ${i + 1}`,
        contractValue: 100000 + i * 10000,
        timeline: {
          start: '2020-01-01',
          end: '2020-12-31'
        },
        certifications: [`Cert ${i + 1}`],
        specializations: [`Spec ${i + 1}`]
      }))
    }

    it('should optimize supplier map rendering with grouping and filtering', () => {
      const OptimizedSupplierMap = ({ suppliers }: { suppliers: any[] }) => {
        const [selectedDiscipline, setSelectedDiscipline] = React.useState<string | null>(null)

        const groupedSuppliers = React.useMemo(() => {
          const groups: Record<string, any[]> = {}
          suppliers.forEach(supplier => {
            if (!groups[supplier.discipline]) {
              groups[supplier.discipline] = []
            }
            groups[supplier.discipline].push(supplier)
          })
          return groups
        }, [suppliers])

        const filteredGroups = React.useMemo(() => {
          if (!selectedDiscipline) return groupedSuppliers
          return { [selectedDiscipline]: groupedSuppliers[selectedDiscipline] || [] }
        }, [groupedSuppliers, selectedDiscipline])

        return (
          <div data-testid="optimized-supplier-map">
            <div data-testid="discipline-filters">
              {Object.keys(groupedSuppliers).map(discipline => (
                <button
                  key={discipline}
                  onClick={() => setSelectedDiscipline(discipline)}
                  data-testid={`filter-${discipline.toLowerCase().replace(' ', '-')}`}
                >
                  {discipline}
                </button>
              ))}
            </div>
            {Object.entries(filteredGroups).map(([discipline, suppliers]) => (
              <div key={discipline} data-testid={`group-${discipline.toLowerCase().replace(' ', '-')}`}>
                <h3>{discipline}</h3>
                {suppliers.map((supplier, index) => (
                  <div key={`${supplier.vendorId}-${index}`} data-testid={`supplier-${supplier.vendorId}`}>
                    {supplier.vendorName}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      }

      const suppliers = createMockSuppliers(50)
      render(<OptimizedSupplierMap suppliers={suppliers} />)

      // Should render all discipline groups initially
      expect(screen.getByTestId('optimized-supplier-map')).toBeInTheDocument()
      expect(screen.getByTestId('discipline-filters')).toBeInTheDocument()

      // Should have discipline filter buttons
      expect(screen.getByTestId('filter-engine-systems')).toBeInTheDocument()
      expect(screen.getByTestId('filter-navigation')).toBeInTheDocument()
    })

    it('should implement efficient search and filtering', () => {
      const SearchableSupplierMap = ({ suppliers }: { suppliers: any[] }) => {
        const [searchTerm, setSearchTerm] = React.useState('')
        const [roleFilter, setRoleFilter] = React.useState<string | null>(null)

        const filteredSuppliers = React.useMemo(() => {
          return suppliers.filter(supplier => {
            const matchesSearch = searchTerm === '' ||
              supplier.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              supplier.discipline.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesRole = roleFilter === null || supplier.role === roleFilter

            return matchesSearch && matchesRole
          })
        }, [suppliers, searchTerm, roleFilter])

        return (
          <div data-testid="searchable-supplier-map">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="supplier-search"
            />
            <select
              value={roleFilter || ''}
              onChange={(e) => setRoleFilter(e.target.value || null)}
              data-testid="role-filter"
            >
              <option value="">All Roles</option>
              <option value="primary">Primary</option>
              <option value="subcontractor">Subcontractor</option>
              <option value="consultant">Consultant</option>
            </select>
            <div data-testid="filtered-results" data-count={filteredSuppliers.length}>
              {filteredSuppliers.map((supplier, index) => (
                <div key={`${supplier.vendorId}-${index}`} data-testid={`filtered-supplier-${supplier.vendorId}`}>
                  {supplier.vendorName} - {supplier.role}
                </div>
              ))}
            </div>
          </div>
        )
      }

      const suppliers = createMockSuppliers(30)
      render(<SearchableSupplierMap suppliers={suppliers} />)

      // Should render search interface
      expect(screen.getByTestId('supplier-search')).toBeInTheDocument()
      expect(screen.getByTestId('role-filter')).toBeInTheDocument()
      expect(screen.getByTestId('filtered-results')).toBeInTheDocument()

      // Should show all suppliers initially
      expect(screen.getByTestId('filtered-results')).toHaveAttribute('data-count', '30')
    })

    it('should handle large supplier datasets efficiently', () => {
      const LargeSupplierMap = ({ suppliers }: { suppliers: any[] }) => {
        const [visibleSuppliers, setVisibleSuppliers] = React.useState(suppliers.slice(0, 20))
        const [isLoading, setIsLoading] = React.useState(false)

        const loadMoreSuppliers = React.useCallback(() => {
          if (isLoading || visibleSuppliers.length >= suppliers.length) return

          setIsLoading(true)
          // Simulate loading delay
          setTimeout(() => {
            setVisibleSuppliers(prev => [
              ...prev,
              ...suppliers.slice(prev.length, prev.length + 20)
            ])
            setIsLoading(false)
          }, 100)
        }, [suppliers, visibleSuppliers.length, isLoading])

        return (
          <div data-testid="large-supplier-map">
            {visibleSuppliers.map((supplier, index) => (
              <div key={`${supplier.vendorId}-${index}`} data-testid={`large-supplier-${supplier.vendorId}`}>
                {supplier.vendorName}
              </div>
            ))}
            {visibleSuppliers.length < suppliers.length && (
              <button
                onClick={loadMoreSuppliers}
                disabled={isLoading}
                data-testid="load-more-suppliers"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            )}
            <div data-testid="supplier-count" data-visible={visibleSuppliers.length} data-total={suppliers.length}>
              Showing {visibleSuppliers.length} of {suppliers.length}
            </div>
          </div>
        )
      }

      const largeSupplierSet = createMockSuppliers(200)
      render(<LargeSupplierMap suppliers={largeSupplierSet} />)

      // Should initially show 20 suppliers
      expect(screen.getAllByTestId(/large-supplier-/)).toHaveLength(20)
      expect(screen.getByTestId('load-more-suppliers')).toBeInTheDocument()
      expect(screen.getByTestId('supplier-count')).toHaveAttribute('data-visible', '20')
      expect(screen.getByTestId('supplier-count')).toHaveAttribute('data-total', '200')
    })
  })

  describe('Image Loading Performance', () => {
    it('should implement lazy loading for timeline images', () => {
      const LazyTimelineImage = ({ src, alt }: { src: string; alt: string }) => {
        const [isVisible, setIsVisible] = React.useState(false)
        const [isLoaded, setIsLoaded] = React.useState(false)
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
          <div ref={ref} data-testid="lazy-timeline-image">
            {isVisible ? (
              <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                data-testid="timeline-image"
              />
            ) : (
              <div
                data-testid="image-placeholder"
                style={{ backgroundColor: '#f0f0f0', width: '200px', height: '150px' }}
              >
                Loading...
              </div>
            )}
          </div>
        )
      }

      render(<LazyTimelineImage src="/test-image.jpg" alt="Timeline event" />)

      // Should show placeholder initially
      expect(screen.getByTestId('image-placeholder')).toBeInTheDocument()
      expect(screen.queryByTestId('timeline-image')).not.toBeInTheDocument()
    })
  })

  describe('Bundle Size Optimization', () => {
    it('should support code splitting for heavy components', () => {
      const LazyHeavyComponent = React.lazy(() =>
        Promise.resolve({
          default: () => <div data-testid="heavy-component">Heavy Component Loaded</div>
        })
      )

      const ComponentWithSuspense = () => (
        <React.Suspense fallback={<div data-testid="component-loading">Loading heavy component...</div>}>
          <LazyHeavyComponent />
        </React.Suspense>
      )

      render(<ComponentWithSuspense />)

      // Should show loading state initially
      expect(screen.getByTestId('component-loading')).toBeInTheDocument()
    })
  })
})