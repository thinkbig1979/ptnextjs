// Media file types
export interface MediaFile {
  id: number | string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  url: string;
  ext?: string;
  mime?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Component types
export interface ProductImage {
  id: string;
  url: string; // TinaCMS direct image path
  alt_text?: string;
  altText?: string; // Computed from alt_text for backward compatibility
  is_main?: boolean;
  isMain: boolean; // TinaCMS uses isMain directly
  caption?: string;
  order?: number;
}

export interface Feature {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  order?: number;
}

export interface ServiceArea {
  id: string;
  area: string;
  description?: string;
  icon?: string;
}

export interface CompanyValue {
  id: string;
  value: string;
  description?: string;
}

export interface SEO {
  id: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_image?: MediaFile;
  canonical_url?: string;
  no_index?: boolean;
}

export interface SocialMedia {
  id: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

// Reference data types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usage_count?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Main application types
export interface VendorService {
  service: string;
}

export interface VendorStatistic {
  label: string;
  value: string;
  order?: number;
}

export interface VendorAchievement {
  title: string;
  description: string;
  icon?: string;
  order?: number;
}

// Enhanced vendor profile interfaces for Platform Vision
export interface VendorCertification {
  name: string;
  issuer: string;
  year?: number;
  expiryDate?: string;
  certificateUrl?: string;
  logo?: string;
}

export interface VendorAward {
  title: string;
  year: number;
  organization?: string;
  category?: string;
  description?: string;
}

export interface VendorSocialProof {
  followers?: number;
  projectsCompleted?: number;
  yearsInBusiness?: number;
  customerList?: string[];
}

export interface VendorVideoIntroduction {
  videoUrl?: string;
  thumbnailImage?: string;
  title?: string;
  description?: string;
}

export interface VendorCaseStudy {
  title: string;
  slug?: string; // Auto-generated from title if not provided
  client?: string;
  challenge: string;
  solution: string;
  results?: string;
  images?: string[] | null;
  technologies?: string[];
}

export interface VendorInnovationHighlight {
  technology: string;
  description?: string;
  uniqueApproach?: string;
  benefitsToClients?: string[];
}

export interface VendorTeamMember {
  name: string;
  position: string;
  bio?: string;
  photo?: string;
  linkedinUrl?: string;
  expertise?: string[];
}

export interface VendorPromotionPack {
  featuredPlacement?: boolean;
  editorialCoverage?: boolean;
  searchHighlight?: boolean;
}

export interface VendorEditorialContent {
  title: string;
  excerpt: string;
  content: string;
  publishedAt?: string;
  images?: string[];
}

export interface VendorYachtProject {
  yachtName: string;
  systems: string[];
  projectYear?: number;
  role?: string;
  description?: string;
}

/**
 * Geographic coordinates for vendor location
 * Uses WGS84 coordinate system (standard for GPS/maps)
 */
export interface VendorCoordinates {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}

/**
 * Complete vendor location information
 * All fields optional for backward compatibility
 */
export interface VendorLocation {
  id?: string;            // Unique location identifier
  locationName?: string;  // Display name for this location (e.g., "Monaco Office", "Fort Lauderdale Branch")
  address?: string;       // Full mailing address
  city?: string;          // City name
  country?: string;       // Country name
  postalCode?: string;    // Postal/ZIP code
  latitude?: number;      // Geographic latitude
  longitude?: number;     // Geographic longitude
  isHQ?: boolean;         // Whether this is the headquarters location (default: false)
}

// ============================================================
// Geocoding Types (Photon API Integration)
// ============================================================

/**
 * Photon API GeoJSON feature representing a geocoded location
 * @see https://photon.komoot.io/
 */
export interface PhotonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] - Note: Photon uses [lon, lat] order
  };
  properties: {
    osm_id: number;
    osm_type: string;
    name: string;
    country?: string;
    countrycode?: string;
    state?: string;
    city?: string;
    postcode?: string;
    type: string; // city, town, village, etc.
    extent?: number[];
    osm_key?: string;
    osm_value?: string;
  };
}

/**
 * Photon API response structure (GeoJSON FeatureCollection)
 * @see https://photon.komoot.io/
 */
export interface PhotonResponse {
  type: 'FeatureCollection';
  features: PhotonFeature[];
}

/**
 * Query parameters for the /api/geocode endpoint
 */
export interface GeocodeQueryParams {
  /** Location search query */
  q: string;
  /** Maximum number of results to return (default: 5) */
  limit?: number;
  /** Language code for results (default: 'en') */
  lang?: string;
}

/**
 * Successful response from /api/geocode endpoint
 * Returns Photon API features directly
 */
export interface GeocodeSuccessResponse {
  success: true;
  results: PhotonFeature[];
}

/**
 * Error response from /api/geocode endpoint
 */
export interface GeocodeErrorResponse {
  success: false;
  error: string;
  code: 'RATE_LIMIT' | 'INVALID_QUERY' | 'SERVICE_ERROR' | 'NETWORK_ERROR' | 'SERVICE_UNAVAILABLE';
  retryAfter?: number;
}

/**
 * Union type for all possible /api/geocode responses
 */
export type GeocodeResponse = GeocodeSuccessResponse | GeocodeErrorResponse;

// ============================================================
// Media Gallery Types (Tier 1+)
// ============================================================

/**
 * Type of media item in gallery
 */
export type MediaGalleryItemType = 'image' | 'video';

/**
 * Individual media item in vendor gallery
 * Supports both uploaded images and embedded videos (YouTube, Vimeo)
 */
export interface MediaGalleryItem {
  id: string;
  type: MediaGalleryItemType;
  /** For images: URL to uploaded file; For videos: Embed URL (YouTube, Vimeo) */
  url: string;
  /** Original filename for uploaded images */
  filename?: string;
  /** Display caption for the media */
  caption?: string;
  /** Alt text for accessibility (images only) */
  altText?: string;
  /** Album/category name for organization */
  album?: string;
  /** Display order within gallery */
  order?: number;
  /** Thumbnail URL for videos */
  thumbnailUrl?: string;
  /** Video duration in seconds (videos only) */
  duration?: number;
  /** Video platform (youtube, vimeo) for embed handling */
  videoPlatform?: 'youtube' | 'vimeo';
  /** ISO timestamp when uploaded */
  uploadedAt?: string;
}

export interface Vendor {
  id: string;
  slug?: string;
  name: string;
  description: string;
  logo?: string; // TinaCMS uses direct string paths
  image?: string; // TinaCMS uses direct string paths
  website?: string;
  founded?: number;
  location?: VendorLocation | string; // Legacy single location (deprecated, use locations array)
  locations?: VendorLocation[]; // New: Array of office locations (multi-location support)
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3'; // Vendor subscription tier (affects multi-location access)
  featured?: boolean;
  partner?: boolean; // New field: indicates if vendor is also a strategic partner
  profileSubmitted?: boolean; // Indicates if vendor has submitted their profile for review
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;

  // Contact information
  contactEmail?: string;
  contactPhone?: string;

  // Company details
  foundedYear?: number; // Year company was founded (for years in business computation)
  longDescription?: string; // Detailed company description
  serviceAreas?: ServiceArea[]; // Service areas/specializations
  companyValues?: CompanyValue[]; // Company values

  // Social media
  linkedinUrl?: string;
  twitterUrl?: string;

  // Social proof metrics (Tier 1+)
  totalProjects?: number;
  employeeCount?: number;
  linkedinFollowers?: number;
  instagramFollowers?: number;
  clientSatisfactionScore?: number; // 0-100
  repeatClientPercentage?: number; // 0-100

  // Video introduction (Tier 1+)
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: string;
  videoTitle?: string;
  videoDescription?: string;

  // TinaCMS simplified relations
  category?: string; // Resolved category name
  tags?: string[]; // Resolved tag names array
  products?: Product[];
  services?: VendorService[]; // Services offered by vendor
  seo?: SEO;

  // New company-specific content
  mission?: string; // Company-specific mission statement
  statistics?: VendorStatistic[]; // Company statistics/metrics
  achievements?: VendorAchievement[]; // Why choose us achievements

  // Enhanced profile content for Platform Vision
  certifications?: VendorCertification[];
  awards?: VendorAward[];
  socialProof?: VendorSocialProof;
  videoIntroduction?: VendorVideoIntroduction;
  caseStudies?: VendorCaseStudy[];
  innovationHighlights?: VendorInnovationHighlight[];
  teamMembers?: TeamMember[];
  yachtProjects?: VendorYachtProject[];
  promotionPack?: VendorPromotionPack;
  editorialContent?: VendorEditorialContent[];
  companyName?: string;
  mediaGallery?: MediaGalleryItem[]; // Media gallery (Tier 1+) - images and videos organized by album

  // Reviews
  vendorReviews?: VendorReview[];

  // Computed/backward compatibility fields
  categoryName?: string; // Alias for category
  tagNames?: string[]; // Alias for tags
  logoUrl?: string; // Alias for logo
  imageUrl?: string; // Alias for image
}

// Legacy Partner interface for backward compatibility - simplified to extend Vendor
export interface Partner extends Vendor {
  // Partner is now simply an alias for Vendor to eliminate duplication
  // All functionality is inherited from the Vendor interface
}

// ============================================================================
// RSC SERIALIZATION TYPES
// These types represent the serialized shapes passed from Server Components
// to Client Components. They contain only the fields needed by the client,
// reducing RSC payload size and avoiding "as Type[]" casts.
// ============================================================================

/**
 * Serialized vendor location for client components.
 * Contains only the fields needed for map display and location filtering.
 * Used in: vendors/page.tsx serializeVendorForClient()
 */
export interface SerializedVendorLocation {
  id?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isHQ?: boolean;
}

/**
 * Serialized vendor for vendor listing pages.
 * Contains only the fields needed by VendorsClient for display and filtering.
 * Used in: vendors/page.tsx serializeVendorForClient()
 */
export interface SerializedVendor {
  id: string;
  slug?: string;
  name: string;
  description: string;
  logo?: string;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  featured?: boolean;
  partner?: boolean;
  foundedYear?: number;
  founded?: number;
  category?: string;
  tags?: string[];
  locations?: SerializedVendorLocation[];
}

/**
 * Minimal serialized vendor for product page vendor lookup.
 * Contains only the fields needed to determine if a vendor is a partner.
 * Used in: products/page.tsx serializeVendorForProductLookup()
 */
export interface SerializedVendorMinimal {
  id: string;
  partner?: boolean;
}

/**
 * Serialized product for product listing pages.
 * Contains only the fields needed by ProductsClient for display and filtering.
 * Used in: products/page.tsx serializeProductForClient()
 */
export interface SerializedProduct {
  id: string;
  slug?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price?: string;
  image?: string;
  category?: string;
  tags?: string[];
  features?: Array<{ id: string; title: string }>;
  images?: Array<{ url: string; isMain: boolean; altText?: string }>;
  vendorId?: string;
  partnerId?: string;
  partnerName?: string;
  vendorName?: string;
  vendor?: SerializedVendorMinimal;
  mainImage?: { url: string; altText?: string };
  // Fields used for "Comparable" badge display
  comparisonMetrics?: Product['comparisonMetrics'];
  specifications?: ProductSpecification[];
  integrationCompatibility?: string[];
}

/**
 * Minimal serialized product for vendor page product filtering.
 * Contains only the fields needed to filter products by category/vendor.
 * Used in: vendors/page.tsx serializeProductForClient()
 */
export interface SerializedProductMinimal {
  id: string;
  category?: string;
  vendorId?: string;
  partnerId?: string;
}

// ============================================================================
// USER TYPES (for Payload CMS authentication)
// ============================================================================

/**
 * User (from Payload CMS Users collection)
 * Minimal type definition for user relationships
 */
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'vendor' | 'user';
  vendorId?: string; // For vendor users
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// TIER UPGRADE REQUEST TYPES
// ============================================================================

/**
 * Tier Upgrade Request
 * Represents a vendor's request to upgrade their subscription tier
 */
export interface TierUpgradeRequest {
  id: string;
  /** Vendor making the request - can be ID or populated object */
  vendor: string | Vendor;
  /** User who submitted the request - can be ID or populated object */
  user: string | User;
  /** Current tier at time of request (snapshot) */
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3';
  /** Requested tier (must be higher than current, cannot be 'free') */
  requestedTier: 'tier1' | 'tier2' | 'tier3';
  /** Request status */
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  /** Optional business justification from vendor (max 500 characters) */
  vendorNotes?: string;
  /** Optional rejection reason from admin (max 1000 characters) */
  rejectionReason?: string;
  /** Admin who reviewed the request - can be ID or populated object */
  reviewedBy?: string | User;
  /** Timestamp when request was submitted (ISO 8601) */
  requestedAt: string;
  /** Timestamp when request was reviewed (ISO 8601) */
  reviewedAt?: string;
  /** Payload CMS auto timestamp */
  createdAt: string;
  /** Payload CMS auto timestamp */
  updatedAt: string;
}

/**
 * Payload for creating a tier upgrade request
 * POST /api/portal/vendors/[id]/tier-upgrade-request
 */
export interface CreateTierUpgradeRequestPayload {
  /** Requested tier (must be higher than current tier) */
  requestedTier: 'tier1' | 'tier2' | 'tier3';
  /** Optional business justification (recommended, max 500 characters) */
  vendorNotes?: string;
}

/**
 * Response for successful tier upgrade request creation
 */
export interface CreateTierUpgradeRequestResponse {
  success: true;
  data: TierUpgradeRequest;
}

/**
 * Response for getting vendor's tier upgrade request
 * GET /api/portal/vendors/[id]/tier-upgrade-request
 */
export interface GetTierUpgradeRequestResponse {
  success: true;
  /** null if no request found for vendor */
  data: TierUpgradeRequest | null;
}

/**
 * Response for deleting a tier upgrade request
 * DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId]
 */
export interface DeleteTierUpgradeRequestResponse {
  success: true;
  data: {
    message: string;
  };
}

/**
 * Response for approving a tier upgrade request
 * PUT /api/admin/tier-upgrade-requests/[id]/approve
 */
export interface ApproveTierUpgradeRequestResponse {
  success: true;
  data: {
    /** Updated request with approved status */
    request: TierUpgradeRequest;
    /** Vendor with updated tier */
    vendor: Vendor;
  };
}

/**
 * Payload for rejecting a tier upgrade request
 * PUT /api/admin/tier-upgrade-requests/[id]/reject
 */
export interface RejectTierUpgradeRequestPayload {
  /** Optional reason for rejection (max 1000 characters) */
  rejectionReason?: string;
}

/**
 * Response for rejecting a tier upgrade request
 */
export interface RejectTierUpgradeRequestResponse {
  success: true;
  data: TierUpgradeRequest;
}

/**
 * Error response for tier upgrade request operations
 */
export interface TierUpgradeRequestError {
  success: false;
  error: {
    /** Error code */
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DUPLICATE_REQUEST' | 'INVALID_STATUS' | 'SERVER_ERROR';
    /** Human-readable error message */
    message: string;
    /** Field-specific validation errors */
    fields?: Record<string, string>;
    /** Additional error context */
    details?: string;
  };
}

/**
 * Validation result from service layer
 */
export interface TierUpgradeValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Query filters for listing tier upgrade requests
 */
export interface TierUpgradeRequestFilters {
  /** Filter by vendor ID */
  vendorId?: string;
  /** Filter by request status */
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  /** Filter by requested tier */
  requestedTier?: 'tier1' | 'tier2' | 'tier3';
  /** Filter by requests created after this date (ISO 8601) */
  fromDate?: string;
  /** Filter by requests created before this date (ISO 8601) */
  toDate?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
  order?: number;
}

export interface ProductBenefit {
  benefit: string;
  icon?: string;
  order?: number;
}

export interface ProductService {
  title: string;
  description: string;
  icon?: string;
  order?: number;
}

export interface ProductPricing {
  display_text?: string;
  subtitle?: string;
  show_contact_form?: boolean;
  currency?: string;
}

export interface ProductActionButton {
  label: string;
  type: 'primary' | 'secondary' | 'outline';
  action: 'contact' | 'quote' | 'download' | 'external_link' | 'video';
  action_data?: string;
  icon?: string;
  order?: number;
}

export interface ProductBadge {
  label: string;
  type: 'secondary' | 'outline' | 'success' | 'warning' | 'info';
  icon?: string;
  order?: number;
}

// Product Comparison and Enhancement Types
export interface ComparisonMetric {
  metricId: string;
  name: string;
  value: number;
  unit?: string;
  category: 'performance' | 'efficiency' | 'reliability' | 'physical' | 'environmental';
  weight?: number;
  tolerance?: {
    min: number;
    max: number;
  };
  benchmarkValue?: number;
}

export interface PerformanceData {
  metricId: string;
  name: string;
  value: number;
  unit?: string;
  category: string;
  timestamp: Date;
  trend?: 'up' | 'down' | 'stable';
  benchmarkValue?: number;
  tolerance?: {
    min: number;
    max: number;
  };
  historicalData?: {
    timestamp: Date;
    value: number;
  }[];
}

export interface SystemCompatibility {
  system: string;
  compatibility: 'full' | 'partial' | 'adapter' | 'none';
  notes?: string;
  requirements?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
  estimatedCost?: string;
}

export interface SystemRequirements {
  powerSupply?: string;
  mounting?: string;
  operatingTemp?: string;
  certification?: string;
  ipRating?: string;
}

export interface IntegrationCompatibility {
  supportedProtocols?: string[];
  systemRequirements?: SystemRequirements;
  compatibilityMatrix?: SystemCompatibility[];
}

export interface OwnerReview {
  id: string;
  productId: string;
  ownerName: string;
  yachtName?: string;
  yachtLength?: string;
  rating: number;
  title: string;
  review: string;
  pros?: string[];
  cons?: string[];
  installationDate?: string;
  verified?: boolean;
  helpful?: number;
  images?: string[];
  useCase?: 'commercial_charter' | 'private_use' | 'racing' | 'expedition' | 'day_sailing';
  flagged?: boolean;
  vendorResponse?: {
    message: string;
    respondedAt: string;
    respondedBy: string;
  };
}

export interface VendorReview {
  id: string;
  vendorId: string;
  reviewerName: string;
  reviewerRole: string;
  yachtName?: string;
  projectType?: string;
  overallRating: number;
  title?: string;
  reviewText?: string;
  review?: string; // For API compatibility
  pros?: { pro: string }[] | string[];
  cons?: { con: string }[] | string[];
  reviewDate?: string;
  verified?: boolean;
  helpful?: number;
  images?: string[];
  featured?: boolean;
  flagged?: boolean;
  ratings?: {
    quality?: number;
    communication?: number;
    timeliness?: number;
    professionalism?: number;
    valueForMoney?: number;
  };
  vendorResponse?: {
    message: string;
    respondedAt: string;
    respondedBy: string;
  };
}

export interface VisualDemoHotspot {
  position: {
    x: number;
    y: number;
  };
  title: string;
  description?: string;
  action?: 'highlight' | 'zoom' | 'info' | 'navigate';
}

export interface CameraPosition {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface VisualDemoContent {
  type: '360-image' | '3d-model' | 'video' | 'interactive';
  title: string;
  description?: string;
  imageUrl?: string;
  modelUrl?: string;
  videoUrl?: string;
  hotspots?: VisualDemoHotspot[];
  animations?: string[];
  cameraPositions?: CameraPosition[];
  materials?: {
    [key: string]: {
      color?: string;
      metalness?: number;
      roughness?: number;
    };
  };
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price?: string;
  image?: string; // TinaCMS uses direct string paths
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  published?: boolean; // Used by vendor portal for publish status

  // TinaCMS simplified relations
  vendorId?: string; // Resolved vendor ID
  vendorName?: string; // Resolved vendor name
  // Legacy fields for backward compatibility
  partnerId?: string; // Alias for vendorId
  partnerName?: string; // Alias for vendorName
  category?: string; // Resolved category name
  tags?: string[]; // Resolved tag names array
  seo?: SEO;
  
  // Components (simplified structure)
  images: ProductImage[]; // Product images array
  features: Feature[]; // Product features array
  
  // New CMS-driven components
  specifications?: ProductSpecification[]; // Technical specifications
  benefits?: ProductBenefit[]; // Product benefits
  services?: ProductService[]; // Installation/support services
  pricing?: ProductPricing; // Pricing configuration
  action_buttons?: ProductActionButton[]; // Configurable action buttons
  badges?: ProductBadge[]; // Product badges/certifications
  
  // Computed/backward compatibility fields
  categoryName?: string; // Alias for category
  tagNames?: string[]; // Alias for tags
  mainImage?: ProductImage; // Computed from images.find(img => img.isMain)
  imageUrl?: string; // Alias for image or mainImage.url

  // Product Comparison and Enhancement Fields
  comparisonMetrics?: {
    [category: string]: {
      [key: string]: string | number | boolean;
    };
  }; // Nested structure: category -> key -> value
  performanceMetrics?: PerformanceData[]; // Performance data for metrics display
  integrationCompatibility?: string[]; // Computed from integration_compatibility.supported_protocols
  systemRequirements?: SystemRequirements; // Computed from integration_compatibility.system_requirements
  compatibilityMatrix?: SystemCompatibility[]; // Computed from integration_compatibility.compatibility_matrix
  ownerReviews?: OwnerReview[]; // Computed from owner_reviews schema
  averageRating?: number; // Computed from owner reviews
  totalReviews?: number; // Computed from owner reviews count
  visualDemo?: VisualDemoContent; // Computed from visual_demo schema

  // Resolved vendor/partner objects
  vendor?: Vendor; // Resolved vendor object
  partner?: Partner; // Legacy resolved partner object (alias for vendor)
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string; // TinaCMS uses single publishedAt field
  featured?: boolean;
  readTime?: string; // TinaCMS uses direct readTime field
  image?: string; // TinaCMS uses direct string paths
  createdAt?: string;
  updatedAt?: string;
  
  // TinaCMS simplified relations
  category?: string; // Resolved blog category name
  tags?: string[]; // Resolved tag names array
  seo?: SEO;
  
  // Computed/backward compatibility fields
  published_at?: string; // Alias for publishedAt
  read_time?: string; // Alias for readTime
  tagNames?: string[]; // Alias for tags
  imageUrl?: string; // Alias for image
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string; // TinaCMS uses direct string paths
  email?: string;
  linkedin?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // Computed fields (for backward compatibility)
  imageUrl?: string; // Alias for image
}

export interface CompanyInfo {
  id?: string;
  name: string;
  tagline: string;
  description: string;
  founded: number;
  location: string;
  address: string;
  phone: string;
  email: string;
  businessHours?: string; // Business hours text
  story: string;
  mission?: string; // Company mission statement
  logo?: string; // TinaCMS uses direct string paths
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
  // Components
  social_media?: SocialMedia;
  seo?: SEO;
  
  // Computed fields (for backward compatibility)
  logoUrl?: string; // Alias for logo
}

// Yacht Profiles System Types for Platform Vision
export interface YachtTimelineEvent {
  date: string;
  event: string;
  description?: string;
  category: 'launch' | 'delivery' | 'refit' | 'milestone' | 'service';
  location?: string;
  images?: string[];
}

export interface YachtSupplierRole {
  vendorId: string;
  vendorName: string;
  discipline: string;
  systems: string[];
  role: 'primary' | 'subcontractor' | 'consultant';
  projectPhase?: string;
}

export interface YachtSustainabilityMetrics {
  co2Emissions?: number; // kg CO2 equivalent
  energyEfficiency?: number; // kWh per nautical mile
  wasteManagement?: 'excellent' | 'good' | 'fair' | 'poor';
  waterConservation?: 'excellent' | 'good' | 'fair' | 'poor';
  materialSustainability?: 'excellent' | 'good' | 'fair' | 'poor';
  overallScore?: number; // 1-100
  certifications?: string[];
}

export interface YachtCustomization {
  category: string;
  description: string;
  vendor?: string;
  images?: string[];
  cost?: string;
  completedDate?: string;
}

export interface YachtMaintenanceRecord {
  date: string;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  system: string;
  description: string;
  vendor?: string;
  cost?: string;
  nextService?: string;
  status: 'completed' | 'in-progress' | 'scheduled';
}

export interface Yacht {
  id: string;
  slug?: string;
  name: string;
  description: string;
  image?: string; // Main yacht image
  images?: string[]; // Gallery images
  length?: number; // Length in meters
  beam?: number; // Beam in meters
  draft?: number; // Draft in meters
  displacement?: number; // Displacement in tons
  builder?: string;
  designer?: string;
  launchYear?: number;
  deliveryYear?: number;
  homePort?: string;
  flag?: string;
  classification?: string;
  cruisingSpeed?: number; // Knots
  maxSpeed?: number; // Knots
  range?: number; // Nautical miles
  guests?: number; // Guest capacity
  crew?: number; // Crew capacity
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;

  // Yacht-specific content
  timeline?: YachtTimelineEvent[];
  supplierMap?: YachtSupplierRole[];
  sustainabilityScore?: YachtSustainabilityMetrics;
  customizations?: YachtCustomization[];
  maintenanceHistory?: YachtMaintenanceRecord[];

  // Relations
  category?: string; // Yacht category (motor, sailing, explorer, etc.)
  tags?: string[]; // Yacht tags/features
  seo?: SEO;

  // Computed/convenience fields
  categoryName?: string; // Alias for category
  tagNames?: string[]; // Alias for tags
  imageUrl?: string; // Alias for image
  mainImage?: string; // Computed main image
  supplierCount?: number; // Computed from supplierMap
  totalSystems?: number; // Computed from supplierMap systems
}

// Legacy expense tracker types (keeping for backward compatibility)
export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// ===== Product API Types =====

/**
 * API Error Response - shared across all product API endpoints
 */
export interface ProductApiErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>;
    details?: string;
  };
}

/**
 * Product API Success Response - base type for all success responses
 */
export interface ProductApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * GET /api/portal/vendors/[id]/products response
 * Returns array of products directly (not paginated)
 */
export type GetVendorProductsResponse = ProductApiSuccessResponse<Product[]>;

/**
 * GET /api/portal/vendors/[id]/products/[productId] response
 * Returns single product
 */
export type GetProductResponse = ProductApiSuccessResponse<Product>;

/**
 * POST /api/portal/vendors/[id]/products response
 * Returns created product
 */
export type CreateProductResponse = ProductApiSuccessResponse<Product>;

/**
 * PUT /api/portal/vendors/[id]/products/[productId] response
 * Returns updated product
 */
export type UpdateProductResponse = ProductApiSuccessResponse<Product>;

/**
 * DELETE /api/portal/vendors/[id]/products/[productId] response
 * Returns success message
 */
export type DeleteProductResponse = ProductApiSuccessResponse<{ message: string }>;

/**
 * PATCH /api/portal/vendors/[id]/products/[productId]/publish response
 * Returns updated product
 */
export type TogglePublishResponse = ProductApiSuccessResponse<Product>;

/**
 * Union type for all Product API responses
 */
export type ProductApiResponse =
  | GetVendorProductsResponse
  | GetProductResponse
  | CreateProductResponse
  | UpdateProductResponse
  | DeleteProductResponse
  | TogglePublishResponse
  | ProductApiErrorResponse;