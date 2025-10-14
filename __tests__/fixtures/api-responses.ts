/**
 * API Response Test Fixtures
 *
 * Mock API responses for testing frontend components with MSW
 */

/**
 * Authentication API Responses
 */
export const authApiResponses = {
  loginSuccess: {
    user: {
      id: 'vendor-tier2-001',
      email: 'vendor.tier2@example.com',
      role: 'vendor',
      tier: 'tier2',
    },
    message: 'Login successful',
  },
  loginSuccessAdmin: {
    user: {
      id: 'admin-001',
      email: 'admin@example.com',
      role: 'admin',
    },
    message: 'Login successful',
  },
  loginInvalidCredentials: {
    error: 'Invalid email or password',
    code: 'INVALID_CREDENTIALS',
  },
  loginPendingApproval: {
    error: 'Your account is pending approval',
    code: 'PENDING_APPROVAL',
  },
  loginAccountRejected: {
    error: 'Your account has been rejected',
    code: 'ACCOUNT_REJECTED',
  },
  logoutSuccess: {
    message: 'Logout successful',
  },
  refreshTokenSuccess: {
    accessToken: 'new-access-token-123',
    message: 'Token refreshed',
  },
  refreshTokenExpired: {
    error: 'Refresh token expired',
    code: 'TOKEN_EXPIRED',
  },
};

/**
 * Registration API Responses
 */
export const registrationApiResponses = {
  registrationSuccess: {
    vendor: {
      id: 'new-vendor-001',
      email: 'newvendor@example.com',
      companyName: 'New Marine Tech',
      contactName: 'John Doe',
      phone: '+1-555-9999',
      website: 'https://newmarine.com',
      approvalStatus: 'pending',
      tier: 'free',
    },
    message: 'Registration successful. Your account is pending approval.',
  },
  registrationEmailExists: {
    error: 'Email already exists',
    code: 'EMAIL_EXISTS',
  },
  registrationCompanyExists: {
    error: 'Company name already exists',
    code: 'COMPANY_EXISTS',
  },
  registrationValidationError: {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: [
      { field: 'email', message: 'Invalid email format' },
      { field: 'password', message: 'Password too weak' },
    ],
  },
};

/**
 * Profile API Responses
 */
export const profileApiResponses = {
  getProfileSuccess: {
    vendor: {
      id: 'vendor-tier2-001',
      email: 'vendor.tier2@example.com',
      companyName: 'Test Marine Tech',
      contactName: 'John Doe',
      phone: '+1-555-0123',
      website: 'https://testmarine.com',
      description: 'Leading provider of marine technology',
      tier: 'tier2',
      approvalStatus: 'approved',
      certifications: ['ISO 9001', 'ISO 14001', 'CE Marking'],
      caseStudies: [
        {
          title: 'Superyacht Navigation System',
          description: 'Implemented advanced navigation for 100m yacht',
          image: '/images/case-study-1.jpg',
        },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-10-01T00:00:00Z',
    },
  },
  getProfileNotAuthenticated: {
    error: 'Not authenticated',
    code: 'NOT_AUTHENTICATED',
  },
  getProfileNotFound: {
    error: 'Vendor profile not found',
    code: 'NOT_FOUND',
  },
  updateProfileSuccess: {
    vendor: {
      id: 'vendor-tier2-001',
      companyName: 'Updated Marine Tech',
      description: 'Updated description',
      updatedAt: '2025-10-12T00:00:00Z',
    },
    message: 'Profile updated successfully',
  },
  updateProfileTierRestriction: {
    error: 'Upgrade to Tier 1 required to edit this field',
    code: 'TIER_RESTRICTION',
    field: 'certifications',
    requiredTier: 'tier1',
  },
  updateProfileValidationError: {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: [
      { field: 'website', message: 'Invalid URL format' },
    ],
  },
};

/**
 * Admin API Responses
 */
export const adminApiResponses = {
  getPendingVendorsSuccess: {
    vendors: [
      {
        id: 'pending-001',
        email: 'pending1@example.com',
        companyName: 'Pending Marine Co 1',
        contactName: 'Alice Pending',
        phone: '+1-555-1001',
        website: 'https://pending1.com',
        approvalStatus: 'pending',
        tier: 'free',
        createdAt: '2025-10-01T10:00:00Z',
      },
      {
        id: 'pending-002',
        email: 'pending2@example.com',
        companyName: 'Pending Marine Co 2',
        contactName: 'Bob Pending',
        phone: '+1-555-1002',
        website: 'https://pending2.com',
        approvalStatus: 'pending',
        tier: 'free',
        createdAt: '2025-10-05T14:30:00Z',
      },
    ],
    total: 2,
  },
  getPendingVendorsEmpty: {
    vendors: [],
    total: 0,
  },
  getPendingVendorsForbidden: {
    error: 'Admin access required',
    code: 'FORBIDDEN',
  },
  approveVendorSuccess: {
    vendor: {
      id: 'pending-001',
      approvalStatus: 'approved',
      updatedAt: '2025-10-12T00:00:00Z',
    },
    message: 'Vendor approved successfully',
  },
  approveVendorNotFound: {
    error: 'Vendor not found',
    code: 'NOT_FOUND',
  },
  approveVendorAlreadyApproved: {
    error: 'Vendor is already approved',
    code: 'ALREADY_APPROVED',
  },
  rejectVendorSuccess: {
    vendor: {
      id: 'pending-001',
      approvalStatus: 'rejected',
      updatedAt: '2025-10-12T00:00:00Z',
    },
    message: 'Vendor rejected successfully',
  },
  rejectVendorNotFound: {
    error: 'Vendor not found',
    code: 'NOT_FOUND',
  },
};

/**
 * Error Responses (Generic)
 */
export const genericErrorResponses = {
  serverError: {
    error: 'Internal server error',
    code: 'SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
  },
  notAuthenticated: {
    error: 'Not authenticated',
    code: 'NOT_AUTHENTICATED',
    message: 'Please log in to access this resource.',
  },
  forbidden: {
    error: 'Forbidden',
    code: 'FORBIDDEN',
    message: 'You do not have permission to access this resource.',
  },
  notFound: {
    error: 'Not found',
    code: 'NOT_FOUND',
    message: 'The requested resource was not found.',
  },
  badRequest: {
    error: 'Bad request',
    code: 'BAD_REQUEST',
    message: 'Invalid request parameters.',
  },
  timeout: {
    error: 'Request timeout',
    code: 'TIMEOUT',
    message: 'The request took too long to complete.',
  },
  networkError: {
    error: 'Network error',
    code: 'NETWORK_ERROR',
    message: 'Unable to connect to the server.',
  },
};

/**
 * Success Messages
 */
export const successMessages = {
  registration: 'Registration successful. Your account is pending approval.',
  login: 'Login successful',
  logout: 'Logout successful',
  profileUpdate: 'Profile updated successfully',
  vendorApproved: 'Vendor approved successfully',
  vendorRejected: 'Vendor rejected successfully',
  passwordReset: 'Password reset link sent to your email',
  emailVerified: 'Email verified successfully',
};

/**
 * Error Messages
 */
export const errorMessages = {
  invalidCredentials: 'Invalid email or password',
  pendingApproval: 'Your account is pending approval',
  accountRejected: 'Your account has been rejected',
  emailExists: 'Email already exists',
  companyExists: 'Company name already exists',
  tierRestriction: 'Upgrade required to access this feature',
  notAuthenticated: 'Please log in to continue',
  forbidden: 'You do not have permission to perform this action',
  serverError: 'An unexpected error occurred. Please try again later.',
  networkError: 'Unable to connect to the server',
  validationError: 'Please correct the errors in the form',
};
