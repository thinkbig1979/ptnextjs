# Tasks: Email Notification System

**Spec:** `.agent-os/specs/2025-12-03-email-notification-system/spec.md`

**Estimated Total Time:** 5-7 hours

---

## Task 1: Setup Resend Integration & Environment Configuration
**Estimated Time:** 30 minutes

**Description:**
Install Resend npm package and configure environment variables for email service integration.

**Deliverables:**
- [ ] Install `resend` npm package (latest stable version)
- [ ] Add environment variables to `.env.example`: `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `ADMIN_EMAIL_ADDRESS`, `NEXT_PUBLIC_BASE_URL`
- [ ] Create `.env.local` with actual Resend API credentials (verify domain in Resend dashboard first)
- [ ] Update project documentation (CLAUDE.md) with email service configuration details

**Acceptance Criteria:**
- Resend package installed and available for import
- Environment variables documented and configured
- Domain verified in Resend dashboard (required for sending emails)

---

## Task 2: Create Email Service Layer
**Estimated Time:** 1.5-2 hours

**Description:**
Create `lib/services/EmailService.ts` following existing service patterns with 6 email sending functions.

**Deliverables:**
- [ ] Create `lib/services/EmailService.ts` with Resend client initialization
- [ ] Implement `sendVendorRegisteredEmail()` function with error handling
- [ ] Implement `sendVendorApprovedEmail()` function with error handling
- [ ] Implement `sendVendorRejectedEmail()` function with error handling
- [ ] Implement `sendTierUpgradeRequestedEmail()` function with error handling
- [ ] Implement `sendTierUpgradeApprovedEmail()` function with error handling
- [ ] Implement `sendTierUpgradeRejectedEmail()` function with error handling
- [ ] Implement `getTierFeatures()` helper function for tier feature lookups
- [ ] Implement template rendering function with placeholder replacement
- [ ] Add JSDoc comments for all exported functions

**Acceptance Criteria:**
- All 6 email functions follow TierUpgradeRequestService.ts pattern
- Functions return `{ success: boolean; error?: string }` for consistent error handling
- Email sending failures are logged but do not throw errors (best-effort delivery)
- Template placeholders are replaced correctly ({{COMPANY_NAME}}, {{DASHBOARD_URL}}, etc.)

**Technical Reference:**
- Pattern: `lib/services/TierUpgradeRequestService.ts` (existing service structure)
- Resend API: https://resend.com/docs/send-with-nodejs

---

## Task 3: Create HTML Email Templates
**Estimated Time:** 2-3 hours

**Description:**
Create 6 professional HTML email templates matching brand styling with responsive design.

**Deliverables:**
- [ ] Create `lib/email-templates/` directory
- [ ] Create `vendor-registered.html` (admin notification for new vendor)
- [ ] Create `vendor-approved.html` (vendor notification for approval)
- [ ] Create `vendor-rejected.html` (vendor notification for rejection)
- [ ] Create `tier-upgrade-requested.html` (admin notification for tier upgrade request)
- [ ] Create `tier-upgrade-approved.html` (vendor notification for tier upgrade approval)
- [ ] Create `tier-upgrade-rejected.html` (vendor notification for tier upgrade rejection)

**Acceptance Criteria:**
- All templates use consistent brand colors (#1a56db blue, professional styling)
- Templates are mobile-responsive (max-width: 600px, inline styles)
- All templates include header with "Paul Thames Superyacht Technology" branding
- All templates include footer with copyright and company info
- Placeholders use `{{VARIABLE_NAME}}` format for easy replacement
- CTAs (call-to-action) buttons use clear, actionable text and link to correct admin/dashboard pages
- Templates tested for rendering in Gmail, Outlook, and Apple Mail

**Design Reference:**
- Brand color: #1a56db (blue from existing site)
- Font: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)
- Style: Professional, clean, minimal (similar to existing dashboard design)

---

## Task 4: Add Payload CMS Hooks for Vendor Registration
**Estimated Time:** 1 hour

**Description:**
Add `afterCreate` and `afterChange` hooks to Vendors collection to trigger email notifications on registration and approval/rejection.

**Deliverables:**
- [ ] Add `afterCreate` hook to `payload/collections/Vendors.ts` to send admin notification on new vendor registration
- [ ] Add `afterChange` hook to `payload/collections/Vendors.ts` to send vendor approval/rejection emails when `published` status changes
- [ ] Wrap email service calls in try/catch to prevent blocking database operations
- [ ] Add logging for email send success/failure

**Acceptance Criteria:**
- Admin receives email immediately after new vendor registers (afterCreate hook)
- Vendor receives approval email when admin sets `published: true` (afterChange hook)
- Vendor receives rejection email when admin sets `published: false` after initial submission (edge case, rare)
- Email failures are logged but do not prevent vendor creation/updates
- Hooks only trigger on relevant operations (create for admin notification, update for approval/rejection)

**Technical Reference:**
- Existing hook pattern: `payload/collections/TierUpgradeRequests.ts` (beforeChange hooks)
- Payload hooks documentation: https://payloadcms.com/docs/hooks/overview

---

## Task 5: Add Payload CMS Hooks for Tier Upgrade Requests
**Estimated Time:** 1 hour

**Description:**
Add `afterCreate` and `afterChange` hooks to TierUpgradeRequests collection to trigger email notifications on request creation and status changes.

**Deliverables:**
- [ ] Add `afterCreate` hook to `payload/collections/TierUpgradeRequests.ts` to send admin notification on new tier upgrade request
- [ ] Add `afterChange` hook to `payload/collections/TierUpgradeRequests.ts` to send vendor approval/rejection emails when `status` changes from pending to approved/rejected
- [ ] Fetch vendor data within hooks to get contact email and company name
- [ ] Wrap email service calls in try/catch to prevent blocking database operations
- [ ] Add logging for email send success/failure

**Acceptance Criteria:**
- Admin receives email immediately after vendor submits tier upgrade request (afterCreate hook)
- Vendor receives approval email when admin approves request (status: pending → approved)
- Vendor receives rejection email when admin rejects request (status: pending → rejected)
- Email failures are logged but do not prevent request creation/updates
- Hooks fetch vendor relationship data correctly (contactEmail, companyName)

**Technical Reference:**
- Existing hook pattern: `payload/collections/TierUpgradeRequests.ts` (beforeChange hooks)
- Payload relationship loading: Use `req.payload.findByID()` to fetch vendor data

---

## Task 6: Testing & Verification
**Estimated Time:** 1 hour

**Description:**
Manual and automated testing of all email notification workflows to ensure reliability and correct rendering.

**Deliverables:**
- [ ] Test vendor registration workflow: register new vendor → verify admin receives email with correct data
- [ ] Test vendor approval workflow: approve vendor → verify vendor receives email with dashboard link
- [ ] Test vendor rejection workflow: reject vendor → verify vendor receives email with reason
- [ ] Test tier upgrade request workflow: submit request → verify admin receives email with request details
- [ ] Test tier upgrade approval workflow: approve request → verify vendor receives email with new tier features
- [ ] Test tier upgrade rejection workflow: reject request → verify vendor receives email with reason
- [ ] Verify email rendering in Gmail, Outlook, Apple Mail (desktop and mobile)
- [ ] Test error handling: simulate Resend API failure → verify error is logged but operation completes
- [ ] Verify email links work correctly (dashboard URLs, admin approval URLs)

**Acceptance Criteria:**
- All 6 email templates render correctly in major email clients
- All notification triggers send emails with correct recipient, subject, and content
- Email failures are logged with sufficient detail for debugging
- Email failures do not block database operations (vendor creation, approval, tier upgrades)
- All links in emails navigate to correct pages (admin panel, vendor dashboard)

**Testing Tools:**
- Resend dashboard for delivery logs
- Test email addresses for manual verification
- Browser dev tools for link testing

---

## Notes

**Dependencies:**
- Task 2 depends on Task 1 (need Resend package installed)
- Task 3 can be done in parallel with Task 2
- Tasks 4 and 5 depend on Tasks 2 and 3 (need service and templates ready)
- Task 6 depends on all previous tasks

**Expected Volume:**
- <200 vendor registrations/month
- ~50-100 tier upgrade requests/month
- Total: ~400-600 emails/month (well within Resend's 3,000 free email limit)

**Future Enhancements (Out of Scope):**
- Email delivery tracking/analytics
- Email preference management
- Email queueing/retry logic
- Custom SMTP server support
