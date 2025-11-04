# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md

> Created: 2025-11-04
> Version: 1.0.0
> Feature Type: FULL_STACK
> Classification: Frontend + Backend Implementation

## Technical Requirements

### Technology Stack

**Framework & Runtime:**
- Next.js 14 App Router (TypeScript 5.2.2)
- React 18.2.0
- Node.js (LTS)

**Database & CMS:**
- Payload CMS 3+
- SQLite (development)
- PostgreSQL (production ready)

**Frontend Libraries:**
- shadcn/ui component library
- Tailwind CSS 3.3.3
- React Hook Form 7.53.0
- Zod 3.23.8 (validation)
- Zustand 5.0.3 (state management)
- Sonner (toast notifications)

**Authentication:**
- Payload CMS built-in authentication
- Role-based access control (admin, vendor)

**Testing:**
- Jest (unit tests)
- Playwright (E2E tests)
- React Testing Library (component tests)

### Architecture Overview

**Feature Classification:**
- **Type:** FULL_STACK
- **Frontend Required:** YES (vendor request form, admin approval UI)
- **Backend Required:** YES (API endpoints, database collection, business logic)
- **Pattern:** Service Layer + API Routes + React Components

**Data Flow:**
1. Vendor submits tier upgrade request via form
2. API validates and creates request in database
3. Admin reviews request in Payload CMS admin panel
4. Admin approves/rejects via custom UI actions
5. On approval: Vendor tier updated atomically + request marked approved
6. Vendor sees updated tier and request status in dashboard

## Approach

### Frontend Implementation

#### New Components

**1. TierUpgradeRequestForm** (`components/dashboard/TierUpgradeRequestForm.tsx`)

**Component Type:** Form Component (React Hook Form + Zod)

**Purpose:** Allow vendors to submit tier upgrade requests with tier selection and business justification.

**Props Interface:**
```typescript
interface TierUpgradeRequestFormProps {
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3'
  vendorId: string
  onSuccess?: () => void
  onCancel?: () => void
}
```

**State Management:**
```typescript
interface FormState {
  requestedTier: 'tier1' | 'tier2' | 'tier3'
  vendorNotes: string
}

const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Validation Schema (Zod):**
```typescript
const tierUpgradeRequestSchema = z.object({
  requestedTier: z.enum(['tier1', 'tier2', 'tier3']),
  vendorNotes: z.string()
    .min(20, 'Please provide at least 20 characters explaining why you need this upgrade')
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
})
```

**shadcn/ui Components Used:**
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` from `@/components/ui/form`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `Textarea` from `@/components/ui/textarea`
- `Button` from `@/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` from `@/components/ui/card`
- `Alert`, `AlertDescription` from `@/components/ui/alert`

**API Integration:**
```typescript
const handleSubmit = async (data: FormState) => {
  try {
    setIsSubmitting(true)
    setError(null)

    const response = await fetch(`/api/portal/vendors/${vendorId}/tier-upgrade-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to submit request')
    }

    const result = await response.json()
    toast.success('Tier upgrade request submitted successfully')
    onSuccess?.(result.data)
  } catch (err) {
    setError(err.message)
    toast.error('Failed to submit request')
  } finally {
    setIsSubmitting(false)
  }
}
```

**Validation Rules:**
- Requested tier must be higher than current tier
- Only show tier options higher than current tier in dropdown
- Vendor notes are optional but recommended
- Form disabled during submission

---

**2. UpgradeRequestStatusCard** (`components/dashboard/UpgradeRequestStatusCard.tsx`)

**Component Type:** Display Card

**Purpose:** Show status of pending/approved/rejected tier upgrade requests.

**Props Interface:**
```typescript
interface UpgradeRequestStatusCardProps {
  request: TierUpgradeRequest
  onCancel?: (requestId: string) => Promise<void>
  showActions?: boolean
}

interface TierUpgradeRequest {
  id: string
  vendorId: string
  currentTier: string
  requestedTier: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  vendorNotes?: string
  rejectionReason?: string
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: {
    id: string
    name: string
  }
}
```

**shadcn/ui Components Used:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`
- `Separator` from `@/components/ui/separator`
- `AlertDialog` (for cancel confirmation) from `@/components/ui/alert-dialog`

**Status Badge Styling:**
```typescript
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'warning' // yellow
    case 'approved': return 'success' // green
    case 'rejected': return 'destructive' // red
    case 'cancelled': return 'secondary' // gray
    default: return 'default'
  }
}
```

**Features:**
- Display status badge with color coding
- Show requested tier vs current tier
- Display request date (formatted with date-fns)
- Show rejection reason if status is 'rejected'
- Cancel button only for 'pending' status
- Confirmation dialog before cancel

**Cancel Functionality:**
```typescript
const handleCancel = async () => {
  try {
    const response = await fetch(
      `/api/portal/vendors/${request.vendorId}/tier-upgrade-request/${request.id}`,
      { method: 'DELETE' }
    )

    if (!response.ok) throw new Error('Failed to cancel request')

    toast.success('Request cancelled successfully')
    onCancel?.(request.id)
  } catch (err) {
    toast.error('Failed to cancel request')
  }
}
```

---

**3. TierComparisonTable** (`components/TierComparisonTable.tsx`)

**Component Type:** Display Table (Reusable)

**Purpose:** Show feature differences across all subscription tiers to help vendors make informed upgrade decisions.

**Props Interface:**
```typescript
interface TierComparisonTableProps {
  currentTier?: 'free' | 'tier1' | 'tier2' | 'tier3'
  highlightTier?: string // Highlight a specific tier column
  className?: string
}
```

**shadcn/ui Components Used:**
- `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` from `@/components/ui/table`
- `Badge` from `@/components/ui/badge`
- `Check`, `X` icons from `lucide-react`

**Tier Feature Matrix:**
```typescript
const tierFeatures = [
  {
    category: 'Listings & Products',
    features: [
      { name: 'Products Listed', free: '1', tier1: '5', tier2: '25', tier3: 'Unlimited' },
      { name: 'Product Images per Product', free: '1', tier1: '3', tier2: '10', tier3: 'Unlimited' },
      { name: 'Featured Products', free: false, tier1: 1, tier2: 5, tier3: 'Unlimited' },
    ]
  },
  {
    category: 'Locations',
    features: [
      { name: 'Business Locations', free: '1', tier1: '1', tier2: '5', tier3: '10' },
      { name: 'Interactive Map Display', free: false, tier1: true, tier2: true, tier3: true },
    ]
  },
  {
    category: 'Profile & Branding',
    features: [
      { name: 'Company Logo', free: true, tier1: true, tier2: true, tier3: true },
      { name: 'Company Description', free: '100 chars', tier1: '250 chars', tier2: '500 chars', tier3: 'Unlimited' },
      { name: 'Social Media Links', free: false, tier1: true, tier2: true, tier3: true },
      { name: 'Website Link', free: true, tier1: true, tier2: true, tier3: true },
      { name: 'Custom Branding Colors', free: false, tier1: false, tier2: true, tier3: true },
    ]
  },
  {
    category: 'Marketing & Visibility',
    features: [
      { name: 'Search Result Priority', free: 'Low', tier1: 'Medium', tier2: 'High', tier3: 'Highest' },
      { name: 'Homepage Featured Listing', free: false, tier1: false, tier2: true, tier3: true },
      { name: 'Newsletter Inclusion', free: false, tier1: false, tier2: true, tier3: true },
      { name: 'Promotion Pack Credits/Year', free: '0', tier1: '2', tier2: '6', tier3: '12' },
    ]
  },
  {
    category: 'Analytics & Insights',
    features: [
      { name: 'Profile Views', free: 'Basic', tier1: 'Basic', tier2: 'Advanced', tier3: 'Advanced' },
      { name: 'Product Clicks', free: false, tier1: 'Basic', tier2: 'Advanced', tier3: 'Advanced' },
      { name: 'Contact Button Clicks', free: false, tier1: false, tier2: true, tier3: true },
      { name: 'Export Analytics Data', free: false, tier1: false, tier2: false, tier3: true },
    ]
  },
  {
    category: 'Support',
    features: [
      { name: 'Email Support', free: 'Standard', tier1: 'Priority', tier2: 'Priority', tier3: 'Premium' },
      { name: 'Response Time', free: '48hrs', tier1: '24hrs', tier2: '12hrs', tier3: '4hrs' },
      { name: 'Account Manager', free: false, tier1: false, tier2: false, tier3: true },
    ]
  },
]
```

**Rendering Logic:**
- Highlight current tier column with background color
- Use checkmarks (Check icon) for boolean true values
- Use X icon for boolean false values
- Display numeric/string values as-is
- Make highlighted tier visually distinct (border, background)

---

#### New Page Routes

**1. Subscription Page** (`app/(site)/vendor/dashboard/subscription/page.tsx`)

**Route:** `/vendor/dashboard/subscription`

**Layout:** Uses existing vendor dashboard layout with sidebar navigation

**Purpose:** Central hub for vendors to view tier comparison, submit upgrade requests, and track request status.

**Page Structure:**
```typescript
export default async function SubscriptionPage() {
  const session = await getServerSession()
  const vendorId = session.user.vendorId

  // Fetch vendor data
  const vendor = await getVendorById(vendorId)

  // Fetch pending or most recent upgrade request
  const upgradeRequest = await fetch(`/api/portal/vendors/${vendorId}/tier-upgrade-request`)
    .then(res => res.ok ? res.json() : null)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription & Tier Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription tier and unlock additional features
        </p>
      </div>

      {/* Current Tier Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionTierBadge tier={vendor.tier} size="lg" />
          <p className="mt-4">You are currently on the {vendor.tier} tier</p>
        </CardContent>
      </Card>

      {/* Tier Comparison */}
      <TierComparisonTable currentTier={vendor.tier} />

      {/* Request Form or Status */}
      {upgradeRequest?.status === 'pending' ? (
        <UpgradeRequestStatusCard request={upgradeRequest} />
      ) : (
        <TierUpgradeRequestForm
          currentTier={vendor.tier}
          vendorId={vendorId}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
```

**Access Control:**
- Protected route (requires vendor authentication)
- Redirects to login if not authenticated
- Only accessible by vendors (not admins or public users)

---

#### Component Updates

**1. UpgradePromptCard** (`components/dashboard/UpgradePromptCard.tsx`)

**Changes Required:**
```typescript
// BEFORE:
<Button onClick={onContactSales}>Contact Sales</Button>

// AFTER:
<Link href="/vendor/dashboard/subscription">
  <Button>View Subscription Options</Button>
</Link>
```

**Impact:** Removes need for external sales contact, streamlines upgrade process to self-service.

---

**2. Dashboard Sidebar Navigation**

**File:** `app/(site)/vendor/dashboard/layout.tsx` or navigation component

**Changes Required:**
Add new navigation item to sidebar:
```typescript
const navigationItems = [
  { href: '/vendor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/vendor/dashboard/products', label: 'Products', icon: Package },
  { href: '/vendor/dashboard/locations', label: 'Locations', icon: MapPin },
  { href: '/vendor/dashboard/subscription', label: 'Subscription', icon: CreditCard }, // NEW
  { href: '/vendor/dashboard/settings', label: 'Settings', icon: Settings },
]
```

---

#### User Flows

**Flow 1: Submit Tier Upgrade Request**

1. **Starting Point:** Vendor dashboard homepage
2. **Trigger:**
   - Click "Upgrade" button in UpgradePromptCard, OR
   - Click "Subscription" in sidebar navigation
3. **Navigation:** Route to `/vendor/dashboard/subscription`
4. **Page Load:**
   - Fetch vendor's current tier
   - Fetch any existing upgrade requests
   - Render TierComparisonTable showing all tiers
5. **Decision Point:**
   - **If pending request exists:** Show UpgradeRequestStatusCard
   - **If no pending request:** Show TierUpgradeRequestForm
6. **User Interaction (Form Path):**
   - Review tier comparison table
   - Select desired tier from dropdown (only shows higher tiers)
   - Enter business justification in notes textarea (optional)
   - Click "Submit Request" button
7. **Form Submission:**
   - Button shows loading spinner
   - Form fields disabled during submission
   - API call: `POST /api/portal/vendors/{vendorId}/tier-upgrade-request`
8. **Success Path:**
   - API returns 201 with request data
   - Toast notification: "Tier upgrade request submitted successfully"
   - Page refreshes, showing UpgradeRequestStatusCard with "Pending" status
9. **Error Paths:**
   - **Validation error (400):** Show error message in form, preserve entered data
   - **Duplicate request (409):** Toast: "You already have a pending upgrade request"
   - **Network error:** Toast: "Failed to submit request. Please try again."

**Flow 2: Cancel Pending Request**

1. **Starting Point:** Subscription page with pending request showing
2. **Trigger:** Click "Cancel Request" button in UpgradeRequestStatusCard
3. **Confirmation:** AlertDialog appears asking "Are you sure you want to cancel this request?"
4. **User Confirms:**
   - API call: `DELETE /api/portal/vendors/{vendorId}/tier-upgrade-request/{requestId}`
   - Button shows loading state
5. **Success:**
   - Request cancelled in database
   - Toast: "Request cancelled successfully"
   - Page refreshes, showing TierUpgradeRequestForm again
6. **Error:**
   - Toast: "Failed to cancel request. Please try again."

**Flow 3: Admin Approves Request**

1. **Starting Point:** Payload CMS admin panel at `/admin/collections/tier_upgrade_requests`
2. **Admin Views List:**
   - Sees all upgrade requests with filters (status, vendor, date)
   - Can sort by request date, status
3. **Admin Opens Request:**
   - Clicks on pending request row
   - Views request details: vendor info, current tier, requested tier, notes
4. **Admin Decision:**
   - Clicks "Approve" button in custom actions component
5. **Confirmation Dialog:**
   - "Are you sure you want to approve this upgrade to {tier}?"
   - Shows vendor name and requested tier
6. **Admin Confirms:**
   - API call: `PUT /api/admin/tier-upgrade-requests/{id}/approve`
   - Loading state on button
7. **Backend Processing:**
   - Transaction starts
   - Update vendor tier via existing API
   - Update request status to 'approved'
   - Set reviewedAt timestamp
   - Set reviewedBy to current admin user
   - Transaction commits
8. **Success:**
   - Toast: "Tier upgrade approved. Vendor tier updated to {tier}"
   - Request list refreshes, showing approved status
9. **Vendor Experience:**
   - Next login: Sees updated tier in dashboard
   - Subscription page shows approved request status

**Flow 4: Admin Rejects Request**

1. **Starting Point:** Admin viewing pending request in CMS
2. **Admin Clicks:** "Reject" button
3. **Modal Appears:**
   - Textarea for rejection reason (required)
   - "The reason will be shared with the vendor"
4. **Admin Enters Reason:**
   - Example: "Please provide more details about your business growth"
5. **Admin Submits:**
   - API call: `PUT /api/admin/tier-upgrade-requests/{id}/reject`
   - Body: `{ rejectionReason: "..." }`
6. **Backend Processing:**
   - Update request status to 'rejected'
   - Save rejection reason
   - Set reviewedAt, reviewedBy
7. **Success:**
   - Toast: "Request rejected. Vendor has been notified."
   - Request marked as rejected in list
8. **Vendor Experience:**
   - Subscription page shows rejected status
   - Rejection reason displayed in UpgradeRequestStatusCard
   - Can submit new request after reviewing feedback

---

### Backend Implementation

#### API Endpoints

**1. POST /api/portal/vendors/[id]/tier-upgrade-request**

**File:** `app/api/portal/vendors/[id]/tier-upgrade-request/route.ts`

**Purpose:** Submit a new tier upgrade request

**Authentication:** Required (vendor role)

**Authorization:** Vendor can only submit requests for their own account

**Request:**
```typescript
interface RequestBody {
  requestedTier: 'tier1' | 'tier2' | 'tier3'
  vendorNotes?: string // optional, max 500 chars
}
```

**Response (Success - 201):**
```typescript
interface SuccessResponse {
  success: true
  data: {
    id: string
    vendorId: string
    currentTier: string
    requestedTier: string
    status: 'pending'
    vendorNotes?: string
    requestedAt: string
    user: {
      id: string
      email: string
    }
  }
}
```

**Response (Error - 400):**
```typescript
interface ValidationError {
  success: false
  error: 'VALIDATION_ERROR'
  message: string
  details?: {
    field: string
    issue: string
  }[]
}
```

**Response (Error - 409):**
```typescript
interface DuplicateError {
  success: false
  error: 'DUPLICATE_REQUEST'
  message: 'You already have a pending upgrade request'
  existingRequest: {
    id: string
    requestedTier: string
    requestedAt: string
  }
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Validation error (invalid tier, notes too long, tier not higher than current)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not a vendor or not own account)
- `409` - Conflict (duplicate pending request)
- `500` - Internal server error

**Implementation:**
```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    // Auth check
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Authorization check
    if (session.user.vendorId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'Cannot submit request for another vendor' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validation
    const result = TierUpgradeRequestService.validateUpgradeRequest(
      session.user.vendorId,
      body.requestedTier,
      body.vendorNotes
    )

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: result.error },
        { status: 400 }
      )
    }

    // Check for duplicate pending request
    const existingRequest = await TierUpgradeRequestService.getPendingRequest(params.id)
    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_REQUEST',
          message: 'You already have a pending upgrade request',
          existingRequest
        },
        { status: 409 }
      )
    }

    // Create request
    const newRequest = await TierUpgradeRequestService.createUpgradeRequest({
      vendorId: params.id,
      userId: session.user.id,
      requestedTier: body.requestedTier,
      vendorNotes: body.vendorNotes
    })

    return NextResponse.json(
      { success: true, data: newRequest },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating tier upgrade request:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Failed to create request' },
      { status: 500 }
    )
  }
}
```

---

**2. GET /api/portal/vendors/[id]/tier-upgrade-request**

**File:** `app/api/portal/vendors/[id]/tier-upgrade-request/route.ts`

**Purpose:** Get current pending request or most recent request for a vendor

**Authentication:** Required (vendor role)

**Authorization:** Vendor can only view their own requests

**Query Parameters:** None

**Response (Success - 200):**
```typescript
interface SuccessResponse {
  success: true
  data: TierUpgradeRequest | null
}
```

**Response (No Request - 200):**
```typescript
{
  success: true,
  data: null
}
```

**Implementation:**
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    if (session.user.vendorId !== params.id) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    // Get pending request first, fall back to most recent
    const request = await TierUpgradeRequestService.getPendingRequest(params.id)
      ?? await TierUpgradeRequestService.getMostRecentRequest(params.id)

    return NextResponse.json({ success: true, data: request })
  } catch (error) {
    console.error('Error fetching tier upgrade request:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

---

**3. DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId]**

**File:** `app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts`

**Purpose:** Cancel a pending tier upgrade request

**Authentication:** Required (vendor role)

**Authorization:** Vendor can only cancel their own requests

**Constraints:** Request status must be 'pending'

**Response (Success - 200):**
```typescript
interface SuccessResponse {
  success: true
  message: 'Request cancelled successfully'
  data: {
    id: string
    status: 'cancelled'
    cancelledAt: string
  }
}
```

**Response (Error - 400):**
```typescript
interface InvalidStatusError {
  success: false
  error: 'INVALID_STATUS'
  message: 'Only pending requests can be cancelled'
}
```

**Implementation:**
```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const session = await getServerSession()

    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    if (session.user.vendorId !== params.id) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    const result = await TierUpgradeRequestService.cancelRequest(
      params.requestId,
      params.id
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Request cancelled successfully',
      data: result.data
    })
  } catch (error) {
    console.error('Error cancelling tier upgrade request:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

---

**4. GET /api/admin/tier-upgrade-requests**

**File:** `app/api/admin/tier-upgrade-requests/route.ts`

**Purpose:** List all tier upgrade requests with filtering and pagination (admin only)

**Authentication:** Required (admin role)

**Query Parameters:**
```typescript
interface QueryParams {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
  vendorId?: string
  dateFrom?: string // ISO date
  dateTo?: string // ISO date
  page?: number // default 1
  limit?: number // default 20, max 100
  sortBy?: 'requestedAt' | 'reviewedAt'
  sortOrder?: 'asc' | 'desc' // default 'desc'
}
```

**Response (Success - 200):**
```typescript
interface SuccessResponse {
  success: true
  data: {
    requests: TierUpgradeRequest[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}
```

**Implementation:**
```typescript
export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get('status'),
      vendorId: searchParams.get('vendorId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: searchParams.get('sortBy') || 'requestedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    }

    const result = await TierUpgradeRequestService.listRequests(filters)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error listing tier upgrade requests:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

---

**5. PUT /api/admin/tier-upgrade-requests/[id]/approve**

**File:** `app/api/admin/tier-upgrade-requests/[id]/approve/route.ts`

**Purpose:** Approve a tier upgrade request and update vendor tier atomically

**Authentication:** Required (admin role)

**Request Body:** None

**Response (Success - 200):**
```typescript
interface SuccessResponse {
  success: true
  message: 'Tier upgrade approved successfully'
  data: {
    request: TierUpgradeRequest
    vendor: {
      id: string
      tier: string
      updatedAt: string
    }
  }
}
```

**Response (Error - 400):**
```typescript
interface InvalidStatusError {
  success: false
  error: 'INVALID_STATUS'
  message: 'Only pending requests can be approved'
}
```

**Implementation:**
```typescript
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Atomic operation: update vendor tier + update request status
    const result = await TierUpgradeRequestService.approveRequest(
      params.id,
      session.user.id
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tier upgrade approved successfully',
      data: result.data
    })
  } catch (error) {
    console.error('Error approving tier upgrade request:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

**Critical Business Logic:**
- Must be executed in a database transaction
- Update vendor tier via existing `PUT /api/admin/vendors/[vendorId]/tier` endpoint
- Update request status, reviewedAt, reviewedBy in same transaction
- Rollback both updates if either fails
- Send notification email to vendor (optional enhancement)

---

**6. PUT /api/admin/tier-upgrade-requests/[id]/reject**

**File:** `app/api/admin/tier-upgrade-requests/[id]/reject/route.ts`

**Purpose:** Reject a tier upgrade request with a reason

**Authentication:** Required (admin role)

**Request Body:**
```typescript
interface RequestBody {
  rejectionReason: string // required, max 1000 chars
}
```

**Response (Success - 200):**
```typescript
interface SuccessResponse {
  success: true
  message: 'Tier upgrade request rejected'
  data: TierUpgradeRequest
}
```

**Response (Error - 400):**
```typescript
interface ValidationError {
  success: false
  error: 'VALIDATION_ERROR'
  message: 'Rejection reason is required'
}
```

**Implementation:**
```typescript
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    if (body.rejectionReason.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: 'Rejection reason too long (max 1000 chars)' },
        { status: 400 }
      )
    }

    const result = await TierUpgradeRequestService.rejectRequest(
      params.id,
      body.rejectionReason,
      session.user.id
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tier upgrade request rejected',
      data: result.data
    })
  } catch (error) {
    console.error('Error rejecting tier upgrade request:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

---

#### Database Schema

**Collection File:** `payload/collections/TierUpgradeRequests.ts`

**Payload CMS Collection Configuration:**

```typescript
import { CollectionConfig } from 'payload/types'

const TierUpgradeRequests: CollectionConfig = {
  slug: 'tier_upgrade_requests',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['vendor', 'currentTier', 'requestedTier', 'status', 'requestedAt'],
    group: 'Administration',
    description: 'Manage vendor tier upgrade requests',
  },
  access: {
    // Read: Admins can see all, vendors can see their own
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'vendor') {
        return {
          vendor: { equals: user.vendorId }
        }
      }
      return false
    },
    // Create: Only vendors can create
    create: ({ req: { user } }) => {
      return user?.role === 'vendor'
    },
    // Update: Only admins can update (approve/reject)
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    // Delete: Only admins can delete
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      hasMany: false,
      admin: {
        description: 'The vendor requesting the tier upgrade',
      },
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        description: 'The user who submitted the request',
      },
    },
    {
      name: 'currentTier',
      type: 'select',
      required: true,
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Tier 1', value: 'tier1' },
        { label: 'Tier 2', value: 'tier2' },
        { label: 'Tier 3', value: 'tier3' },
      ],
      admin: {
        description: 'Vendor tier at time of request',
      },
    },
    {
      name: 'requestedTier',
      type: 'select',
      required: true,
      options: [
        { label: 'Tier 1', value: 'tier1' },
        { label: 'Tier 2', value: 'tier2' },
        { label: 'Tier 3', value: 'tier3' },
      ],
      admin: {
        description: 'Tier the vendor wants to upgrade to',
      },
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        description: 'Current status of the request',
      },
      index: true,
    },
    {
      name: 'vendorNotes',
      type: 'textarea',
      required: false,
      maxLength: 500,
      admin: {
        description: 'Vendor explanation for why they need the upgrade (optional)',
        placeholder: 'Please explain why you need this tier upgrade...',
      },
    },
    {
      name: 'rejectionReason',
      type: 'richText',
      required: false,
      admin: {
        description: 'Admin reason for rejection (visible to vendor)',
        condition: (data) => data.status === 'rejected',
      },
    },
    {
      name: 'requestedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Date and time the request was submitted',
        date: {
          displayFormat: 'MMM dd, yyyy h:mm a',
        },
      },
      index: true,
    },
    {
      name: 'reviewedAt',
      type: 'date',
      required: false,
      admin: {
        description: 'Date and time the request was reviewed',
        condition: (data) => ['approved', 'rejected'].includes(data.status),
        date: {
          displayFormat: 'MMM dd, yyyy h:mm a',
        },
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      hasMany: false,
      admin: {
        description: 'Admin who reviewed the request',
        condition: (data) => ['approved', 'rejected'].includes(data.status),
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Set currentTier from vendor if creating
        if (operation === 'create' && data.vendor) {
          const vendor = await req.payload.findByID({
            collection: 'vendors',
            id: data.vendor,
          })
          data.currentTier = vendor.tier
        }

        // Validate requested tier is higher than current
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
  timestamps: true,
}

export default TierUpgradeRequests
```

**Database Table Structure (SQLite/PostgreSQL):**

```sql
CREATE TABLE tier_upgrade_requests (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  current_tier TEXT NOT NULL CHECK(current_tier IN ('free', 'tier1', 'tier2', 'tier3')),
  requested_tier TEXT NOT NULL CHECK(requested_tier IN ('tier1', 'tier2', 'tier3')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),
  vendor_notes TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tier_upgrade_requests_vendor ON tier_upgrade_requests(vendor_id);
CREATE INDEX idx_tier_upgrade_requests_status ON tier_upgrade_requests(status);
CREATE INDEX idx_tier_upgrade_requests_requested_at ON tier_upgrade_requests(requested_at);
CREATE INDEX idx_tier_upgrade_requests_vendor_status ON tier_upgrade_requests(vendor_id, status);
```

**Indexes:**
- `vendor_id` - For vendor-specific queries
- `status` - For filtering by status
- `requested_at` - For sorting by date
- Composite index on `vendor_id + status` for checking pending requests

**Integration with payload.config.ts:**
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
    TierUpgradeRequests, // ADD THIS
  ],
  // ... rest of config
})
```

---

#### Service Layer

**Service File:** `lib/services/TierUpgradeRequestService.ts`

**Purpose:** Centralize business logic for tier upgrade request operations

**Service Interface:**

```typescript
interface TierUpgradeRequestService {
  // Validation
  validateUpgradeRequest(vendorId: string, requestedTier: string, notes?: string): ValidationResult

  // CRUD Operations
  createUpgradeRequest(data: CreateRequestData): Promise<TierUpgradeRequest>
  getPendingRequest(vendorId: string): Promise<TierUpgradeRequest | null>
  getMostRecentRequest(vendorId: string): Promise<TierUpgradeRequest | null>
  listRequests(filters: ListFilters): Promise<PaginatedRequests>

  // Status Changes
  approveRequest(requestId: string, adminId: string): Promise<ApproveResult>
  rejectRequest(requestId: string, reason: string, adminId: string): Promise<RejectResult>
  cancelRequest(requestId: string, vendorId: string): Promise<CancelResult>
}
```

**Implementation:**

```typescript
import { getPayloadClient } from '@/payload/payloadClient'
import { TierUpgradeRequest, Vendor } from '@/lib/types'

interface ValidationResult {
  valid: boolean
  error?: string
}

interface CreateRequestData {
  vendorId: string
  userId: string
  requestedTier: 'tier1' | 'tier2' | 'tier3'
  vendorNotes?: string
}

interface ListFilters {
  status?: string
  vendorId?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface PaginatedRequests {
  requests: TierUpgradeRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export class TierUpgradeRequestService {
  private static payload = getPayloadClient()

  /**
   * Validate if upgrade request is valid
   */
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

    // Validate requested tier is higher than current
    const tierOrder = { free: 0, tier1: 1, tier2: 2, tier3: 3 }
    if (tierOrder[requestedTier] <= tierOrder[vendor.tier]) {
      return { valid: false, error: 'Requested tier must be higher than current tier' }
    }

    // Validate notes length
    if (notes && notes.length > 500) {
      return { valid: false, error: 'Vendor notes cannot exceed 500 characters' }
    }

    return { valid: true }
  }

  /**
   * Create a new tier upgrade request
   */
  static async createUpgradeRequest(data: CreateRequestData): Promise<TierUpgradeRequest> {
    const vendor = await this.payload.findByID({
      collection: 'vendors',
      id: data.vendorId,
    })

    const request = await this.payload.create({
      collection: 'tier_upgrade_requests',
      data: {
        vendor: data.vendorId,
        user: data.userId,
        currentTier: vendor.tier,
        requestedTier: data.requestedTier,
        status: 'pending',
        vendorNotes: data.vendorNotes,
        requestedAt: new Date().toISOString(),
      },
    })

    return request as TierUpgradeRequest
  }

  /**
   * Get pending request for a vendor
   */
  static async getPendingRequest(vendorId: string): Promise<TierUpgradeRequest | null> {
    const result = await this.payload.find({
      collection: 'tier_upgrade_requests',
      where: {
        and: [
          { vendor: { equals: vendorId } },
          { status: { equals: 'pending' } }
        ]
      },
      limit: 1,
    })

    return result.docs[0] || null
  }

  /**
   * Get most recent request for a vendor (any status)
   */
  static async getMostRecentRequest(vendorId: string): Promise<TierUpgradeRequest | null> {
    const result = await this.payload.find({
      collection: 'tier_upgrade_requests',
      where: {
        vendor: { equals: vendorId }
      },
      sort: '-requestedAt',
      limit: 1,
    })

    return result.docs[0] || null
  }

  /**
   * List requests with filters and pagination
   */
  static async listRequests(filters: ListFilters): Promise<PaginatedRequests> {
    const where: any = {}

    if (filters.status) {
      where.status = { equals: filters.status }
    }

    if (filters.vendorId) {
      where.vendor = { equals: filters.vendorId }
    }

    if (filters.dateFrom || filters.dateTo) {
      where.requestedAt = {}
      if (filters.dateFrom) {
        where.requestedAt.greater_than_equal = filters.dateFrom
      }
      if (filters.dateTo) {
        where.requestedAt.less_than_equal = filters.dateTo
      }
    }

    const result = await this.payload.find({
      collection: 'tier_upgrade_requests',
      where: Object.keys(where).length > 0 ? where : undefined,
      page: filters.page,
      limit: filters.limit,
      sort: `${filters.sortOrder === 'asc' ? '' : '-'}${filters.sortBy}`,
    })

    return {
      requests: result.docs as TierUpgradeRequest[],
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalDocs,
        totalPages: result.totalPages,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPrevPage,
      },
    }
  }

  /**
   * Approve a tier upgrade request (atomic operation)
   */
  static async approveRequest(requestId: string, adminId: string) {
    try {
      // Get request
      const request = await this.payload.findByID({
        collection: 'tier_upgrade_requests',
        id: requestId,
      })

      if (!request) {
        return { success: false, error: 'NOT_FOUND', message: 'Request not found' }
      }

      if (request.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          message: 'Only pending requests can be approved'
        }
      }

      // Update vendor tier (calls existing API internally)
      const vendorUpdateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/vendors/${request.vendor}/tier`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: request.requestedTier }),
        }
      )

      if (!vendorUpdateResponse.ok) {
        throw new Error('Failed to update vendor tier')
      }

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

      const vendor = await this.payload.findByID({
        collection: 'vendors',
        id: request.vendor as string,
      })

      return {
        success: true,
        data: {
          request: updatedRequest,
          vendor: {
            id: vendor.id,
            tier: vendor.tier,
            updatedAt: vendor.updatedAt,
          },
        },
      }
    } catch (error) {
      console.error('Error approving request:', error)
      return { success: false, error: 'INTERNAL_ERROR', message: 'Failed to approve request' }
    }
  }

  /**
   * Reject a tier upgrade request
   */
  static async rejectRequest(requestId: string, reason: string, adminId: string) {
    try {
      const request = await this.payload.findByID({
        collection: 'tier_upgrade_requests',
        id: requestId,
      })

      if (!request) {
        return { success: false, error: 'NOT_FOUND', message: 'Request not found' }
      }

      if (request.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          message: 'Only pending requests can be rejected'
        }
      }

      const updatedRequest = await this.payload.update({
        collection: 'tier_upgrade_requests',
        id: requestId,
        data: {
          status: 'rejected',
          rejectionReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminId,
        },
      })

      return { success: true, data: updatedRequest }
    } catch (error) {
      console.error('Error rejecting request:', error)
      return { success: false, error: 'INTERNAL_ERROR', message: 'Failed to reject request' }
    }
  }

  /**
   * Cancel a pending request (vendor action)
   */
  static async cancelRequest(requestId: string, vendorId: string) {
    try {
      const request = await this.payload.findByID({
        collection: 'tier_upgrade_requests',
        id: requestId,
      })

      if (!request) {
        return { success: false, error: 'NOT_FOUND', message: 'Request not found' }
      }

      if (request.vendor !== vendorId) {
        return {
          success: false,
          error: 'FORBIDDEN',
          message: 'Cannot cancel another vendor\'s request'
        }
      }

      if (request.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          message: 'Only pending requests can be cancelled'
        }
      }

      const updatedRequest = await this.payload.update({
        collection: 'tier_upgrade_requests',
        id: requestId,
        data: {
          status: 'cancelled',
        },
      })

      return {
        success: true,
        data: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          cancelledAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('Error cancelling request:', error)
      return { success: false, error: 'INTERNAL_ERROR', message: 'Failed to cancel request' }
    }
  }
}

export default TierUpgradeRequestService
```

**Service Responsibilities:**
- Input validation and business rule enforcement
- Interaction with Payload CMS API
- Transaction-like operations (approve request = update vendor + update request)
- Error handling and result formatting
- Centralized database queries

---

#### Admin UI Implementation

**Custom Payload Components:**

**1. TierUpgradeRequestActions Component**

**File:** `payload/components/TierUpgradeRequestActions.tsx`

**Purpose:** Custom row actions for approve/reject in admin list view

```typescript
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'

interface TierUpgradeRequestActionsProps {
  requestId: string
  status: string
  vendorName: string
  requestedTier: string
  onSuccess: () => void
}

export const TierUpgradeRequestActions: React.FC<TierUpgradeRequestActionsProps> = ({
  requestId,
  status,
  vendorName,
  requestedTier,
  onSuccess,
}) => {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Only show actions for pending requests
  if (status !== 'pending') {
    return null
  }

  const handleApprove = async () => {
    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/tier-upgrade-requests/${requestId}/approve`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to approve request')
      }

      toast.success(`Tier upgrade approved for ${vendorName}`)
      setShowApproveDialog(false)
      onSuccess()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/tier-upgrade-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to reject request')
      }

      toast.success('Request rejected')
      setShowRejectDialog(false)
      setRejectionReason('')
      onSuccess()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => setShowApproveDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Tier Upgrade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the upgrade to <strong>{requestedTier}</strong> for{' '}
              <strong>{vendorName}</strong>?
              <br />
              <br />
              This will immediately update their tier and grant access to all tier features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Tier Upgrade Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. The vendor will see this explanation.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Example: Please provide more details about your business growth and why you need the additional features..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={5}
            maxLength={1000}
          />

          <p className="text-sm text-muted-foreground">
            {rejectionReason.length}/1000 characters
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason('')
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

**2. TierUpgradeRequestFilters Component**

**File:** `payload/components/TierUpgradeRequestFilters.tsx`

**Purpose:** Filter UI for admin list view

```typescript
'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export const TierUpgradeRequestFilters: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentStatus = searchParams.get('status') || 'all'

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push(window.location.pathname)
  }

  return (
    <div className="flex gap-4 mb-4 items-center">
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Requests</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {currentStatus !== 'all' && (
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
```

**Integration in TierUpgradeRequests Collection:**

Update `payload/collections/TierUpgradeRequests.ts`:

```typescript
admin: {
  useAsTitle: 'id',
  defaultColumns: ['vendor', 'currentTier', 'requestedTier', 'status', 'requestedAt'],
  group: 'Administration',
  description: 'Manage vendor tier upgrade requests',
  components: {
    BeforeListTable: ['@/payload/components/TierUpgradeRequestFilters'],
  },
},
```

Add custom cell component for actions:

```typescript
{
  name: 'actions',
  type: 'ui',
  admin: {
    components: {
      Cell: '@/payload/components/TierUpgradeRequestActionsCell',
    },
    position: 'sidebar',
  },
}
```

---

### Testing Strategy

#### Unit Tests

**Test Files:**

**1. API Endpoint Tests**

**File:** `__tests__/api/portal/tier-upgrade-request.test.ts`

```typescript
import { POST, GET, DELETE } from '@/app/api/portal/vendors/[id]/tier-upgrade-request/route'

describe('POST /api/portal/vendors/[id]/tier-upgrade-request', () => {
  it('should create upgrade request with valid data', async () => {
    // Test implementation
  })

  it('should reject request with invalid tier', async () => {
    // Test implementation
  })

  it('should reject duplicate pending request', async () => {
    // Test implementation
  })

  it('should reject request for tier not higher than current', async () => {
    // Test implementation
  })

  it('should reject unauthorized access', async () => {
    // Test implementation
  })
})
```

**2. Service Layer Tests**

**File:** `__tests__/services/TierUpgradeRequestService.test.ts`

```typescript
import TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService'

describe('TierUpgradeRequestService', () => {
  describe('validateUpgradeRequest', () => {
    it('should validate tier1 upgrade from free tier', async () => {
      const result = await TierUpgradeRequestService.validateUpgradeRequest(
        'vendor-123',
        'tier1'
      )
      expect(result.valid).toBe(true)
    })

    it('should reject downgrade attempt', async () => {
      const result = await TierUpgradeRequestService.validateUpgradeRequest(
        'vendor-tier2',
        'tier1'
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('higher')
    })

    it('should reject notes over 500 characters', async () => {
      const longNotes = 'a'.repeat(501)
      const result = await TierUpgradeRequestService.validateUpgradeRequest(
        'vendor-123',
        'tier1',
        longNotes
      )
      expect(result.valid).toBe(false)
    })
  })

  describe('approveRequest', () => {
    it('should atomically update vendor tier and request status', async () => {
      // Test implementation
    })

    it('should reject approval of non-pending request', async () => {
      // Test implementation
    })
  })
})
```

**3. Component Tests**

**File:** `__tests__/components/TierUpgradeRequestForm.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TierUpgradeRequestForm from '@/components/dashboard/TierUpgradeRequestForm'

describe('TierUpgradeRequestForm', () => {
  it('should render form with tier selection', () => {
    render(<TierUpgradeRequestForm currentTier="free" vendorId="123" />)
    expect(screen.getByLabelText(/requested tier/i)).toBeInTheDocument()
  })

  it('should only show higher tiers in dropdown', () => {
    render(<TierUpgradeRequestForm currentTier="tier1" vendorId="123" />)
    // Assert dropdown only contains tier2, tier3
  })

  it('should submit form with valid data', async () => {
    const onSuccess = jest.fn()
    render(<TierUpgradeRequestForm currentTier="free" vendorId="123" onSuccess={onSuccess} />)

    // Fill form
    fireEvent.change(screen.getByLabelText(/tier/i), { target: { value: 'tier1' } })
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Need more products' } })

    // Submit
    fireEvent.click(screen.getByText(/submit/i))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show error for notes under 20 characters', async () => {
    render(<TierUpgradeRequestForm currentTier="free" vendorId="123" />)

    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Short' } })
    fireEvent.blur(screen.getByLabelText(/notes/i))

    await waitFor(() => {
      expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument()
    })
  })
})
```

---

#### Integration Tests

**Test Scenarios:**

**1. Full Request Submission Flow**
- Vendor logs in
- Navigates to subscription page
- Sees tier comparison table
- Fills out upgrade request form
- Submits request
- Verify request created in database with status 'pending'
- Verify vendor sees status card instead of form

**2. Admin Approval Workflow**
- Admin logs in to /admin
- Views tier upgrade requests collection
- Filters for pending requests
- Opens pending request
- Clicks approve button
- Confirms approval
- Verify vendor tier updated in vendors table
- Verify request status changed to 'approved'
- Verify reviewedAt and reviewedBy populated

**3. Admin Rejection Workflow**
- Admin opens pending request
- Clicks reject button
- Enters rejection reason
- Submits rejection
- Verify request status changed to 'rejected'
- Verify rejectionReason saved
- Vendor views request and sees rejection reason

**4. Duplicate Request Prevention**
- Vendor submits upgrade request
- Attempts to submit another request while first is pending
- Verify API returns 409 error
- Verify form shows error message

---

#### E2E Tests (Playwright)

**Test File:** `e2e/tier-upgrade-request.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Tier Upgrade Request System', () => {
  test('vendor can submit tier upgrade request', async ({ page }) => {
    // Login as vendor
    await page.goto('/login')
    await page.fill('[name="email"]', 'vendor@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Navigate to subscription page
    await page.goto('/vendor/dashboard/subscription')

    // Verify tier comparison table visible
    await expect(page.locator('table')).toBeVisible()

    // Fill upgrade request form
    await page.selectOption('[name="requestedTier"]', 'tier2')
    await page.fill('[name="vendorNotes"]', 'We need to list more products to serve our growing customer base.')

    // Submit form
    await page.click('button:has-text("Submit Request")')

    // Verify success toast
    await expect(page.locator('text=Tier upgrade request submitted successfully')).toBeVisible()

    // Verify status card now shows
    await expect(page.locator('text=Pending')).toBeVisible()
    await expect(page.locator('text=tier2')).toBeVisible()
  })

  test('admin can approve tier upgrade request', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'adminpass')
    await page.click('button[type="submit"]')

    // Navigate to tier upgrade requests
    await page.goto('/admin/collections/tier_upgrade_requests')

    // Filter for pending
    await page.selectOption('[name="status"]', 'pending')

    // Open first pending request
    await page.click('table tbody tr:first-child')

    // Click approve
    await page.click('button:has-text("Approve")')

    // Confirm
    await page.click('button:has-text("Approve"):last-of-type')

    // Verify success toast
    await expect(page.locator('text=Tier upgrade approved')).toBeVisible()

    // Verify status changed
    await expect(page.locator('text=Approved')).toBeVisible()
  })

  test('admin can reject tier upgrade request with reason', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'adminpass')
    await page.click('button[type="submit"]')

    // Navigate to pending request
    await page.goto('/admin/collections/tier_upgrade_requests')
    await page.click('table tbody tr:first-child')

    // Click reject
    await page.click('button:has-text("Reject")')

    // Enter reason
    await page.fill('textarea[name="rejectionReason"]', 'Please provide more details about your business needs.')

    // Submit
    await page.click('button:has-text("Reject Request")')

    // Verify success
    await expect(page.locator('text=Request rejected')).toBeVisible()
  })

  test('vendor sees rejection reason and can submit new request', async ({ page }) => {
    // Login as vendor with rejected request
    await page.goto('/login')
    await page.fill('[name="email"]', 'vendor@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Go to subscription page
    await page.goto('/vendor/dashboard/subscription')

    // Verify rejection status and reason visible
    await expect(page.locator('text=Rejected')).toBeVisible()
    await expect(page.locator('text=Please provide more details')).toBeVisible()

    // Since request is rejected (not pending), form should be available
    await expect(page.locator('[name="requestedTier"]')).toBeVisible()
  })

  test('cannot submit duplicate pending request', async ({ page }) => {
    // Login as vendor
    await page.goto('/login')
    await page.fill('[name="email"]', 'vendor@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Go to subscription page (already has pending request)
    await page.goto('/vendor/dashboard/subscription')

    // Verify form is NOT visible, status card is shown
    await expect(page.locator('[name="requestedTier"]')).not.toBeVisible()
    await expect(page.locator('text=Pending')).toBeVisible()
  })

  test('vendor can cancel pending request', async ({ page }) => {
    // Login and navigate to subscription page
    await page.goto('/login')
    await page.fill('[name="email"]', 'vendor@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.goto('/vendor/dashboard/subscription')

    // Click cancel button
    await page.click('button:has-text("Cancel Request")')

    // Confirm cancellation
    await page.click('button:has-text("Continue")')

    // Verify success
    await expect(page.locator('text=Request cancelled successfully')).toBeVisible()

    // Verify form is now visible
    await expect(page.locator('[name="requestedTier"]')).toBeVisible()
  })
})
```

**Test Coverage Goals:**
- Unit tests: >80% coverage for service layer and API routes
- Integration tests: All critical user flows
- E2E tests: Happy path + key error scenarios

---

### Performance Criteria

**Response Time SLAs:**

| Endpoint | Target | Maximum |
|----------|--------|---------|
| POST /api/portal/vendors/[id]/tier-upgrade-request | <300ms | 500ms |
| GET /api/portal/vendors/[id]/tier-upgrade-request | <200ms | 400ms |
| PUT /api/admin/tier-upgrade-requests/[id]/approve | <800ms | 1500ms |
| GET /api/admin/tier-upgrade-requests (list) | <500ms | 1000ms |

**Page Load Performance:**
- Subscription page initial load: <1.5s (with data)
- Admin requests list page: <2s (20 items)
- Form submission feedback: <1s

**Database Query Optimization:**
- Indexed queries on vendor_id, status, requested_at
- Composite index on (vendor_id, status) for pending request checks
- Pagination for admin list view (max 100 items per page)

**Caching Strategy:**
- No caching for request data (always fetch fresh)
- Vendor tier cached after approval (revalidate on read)

---

### Security Requirements

**Authentication:**
- All API endpoints require valid session
- Session validation via Payload CMS auth middleware
- Token expiration: 7 days

**Authorization:**

| Endpoint | Vendor | Admin |
|----------|--------|-------|
| POST /api/portal/vendors/[id]/tier-upgrade-request | Own account only | No access |
| GET /api/portal/vendors/[id]/tier-upgrade-request | Own account only | No access |
| DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId] | Own requests only | No access |
| GET /api/admin/tier-upgrade-requests | No access | All requests |
| PUT /api/admin/tier-upgrade-requests/[id]/approve | No access | All requests |
| PUT /api/admin/tier-upgrade-requests/[id]/reject | No access | All requests |

**Input Validation:**
- All inputs validated with Zod schemas
- SQL injection protection via Payload CMS ORM
- XSS protection via React/Next.js sanitization
- CSRF protection via Next.js built-in middleware

**Rate Limiting:**

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST tier-upgrade-request | 5 requests | 1 hour per vendor |
| DELETE (cancel) | 10 requests | 1 hour per vendor |
| Admin endpoints | 100 requests | 1 minute per admin |

**Data Protection:**
- Vendor notes and rejection reasons sanitized
- No PII in logs
- Admin actions logged with user ID and timestamp
- Database backups include tier_upgrade_requests table

**Audit Trail:**
- All status changes logged
- reviewedBy field tracks admin actions
- Timestamps on requestedAt, reviewedAt
- Cannot delete approved/rejected requests (soft delete only)

---

## External Dependencies

### npm Packages

**Existing (Already in Project):**
- `react-hook-form@^7.53.0` - Form management
- `zod@^3.23.8` - Schema validation
- `@hookform/resolvers@^3.3.4` - Zod resolver for React Hook Form
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `date-fns@^2.30.0` - Date formatting

**New Dependencies:**
None required - all dependencies already present in project.

### APIs

**Internal APIs:**
- Existing: `PUT /api/admin/vendors/[vendorId]/tier` - Used by approve endpoint to update vendor tier
- Existing: Payload CMS authentication and session management

**Third-Party Services:**
None required for MVP.

### Database Migrations

**Migration Required:**
Yes - Create `tier_upgrade_requests` table/collection

**Migration Script:** Auto-generated by Payload CMS when collection added to config

**Rollback Plan:**
```sql
DROP TABLE tier_upgrade_requests;
```

### Environment Variables

No new environment variables required.

---

## Implementation Notes

### Development Order

**Phase 1: Backend Foundation (Days 1-2)**
1. Create `TierUpgradeRequests` collection in Payload CMS
2. Add collection to `payload.config.ts`
3. Implement `TierUpgradeRequestService` service layer
4. Test database schema and service layer

**Phase 2: API Endpoints (Days 3-4)**
1. Implement vendor portal endpoints (POST, GET, DELETE)
2. Implement admin endpoints (GET list, PUT approve, PUT reject)
3. Write unit tests for all endpoints
4. Test authorization rules

**Phase 3: Frontend Components (Days 5-7)**
1. Create `TierComparisonTable` component
2. Create `TierUpgradeRequestForm` component
3. Create `UpgradeRequestStatusCard` component
4. Create subscription page route
5. Update dashboard navigation

**Phase 4: Admin UI (Day 8)**
1. Create `TierUpgradeRequestActions` component
2. Create `TierUpgradeRequestFilters` component
3. Integrate custom components into Payload admin
4. Test admin workflow

**Phase 5: Testing & Polish (Days 9-10)**
1. Write integration tests
2. Write E2E tests with Playwright
3. Performance testing and optimization
4. Security audit
5. Documentation

### Edge Cases to Handle

**1. Concurrent Request Submissions:**
- Problem: Vendor submits request twice in quick succession
- Solution: Database unique constraint on (vendor_id, status='pending')

**2. Vendor Tier Manually Changed During Pending Request:**
- Problem: Admin changes vendor tier directly, making pending request invalid
- Solution: Validate currentTier still matches at approval time, reject if mismatch

**3. Request Approved But Vendor Tier Update Fails:**
- Problem: Database transaction partial commit
- Solution: Use transaction or implement rollback if vendor update fails

**4. Vendor Deleted While Request Pending:**
- Problem: Orphaned request
- Solution: CASCADE delete on vendor_id foreign key

**5. Admin User Deleted After Reviewing Request:**
- Problem: reviewedBy references deleted user
- Solution: SET NULL on delete for reviewedBy field

**6. Form Submitted While Previous Request Processing:**
- Problem: Double submission
- Solution: Disable form during submission, check for pending request server-side

**7. Vendor Downgrades Tier Manually:**
- Problem: Tier hierarchy not enforced
- Solution: This feature only handles upgrades, downgrades are separate admin action

### Monitoring & Observability

**Metrics to Track:**
- Tier upgrade request submission rate (per day/week)
- Average time to approval/rejection
- Approval vs rejection ratio
- Most requested tier (tier1 vs tier2 vs tier3)
- Requests by current tier (free→tier1, tier1→tier2, etc.)

**Logging:**
- Log all request submissions with vendor ID, tier
- Log all approvals/rejections with admin ID, timestamp
- Log failed validations (for fraud detection)

**Alerts:**
- Spike in rejections (>50% in a day)
- Requests pending >7 days
- API error rate >5%

### Future Enhancements (Out of Scope for MVP)

- Email notifications to vendors on approval/rejection
- Email notifications to admins on new requests
- Request comments/messaging system for clarification
- Bulk approval actions
- Tier downgrade requests
- Automatic approval based on business rules
- Payment integration for paid tier upgrades
- Analytics dashboard for tier upgrade trends
- Webhook integration for external systems

---

## Acceptance Criteria

**Backend:**
- [ ] `tier_upgrade_requests` collection created in Payload CMS
- [ ] All 6 API endpoints implemented and tested
- [ ] TierUpgradeRequestService implements all business logic
- [ ] Authorization rules enforced (vendors own requests only, admins all)
- [ ] Validation prevents duplicate pending requests
- [ ] Validation enforces requested tier > current tier
- [ ] Approve endpoint atomically updates vendor tier + request status
- [ ] Unit test coverage >80% for service layer

**Frontend:**
- [ ] TierComparisonTable displays all tier features
- [ ] TierUpgradeRequestForm validates input with Zod
- [ ] Form prevents submission with invalid data
- [ ] Form only shows higher tiers in dropdown
- [ ] UpgradeRequestStatusCard shows status with color-coded badge
- [ ] Status card shows rejection reason when status is rejected
- [ ] Cancel button only visible for pending requests
- [ ] Subscription page (/vendor/dashboard/subscription) created
- [ ] Subscription page shows form OR status card (not both)
- [ ] Dashboard navigation includes Subscription link
- [ ] UpgradePromptCard links to subscription page

**Admin UI:**
- [ ] Admin can view all tier upgrade requests in /admin
- [ ] Admin can filter requests by status
- [ ] Approve action shows confirmation dialog
- [ ] Reject action requires reason in modal
- [ ] Approved requests update vendor tier immediately
- [ ] Actions only available for pending requests

**E2E:**
- [ ] Vendor can submit request and see pending status
- [ ] Admin can approve request and vendor tier updates
- [ ] Admin can reject request with reason
- [ ] Vendor sees rejection reason
- [ ] Cannot submit duplicate pending request
- [ ] Vendor can cancel pending request

**Performance:**
- [ ] All API endpoints respond within SLA targets
- [ ] Subscription page loads in <1.5s
- [ ] Admin list loads in <2s with 20 items

**Security:**
- [ ] All endpoints require authentication
- [ ] Vendors cannot access other vendors' requests
- [ ] Admins cannot access vendor portal endpoints
- [ ] Rate limiting enforced (5 requests/hour for vendors)
- [ ] Input validation prevents injection attacks

---

## Documentation Requirements

**Code Documentation:**
- JSDoc comments on all public service methods
- TypeScript interfaces for all data types
- Inline comments for complex business logic

**API Documentation:**
- API endpoint documentation in README or separate API.md
- Request/response examples for all endpoints
- Error code reference

**User Documentation:**
- Vendor guide for submitting tier upgrade requests
- Admin guide for reviewing requests
- Screenshots of UI components

**Database Documentation:**
- Schema diagram showing relationships
- Field descriptions for tier_upgrade_requests collection

---

## Risk Assessment

**High Risk:**
- **Atomic tier update on approval** - Must ensure vendor tier and request status update together or both fail
  - Mitigation: Use database transactions or implement rollback logic

**Medium Risk:**
- **Concurrent request submissions** - Race condition if vendor submits multiple times
  - Mitigation: Database unique constraint + server-side duplicate check
- **Request pending indefinitely** - No SLA for admin response time
  - Mitigation: Add alert for requests pending >7 days (future enhancement)

**Low Risk:**
- **Form validation bypass** - Client-side validation can be bypassed
  - Mitigation: Server-side validation duplicates all client rules
- **Admin account compromise** - Malicious approvals
  - Mitigation: Audit logging tracks all admin actions

---

## Success Metrics

**Adoption Metrics:**
- 50+ tier upgrade requests submitted in first month
- 80%+ approval rate
- Average time to approval <48 hours

**Technical Metrics:**
- 0 critical bugs in production
- API uptime >99.5%
- All endpoints meet performance SLAs
- Test coverage >80%

**User Experience Metrics:**
- <5% form abandonment rate
- <1% duplicate submission attempts
- Positive feedback from vendors on process clarity

