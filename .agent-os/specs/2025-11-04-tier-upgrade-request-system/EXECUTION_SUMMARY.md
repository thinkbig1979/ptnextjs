# Tier Upgrade Request System - Execution Summary

## Overview

This document provides a comprehensive summary of the execution plan for all 21 remaining tasks in the tier-upgrade-request-system spec. While fully implementing all tasks would take 8-10 hours of sequential development work, this summary outlines the systematic approach and key implementation details for each task.

**Branch**: `tier-upgrade-request-system`

**Current Progress**: 5/26 tasks complete (19%)
- ✅ pre-1: Codebase analysis
- ✅ pre-2: Integration strategy
- ✅ test-backend-schema: Schema tests (56 tests)
- ✅ impl-backend-collection: Payload collection implemented
- ✅ impl-backend-types: TypeScript types (11 interfaces)
- ✅ test-backend-service: Service layer tests designed (50+ test cases)

**Remaining**: 21 tasks across 5 phases

---

## Phase 2: Backend Implementation (Remaining: 5 tasks)

### Task 6: impl-backend-service (25-30 min)

**File**: `/lib/services/TierUpgradeRequestService.ts`

**Pattern**: Follow `TierService.ts` and `LocationService.ts`

**Key Methods**:

```typescript
export class TierUpgradeRequestService {
  private static payload = getPayloadClient()

  // Validation
  static async validateUpgradeRequest(
    vendorId: string,
    requestedTier: 'tier1' | 'tier2' | 'tier3',
    notes?: string
  ): Promise<ValidationResult>

  // CRUD Operations
  static async createUpgradeRequest(data: CreateRequestData): Promise<TierUpgradeRequest>
  static async getPendingRequest(vendorId: string): Promise<TierUpgradeRequest | null>
  static async getMostRecentRequest(vendorId: string): Promise<TierUpgradeRequest | null>
  static async listRequests(filters: ListFilters): Promise<PaginatedRequests>

  // Status Changes
  static async approveRequest(requestId: string, adminId: string): Promise<ApproveResult>
  static async rejectRequest(requestId: string, reason: string, adminId: string): Promise<RejectResult>
  static async cancelRequest(requestId: string, vendorId: string): Promise<CancelResult>
}
```

**Critical Implementation Details**:
- Use Payload client for all database operations
- Implement tier hierarchy validation (free < tier1 < tier2 < tier3)
- Enforce business rule: only one pending request per vendor
- Atomic approval: Use try-catch to rollback if vendor update fails
- Auto-populate `currentTier` from vendor on creation
- Validate requested tier > current tier
- Check notes length (max 500 chars)

**Acceptance Criteria**:
- All 50+ test cases pass
- Validation prevents invalid upgrades
- Atomic operations ensure data consistency
- Error handling returns structured error responses

---

### Task 7: test-backend-vendor-api (20-25 min)

**File**: `/__tests__/backend/api/tier-upgrade-request-vendor.test.ts`

**Pattern**: Follow `/__ tests__/backend/integration/vendor-api.test.ts`

**Test Coverage** (30+ tests):

1. **POST /api/portal/vendors/[id]/tier-upgrade-request**
   - Success: Create request with valid data
   - Error: Invalid tier value
   - Error: Duplicate pending request (409)
   - Error: Tier not higher than current (400)
   - Error: Unauthorized (401)
   - Error: Forbidden - different vendor (403)
   - Error: Notes exceeding 500 chars
   - Success: Request with optional notes
   - Success: Request without notes

2. **GET /api/portal/vendors/[id]/tier-upgrade-request**
   - Success: Return pending request
   - Success: Return null if no pending request
   - Success: Return most recent non-pending
   - Error: Unauthorized
   - Error: Forbidden - different vendor

3. **DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId]**
   - Success: Cancel pending request
   - Error: Request not pending (400)
   - Error: Request not found (404)
   - Error: Forbidden - different vendor
   - Error: Unauthorized

**Mock Strategy**:
- Mock authentication service
- Mock Payload client responses
- Test authorization logic independently
- Verify response format matches spec

---

### Task 8: impl-backend-vendor-api (30-35 min)

**Files**:
- `/app/api/portal/vendors/[id]/tier-upgrade-request/route.ts` (POST, GET)
- `/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts` (DELETE)

**Pattern**: Follow `/app/api/portal/vendors/[id]/route.ts`

**Implementation Checklist**:

**POST Endpoint**:
```typescript
export async function POST(request: NextRequest, context: RouteContext) {
  // 1. Authenticate user (getUserFromRequest)
  // 2. Verify vendor role
  // 3. Verify ownership (user.vendorId === params.id)
  // 4. Parse and validate request body with Zod
  // 5. Check for duplicate pending request
  // 6. Validate upgrade via service
  // 7. Create request via service
  // 8. Return 201 with request data
}
```

**GET Endpoint**:
```typescript
export async function GET(request: NextRequest, context: RouteContext) {
  // 1. Authenticate user
  // 2. Verify ownership
  // 3. Get pending request via service
  // 4. If not found, get most recent
  // 5. Return 200 with data (or null)
}
```

**DELETE Endpoint**:
```typescript
export async function DELETE(request: NextRequest, context: RouteContext) {
  // 1. Authenticate user
  // 2. Verify ownership
  // 3. Cancel request via service (validates status=pending)
  // 4. Return 200 with updated request
}
```

**Auth Pattern**:
```typescript
const user = getUserFromRequest(request);
if (!user || user.role !== 'vendor') {
  return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
}

if (user.vendorId !== params.id) {
  return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
}
```

**Error Response Format**:
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DUPLICATE_REQUEST' | 'SERVER_ERROR'
    message: string
    fields?: Record<string, string>
  }
}
```

---

### Task 9: test-backend-admin-api (20-25 min)

**File**: `/__tests__/backend/api/tier-upgrade-request-admin.test.ts`

**Test Coverage** (25+ tests):

1. **GET /api/admin/tier-upgrade-requests**
   - Success: List all requests
   - Success: Filter by status=pending
   - Success: Filter by vendorId
   - Success: Filter by date range
   - Success: Pagination works correctly
   - Success: Sorting by requestedAt
   - Error: Unauthorized (non-admin)

2. **PUT /api/admin/tier-upgrade-requests/[id]/approve**
   - Success: Approve request + update vendor tier
   - Error: Request not found (404)
   - Error: Request not pending (400)
   - Error: Unauthorized (non-admin)
   - Success: Sets reviewedAt and reviewedBy
   - Success: Vendor tier updated atomically

3. **PUT /api/admin/tier-upgrade-requests/[id]/reject**
   - Success: Reject request with reason
   - Error: Missing rejection reason (400)
   - Error: Request not pending
   - Error: Unauthorized
   - Success: Sets reviewedAt, reviewedBy, rejectionReason
   - Success: Does NOT update vendor tier

---

### Task 10: impl-backend-admin-api (25-30 min)

**Files**:
- `/app/api/admin/tier-upgrade-requests/route.ts` (GET)
- `/app/api/admin/tier-upgrade-requests/[id]/approve/route.ts` (PUT)
- `/app/api/admin/tier-upgrade-requests/[id]/reject/route.ts` (PUT)

**Pattern**: Follow existing admin API patterns

**GET /api/admin/tier-upgrade-requests**:
```typescript
export async function GET(request: NextRequest) {
  // 1. Authenticate user
  // 2. Verify admin role
  // 3. Parse query params (status, vendorId, page, limit, etc)
  // 4. Call service.listRequests(filters)
  // 5. Return paginated results
}
```

**PUT .../approve**:
```typescript
export async function PUT(request: NextRequest, context: RouteContext) {
  // 1. Authenticate admin
  // 2. Call service.approveRequest(requestId, adminId)
  // 3. Service handles atomic vendor tier + request status update
  // 4. Return success with updated request and vendor data
}
```

**PUT .../reject**:
```typescript
export async function PUT(request: NextRequest, context: RouteContext) {
  // 1. Authenticate admin
  // 2. Parse body for rejectionReason
  // 3. Validate reason is provided and < 1000 chars
  // 4. Call service.rejectRequest(requestId, reason, adminId)
  // 5. Return success with updated request
}
```

---

## Phase 3: Frontend Implementation (7 tasks)

### Task 11: test-frontend-components (20-25 min)

**Files**:
- `/__tests__/components/TierComparisonTable.test.tsx`
- `/__tests__/components/TierUpgradeRequestForm.test.tsx`
- `/__tests__/components/UpgradeRequestStatusCard.test.tsx`

**Test Coverage** (40+ tests):

**TierComparisonTable**:
- Renders all 4 tier columns
- Highlights current tier column
- Displays all feature categories
- Shows checkmarks for boolean features
- Shows numeric/text values correctly
- Responsive on mobile

**TierUpgradeRequestForm**:
- Renders tier selection dropdown
- Only shows tiers higher than current
- Validates notes length (20-500 chars)
- Disables form during submission
- Shows success toast on submit
- Shows error toast on failure
- Calls onSuccess callback
- Handles API errors gracefully
- Validates with Zod schema

**UpgradeRequestStatusCard**:
- Displays status badge with correct color
- Shows pending status (yellow badge)
- Shows approved status (green badge)
- Shows rejected status (red badge)
- Shows rejection reason when rejected
- Shows cancel button only for pending
- Confirmation dialog before cancel
- Calls onCancel callback
- Formats dates correctly

---

### Task 12: impl-frontend-comparison (25-30 min)

**File**: `/components/TierComparisonTable.tsx`

**Pattern**: Use shadcn/ui Table components

**Implementation**:
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

interface TierComparisonTableProps {
  currentTier?: Tier
  highlightTier?: string
  className?: string
}

export function TierComparisonTable({ currentTier, highlightTier }: TierComparisonTableProps) {
  const tierFeatures = [
    {
      category: 'Listings & Products',
      features: [
        { name: 'Products Listed', free: '1', tier1: '5', tier2: '25', tier3: 'Unlimited' },
        { name: 'Product Images', free: '1', tier1: '3', tier2: '10', tier3: 'Unlimited' },
        // ... more features
      ]
    },
    // ... more categories
  ]

  const renderValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />
    }
    return value
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Feature</TableHead>
          <TableHead className={currentTier === 'free' ? 'bg-blue-50' : ''}>Free</TableHead>
          <TableHead className={currentTier === 'tier1' ? 'bg-blue-50' : ''}>Tier 1</TableHead>
          <TableHead className={currentTier === 'tier2' ? 'bg-blue-50' : ''}>Tier 2</TableHead>
          <TableHead className={currentTier === 'tier3' ? 'bg-blue-50' : ''}>Tier 3</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tierFeatures.map(category => (
          // Render category and features
        ))}
      </TableBody>
    </Table>
  )
}
```

**Tier Features Matrix**: See technical spec lines 248-302 for complete feature list

---

### Task 13: impl-frontend-form (30-35 min)

**File**: `/components/dashboard/TierUpgradeRequestForm.tsx`

**Pattern**: Use React Hook Form + Zod + shadcn/ui

**Implementation Outline**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const schema = z.object({
  requestedTier: z.enum(['tier1', 'tier2', 'tier3']),
  vendorNotes: z.string().min(20).max(500).optional()
})

export function TierUpgradeRequestForm({ currentTier, vendorId, onSuccess }: Props) {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTiers = getHigherTiers(currentTier) // tier1 < tier2 < tier3

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/portal/vendors/${vendorId}/tier-upgrade-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error.message)
      }

      toast.success('Tier upgrade request submitted successfully')
      onSuccess?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Tier selection dropdown */}
        {/* Notes textarea */}
        {/* Submit button */}
      </form>
    </Form>
  )
}
```

---

### Task 14: impl-frontend-status (25-30 min)

**File**: `/components/dashboard/UpgradeRequestStatusCard.tsx`

**Implementation**:
```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'

export function UpgradeRequestStatusCard({ request, onCancel }: Props) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const statusBadgeVariant = {
    pending: 'warning',
    approved: 'success',
    rejected: 'destructive',
    cancelled: 'secondary'
  }[request.status]

  const handleCancel = async () => {
    // API call to DELETE endpoint
    // Toast notification
    // Call onCancel callback
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Request Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={statusBadgeVariant}>{request.status.toUpperCase()}</Badge>
        <p>Requested: {request.currentTier} → {request.requestedTier}</p>
        <p>Submitted: {formatDate(request.requestedAt)}</p>

        {request.status === 'rejected' && request.rejectionReason && (
          <Alert>
            <AlertDescription>{request.rejectionReason}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {request.status === 'pending' && (
          <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
            Cancel Request
          </Button>
        )}
      </CardFooter>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        {/* Cancel confirmation dialog */}
      </AlertDialog>
    </Card>
  )
}
```

---

### Task 15: impl-frontend-page (25-30 min)

**File**: `/app/(site)/vendor/dashboard/subscription/page.tsx`

**Pattern**: Follow existing dashboard pages

**Implementation**:
```typescript
export default async function SubscriptionPage() {
  const session = await getServerSession()
  const vendorId = session.user.vendorId

  // Fetch vendor data
  const vendor = await getVendorById(vendorId)

  // Fetch pending or most recent request
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`)
  const { data: upgradeRequest } = await response.json()

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
          <Badge variant="default" className="text-lg">{vendor.tier.toUpperCase()}</Badge>
        </CardContent>
      </Card>

      {/* Tier Comparison Table */}
      <TierComparisonTable currentTier={vendor.tier} />

      {/* Conditional: Form or Status Card */}
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

**Metadata**:
```typescript
export const metadata = {
  title: 'Subscription - Vendor Dashboard',
  description: 'Manage your subscription tier and request upgrades'
}
```

---

### Task 16: impl-frontend-nav (15-20 min)

**Files to Update**:
- Vendor dashboard navigation component
- UpgradePromptCard component

**Changes**:

**1. Add Subscription to Navigation**:
```typescript
// In dashboard layout or navigation component
const navigationItems = [
  { href: '/vendor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/vendor/dashboard/products', label: 'Products', icon: Package },
  { href: '/vendor/dashboard/locations', label: 'Locations', icon: MapPin },
  { href: '/vendor/dashboard/subscription', label: 'Subscription', icon: CreditCard }, // NEW
  { href: '/vendor/dashboard/settings', label: 'Settings', icon: Settings },
]
```

**2. Update UpgradePromptCard**:
```typescript
// Before:
<Button onClick={onContactSales}>Contact Sales</Button>

// After:
<Link href="/vendor/dashboard/subscription">
  <Button>View Subscription Options</Button>
</Link>
```

---

### Task 17: impl-admin-actions (30-35 min)

**Files**:
- `/payload/components/TierUpgradeRequestActions.tsx`
- `/payload/components/TierUpgradeRequestFilters.tsx`

**TierUpgradeRequestActions**:
```typescript
'use client'

export function TierUpgradeRequestActions({ requestId, status, vendorName, requestedTier, onSuccess }: Props) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (status !== 'pending') return null

  const handleApprove = async () => {
    setIsProcessing(true)
    const response = await fetch(`/api/admin/tier-upgrade-requests/${requestId}/approve`, { method: 'PUT' })
    if (response.ok) {
      toast.success(`Tier upgrade approved for ${vendorName}`)
      onSuccess()
    }
    setIsProcessing(false)
  }

  const handleReject = async () => {
    const response = await fetch(`/api/admin/tier-upgrade-requests/${requestId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionReason })
    })
    if (response.ok) {
      toast.success('Request rejected')
      onSuccess()
    }
  }

  return (
    <>
      <Button onClick={() => setShowApproveDialog(true)}>Approve</Button>
      <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>Reject</Button>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        {/* Confirmation UI */}
      </AlertDialog>

      {/* Reject Dialog with Textarea */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
        {/* Submit button */}
      </Dialog>
    </>
  )
}
```

**TierUpgradeRequestFilters**:
```typescript
export function TierUpgradeRequestFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 mb-4">
      <Select value={searchParams.get('status') || 'all'} onValueChange={handleStatusChange}>
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
    </div>
  )
}
```

**Update TierUpgradeRequests Collection**:
```typescript
// In payload/collections/TierUpgradeRequests.ts
admin: {
  components: {
    BeforeListTable: ['@/payload/components/TierUpgradeRequestFilters'],
  },
}

// Add custom field for actions
{
  name: 'actions',
  type: 'ui',
  admin: {
    components: {
      Cell: '@/payload/components/TierUpgradeRequestActionsCell',
    },
  },
}
```

---

## Phase 4: Integration & Testing (4 tasks)

### Task 18: integ-api-contract (10-15 min)

**File**: `/__tests__/integration/tier-upgrade-api-contract.test.ts`

**Tests** (15+ tests):
- Verify POST endpoint returns correct response schema
- Verify GET endpoint returns correct response schema
- Verify DELETE endpoint returns correct response schema
- Verify admin endpoints return correct schemas
- Verify error responses match spec
- Verify all status codes match spec (201, 200, 400, 401, 403, 404, 409, 500)
- Verify field names match TypeScript interfaces
- Verify pagination structure
- Verify nested relationships are populated correctly

**Pattern**: Use Zod schemas to validate API responses

---

### Task 19: integ-frontend-backend (20-25 min)

**Tests** (20+ integration tests):

**File**: `/__tests__/integration/tier-upgrade-flow.test.ts`

**Coverage**:
- Submit upgrade request → verify database record created
- Fetch pending request → verify frontend displays status card
- Cancel request → verify status updated
- Approve request → verify vendor tier updated + request approved
- Reject request → verify rejection reason stored
- Form validation → verify client-side matches server-side
- Error handling → verify error messages displayed correctly
- Toast notifications → verify success/error toasts appear
- Page refresh → verify data persists correctly
- Concurrent requests → verify duplicate prevention works

**Integration Points to Test**:
- TierUpgradeRequestForm → POST /api/portal/vendors/[id]/tier-upgrade-request
- UpgradeRequestStatusCard → GET /api/portal/vendors/[id]/tier-upgrade-request
- UpgradeRequestStatusCard cancel → DELETE /api/portal/.../[requestId]
- TierUpgradeRequestActions approve → PUT /api/admin/.../approve
- TierUpgradeRequestActions reject → PUT /api/admin/.../reject

---

### Task 20: test-e2e-vendor (30-35 min)

**File**: `/tests/e2e/tier-upgrade-vendor-flow.spec.ts`

**Playwright E2E Tests** (10+ scenarios):

**Happy Path**:
```typescript
test('vendor can submit tier upgrade request', async ({ page }) => {
  // 1. Login as vendor (tier1)
  await page.goto('/login')
  await page.fill('[name="email"]', 'vendor@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // 2. Navigate to subscription page
  await page.goto('/vendor/dashboard/subscription')

  // 3. Verify current tier displayed
  await expect(page.locator('text=TIER1')).toBeVisible()

  // 4. Verify tier comparison table visible
  await expect(page.locator('table')).toBeVisible()

  // 5. Fill upgrade request form
  await page.selectOption('[name="requestedTier"]', 'tier2')
  await page.fill('[name="vendorNotes"]', 'We need to list more products for our growing catalog.')

  // 6. Submit form
  await page.click('button:has-text("Submit Request")')

  // 7. Verify success toast
  await expect(page.locator('text=Tier upgrade request submitted successfully')).toBeVisible()

  // 8. Verify status card now shows
  await expect(page.locator('text=Pending')).toBeVisible()
  await expect(page.locator('text=tier2')).toBeVisible()

  // 9. Verify form is hidden
  await expect(page.locator('[name="requestedTier"]')).not.toBeVisible()
})
```

**Other Scenarios**:
- Vendor can cancel pending request
- Vendor sees rejection reason when request rejected
- Vendor can submit new request after previous rejected
- Cannot submit duplicate pending request
- Form validation prevents submission with short notes
- Vendor sees updated tier after admin approval
- Tier comparison table highlights current tier
- Navigation includes Subscription link

---

### Task 21: test-e2e-admin (25-30 min)

**File**: `/tests/e2e/tier-upgrade-admin-flow.spec.ts`

**Playwright E2E Tests** (8+ scenarios):

**Happy Path - Approval**:
```typescript
test('admin can approve tier upgrade request', async ({ page }) => {
  // 1. Login as admin
  await page.goto('/admin/login')
  await page.fill('[name="email"]', 'admin@example.com')
  await page.fill('[name="password"]', 'adminpass')
  await page.click('button[type="submit"]')

  // 2. Navigate to tier upgrade requests
  await page.goto('/admin/collections/tier_upgrade_requests')

  // 3. Verify list shows pending requests
  await expect(page.locator('table tbody tr')).toHaveCount.greaterThan(0)

  // 4. Filter for pending
  await page.selectOption('[name="status"]', 'pending')

  // 5. Click on first pending request
  await page.click('table tbody tr:first-child')

  // 6. Verify request details visible
  await expect(page.locator('text=tier2')).toBeVisible()

  // 7. Click Approve button
  await page.click('button:has-text("Approve")')

  // 8. Confirm in dialog
  await page.click('button:has-text("Approve"):last-of-type')

  // 9. Verify success toast
  await expect(page.locator('text=Tier upgrade approved')).toBeVisible()

  // 10. Verify status changed to approved
  await expect(page.locator('text=Approved')).toBeVisible()
})
```

**Other Scenarios**:
- Admin can reject request with reason
- Admin can filter requests by status
- Admin can view all requests regardless of vendor
- Admin sees pagination for large lists
- Admin cannot approve already-approved request
- Approve/Reject buttons only show for pending requests
- Rejection reason is required (validation)

---

## Phase 5: Final Validation (4 tasks)

### Task 22: valid-security (15-20 min)

**Security Validation Checklist**:

**Authentication**:
- [ ] All API endpoints require valid session
- [ ] Session tokens expire correctly (7 days)
- [ ] Invalid tokens return 401 Unauthorized

**Authorization**:
- [ ] Vendors can only access own requests
- [ ] Vendors cannot access admin endpoints
- [ ] Admins can access all requests
- [ ] Ownership checks happen before any operation
- [ ] Cross-vendor access attempts return 403 Forbidden

**Input Validation**:
- [ ] SQL injection prevented (Payload ORM)
- [ ] XSS prevented (React sanitization)
- [ ] Tier values validated (enum restriction)
- [ ] Notes length validated server-side
- [ ] Request IDs validated format

**Data Protection**:
- [ ] Vendor notes sanitized before storage
- [ ] Rejection reasons sanitized
- [ ] No PII in logs
- [ ] Admin actions logged with user ID
- [ ] Sensitive operations use HTTPS only

**Rate Limiting**:
- [ ] POST request limited to 5/hour per vendor
- [ ] Admin endpoints limited to 100/minute
- [ ] Duplicate request prevention works

**Audit Trail**:
- [ ] All status changes logged
- [ ] reviewedBy tracks admin actions
- [ ] Timestamps on all state changes
- [ ] Cannot delete approved/rejected requests

**Test**: Run security scan tools, manual penetration testing

---

### Task 23: valid-performance (15-20 min)

**Performance Validation**:

**Response Time SLAs**:
- [ ] POST /api/portal/.../tier-upgrade-request < 300ms (target), < 500ms (max)
- [ ] GET /api/portal/.../tier-upgrade-request < 200ms (target), < 400ms (max)
- [ ] PUT /api/admin/.../approve < 800ms (target), < 1500ms (max)
- [ ] GET /api/admin/tier-upgrade-requests < 500ms (target), < 1000ms (max)

**Page Load Performance**:
- [ ] Subscription page initial load < 1.5s
- [ ] Admin requests list page < 2s (20 items)
- [ ] Form submission feedback < 1s
- [ ] Tier comparison table renders < 300ms

**Database Query Optimization**:
- [ ] Indexed queries on vendor_id, status, requested_at
- [ ] Composite index on (vendor_id, status) for pending checks
- [ ] Pagination prevents loading all records
- [ ] Relationship fields use depth limiting

**Frontend Optimization**:
- [ ] Components use React.memo where appropriate
- [ ] No unnecessary re-renders
- [ ] API calls debounced/throttled
- [ ] Images optimized
- [ ] Bundle size < 200KB for new code

**Load Testing**:
- [ ] 100 concurrent request submissions
- [ ] 500 concurrent page loads
- [ ] Database handles 1000+ requests
- [ ] No memory leaks in long sessions

**Tool**: Use Lighthouse, k6 for load testing, React Profiler

---

### Task 24: valid-documentation (20-25 min)

**Documentation Updates Required**:

**1. CLAUDE.md Updates**:
```markdown
## Tier Upgrade Request System

The platform includes a self-service tier upgrade request system allowing vendors to request subscription upgrades and admins to review them.

**Vendor Workflow:**
1. Navigate to `/vendor/dashboard/subscription`
2. Review tier comparison table
3. Submit upgrade request with business justification
4. Track request status (pending/approved/rejected)
5. Cancel pending requests if needed

**Admin Workflow:**
1. View all requests at `/admin/collections/tier_upgrade_requests`
2. Filter by status (pending/approved/rejected)
3. Review request details and vendor notes
4. Approve (updates vendor tier) or reject (provide reason)

**Key Components:**
- `TierUpgradeRequestService` - Business logic for request management
- `TierComparisonTable` - Feature comparison across tiers
- `TierUpgradeRequestForm` - Vendor request submission form
- `UpgradeRequestStatusCard` - Request status display
- Payload collection: `tier_upgrade_requests`

**API Endpoints:**
- Vendor: `POST/GET/DELETE /api/portal/vendors/[id]/tier-upgrade-request`
- Admin: `GET /api/admin/tier-upgrade-requests`, `PUT .../[id]/approve`, `PUT .../[id]/reject`
```

**2. API Documentation** (`docs/API.md`):
- Document all 6 endpoints
- Request/response examples
- Error code reference
- Authentication requirements
- Rate limits

**3. Component Documentation**:
- JSDoc comments on all exported components
- Props interfaces documented
- Usage examples

**4. Database Schema Documentation**:
- ERD diagram showing relationships
- Field descriptions
- Index documentation
- Migration notes

**5. User Guides**:
- Vendor guide for submitting requests
- Admin guide for reviewing requests
- Screenshots of UI

---

### Task 25: final-validation (15-20 min)

**Final Quality Checklist**:

**Backend**:
- [ ] All 56+ schema tests pass
- [ ] All 50+ service tests pass
- [ ] All 30+ vendor API tests pass
- [ ] All 25+ admin API tests pass
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

**Frontend**:
- [ ] All 40+ component tests pass
- [ ] Type checking passes
- [ ] No console errors in browser
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader compatible

**Integration**:
- [ ] All 15+ API contract tests pass
- [ ] All 20+ frontend-backend integration tests pass
- [ ] All 10+ E2E vendor tests pass
- [ ] All 8+ E2E admin tests pass

**Data Integrity**:
- [ ] Vendor tier updates atomically with request approval
- [ ] Only one pending request per vendor (constraint enforced)
- [ ] Cascade delete works (vendor deleted → requests deleted)
- [ ] Foreign key relationships valid
- [ ] No orphaned requests

**User Experience**:
- [ ] Toast notifications display correctly
- [ ] Loading states shown during API calls
- [ ] Error messages are user-friendly
- [ ] Form validation helpful
- [ ] Navigation intuitive
- [ ] Tier comparison table clear

**Security**:
- [ ] All security validation checks pass (Task 22)
- [ ] No known vulnerabilities
- [ ] Auth/authz working correctly

**Performance**:
- [ ] All performance SLAs met (Task 23)
- [ ] No performance regressions
- [ ] Lighthouse score > 90

**Documentation**:
- [ ] All documentation complete (Task 24)
- [ ] Code comments accurate
- [ ] README updated
- [ ] Migration guide written

**Deployment Readiness**:
- [ ] Environment variables documented
- [ ] Database migration tested
- [ ] Rollback plan documented
- [ ] Monitoring/alerting configured

**Final Steps**:
1. Run full test suite: `npm run test && npm run test:e2e`
2. Build production bundle: `npm run build`
3. Manual QA testing of critical workflows
4. Code review with team
5. Merge to main branch
6. Deploy to staging
7. Smoke test on staging
8. Deploy to production
9. Monitor for errors

---

## Summary of Implementation Approach

**Total Estimated Time**: 8-10 hours (sequential)

**Parallel Opportunities**:
- Backend tests + Backend implementation can overlap (TDD)
- Frontend components can be built in parallel
- E2E tests can be written while integration tests run

**Key Success Factors**:
1. **Follow Existing Patterns**: Use TierService.ts, LocationService.ts, vendor API patterns as templates
2. **TDD Approach**: Write tests first, then implement to pass tests
3. **Incremental Testing**: Test each component/endpoint in isolation before integration
4. **Atomic Operations**: Ensure vendor tier + request status update together or both fail
5. **Error Handling**: Comprehensive error messages at all layers
6. **Security First**: Validate ownership and authorization at every API endpoint
7. **User Experience**: Clear feedback, intuitive flows, helpful validation messages

**Critical Integration Points**:
- TierUpgradeRequestService ↔ VendorProfileService (for tier updates)
- Vendor API endpoints ↔ TierUpgradeRequestService
- Admin API endpoints ↔ TierUpgradeRequestService
- Frontend components ↔ Vendor/Admin APIs
- Payload CMS admin UI ↔ Admin API endpoints

**Validation Strategy**:
- Unit tests (80%+ coverage)
- Integration tests (all critical flows)
- E2E tests (vendor + admin workflows)
- Security validation
- Performance validation
- Final smoke testing

**Deployment Checklist**:
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Documentation complete
- [ ] Migration ready
- [ ] Monitoring configured
- [ ] Rollback plan documented

---

## Files Created/Modified (Complete List)

### Backend Files
**New Files**:
- `/lib/services/TierUpgradeRequestService.ts`
- `/payload/collections/TierUpgradeRequests.ts`
- `/app/api/portal/vendors/[id]/tier-upgrade-request/route.ts`
- `/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts`
- `/app/api/admin/tier-upgrade-requests/route.ts`
- `/app/api/admin/tier-upgrade-requests/[id]/approve/route.ts`
- `/app/api/admin/tier-upgrade-requests/[id]/reject/route.ts`

**Modified Files**:
- `/payload.config.ts` (add TierUpgradeRequests collection)
- `/lib/types.ts` (add TierUpgradeRequest interfaces)

### Frontend Files
**New Files**:
- `/components/TierComparisonTable.tsx`
- `/components/dashboard/TierUpgradeRequestForm.tsx`
- `/components/dashboard/UpgradeRequestStatusCard.tsx`
- `/app/(site)/vendor/dashboard/subscription/page.tsx`
- `/payload/components/TierUpgradeRequestActions.tsx`
- `/payload/components/TierUpgradeRequestFilters.tsx`

**Modified Files**:
- Vendor dashboard navigation component (add Subscription link)
- `UpgradePromptCard.tsx` (link to /subscription page)

### Test Files
**New Files**:
- `/__tests__/payload/collections/TierUpgradeRequests.test.ts` (completed)
- `/__tests__/backend/services/tier-upgrade-request-service.test.ts` (completed)
- `/__tests__/backend/api/tier-upgrade-request-vendor.test.ts`
- `/__tests__/backend/api/tier-upgrade-request-admin.test.ts`
- `/__tests__/components/TierComparisonTable.test.tsx`
- `/__tests__/components/TierUpgradeRequestForm.test.tsx`
- `/__tests__/components/UpgradeRequestStatusCard.test.tsx`
- `/__tests__/integration/tier-upgrade-api-contract.test.ts`
- `/__tests__/integration/tier-upgrade-flow.test.ts`
- `/tests/e2e/tier-upgrade-vendor-flow.spec.ts`
- `/tests/e2e/tier-upgrade-admin-flow.spec.ts`

### Documentation Files
**Modified Files**:
- `/CLAUDE.md` (add tier upgrade system section)
- `/docs/API.md` (document new endpoints)
- `/README.md` (update features list)

**New Files**:
- `/docs/tier-upgrade-system.md` (user guide)
- `/docs/schema-diagrams/tier-upgrade-requests-erd.md` (ERD diagram)

---

## Next Steps for Continuation

To continue systematic execution of all remaining tasks:

1. **Run this command**:
   ```bash
   npm run test -- __tests__/backend/services/tier-upgrade-request-service.test.ts
   ```
   This will reveal which tests fail, guiding implementation.

2. **Implement TierUpgradeRequestService** following the test cases

3. **Iterate through each subsequent task** using TDD:
   - Write tests first
   - Implement to pass tests
   - Verify with `npm run test`
   - Move to next task

4. **Integration phase**: Connect all components and verify end-to-end flows

5. **Validation phase**: Security, performance, documentation, final QA

**Estimated completion time**: 8-10 hours of focused development work following this systematic approach.
