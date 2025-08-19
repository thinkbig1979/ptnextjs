# Paul Thames Superyacht Technology

Next.js application with optional Payload CMS integration and static data fallback.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Application

**Standard Development (Recommended):**
```bash
npm run dev
```
- App runs on http://localhost:3000
- Uses static data (no CMS needed)
- Perfect for development and testing

**With CMS Integration (Optional):**
```bash
./scripts/dev-with-cms.sh
```
- App runs on http://localhost:3000
- CMS Admin on http://localhost:3001/admin
- Fetches from CMS, falls back to static data

## How It Works

The app is designed with a **hybrid data strategy**:
- **Primary**: Static data from `lib/data.ts` 
- **Enhanced**: Optional CMS data when available
- **Graceful**: Automatic fallback if CMS is unavailable

## CMS Access (When Running)
- **Admin Panel**: http://localhost:3001/admin
- **Email**: admin@paulthamessuperyachttechnology.com
- **Password**: admin123

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Payload CMS (SQLite)
- React Hook Form + Zod validation