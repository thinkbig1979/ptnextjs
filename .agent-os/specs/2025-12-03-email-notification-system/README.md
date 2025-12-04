# Email Notification System Specification

**Created:** 2025-12-03  
**Status:** Ready for Implementation  
**Estimated Time:** 5-7 hours

## Overview

This specification defines an automated email notification system using Resend to handle transactional emails for vendor registration and tier upgrade workflows.

## Quick Links

- **Main Spec:** [spec.md](./spec.md) - Full requirements document
- **Summary:** [spec-lite.md](./spec-lite.md) - One-paragraph overview
- **Technical Details:** [sub-specs/technical-spec.md](./sub-specs/technical-spec.md) - Implementation architecture
- **Task Breakdown:** [tasks.md](./tasks.md) - 6 executable tasks with acceptance criteria

## Notification Triggers

1. **Vendor Registers** → Admin email: "New vendor pending review"
2. **Vendor Approved** → Vendor email: "Welcome, you're approved!"
3. **Vendor Rejected** → Vendor email: "Registration not approved"
4. **Tier Upgrade Requested** → Admin email: "New tier upgrade request"
5. **Tier Upgrade Approved** → Vendor email: "Your upgrade is complete"
6. **Tier Upgrade Rejected** → Vendor email: "Upgrade request declined" + reason

## Key Technical Decisions

- **Email Provider:** Resend (3,000 free emails/month, excellent Next.js integration)
- **Service Pattern:** Follow existing `TierUpgradeRequestService.ts` structure
- **Integration:** Payload CMS `afterChange` hooks for event-driven notifications
- **Error Handling:** Best-effort delivery (email failures logged but do not block database operations)
- **Templates:** 6 HTML templates in `lib/email-templates/` with inline styles

## Implementation Tasks (6 Total)

1. **Setup Resend Integration** (30 min) - Install package, configure environment
2. **Create Email Service** (1.5-2 hrs) - 6 email functions + template rendering
3. **Create HTML Templates** (2-3 hrs) - 6 professional branded email templates
4. **Add Vendor Hooks** (1 hr) - Registration and approval/rejection notifications
5. **Add Tier Upgrade Hooks** (1 hr) - Request and approval/rejection notifications
6. **Testing & Verification** (1 hr) - End-to-end workflow testing

## Files to Create/Modify

**New Files:**
- `lib/services/EmailService.ts` - Email sending service
- `lib/email-templates/vendor-registered.html` - Admin notification template
- `lib/email-templates/vendor-approved.html` - Vendor approval template
- `lib/email-templates/vendor-rejected.html` - Vendor rejection template
- `lib/email-templates/tier-upgrade-requested.html` - Admin tier request template
- `lib/email-templates/tier-upgrade-approved.html` - Vendor tier approval template
- `lib/email-templates/tier-upgrade-rejected.html` - Vendor tier rejection template

**Modified Files:**
- `payload/collections/Vendors.ts` - Add `afterCreate` and `afterChange` hooks
- `payload/collections/TierUpgradeRequests.ts` - Add `afterCreate` and `afterChange` hooks
- `.env.example` - Add Resend environment variables
- `CLAUDE.md` - Document email service configuration

## Environment Variables Required

```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM_ADDRESS=noreply@paulthames.com
ADMIN_EMAIL_ADDRESS=admin@paulthames.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Success Criteria

- All 6 notification triggers send correct emails to correct recipients
- Email failures do not block database operations
- Templates render correctly in Gmail, Outlook, and Apple Mail
- Admin receives actionable notifications with direct links to admin panel
- Vendors receive timely status updates with clear next steps

## Next Steps

1. Review this specification and technical details
2. Execute tasks in order (Task 1 → Task 2 → ... → Task 6)
3. Use `/execute-tasks` command to run tasks with Agent OS orchestration
4. Verify all acceptance criteria are met before marking tasks complete
