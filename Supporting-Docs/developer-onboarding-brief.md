# Developer Onboarding Brief

**Project**: Paul Thames Superyacht Technology
**Last Updated**: January 2026
**Version**: 2.0.0

---

## Quick Start

```bash
npm install
npm run dev              # Start dev server (http://localhost:3000)
                         # CMS Admin: http://localhost:3000/admin
npm run type-check       # Verify TypeScript
npm run test:e2e         # Run Playwright tests
```

---

## 1. Technology Stack (Verified)

| Technology | Version | Notes |
|------------|---------|-------|
| **Next.js** | 15.5.9 | App Router |
| **React** | 19.2.0 | - |
| **TypeScript** | 5.2.2 | Strict mode enabled |
| **Payload CMS** | 3.60.0 | Database-backed CMS |
| **Tailwind CSS** | 3.3.3 | With tailwindcss-animate |
| **shadcn/ui** | - | Radix UI primitives |
| **PostgreSQL/SQLite** | - | PostgreSQL (prod), SQLite (dev fallback) |
| **Playwright** | 1.55.0 | E2E testing |
| **Jest** | 30.1.3 | Unit testing |

### Key Libraries
- **Form handling**: React Hook Form 7.53.0 + Zod 3.23.8
- **Icons**: Lucide React 0.446.0
- **Animation**: Framer Motion 12.23.12
- **Theme**: next-themes 0.3.0
- **Data fetching**: SWR 2.2.4, TanStack Query 5.0.0
- **Email**: Resend 6.5.2

---

## 2. Project Structure

```
ptnextjs/
├── app/                          # Next.js App Router
│   ├── (site)/                   # Public website routes
│   │   ├── page.tsx              # Homepage
│   │   ├── vendors/              # Vendor listings & details
│   │   ├── products/             # Product catalog
│   │   ├── blog/                 # Blog section
│   │   ├── vendor/               # Vendor portal (login, dashboard)
│   │   │   ├── dashboard/        # Authenticated vendor area
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── ...
│   ├── (payload)/                # Payload CMS admin routes
│   ├── admin/                    # CMS admin interface
│   ├── api/                      # API routes
│   └── globals.css               # SINGLE global stylesheet
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui base components
│   ├── dashboard/                # Dashboard-specific
│   ├── vendor/                   # Vendor-specific
│   └── ...
│
├── lib/                          # Core application logic
│   ├── payload-cms-data-service.ts  # PRIMARY data access layer
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   ├── services/                 # Business logic services
│   ├── repositories/             # Data repositories
│   ├── transformers/             # Payload → App type transformers
│   ├── validation/               # Zod schemas
│   └── cache/                    # Caching layer
│
├── payload/                      # Payload CMS configuration
│   └── collections/              # Collection schemas
│
├── tests/
│   └── e2e/                      # Playwright E2E tests ONLY
│
└── Supporting-Docs/              # Analysis, documentation
```

### Key Patterns

1. **Route Groups**: `(site)` for public pages, `(payload)` for CMS
2. **Co-located components**: Page-specific components in `_components/` subdirectories
3. **Shared components**: Root `components/` folder
4. **Tests co-located**: Unit tests in `__tests__/` next to source files

---

## 3. Styling System (Centralized)

### Single CSS File Rule
**All CSS lives in `app/globals.css`**. This is non-negotiable.

There are NO scattered `.css` files. Custom styles are added to `globals.css` only.

### How Styling Works

```
globals.css
├── @tailwind directives
├── CSS Variables (--background, --foreground, --accent, etc.)
├── Light/Dark theme definitions
├── Custom utility classes
└── Component-specific overrides
```

### Tailwind Configuration

**Config file**: `tailwind.config.ts`

```typescript
// Semantic color tokens via CSS variables
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: { DEFAULT: "hsl(var(--primary))", foreground: "..." },
  accent: { DEFAULT: "hsl(var(--accent))", foreground: "..." },
  // ... etc
}
```

### Styling Components

**Always use Tailwind utility classes directly on elements:**

```tsx
// CORRECT
<div className="bg-background text-foreground p-4 rounded-lg">
  <h2 className="font-cormorant text-2xl">Title</h2>
</div>

// WRONG - No separate CSS files
// styles.module.css  <-- DO NOT CREATE THESE
```

### Custom Fonts
- **Headings**: Cormorant (serif) via `font-cormorant`
- **Body**: Poppins (sans-serif) via `font-poppins-light` / `font-poppins-medium`

### Theme Support
- Light/dark mode via `next-themes`
- CSS variables automatically switch based on `.dark` class
- Use semantic colors (`bg-background`, `text-foreground`) not hard-coded values

---

## 4. Component Architecture

### shadcn/ui Components
Located in `components/ui/`. These are the building blocks.

```tsx
// Using shadcn/ui button
import { Button } from '@/components/ui/button';

<Button variant="accent" size="lg">Click Me</Button>
```

**Available variants** (from `buttonVariants`):
- `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `accent`

### Component Pattern

```tsx
// components/MyComponent.tsx
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      <h2 className="font-cormorant text-xl">{title}</h2>
    </div>
  );
}
```

### The `cn()` Utility
Always use for conditional class merging:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  className  // Allow parent overrides
)} />
```

---

## 5. Data Flow Architecture

### Central Data Service
**All data flows through `PayloadCMSDataService`** in `lib/payload-cms-data-service.ts`.

```
Payload CMS Database
        ↓
PayloadCMSDataService (with caching)
        ↓
    Transformers
        ↓
  App Types (lib/types.ts)
        ↓
   React Components
```

### Usage Pattern

```tsx
// In a Server Component or data fetching function
import PayloadCMSDataService from '@/lib/payload-cms-data-service';

const dataService = new PayloadCMSDataService();
const vendors = await dataService.getVendors();
const products = await dataService.getProducts();
```

### Key Data Service Methods
- `getVendors()`, `getVendor(slug)`
- `getProducts()`, `getProduct(id)`
- `getBlogPosts()`, `getBlogPost(slug)`
- `getCategories()`, `getTags()`
- `getCompanyInfo()`

### Type Definitions
All app types are in `lib/types.ts`:

```typescript
interface Vendor {
  id: string;
  slug: string;
  companyName: string;
  tier: 'free' | 'tier1' | 'tier2' | 'tier3';
  // ...
}
```

---

## 6. TypeScript Conventions

### Strict Mode
The project uses `"strict": true`. No `any` types without justification.

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Variables/functions | `camelCase` | `userName`, `calculateTotal()` |
| Classes/interfaces | `PascalCase` | `UserService`, `VendorRepository` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `API_BASE_URL` |
| Files (TS/JS) | `kebab-case` or `PascalCase.tsx` | `auth-service.ts`, `Button.tsx` |

### Type Patterns

```typescript
// Prefer interfaces for objects
interface User {
  id: string;
  email: string;
}

// Use types for unions
type UserRole = 'admin' | 'user' | 'vendor';

// Utility types
type PartialUser = Partial<User>;
type UserPreview = Pick<User, 'id' | 'email'>;
```

### Form Validation
Always use Zod for form validation:

```typescript
import { z } from 'zod';

const vendorSchema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  website: z.string().url().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;
```

---

## 7. Testing Standards

### Test File Locations

| Test Type | Location | Pattern |
|-----------|----------|---------|
| Unit tests | Co-located `__tests__/` | `*.test.ts(x)` |
| E2E tests | `tests/e2e/` | `*.spec.ts` |

### Running Tests

```bash
npm run test              # Jest unit tests
npm run test:e2e          # Playwright E2E (full suite)
npm run test:e2e:ui       # Playwright with UI
```

### E2E Test Tiers

| Tier | Duration | When to Run |
|------|----------|-------------|
| Smoke | ~5 min | Every commit |
| Core | ~20 min | Every PR |
| Full | ~60 min | Nightly |

### Key Testing Rules

1. **Playwright tests go in `tests/e2e/` ONLY** - Never mix frameworks
2. **Use `data-testid` for E2E selectors**
3. **No `page.waitForTimeout()`** - Use semantic waits
4. **Tests must have real assertions** - No `expect(true)`
5. **No `.only()` in committed code**

---

## 8. Environment Configuration

### Development
```bash
# .env.local
DATABASE_URL=file:./data/payload.db
PAYLOAD_SECRET=your_secret_here
```

### E2E Testing
```bash
# .env.e2e (loaded automatically)
DISABLE_RATE_LIMIT=true
DISABLE_EMAILS=true
MOCK_GEOCODING=true
DISABLE_CAPTCHA=true
```

### Production
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
USE_POSTGRES=true
PAYLOAD_SECRET=secure_production_secret
RESEND_API_KEY=re_xxx
```

---

## 9. Common Development Tasks

### Adding a New Page

1. Create route in `app/(site)/your-page/page.tsx`
2. Use Server Components for data fetching
3. Create client components in `_components/` if needed

```tsx
// app/(site)/your-page/page.tsx
import PayloadCMSDataService from '@/lib/payload-cms-data-service';

export default async function YourPage() {
  const dataService = new PayloadCMSDataService();
  const data = await dataService.getSomeData();

  return <YourPageClient data={data} />;
}
```

### Adding Custom Styles

**Add to `app/globals.css`** in the appropriate `@layer`:

```css
@layer base {
  .your-custom-class {
    @apply bg-background text-foreground;
    /* Custom CSS if needed */
  }
}
```

### Adding a shadcn/ui Component

```bash
npx shadcn@latest add [component-name]
```

Components are installed to `components/ui/`.

### Creating a Service

```typescript
// lib/services/YourService.ts
export class YourService {
  async doSomething(input: Input): Promise<Output> {
    // Implementation
  }
}
```

---

## 10. Issue Tracking (bd/beads)

This project uses **bd (beads)** for issue tracking. NOT markdown TODOs.

### Quick Commands

```bash
bd ready                  # See available work
bd update <id> --status in_progress  # Claim work
bd close <id>             # Complete work
bd sync                   # Sync with git (run at session end)
```

### Priority Levels
- `0`: Critical (security, data loss)
- `1`: High (major features)
- `2`: Medium (default)
- `3`: Low (polish)
- `4`: Backlog

---

## 11. Key Files Reference

| File | Purpose |
|------|---------|
| `lib/payload-cms-data-service.ts` | Central data access |
| `lib/types.ts` | TypeScript definitions |
| `app/globals.css` | All CSS (single file) |
| `tailwind.config.ts` | Tailwind configuration |
| `payload.config.ts` | CMS schema configuration |
| `playwright.config.ts` | E2E test configuration |
| `CLAUDE.md` | Project instructions for AI |
| `AGENTS.md` | AI agent guidelines |

---

## 12. Standards Documentation Accuracy Report

The following discrepancies were found between documented standards and actual implementation:

### `.agent-os/product/tech-stack.md` - OUTDATED

| Item | Documented | Actual |
|------|------------|--------|
| CMS | TinaCMS 2.2.5 | **Payload CMS 3.60.0** |
| Next.js | 14.2.5 | **15.5.9** |
| React | 18.2.0 | **19.2.0** |
| Data Service | TinaCMSDataService | **PayloadCMSDataService** |
| Content Storage | Markdown files | **PostgreSQL/SQLite** |

**Recommendation**: The tech-stack.md file should be updated to reflect the completed migration to Payload CMS.

### `.agent-os/standards/` - ACCURATE

The standards documents in this directory are accurate and should be followed:
- `global/coding-style.md` - Correct
- `global/conventions.md` - Correct
- `frontend/styling.md` - Correct (Tailwind multi-line pattern)
- `frontend/typescript-patterns.md` - Correct and comprehensive
- `naming-conventions.md` - Correct
- `testing-standards.md` - Correct

---

## Summary: Critical Rules

1. **CSS is centralized** - Only `app/globals.css`, no other CSS files
2. **Data flows through `PayloadCMSDataService`** - Never query Payload directly in components
3. **TypeScript strict mode** - No `any` without justification
4. **E2E tests in `tests/e2e/` only** - Never mix test frameworks
5. **Use bd (beads) for issue tracking** - Not markdown TODOs
6. **Use semantic Tailwind colors** - `bg-background` not `bg-white`
7. **Use `cn()` for class merging** - Always allow className overrides
8. **Run type-check before commits** - `npm run type-check`

---

*This document was generated by analyzing the actual codebase and fact-checking against documented standards.*
