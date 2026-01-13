/**
 * Centralized API Endpoint Definitions
 *
 * This file defines all API endpoints in a type-safe manner.
 * Use these constants instead of hardcoding API paths.
 *
 * Example usage:
 * ```ts
 * import { API_ENDPOINTS } from '@/lib/api/endpoints';
 * fetch(API_ENDPOINTS.auth.login, { method: 'POST', ... });
 * fetch(API_ENDPOINTS.vendors.byId('vendor-123'), { method: 'GET', ... });
 * ```
 */

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
  refresh: '/api/auth/refresh',
} as const;

/**
 * Vendor portal endpoints (authenticated vendor access)
 */
export const VENDOR_PORTAL_ENDPOINTS = {
  profile: '/api/portal/vendors/profile',
  register: '/api/portal/vendors/register',
  byId: (vendorId: string) => `/api/portal/vendors/${vendorId}` as const,
  logo: (vendorId: string) => `/api/portal/vendors/${vendorId}/logo` as const,
  excelTemplate: (vendorId: string) =>
    `/api/portal/vendors/${vendorId}/excel-template` as const,
  tierUpgradeRequest: (vendorId: string) =>
    `/api/portal/vendors/${vendorId}/tier-upgrade-request` as const,
  tierDowngradeRequest: (vendorId: string) =>
    `/api/portal/vendors/${vendorId}/tier-downgrade-request` as const,
} as const;

/**
 * Public vendor endpoints (no authentication required)
 */
export const VENDOR_PUBLIC_ENDPOINTS = {
  list: '/api/public/vendors',
  byId: (id: string) => `/api/public/vendors/${id}` as const,
  bySlug: (slug: string) => `/api/public/vendors/${slug}` as const,
  reviews: (vendorSlug: string) =>
    `/api/public/vendors/${vendorSlug}/reviews` as const,
} as const;

/**
 * Admin endpoints (admin authentication required)
 */
export const ADMIN_ENDPOINTS = {
  vendors: {
    pending: '/api/admin/vendors/pending',
    approve: (userId: string) => `/api/admin/vendors/${userId}/approve` as const,
    reject: (userId: string) => `/api/admin/vendors/${userId}/reject` as const,
    tier: (vendorId: string) => `/api/admin/vendors/${vendorId}/tier` as const,
  },
  tierRequests: {
    list: '/api/admin/tier-upgrade-requests',
    approve: (requestId: string) =>
      `/api/admin/tier-upgrade-requests/${requestId}/approve` as const,
    reject: (requestId: string) =>
      `/api/admin/tier-upgrade-requests/${requestId}/reject` as const,
  },
} as const;

/**
 * Product endpoints (public)
 */
export const PRODUCT_ENDPOINTS = {
  list: '/api/public/products',
  byId: (productId: string) => `/api/public/products/${productId}` as const,
  reviews: (productId: string) => `/api/public/products/${productId}/reviews` as const,
} as const;

/**
 * Blog endpoints (public)
 */
export const BLOG_ENDPOINTS = {
  list: '/api/public/blog',
} as const;

/**
 * Notification endpoints
 */
export const NOTIFICATION_ENDPOINTS = {
  list: '/api/notifications',
  read: (notificationId: string) =>
    `/api/notifications/${notificationId}/read` as const,
  markAllRead: '/api/notifications/mark-all-read',
} as const;

/**
 * Utility endpoints
 */
export const UTILITY_ENDPOINTS = {
  geocode: '/api/geocode',
  usersLogout: '/api/users/logout',
} as const;

/**
 * Combined API endpoints object for convenience
 */
export const API_ENDPOINTS = {
  auth: AUTH_ENDPOINTS,
  portal: VENDOR_PORTAL_ENDPOINTS,
  public: VENDOR_PUBLIC_ENDPOINTS,
  admin: ADMIN_ENDPOINTS,
  products: PRODUCT_ENDPOINTS,
  blog: BLOG_ENDPOINTS,
  notifications: NOTIFICATION_ENDPOINTS,
  utility: UTILITY_ENDPOINTS,
} as const;

/**
 * Type helpers for endpoint return types
 */
export type AuthEndpoint = (typeof AUTH_ENDPOINTS)[keyof typeof AUTH_ENDPOINTS];

// Helper type to extract return type from functions or use the value directly
type EndpointValue<T> = T extends (...args: unknown[]) => infer R ? R : T;

export type VendorPortalEndpoint = EndpointValue<
  (typeof VENDOR_PORTAL_ENDPOINTS)[keyof typeof VENDOR_PORTAL_ENDPOINTS]
>;
export type VendorPublicEndpoint = EndpointValue<
  (typeof VENDOR_PUBLIC_ENDPOINTS)[keyof typeof VENDOR_PUBLIC_ENDPOINTS]
>;
