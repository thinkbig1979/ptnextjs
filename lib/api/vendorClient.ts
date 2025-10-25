/**
 * Vendor API Client
 *
 * Type-safe API client functions for vendor endpoints.
 * Provides request/response interfaces and error handling.
 */

import { Vendor } from '@/lib/types';

/**
 * API Response Types
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    details?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Vendor API Response Types
 */
export interface VendorGetResponse {
  success: true;
  data: Vendor;
}

export interface VendorUpdateResponse {
  success: true;
  data: {
    vendor: Vendor;
    message: string;
  };
}

/**
 * Error class for API errors
 */
export class VendorApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public fields?: Record<string, string>,
    public details?: string
  ) {
    super(message);
    this.name = 'VendorApiError';
  }
}

/**
 * Fetch vendor profile by ID
 *
 * @param vendorId - Vendor ID
 * @param options - Fetch options
 * @returns Vendor data
 * @throws VendorApiError
 */
export async function fetchVendor(
  vendorId: string,
  options?: RequestInit
): Promise<Vendor> {
  const response = await fetch(`/api/portal/vendors/${vendorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new VendorApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Failed to fetch vendor',
      data.error?.fields,
      data.error?.details
    );
  }

  return data.data as Vendor;
}

/**
 * Update vendor profile
 *
 * @param vendorId - Vendor ID
 * @param updates - Partial vendor data to update
 * @param options - Fetch options
 * @returns Updated vendor data
 * @throws VendorApiError
 */
export async function updateVendor(
  vendorId: string,
  updates: Partial<Vendor>,
  options?: RequestInit
): Promise<Vendor> {
  const response = await fetch(`/api/portal/vendors/${vendorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    body: JSON.stringify(updates),
    ...options,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new VendorApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Failed to update vendor',
      data.error?.fields,
      data.error?.details
    );
  }

  return data.data.vendor as Vendor;
}

/**
 * Partial update vendor profile (PATCH)
 *
 * @param vendorId - Vendor ID
 * @param updates - Partial vendor data to update
 * @param options - Fetch options
 * @returns Updated vendor data
 * @throws VendorApiError
 */
export async function patchVendor(
  vendorId: string,
  updates: Partial<Vendor>,
  options?: RequestInit
): Promise<Vendor> {
  const response = await fetch(`/api/portal/vendors/${vendorId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    body: JSON.stringify(updates),
    ...options,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new VendorApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Failed to patch vendor',
      data.error?.fields,
      data.error?.details
    );
  }

  return data.data.vendor as Vendor;
}

/**
 * Fetch vendor profile for public display
 *
 * @param slug - Vendor slug
 * @param options - Fetch options
 * @returns Vendor data
 * @throws VendorApiError
 */
export async function fetchVendorBySlug(
  slug: string,
  options?: RequestInit
): Promise<Vendor> {
  const response = await fetch(`/api/vendors/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new VendorApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Failed to fetch vendor',
      data.error?.fields,
      data.error?.details
    );
  }

  return data.data as Vendor;
}

/**
 * Upload vendor logo
 *
 * @param vendorId - Vendor ID
 * @param file - Image file
 * @param options - Fetch options
 * @returns Logo URL
 * @throws VendorApiError
 */
export async function uploadVendorLogo(
  vendorId: string,
  file: File,
  options?: RequestInit
): Promise<string> {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`/api/portal/vendors/${vendorId}/logo`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    ...options,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new VendorApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Failed to upload logo',
      data.error?.fields,
      data.error?.details
    );
  }

  return data.data.logoUrl as string;
}

/**
 * Delete vendor logo
 *
 * @param vendorId - Vendor ID
 * @param options - Fetch options
 * @returns Success message
 * @throws VendorApiError
 */
export async function deleteVendorLogo(
  vendorId: string,
  options?: RequestInit
): Promise<string> {
  const response = await fetch(`/api/portal/vendors/${vendorId}/logo`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new VendorApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Failed to delete logo',
      data.error?.fields,
      data.error?.details
    );
  }

  return data.data.message as string;
}

/**
 * Check if API error is a specific error code
 *
 * @param error - Error object
 * @param code - Error code to check
 * @returns Boolean
 */
export function isApiError(error: unknown, code?: string): error is VendorApiError {
  if (!(error instanceof VendorApiError)) return false;
  if (!code) return true;
  return error.code === code;
}

/**
 * Get user-friendly error message from API error
 *
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof VendorApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Get field-specific error messages from API error
 *
 * @param error - Error object
 * @returns Field error map
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof VendorApiError && error.fields) {
    return error.fields;
  }
  return {};
}

/**
 * Check if error is an authentication error
 *
 * @param error - Error object
 * @returns Boolean
 */
export function isAuthError(error: unknown): boolean {
  return isApiError(error, 'UNAUTHORIZED') || isApiError(error, 'FORBIDDEN');
}

/**
 * Check if error is a validation error
 *
 * @param error - Error object
 * @returns Boolean
 */
export function isValidationError(error: unknown): boolean {
  return isApiError(error, 'VALIDATION_ERROR');
}

/**
 * Check if error is a tier restriction error
 *
 * @param error - Error object
 * @returns Boolean
 */
export function isTierError(error: unknown): boolean {
  return isApiError(error, 'TIER_PERMISSION_DENIED');
}
