import strapiClient from './strapi-client';
import { 
  partners as staticPartners, 
  products as staticProducts, 
  blogPosts as staticBlogPosts, 
  teamMembers as staticTeamMembers, 
  companyInfo as staticCompanyInfo,
  categories as staticCategories,
  blogCategories as staticBlogCategories,
  getPartnersByCategory as staticGetPartnersByCategory,
  getProductsByCategory as staticGetProductsByCategory,
  getBlogPostsByCategory as staticGetBlogPostsByCategory,
  searchPartners as staticSearchPartners,
  searchProducts as staticSearchProducts,
  searchBlogPosts as staticSearchBlogPosts,
  getProductsByPartner as staticGetProductsByPartner,
  getPartnerByProduct as staticGetPartnerByProduct,
  getRelatedPosts as staticGetRelatedPosts,
  getPartnerByName as staticGetPartnerByName,
  getPartnerBySlug as staticGetPartnerBySlug,
  getProductBySlug as staticGetProductBySlug,
} from './data';
import { Partner, Product, BlogPost, TeamMember } from './data';

// Fix: Only use Strapi in production if explicitly enabled and available
const USE_STRAPI = process.env.USE_STRAPI_CMS === 'true' || 
  process.env.NEXT_PUBLIC_USE_STRAPI_CMS === 'true';

// Fix: Default to enabling fallback unless explicitly disabled
const DISABLE_CONTENT_FALLBACK = process.env.DISABLE_CONTENT_FALLBACK === 'true';


let strapiAvailable: boolean | null = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function checkStrapiHealth(): Promise<boolean> {
  const now = Date.now();
  
  // Return cached result if recent
  if (strapiAvailable !== null && (now - lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return strapiAvailable;
  }

  try {
    // More comprehensive health check - try to get actual data
    const testCategories = await strapiClient.getCategories();
    const testProducts = await strapiClient.getProducts();
    
    // Ensure we got real data, not empty responses
    if (testCategories.length > 0 || testProducts.length > 0) {
      strapiAvailable = true;
      lastHealthCheck = now;
      console.log(`✅ Strapi health check passed: ${testCategories.length} categories, ${testProducts.length} products`);
      return true;
    } else {
      throw new Error('Strapi returned empty data');
    }
  } catch (error) {
    const fallbackStatus = DISABLE_CONTENT_FALLBACK ? 'disabled' : 'enabled';
    console.error(`❌ Strapi health check failed:`, error);
    console.log(`📋 Static content fallback: ${fallbackStatus}`);
    
    if (DISABLE_CONTENT_FALLBACK) {
      console.warn('🚨 Production mode: No fallback data will be served');
    }
    
    strapiAvailable = false;
    lastHealthCheck = now;
    return false;
  }
}

class DataService {
  private async shouldUseStrapi(): Promise<boolean> {
    if (!USE_STRAPI) {
      return false;
    }
    
    const healthCheck = await checkStrapiHealth();
    return healthCheck;
  }

  private shouldUseFallback(): boolean {
    if (DISABLE_CONTENT_FALLBACK) {
      return false;
    }
    return true;
  }

  private logContentSource(contentType: string, source: 'strapi' | 'fallback' | 'empty') {
    // Content source logging (can be enabled for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${contentType}: ${source}`);
    }
  }
  
  private handleStrapiError(contentType: string, error: any) {
    console.error(`❌ Failed to fetch ${contentType} from Strapi:`, error);
    
    if (DISABLE_CONTENT_FALLBACK) {
      console.warn(`🚨 Production mode: Returning empty ${contentType} data`);
    } else {
      console.log(`📋 Falling back to static ${contentType} data`);
    }
  }

  // Categories
  async getCategories() {
    if (await this.shouldUseStrapi()) {
      try {
        const categories = await strapiClient.getCategories();
        this.logContentSource('Categories', 'strapi');
        return categories;
      } catch (error) {
        this.handleStrapiError('Categories', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Categories', 'fallback');
      return staticCategories.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `${name} category for superyacht technology`,
        icon: '',
        color: '#0066cc',
      }));
    }

    this.logContentSource('Categories', 'empty');
    return [];
  }

  // Blog Categories
  async getBlogCategories() {
    if (await this.shouldUseStrapi()) {
      try {
        // For now, we'll extract categories from blog posts since Strapi might not have a separate blog categories endpoint
        const posts = await strapiClient.getBlogPosts();
        const categories = Array.from(new Set(posts.map(post => post.category)))
          .map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            description: `${name} category for blog posts`,
            icon: '',
            color: '#0066cc',
          }));
        this.logContentSource('Blog Categories', 'strapi');
        return categories;
      } catch (error) {
        console.error('Failed to fetch blog categories from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Blog Categories', 'fallback');
      return staticBlogCategories.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `${name} category for blog posts`,
        icon: '',
        color: '#0066cc',
      }));
    }

    this.logContentSource('Blog Categories', 'empty');
    return [];
  }

  // Partners
  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const partners = await strapiClient.getPartners(params);
        this.logContentSource('Partners', 'strapi');
        return partners;
      } catch (error) {
        console.error('Failed to fetch partners from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Partners', 'fallback');
      let partners = staticPartners;
      
      if (params?.category && params.category !== 'all') {
        partners = staticGetPartnersByCategory(params.category);
      }
      
      if (params?.featured) {
        partners = partners.filter(partner => partner.featured);
      }
      
      return partners;
    }

    this.logContentSource('Partners', 'empty');
    return [];
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    if (await this.shouldUseStrapi()) {
      try {
        const partner = await strapiClient.getPartnerById(id);
        if (partner) this.logContentSource('Partner by ID', 'strapi');
        return partner;
      } catch (error) {
        console.error('Failed to fetch partner from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const partner = staticPartners.find(partner => partner.id === id) || null;
      if (partner) this.logContentSource('Partner by ID', 'fallback');
      return partner;
    }

    this.logContentSource('Partner by ID', 'empty');
    return null;
  }

  async getPartnerByName(name: string): Promise<Partner | null> {
    if (await this.shouldUseStrapi()) {
      try {
        const partners = await strapiClient.getPartners();
        const partner = partners.find(partner => partner.name === name) || null;
        if (partner) this.logContentSource('Partner by Name', 'strapi');
        return partner;
      } catch (error) {
        console.error('Failed to fetch partner from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const partner = staticGetPartnerByName(name) || null;
      if (partner) this.logContentSource('Partner by Name', 'fallback');
      return partner;
    }

    this.logContentSource('Partner by Name', 'empty');
    return null;
  }

  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    if (await this.shouldUseStrapi()) {
      try {
        // Fallback: Get all partners and filter by slug as a temporary fix
        const partners = await strapiClient.getPartners();
        const partner = partners.find(p => p.slug === slug) || null;
        if (partner) {
          this.logContentSource('Partner by Slug', 'strapi');
          console.log('✅ Found partner by slug fallback:', partner.name);
          return partner;
        }
        console.log('❌ No partner found with slug via fallback:', slug);
      } catch (error) {
        this.handleStrapiError('Partner by Slug', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const partner = staticGetPartnerBySlug(slug) || null;
      if (partner) this.logContentSource('Partner by Slug', 'fallback');
      return partner;
    }

    this.logContentSource('Partner by Slug', 'empty');
    return null;
  }

  async getPartnersByCategory(category?: string): Promise<Partner[]> {
    return this.getPartners({ category });
  }

  // Products
  async getProducts(params?: { category?: string; partnerId?: string }): Promise<Product[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const products = await strapiClient.getProducts(params);
        this.logContentSource('Products', 'strapi');
        return products;
      } catch (error) {
        console.error('Failed to fetch products from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Products', 'fallback');
      let products = staticProducts;
      
      if (params?.category && params.category !== 'all') {
        products = staticGetProductsByCategory(params.category);
      }
      
      if (params?.partnerId) {
        products = staticGetProductsByPartner(params.partnerId);
      }
      
      return products;
    }

    this.logContentSource('Products', 'empty');
    return [];
  }

  async getProductById(id: string): Promise<Product | null> {
    if (await this.shouldUseStrapi()) {
      try {
        const product = await strapiClient.getProductById(id);
        if (product) this.logContentSource('Product by ID', 'strapi');
        return product;
      } catch (error) {
        console.error('Failed to fetch product from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const product = staticProducts.find(product => product.id === id) || null;
      if (product) this.logContentSource('Product by ID', 'fallback');
      return product;
    }

    this.logContentSource('Product by ID', 'empty');
    return null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (await this.shouldUseStrapi()) {
      try {
        // Fallback: Get all products and filter by slug as a temporary fix
        const products = await strapiClient.getProducts();
        const product = products.find(p => p.slug === slug) || null;
        if (product) {
          this.logContentSource('Product by Slug', 'strapi');
          console.log('✅ Found product by slug fallback:', product.name);
          return product;
        }
        console.log('❌ No product found with slug via fallback:', slug);
      } catch (error) {
        this.handleStrapiError('Product by Slug', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const product = staticGetProductBySlug(slug) || null;
      if (product) this.logContentSource('Product by Slug', 'fallback');
      return product;
    }

    this.logContentSource('Product by Slug', 'empty');
    return null;
  }

  async getProductsByCategory(category?: string): Promise<Product[]> {
    return this.getProducts({ category });
  }

  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return this.getProducts({ partnerId });
  }

  async getPartnerByProduct(productId: string): Promise<Partner | null> {
    if (await this.shouldUseStrapi()) {
      try {
        const product = await this.getProductById(productId);
        if (product?.partnerId) {
          const partner = await this.getPartnerById(product.partnerId);
          if (partner) this.logContentSource('Partner by Product', 'strapi');
          return partner;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch partner by product from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const partner = staticGetPartnerByProduct(productId) || null;
      if (partner) this.logContentSource('Partner by Product', 'fallback');
      return partner;
    }

    this.logContentSource('Partner by Product', 'empty');
    return null;
  }

  // Blog Posts
  async getBlogPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const posts = await strapiClient.getBlogPosts(params);
        this.logContentSource('Blog Posts', 'strapi');
        return posts;
      } catch (error) {
        console.error('Failed to fetch blog posts from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Blog Posts', 'fallback');
      let posts = staticBlogPosts;
      
      if (params?.category) {
        posts = staticGetBlogPostsByCategory(params.category);
      }
      
      if (params?.featured) {
        posts = posts.filter(post => post.featured);
      }
      
      return posts;
    }

    this.logContentSource('Blog Posts', 'empty');
    return [];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    if (await this.shouldUseStrapi()) {
      try {
        const post = await strapiClient.getBlogPostBySlug(slug);
        if (post) this.logContentSource('Blog Post by Slug', 'strapi');
        return post;
      } catch (error) {
        console.error('Failed to fetch blog post from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const post = staticBlogPosts.find(post => post.slug === slug) || null;
      if (post) this.logContentSource('Blog Post by Slug', 'fallback');
      return post;
    }

    this.logContentSource('Blog Post by Slug', 'empty');
    return null;
  }

  async getBlogPostsByCategory(category?: string): Promise<BlogPost[]> {
    return this.getBlogPosts({ category });
  }

  async getRelatedPosts(currentPostId: string, limit: number = 3): Promise<BlogPost[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const allPosts = await this.getBlogPosts();
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
        
        this.logContentSource('Related Posts', 'strapi');
        return relatedPosts;
      } catch (error) {
        console.error('Failed to fetch related posts from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      const posts = staticGetRelatedPosts(currentPostId, limit);
      this.logContentSource('Related Posts', 'fallback');
      return posts;
    }

    this.logContentSource('Related Posts', 'empty');
    return [];
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const teamMembers = await strapiClient.getTeamMembers();
        this.logContentSource('Team Members', 'strapi');
        return teamMembers;
      } catch (error) {
        console.error('Failed to fetch team members from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Team Members', 'fallback');
      return staticTeamMembers;
    }

    this.logContentSource('Team Members', 'empty');
    return [];
  }

  // Company Info
  async getCompanyInfo() {
    if (await this.shouldUseStrapi()) {
      try {
        const companyInfo = await strapiClient.getCompanyInfo();
        this.logContentSource('Company Info', 'strapi');
        return companyInfo;
      } catch (error) {
        console.error('Failed to fetch company info from Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Company Info', 'fallback');
      return staticCompanyInfo;
    }

    this.logContentSource('Company Info', 'empty');
    return null;
  }

  // Search functionality
  async searchPartners(query: string): Promise<Partner[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const results = await strapiClient.searchPartners(query);
        this.logContentSource('Search Partners', 'strapi');
        return results;
      } catch (error) {
        console.error('Failed to search partners in Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Search Partners', 'fallback');
      return staticSearchPartners(query);
    }

    this.logContentSource('Search Partners', 'empty');
    return [];
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const results = await strapiClient.searchProducts(query);
        this.logContentSource('Search Products', 'strapi');
        return results;
      } catch (error) {
        console.error('Failed to search products in Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Search Products', 'fallback');
      return staticSearchProducts(query);
    }

    this.logContentSource('Search Products', 'empty');
    return [];
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    if (await this.shouldUseStrapi()) {
      try {
        const results = await strapiClient.searchBlogPosts(query);
        this.logContentSource('Search Blog Posts', 'strapi');
        return results;
      } catch (error) {
        console.error('Failed to search blog posts in Strapi:', error);
      }
    }
    
    if (this.shouldUseFallback()) {
      this.logContentSource('Search Blog Posts', 'fallback');
      return staticSearchBlogPosts(query);
    }

    this.logContentSource('Search Blog Posts', 'empty');
    return [];
  }
}

export const dataService = new DataService();
export default dataService;