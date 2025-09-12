# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start Next.js development server
- `npm run dev:tinacms` - Start development server with TinaCMS admin interface (accessible at `/admin`)
- `npm run build` - Build the static site for production
- `npm run start` - Serve production build locally
- `npm run lint` - Run ESLint code quality checks
- `npm run type-check` - Run TypeScript type checking

### TinaCMS Specific
- `npm run tina:build` - Build TinaCMS schema and types
- `npm run tina:setup` - Initialize TinaCMS configuration

## Architecture Overview

This is a **static superyacht technology showcase website** built with Next.js 14 (App Router) and powered by TinaCMS for content management.

### Core Architecture Patterns

**Data Flow Architecture:**
- **TinaCMS** manages all content as markdown files in `content/` directory
- **TinaCMSDataService** (`lib/tinacms-data-service.ts`) provides unified data access layer with caching
- **Static Site Generation** pre-builds all pages at build time for optimal performance
- **Reference Resolution** automatically resolves relationships between content types (products → vendors, vendors → categories, etc.)

**Content Architecture:**
- `content/vendors/` - Vendor/partner companies (unified data model)
- `content/products/` - Product catalog with vendor relationships
- `content/categories/` - Product and content categorization
- `content/blog/` - Blog posts and categories
- `content/team/` - Team member profiles
- `content/company/` - Company information

**Key Architectural Decisions:**
- **Vendor-Partner Unification**: The system uses a unified `Vendor` model with a `partner` boolean flag to distinguish between partners (true) and suppliers (false), while maintaining backward compatibility with legacy `Partner` interfaces
- **Reference-based Relationships**: Content relationships use file references (e.g., `vendor: content/vendors/company-name.md`) that are automatically resolved by the data service
- **Caching Strategy**: 5-minute in-memory cache for all CMS data to optimize build performance
- **Static-First**: All pages are statically generated with no client-side data fetching

### Component Organization

**App Structure (Next.js App Router):**
- `app/` - Next.js App Router pages and layouts
- `app/[entity]/page.tsx` - Static list pages (vendors, products, blog)
- `app/[entity]/[slug]/page.tsx` - Dynamic detail pages
- `app/components/` - Page-level components
- `components/` - Shared UI components (including shadcn/ui components)

**Data Service Pattern:**
- `lib/tinacms-data-service.ts` - Main data access layer
- `lib/types.ts` - TypeScript definitions for all data models
- `tina/config.ts` - TinaCMS schema configuration

### Important Implementation Details

**Media Path Transformation:**
The `transformMediaPath()` method in TinaCMSDataService automatically converts TinaCMS media paths to public URLs. When working with images, use the transformed paths from the data service rather than raw TinaCMS paths.

**Legacy Compatibility:**
The codebase maintains backward compatibility by providing both `Vendor` and `Partner` interfaces. When adding new features:
- Use `Vendor` methods for new functionality
- Maintain `Partner` methods for existing integrations
- Both `vendorId`/`partnerId` and `vendorName`/`partnerName` are populated in products

**Static Generation Requirements:**
All data must be available at build time. The data service validates content integrity during builds and will fail if references are broken or required content is missing.

## Development Guidelines

### Working with Content
- Edit markdown files directly in `content/` directories during development
- Use TinaCMS admin interface at `/admin` for visual editing (requires TinaCMS Cloud setup)
- Always validate content with `validateCMSContent()` method before deploying

### Adding New Content Types
1. Define schema in `tina/config.ts`
2. Add TypeScript interface in `lib/types.ts`
3. Implement transform method in `TinaCMSDataService`
4. Add data fetching methods following existing patterns
5. Create corresponding pages in `app/` directory

### Performance Considerations
- The data service uses aggressive caching (5-minute TTL)
- All images use Next.js Image component with optimization
- Static generation eliminates runtime data fetching
- Use `getFeaturedPartners()` for homepage performance (pre-filtered)

### Content Validation
The system includes comprehensive content validation:
- Reference integrity checking
- Duplicate slug detection
- Required content verification
- Orphaned content detection

Run validation during development to catch issues early.

### SEO and Static Export
- All pages are statically exported for maximum performance
- Images are unoptimized for static hosting compatibility
- Trailing slashes are enforced
- Legacy URL redirects are configured in `next.config.js`

## Key Files to Understand

- `lib/tinacms-data-service.ts` - Core data access layer and business logic
- `tina/config.ts` - Content schema and field definitions
- `app/layout.tsx` - Root layout with theme provider and global styles  
- `lib/types.ts` - Complete TypeScript definitions
- `next.config.js` - Build configuration and URL redirects

## Testing and Validation

Always run these checks before committing:
1. `npm run type-check` - Ensure TypeScript compliance
2. `npm run lint` - Code quality validation
3. `npm run build` - Verify static build succeeds

The build process includes automatic content validation that will fail if CMS content has integrity issues.