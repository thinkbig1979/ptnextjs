# Task: impl-admin-approval-queue - Implement Admin Approval Queue Component

## Task Metadata
- **Task ID**: impl-admin-approval-queue
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 35-45 minutes
- **Dependencies**: [impl-vendor-dashboard]
- **Status**: [ ] Not Started

## Task Description
Create AdminApprovalQueue component displaying pending vendor registrations in a table with approve/reject actions using Dialog for confirmation.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/app/admin/vendors/pending/page.tsx` - Admin approval page
  - `/home/edwin/development/ptnextjs/components/admin/AdminApprovalQueue.tsx` - Approval queue component
- **shadcn/ui Components**: Table, Dialog, Button, Badge, Toast
- **Table Columns**: Company Name, Contact Email, Phone, Registration Date, Actions (Approve/Reject buttons)
- **Flow**: Display pending vendors → Click Approve → Confirmation dialog → API call → Success (remove from list + toast) or Error (toast)
- **Reject Flow**: Click Reject → Dialog with reason input → API call with reason → Success (remove + toast) or Error (toast)

## Acceptance Criteria
- [ ] AdminApprovalQueue component created with table display
- [ ] Fetches pending vendors from GET /api/admin/vendors/pending
- [ ] Table displays all required columns
- [ ] Approve button opens confirmation dialog
- [ ] Reject button opens dialog with reason input (required)
- [ ] Approve calls POST /api/admin/vendors/{id}/approve
- [ ] Reject calls POST /api/admin/vendors/{id}/reject with reason
- [ ] Success: Vendor removed from table, toast notification
- [ ] Error: Toast error notification
- [ ] Admin-only route guard (redirect non-admin users)

## Testing Requirements
- Unit tests: Table rendering, dialog interactions
- Integration tests: Approve vendor, reject vendor with reason, API error handling
- Manual verification: Approve pending vendor, verify removed from list, check database status updated

## Related Files
- Technical Spec: AdminApprovalQueue component specification
- APIs: GET /api/admin/vendors/pending, POST /api/admin/vendors/{id}/approve, POST /api/admin/vendors/{id}/reject
