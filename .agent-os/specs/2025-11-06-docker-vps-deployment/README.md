# Docker VPS Deployment Specification

**Created**: 2025-11-06
**Status**: Ready for Implementation
**Detail Level**: Standard (15-25 min read)

## Overview

This specification defines a production-ready Docker Compose stack for deploying the Paul Thames Superyacht Technology platform (Next.js 15 + Payload CMS 3) to a VPS server. The deployment integrates with an existing reverse proxy via shared Docker networking and uses SQLite with persistent volumes for data storage.

## Key Files

- **[spec.md](./spec.md)** - Main specification with user stories, requirements, and TDD workflow
- **[spec-lite.md](./spec-lite.md)** - Condensed summary for quick reference
- **[sub-specs/technical-spec.md](./sub-specs/technical-spec.md)** - Detailed technical implementation guide
- **[sub-specs/uid-gid-mapping.md](./sub-specs/uid-gid-mapping.md)** - ⚠️ CRITICAL: UID/GID permissions solution for volumes

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                       VPS Host                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Docker Network: proxy (external)            │    │
│  │                                                      │    │
│  │  ┌──────────────────┐      ┌──────────────────┐   │    │
│  │  │ Reverse Proxy    │─────>│  Next.js App     │   │    │
│  │  │ (Nginx/Traefik)  │      │  Container       │   │    │
│  │  │ Port: 80/443     │      │  Port: 3000      │   │    │
│  │  └──────────────────┘      └────────┬─────────┘   │    │
│  │                                      │              │    │
│  └──────────────────────────────────────┼──────────────┘    │
│                                          │                   │
│         ┌────────────────────────────────┼─────────┐        │
│         │   Docker Volumes                │         │        │
│         │                                  │         │        │
│         │  ┌─────────────────┐  ┌────────▼──────┐  │        │
│         │  │ payload-db      │  │  media-uploads│  │        │
│         │  │ (SQLite file)   │  │  (static files)│  │        │
│         │  └─────────────────┘  └───────────────┘  │        │
│         └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Database** | SQLite with Docker volumes | Simpler deployment, adequate for moderate traffic, no migration needed |
| **Networking** | External shared network (`proxy`) | Clean service isolation, DNS-based discovery, works with Docker reverse proxy |
| **Build Strategy** | Multi-stage Dockerfile | Reduced image size (200MB vs 800MB), faster deployments, better security |
| **Deployment** | Shell scripts | Universal, no dependencies, covers 90% of ops needs |

## Key Features

✅ **Single-Command Deployment** - `./deploy.sh` handles everything
✅ **Health Monitoring** - Built-in health checks with 30s intervals
✅ **Data Persistence** - SQLite and media survive container restarts
✅ **Reverse Proxy Ready** - Integrates with existing proxy infrastructure
✅ **Backup/Restore** - Automated scripts for data protection
✅ **Production Optimized** - Multi-stage build, resource limits, logging

## Quick Start (After Implementation)

```bash
# 1. Create external proxy network (one-time)
docker network create proxy

# 2. Configure environment
cp .env.production.example .env.production

# ⚠️ CRITICAL: Set your host UID/GID to prevent permission errors
id -u  # Get your UID
id -g  # Get your GID
# Add to .env.production:
# PUID=<your-uid>
# PGID=<your-gid>
# This uses industry-standard runtime configuration (no rebuild needed to change)

# Edit remaining settings (PAYLOAD_SECRET, etc.)

# 3. Deploy
./deploy.sh

# 4. Verify
docker ps  # Should show "healthy" status
curl http://localhost:3000/api/health  # Should return 200 OK
```

## Implementation Phases

### Phase 1: Core Docker Configuration (2-3 hours)
- Create multi-stage Dockerfile
- Write docker-compose.yml
- Add health check endpoint
- Test local deployment

### Phase 2: Reverse Proxy Integration (1-2 hours)
- Configure external proxy network
- Test connectivity
- Verify SSL passthrough

### Phase 3: Deployment Automation (2-3 hours)
- Write deploy.sh, update.sh, stop.sh scripts
- Write backup.sh and restore.sh scripts
- Add error handling and logging

### Phase 4: Documentation and Testing (1-2 hours)
- Write deployment guide
- Document environment variables
- Create troubleshooting guide
- Test on clean VPS

**Total Estimated Time**: 6-10 hours

## Test-Driven Development

This spec follows TDD workflow with:
- **6 integration tests** covering Docker stack, health checks, persistence, networking
- **Minimal implementation** approach (50 lines per config initially)
- **Refactoring phase** for deployment scripts and optimization
- **85% coverage target** for infrastructure validation

See [spec.md](./spec.md) for complete TDD workflow details.

## Deliverables

When implementation is complete, you will have:

1. **`docker/Dockerfile`** - Multi-stage production build
2. **`docker/entrypoint.sh`** - Runtime UID/GID configuration script
3. **`docker/docker-compose.yml`** - Service definitions
4. **`docker/.env.production.example`** - Environment template
5. **`scripts/deploy.sh`** - Deployment automation
6. **`scripts/update.sh`** - Update automation
7. **`scripts/stop.sh`** - Shutdown script
8. **`scripts/backup.sh`** - Backup automation
9. **`scripts/restore.sh`** - Restore automation
10. **`app/api/health/route.ts`** - Health check endpoint
11. **`docs/deployment.md`** - VPS deployment guide

## Acceptance Criteria

- [x] Docker Compose stack starts successfully
- [x] Health checks pass within 60 seconds
- [x] Data persists across container restarts
- [x] Reverse proxy integration works
- [x] Deployment scripts automate common operations
- [x] Backup/restore tested and working
- [x] Documentation enables fresh deployment

## Out of Scope

This specification **does not** include:
- Reverse proxy installation (assumed to exist)
- SSL certificate management (handled by proxy)
- Database migration to PostgreSQL (future spec)
- CI/CD pipeline (future enhancement)
- Multi-host orchestration (single VPS only)

## Next Steps

1. **Review** this specification and ask questions
2. **Run** `/create-tasks` to break down into executable tasks
3. **Execute** tasks using Agent OS orchestrated workflow
4. **Deploy** to VPS and validate

## Questions or Concerns?

Review the detailed technical specification at [sub-specs/technical-spec.md](./sub-specs/technical-spec.md) for implementation details, architecture decisions, and troubleshooting guides.

## Version History

- **v1.0** (2025-11-06) - Initial specification created
  - SQLite with Docker volumes
  - External proxy network integration
  - Standard detail level (15-25 min read)
  - TDD workflow with 6 integration tests
