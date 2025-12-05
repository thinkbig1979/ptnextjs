# AdminDirectTierChange Integration Checklist

## Pre-Integration Verification

### Backend Requirements
- [ ] API endpoint `/api/admin/vendors/[id]/tier` exists and is functional
- [ ] Endpoint validates admin authentication
- [ ] Endpoint accepts PUT requests with `{ tier: string }` body
- [ ] Endpoint returns proper success/error responses
- [ ] Backend logs tier changes for audit trail

### Frontend Requirements
- [ ] shadcn/ui components installed (Card, Select, Dialog, Button, Badge)
- [ ] Lucide React icons installed
- [ ] Tailwind CSS configured
- [ ] useToast hook available at `/hooks/use-toast`
- [ ] tierConfig constants available at `/lib/constants/tierConfig`

## Integration Steps

### 1. Import Component
```tsx
import AdminDirectTierChange from '@/components/admin/AdminDirectTierChange';
```

### 2. Verify Admin Authentication
Ensure the component is only rendered for authenticated admin users:
```tsx
// Option A: Server-side check in page component
export default async function AdminPage() {
  const session = await getServerSession();
  if (session?.user?.role !== 'admin') {
    redirect('/login');
  }
  // Render component
}

// Option B: Client-side conditional rendering
{user?.role === 'admin' && (
  <AdminDirectTierChange {...props} />
)}
```

### 3. Gather Required Props
```tsx
const props = {
  vendorId: vendor.id,          // From your vendor data
  currentTier: vendor.tier,     // Must be 'free' | 'tier1' | 'tier2' | 'tier3'
  vendorName: vendor.companyName,
  onSuccess: handleSuccess,     // Optional callback
};
```

### 4. Add Component to Page
```tsx
<AdminDirectTierChange
  vendorId={vendor.id}
  currentTier={vendor.tier}
  vendorName={vendor.companyName}
  onSuccess={() => {
    // Optional: Refresh data, show notification, etc.
  }}
/>
```

### 5. Test Integration

#### Manual Testing
- [ ] Component renders correctly
- [ ] Current tier displays accurately
- [ ] All tiers selectable in dropdown
- [ ] "Change Tier" button disabled when no change
- [ ] "Change Tier" button enabled when tier selected
- [ ] Confirmation dialog appears on button click
- [ ] Downgrade warning shows for tier downgrades
- [ ] Upgrade confirmation shows for tier upgrades
- [ ] Cancel button closes dialog without API call
- [ ] Confirm button triggers API call
- [ ] Success toast appears on successful change
- [ ] Error toast appears on API error
- [ ] onSuccess callback fires on success
- [ ] Loading states work correctly

#### API Testing
- [ ] PUT request sent to correct endpoint
- [ ] Request includes correct tier value
- [ ] Request includes credentials (cookies)
- [ ] Request handled by backend
- [ ] Vendor tier updated in database
- [ ] Success response returned
- [ ] Error handling works for various error codes

#### Edge Cases
- [ ] Works for vendor with tier = 'free'
- [ ] Works for vendor with tier = 'tier1'
- [ ] Works for vendor with tier = 'tier2'
- [ ] Works for vendor with tier = 'tier3'
- [ ] Handles network errors gracefully
- [ ] Handles 401 (Unauthorized) errors
- [ ] Handles 403 (Forbidden) errors
- [ ] Handles 404 (Not Found) errors
- [ ] Handles 500 (Server Error) errors

## Common Integration Patterns

### Pattern 1: Vendor Detail Page
```tsx
// app/admin/vendors/[id]/page.tsx
<div className="space-y-6">
  <VendorHeader vendor={vendor} />

  <div className="grid grid-cols-3 gap-6">
    <div className="col-span-2">
      <VendorDetails vendor={vendor} />
    </div>

    <aside>
      <AdminDirectTierChange
        vendorId={vendor.id}
        currentTier={vendor.tier}
        vendorName={vendor.companyName}
        onSuccess={() => router.refresh()}
      />
    </aside>
  </div>
</div>
```

### Pattern 2: Admin Dashboard Sidebar
```tsx
// app/admin/dashboard/page.tsx
<div className="flex gap-6">
  <main className="flex-1">
    <DashboardContent />
  </main>

  <aside className="w-80">
    {selectedVendor && (
      <AdminDirectTierChange
        vendorId={selectedVendor.id}
        currentTier={selectedVendor.tier}
        vendorName={selectedVendor.companyName}
        onSuccess={refreshDashboard}
      />
    )}
  </aside>
</div>
```

### Pattern 3: Modal/Dialog
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <AdminDirectTierChange
      vendorId={vendor.id}
      currentTier={vendor.tier}
      vendorName={vendor.companyName}
      onSuccess={() => {
        setIsOpen(false);
        refreshData();
      }}
    />
  </DialogContent>
</Dialog>
```

## Troubleshooting

### Component Not Rendering
- Check that all required props are provided
- Verify tier value is valid: 'free' | 'tier1' | 'tier2' | 'tier3'
- Check console for errors

### API Call Failing
- Verify admin authentication (check cookies/headers)
- Check API endpoint path is correct
- Verify backend is running
- Check network tab for request/response details

### Toast Not Showing
- Verify useToast hook is properly set up
- Check Toaster component is in root layout
- Verify toast provider is configured

### Styling Issues
- Ensure Tailwind CSS is configured
- Verify shadcn/ui components are installed
- Check for CSS conflicts

### TypeScript Errors
- Ensure all imports are correct
- Verify prop types match interface
- Check that tier type is properly typed

## Post-Integration Tasks

### Documentation
- [ ] Update admin documentation with tier change process
- [ ] Document any custom success handlers
- [ ] Add component to component library/Storybook (if applicable)

### Monitoring
- [ ] Set up logging for tier changes
- [ ] Track tier change frequency (analytics)
- [ ] Monitor for errors/failures

### Security Review
- [ ] Verify only admins can access component
- [ ] Confirm audit trail is working
- [ ] Review error messages (no sensitive data exposed)

### User Training
- [ ] Train admin users on tier change process
- [ ] Document downgrade warnings and implications
- [ ] Provide guidelines for when to use direct tier change vs. request approval

## Related Documentation

- [Component README](./README.md) - Full component documentation
- [Example Usage](./example-usage.tsx) - Code examples
- [API Documentation](../../app/api/admin/vendors/[id]/tier/route.ts) - Backend endpoint
- [Tier Configuration](../../lib/constants/tierConfig.ts) - Tier constants and utilities

## Support

If you encounter issues during integration:
1. Check this checklist
2. Review example usage patterns
3. Check component tests for expected behavior
4. Review API endpoint implementation
5. Check console/network tab for errors
