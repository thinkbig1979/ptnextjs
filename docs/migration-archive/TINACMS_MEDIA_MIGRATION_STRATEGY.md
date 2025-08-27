# TinaCMS Media Migration Strategy

## Overview
Comprehensive strategy for migrating media files from Strapi CMS to TinaCMS for the Paul Thames Next.js project. This document covers media organization, migration processes, optimization strategies, and implementation guidelines.

**Generated**: 2025-08-27  
**Target**: Migration from Strapi media system to TinaCMS local media  
**Project**: `/home/edwin/development/ptnextjs`  

---

## 🗂️ Current Strapi Media Analysis

### Current Media Structure (Strapi)
```
strapi-cms/public/uploads/
├── [hash]_[original-filename].[ext]
├── thumbnail_[hash]_[filename].[ext]
├── medium_[hash]_[filename].[ext]
├── large_[hash]_[filename].[ext]
└── small_[hash]_[filename].[ext]
```

### Current Media URL Pattern
```
Strapi URL: http://localhost:1337/uploads/hash_filename.jpg
Placeholder URL: /api/placeholder/400/300?text=Company+Name
```

### Media Inventory by Content Type
Based on current project analysis:

| Content Type | Media Types | Estimated Count | Current Usage |
|-------------|-------------|-----------------|---------------|
| Partners | Logos, Images | 36 files (18 partners × 2) | Logos + overview images |
| Products | Image galleries | 144+ files (36 products × 4 avg) | Main + gallery images |
| Blog Posts | Featured images | 16 files (8 posts × 2) | Hero + social images |
| Team Members | Headshots | 8 files (4 members × 2) | Profile + backup images |
| Company Info | Logo variants | 6 files | Logo + social images |
| Categories | Icons | 11 files | Category icons |
| **Total** | **All types** | **~221 files** | **Mixed formats** |

---

## 🎯 Target TinaCMS Media Structure

### Optimized Media Organization
```
public/media/
├── categories/
│   ├── icons/
│   │   ├── navigation-systems.svg
│   │   ├── communication-equipment.svg
│   │   ├── propulsion-systems.svg
│   │   └── [category-slug].svg
│   └── placeholders/
│       └── category-default.svg
├── partners/
│   ├── logos/
│   │   ├── raymarine-teledyne-flir.png
│   │   ├── furuno-electric.jpg
│   │   └── [partner-slug].[ext]
│   ├── images/
│   │   ├── raymarine-teledyne-flir-overview.jpg
│   │   └── [partner-slug]-overview.[ext]
│   └── placeholders/
│       ├── logo-placeholder.png
│       └── company-placeholder.jpg
├── products/
│   ├── [product-slug]/
│   │   ├── main.jpg (primary product image)
│   │   ├── gallery-01.jpg
│   │   ├── gallery-02.jpg
│   │   ├── gallery-03.jpg
│   │   └── gallery-[nn].jpg
│   ├── placeholders/
│   │   ├── product-main.jpg
│   │   └── product-gallery.jpg
│   └── optimized/
│       └── [auto-generated thumbnails]
├── blog/
│   ├── posts/
│   │   ├── [post-slug]-hero.jpg
│   │   ├── [post-slug]-social.jpg
│   │   └── [post-slug]-inline-[n].jpg
│   └── placeholders/
│       ├── blog-hero.jpg
│       └── blog-social.jpg
├── team/
│   ├── headshots/
│   │   ├── paul-thames.jpg
│   │   ├── sarah-mitchell.jpg
│   │   └── [member-slug].jpg
│   └── placeholders/
│       └── team-member.jpg
├── company/
│   ├── logos/
│   │   ├── primary.png (main logo)
│   │   ├── white.png (white variant)
│   │   ├── dark.png (dark variant)
│   │   └── icon.png (icon only)
│   ├── social/
│   │   ├── og-default.jpg (1200x630)
│   │   ├── twitter-card.jpg (1200x675)
│   │   └── linkedin-banner.jpg (1584x396)
│   └── about/
│       ├── office-exterior.jpg
│       ├── team-group.jpg
│       └── facility-interior.jpg
└── system/
    ├── placeholders/
    │   ├── image-placeholder.svg
    │   ├── avatar-placeholder.svg
    │   └── logo-placeholder.svg
    └── optimized/
        └── [auto-generated sizes]
```

### File Naming Conventions

#### Standard Naming Pattern
```
[content-type]/[subcategory]/[identifier]-[variant].[ext]

Examples:
- partners/logos/raymarine-teledyne-flir.png
- products/axiom-multifunction-display/main.jpg
- products/axiom-multifunction-display/gallery-01.jpg
- blog/posts/ai-driven-automation-hero.jpg
- team/headshots/paul-thames.jpg
```

#### Variant Suffixes
- `-main`: Primary/hero image
- `-logo`: Logo variant
- `-hero`: Hero/featured image
- `-social`: Social media optimized
- `-gallery-[nn]`: Gallery images with sequence
- `-thumb`: Thumbnail variant
- `-placeholder`: Fallback image

---

## 🔄 Migration Process Design

### Phase 1: Media Inventory & Analysis

#### Step 1: Audit Current Media
```bash
#!/bin/bash
# Media inventory script

echo "=== STRAPI MEDIA INVENTORY ==="
echo "Scanning uploads directory..."

find strapi-cms/public/uploads -type f -name "*.jpg" -o -name "*.png" -o -name "*.gif" -o -name "*.svg" | 
while read file; do
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    echo "$(basename "$file") | $(($size/1024))KB | $(file -b "$file")"
done > media-inventory.txt

echo "Inventory saved to media-inventory.txt"
```

#### Step 2: Categorize by Content Type
```typescript
interface MediaItem {
  originalPath: string;
  filename: string;
  size: number;
  type: string;
  contentType: 'partner' | 'product' | 'blog' | 'team' | 'company' | 'category';
  contentId: string;
  variant: 'main' | 'logo' | 'gallery' | 'hero' | 'social' | 'thumbnail';
  targetPath: string;
}

async function categorizeMedia(): Promise<MediaItem[]> {
  // Analyze media files and map to content types
  // This will be based on Strapi API data relationships
}
```

### Phase 2: Media Processing & Optimization

#### Step 1: Download & Organize
```typescript
async function downloadStrapiMedia() {
  const mediaItems = await categorizeMedia();
  
  for (const item of mediaItems) {
    try {
      // Download from Strapi
      const response = await fetch(`http://localhost:1337${item.originalPath}`);
      const buffer = await response.arrayBuffer();
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(item.targetPath), { recursive: true });
      
      // Save to target location
      await fs.writeFile(item.targetPath, Buffer.from(buffer));
      
      console.log(`✅ Migrated: ${item.filename} → ${item.targetPath}`);
    } catch (error) {
      console.error(`❌ Failed: ${item.filename}`, error);
    }
  }
}
```

#### Step 2: Image Optimization
```typescript
import sharp from 'sharp';

async function optimizeImages() {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  // Process each image directory
  const directories = [
    'public/media/partners/logos',
    'public/media/products',
    'public/media/blog/posts',
    'public/media/team/headshots',
    'public/media/company'
  ];
  
  for (const dir of directories) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      if (file.isFile() && imageExtensions.includes(path.extname(file.name))) {
        await optimizeImage(path.join(dir, file.name));
      }
    }
  }
}

async function optimizeImage(imagePath: string) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  
  // Generate optimized sizes
  const sizes = [
    { suffix: '-thumb', width: 150, height: 150 },
    { suffix: '-small', width: 400, height: 300 },
    { suffix: '-medium', width: 800, height: 600 },
    { suffix: '-large', width: 1200, height: 900 }
  ];
  
  for (const size of sizes) {
    const outputPath = imagePath.replace(
      path.extname(imagePath),
      `${size.suffix}${path.extname(imagePath)}`
    );
    
    await image
      .resize(size.width, size.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
  }
}
```

### Phase 3: Path Transformation

#### Content File Updates
```typescript
async function updateContentPaths() {
  // Update all markdown files with new media paths
  const contentDirs = [
    'content/partners',
    'content/products', 
    'content/blog/posts',
    'content/team',
    'content/company'
  ];
  
  for (const dir of contentDirs) {
    const files = await glob(`${dir}/*.md`);
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf-8');
      
      // Transform Strapi URLs to local paths
      content = content.replace(
        /http:\/\/localhost:1337\/uploads\/[^"'\s]+/g,
        (match) => transformStrapiUrl(match)
      );
      
      // Transform placeholder URLs to local paths
      content = content.replace(
        /\/api\/placeholder\/[^"'\s]+/g,
        (match) => transformPlaceholderUrl(match)
      );
      
      await fs.writeFile(file, content);
    }
  }
}

function transformStrapiUrl(strapiUrl: string): string {
  // Extract filename and map to new structure
  const filename = strapiUrl.split('/').pop();
  // Logic to determine content type and map to new path
  return `/media/[content-type]/[filename]`;
}
```

---

## 🖼️ TinaCMS Media Configuration

### Media Settings in `tina/config.ts`
```typescript
export default defineConfig({
  // ... other config
  
  media: {
    tina: {
      mediaRoot: "public/media",
      publicFolder: "public",
      // Enable different media types
      accept: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    },
  },
  
  // Custom media organization
  schema: {
    collections: [
      {
        name: "partner",
        // ... other fields
        fields: [
          {
            type: "image",
            name: "logo",
            label: "Company Logo",
            // Organize uploads by content type
            ui: {
              filename: {
                readonly: false,
                slugify: (values) => {
                  return `partners/logos/${values.slug || 'partner'}`;
                },
              },
            },
          },
        ],
      },
    ],
  },
});
```

### Custom Media Upload Organization
```typescript
// Custom media organization by content type
const mediaConfig = {
  partners: {
    logos: { path: 'partners/logos', maxSize: '2MB', formats: ['png', 'jpg', 'svg'] },
    images: { path: 'partners/images', maxSize: '5MB', formats: ['jpg', 'png', 'webp'] }
  },
  products: {
    main: { path: 'products/{slug}', maxSize: '5MB', formats: ['jpg', 'png', 'webp'] },
    gallery: { path: 'products/{slug}', maxSize: '3MB', formats: ['jpg', 'png', 'webp'] }
  },
  blog: {
    heroes: { path: 'blog/posts', maxSize: '3MB', formats: ['jpg', 'png', 'webp'] },
    inline: { path: 'blog/posts', maxSize: '2MB', formats: ['jpg', 'png', 'gif'] }
  }
};
```

---

## 🔧 Placeholder System Migration

### Current Placeholder System
The project currently uses a sophisticated placeholder system with Strapi-style URLs:
```
/api/placeholder/400/300?text=Company+Name
```

### New TinaCMS Placeholder System
```
public/media/system/placeholders/
├── image-placeholder.svg (generic image placeholder)
├── logo-placeholder.svg (company logo placeholder)
├── avatar-placeholder.svg (team member placeholder)
├── product-placeholder.jpg (product image placeholder)
└── hero-placeholder.jpg (blog hero placeholder)
```

### Placeholder Implementation
```typescript
// utils/media.ts
export function getMediaUrl(mediaPath?: string, fallbackType?: string): string {
  if (mediaPath && mediaPath.startsWith('/media/')) {
    return mediaPath;
  }
  
  // Return appropriate placeholder
  const placeholders = {
    logo: '/media/system/placeholders/logo-placeholder.svg',
    avatar: '/media/system/placeholders/avatar-placeholder.svg', 
    product: '/media/system/placeholders/product-placeholder.jpg',
    hero: '/media/system/placeholders/hero-placeholder.jpg',
    default: '/media/system/placeholders/image-placeholder.svg'
  };
  
  return placeholders[fallbackType] || placeholders.default;
}

// Usage in components
const logoUrl = getMediaUrl(partner.logo, 'logo');
const avatarUrl = getMediaUrl(teamMember.image, 'avatar');
```

---

## ⚡ Performance Optimization

### Image Optimization Strategy

#### 1. Multiple Format Support
```typescript
// Next.js Image component with multiple formats
import Image from 'next/image';

const OptimizedImage = ({ src, alt, width, height, ...props }) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    formats={['webp', 'avif', 'jpg']}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    {...props}
  />
);
```

#### 2. Responsive Images
```typescript
// Responsive image configuration
const responsiveImageSizes = {
  product: {
    mobile: { width: 300, height: 200 },
    tablet: { width: 500, height: 350 },
    desktop: { width: 800, height: 600 }
  },
  hero: {
    mobile: { width: 375, height: 250 },
    tablet: { width: 768, height: 400 },
    desktop: { width: 1200, height: 600 }
  }
};
```

#### 3. Lazy Loading Strategy
```typescript
// Implement progressive loading for image galleries
const ProductGallery = ({ images }) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="aspect-square relative">
          <Image
            src={image.url}
            alt={image.alt_text}
            fill
            className="object-cover rounded-lg"
            loading={index < 3 ? 'eager' : 'lazy'} // Load first 3 eagerly
            onLoad={() => setLoadedImages(prev => new Set([...prev, image.id]))}
          />
        </div>
      ))}
    </div>
  );
};
```

---

## 📊 Migration Timeline & Checklist

### Week 1: Analysis & Setup
- [ ] **Day 1**: Complete media inventory and analysis
- [ ] **Day 2**: Design target directory structure
- [ ] **Day 3**: Set up media migration scripts
- [ ] **Day 4**: Test migration with sample content
- [ ] **Day 5**: Configure TinaCMS media settings

### Week 2: Migration Execution
- [ ] **Day 1**: Execute full media download from Strapi
- [ ] **Day 2**: Organize files in new directory structure
- [ ] **Day 3**: Optimize and resize images
- [ ] **Day 4**: Update content file references
- [ ] **Day 5**: Implement placeholder system

### Week 3: Integration & Testing
- [ ] **Day 1**: Update Next.js components for new media paths
- [ ] **Day 2**: Test image loading and optimization
- [ ] **Day 3**: Validate all media references work
- [ ] **Day 4**: Performance testing and optimization
- [ ] **Day 5**: Documentation and cleanup

---

## 🎯 Validation & Quality Assurance

### Automated Validation Scripts

#### 1. Media Reference Validation
```typescript
async function validateMediaReferences() {
  const contentFiles = await glob('content/**/*.md');
  const brokenReferences = [];
  
  for (const file of contentFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const mediaReferences = content.match(/\/media\/[^"'\s]+/g) || [];
    
    for (const ref of mediaReferences) {
      const fullPath = path.join('public', ref);
      if (!await fs.pathExists(fullPath)) {
        brokenReferences.push({ file, reference: ref });
      }
    }
  }
  
  return brokenReferences;
}
```

#### 2. Image Optimization Validation
```typescript
async function validateImageOptimization() {
  const images = await glob('public/media/**/*.{jpg,jpeg,png}');
  const issues = [];
  
  for (const imagePath of images) {
    const metadata = await sharp(imagePath).metadata();
    
    // Check file size
    const stats = await fs.stat(imagePath);
    if (stats.size > 2 * 1024 * 1024) { // 2MB limit
      issues.push({ path: imagePath, issue: 'File too large', size: stats.size });
    }
    
    // Check dimensions
    if (metadata.width > 1920 || metadata.height > 1080) {
      issues.push({ path: imagePath, issue: 'Resolution too high', dimensions: `${metadata.width}x${metadata.height}` });
    }
  }
  
  return issues;
}
```

### Manual Validation Checklist
- [ ] All partner logos display correctly
- [ ] Product image galleries function properly
- [ ] Blog post hero images load correctly
- [ ] Team member photos display properly
- [ ] Company logo variants work across themes
- [ ] Placeholder system functions for missing images
- [ ] Image optimization reduces file sizes appropriately
- [ ] Responsive images work across device sizes
- [ ] SEO meta images generate correctly

---

## 🔮 Future Enhancements

### Phase 1: Basic Migration (Immediate)
- Local media storage with organized structure
- Optimized image pipeline
- Placeholder system
- Basic responsive images

### Phase 2: Enhanced Features (Month 2)
- **Tina Cloud Media**: Upgrade to cloud-hosted media
- **CDN Integration**: Implement media CDN for performance
- **Advanced Optimization**: WebP/AVIF format support
- **Media Management**: Admin interface for media organization

### Phase 3: Advanced Features (Month 3)
- **AI-Powered Alt Text**: Automatic alt text generation
- **Smart Cropping**: AI-assisted image cropping
- **Media Analytics**: Track media usage and performance
- **Bulk Operations**: Batch media processing tools

---

## 📈 Success Metrics

### Technical Metrics
- [ ] **Migration Completeness**: 100% of media files successfully migrated
- [ ] **File Size Reduction**: 30-50% reduction in total media size
- [ ] **Load Time Improvement**: 20%+ faster image loading
- [ ] **Format Coverage**: Support for WebP, AVIF, and fallbacks
- [ ] **Zero Broken References**: All media links functional

### User Experience Metrics
- [ ] **Visual Quality**: No degradation in image quality
- [ ] **Loading Experience**: Smooth progressive loading
- [ ] **Mobile Performance**: Optimized for mobile devices
- [ ] **Admin Experience**: Easy media management in TinaCMS
- [ ] **SEO Performance**: Proper image optimization for search engines

### Business Metrics
- [ ] **Infrastructure Cost**: Reduced hosting costs for media
- [ ] **Build Time**: Faster build processes
- [ ] **Maintenance**: Reduced complexity of media management
- [ ] **Scalability**: Better handling of growing media library
- [ ] **Developer Experience**: Simplified media workflow

---

This comprehensive media migration strategy ensures a smooth transition from Strapi's database-driven media system to TinaCMS's file-based approach while maintaining and improving performance, organization, and user experience.

---

**Status**: ✅ **Media Migration Strategy Complete**  
**Ready for**: Implementation in Milestone 3 - Data Migration  
**Estimated Media Count**: ~221 files across 7 content types