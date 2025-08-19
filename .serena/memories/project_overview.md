# Project Overview - CORRECTED

## Purpose
This is a Next.js application for Paul Thames Superyacht Technology with **hybrid** Payload CMS integration that gracefully falls back to static data.

## Architecture (ACTUAL)
- **Main App**: Next.js runs on port 3000
- **CMS Service**: Optional separate Payload CMS service runs on port 3001
- **Data Strategy**: Hybrid approach with graceful fallback
  - Attempts to fetch from CMS API when available
  - Falls back to static data when CMS is unavailable
  - Configurable via `USE_PAYLOAD_CMS` environment variable

## Key Discovery
The app is **NOT** tightly coupled to Payload CMS. It's designed with a fallback system:

1. **Primary**: Tries to connect to Payload CMS API at `http://localhost:3001/api`
2. **Fallback**: Uses static data from `lib/data.ts` when CMS is unavailable
3. **Health Checks**: Regularly checks CMS availability with 5-minute cache

## CMS Configuration
- `USE_CMS = process.env.NODE_ENV === 'production' || process.env.USE_PAYLOAD_CMS === 'true'`
- Currently CMS is only enabled in production OR when explicitly enabled
- In development, it defaults to static data unless CMS flag is set

## Tech Stack
- **Frontend**: Next.js 14.2.5 with React 18.2.0
- **Styling**: Tailwind CSS with shadcn/ui components
- **CMS**: Optional Payload CMS (SQLite backend)
- **TypeScript**: Full TypeScript support
- **Data Layer**: Hybrid CMS + static data with automatic fallback