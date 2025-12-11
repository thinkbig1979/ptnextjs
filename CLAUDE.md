# CLAUDE.md - Paul Thames Superyacht Technology

**Note**: This project uses [Agent OS Framework](.agent-os/CLAUDE.md) for development automation and [bd (beads)](https://github.com/steveyegge/beads) for issue tracking. Follow practices in [AGENTS.md](AGENTS.md).

## Quick Start

```bash
npm install
npm run dev              # Start dev server (http://localhost:3000)
                         # CMS Admin: http://localhost:3000/admin
npm run type-check       # Verify TypeScript
npm run test:e2e         # Run Playwright tests
```

## Commands Reference

| Category | Command | Description |
|----------|---------|-------------|
| **Dev** | `npm run dev` | Start development server |
| | `npm run dev:clean` | Clean restart (kills existing servers) |
| | `npm run stop:dev` | Stop all dev servers |
| **Build** | `npm run build` | Production build |
| | `npm run build:netlify` | Static export for Netlify |
| **Test** | `npm run test` | Jest unit tests |
| | `npm run test:e2e` | Playwright E2E tests |
| | `npm run test:e2e:ui` | E2E with Playwright UI |
| **Quality** | `npm run type-check` | TypeScript validation |
| | `npm run lint` | ESLint code quality |

## Technology Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Payload CMS 3.x
- **Database**: SQLite (dev) / PostgreSQL (prod) - see `Supporting-Docs/database-migration/`
- **UI**: shadcn/ui + Tailwind CSS
- **Testing**: Jest + Playwright

## Project Structure

```
app/                    # Next.js App Router pages
  [entity]/page.tsx     # List pages (vendors, products, blog)
  [entity]/[slug]/      # Detail pages
  api/                  # API routes
components/             # Shared UI components (shadcn/ui)
lib/
  payload-cms-data-service.ts  # Core data access layer
  types.ts              # TypeScript definitions
  services/             # Business logic services
payload/
  collections/          # CMS collection schemas
payload.config.ts       # Payload CMS configuration
```

## Architecture Overview

**Data Flow**: Payload CMS → PayloadCMSDataService (with caching) → Static Site Generation

**Core Collections**:
- `vendors` - Vendor/partner companies (unified model with `partner` boolean flag)
- `products` - Product catalog with vendor relationships
- `categories`, `blog`, `team`, `company` - Supporting content

**Key Patterns**:
- Static-first: All pages pre-built at build time
- Vendor-Partner unification: Single `Vendor` model, `partner` flag distinguishes types
- In-memory caching for build performance

## Key Features (See Supporting-Docs for Details)

| Feature | Summary | Documentation |
|---------|---------|---------------|
| **Multi-Location** | Vendors manage multiple locations with geocoding, maps, tier limits | `Supporting-Docs/geocoding-*.md` |
| **Tier System** | 4-tier vendor subscriptions with upgrade/downgrade workflow | `Supporting-Docs/tier-*.md` |
| **Email Notifications** | Transactional emails via Resend for registration and tier changes | `Supporting-Docs/notification-system-*.md` |
| **PostgreSQL Migration** | Full PostgreSQL support with SQLite→Postgres migration tools | `Supporting-Docs/database-migration/` |

## Database Configuration

```bash
# SQLite (default for development)
DATABASE_URL=file:./data/payload.db

# PostgreSQL (production)
DATABASE_URL=postgresql://user:pass@localhost:5432/ptnextjs
USE_POSTGRES=true
```

See `Supporting-Docs/database-migration/QUICK-REFERENCE.md` for full PostgreSQL setup.

## Environment Variables

```bash
# Required
PAYLOAD_SECRET=your_secret_here

# Email (optional)
RESEND_API_KEY=re_xxx
EMAIL_FROM_ADDRESS=notifications@domain.com
ADMIN_EMAIL_ADDRESS=admin@domain.com

# Production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Development Guidelines

1. **Content Management**: Use Payload CMS admin at `/admin`
2. **Data Access**: Use `PayloadCMSDataService` methods, not direct DB queries
3. **New Content Types**: Define in `payload.config.ts` → types in `lib/types.ts` → transform in data service
4. **Static Generation**: All data must be available at build time

## Troubleshooting

```bash
npm run stop:dev       # Fix port conflicts
npm run dev:clean      # Clean restart
npm run build          # Verify static generation works
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/payload-cms-data-service.ts` | Core data access layer |
| `lib/types.ts` | TypeScript definitions |
| `payload.config.ts` | CMS schema configuration |
| `app/layout.tsx` | Root layout with theme provider |
| `.agent-os/config.yml` | Agent OS configuration |

## References

- [Agent OS Framework](.agent-os/CLAUDE.md)
- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com)
