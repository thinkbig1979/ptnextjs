# Task: impl-vendor-login-form - Implement Vendor Login Form Component

## Task Metadata
- **Task ID**: impl-vendor-login-form
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: [impl-auth-context]
- **Status**: [ ] Not Started

## Task Description
Create VendorLoginForm component with email/password authentication using AuthContext. Implement error handling for invalid credentials, pending accounts, and rejected accounts.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/components/vendor/VendorLoginForm.tsx` - Login form component
  - `/home/edwin/development/ptnextjs/app/vendor/login/page.tsx` - Login page
- **shadcn/ui Components**: Form, Input, Button, Toast
- **Form Fields**: email, password
- **Flow**: Enter credentials → Submit → AuthContext.login() → Success (redirect to /vendor/dashboard) or Error (show toast)
- **Error Handling**:
  - Invalid credentials: "Invalid email or password"
  - Account pending: "Your account is awaiting admin approval"
  - Account rejected: "Your account has been rejected. Contact support."

## Acceptance Criteria
- [ ] VendorLoginForm component created with email and password fields
- [ ] React Hook Form + Zod validation
- [ ] Submit calls AuthContext.login()
- [ ] Success: Redirect to /vendor/dashboard
- [ ] Error: Toast notification with appropriate message
- [ ] Pending account shows specific message
- [ ] Rejected account shows specific message
- [ ] Loading state on submit button

## Testing Requirements
- Unit tests: Field validation, login success, login failure scenarios
- Integration tests: Successful login redirects, error messages display correctly

## Related Files
- Technical Spec: VendorLoginForm component specification
- AuthContext: `/home/edwin/development/ptnextjs/lib/context/AuthContext.tsx`
