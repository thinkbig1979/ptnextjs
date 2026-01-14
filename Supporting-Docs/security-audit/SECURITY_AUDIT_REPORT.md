# Comprehensive Security Audit Report

**Application:** Paul Thames Superyacht Technology
**Date:** 2026-01-14
**Auditor:** Claude Opus 4.5 (Automated Security Assessment)
**Scope:** Full application security review

---

## Executive Summary

This security audit evaluated the Paul Thames Superyacht Technology application built on Next.js 15 and Payload CMS 3.x. The application demonstrates **generally good security practices** with several areas requiring attention.

### Overall Risk Assessment: **MEDIUM**

| Category | Rating | Score |
|----------|--------|-------|
| Authentication & Authorization | Good | 8/10 |
| Input Validation | Good | 8/10 |
| Rate Limiting | Good | 8/10 |
| Security Headers | Good | 8/10 |
| Encryption & Secrets | Good | 8/10 |
| File Upload Security | Needs Improvement | 5/10 |
| XSS Prevention | Needs Improvement | 6/10 |
| Dependency Security | Needs Improvement | 6/10 |

---

## Critical Findings

### 1. CRITICAL: Unauthenticated Media Upload Endpoint

**File:** `app/api/media/upload/route.ts:8-74`
**Severity:** CRITICAL
**CVSS Score:** 8.1 (High)

**Issue:** The `/api/media/upload` endpoint allows file uploads without any authentication check. Any anonymous user can upload files to the server.

```typescript
// Current code - NO AUTHENTICATION CHECK
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    // ... uploads directly without auth
```

**Impact:**
- Malicious actors can upload arbitrary files
- Potential for disk space exhaustion attacks
- Risk of hosting malicious content on your domain
- Storage cost attacks

**Recommendation:**
```typescript
import { validateToken } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Add authentication
  const auth = await validateToken(request);
  if (!auth.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of upload logic
}
```

---

### 2. HIGH: XSS Vulnerability via dangerouslySetInnerHTML

**Files:**
- `components/vendors/VendorAboutSection.tsx:66`
- `app/(site)/blog/[slug]/page.tsx:141`
- `app/(site)/yachts/[slug]/page.tsx:64`
- `components/yacht-profiles/YachtCard.tsx:99`

**Severity:** HIGH
**CVSS Score:** 6.1 (Medium)

**Issue:** CMS content is rendered using `dangerouslySetInnerHTML` without sanitization.

```tsx
<div dangerouslySetInnerHTML={{ __html: vendor.longDescription }} />
```

**Impact:**
- If admin credentials are compromised, attackers can inject malicious scripts
- Stored XSS attacks affecting all users viewing the content
- Session hijacking, credential theft, defacement

**Recommendation:**
```typescript
import DOMPurify from 'dompurify';

// Server-side sanitization (preferred)
const sanitizedContent = DOMPurify.sanitize(vendor.longDescription, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: ['href', 'target', 'rel']
});

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

---

### 3. HIGH: Dependency Vulnerabilities

**Severity:** HIGH

**Current Vulnerabilities (npm audit):**

| Package | Severity | Issue |
|---------|----------|-------|
| `preact` 10.27.0-10.27.2 | HIGH | JSON VNode Injection (GHSA-36hm-qxxp-pg3m) |
| `qs` <6.14.1 | HIGH | DoS via arrayLimit bypass (GHSA-6rw7-vpxm-498p) |

**Recommendation:**
```bash
npm update preact qs
# Or add to package.json overrides if transitive dependency
```

---

## Medium Findings

### 4. MEDIUM: Test Endpoints Accessible in E2E Mode

**Files:**
- `app/api/test/vendors/seed/route.ts`
- `app/api/test/rate-limit/clear/route.ts`

**Issue:** Test endpoints are protected by `NODE_ENV` check but can be enabled via `E2E_TEST=true` environment variable, which if misconfigured in production could expose dangerous functionality.

```typescript
const isE2ETest = process.env.E2E_TEST === 'true';
if (process.env.NODE_ENV === 'production' && !isE2ETest) {
  return NextResponse.json({ error: 'Not available' }, { status: 403 });
}
```

**Recommendation:**
- Ensure `E2E_TEST` is NEVER set in production environments
- Consider requiring an additional secret key for test endpoints
- Add deployment checks to verify test flags are disabled

---

### 5. MEDIUM: Review Submission Without Rate Limiting

**File:** `app/api/public/vendors/[slug]/reviews/route.ts`

**Issue:** The review submission endpoint relies only on CAPTCHA for abuse prevention, without rate limiting.

**Impact:**
- Potential spam reviews even with CAPTCHA bypass techniques
- DoS through excessive review submissions

**Recommendation:**
```typescript
import { rateLimit } from '@/lib/middleware/rateLimit';

const REVIEW_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour per IP
  identifier: '/api/public/vendors/reviews',
};

export async function POST(request: NextRequest, ...): Promise<NextResponse> {
  return rateLimit(request, async () => {
    // existing logic
  }, REVIEW_RATE_LIMIT);
}
```

---

### 6. MEDIUM: Potential JWT Secret Weakness in Development

**File:** `lib/utils/jwt.ts:13-14`

**Issue:** Refresh token secret derives from access secret if not explicitly set.

```typescript
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ||
  (process.env.PAYLOAD_SECRET + '_refresh');
```

**Recommendation:**
- Always configure separate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in production
- Add startup validation to require separate secrets in production

---

## Good Security Practices Identified

### 1. Authentication System (lib/auth/index.ts, lib/utils/jwt.ts)
- Separate access and refresh token secrets
- Token version tracking for revocation
- Proper JWT verification using `jsonwebtoken` library
- httpOnly cookies for token storage
- Secure cookie attributes (sameSite: strict, secure in production)

### 2. Password Security (lib/services/auth-service.ts)
- bcrypt with 12 rounds
- Strong password policy (12+ chars, complexity requirements)
- No plaintext password storage

### 3. Rate Limiting (lib/middleware/rateLimit.ts)
- In-memory rate limiter with configurable windows
- Per-endpoint limits (login: 5/15min, register: 3/hour)
- Automatic cleanup to prevent memory leaks
- Proper rate limit headers in responses

### 4. Security Headers (middleware.ts:97-136)
- Content-Security-Policy with frame-ancestors
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- HSTS in production
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restrictions

### 5. Input Validation
- Zod schemas for request validation (vendor registration, updates)
- Payload CMS field-level validation
- Type-safe validation with proper error messages

### 6. CAPTCHA Protection (lib/utils/hcaptcha.ts)
- hCaptcha integration for registration and reviews
- Server-side token verification
- Proper error handling

### 7. Authorization Controls (payload/collections/Users.ts, Vendors.ts)
- Role-based access control (admin, vendor)
- Field-level access restrictions
- Tier-based feature gating
- Proper ownership checks for vendor data

### 8. Audit Logging (lib/services/audit-service.ts)
- Login success/failure logging
- Token refresh logging
- Account status change tracking
- Password change auditing

### 9. CSRF Protection (payload.config.ts:162-166)
- CSRF token validation for Payload CMS routes
- Origin whitelist configuration

### 10. Secrets Management
- PAYLOAD_SECRET validation at startup
- Minimum length enforcement (32 chars)
- Environment variable-based configuration
- No hardcoded secrets in code

---

## Recommendations Summary

### Immediate Actions (Critical/High)

1. **Add authentication to media upload endpoint** - Prevent anonymous uploads
2. **Sanitize HTML content before rendering** - Install and use DOMPurify
3. **Update vulnerable dependencies** - Run `npm update` for preact and qs

### Short-term Actions (Medium)

4. **Add rate limiting to review endpoint** - Prevent spam
5. **Enforce separate JWT secrets in production** - Add startup validation
6. **Review test endpoint security** - Consider additional protection

### Long-term Improvements

7. **Implement CSP reporting** - Add report-uri directive
8. **Add security monitoring** - Integrate with SIEM or log aggregation
9. **Consider WAF deployment** - Additional protection layer
10. **Regular dependency audits** - Automate with Dependabot or Snyk

---

## Compliance Notes

### OWASP Top 10 Coverage

| Risk | Status | Notes |
|------|--------|-------|
| A01:2021 Broken Access Control | Needs Work | Media upload lacks auth |
| A02:2021 Cryptographic Failures | Good | Proper encryption, bcrypt |
| A03:2021 Injection | Good | ORM usage, parameterized queries |
| A04:2021 Insecure Design | Good | Rate limiting, CAPTCHA |
| A05:2021 Security Misconfiguration | Good | Headers configured |
| A06:2021 Vulnerable Components | Needs Work | 2 HIGH vulnerabilities |
| A07:2021 Auth Failures | Good | Strong auth implementation |
| A08:2021 Data Integrity Failures | Good | JWT verification |
| A09:2021 Security Logging | Good | Audit logging implemented |
| A10:2021 SSRF | N/A | No identified SSRF vectors |

---

## Appendix: Files Reviewed

### Core Security Files
- `payload.config.ts` - CMS configuration
- `middleware.ts` - Security headers, auth middleware
- `lib/auth/index.ts` - Token validation
- `lib/utils/jwt.ts` - JWT implementation
- `lib/services/auth-service.ts` - Authentication service
- `lib/middleware/rateLimit.ts` - Rate limiting

### API Routes (Selected)
- `app/api/auth/*` - Authentication endpoints
- `app/api/portal/vendors/*` - Vendor management
- `app/api/admin/*` - Admin endpoints
- `app/api/media/upload/route.ts` - File uploads
- `app/api/public/*` - Public endpoints

### Collections
- `payload/collections/Users.ts`
- `payload/collections/Vendors.ts`
- `payload/collections/Media.ts`

### Configuration
- `package.json` - Dependencies
- `.env.example` - Environment template

---

*Report generated by automated security assessment. Manual penetration testing recommended for production deployment.*
