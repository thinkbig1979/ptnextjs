# Spec Requirements Document

> Spec: Email Notification System
> Created: 2025-12-03

## Overview

Implement an automated email notification system using Resend to send transactional emails for vendor registration workflow and tier upgrade requests, reducing admin workload and improving vendor experience with timely status updates.

## User Stories

### Admin Notification - New Vendor Registration

As a platform administrator, I want to receive email notifications when new vendors register, so that I can review and approve vendor profiles promptly without constantly checking the admin panel.

When a new vendor completes registration, the admin receives an email with vendor details (company name, email, tier) and a direct link to the admin approval page. This replaces manual admin panel checks and ensures timely vendor onboarding.

### Vendor Notification - Registration Status

As a vendor, I want to receive email notifications about my registration status (approved or rejected), so that I know when I can access my dashboard and start managing my profile.

After admin review, vendors receive approval confirmation with dashboard access instructions, or rejection notification with explanation and next steps. This eliminates uncertainty and provides clear communication throughout the registration process.

### Tier Upgrade Notifications

As a vendor or administrator, I want to receive email notifications when tier upgrade requests are submitted, approved, or rejected, so that all parties are informed of subscription changes without manual follow-up.

When a vendor requests a tier upgrade, the admin receives a notification with business justification and a link to review the request. After admin action, the vendor receives confirmation of approval (with new tier features) or rejection (with admin reasoning).

## Spec Scope

1. **Resend Integration** - Configure Resend API client with environment variables and error handling
2. **Email Service Layer** - Create EmailService.ts following existing service patterns (TierUpgradeRequestService.ts) with template rendering and sending functions
3. **Email Templates** - Professional HTML email templates matching brand (6 templates: vendor registered, vendor approved, vendor rejected, tier requested, tier approved, tier rejected)
4. **Payload CMS Hooks** - Add afterChange hooks to Vendors and TierUpgradeRequests collections to trigger email notifications on status changes
5. **Environment Configuration** - Add RESEND_API_KEY and EMAIL_FROM_ADDRESS to .env.example and configuration documentation

## Out of Scope

- Marketing emails or newsletters (transactional only)
- Email preference management (users cannot opt-out of transactional emails)
- Email delivery analytics/tracking beyond Resend's built-in logging
- Email templates for other collections (products, blog posts, etc.)
- Custom SMTP server configuration (Resend only)
- Email queueing/retry logic beyond Resend's built-in reliability

## Expected Deliverable

1. **Functional Email Notifications** - All 6 notification triggers send branded HTML emails via Resend with correct recipient, subject, and content based on the triggering event
2. **Admin Workflow Integration** - Admins receive actionable emails with direct links to admin panel pages for vendor approval and tier upgrade review
3. **Error Handling & Logging** - Email sending failures are caught, logged with sufficient detail for debugging, and do not block database operations (emails are best-effort)
