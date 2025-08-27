# Strapi Integration Documentation

## Overview

The Paul Thames website includes a robust Strapi-compatible integration serving as the primary content management system. The integration features automated data transformation, comprehensive image placeholder systems, and production-ready static generation capabilities with direct CMS dependency.

## 🏗️ Architecture

```
┌─────────────────┐    HTTP API    ┌─────────────────┐    JSON Data    ┌─────────────────┐
│   Next.js App   │ ────────────▶ │ Strapi Server   │ ────────────▶   │ Research Data   │
│   (Port 3000)   │               │ (Port 1337)     │                 │     (JSON)      │
└─────────────────┘               └─────────────────┘                 └─────────────────┘
         │                                   │                                   │
         │                                   │                                   │
         │                                   │                                   │
    Direct Integration               API Endpoints                      Source Data
 (strapi-client.ts)               (/api/categories,             (superyacht_technology_
                                  /api/partners, etc.)                research.json)
```

## 🗂️ Content Types

The Strapi integration includes these content types with full relational mapping:

| Content Type | Endpoint | Count | Relations |
|-------------|----------|--------|-----------|
| Categories | `/api/categories` | 11 | → Partners, Products |
| Partners | `/api/partners` | 18 | ← Categories, → Products, Tags |
| Products | `/api/products` | 36 | ← Partners, Categories, Tags |
| Blog Posts | `/api/blog-posts` | 8 | ← Tags |
| Team Members | `/api/team-members` | 4 | None |
| Company Info | `/api/company-info` | 1 | None (Single Type) |

## 🔄 Data Flow

1. **Source Data**: `superyacht_technology_research.json` contains the complete dataset (moved to root)
2. **Strapi Server**: `strapi-server-complete.js` transforms and serves data via REST API
3. **Next.js Client**: Uses `lib/strapi-client.ts` to fetch data during build time
4. **Static Generation**: `lib/static-data-service.ts` provides build-time data processing
5. **Image Placeholder System**: Comprehensive image placeholder generation with Strapi-style URLs

## 🚀 Quick Start

### Start Development Environment
```bash
# Start both Strapi and Next.js servers
./scripts/dev-with-strapi.sh
```

### Start Strapi Only
```bash
# Start just the Strapi server
./scripts/start-strapi.sh
```

### Static Build (Production)
```bash
# Build static version without CMS dependency
npm run build:static

# Deploy to various platforms
npm run deploy:netlify
npm run deploy:vercel
npm run deploy:s3
```

### Manual Start
```bash
# Terminal 1: Start Strapi server
node strapi-server-complete.js

# Terminal 2: Start Next.js (in another terminal)
npm run dev
```

## 🛠️ Configuration

### Environment Variables (.env)
```bash
# Strapi CMS Configuration
STRAPI_API_URL=http://localhost:1337/api
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api

# Build Configuration
NEXT_OUTPUT_MODE=export  # For static builds
NEXT_DIST_DIR=.next      # Build output directory
```

### Server Configuration
- **Strapi Server**: Runs on `localhost:1337`
- **Next.js Dev**: Runs on `localhost:3000` 
- **Data Source**: `superyacht_technology_research.json` (root directory)
- **Routing**: Slug-based URLs for partners (`/partners/[slug]`)
- **SEO**: 301 redirects from old ID-based URLs to slug-based URLs

## 📊 API Endpoints

All endpoints follow Strapi v4 format with full pagination and filtering support:

### Categories
```bash
GET /api/categories
# Returns: 11 technology categories with slugs and descriptions
```

### Partners
```bash
GET /api/partners
GET /api/partners/:id
# Supports filtering: ?filters[featured][$eq]=true
# Supports search: ?filters[$or][0][name][$containsi]=raymarine
```

### Products
```bash
GET /api/products
GET /api/products/:id
# Supports filtering by partner: ?filters[partner][id][$eq]=partner-1
# Supports filtering by category: ?filters[category][name][$eq]=Navigation%20Systems
```

### Blog Posts
```bash
GET /api/blog-posts
# Supports filtering: ?filters[featured][$eq]=true
# Supports filtering by slug: ?filters[slug][$eq]=ai-driven-automation
```

### Team Members & Company Info
```bash
GET /api/team-members
GET /api/company-info
```

## 📁 Current App Structure

The application follows Next.js 13+ App Router structure:

```
app/
├── components/                    # Shared UI components
│   ├── ui/                       # Shadcn/ui components
│   ├── hero-section.tsx
│   ├── featured-partners-section.tsx
│   ├── featured-blog-section.tsx
│   ├── footer.tsx
│   └── ...
├── partners/
│   ├── [slug]/                   # Dynamic partner pages
│   │   ├── page.tsx             # Partner detail page
│   │   └── _components/         # Partner-specific components
│   ├── partners-server.tsx      # Server-side data fetching
│   └── page.tsx                 # Partners listing
├── products/
│   ├── [id]/                    # Dynamic product pages
│   │   └── _components/
│   ├── products-server.tsx
│   └── page.tsx
├── blog/
│   ├── [slug]/                  # Dynamic blog posts
│   │   └── _components/
│   └── page.tsx
├── about/page.tsx
├── contact/page.tsx
└── layout.tsx                   # Root layout
```

## 🔍 Data Transformation

The integration automatically transforms the research data into Strapi-compatible format:

```javascript
// Source data (superyacht_technology_research.json)
{
  id: "partner-1",
  name: "Raymarine (Teledyne FLIR)",
  category: "Navigation Systems",
  slug: "raymarine-teledyne-flir-fb"
}

// Strapi API format
{
  id: 1,
  attributes: {
    name: "Raymarine (Teledyne FLIR)",
    slug: "raymarine-teledyne-flir-fb",
    category: {
      data: { attributes: { name: "Navigation Systems" } }
    },
    image: {
      data: {
        attributes: {
          url: "/api/placeholder/400/300?text=Raymarine"
        }
      }
    }
  },
  createdAt: "2025-08-24T07:51:37.984Z",
  updatedAt: "2025-08-24T07:51:37.984Z",
  publishedAt: "2025-08-24T07:51:37.984Z"
}
```

## 🧪 Testing the Integration

### Health Check
```bash
curl http://localhost:1337/api/health
# Returns: {"status":"ok","timestamp":"2025-08-23T07:51:37.984Z"}
```

### Test Data Retrieval
```bash
# Test categories
curl http://localhost:1337/api/categories | head -100

# Test partners
curl http://localhost:1337/api/partners | head -100

# Test integration with Next.js
curl http://localhost:3000/ | grep "Raymarine"
```

### Verify Build Integration
```bash
# Build with Strapi integration (dynamic)
npm run build

# Build static version (no CMS dependency)
npm run build:static

# The build output should show dynamic routes for:
# ● /partners/[slug] (18 partners) - now using slugs instead of IDs
# ● /products/[id] (36 products) 
# ● /blog/[slug] (8 blog posts)

# Validate CMS integration before build
npm run validate-cms
```

## 🔧 Troubleshooting

### Server Won't Start
1. Check if port 1337 is available: `lsof -i :1337`
2. Verify data file exists: `superyacht_technology_research.json` (in root)
3. Check Node.js version (requires 18+)
4. Try killing existing processes: `pkill -f "strapi-server-complete.js"`

### No Data Showing
1. Verify Strapi server is running: `curl http://localhost:1337/api/health`
2. Check environment variables in `.env`
3. Verify data source file exists: `superyacht_technology_research.json`

### Build Issues
1. Ensure Strapi server is running during `npm run build`
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Verify CMS validation passes: `npm run validate-cms`
4. For static builds, use `npm run build:static`

## 📈 Performance

- **Static Generation**: All pages pre-built at build time with ISR support
- **Image Placeholders**: Comprehensive placeholder system for optimal loading
- **Direct CMS Integration**: Direct connection to Strapi API during build
- **Build Time**: ~15 seconds with full Strapi integration
- **Static Export**: Complete static site generation for CDN deployment

## 🔮 Future Enhancements

1. **Real Strapi CMS**: Replace the Express server with actual Strapi CMS
2. **Database Migration**: Move from JSON to PostgreSQL/MySQL
3. **Admin Interface**: Add Strapi admin panel for content editing
4. **Real Media Management**: Replace placeholders with actual image uploads
5. **Content Versioning**: Implement draft/publish workflows
6. **API Caching**: Implement Redis caching for production
7. **CDN Integration**: Direct integration with media CDN services

## 📋 Maintenance

### Updating Content
1. Modify `superyacht_technology_research.json` (root directory)
2. Restart Strapi server: `./scripts/start-strapi.sh`
3. Rebuild Next.js: `npm run build` or `npm run build:static`
4. Validate changes: `npm run validate-cms`

### Monitoring
- Server logs: `tail -f strapi-server.log`
- Health endpoint: `http://localhost:1337/api/health`
- Integration status: Check Next.js build output for dynamic routes

## 🌟 Key Features

### Current Implementation
- ✅ **Slug-based Partner URLs**: SEO-friendly partner pages with 301 redirects
- ✅ **Comprehensive Image Placeholders**: Dynamic placeholder generation
- ✅ **Static Generation Support**: Full static site export capability
- ✅ **App Router Structure**: Modern Next.js 13+ architecture
- ✅ **TypeScript Integration**: Full type safety across the application
- ✅ **Automated Validation**: Pre-build CMS validation (`validate-cms`)
- ✅ **Multiple Deploy Options**: Netlify, Vercel, AWS S3 support

### Data Services
- **`lib/strapi-client.ts`**: Primary Strapi API client
- **`lib/static-data-service.ts`**: Build-time data processing service
- **`lib/data.ts`**: Legacy data utilities (maintained for compatibility)

---

**Status**: ✅ **Production Ready**

The Strapi integration is fully functional and ready for production use. All dynamic pages are successfully generated with slug-based routing, comprehensive image placeholders, and multiple deployment options. The system requires a live Strapi CMS connection for data fetching during build time.