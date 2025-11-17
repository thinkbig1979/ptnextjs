# Multi-Stage Dockerfile for Next.js + Payload CMS
# Optimized for production deployment with minimal image size
# Base image: node:22-alpine for size optimization

# ============================================
# Stage 1: Dependencies
# Install production dependencies only
# ============================================
FROM node:22-alpine AS deps

# Install libc6-compat for compatibility with native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
# This layer is cached unless package files change
COPY package.json package-lock.json* ./

# Install all dependencies (needed for postinstall scripts like patch-package)
# --legacy-peer-deps handles peer dependency conflicts
RUN npm ci --legacy-peer-deps

# ============================================
# Stage 2: Builder
# Build the Next.js application with standalone output
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Copy database for build-time static generation
# .dockerignore excludes data/, but we need it for SSG
COPY data ./data

# Install build dependencies
# These are needed for the build process but not runtime
RUN npm ci --legacy-peer-deps

# Build arguments for runtime configuration
# These must be provided at build time for Next.js to bake into the static bundle
ARG NEXT_PUBLIC_SERVER_URL
ARG PAYLOAD_SECRET

# Build Next.js application
# NEXT_TELEMETRY_DISABLED=1 disables Next.js telemetry
# This creates .next/standalone directory with minimal runtime files
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
RUN npm run build

# ============================================
# Stage 3: Runner
# Final production image with minimal footprint
# ============================================
FROM node:22-alpine AS runner

# Install runtime dependencies
# wget: Required for Docker health checks
# tini: Init system for proper signal handling
RUN apk add --no-cache \
    wget \
    tini

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
# nodejs user is created by node:alpine image
# We just need to set up the working directory
RUN addgroup --system --gid 996 nodejs && \
    adduser --system --uid 1005 nextjs && \
    mkdir -p /app /data /app/media && \
    chown -R nextjs:nodejs /app /data

# Copy standalone Next.js output from builder
# This includes only the files needed to run the app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy native modules required by libsql (SQLite driver)
# Next.js standalone doesn't include optional native dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@libsql ./node_modules/@libsql
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/libsql ./node_modules/libsql

# Copy payload.config.ts and package.json for runtime
COPY --from=builder --chown=nextjs:nodejs /app/payload.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Create volume mount points
# /data: SQLite database persistence
# /app/media: Media uploads persistence
VOLUME ["/data", "/app/media"]

# Expose application port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Health check configuration
# Checks /api/health endpoint every 30 seconds
# 3 retries with 10 second timeout
# Start checking after 30 second startup period
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use tini as init system for proper signal handling
# This ensures graceful shutdown on SIGTERM
ENTRYPOINT ["/sbin/tini", "--"]

# Start the Next.js server
# The standalone build includes a minimal server.js
CMD ["node", "server.js"]
