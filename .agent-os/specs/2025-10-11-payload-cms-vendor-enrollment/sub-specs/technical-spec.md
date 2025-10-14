# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## Feature Classification

**Feature Type**: FULL_STACK

**Frontend Required**: YES
**Backend Required**: YES

**Justification**: This migration requires both backend infrastructure (Payload CMS with PostgreSQL, authentication, API endpoints, migration scripts) and frontend updates (vendor registration UI, dashboard, authentication flow, API integration). The tiered access control and self-enrollment features necessitate full-stack implementation.

---

## Frontend Implementation

### UI Components

#### **VendorRegistrationForm**
- **Type**: Form
- **Purpose**: Allow vendors to create accounts with company name and contact information
- **User Interactions**: Fill form fields, submit registration, view validation errors
- **State Management**: Local form state with React Hook Form
- **Routing**: `/vendor/register`

#### **VendorLoginForm**
- **Type**: Form
- **Purpose**: Authenticate vendors to access their dashboard
- **User Interactions**: Enter email/password, submit login, handle errors
- **State Management**: Global auth state (Context API or Zustand)
- **Routing**: `/vendor/login`

#### **VendorDashboard**
- **Type**: Page
- **Purpose**: Central hub for vendors to manage their profile and view subscription tier
- **User Interactions**: Navigate to profile sections, view tier status, edit content
- **State Management**: Global auth state + API data
- **Routing**: `/vendor/dashboard`

#### **VendorProfileEditor**
- **Type**: Form
- **Purpose**: Allow vendors to edit their company profile based on subscription tier
- **User Interactions**: Edit form fields, upload logo, save changes
- **State Management**: Local form state + API mutations
- **Routing**: `/vendor/dashboard/profile`

#### **AdminApprovalQueue**
- **Type**: List + Modal
- **Purpose**: Admin interface to review and approve/reject pending vendor registrations
- **User Interactions**: View pending vendors, click approve/reject, add notes
- **State Management**: API data with optimistic updates
- **Routing**: `/admin/vendors/pending`

#### **SubscriptionTierBadge**
- **Type**: Card
- **Purpose**: Display vendor's current subscription tier with upgrade call-to-action
- **Props**: tier ('free' | 'tier1' | 'tier2'), upgradeUrl
- **Events**: None (display only)

### Frontend State Management

**State Management Pattern**: Context API for auth, React Hook Form for forms, SWR for data fetching

**State Stores Required**:
- **AuthContext**: Manages user authentication state
  - State shape: `{ user: User | null, isAuthenticated: boolean, role: 'admin' | 'vendor' | null, tier: 'free' | 'tier1' | 'tier2' | null, login: Function, logout: Function, refresh: Function }`
  - Actions: login(email, password), logout(), refreshUser()
  - Computed/Selectors: isAdmin, isVendor, canAccessProducts

### Frontend Routing

**Routes Required**:
- **/vendor/register**: VendorRegistrationForm - Public vendor registration
- **/vendor/login**: VendorLoginForm - Vendor authentication
- **/vendor/dashboard**: VendorDashboard - Protected vendor dashboard
- **/vendor/dashboard/profile**: VendorProfileEditor - Protected profile editing
- **/admin/vendors/pending**: AdminApprovalQueue - Protected admin approval interface

**Route Guards**:
- `/vendor/dashboard/*` requires authenticated vendor
- `/admin/*` requires authenticated admin
- Public routes redirect authenticated users to dashboard

### User Interface Specifications

**Design Requirements**:
- **Responsive Breakpoints**: Mobile-first design, breakpoints at 640px (mobile), 1024px (desktop)
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Loading States**: Skeleton loaders for data fetching, button spinners for form submissions
- **Error States**: Inline form validation errors, toast notifications for API errors
- **Empty States**: "No products yet" message with upgrade CTA for free tier vendors

**Form Validations**:
- **email**: Valid email format, required
- **password**: Minimum 12 characters, uppercase, lowercase, number, special character, required
- **companyName**: 2-100 characters, required
- **contactPhone**: Valid phone format, optional
- **contactEmail**: Valid email format, required

### Component Architecture

**UI Component Strategy**: shadcn/ui components with Radix UI primitives

**Component Library**: shadcn/ui (latest version)

**Library Components to Use**:
- **Button** (`components/ui/button.tsx`): Primary actions, form submissions
  - Usage: Registration, login, profile save, approve/reject actions
  - Variants: default, destructive, outline, ghost
  - Props: variant, size, disabled, loading

- **Form** (`components/ui/form.tsx`): Form wrapper with validation
  - Usage: All vendor and admin forms
  - Sub-components: FormField, FormItem, FormLabel, FormControl, FormMessage

- **Input** (`components/ui/input.tsx`): Text input fields
  - Usage: Email, company name, contact info fields
  - Variants: default, error state
  - Props: type, placeholder, disabled, error

- **Card** (`components/ui/card.tsx`): Content containers
  - Usage: Dashboard sections, vendor profile display
  - Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

- **Badge** (`components/ui/badge.tsx`): Status indicators
  - Usage: Subscription tier display, approval status
  - Variants: default, secondary, destructive, outline

- **Table** (`components/ui/table.tsx`): Data tables
  - Usage: Admin vendor approval queue
  - Sub-components: TableHeader, TableBody, TableRow, TableCell

- **Dialog** (`components/ui/dialog.tsx`): Modal dialogs
  - Usage: Approval confirmation, rejection reason input
  - Sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription

- **Toast** (`components/ui/toast.tsx`): Notifications
  - Usage: Success/error messages for API operations
  - Props: title, description, variant

**Custom Components** (built on library):
- **TierGate**: Combines Badge with conditional rendering for tier-restricted content
  - Built from: Badge, conditional rendering logic
  - Purpose: Show/hide content based on vendor subscription tier
  - Props: requiredTier, currentTier, children, upgradeMessage

- **VendorNavigation**: Dashboard navigation sidebar
  - Built from: Card, Badge (tier display)
  - Purpose: Navigate between vendor dashboard sections
  - Props: currentPath, tier

### Page Layout Architecture

**Layout Approach**: CSS Grid for page structure, Flexbox for components (from tech-stack)

**Global Layout Structure**:
```
┌─────────────────────────────────────┐
│  Header (h-16) - Logo, Nav, Auth    │
├──────┬──────────────────────────────┤
│      │                              │
│Vendor│  Main Content Area           │
│ Nav  │  Dashboard / Profile Editor  │
│(240px│  Admin Approval Queue        │
│      │                              │
└──────┴──────────────────────────────┘
```

**Layout Implementation**:
- Using: CSS Grid for page structure, Flexbox for components
- Grid configuration: `grid-cols-[240px_1fr]` for dashboard layout
- Breakpoints: 640px (mobile: single column), 1024px (desktop: sidebar visible)

**Page-Specific Layouts**:

#### Vendor Dashboard Layout
- **Layout Pattern**: Dashboard Grid with sidebar navigation
- **Structure**:
  ```
  - Header area: Breadcrumbs ("Dashboard"), page title, subscription tier badge
  - Sidebar: Navigation links (Profile, Products [if tier 2], Settings)
  - Main content: Current section content (profile form, product list, etc.)
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): Sidebar visible, 240px fixed width
  - Tablet (640-1024px): Collapsible sidebar with hamburger menu
  - Mobile (<640px): Full-width drawer for navigation

#### Admin Approval Queue Layout
- **Layout Pattern**: List + Detail with modal workflow
- **Structure**:
  ```
  - Header area: "Pending Vendor Approvals", count badge
  - Main content: Table of pending vendors with action buttons
  - Modal: Vendor details with approve/reject actions
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): Full table view with all columns
  - Tablet (640-1024px): Reduced columns, horizontal scroll
  - Mobile (<640px): Card-based list view

**Component Hierarchy**:
```
VendorDashboardPage
├── DashboardHeader
│   ├── Breadcrumbs
│   ├── PageTitle
│   └── TierGate (subscription badge with upgrade CTA)
├── DashboardLayout
│   ├── VendorNavigation (sidebar)
│   │   ├── NavLink (Profile)
│   │   ├── NavLink (Products - tier 2 only)
│   │   └── NavLink (Settings)
│   └── MainContent
│       └── VendorProfileEditor
│           ├── FormSection (Basic Info - always editable)
│           ├── TierGate (Enhanced Profile - tier 1+)
│           └── TierGate (Products Section - tier 2)
```

### Navigation Architecture

**Navigation Pattern**: Hybrid (top bar for public, sidebar for dashboard)

**Navigation Structure**:
```
Public Top Navigation
├── Home (/)
├── Vendors (/vendors)
├── Products (/products)
├── Blog (/blog)
└── Vendor Login (/vendor/login)

Vendor Dashboard Sidebar
├── Dashboard (/vendor/dashboard)
├── Profile (/vendor/dashboard/profile)
├── Products (/vendor/dashboard/products) [Tier 2 only]
└── Settings (/vendor/dashboard/settings)

Admin Navigation
├── Dashboard (/admin)
├── Pending Approvals (/admin/vendors/pending)
├── All Vendors (/admin/vendors)
└── Content Management (/admin/content)
```

**Navigation Implementation**:
- **Primary Nav**: Custom NavBar component (public site)
  - Structure: Logo left, nav links center, auth button right
  - Styling: Tailwind CSS with shadcn/ui Button components
  - Mobile: Hamburger menu with Sheet component
- **Dashboard Nav**: Custom VendorNavigation sidebar
  - Structure: Vertical nav with tier badge at top
  - Styling: Card component with active state highlighting
  - Mobile: Drawer overlay pattern
- **Breadcrumbs**: Custom breadcrumb component
  - Generation: Manual per page (simple structure)
- **User Menu**: shadcn/ui DropdownMenu
  - Trigger: User avatar/name click
  - Items: Profile, Settings, Logout

**Navigation Components**:

- **VendorNavigation**: Sidebar navigation for vendor dashboard
  - Position: fixed-left on desktop, overlay drawer on mobile
  - Width: 240px desktop, full-width mobile overlay
  - Active state: Background color change, left border accent
  - Collapsible: Yes (hamburger menu on mobile)
  - Mobile behavior: Sheet component with backdrop overlay

- **PublicNavBar**: Horizontal navigation bar for public site
  - Layout: Flex with space-between (logo, links, auth)
  - Sticky: Yes (sticky top-0)
  - Mobile: Hamburger menu collapses to Sheet

- **Breadcrumbs**: Shown on all dashboard pages
  - Pattern: Dashboard > Section > Page
  - Implementation: Custom component with Link components

- **UserMenu**: User account dropdown
  - Location: top-right corner of dashboard header
  - Trigger: Click on user avatar
  - Items: Profile, Settings, Logout

**Navigation State Management**:
- **Active Route Tracking**: Next.js usePathname() hook
- **Mobile Menu State**: Local component state (Sheet isOpen)
- **Breadcrumb Data**: Manual per page (simple static data)

### User Flow & Interaction Patterns

**Primary User Flows**:

#### Flow 1: Vendor Registration
1. **Starting Point**: Public homepage or /vendor/register
2. **Trigger**: Click "Register as Vendor" button (shadcn/ui Button)
3. **Action**: Navigate to /vendor/register
4. **Page/Component Loads**: VendorRegistrationForm renders
   - Uses Form component with Input fields (company name, contact info)
   - Validation: React Hook Form with Zod schema
   - Loading state: Button loading spinner during submission
5. **User Interaction**: Fill company name, email, phone, password
   - Real-time feedback: Inline validation errors below fields
   - Error states: FormMessage components display field errors
6. **Submit/Complete**: Click "Submit Registration" button
   - Loading indicator: Button spinner, disabled state
   - API call: POST /api/vendors/register
7. **Success Path**:
   - Notification: Toast success message "Registration submitted for approval"
   - Navigation: Redirect to /vendor/registration-pending confirmation page
   - UI update: Display "Awaiting approval" message
8. **Error Path**:
   - Error display: Toast error notification + inline form errors
   - Form state: Preserved, not cleared
   - Recovery action: Fix errors and resubmit

#### Flow 2: Admin Vendor Approval
1. **Starting Point**: Admin dashboard /admin
2. **Trigger**: Click "Pending Vendor Approvals" navigation item (NavLink)
3. **Action**: Navigate to /admin/vendors/pending
4. **Page/Component Loads**: AdminApprovalQueue renders
   - Uses Table component with vendor list
   - Validation: N/A (display only)
   - Loading state: Skeleton loader for table rows
5. **User Interaction**: Review vendor details, click "Approve" or "Reject"
   - Real-time feedback: Dialog opens for confirmation
   - Error states: Toast notification if action fails
6. **Submit/Complete**: Confirm approval or enter rejection reason
   - Loading indicator: Button spinner in dialog
   - API call: POST /api/admin/vendors/{id}/approve or reject
7. **Success Path**:
   - Notification: Toast "Vendor approved successfully"
   - Navigation: Stay on page
   - UI update: Remove approved vendor from pending list, update count badge
8. **Error Path**:
   - Error display: Toast error "Failed to approve vendor"
   - Form state: Dialog remains open
   - Recovery action: Retry approval action

#### Flow 3: Vendor Profile Editing
1. **Starting Point**: Vendor dashboard /vendor/dashboard
2. **Trigger**: Click "Edit Profile" link (NavLink in sidebar)
3. **Action**: Navigate to /vendor/dashboard/profile
4. **Page/Component Loads**: VendorProfileEditor renders
   - Uses Form component with tier-gated field groups
   - Validation: React Hook Form with Zod schema
   - Loading state: Skeleton loader while fetching current profile data
5. **User Interaction**: Edit profile fields based on tier
   - Real-time feedback: Inline validation for field requirements
   - Error states: FormMessage components for field errors
6. **Submit/Complete**: Click "Save Changes" button
   - Loading indicator: Button spinner
   - API call: PUT /api/vendors/{id}
7. **Success Path**:
   - Notification: Toast "Profile updated successfully"
   - Navigation: Stay on page
   - UI update: Form shows updated data, success message briefly displayed
8. **Error Path**:
   - Error display: Toast error + inline field errors
   - Form state: Preserved with user edits intact
   - Recovery action: Fix errors and resubmit

**Component Interaction Patterns**:

- **Master-Detail** (Admin Approval Queue):
  - AdminApprovalQueue (Table) → User clicks "Review" → Dialog opens → Admin approves/rejects → Table updates → State management: SWR cache invalidation → Data flow: Table → Dialog → API → SWR revalidation → Table refresh

- **Modal Workflow** (Approval Confirmation):
  - User clicks "Approve" button → Dialog component opens → User confirms action → API call triggers → Success: Dialog closes, Toast shows, Table updates → Error: Dialog stays open, error message displayed → State management: Local dialog state + optimistic table updates

**Form Submission Pattern** (standardized across all forms):
  1. User fills form (shadcn/ui Form + Input components)
  2. Client-side validation: React Hook Form with Zod schema validation
  3. Submit button: Loading state with spinner, disabled during submission
  4. API call: POST/PUT to Payload CMS API endpoint
  5. Success: Toast notification + navigation or table refresh
  6. Error: Toast error notification + inline field errors + form state preserved

### Component Integration Map

**How Components Work Together**:

#### Vendor Registration Flow Integration
```
User Action: Click "Register as Vendor" on homepage
↓
Next.js Router navigates to /vendor/register
↓
VendorRegistrationForm page component renders
↓
Data flows to child components:
  ├→ Form wrapper (receives validation schema)
  ├→ FormField components (receive field configs)
  └→ Button (receives loading state)
↓
User interacts: Fills form, clicks submit
↓
React Hook Form validates → API call via fetch → Success/Error handling → Toast + Navigation
```

#### Component Communication Patterns

**Page → Container → Presentational Pattern**:
```
VendorDashboardPage (manages routing, fetches user data via SWR)
  ↓ passes user, tier props
VendorProfileEditor (manages form state, handles save events)
  ↓ passes field values + event handlers
FormFields + TierGate (displays data only, emits onChange events)
  ↑ emits user input events
VendorProfileEditor (handles form submission, calls API)
  ↑ updates page-level user state via SWR revalidation
VendorDashboardPage (reflects updated user data)
```

**State Flow Between Components**:
- **Global State** (Context API):
  - Auth state (user, role, tier, isAuthenticated)
  - Accessed by: useAuth() hook in all protected pages
  - Updated by: login(), logout(), refreshUser() actions

- **Shared Component State** (props drilling):
  - VendorDashboardPage manages layout state
  - Passes to: VendorNavigation (tier, active path), MainContent (user data)

- **API Data Flow**:
  - Fetched in: Page components using SWR
  - Cached with: SWR automatic caching (5-minute stale time)
  - Shared via: SWR global cache + SWRConfig provider

---

## Backend Implementation

### API Endpoints

#### **POST /api/vendors/register**

**Purpose**: Register a new vendor account (pending admin approval)

**Authentication**: Public
**Authorization**: None (public endpoint)

**Request**:
```typescript
interface RegisterVendorRequest {
  companyName: string
  contactEmail: string
  contactPhone?: string
  password: string
}
```

**Response**:
```typescript
interface RegisterVendorSuccess {
  success: true
  data: {
    vendorId: string
    status: 'pending'
    message: 'Registration submitted for admin approval'
  }
}

interface RegisterVendorError {
  success: false
  error: {
    code: 'VALIDATION_ERROR' | 'DUPLICATE_EMAIL' | 'SERVER_ERROR'
    message: string
    fields?: { [key: string]: string }
  }
}
```

**Status Codes**:
- 201: Registration created successfully
- 400: Validation error or duplicate email
- 500: Server error

#### **POST /api/auth/login**

**Purpose**: Authenticate vendor or admin user

**Authentication**: Public
**Authorization**: None (authentication endpoint)

**Request**:
```typescript
interface LoginRequest {
  email: string
  password: string
}
```

**Response**:
```typescript
interface LoginSuccess {
  success: true
  data: {
    user: {
      id: string
      email: string
      role: 'admin' | 'vendor'
      tier?: 'free' | 'tier1' | 'tier2'
      companyName?: string
    }
    token: string
  }
}

interface LoginError {
  success: false
  error: {
    code: 'INVALID_CREDENTIALS' | 'ACCOUNT_PENDING' | 'ACCOUNT_REJECTED'
    message: string
  }
}
```

**Status Codes**:
- 200: Login successful
- 401: Invalid credentials
- 403: Account not approved yet
- 500: Server error

#### **PUT /api/vendors/{id}**

**Purpose**: Update vendor profile (tier-restricted fields)

**Authentication**: Required (JWT token)
**Authorization**: Vendor can only update own profile, admin can update any

**Request**:
```typescript
interface UpdateVendorRequest {
  companyName?: string
  description?: string // Basic free tier
  logo?: string
  contactEmail?: string
  contactPhone?: string
  website?: string // Tier 1+
  socialLinks?: { // Tier 1+
    linkedin?: string
    twitter?: string
  }
  certifications?: string[] // Tier 1+
}
```

**Response**:
```typescript
interface UpdateVendorSuccess {
  success: true
  data: {
    vendor: Vendor
  }
}

interface UpdateVendorError {
  success: false
  error: {
    code: 'UNAUTHORIZED' | 'TIER_RESTRICTED' | 'VALIDATION_ERROR'
    message: string
    restrictedFields?: string[]
  }
}
```

**Status Codes**:
- 200: Update successful
- 400: Validation error
- 401: Unauthorized
- 403: Tier restriction violation
- 404: Vendor not found
- 500: Server error

#### **GET /api/admin/vendors/pending**

**Purpose**: Get list of pending vendor registrations for admin approval

**Authentication**: Required (JWT token)
**Authorization**: Admin only

**Request**:
```typescript
interface GetPendingVendorsQuery {
  page?: number
  limit?: number
}
```

**Response**:
```typescript
interface GetPendingVendorsSuccess {
  success: true
  data: {
    vendors: Array<{
      id: string
      companyName: string
      contactEmail: string
      contactPhone?: string
      createdAt: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 403: Forbidden (not admin)
- 500: Server error

#### **POST /api/admin/vendors/{id}/approve**

**Purpose**: Approve a pending vendor registration

**Authentication**: Required (JWT token)
**Authorization**: Admin only

**Request**:
```typescript
interface ApproveVendorRequest {
  initialTier?: 'free' | 'tier1' | 'tier2' // Default to 'free'
  welcomeMessage?: string
}
```

**Response**:
```typescript
interface ApproveVendorSuccess {
  success: true
  data: {
    vendor: {
      id: string
      status: 'approved'
      tier: string
      approvedAt: string
    }
  }
}
```

**Status Codes**:
- 200: Approval successful
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Vendor not found
- 500: Server error

#### **POST /api/admin/vendors/{id}/reject**

**Purpose**: Reject a pending vendor registration

**Authentication**: Required (JWT token)
**Authorization**: Admin only

**Request**:
```typescript
interface RejectVendorRequest {
  reason: string // Required rejection reason
}
```

**Response**:
```typescript
interface RejectVendorSuccess {
  success: true
  data: {
    vendor: {
      id: string
      status: 'rejected'
      rejectedAt: string
      rejectionReason: string
    }
  }
}
```

**Status Codes**:
- 200: Rejection successful
- 400: Missing rejection reason
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Vendor not found
- 500: Server error

### Business Logic

**Core Business Rules**:
1. All vendor registrations must be manually approved by an admin before account activation
2. Vendor tier restrictions are enforced at both UI and API levels (defense in depth)
3. Vendors can only access and edit their own data (verified by user ID matching)
4. Free tier vendors cannot create products or access tier 1+ fields
5. Tier 1 vendors have enhanced profile fields but no product management
6. Tier 2 vendors have full access to products and services management
7. Admin users have unrestricted access to all content and vendor management
8. Password requirements: minimum 12 characters with uppercase, lowercase, number, special character

**Validation Requirements**:
- **Server-side**: All input validation, tier restriction enforcement, authentication verification
- **Data Integrity**: Unique email addresses, valid enum values (tier, status, role)
- **Business Constraints**:
  - Vendors cannot approve their own registration
  - Tier downgrades must preserve existing content (no data loss)
  - Email changes require re-verification (future enhancement)

**Service Layer Architecture**:
- **VendorService**: Vendor CRUD operations, tier validation
  - Methods: createVendor(), updateVendor(), getVendor(), validateTierAccess()
  - Dependencies: Database access layer, authentication service

- **AuthService**: Authentication and authorization
  - Methods: login(), validateToken(), checkPermission(), enforceRole()
  - Dependencies: JWT library, password hashing (bcrypt)

- **ApprovalService**: Admin approval workflow
  - Methods: getPendingVendors(), approveVendor(), rejectVendor(), notifyVendor()
  - Dependencies: VendorService, email service (future), database

- **MigrationService**: TinaCMS to Payload CMS data migration
  - Methods: migrateVendors(), migrateProducts(), migrateCategories(), validateMigration()
  - Dependencies: File system access, database access, validation service

### Database Schema

**Tables/Collections Required**:

#### **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vendor')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_status_created ON users(status, created_at) WHERE status = 'pending';
```

#### **vendors**
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'tier1', 'tier2')),

  -- Basic Info (Free Tier)
  description TEXT,
  logo VARCHAR(500),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),

  -- Enhanced Profile (Tier 1+)
  website VARCHAR(500),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  certifications TEXT[], -- Array of certification names

  -- Metadata
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_tier ON vendors(tier);
CREATE INDEX idx_vendors_published_featured ON vendors(published, featured);
```

#### **products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  images TEXT[], -- Array of image URLs
  categories TEXT[], -- Array of category IDs or names
  specifications JSONB, -- Flexible key-value specs
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_published ON products(published);
CREATE INDEX idx_products_categories ON products USING GIN(categories);
```

#### **categories**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon VARCHAR(100),
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_published ON categories(published);
```

#### **blog_posts**
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(1000),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  featured_image VARCHAR(500),
  categories TEXT[],
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
```

#### **team_members**
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT,
  photo VARCHAR(500),
  email VARCHAR(255),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_team_members_display_order ON team_members(display_order);
CREATE INDEX idx_team_members_published ON team_members(published);
```

#### **company_info**
```sql
CREATE TABLE company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_info_key ON company_info(key);
```

**Relationships**:
- users.id → vendors.user_id (one-to-one)
- vendors.id → products.vendor_id (one-to-many)
- categories.parent_id → categories.id (self-referencing hierarchy)
- users.id → blog_posts.author_id (one-to-many)

**Migrations**:
- Create all tables in order (users first, then dependent tables)
- Add foreign key constraints after all tables exist
- Seed admin user account
- Import TinaCMS data via migration scripts

---

## Frontend-Backend Integration

### API Contract

**Contract Owner**: Backend provides, Frontend consumes

**Type Sharing Strategy**:
- Shared TypeScript types package in `lib/types.ts`
- Backend Payload CMS collections define schema
- Frontend imports types from shared types file
- Runtime validation with Zod schemas matching backend

**Data Flow**:
1. User action in Frontend (form submission, button click) →
2. API call to Backend (fetch with JWT token) →
3. Backend validates, processes, and responds →
4. Frontend updates UI (SWR revalidation or optimistic update)

### Integration Points

**Frontend Calls Backend For**:
- User registration → POST /api/vendors/register
- User login → POST /api/auth/login
- Vendor profile update → PUT /api/vendors/{id}
- Admin approval → POST /api/admin/vendors/{id}/approve
- Admin rejection → POST /api/admin/vendors/{id}/reject
- Fetch pending vendors → GET /api/admin/vendors/pending
- Fetch vendor data → GET /api/vendors/{id}
- Fetch products → GET /api/products?vendorId={id}
- Fetch public vendor list → GET /api/vendors?published=true

**Error Handling Strategy**:
- **Network Errors**: Toast notification "Network error, please try again", retry mechanism with exponential backoff
- **Validation Errors**: Inline form errors (FormMessage components) + toast summary "Please fix form errors"
- **Authentication Errors**: Redirect to /vendor/login with return URL, clear auth token, show "Session expired" message

### Testing Strategy

**Frontend Tests**:
- Unit tests for components (Jest + React Testing Library)
  - VendorRegistrationForm: validation, submission, error handling
  - TierGate: tier restriction rendering logic
  - AdminApprovalQueue: approval/rejection actions
- Integration tests for state management
  - AuthContext: login/logout flows, token refresh
  - SWR data fetching: cache invalidation, optimistic updates
- Mock backend API responses using MSW (Mock Service Worker)

**Backend Tests**:
- Unit tests for business logic (Jest)
  - VendorService.validateTierAccess(): tier restriction enforcement
  - AuthService.validateToken(): JWT validation
  - MigrationService.migrateVendors(): data transformation correctness
- Integration tests for API endpoints (Supertest)
  - POST /api/vendors/register: validation, duplicate detection
  - POST /api/auth/login: authentication success/failure
  - PUT /api/vendors/{id}: tier restriction enforcement
- Database integration tests (test database with fixtures)
  - CRUD operations, foreign key constraints, cascading deletes

**E2E Tests**:
- Full user workflows from UI to database and back (Playwright)
  - Vendor registration → admin approval → vendor login → profile edit
  - Tier restriction enforcement (free tier vendor cannot access products)
  - Admin approval workflow (pending list → approve → vendor can login)
- Critical path scenarios
  - Registration with duplicate email shows error
  - Password requirements enforced in UI and API
  - Tier upgrade unlocks new features in dashboard
- Error handling scenarios
  - Network failure during form submission shows retry option
  - Invalid credentials show appropriate error message
  - Unauthorized access redirects to login

---

## Implementation Architecture

### Component Structure

#### **Payload CMS Integration Layer**

- **Responsibilities**: Install and configure Payload CMS, define collections, set up PostgreSQL connection, create admin interface
- **Implementation approach**: Install Payload CMS package, create payload.config.ts with collection schemas matching database schema, configure authentication and access control hooks
- **Dependencies**: Payload CMS 2.x, PostgreSQL client library, Next.js API routes
- **Interface contracts**:
  - Collections export TypeScript types
  - Access control functions receive req.user context
  - Hooks receive collection data and return transformed data

#### **Migration Scripts Layer**

- **Responsibilities**: Read TinaCMS markdown files, transform to Payload CMS format, insert into PostgreSQL, validate data integrity, create backups
- **Implementation approach**: Node.js scripts in `/scripts/migration/` directory, read markdown with gray-matter, transform to JSON matching Payload schemas, use Payload CMS local API to insert data
- **Dependencies**: gray-matter (markdown parsing), Payload CMS local API, file system access
- **Interface contracts**:
  - MigrationScript interface with execute() method
  - Validation function returns { success: boolean, errors: string[] }
  - Backup function creates timestamped markdown archive

#### **Authentication & Authorization Layer**

- **Responsibilities**: User authentication, JWT token management, role-based access control, tier restriction enforcement
- **Implementation approach**: Use Payload CMS built-in authentication, extend with custom access control functions for tier restrictions, implement JWT middleware for Next.js API routes
- **Dependencies**: Payload CMS auth, JWT library, bcrypt for password hashing
- **Interface contracts**:
  - AuthService.login() returns { user, token }
  - AccessControl functions receive (req, user, data) and return boolean
  - TierGuard middleware checks user.tier against required tier

#### **Next.js API Routes Layer**

- **Responsibilities**: Expose backend functionality to frontend, handle HTTP requests, integrate with Payload CMS, return standardized responses
- **Implementation approach**: Create API routes in `/app/api/` directory, use Payload CMS local API for data access, implement error handling middleware, return consistent JSON response format
- **Dependencies**: Payload CMS local API, Next.js API routes, authentication middleware
- **Interface contracts**:
  - All endpoints return `{ success: boolean, data?: any, error?: ErrorObject }`
  - Authentication endpoints return JWT token in response
  - Protected endpoints require Authorization header with JWT

### Data Flow

1. **User Registration Flow**: Frontend form submission → POST /api/vendors/register → Validate input → Check duplicate email → Hash password → Insert into users table with status='pending' → Insert into vendors table → Return success response → Frontend shows "Awaiting approval" message

2. **Admin Approval Flow**: Admin clicks approve → POST /api/admin/vendors/{id}/approve → Check admin role → Update users.status='approved', users.approved_at → Update vendors.tier, vendors.published=true → Return success → Frontend removes from pending list, shows toast

3. **Vendor Profile Edit Flow**: Vendor edits profile → PUT /api/vendors/{id} → Authenticate user → Validate tier restrictions → Update vendors table with allowed fields only → Return updated vendor → Frontend SWR cache revalidates → Dashboard shows updated data

**Flow Details**:
- **User Registration Flow**: Frontend uses React Hook Form with Zod validation, submits to API route, API route validates again (defense in depth), checks for duplicate email (unique constraint), hashes password with bcrypt (12 rounds), inserts into users table with role='vendor' and status='pending', inserts into vendors table with user_id foreign key and tier='free', commits transaction, returns 201 with vendorId
- **Admin Approval Flow**: Frontend fetches pending vendors list with SWR, displays in AdminApprovalQueue table, admin clicks "Approve" button, Dialog opens for confirmation, API route validates admin role (req.user.role === 'admin'), updates users.status='approved' and users.approved_at=NOW(), updates vendors.published=true, optionally sets vendors.tier if admin specifies, commits transaction, SWR cache revalidates on success, table updates to remove approved vendor
- **Vendor Profile Edit Flow**: Frontend VendorProfileEditor loads current profile with SWR, renders form with TierGate components hiding restricted fields, vendor edits allowed fields, submits form, API route authenticates JWT token, validates vendor owns this profile (req.user.vendor_id === params.id), checks tier restrictions (validateTierAccess function), filters out restricted fields from update payload, updates only allowed fields, commits transaction, returns updated vendor, SWR revalidates and re-renders form with new data

### State Management

**State Management Pattern**: Context API for authentication, SWR for server state, React Hook Form for form state

**Implementation Details**:
- AuthContext provides auth state and actions globally via React Context
- SWR handles all server data fetching with automatic caching and revalidation
- React Hook Form manages local form state with Zod validation
- No Redux or complex state management needed for this feature set

**State Stores**:
- **AuthContext**: `{ user: User | null, isAuthenticated: boolean, role: 'admin' | 'vendor' | null, tier: 'free' | 'tier1' | 'tier2' | null, login: (email, password) => Promise<void>, logout: () => void, refreshUser: () => Promise<void> }`
- **SWR Cache**: Automatic caching of GET requests with 5-minute stale time, manual revalidation on mutations

### Error Handling

**Error Handling Strategy**: Centralized error handling with consistent error response format, graceful degradation, user-friendly error messages

**Error Scenarios**:
- **Network Failure**: Show toast "Network error, please check your connection", enable retry button, preserve form data
- **Authentication Failure**: Clear auth token, redirect to login with return URL, show "Your session has expired, please log in again"
- **Validation Errors**: Display inline field errors (FormMessage components), show toast summary "Please fix the errors below", highlight invalid fields with red border
- **Tier Restriction Violation**: Show toast "This feature requires [tier name] subscription", display upgrade CTA button, log attempt for analytics
- **Database Errors**: Show generic error "An error occurred, please try again", log detailed error server-side, alert admin via monitoring
- **Migration Errors**: Halt migration, rollback database transaction, preserve original markdown files, show detailed error report with failed items

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "TIER_RESTRICTED",
    "message": "This feature requires Tier 2 subscription",
    "details": "Field 'products' is restricted to Tier 2 vendors",
    "timestamp": "2025-10-11T12:34:56Z"
  }
}
```

## Integration Points

### Existing Code Dependencies

#### **TinaCMSDataService Integration**

- **Purpose**: Replace TinaCMSDataService with PayloadCMSDataService for data access
- **Interface requirements**: Maintain same method signatures for backward compatibility (getVendors(), getProducts(), etc.)
- **Data exchange**: Return same data structures, internal implementation changes from markdown parsing to Payload API calls
- **Error handling**: Same error handling patterns, throw errors with consistent format

#### **Next.js Frontend Pages Integration**

- **Purpose**: Update existing pages to fetch data from Payload CMS APIs instead of TinaCMS markdown
- **Interface requirements**: Maintain same component props structure, update data fetching logic only
- **Data exchange**: Same data shape returned to components, source changes from markdown to API
- **Error handling**: Add loading states, error boundaries for API failures

### API Contracts

#### **GET /api/vendors**

**Purpose**: Fetch public vendor list for frontend display

**Request Structure**:
```json
{
  "published": true,
  "featured": false,
  "page": 1,
  "limit": 20
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "uuid",
        "companyName": "string",
        "slug": "string",
        "description": "string",
        "logo": "string",
        "tier": "free|tier1|tier2",
        "featured": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**Error Responses**: Standard error response format with codes: VALIDATION_ERROR, SERVER_ERROR

#### **GET /api/products**

**Purpose**: Fetch products for frontend display, optionally filtered by vendor

**Request Structure**:
```json
{
  "vendorId": "uuid",
  "published": true,
  "categories": ["category1", "category2"],
  "page": 1,
  "limit": 20
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "string",
        "slug": "string",
        "description": "string",
        "shortDescription": "string",
        "images": ["url1", "url2"],
        "vendor": {
          "id": "uuid",
          "companyName": "string",
          "slug": "string"
        },
        "categories": ["string"],
        "published": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

**Error Responses**: VALIDATION_ERROR, NOT_FOUND, SERVER_ERROR

### Database Interactions

#### **vendors Table**

**Operations**: SELECT, INSERT, UPDATE (no DELETE, use soft delete with published flag)

**Queries**:
- **Get Vendor by ID**: `SELECT * FROM vendors WHERE id = $1 AND published = true`
- **Get Vendor by User ID**: `SELECT * FROM vendors WHERE user_id = $1`
- **Get Published Vendors**: `SELECT * FROM vendors WHERE published = true ORDER BY created_at DESC LIMIT $1 OFFSET $2`
- **Get Featured Vendors**: `SELECT * FROM vendors WHERE published = true AND featured = true ORDER BY created_at DESC`
- **Update Vendor**: `UPDATE vendors SET company_name = $1, description = $2, ... WHERE id = $3 AND user_id = $4`

**Indexes**:
- Primary key on id
- Unique index on user_id
- Unique index on slug
- Composite index on (published, featured) for featured vendor queries
- Index on tier for tier-based filtering

**Constraints**:
- Foreign key user_id references users(id) ON DELETE CASCADE
- CHECK constraint on tier enum values
- NOT NULL on company_name, contact_email

#### **users Table**

**Operations**: SELECT, INSERT, UPDATE (status changes)

**Queries**:
- **Get User by Email**: `SELECT * FROM users WHERE email = $1`
- **Get Pending Users**: `SELECT * FROM users WHERE status = 'pending' ORDER BY created_at ASC`
- **Approve User**: `UPDATE users SET status = 'approved', approved_at = NOW() WHERE id = $1`
- **Reject User**: `UPDATE users SET status = 'rejected', rejected_at = NOW(), rejection_reason = $2 WHERE id = $1`

**Indexes**:
- Primary key on id
- Unique index on email
- Composite index on (role, status)
- Conditional index on (status, created_at) WHERE status = 'pending' for approval queue queries

**Constraints**:
- UNIQUE email
- CHECK status IN ('pending', 'approved', 'rejected', 'suspended')
- CHECK role IN ('admin', 'vendor')
- NOT NULL on email, password_hash, role

### External Services Integration

#### **Payload CMS Integration**

**Protocol**: Local API (JavaScript/TypeScript functions)
**Authentication**: N/A (local API uses direct database access)

**Endpoints**:
- **payload.find()**: Fetch documents from collections with query filters
- **payload.create()**: Insert new documents into collections
- **payload.update()**: Update existing documents by ID
- **payload.delete()**: Soft or hard delete documents

**Rate Limiting**: N/A (local API, no rate limits)
**Error Handling**: Try-catch blocks, return standardized error objects, log errors to console/monitoring
**Timeout Configuration**: Default database query timeout (30 seconds), configurable in Payload config

---

## Implementation Patterns

### Design Patterns

**Primary Patterns**:
- **Repository Pattern**: Abstract database access behind PayloadCMSDataService, separating data access from business logic
- **Service Layer Pattern**: Business logic (validation, tier checks, approval workflow) in service classes (VendorService, AuthService, ApprovalService)
- **Middleware Pattern**: Authentication and authorization as Express/Next.js middleware functions that wrap API routes
- **Strategy Pattern**: Different migration strategies for different content types (VendorMigrationStrategy, ProductMigrationStrategy, etc.)

**Pattern Selection Rationale**:
- Repository Pattern enables easy testing by mocking data access, supports future CMS changes
- Service Layer keeps API routes thin, promotes code reuse, centralizes business rules
- Middleware Pattern follows Next.js conventions, promotes DRY for auth checks
- Strategy Pattern allows independent migration of content types, supports phased rollout if needed

### Code Organization

```
/home/edwin/development/ptnextjs/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/route.ts
│   │   ├── vendors/
│   │   │   ├── register/route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   └── admin/
│   │       └── vendors/
│   │           ├── pending/route.ts
│   │           └── [id]/
│   │               ├── approve/route.ts
│   │               └── reject/route.ts
│   ├── vendor/
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── profile/page.tsx
│   │       └── layout.tsx
│   └── admin/
│       └── vendors/
│           └── pending/page.tsx
├── components/
│   ├── vendor/
│   │   ├── VendorRegistrationForm.tsx
│   │   ├── VendorLoginForm.tsx
│   │   ├── VendorDashboard.tsx
│   │   ├── VendorProfileEditor.tsx
│   │   └── VendorNavigation.tsx
│   ├── admin/
│   │   └── AdminApprovalQueue.tsx
│   └── shared/
│       ├── TierGate.tsx
│       └── SubscriptionTierBadge.tsx
├── lib/
│   ├── payload-cms-data-service.ts
│   ├── services/
│   │   ├── vendor-service.ts
│   │   ├── auth-service.ts
│   │   └── approval-service.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── types.ts
│   └── utils/
│       ├── tier-validation.ts
│       └── api-response.ts
├── payload/
│   ├── payload.config.ts
│   ├── collections/
│   │   ├── Users.ts
│   │   ├── Vendors.ts
│   │   ├── Products.ts
│   │   ├── Categories.ts
│   │   ├── BlogPosts.ts
│   │   ├── TeamMembers.ts
│   │   └── CompanyInfo.ts
│   └── access/
│       ├── isAdmin.ts
│       ├── isVendor.ts
│       └── tierRestrictions.ts
└── scripts/
    └── migration/
        ├── migrate-all.ts
        ├── migrate-vendors.ts
        ├── migrate-products.ts
        ├── migrate-categories.ts
        ├── migrate-blog.ts
        ├── migrate-team.ts
        ├── migrate-company.ts
        └── utils/
            ├── markdown-parser.ts
            └── validation.ts
```

**File Organization Guidelines**:
- **API routes**: Group by entity (vendors, products, admin), nested for sub-resources
- **Components**: Group by feature (vendor, admin) and reusability (shared)
- **Services**: One file per service class, focused single responsibility
- **Payload config**: Separate collections into individual files for maintainability
- **Migration scripts**: One script per content type, shared utilities in utils/ folder

### Naming Conventions

**Components**: PascalCase with descriptive names (VendorRegistrationForm, AdminApprovalQueue)
**Services**: PascalCase with "Service" suffix (VendorService, AuthService)
**Utilities**: camelCase for functions (validateTierAccess, hashPassword)
**Types/Interfaces**: PascalCase for types, descriptive names (Vendor, User, LoginRequest)
**Constants**: UPPER_SNAKE_CASE for true constants (MAX_PASSWORD_LENGTH, TIER_FREE)

**Variable Naming**:
- **Functions**: camelCase, verb-noun pattern (getUserById, validateInput)
- **Variables**: camelCase, descriptive names (vendorData, isAuthenticated)
- **Class methods**: camelCase, verb-noun pattern (createVendor, approveRegistration)

### Coding Standards

**Code Style Reference**: Follow guidelines from @.agent-os/standards/best-practices.md

**Key Standards**:
- **Indentation**: 2 spaces (never tabs)
- **Line length**: Maximum 100 characters
- **Comments**: Explain "why" not "what", TSDoc for public APIs
- **Error handling**: Always include proper error handling, never swallow errors silently
- **Type safety**: Use TypeScript for type safety, avoid `any` type, use strict mode

**Quality Requirements**:
- **Test coverage**: Minimum 80% coverage for new code (services, API routes, components)
- **Documentation**: All public APIs must be documented with TSDoc comments
- **Performance**: API endpoints must respond within 500ms for 95th percentile
- **Security**: All inputs validated, SQL injection prevention via parameterized queries, XSS prevention via React sanitization

---

## Performance Criteria

### Response Time Requirements

**Target Response Time**:
- API endpoints: < 200ms average, < 500ms 95th percentile
- Page load: < 2 seconds First Contentful Paint (FCP)
- Database queries: < 100ms for simple queries, < 500ms for complex queries

**Measurement Points**:
- API route middleware for request/response timing
- Next.js Analytics for frontend performance
- Database query logging for slow query detection

**Optimization Strategies**:
- Database indexing on frequently queried fields (email, slug, status)
- SWR caching for frontend data fetching (5-minute stale time)
- PostgreSQL connection pooling (max 20 connections)
- Lazy loading for dashboard components and images

### Throughput Requirements

**Target Throughput**:
- 100 concurrent users during peak times
- 1000 vendor registrations per day
- 10,000 API requests per hour

**Load Testing Scenarios**:
- Simulate 100 concurrent vendor logins
- Test admin approval workflow with 50 pending vendors
- Stress test vendor profile updates with 200 concurrent edits

**Scalability Requirements**:
- Horizontal scaling capability for Next.js frontend (multiple instances behind load balancer)
- PostgreSQL read replicas for read-heavy operations (vendor list, product catalog)
- CDN for static assets and images (Vercel Edge Network)

### Concurrency Requirements

**Concurrent Users**:
- Support 100 concurrent authenticated users
- Support 1000 concurrent anonymous users browsing public pages

**Resource Management**:
- Database connection pooling with max 20 connections
- JWT token validation caching to reduce database queries
- Rate limiting on API endpoints (100 requests per minute per user)

**Bottleneck Prevention**:
- Index on users(status, created_at) for pending vendor queries
- Pagination for all list endpoints (max 100 items per page)
- Background job queue for email notifications (future enhancement)

---

## Security Requirements

### Authentication Requirements

**Authentication Method**: JWT (JSON Web Tokens) with email/password credentials

**Token Management**:
- JWT tokens stored in httpOnly cookies (XSS protection)
- Access token expiry: 1 hour
- Refresh token expiry: 7 days
- Token rotation on refresh

**Session Handling**:
- Stateless authentication via JWT
- Server-side token blacklist for logout (in-memory cache with Redis fallback)
- Automatic token refresh on API calls when access token expires

### Authorization Requirements

**Authorization Model**: Role-Based Access Control (RBAC) with tier-based feature flags

**Permission Validation**:
- Middleware validates JWT and extracts user role/tier
- Access control functions check permissions before data operations
- UI components hide/show features based on user tier (TierGate component)

**Access Control**:
- Admin role: Full access to all collections and admin routes
- Vendor role: Access to own vendor profile and products only
- Tier restrictions enforced at both UI and API levels (defense in depth)

### Data Protection

**Encryption Standard**:
- TLS 1.3 for data in transit (HTTPS enforced)
- Bcrypt with 12 rounds for password hashing

**Data at Rest**:
- Database-level encryption at rest (PostgreSQL encryption)
- Sensitive fields (password_hash) never exposed in API responses

**Data in Transit**:
- All API calls use HTTPS (TLS 1.3)
- JWT tokens transmitted via httpOnly cookies

**Sensitive Data Handling**:
- Passwords never logged or stored in plain text
- Email addresses masked in logs (e.g., "e***@example.com")
- PII (Personally Identifiable Information) access logged for audit trails

### Input Validation

**Validation Approach**:
- Server-side validation with Zod schemas matching TypeScript types
- Client-side validation with React Hook Form + Zod for UX
- SQL injection prevention via parameterized queries (Payload CMS/Postgres)
- XSS prevention via React automatic escaping + Content Security Policy headers

**Sanitization Rules**:
- HTML input sanitized with DOMPurify before rendering
- File uploads restricted to images only, max 5MB, validated MIME types
- SQL queries use parameterized statements only (no string concatenation)

**Injection Prevention**:
- Parameterized queries for all database operations
- CSP headers to prevent XSS attacks
- Rate limiting to prevent brute force attacks (100 requests/minute per IP)
- Input length limits (company name: 100 chars, description: 5000 chars)

---

## Quality Validation Requirements

### Technical Depth Validation

**Implementation Readiness**:
- All API endpoints have defined request/response schemas with TypeScript interfaces
- Database schema includes all tables, columns, indexes, and foreign keys
- Component architecture defines props, state, and event handlers
- Migration scripts have step-by-step transformation logic

**Technical Accuracy**:
- Payload CMS configuration validated against official documentation
- PostgreSQL schema follows best practices (normalization, indexing)
- JWT implementation follows RFC 7519 standard
- React component patterns follow official React documentation

**Completeness Check**:
- All 10 spec scope items have corresponding implementation sections
- All user stories map to specific features and code components
- All database tables have migration scripts
- All API endpoints have corresponding frontend integration code

### Integration Validation

**Compatibility Assessment**:
- Payload CMS integrates with Next.js 14 App Router (verified in documentation)
- PostgreSQL 17+ compatible with Payload CMS 2.x (verified)
- shadcn/ui components compatible with Next.js 14 (verified)
- Existing TinaCMSDataService interface can be replicated for PayloadCMSDataService

**Dependency Validation**:
- Payload CMS dependencies: payload, @payloadcms/db-postgres, @payloadcms/next
- Authentication dependencies: JWT library (jsonwebtoken), bcrypt
- Migration dependencies: gray-matter, unified, remark
- All dependencies have stable versions available on npm

**API Contract Validation**:
- All API endpoints return consistent response format (`{ success, data, error }`)
- TypeScript types shared between frontend and backend
- Zod schemas ensure runtime type safety matching TypeScript types

### Performance Validation

**Performance Benchmarks**:
- API response times measurable with middleware timing
- Database query performance tracked with EXPLAIN ANALYZE
- Frontend performance measured with Lighthouse CI in CI/CD pipeline

**Resource Requirements**:
- PostgreSQL: 2 CPU cores, 4GB RAM minimum for 100 concurrent users
- Next.js: 1 CPU core, 2GB RAM per instance
- Database storage: 10GB initial, 1GB growth per 1000 vendors

**Scalability Assessment**:
- Next.js instances horizontally scalable (stateless)
- PostgreSQL vertically scalable (connection pooling, read replicas)
- Payload CMS local API supports horizontal scaling via Next.js instances

### Security Validation

**Security Standards Compliance**:
- OWASP Top 10 mitigation strategies implemented (SQL injection, XSS, CSRF, etc.)
- JWT authentication follows RFC 7519 standard
- Password hashing uses bcrypt with 12 rounds (OWASP recommended)

**Vulnerability Assessment**:
- Dependency scanning with npm audit in CI/CD pipeline
- SQL injection prevention via parameterized queries (no string concatenation)
- XSS prevention via React sanitization + CSP headers
- CSRF prevention via SameSite cookies and CSRF tokens on state-changing operations

**Authentication/Authorization Validation**:
- JWT tokens expire after 1 hour (short-lived access tokens)
- Refresh tokens stored in httpOnly cookies (XSS protection)
- Role and tier checks enforced at middleware level (cannot be bypassed)
- Admin routes require admin role check before any operation

---

## Technical Requirements

- **Payload CMS**: Install Payload CMS 2.x with PostgreSQL adapter (@payloadcms/db-postgres)
- **PostgreSQL**: Set up PostgreSQL 17+ database with connection pooling
- **Authentication**: Implement JWT-based authentication with bcrypt password hashing (12 rounds)
- **Tiered Access Control**: Create access control functions for tier restrictions (free, tier1, tier2)
- **Migration Scripts**: Build automated migration scripts to convert all TinaCMS markdown to Payload CMS
- **Frontend Updates**: Refactor Next.js pages to use Payload CMS APIs instead of TinaCMSDataService
- **TypeScript Types**: Define comprehensive TypeScript interfaces for all collections and API contracts
- **Validation**: Implement Zod schemas for runtime validation matching TypeScript types
- **Error Handling**: Centralized error handling with consistent error response format
- **Testing**: Unit tests for services (80%+ coverage), integration tests for API routes, E2E tests for critical paths
- **Security**: HTTPS enforcement, httpOnly cookies, CSRF protection, rate limiting, input sanitization
- **Performance**: Database indexing, SWR caching, lazy loading, connection pooling
- **Documentation**: TSDoc comments for all public APIs, README for migration process, API documentation

---

## External Dependencies

- **Payload CMS** - Headless CMS with database backend
  - **Justification:** Required for vendor self-enrollment, authentication, and database-backed content management
  - **Version Requirements:** ^3.0.0 (latest stable, Payload CMS 3+)

- **@payloadcms/db-sqlite** - SQLite adapter for Payload CMS (development)
  - **Justification:** Simple file-based database for local development, zero configuration
  - **Version Requirements:** ^3.0.0 (matching Payload CMS version)

- **@payloadcms/db-postgres** - PostgreSQL adapter for Payload CMS (production)
  - **Justification:** Scalable database for production deployment
  - **Version Requirements:** ^3.0.0 (matching Payload CMS version)

- **@payloadcms/next** - Next.js integration for Payload CMS
  - **Justification:** Required to integrate Payload CMS admin interface with Next.js App Router
  - **Version Requirements:** ^3.0.0 (matching Payload CMS version)

- **better-sqlite3** - Native SQLite3 bindings (development)
  - **Justification:** Required by @payloadcms/db-sqlite for SQLite database access
  - **Version Requirements:** ^11.0.0 (latest stable)

- **pg** - PostgreSQL client for Node.js (production)
  - **Justification:** Required for production PostgreSQL database connection
  - **Version Requirements:** ^8.11.0 (latest stable)

- **jsonwebtoken** - JWT token generation and validation
  - **Justification:** Required for stateless authentication
  - **Version Requirements:** ^9.0.0 (latest stable)

- **bcrypt** - Password hashing library
  - **Justification:** Required for secure password storage
  - **Version Requirements:** ^5.1.0 (latest stable)

- **zod** - TypeScript-first schema validation
  - **Justification:** Required for runtime input validation matching TypeScript types
  - **Version Requirements:** Already installed (^3.23.8), no new dependency

- **gray-matter** - Markdown frontmatter parser
  - **Justification:** Required for parsing TinaCMS markdown files during migration
  - **Version Requirements:** ^4.0.3 (latest stable)

- **swr** - React Hooks for data fetching
  - **Justification:** Already installed (^2.2.4), used for frontend API data fetching with caching
  - **Version Requirements:** Already installed, no new dependency

- **react-hook-form** - Form state management
  - **Justification:** Already installed (^7.53.0), used for vendor registration and profile editing forms
  - **Version Requirements:** Already installed, no new dependency
