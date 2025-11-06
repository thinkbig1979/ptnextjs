# Task: core-7 - Create .env.production.example Template

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 20 minutes
**Dependencies:** core-6

---

## Description

Create a comprehensive environment variable template file documenting all required and optional configuration for production Docker deployment.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/.env.production.example`

**Purpose:**
1. Document all required environment variables
2. Provide example values and formats
3. Include inline documentation and descriptions
4. Serve as deployment checklist
5. Enable easy environment setup

**Variable categories:**
- Database configuration
- Application secrets
- Server configuration
- Feature flags
- Third-party integrations
- Logging configuration

---

## Acceptance Criteria

- [ ] .env.production.example created at project root
- [ ] All required variables documented
- [ ] Example values provided (non-sensitive)
- [ ] Inline comments explain each variable
- [ ] Variable format and validation notes included
- [ ] Grouped by category for readability
- [ ] No actual secrets or passwords included
- [ ] Matches docker-compose.yml variable usage
- [ ] Matches payload.config.ts requirements
- [ ] Includes generation instructions for secrets
- [ ] File committed to git safely

---

## Testing Requirements

**Validation:**
```bash
# Verify file syntax (no bash execution, just review)
cat .env.production.example

# Check all docker-compose.yml variables present
grep -o '\${[^}]*}' docker-compose.yml | sort -u
# Compare with .env.production.example variables

# Verify no real secrets
grep -i "password\|secret\|key" .env.production.example
# Should only see example/placeholder values

# Test deployment workflow
cp .env.production.example .env.production
# Edit .env.production with real values
docker-compose --env-file .env.production config
# Should validate successfully
```

---

## Evidence Requirements

**Completion evidence:**
1. .env.production.example committed to git
2. All variables documented with descriptions
3. Cross-reference with docker-compose.yml verified
4. Security review confirming no real secrets

**Documentation:**
- Variable reference table
- Generation instructions for secrets
- Deployment setup guide reference

---

## Context Requirements

**Required knowledge:**
- Environment variable naming conventions
- Secret generation best practices
- PostgreSQL connection string format
- JWT secret requirements

**Files to reference:**
- docker-compose.yml (core-3) - required variables
- payload.config.ts (core-6) - Payload CMS requirements
- next.config.js (core-5) - Next.js configuration
- Existing .env or .env.local files

---

## Implementation Notes

**.env.production.example structure:**

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================

# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
# Example: postgresql://payload:secretpassword@db:5432/payload
DATABASE_URL=postgresql://payload:CHANGE_ME@db:5432/payload

# PostgreSQL database name
POSTGRES_DB=payload

# PostgreSQL username
POSTGRES_USER=payload

# PostgreSQL password (MUST CHANGE IN PRODUCTION)
# Generate: openssl rand -base64 32
POSTGRES_PASSWORD=CHANGE_ME_GENERATE_SECURE_PASSWORD

# ============================================
# APPLICATION SECRETS
# ============================================

# Payload CMS secret key (REQUIRED)
# Used for JWT signing and encryption
# Generate: openssl rand -base64 32
# MUST be at least 32 characters
PAYLOAD_SECRET=CHANGE_ME_MINIMUM_32_CHARACTERS

# Next.js secret for session management (if using NextAuth)
# Generate: openssl rand -base64 32
# NEXTAUTH_SECRET=CHANGE_ME_IF_USING_AUTH

# ============================================
# SERVER CONFIGURATION
# ============================================

# Public URL of the application (REQUIRED)
# Used for redirects, emails, and asset URLs
# Example: https://yourdomain.com
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com

# Node environment (production/development)
NODE_ENV=production

# Server port (internal, Docker exposes via proxy)
PORT=3000

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================

# SMTP server for transactional emails
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-smtp-password
# EMAIL_FROM=noreply@yourdomain.com

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================

# Maximum upload size in bytes (default: 50MB)
# PAYLOAD_MAX_UPLOAD_SIZE=52428800

# Upload directory (Docker volume mounted here)
UPLOAD_DIR=/app/media

# ============================================
# LOGGING CONFIGURATION
# ============================================

# Log level (error, warn, info, debug)
LOG_LEVEL=info

# ============================================
# EXTERNAL SERVICES (Optional)
# ============================================

# Google Analytics tracking ID
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry DSN for error tracking
# SENTRY_DSN=https://xxx@sentry.io/xxx

# ============================================
# DEPLOYMENT INFORMATION
# ============================================

# Build timestamp (auto-generated during deploy)
# BUILD_TIMESTAMP=

# Git commit hash (auto-generated during deploy)
# GIT_COMMIT=

# ============================================
# SECURITY NOTES
# ============================================
# 1. NEVER commit .env.production with real values
# 2. Use strong, unique passwords for each service
# 3. Generate secrets with: openssl rand -base64 32
# 4. Rotate secrets regularly (quarterly recommended)
# 5. Store production secrets in secure vault (1Password, AWS Secrets Manager, etc.)
# 6. Restrict file permissions: chmod 600 .env.production
```

**Variable validation rules:**

| Variable | Required | Format | Validation |
|----------|----------|--------|------------|
| DATABASE_URL | Yes | postgresql://... | Valid connection string |
| POSTGRES_PASSWORD | Yes | String | Min 16 characters |
| PAYLOAD_SECRET | Yes | String | Min 32 characters |
| NEXT_PUBLIC_SERVER_URL | Yes | URL | Valid HTTPS URL |
| NODE_ENV | Yes | Enum | production/development |
| PORT | No | Number | 1-65535 |

**Secret generation instructions:**

```bash
# Generate PostgreSQL password
openssl rand -base64 32

# Generate Payload CMS secret
openssl rand -base64 32

# Generate NextAuth secret (if needed)
openssl rand -base64 32

# Generate multiple secrets at once
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "PAYLOAD_SECRET=$(openssl rand -base64 32)"
```

**Documentation sections:**

1. **Required variables** - Must be set for application to start
2. **Optional variables** - Can be omitted (defaults apply)
3. **Example values** - Show format, never real secrets
4. **Generation instructions** - How to create secure values
5. **Security notes** - Best practices and warnings

**Integration points:**

1. **docker-compose.yml:**
   - Uses variables via ${VAR_NAME} syntax
   - All compose variables must be documented

2. **payload.config.ts:**
   - DATABASE_URL for connection
   - PAYLOAD_SECRET for JWT signing

3. **next.config.js:**
   - NEXT_PUBLIC_SERVER_URL for public URLs
   - Environment-specific configuration

**Deployment workflow:**

```bash
# On production VPS:
# 1. Copy example file
cp .env.production.example .env.production

# 2. Generate secrets
openssl rand -base64 32  # Use for POSTGRES_PASSWORD
openssl rand -base64 32  # Use for PAYLOAD_SECRET

# 3. Edit with real values
nano .env.production

# 4. Restrict permissions
chmod 600 .env.production

# 5. Validate configuration
docker-compose config

# 6. Deploy
./scripts/deploy.sh
```

**Common mistakes to avoid:**

- Don't include actual secrets in .example file
- Don't forget to document optional variables
- Don't omit generation instructions
- Do include format examples
- Do document validation requirements
- Do explain security implications

---

## Next Steps

After completing this task:
1. Review with security team
2. Add to deployment documentation
3. Create validation script (optional)
4. Proceed to core-8 (entrypoint.sh)

**Note:** This file is safe to commit to git. Never commit .env.production with real values.
