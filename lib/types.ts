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
  slug: string;
  client?: string;
  challenge: string;
  solution: string;
  results?: string;
  images?: string[];
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

export interface VendorYachtProject {
  yachtName: string;
  systems: string[];
  projectYear?: number;
  role?: string;
  description?: string;
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
  location?: string;
  featured?: boolean;
  partner?: boolean; // New field: indicates if vendor is also a strategic partner
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
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
  teamMembers?: VendorTeamMember[];
  yachtProjects?: VendorYachtProject[];

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
  price?: string;
  image?: string; // TinaCMS uses direct string paths
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  
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
    [key: string]: {
      value: number;
      unit?: string;
    };
  }; // Computed from comparison_metrics schema
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