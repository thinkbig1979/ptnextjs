# Integration Strategy Document
# Tier Upgrade Request System

> **Spec**: tier-upgrade-request-system
> **Created**: 2025-11-04
> **Task**: pre-2 - Create Integration Strategy
> **Status**: Complete

## Executive Summary

This document defines the comprehensive integration strategy for the tier upgrade request system, establishing how new components will integrate with the existing vendor portal, admin panel, and Payload CMS infrastructure. The strategy ensures seamless operation with zero breaking changes to existing functionality while enabling vendors to submit tier upgrade requests and admins to review them through a self-service workflow.

**Key Integration Points:**
- Payload CMS collection integration with existing vendors/users collections
- Vendor portal API following established authentication/authorization patterns
- Admin API integration with Payload admin UI
- Frontend component integration with existing dashboard layout
- Service layer integration following TierService patterns

## 1. Data Flow Architecture

### 1.1 Request Submission Flow (Vendor → Backend)

```
┌─────────────────────────────────────────────────────────────────┐
│ VENDOR USER INTERACTION                                         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React Component)                                      │
│                                                                 │
│ TierUpgradeRequestForm.tsx                                      │
│ - Validates with Zod schema                                     │
│ - Shows only higher tiers in dropdown                           │
│ - Requires 20-500 char business justification                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                POST /api/portal/vendors/[id]/tier-upgrade-request
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ API ROUTE (Next.js App Router)                                  │
│                                                                 │
│ app/api/portal/vendors/[id]/tier-upgrade-request/route.ts       │
│ - Authenticates via getUserFromRequest()                        │
│ - Authorizes: vendor can only submit for own account           │
│ - Validates request body with Zod                               │
│ - Rate limits: 5 requests/hour per vendor                       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVICE LAYER                                                   │
│                                                                 │
│ TierUpgradeRequestService.ts                                    │
│ - validateUpgradeRequest(): Business logic validation          │
│   - Verify requested tier > current tier                        │
│   - Check no existing pending request                           │
│   - Validate justification length                               │
│ - createUpgradeRequest(): Database insertion                    │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ PAYLOAD CMS (Data Layer)                                        │
│                                                                 │
│ Collection: tier_upgrade_requests                               │
│ - Insert new record with status='pending'                       │
│ - Set currentTier from vendor.tier (snapshot)                   │
│ - Create relationships to vendor and user                       │
│ - Trigger beforeChange hook validation                          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE (SQLite/PostgreSQL)                                    │
│                                                                 │
│ Table: tier_upgrade_requests                                    │
│ - Enforce UNIQUE constraint (vendor_id, status) WHERE pending   │
│ - Enforce CHECK constraint: target_tier > current_tier          │
│ - Create indexes on vendor_id, status, requested_at            │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE (Success)                                              │
│                                                                 │
│ 201 Created: { success: true, data: TierUpgradeRequest }       │
│ Frontend: Toast notification + show status card                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Admin Approval Flow (Admin → Backend → Vendor Tier Update)

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN USER INTERACTION                                          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN UI (Payload CMS)                                          │
│                                                                 │
│ /admin/collections/tier_upgrade_requests                        │
│ - Admin views pending requests in list view                     │
│ - Filters by status, clicks on request                          │
│ - Clicks "Approve" button in custom actions component           │
│ - Confirms in AlertDialog                                       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
           PUT /api/admin/tier-upgrade-requests/[id]/approve
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ API ROUTE (Admin)                                               │
│                                                                 │
│ app/api/admin/tier-upgrade-requests/[id]/approve/route.ts       │
│ - Authenticates admin user                                      │
│ - Authorizes: admin role required                               │
│ - Validates request is in 'pending' status                      │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVICE LAYER (Atomic Operation)                                │
│                                                                 │
│ TierUpgradeRequestService.approveRequest()                      │
│ Step 1: Begin transaction                                       │
│ Step 2: Fetch request from database                             │
│ Step 3: Update vendor tier via VendorProfileService             │
│ Step 4: Update request status to 'approved'                     │
│ Step 5: Set reviewedAt, reviewedBy                              │
│ Step 6: Commit transaction                                      │
│ (Rollback all on any failure)                                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ VENDOR TIER UPDATE                                              │
│                                                                 │
│ VendorProfileService.updateVendorProfile()                      │
│ - Updates vendors.tier field                                    │
│ - Triggers cache invalidation                                   │
│ - Revalidates static pages (/vendors/[slug])                    │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE (Success)                                              │
│                                                                 │
│ 200 OK: { success: true, request: {...}, vendor: {...} }       │
│ Admin UI: Toast notification + request marked approved         │
│ Vendor: Tier updated immediately, new features accessible      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Status Check Flow (Vendor Dashboard Page Load)

```
┌─────────────────────────────────────────────────────────────────┐
│ VENDOR DASHBOARD PAGE LOAD                                      │
│                                                                 │
│ /vendor/dashboard/subscription                                  │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVER COMPONENT (Next.js)                                      │
│                                                                 │
│ app/(site)/vendor/dashboard/subscription/page.tsx               │
│ - getServerSession(): Get authenticated vendor user             │
│ - Fetch vendor data via VendorProfileService                    │
│ - Fetch pending/recent request via API call                     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
            GET /api/portal/vendors/[id]/tier-upgrade-request
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ SERVICE LAYER                                                   │
│                                                                 │
│ TierUpgradeRequestService.getPendingRequest()                   │
│ - Query: WHERE vendor_id = ? AND status = 'pending'            │
│ - If not found: getMostRecentRequest() (any status)             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ PAGE RENDER DECISION                                            │
│                                                                 │
│ IF pending request exists:                                      │
│   → Render UpgradeRequestStatusCard (show status)               │
│ ELSE:                                                           │
│   → Render TierUpgradeRequestForm (allow submission)            │
│                                                                 │
│ ALWAYS render:                                                  │
│   → Current tier badge                                          │
│   → TierComparisonTable                                         │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Integration with Existing Systems

### 2.1 Payload CMS Integration

#### Collection Configuration

**File**: `payload/collections/TierUpgradeRequests.ts`

**Integration Pattern**: Follow existing collection patterns from `Vendors.ts`, `Users.ts`

**Key Configuration Elements:**

```typescript
import { CollectionConfig } from 'payload/types'

const TierUpgradeRequests: CollectionConfig = {
  slug: 'tier_upgrade_requests',

  // Admin UI integration
  admin: {
    useAsTitle: 'id',
    group: 'Administration', // Group with other admin collections
    defaultColumns: ['vendor', 'currentTier', 'requestedTier', 'status', 'requestedAt'],
    components: {
      // Custom list view filters
      BeforeListTable: ['@/payload/components/TierUpgradeRequestFilters'],
    },
  },

  // Access control following existing patterns
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'vendor') {
        // Vendors can only see their own requests
        return {
          vendor: { equals: user.vendorId }
        }
      }
      return false
    },
    create: ({ req: { user } }) => user?.role === 'vendor',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  // Foreign key relationships
  fields: [
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors', // Link to existing vendors collection
      required: true,
      hasMany: false,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users', // Link to existing users collection
      required: true,
      hasMany: false,
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      hasMany: false,
    },
    // ... other fields (currentTier, requestedTier, status, etc.)
  ],

  // Validation hooks
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-populate currentTier from vendor
        if (operation === 'create' && data.vendor) {
          const vendor = await req.payload.findByID({
            collection: 'vendors',
            id: data.vendor,
          })
          data.currentTier = vendor.tier
        }

        // Validate requested tier > current tier
        if (data.requestedTier && data.currentTier) {
          const tierOrder = { free: 0, tier1: 1, tier2: 2, tier3: 3 }
          if (tierOrder[data.requestedTier] <= tierOrder[data.currentTier]) {
            throw new Error('Requested tier must be higher than current tier')
          }
        }

        return data
      },
    ],
  },

  timestamps: true, // Auto createdAt/updatedAt
}

export default TierUpgradeRequests
```

**Integration into `payload.config.ts`:**

```typescript
import TierUpgradeRequests from './payload/collections/TierUpgradeRequests'

export default buildConfig({
  collections: [
    Users,
    Vendors,
    Products,
    Categories,
    Blog,
    Team,
    Company,
    TierUpgradeRequests, // ADD HERE - after Company
  ],
  // ... rest of config unchanged
})
```

### 2.2 API Route Integration

#### Pattern: Follow Existing Vendor API Structure

**Reference**: `/app/api/portal/vendors/[id]/route.ts`

**Key Patterns to Follow:**

1. **Authentication Pattern**
```typescript
// Use existing auth middleware pattern
const user = getUserFromRequest(request);

if (!user) {
  const { authService } = await import('@/lib/services/auth-service');
  const token =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      },
      { status: 401 }
    );
  }

  user = authService.validateToken(token);
}

const isAdmin = user.role === 'admin';
```

2. **Response Format Pattern**
```typescript
// Success response
interface SuccessResponse {
  success: true;
  data: {
    [key: string]: unknown;
    message?: string;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>;
    details?: string;
  };
}
```

3. **Authorization Pattern**
```typescript
// Vendor can only access their own resources
if (!isAdmin) {
  const vendorUserId = typeof vendor.user === 'object'
    ? vendor.user.id
    : vendor.user;

  if (vendorUserId?.toString() !== user.id.toString()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own resources',
        },
      },
      { status: 403 }
    );
  }
}
```

4. **Error Handling Pattern**
```typescript
try {
  // Main logic
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  // Specific error checks
  if (errorMessage.includes('Unauthorized')) {
    return NextResponse.json({ ... }, { status: 403 });
  }

  if (errorMessage.includes('not found')) {
    return NextResponse.json({ ... }, { status: 404 });
  }

  // Generic error
  console.error('[RouteHandler] Operation failed:', {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred',
      },
    },
    { status: 500 }
  );
}
```

### 2.3 Service Layer Integration

#### Pattern: Follow TierService Structure

**Reference**: `/lib/services/TierService.ts`

**Key Patterns:**

1. **Static Class Pattern**
```typescript
export class TierUpgradeRequestService {
  private static payload = getPayloadClient()

  static async validateUpgradeRequest(...): Promise<ValidationResult> {
    // Business logic here
  }

  static async createUpgradeRequest(...): Promise<TierUpgradeRequest> {
    // CRUD operation here
  }
}
```

2. **Validation Pattern**
```typescript
interface ValidationResult {
  valid: boolean
  error?: string
}

static async validateUpgradeRequest(
  vendorId: string,
  requestedTier: string,
  notes?: string
): Promise<ValidationResult> {
  // Validate tier value
  const validTiers = ['tier1', 'tier2', 'tier3']
  if (!validTiers.includes(requestedTier)) {
    return { valid: false, error: 'Invalid tier selection' }
  }

  // Get vendor current tier
  const vendor = await this.payload.findByID({
    collection: 'vendors',
    id: vendorId,
  })

  if (!vendor) {
    return { valid: false, error: 'Vendor not found' }
  }

  // Business rule validation
  const tierOrder = { free: 0, tier1: 1, tier2: 2, tier3: 3 }
  if (tierOrder[requestedTier] <= tierOrder[vendor.tier]) {
    return { valid: false, error: 'Requested tier must be higher than current tier' }
  }

  return { valid: true }
}
```

3. **Integration with Existing Services**
```typescript
// Atomic approval operation
static async approveRequest(requestId: string, adminId: string) {
  try {
    // Get request
    const request = await this.payload.findByID({
      collection: 'tier_upgrade_requests',
      id: requestId,
    })

    // Update vendor tier via existing service
    await VendorProfileService.updateVendorProfile(
      request.vendor as string,
      { tier: request.requestedTier },
      {
        userId: adminId,
        isAdmin: true,
        validateTier: false, // Admin override
      }
    )

    // Update request status
    const updatedRequest = await this.payload.update({
      collection: 'tier_upgrade_requests',
      id: requestId,
      data: {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminId,
      },
    })

    return {
      success: true,
      data: {
        request: updatedRequest,
        vendor: await this.payload.findByID({
          collection: 'vendors',
          id: request.vendor as string,
        }),
      },
    }
  } catch (error) {
    console.error('Error approving request:', error)
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to approve request'
    }
  }
}
```

### 2.4 Frontend Component Integration

#### Dashboard Layout Integration

**Location**: Existing vendor dashboard at `/vendor/dashboard`

**Integration Approach**: Add new page route following sidebar navigation pattern

**Navigation Update:**

```typescript
// In vendor dashboard layout or navigation component
const navigationItems = [
  {
    href: '/vendor/dashboard',
    label: 'Overview',
    icon: LayoutDashboard
  },
  {
    href: '/vendor/dashboard/products',
    label: 'Products',
    icon: Package
  },
  {
    href: '/vendor/dashboard/locations',
    label: 'Locations',
    icon: MapPin
  },
  {
    href: '/vendor/dashboard/subscription', // NEW
    label: 'Subscription',
    icon: CreditCard
  },
  {
    href: '/vendor/dashboard/settings',
    label: 'Settings',
    icon: Settings
  },
]
```

#### Component Library Integration

**Use Existing shadcn/ui Components:**

All new components use the existing shadcn/ui library already in the project:

```typescript
// Form components
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// Display components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Dialog components
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Icons
import { Check, X, CreditCard, LayoutDashboard, Package, MapPin, Settings } from 'lucide-react'
```

**Styling Pattern**: Follow existing Tailwind CSS utility patterns in dashboard

## 3. Authentication & Authorization Integration

### 3.1 Authentication Flow

**Pattern**: Use existing Payload CMS authentication system

```typescript
// Session Management
import { getServerSession } from 'next-auth' // If using NextAuth
// OR
import { cookies } from 'next/headers'
const accessToken = cookies().get('access_token')?.value

// Token Validation
import { authService } from '@/lib/services/auth-service'
const user = authService.validateToken(accessToken)
```

### 3.2 Authorization Matrix

| Endpoint | Vendor (Own Account) | Vendor (Other Account) | Admin |
|----------|---------------------|------------------------|-------|
| POST /api/portal/vendors/[id]/tier-upgrade-request | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| GET /api/portal/vendors/[id]/tier-upgrade-request | ✅ Allowed | ❌ Forbidden | ❌ Forbidden |
| DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId] | ✅ Allowed (if pending) | ❌ Forbidden | ❌ Forbidden |
| GET /api/admin/tier-upgrade-requests | ❌ Forbidden | ❌ Forbidden | ✅ Allowed |
| PUT /api/admin/tier-upgrade-requests/[id]/approve | ❌ Forbidden | ❌ Forbidden | ✅ Allowed |
| PUT /api/admin/tier-upgrade-requests/[id]/reject | ❌ Forbidden | ❌ Forbidden | ✅ Allowed |

### 3.3 Authorization Implementation Pattern

```typescript
// Vendor endpoint authorization
export async function POST(request: NextRequest, context: RouteContext) {
  const user = await authenticateUser(request)
  const { id: vendorId } = await context.params

  // Check if user is vendor
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Vendor role required' } },
      { status: 403 }
    )
  }

  // Check if vendor owns this account
  if (user.vendorId !== vendorId) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Cannot access another vendor\'s resources' } },
      { status: 403 }
    )
  }

  // Proceed with operation
}

// Admin endpoint authorization
export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await authenticateUser(request)

  if (user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } },
      { status: 403 }
    )
  }

  // Proceed with operation
}
```

## 4. Error Handling & Validation Patterns

### 4.1 Validation Strategy

**Client-Side Validation (React Hook Form + Zod)**

```typescript
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const tierUpgradeRequestSchema = z.object({
  requestedTier: z.enum(['tier1', 'tier2', 'tier3'], {
    required_error: 'Please select a tier',
  }),
  vendorNotes: z.string()
    .min(20, 'Please provide at least 20 characters explaining why you need this upgrade')
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
})

type TierUpgradeRequestFormData = z.infer<typeof tierUpgradeRequestSchema>

export function TierUpgradeRequestForm({ currentTier, vendorId }: Props) {
  const form = useForm<TierUpgradeRequestFormData>({
    resolver: zodResolver(tierUpgradeRequestSchema),
    defaultValues: {
      vendorNotes: '',
    },
  })

  // Form submission logic
}
```

**Server-Side Validation (API Route)**

```typescript
import { z } from 'zod'

const requestBodySchema = z.object({
  requestedTier: z.enum(['tier1', 'tier2', 'tier3']),
  vendorNotes: z.string().max(500).optional(),
})

export async function POST(request: NextRequest, context: RouteContext) {
  const body = await request.json()

  // Validate request body
  const validation = requestBodySchema.safeParse(body)
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {}
    validation.error.errors.forEach((error) => {
      const field = error.path[0] as string
      fieldErrors[field] = error.message
    })

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: fieldErrors,
        },
      },
      { status: 400 }
    )
  }

  const validatedData = validation.data

  // Business logic validation
  const businessValidation = await TierUpgradeRequestService.validateUpgradeRequest(
    vendorId,
    validatedData.requestedTier,
    validatedData.vendorNotes
  )

  if (!businessValidation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: businessValidation.error,
        },
      },
      { status: 400 }
    )
  }

  // Proceed with creation
}
```

### 4.2 Error Response Patterns

**Standardized Error Response**

```typescript
interface APIError {
  success: false
  error: {
    code: ErrorCode
    message: string
    fields?: Record<string, string> // Validation errors
    details?: string // Additional context
  }
}

type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DUPLICATE_REQUEST'
  | 'INVALID_STATUS'
  | 'SERVER_ERROR'
```

**Error Handling in Frontend**

```typescript
const handleSubmit = async (data: FormState) => {
  try {
    setIsSubmitting(true)
    setError(null)

    const response = await fetch(`/api/portal/vendors/${vendorId}/tier-upgrade-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      // Handle specific error codes
      if (result.error.code === 'DUPLICATE_REQUEST') {
        setError('You already have a pending upgrade request')
        toast.error('You already have a pending upgrade request')
      } else if (result.error.code === 'VALIDATION_ERROR') {
        // Show field-specific errors
        if (result.error.fields) {
          Object.entries(result.error.fields).forEach(([field, message]) => {
            form.setError(field as any, { message: message as string })
          })
        }
        setError(result.error.message)
      } else {
        setError(result.error.message || 'Failed to submit request')
        toast.error('Failed to submit request')
      }
      return
    }

    // Success
    toast.success('Tier upgrade request submitted successfully')
    onSuccess?.(result.data)
  } catch (err) {
    setError('Network error. Please try again.')
    toast.error('Network error. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}
```

## 5. Notification Strategy

### 5.1 Phase 1 (MVP): Toast Notifications Only

**Implementation**: Use existing `sonner` library (already in project)

```typescript
import { toast } from 'sonner'

// Success notifications
toast.success('Tier upgrade request submitted successfully')
toast.success('Tier upgrade approved. Vendor tier updated to Tier 2')
toast.success('Request cancelled successfully')

// Error notifications
toast.error('Failed to submit request. Please try again.')
toast.error('You already have a pending upgrade request')

// Info notifications
toast.info('Your request is pending admin review')
```

**User Experience:**
- Vendor submits request → Toast: "Request submitted successfully"
- Admin approves request → Toast: "Tier upgrade approved"
- Admin rejects request → Toast: "Request rejected. Vendor has been notified."
- Vendor cancels request → Toast: "Request cancelled successfully"

### 5.2 Phase 2 (Future): Email Notifications

**Trigger Points:**

1. **Vendor submits request** → Email to admins
   - Subject: "New Tier Upgrade Request from {Vendor Name}"
   - Body: Vendor info, current tier, requested tier, justification
   - CTA: "Review Request" (link to admin panel)

2. **Admin approves request** → Email to vendor
   - Subject: "Tier Upgrade Approved - Welcome to {Tier Name}"
   - Body: Tier upgraded, new features unlocked, next steps
   - CTA: "View Dashboard" (link to vendor dashboard)

3. **Admin rejects request** → Email to vendor
   - Subject: "Tier Upgrade Request Update"
   - Body: Rejection reason, guidance on how to resubmit
   - CTA: "View Details" (link to subscription page)

**Integration Pattern:**

```typescript
// In TierUpgradeRequestService

import { EmailService } from '@/lib/services/EmailService'

static async approveRequest(requestId: string, adminId: string) {
  // ... existing approval logic ...

  try {
    // Send email notification (non-blocking)
    await EmailService.sendTierUpgradeApprovedEmail(request)
  } catch (error) {
    // Log error but don't fail the approval
    console.error('Failed to send approval email:', error)
  }

  return { success: true, data: result }
}
```

### 5.3 Phase 3 (Future): In-App Notifications

**Implementation**: Add notification bell icon in dashboard header

**Notification Types:**
- "Your tier upgrade request to {tier} has been approved"
- "Your tier upgrade request was rejected. View reason."
- "New tier upgrade request from {vendor}" (admin only)

## 6. Testing Strategy for Integrations

### 6.1 Integration Test Plan

**Test 1: Payload CMS Collection Integration**

```typescript
describe('TierUpgradeRequests Collection Integration', () => {
  it('should create tier upgrade request with vendor relationship', async () => {
    const payload = await getPayload({ config })

    // Create request
    const request = await payload.create({
      collection: 'tier_upgrade_requests',
      data: {
        vendor: vendorId,
        user: userId,
        requestedTier: 'tier2',
        vendorNotes: 'Need more product listings',
      },
    })

    // Verify relationships populated
    expect(request.vendor).toBeDefined()
    expect(typeof request.vendor).toBe('object')
    expect(request.vendor.id).toBe(vendorId)
    expect(request.currentTier).toBe('tier1') // Auto-populated from vendor
  })

  it('should enforce unique pending request constraint', async () => {
    // Create first request
    await createRequest(vendorId, 'tier2')

    // Attempt to create second pending request
    await expect(
      createRequest(vendorId, 'tier3')
    ).rejects.toThrow(/duplicate/i)
  })

  it('should cascade delete requests when vendor deleted', async () => {
    const request = await createRequest(vendorId, 'tier2')

    // Delete vendor
    await payload.delete({
      collection: 'vendors',
      id: vendorId,
    })

    // Verify request also deleted
    await expect(
      payload.findByID({
        collection: 'tier_upgrade_requests',
        id: request.id,
      })
    ).rejects.toThrow(/not found/i)
  })
})
```

**Test 2: API Authorization Integration**

```typescript
describe('API Authorization Integration', () => {
  it('should allow vendor to submit request for own account', async () => {
    const response = await POST(
      createMockRequest({ vendorId: 'vendor-123', requestedTier: 'tier2' }),
      { params: { id: 'vendor-123' } }
    )

    expect(response.status).toBe(201)
  })

  it('should prevent vendor from submitting for another account', async () => {
    const response = await POST(
      createMockRequest({ vendorId: 'vendor-123', requestedTier: 'tier2' }),
      { params: { id: 'vendor-456' } } // Different vendor
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: 'FORBIDDEN' }
    })
  })

  it('should allow admin to approve any request', async () => {
    const request = await createRequest(vendorId, 'tier2')

    const response = await PUT(
      createMockAdminRequest(),
      { params: { id: request.id } }
    )

    expect(response.status).toBe(200)
  })
})
```

**Test 3: Atomic Approval Transaction**

```typescript
describe('Atomic Approval Integration', () => {
  it('should update vendor tier and request status atomically', async () => {
    const request = await createRequest(vendorId, 'tier2')

    // Approve request
    const result = await TierUpgradeRequestService.approveRequest(
      request.id,
      adminId
    )

    expect(result.success).toBe(true)

    // Verify vendor tier updated
    const vendor = await getVendor(vendorId)
    expect(vendor.tier).toBe('tier2')

    // Verify request status updated
    const updatedRequest = await getRequest(request.id)
    expect(updatedRequest.status).toBe('approved')
    expect(updatedRequest.reviewedBy).toBe(adminId)
    expect(updatedRequest.reviewedAt).toBeDefined()
  })

  it('should rollback both changes if vendor update fails', async () => {
    const request = await createRequest(vendorId, 'tier2')

    // Mock vendor update to fail
    jest.spyOn(VendorProfileService, 'updateVendorProfile')
      .mockRejectedValueOnce(new Error('Update failed'))

    // Attempt approval
    const result = await TierUpgradeRequestService.approveRequest(
      request.id,
      adminId
    )

    expect(result.success).toBe(false)

    // Verify vendor tier unchanged
    const vendor = await getVendor(vendorId)
    expect(vendor.tier).toBe('tier1')

    // Verify request status still pending
    const unchangedRequest = await getRequest(request.id)
    expect(unchangedRequest.status).toBe('pending')
  })
})
```

**Test 4: Frontend-Backend Integration**

```typescript
describe('Frontend-Backend Integration', () => {
  it('should submit request and show status card', async () => {
    render(<SubscriptionPage vendorId="vendor-123" currentTier="tier1" />)

    // Initially shows form
    expect(screen.getByLabelText(/requested tier/i)).toBeInTheDocument()

    // Submit form
    fireEvent.change(screen.getByLabelText(/tier/i), { target: { value: 'tier2' } })
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Need more product listings for our growing catalog' }
    })
    fireEvent.click(screen.getByText(/submit/i))

    // Wait for API call
    await waitFor(() => {
      expect(screen.getByText(/request submitted successfully/i)).toBeInTheDocument()
    })

    // Verify form replaced with status card
    expect(screen.queryByLabelText(/requested tier/i)).not.toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })
})
```

### 6.2 Testing Integration Points Checklist

- [ ] Payload CMS collection creates with correct relationships
- [ ] Foreign key constraints enforce data integrity
- [ ] Cascade deletes work correctly
- [ ] API authentication uses existing auth service
- [ ] API authorization checks vendor ownership
- [ ] Admin role checks work correctly
- [ ] Service layer calls VendorProfileService for tier updates
- [ ] Cache invalidation triggers on tier update
- [ ] Static page revalidation works
- [ ] Toast notifications display correctly
- [ ] Form validation matches server-side validation
- [ ] Error responses follow standardized format
- [ ] Frontend components use existing shadcn/ui library
- [ ] Navigation integration works with dashboard layout
- [ ] Atomic transactions rollback on failure

## 7. Risk Assessment & Mitigation

### 7.1 Integration Risks

**Risk 1: Transaction Atomicity Failure**

- **Risk**: Vendor tier updated but request status not updated (or vice versa)
- **Impact**: Data inconsistency, tier mismatch with request status
- **Likelihood**: Medium (if transactions not properly implemented)
- **Mitigation**:
  - Use Payload CMS transaction API or wrap in try-catch with manual rollback
  - Add database constraint checks
  - Add integration test verifying both updates occur or both fail
  - Add monitoring/alerting for mismatched states

**Risk 2: Duplicate Request Race Condition**

- **Risk**: Two requests submitted simultaneously before constraint check
- **Impact**: Vendor has multiple pending requests
- **Likelihood**: Low (database constraint should prevent)
- **Mitigation**:
  - Database UNIQUE constraint on (vendor_id, status) WHERE status='pending'
  - Server-side check before creation
  - Lock vendor row during request creation (pessimistic locking)

**Risk 3: Authentication/Authorization Bypass**

- **Risk**: Vendor accesses another vendor's requests or admin endpoints
- **Impact**: Security breach, unauthorized data access
- **Likelihood**: Low (if following existing patterns)
- **Mitigation**:
  - Use existing auth middleware consistently
  - Add authorization checks at both API and service layers
  - Add security tests for all endpoints
  - Code review focusing on auth logic

**Risk 4: Payload CMS Version Compatibility**

- **Risk**: Collection hooks or API changes in future Payload CMS versions
- **Impact**: Collection creation fails, hooks don't trigger
- **Likelihood**: Low (semantic versioning should prevent breaking changes)
- **Mitigation**:
  - Lock Payload CMS version in package.json
  - Test collection creation in staging before production deployment
  - Follow Payload CMS migration guides for version upgrades

### 7.2 Data Integrity Safeguards

1. **Database Constraints**
```sql
-- Prevent duplicate pending requests
CONSTRAINT unique_pending_per_vendor UNIQUE (vendor_id, status) WHERE status = 'pending'

-- Ensure tier upgrade (not downgrade)
CHECK (target_tier > current_tier)

-- Valid tier values
CHECK (target_tier >= 1 AND target_tier <= 4)

-- Valid status values
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
```

2. **Service Layer Validation**
- Validate requested tier exists in vendor's current tier
- Validate no existing pending request before creation
- Validate request is pending before approval/rejection
- Validate admin user exists before setting reviewedBy

3. **API Layer Validation**
- Validate authentication token
- Validate request body schema with Zod
- Validate authorization (ownership/role)
- Validate rate limits not exceeded

## 8. Success Criteria

### 8.1 Integration Acceptance Criteria

**Backend Integration:**
- [ ] `tier_upgrade_requests` collection successfully created in Payload CMS
- [ ] Foreign key relationships to `vendors` and `users` collections work
- [ ] All 6 API endpoints (3 vendor, 3 admin) operational
- [ ] Authentication uses existing auth service consistently
- [ ] Authorization checks prevent cross-vendor access
- [ ] Service layer integrates with VendorProfileService for tier updates
- [ ] Database constraints prevent duplicate pending requests
- [ ] Transaction rollback works when tier update fails

**Frontend Integration:**
- [ ] Subscription page accessible from dashboard navigation
- [ ] Components use existing shadcn/ui library without custom styling
- [ ] Form validation matches server-side validation rules
- [ ] Toast notifications display using existing sonner library
- [ ] Error messages follow existing error display patterns
- [ ] Dashboard layout remains consistent with other pages

**Admin Integration:**
- [ ] Payload CMS admin UI shows tier upgrade requests collection
- [ ] Custom filter and action components render correctly
- [ ] Approve/reject actions call correct API endpoints
- [ ] Admin sees toast notifications on success/failure
- [ ] Request list refreshes after approval/rejection

**Data Flow Integration:**
- [ ] Vendor submits request → Database record created
- [ ] Admin approves request → Vendor tier updated + Request marked approved
- [ ] Vendor sees updated tier immediately after approval
- [ ] Cache invalidation triggers on tier update
- [ ] Static pages revalidate when vendor tier changes

### 8.2 Testing Coverage Criteria

- [ ] Unit tests: >80% coverage for service layer
- [ ] Integration tests: All critical flows tested
- [ ] E2E tests: Vendor and admin workflows tested
- [ ] Authorization tests: All access control scenarios tested
- [ ] Error handling tests: All error codes tested

## Conclusion

This integration strategy ensures the tier upgrade request system integrates seamlessly with existing infrastructure by:

1. Following established patterns from `VendorProfileService`, `TierService`, and existing API routes
2. Using existing authentication/authorization infrastructure
3. Leveraging existing UI component library (shadcn/ui)
4. Maintaining backward compatibility with no breaking changes
5. Implementing proper error handling and validation at all layers
6. Ensuring atomic operations for tier updates
7. Providing comprehensive testing strategy for all integration points

The strategy minimizes integration risk by reusing proven patterns and provides clear implementation guidance for each integration point.
