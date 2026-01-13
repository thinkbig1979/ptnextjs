/**
 * Unified Auth Module Types
 *
 * Shared type definitions for the consolidated authentication system.
 */

/**
 * JWT payload for authenticated users
 */
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'vendor';
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  tokenVersion: number;
  type: 'access' | 'refresh';
  jti: string;
}

/**
 * Successful authentication result
 */
export interface AuthSuccess {
  success: true;
  user: AuthUser;
}

/**
 * Failed authentication result
 */
export interface AuthError {
  success: false;
  error: string;
  status: number;
  code?: 'TOKEN_EXPIRED' | 'TOKEN_REVOKED' | 'TOKEN_INVALID' | 'UNAUTHORIZED';
}

/**
 * Union type for authentication results
 * Uses discriminated union pattern for type-safe error handling
 */
export type AuthResult = AuthSuccess | AuthError;

/**
 * Result type for vendor ownership checks
 */
export interface VendorOwnershipSuccess extends AuthSuccess {
  vendor: {
    id: string;
    user: string;
    [key: string]: unknown;
  };
}

export type VendorOwnershipResult = VendorOwnershipSuccess | AuthError;
