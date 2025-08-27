# Paul Thames Superyacht Technology

A modern, high-performance Next.js application powered by TinaCMS for content management and static site generation.

## Overview

This is a fully static superyacht technology showcase website featuring:
- **Static Site Generation**: Pre-built pages for optimal performance
- **TinaCMS Integration**: Git-based content management 
- **Premium Design**: Modern UI with smooth animations
- **SEO Optimized**: Server-side rendering with meta tags
- **Mobile Responsive**: Tailored for all device sizes

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development

**Standard Development:**
```bash
npm run dev
```
- App runs on http://localhost:3000 (or next available port)
- Uses TinaCMS for content management
- Static content editing by modifying files in `content/` directory

**Development with TinaCMS Admin Interface:**
```bash
npm run dev:tinacms
```
- App runs on http://localhost:3001 (or next available port)  
- TinaCMS admin interface available at `/admin`
- Live content editing with visual interface
- GraphQL API available at http://localhost:4001/graphql

### 3. Production Build
```bash
npm run build
npm start
```

## Content Management

### TinaCMS Integration
- **Content Storage**: Git-based content in `content/` directory
- **Schema Configuration**: Defined in `tina/config.ts`
- **Admin Interface**: Available at `/admin` when TinaCMS Cloud is configured
- **Local Development**: Content can be edited directly in markdown files

### Content Structure
```
content/
├── partners/          # Partner companies
├── products/          # Product catalog
├── categories/        # Product categories
├── tags/             # Product tags
└── blog/             # Blog posts and categories
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run dev:tinacms` - Start with TinaCMS development server

### Build & Deploy
- `npm run build` - Build optimized static site
- `npm start` - Serve production build locally
- `npm run validate-tinacms` - Validate TinaCMS content structure

### Maintenance
- `npm run lint` - Run ESLint code quality checks
- `npm run type-check` - Run TypeScript type checking

## Tech Stack

### Core Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TinaCMS** - Git-based headless CMS
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components

### Key Features
- **Static Site Generation**: All pages pre-built for maximum performance
- **Image Optimization**: Automatic WebP conversion and responsive images
- **SEO Optimization**: Meta tags, structured data, and sitemap generation
- **Performance**: Lazy loading, code splitting, and caching strategies
- **Accessibility**: WCAG compliant with proper ARIA labels

## Project Structure

```
app/                   # Next.js App Router pages
├── components/        # Reusable React components
├── globals.css       # Global styles
└── layout.tsx        # Root layout

components/           # Shared UI components
├── ui/              # shadcn/ui components
└── ...              # Custom components

content/             # TinaCMS content files
├── partners/        # Partner markdown files
├── products/        # Product markdown files
└── ...

lib/                 # Utility functions and services
├── tinacms-data-service.ts  # TinaCMS data fetching
├── static-data-service.ts   # Data service wrapper
├── types.ts                 # TypeScript definitions
└── utils.ts                # Helper functions

tina/                # TinaCMS configuration
└── config.ts        # Schema and field definitions

public/              # Static assets
├── media/          # Content images and files
└── ...
```

## Deployment

### Static Hosting (Recommended)
Deploy to any static hosting provider:
- **Vercel**: Automatic deployments from Git
- **Netlify**: Git-based continuous deployment
- **AWS S3 + CloudFront**: Cost-effective static hosting
- **GitHub Pages**: Free hosting for public repositories

### Build Output
The `npm run build` command generates:
- Static HTML files for all pages
- Optimized JavaScript bundles
- Compressed CSS and assets
- SEO-friendly meta tags and sitemaps

## Content Editing

### Local Development
1. Edit markdown files directly in the `content/` directory
2. Changes are automatically reflected in development
3. Commit changes to Git for deployment

### TinaCMS Cloud (Optional)
1. Set up TinaCMS Cloud account
2. Configure environment variables
3. Access visual editor at `/admin`
4. Changes are committed directly to Git

## Performance

### Lighthouse Scores (Target)
- **Performance**: 95+ (Static generation + optimized assets)
- **Accessibility**: 100 (WCAG compliant components)
- **Best Practices**: 100 (Security headers + modern standards)
- **SEO**: 100 (Meta tags + structured data)

### Optimization Features
- Static site generation for all pages
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- CSS optimization with Tailwind CSS
- Font optimization with next/font

## Environment Variables

For TinaCMS Cloud integration:
```bash
# TinaCMS Cloud Configuration
NEXT_PUBLIC_TINA_CLIENT_ID=your_client_id
TINA_TOKEN=your_token
NEXT_PUBLIC_TINA_BRANCH=main
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass: `npm run build`
5. Submit a pull request

## License

Copyright © 2024 Paul Thames Superyacht Technology. All rights reserved.