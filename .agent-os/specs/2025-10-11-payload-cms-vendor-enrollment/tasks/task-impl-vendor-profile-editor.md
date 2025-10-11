# Task: impl-vendor-profile-editor - Implement Vendor Profile Editor with Tier Restrictions

## Task Metadata
- **Task ID**: impl-vendor-profile-editor
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 40-50 minutes
- **Dependencies**: [impl-vendor-dashboard]
- **Status**: [ ] Not Started

## Task Description
Create VendorProfileEditor component with tier-gated field groups using TierGate component. Free tier can edit basic fields, tier1+ can edit enhanced profile, tier2 can manage products (future).

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/app/vendor/dashboard/profile/page.tsx` - Profile editing page
  - `/home/edwin/development/ptnextjs/components/vendor/VendorProfileEditor.tsx` - Profile form component
  - `/home/edwin/development/ptnextjs/components/shared/TierGate.tsx` - Tier restriction wrapper component
- **Form Field Groups**:
  - Basic Info (Free tier): companyName, description, logo, contactEmail, contactPhone
  - Enhanced Profile (Tier 1+): website, socialLinks (linkedin, twitter), certifications
  - Products (Tier 2): Link to products page (not editable here)
- **shadcn/ui Components**: Form, Input, Textarea, Button, Card, Badge
- **Flow**: Load current profile → Edit fields → Save → API call PUT /api/vendors/{id} → Success (toast + refresh) or Error (toast)

## Acceptance Criteria
- [ ] VendorProfileEditor component created with all field groups
- [ ] TierGate component wraps tier-restricted fields
- [ ] Free tier sees only basic fields
- [ ] Tier 1+ sees enhanced profile fields
- [ ] Tier 2 sees products link (not editable fields)
- [ ] Form pre-populates with current vendor data
- [ ] Save button triggers API call
- [ ] Success: Toast notification + data refresh
- [ ] Error: Toast notification with error message
- [ ] Loading state during save operation

## Testing Requirements
- Unit tests: TierGate rendering logic, form field visibility based on tier
- Integration tests: Save profile with valid data, tier restriction error handling
- Manual verification: Test with free tier vendor (fields hidden), test with tier1 vendor (fields visible)

## Related Files
- Technical Spec: VendorProfileEditor and TierGate components
- API: PUT /api/vendors/{id}
