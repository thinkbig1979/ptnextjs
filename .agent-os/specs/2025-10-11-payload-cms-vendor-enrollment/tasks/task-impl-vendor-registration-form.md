# Task: impl-vendor-registration-form - Implement Vendor Registration Form Component

## Task Metadata
- **Task ID**: impl-vendor-registration-form
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 35-40 minutes
- **Dependencies**: [impl-auth-context]
- **Status**: [x] ✅ COMPLETE

## Task Description
Create VendorRegistrationForm component using shadcn/ui Form, Input, and Button components with React Hook Form and Zod validation. Implement registration flow with loading states, error handling, and success redirect.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/components/vendor/VendorRegistrationForm.tsx` - Form component
  - `/home/edwin/development/ptnextjs/app/vendor/register/page.tsx` - Registration page
- **shadcn/ui Components to Use**:
  - Form, FormField, FormItem, FormLabel, FormControl, FormMessage
  - Input (for email, company name, phone, password)
  - Button (submit button with loading state)
  - Toast (success/error notifications)
- **Form Fields**:
  - companyName (2-100 chars, required)
  - contactEmail (valid email, required)
  - contactPhone (valid phone, optional)
  - password (12+ chars with uppercase, lowercase, number, special char, required)
  - confirmPassword (must match password, required)
- **Validation**: Zod schema matching API requirements
- **Flow**: Fill form → Submit → API call → Success (redirect to /vendor/registration-pending) or Error (show toast + inline errors)

## Acceptance Criteria
- [ ] VendorRegistrationForm component created with all fields
- [ ] React Hook Form integrated with Zod validation
- [ ] shadcn/ui Form components used throughout
- [ ] Real-time inline validation errors displayed
- [ ] Password strength requirements enforced
- [ ] confirmPassword validation checks match
- [ ] Submit button shows loading spinner during API call
- [ ] Success: Redirect to /vendor/registration-pending
- [ ] Error: Toast notification + inline field errors
- [ ] Form data cleared after successful submission

## Testing Requirements
- Unit tests: Field validation rules, form submission logic, error handling
- Integration tests: Successful registration, validation errors, duplicate email error
- Manual verification: Register test vendor, verify loading state, verify error display

## Evidence Required
- Screenshot of registration form
- Screenshot of successful registration redirect
- Screenshot of validation errors

## Context Requirements
- Technical Spec: VendorRegistrationForm component specification
- shadcn/ui Form documentation
- API endpoint: POST /api/vendors/register

## Related Files
- Technical Spec: Frontend Implementation - VendorRegistrationForm
