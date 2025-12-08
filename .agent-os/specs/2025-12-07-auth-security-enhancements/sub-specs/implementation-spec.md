# Implementation Specification

> Parent Spec: @.agent-os/specs/2025-12-07-auth-security-enhancements/spec.md

## Implementation Order

Execute in this order to minimize breaking changes and enable incremental testing:

### Phase 1: Token Infrastructure (No Breaking Changes)

1. **Add jti generation** - Immediate benefit, no impact on existing tokens
2. **Add type claims** - Backward compatible, verification optional initially
3. **Add separate secrets with fallback** - Existing tokens continue to work

### Phase 2: Token Versioning

4. **Add tokenVersion to Users** - Database field, defaults to 0
5. **Include tokenVersion in JWT payload** - New tokens include it
6. **Add tokenVersion verification** - Validates against database

### Phase 3: Refresh Token Rotation

7. **Update refresh endpoint** - Return both tokens
8. **Update AuthContext** - Handle new refresh token cookie

### Phase 4: Audit Logging

9. **Create AuditLogs collection** - Schema and access rules
10. **Create audit-service** - Logging functions
11. **Integrate with auth routes** - Log all events

### Phase 5: Middleware & Consolidation

12. **Enable HSTS** - Simple conditional
13. **Validate tokens in middleware** - Decode and verify
14. **Create unified auth module** - New consolidated API
15. **Migrate API routes** - Use new auth module

---

## Detailed Implementation

### 1. JWT Token Enhancements (`lib/utils/jwt.ts`)

```typescript
import jwt from 'jsonwebtoken';

// Separate secrets with backward-compatible fallbacks
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.PAYLOAD_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ||
  (process.env.PAYLOAD_SECRET + '_refresh');

// Validate secrets exist
if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is required');
}

const JWT_ACCESS_EXPIRY = '1h';
const JWT_REFRESH_EXPIRY = '7d';

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'vendor';
  tier?: 'free' | 'tier1' | 'tier2';
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  tokenVersion: number;  // NEW: For revocation
  type: 'access' | 'refresh';  // NEW: Token type
  jti: string;  // NEW: Unique token ID
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh JWT tokens with enhanced security
 */
export function generateTokens(payload: Omit<JWTPayload, 'type' | 'jti'>): TokenPair {
  const accessJti = crypto.randomUUID();
  const refreshJti = crypto.randomUUID();

  const accessToken = jwt.sign(
    { ...payload, type: 'access', jti: accessJti },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh', jti: refreshJti },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;

    // Verify token type to prevent confusion attacks
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Generate new token pair from valid refresh token (rotation)
 */
export function rotateTokens(refreshToken: string): TokenPair {
  const payload = verifyRefreshToken(refreshToken);

  // Generate completely new token pair
  return generateTokens({
    id: payload.id,
    email: payload.email,
    role: payload.role,
    tier: payload.tier,
    status: payload.status,
    tokenVersion: payload.tokenVersion,
  });
}

/**
 * Decode token without verification (for debugging/logging only)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
```

### 2. Users Collection Enhancement (`payload/collections/Users.ts`)

Add tokenVersion field:

```typescript
{
  name: 'tokenVersion',
  type: 'number',
  defaultValue: 0,
  admin: {
    position: 'sidebar',
    description: 'Incremented to invalidate all existing tokens',
    readOnly: true,
  },
  access: {
    update: () => false, // Only updated via hooks
  },
}
```

Add beforeChange hook for password changes:

```typescript
hooks: {
  beforeChange: [
    async ({ data, originalDoc, operation }) => {
      // Increment tokenVersion on password change
      if (operation === 'update' && data.password && originalDoc) {
        data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
      }

      // Increment tokenVersion on status change to suspended/rejected
      if (operation === 'update' && originalDoc) {
        const statusChanged = data.status !== originalDoc.status;
        const newStatusRevokes = ['suspended', 'rejected'].includes(data.status);

        if (statusChanged && newStatusRevokes) {
          data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
        }
      }

      return data;
    },
  ],
}
```

### 3. AuditLogs Collection (`payload/collections/AuditLogs.ts`)

```typescript
import { CollectionConfig } from 'payload';

export const AuditLogs: CollectionConfig = {
  slug: 'audit_logs',
  admin: {
    useAsTitle: 'event',
    description: 'Authentication audit trail',
    defaultColumns: ['event', 'email', 'ipAddress', 'timestamp'],
    group: 'System',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: () => false, // Server-only via local API
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'event',
      type: 'select',
      required: true,
      options: [
        { label: 'Login Success', value: 'LOGIN_SUCCESS' },
        { label: 'Login Failed', value: 'LOGIN_FAILED' },
        { label: 'Logout', value: 'LOGOUT' },
        { label: 'Token Refresh', value: 'TOKEN_REFRESH' },
        { label: 'Token Refresh Failed', value: 'TOKEN_REFRESH_FAILED' },
        { label: 'Password Changed', value: 'PASSWORD_CHANGED' },
        { label: 'Account Suspended', value: 'ACCOUNT_SUSPENDED' },
        { label: 'Account Approved', value: 'ACCOUNT_APPROVED' },
        { label: 'Account Rejected', value: 'ACCOUNT_REJECTED' },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      admin: {
        description: 'Preserved for audit history if user deleted',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'tokenId',
      type: 'text',
      admin: {
        description: 'JWT jti claim for token tracking',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional event context',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd HH:mm:ss',
        },
      },
    },
  ],
  timestamps: false, // We use our own timestamp field
};
```

### 4. Audit Service (`lib/services/audit-service.ts`)

```typescript
import { getPayload } from 'payload';
import config from '@/payload.config';
import { NextRequest } from 'next/server';

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
 * Extract client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

/**
 * Log authentication event to audit trail
 *
 * Best-effort logging - failures are logged but don't block operations
 */
export async function logAuditEvent(
  entry: AuditLogEntry,
  request?: NextRequest
): Promise<void> {
  try {
    const payload = await getPayload({ config });

    await payload.create({
      collection: 'audit_logs',
      data: {
        event: entry.event,
        user: entry.userId || null,
        email: entry.email,
        ipAddress: request ? getClientIp(request) : entry.ipAddress,
        userAgent: request?.headers.get('user-agent') || entry.userAgent,
        tokenId: entry.tokenId,
        metadata: entry.metadata,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not block operations
    console.error('[AuditService] Failed to log event:', {
      event: entry.event,
      email: entry.email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Helper to log successful login
 */
export async function logLoginSuccess(
  userId: string,
  email: string,
  tokenId: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent({
    event: 'LOGIN_SUCCESS',
    userId,
    email,
    tokenId,
  }, request);
}

/**
 * Helper to log failed login
 */
export async function logLoginFailed(
  email: string,
  reason: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent({
    event: 'LOGIN_FAILED',
    email,
    metadata: { reason },
  }, request);
}

/**
 * Helper to log logout
 */
export async function logLogout(
  userId: string,
  email: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent({
    event: 'LOGOUT',
    userId,
    email,
  }, request);
}

/**
 * Helper to log token refresh
 */
export async function logTokenRefresh(
  userId: string,
  email: string,
  newTokenId: string,
  request: NextRequest
): Promise<void> {
  await logAuditEvent({
    event: 'TOKEN_REFRESH',
    userId,
    email,
    tokenId: newTokenId,
  }, request);
}
```

### 5. Unified Auth Module (`lib/auth/index.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { verifyAccessToken, JWTPayload, decodeToken } from '@/lib/utils/jwt';

export type { JWTPayload } from '@/lib/utils/jwt';

export interface AuthResult {
  success: true;
  user: JWTPayload;
} | {
  success: false;
  error: string;
  status: 401 | 403;
};

/**
 * Extract token from request (header or cookie)
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return request.cookies.get('access_token')?.value || null;
}

/**
 * Validate token and verify tokenVersion against database
 */
export async function validateToken(request: NextRequest): Promise<AuthResult> {
  const token = extractToken(request);

  if (!token) {
    return { success: false, error: 'Authentication required', status: 401 };
  }

  try {
    const payload = verifyAccessToken(token);

    // Verify tokenVersion against database
    const payloadCms = await getPayload({ config });
    const user = await payloadCms.findByID({
      collection: 'users',
      id: payload.id,
    });

    if (!user) {
      return { success: false, error: 'User not found', status: 401 };
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return { success: false, error: 'Token revoked', status: 401 };
    }

    return { success: true, user: payload };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return { success: false, error: message, status: 401 };
  }
}

/**
 * Require authenticated user
 */
export async function requireAuth(request: NextRequest): Promise<
  NextResponse | { user: JWTPayload }
> {
  const result = await validateToken(request);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return { user: result.user };
}

/**
 * Require specific role(s)
 */
export function requireRole(allowedRoles: Array<'admin' | 'vendor'>) {
  return async (request: NextRequest): Promise<
    NextResponse | { user: JWTPayload }
  > => {
    const result = await validateToken(request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    if (!allowedRoles.includes(result.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return { user: result.user };
  };
}

/**
 * Require admin role
 */
export async function requireAdmin(request: NextRequest): Promise<
  NextResponse | { user: JWTPayload }
> {
  return requireRole(['admin'])(request);
}

/**
 * Require vendor ownership of resource
 */
export async function requireVendorOwnership(
  request: NextRequest,
  vendorId: string
): Promise<NextResponse | { user: JWTPayload; vendor: unknown }> {
  const result = await validateToken(request);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  // Admins can access any vendor
  if (result.user.role === 'admin') {
    const payloadCms = await getPayload({ config });
    const vendor = await payloadCms.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return { user: result.user, vendor };
  }

  // Vendors can only access their own profile
  const payloadCms = await getPayload({ config });
  const vendor = await payloadCms.findByID({
    collection: 'vendors',
    id: vendorId,
  });

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor not found' },
      { status: 404 }
    );
  }

  const vendorUserId = typeof vendor.user === 'object' && vendor.user !== null
    ? (vendor.user as { id: string }).id
    : vendor.user;

  if (vendorUserId?.toString() !== result.user.id.toString()) {
    return NextResponse.json(
      { error: 'Cannot access another vendor account' },
      { status: 403 }
    );
  }

  return { user: result.user, vendor };
}

/**
 * Type guard: check if result is a NextResponse (error)
 */
export function isAuthError(
  result: NextResponse | { user: JWTPayload } | { user: JWTPayload; vendor: unknown }
): result is NextResponse {
  return result instanceof NextResponse;
}
```

### 6. Middleware Enhancement (`middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Lightweight token verification for middleware (no database call)
function verifyTokenLightweight(token: string): boolean {
  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.PAYLOAD_SECRET;
    if (!secret) return false;

    const payload = jwt.verify(token, secret) as { type?: string; exp?: number };

    // Verify it's an access token
    if (payload.type && payload.type !== 'access') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vendor dashboard routes - require valid token
  if (pathname.startsWith('/vendor/dashboard')) {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      const loginUrl = new URL('/vendor/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate token signature (not just existence)
    if (!verifyTokenLightweight(token)) {
      const loginUrl = new URL('/vendor/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_expired');

      // Clear invalid token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    return NextResponse.next();
  }

  // Custom API routes - apply security headers
  const isCustomApiRoute = pathname.startsWith('/api/portal') ||
                           pathname.startsWith('/api/geocode') ||
                           pathname.startsWith('/api/contact');

  if (isCustomApiRoute) {
    const response = NextResponse.next();

    // CSP and other security headers
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', cspDirectives);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // HSTS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/vendor/dashboard/:path*',
    '/api/portal/:path*',
    '/api/geocode/:path*',
    '/api/contact/:path*',
  ],
};
```

---

## Environment Variables

Add to `.env.example`:

```bash
# JWT Secrets (Optional - will derive from PAYLOAD_SECRET if not set)
# For maximum security, set separate secrets in production
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
```

## Backward Compatibility Notes

1. **Existing tokens continue to work** - Old tokens without `tokenVersion` or `type` claims will fail validation after implementation. Recommend deploying during low-traffic period.

2. **Force logout on deploy** - Consider clearing all cookies on first deploy to ensure clean state.

3. **Old auth utilities** - Keep as re-exports for gradual migration:

```typescript
// lib/middleware/auth-middleware.ts
export * from '@/lib/auth';
console.warn('[DEPRECATED] Import from @/lib/auth instead of auth-middleware');
```
