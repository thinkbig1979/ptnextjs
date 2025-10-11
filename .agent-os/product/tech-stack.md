# Technical Stack

## Core Architecture

- **application_framework**: Next.js 14.2.5 with App Router
- **database_system**: TinaCMS 2.2.5 (Git-based CMS with markdown files) - **Planned Migration to Payload CMS**
- **javascript_framework**: React 18.2.0 with TypeScript 5.2.2
- **import_strategy**: node (ES modules with Next.js)
- **css_framework**: Tailwind CSS 3.3.3
- **ui_component_library**: shadcn/ui with Radix UI primitives
- **fonts_provider**: Google Fonts (Inter)
- **icon_library**: Lucide React 0.446.0
- **theme_management**: next-themes 0.3.0 with advanced detection
- **animation_library**: Framer Motion 12.23.12
- **application_hosting**: Vercel (recommended) or static hosting
- **database_hosting**: Git repository (content as code)
- **asset_hosting**: Next.js static assets / CDN
- **deployment_solution**: Vercel deployment pipeline
- **code_repository_url**: Git-based (GitHub/GitLab)

## Current Implementation Details

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for static site generation
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component system
- **State Management**: React state (no external state management needed)
- **Data Layer**: TinaCMSDataService with 5-minute caching

### Content Management
- **CMS**: TinaCMS for visual content editing (**Migration to Payload CMS planned**)
- **Content Storage**: Markdown files in `/content` directory (will migrate to database-backed)
- **Schema Definition**: TypeScript interfaces with TinaCMS config
- **Media Handling**: Static assets with path transformation
- **Content Validation**: Built-in validation for reference integrity

#### Planned CMS Migration
- **Target CMS**: Payload CMS 3+ (headless CMS with database backend)
- **Development Database**: SQLite (simple setup, file-based)
- **Production Database**: PostgreSQL (scalability, performance)
- **Migration Strategy**: Use Payload CMS migration functions for schema portability between SQLite and PostgreSQL
- **Key Driver**: Enable vendor self-enrollment and profile management
- **Migration Scope**: Convert markdown-based content to database-backed system
- **Additional Capabilities**: User authentication, role-based permissions, API endpoints

### Build and Deployment
- **Build Process**: Static site generation (SSG)
- **Image Optimization**: Next.js Image component (unoptimized for static export)
- **SEO**: Static export with trailing slashes
- **Performance**: Aggressive caching and pre-built static pages

### Development Tools
- **Code Quality**: ESLint 9.24.0 + TypeScript 5.2.2 compiler
- **Package Manager**: npm
- **Development Server**: Next.js dev server with hot reload
- **Content Editing**: TinaCMS admin interface at `/admin`
- **State Management**: Multiple options available (Zustand 5.0.3, Jotai 2.6.0, React state)
- **Form Handling**: React Hook Form 7.53.0 with Zod 3.23.8 validation
- **Data Fetching**: SWR 2.2.4 and TanStack Query 5.0.0
- **Charts & Visualization**: Chart.js 4.4.9, Recharts 2.15.3, Plotly.js 2.35.3

## Planned Technology Additions

### Immediate Next Phase (CMS Migration & Vendor Self-Service)
- **CMS**: Payload CMS 3+ with database backend
- **Authentication**: Built-in Payload CMS 3 authentication system
- **Database (Development)**: SQLite for local development (simple, file-based)
- **Database (Production)**: PostgreSQL for production (scalable, performant)
- **Schema Migrations**: Payload CMS migration functions for database portability
- **Email Services**: SendGrid or Resend for vendor notifications
- **File Storage**: Payload CMS media management or cloud storage

### Future Backend Services
- **Payment Processing**: Stripe for subscription management (post-vendor enrollment)
- **Analytics**: PostHog or Google Analytics 4
- **Advanced Search**: Algolia or integrated PostgreSQL full-text search

### Platform Integration (Future)
- **API Layer**: Next.js API routes for vendor management
- **Search Enhancement**: Algolia or ElasticSearch
- **Lead Tracking**: HubSpot or Salesforce integration
- **File Storage**: AWS S3 or Vercel Blob for uploads
- **Monitoring**: Vercel Analytics + Sentry for error tracking