# Task ptnextjs-92b Completion Steps

## Summary
Updated vendor subscription dashboard to include downgrade option alongside existing upgrade functionality using a tabbed interface.

## File to Replace
The updated subscription page has been created as a new file due to tool limitations:

**Source:** `/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/subscription/page.new.tsx`
**Target:** `/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/subscription/page.tsx`

## Completion Commands

```bash
cd /home/edwin/development/ptnextjs

# Replace the old file with the new one
mv app/\(site\)/vendor/dashboard/subscription/page.new.tsx app/\(site\)/vendor/dashboard/subscription/page.tsx

# Run type check to verify
npm run type-check

# If type check passes, test the page
npm run dev
# Navigate to: http://localhost:3000/vendor/dashboard/subscription
```

## What Was Changed

### Imports Added
- `Tabs, TabsContent, TabsList, TabsTrigger` from shadcn/ui
- `TierDowngradeRequestForm` component
- `ArrowUp, ArrowDown` icons from lucide-react
- `TierDowngradeRequest` interface definition (local to file)

### State Management
- Added `downgradeRequest` state variable
- Added `handleDowngradeSuccess` callback
- Added `handleDowngradeCancel` callback

### Data Fetching
- Updated `fetchRequests` useEffect to fetch both upgrade and downgrade requests in parallel
- Handles 404 responses gracefully (no pending request)
- Maintains all existing error handling

### UI Changes
- Changed section title from "Request Tier Upgrade" to "Tier Change Requests"
- Added tabbed interface when both upgrade and downgrade are available
- Shows tabs with icons for visual clarity
- Conditional rendering based on tier:
  - **Free tier**: Only upgrade option (cannot downgrade)
  - **Tier 1-2**: Both upgrade and downgrade in tabs
  - **Tier 3**: Only downgrade option (cannot upgrade)

### Components Reused
- `UpgradeRequestStatusCard` is reused for displaying downgrade request status
- Both request types use the same status card (compatible interfaces)
- Downgrade requests use the API endpoint: `/api/portal/vendors/[id]/tier-downgrade-request`

## Testing Checklist

- [ ] Type check passes
- [ ] Page loads without errors
- [ ] Free tier users see only upgrade tab/option
- [ ] Tier 1-2 users see both tabs
- [ ] Tier 3 users see only downgrade tab/option
- [ ] Can submit upgrade request
- [ ] Can submit downgrade request
- [ ] Pending requests display correctly
- [ ] Can cancel pending requests
- [ ] Tab switching works smoothly
- [ ] Icons display correctly in tabs

## Expected Behavior

### For Free Tier Vendors
- See only the upgrade option (no tabs, direct form display)
- Can request upgrade to tier1, tier2, or tier3

### For Tier 1 Vendors
- See tabs with "Upgrade" and "Downgrade"
- Upgrade tab: Can request upgrade to tier2 or tier3
- Downgrade tab: Can request downgrade to free

### For Tier 2 Vendors
- See tabs with "Upgrade" and "Downgrade"
- Upgrade tab: Can request upgrade to tier3
- Downgrade tab: Can request downgrade to tier1 or free

### For Tier 3 Vendors
- See only the downgrade option (no tabs, direct form display)
- Can request downgrade to tier2, tier1, or free

## Related Files
- `/home/edwin/development/ptnextjs/components/dashboard/TierDowngradeRequestForm.tsx` - Form component
- `/home/edwin/development/ptnextjs/components/dashboard/UpgradeRequestStatusCard.tsx` - Status display (reused)
- `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-downgrade-request/route.ts` - API endpoint
