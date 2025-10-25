# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-24-tier-structure-implementation/spec.md

## Feature Classification

**Feature Type**: FULL_STACK

**Frontend Required**: YES
**Backend Required**: YES

**Justification**: This feature requires database schema changes (Payload CMS collections), backend validation and access control logic, API endpoints for profile management, and extensive frontend UI for both vendor dashboard and public-facing profile display. The tier system affects data model, business logic, and presentation layers.

---

## Backend Implementation

### Database Schema

#### **Vendor Collection Updates**

**Purpose**: Extend vendors collection with all tier-specific fields

**Schema Changes**:
```typescript
// payload/collections/Vendors.ts

// Add Tier 3 to tier options
{
  name: 'tier',
  type: 'select',
  options: [
    { label: 'Free - Basic Company Profile', value: 'free' },
    { label: 'Tier 1 - Enhanced Brand Profile', value: 'tier1' },
    { label: 'Tier 2 - Product Showcase Profile', value: 'tier2' },
    { label: 'Tier 3 - Promoted Visibility & Editorial', value: 'tier3' },
  ],
  defaultValue: 'free',
  required: true,
}

// Add Founded Year field (replaces yearsInBusiness)
{
  name: 'foundedYear',
  type: 'number',
  min: 1800,
  max: new Date().getFullYear(),
  admin: {
    description: 'Year company was founded (used to calculate years in business)',
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { 'user': { equals: user.id } };
    },
  },
}

// Add Tier 1+ Social Proof fields
{
  name: 'totalProjects',
  type: 'number',
  min: 0,
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'employeeCount',
  type: 'number',
  min: 0,
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'linkedinFollowers',
  type: 'number',
  min: 0,
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'instagramFollowers',
  type: 'number',
  min: 0,
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'clientSatisfactionScore',
  type: 'number',
  min: 0,
  max: 100,
  admin: {
    description: 'Client satisfaction percentage (0-100)',
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'repeatClientPercentage',
  type: 'number',
  min: 0,
  max: 100,
  admin: {
    description: 'Percentage of repeat clients (0-100)',
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}

// Add Certifications array (Tier 1+)
{
  name: 'certifications',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'issuer', type: 'text', required: true },
    { name: 'year', type: 'number', required: true },
    { name: 'expiryDate', type: 'date' },
    { name: 'certificateNumber', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'verificationUrl', type: 'text' },
  ],
}

// Add Awards array (Tier 1+)
{
  name: 'awards',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'organization', type: 'text', required: true },
    { name: 'year', type: 'number', required: true },
    { name: 'category', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

// Add Video Introduction fields (Tier 1+)
{
  name: 'videoUrl',
  type: 'text',
  admin: {
    description: 'YouTube, Vimeo, or direct video URL',
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'videoThumbnail',
  type: 'upload',
  relationTo: 'media',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'videoDuration',
  type: 'text',
  admin: {
    description: 'Duration in format MM:SS',
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'videoTitle',
  type: 'text',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}
{
  name: 'videoDescription',
  type: 'textarea',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}

// Add Case Studies array (Tier 1+)
{
  name: 'caseStudies',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'yachtName', type: 'text' },
    { name: 'yacht', type: 'relationship', relationTo: 'yachts' },
    { name: 'projectDate', type: 'date', required: true },
    { name: 'challenge', type: 'textarea', required: true },
    { name: 'solution', type: 'textarea', required: true },
    { name: 'results', type: 'textarea' },
    { name: 'testimonyQuote', type: 'textarea' },
    { name: 'testimonyAuthor', type: 'text' },
    { name: 'testimonyRole', type: 'text' },
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}

// Add Innovation Highlights array (Tier 1+)
{
  name: 'innovationHighlights',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'year', type: 'number' },
    { name: 'patentNumber', type: 'text' },
    { name: 'benefits', type: 'array', fields: [{ name: 'benefit', type: 'text' }] },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

// Add Team Members array (Tier 1+)
{
  name: 'teamMembers',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'linkedinUrl', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
}

// Add Yacht Projects array (Tier 1+)
{
  name: 'yachtProjects',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'yacht', type: 'relationship', relationTo: 'yachts' },
    { name: 'yachtName', type: 'text' },
    { name: 'role', type: 'text', required: true },
    { name: 'completionDate', type: 'date' },
    { name: 'systemsInstalled', type: 'array', fields: [{ name: 'system', type: 'text' }] },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}

// Add Service Areas array (Tier 1+)
{
  name: 'serviceAreas',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'area', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'icon', type: 'text' }, // Lucide icon name
  ],
}

// Add Company Values array (Tier 1+)
{
  name: 'companyValues',
  type: 'array',
  admin: {
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
  fields: [
    { name: 'value', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
  ],
}

// Add Long Description (Tier 1+)
{
  name: 'longDescription',
  type: 'richText',
  admin: {
    description: 'Extended company description with rich text formatting',
    condition: (data) => ['tier1', 'tier2', 'tier3'].includes(data.tier),
  },
}

// Add Tier 2+ fields
{
  name: 'featuredInCategory',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Featured positioning within category listings (Tier 2+)',
    condition: (data) => ['tier2', 'tier3'].includes(data.tier),
  },
  access: {
    update: isAdmin, // Only admins can set featured status
  },
}
{
  name: 'advancedAnalytics',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Enable advanced analytics (Tier 2+)',
    condition: (data) => ['tier2', 'tier3'].includes(data.tier),
  },
  access: {
    update: isAdmin,
  },
}
{
  name: 'apiAccess',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Enable API integration access (Tier 2+)',
    condition: (data) => ['tier2', 'tier3'].includes(data.tier),
  },
  access: {
    update: isAdmin,
  },
}
{
  name: 'customDomain',
  type: 'text',
  admin: {
    description: 'Custom domain for vendor profile (Tier 2+)',
    condition: (data) => ['tier2', 'tier3'].includes(data.tier),
  },
  access: {
    update: isAdmin,
  },
}

// Add Tier 3 Promotion Pack fields
{
  name: 'promotionPack',
  type: 'group',
  admin: {
    condition: (data) => data.tier === 'tier3',
  },
  fields: [
    {
      name: 'featuredPlacement',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Homepage or category feature slots',
      },
      access: {
        update: isAdmin,
      },
    },
    {
      name: 'editorialCoverage',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Inclusion in news or insight sections',
      },
      access: {
        update: isAdmin,
      },
    },
    {
      name: 'searchHighlight',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Highlighted search result display',
      },
      access: {
        update: isAdmin,
      },
    },
  ],
}

// Add Editorial Content array (Tier 3)
{
  name: 'editorialContent',
  type: 'array',
  admin: {
    description: 'Platform-curated editorials and feature articles',
    condition: (data) => data.tier === 'tier3',
  },
  access: {
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'body', type: 'richText', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'publishDate', type: 'date', required: true },
  ],
}
```

**Migrations**:
- Add migration to add Tier 3 option to existing tier enum
- Add migration to create all new fields with null defaults
- No data migration needed initially (vendors keep existing data)

---

### API Endpoints

#### **GET /api/portal/vendors/[id]**

**Purpose**: Fetch vendor profile data for dashboard editing

**Authentication**: Required
**Authorization**: Vendor can only access their own profile, admins can access any

**Request**:
```typescript
// No request body, ID in URL path
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    id: string
    tier: 'free' | 'tier1' | 'tier2' | 'tier3'
    companyName: string
    slug: string
    description: string
    logo: MediaObject | null
    contactEmail: string
    contactPhone: string
    // ... all tier-appropriate fields
    yearsInBusiness: number | null // computed field
    foundedYear: number | null
    // ... arrays and rich content
  }
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized (not logged in)
- 403: Forbidden (accessing other vendor's profile)
- 404: Vendor not found
- 500: Server error

---

#### **PUT /api/portal/vendors/[id]**

**Purpose**: Update vendor profile with tier validation

**Authentication**: Required
**Authorization**: Vendor can only update their own profile, admins can update any

**Request**:
```typescript
interface RequestBody {
  companyName?: string
  description?: string
  logo?: string // Media ID
  contactEmail?: string
  contactPhone?: string
  website?: string // Tier 1+
  linkedinUrl?: string // Tier 1+
  twitterUrl?: string // Tier 1+
  foundedYear?: number // Tier 1+
  certifications?: Array<{
    name: string
    issuer: string
    year: number
    expiryDate?: string
    certificateNumber?: string
    logo?: string
    verificationUrl?: string
  }> // Tier 1+
  // ... other tier-specific fields
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    id: string
    // ... updated vendor object
    yearsInBusiness: number | null // recomputed
  }
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: string
  }
}
```

**Status Codes**:
- 200: Success
- 400: Validation error (tier restrictions, invalid data)
- 401: Unauthorized
- 403: Forbidden
- 404: Vendor not found
- 500: Server error

---

#### **GET /api/vendors/[slug]**

**Purpose**: Public API to fetch vendor profile by slug

**Authentication**: Public (no auth required)
**Authorization**: N/A (public endpoint)

**Request**:
```typescript
// Query params for filtering
interface QueryParams {
  includeUnpublished?: boolean // Admin only
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    id: string
    tier: 'free' | 'tier1' | 'tier2' | 'tier3'
    companyName: string
    slug: string
    description: string
    logo: MediaObject | null
    // ... all public fields (tier-filtered)
    yearsInBusiness: number | null
    // Arrays filtered by tier
    locations: Location[] // Free: 1 HQ, Tier1: 3 max, Tier2+: all
    certifications: Certification[] // Tier 1+
    awards: Award[] // Tier 1+
    // ... etc
  }
}
```

**Status Codes**:
- 200: Success
- 404: Vendor not found or not published
- 500: Server error

---

### Business Logic

**Core Business Rules**:
1. **Tier Hierarchy**: Each tier inherits all features from lower tiers (Tier 3 includes all Tier 1 & 2 features)
2. **Field Access**: Users cannot edit fields above their tier level; attempts return 403 Forbidden
3. **Location Limits**: Free tier limited to 1 HQ location, Tier 1 limited to 3 locations, Tier 2+ unlimited
4. **Featured Status**: Only Tier 3 vendors can have `featured` flag set to true (admin-only)
5. **Years in Business Computation**: Computed as `currentYear - foundedYear` when foundedYear exists, otherwise null
6. **Data Retention**: When tier is downgraded, data above new tier level is preserved but hidden (not deleted)
7. **Validation**: All tier-specific fields must pass validation even if conditionally hidden in UI

**Validation Requirements**:
- **Server-side**: All field updates validated against tier permissions on server
- **Tier Downgrade**: Validate location count doesn't exceed new tier limit, warn admin if trimming needed
- **Data Integrity**: Arrays must not exceed reasonable limits (e.g., max 20 certifications, 50 case studies)
- **URL Sanitization**: All URL fields sanitized using existing `sanitizeUrlHook`
- **Email Validation**: Contact email validated for proper format
- **Year Validation**: Founded year must be between 1800 and current year

**Service Layer Architecture**:

- **TierValidationService** (`lib/services/TierValidationService.ts`):
  - Methods: `validateFieldAccess(tier, fieldName)`, `validateLocationLimit(tier, locationCount)`, `canAccessFeature(tier, feature)`
  - Dependencies: Tier configuration constants

- **VendorComputedFieldsService** (`lib/services/VendorComputedFieldsService.ts`):
  - Methods: `computeYearsInBusiness(foundedYear)`, `enrichVendorData(vendor)`
  - Dependencies: Date utilities

- **VendorProfileService** (`lib/services/VendorProfileService.ts`):
  - Methods: `getVendorProfile(slug)`, `updateVendorProfile(id, data, user)`, `validateTierData(vendor, tier)`
  - Dependencies: Payload CMS, TierValidationService, VendorComputedFieldsService

---

## Frontend Implementation

### UI Components

#### **VendorDashboard** (Page Component)

- **Type**: Page
- **Purpose**: Main container for vendor profile management with authentication and tier awareness
- **User Interactions**: Tab navigation, save profile, view public profile preview
- **State Management**: Local state for active tab, form dirty state, save status
- **Routing**: `/portal/dashboard`

---

#### **ProfileEditTabs** (Container Component)

- **Type**: Tabbed Container
- **Purpose**: Organize profile editing into logical sections with tier-aware tab visibility
- **Props**: `vendor: Vendor`, `onSave: (data: Partial<Vendor>) => Promise<void>`, `tier: TierLevel`
- **Events**: `onTabChange`, `onSave`, `onError`
- **Tabs**:
  - Basic Info (All tiers)
  - Locations (All tiers, with limits)
  - Brand Story (Tier 1+)
  - Certifications & Awards (Tier 1+)
  - Case Studies (Tier 1+)
  - Team (Tier 1+)
  - Products (Tier 2+)
  - Promotion (Tier 3 only)

---

#### **BasicInfoForm** (Form Component)

- **Type**: Form
- **Purpose**: Edit core vendor information available to all tiers
- **Props**: `vendor: Vendor`, `onSubmit: (data) => void`, `disabled: boolean`
- **Events**: `onSubmit`, `onChange`, `onValidationError`
- **Fields**: Company name, slug, description, logo upload, contact email, contact phone
- **State**: Form validation, upload progress, error messages

---

#### **BrandStoryForm** (Form Component - Tier 1+)

- **Type**: Form
- **Purpose**: Extended brand storytelling with social proof metrics
- **Props**: `vendor: Vendor`, `tier: TierLevel`, `onSubmit: (data) => void`
- **Fields**:
  - Website, LinkedIn, Twitter URLs
  - Founded Year (with auto-computed Years in Business display)
  - Social proof metrics (projects, employees, followers, satisfaction scores)
  - Video introduction fields
  - Long description (rich text editor)
  - Service areas array
  - Company values array
- **Upgrade Prompt**: Shown to Free tier users with "Unlock Brand Story" CTA

---

#### **CertificationsAwardsManager** (Array Manager - Tier 1+)

- **Type**: Array Manager
- **Purpose**: CRUD interface for certifications and awards with image uploads
- **Props**: `certifications: Certification[]`, `awards: Award[]`, `onUpdate: (data) => void`, `tier: TierLevel`
- **Events**: `onAdd`, `onEdit`, `onDelete`, `onReorder`
- **Features**: Add/edit modal, delete confirmation, drag-to-reorder, image preview

---

#### **CaseStudiesManager** (Array Manager - Tier 1+)

- **Type**: Array Manager with Rich Content
- **Purpose**: Manage detailed project case studies with testimonials and images
- **Props**: `caseStudies: CaseStudy[]`, `onUpdate: (data) => void`, `tier: TierLevel`
- **Events**: `onAdd`, `onEdit`, `onDelete`, `onToggleFeatured`
- **Features**: Full-screen editor modal, rich text editor, image gallery, yacht lookup, featured toggle

---

#### **TeamMembersManager** (Array Manager - Tier 1+)

- **Type**: Array Manager
- **Purpose**: Manage team member profiles with photos and ordering
- **Props**: `teamMembers: TeamMember[]`, `onUpdate: (data) => void`
- **Events**: `onAdd`, `onEdit`, `onDelete`, `onReorder`
- **Features**: Photo upload, LinkedIn integration, display order control, card preview

---

#### **VendorProfilePage** (Public Page)

- **Type**: Page
- **Purpose**: Display vendor profile to public visitors with tier-responsive sections
- **User Interactions**: View profile sections, click case studies, view team, contact vendor
- **State Management**: API data fetching with SWR
- **Routing**: `/vendors/[slug]`

---

#### **VendorCard** (List Item Component)

- **Type**: Card
- **Purpose**: Display vendor summary in search results and listings
- **Props**: `vendor: Vendor`, `featured?: boolean`, `showTierBadge?: boolean`
- **User Interactions**: Click to view full profile
- **Responsive**: Mobile: stacked, Desktop: horizontal layout with image
- **Tier Indicators**: Visual badge for tier level, featured star icon for Tier 3 featured vendors

---

#### **TierUpgradePrompt** (Modal/Card Component)

- **Type**: Modal
- **Purpose**: Encourage tier upgrade by showing locked features and benefits
- **Props**: `currentTier: TierLevel`, `targetTier: TierLevel`, `feature: string`, `onClose: () => void`
- **Features**: Benefits comparison, pricing info, "Contact Sales" CTA
- **Styling**: shadcn Dialog component with Card layout

---

#### **YearsInBusinessDisplay** (Display Component)

- **Type**: Read-only Display
- **Purpose**: Show computed years in business with visual emphasis
- **Props**: `foundedYear: number | null`, `showLabel?: boolean`
- **Computation**: Displays `currentYear - foundedYear` or "Not specified" if null
- **Styling**: Badge or inline text with icon

---

### Frontend State Management

**State Management Pattern**: React Context API + SWR for data fetching

**State Stores Required**:
- **VendorDashboardContext**: Manages active vendor profile, edit state, save status
  - State shape: `{ vendor: Vendor | null, loading: boolean, saving: boolean, error: Error | null, activeTab: string }`
  - Actions: `updateVendor(data)`, `saveVendor()`, `setActiveTab(tab)`, `refreshVendor()`
  - Computed: `yearsInBusiness: number | null` (computed from foundedYear)

- **TierAccessContext**: Provides tier checking utilities throughout app
  - State shape: `{ tier: TierLevel, features: Record<string, boolean> }`
  - Actions: `canAccessField(fieldName)`, `canAccessFeature(featureName)`, `getLocationLimit()`
  - Computed: Feature flags based on tier

---

### Frontend Routing

**Routes Required**:
- **/portal/dashboard**: VendorDashboard (Main editing interface)
- **/vendors/[slug]**: VendorProfilePage (Public profile display)
- **/vendors**: VendorListingPage (List with tier-aware cards)

**Route Guards**:
- `/portal/dashboard` requires authentication and vendor role
- Public routes accessible without authentication

---

### User Interface Specifications

**Design Requirements**:
- **Responsive Breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (≥1024px)
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader labels
- **Loading States**: Skeleton loaders for profile sections, spinner for save actions
- **Error States**: Toast notifications for errors, inline validation messages
- **Empty States**: Friendly prompts to add content (certifications, case studies, etc.)

**Form Validations**:
- **companyName**: Required, 1-255 characters
- **contactEmail**: Required, valid email format
- **foundedYear**: Optional (Tier 1+), 1800 ≤ year ≤ current year
- **website**: Optional (Tier 1+), valid URL format
- **certifications[].name**: Required when adding certification
- **certifications[].year**: Required, must be valid year

---

### Component Architecture

**UI Component Strategy**: shadcn/ui component library with Radix UI primitives

**Component Library**: shadcn/ui (latest)

**Library Components to Use**:

- **Button** (`@/components/ui/button`): Primary actions (Save, Add, Edit, Delete)
  - Usage: Form submissions, action triggers
  - Variants: default, destructive, outline, ghost, link
  - Props: variant, size, disabled, loading (custom), onClick

- **Card** (`@/components/ui/card`): Container for profile sections and vendor cards
  - Usage: Section wrappers, list items
  - Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  - Props: className, children

- **Tabs** (`@/components/ui/tabs`): Profile editing navigation
  - Usage: VendorDashboard section organization
  - Sub-components: TabsList, TabsTrigger, TabsContent
  - Props: value, onValueChange, defaultValue

- **Form** (`@/components/ui/form`): Form field management with React Hook Form
  - Usage: All edit forms
  - Sub-components: FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
  - Props: form (from useForm hook)

- **Input** (`@/components/ui/input`): Text inputs
  - Usage: Text fields throughout forms
  - Props: type, placeholder, value, onChange, disabled

- **Textarea** (`@/components/ui/textarea`): Multi-line text inputs
  - Usage: Description fields, long text
  - Props: placeholder, value, onChange, rows, maxLength

- **Label** (`@/components/ui/label`): Form field labels
  - Usage: Input labels with proper accessibility
  - Props: htmlFor, children

- **Badge** (`@/components/ui/badge`): Tier indicators, status labels
  - Usage: Tier badges, featured indicators, status tags
  - Variants: default, secondary, destructive, outline
  - Props: variant, className

- **Dialog** (`@/components/ui/dialog`): Modals for editing and confirmations
  - Usage: Add/edit modals, upgrade prompts, confirmations
  - Sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
  - Props: open, onOpenChange

- **Alert** (`@/components/ui/alert`): Inline notifications and warnings
  - Usage: Tier limit warnings, feature restrictions
  - Sub-components: AlertTitle, AlertDescription
  - Variants: default, destructive
  - Props: variant, className

- **Separator** (`@/components/ui/separator`): Visual dividers
  - Usage: Section separators in forms and profiles
  - Props: orientation, className

- **Select** (`@/components/ui/select`): Dropdown selectors
  - Usage: Category selection, option pickers
  - Sub-components: SelectTrigger, SelectContent, SelectItem, SelectValue
  - Props: value, onValueChange

- **Checkbox** (`@/components/ui/checkbox`): Boolean toggles
  - Usage: Feature flags, featured toggles, boolean fields
  - Props: checked, onCheckedChange, disabled

- **Avatar** (`@/components/ui/avatar`): User and team member photos
  - Usage: Team member display, vendor logo fallback
  - Sub-components: AvatarImage, AvatarFallback
  - Props: src, alt

- **Toast** (`@/components/ui/toast`): Notification system
  - Usage: Success/error messages, save confirmations
  - Implementation: useToast hook
  - Props: title, description, variant

- **ScrollArea** (`@/components/ui/scroll-area`): Scrollable containers
  - Usage: Long lists (locations, certifications)
  - Props: className, children

**Custom Components** (built on library):

- **TierBadge**: Combines Badge with tier-specific styling
  - Built from: Badge
  - Purpose: Consistent tier level display
  - Props: tier: TierLevel, size?: 'sm' | 'md' | 'lg'

- **UpgradePromptCard**: Combines Card + Dialog + Button
  - Built from: Card, Dialog, Button
  - Purpose: Feature upgrade prompts throughout dashboard
  - Props: currentTier, featureName, onContactSales

- **ArrayFieldManager**: Generic array CRUD interface
  - Built from: Card, Button, Dialog, Form, ScrollArea
  - Purpose: Reusable pattern for managing array fields (certifications, awards, etc.)
  - Props: items, onAdd, onEdit, onDelete, renderItem, addLabel

- **RichTextEditor**: Wrapper for Lexical editor with toolbar
  - Built from: Custom integration with @payloadcms/richtext-lexical
  - Purpose: Rich content editing for longDescription, case studies
  - Props: initialValue, onChange, placeholder, maxLength

- **MediaUploader**: File upload with preview
  - Built from: Input, Button, Card, Avatar
  - Purpose: Image and file uploads with progress and preview
  - Props: accept, maxSize, onUpload, preview, value

- **ComputedFieldDisplay**: Read-only computed value display
  - Built from: Label, Badge or inline text
  - Purpose: Show computed fields like yearsInBusiness
  - Props: label, value, format?: (value) => string

---

### Page Layout Architecture

**Layout Approach**: CSS Grid + Flexbox with shadcn layout patterns

**Global Layout Structure**:
```
┌─────────────────────────────────────┐
│  Header (h-16)                       │
│  - Logo, Nav, User Menu              │
├──────┬──────────────────────────────┤
│      │                              │
│ Nav  │  Main Content Area           │
│ Bar  │  Dashboard or Profile        │
│ (if) │  (max-w-7xl mx-auto)         │
│      │                              │
└──────┴──────────────────────────────┘
```

**Layout Implementation**:
- Using: CSS Grid for page structure, Flexbox for components
- Grid configuration: 1 column on mobile, optional sidebar on desktop
- Breakpoints: 640px (mobile), 1024px (desktop)

**Page-Specific Layouts**:

#### Vendor Dashboard Layout
- **Layout Pattern**: Tabbed Dashboard
- **Structure**:
  ```
  Dashboard Container (max-w-7xl mx-auto px-4)
  ├── Header area
  │   ├── Breadcrumbs (Home > Dashboard)
  │   ├── Page Title ("Vendor Profile")
  │   └── Action Buttons (Preview, Save)
  ├── Main content
  │   ├── Tabs Navigation (sticky on scroll)
  │   └── Tab Content (form sections)
  └── Sidebar (desktop only, right side)
      ├── Tier Badge & Info
      ├── Quick Actions
      └── Help Links
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): Sidebar visible, tabs horizontal
  - Tablet (640-1024px): No sidebar, tabs horizontal scrollable
  - Mobile (<640px): No sidebar, tabs as dropdown select

#### Vendor Profile Layout
- **Layout Pattern**: Article/Profile Display
- **Structure**:
  ```
  Profile Container (max-w-6xl mx-auto)
  ├── Header area
  │   ├── Vendor Hero (logo, name, description)
  │   └── Action Bar (Contact, Share, Follow)
  ├── Main content sections (stacked)
  │   ├── About (tier-aware)
  │   ├── Locations Map (tier-aware count)
  │   ├── Certifications Grid (Tier 1+)
  │   ├── Case Studies (Tier 1+)
  │   ├── Team (Tier 1+)
  │   └── Products (Tier 2+)
  └── Sidebar (desktop only)
      ├── Quick Contact Card
      ├── Social Links
      └── Related Vendors
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): 2-column grid (main 66%, sidebar 33%)
  - Tablet (640-1024px): 2-column grid (main 60%, sidebar 40%)
  - Mobile (<640px): Single column stack, sidebar content inline

**Component Hierarchy** (VendorDashboard page):
```
VendorDashboardPage
├── DashboardHeader
│   ├── Breadcrumbs
│   ├── PageTitle
│   └── ActionButtons
│       ├── PreviewButton
│       └── SaveButton
├── MainDashboardContainer
│   ├── ProfileEditTabs
│   │   ├── TabsList
│   │   │   ├── TabsTrigger ("Basic Info")
│   │   │   ├── TabsTrigger ("Locations")
│   │   │   ├── TabsTrigger ("Brand Story") [Tier 1+ only]
│   │   │   ├── TabsTrigger ("Certifications") [Tier 1+ only]
│   │   │   ├── TabsTrigger ("Case Studies") [Tier 1+ only]
│   │   │   ├── TabsTrigger ("Team") [Tier 1+ only]
│   │   │   ├── TabsTrigger ("Products") [Tier 2+ only]
│   │   │   └── TabsTrigger ("Promotion") [Tier 3 only]
│   │   ├── TabsContent ("Basic Info")
│   │   │   └── BasicInfoForm
│   │   ├── TabsContent ("Locations")
│   │   │   └── LocationsManagerCard (existing)
│   │   ├── TabsContent ("Brand Story")
│   │   │   └── BrandStoryForm
│   │   │       ├── FoundedYearInput
│   │   │       ├── YearsInBusinessDisplay (computed, read-only)
│   │   │       ├── SocialProofMetricsSection
│   │   │       └── VideoIntroductionSection
│   │   ├── TabsContent ("Certifications")
│   │   │   └── CertificationsAwardsManager
│   │   │       ├── CertificationsArrayManager
│   │   │       └── AwardsArrayManager
│   │   ├── TabsContent ("Case Studies")
│   │   │   └── CaseStudiesManager
│   │   ├── TabsContent ("Team")
│   │   │   └── TeamMembersManager
│   │   ├── TabsContent ("Products")
│   │   │   └── ProductsManager
│   │   └── TabsContent ("Promotion")
│   │       └── PromotionPackForm
└── DashboardSidebar (desktop only)
    ├── TierInfoCard
    │   ├── TierBadge
    │   └── UpgradePromptCard [if not Tier 3]
    ├── QuickActionsCard
    └── HelpLinksCard
```

---

### Navigation Architecture

**Navigation Pattern**: Top navigation bar (no sidebar for public site, optional for dashboard)

**Navigation Structure**:
```
Primary Top Nav
├── Home (/)
├── Vendors (/vendors)
├── Products (/products)
├── Resources (/resources)
└── UserMenu (dropdown, if authenticated)
    ├── Dashboard (/portal/dashboard)
    ├── Settings (/portal/settings)
    └── Logout
```

**Navigation Implementation**:
- **Primary Nav**: Custom NavBar component
  - Structure: Fixed top bar with logo left, nav center, user menu right
  - Styling: Tailwind with shadcn theming
  - Mobile: Collapse to hamburger overlay drawer

- **Breadcrumbs**: Custom breadcrumb component
  - Generation: Manual per page (Home > Dashboard, Home > Vendors > [Name])

- **User Menu**: shadcn DropdownMenu component
  - Trigger: Avatar click
  - Items: Dashboard, Settings, Logout

**Navigation Components**:

- **MainNav**: Horizontal navigation bar
  - Position: fixed-top
  - Width: Full width, max-w-7xl container
  - Active state: Underline + color change
  - Mobile behavior: Overlay drawer with backdrop

- **Breadcrumbs**: Shown on dashboard and detail pages
  - Pattern: Home > Section > Page
  - Implementation: Custom component with Separator

- **UserMenu**: User account dropdown
  - Location: top-right corner
  - Trigger: Avatar click
  - Items: Dashboard link, Settings link, Logout button

**Navigation State Management**:
- **Active Route Tracking**: Next.js usePathname hook
- **Mobile Menu State**: Local component state (useState)
- **Breadcrumb Data**: Props passed from page components

---

### User Flow & Interaction Patterns

**Primary User Flows**:

#### Flow 1: Vendor Edits Profile (Tier 1 User)

1. **Starting Point**: Logged in, on dashboard homepage
2. **Trigger**: Click "Edit Profile" button (shadcn Button component)
3. **Action**: Navigate to `/portal/dashboard`
4. **Page/Component Loads**: VendorDashboard renders
   - Uses ProfileEditTabs with tier-aware tab visibility
   - Validation: React Hook Form with Zod schemas
   - Loading state: Skeleton loader while fetching vendor data
5. **User Interaction**:
   - Selects "Brand Story" tab
   - Fills in Founded Year field (2010)
   - System automatically displays "Years in Business: 15" (computed: 2025 - 2010)
   - Real-time feedback: Field validation on blur, character counts
   - Error states: Inline error messages below invalid fields
6. **Submit/Complete**: Clicks "Save Profile" button
   - Loading indicator: Button spinner + disabled state
   - API call: PUT /api/portal/vendors/[id]
7. **Success Path**:
   - Notification: Toast alert "Profile updated successfully"
   - Navigation: Stay on current tab
   - UI update: Form reset to clean state, data refreshed
8. **Error Path**:
   - Error display: Toast with error message + inline field errors
   - Form state: Data preserved, focus on first error field
   - Recovery action: Fix errors and resubmit

---

#### Flow 2: Public User Views Vendor Profile (Tier 2 Vendor)

1. **Starting Point**: Vendor search page
2. **Trigger**: Click vendor card (VendorCard component with tier badge)
3. **Action**: Navigate to `/vendors/[slug]`
4. **Page Loads**: VendorProfilePage renders
   - Loading: Skeleton sections while fetching
   - SWR cache: Instant display if previously visited
5. **Content Display**:
   - Hero section: Logo, name, description, years in business badge
   - All locations shown on interactive map (Tier 2 unlimited)
   - Certifications grid visible (Tier 1+ feature)
   - Products section visible (Tier 2+ feature)
   - "Featured in Category" badge (Tier 2 feature)
6. **User Interaction**: Scrolls through sections, clicks case study
   - Modal opens with full case study content
7. **Action**: Clicks "Contact Vendor" button
   - Opens contact form or mailto link
8. **Outcome**: User can research vendor comprehensively

---

#### Flow 3: Free Tier Vendor Sees Upgrade Prompt

1. **Starting Point**: Dashboard, Basic Info tab
2. **User Action**: Attempts to switch to "Brand Story" tab
3. **System Response**: Tab is visible but shows UpgradePromptCard
4. **Prompt Display**:
   - Component: TierUpgradePrompt modal/card
   - Content: "Unlock Brand Story features - Available in Tier 1"
   - Benefits list: Enhanced storytelling, social proof, certifications
   - CTA: "Contact Sales" button
5. **User clicks CTA**: Opens contact form or email with tier context
6. **Alternative**: User explores other locked tabs to see all upgrade benefits

---

**Component Interaction Patterns**:

- **Master-Detail Pattern** (Case Studies):
  - CaseStudiesManager (using shadcn Card) displays list of case studies
  - User action: Click "View Details" button
  - CaseStudyDetailDialog (shadcn Dialog) displays full content
  - State management: Local state for selected case study
  - Data flow: CaseStudiesManager state → Dialog props

- **Array Management Pattern** (Certifications):
  - CertificationsArrayManager renders list in ScrollArea
  - User action: Click "Add Certification" (shadcn Button)
  - AddCertificationDialog (shadcn Dialog) opens with Form
  - User fills form fields, submits
  - State update: Parent component state updated via callback
  - UI refresh: New certification appears in list

**Form Submission Pattern** (standardized across all forms):
1. User fills form (shadcn Form components with React Hook Form)
2. Client-side validation: Zod schemas with real-time validation
3. Submit button: Loading state using custom loading prop
4. API call: PUT /api/portal/vendors/[id]
5. Success: Toast notification + form reset + data refresh
6. Error: Toast error + inline field errors + form data preserved

---

### Component Integration Map

**How Components Work Together**:

#### Vendor Dashboard Integration Flow
```
User Action: Navigates to dashboard
↓
VendorDashboardPage fetches vendor data via SWR
↓
Data flows to child components:
  ├→ DashboardHeader (receives vendor for breadcrumb)
  ├→ ProfileEditTabs (receives vendor + tier for all forms)
  │   ├→ BasicInfoForm (receives vendor.basicInfo)
  │   ├→ BrandStoryForm (receives vendor.brandStory + tier check)
  │   │   ├→ FoundedYearInput (controlled input)
  │   │   └→ YearsInBusinessDisplay (receives foundedYear, computes display)
  │   ├→ CertificationsAwardsManager (receives arrays + tier check)
  │   └→ ... other forms
  └→ DashboardSidebar (receives tier for upgrade prompts)
↓
User interacts: Edits field in BrandStoryForm
↓
Form state updates locally (React Hook Form)
↓
User clicks Save
↓
Form validation runs (Zod schema)
↓
API call triggered (VendorProfileService)
↓
Success: SWR mutate triggers re-fetch
↓
All components re-render with fresh data
```

#### Component Communication Patterns

**Page → Container → Presentational Pattern**:
```
VendorDashboardPage (manages routing, fetches data via SWR)
  ↓ passes vendor data, onSave callback
ProfileEditTabs (manages tab state, coordinates forms)
  ↓ passes section data + event handlers
BasicInfoForm (displays fields, emits onChange events)
  ↑ emits form data on submit
ProfileEditTabs (calls onSave with data)
  ↑ triggers SWR mutate on success
VendorDashboardPage (data refreshes)
```

**State Flow Between Components**:

- **Global State** (TierAccessContext):
  - Auth state, current user's tier, feature flags
  - Accessed by: All dashboard forms via useTierAccess hook

- **Shared Component State** (VendorDashboardContext):
  - VendorDashboardPage manages vendor state
  - Passes to: All child components via context

- **API Data Flow**:
  - Fetched in: VendorDashboardPage using SWR
  - Cached with: SWR cache with 5-minute revalidation
  - Shared via: Props drilling + Context for deep components

**Computed Field Flow**:
```
User enters foundedYear: 2010
  ↓
FoundedYearInput onChange → form state updated
  ↓
YearsInBusinessDisplay receives foundedYear prop
  ↓
Computes: currentYear (2025) - foundedYear (2010) = 15
  ↓
Displays: "Years in Business: 15" with Badge component
  ↓
On form save: foundedYear saved to DB
  ↓
Backend: yearsInBusiness computed on read
  ↓
Frontend: SWR re-fetch shows computed value
```

---

## Frontend-Backend Integration

### API Contract

**Contract Owner**: Backend provides, Frontend consumes

**Type Sharing Strategy**:
- Payload CMS auto-generates types in `payload-types.ts`
- Frontend imports types from generated file
- Shared types for tier validation in `lib/types/tier.ts`

**Data Flow**:
1. User action in Frontend (form submit) →
2. API call to Backend (PUT /api/portal/vendors/[id]) →
3. Backend validates tier permissions and data →
4. Backend computes yearsInBusiness from foundedYear →
5. Backend responds with updated vendor object →
6. Frontend updates UI with new data (SWR mutate)

---

### Integration Points

**Frontend Calls Backend For**:
- Login/Authentication → `/api/auth/login`
- Fetch vendor profile for editing → `GET /api/portal/vendors/[id]`
- Update vendor profile → `PUT /api/portal/vendors/[id]`
- Fetch public vendor profile → `GET /api/vendors/[slug]`
- Upload media (logo, images) → `POST /api/media`
- Geocode locations → `POST /api/geocode` (existing)

**Error Handling Strategy**:
- **Network Errors**: SWR retry with exponential backoff, Toast notification
- **Validation Errors**: Display inline field errors + summary Toast
- **Authentication Errors**: Redirect to login with returnUrl
- **Tier Restriction Errors**: Show upgrade prompt modal instead of error

---

### Testing Strategy

**Frontend Tests**:
- Unit tests for computed field logic (yearsInBusiness calculation)
- Unit tests for tier validation utilities
- Component tests for forms (React Testing Library)
- Integration tests for dashboard tab navigation and form submissions
- Mock API responses for all tests

**Backend Tests**:
- Unit tests for TierValidationService methods
- Unit tests for VendorComputedFieldsService
- Integration tests for API endpoints with tier scenarios
- Database integration tests for field access control
- Test tier upgrade/downgrade scenarios

**E2E Tests**:
- Full vendor profile editing workflow (Free → Tier 1 → Tier 2 → Tier 3)
- Public profile display at each tier level
- Upgrade prompt interaction
- Form validation and error handling
- Location limits enforcement
- Computed field display (years in business)

---

## Implementation Architecture

### Component Structure

#### **TierValidationService**

- **Responsibilities**: Centralized tier permission checking and validation logic
- **Implementation approach**: Static class with pure functions for tier checks
- **Dependencies**: Tier configuration constants (`lib/constants/tiers.ts`)
- **Interface contracts**:
  ```typescript
  class TierValidationService {
    static validateFieldAccess(tier: TierLevel, fieldName: string): boolean
    static validateLocationLimit(tier: TierLevel, locationCount: number): { valid: boolean, maxAllowed: number }
    static canAccessFeature(tier: TierLevel, feature: TierFeature): boolean
    static getTierFeatures(tier: TierLevel): TierFeature[]
    static getLocationLimit(tier: TierLevel): number
  }
  ```

---

#### **VendorComputedFieldsService**

- **Responsibilities**: Compute derived fields like yearsInBusiness from source data
- **Implementation approach**: Pure functions for field computation
- **Dependencies**: Date utilities
- **Interface contracts**:
  ```typescript
  class VendorComputedFieldsService {
    static computeYearsInBusiness(foundedYear: number | null): number | null
    static enrichVendorData(vendor: Vendor): VendorWithComputed
  }

  // Implementation
  static computeYearsInBusiness(foundedYear: number | null): number | null {
    if (!foundedYear) return null
    const currentYear = new Date().getFullYear()
    if (foundedYear > currentYear) return null // Invalid future year
    return currentYear - foundedYear
  }
  ```

---

#### **VendorProfileService**

- **Responsibilities**: Orchestrate vendor profile CRUD operations with tier validation
- **Implementation approach**: Service class wrapping Payload CMS with business logic
- **Dependencies**: Payload CMS, TierValidationService, VendorComputedFieldsService
- **Interface contracts**:
  ```typescript
  class VendorProfileService {
    static async getVendorProfile(slug: string): Promise<Vendor>
    static async getVendorForEdit(id: string, userId: string): Promise<Vendor>
    static async updateVendorProfile(id: string, data: Partial<Vendor>, user: User): Promise<Vendor>
    static async validateTierData(vendor: Vendor, newTier: TierLevel): Promise<ValidationResult>
  }
  ```

---

### Data Flow

1. **User Profile Edit Request**: User submits form in dashboard →
2. **Frontend Validation**: Client-side Zod schema validation →
3. **API Call**: PUT /api/portal/vendors/[id] with updated data →
4. **Backend Authorization**: Verify user owns vendor or is admin →
5. **Tier Validation**: TierValidationService checks field access permissions →
6. **Data Update**: Payload CMS updates vendor document →
7. **Computed Fields**: VendorComputedFieldsService enriches response with yearsInBusiness →
8. **Response**: Return updated vendor with computed fields →
9. **Frontend Update**: SWR mutate triggers UI refresh →
10. **User Feedback**: Toast notification confirms save

**Flow Details**:
- **User Profile Edit Request**: Form submission from dashboard tab (e.g., Brand Story tab) triggers onSubmit handler with form data
- **Frontend Validation**: React Hook Form + Zod validates required fields, field lengths, URL formats, year ranges before API call
- **API Call**: Authenticated fetch to PUT /api/portal/vendors/[id] with Authorization header and updated vendor fields in body
- **Backend Authorization**: Next.js API route checks JWT token, verifies user.id matches vendor.user or user.role === 'admin'
- **Tier Validation**: For each field in update data, TierValidationService.validateFieldAccess(vendor.tier, fieldName) confirms permission
- **Data Update**: If validation passes, Payload CMS update operation saves changed fields to SQLite database
- **Computed Fields**: Before returning response, VendorComputedFieldsService.enrichVendorData() adds yearsInBusiness = currentYear - foundedYear
- **Response**: HTTP 200 with updated vendor object including computed fields, or 400/403 with validation errors
- **Frontend Update**: SWR's mutate() function invalidates cache and triggers re-fetch, causing all components with vendor data to re-render
- **User Feedback**: useToast() hook displays success toast with checkmark icon and "Profile updated successfully" message

---

### State Management

**State Management Pattern**: React Context + SWR for server state

**Implementation Details**:
- **Client State**: React Context for tier access utilities
- **Server State**: SWR for API data caching and revalidation
- **Form State**: React Hook Form for form management

**State Stores**:
- **TierAccessContext**:
  ```typescript
  interface TierAccessContextValue {
    tier: TierLevel
    canAccessField: (fieldName: string) => boolean
    canAccessFeature: (feature: TierFeature) => boolean
    getLocationLimit: () => number
  }
  ```

- **VendorDashboardContext**:
  ```typescript
  interface VendorDashboardContextValue {
    vendor: Vendor | null
    loading: boolean
    saving: boolean
    error: Error | null
    activeTab: string
    updateVendor: (data: Partial<Vendor>) => Promise<void>
    saveVendor: () => Promise<void>
    setActiveTab: (tab: string) => void
  }
  ```

---

### Error Handling

**Error Handling Strategy**: Layered error handling with user-friendly messages

**Error Scenarios**:
- **Tier Permission Denied**: Return 403 with message "This feature is available in Tier X and above", show upgrade prompt
- **Validation Error**: Return 400 with field-level error details, display inline errors with field highlighting
- **Location Limit Exceeded**: Return 400 with message "Your tier allows up to X locations", show current count and upgrade option
- **Unauthorized Access**: Return 401 and redirect to login with return URL
- **Not Found**: Return 404 with message "Vendor profile not found"
- **Server Error**: Return 500 with generic message, log detailed error server-side

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "TIER_PERMISSION_DENIED",
    "message": "This feature requires Tier 1 or higher",
    "details": {
      "field": "certifications",
      "currentTier": "free",
      "requiredTier": "tier1"
    },
    "timestamp": "2025-10-24T10:30:00Z"
  }
}
```

---

## Integration Points

### Existing Code Dependencies

#### **LocationsManagerCard Integration**

- **Purpose**: Reuse existing location management UI for multi-location feature
- **Interface requirements**: Must receive tier prop to enforce location limits
- **Data exchange**: Receives vendor.locations array, emits updated locations via callback
- **Error handling**: Show tier limit warning when attempting to add location beyond limit

**Integration Example**:
```typescript
<LocationsManagerCard
  vendorId={vendor.id}
  locations={vendor.locations}
  tier={vendor.tier}
  maxLocations={TierValidationService.getLocationLimit(vendor.tier)}
  onUpdate={(locations) => updateVendor({ locations })}
  onLimitReached={() => showUpgradePrompt('tier1')}
/>
```

---

#### **TierUpgradePrompt Integration**

- **Purpose**: Reuse existing upgrade prompt component for locked features
- **Interface requirements**: Receives currentTier, feature name, target tier
- **Data exchange**: Emits upgrade interest event or contact sales action
- **Error handling**: Gracefully handle missing tier configuration

**Integration Example**:
```typescript
{!canAccessField('certifications') && (
  <TierUpgradePrompt
    currentTier={vendor.tier}
    feature="Certifications & Awards"
    targetTier="tier1"
    benefits={[
      'Showcase industry certifications',
      'Display awards and recognition',
      'Build credibility with proof points'
    ]}
    onContactSales={() => handleContactSales('certifications')}
  />
)}
```

---

#### **PayloadCMSDataService Integration**

- **Purpose**: Extend existing data service with tier-aware vendor fetching
- **Interface requirements**: Add methods for tier validation and computed field enrichment
- **Data exchange**: Fetches vendor data from Payload CMS, enriches with computed fields
- **Error handling**: Handle missing fields gracefully for backward compatibility

**New Methods**:
```typescript
class PayloadCMSDataService {
  // Existing methods...

  static async getVendorWithComputed(slug: string): Promise<VendorWithComputed> {
    const vendor = await this.getVendorBySlug(slug)
    return VendorComputedFieldsService.enrichVendorData(vendor)
  }

  static async validateVendorTierData(vendor: Vendor): Promise<ValidationResult> {
    // Validate all tier-restricted fields have appropriate access
    // Check location count against tier limit
    // Return validation errors or success
  }
}
```

---

### API Contracts

*(Already detailed in Backend Implementation → API Endpoints section)*

---

### Database Interactions

#### **vendors Table Extensions**

**Operations**: Add new columns for tier-specific fields

**Schema Migration**:
```sql
-- Add Tier 3 to tier enum
ALTER TABLE vendors MODIFY COLUMN tier ENUM('free', 'tier1', 'tier2', 'tier3') DEFAULT 'free';

-- Add founded year field
ALTER TABLE vendors ADD COLUMN foundedYear INT NULL;
ALTER TABLE vendors ADD CONSTRAINT chk_foundedYear CHECK (foundedYear >= 1800 AND foundedYear <= YEAR(CURDATE()));

-- Add social proof metrics
ALTER TABLE vendors ADD COLUMN totalProjects INT DEFAULT 0;
ALTER TABLE vendors ADD COLUMN employeeCount INT DEFAULT 0;
ALTER TABLE vendors ADD COLUMN linkedinFollowers INT DEFAULT 0;
ALTER TABLE vendors ADD COLUMN instagramFollowers INT DEFAULT 0;
ALTER TABLE vendors ADD COLUMN clientSatisfactionScore INT CHECK (clientSatisfactionScore >= 0 AND clientSatisfactionScore <= 100);
ALTER TABLE vendors ADD COLUMN repeatClientPercentage INT CHECK (repeatClientPercentage >= 0 AND repeatClientPercentage <= 100);

-- Add video fields
ALTER TABLE vendors ADD COLUMN videoUrl VARCHAR(500) NULL;
ALTER TABLE vendors ADD COLUMN videoThumbnail VARCHAR(255) NULL;
ALTER TABLE vendors ADD COLUMN videoDuration VARCHAR(10) NULL;
ALTER TABLE vendors ADD COLUMN videoTitle VARCHAR(255) NULL;
ALTER TABLE vendors ADD COLUMN videoDescription TEXT NULL;

-- Add long description
ALTER TABLE vendors ADD COLUMN longDescription LONGTEXT NULL;

-- Add Tier 2+ feature flags
ALTER TABLE vendors ADD COLUMN featuredInCategory BOOLEAN DEFAULT FALSE;
ALTER TABLE vendors ADD COLUMN advancedAnalytics BOOLEAN DEFAULT FALSE;
ALTER TABLE vendors ADD COLUMN apiAccess BOOLEAN DEFAULT FALSE;
ALTER TABLE vendors ADD COLUMN customDomain VARCHAR(255) NULL;

-- Add Tier 3 promotion pack flags
ALTER TABLE vendors ADD COLUMN promotionPack_featuredPlacement BOOLEAN DEFAULT FALSE;
ALTER TABLE vendors ADD COLUMN promotionPack_editorialCoverage BOOLEAN DEFAULT FALSE;
ALTER TABLE vendors ADD COLUMN promotionPack_searchHighlight BOOLEAN DEFAULT FALSE;
```

**New Tables for Array Fields**:
```sql
-- Certifications table
CREATE TABLE vendor_certifications (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  expiryDate DATE NULL,
  certificateNumber VARCHAR(100) NULL,
  logo VARCHAR(255) NULL,
  verificationUrl VARCHAR(500) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendorId)
);

-- Awards table
CREATE TABLE vendor_awards (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  category VARCHAR(100) NULL,
  description TEXT NULL,
  image VARCHAR(255) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendorId)
);

-- Case Studies table
CREATE TABLE vendor_case_studies (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  yachtName VARCHAR(255) NULL,
  yachtId VARCHAR(36) NULL,
  projectDate DATE NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results TEXT NULL,
  testimonyQuote TEXT NULL,
  testimonyAuthor VARCHAR(255) NULL,
  testimonyRole VARCHAR(255) NULL,
  featured BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (yachtId) REFERENCES yachts(id) ON DELETE SET NULL,
  INDEX idx_vendor (vendorId),
  INDEX idx_featured (featured)
);

-- Case Study Images (junction table)
CREATE TABLE case_study_images (
  id VARCHAR(36) PRIMARY KEY,
  caseStudyId VARCHAR(36) NOT NULL,
  imageId VARCHAR(36) NOT NULL,
  displayOrder INT DEFAULT 0,
  FOREIGN KEY (caseStudyId) REFERENCES vendor_case_studies(id) ON DELETE CASCADE,
  FOREIGN KEY (imageId) REFERENCES media(id) ON DELETE CASCADE
);

-- Innovation Highlights table
CREATE TABLE vendor_innovation_highlights (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  year INT NULL,
  patentNumber VARCHAR(100) NULL,
  image VARCHAR(255) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendorId)
);

-- Innovation Benefits (junction table)
CREATE TABLE innovation_benefits (
  id VARCHAR(36) PRIMARY KEY,
  innovationId VARCHAR(36) NOT NULL,
  benefit VARCHAR(500) NOT NULL,
  displayOrder INT DEFAULT 0,
  FOREIGN KEY (innovationId) REFERENCES vendor_innovation_highlights(id) ON DELETE CASCADE
);

-- Team Members table
CREATE TABLE vendor_team_members (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  photo VARCHAR(255) NULL,
  linkedinUrl VARCHAR(500) NULL,
  email VARCHAR(255) NULL,
  displayOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendorId),
  INDEX idx_order (vendorId, displayOrder)
);

-- Yacht Projects table
CREATE TABLE vendor_yacht_projects (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  yachtId VARCHAR(36) NULL,
  yachtName VARCHAR(255) NULL,
  role VARCHAR(255) NOT NULL,
  completionDate DATE NULL,
  image VARCHAR(255) NULL,
  featured BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (yachtId) REFERENCES yachts(id) ON DELETE SET NULL,
  INDEX idx_vendor (vendorId),
  INDEX idx_featured (featured)
);

-- Yacht Project Systems (junction table)
CREATE TABLE yacht_project_systems (
  id VARCHAR(36) PRIMARY KEY,
  projectId VARCHAR(36) NOT NULL,
  system VARCHAR(255) NOT NULL,
  FOREIGN KEY (projectId) REFERENCES vendor_yacht_projects(id) ON DELETE CASCADE
);

-- Service Areas table
CREATE TABLE vendor_service_areas (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  area VARCHAR(255) NOT NULL,
  description TEXT NULL,
  icon VARCHAR(50) NULL,
  displayOrder INT DEFAULT 0,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendorId)
);

-- Company Values table
CREATE TABLE vendor_company_values (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  value VARCHAR(255) NOT NULL,
  description TEXT NULL,
  displayOrder INT DEFAULT 0,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendorId)
);

-- Editorial Content table (Tier 3)
CREATE TABLE vendor_editorial_content (
  id VARCHAR(36) PRIMARY KEY,
  vendorId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NULL,
  body LONGTEXT NOT NULL,
  image VARCHAR(255) NULL,
  publishDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
  INDEX idx_vendor (vendorId),
  INDEX idx_publish_date (publishDate)
);
```

**Indexes**:
- `idx_tier` on vendors(tier) for tier-based queries
- `idx_founded_year` on vendors(foundedYear) for sorting
- `idx_featured_tier` on vendors(featured, tier) for featured vendor queries
- Foreign key indexes on all relationship tables

**Constraints**:
- `chk_foundedYear` ensures year is between 1800 and current year
- `chk_satisfaction_score` ensures score is 0-100
- `chk_repeat_percentage` ensures percentage is 0-100
- Unique constraint on vendors(slug) preserved
- Unique constraint on vendors(user) preserved

---

### External Services Integration

*(No new external services required - all functionality handled by existing stack)*

---

## Implementation Patterns

### Design Patterns

**Primary Patterns**:
- **Strategy Pattern**: TierValidationService uses strategy pattern for tier-specific validation rules
- **Factory Pattern**: Form component factory creates appropriate form based on tier level
- **Observer Pattern**: SWR provides observer pattern for data synchronization across components
- **Computed Property Pattern**: yearsInBusiness computed from foundedYear following DRY principles

**Pattern Selection Rationale**: These patterns provide flexibility for tier expansion, maintainability for validation logic, and performance optimization for data fetching.

---

### Code Organization

```
/home/edwin/development/ptnextjs/
├── app/
│   ├── portal/
│   │   └── dashboard/
│   │       ├── page.tsx (VendorDashboard)
│   │       └── components/
│   │           ├── ProfileEditTabs.tsx
│   │           ├── BasicInfoForm.tsx
│   │           ├── BrandStoryForm.tsx
│   │           ├── CertificationsAwardsManager.tsx
│   │           ├── CaseStudiesManager.tsx
│   │           ├── TeamMembersManager.tsx
│   │           └── PromotionPackForm.tsx
│   └── vendors/
│       ├── page.tsx (VendorListingPage)
│       └── [slug]/
│           └── page.tsx (VendorProfilePage)
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/ (existing)
│   │   ├── LocationsManagerCard.tsx (existing)
│   │   ├── LocationFormFields.tsx (existing)
│   │   └── TierUpgradePrompt.tsx (existing)
│   └── vendors/
│       ├── VendorCard.tsx
│       ├── VendorHero.tsx
│       ├── VendorAboutSection.tsx
│       ├── VendorCertificationsSection.tsx
│       ├── VendorCaseStudiesSection.tsx
│       ├── VendorTeamSection.tsx
│       └── TierBadge.tsx
├── lib/
│   ├── services/
│   │   ├── TierValidationService.ts
│   │   ├── VendorComputedFieldsService.ts
│   │   ├── VendorProfileService.ts
│   │   └── LocationService.ts (existing)
│   ├── hooks/
│   │   ├── useTierAccess.ts (existing)
│   │   ├── useVendorProfile.ts
│   │   └── useVendorDashboard.ts
│   ├── contexts/
│   │   ├── TierAccessContext.tsx
│   │   └── VendorDashboardContext.tsx
│   ├── constants/
│   │   ├── tiers.ts
│   │   └── tierFeatures.ts
│   ├── types/
│   │   ├── tier.ts
│   │   └── vendor.ts
│   └── validation/
│       ├── vendorSchemas.ts (Zod schemas)
│       └── tierValidation.ts
├── payload/
│   └── collections/
│       └── Vendors.ts (extended)
└── __tests__/
    ├── services/
    │   ├── TierValidationService.test.ts
    │   └── VendorComputedFieldsService.test.ts
    ├── components/
    │   ├── VendorDashboard.test.tsx
    │   ├── BrandStoryForm.test.tsx
    │   └── VendorCard.test.tsx
    └── e2e/
        ├── vendor-dashboard.spec.ts
        ├── vendor-profile-tiers.spec.ts
        └── tier-upgrade-flow.spec.ts
```

**File Organization Guidelines**:
- **Component files**: One component per file, named after component (PascalCase.tsx)
- **Service files**: Service classes in lib/services/, one service per file
- **Hook files**: Custom hooks in lib/hooks/, prefixed with 'use'
- **Test files**: Mirror source structure, suffix with .test.tsx or .spec.ts

---

### Naming Conventions

**Components**: PascalCase (VendorDashboard, ProfileEditTabs, BrandStoryForm)
**Services**: PascalCase with 'Service' suffix (TierValidationService, VendorProfileService)
**Hooks**: camelCase with 'use' prefix (useTierAccess, useVendorProfile)
**Types/Interfaces**: PascalCase (Vendor, TierLevel, VendorWithComputed)
**Constants**: UPPER_SNAKE_CASE for true constants, camelCase for config objects (MAX_LOCATIONS, tierConfig)

**Variable Naming**:
- **Functions**: camelCase (validateFieldAccess, computeYearsInBusiness)
- **Variables**: camelCase (vendorData, currentTier, foundedYear)
- **React Components**: PascalCase
- **Props**: camelCase (onSave, vendorId, tier)
- **Booleans**: Prefix with 'is', 'has', 'can', 'should' (isLoading, canEdit, hasAccess)

---

### Coding Standards

**Code Style Reference**: Follow guidelines from @.agent-os/standards/best-practices.md

**Key Standards**:
- **Indentation**: 2 spaces (never tabs)
- **Line length**: Maximum 100 characters (prettier config)
- **Comments**: Explain "why" not "what", use JSDoc for public functions
- **Error handling**: Always include try-catch for async operations, user-friendly error messages
- **Type safety**: Use TypeScript strict mode, no 'any' types without justification

**Quality Requirements**:
- **Test coverage**: Minimum 80% coverage for new code (services, hooks, critical components)
- **Documentation**: JSDoc comments for all public service methods and hooks
- **Performance**: Use React.memo for expensive components, useMemo for computed values
- **Security**: Sanitize all user inputs, validate on both client and server, never expose admin-only fields

**React Specific**:
- Prefer functional components with hooks over class components
- Use custom hooks to encapsulate reusable logic
- Keep components small and focused (single responsibility)
- Prop drilling max 2 levels deep, then use Context
- Always provide key prop for list items

**TypeScript Specific**:
- Define interfaces for all props and state
- Use discriminated unions for tier types
- Leverage type guards for runtime type checking
- Prefer type inference over explicit types when obvious

---

## Performance Criteria

### Response Time Requirements

**Target Response Time**:
- Dashboard page load: <2 seconds
- Public profile page load: <1.5 seconds
- Form save operation: <1 second
- Tier validation check: <100ms

**Measurement Points**:
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- API response time

**Optimization Strategies**:
- SWR caching with 5-minute revalidation
- Static generation for public profiles
- Optimistic UI updates for form saves
- Code splitting by route and tier level
- Image optimization with Next.js Image component

---

### Throughput Requirements

**Target Throughput**:
- Support 100 concurrent dashboard users
- Handle 1000 public profile views/minute
- Process 50 vendor updates/minute

**Load Testing Scenarios**:
- Simulate 100 vendors editing profiles simultaneously
- Stress test public profile pages with 500 req/min
- Test tier validation under load (1000 checks/sec)

**Scalability Requirements**:
- Horizontal scaling via Vercel serverless functions
- Database query optimization with proper indexes
- CDN caching for public profile pages

---

### Concurrency Requirements

**Concurrent Users**: Support 500 concurrent users (100 dashboard, 400 public)

**Resource Management**:
- Database connection pooling
- Rate limiting on API endpoints (100 req/min per user)
- SWR deduplication of identical requests

**Bottleneck Prevention**:
- Index all foreign keys and frequently queried fields
- Cache tier configuration in memory
- Batch database writes where possible
- Use database transactions for multi-table updates

---

## Security Requirements

### Authentication Requirements

**Authentication Method**: Payload CMS built-in JWT authentication

**Token Management**:
- HTTP-only cookies for JWT storage
- Token expiration: 7 days
- Refresh token rotation on use

**Session Handling**:
- Server-side session validation on each request
- Automatic logout on token expiration
- Remember me option extends token to 30 days

---

### Authorization Requirements

**Authorization Model**: Role-Based Access Control (RBAC) with tier-based feature flags

**Permission Validation**:
- Every API endpoint validates user role and vendor ownership
- Field-level access checked via TierValidationService
- Admin role bypasses tier restrictions

**Access Control**:
- Vendors can only access their own profile data
- Admins can access and modify all vendor profiles
- Public endpoints return only published, tier-appropriate data

---

### Data Protection

**Encryption Standard**: TLS 1.3 for data in transit

**Data at Rest**: Database-level encryption (SQLite encryption extension in production)

**Data in Transit**: HTTPS enforced for all connections, HSTS headers

**Sensitive Data Handling**:
- Contact email never exposed in public API responses without permission
- Phone numbers masked in public view (show only with vendor consent)
- Admin-only fields (tier, feature flags) never exposed to non-admin users

---

### Input Validation

**Validation Approach**: Dual-layer validation (client + server)

**Sanitization Rules**:
- All URL fields sanitized via sanitizeUrlHook
- HTML stripped from text fields (except rich text)
- File uploads: whitelist allowed MIME types, max 10MB
- SQL injection prevention via Payload CMS ORM

**Injection Prevention**:
- Parameterized queries (Payload CMS handles)
- XSS prevention via React's built-in escaping
- CSRF tokens on all state-changing operations

---

## Quality Validation Requirements

### Technical Depth Validation

**Implementation Readiness**:
- All Payload CMS field definitions complete with types, validation, conditional display
- API endpoint contracts fully specified with request/response types
- Component hierarchy documented with props and state management

**Technical Accuracy**:
- Database schema validated against Payload CMS requirements
- Tier validation logic tested with all tier combinations
- Computed field calculations verified with edge cases

**Completeness Check**:
- All 40+ fields from tier structure document mapped to implementation
- All UI components specified with shadcn component usage
- All integration points with existing code identified

---

### Integration Validation

**Compatibility Assessment**:
- Extends existing Vendors collection without breaking changes
- Reuses LocationsManagerCard and TierUpgradePrompt components
- Compatible with existing PayloadCMSDataService patterns

**Dependency Validation**:
- Payload CMS 3.x SQLite adapter
- shadcn/ui component library
- React Hook Form + Zod validation
- SWR for data fetching
- Next.js 14 App Router

**API Contract Validation**:
- All API endpoints documented with TypeScript interfaces
- Error responses standardized across all endpoints
- Backward compatibility maintained for existing endpoints

---

### Performance Validation

**Performance Benchmarks**:
- Dashboard load time measured with Lighthouse
- API response times logged and monitored
- Database query performance tested with EXPLAIN

**Resource Requirements**:
- Memory usage profiled for dashboard components
- Bundle size analyzed with next-bundle-analyzer
- Database size estimated based on field types

**Scalability Assessment**:
- Load testing with k6 or Artillery
- Database scaling plan documented
- CDN caching strategy validated

---

### Security Validation

**Security Standards Compliance**:
- OWASP Top 10 vulnerabilities addressed
- RBAC model validated for all endpoints
- Input validation on client and server

**Vulnerability Assessment**:
- SQL injection prevented via ORM
- XSS prevented via React and sanitization
- CSRF tokens on all mutations

**Authentication/Authorization Validation**:
- JWT token security reviewed
- Permission checks tested for all endpoints
- Tier restrictions enforced server-side

---

## Technical Requirements

- TypeScript 5.2+ for type safety across all new code
- Payload CMS 3.x with SQLite adapter for database
- Next.js 14.2+ App Router for frontend
- React 18.2+ with hooks for components
- shadcn/ui component library for consistent UI
- React Hook Form 7.53+ with Zod 3.23+ for form validation
- SWR 2.2+ for data fetching and caching
- Tailwind CSS 3.3+ for styling with centralized theming
- ESLint + Prettier for code quality
- Jest + React Testing Library for unit/integration tests
- Playwright for E2E tests

---

## External Dependencies

**@payloadcms/richtext-lexical** - Rich text editor for longDescription and case study bodies
- **Justification:** Required for rich text editing, already in stack, integrates with Payload CMS
- **Version Requirements:** Latest stable compatible with Payload CMS 3.x

**date-fns** - Date utilities for year calculations and formatting
- **Justification:** Lightweight, tree-shakeable date library for computing years in business
- **Version Requirements:** ^2.30.0 or latest

**zod** - Runtime type validation for form schemas
- **Justification:** Already in stack, integrates with React Hook Form, provides TypeScript inference
- **Version Requirements:** ^3.23.8 (current version)

*(No additional external dependencies required beyond existing stack)*

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
