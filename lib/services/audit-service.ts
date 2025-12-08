/**
 * Audit Service
 * Provides logging functions for authentication events.
 *
 * IMPORTANT: All logging is best-effort - failures are logged but never throw.
 * This ensures audit logging never blocks authentication operations.
 */

import { getPayload } from 'payload';
import config from '@/payload.config';
import type { NextRequest } from 'next/server';

/**
 * Audit event types for authentication tracking
 */
export type AuditEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'TOKEN_REFRESH_FAILED'
  | 'PASSWORD_CHANGED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_APPROVED'
  | 'ACCOUNT_REJECTED';

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  event: AuditEvent;
  userId?: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  tokenId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Extract client IP address from request headers
 *
 * Priority:
 * 1. x-forwarded-for (first IP, commonly set by proxies/load balancers)
 * 2. x-real-ip (alternative proxy header)
 * 3. undefined if no IP headers present
 */
export function getClientIp(request: NextRequest): string | undefined {
  // Try x-forwarded-for first (may contain multiple IPs)
  const forwarded_for = request.headers.get('x-forwarded-for');
  if (forwarded_for) {
    // Take the first IP (client IP before proxies)
    const first_ip = forwarded_for.split(',')[0].trim();
    if (first_ip) {
      return first_ip;
    }
  }

  // Fall back to x-real-ip
  const real_ip = request.headers.get('x-real-ip');
  if (real_ip) {
    return real_ip.trim();
  }

  return undefined;
}

/**
 * Core function to log an audit event
 *
 * This is a best-effort operation - errors are logged but never thrown.
 *
 * @param entry - The audit log entry to record
 * @param request - Optional request object to extract IP and user agent
 */
export async function logAuditEvent(
  entry: AuditLogEntry,
  request?: NextRequest
): Promise<void> {
  try {
    const payload = await getPayload({ config });

    // Extract request context if available
    const ip_address = request ? getClientIp(request) : undefined;
    const user_agent = request
      ? request.headers.get('user-agent') || undefined
      : undefined;

    // Create the audit log entry
    await payload.create({
      collection: 'audit-logs',
      data: {
        event: entry.event,
        userId: entry.userId,
        email: entry.email,
        ipAddress: ip_address,
        userAgent: user_agent,
        metadata: entry.metadata,
      },
    });
  } catch (error) {
    // Best-effort: log error but don't throw
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log a successful login event
 *
 * @param user_id - The authenticated user's ID
 * @param email - The user's email address
 * @param token_id - The JTI of the newly issued access token
 * @param request - The HTTP request for context
 */
export async function logLoginSuccess(
  user_id: string,
  email: string,
  token_id: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent(
    {
      event: 'LOGIN_SUCCESS',
      userId: user_id,
      email,
      metadata: { tokenId: token_id },
    },
    request
  );
}

/**
 * Log a failed login attempt
 *
 * @param email - The attempted email address
 * @param reason - The reason for failure (e.g., "Invalid password", "User not found")
 * @param request - The HTTP request for context
 */
export async function logLoginFailed(
  email: string,
  reason: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent(
    {
      event: 'LOGIN_FAILED',
      email,
      metadata: { reason },
    },
    request
  );
}

/**
 * Log a user logout event
 *
 * @param user_id - The user's ID
 * @param email - The user's email address
 * @param request - The HTTP request for context
 */
export async function logLogout(
  user_id: string,
  email: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent(
    {
      event: 'LOGOUT',
      userId: user_id,
      email,
    },
    request
  );
}

/**
 * Log a token refresh event
 *
 * @param user_id - The user's ID
 * @param email - The user's email address
 * @param new_token_id - The JTI of the newly issued token
 * @param request - The HTTP request for context
 */
export async function logTokenRefresh(
  user_id: string,
  email: string,
  new_token_id: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent(
    {
      event: 'TOKEN_REFRESH',
      userId: user_id,
      email,
      metadata: { tokenId: new_token_id },
    },
    request
  );
}

/**
 * Log a failed token refresh attempt
 *
 * @param email - The user's email (if known)
 * @param reason - The reason for failure
 * @param request - The HTTP request for context
 */
export async function logTokenRefreshFailed(
  email: string,
  reason: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent(
    {
      event: 'TOKEN_REFRESH_FAILED',
      email,
      metadata: { reason },
    },
    request
  );
}

/**
 * Log a password change event
 *
 * This should be called from the Users collection afterChange hook.
 *
 * @param user_id - The user's ID
 * @param email - The user's email address
 * @param request - Optional request object (may not be available in hooks)
 */
export async function logPasswordChanged(
  user_id: string,
  email: string,
  request?: NextRequest
): Promise<void> {
  await logAuditEvent(
    {
      event: 'PASSWORD_CHANGED',
      userId: user_id,
      email,
    },
    request
  );
}

/**
 * Log an account status change event
 *
 * This logs events like ACCOUNT_SUSPENDED, ACCOUNT_APPROVED, ACCOUNT_REJECTED.
 *
 * @param user_id - The user's ID
 * @param email - The user's email address
 * @param new_status - The new account status
 * @param admin_id - Optional ID of the admin who made the change
 * @param reason - Optional reason for the status change
 * @param request - Optional request object
 */
export async function logAccountStatusChange(
  user_id: string,
  email: string,
  new_status: 'suspended' | 'approved' | 'rejected',
  admin_id?: string,
  reason?: string,
  request?: NextRequest
): Promise<void> {
  const event_map: Record<string, AuditEvent> = {
    suspended: 'ACCOUNT_SUSPENDED',
    approved: 'ACCOUNT_APPROVED',
    rejected: 'ACCOUNT_REJECTED',
  };

  const event = event_map[new_status];
  if (!event) {
    console.error(`Unknown account status: ${new_status}`);
    return;
  }

  const metadata: Record<string, unknown> = {};
  if (admin_id) {
    metadata.adminId = admin_id;
  }
  if (reason) {
    metadata.reason = reason;
  }

  await logAuditEvent(
    {
      event,
      userId: user_id,
      email,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    },
    request
  );
}

// Export the audit service as a namespace-like object for consistency
export const auditService = {
  getClientIp,
  logAuditEvent,
  logLoginSuccess,
  logLoginFailed,
  logLogout,
  logTokenRefresh,
  logTokenRefreshFailed,
  logPasswordChanged,
  logAccountStatusChange,
};

export default auditService;
