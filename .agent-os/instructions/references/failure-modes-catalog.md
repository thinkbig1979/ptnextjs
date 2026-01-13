---
description: Catalog of common failure modes organized by category with examples and constraints
version: 1.0
encoding: UTF-8
---

# Failure Modes Catalog

A reference catalog of common failure modes for inversion analysis. Use this to prompt thinking about risks that apply to your feature.

---

## 1. Adoption Failures

Failures that prevent users or developers from successfully using the feature.

### 1.1 Complexity Barriers

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Cognitive Overload** | Feature requires understanding too many concepts simultaneously | User must configure 8 options before first use | Provide sensible defaults, progressive disclosure |
| 2 | **Steep Learning Curve** | No path from novice to productive use | No quick-start, only comprehensive docs | Add 5-minute getting started guide |
| 3 | **Hidden Prerequisites** | Undocumented dependencies block usage | Requires Redis but error says "connection refused" | Pre-flight check with actionable error messages |
| 4 | **Jargon Barrier** | Domain-specific terms without explanation | UI says "Configure your OIDC claims" | Use plain language, tooltips for technical terms |
| 5 | **Non-obvious Workflow** | Correct sequence isn't discoverable | Must click "Advanced" then "Enable" then "Configure" | Wizard pattern for multi-step setup |
| 6 | **Missing Feedback** | User can't tell if action succeeded | Save button clicked, no confirmation shown | Always show success/failure feedback |
| 7 | **Inconsistent Behavior** | Same action has different results | "Delete" sometimes soft-deletes, sometimes hard-deletes | Consistent behavior with clear terminology |

### 1.2 Discoverability Issues

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Feature Invisibility** | Users can't find the feature exists | Powerful feature buried in settings submenu | Surface in contextual locations, search indexing |
| 2 | **Misleading Naming** | Name doesn't match user's mental model | "Workspace" when users search for "Project" | User research on terminology, search synonyms |
| 3 | **Wrong Entry Point** | Users start from wrong location | Looking in "Settings" when it's in "Tools" | Multiple entry points, breadcrumbs |
| 4 | **Missing Onboarding** | No guidance for new users | First-time user sees empty dashboard | Empty states with CTAs, first-run tutorial |
| 5 | **Poor Search** | Feature not findable via search | Searching "export" doesn't find "Download as CSV" | Index synonyms and related terms |
| 6 | **Hidden Affordances** | Interactive elements look static | Clickable card has no hover state | Visual affordances for all interactive elements |

### 1.3 Integration Friction

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Migration Burden** | Too much work to switch from existing solution | Requires manual re-entry of 1000 records | Import tool, migration script, coexistence mode |
| 2 | **Incompatible Patterns** | Conflicts with established usage patterns | New auth breaks existing API consumers | Versioned API, deprecation period |
| 3 | **Breaking Changes** | Updates break existing integrations | v2 API removes field v1 clients depend on | Semantic versioning, changelog, migration guides |
| 4 | **Environment Coupling** | Only works in specific environments | Feature requires Chrome, breaks in Safari | Cross-browser testing, graceful degradation |
| 5 | **Configuration Drift** | Settings diverge between environments | Works in dev, fails in prod due to missing env var | Environment parity checks, required config validation |
| 6 | **Data Format Lock-in** | Users can't export/migrate their data | No export, proprietary format | Standard formats, export functionality |

---

## 2. Execution Failures

Failures that occur at runtime, under load, or in production.

### 2.1 Race Conditions & Concurrency

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Lost Update** | Concurrent edits, last write wins silently | User A and B edit same record, A's changes lost | Optimistic locking with version field |
| 2 | **Double Submit** | Same action executed twice | User clicks Submit, no feedback, clicks again | Idempotency keys, disable button on submit |
| 3 | **Dirty Read** | Reading uncommitted data | Transaction A reads B's pending changes | Transaction isolation level, read committed |
| 4 | **Deadlock** | Circular resource waiting | Thread A locks X waits for Y, B locks Y waits for X | Lock ordering convention, timeout with retry |
| 5 | **Time-of-Check/Time-of-Use** | Condition changes between check and action | Check: balance > 100, delay, withdraw when balance = 50 | Atomic check-and-set, database constraints |
| 6 | **Stale Cache** | Cache not invalidated on update | Update database, cache still shows old value | Write-through cache, TTL, explicit invalidation |
| 7 | **Phantom Read** | New records appear during transaction | Count query returns 5, delete all, 1 remains (new insert) | Serializable isolation or range locks |

### 2.2 Edge Cases & Boundary Conditions

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Empty Input** | No handling for empty/null values | Empty array causes divide by zero | Explicit empty checks with meaningful behavior |
| 2 | **Single Item** | Off-by-one with single element | List with 1 item, prev/next buttons crash | Boundary testing for 0, 1, 2 items |
| 3 | **Maximum Exceeded** | No upper bound on input | 10MB text field causes OOM | Input limits with clear error messages |
| 4 | **Unicode Handling** | Special characters break parsing | Emoji in username breaks length validation | UTF-8 aware string handling, grapheme counting |
| 5 | **Timezone Edge** | Calculations wrong across timezones | Midnight in UTC is yesterday in Pacific | Store UTC, convert on display, test timezone boundaries |
| 6 | **Leap Year/Second** | Date math fails on special dates | Feb 29 processing crashes next year | Use proven datetime libraries, test edge dates |
| 7 | **Negative Numbers** | No handling for unexpected negatives | Negative quantity in cart allows "free" items | Validate business constraints, not just types |
| 8 | **Floating Point** | Precision errors in calculations | 0.1 + 0.2 != 0.3 in price comparison | Decimal type for money, epsilon comparisons |

### 2.3 Resource Exhaustion

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Memory Exhaustion** | Unbounded memory allocation | Load all records into memory for processing | Streaming/pagination, memory limits |
| 2 | **Connection Pool Drain** | All database connections in use | Long-running query holds connection | Connection timeout, pool size limits, monitoring |
| 3 | **Disk Space Exhaustion** | Logs/temp files fill disk | Error loop generates 100GB logs | Log rotation, temp file cleanup, disk monitoring |
| 4 | **Thread Pool Exhaustion** | All worker threads blocked | Blocking I/O in async handler | Async I/O, thread pool sizing, timeout |
| 5 | **Rate Limit Exceeded** | External API rejects requests | Batch job exceeds Stripe rate limit | Rate limiting, backoff, queue with throttle |
| 6 | **File Descriptor Limit** | Too many open files/sockets | WebSocket connections never closed | Connection limits, proper cleanup, ulimit config |
| 7 | **CPU Exhaustion** | Runaway computation | Regex backtracking on crafted input | Regex timeout, complexity limits, async processing |

### 2.4 Dependency Failures

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Service Unavailable** | External service is down | Payment provider returns 503 | Circuit breaker, fallback, graceful degradation |
| 2 | **Slow Response** | Dependency responds very slowly | API takes 30s instead of 300ms | Timeout, async processing, partial results |
| 3 | **Network Partition** | Cannot reach dependency | Database in different region unreachable | Retry with backoff, queue for later, local fallback |
| 4 | **API Contract Change** | Dependency changes response format | Third-party removes field from JSON | Version pinning, contract testing, alerts |
| 5 | **Certificate Expiry** | TLS certificate expired | Outbound HTTPS fails silently | Certificate monitoring, automated renewal |
| 6 | **DNS Failure** | Cannot resolve hostname | DNS lookup hangs for 30 seconds | DNS caching, fallback IPs, health checks |
| 7 | **Cascading Failure** | One failure causes chain reaction | Service A timeout causes B, C, D to fail | Circuit breakers, bulkheads, load shedding |

---

## 3. Evolution Failures

Failures that make the system unmaintainable or block future development.

### 3.1 Tight Coupling

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **God Object** | Single module does everything | `UserService` has 200 methods | Single responsibility, extract classes |
| 2 | **Hidden Dependencies** | Implicit coupling not visible in code | Module A modifies global state B reads | Explicit dependencies via injection |
| 3 | **Circular Dependencies** | A depends on B depends on A | Cannot test either in isolation | Dependency inversion, interface extraction |
| 4 | **Database Coupling** | Business logic in stored procedures | Cannot test without database | Repository pattern, logic in application layer |
| 5 | **Temporal Coupling** | Must call methods in specific order | init() then configure() then start() | Builder pattern, state machine, single entry point |
| 6 | **Shotgun Surgery** | One change requires many files | Adding field touches 15 files | Encapsulation, feature folders, domain modules |
| 7 | **Feature Envy** | Method uses other class's data more than its own | `formatUser(user)` accesses 10 user fields | Move method to data owner |

### 3.2 Missing Extension Points

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Hardcoded Values** | Magic numbers/strings in code | `if (type === 'PREMIUM')` throughout codebase | Constants, enums, configuration |
| 2 | **No Plugin System** | Cannot add custom behavior | Users need custom validation, no hooks | Plugin architecture, event system |
| 3 | **Sealed Inheritance** | Cannot extend behavior | Base class is final, need custom variant | Composition over inheritance, strategy pattern |
| 4 | **Fixed Formats** | Only supports one format | Need CSV export, only supports JSON | Format handlers, adapter pattern |
| 5 | **No Versioning** | Cannot evolve API | v1 API, need breaking changes, no path | Version in URL, deprecation strategy |
| 6 | **Hardcoded Integrations** | Cannot swap dependencies | Directly calls S3, need to support Azure | Interface abstraction, dependency injection |
| 7 | **No Feature Flags** | Cannot partially roll out | Must ship 100% or 0% | Feature flag system, gradual rollout |

### 3.3 Technical Debt Accumulation

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **No Test Coverage** | Cannot safely refactor | Refactor causes silent regression | Test-first development, coverage requirements |
| 2 | **Documentation Rot** | Docs don't match code | README describes removed feature | Doc generation from code, doc tests |
| 3 | **Copy-Paste Code** | Duplicated logic diverges | Bug fix in one copy, not the other | Extract shared functions, DRY principle |
| 4 | **Dead Code** | Unused code confuses maintainers | 40% of codebase is unreachable | Regular cleanup, dead code detection |
| 5 | **Inconsistent Patterns** | Multiple ways to do same thing | Some code uses callbacks, some promises, some async | Code style guide, linting, patterns docs |
| 6 | **Missing Types** | Dynamic typing hides bugs | `any` type throughout, runtime crashes | TypeScript strict mode, type coverage |
| 7 | **Environment Secrets** | "Works on my machine" | Requires local env vars not documented | .env.example, setup scripts, containers |

---

## 4. Security Failures

Failures that enable exploitation or security incidents. Mapped to OWASP Top 10 2021.

### 4.1 Broken Access Control (A01:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **IDOR** | Guessable IDs expose other users' data | Change `/users/123` to `/users/124` | Authorization check on every access |
| 2 | **Missing Function Level Access** | Endpoint lacks authorization | Admin endpoint has no auth check | Deny by default, explicit allow |
| 3 | **Privilege Escalation** | User gains higher privileges | Modify role field in user update request | Whitelist allowed fields, role check |
| 4 | **CORS Misconfiguration** | Overly permissive cross-origin | `Access-Control-Allow-Origin: *` on auth endpoints | Explicit origin whitelist |
| 5 | **Path Traversal** | Access files outside intended directory | `filename=../../etc/passwd` | Sanitize paths, chroot, allowlist |
| 6 | **JWT Forgery** | Weak/missing signature verification | `alg: none` accepted in JWT | Explicit algorithm verification |

### 4.2 Cryptographic Failures (A02:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Plaintext Secrets** | Passwords/keys stored unencrypted | Database dump exposes all passwords | bcrypt/Argon2 for passwords, encryption at rest |
| 2 | **Weak Algorithms** | Using broken crypto | MD5 for password hashing | Use modern algorithms: SHA-256+, Argon2 |
| 3 | **Hardcoded Secrets** | Keys in source code | API key in git history | Environment variables, secret managers |
| 4 | **Insecure Transmission** | Data sent over HTTP | Login form submits to HTTP | TLS everywhere, HSTS |
| 5 | **Predictable Tokens** | Guessable reset tokens | Sequential: `/reset?token=1001` | Cryptographically random tokens (256-bit) |
| 6 | **Key Reuse** | Same key for multiple purposes | Encryption key = signing key | Distinct keys per purpose |

### 4.3 Injection (A03:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **SQL Injection** | User input in SQL query | `'; DROP TABLE users; --` | Parameterized queries, ORM |
| 2 | **XSS (Stored)** | Malicious script saved and served | `<script>steal(document.cookie)</script>` in comment | HTML encode output, CSP |
| 3 | **XSS (Reflected)** | Input reflected in response | `?search=<script>alert(1)</script>` | HTML encode, validate/reject HTML in input |
| 4 | **Command Injection** | User input in shell command | `filename=; rm -rf /` | Never shell out with user input, use libraries |
| 5 | **LDAP Injection** | User input in LDAP query | `user=*)(uid=*))(|(uid=*` | Escape LDAP special characters |
| 6 | **Template Injection** | User input in template engine | `{{constructor.constructor('return this')()}}` | Sandbox templates, avoid user input in templates |
| 7 | **NoSQL Injection** | Malicious operators in NoSQL | `{"$gt": ""}` instead of string password | Type validation, parameterization |

### 4.4 Insecure Design (A04:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Missing Rate Limiting** | Brute force possible | 1M password attempts per second | Rate limiting, account lockout |
| 2 | **Missing Confirmation** | Destructive actions without verification | Delete account with single click | Confirmation dialogs, re-authentication |
| 3 | **Weak Password Policy** | Allow easily guessable passwords | Password: "password" | Minimum length, complexity, breach check |
| 4 | **No Fraud Prevention** | Easily abusable features | Create 1000 free trial accounts | CAPTCHA, phone verification, abuse detection |
| 5 | **Insufficient Logging** | Cannot detect attacks | No logs of failed login attempts | Audit logging, alerting |
| 6 | **Trust Boundary Violation** | Trusting client-side validation | Price comes from hidden form field | Server-side validation of all inputs |

### 4.5 Security Misconfiguration (A05:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Verbose Errors** | Stack traces expose internals | Error shows file paths and SQL | Custom error pages, error codes only |
| 2 | **Default Credentials** | Unchanged default passwords | admin/admin on admin panel | Force password change, no defaults |
| 3 | **Directory Listing** | List files in web directory | Browse to /uploads/, see all files | Disable directory listing |
| 4 | **Missing Headers** | No security headers | No CSP, X-Frame-Options | Security header middleware |
| 5 | **Debug Mode in Prod** | Development features enabled | Django DEBUG=True shows source | Environment checks, secure defaults |
| 6 | **Unnecessary Features** | Attack surface from unused features | phpinfo.php left on server | Minimal install, disable unused |

### 4.6 Vulnerable Components (A06:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Outdated Dependencies** | Known vulnerabilities in libraries | Log4Shell in unpatched Log4j | Automated dependency updates, vulnerability scanning |
| 2 | **Unmaintained Packages** | No security patches available | Library abandoned 3 years ago | Evaluate maintenance status, have alternatives |
| 3 | **Transitive Vulnerabilities** | Vulnerability in dependency's dependency | Your lib is safe, its dep isn't | Deep dependency scanning |
| 4 | **Phantom Dependencies** | Using package not in manifest | Works locally, breaks in prod | Lock files, reproducible builds |

### 4.7 Authentication Failures (A07:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Credential Stuffing** | Reused credentials from breaches | Email/password from another site's leak | Breach detection, MFA |
| 2 | **Session Fixation** | Session ID not regenerated after login | Attacker sets session, victim logs in | Regenerate session on auth level change |
| 3 | **Weak Session Management** | Predictable or long-lived sessions | Session ID is MD5 of username | Random session IDs, appropriate expiry |
| 4 | **Token Exposure** | Token in URL, logs, or Referer | `?token=abc123` in password reset | POST body, short-lived tokens, secure cookies |
| 5 | **Missing MFA** | Single factor for sensitive operations | Password only for financial transactions | MFA for sensitive accounts/operations |
| 6 | **Insecure Password Recovery** | Easy to hijack reset flow | Security questions with public answers | Token-based reset, email verification |

### 4.8 SSRF (A10:2021)

| # | Failure Mode | Description | Example Trigger | Constraint Pattern |
|---|--------------|-------------|-----------------|-------------------|
| 1 | **Internal Network Access** | User-provided URL fetches internal resources | `url=http://169.254.169.254/metadata` | URL allowlist, block private ranges |
| 2 | **Protocol Smuggling** | Unexpected protocols accepted | `url=file:///etc/passwd` | Restrict to http/https only |
| 3 | **DNS Rebinding** | Domain resolves to internal IP after check | Check: external IP, fetch: internal IP | Re-validate IP at fetch time |
| 4 | **Webhook Abuse** | Webhook URL targets internal services | Webhook to `http://localhost:3000/admin/delete` | Validate webhook destinations |

---

## Using This Catalog

### During Inversion Analysis

1. **Scan relevant categories** based on feature type
2. **Check for applicable patterns** (not all will apply)
3. **Adapt examples** to your specific context
4. **Derive constraints** using the patterns provided

### Feature Type Quick Reference

| Feature Type | Primary Catalog Sections |
|--------------|-------------------------|
| User Authentication | 4.7 Auth, 4.1 Access Control, 2.1 Concurrency |
| Data Entry Forms | 4.3 Injection, 2.2 Edge Cases, 1.1 Complexity |
| File Upload | 4.3 Injection, 4.1 Access Control, 2.3 Resources |
| Search/Filter | 4.3 Injection, 2.3 Resources, 2.2 Edge Cases |
| API Endpoints | 4.1 Access Control, 4.3 Injection, 2.4 Dependencies |
| Admin Features | 4.1 Access Control, 4.4 Insecure Design, 3.1 Coupling |
| Real-time/WebSocket | 2.1 Concurrency, 2.3 Resources, 3.2 Extension Points |
| Third-party Integration | 2.4 Dependencies, 4.6 Components, 3.2 Extension Points |
| Payment Processing | 4.4 Insecure Design, 4.2 Crypto, 2.1 Concurrency |

---

*Template: `templates/inversion-analysis.md.template`*
*Guide: `instructions/utilities/quality-lenses.md#inversion-lens`*
