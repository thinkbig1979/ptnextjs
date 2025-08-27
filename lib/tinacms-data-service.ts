/**
 * TinaCMS Data Service for Static Site Generation
 * Replaces Strapi client with TinaCMS local content queries
 */

import { resolve } from 'path'
import * as fs from 'fs/promises'
import * as path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { Partner, Product, BlogPost, TeamMember } from './types'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
}

interface CompanyInfo {
  name: string
  tagline: string
  description: string
  founded: number
  location: string
  address: string
  phone: string
  email: string
  story: string
}

class TinaCMSDataService {
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📋 Using cached ${key}`)
      return cached.data
    }

    try {
      console.log(`🔄 Fetching ${key} from TinaCMS...`)
      const data = await fetcher()
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      })
      console.log(`✅ Successfully fetched ${key}`)
      return data
    } catch (error) {
      console.error(`❌ Failed to fetch ${key}:`, error)
      
      // Always throw the error for static builds - no fallbacks
      throw new Error(`Static build failed: Unable to fetch ${key} from TinaCMS. Ensure content files are properly formatted.`)
    }
  }

  private async resolveReference(ref: string): Promise<any> {
    if (!ref || !ref.startsWith('content/')) return null
    
    try {
      const filePath = path.resolve(process.cwd(), ref)
      const content = await fs.readFile(filePath, 'utf-8')
      const { data } = matter(content)
      return data
    } catch (error) {
      console.warn(`Could not resolve reference: ${ref}`)
      return null
    }
  }

  private extractDescription(bodyContent: string): string {
    if (!bodyContent) return 'Description coming soon.'
    
    // Remove headers and extract first paragraph
    const lines = bodyContent.split('\n').filter(line => line.trim())
    const firstParagraph = lines.find(line => !line.startsWith('#') && line.trim().length > 0)
    
    if (firstParagraph) {
      // Limit to reasonable length
      return firstParagraph.length > 200 
        ? firstParagraph.substring(0, 200).trim() + '...'
        : firstParagraph.trim()
    }
    
    return 'Description coming soon.'
  }

  private transformMediaPath(mediaPath: string): string {
    // Convert TinaCMS media paths to public URLs
    if (!mediaPath) return ''
    
    // If it's already a full URL, return as is
    if (mediaPath.startsWith('http')) return mediaPath
    
    // If it starts with '/media/', it's already correct for public access
    if (mediaPath.startsWith('/media/')) return mediaPath
    
    // If it starts with 'media/', add leading slash
    if (mediaPath.startsWith('media/')) return `/${mediaPath}`
    
    // For any other format, assume it needs the media prefix
    return `/media/${mediaPath.replace(/^\/+/, '')}`
  }

  private transformTinaPartner(tinaPartner: any, filename: string): Partner {
    return {
      id: filename,
      slug: tinaPartner.slug || filename,
      name: tinaPartner.name,
      category: '', // Will be resolved later
      description: tinaPartner.description,
      logo: this.transformMediaPath(tinaPartner.logo),
      image: this.transformMediaPath(tinaPartner.image),
      website: tinaPartner.website,
      founded: tinaPartner.founded,
      location: tinaPartner.location,
      tags: [], // Will be resolved later
      featured: tinaPartner.featured || false,
    }
  }

  private transformTinaProduct(tinaProduct: any, filename: string): Product {
    const images = tinaProduct.product_images || []
    const mainImage = images.find((img: any) => img.is_main) || images[0]

    return {
      id: filename,
      slug: tinaProduct.slug || filename,
      name: tinaProduct.name,
      partnerId: '', // Will be resolved later
      partnerName: '', // Will be resolved later
      category: '', // Will be resolved later
      description: tinaProduct.description,
      image: this.transformMediaPath(mainImage?.image || ''),
      images: images.map((img: any) => ({
        id: img.image || '',
        url: this.transformMediaPath(img.image || ''),
        altText: img.alt_text || '',
        isMain: img.is_main || false,
      })),
      features: Array.isArray(tinaProduct.features) && tinaProduct.features.length > 0 
        ? tinaProduct.features.map((feature: any, index: number) => ({
            id: `${filename}-feature-${index}`,
            title: feature.title || '',
            description: feature.description || '',
            icon: feature.icon || '',
            order: feature.order || index
          }))
        : [],
      price: tinaProduct.price,
      tags: [], // Will be resolved later
    }
  }

  private transformTinaBlogPost(tinaBlogPost: any, filename: string, markdownContent?: string): BlogPost {
    const content = markdownContent 
      ? marked(markdownContent) as string
      : tinaBlogPost.content || ''
    
    return {
      id: filename,
      slug: tinaBlogPost.slug || filename,
      title: tinaBlogPost.title,
      excerpt: tinaBlogPost.excerpt,
      content,
      author: tinaBlogPost.author,
      publishedAt: tinaBlogPost.published_at,
      category: '', // Will be resolved later
      tags: [], // Will be resolved later
      image: this.transformMediaPath(tinaBlogPost.image),
      featured: tinaBlogPost.featured || false,
      readTime: tinaBlogPost.read_time,
    }
  }

  private transformTinaTeamMember(tinaMember: any, filename: string): TeamMember {
    return {
      id: filename,
      name: tinaMember.name,
      role: tinaMember.role,
      bio: tinaMember.bio,
      image: this.transformMediaPath(tinaMember.image),
      email: tinaMember.email,
      linkedin: tinaMember.linkedin,
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.getCached('categories', async () => {
      const categoriesPath = path.resolve(process.cwd(), 'content/categories')
      const files = await fs.readdir(categoriesPath)
      
      const categories = await Promise.all(
        files.filter(file => file.endsWith('.md')).map(async (file) => {
          const filePath = path.join(categoriesPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const { data } = matter(content)
          
          return {
            id: file.replace('.md', ''),
            name: data.name,
            slug: data.slug || file.replace('.md', ''),
            description: data.description,
            icon: data.icon,
            color: data.color,
          }
        })
      )
      
      return categories
    })
  }

  // Blog Categories
  async getBlogCategories(): Promise<Category[]> {
    return this.getCached('blog-categories', async () => {
      const categoriesPath = path.resolve(process.cwd(), 'content/blog/categories')
      const files = await fs.readdir(categoriesPath)
      
      const categories = await Promise.all(
        files.filter(file => file.endsWith('.md')).map(async (file) => {
          const filePath = path.join(categoriesPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const { data } = matter(content)
          
          return {
            id: file.replace('.md', ''),
            name: data.name,
            slug: data.slug || file.replace('.md', ''),
            description: data.description || `${data.name} category for blog posts`,
            icon: '',
            color: data.color || '#0066cc',
          }
        })
      )
      
      return categories
    })
  }

  // Partners
  async getAllPartners(): Promise<Partner[]> {
    return this.getCached('partners', async () => {
      const partnersPath = path.resolve(process.cwd(), 'content/partners')
      const files = await fs.readdir(partnersPath)
      
      const partners = await Promise.all(
        files.filter(file => file.endsWith('.md')).map(async (file) => {
          const filePath = path.join(partnersPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const { data, content: bodyContent } = matter(content)
          const filename = file.replace('.md', '')
          
          // Extract description from body content if not in frontmatter
          const description = data.description || this.extractDescription(bodyContent)
          
          let partner = this.transformTinaPartner(data, filename)
          partner.description = description
          
          // Resolve category reference
          if (data.category) {
            const categoryData = await this.resolveReference(data.category)
            partner.category = categoryData?.name || ''
          }
          
          // Resolve tag references
          if (data.tags && Array.isArray(data.tags)) {
            const tagPromises = data.tags.map((tagRef: string) => this.resolveReference(tagRef))
            const tagData = await Promise.all(tagPromises)
            partner.tags = tagData.filter(Boolean).map(tag => tag.name).filter(Boolean)
          }
          
          return partner
        })
      )
      
      return partners
    })
  }

  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    const allPartners = await this.getAllPartners()
    
    let filtered = allPartners
    
    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(partner => partner.category === params.category)
    }
    
    if (params?.featured) {
      filtered = filtered.filter(partner => partner.featured)
    }
    
    return filtered
  }

  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    const partners = await this.getAllPartners()
    return partners.find(partner => partner.slug === slug) || null
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    const partners = await this.getAllPartners()
    return partners.find(partner => partner.id === id) || null
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return this.getCached('products', async () => {
      const productsPath = path.resolve(process.cwd(), 'content/products')
      const files = await fs.readdir(productsPath)
      
      const products = await Promise.all(
        files.filter(file => file.endsWith('.md')).map(async (file) => {
          const filePath = path.join(productsPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const { data } = matter(content)
          const filename = file.replace('.md', '')
          
          let product = this.transformTinaProduct(data, filename)
          
          // Resolve partner reference
          if (data.partner) {
            const partnerData = await this.resolveReference(data.partner)
            if (partnerData) {
              product.partnerId = data.partner.split('/').pop()?.replace('.md', '') || ''
              product.partnerName = partnerData.name || ''
            }
          }
          
          // Resolve category reference
          if (data.category) {
            const categoryData = await this.resolveReference(data.category)
            product.category = categoryData?.name || ''
          }
          
          // Resolve tag references
          if (data.tags && Array.isArray(data.tags)) {
            const tagPromises = data.tags.map((tagRef: string) => this.resolveReference(tagRef))
            const tagData = await Promise.all(tagPromises)
            product.tags = tagData.filter(Boolean).map(tag => tag.name).filter(Boolean)
          }
          
          return product
        })
      )
      
      return products
    })
  }

  async getProducts(params?: { category?: string; partnerId?: string }): Promise<Product[]> {
    const allProducts = await this.getAllProducts()
    
    let filtered = allProducts
    
    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(product => product.category === params.category)
    }
    
    if (params?.partnerId) {
      filtered = filtered.filter(product => product.partnerId === params.partnerId)
    }
    
    return filtered
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getAllProducts()
    return products.find(product => product.slug === slug) || null
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getAllProducts()
    return products.find(product => product.id === id) || null
  }

  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return this.getProducts({ partnerId })
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.getCached('blog-posts', async () => {
      const postsPath = path.resolve(process.cwd(), 'content/blog/posts')
      const files = await fs.readdir(postsPath)
      
      const posts = await Promise.all(
        files.filter(file => file.endsWith('.md')).map(async (file) => {
          const filePath = path.join(postsPath, file)
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const { data, content } = matter(fileContent)
          const filename = file.replace('.md', '')
          
          let post = this.transformTinaBlogPost(data, filename, content)
          
          // Resolve blog category reference
          if (data.blog_category) {
            const categoryData = await this.resolveReference(data.blog_category)
            post.category = categoryData?.name || ''
          }
          
          // Resolve tag references
          if (data.tags && Array.isArray(data.tags)) {
            const tagPromises = data.tags.map((tagRef: string) => this.resolveReference(tagRef))
            const tagData = await Promise.all(tagPromises)
            post.tags = tagData.filter(Boolean).map(tag => tag.name).filter(Boolean)
          }
          
          return post
        })
      )
      
      return posts.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    })
  }

  async getBlogPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    const allPosts = await this.getAllBlogPosts()
    
    let filtered = allPosts
    
    if (params?.category) {
      filtered = filtered.filter(post => post.category === params.category)
    }
    
    if (params?.featured) {
      filtered = filtered.filter(post => post.featured)
    }
    
    return filtered
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getAllBlogPosts()
    return posts.find(post => post.slug === slug) || null
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.getCached('team-members', async () => {
      const teamPath = path.resolve(process.cwd(), 'content/team')
      const files = await fs.readdir(teamPath)
      
      const members = await Promise.all(
        files.filter(file => file.endsWith('.md')).map(async (file) => {
          const filePath = path.join(teamPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const { data } = matter(content)
          const filename = file.replace('.md', '')
          
          return this.transformTinaTeamMember(data, filename)
        })
      )
      
      return members
    })
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo> {
    return this.getCached('company-info', async () => {
      const infoPath = path.resolve(process.cwd(), 'content/company/info.json')
      const content = await fs.readFile(infoPath, 'utf-8')
      const data = JSON.parse(content)
      
      return {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        founded: data.founded,
        location: data.location,
        address: data.address,
        phone: data.phone,
        email: data.email,
        story: data.story,
      }
    })
  }

  // Search functionality
  async searchPartners(query: string): Promise<Partner[]> {
    const partners = await this.getAllPartners()
    const searchLower = query.toLowerCase()
    
    return partners.filter(partner => 
      partner.name.toLowerCase().includes(searchLower) ||
      partner.description.toLowerCase().includes(searchLower)
    )
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getAllProducts()
    const searchLower = query.toLowerCase()
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    )
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const posts = await this.getAllBlogPosts()
    const searchLower = query.toLowerCase()
    
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower)
    )
  }

  // Utility methods for static generation
  async getPartnerSlugs(): Promise<string[]> {
    const partners = await this.getAllPartners()
    return partners.map(partner => partner.slug).filter(Boolean) as string[]
  }

  async getProductSlugs(): Promise<string[]> {
    const products = await this.getAllProducts()
    return products.map(product => product.slug || product.id).filter(Boolean) as string[]
  }

  async getBlogPostSlugs(): Promise<string[]> {
    const posts = await this.getAllBlogPosts()
    return posts.map(post => post.slug).filter(Boolean) as string[]
  }

  // Validation methods for build-time checks
  async validateCMSContent(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []
    
    try {
      console.log('🔍 Validating TinaCMS content...')
      
      // Validate required data exists
      const [partners, products, categories] = await Promise.all([
        this.getAllPartners(),
        this.getAllProducts(),
        this.getCategories()
      ])

      if (partners.length === 0) {
        errors.push('No partners found in TinaCMS content')
      }

      if (products.length === 0) {
        errors.push('No products found in TinaCMS content')
      }

      if (categories.length === 0) {
        errors.push('No categories found in TinaCMS content')
      }

      // Validate partner-product relationships
      const partnerIds = new Set(partners.map(p => p.id))
      const orphanedProducts = products.filter(p => p.partnerId && !partnerIds.has(p.partnerId))
      
      if (orphanedProducts.length > 0) {
        errors.push(`${orphanedProducts.length} products have invalid partner references`)
      }

      // Validate slugs are unique
      const partnerSlugs = partners.map(p => p.slug).filter(Boolean)
      const duplicatePartnerSlugs = partnerSlugs.filter((slug, index) => partnerSlugs.indexOf(slug) !== index)
      
      if (duplicatePartnerSlugs.length > 0) {
        errors.push(`Duplicate partner slugs found: ${duplicatePartnerSlugs.join(', ')}`)
      }

      const productSlugs = products.map(p => p.slug).filter(Boolean)
      const duplicateProductSlugs = productSlugs.filter((slug, index) => productSlugs.indexOf(slug) !== index)
      
      if (duplicateProductSlugs.length > 0) {
        errors.push(`Duplicate product slugs found: ${duplicateProductSlugs.join(', ')}`)
      }

      console.log(`✅ TinaCMS validation complete: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`)
      
      if (errors.length > 0) {
        console.error('❌ TinaCMS validation errors:', errors)
      }

      return {
        isValid: errors.length === 0,
        errors
      }
      
    } catch (error) {
      const errorMessage = `Failed to validate TinaCMS content: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error('❌ TinaCMS validation failed:', errorMessage)
      return {
        isValid: false,
        errors: [errorMessage]
      }
    }
  }
}

// Export singleton instance
export const tinaCMSDataService = new TinaCMSDataService()
export default tinaCMSDataService