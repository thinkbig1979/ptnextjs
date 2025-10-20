# Paul Thames Superyacht Technology

A modern, high-performance Next.js application powered by Payload CMS with dual authentication systems for admin management and vendor self-service.

## Overview

This is a superyacht technology platform featuring:
- **Payload CMS**: Full-featured headless CMS with admin panel
- **Dual Authentication**: Separate systems for admin and vendor portals
- **Vendor Self-Service**: Registration, approval workflow, and profile management
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
- Payload CMS admin panel available at `/admin`
- Vendor portal available at `/vendor/*`
- Payload REST API available at `/api/*` (protected by Payload auth)

### 3. Production Build
```bash
npm run build
npm start
```

## Architecture

### Dual Authentication System

This application implements **two separate authentication systems** that work in harmony:

#### 1. Payload CMS Authentication (Admin Portal)
- **Purpose**: Admin management and content editing
- **Route**: `/admin` (Payload CMS admin panel)
- **Cookie**: `payload-token`
- **API Endpoints**: `/api/vendors/*`, `/api/products/*`, etc. (Payload REST API)
- **Users**: Admin users with full access to all collections
- **Access Control**: Defined in `payload/collections/*.ts` files

#### 2. Custom JWT Authentication (Vendor Portal)
- **Purpose**: Vendor self-service registration and profile management
- **Routes**: `/vendor/*` (custom vendor portal UI)
- **Cookie**: `access_token`
- **API Endpoints**: `/api/portal/vendors/*` (custom API routes)
- **Users**: Vendor users with tier-based access restrictions
- **Access Control**: Implemented in custom route handlers

### API Namespace Architecture

To prevent route conflicts between the two authentication systems, APIs are organized as follows:

```
/api/
├── admin/                    # Admin-only custom endpoints
│   └── vendors/
│       ├── pending/         # Get pending vendor approvals
│       └── [id]/
│           ├── approve/     # Approve vendor
│           └── reject/      # Reject vendor
│
├── portal/                  # Vendor portal custom endpoints
│   └── vendors/
│       ├── register/        # Vendor self-registration
│       ├── profile/         # Get/update current vendor profile
│       └── [id]/            # Update specific vendor (with auth checks)
│
├── auth/                    # Custom authentication endpoints
│   ├── login/              # Custom JWT login
│   ├── logout/             # Custom JWT logout
│   ├── refresh/            # Token refresh
│   └── me/                 # Get current user
│
└── vendors/*                # Payload REST API (for admin panel)
    products/*               # Managed by Payload CMS
    categories/*             # Uses payload-token authentication
    ...
```

### How It Works Together

1. **Admin Workflow**:
   - Admin logs into `/admin` using Payload's login
   - Session stored in `payload-token` cookie
   - Admin panel makes requests to `/api/vendors/*` (Payload REST API)
   - Full CRUD access to all collections via Payload's built-in REST API

2. **Vendor Workflow**:
   - Vendor registers at `/vendor/register`
   - Request sent to `/api/portal/vendors/register` (custom API)
   - Admin approves via `/admin` → `/api/admin/vendors/[id]/approve`
   - Approved vendor logs in at `/vendor/login`
   - Session stored in `access_token` cookie
   - Vendor portal makes requests to `/api/portal/vendors/*` (custom API)
   - Tier-based access restrictions enforced in custom route handlers

3. **Why This Architecture?**:
   - **Separation of Concerns**: Admin and vendor interfaces are completely independent
   - **Security**: Two auth systems prevent token confusion or privilege escalation
   - **Flexibility**: Custom vendor portal has different UX than admin panel
   - **Scalability**: Each system can be modified independently

### Authentication Tokens

| System | Cookie Name | Expiration | Usage |
|--------|-------------|------------|-------|
| Payload CMS | `payload-token` | 1 hour | Admin panel operations |
| Custom Auth | `access_token` | 1 hour | Vendor portal operations |
| Custom Auth | `refresh_token` | 7 days | Token refresh |

## Content Management

### Payload CMS Collections
- **Database**: SQLite (local) or PostgreSQL (production)
- **Schema Configuration**: Defined in `payload/collections/*.ts`
- **Admin Interface**: Available at `/admin` (Payload CMS admin panel)
- **Access Control**: Role-based permissions (admin/vendor) with tier restrictions

### Collection Structure
```
payload/collections/
├── Users.ts           # Admin and vendor users
├── Vendors.ts         # Vendor profiles (with tier-based fields)
├── Products.ts        # Product catalog
├── Categories.ts      # Product categories
├── BlogPosts.ts       # Blog posts
├── TeamMembers.ts     # Team member profiles
├── CompanyInfo.ts     # Company information
├── Tags.ts            # Content tags
├── Yachts.ts          # Yacht database
└── Media.ts           # Media/file uploads
```

## Available Scripts

### Development
- `npm run dev` - Start development server with Payload CMS
- `npm run dev:clean` - Clean up dev servers and start fresh
- `npm run stop:dev` - Stop all running dev servers

### Build & Deploy
- `npm run build` - Build application for production
- `npm start` - Serve production build locally

### Database & Migration
- `npm run migrate` - Run Payload CMS to database migration
- `npm run migrate:dry-run` - Preview migration without executing

### Testing
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests in UI mode

### Maintenance
- `npm run lint` - Run ESLint code quality checks
- `npm run type-check` - Run TypeScript type checking

## Tech Stack

### Core Technologies
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Payload CMS 3.x** - Full-featured headless CMS
- **SQLite/PostgreSQL** - Database backend
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Hook Form** - Form validation and management
- **Zod** - TypeScript-first schema validation

### Key Features
- **Dual Authentication**: Separate admin and vendor auth systems
- **Tier-Based Access**: Free, Tier 1, and Tier 2 vendor subscriptions
- **Vendor Approval Workflow**: Registration → Admin Review → Approval/Rejection
- **Image Optimization**: Automatic optimization with Next.js Image
- **SEO Optimization**: Meta tags, structured data, and sitemap generation
- **Performance**: Server-side rendering, lazy loading, and code splitting
- **Accessibility**: WCAG compliant with proper ARIA labels

## Project Structure

```
app/
├── (payload)/           # Payload CMS routes
│   ├── admin/          # Payload admin panel
│   └── api/
│       └── [...slug]/  # Payload REST API catch-all
├── (site)/             # Public-facing site
│   ├── vendor/        # Vendor portal
│   │   ├── register/  # Vendor registration
│   │   ├── login/     # Vendor login
│   │   └── dashboard/ # Vendor dashboard
│   ├── vendors/       # Public vendor directory
│   └── ...
├── admin/              # Custom admin pages
│   └── vendors/
│       └── pending/   # Vendor approval queue
└── api/
    ├── admin/         # Admin-only custom endpoints
    ├── portal/        # Vendor portal custom endpoints
    │   └── vendors/   # Vendor self-service API
    └── auth/          # Custom authentication endpoints

components/
├── ui/                # shadcn/ui components
├── vendor/            # Vendor portal components
├── admin/             # Admin-specific components
└── shared/            # Shared components

payload/
├── collections/       # Payload CMS collection schemas
│   ├── Users.ts      # User collection with role-based access
│   ├── Vendors.ts    # Vendor profiles with tier restrictions
│   ├── Products.ts   # Product catalog
│   └── ...
├── access/           # Access control functions
│   └── rbac.ts      # Role-based access control helpers
└── fields/           # Reusable field configurations

lib/
├── services/         # Business logic services
│   └── auth-service.ts  # Custom JWT authentication
├── middleware/       # Request middleware
├── validation/       # Zod validation schemas
└── utils/           # Helper functions

data/
└── payload.db       # SQLite database (local dev)

public/              # Static assets
└── media/          # Uploaded files
```

## Deployment

### Server Hosting (Required for Payload CMS)
Since Payload CMS requires server-side capabilities, deploy to platforms that support Node.js:
- **Vercel**: Automatic deployments from Git with serverless functions
- **Netlify**: Git-based deployment with serverless functions
- **Railway**: Easy Node.js deployment with PostgreSQL
- **Render**: Managed Node.js hosting
- **DigitalOcean App Platform**: Container-based deployment

### Database Configuration
For production, use PostgreSQL instead of SQLite:
1. Set up PostgreSQL database
2. Update `payload.config.ts` to use `@payloadcms/db-postgres`
3. Configure `DATABASE_URL` environment variable

### Build Output
The `npm run build` command generates:
- Server-side rendered pages
- Optimized JavaScript bundles
- Payload CMS admin panel
- REST API endpoints

## User Management

### Admin Users
1. **First Admin Creation**:
   - First user registered automatically gets admin role
   - Access admin panel at `/admin`
   - Full CRUD access to all collections

2. **Additional Admins**:
   - Created by existing admins via `/admin/collections/users`
   - Set role to "admin" and status to "approved"

### Vendor Users
1. **Self-Registration**:
   - Vendors register at `/vendor/register`
   - Account created with "pending" status
   - Email notification sent to admin

2. **Admin Approval**:
   - Admin reviews at `/admin/vendors/pending`
   - Can approve or reject with reason
   - Approved vendors can log in at `/vendor/login`

3. **Tier Assignment**:
   - Free (default): Basic profile
   - Tier 1: Enhanced profile with certifications
   - Tier 2: Full features including products (coming soon)

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

Required environment variables:

```bash
# Payload CMS Configuration
PAYLOAD_SECRET=your-secret-key-minimum-32-characters
DATABASE_URL=file:./data/payload.db  # SQLite (local)
# DATABASE_URL=postgresql://user:pass@host:5432/db  # PostgreSQL (production)

# Server Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PORT=3000

# JWT Secret for Custom Authentication
JWT_SECRET=your-jwt-secret-key-minimum-32-characters

# Optional: Build Configuration
# NEXT_OUTPUT_MODE=export  # DO NOT use with Payload CMS
```

### Security Notes
- Never commit secrets to Git
- Use different secrets for development and production
- Rotate secrets periodically
- Use `.env.local` for local development (not tracked by Git)

## Troubleshooting

### Common Issues

#### 401 Unauthorized When Editing in Admin Panel
**Symptom**: Getting 401 errors when trying to update vendors in `/admin/collections/vendors`

**Cause**: Custom API routes at `/api/vendors/*` were intercepting Payload's REST API requests

**Solution**: Custom vendor portal routes moved to `/api/portal/vendors/*` to prevent conflicts. Admin panel now correctly uses Payload's REST API at `/api/vendors/*`.

#### Authentication Token Confusion
**Symptom**: Users logged into one system (admin/vendor) but not recognized in the other

**Expected Behavior**: This is intentional! The two authentication systems are independent:
- Admin panel uses `payload-token` cookie
- Vendor portal uses `access_token` cookie

To switch between systems, you must log in to each separately.

#### Port Already in Use
**Symptom**: Dev server fails to start on port 3000

**Solution**:
```bash
npm run stop:dev  # Kill existing dev servers
npm run dev       # Start fresh
```

#### Database Locked (SQLite)
**Symptom**: "Database is locked" errors during development

**Solution**: SQLite doesn't handle concurrent writes well. Use PostgreSQL for production or ensure only one dev server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass: `npm run type-check && npm run lint`
5. Test both admin and vendor portals
6. Submit a pull request

## License

Copyright © 2024 Paul Thames Superyacht Technology. All rights reserved.