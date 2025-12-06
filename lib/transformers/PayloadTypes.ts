/**
 * Payload CMS Document Types
 * Shared types used by all transformers
 */

// Helper type for untyped nested payload structures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PayloadRecord = Record<string, any>;

export interface PayloadMediaDocument {
  id: number | string;
  url?: string;
  filename?: string;
  externalUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface PayloadLexicalNode {
  type: string;
  children?: PayloadLexicalNode[];
  text?: string;
  format?: number;
  url?: string;
  target?: string;
  tag?: string;
  listType?: string;
  newTab?: boolean;
  language?: string;
}

export interface PayloadLexicalDocument {
  root?: PayloadLexicalNode;
  [key: string]: unknown;
}

export interface PayloadVendorDocument {
  id: number | string;
  slug?: string;
  companyName?: string;
  name?: string;
  description?: unknown;
  logo?: PayloadMediaDocument | string;
  image?: PayloadMediaDocument | string;
  website?: string;
  founded?: number;
  foundedYear?: number;
  location?: string;
  location_address?: string;
  location_city?: string;
  location_country?: string;
  location_latitude?: number;
  location_longitude?: number;
  locations?: Array<{
    id?: string;
    locationName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    isHQ?: boolean;
  }>;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  category?: { name?: string } | string;
  tags?: Array<{ name?: string } | string>;
  featured?: boolean;
  partner?: boolean;
  published?: boolean;
  services?: PayloadRecord[];
  contactEmail?: string;
  contactPhone?: string;
  longDescription?: unknown;
  serviceAreas?: PayloadRecord[];
  companyValues?: PayloadRecord[];
  totalProjects?: number;
  employeeCount?: number;
  linkedinFollowers?: number;
  instagramFollowers?: number;
  clientSatisfactionScore?: number;
  repeatClientPercentage?: number;
  yearsInBusiness?: number;
  videoUrl?: string;
  videoThumbnail?: PayloadMediaDocument;
  videoDuration?: string;
  videoTitle?: string;
  videoDescription?: string;
  certifications?: PayloadRecord[];
  awards?: PayloadRecord[];
  caseStudies?: PayloadRecord[];
  innovationHighlights?: PayloadRecord[];
  teamMembers?: PayloadRecord[];
  yachtProjects?: PayloadRecord[];
  vendorReviews?: PayloadRecord[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface PayloadProductDocument {
  id: number | string;
  slug?: string;
  name?: string;
  vendor?: PayloadVendorDocument;
  categories?: Array<{ name?: string }>;
  description?: unknown;
  images?: Array<{
    url?: string;
    altText?: string;
    isMain?: boolean;
  }>;
  features?: PayloadRecord[];
  price?: string;
  specifications?: PayloadRecord[];
  comparisonMetrics?: PayloadRecord[];
  integrationCompatibility?: {
    supportedProtocols?: Array<{ protocol?: string }>;
    systemRequirements?: PayloadRecord;
    compatibilityMatrix?: PayloadRecord[];
  };
  ownerReviews?: PayloadRecord[];
  visualDemoContent?: PayloadRecord;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
  shortDescription?: string;
}

export interface PayloadBlogDocument {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: unknown;
  author?: { email?: string };
  publishedAt?: string;
  categories?: Array<{ name?: string }>;
  tags?: Array<{ tag?: string }>;
  featuredImage?: PayloadMediaDocument | string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayloadTeamMemberDocument {
  id: number | string;
  name: string;
  role: string;
  bio?: string;
  image?: PayloadMediaDocument | string;
  email?: string;
  linkedin?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayloadCategoryDocument {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PayloadTagDocument {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PayloadYachtDocument {
  id: number | string;
  slug: string;
  name: string;
  description?: unknown;
  heroImage?: PayloadMediaDocument;
  gallery?: Array<{ image?: PayloadMediaDocument }>;
  lengthMeters?: number;
  beamMeters?: number;
  draftMeters?: number;
  tonnage?: number;
  builder?: string;
  launchYear?: number;
  deliveryDate?: string;
  flagState?: string;
  classification?: string;
  featured?: boolean;
  timeline?: PayloadRecord[];
  supplierMap?: PayloadRecord[];
  co2EmissionsTonsPerYear?: number;
  energyEfficiencyRating?: string;
  hybridPropulsion?: boolean;
  solarPanelCapacityKw?: number;
  batteryStorageKwh?: number;
  sustainabilityFeatures?: PayloadRecord[];
  greenCertifications?: Array<{ certification?: string }>;
  maintenanceHistory?: PayloadRecord[];
  categories?: Array<{ name?: string }>;
  tags?: Array<{ name?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayloadCompanyDocument {
  id: number | string;
  name: string;
  tagline?: string;
  description?: string;
  founded?: number;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  businessHours?: string;
  story?: unknown;
  mission?: string;
  logo?: PayloadMediaDocument | string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogImage?: PayloadMediaDocument | string;
  };
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
