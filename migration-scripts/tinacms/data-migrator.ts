#!/usr/bin/env ts-node

/**
 * TinaCMS Data Migration Script - Milestone 3 Implementation
 * 
 * This script migrates all existing content from:
 * 1. Strapi CMS (via API if available)
 * 2. Static data service fallbacks
 * 3. Superyacht research data file
 * 4. Existing content files
 * 
 * Transforms all data to TinaCMS-compatible markdown format
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// Import types and services
import { 
  Partner, Product, BlogPost, TeamMember, Category, 
  Tag, BlogCategory, CompanyInfo, ProductImage, Feature 
} from '../../lib/types';
import { staticDataService } from '../../lib/static-data-service';

interface MigrationConfig {
  sourceDataPath: string;
  contentOutputPath: string;
  mediaOutputPath: string;
  backupPath: string;
  dryRun: boolean;
  downloadImages: boolean;
  validateOnly: boolean;
}

interface MigrationReport {
  timestamp: string;
  totalItems: number;
  migratedItems: number;
  errors: string[];
  warnings: string[];
  mediaFiles: number;
  collections: {
    [collectionName: string]: {
      total: number;
      migrated: number;
      errors: string[];
    }
  };
}

class TinaCMSMigrator {
  private config: MigrationConfig;
  private report: MigrationReport;
  private mediaDownloads = new Set<string>();

  constructor(config: MigrationConfig) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      totalItems: 0,
      migratedItems: 0,
      errors: [],
      warnings: [],
      mediaFiles: 0,
      collections: {}
    };
  }

  /**
   * Main migration execution method
   */
  async migrate(): Promise<MigrationReport> {
    console.log('🚀 Starting TinaCMS Data Migration - Milestone 3');
    console.log(`📅 Migration started at: ${this.report.timestamp}`);
    console.log(`🔧 Dry run: ${this.config.dryRun ? 'YES' : 'NO'}`);
    console.log(`🖼️ Download images: ${this.config.downloadImages ? 'YES' : 'NO'}`);

    try {
      // Step 1: Load and validate data sources
      const sourceData = await this.loadSourceData();
      
      if (this.config.validateOnly) {
        return await this.validateDataOnly(sourceData);
      }

      // Step 2: Create directory structure
      await this.createDirectoryStructure();

      // Step 3: Migrate reference data first (categories, tags)
      await this.migrateReferenceData(sourceData);

      // Step 4: Migrate main content (partners, products, blog posts, team)
      await this.migrateMainContent(sourceData);

      // Step 5: Migrate single-type content (company info)
      await this.migrateSingleTypeContent(sourceData);

      // Step 6: Download and organize media files
      if (this.config.downloadImages) {
        await this.migrateMediaFiles();
      }

      // Step 7: Generate validation report
      await this.generateValidationReport();

      console.log('✅ Migration completed successfully!');
      console.log(`📊 Migrated ${this.report.migratedItems} items out of ${this.report.totalItems}`);
      
      return this.report;

    } catch (error) {
      const errorMessage = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.report.errors.push(errorMessage);
      console.error('❌', errorMessage);
      throw error;
    }
  }

  /**
   * Load data from all available sources
   */
  private async loadSourceData() {
    console.log('📊 Loading data from all available sources...');
    const sourceData: any = {};

    try {
      // Load superyacht research data
      const researchPath = path.join(this.config.sourceDataPath, 'superyacht_technology_research.json');
      const researchData = await fs.readFile(researchPath, 'utf-8');
      sourceData.research = JSON.parse(researchData);
      console.log('✅ Loaded superyacht research data');
    } catch (error) {
      this.report.warnings.push('Failed to load superyacht research data');
    }

    try {
      // Try to load data from Strapi via static data service
      sourceData.categories = await staticDataService.getCategories();
      sourceData.partners = await staticDataService.getAllPartners();
      sourceData.products = await staticDataService.getAllProducts();
      sourceData.blogPosts = await staticDataService.getAllBlogPosts();
      sourceData.teamMembers = await staticDataService.getTeamMembers();
      sourceData.companyInfo = await staticDataService.getCompanyInfo();
      sourceData.blogCategories = await staticDataService.getBlogCategories();
      console.log('✅ Loaded data from static data service');
    } catch (error) {
      this.report.warnings.push('Static data service not available, using fallback data');
      const fallbackData = await this.loadFallbackData();
      Object.assign(sourceData, fallbackData);
    }

    // Load existing content files
    try {
      sourceData.existingContent = await this.loadExistingContent();
      console.log('✅ Loaded existing content files');
    } catch (error) {
      this.report.warnings.push('Failed to load existing content files');
    }

    return sourceData;
  }

  /**
   * Load fallback data from research file and existing content
   */
  private async loadFallbackData() {
    console.log('📋 Loading fallback data from research file...');
    
    const researchPath = path.join(this.config.sourceDataPath, 'superyacht_technology_research.json');
    let researchData;
    
    try {
      const data = await fs.readFile(researchPath, 'utf-8');
      researchData = JSON.parse(data);
    } catch (error) {
      throw new Error('Unable to load research data file');
    }

    // Transform research data into normalized format
    const categories = new Map<string, Category>();
    const partners: Partner[] = [];
    const products: Product[] = [];
    const tags = new Map<string, Tag>();

    // Process partner companies from research data
    researchData.partner_companies?.forEach((partnerData: any, index: number) => {
      // Create category if not exists
      const categorySlug = partnerData.category.toLowerCase().replace(/\s+/g, '-');
      if (!categories.has(categorySlug)) {
        categories.set(categorySlug, {
          id: categories.size.toString(),
          name: partnerData.category,
          slug: categorySlug,
          description: `${partnerData.category} solutions for marine technology`,
          icon: '',
          color: '#0066cc',
          order: categories.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString()
        });
      }

      // Create partner
      const partner: Partner = {
        id: (index + 1).toString(),
        slug: partnerData.company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: partnerData.company,
        description: partnerData.description,
        founded: 2000 + index, // Placeholder
        location: 'International',
        featured: index < 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        categoryName: partnerData.category,
        tagNames: []
      };
      partners.push(partner);

      // Create products for this partner
      partnerData.sample_products?.forEach((productData: any, productIndex: number) => {
        const productId = `${index * 10 + productIndex + 1}`;
        const product: Product = {
          id: productId,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: productData.name,
          description: productData.description,
          partnerId: partner.id,
          partnerName: partner.name,
          categoryName: partnerData.category,
          product_images: [],
          features: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          tagNames: []
        };
        products.push(product);
      });
    });

    // Generate sample blog posts
    const blogPosts: BlogPost[] = [
      {
        id: '1',
        slug: 'future-of-marine-technology',
        title: 'The Future of Marine Technology',
        excerpt: 'Exploring the latest innovations transforming the maritime industry.',
        content: 'The marine technology sector is experiencing unprecedented innovation...',
        author: 'Paul Thames',
        published_at: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        featured: true,
        read_time: '5 min read',
        readTime: '5 min read',
        category: 'Technology Trends',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tagNames: ['Innovation', 'Technology', 'Marine']
      }
    ];

    // Generate sample team members
    const teamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Paul Thames',
        role: 'Founder & CEO',
        bio: 'Marine technology expert with over 20 years of industry experience.',
        email: 'paul@paulthames.com',
        linkedin: 'https://linkedin.com/in/paulthames',
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      }
    ];

    // Load company info
    const companyInfo: CompanyInfo = {
      id: '1',
      name: 'Paul Thames',
      tagline: 'Advanced Marine Technology Solutions',
      description: 'Leading provider of cutting-edge marine technology solutions.',
      founded: 2018,
      location: 'Maritime District, UK',
      address: '123 Marina Boulevard\nPortsmouth, Hampshire PO1 2AB\nUnited Kingdom',
      phone: '+44 23 9283 1234',
      email: 'info@paulthames.com',
      story: 'Founded in 2018, Paul Thames has established itself as a premier provider...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };

    return {
      categories: Array.from(categories.values()),
      partners,
      products,
      blogPosts,
      teamMembers,
      companyInfo,
      blogCategories: [
        {
          id: '1',
          name: 'Technology Trends',
          slug: 'technology-trends',
          description: 'Latest technology trends in marine industry',
          color: '#0066cc',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString()
        }
      ],
      tags: []
    };
  }

  /**
   * Load existing content files
   */
  private async loadExistingContent() {
    const existingContent: any = {};
    const contentPath = path.join(this.config.sourceDataPath, 'content');

    try {
      // Load company info
      const companyInfoPath = path.join(contentPath, 'company', 'info.json');
      const companyData = await fs.readFile(companyInfoPath, 'utf-8');
      existingContent.companyInfo = JSON.parse(companyData);
    } catch (error) {
      // Company info doesn't exist, will use fallback
    }

    // Load existing markdown files
    const dirs = ['partners', 'products', 'blog/posts', 'team', 'categories', 'tags', 'blog/categories'];
    
    for (const dir of dirs) {
      try {
        const dirPath = path.join(contentPath, dir);
        const files = await fs.readdir(dirPath);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        
        existingContent[dir.replace('/', '_')] = [];
        
        for (const file of mdFiles) {
          const filePath = path.join(dirPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          existingContent[dir.replace('/', '_')].push({
            filename: file,
            content
          });
        }
      } catch (error) {
        // Directory doesn't exist or is empty
      }
    }

    return existingContent;
  }

  /**
   * Create TinaCMS directory structure
   */
  private async createDirectoryStructure() {
    if (this.config.dryRun) {
      console.log('🔍 [DRY RUN] Would create directory structure');
      return;
    }

    console.log('📁 Creating TinaCMS directory structure...');

    const directories = [
      'content/categories',
      'content/tags',
      'content/blog/categories',
      'content/blog/posts',
      'content/partners',
      'content/products',
      'content/team',
      'content/company',
      'public/media/categories/icons',
      'public/media/categories/placeholders',
      'public/media/partners/logos',
      'public/media/partners/images',
      'public/media/partners/placeholders',
      'public/media/products/images',
      'public/media/products/placeholders',
      'public/media/blog/posts',
      'public/media/blog/placeholders',
      'public/media/team/headshots',
      'public/media/team/placeholders',
      'public/media/company/logos',
      'public/media/company/social'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.config.contentOutputPath, '..', dir);
      await fs.mkdir(fullPath, { recursive: true });
    }

    console.log('✅ Directory structure created');
  }

  /**
   * Migrate reference data (categories, tags, blog categories)
   */
  private async migrateReferenceData(sourceData: any) {
    console.log('🏷️ Migrating reference data...');

    // Migrate categories
    await this.migrateCollection('category', sourceData.categories || [], this.generateCategoryMarkdown);
    
    // Migrate blog categories
    await this.migrateCollection('blogCategory', sourceData.blogCategories || [], this.generateBlogCategoryMarkdown);
    
    // Migrate tags
    await this.migrateCollection('tag', sourceData.tags || [], this.generateTagMarkdown);
  }

  /**
   * Migrate main content (partners, products, blog posts, team)
   */
  private async migrateMainContent(sourceData: any) {
    console.log('📝 Migrating main content...');

    // Migrate partners
    await this.migrateCollection('partner', sourceData.partners || [], this.generatePartnerMarkdown);
    
    // Migrate products
    await this.migrateCollection('product', sourceData.products || [], this.generateProductMarkdown);
    
    // Migrate blog posts
    await this.migrateCollection('blogPost', sourceData.blogPosts || [], this.generateBlogPostMarkdown);
    
    // Migrate team members
    await this.migrateCollection('teamMember', sourceData.teamMembers || [], this.generateTeamMemberMarkdown);
  }

  /**
   * Migrate single-type content (company info)
   */
  private async migrateSingleTypeContent(sourceData: any) {
    console.log('🏢 Migrating company information...');

    if (sourceData.companyInfo) {
      const content = this.generateCompanyInfoJSON(sourceData.companyInfo);
      const filePath = path.join(this.config.contentOutputPath, 'company', 'info.json');
      
      if (!this.config.dryRun) {
        await fs.writeFile(filePath, content, 'utf-8');
      }
      
      this.report.migratedItems++;
      console.log('✅ Company info migrated');
    }
  }

  /**
   * Generic collection migration method
   */
  private async migrateCollection<T>(
    collectionName: string, 
    items: T[], 
    generator: (item: T) => { filename: string; content: string; mediaUrls?: string[] }
  ) {
    console.log(`📦 Migrating ${collectionName} collection (${items.length} items)...`);
    
    const collectionReport = {
      total: items.length,
      migrated: 0,
      errors: []
    };

    for (const item of items) {
      try {
        const { filename, content, mediaUrls } = generator.call(this, item);
        
        // Determine output path based on collection
        const outputDir = this.getOutputDirectory(collectionName);
        const filePath = path.join(outputDir, filename);
        
        if (!this.config.dryRun) {
          await fs.writeFile(filePath, content, 'utf-8');
        }
        
        // Track media URLs for download
        if (mediaUrls) {
          mediaUrls.forEach(url => this.mediaDownloads.add(url));
        }
        
        collectionReport.migrated++;
        this.report.migratedItems++;
        
      } catch (error) {
        const errorMessage = `Failed to migrate ${collectionName} item: ${error instanceof Error ? error.message : 'Unknown error'}`;
        collectionReport.errors.push(errorMessage);
        this.report.errors.push(errorMessage);
      }
    }
    
    this.report.collections[collectionName] = collectionReport;
    this.report.totalItems += collectionReport.total;
    
    console.log(`✅ ${collectionName}: ${collectionReport.migrated}/${collectionReport.total} migrated`);
  }

  /**
   * Get output directory for collection
   */
  private getOutputDirectory(collectionName: string): string {
    const basePath = this.config.contentOutputPath;
    
    switch (collectionName) {
      case 'category': return path.join(basePath, 'categories');
      case 'tag': return path.join(basePath, 'tags');
      case 'blogCategory': return path.join(basePath, 'blog', 'categories');
      case 'partner': return path.join(basePath, 'partners');
      case 'product': return path.join(basePath, 'products');
      case 'blogPost': return path.join(basePath, 'blog', 'posts');
      case 'teamMember': return path.join(basePath, 'team');
      default: return basePath;
    }
  }

  /**
   * Generate category markdown
   */
  private generateCategoryMarkdown(category: Category): { filename: string; content: string; mediaUrls?: string[] } {
    const frontmatter = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || '',
      color: category.color || '#0066cc',
      order: category.order || 0
    };

    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${category.name}

${category.description}
`;

    return {
      filename: `${category.slug}.md`,
      content,
      mediaUrls: category.icon && category.icon.startsWith('http') ? [category.icon] : undefined
    };
  }

  /**
   * Generate blog category markdown
   */
  private generateBlogCategoryMarkdown(category: BlogCategory): { filename: string; content: string } {
    const frontmatter = {
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#0066cc',
      order: category.order || 0
    };

    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${category.name}

${category.description || `Blog posts about ${category.name.toLowerCase()}.`}
`;

    return {
      filename: `${category.slug}.md`,
      content
    };
  }

  /**
   * Generate tag markdown
   */
  private generateTagMarkdown(tag: Tag): { filename: string; content: string } {
    const frontmatter = {
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '#666666',
      usage_count: tag.usage_count || 0
    };

    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${tag.name}

${tag.description || `Content tagged with ${tag.name}.`}
`;

    return {
      filename: `${tag.slug}.md`,
      content
    };
  }

  /**
   * Generate partner markdown
   */
  private generatePartnerMarkdown(partner: Partner): { filename: string; content: string; mediaUrls?: string[] } {
    const mediaUrls: string[] = [];
    
    // Process logo URL
    let logoPath = '';
    if (partner.logoUrl || (partner.logo as any)?.data?.attributes?.url) {
      const logoUrl = partner.logoUrl || (partner.logo as any)?.data?.attributes?.url;
      logoPath = `/media/partners/logos/${partner.slug}.png`;
      if (logoUrl.startsWith('http')) {
        mediaUrls.push(logoUrl);
      }
    }
    
    // Process image URL
    let imagePath = '';
    if (partner.imageUrl || (partner.image as any)?.data?.attributes?.url) {
      const imageUrl = partner.imageUrl || (partner.image as any)?.data?.attributes?.url;
      imagePath = `/media/partners/images/${partner.slug}-overview.jpg`;
      if (imageUrl.startsWith('http')) {
        mediaUrls.push(imageUrl);
      }
    }

    const frontmatter = {
      name: partner.name,
      slug: partner.slug,
      logo: logoPath,
      image: imagePath,
      website: partner.website || '',
      founded: partner.founded || null,
      location: partner.location || '',
      featured: partner.featured || false,
      category: partner.categoryName ? `content/categories/${partner.categoryName.toLowerCase().replace(/\s+/g, '-')}.md` : null,
      tags: partner.tagNames?.map(tag => `content/tags/${tag.toLowerCase().replace(/\s+/g, '-')}.md`) || [],
      seo: {
        meta_title: `${partner.name} - Marine Technology Partner | Paul Thames`,
        meta_description: partner.description.substring(0, 150),
        keywords: `marine technology, ${partner.name.toLowerCase()}, ${partner.categoryName?.toLowerCase() || ''}`,
        og_image: imagePath || logoPath
      }
    };

    const content = `---
${this.serializeFrontmatter(frontmatter)}
---

# ${partner.name}

${partner.description}

${partner.website ? `## Official Website\n\n[Visit ${partner.name}](${partner.website})` : ''}

${partner.location ? `## Location\n\n${partner.location}` : ''}

${partner.founded ? `## Company History\n\nFounded in ${partner.founded}` : ''}
`;

    return {
      filename: `${partner.slug}.md`,
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined
    };
  }

  /**
   * Generate product markdown
   */
  private generateProductMarkdown(product: Product): { filename: string; content: string; mediaUrls?: string[] } {
    const mediaUrls: string[] = [];
    
    // Process product images
    const productImages = product.product_images?.map((img, index) => {
      const imagePath = `/media/products/images/${product.slug}-${index + 1}.jpg`;
      if (img.url && img.url.startsWith('http')) {
        mediaUrls.push(img.url);
      }
      return {
        image: imagePath,
        alt_text: img.altText || img.alt_text || `${product.name} image ${index + 1}`,
        is_main: img.isMain || img.is_main || index === 0,
        caption: img.caption || '',
        order: img.order || index + 1
      };
    }) || [];

    // Process features
    const features = product.features?.map((feature, index) => ({
      title: typeof feature === 'string' ? feature : feature.title,
      description: typeof feature === 'object' ? feature.description || '' : '',
      icon: typeof feature === 'object' ? feature.icon || '' : '',
      order: typeof feature === 'object' ? feature.order || index + 1 : index + 1
    })) || [];

    const frontmatter = {
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: product.description,
      price: product.price || 'Contact for pricing',
      partner: product.partnerName ? `content/partners/${product.partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md` : null,
      category: product.categoryName ? `content/categories/${product.categoryName.toLowerCase().replace(/\s+/g, '-')}.md` : null,
      tags: product.tagNames?.map(tag => `content/tags/${tag.toLowerCase().replace(/\s+/g, '-')}.md`) || [],
      product_images: productImages,
      features: features,
      seo: {
        meta_title: `${product.name} - ${product.partnerName || 'Marine Technology'} | Paul Thames`,
        meta_description: product.description.substring(0, 150),
        keywords: `marine technology, ${product.name.toLowerCase()}, ${product.categoryName?.toLowerCase() || ''}`
      }
    };

    const content = `---
${this.serializeFrontmatter(frontmatter)}
---

# ${product.name}

${product.description}

${features.length > 0 ? `
## Key Features

${features.map(f => `- **${f.title}**: ${f.description}`).join('\n')}
` : ''}

${product.price ? `## Pricing\n\n${product.price}` : ''}
`;

    return {
      filename: `${product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`,
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined
    };
  }

  /**
   * Generate blog post markdown
   */
  private generateBlogPostMarkdown(post: BlogPost): { filename: string; content: string; mediaUrls?: string[] } {
    const mediaUrls: string[] = [];
    
    let imagePath = '';
    if (post.imageUrl || (post.image as any)?.data?.attributes?.url) {
      const imageUrl = post.imageUrl || (post.image as any)?.data?.attributes?.url;
      imagePath = `/media/blog/posts/${post.slug}.jpg`;
      if (imageUrl.startsWith('http')) {
        mediaUrls.push(imageUrl);
      }
    }

    const frontmatter = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      author: post.author,
      published_at: post.published_at || post.publishedAt,
      featured: post.featured || false,
      read_time: post.read_time || post.readTime || '5 min read',
      image: imagePath,
      blog_category: post.category ? `content/blog/categories/${post.category.toLowerCase().replace(/\s+/g, '-')}.md` : null,
      tags: post.tagNames?.map(tag => `content/tags/${tag.toLowerCase().replace(/\s+/g, '-')}.md`) || [],
      seo: {
        meta_title: post.title,
        meta_description: post.excerpt.substring(0, 150),
        keywords: `marine technology, blog, ${post.category?.toLowerCase() || ''}`,
        og_image: imagePath
      }
    };

    const content = `---
${this.serializeFrontmatter(frontmatter)}
---

${post.content}
`;

    return {
      filename: `${post.slug}.md`,
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined
    };
  }

  /**
   * Generate team member markdown
   */
  private generateTeamMemberMarkdown(member: TeamMember): { filename: string; content: string; mediaUrls?: string[] } {
    const mediaUrls: string[] = [];
    
    let imagePath = '';
    if (member.imageUrl || (member.image as any)?.data?.attributes?.url) {
      const imageUrl = member.imageUrl || (member.image as any)?.data?.attributes?.url;
      imagePath = `/media/team/headshots/${member.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      if (imageUrl.startsWith('http')) {
        mediaUrls.push(imageUrl);
      }
    }

    const slug = member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const frontmatter = {
      name: member.name,
      role: member.role,
      image: imagePath,
      email: member.email || '',
      linkedin: member.linkedin || '',
      order: member.order || 1
    };

    const content = `---
${this.serializeFrontmatter(frontmatter)}
---

${member.bio}
`;

    return {
      filename: `${slug}.md`,
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined
    };
  }

  /**
   * Generate company info JSON
   */
  private generateCompanyInfoJSON(companyInfo: CompanyInfo): string {
    const data = {
      name: companyInfo.name,
      tagline: companyInfo.tagline,
      description: companyInfo.description,
      founded: companyInfo.founded,
      location: companyInfo.location,
      address: companyInfo.address,
      phone: companyInfo.phone,
      email: companyInfo.email,
      story: companyInfo.story,
      logo: '/media/company/logos/primary.png',
      social_media: companyInfo.social_media || {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
        youtube: ''
      },
      seo: companyInfo.seo || {
        meta_title: `${companyInfo.name} - Advanced Marine Technology Solutions`,
        meta_description: companyInfo.description.substring(0, 150),
        keywords: 'marine technology, yacht systems, navigation, communication, vessel automation',
        og_image: '/media/company/social/og-default.jpg'
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Migrate media files
   */
  private async migrateMediaFiles() {
    console.log(`🖼️ Migrating media files (${this.mediaDownloads.size} files)...`);
    
    let downloadedCount = 0;
    
    for (const url of this.mediaDownloads) {
      try {
        await this.downloadMediaFile(url);
        downloadedCount++;
      } catch (error) {
        this.report.warnings.push(`Failed to download ${url}: ${error}`);
      }
    }
    
    this.report.mediaFiles = downloadedCount;
    console.log(`✅ Downloaded ${downloadedCount} media files`);
  }

  /**
   * Download single media file
   */
  private async downloadMediaFile(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      // Determine local path based on URL and type
      const filename = path.basename(parsedUrl.pathname) || 'image.jpg';
      const localPath = this.getMediaPath(url, filename);
      
      if (this.config.dryRun) {
        console.log(`🔍 [DRY RUN] Would download ${url} to ${localPath}`);
        resolve();
        return;
      }
      
      const request = protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        const fileStream = fs.createWriteStream(localPath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        
        fileStream.on('error', reject);
      });
      
      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.abort();
        reject(new Error('Download timeout'));
      });
    });
  }

  /**
   * Get local media file path
   */
  private getMediaPath(url: string, filename: string): string {
    const mediaBase = path.join(this.config.contentOutputPath, '..', 'public', 'media');
    
    // Categorize based on URL patterns
    if (url.includes('logo')) {
      return path.join(mediaBase, 'partners', 'logos', filename);
    } else if (url.includes('partner')) {
      return path.join(mediaBase, 'partners', 'images', filename);
    } else if (url.includes('product')) {
      return path.join(mediaBase, 'products', 'images', filename);
    } else if (url.includes('blog')) {
      return path.join(mediaBase, 'blog', 'posts', filename);
    } else if (url.includes('team')) {
      return path.join(mediaBase, 'team', 'headshots', filename);
    } else {
      return path.join(mediaBase, 'system', 'optimized', filename);
    }
  }

  /**
   * Serialize frontmatter object to YAML
   */
  private serializeFrontmatter(obj: any): string {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (value === null || value === undefined) {
          return `${key}: null`;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          return `${key}:\n${Object.entries(value)
            .map(([subKey, subValue]) => `  ${subKey}: ${JSON.stringify(subValue)}`)
            .join('\n')}`;
        } else if (Array.isArray(value)) {
          return `${key}:\n${value.map(item => `  - ${JSON.stringify(item)}`).join('\n')}`;
        } else {
          return `${key}: ${JSON.stringify(value)}`;
        }
      })
      .join('\n');
  }

  /**
   * Validate data only without migration
   */
  private async validateDataOnly(sourceData: any): Promise<MigrationReport> {
    console.log('🔍 Running data validation only...');
    
    const collections = [
      { name: 'categories', data: sourceData.categories || [] },
      { name: 'partners', data: sourceData.partners || [] },
      { name: 'products', data: sourceData.products || [] },
      { name: 'blogPosts', data: sourceData.blogPosts || [] },
      { name: 'teamMembers', data: sourceData.teamMembers || [] },
      { name: 'blogCategories', data: sourceData.blogCategories || [] }
    ];

    for (const collection of collections) {
      this.report.collections[collection.name] = {
        total: collection.data.length,
        migrated: 0,
        errors: []
      };
      
      this.report.totalItems += collection.data.length;
      
      // Validate required fields
      for (const item of collection.data) {
        const validation = this.validateItem(collection.name, item);
        if (!validation.isValid) {
          this.report.collections[collection.name].errors.push(...validation.errors);
        }
      }
    }

    if (sourceData.companyInfo) {
      this.report.totalItems += 1;
    }

    return this.report;
  }

  /**
   * Validate individual item
   */
  private validateItem(collectionName: string, item: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    switch (collectionName) {
      case 'partners':
        if (!item.name) errors.push('Partner missing name');
        if (!item.description) errors.push('Partner missing description');
        break;
      case 'products':
        if (!item.name) errors.push('Product missing name');
        if (!item.description) errors.push('Product missing description');
        break;
      case 'blogPosts':
        if (!item.title) errors.push('Blog post missing title');
        if (!item.content) errors.push('Blog post missing content');
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate validation report
   */
  private async generateValidationReport() {
    const reportPath = path.join(this.config.contentOutputPath, '..', 'migration-report.json');
    
    if (!this.config.dryRun) {
      await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2), 'utf-8');
    }
    
    console.log('📊 Migration Report:');
    console.log(`   Total Items: ${this.report.totalItems}`);
    console.log(`   Migrated: ${this.report.migratedItems}`);
    console.log(`   Media Files: ${this.report.mediaFiles}`);
    console.log(`   Errors: ${this.report.errors.length}`);
    console.log(`   Warnings: ${this.report.warnings.length}`);
    
    if (this.report.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.report.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (this.report.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.report.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
  }
}

// CLI interface
if (require.main === module) {
  const config: MigrationConfig = {
    sourceDataPath: path.join(__dirname, '..', '..'),
    contentOutputPath: path.join(__dirname, '..', '..', 'content'),
    mediaOutputPath: path.join(__dirname, '..', '..', 'public', 'media'),
    backupPath: path.join(__dirname, 'backups'),
    dryRun: process.argv.includes('--dry-run'),
    downloadImages: !process.argv.includes('--no-images'),
    validateOnly: process.argv.includes('--validate-only')
  };

  const migrator = new TinaCMSMigrator(config);
  
  migrator.migrate()
    .then((report) => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export { TinaCMSMigrator, MigrationConfig, MigrationReport };