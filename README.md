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
- **Tier-Based Access**: Free, Tier 1-4 vendor subscriptions with feature restrictions
- **Vendor Approval Workflow**: Registration → Admin Review → Approval/Rejection
- **Excel Import/Export**: Bulk vendor data management with validation and audit trail
- **Multi-Location Support**: Vendors can manage multiple physical locations with geocoding
- **Tier Upgrade Requests**: Vendors can request subscription upgrades with admin approval
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

## Excel Import/Export Feature

The Excel Import/Export feature enables vendors to efficiently manage their profile data through Excel spreadsheets with comprehensive validation and audit capabilities.

### Overview

**Available to**: All tiers can download templates and export data; **Tier 2+** required for import

**Key Capabilities**:
- **Download Templates**: Tier-appropriate Excel templates with examples and validation
- **Export Data**: Export current vendor profile to Excel format
- **Import Data**: Upload Excel files to update profile (with preview and validation)
- **Import History**: Complete audit trail of all imports with change tracking

### Quick Start

```bash
# 1. Log in to vendor dashboard at /vendor/dashboard

# 2. Navigate to Import/Export section

# 3. Download template or export current data
#    - Templates include tier-appropriate fields only
#    - Exports show your current profile data

# 4. Edit Excel file with your data
#    - Don't modify column headers
#    - Follow example row format
#    - Use dropdown lists where provided

# 5. Upload for preview
#    - Validation runs automatically
#    - Fix any errors shown in preview

# 6. Confirm import
#    - Review changes carefully
#    - Click "Import Data" to apply
```

### API Endpoints

All endpoints require authentication and vendor ownership verification (or admin role):

```typescript
// Download tier-appropriate template
GET /api/portal/vendors/[id]/excel-template

// Export vendor data to Excel
GET /api/portal/vendors/[id]/excel-export

// Import vendor data (two-phase: preview → execute)
POST /api/portal/vendors/[id]/excel-import?phase=preview
POST /api/portal/vendors/[id]/excel-import?phase=execute

// Get import history with pagination/filtering
GET /api/portal/vendors/[id]/import-history
```

### Architecture

**Service Layer**:
- `ExcelTemplateService`: Generate tier-based templates with validation rules
- `ExcelExportService`: Export vendor data with formatting
- `ExcelParserService`: Parse uploaded Excel files
- `ImportValidationService`: Validate data against business rules
- `ImportExecutionService`: Execute imports with atomic operations

**Components**:
- `ExcelExportCard`: Template download and data export UI
- `ExcelImportCard`: File upload and import workflow UI
- `ImportHistoryCard`: Import history display with filtering
- `ExcelPreviewDialog`: Validation preview before import

**Database**:
- `import_history` collection: Audit trail with changes and errors
- Indexed for fast queries by vendor, date, and status

### Features

**Template Generation**:
- Tier-specific field filtering (only show accessible fields)
- Excel data validation (dropdowns, ranges, formats)
- Example data row with correct formats
- Instructions worksheet with usage guide
- Professional formatting and styling

**Data Export**:
- Tier-appropriate fields only
- Current vendor profile data
- Optional metadata section (export date, tier, record count)
- Professional formatting with headers and alternating row colors
- Auto-filter enabled for easy sorting

**Import Validation**:
- Required field checking
- Data type and format validation (email, URL, phone, numbers)
- Text length validation
- Number range validation
- Enum/dropdown value validation
- Tier-based field access enforcement
- Row-by-row error reporting with suggestions

**Import Execution**:
- Two-phase process (preview → confirm)
- Atomic operations (all-or-nothing with rollback)
- Change tracking (before/after values)
- Only updates existing vendor (no new vendor creation)
- Overwrites existing values (empty cells skipped)
- Import history record creation

**Security**:
- Authentication required (JWT tokens)
- Authorization checks (vendor ownership or admin)
- Tier 2+ enforcement for import feature
- File size limit (5MB max)
- File type whitelist (.xlsx, .xls only)
- Comprehensive data validation

### Documentation

Comprehensive documentation available:

**For Vendors**:
- User Guide: `/docs/user-guides/vendor-excel-import-export.md`
- Step-by-step instructions for download, export, and import
- Field reference with descriptions and examples
- Common errors and solutions
- Troubleshooting tips and FAQ

**For Administrators**:
- Admin Guide: `/docs/admin-guides/excel-import-monitoring.md`
- Monitoring import activity across vendors
- Troubleshooting vendor issues
- Common support scenarios and responses
- Database queries and reporting

**For Developers**:
- API Documentation: `/docs/api/excel-import-export.md`
- Complete endpoint reference with examples
- Request/response formats
- Error codes and handling
- Authentication and authorization details

- Architecture Documentation: `/docs/architecture/excel-import-export-architecture.md`
- System architecture with diagrams
- Service layer design
- Data flow diagrams
- Database schema
- Security architecture
- Performance considerations

### Example Usage

```typescript
// Download template
const templateResponse = await fetch(
  '/api/portal/vendors/123/excel-template',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const templateBlob = await templateResponse.blob();

// Export current data
const exportResponse = await fetch(
  '/api/portal/vendors/123/excel-export?metadata=true',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const exportBlob = await exportResponse.blob();

// Import data (preview phase)
const formData = new FormData();
formData.append('file', fileInput.files[0]);
const previewResponse = await fetch(
  '/api/portal/vendors/123/excel-import?phase=preview',
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  }
);
const previewResult = await previewResponse.json();

// Import data (execute phase)
if (previewResult.validationResult?.valid) {
  const executeResponse = await fetch(
    '/api/portal/vendors/123/excel-import?phase=execute',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    }
  );
  const executeResult = await executeResponse.json();
}

// Get import history
const historyResponse = await fetch(
  '/api/portal/vendors/123/import-history?page=1&limit=10',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const historyData = await historyResponse.json();
```

### Tier-Based Field Access

Field availability varies by subscription tier:

- **Tier 0 (Free)**: Basic fields (name, email, website)
- **Tier 1**: + Contact information (phone, address)
- **Tier 2**: + Business details (founded year, employee count, social media)
- **Tier 3**: + Marketing content (description, specialties, service areas)
- **Tier 4**: + All premium fields

Templates and exports automatically include only tier-appropriate fields.

### Testing

Comprehensive test coverage:

```bash
# Unit tests for services
npm run test lib/services/Excel*
npm run test lib/services/Import*

# Integration tests for API routes
npm run test app/api/portal/vendors/\\[id\\]/excel-*

# E2E tests for user workflows
npm run test:e2e -- --grep "Excel Import"
```

### Performance

Typical performance metrics:
- Template generation: 50-100ms
- Data export: 100-500ms
- File parsing: 200-1000ms (file size dependent)
- Validation: 50-200ms per 100 rows
- Import execution: 500-2000ms (changes dependent)

File size limit: 5MB (prevents performance issues)

### Future Enhancements

Planned features:
- Batch imports for multiple vendors (admin only)
- Scheduled recurring imports
- Advanced validation (URL checking, email verification)
- Import templates with pre-saved mappings
- Webhook notifications on import completion
- Analytics dashboard for import metrics

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