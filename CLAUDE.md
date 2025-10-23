# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start Next.js development server
- `npm run dev:clean` - Clean up any existing dev servers and start fresh
- `npm run stop:dev` - Stop all running dev servers (cleans up background processes)
- `npm run build` - Build the static site for production
- `npm run start` - Serve production build locally
- `npm run lint` - Run ESLint code quality checks
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI

### Production/Deployment
- `npm run build:netlify` - Build static site for Netlify deployment (with export mode)
- `npm run build:analyze` - Build with bundle size analysis

### Migration (Legacy)
- `npm run migrate` - Migrate content from TinaCMS to Payload CMS
- `npm run migrate:dry-run` - Preview migration without making changes
- `npm run migrate:verbose` - Run migration with detailed logging

## Architecture Overview

This is a **static superyacht technology showcase website** built with Next.js 14 (App Router) and powered by Payload CMS for content management.

### Core Architecture Patterns

**Data Flow Architecture:**
- **Payload CMS** manages all content with a SQLite database backend (development), with preparation for PostgreSQL migration (production)
- **PayloadCMSDataService** (`lib/payload-cms-data-service.ts`) provides unified data access layer with caching
- **Static Site Generation** pre-builds all pages at build time for optimal performance
- **Reference Resolution** automatically resolves relationships between content types (products → vendors, vendors → categories, etc.)

**Content Architecture:**
- `vendors` collection - Vendor/partner companies (unified data model)
- `products` collection - Product catalog with vendor relationships
- `categories` collection - Product and content categorization
- `blog` collection - Blog posts and categories
- `team` collection - Team member profiles
- `company` collection - Company information

**Key Architectural Decisions:**
- **Vendor-Partner Unification**: The system uses a unified `Vendor` model with a `partner` boolean flag to distinguish between partners (true) and suppliers (false), while maintaining backward compatibility with legacy `Partner` interfaces
- **Relational Database**: Payload CMS uses SQLite for development with proper relationships between collections, with preparations for PostgreSQL migration for production if needed
- **Caching Strategy**: In-memory cache for CMS data to optimize build performance
- **Static-First**: All pages are statically generated with no client-side data fetching

### Component Organization

**App Structure (Next.js App Router):**
- `app/` - Next.js App Router pages and layouts
- `app/[entity]/page.tsx` - Static list pages (vendors, products, blog)
- `app/[entity]/[slug]/page.tsx` - Dynamic detail pages
- `app/components/` - Page-level components
- `components/` - Shared UI components (including shadcn/ui components)

**Data Service Pattern:**
- `lib/payload-cms-data-service.ts` - Main data access layer
- `lib/types.ts` - TypeScript definitions for all data models
- `payload.config.ts` - Payload CMS schema configuration

### Important Implementation Details

**Media Handling:**
The data service automatically handles media paths and transformations. When working with images, use the URLs provided by the data service.

**Legacy Compatibility:**
The codebase maintains backward compatibility by providing both `Vendor` and `Partner` interfaces. When adding new features:
- Use `Vendor` methods for new functionality
- Maintain `Partner` methods for existing integrations
- Both `vendorId`/`partnerId` and `vendorName`/`partnerName` are populated in products

**Static Generation Requirements:**
All data must be available at build time. The data service validates content integrity during builds and will fail if references are broken or required content is missing.

## Development Guidelines

### Working with Content
- Content is managed through Payload CMS admin interface at `/admin`
- All content is stored in SQLite database for development
- Use the data service methods to access content in your application code

### Adding New Content Types
1. Define collection schema in `payload.config.ts`
2. Add TypeScript interface in `lib/types.ts`
3. Implement transform method in `PayloadCMSDataService`
4. Add data fetching methods following existing patterns
5. Create corresponding pages in `app/` directory

### Performance Considerations
- The data service uses caching to optimize performance
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

- `lib/payload-cms-data-service.ts` - Core data access layer and business logic
- `payload.config.ts` - Content schema and field definitions
- `app/layout.tsx` - Root layout with theme provider and global styles
- `lib/types.ts` - Complete TypeScript definitions
- `next.config.js` - Build configuration and URL redirects

## Testing and Validation

Always run these checks before committing:
1. `npm run type-check` - Ensure TypeScript compliance
2. `npm run lint` - Code quality validation
3. `npm run build` - Verify static build succeeds
4. `npm run test` - Run unit tests
5. `npm run test:e2e` - Run end-to-end tests (when applicable)

The build process includes automatic content validation that will fail if CMS content has integrity issues.
