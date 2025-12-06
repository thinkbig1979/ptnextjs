# Admin Tier Request Management - Manual Testing Guide

**Task ID**: ptnextjs-8df5
**Date**: 2025-12-06

## Prerequisites

1. Admin user account created and logged in
2. At least one vendor account with tier upgrade/downgrade requests
3. Development server running (`npm run dev`)

## Test Scenarios

### Scenario 1: View Pending Upgrade Requests

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Observe the request queue displays upgrade requests with green badges
3. Verify each request shows:
   - Vendor name
   - Vendor email
   - Current tier → Requested tier
   - Vendor notes (if provided)
   - Request date

**Expected Results**:
- ✅ Upgrade requests display with green "Upgrade" badge
- ✅ ArrowUp icon appears in badge
- ✅ All request details are visible
- ✅ Action buttons (Approve/Reject) are enabled

### Scenario 2: View Pending Downgrade Requests

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Observe the request queue displays downgrade requests with yellow/orange badges
3. Verify each request shows:
   - Vendor name
   - Vendor email
   - Current tier → Requested tier
   - Vendor notes (if provided)
   - Request date
4. Observe row has subtle yellow/orange background tint

**Expected Results**:
- ✅ Downgrade requests display with yellow "Downgrade" badge
- ✅ ArrowDown icon appears in badge
- ✅ Row has `bg-warning/5` background tint
- ✅ All request details are visible
- ✅ Action buttons (Approve/Reject) are enabled

### Scenario 3: Filter by Request Type

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Click "Request Type" dropdown (defaults to "All")
3. Select "Upgrades Only"
4. Verify only upgrade requests are shown
5. Select "Downgrades Only"
6. Verify only downgrade requests are shown
7. Select "All" again
8. Verify both types are shown

**Expected Results**:
- ✅ Filter correctly shows only selected request type
- ✅ Empty state message adjusts based on filter ("No pending upgrade requests" vs "No pending downgrade requests")
- ✅ Filter persists during page session

### Scenario 4: Filter by Status

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Click "Status" dropdown (defaults to "Pending")
3. Select "Approved"
4. Verify only approved requests are shown
5. Select "Rejected"
6. Verify only rejected requests are shown
7. Select "Pending" again

**Expected Results**:
- ✅ Filter correctly shows only requests with selected status
- ✅ Empty state displays when no requests match filter
- ✅ Filter works independently of request type filter

### Scenario 5: Approve Upgrade Request

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Find an upgrade request
3. Click "Approve" button
4. Observe confirmation dialog:
   - Shows "Approve Tier Upgrade Request" title
   - Displays vendor name and current → requested tier
   - Shows vendor notes (if provided)
   - No downgrade warning present
5. Click "Approve" in dialog
6. Observe loading state on button
7. Observe success toast notification
8. Verify request is removed from queue

**Expected Results**:
- ✅ Confirmation dialog displays correct information
- ✅ No downgrade warning shown for upgrade
- ✅ Loading spinner appears during API call
- ✅ Success toast: "Tier upgrade approved"
- ✅ Request disappears from pending queue
- ✅ Vendor tier is updated in database

### Scenario 6: Approve Downgrade Request

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Find a downgrade request
3. Click "Approve" button
4. Observe confirmation dialog:
   - Shows "Approve Tier Downgrade Request" title
   - Displays vendor name and current → requested tier
   - Shows vendor notes (if provided)
   - **Downgrade warning box present** with yellow/orange background
   - Warning text: "The vendor will lose access to features available in their current tier. Make sure they understand the limitations of the lower tier."
5. Click "Approve" in dialog
6. Observe loading state on button
7. Observe success toast notification
8. Verify request is removed from queue

**Expected Results**:
- ✅ Confirmation dialog displays correct information
- ✅ Downgrade warning box visible with appropriate styling
- ✅ Warning message clearly explains consequences
- ✅ Loading spinner appears during API call
- ✅ Success toast: "Tier downgrade approved"
- ✅ Request disappears from pending queue
- ✅ Vendor tier is updated in database
- ✅ Tier-restricted data is hidden (not deleted)

### Scenario 7: Reject Request with Valid Reason

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Find any request (upgrade or downgrade)
3. Click "Reject" button
4. Observe rejection dialog:
   - Shows "Reject Tier [Upgrade|Downgrade] Request" title
   - Displays vendor name and tier information
   - Shows vendor notes
   - Textarea for rejection reason (empty)
5. Enter rejection reason: "Your current subscription level does not support this tier change at this time."
6. Click "Reject" in dialog
7. Observe loading state on button
8. Observe success toast notification
9. Verify request is removed from queue

**Expected Results**:
- ✅ Rejection dialog displays correct information
- ✅ Textarea accepts input
- ✅ Character count or validation feedback visible
- ✅ Loading spinner appears during API call
- ✅ Success toast: "Tier [upgrade|downgrade] rejected"
- ✅ Request disappears from pending queue
- ✅ Request status updated to 'rejected' in database
- ✅ Rejection reason stored in database

### Scenario 8: Reject Request with Invalid Reason (Too Short)

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Find any request
3. Click "Reject" button
4. Enter rejection reason: "No" (less than 10 characters)
5. Click "Reject" in dialog
6. Observe validation error

**Expected Results**:
- ✅ Error message: "Rejection reason must be at least 10 characters"
- ✅ Request is NOT rejected
- ✅ Dialog remains open
- ✅ User can correct and resubmit

### Scenario 9: Reject Request with Invalid Reason (Too Long)

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Find any request
3. Click "Reject" button
4. Enter rejection reason: [1001+ characters]
5. Click "Reject" in dialog
6. Observe validation error

**Expected Results**:
- ✅ Error message: "Rejection reason cannot exceed 1000 characters"
- ✅ Request is NOT rejected
- ✅ Dialog remains open
- ✅ User can correct and resubmit

### Scenario 10: Cancel Dialog

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Click "Approve" on any request
3. Click "Cancel" in confirmation dialog
4. Verify dialog closes and request remains in queue
5. Click "Reject" on any request
6. Enter rejection reason
7. Click "Cancel" in rejection dialog
8. Verify dialog closes and request remains in queue

**Expected Results**:
- ✅ Cancel button closes dialog without action
- ✅ No API calls made
- ✅ Request remains in pending queue
- ✅ No toast notifications shown

### Scenario 11: Loading States

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Observe initial page load:
   - Loading spinner while fetching requests
   - "Loading..." text
3. Once loaded, click "Approve" on a request
4. Click "Approve" in dialog
5. Observe action button shows loading spinner
6. Observe other buttons disabled during action

**Expected Results**:
- ✅ Initial loading state displays while fetching data
- ✅ Action button shows spinner during API call
- ✅ Other action buttons disabled during pending action
- ✅ User cannot spam click buttons

### Scenario 12: Empty State

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. If no pending requests exist:
   - Observe empty state message: "No pending requests"
3. Filter by "Upgrades Only" when no upgrades exist:
   - Observe: "No pending upgrade requests"
4. Filter by "Downgrades Only" when no downgrades exist:
   - Observe: "No pending downgrade requests"

**Expected Results**:
- ✅ Empty state message adjusts based on filter
- ✅ No error states or broken UI
- ✅ User can still change filters

### Scenario 13: Error Handling

**Steps**:
1. Navigate to `/admin/tier-requests/pending`
2. Disconnect network (or simulate API failure)
3. Try to approve a request
4. Observe error handling

**Expected Results**:
- ✅ Error toast notification displays
- ✅ Error message is user-friendly
- ✅ Request remains in pending queue
- ✅ User can retry action

### Scenario 14: Admin Authentication

**Steps**:
1. Log out of admin account
2. Navigate to `/admin/tier-requests/pending`
3. Verify redirect to `/admin/login`
4. Log in with non-admin vendor account
5. Navigate to `/admin/tier-requests/pending`
6. Verify redirect to `/vendor/login` or dashboard

**Expected Results**:
- ✅ Unauthenticated users redirected to admin login
- ✅ Non-admin users redirected to vendor login/dashboard
- ✅ Only admin role can access page

### Scenario 15: Direct Tier Change (AdminDirectTierChange)

**Steps**:
1. Navigate to admin vendor detail page (if component integrated)
2. Locate AdminDirectTierChange component
3. Select a new tier from dropdown
4. Click "Change Tier" button
5. Observe confirmation dialog (with downgrade warning if applicable)
6. Confirm tier change
7. Observe success notification
8. Verify vendor tier updated

**Expected Results**:
- ✅ Current tier displayed with badge
- ✅ All tiers available in dropdown
- ✅ Confirmation dialog shows old → new tier
- ✅ Downgrade warning if tier is lower
- ✅ Success toast notification
- ✅ Vendor tier updated without request workflow

## Success Criteria

All scenarios must pass for the feature to be considered complete:

- ✅ Upgrade and downgrade requests display correctly
- ✅ Visual distinction between request types clear
- ✅ Filtering by request type and status works
- ✅ Approval workflow functions for both types
- ✅ Rejection workflow requires valid reason
- ✅ Downgrade warnings display appropriately
- ✅ Loading states and error handling work
- ✅ Authentication and authorization enforced
- ✅ Toast notifications provide clear feedback
- ✅ No TypeScript or console errors

## Notes for Testers

1. **Database State**: Some scenarios require existing requests. Use vendor portal to create test requests first.
2. **Browser Console**: Check for any errors or warnings during testing.
3. **Network Tab**: Verify API calls are made correctly and responses are as expected.
4. **Accessibility**: Test keyboard navigation and screen reader compatibility.
5. **Responsive Design**: Test on different screen sizes (mobile, tablet, desktop).

## Automated Testing Recommendations

While this guide covers manual testing, consider automating these scenarios with:
- **Jest** for component unit tests
- **React Testing Library** for component integration tests
- **Playwright** for end-to-end workflow tests
