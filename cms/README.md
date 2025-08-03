
# Payload CMS v3 Setup

This directory contains the Payload CMS v3 configuration for the Paul Thames Next.js project.

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the admin panel:**
   - URL: http://localhost:3001/admin
   - Create your first admin user on first visit

4. **API endpoints:**
   - Base URL: http://localhost:3001/api
   - GraphQL: http://localhost:3001/api/graphql

## Configuration

- **Database**: SQLite (`./payload.db`)
- **Port**: 3001 (configurable via PORT env var)
- **Admin Panel**: `/admin`
- **API**: `/api`

## Files Structure

- `payload.config.ts` - Main Payload configuration
- `server.mjs` - Express server setup
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template

## Integration Status

✅ **Step 1 Complete**: Basic Payload CMS v3 setup with SQLite
⏳ **Next**: Step 2 - Define Content Collections (Blog, Partners, Products)

## Commands

```bash
npm run dev      # Start development server
npm run start    # Start production server
npm run build    # Build Payload admin panel
```

## Notes

- This CMS setup is separate from the main Next.js app
- SQLite database will be created automatically on first run
- TypeScript types will be generated automatically
- Ready for content collections integration in Step 2
