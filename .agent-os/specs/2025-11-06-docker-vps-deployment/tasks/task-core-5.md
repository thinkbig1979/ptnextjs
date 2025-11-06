# Task: core-5 - Update next.config.js for Standalone Mode

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure (TDD GREEN)
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 20 minutes
**Dependencies:** core-2

---

## Description

Update Next.js configuration to enable standalone output mode for Docker containerization. This changes Next.js from static export to server-side rendering with minimal runtime dependencies.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/next.config.js`

**Required changes:**
1. **DISABLE** static export mode (`output: 'export'`)
2. **ENABLE** standalone mode (`output: 'standalone'`)
3. Maintain existing configuration (images, redirects, etc.)
4. Add experimental features if needed for Payload CMS

**Critical note:** This is a BREAKING CHANGE from static site generation to server-side rendering. Required for Payload CMS admin panel and API functionality.

**Compatibility check:**
- Verify no static-only features are used
- Ensure all pages work with server-side rendering
- Confirm Payload CMS compatibility

---

## Acceptance Criteria

- [ ] next.config.js updated with output: 'standalone'
- [ ] output: 'export' removed (if present)
- [ ] Existing configuration preserved (images, redirects)
- [ ] Configuration validated for syntax errors
- [ ] Next.js build succeeds with standalone mode
- [ ] .next/standalone directory created after build
- [ ] server.js file generated in standalone output
- [ ] No static-only features breaking
- [ ] Payload CMS admin accessible in development
- [ ] Build size reasonable (< 200MB)

---

## Testing Requirements

**Configuration validation:**
```bash
# Verify configuration syntax
npm run build

# Check standalone output created
ls -la .next/standalone
# Expected: server.js and node_modules

# Test standalone server locally
cd .next/standalone
node server.js
# Expected: Server starts on port 3000

# Test Payload CMS admin
curl http://localhost:3000/admin
# Expected: HTML response (admin login page)

# Clean up
rm -rf .next
```

**Integration validation:**
- Docker build (core-2) should succeed
- Dockerfile should find .next/standalone directory
- Container should run server.js successfully

---

## Evidence Requirements

**Completion evidence:**
1. Updated next.config.js committed
2. Successful build output showing standalone mode
3. .next/standalone directory structure screenshot
4. Local standalone server startup log
5. Payload CMS admin accessibility confirmation

**Documentation:**
- Configuration change explanation
- Impact on deployment documented
- Differences from static export noted

---

## Context Requirements

**Required knowledge:**
- Next.js output modes (export vs standalone)
- Payload CMS server requirements
- Server-side rendering implications
- Static vs dynamic page rendering

**Files to read first:**
```bash
# Read current configuration
cat /home/edwin/development/ptnextjs/next.config.js
```

**Files to reference:**
- Next.js standalone docs: https://nextjs.org/docs/advanced-features/output-file-tracing
- Spec: `.agent-os/specs/2025-11-06-docker-vps-deployment/spec.md`

---

## Implementation Notes

**Current configuration analysis needed:**
Read next.config.js to identify:
1. Current output mode (likely 'export')
2. Image configuration (unoptimized for static)
3. Redirects and rewrites
4. Environment variables
5. Any static-only features

**Expected next.config.js changes:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // CHANGE: Enable standalone mode for Docker
  output: 'standalone',

  // REMOVE: output: 'export' (if present)

  // KEEP: Image optimization can now be enabled
  images: {
    // Can remove 'unoptimized: true' if present
    // Docker has image optimization support
  },

  // KEEP: Existing redirects
  async redirects() {
    return [
      // ... existing redirects
    ];
  },

  // KEEP: Trailing slashes
  trailingSlash: true,

  // KEEP: TypeScript and linting config
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig;
```

**Breaking changes to address:**

1. **Static export → Server rendering:**
   - All pages now run on server
   - getServerSideProps now works (was disabled in export)
   - API routes now functional (were disabled in export)

2. **Image optimization:**
   - Can enable Next.js image optimization
   - Remove 'unoptimized: true' flag
   - Better performance with optimized images

3. **Deployment target:**
   - No longer outputs static HTML files
   - Requires Node.js server runtime
   - Docker container runs server.js

**Compatibility validations:**

1. **Pages using static generation:**
   - getStaticProps still works
   - getStaticPaths still works
   - No changes needed for static pages

2. **Payload CMS compatibility:**
   - Admin panel REQUIRES server mode
   - API routes REQUIRE server mode
   - This change ENABLES full Payload functionality

3. **Build output:**
   - .next/standalone contains minimal runtime
   - Includes only necessary node_modules
   - Much smaller than full node_modules

**Common pitfalls:**

- Don't forget to remove output: 'export' completely
- Don't keep 'unoptimized: true' for images (can optimize now)
- Don't assume static paths work same way (test thoroughly)
- Do test Payload CMS admin after change
- Do verify all pages still render correctly

**Rollback plan:**
If critical issues discovered:
1. Revert next.config.js to previous version
2. Document issues encountered
3. Escalate to team for resolution
4. Do NOT proceed with Docker deployment until resolved

---

## Next Steps

After completing this task:
1. Test local development with new configuration
2. Verify all pages render correctly
3. Confirm Payload CMS admin functional
4. Proceed to core-6 (payload.config.ts PostgreSQL update)

**Critical path task:** Must be completed before Docker image can run successfully. Verify thoroughly before moving on.
