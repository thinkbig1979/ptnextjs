# Task: core-2 - Create Multi-Stage Dockerfile

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure (TDD GREEN)
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 45 minutes
**Dependencies:** core-1

---

## Description

Create a production-ready multi-stage Dockerfile with optimized build process, minimal runtime image size, and proper Next.js standalone mode configuration.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/Dockerfile`

**Required stages:**
1. **deps** - Install production dependencies only
2. **builder** - Build Next.js application in standalone mode
3. **runner** - Final runtime image with minimal footprint

**Base image:** `node:22-alpine`

**Key requirements from spec:**
- Multi-stage build for size optimization
- Next.js standalone output mode
- Non-root user for security
- Health check dependencies (wget)
- Proper file permissions
- Optimized layer caching

**Ports to expose:** 3000

**Working directory:** `/app`

**User:** `nodejs` (non-root)

---

## Acceptance Criteria

- [ ] Dockerfile created at project root
- [ ] Uses node:22-alpine base image
- [ ] Three distinct build stages (deps, builder, runner)
- [ ] Production dependencies only in deps stage
- [ ] Next.js standalone output in builder stage
- [ ] Minimal runtime image in runner stage
- [ ] Non-root user (nodejs) configured
- [ ] wget installed for health checks
- [ ] Port 3000 exposed
- [ ] Proper WORKDIR and file permissions
- [ ] Layer caching optimized (package.json copied first)
- [ ] .next/standalone and public directories copied correctly
- [ ] Environment variable support configured
- [ ] Image builds successfully without errors
- [ ] Image size < 500MB (optimized)

---

## Testing Requirements

**Build validation:**
```bash
# Test build succeeds
docker build -t ptnextjs:test .

# Verify image size
docker images ptnextjs:test

# Verify image layers
docker history ptnextjs:test

# Test container starts
docker run -d --name test-container ptnextjs:test

# Verify non-root user
docker exec test-container whoami
# Expected: nodejs

# Clean up
docker stop test-container
docker rm test-container
docker rmi ptnextjs:test
```

**Integration test validation:**
- Docker stack integration tests (core-1) should progress toward passing
- Container should start successfully in docker-compose

---

## Evidence Requirements

**Completion evidence:**
1. Dockerfile committed to project root
2. Successful build output screenshot
3. Image size verification (< 500MB)
4. Container startup log showing non-root user
5. Layer analysis showing optimized caching

**Documentation:**
- Inline comments explaining each stage
- Build optimization notes
- Security hardening applied

---

## Context Requirements

**Required knowledge:**
- Docker multi-stage build patterns
- Next.js standalone output mode
- Alpine Linux package management
- Docker layer caching optimization
- Container security best practices

**Files to reference:**
- Next.js docs: https://nextjs.org/docs/advanced-features/output-file-tracing
- Spec: `.agent-os/specs/2025-11-06-docker-vps-deployment/spec.md`
- package.json for dependency information

**Environment variables needed:**
- DATABASE_URL (runtime)
- PAYLOAD_SECRET (runtime)
- NEXT_PUBLIC_SERVER_URL (build time)

---

## Implementation Notes

**Dockerfile structure:**

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build application
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
USER nodejs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

**Optimization strategies:**
1. **Layer caching:** Copy package.json before source code
2. **Dependency pruning:** Use --only=production in deps stage
3. **Alpine base:** Minimal base image size
4. **Standalone mode:** Next.js includes only necessary files
5. **Non-root user:** Security best practice

**Security hardening:**
- Run as non-root user (nodejs)
- No unnecessary packages in final image
- Explicit user/group IDs (1001)
- Read-only file permissions where possible

**Common pitfalls to avoid:**
- Don't copy node_modules to builder stage
- Don't include dev dependencies in runtime
- Ensure standalone mode enabled in next.config.js
- Don't forget to copy public and static directories
- Set proper permissions with --chown flag

---

## Next Steps

After completing this task:
1. Verify Dockerfile builds successfully
2. Test container starts locally
3. Proceed to core-3 (docker-compose.yml)
4. Return to core-9 to verify integration tests pass

**Note:** This task works toward GREEN phase - making tests pass. Verify build works before moving on.
