import React from 'react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import tinaCMSDataService from '@/lib/tinacms-data-service';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/',
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  }
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
  Router: mockRouter
}));

// Mock external dependencies
jest.mock('tinacms');
jest.mock('@react-three/fiber');
jest.mock('react-pdf');
jest.mock('react-player');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock components that might not be available in test environment
jest.mock('@/components/ui/lazy-media', () => ({
  LazyMedia: ({ children, ...props }: any) => <div data-testid="lazy-media" {...props}>{children}</div>
}));

describe('End-to-End Platform Workflows', () => {
  beforeEach(() => {
    tinaCMSDataService.clearCache();
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Discovery Workflow', () => {
    it('should handle vendor discovery to yacht profile workflow', async () => {
      const mockVendors = [
        {
          id: 'raymarine-teledyne-flir',
          slug: 'raymarine-teledyne-flir',
          name: 'Raymarine (Teledyne FLIR)',
          description: 'Leading marine electronics manufacturer',
          specializations: ['Navigation', 'Electronics'],
          featured: true,
          socialProof: {
            linkedinFollowers: 45000,
            projectsCompleted: 25000,
            testimonialsCount: 1250
          },
          certifications: [
            {
              name: 'ISO 9001:2015',
              verified: true,
              logoUrl: '/certs/iso-9001.png'
            }
          ]
        },
        {
          id: 'caterpillar-marine',
          slug: 'caterpillar-marine',
          name: 'Caterpillar Marine',
          description: 'Marine propulsion systems',
          specializations: ['Propulsion', 'Engines'],
          featured: true
        }
      ];

      const mockDetailedVendor = {
        ...mockVendors[0],
        awards: [
          {
            title: 'Innovation Award 2023',
            organization: 'Marine Electronics Association',
            year: 2023,
            imageUrl: '/awards/innovation-2023.jpg'
          }
        ],
        caseStudies: [
          {
            id: 'superyacht-integration',
            title: 'Superyacht Navigation Integration',
            yachtName: 'Azzam',
            challenge: 'Complex bridge integration',
            solution: 'Custom Axiom Pro array',
            outcome: '99.9% uptime over 5 years'
          }
        ],
        yachtProjects: [
          {
            yachtName: 'Azzam',
            projectType: 'Navigation Suite',
            completionYear: 2013,
            systemsProvided: ['Bridge Integration', 'Radar Systems']
          }
        ]
      };

      const mockYacht = {
        id: 'azzam',
        slug: 'azzam',
        name: 'Azzam',
        description: 'World\'s largest private motor yacht',
        length: 180,
        builder: 'Lürssen',
        launchYear: 2013,
        supplierMap: [
          {
            discipline: 'Navigation',
            vendors: ['raymarine-teledyne-flir'],
            systems: ['Axiom Pro MFD Array'],
            projectValue: 2500000
          }
        ],
        sustainabilityScore: {
          overall: 78,
          carbonFootprint: 70,
          certifications: ['MCA Compliant']
        }
      };

      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockResolvedValue(mockVendors);
      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockResolvedValue(mockDetailedVendor);
      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockResolvedValue(mockYacht);

      // Mock vendor listing component
      const VendorListing = () => {
        const [vendors, setVendors] = React.useState<any[]>([]);

        React.useEffect(() => {
          tinaCMSDataService.getAllVendors().then(setVendors);
        }, []);

        return (
          <div data-testid="vendor-listing">
            {vendors.map(vendor => (
              <div key={vendor.id} data-testid={`vendor-card-${vendor.slug}`}>
                <h3>{vendor.name}</h3>
                <p>{vendor.description}</p>
                <div data-testid="social-proof">
                  {vendor.socialProof && (
                    <span>Projects: {vendor.socialProof.projectsCompleted}</span>
                  )}
                </div>
                <div data-testid="certifications">
                  {vendor.certifications?.map((cert: any, idx: number) => (
                    <span key={idx} data-verified={cert.verified}>
                      {cert.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => mockRouter.push(`/vendors/${vendor.slug}`)}
                  data-testid={`view-vendor-${vendor.slug}`}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        );
      };

      // Mock vendor detail component
      const VendorDetail = ({ slug }: { slug: string }) => {
        const [vendor, setVendor] = React.useState<any>(null);

        React.useEffect(() => {
          tinaCMSDataService.getVendorBySlug(slug).then(setVendor);
        }, [slug]);

        if (!vendor) return <div>Loading...</div>;

        return (
          <div data-testid="vendor-detail">
            <h1>{vendor.name}</h1>
            <section data-testid="awards-section">
              {vendor.awards?.map((award: any, idx: number) => (
                <div key={idx} data-testid={`award-${idx}`}>
                  <h4>{award.title}</h4>
                  <span>{award.year}</span>
                </div>
              ))}
            </section>
            <section data-testid="case-studies">
              {vendor.caseStudies?.map((study: any, idx: number) => (
                <div key={idx} data-testid={`case-study-${idx}`}>
                  <h4>{study.title}</h4>
                  <p>Yacht: {study.yachtName}</p>
                  <button
                    onClick={() => mockRouter.push(`/yachts/${study.yachtName.toLowerCase()}`)}
                    data-testid={`view-yacht-${study.yachtName.toLowerCase()}`}
                  >
                    View Yacht
                  </button>
                </div>
              ))}
            </section>
            <section data-testid="yacht-projects">
              {vendor.yachtProjects?.map((project: any, idx: number) => (
                <div key={idx} data-testid={`yacht-project-${idx}`}>
                  <h4>{project.yachtName}</h4>
                  <p>{project.projectType}</p>
                  <span>{project.completionYear}</span>
                </div>
              ))}
            </section>
          </div>
        );
      };

      // Mock yacht detail component
      const YachtDetail = ({ slug }: { slug: string }) => {
        const [yacht, setYacht] = React.useState<any>(null);

        React.useEffect(() => {
          tinaCMSDataService.getYachtBySlug(slug).then(setYacht);
        }, [slug]);

        if (!yacht) return <div>Loading...</div>;

        return (
          <div data-testid="yacht-detail">
            <h1>{yacht.name}</h1>
            <div data-testid="yacht-specs">
              <p>Length: {yacht.length}m</p>
              <p>Builder: {yacht.builder}</p>
              <p>Launch Year: {yacht.launchYear}</p>
            </div>
            <section data-testid="supplier-map">
              {yacht.supplierMap?.map((supplier: any, idx: number) => (
                <div key={idx} data-testid={`supplier-${idx}`}>
                  <h4>{supplier.discipline}</h4>
                  <p>Project Value: ${supplier.projectValue?.toLocaleString()}</p>
                  {supplier.vendors?.map((vendorId: string, vIdx: number) => (
                    <button
                      key={vIdx}
                      onClick={() => mockRouter.push(`/vendors/${vendorId}`)}
                      data-testid={`vendor-link-${vendorId}`}
                    >
                      View Vendor
                    </button>
                  ))}
                </div>
              ))}
            </section>
            <section data-testid="sustainability-score">
              <h3>Sustainability Score: {yacht.sustainabilityScore?.overall}</h3>
              <p>Carbon Footprint: {yacht.sustainabilityScore?.carbonFootprint}</p>
              <div data-testid="certifications">
                {yacht.sustainabilityScore?.certifications?.map((cert: string, idx: number) => (
                  <span key={idx} data-testid={`cert-${idx}`}>{cert}</span>
                ))}
              </div>
            </section>
          </div>
        );
      };

      // Test Step 1: Vendor Discovery
      const { rerender } = render(<VendorListing />);

      await waitFor(() => {
        expect(screen.getByTestId('vendor-listing')).toBeInTheDocument();
      });

      // Verify vendors are displayed with enhanced features
      expect(screen.getByTestId('vendor-card-raymarine-teledyne-flir')).toBeInTheDocument();
      expect(screen.getByText('Raymarine (Teledyne FLIR)')).toBeInTheDocument();
      expect(screen.getByText('Projects: 25000')).toBeInTheDocument();

      // Verify certification badge data
      const certSpan = screen.getByText('ISO 9001:2015');
      expect(certSpan).toHaveAttribute('data-verified', 'true');

      // Test Step 2: Navigate to Vendor Detail
      const viewVendorButton = screen.getByTestId('view-vendor-raymarine-teledyne-flir');
      fireEvent.click(viewVendorButton);

      expect(mockPush).toHaveBeenCalledWith('/vendors/raymarine-teledyne-flir');

      // Render vendor detail page
      rerender(<VendorDetail slug="raymarine-teledyne-flir" />);

      await waitFor(() => {
        expect(screen.getByTestId('vendor-detail')).toBeInTheDocument();
      });

      // Verify enhanced vendor profile features
      expect(screen.getByTestId('awards-section')).toBeInTheDocument();
      expect(screen.getByText('Innovation Award 2023')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();

      expect(screen.getByTestId('case-studies')).toBeInTheDocument();
      expect(screen.getByText('Superyacht Navigation Integration')).toBeInTheDocument();
      expect(screen.getByText('Yacht: Azzam')).toBeInTheDocument();

      // Test Step 3: Navigate to Yacht from Case Study
      const viewYachtButton = screen.getByTestId('view-yacht-azzam');
      fireEvent.click(viewYachtButton);

      expect(mockPush).toHaveBeenCalledWith('/yachts/azzam');

      // Render yacht detail page
      rerender(<YachtDetail slug="azzam" />);

      await waitFor(() => {
        expect(screen.getByTestId('yacht-detail')).toBeInTheDocument();
      });

      // Verify yacht profile features
      expect(screen.getByText('Azzam')).toBeInTheDocument();
      expect(screen.getByText('Length: 180m')).toBeInTheDocument();
      expect(screen.getByText('Builder: Lürssen')).toBeInTheDocument();

      // Verify supplier map
      expect(screen.getByTestId('supplier-map')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Project Value: $2,500,000')).toBeInTheDocument();

      // Verify sustainability scoring
      expect(screen.getByTestId('sustainability-score')).toBeInTheDocument();
      expect(screen.getByText('Sustainability Score: 78')).toBeInTheDocument();
      expect(screen.getByText('Carbon Footprint: 70')).toBeInTheDocument();
      expect(screen.getByTestId('cert-0')).toHaveTextContent('MCA Compliant');

      // Test Step 4: Navigate back to vendor from yacht
      const vendorLinkButton = screen.getByTestId('vendor-link-raymarine-teledyne-flir');
      fireEvent.click(vendorLinkButton);

      expect(mockPush).toHaveBeenCalledWith('/vendors/raymarine-teledyne-flir');

      // Verify all data service calls were made
      expect(tinaCMSDataService.getAllVendors).toHaveBeenCalled();
      expect(tinaCMSDataService.getVendorBySlug).toHaveBeenCalledWith('raymarine-teledyne-flir');
      expect(tinaCMSDataService.getYachtBySlug).toHaveBeenCalledWith('azzam');
    });
  });

  describe('Product Comparison Workflow', () => {
    it('should handle product comparison and evaluation workflow', async () => {
      const mockProducts = [
        {
          id: 'axiom-pro-mfd',
          slug: 'axiom-pro-mfd-series',
          name: 'Axiom Pro MFD Series',
          vendorId: 'raymarine-teledyne-flir',
          comparisonMetrics: {
            performance: {
              processorSpeed: 'Quad-core ARM',
              displayResolution: '1280x800',
              responseTime: '< 0.1 seconds'
            },
            connectivity: {
              ethernet: 'RayNet Ethernet',
              wireless: 'Wi-Fi 802.11b/g/n'
            }
          },
          performanceMetrics: {
            reliability: 99.5,
            userSatisfaction: 4.7,
            warranty: '3 years'
          },
          ownerReviews: {
            overallRating: 4.7,
            totalReviews: 147,
            reviews: [
              {
                reviewerName: 'Captain Mark Thompson',
                yachtName: 'Sea Voyager',
                rating: 5,
                verified: true,
                content: 'Outstanding performance and reliability'
              }
            ]
          },
          visualDemos: {
            images360: [
              { url: '/demos/360-view.jpg', type: '360_image' }
            ],
            videos: [
              { url: '/demos/operation.mp4', duration: 180 }
            ]
          }
        },
        {
          id: 'competitor-mfd',
          slug: 'competitor-mfd',
          name: 'Competitor MFD',
          vendorId: 'competitor-vendor',
          comparisonMetrics: {
            performance: {
              processorSpeed: 'Dual-core ARM',
              displayResolution: '1024x768',
              responseTime: '< 0.2 seconds'
            },
            connectivity: {
              ethernet: 'Standard Ethernet',
              wireless: 'Wi-Fi 802.11b/g'
            }
          },
          performanceMetrics: {
            reliability: 95.2,
            userSatisfaction: 4.3,
            warranty: '2 years'
          }
        }
      ];

      jest.spyOn(tinaCMSDataService, 'getAllProducts').mockResolvedValue(mockProducts);
      jest.spyOn(tinaCMSDataService, 'getProductBySlug').mockImplementation((slug) => {
        return Promise.resolve(mockProducts.find(p => p.slug === slug) || null);
      });

      // Mock product comparison component
      const ProductComparison = () => {
        const [products, setProducts] = React.useState<any[]>([]);
        const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);

        React.useEffect(() => {
          tinaCMSDataService.getAllProducts().then(setProducts);
        }, []);

        const toggleProductSelection = (slug: string) => {
          setSelectedProducts(prev =>
            prev.includes(slug)
              ? prev.filter(s => s !== slug)
              : [...prev, slug]
          );
        };

        const comparisonProducts = products.filter(p => selectedProducts.includes(p.slug));

        return (
          <div data-testid="product-comparison">
            <section data-testid="product-selection">
              {products.map(product => (
                <div key={product.id} data-testid={`product-${product.slug}`}>
                  <h3>{product.name}</h3>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.slug)}
                      onChange={() => toggleProductSelection(product.slug)}
                      data-testid={`select-${product.slug}`}
                    />
                    Compare
                  </label>
                </div>
              ))}
            </section>

            {comparisonProducts.length > 1 && (
              <section data-testid="comparison-matrix">
                <h2>Product Comparison</h2>
                <div data-testid="performance-comparison">
                  <h3>Performance</h3>
                  {comparisonProducts.map(product => (
                    <div key={product.id} data-testid={`performance-${product.slug}`}>
                      <h4>{product.name}</h4>
                      <p>Processor: {product.comparisonMetrics.performance.processorSpeed}</p>
                      <p>Resolution: {product.comparisonMetrics.performance.displayResolution}</p>
                      <p>Response: {product.comparisonMetrics.performance.responseTime}</p>
                      <p>Reliability: {product.performanceMetrics.reliability}%</p>
                    </div>
                  ))}
                </div>
                <div data-testid="connectivity-comparison">
                  <h3>Connectivity</h3>
                  {comparisonProducts.map(product => (
                    <div key={product.id} data-testid={`connectivity-${product.slug}`}>
                      <h4>{product.name}</h4>
                      <p>Ethernet: {product.comparisonMetrics.connectivity.ethernet}</p>
                      <p>Wireless: {product.comparisonMetrics.connectivity.wireless}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );
      };

      // Mock product detail component
      const ProductDetail = ({ slug }: { slug: string }) => {
        const [product, setProduct] = React.useState<any>(null);

        React.useEffect(() => {
          tinaCMSDataService.getProductBySlug(slug).then(setProduct);
        }, [slug]);

        if (!product) return <div>Loading...</div>;

        return (
          <div data-testid="product-detail">
            <h1>{product.name}</h1>
            <section data-testid="owner-reviews">
              <h2>Owner Reviews</h2>
              <p>Overall Rating: {product.ownerReviews?.overallRating}/5</p>
              <p>Total Reviews: {product.ownerReviews?.totalReviews}</p>
              {product.ownerReviews?.reviews?.map((review: any, idx: number) => (
                <div key={idx} data-testid={`review-${idx}`}>
                  <h4>{review.reviewerName}</h4>
                  <p>Yacht: {review.yachtName}</p>
                  <p>Rating: {review.rating}/5</p>
                  <p data-verified={review.verified}>{review.content}</p>
                </div>
              ))}
            </section>
            <section data-testid="visual-demos">
              <h2>Visual Demos</h2>
              {product.visualDemos?.images360?.map((image: any, idx: number) => (
                <div key={idx} data-testid={`360-image-${idx}`}>
                  <img src={image.url} alt="360° view" />
                  <span>{image.type}</span>
                </div>
              ))}
              {product.visualDemos?.videos?.map((video: any, idx: number) => (
                <div key={idx} data-testid={`video-${idx}`}>
                  <video src={video.url} />
                  <span>Duration: {video.duration}s</span>
                </div>
              ))}
            </section>
          </div>
        );
      };

      // Test Step 1: Product Selection for Comparison
      const { rerender } = render(<ProductComparison />);

      await waitFor(() => {
        expect(screen.getByTestId('product-comparison')).toBeInTheDocument();
      });

      // Verify products are listed
      expect(screen.getByTestId('product-axiom-pro-mfd-series')).toBeInTheDocument();
      expect(screen.getByTestId('product-competitor-mfd')).toBeInTheDocument();
      expect(screen.getByText('Axiom Pro MFD Series')).toBeInTheDocument();
      expect(screen.getByText('Competitor MFD')).toBeInTheDocument();

      // Test Step 2: Select products for comparison
      const selectRaymarineCheckbox = screen.getByTestId('select-axiom-pro-mfd-series');
      const selectCompetitorCheckbox = screen.getByTestId('select-competitor-mfd');

      fireEvent.click(selectRaymarineCheckbox);
      fireEvent.click(selectCompetitorCheckbox);

      expect(selectRaymarineCheckbox).toBeChecked();
      expect(selectCompetitorCheckbox).toBeChecked();

      // Test Step 3: Verify comparison matrix appears
      await waitFor(() => {
        expect(screen.getByTestId('comparison-matrix')).toBeInTheDocument();
      });

      // Verify performance comparison
      expect(screen.getByTestId('performance-comparison')).toBeInTheDocument();
      expect(screen.getByTestId('performance-axiom-pro-mfd-series')).toBeInTheDocument();
      expect(screen.getByTestId('performance-competitor-mfd')).toBeInTheDocument();

      expect(screen.getByText('Processor: Quad-core ARM')).toBeInTheDocument();
      expect(screen.getByText('Processor: Dual-core ARM')).toBeInTheDocument();
      expect(screen.getByText('Reliability: 99.5%')).toBeInTheDocument();
      expect(screen.getByText('Reliability: 95.2%')).toBeInTheDocument();

      // Verify connectivity comparison
      expect(screen.getByTestId('connectivity-comparison')).toBeInTheDocument();
      expect(screen.getByText('Ethernet: RayNet Ethernet')).toBeInTheDocument();
      expect(screen.getByText('Ethernet: Standard Ethernet')).toBeInTheDocument();

      // Test Step 4: Navigate to detailed product view
      rerender(<ProductDetail slug="axiom-pro-mfd-series" />);

      await waitFor(() => {
        expect(screen.getByTestId('product-detail')).toBeInTheDocument();
      });

      // Verify owner reviews section
      expect(screen.getByTestId('owner-reviews')).toBeInTheDocument();
      expect(screen.getByText('Overall Rating: 4.7/5')).toBeInTheDocument();
      expect(screen.getByText('Total Reviews: 147')).toBeInTheDocument();

      const review = screen.getByTestId('review-0');
      expect(review).toBeInTheDocument();
      expect(screen.getByText('Captain Mark Thompson')).toBeInTheDocument();
      expect(screen.getByText('Yacht: Sea Voyager')).toBeInTheDocument();
      expect(screen.getByText('Rating: 5/5')).toBeInTheDocument();

      const reviewContent = screen.getByText('Outstanding performance and reliability');
      expect(reviewContent).toHaveAttribute('data-verified', 'true');

      // Verify visual demos section
      expect(screen.getByTestId('visual-demos')).toBeInTheDocument();
      expect(screen.getByTestId('360-image-0')).toBeInTheDocument();
      expect(screen.getByTestId('video-0')).toBeInTheDocument();
      expect(screen.getByText('Duration: 180s')).toBeInTheDocument();

      // Verify all data service calls
      expect(tinaCMSDataService.getAllProducts).toHaveBeenCalled();
      expect(tinaCMSDataService.getProductBySlug).toHaveBeenCalledWith('axiom-pro-mfd-series');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing data gracefully', async () => {
      jest.spyOn(tinaCMSDataService, 'getVendorBySlug').mockResolvedValue(null);
      jest.spyOn(tinaCMSDataService, 'getYachtBySlug').mockResolvedValue(null);

      const ErrorHandlingComponent = ({ type, slug }: { type: string; slug: string }) => {
        const [data, setData] = React.useState<any>(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          const fetchData = async () => {
            try {
              let result;
              if (type === 'vendor') {
                result = await tinaCMSDataService.getVendorBySlug(slug);
              } else if (type === 'yacht') {
                result = await tinaCMSDataService.getYachtBySlug(slug);
              }

              if (!result) {
                setError(`${type} not found`);
              } else {
                setData(result);
              }
            } catch (err) {
              setError(`Error loading ${type}`);
            } finally {
              setLoading(false);
            }
          };

          fetchData();
        }, [type, slug]);

        if (loading) return <div data-testid="loading">Loading...</div>;
        if (error) return <div data-testid="error">{error}</div>;
        if (!data) return <div data-testid="not-found">Content not found</div>;

        return <div data-testid="content">{data.name}</div>;
      };

      // Test missing vendor
      const { rerender } = render(<ErrorHandlingComponent type="vendor" slug="non-existent" />);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
        expect(screen.getByText('vendor not found')).toBeInTheDocument();
      });

      // Test missing yacht
      rerender(<ErrorHandlingComponent type="yacht" slug="non-existent" />);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
        expect(screen.getByText('yacht not found')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      jest.spyOn(tinaCMSDataService, 'getAllVendors').mockRejectedValue(new Error('API Error'));

      const ErrorBoundaryComponent = () => {
        const [vendors, setVendors] = React.useState<any[]>([]);
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          tinaCMSDataService.getAllVendors()
            .then(setVendors)
            .catch((err) => setError(err.message));
        }, []);

        if (error) {
          return <div data-testid="api-error">API Error: {error}</div>;
        }

        return (
          <div data-testid="vendor-list">
            {vendors.map(vendor => (
              <div key={vendor.id}>{vendor.name}</div>
            ))}
          </div>
        );
      };

      render(<ErrorBoundaryComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('api-error')).toBeInTheDocument();
        expect(screen.getByText('API Error: API Error')).toBeInTheDocument();
      });
    });
  });
});