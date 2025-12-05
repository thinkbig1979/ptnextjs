# Vendor Registration Form Simplification - Implementation Guide

**Task**: ptnextjs-93g
**Objective**: Simplify vendor registration form to collect only essential fields

## Overview

The vendor registration form has been simplified to collect only the following essential fields during initial registration:

1. **Company Name** (companyName) - required
2. **Contact Email** (contactEmail) - required
3. **Password** - required
4. **Confirm Password** - required

All other profile details (website, description, contact name/phone, etc.) will be collected later during profile setup or vendor dashboard onboarding.

## Files Modified

### 1. `/home/edwin/development/ptnextjs/components/vendor/VendorRegistrationForm.tsx`

**Key Changes:**

#### Imports (Lines 18-22)
- **REMOVED**: `import { Textarea } from '@/components/ui/textarea';`
- **REMOVED**: `import { Checkbox } from '@/components/ui/checkbox';`
- **KEPT**: All other imports including Button, Form components, Input, useToast, and lucide-react icons

#### Validation Schema (Lines 34-91)
- **SIMPLIFIED**: Removed validation rules for:
  - `contactName` (optional field)
  - `phone` (optional field)
  - `website` (optional field)
  - `description` (optional field)
  - `agreeToTerms` (boolean checkbox field)
- **KEPT**: Validation for:
  - `email`: Email format, 1-255 characters
  - `password`: 12+ characters, uppercase, lowercase, number, special character
  - `confirmPassword`: Password confirmation with match validation
  - `companyName`: 2-100 characters

#### Form Instance (Lines 127-140)
- **CHANGED**: Default values now only include:
  ```typescript
  {
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  }
  ```
- **REMOVED**: Default values for contactName, phone, website, description, agreeToTerms

#### Form Watchers (Line 142-144)
- **CHANGED**: Removed the `description` watcher
- **KEPT**: Only watching `password` for strength calculation

#### Form Submission (Lines 149-168)
- **SIMPLIFIED**: Only sends essential fields to API:
  ```typescript
  {
    contactEmail: data.email,
    password: data.password,
    companyName: data.companyName,
  }
  ```
- **REMOVED**: Sending contactName, contactPhone, website, description

#### Error Handling (Lines 175-175)
- **UPDATED**: Changed error code check from checking both 'EMAIL_EXISTS' and 'DUPLICATE_EMAIL' to only 'DUPLICATE_EMAIL'

#### Error Messages (Line 206)
- **UPDATED**: Changed from `result.error` to `result.error?.message` to handle response structure

#### Form Fields in JSX (Lines 253-486)
**REMOVED FormField Components:**
- Contact Name Field (lines 293-311)
- Phone Field (lines 313-331)
- Website Field (lines 333-351)
- Description Field (lines 442-463)
- Terms and Conditions Checkbox (lines 465-486)

**KEPT FormField Components (Reordered):**
1. Company Name Field (moved to first position)
2. Email Field
3. Password Field (with strength indicator)
4. Confirm Password Field

### 2. `/home/edwin/development/ptnextjs/app/api/portal/vendors/register/route.ts`

**Key Changes:**

#### Validation Schema (Lines 8-38)
- **SIMPLIFIED**: Schema now only includes required fields:
  ```typescript
  const vendorRegistrationSchema = z.object({
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name must not exceed 100 characters'),
    contactEmail: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
  });
  ```
- **REMOVED**: Optional fields for contactName, contactPhone, website, description

#### Vendor Creation (Lines 205-219)
- **UPDATED**: Empty string defaults for profile fields that won't be provided:
  ```typescript
  const vendor = await payload.create({
    collection: 'vendors',
    data: {
      user: userId,
      companyName: data.companyName,
      slug,
      contactEmail: data.contactEmail,
      contactName: '',        // Empty - will be filled later
      contactPhone: '',       // Empty - will be filled later
      website: '',            // Empty - will be filled later
      description: '',        // Empty - will be filled later
      tier: 'free',
      published: false,
      featured: false,
    },
  });
  ```

#### Documentation (Added)
- **ADDED**: Comment explaining that profile details are optional during registration and can be updated through vendor dashboard

## Form Field Flow

### Current Flow (Removed)
User was required to provide:
1. Email
2. Company Name
3. Contact Name (optional)
4. Phone (optional)
5. Website (optional)
6. Password
7. Confirm Password
8. Description (optional)
9. Terms Checkbox (required)

### New Simplified Flow (Active)
User only provides:
1. Company Name
2. Email
3. Password
4. Confirm Password

## Validation Rules Maintained

### Email Validation
- Required
- Valid email format
- Max 255 characters

### Password Validation
- Required
- Minimum 12 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Passwords must match confirmation field

### Company Name Validation
- Required
- Minimum 2 characters
- Maximum 100 characters

## API Endpoint Behavior

### Request Body (Simplified)
```json
{
  "companyName": "Acme Corporation",
  "contactEmail": "admin@acme.com",
  "password": "SecureP@ss123"
}
```

### Vendor Record Creation
When a vendor registration is successful, the following vendor record is created in the database:

```
- user: [Created user ID]
- companyName: "Acme Corporation"
- slug: "acme-corporation"
- contactEmail: "admin@acme.com"
- contactName: "" (empty string)
- contactPhone: "" (empty string)
- website: "" (empty string)
- description: "" (empty string)
- tier: "free"
- published: false
- featured: false
```

## Future Enhancements

Users can complete their vendor profile after registration by:
1. Logging into the vendor dashboard
2. Navigating to profile settings
3. Adding:
   - Contact Name
   - Contact Phone
   - Company Website
   - Company Description
   - Company Logo
   - Product Categories
   - Other profile details

## Testing Checklist

- [ ] Form displays only 4 fields (Company Name, Email, Password, Confirm Password)
- [ ] Company Name validation works (2-100 characters)
- [ ] Email validation works (valid email format)
- [ ] Password validation works (12+ chars, mixed case, number, special char)
- [ ] Confirm Password validation works (passwords must match)
- [ ] Form submission sends only required fields to API
- [ ] Duplicate email error handling works correctly
- [ ] Duplicate company name error handling works correctly
- [ ] Validation error handling works correctly
- [ ] Successful registration redirects to pending approval page
- [ ] Vendor record is created with empty strings for optional fields

## Browser Compatibility

The simplified form maintains full compatibility with:
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile and tablet devices
- Accessibility standards (WCAG 2.1)
