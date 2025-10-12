/**
 * Form Data Test Fixtures
 *
 * Mock form data for testing form components
 */

/**
 * Valid Registration Form Data
 */
export const validRegistrationData = {
  email: 'newvendor@example.com',
  password: 'StrongPass123!@#',
  confirmPassword: 'StrongPass123!@#',
  companyName: 'New Marine Tech',
  contactName: 'John Doe',
  phone: '+1-555-9999',
  website: 'https://newmarine.com',
  description: 'Innovative marine technology solutions',
  agreedToTerms: true,
};

/**
 * Invalid Registration Form Data (various scenarios)
 */
export const invalidRegistrationData = {
  emptyEmail: {
    ...validRegistrationData,
    email: '',
  },
  invalidEmail: {
    ...validRegistrationData,
    email: 'invalid-email',
  },
  weakPassword: {
    ...validRegistrationData,
    password: 'weak',
    confirmPassword: 'weak',
  },
  passwordMismatch: {
    ...validRegistrationData,
    password: 'StrongPass123!@#',
    confirmPassword: 'DifferentPass123!@#',
  },
  emptyCompanyName: {
    ...validRegistrationData,
    companyName: '',
  },
  invalidPhone: {
    ...validRegistrationData,
    phone: '123', // Too short
  },
  invalidWebsite: {
    ...validRegistrationData,
    website: 'not-a-url',
  },
  termsNotAgreed: {
    ...validRegistrationData,
    agreedToTerms: false,
  },
};

/**
 * Valid Login Form Data
 */
export const validLoginData = {
  email: 'vendor@example.com',
  password: 'StrongPass123!@#',
  rememberMe: false,
};

/**
 * Invalid Login Form Data
 */
export const invalidLoginData = {
  emptyEmail: {
    ...validLoginData,
    email: '',
  },
  emptyPassword: {
    ...validLoginData,
    password: '',
  },
  invalidCredentials: {
    email: 'wrong@example.com',
    password: 'WrongPass123!@#',
  },
};

/**
 * Valid Profile Update Data (Free Tier)
 */
export const validProfileDataFreeTier = {
  companyName: 'Updated Marine Tech',
  contactName: 'John Updated',
  phone: '+1-555-8888',
  website: 'https://updated.com',
  description: 'Updated description',
};

/**
 * Valid Profile Update Data (Tier 1)
 */
export const validProfileDataTier1 = {
  ...validProfileDataFreeTier,
  certifications: ['ISO 9001', 'ISO 14001'],
  specializations: ['Navigation Systems', 'Communication Equipment'],
};

/**
 * Valid Profile Update Data (Tier 2)
 */
export const validProfileDataTier2 = {
  ...validProfileDataTier1,
  caseStudies: [
    {
      title: 'Advanced Navigation System',
      description: 'Implemented for 100m superyacht',
      image: '/images/case-study.jpg',
    },
  ],
  awards: ['Best Innovation 2024'],
  videoIntroduction: 'https://youtube.com/watch?v=123',
};

/**
 * Invalid Profile Update Data (Tier Restrictions)
 */
export const invalidProfileDataTierRestriction = {
  freeTierAttemptingTier1Fields: {
    ...validProfileDataFreeTier,
    certifications: ['ISO 9001'], // Free tier cannot edit this
  },
  tier1AttemptingTier2Fields: {
    ...validProfileDataTier1,
    caseStudies: [
      {
        title: 'Case Study',
        description: 'Description',
      },
    ], // Tier 1 cannot edit this
  },
};

/**
 * Form validation error messages
 */
export const validationErrorMessages = {
  email: {
    required: 'Email is required',
    invalid: 'Invalid email format',
    exists: 'Email already exists',
  },
  password: {
    required: 'Password is required',
    weak: 'Password must be at least 12 characters',
    noUppercase: 'Password must contain at least one uppercase letter',
    noLowercase: 'Password must contain at least one lowercase letter',
    noNumber: 'Password must contain at least one number',
    noSpecial: 'Password must contain at least one special character',
  },
  confirmPassword: {
    required: 'Please confirm your password',
    mismatch: 'Passwords do not match',
  },
  companyName: {
    required: 'Company name is required',
    exists: 'Company name already exists',
    tooShort: 'Company name must be at least 2 characters',
  },
  contactName: {
    required: 'Contact name is required',
  },
  phone: {
    required: 'Phone number is required',
    invalid: 'Invalid phone number format',
  },
  website: {
    invalid: 'Invalid website URL',
  },
  terms: {
    required: 'You must agree to the terms and conditions',
  },
  tierRestriction: {
    tier1Required: 'Upgrade to Tier 1 to access this feature',
    tier2Required: 'Upgrade to Tier 2 to access this feature',
  },
};

/**
 * API error responses
 */
export const apiErrorResponses = {
  invalidCredentials: {
    error: 'Invalid email or password',
    code: 'INVALID_CREDENTIALS',
  },
  pendingApproval: {
    error: 'Your account is pending approval',
    code: 'PENDING_APPROVAL',
  },
  accountRejected: {
    error: 'Your account has been rejected',
    code: 'ACCOUNT_REJECTED',
  },
  emailExists: {
    error: 'Email already exists',
    code: 'EMAIL_EXISTS',
  },
  companyExists: {
    error: 'Company name already exists',
    code: 'COMPANY_EXISTS',
  },
  tierRestriction: {
    error: 'Upgrade to Tier 1 required',
    code: 'TIER_RESTRICTION',
  },
  serverError: {
    error: 'Internal server error',
    code: 'SERVER_ERROR',
  },
  notAuthenticated: {
    error: 'Not authenticated',
    code: 'NOT_AUTHENTICATED',
  },
  forbidden: {
    error: 'Admin access required',
    code: 'FORBIDDEN',
  },
};

/**
 * API success responses
 */
export const apiSuccessResponses = {
  registrationSuccess: {
    vendor: {
      id: 'new-vendor-001',
      email: 'newvendor@example.com',
      companyName: 'New Marine Tech',
      approvalStatus: 'pending',
      tier: 'free',
    },
    message: 'Registration successful. Your account is pending approval.',
  },
  loginSuccess: {
    user: {
      id: 'vendor-001',
      email: 'vendor@example.com',
      role: 'vendor',
      tier: 'tier2',
    },
    message: 'Login successful',
  },
  profileUpdateSuccess: {
    vendor: {
      id: 'vendor-001',
      companyName: 'Updated Marine Tech',
      description: 'Updated description',
    },
    message: 'Profile updated successfully',
  },
  approvalSuccess: {
    vendor: {
      id: 'vendor-001',
      approvalStatus: 'approved',
    },
    message: 'Vendor approved successfully',
  },
  rejectionSuccess: {
    vendor: {
      id: 'vendor-001',
      approvalStatus: 'rejected',
    },
    message: 'Vendor rejected successfully',
  },
};
