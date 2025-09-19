/**
 * TinaCMS Data Service for Static Site Generation
 * TinaCMS local content queries for static site generation
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { Vendor, Partner, Product, BlogPost, TeamMember, Yacht, YachtTimelineEvent, YachtSupplierRole, YachtSustainabilityMetrics, YachtCustomization, YachtMaintenanceRecord } from './types'

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

  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Clean expired entries periodically
    if (this.cache.size > 0 && Math.random() < 0.1) {
      this.cleanExpiredCache();
    }

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
    
    // If it starts with '/public/media/', remove the '/public' prefix
    if (mediaPath.startsWith('/public/media/')) return mediaPath.replace('/public', '')
    
    // If it starts with '/public/', remove the '/public' prefix and add '/media'
    if (mediaPath.startsWith('/public/')) return mediaPath.replace('/public', '/media')
    
    // If it starts with 'public/media/', remove 'public/' prefix and add leading slash
    if (mediaPath.startsWith('public/media/')) return `/${mediaPath.replace('public/', '')}`
    
    // If it starts with 'public/', replace with '/media/'
    if (mediaPath.startsWith('public/')) return mediaPath.replace('public/', '/media/')
    
    // If it starts with 'media/', add leading slash
    if (mediaPath.startsWith('media/')) return `/${mediaPath}`
    
    // For any other format, assume it needs the media prefix
    return `/media/${mediaPath.replace(/^\/+/, '')}`
  }

  private transformTinaVendor(tinaVendor: any, filename: string): Vendor {
    return {
      id: filename,
      slug: tinaVendor.slug || filename,
      name: tinaVendor.name,
      category: '', // Will be resolved later
      description: tinaVendor.description,
      logo: this.transformMediaPath(tinaVendor.logo),
      image: this.transformMediaPath(tinaVendor.image),
      website: tinaVendor.website,
      founded: tinaVendor.founded,
      location: tinaVendor.location,
      tags: [], // Will be resolved later
      featured: tinaVendor.featured || false,
      partner: tinaVendor.partner !== undefined ? tinaVendor.partner : true, // Default to true for existing records
      services: tinaVendor.services || [], // Include services field

      // Enhanced profile fields for Platform Vision
      certifications: tinaVendor.certifications?.map((cert: any) => {
        if (!cert || typeof cert !== 'object') return null;
        return {
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: typeof cert.year === 'number' ? cert.year : undefined,
          expiryDate: cert.expiryDate || undefined,
          certificateUrl: cert.certificateUrl || undefined,
          logo: this.transformMediaPath(cert.logo || ''),
        };
      }).filter(Boolean) || [],

      awards: tinaVendor.awards?.map((award: any) => {
        if (!award || typeof award !== 'object') return null;
        return {
          title: award.title || '',
          year: typeof award.year === 'number' ? award.year : new Date().getFullYear(),
          organization: award.organization || undefined,
          category: award.category || undefined,
          description: award.description || undefined,
        };
      }).filter(Boolean) || [],

      socialProof: tinaVendor.socialProof && typeof tinaVendor.socialProof === 'object' ? {
        followers: typeof tinaVendor.socialProof.followers === 'number' ? tinaVendor.socialProof.followers : undefined,
        projectsCompleted: typeof tinaVendor.socialProof.projectsCompleted === 'number' ? tinaVendor.socialProof.projectsCompleted : undefined,
        yearsInBusiness: typeof tinaVendor.socialProof.yearsInBusiness === 'number' ? tinaVendor.socialProof.yearsInBusiness : undefined,
        customerList: Array.isArray(tinaVendor.socialProof.customerList) ? tinaVendor.socialProof.customerList : [],
      } : undefined,

      videoIntroduction: tinaVendor.videoIntroduction ? {
        videoUrl: tinaVendor.videoIntroduction.videoUrl,
        thumbnailImage: this.transformMediaPath(tinaVendor.videoIntroduction.thumbnailImage || ''),
        title: tinaVendor.videoIntroduction.title,
        description: tinaVendor.videoIntroduction.description,
      } : undefined,

      caseStudies: tinaVendor.caseStudies?.map((caseStudy: any) => {
        if (!caseStudy || typeof caseStudy !== 'object') return null;
        return {
          title: caseStudy.title || '',
          slug: caseStudy.slug || '',
          client: caseStudy.client || undefined,
          challenge: caseStudy.challenge || '',
          solution: caseStudy.solution || '',
          results: caseStudy.results || undefined,
          images: Array.isArray(caseStudy.images) ? caseStudy.images.map((img: string) => this.transformMediaPath(img)) : [],
          technologies: Array.isArray(caseStudy.technologies) ? caseStudy.technologies : [],
        };
      }).filter(Boolean) || [],

      innovationHighlights: tinaVendor.innovationHighlights?.map((innovation: any) => ({
        technology: innovation.technology,
        description: innovation.description,
        uniqueApproach: innovation.uniqueApproach,
        benefitsToClients: innovation.benefitsToClients || [],
      })) || [],

      teamMembers: tinaVendor.teamMembers?.map((member: any) => ({
        name: member.name,
        position: member.position,
        bio: member.bio,
        photo: this.transformMediaPath(member.photo || ''),
        linkedinUrl: member.linkedinUrl,
        expertise: member.expertise || [],
      })) || [],

      yachtProjects: tinaVendor.yachtProjects?.map((project: any) => {
        if (!project || typeof project !== 'object') return null;
        return {
          yachtName: project.yachtName || '',
          systems: Array.isArray(project.systems) ? project.systems : [],
          projectYear: typeof project.projectYear === 'number' ? project.projectYear : undefined,
          role: project.role || undefined,
          description: project.description || undefined,
        };
      }).filter(Boolean) || [],
    }
  }

  // Legacy method for backward compatibility - simplified to eliminate duplication
  private transformTinaPartner(tinaPartner: any, filename: string): Partner {
    // Partner is now just an alias for Vendor, so we reuse the transformation logic
    const vendor = this.transformTinaVendor(tinaPartner, filename);
    return vendor as Partner; // Type cast since Partner extends Vendor
  }

  private transformTinaProduct(tinaProduct: any, filename: string): Product {
    const images = tinaProduct.product_images || []
    const mainImage = images.find((img: any) => img.is_main) || images[0]

    return {
      id: filename,
      slug: tinaProduct.slug || filename,
      name: tinaProduct.name,
      vendorId: '', // Will be resolved later
      vendorName: '', // Will be resolved later
      // Legacy backward compatibility
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

  private transformTinaYacht(tinaYacht: any, filename: string): Yacht {
    return {
      id: filename,
      slug: tinaYacht.slug || filename,
      name: tinaYacht.name,
      description: tinaYacht.description,
      image: this.transformMediaPath(tinaYacht.image),
      images: Array.isArray(tinaYacht.images) ? tinaYacht.images.map((img: string) => this.transformMediaPath(img)) : [],

      // Basic specifications
      length: typeof tinaYacht.length === 'number' ? tinaYacht.length : undefined,
      beam: typeof tinaYacht.beam === 'number' ? tinaYacht.beam : undefined,
      draft: typeof tinaYacht.draft === 'number' ? tinaYacht.draft : undefined,
      displacement: typeof tinaYacht.displacement === 'number' ? tinaYacht.displacement : undefined,
      builder: tinaYacht.builder,
      designer: tinaYacht.designer,
      launchYear: typeof tinaYacht.launchYear === 'number' ? tinaYacht.launchYear : undefined,
      deliveryYear: typeof tinaYacht.deliveryYear === 'number' ? tinaYacht.deliveryYear : undefined,
      homePort: tinaYacht.homePort,
      flag: tinaYacht.flag,
      classification: tinaYacht.classification,

      // Performance specifications
      cruisingSpeed: typeof tinaYacht.cruisingSpeed === 'number' ? tinaYacht.cruisingSpeed : undefined,
      maxSpeed: typeof tinaYacht.maxSpeed === 'number' ? tinaYacht.maxSpeed : undefined,
      range: typeof tinaYacht.range === 'number' ? tinaYacht.range : undefined,

      // Accommodation
      guests: typeof tinaYacht.guests === 'number' ? tinaYacht.guests : undefined,
      crew: typeof tinaYacht.crew === 'number' ? tinaYacht.crew : undefined,

      // Status
      featured: tinaYacht.featured || false,

      // Yacht-specific content
      timeline: tinaYacht.timeline?.map((event: any) => {
        if (!event || typeof event !== 'object') return null;
        return {
          date: event.date || '',
          event: event.event || '',
          description: event.description || undefined,
          category: event.category || 'milestone',
          location: event.location || undefined,
          images: Array.isArray(event.images) ? event.images.map((img: string) => this.transformMediaPath(img)) : [],
        } as YachtTimelineEvent;
      }).filter(Boolean) || [],

      supplierMap: tinaYacht.supplierMap?.map((supplier: any) => {
        if (!supplier || typeof supplier !== 'object') return null;
        return {
          vendorId: supplier.vendor || '',
          vendorName: '', // Will be resolved later
          discipline: supplier.discipline || '',
          systems: Array.isArray(supplier.systems) ? supplier.systems : [],
          role: supplier.role || 'primary',
          projectPhase: supplier.projectPhase || undefined,
        } as YachtSupplierRole;
      }).filter(Boolean) || [],

      sustainabilityScore: tinaYacht.sustainabilityScore && typeof tinaYacht.sustainabilityScore === 'object' ? {
        co2Emissions: typeof tinaYacht.sustainabilityScore.co2Emissions === 'number' ? tinaYacht.sustainabilityScore.co2Emissions : undefined,
        energyEfficiency: typeof tinaYacht.sustainabilityScore.energyEfficiency === 'number' ? tinaYacht.sustainabilityScore.energyEfficiency : undefined,
        wasteManagement: tinaYacht.sustainabilityScore.wasteManagement || undefined,
        waterConservation: tinaYacht.sustainabilityScore.waterConservation || undefined,
        materialSustainability: tinaYacht.sustainabilityScore.materialSustainability || undefined,
        overallScore: typeof tinaYacht.sustainabilityScore.overallScore === 'number' ? tinaYacht.sustainabilityScore.overallScore : undefined,
        certifications: Array.isArray(tinaYacht.sustainabilityScore.certifications) ? tinaYacht.sustainabilityScore.certifications : [],
      } as YachtSustainabilityMetrics : undefined,

      customizations: tinaYacht.customizations?.map((customization: any) => {
        if (!customization || typeof customization !== 'object') return null;
        return {
          category: customization.category || '',
          description: customization.description || '',
          vendor: customization.vendor || undefined,
          images: Array.isArray(customization.images) ? customization.images.map((img: string) => this.transformMediaPath(img)) : [],
          cost: customization.cost || undefined,
          completedDate: customization.completedDate || undefined,
        } as YachtCustomization;
      }).filter(Boolean) || [],

      maintenanceHistory: tinaYacht.maintenanceHistory?.map((record: any) => {
        if (!record || typeof record !== 'object') return null;
        return {
          date: record.date || '',
          type: record.type || 'routine',
          system: record.system || '',
          description: record.description || '',
          vendor: record.vendor || undefined,
          cost: record.cost || undefined,
          nextService: record.nextService || undefined,
          status: record.status || 'completed',
        } as YachtMaintenanceRecord;
      }).filter(Boolean) || [],

      // Relations (will be resolved later)
      category: '', // Will be resolved later
      tags: [], // Will be resolved later

      // Computed/backward compatibility fields
      categoryName: undefined, // Alias for category
      tagNames: undefined, // Alias for tags
      imageUrl: this.transformMediaPath(tinaYacht.image), // Alias for image
      mainImage: this.transformMediaPath(tinaYacht.image), // Computed main image
      supplierCount: undefined, // Will be computed
      totalSystems: undefined, // Will be computed
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

  // Vendors - New primary methods (updated to read from content/vendors)
  async getAllVendors(): Promise<Vendor[]> {
    return this.getCached('vendors', async () => {
      const vendorsPath = path.resolve(process.cwd(), 'content/vendors')
      const files = await fs.readdir(vendorsPath)
      
      const vendors = await Promise.all(
        files.filter(file => file.endsWith('.md')).map(async (file) => {
          const filePath = path.join(vendorsPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const { data, content: bodyContent } = matter(content)
          const filename = file.replace('.md', '')
          
          // Extract description from body content if not in frontmatter
          const description = data.description || this.extractDescription(bodyContent)
          
          let vendor = this.transformTinaVendor(data, filename)
          vendor.description = description
          
          // Resolve category reference
          if (data.category) {
            const categoryData = await this.resolveReference(data.category)
            vendor.category = categoryData?.name || ''
          }
          
          // Resolve tag references
          if (data.tags && Array.isArray(data.tags)) {
            const tagPromises = data.tags.map((tagRef: string) => this.resolveReference(tagRef))
            const tagData = await Promise.all(tagPromises)
            vendor.tags = tagData.filter(Boolean).map(tag => tag.name).filter(Boolean)
          }
          
          return vendor
        })
      )
      
      return vendors
    })
  }

  async getVendors(params?: { category?: string; featured?: boolean; partnersOnly?: boolean }): Promise<Vendor[]> {
    const allVendors = await this.getAllVendors()
    
    let filtered = allVendors
    
    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === params.category)
    }
    
    if (params?.featured) {
      filtered = filtered.filter(vendor => vendor.featured)
    }
    
    if (params?.partnersOnly) {
      filtered = filtered.filter(vendor => vendor.partner === true)
    }
    
    return filtered
  }

  async getVendorBySlug(slug: string): Promise<Vendor | null> {
    const vendors = await this.getAllVendors()
    return vendors.find(vendor => vendor.slug === slug) || null
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    const vendors = await this.getAllVendors()
    return vendors.find(vendor => vendor.id === id) || null
  }

  // Partners - Legacy methods for backward compatibility
  async getAllPartners(): Promise<Partner[]> {
    // Use the new vendor methods internally for consistency
    const vendors = await this.getAllVendors()
    // Convert Vendor[] to Partner[] for backward compatibility
    return vendors.map(vendor => ({
      ...vendor,
      // Partner interface doesn't have the 'partner' field, so we exclude it
    } as Partner))
  }

  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    // Use the new vendor methods internally and convert result
    const vendors = await this.getVendors({
      ...params,
      partnersOnly: true // Only return records where partner = true
    })
    return vendors.map(vendor => ({
      ...vendor,
    } as Partner))
  }

  // Optimized method specifically for featured partners (homepage performance)
  async getFeaturedPartners(): Promise<Partner[]> {
    return this.getCached('featured-partners', async () => {
      const allVendors = await this.getAllVendors()
      
      // Efficient compound filtering: featured AND partner
      // This ensures only featured partners appear on homepage, not featured suppliers
      const featuredPartners = allVendors.filter(vendor => 
        vendor.featured === true && vendor.partner === true
      )
      
      console.log(`🎯 Homepage filtering: ${featuredPartners.length} featured partners selected from ${allVendors.length} total vendors`)
      
      return featuredPartners.map(vendor => ({
        ...vendor,
      } as Partner))
    })
  }

  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    const vendor = await this.getVendorBySlug(slug)
    return vendor ? { ...vendor } as Partner : null
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    const vendor = await this.getVendorById(id)
    return vendor ? { ...vendor } as Partner : null
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
          
          // Resolve vendor/partner reference (handle both new and legacy field names)
          const vendorRef = data.vendor || data.partner
          if (vendorRef) {
            const vendorData = await this.resolveReference(vendorRef)
            if (vendorData) {
              product.vendorId = vendorRef.split('/').pop()?.replace('.md', '') || ''
              product.vendorName = vendorData.name || ''
              // Maintain backward compatibility
              product.partnerId = product.vendorId
              product.partnerName = product.vendorName
            }
              // Resolve full vendor object
              const vendorFilename = vendorRef.split("/").pop()?.replace(".md", "") || ""
              const fullVendor = this.transformTinaVendor(vendorData, vendorFilename)
              product.vendor = fullVendor
              // Maintain backward compatibility
              product.partner = fullVendor
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

  async getProducts(params?: { category?: string; partnerId?: string; vendorId?: string }): Promise<Product[]> {
    const allProducts = await this.getAllProducts()
    
    let filtered = allProducts
    
    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(product => product.category === params.category)
    }
    
    // Support both vendorId and partnerId for backward compatibility
    const targetId = params?.vendorId || params?.partnerId
    if (targetId) {
      filtered = filtered.filter(product => 
        product.vendorId === targetId || product.partnerId === targetId
      )
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

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return this.getProducts({ vendorId })
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

  // Yacht Methods
  async getAllYachts(): Promise<Yacht[]> {
    return this.getCached('yachts', async () => {
      const yachtsPath = path.resolve(process.cwd(), 'content/yachts')
      try {
        const files = await fs.readdir(yachtsPath)

        const yachts = await Promise.all(
          files.filter(file => file.endsWith('.md')).map(async (file) => {
            const filePath = path.join(yachtsPath, file)
            const content = await fs.readFile(filePath, 'utf-8')
            const { data, content: bodyContent } = matter(content)
            const filename = file.replace('.md', '')

            // Extract description from body content if not in frontmatter
            const description = data.description || this.extractDescription(bodyContent)

            let yacht = this.transformTinaYacht(data, filename)
            yacht.description = description

            // Resolve category reference
            if (data.category) {
              const categoryData = await this.resolveReference(data.category)
              yacht.category = categoryData?.name || ''
            }

            // Resolve tag references
            if (data.tags && Array.isArray(data.tags)) {
              const tagPromises = data.tags.map((tagRef: any) => {
                if (typeof tagRef === 'object' && tagRef.tag) {
                  return this.resolveReference(tagRef.tag)
                }
                return this.resolveReference(tagRef)
              })
              const tagData = await Promise.all(tagPromises)
              yacht.tags = tagData.filter(Boolean).map(tag => tag.name).filter(Boolean)
            }

            // Resolve supplier map vendor references
            if (yacht.supplierMap && yacht.supplierMap.length > 0) {
              for (const supplier of yacht.supplierMap) {
                if (supplier.vendorId) {
                  const vendorData = await this.resolveReference(supplier.vendorId)
                  supplier.vendorName = vendorData?.name || supplier.vendorId
                }
              }
            }

            // Compute fields
            yacht.categoryName = yacht.category
            yacht.tagNames = yacht.tags
            yacht.supplierCount = yacht.supplierMap?.length || 0
            yacht.totalSystems = yacht.supplierMap?.reduce((total, supplier) => total + (supplier.systems?.length || 0), 0) || 0

            return yacht
          })
        )

        return yachts
      } catch (error) {
        // Return empty array if yachts directory doesn't exist yet
        return []
      }
    })
  }

  async getYachts(options?: { featured?: boolean }): Promise<Yacht[]> {
    const allYachts = await this.getAllYachts()

    if (options?.featured) {
      return allYachts.filter(yacht => yacht.featured)
    }

    return allYachts
  }

  async getYachtBySlug(slug: string): Promise<Yacht | null> {
    const yachts = await this.getAllYachts()
    return yachts.find(yacht => yacht.slug === slug) || null
  }

  async getYachtById(id: string): Promise<Yacht | null> {
    const yachts = await this.getAllYachts()
    return yachts.find(yacht => yacht.id === id) || null
  }

  async getFeaturedYachts(): Promise<Yacht[]> {
    return this.getYachts({ featured: true })
  }

  async searchYachts(query: string): Promise<Yacht[]> {
    const yachts = await this.getAllYachts()
    const searchTerm = query.toLowerCase()

    return yachts.filter(yacht =>
      yacht.name.toLowerCase().includes(searchTerm) ||
      yacht.description.toLowerCase().includes(searchTerm) ||
      yacht.builder?.toLowerCase().includes(searchTerm) ||
      yacht.designer?.toLowerCase().includes(searchTerm) ||
      yacht.homePort?.toLowerCase().includes(searchTerm)
    )
  }

  async getYachtSlugs(): Promise<string[]> {
    const yachts = await this.getAllYachts()
    return yachts.map(yacht => yacht.slug).filter(Boolean) as string[]
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
  async searchVendors(query: string): Promise<Vendor[]> {
    const vendors = await this.getAllVendors()
    const searchLower = query.toLowerCase()
    
    return vendors.filter(vendor => 
      vendor.name.toLowerCase().includes(searchLower) ||
      vendor.description.toLowerCase().includes(searchLower)
    )
  }

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
  async getVendorSlugs(): Promise<string[]> {
    const vendors = await this.getAllVendors()
    return vendors.map(vendor => vendor.slug).filter(Boolean) as string[]
  }

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
      const [vendors, products, categories] = await Promise.all([
        this.getAllVendors(),
        this.getAllProducts(),
        this.getCategories()
      ])

      if (vendors.length === 0) {
        errors.push('No vendors found in TinaCMS content')
      }

      if (products.length === 0) {
        errors.push('No products found in TinaCMS content')
      }

      if (categories.length === 0) {
        errors.push('No categories found in TinaCMS content')
      }

      // Validate vendor-product relationships
      const vendorIds = new Set(vendors.map(v => v.id))
      const orphanedProducts = products.filter(p => 
        (p.vendorId && !vendorIds.has(p.vendorId)) || 
        (p.partnerId && !vendorIds.has(p.partnerId))
      )
      
      if (orphanedProducts.length > 0) {
        errors.push(`${orphanedProducts.length} products have invalid vendor/partner references`)
      }

      // Validate slugs are unique
      const vendorSlugs = vendors.map(v => v.slug).filter(Boolean)
      const duplicateVendorSlugs = vendorSlugs.filter((slug, index) => vendorSlugs.indexOf(slug) !== index)
      
      if (duplicateVendorSlugs.length > 0) {
        errors.push(`Duplicate vendor slugs found: ${duplicateVendorSlugs.join(', ')}`)
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