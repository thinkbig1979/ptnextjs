# Project Overview - TinaCMS Only

## Purpose
This is a Next.js application for Paul Thames Superyacht Technology powered exclusively by TinaCMS.

## Architecture
- **Main App**: Next.js static site generation
- **CMS**: TinaCMS with local content files and static build-time generation
- **Data Strategy**: TinaCMS only - no fallbacks, no other data sources

## Key Points
- Application uses **only TinaCMS** for content management
- No fallback mechanisms to other data sources
- No Payload CMS integration
- No static data files
- Build fails if TinaCMS content is unavailable or malformed

## Data Flow
1. Content is managed through TinaCMS during development
2. At build time, TinaCMS content files are processed
3. Static site is generated with all content embedded
4. No runtime data fetching needed

## Tech Stack
- **Frontend**: Next.js 14.2.5 with React 18.2.0
- **Styling**: Tailwind CSS with shadcn/ui components  
- **CMS**: TinaCMS (exclusive)
- **TypeScript**: Full TypeScript support
- **Build**: Static Site Generation only