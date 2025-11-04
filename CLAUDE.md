# CLAUDE.md - Paul Thames Superyacht Technology

**Note**: This project uses [Agent OS Framework](.agent-os/CLAUDE.md) for development automation and [bd (beads)](https://github.com/steveyegge/beads) for issue tracking. See [AGENTS.md](AGENTS.md) for workflow details.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- SQLite development tools (optional)

### First-Time Setup
```bash
# Clone and install
git clone [repo]
cd ptnextjs
npm install

# Initial setup (Agent OS handles framework initialization)
npm run migrate:dry-run  # Preview content migration
npm run migrate          # Run migration if needed
npm run dev              # Start development

# Access points
# Frontend: http://localhost:3000
# CMS Admin: http://localhost:3000/admin
```

### Verify Setup
```bash
npm run type-check  # TypeScript validation
npm run lint         # Code quality
npm run build        # Build verification
```

## Project-Specific Commands

### Development Workflow
- `npm run dev` - Start Next.js development server
- `npm run dev:clean` - Clean up any existing dev servers and start fresh
- `npm run stop:dev` - Stop all running dev servers (cleans up background processes)
- `npm run build` - Build the static site for production
- `npm run start` - Serve production build locally

### Testing (Integrates with Agent OS TDD Guard)
- `npm run test` - Run Jest unit tests (Agent OS enforces test-first)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report (Agent OS tracks metrics)
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI

### Production/Deployment
- `npm run build:netlify` - Build static site for Netlify deployment (with export mode)
- `npm run build:analyze` - Build with bundle size analysis

### Migration & Content
- `npm run migrate` - Content migration from TinaCMS to Payload CMS
- `npm run migrate:dry-run` - Preview migration without making changes
- `npm run migrate:verbose` - Run migration with detailed logging

## Agent OS Integration

### TDD Guard System
This project leverages Agent OS TDD enforcement:
- **Current Level**: Standard (warns but allows implementation)
- **Configuration**: `.agent-os/config.yml`
- **Test-First Workflow**: Automatically enforced by Agent OS
- **Coverage Targets**: 85% minimum (tracked by Agent OS)

### Quality Automation
- **Pre-commit hooks**: Automatic linting and formatting
- **Multi-agent reviews**: Security, performance, architecture validation
- **Content validation**: Integrated into build process
- **Performance monitoring**: Real-time Agent OS metrics

### Issue Management
- **Primary**: Use `bd` commands for issue tracking
- **Auto-sync**: Issues sync with Agent OS task management
- **Dependency mapping**: Automatic dependency detection

## Project Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Payload CMS with SQLite (dev) / PostgreSQL (prod)
- **UI**: shadcn/ui components + Tailwind CSS
- **Testing**: Jest + Playwright (Agent OS integrated)
- **Static Generation**: All pages pre-built at build time

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

**Multi-Location Support:**
The platform features comprehensive multi-location support for vendors with tier-based access control:
- **Vendor Locations**: Vendors can manage multiple physical locations (offices, showrooms, service centers)
- **Tier-Based Limits**: Location count restricted by vendor tier (Tier 1: 1 location, Tier 2: 5, Tier 3: 10, Tier 4: unlimited)
- **Headquarters Designation**: Each vendor can designate one location as their headquarters
- **Geocoding**: Automatic address-to-coordinate conversion via Photon API (OpenStreetMap)
- **Map Visualization**: Interactive Leaflet maps display vendor locations on public profiles
- **Location Search**: Public users can search vendors by location with radius filtering
- **Dashboard Management**: Vendors manage locations via LocationsManagerCard in dashboard

**Key Components:**
- `components/dashboard/LocationsManagerCard.tsx` - Location CRUD interface for vendor dashboard
- `components/dashboard/LocationFormFields.tsx` - Reusable form fields with geocoding
- `components/vendors/LocationsDisplaySection.tsx` - Public-facing location display with map
- `components/LocationSearchFilter.tsx` - Location-based vendor search with radius filtering
- `hooks/useTierAccess.ts` - Tier-based feature access control
- `lib/services/LocationService.ts` - Server-side location management and validation
- `app/api/geocode/route.ts` - Geocoding API endpoint with rate limiting

**Database Schema:**
Vendor locations are stored in the `vendor_locations` table with these key fields:
- `name`, `address`, `city`, `state`, `postalCode`, `country` - Location details
- `latitude`, `longitude` - Geocoded coordinates
- `isHQ` - Headquarters flag (only one per vendor)
- `vendorId` - Foreign key to vendors collection

**API Endpoints:**
- `GET/POST/PUT/DELETE /api/portal/vendors/[id]` - Location management endpoints
- `POST /api/geocode` - Address geocoding endpoint

## Development Guidelines

### Working with Content
- Content is managed through Payload CMS admin interface at `/admin`
- All content is stored in SQLite database for development
- Use the data service methods to access content in your application code

### Feature Development with Agent OS
1. **Create Issue**: `bd create "Add new feature"`
2. **Plan**: Agent OS multi-agent system analyzes requirements
3. **TDD Cycle**: Write tests first (Agent OS enforces)
4. **Implementation**: Agent OS provides real-time validation
5. **Review**: Automatic multi-agent code reviews
6. **Integration**: Automated testing and validation

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

## Testing & Quality Assurance

### Agent OS TDD Workflow
```bash
# Agent OS automatically handles these:
npm run test              # Unit tests with TDD validation
npm run test:e2e           # E2E tests
npm run build              # Build with content validation
```

### Quality Gates (Agent OS Enforced)
- **TypeScript compliance**: Automatic type checking
- **Code quality**: ESLint + Agent OS quality agents
- **Security**: Agent OS security sentinel scans
- **Performance**: Agent OS performance oracle analysis

### Pre-Commit Checklist (Agent OS)
Agent OS automatically validates:
- [ ] Tests pass (TDD guard)
- [ ] Type checking passes
- [ ] Code quality standards
- [ ] Security scan results
- [ ] Build succeeds
- [ ] Content integrity validated

## Deployment & Production

### Build Process
```bash
npm run build:netlify      # Static export for Netlify
npm run build:analyze      # Bundle size analysis
```

### Production Considerations
- All pages are statically exported for maximum performance
- Database migration to PostgreSQL for production environments
- Environment-specific configurations
- Content validation during build process

## Troubleshooting (Project-Specific)

### Common Issues
```bash
# Agent OS handles framework issues automatically
# Focus on project-specific problems:

npm run stop:dev           # Clean development restart
npm run migrate:verbose    # Debug content migration
npm run build              # Verify static generation
```

### Content Management
- Access CMS at `/admin` for content issues
- Use Payload CMS admin interface
- Validate content integrity during build

### Development Server Issues
```bash
npm run stop:dev          # Clean server restart
npm run dev:clean         # Fresh start
```

## Key Files (Project-Specific)

- `lib/payload-cms-data-service.ts` - Core data access layer
- `payload.config.ts` - Content schema and field definitions
- `app/layout.tsx` - Root layout with theme provider
- `lib/types.ts` - TypeScript definitions
- `.agent-os/config.yml` - Agent OS configuration

## References

### Framework Documentation
- [Agent OS Framework](.agent-os/CLAUDE.md) - Meta-framework capabilities
- [AGENTS.md](AGENTS.md) - Agent-specific workflows
- [Agent OS Commands](.agent-os/commands/) - Framework commands

### Project Documentation
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com)
