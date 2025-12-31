# Security Review

**Review Date:** 2025-12-31
**Reviewer:** Claude Opus 4.5 (Automated Security Analysis)
**Project:** Paul Thames Superyacht Technology Platform

## Summary

| Metric | Count |
|--------|-------|
| Files Reviewed | 25+ |
| Critical Issues | 0 |
| High Priority Issues | 2 |
| Medium Priority Issues | 4 |
| Low Priority Issues | 5 |
| Dependencies Audited | 2,025 |
| Dependency Vulnerabilities | 1 (High) |

**Overall Security Posture: GOOD**

The codebase demonstrates mature security practices with proper authentication, authorization, input validation, and security headers. However, there are some areas requiring attention.

---

## Critical Issues (Fix Immediately)

**None identified.**

The codebase does not contain any critical security vulnerabilities requiring immediate remediation.

---

## High Priority Issues

### H1. XSS Risk via dangerouslySetInnerHTML

**Location:** Multiple frontend components
**Severity:** HIGH
**OWASP Category:** A03:2021 - Injection

**Affected Files:**
- `/app/(site)/blog/[slug]/page.tsx` (line 141)
- `/components/vendors/VendorAboutSection.tsx` (line 66)
- `/app/(site)/yachts/[slug]/page.tsx`
- `/app/(site)/layout.tsx`

**Description:**
The application uses `dangerouslySetInnerHTML` to render CMS-sourced content. While the content comes from a trusted CMS (Payload), if an admin account is compromised or content is injected through another vector, this could lead to stored XSS attacks.

```tsx
// Example from blog/[slug]/page.tsx:
<div
  className="text-foreground leading-relaxed font-poppins-light"
  dangerouslySetInnerHTML={{ __html: post.content }}
/>
```

**Recommendation:**
1. Implement HTML sanitization using a library like DOMPurify before rendering
2. Configure Payload CMS's Lexical editor to restrict allowed HTML elements
3. Add Content Security Policy with stricter `script-src` directive

**Example Fix:**
```tsx
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
```

---

### H2. Dependency Vulnerability - qs Package

**Location:** `node_modules/qs`
**Severity:** HIGH (CVSS 7.5)
**CVE:** GHSA-6rw7-vpxm-498p

**Description:**
The `qs` package (< 6.14.1) has a vulnerability where arrayLimit bypass via bracket notation allows DoS through memory exhaustion.

**Current Status:**
```json
{
  "name": "qs",
  "severity": "high",
  "range": "<6.14.1",
  "fixAvailable": true
}
```

**Recommendation:**
1. Run `npm audit fix` to update qs to a patched version
2. If direct fix isn't possible, add to `package.json` overrides:
```json
"overrides": {
  "qs": ">=6.14.1"
}
```

---

## Medium Priority Issues

### M1. Test API Routes Available in Non-Production with E2E_TEST Flag

**Location:** `/app/api/test/**/*.ts`
**Severity:** MEDIUM
**OWASP Category:** A05:2021 - Security Misconfiguration

**Description:**
Test endpoints (vendor seeding, rate limit clearing) are protected by environment checks but can be enabled with `E2E_TEST=true`. If this flag is accidentally set in a production-like environment, these routes become available.

```typescript
// From /app/api/test/vendors/seed/route.ts
const isE2ETest = process.env.E2E_TEST === 'true';
if (process.env.NODE_ENV === 'production' && !isE2ETest) {
  return NextResponse.json({ success: false, error: '...' }, { status: 403 });
}
```

**Recommendation:**
1. Add additional safeguards for production environment detection
2. Consider IP-based whitelisting for test routes
3. Log all test route access attempts with alerts

---

### M2. CSP Contains 'unsafe-inline' and 'unsafe-eval'

**Location:** `/middleware.ts` (lines 97-107)
**Severity:** MEDIUM
**OWASP Category:** A03:2021 - Injection

**Description:**
The Content Security Policy includes `'unsafe-inline'` and `'unsafe-eval'` directives:

```typescript
const cspDirectives = [
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Risky
  "style-src 'self' 'unsafe-inline'", // Risky
  // ...
];
```

While necessary for Next.js functionality, this weakens XSS protection.

**Recommendation:**
1. Investigate using nonces for inline scripts with Next.js
2. Use styled-components or CSS modules to reduce need for inline styles
3. Document which features require these directives

---

### M3. In-Memory Rate Limiting Not Scalable

**Location:** `/lib/middleware/rateLimit.ts`
**Severity:** MEDIUM
**OWASP Category:** A05:2021 - Security Misconfiguration

**Description:**
Rate limiting uses an in-memory Map which:
- Doesn't persist across server restarts
- Doesn't work in serverless/multi-instance deployments
- Could be bypassed by attacking different server instances

```typescript
const rateLimitStore = new Map<string, RateLimitEntry>();
```

**Recommendation:**
1. For production, implement Redis-based rate limiting (e.g., `rate-limit-redis`)
2. Use edge rate limiting at CDN/WAF level
3. Document current limitation for deployment planning

---

### M4. Media Upload Missing Authentication

**Location:** `/app/api/media/upload/route.ts`
**Severity:** MEDIUM
**OWASP Category:** A01:2021 - Broken Access Control

**Description:**
The media upload endpoint validates file type and size but doesn't verify user authentication:

```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  // No auth check before processing upload
  const formData = await request.formData();
  // ...
}
```

**Recommendation:**
1. Add authentication requirement using `validateToken()` or `requireAuth()`
2. Implement authorization to verify upload permissions
3. Consider rate limiting media uploads per user

---

## Low Priority Issues

### L1. Hardcoded Default Credentials in .env.example

**Location:** `.env.example` (lines 82-83)
**Severity:** LOW

**Description:**
The example environment file contains a strong-looking but hardcoded admin password:

```
ADMIN_PASSWORD=Admin123!@#SecurePassword
```

While clearly a placeholder, developers might accidentally deploy with this.

**Recommendation:**
- Change to obviously fake value like `REPLACE_ME_BEFORE_PRODUCTION`
- Add validation at startup to reject common placeholder values

---

### L2. Console Logging of Sensitive Operations

**Location:** Multiple API routes
**Severity:** LOW

**Description:**
Authentication failures and user actions are logged with `console.log/error`:

```typescript
console.error('[AuthService] Login failed:', { email, error: ... });
```

In production, these could expose sensitive information in log aggregators.

**Recommendation:**
1. Implement structured logging with log levels
2. Sanitize sensitive data before logging
3. Use a proper logging service (e.g., Pino, Winston)

---

### L3. Token Expiry Configuration Not Externalized

**Location:** `/lib/utils/jwt.ts` (lines 16-17)
**Severity:** LOW

**Description:**
JWT expiry times are hardcoded:

```typescript
const JWT_ACCESS_EXPIRY = '1h';
const JWT_REFRESH_EXPIRY = '7d';
```

**Recommendation:**
- Move to environment variables for production flexibility
- Reference `JWT_ACCESS_TOKEN_EXPIRY` and `JWT_REFRESH_TOKEN_EXPIRY` from .env.example

---

### L4. Missing Rate Limiting on Some Sensitive Endpoints

**Location:** Various API routes
**Severity:** LOW

**Description:**
While login and registration have rate limiting, some sensitive endpoints like password reset or admin operations lack explicit rate limiting.

**Recommendation:**
- Audit all sensitive endpoints for rate limit coverage
- Consider global rate limiting at middleware level

---

### L5. HSTS Header Only in Production

**Location:** `/middleware.ts` (lines 125-130)
**Severity:** LOW

**Description:**
HSTS is only applied in production, meaning development/staging could lack this protection:

```typescript
if (process.env.NODE_ENV === 'production') {
  response.headers.set('Strict-Transport-Security', '...');
}
```

**Recommendation:**
- Consider applying HSTS in staging environments as well
- Add `preload` flag for production: `max-age=31536000; includeSubDomains; preload`

---

## Dependency Audit

### npm audit Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Moderate | 0 |
| Low | 0 |
| **Total** | **1** |

### Known Vulnerabilities

| Package | Severity | Description | Fix Available |
|---------|----------|-------------|---------------|
| qs | HIGH | DoS via memory exhaustion (GHSA-6rw7-vpxm-498p) | Yes |

### Security Overrides Already Applied

The project already has security overrides in `package.json`:

```json
"overrides": {
  "dompurify": ">=3.2.4",
  "jsonpath-plus": ">=10.3.0",
  "lodash.set": ">=4.3.2",
  "esbuild": ">=0.24.3"
}
```

These proactively address known vulnerabilities in transitive dependencies.

---

## Security Strengths Identified

The codebase demonstrates several excellent security practices:

### Authentication & Session Management
- JWT tokens with separate access/refresh secrets
- Token version tracking for revocation support
- Proper bcrypt password hashing (12 rounds)
- httpOnly, secure, sameSite cookies
- Account lockout after 5 failed attempts

### Authorization
- Role-based access control (admin/vendor)
- Vendor ownership verification with admin bypass
- Tier-based feature gating
- Collection-level access control in Payload CMS

### Input Validation
- Zod schema validation on registration
- Strong password requirements (12+ chars, complexity)
- File type and size validation on uploads
- Query parameter validation on geocoding API

### Security Headers
- Content-Security-Policy (with noted caveats)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restricting sensitive APIs

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Registration: 3 attempts per hour
- Geocoding: 10 requests per minute

### Audit Logging
- Login success/failure logging
- Account status change tracking
- Password change detection

---

## Recommendations (Prioritized)

### Immediate (This Sprint)

1. **Fix qs vulnerability** - Run `npm audit fix` or add override
2. **Add DOMPurify** - Sanitize CMS content before rendering

### Short-term (Next 2 Sprints)

3. **Add auth to media upload** - Prevent anonymous uploads
4. **Implement Redis rate limiting** - For production scalability
5. **Strengthen CSP** - Investigate nonce-based script loading

### Medium-term (Next Quarter)

6. **Add structured logging** - Replace console.log with proper logging
7. **Externalize JWT config** - Use environment variables for expiry
8. **Security testing** - Add automated security scanning to CI/CD

### Long-term (Roadmap)

9. **Consider Web Application Firewall** - For additional edge protection
10. **Implement security monitoring** - Real-time alerting on anomalies

---

## Files Reviewed

### API Routes
- `/app/api/auth/login/route.ts`
- `/app/api/auth/me/route.ts`
- `/app/api/auth/logout/route.ts`
- `/app/api/auth/refresh/route.ts`
- `/app/api/admin/vendors/[id]/approve/route.ts`
- `/app/api/admin/tier-upgrade-requests/route.ts`
- `/app/api/portal/vendors/register/route.ts`
- `/app/api/portal/vendors/[id]/excel-import/route.ts`
- `/app/api/geocode/route.ts`
- `/app/api/media/upload/route.ts`
- `/app/api/test/vendors/seed/route.ts`

### Core Security Files
- `/middleware.ts`
- `/lib/auth/index.ts`
- `/lib/services/auth-service.ts`
- `/lib/utils/jwt.ts`
- `/lib/middleware/rateLimit.ts`
- `/payload.config.ts`
- `/payload/collections/Users.ts`

### Configuration
- `/.env.example`
- `/.env.e2e`
- `/.gitignore`
- `/package.json`

### Frontend Components
- `/app/(site)/blog/[slug]/page.tsx`
- `/components/vendors/VendorAboutSection.tsx`

---

## Conclusion

The Paul Thames Superyacht Technology platform demonstrates a mature approach to security with robust authentication, authorization, and input validation. The identified issues are primarily hardening opportunities rather than exploitable vulnerabilities. The most important action items are:

1. Apply the qs dependency fix
2. Add HTML sanitization for CMS content
3. Add authentication to the media upload endpoint

With these fixes, the application's security posture would be rated as **EXCELLENT**.

---

*This review was conducted as part of the Agent OS QC process. For questions, refer to the original task: ptnextjs-nuwo.*
