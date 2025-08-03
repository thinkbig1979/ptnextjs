
// New data layer that fetches from Payload CMS with fallback to static data
// This provides a smooth transition from static data to CMS-driven content

import { BlogPost, Partner, Product, TeamMember } from './types';
import {
  fetchPartners,
  fetchPartnerById,
  fetchProducts,
  fetchProductById,
  fetchBlogPosts,
  fetchBlogPostBySlug,
  fetchPartnersByCategory,
  fetchProductsByCategory,
  fetchProductsByPartnerId,
  searchPartners,
  searchProducts,
  searchBlogPosts,
  checkPayloadAPIHealth,
} from './payload-api';

// Import the static data as fallback
import {
  partners as staticPartners,
  products as staticProducts,
  blogPosts as staticBlogPosts,
  teamMembers as staticTeamMembers,
  categories as staticCategories,
  companyInfo as staticCompanyInfo,
} from './data';

// Configuration flag to enable/disable CMS usage
const USE_CMS = process.env.NODE_ENV === 'production' || process.env.USE_PAYLOAD_CMS === 'true';

// Cache for API health status
let apiHealthCache: { healthy: boolean; lastChecked: number } = {
  healthy: false,
  lastChecked: 0,
};

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if Payload CMS API is available and healthy
 */
async function isPayloadCMSAvailable(): Promise<boolean> {
  const now = Date.now();
  
  // Check cache first
  if (now - apiHealthCache.lastChecked < HEALTH_CHECK_INTERVAL) {
    return apiHealthCache.healthy;
  }
  
  // Perform health check
  const healthy = await checkPayloadAPIHealth();
  apiHealthCache = { healthy, lastChecked: now };
  
  return healthy;
}

/**
 * Generic function to fetch data with CMS fallback
 */
async function fetchWithFallback<T>(
  cmsFunction: () => Promise<T>,
  staticData: T,
  description: string
): Promise<T> {
  if (!USE_CMS) {
    console.log(`Using static data for ${description} (CMS disabled)`);
    return staticData;
  }

  try {
    const isHealthy = await isPayloadCMSAvailable();
    if (!isHealthy) {
      console.log(`Using static data for ${description} (CMS not available)`);
      return staticData;
    }

    const cmsData = await cmsFunction();
    
    // Check if CMS returned meaningful data
    if (Array.isArray(cmsData) && cmsData.length === 0 && Array.isArray(staticData) && staticData.length > 0) {
      console.log(`Using static data for ${description} (CMS returned empty data)`);
      return staticData;
    }
    
    if (!cmsData && staticData) {
      console.log(`Using static data for ${description} (CMS returned null)`);
      return staticData;
    }

    console.log(`Using CMS data for ${description}`);
    return cmsData;
    
  } catch (error) {
    console.error(`Error fetching ${description} from CMS, falling back to static data:`, error);
    return staticData;
  }
}

// Export the main data fetching functions

/**
 * Get all partners
 */
export const getPartners = (): Promise<Partner[]> => {
  return fetchWithFallback(
    () => fetchPartners(),
    staticPartners,
    'partners'
  );
};

/**
 * Get partner by ID
 */
export const getPartnerById = async (id: string): Promise<Partner | undefined> => {
  if (!USE_CMS) {
    return staticPartners.find(p => p.id === id);
  }

  try {
    const isHealthy = await isPayloadCMSAvailable();
    if (!isHealthy) {
      return staticPartners.find(p => p.id === id);
    }

    const cmsPartner = await fetchPartnerById(id);
    return cmsPartner || staticPartners.find(p => p.id === id);
    
  } catch (error) {
    console.error(`Error fetching partner ${id} from CMS:`, error);
    return staticPartners.find(p => p.id === id);
  }
};

/**
 * Get all products
 */
export const getProducts = (): Promise<Product[]> => {
  return fetchWithFallback(
    () => fetchProducts(),
    staticProducts,
    'products'
  );
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!USE_CMS) {
    return staticProducts.find(p => p.id === id);
  }

  try {
    const isHealthy = await isPayloadCMSAvailable();
    if (!isHealthy) {
      return staticProducts.find(p => p.id === id);
    }

    const cmsProduct = await fetchProductById(id);
    return cmsProduct || staticProducts.find(p => p.id === id);
    
  } catch (error) {
    console.error(`Error fetching product ${id} from CMS:`, error);
    return staticProducts.find(p => p.id === id);
  }
};

/**
 * Get all blog posts
 */
export const getBlogPosts = (): Promise<BlogPost[]> => {
  return fetchWithFallback(
    () => fetchBlogPosts(),
    staticBlogPosts,
    'blog posts'
  );
};

/**
 * Get blog post by slug
 */
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  if (!USE_CMS) {
    return staticBlogPosts.find(p => p.slug === slug);
  }

  try {
    const isHealthy = await isPayloadCMSAvailable();
    if (!isHealthy) {
      return staticBlogPosts.find(p => p.slug === slug);
    }

    const cmsBlogPost = await fetchBlogPostBySlug(slug);
    return cmsBlogPost || staticBlogPosts.find(p => p.slug === slug);
    
  } catch (error) {
    console.error(`Error fetching blog post ${slug} from CMS:`, error);
    return staticBlogPosts.find(p => p.slug === slug);
  }
};

/**
 * Get partners by category
 */
export const getPartnersByCategory = async (category?: string): Promise<Partner[]> => {
  if (!category || category === 'all') {
    return getPartners();
  }

  return fetchWithFallback(
    () => fetchPartnersByCategory(category),
    staticPartners.filter(partner => partner.category === category),
    `partners in category ${category}`
  );
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category?: string): Promise<Product[]> => {
  if (!category || category === 'all') {
    return getProducts();
  }

  return fetchWithFallback(
    () => fetchProductsByCategory(category),
    staticProducts.filter(product => product.category === category),
    `products in category ${category}`
  );
};

/**
 * Get products by partner ID
 */
export const getProductsByPartner = async (partnerId: string): Promise<Product[]> => {
  return fetchWithFallback(
    () => fetchProductsByPartnerId(partnerId),
    staticProducts.filter(product => product.partnerId === partnerId),
    `products for partner ${partnerId}`
  );
};

/**
 * Get partner by product ID
 */
export const getPartnerByProduct = async (productId: string): Promise<Partner | undefined> => {
  const products = await getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return undefined;
  
  const partners = await getPartners();
  return partners.find(partner => partner.id === product.partnerId);
};

/**
 * Get products by partner name
 */
export const getProductsByPartnerName = async (partnerName: string): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product => product.partnerName === partnerName);
};

/**
 * Search partners
 */
export const searchPartnersData = async (query: string): Promise<Partner[]> => {
  return fetchWithFallback(
    () => searchPartners(query),
    staticPartners.filter(partner => 
      partner.name.toLowerCase().includes(query.toLowerCase()) ||
      partner.description.toLowerCase().includes(query.toLowerCase()) ||
      partner.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ),
    `partner search for "${query}"`
  );
};

/**
 * Search products
 */
export const searchProductsData = async (query: string): Promise<Product[]> => {
  return fetchWithFallback(
    () => searchProducts(query),
    staticProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ),
    `product search for "${query}"`
  );
};

/**
 * Search blog posts
 */
export const searchBlogPostsData = async (query: string): Promise<BlogPost[]> => {
  return fetchWithFallback(
    () => searchBlogPosts(query),
    staticBlogPosts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ),
    `blog post search for "${query}"`
  );
};

/**
 * Get categories (always from static data for now)
 */
export const getCategories = async (): Promise<string[]> => {
  // For now, return static categories
  // TODO: Implement CMS category fetching if needed
  return staticCategories;
};

/**
 * Get related blog posts
 */
export const getRelatedPosts = async (currentPostId: string, limit: number = 3): Promise<BlogPost[]> => {
  const allPosts = await getBlogPosts();
  const currentPost = allPosts.find(post => post.id === currentPostId);
  if (!currentPost) return [];

  // Find posts with similar tags or same category
  const relatedPosts = allPosts
    .filter(post => post.id !== currentPostId)
    .map(post => {
      let score = 0;
      
      // Higher score for same category
      if (post.category === currentPost.category) {
        score += 3;
      }
      
      // Score for matching tags
      const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      score += commonTags.length;
      
      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);

  // If we don't have enough related posts, fill with recent posts
  if (relatedPosts.length < limit) {
    const recentPosts = allPosts
      .filter(post => post.id !== currentPostId && !relatedPosts.find(rp => rp.id === post.id))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit - relatedPosts.length);
    
    relatedPosts.push(...recentPosts);
  }

  return relatedPosts;
};

/**
 * Get partner by name
 */
export const getPartnerByName = async (partnerName: string): Promise<Partner | undefined> => {
  const partners = await getPartners();
  return partners.find(partner => partner.name === partnerName);
};

// Static data exports (for backward compatibility)
export const teamMembers: TeamMember[] = staticTeamMembers;
export const companyInfo = staticCompanyInfo;

// Utility functions
export const createFilterUrl = (basePath: string, params: {
  category?: string;
  partner?: string;
  search?: string;
}): string => {
  const url = new URL(basePath, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  if (params.category && params.category !== "all") {
    url.searchParams.set('category', params.category);
  }
  if (params.partner) {
    url.searchParams.set('partner', params.partner);
  }
  if (params.search) {
    url.searchParams.set('search', params.search);
  }
  
  return url.pathname + url.search;
};

export const parseFilterParams = (searchParams: URLSearchParams) => {
  return {
    category: searchParams.get('category') || 'all',
    partner: searchParams.get('partner') || '',
    search: searchParams.get('search') || '',
  };
};
