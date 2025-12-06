# Notification System Testing Guide

Comprehensive testing guide for the in-app notification system.

## Prerequisites

- Notification system fully installed (see `NOTIFICATION_SYSTEM_INSTALLATION.md`)
- Development server running (`npm run dev`)
- At least one admin user and one vendor user created
- At least one vendor with tier upgrade capabilities

## Test Scenarios

### Scenario 1: Tier Upgrade Request Submission (Vendor → Admin)

**Objective:** Verify that admin receives notification when vendor submits tier upgrade request

**Steps:**
1. Log in as a vendor user
2. Navigate to vendor dashboard
3. Submit a tier upgrade request (e.g., from Tier 1 to Tier 2)
4. Log out and log in as an admin user
5. Check notification bell icon

**Expected Results:**
- [ ] Admin sees unread notification badge on bell icon
- [ ] Clicking bell shows notification dropdown
- [ ] Notification title: "New Tier Upgrade Request"
- [ ] Notification message includes vendor name and tier details
- [ ] Notification icon is blue arrow-up
- [ ] Clicking notification navigates to `/admin/tier-requests/pending`
- [ ] Notification is marked as read after clicking

**API Validation:**
```bash
# Get admin notifications
curl -H "Cookie: payload-token=ADMIN_TOKEN" \
  http://localhost:3000/api/notifications

# Response should include:
{
  "success": true,
  "notifications": [{
    "type": "tier_upgrade_submitted",
    "title": "New Tier Upgrade Request",
    "read": false,
    ...
  }],
  "unreadCount": 1
}
```

### Scenario 2: Tier Downgrade Request Submission (Vendor → Admin)

**Objective:** Verify that admin receives notification when vendor submits tier downgrade request

**Steps:**
1. Log in as a vendor user (with tier >= 2)
2. Navigate to vendor dashboard
3. Submit a tier downgrade request
4. Log out and log in as an admin user
5. Check notification bell icon

**Expected Results:**
- [ ] Admin sees unread notification badge
- [ ] Notification title: "New Tier Downgrade Request"
- [ ] Notification icon is orange arrow-down
- [ ] Notification metadata includes `requestType: 'downgrade'`

### Scenario 3: Tier Upgrade Approval (Admin → Vendor)

**Objective:** Verify that vendor receives notification when admin approves upgrade request

**Steps:**
1. Ensure there's a pending tier upgrade request
2. Log in as an admin user
3. Navigate to `/admin/tier-requests/pending`
4. Approve the tier upgrade request
5. Log out and log in as the vendor user who submitted the request
6. Check notification bell icon

**Expected Results:**
- [ ] Vendor sees unread notification badge
- [ ] Notification title: "Tier Upgrade Approved"
- [ ] Notification message confirms new tier
- [ ] Notification icon is green checkmark
- [ ] Clicking notification navigates to vendor dashboard
- [ ] Vendor's actual tier has been updated

**API Validation:**
```bash
# Get vendor notifications
curl -H "Cookie: payload-token=VENDOR_TOKEN" \
  http://localhost:3000/api/notifications

# Response should include:
{
  "success": true,
  "notifications": [{
    "type": "tier_upgrade_approved",
    "title": "Tier Upgrade Approved",
    "read": false,
    ...
  }]
}
```

### Scenario 4: Tier Downgrade Approval (Admin → Vendor)

**Objective:** Verify that vendor receives notification when admin approves downgrade request

**Steps:**
1. Ensure there's a pending tier downgrade request
2. Log in as an admin user
3. Approve the tier downgrade request
4. Log in as the vendor user
5. Check notifications

**Expected Results:**
- [ ] Vendor sees notification: "Tier Downgrade Approved"
- [ ] Notification icon is green checkmark
- [ ] Vendor's tier has been downgraded

### Scenario 5: Tier Upgrade Rejection (Admin → Vendor)

**Objective:** Verify that vendor receives notification when admin rejects upgrade request

**Steps:**
1. Ensure there's a pending tier upgrade request
2. Log in as an admin user
3. Navigate to `/admin/tier-requests/pending`
4. Reject the request with a reason (e.g., "Insufficient business justification")
5. Log in as the vendor user
6. Check notifications

**Expected Results:**
- [ ] Vendor sees unread notification badge
- [ ] Notification title: "Tier Upgrade Request Rejected"
- [ ] Notification message includes rejection reason
- [ ] Notification icon is red X
- [ ] Vendor's tier remains unchanged

### Scenario 6: Tier Downgrade Rejection (Admin → Vendor)

**Objective:** Verify that vendor receives notification when admin rejects downgrade request

**Steps:**
1. Ensure there's a pending tier downgrade request
2. Log in as an admin user
3. Reject the request with a reason
4. Log in as the vendor user
5. Check notifications

**Expected Results:**
- [ ] Vendor sees notification: "Tier Downgrade Request Rejected"
- [ ] Rejection reason is displayed
- [ ] Notification icon is red X

### Scenario 7: Mark Single Notification as Read

**Objective:** Verify that single notification can be marked as read

**Steps:**
1. Log in as a user with unread notifications
2. Click notification bell icon
3. Hover over an unread notification
4. Click the checkmark button (appears on hover)

**Expected Results:**
- [ ] Notification background changes from blue to white
- [ ] Unread badge count decrements by 1
- [ ] Blue dot indicator disappears
- [ ] Notification remains in list but marked as read

**API Validation:**
```bash
# Mark notification as read
curl -X PUT -H "Cookie: payload-token=USER_TOKEN" \
  http://localhost:3000/api/notifications/NOTIFICATION_ID/read

# Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Scenario 8: Mark All Notifications as Read

**Objective:** Verify that all notifications can be marked as read at once

**Steps:**
1. Log in as a user with multiple unread notifications
2. Click notification bell icon
3. Click "Mark all read" button in dropdown header

**Expected Results:**
- [ ] Button shows loading state ("Marking...")
- [ ] All notifications change to read state
- [ ] Unread badge disappears
- [ ] All blue dot indicators disappear
- [ ] Success message appears

**API Validation:**
```bash
# Mark all as read
curl -X PUT -H "Cookie: payload-token=USER_TOKEN" \
  http://localhost:3000/api/notifications/mark-all-read

# Response:
{
  "success": true,
  "message": "X notification(s) marked as read"
}
```

### Scenario 9: Notification Filtering

**Objective:** Verify that notifications can be filtered by type and read status

**API Tests:**
```bash
# Get only unread notifications
curl -H "Cookie: payload-token=USER_TOKEN" \
  "http://localhost:3000/api/notifications?read=false"

# Get only tier upgrade notifications
curl -H "Cookie: payload-token=USER_TOKEN" \
  "http://localhost:3000/api/notifications?type=tier_upgrade_submitted"

# Get with pagination
curl -H "Cookie: payload-token=USER_TOKEN" \
  "http://localhost:3000/api/notifications?limit=10&offset=0"
```

**Expected Results:**
- [ ] Filters return correct subset of notifications
- [ ] Unread count reflects filtered results
- [ ] Pagination works correctly

### Scenario 10: Notification Polling

**Objective:** Verify that new notifications appear automatically

**Steps:**
1. Log in as an admin user
2. Keep notification dropdown open
3. Have another user submit a tier request (or manually create notification)
4. Wait 30 seconds (polling interval)

**Expected Results:**
- [ ] Unread badge count updates automatically
- [ ] New notification appears in dropdown after refresh
- [ ] No page reload required

### Scenario 11: Access Control

**Objective:** Verify that users can only see their own notifications

**Steps:**
1. Create notifications for User A
2. Log in as User B
3. Try to access User A's notifications via API

**API Test:**
```bash
# Try to access another user's notification
curl -X PUT -H "Cookie: payload-token=USER_B_TOKEN" \
  http://localhost:3000/api/notifications/USER_A_NOTIFICATION_ID/read

# Expected response:
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to modify this notification"
  }
}
```

**Expected Results:**
- [ ] User B cannot see User A's notifications in dropdown
- [ ] API returns 403 Forbidden when trying to access other's notifications
- [ ] Admin can see all notifications in Payload admin panel

### Scenario 12: Empty State

**Objective:** Verify that empty state is shown when no notifications exist

**Steps:**
1. Log in as a new user with no notifications
2. Click notification bell icon

**Expected Results:**
- [ ] Bell icon shows no badge
- [ ] Dropdown shows empty state message: "No notifications yet"
- [ ] Empty state icon (bell) is displayed
- [ ] "Mark all read" button is hidden

## Performance Testing

### Test 1: Large Notification List

**Steps:**
1. Create 100+ notifications for a user
2. Open notification dropdown
3. Measure load time and scroll performance

**Expected Results:**
- [ ] Dropdown loads within 1 second
- [ ] Smooth scrolling in ScrollArea
- [ ] Only first 20 notifications fetched initially
- [ ] Pagination works correctly

### Test 2: Concurrent Notifications

**Steps:**
1. Submit multiple tier requests simultaneously
2. Check that all admin users receive notifications

**Expected Results:**
- [ ] All admins receive notifications
- [ ] No duplicate notifications
- [ ] No race conditions or errors

## Edge Cases

### Test 1: Deleted User

**Scenario:** Vendor user is deleted after notification is created

**Expected Results:**
- [ ] Notification remains in database
- [ ] Notification shows gracefully in admin panel
- [ ] No errors when rendering notification

### Test 2: Deleted Vendor

**Scenario:** Vendor is deleted after tier request notification

**Expected Results:**
- [ ] Notification metadata still contains vendorId
- [ ] Navigation still attempts (404 gracefully handled)
- [ ] No application errors

### Test 3: Network Failure

**Scenario:** Network error when marking notification as read

**Expected Results:**
- [ ] Error is logged to console
- [ ] UI shows error state
- [ ] Notification remains unread
- [ ] User can retry

## Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces unread count
- [ ] Focus management in dropdown
- [ ] ARIA labels are correct
- [ ] Color contrast meets WCAG AA standards

## Automated Testing (Future)

Create automated tests for:
1. NotificationService functions
2. API endpoint responses
3. Component rendering
4. User interactions

Example test structure:
```typescript
// lib/services/__tests__/NotificationService.test.ts
describe('NotificationService', () => {
  it('creates notification successfully', async () => {
    const result = await createNotification({
      userId: 'user-123',
      type: 'tier_upgrade_submitted',
      title: 'Test',
      message: 'Test message',
    });

    expect(result.success).toBe(true);
    expect(result.notification).toBeDefined();
  });
});
```

## Test Report Template

```markdown
## Notification System Test Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Development/Staging/Production
**Version:** X.X.X

### Summary
- Total Scenarios: 12
- Passed: X
- Failed: X
- Skipped: X

### Failed Tests
1. Scenario X: Description
   - Expected: ...
   - Actual: ...
   - Error: ...
   - Screenshot: ...

### Notes
- Any additional observations
- Performance metrics
- Browser-specific issues

### Recommendation
- [ ] Ready for production
- [ ] Needs fixes (see failed tests)
- [ ] Needs additional testing
```

## Debugging Tips

### Enable Detailed Logging

```typescript
// In NotificationService.ts, add more detailed logs
console.log('[NotificationService] Creating notification:', {
  userId,
  type,
  title,
});
```

### Check Payload Admin

Navigate to http://localhost:3000/admin/collections/notifications to see all notifications in the database.

### Browser DevTools

- **Network Tab:** Check API requests/responses
- **Console Tab:** Check for JavaScript errors
- **Application Tab:** Check cookies/authentication

### Database Inspection

```bash
# If using SQLite
sqlite3 data/payload.db "SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 10;"
```

## Success Criteria

The notification system is ready for production when:
- [ ] All 12 test scenarios pass
- [ ] No console errors
- [ ] Performance is acceptable (< 1s load time)
- [ ] Works in all supported browsers
- [ ] Accessibility requirements met
- [ ] Code review completed
- [ ] Documentation complete
