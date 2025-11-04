/**
 * Payload CMS Data Service
 * Replicates TinaCMSDataService interface but fetches from Payload CMS database
 */

import { getPayload } from 'payload';
import config from '@/payload.config';
import { lexicalToPlainText, type LexicalDocument } from './transformers/markdown-to-lexical';
import type {
  Vendor,
  Partner,
  Product,
  BlogPost,
  TeamMember,
  Yacht,
  Category,
  Tag,
  CompanyInfo,
  VendorSocialProof,
  OwnerReview,
  VisualDemoContent,
  VendorLocation,
  SystemRequirements,
  SystemCompatibility,
} from './types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
}

class PayloadCMSDataService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes (matching TinaCMS service)

  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      cached.accessCount++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`📋 Cache hit for ${key} (accessed ${cached.accessCount} times)`);
      }
      return cached.data;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Cache miss - Fetching ${key} from Payload CMS...`);
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cached ${key} (${this.cache.size} total entries)`);
    }

    return data;
  }

  private transformMediaPath(mediaPath: string | any): string {
    if (!mediaPath) return '';

    // Handle case where mediaPath is an object (Payload media relationship)
    if (typeof mediaPath === 'object') {
      // Extract URL from media object
      const url = mediaPath.url || mediaPath.filename || '';
      if (!url) return '';
      mediaPath = url;
    }

    // Now mediaPath should be a string
    if (typeof mediaPath !== 'string') return '';

    if (mediaPath.startsWith('http')) return mediaPath;
    if (mediaPath.startsWith('/media/')) return mediaPath;
    if (mediaPath.startsWith('/')) return mediaPath;
    return `/media/${mediaPath.replace(/^\/+/, '')}`;
  }

  /**
   * Transforms Lexical rich text format to HTML string
   * Handles the conversion of Payload's Lexical editor format to displayable HTML
   */
  private transformLexicalToHtml(lexicalData: any): string {
    if (!lexicalData) return '';

    // If it's already a string, return it
    if (typeof lexicalData === 'string') return lexicalData;

    // If it has a root node (Lexical document structure)
    if (lexicalData.root && lexicalData.root.children) {
      return this.lexicalNodeToHtml(lexicalData.root.children);
    }

    // Fallback to string conversion
    return String(lexicalData);
  }

  /**
   * Transforms Lexical rich text format to plain text string
   * Extracts only the text content without HTML tags
   */
  private transformLexicalToPlainText(lexicalData: any): string {
    if (!lexicalData) return '';

    // If it's already a string, return it
    if (typeof lexicalData === 'string') {
      // Strip any HTML tags if present
      return lexicalData.replace(/<[^>]*>/g, '').trim();
    }

    // If it has a root node (Lexical document structure)
    if (lexicalData.root && lexicalData.root.children) {
      return lexicalToPlainText(lexicalData as LexicalDocument);
    }

    // Fallback to string conversion
    return String(lexicalData);
  }

  /**
   * Recursively converts Lexical nodes to HTML
   */
  private lexicalNodeToHtml(nodes: any[]): string {
    if (!Array.isArray(nodes)) return '';

    return nodes.map(node => {
      if (!node || !node.type) return '';

      switch (node.type) {
        case 'paragraph':
          const pChildren = node.children ? this.lexicalNodeToHtml(node.children) : '';
          return `<p>${pChildren}</p>`;

        case 'heading':
          const hChildren = node.children ? this.lexicalNodeToHtml(node.children) : '';
          const tag = node.tag || 'h2';
          return `<${tag}>${hChildren}</${tag}>`;

        case 'text':
          let text = node.text || '';
          // Apply formatting
          if (node.format) {
            if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
            if (node.format & 2) text = `<em>${text}</em>`; // Italic
            if (node.format & 8) text = `<s>${text}</s>`; // Strikethrough
            if (node.format & 16) text = `<code>${text}</code>`; // Code
          }
          return text;

        case 'link':
          const linkChildren = node.children ? this.lexicalNodeToHtml(node.children) : '';
          return `<a href="${node.url || ''}"${node.target ? ` target="${node.target}"` : ''}>${linkChildren}</a>`;

        case 'list':
          const listTag = node.listType === 'number' || node.tag === 'ol' ? 'ol' : 'ul';
          const listChildren = node.children ? this.lexicalNodeToHtml(node.children) : '';
          return `<${listTag}>${listChildren}</${listTag}>`;

        case 'listitem':
          const itemChildren = node.children ? this.lexicalNodeToHtml(node.children) : '';
          return `<li>${itemChildren}</li>`;

        case 'quote':
          const quoteChildren = node.children ? this.lexicalNodeToHtml(node.children) : '';
          return `<blockquote>${quoteChildren}</blockquote>`;

        case 'code':
          const codeText = node.children ? node.children.map((c: any) => c.text || '').join('') : '';
          return `<pre><code${node.language ? ` class="language-${node.language}"` : ''}>${codeText}</code></pre>`;

        case 'horizontalrule':
          return '<hr />';

        default:
          // For unknown node types, try to render children
          if (node.children) {
            return this.lexicalNodeToHtml(node.children);
          }
          return '';
      }
    }).join('');
  }

  private transformPayloadVendor(doc: any): Vendor {
    // ============================================================================
    // SECTION 1: CERTIFICATIONS ARRAY - Transform logo media paths
    // ============================================================================
    const certifications = doc.certifications?.map((cert: any) => ({
      name: cert.name || '',
      issuer: cert.issuer || '',
      issuedDate: cert.year ? `${cert.year}` : undefined,
      expiryDate: cert.expiryDate || undefined,
      credentialId: cert.certificateNumber || undefined,
      credentialUrl: cert.verificationUrl || undefined,
      logo: cert.logo?.url ? this.transformMediaPath(cert.logo.url) : undefined,
    })) || [];

    // ============================================================================
    // SECTION 2: AWARDS ARRAY - Transform image media paths
    // ============================================================================
    const awards = doc.awards?.map((award: any) => ({
      awardName: award.title || '',
      issuingOrganization: award.organization || '',
      year: award.year || 0,
      category: award.category || undefined,
      description: award.description || undefined,
      image: award.image?.url ? this.transformMediaPath(award.image.url) : undefined,
    })) || [];

    // ============================================================================
    // SECTION 3: SOCIAL PROOF GROUP - Preserve all numeric fields
    // ============================================================================
    const socialProof: VendorSocialProof | undefined = doc.totalProjects || doc.clientSatisfactionScore || doc.repeatClientPercentage ? {
      projectsCompleted: doc.totalProjects || undefined,
      yearsInBusiness: doc.yearsInBusiness || undefined,
      followers: doc.linkedinFollowers || doc.instagramFollowers || undefined,
      customerList: undefined, // Not in Payload schema
    } : undefined;

    // ============================================================================
    // SECTION 4: VIDEO INTRO GROUP - Transform thumbnail media path
    // ============================================================================
    const videoIntroduction = doc.videoUrl ? {
      videoUrl: doc.videoUrl || '',
      duration: doc.videoDuration || undefined,
      thumbnail: doc.videoThumbnail?.url ? this.transformMediaPath(doc.videoThumbnail.url) : undefined,
      transcript: undefined, // Not in Payload schema
    } : undefined;

    // ============================================================================
    // SECTION 5: CASE STUDIES ARRAY - Transform Lexical content, resolve yacht relationships, transform thumbnails
    // ============================================================================
    const caseStudies = doc.caseStudies?.map((cs: any) => ({
      title: cs.title || '',
      client: cs.yachtName || undefined,
      yacht: cs.yacht?.id?.toString() || undefined,
      industry: undefined, // Not in Payload schema
      challenge: this.transformLexicalToHtml(cs.challenge),
      solution: this.transformLexicalToHtml(cs.solution),
      results: this.transformLexicalToHtml(cs.results),
      metrics: undefined, // Not in Payload schema
      thumbnail: cs.images?.[0]?.image?.url ? this.transformMediaPath(cs.images[0].image.url) : undefined,
      pdfUrl: undefined, // Not in Payload schema
      publishedDate: cs.projectDate || undefined,
    })) || [];

    // ============================================================================
    // SECTION 6: INNOVATIONS ARRAY - Transform Lexical description, transform image
    // ============================================================================
    const innovationHighlights = doc.innovationHighlights?.map((innovation: any) => ({
      title: innovation.title || '',
      category: undefined, // Not in Payload schema
      description: this.transformLexicalToHtml(innovation.description),
      launchDate: innovation.year ? `${innovation.year}` : undefined,
      patentInfo: innovation.patentNumber || undefined,
      image: innovation.image?.url ? this.transformMediaPath(innovation.image.url) : undefined,
      productLinks: innovation.benefits?.map((b: any) => b.benefit) || [],
    })) || [];

    // ============================================================================
    // SECTION 7: TEAM MEMBERS ARRAY - Transform photo media path
    // ============================================================================
    const teamMembers = doc.teamMembers?.map((member: any) => ({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || undefined,
      expertise: undefined, // Not in Payload schema
      photo: member.photo?.url ? this.transformMediaPath(member.photo.url) : undefined,
      linkedinUrl: member.linkedinUrl || undefined,
    })) || [];

    // ============================================================================
    // SECTION 8: YACHT PROJECTS ARRAY - Resolve yacht relationships, transform image
    // ============================================================================
    const yachtProjects = doc.yachtProjects?.map((project: any) => ({
      yacht: project.yacht?.id?.toString() || undefined,
      roleDescription: project.role || '',
      yearCompleted: project.completionDate ? new Date(project.completionDate).getFullYear() : undefined,
      image: project.image?.url ? this.transformMediaPath(project.image.url) : undefined,
      projectHighlights: project.systemsInstalled?.map((s: any) => s.system) || [],
    })) || [];

    // ============================================================================
    // SECTION 8: LOCATION - Transform from flat fields to VendorLocation object (legacy)
    // ============================================================================
    const location: string | VendorLocation =
      doc.location_latitude !== undefined && doc.location_longitude !== undefined
        ? {
            address: doc.location_address || '',
            city: doc.location_city || '',
            country: doc.location_country || '',
            latitude: doc.location_latitude,
            longitude: doc.location_longitude,
          }
        : doc.location || '';

    // ============================================================================
    // SECTION 9: LOCATIONS ARRAY - Multi-location support (Tier 2+)
    // ============================================================================
    const locations: VendorLocation[] | undefined = doc.locations?.map((loc: any) => ({
      id: loc.id || undefined,
      locationName: loc.locationName || undefined,
      address: loc.address || '',
      city: loc.city || '',
      state: loc.state || undefined,
      postalCode: loc.postalCode || undefined,
      country: loc.country || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      isHQ: loc.isHQ || false,
    })) || undefined;

    // ============================================================================
    // SECTION 10: VENDOR REVIEWS ARRAY - Transform review data
    // ============================================================================
    const vendorReviews = doc.vendorReviews?.map((review: any) => ({
      id: review.id || '',
      reviewerName: review.reviewerName || '',
      reviewerRole: review.reviewerRole || '',
      yachtName: review.yachtName,
      projectType: review.projectType,
      overallRating: review.overallRating || 0,
      ratings: {
        quality: review.ratings?.quality,
        communication: review.ratings?.communication,
        timeliness: review.ratings?.timeliness,
        professionalism: review.ratings?.professionalism,
        valueForMoney: review.ratings?.valueForMoney,
      },
      reviewText: review.reviewText,
      reviewDate: review.reviewDate,
      verified: review.verified || false,
      featured: review.featured || false,
      pros: review.pros || [],
      cons: review.cons || [],
    })) || [];

    return {
      id: doc.id ? doc.id.toString() : '',
      slug: doc.slug || '',
      name: doc.companyName || doc.name || '',
      category: doc.category?.name || '',
      description: this.transformLexicalToHtml(doc.description) || '',
      logo: this.transformMediaPath(doc.logo || ''),
      image: this.transformMediaPath(doc.image || ''),
      website: doc.website || '',
      founded: doc.founded,
      foundedYear: doc.foundedYear || doc.founded, // Fallback to founded for backward compatibility
      location,
      locations,
      tier: doc.tier || 'free',
      tags: doc.tags?.map((tag: any) => tag.name || tag) || [],
      featured: doc.featured || false,
      partner: doc.partner !== undefined ? doc.partner : false,
      services: doc.services || [],
      contactEmail: doc.contactEmail,
      contactPhone: doc.contactPhone,
      longDescription: this.transformLexicalToHtml(doc.longDescription),
      serviceAreas: doc.serviceAreas || [],
      companyValues: doc.companyValues || [],
      totalProjects: doc.totalProjects,
      employeeCount: doc.employeeCount,
      linkedinFollowers: doc.linkedinFollowers,
      instagramFollowers: doc.instagramFollowers,
      clientSatisfactionScore: doc.clientSatisfactionScore,
      repeatClientPercentage: doc.repeatClientPercentage,
      videoUrl: doc.videoUrl,
      videoThumbnail: doc.videoThumbnail?.url ? this.transformMediaPath(doc.videoThumbnail.url) : undefined,
      videoDuration: doc.videoDuration,
      videoTitle: doc.videoTitle,
      videoDescription: doc.videoDescription,
      certifications,
      awards,
      socialProof,
      videoIntroduction,
      caseStudies,
      innovationHighlights,
      teamMembers,
      yachtProjects,
      vendorReviews,
    };
  }

  private transformPayloadProduct(doc: any): Product {
    const vendor = doc.vendor;
    const mainImage = doc.images?.find((img: any) => img.isMain) || doc.images?.[0];

    // ============================================================================
    // SECTION 1: COMPARISON METRICS - Convert array to nested object structure
    // ============================================================================
    const comparisonMetrics: { [category: string]: { [key: string]: string | number | boolean } } = {};
    doc.comparisonMetrics?.forEach((metric: any) => {
      const category = metric.category || 'general';
      if (!comparisonMetrics[category]) {
        comparisonMetrics[category] = {};
      }
      comparisonMetrics[category][metric.metricName || 'unknown'] = metric.numericValue || metric.value || '';
    });

    // ============================================================================
    // SECTION 2: INTEGRATION COMPATIBILITY - Extract supported protocols as string array
    // ============================================================================
    const integrationCompatibility = doc.integrationCompatibility?.supportedProtocols?.map((proto: any) => proto.protocol) || [];

    // ============================================================================
    // SECTION 2A: SYSTEM REQUIREMENTS - Transform system requirements object
    // ============================================================================
    const systemRequirements: SystemRequirements | undefined = doc.integrationCompatibility?.systemRequirements ? {
      powerSupply: doc.integrationCompatibility.systemRequirements.powerSupply || undefined,
      mounting: doc.integrationCompatibility.systemRequirements.mounting || undefined,
      operatingTemp: doc.integrationCompatibility.systemRequirements.operatingTemp || undefined,
      certification: doc.integrationCompatibility.systemRequirements.certification || undefined,
      ipRating: doc.integrationCompatibility.systemRequirements.ipRating || undefined,
    } : undefined;

    // ============================================================================
    // SECTION 2B: COMPATIBILITY MATRIX - Transform compatibility matrix array
    // ============================================================================
    const compatibilityMatrix: SystemCompatibility[] = doc.integrationCompatibility?.compatibilityMatrix?.map((item: any) => ({
      system: item.system || '',
      compatibility: item.compatibility || 'none',
      notes: item.notes || undefined,
      requirements: item.requirements?.map((req: any) => req.requirement).filter(Boolean) || undefined,
      complexity: item.complexity || undefined,
      estimatedCost: item.estimatedCost || undefined,
    })) || [];

    // ============================================================================
    // SECTION 3: OWNER REVIEWS ARRAY - Transform Lexical reviewText, resolve yacht relationships
    // ============================================================================
    const ownerReviews: OwnerReview[] = doc.ownerReviews?.map((review: any) => ({
      id: review.id?.toString() || `review-${Date.now()}`,
      productId: doc.id?.toString() || '',
      ownerName: review.reviewerName || '',
      yachtName: review.yachtName || undefined,
      yachtLength: undefined, // Not in Payload schema
      rating: review.overallRating || 0,
      title: review.reviewText ? this.transformLexicalToPlainText(review.reviewText).substring(0, 100) : '',
      review: this.transformLexicalToPlainText(review.reviewText),
      pros: review.pros?.map((p: any) => p.pro) || undefined,
      cons: review.cons?.map((c: any) => c.con) || undefined,
      installationDate: undefined, // Not in Payload schema
      verified: review.verified || false,
      helpful: undefined, // Not in Payload schema
      images: undefined, // Not in Payload schema
      useCase: undefined, // Not in Payload schema
      flagged: false,
      vendorResponse: undefined, // Not in Payload schema
    })) || [];

    // ============================================================================
    // SECTION 4: VISUAL DEMO CONTENT - Transform to VisualDemoContent type
    // ============================================================================
    const visualDemo: VisualDemoContent | undefined = doc.visualDemoContent?.model3d?.modelUrl ? {
      type: '3d-model' as const,
      title: doc.name || '',
      description: doc.shortDescription || undefined,
      imageUrl: doc.visualDemoContent.model3d.thumbnailImage?.url
        ? this.transformMediaPath(doc.visualDemoContent.model3d.thumbnailImage.url)
        : undefined,
      modelUrl: doc.visualDemoContent.model3d.modelUrl || undefined,
      videoUrl: doc.visualDemoContent.videoWalkthrough?.videoUrl || undefined,
      hotspots: doc.visualDemoContent.interactiveHotspots?.flatMap((hotspotGroup: any) =>
        hotspotGroup.hotspots?.map((hotspot: any) => ({
          position: { x: hotspot.x || 0, y: hotspot.y || 0 },
          title: hotspot.title || '',
          description: hotspot.description || undefined,
          action: 'info' as const,
        })) || []
      ) || undefined,
      animations: undefined, // Not in Payload schema
      cameraPositions: undefined, // Not in Payload schema
      materials: undefined, // Not in Payload schema
    } : doc.visualDemoContent?.videoWalkthrough?.videoUrl ? {
      type: 'video' as const,
      title: doc.name || '',
      description: doc.shortDescription || undefined,
      videoUrl: doc.visualDemoContent.videoWalkthrough.videoUrl || undefined,
      imageUrl: doc.visualDemoContent.videoWalkthrough.thumbnail?.url
        ? this.transformMediaPath(doc.visualDemoContent.videoWalkthrough.thumbnail.url)
        : undefined,
    } : doc.visualDemoContent?.images360?.length > 0 ? {
      type: '360-image' as const,
      title: doc.name || '',
      description: doc.shortDescription || undefined,
      imageUrl: doc.visualDemoContent.images360[0]?.image?.url
        ? this.transformMediaPath(doc.visualDemoContent.images360[0].image.url)
        : undefined,
    } : undefined;

    return {
      id: doc.id ? doc.id.toString() : '',
      slug: doc.slug || '',
      name: doc.name || '',
      vendorId: vendor?.id?.toString() || '',
      vendorName: vendor?.companyName || vendor?.name || '',
      partnerId: vendor?.id?.toString() || '',
      partnerName: vendor?.companyName || vendor?.name || '',
      category: doc.categories?.[0]?.name || '',
      description: this.transformLexicalToHtml(doc.description) || '',
      image: this.transformMediaPath(mainImage?.url || ''),
      images: doc.images?.map((img: any) => ({
        id: img.url,
        url: this.transformMediaPath(img.url || ''),
        altText: img.altText || '',
        isMain: img.isMain || false,
      })) || [],
      features: doc.features?.map((feature: any) => ({
        id: feature.id || `feature-${Date.now()}`,
        title: feature.title || '',
        description: feature.description || undefined,
        icon: feature.icon || undefined,
        order: feature.order || undefined,
      })) || [],
      price: doc.price,
      tags: [],
      comparisonMetrics,
      specifications: doc.specifications?.map((spec: any) => ({
        label: spec.label,
        value: spec.value,
      })) || [],
      integrationCompatibility,
      systemRequirements,
      compatibilityMatrix,
      ownerReviews,
      visualDemo,
      vendor: vendor ? this.transformPayloadVendor(vendor) : undefined,
      partner: vendor ? this.transformPayloadVendor(vendor) : undefined,
    };
  }

  private transformPayloadBlogPost(doc: any): BlogPost {
    return {
      id: doc.id.toString(),
      slug: doc.slug,
      title: doc.title,
      excerpt: doc.excerpt || '',
      content: doc.content || '',
      author: doc.author?.email || '',
      publishedAt: doc.publishedAt || doc.createdAt,
      category: doc.categories?.[0]?.name || '',
      tags: doc.tags?.map((tag: any) => tag.tag) || [],
      image: this.transformMediaPath(doc.featuredImage || ''),
      featured: doc.published || false,
      readTime: '5 min',
    };
  }

  private transformPayloadTeamMember(doc: any): TeamMember {
    return {
      id: doc.id.toString(),
      name: doc.name,
      role: doc.role,
      bio: doc.bio || '',
      image: this.transformMediaPath(doc.image || ''),
      email: doc.email || '',
      linkedin: doc.linkedin || '',
      order: doc.order || 999,
    };
  }

  private transformCategory(doc: any): Category {
    return {
      id: doc.id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description || '',
      icon: doc.icon || '',
      color: doc.color || '#0066cc',
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      publishedAt: doc.publishedAt || doc.createdAt,
    };
  }

  private transformTag(doc: any): Tag {
    return {
      id: doc.id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description || '',
      color: doc.color || '#0066cc',
      usage_count: doc.usageCount || 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      publishedAt: doc.publishedAt || doc.createdAt,
    };
  }

  private transformYacht(doc: any): Yacht {
    // Transform Lexical description to HTML
    const description = this.transformLexicalToHtml(doc.description);

    // Transform heroImage (media relationship)
    const heroImage = doc.heroImage?.url ? this.transformMediaPath(doc.heroImage.url) : undefined;

    // Transform gallery images
    const gallery = doc.gallery?.map((item: any) => {
      if (item.image?.url) {
        return this.transformMediaPath(item.image.url);
      }
      return null;
    }).filter(Boolean) || [];

    // Transform timeline events
    const timeline = doc.timeline?.map((event: any) => ({
      date: event.date,
      event: event.title || event.event || '',
      description: event.description || '',
      category: event.category || 'milestone',
      location: undefined, // Not in Payload schema
      images: event.image?.url ? [this.transformMediaPath(event.image.url)] : [],
    })) || [];

    // Transform supplier map with vendor and product relationships
    const supplierMap = doc.supplierMap?.map((supplier: any) => {
      const vendor = supplier.vendor;
      const vendorData = vendor ? {
        id: vendor.id?.toString() || '',
        name: vendor.companyName || vendor.name || '',
        slug: vendor.slug || '',
        logo: vendor.logo?.url ? this.transformMediaPath(vendor.logo.url) : undefined,
      } : null;

      const products = supplier.products?.map((product: any) => ({
        id: product.id?.toString() || '',
        name: product.name || '',
        slug: product.slug || '',
        image: product.images?.[0]?.url ? this.transformMediaPath(product.images[0].url) : undefined,
      })) || [];

      return {
        vendorId: vendor?.id?.toString() || '',
        vendorName: vendor?.companyName || vendor?.name || '',
        discipline: supplier.systemCategory || '',
        systems: products.map((p: any) => p.name),
        role: 'primary' as const,
        projectPhase: undefined,
      };
    }) || [];

    // Transform sustainability metrics (flat fields in Payload -> grouped in frontend)
    const sustainabilityScore = (doc.co2EmissionsTonsPerYear || doc.energyEfficiencyRating || doc.hybridPropulsion ||
      doc.solarPanelCapacityKw || doc.batteryStorageKwh || doc.sustainabilityFeatures || doc.greenCertifications) ? {
      co2Emissions: doc.co2EmissionsTonsPerYear,
      energyEfficiency: undefined, // Would need to calculate from rating
      wasteManagement: undefined,
      waterConservation: undefined,
      materialSustainability: undefined,
      overallScore: undefined,
      certifications: doc.greenCertifications?.map((c: any) => c.certification) || [],
    } : undefined;

    // Transform maintenance history with vendor resolution
    const maintenanceHistory = doc.maintenanceHistory?.map((record: any) => {
      const vendor = record.vendor;
      return {
        date: record.date,
        type: record.type || 'routine',
        system: '', // Not in Payload schema
        description: record.description || '',
        vendor: vendor ? vendor.companyName || vendor.name : undefined,
        cost: record.cost,
        nextService: undefined, // Not in Payload schema
        status: 'completed' as const,
      };
    }) || [];

    return {
      id: doc.id.toString(),
      name: doc.name,
      slug: doc.slug,
      description,

      // Images
      image: heroImage,
      images: gallery,

      // Specifications (Payload uses different field names)
      length: doc.lengthMeters,
      beam: doc.beamMeters,
      draft: doc.draftMeters,
      displacement: doc.tonnage,
      builder: doc.builder,
      designer: undefined, // Not in Payload schema
      launchYear: doc.launchYear,
      deliveryYear: doc.deliveryDate ? new Date(doc.deliveryDate).getFullYear() : undefined,
      homePort: undefined, // Not in Payload schema
      flag: doc.flagState,
      classification: doc.classification,

      // Performance (not in Payload schema)
      cruisingSpeed: undefined,
      maxSpeed: undefined,
      range: undefined,

      // Capacity (not in Payload schema)
      guests: undefined,
      crew: undefined,

      // Metadata
      featured: doc.featured || false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,

      // Yacht-specific content
      timeline,
      supplierMap,
      sustainabilityScore,
      customizations: undefined, // Not in Payload schema
      maintenanceHistory,

      // Relations
      category: doc.categories?.[0]?.name || undefined,
      tags: doc.tags?.map((tag: any) => tag.name) || [],

      // Computed fields
      imageUrl: heroImage,
      mainImage: heroImage,
    };
  }

  private transformCompany(doc: any): CompanyInfo {
    // Transform Lexical story to HTML
    const story = this.transformLexicalToHtml(doc.story);

    // Transform logo media path
    const logo = this.transformMediaPath(doc.logo || '');

    // Transform social media (group field in Payload)
    const social_media = doc.socialMedia ? {
      id: 'social-media',
      facebook: doc.socialMedia.facebook || undefined,
      twitter: doc.socialMedia.twitter || undefined,
      linkedin: doc.socialMedia.linkedin || undefined,
      instagram: doc.socialMedia.instagram || undefined,
      youtube: doc.socialMedia.youtube || undefined,
    } : undefined;

    // Transform SEO (group field in Payload)
    const seo = doc.seo ? {
      id: 'seo',
      meta_title: doc.seo.metaTitle || undefined,
      meta_description: doc.seo.metaDescription || undefined,
      keywords: doc.seo.keywords || undefined,
      og_image: doc.seo.ogImage ? {
        id: doc.seo.ogImage,
        name: '',
        url: this.transformMediaPath(doc.seo.ogImage),
      } : undefined,
      canonical_url: undefined,
      no_index: undefined,
    } : undefined;

    return {
      id: doc.id?.toString(),
      name: doc.name,
      tagline: doc.tagline || '',
      description: doc.description || '',
      founded: doc.founded || 0,
      location: doc.location || '',
      address: doc.address || '',
      phone: doc.phone || '',
      email: doc.email || '',
      story,
      mission: doc.mission || undefined,
      logo,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      publishedAt: doc.publishedAt || doc.createdAt,
      social_media,
      seo,
      logoUrl: logo, // Computed field
    };
  }

  // Vendors
  async getAllVendors(): Promise<Vendor[]> {
    return this.getCached('vendors', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'vendors',
        where: { published: { equals: true } },
        limit: 1000,
        depth: 2,
      });

      return result.docs.map(doc => this.transformPayloadVendor(doc));
    });
  }

  async getVendors(params?: { category?: string; featured?: boolean; partnersOnly?: boolean }): Promise<Vendor[]> {
    const allVendors = await this.getAllVendors();
    let filtered = allVendors;

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === params.category);
    }

    if (params?.featured) {
      filtered = filtered.filter(vendor => vendor.featured);
    }

    if (params?.partnersOnly) {
      filtered = filtered.filter(vendor => vendor.partner === true);
    }

    return filtered;
  }

  async getVendorBySlug(slug: string): Promise<Vendor | null> {
    return this.getCached(`vendor:${slug}`, async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'vendors',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });

      return result.docs[0] ? this.transformPayloadVendor(result.docs[0]) : null;
    });
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    return this.getCached(`vendor-id:${id}`, async () => {
      const payload = await getPayload({ config });
      const doc = await payload.findByID({
        collection: 'vendors',
        id,
        depth: 2,
      });

      return doc ? this.transformPayloadVendor(doc) : null;
    });
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return this.getVendors({ featured: true });
  }

  // Partners (backward compatibility)
  async getAllPartners(): Promise<Partner[]> {
    const vendors = await this.getAllVendors();
    return vendors.map(vendor => ({ ...vendor } as Partner));
  }

  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    const vendors = await this.getVendors({ ...params, partnersOnly: true });
    return vendors.map(vendor => ({ ...vendor } as Partner));
  }

  async getFeaturedPartners(): Promise<Partner[]> {
    return this.getCached('featured-partners', async () => {
      const allVendors = await this.getAllVendors();
      const featuredPartners = allVendors.filter(
        vendor => vendor.featured === true && vendor.partner === true
      );
      return featuredPartners.map(vendor => ({ ...vendor } as Partner));
    });
  }

  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    const vendor = await this.getVendorBySlug(slug);
    return vendor ? ({ ...vendor } as Partner) : null;
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    const vendor = await this.getVendorById(id);
    return vendor ? ({ ...vendor } as Partner) : null;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return this.getCached('products', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'products',
        where: { published: { equals: true } },
        limit: 1000,
        depth: 3,
      });

      const products = result.docs.map(doc => this.transformPayloadProduct(doc));
      
      // Filter out products from free tier or tier1 vendors
      // Only show products from tier2+ vendors on the public products page
      const filteredProducts = products.filter(product => {
        const vendorTier = product.vendor?.tier;
        return vendorTier && ['tier2', 'tier3'].includes(vendorTier);
      });

      return filteredProducts;
    });
  }

  async getProducts(params?: { category?: string; partnerId?: string; vendorId?: string }): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    let filtered = allProducts;

    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(product => product.category === params.category);
    }

    const targetId = params?.vendorId || params?.partnerId;
    if (targetId) {
      // Convert targetId to string for comparison (handles both number and string inputs)
      const targetIdStr = targetId.toString();
      filtered = filtered.filter(
        product => product.vendorId === targetIdStr || product.partnerId === targetIdStr
      );
    }

    return filtered;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.getCached(`product:${slug}`, async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 3,
      });

      return result.docs[0] ? this.transformPayloadProduct(result.docs[0]) : null;
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find(product => product.id === id) || null;
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return this.getProducts({ vendorId });
  }

  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return this.getProducts({ partnerId });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.getCached('categories:all', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'categories',
        limit: 1000,
        depth: 1,
      });

      return result.docs.map(doc => this.transformCategory(doc));
    });
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.getCached(`category:${slug}`, async () => {
      try {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: 'categories',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
        });

        return result.docs[0] ? this.transformCategory(result.docs[0]) : null;
      } catch (error) {
        console.error(`Error fetching category by slug ${slug}:`, error);
        return null;
      }
    });
  }

  async getBlogCategories(): Promise<Category[]> {
    return this.getCategories();
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.getCached('tags:all', async () => {
      try {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: 'tags',
          limit: 1000,
          depth: 1,
        });

        return result.docs.map(doc => this.transformTag(doc));
      } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
    });
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    return this.getCached(`tag:${slug}`, async () => {
      try {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: 'tags',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
        });

        return result.docs[0] ? this.transformTag(result.docs[0]) : null;
      } catch (error) {
        console.error(`Error fetching tag by slug ${slug}:`, error);
        return null;
      }
    });
  }

  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    return this.getCached(`tags:popular:${limit}`, async () => {
      try {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: 'tags',
          limit: limit,
          depth: 1,
          sort: '-usageCount', // Sort by usageCount descending
        });

        return result.docs.map(doc => this.transformTag(doc));
      } catch (error) {
        console.error('Error fetching popular tags:', error);
        return [];
      }
    });
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.getCached('blog-posts', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'blog-posts',
        where: { published: { equals: true } },
        limit: 1000,
        depth: 2,
        sort: '-publishedAt',
      });

      return result.docs.map(doc => this.transformPayloadBlogPost(doc));
    });
  }

  async getBlogPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    const allPosts = await this.getAllBlogPosts();
    let filtered = allPosts;

    if (params?.category) {
      filtered = filtered.filter(post => post.category === params.category);
    }

    if (params?.featured) {
      filtered = filtered.filter(post => post.featured);
    }

    return filtered;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return this.getCached(`blog-post:${slug}`, async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'blog-posts',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });

      return result.docs[0] ? this.transformPayloadBlogPost(result.docs[0]) : null;
    });
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.getCached('team-members', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'team-members',
        limit: 1000,
        sort: 'order',
      });

      return result.docs.map(doc => this.transformPayloadTeamMember(doc));
    });
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo | null> {
    return this.getCached('company:info', async () => {
      try {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: 'company-info',
          limit: 1,
          depth: 1,
        });

        const doc = result.docs[0];
        if (!doc) {
          console.warn('Company info not found in Payload CMS');
          return null;
        }

        return this.transformCompany(doc);
      } catch (error) {
        console.error('Error fetching company info:', error);
        return null;
      }
    });
  }

  // Search functionality
  async searchVendors(query: string): Promise<Vendor[]> {
    const vendors = await this.getAllVendors();
    const searchLower = query.toLowerCase();

    return vendors.filter(
      vendor =>
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.description.toLowerCase().includes(searchLower)
    );
  }

  async searchPartners(query: string): Promise<Partner[]> {
    const partners = await this.getAllPartners();
    const searchLower = query.toLowerCase();

    return partners.filter(
      partner =>
        partner.name.toLowerCase().includes(searchLower) ||
        partner.description.toLowerCase().includes(searchLower)
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    const searchLower = query.toLowerCase();

    return products.filter(
      product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const posts = await this.getAllBlogPosts();
    const searchLower = query.toLowerCase();

    return posts.filter(
      post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower)
    );
  }

  // Yachts
  async getYachts(): Promise<Yacht[]> {
    return this.getCached('yachts:all', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'yachts',
        depth: 2, // Resolve vendor and product relationships in supplierMap
        limit: 1000,
        sort: '-launchYear', // Newest first
      });

      return result.docs.map(doc => this.transformYacht(doc));
    });
  }

  async getYachtBySlug(slug: string): Promise<Yacht | null> {
    return this.getCached(`yacht:${slug}`, async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'yachts',
        where: { slug: { equals: slug } },
        depth: 2,
        limit: 1,
      });

      return result.docs[0] ? this.transformYacht(result.docs[0]) : null;
    });
  }

  async getFeaturedYachts(): Promise<Yacht[]> {
    return this.getCached('yachts:featured', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'yachts',
        where: { featured: { equals: true } },
        depth: 2,
        limit: 100,
        sort: '-launchYear',
      });

      return result.docs.map(doc => this.transformYacht(doc));
    });
  }

  async getYachtsByVendor(vendorSlug: string): Promise<Yacht[]> {
    return this.getCached(`yachts:vendor:${vendorSlug}`, async () => {
      // First get vendor ID from slug
      const vendor = await this.getVendorBySlug(vendorSlug);
      if (!vendor) return [];

      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'yachts',
        where: {
          'supplierMap.vendor': { equals: vendor.id }
        },
        depth: 2,
        limit: 1000,
        sort: '-launchYear',
      });

      return result.docs.map(doc => this.transformYacht(doc));
    });
  }

  // Utility methods for static generation
  async getVendorSlugs(): Promise<string[]> {
    const vendors = await this.getAllVendors();
    return vendors.map(vendor => vendor.slug).filter(Boolean) as string[];
  }

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

  // Enhanced vendor profile methods (for Platform Vision features)
  async getVendorCertifications(vendorId: string): Promise<any[]> {
    return this.getCached(`vendor-certifications:${vendorId}`, async () => {
      const vendor = await this.getVendorById(vendorId);
      return vendor?.certifications || [];
    });
  }

  async getVendorAwards(vendorId: string): Promise<any[]> {
    return this.getCached(`vendor-awards:${vendorId}`, async () => {
      const vendor = await this.getVendorById(vendorId);
      return vendor?.awards || [];
    });
  }

  async getVendorSocialProof(vendorId: string): Promise<any> {
    return this.getCached(`vendor-social-proof:${vendorId}`, async () => {
      const vendor = await this.getVendorById(vendorId);
      return vendor?.socialProof || {};
    });
  }

  async getEnhancedVendorProfile(vendorId: string): Promise<any> {
    return this.getCached(`enhanced-vendor:${vendorId}`, async () => {
      const vendor = await this.getVendorById(vendorId);
      if (!vendor) return null;

      return {
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        certifications: vendor.certifications || [],
        awards: vendor.awards || [],
        socialProof: vendor.socialProof || {},
        videoUrl: vendor.videoIntroduction?.videoUrl,
        caseStudies: vendor.caseStudies || [],
        innovationHighlights: vendor.innovationHighlights || [],
        teamMembers: vendor.teamMembers || [],
        yachtProjects: vendor.yachtProjects || [],
      };
    });
  }

  async preloadEnhancedVendorData(vendorId: string): Promise<void> {
    // Preload all enhanced vendor data in parallel
    await Promise.all([
      this.getVendorCertifications(vendorId),
      this.getVendorAwards(vendorId),
      this.getVendorSocialProof(vendorId),
      this.getEnhancedVendorProfile(vendorId),
    ]);
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Payload CMS cache cleared');
  }

  clearVendorCache(vendorIdOrSlug?: string): void {
    if (vendorIdOrSlug) {
      // Construct all possible cache keys for this vendor
      const keysToDelete = [
        // Direct lookups
        `vendor:${vendorIdOrSlug}`,           // By slug
        `vendor-id:${vendorIdOrSlug}`,        // By ID
        `enhanced-vendor:${vendorIdOrSlug}`,  // Enhanced by either
        
        // Derived data caches
        `vendor-certifications:${vendorIdOrSlug}`,
        `vendor-awards:${vendorIdOrSlug}`,
        `vendor-social-proof:${vendorIdOrSlug}`,
        
        // Related data caches
        `yachts:vendor:${vendorIdOrSlug}`,
        `products:vendor:${vendorIdOrSlug}`,
      ];
      
      // Delete exact keys
      let deletedCount = 0;
      keysToDelete.forEach(key => {
        if (this.cache.has(key)) {
          this.cache.delete(key);
          console.log(`[Cache] ✓ Deleted: ${key}`);
          deletedCount++;
        }
      });
      
      // Always clear lists since vendor was modified
      const listKeys = ['vendors', 'partners', 'featured-partners', 'products'];
      listKeys.forEach(key => {
        if (this.cache.has(key)) {
          this.cache.delete(key);
          deletedCount++;
        }
      });
      
      console.log(`[Cache] Cleared ${deletedCount} cache entries for vendor: ${vendorIdOrSlug}`);
    } else {
      // Clear all vendor-related cache
      this.cache.clear();
      console.log('[Cache] Cleared entire data service cache');
    }
  }

  getCacheStats(): { hits: number; misses: number; size: number } {
    return {
      hits: 0,
      misses: 0,
      size: this.cache.size,
    };
  }

  getCacheInfo(): Array<{ key: string; age: number; accessCount: number }> {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      accessCount: entry.accessCount,
    }));
  }

  getCacheStatistics(): { totalKeys: number; cacheSize: number; hitRatio?: number } {
    return {
      totalKeys: this.cache.size,
      cacheSize: this.cache.size,
      hitRatio: undefined, // Could be implemented with hit/miss tracking
    };
  }

  // Validation methods for build-time checks
  async validateCMSContent(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      console.log('🔍 Validating Payload CMS content...');

      // Validate required data exists
      const [vendors, products, categories] = await Promise.all([
        this.getAllVendors(),
        this.getAllProducts(),
        this.getCategories(),
      ]);

      if (vendors.length === 0) {
        errors.push('No vendors found in Payload CMS content');
      }

      if (products.length === 0) {
        errors.push('No products found in Payload CMS content');
      }

      if (categories.length === 0) {
        errors.push('No categories found in Payload CMS content');
      }

      // Validate vendor-product relationships
      const vendorIds = new Set(vendors.map((v) => v.id));
      const orphanedProducts = products.filter(
        (p) =>
          (p.vendorId && !vendorIds.has(p.vendorId)) ||
          (p.partnerId && !vendorIds.has(p.partnerId))
      );

      if (orphanedProducts.length > 0) {
        errors.push(`${orphanedProducts.length} products have invalid vendor/partner references`);
      }

      // Validate slugs are unique
      const vendorSlugs = vendors.map((v) => v.slug).filter(Boolean);
      const duplicateVendorSlugs = vendorSlugs.filter(
        (slug, index) => vendorSlugs.indexOf(slug) !== index
      );

      if (duplicateVendorSlugs.length > 0) {
        errors.push(`Duplicate vendor slugs found: ${duplicateVendorSlugs.join(', ')}`);
      }

      const productSlugs = products.map((p) => p.slug).filter(Boolean);
      const duplicateProductSlugs = productSlugs.filter(
        (slug, index) => productSlugs.indexOf(slug) !== index
      );

      if (duplicateProductSlugs.length > 0) {
        errors.push(`Duplicate product slugs found: ${duplicateProductSlugs.join(', ')}`);
      }

      console.log(
        `✅ Payload CMS validation complete: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`
      );

      if (errors.length > 0) {
        console.error('❌ Payload CMS validation errors:', errors);
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      const errorMessage = `Failed to validate Payload CMS content: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌ Payload CMS validation failed:', errorMessage);
      return {
        isValid: false,
        errors: [errorMessage],
      };
    }
  }
}

// Export singleton instance
export const payloadCMSDataService = new PayloadCMSDataService();
export default payloadCMSDataService;
