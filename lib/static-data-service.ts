/**
 * Static Data Service for Build-Time CMS Data Fetching
 * Used exclusively for Next.js Static Site Generation (SSG)
 */

import strapiClient from './strapi-client';
import { Partner, Product, BlogPost, TeamMember } from './types';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  founded: number;
  location: string;
  address: string;
  phone: string;
  email: string;
  story: string;
}

class StaticDataService {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📋 Using cached ${key}`);
      return cached.data;
    }

    try {
      console.log(`🔄 Fetching ${key} from Strapi...`);
      const data = await fetcher();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      console.log(`✅ Successfully fetched ${key}`);
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch ${key}:`, error);
      
      // Always throw the error for static builds - no fallbacks
      throw new Error(`Static build failed: Unable to fetch ${key} from Strapi CMS. Ensure Strapi is running and contains required content at build time.`);
    }
  }
  

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.getCached('categories', () => strapiClient.getCategories());
  }

  // Blog Categories (derived from blog posts)
  async getBlogCategories(): Promise<Category[]> {
    return this.getCached('blog-categories', async () => {
      const posts = await strapiClient.getBlogPosts();
      const categoryNames = Array.from(new Set(posts.map(post => post.category)));
      return categoryNames.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `${name} category for blog posts`,
        icon: '',
        color: '#0066cc',
      }));
    });
  }

  // Partners
  async getAllPartners(): Promise<Partner[]> {
    return this.getCached('partners', () => strapiClient.getPartners());
  }

  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    const cacheKey = `partners-${JSON.stringify(params || {})}`;
    return this.getCached(cacheKey, () => strapiClient.getPartners(params));
  }

  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    const cacheKey = `partner-${slug}`;
    return this.getCached(cacheKey, () => strapiClient.getPartnerBySlug(slug));
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    console.log(`🔍 StaticDataService: getPartnerById called with id: "${id}"`);
    const cacheKey = `partner-id-${id}`;
    const result = await this.getCached(cacheKey, () => {
      console.log(`🔍 StaticDataService: Calling strapiClient.getPartnerById("${id}")`);
      return strapiClient.getPartnerById(id);
    });
    console.log(`🔍 StaticDataService: Partner result for id "${id}":`, result ? {
      id: result.id,
      name: result.name,
      location: result.location,
      founded: result.founded
    } : 'null');
    return result;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return this.getCached('products', () => strapiClient.getProducts());
  }

  async getProducts(params?: { category?: string; partnerId?: string }): Promise<Product[]> {
    const cacheKey = `products-${JSON.stringify(params || {})}`;
    return this.getCached(cacheKey, () => strapiClient.getProducts(params));
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    console.log(`🔍 StaticDataService: getProductBySlug called with slug: "${slug}"`);
    const cacheKey = `product-${slug}`;
    const result = await this.getCached(cacheKey, () => {
      console.log(`🔍 StaticDataService: Calling strapiClient.getProductBySlug("${slug}")`);
      return strapiClient.getProductBySlug(slug);
    });
    console.log(`🔍 StaticDataService: Result for slug "${slug}":`, result ? {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description?.substring(0, 100) + '...'
    } : 'null');
    return result;
  }

  async getProductById(id: string): Promise<Product | null> {
    console.log(`🔍 StaticDataService: getProductById called with id: "${id}"`);
    const cacheKey = `product-id-${id}`;
    const result = await this.getCached(cacheKey, () => {
      console.log(`🔍 StaticDataService: Calling strapiClient.getProductById("${id}")`);
      return strapiClient.getProductById(id);
    });
    console.log(`🔍 StaticDataService: Result for id "${id}":`, result ? {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description?.substring(0, 100) + '...'
    } : 'null');
    return result;
  }

  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return this.getProducts({ partnerId });
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.getCached('blog-posts', () => strapiClient.getBlogPosts());
  }

  async getBlogPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    const cacheKey = `blog-posts-${JSON.stringify(params || {})}`;
    return this.getCached(cacheKey, () => strapiClient.getBlogPosts(params));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const cacheKey = `blog-post-${slug}`;
    return this.getCached(cacheKey, () => strapiClient.getBlogPostBySlug(slug));
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.getCached('team-members', () => strapiClient.getTeamMembers());
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo> {
    return this.getCached('company-info', () => strapiClient.getCompanyInfo());
  }

  // Search functionality
  async searchPartners(query: string): Promise<Partner[]> {
    const cacheKey = `search-partners-${query}`;
    return this.getCached(cacheKey, () => strapiClient.searchPartners(query));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const cacheKey = `search-products-${query}`;
    return this.getCached(cacheKey, () => strapiClient.searchProducts(query));
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const cacheKey = `search-blog-posts-${query}`;
    return this.getCached(cacheKey, () => strapiClient.searchBlogPosts(query));
  }

  // Utility methods for static generation
  async getPartnerSlugs(): Promise<string[]> {
    const partners = await this.getAllPartners();
    return partners.map(partner => partner.slug).filter(Boolean) as string[];
  }

  async getProductSlugs(): Promise<string[]> {
    const products = await this.getAllProducts();
    return products.map(product => product.slug || product.id).filter(Boolean) as string[];
  }

  async getBlogPostSlugs(): Promise<string[]> {
    const posts = await this.getAllBlogPosts();
    return posts.map(post => post.slug).filter(Boolean) as string[];
  }

  // Validation methods for build-time checks
  async validateCMSContent(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      console.log('🔍 Validating CMS content...');
      
      // Validate required data exists
      const [partners, products, categories] = await Promise.all([
        this.getAllPartners(),
        this.getAllProducts(),
        this.getCategories()
      ]);

      if (partners.length === 0) {
        errors.push('No partners found in CMS');
      }

      if (products.length === 0) {
        errors.push('No products found in CMS');
      }

      if (categories.length === 0) {
        errors.push('No categories found in CMS');
      }

      // Validate partner-product relationships
      const partnerIds = new Set(partners.map(p => p.id));
      const orphanedProducts = products.filter(p => p.partnerId && !partnerIds.has(p.partnerId));
      
      if (orphanedProducts.length > 0) {
        errors.push(`${orphanedProducts.length} products have invalid partner references`);
      }

      // Validate slugs are unique
      const partnerSlugs = partners.map(p => p.slug).filter(Boolean);
      const duplicatePartnerSlugs = partnerSlugs.filter((slug, index) => partnerSlugs.indexOf(slug) !== index);
      
      if (duplicatePartnerSlugs.length > 0) {
        errors.push(`Duplicate partner slugs found: ${duplicatePartnerSlugs.join(', ')}`);
      }

      const productSlugs = products.map(p => p.slug).filter(Boolean);
      const duplicateProductSlugs = productSlugs.filter((slug, index) => productSlugs.indexOf(slug) !== index);
      
      if (duplicateProductSlugs.length > 0) {
        errors.push(`Duplicate product slugs found: ${duplicateProductSlugs.join(', ')}`);
      }

      console.log(`✅ CMS validation complete: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`);
      
      if (errors.length > 0) {
        console.error('❌ CMS validation errors:', errors);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
      
    } catch (error) {
      const errorMessage = `Failed to validate CMS content: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌ CMS validation failed:', errorMessage);
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }
}

// Export singleton instance
export const staticDataService = new StaticDataService();
export default staticDataService;