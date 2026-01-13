---
version: 5.1.0
last-updated: 2026-01-02
---


# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

## Frontend Stack

- **App Framework**: Next.js latest stable
- **Language**: TypeScript
- **JavaScript Framework**: React latest stable
- **Build Tool**: Vite
- **Import Strategy**: Node.js modules
- **Package Manager**: pnpm
- **Node Version**: 22 LTS

### UI Component Architecture

- **UI Component Library**: shadcn/ui latest
  - **Type**: Unstyled, accessible component primitives
  - **Installation**: `npx shadcn-ui@latest add [component]`
  - **Customization**: Full control via TailwindCSS styling
  - **Common Components**: Button, Card, Dialog, Form, Input, Select, Table, etc.

- **CSS Framework**: TailwindCSS 4.0+
  - **Utility-First**: Compose styles with utility classes
  - **Responsive**: Mobile-first breakpoints (sm, md, lg, xl, 2xl)
  - **Dark Mode**: Class-based (`dark:` prefix)
  - **Customization**: Extended via `tailwind.config.ts`

- **Form Handling**: React Hook Form + Zod
  - **Validation**: Type-safe schema validation with Zod
  - **Integration**: Built-in shadcn Form components
  - **Error Handling**: Field-level and form-level error display

- **Icons**: Lucide React components
  - **Usage**: `import { IconName } from 'lucide-react'`
  - **Style**: Consistent, stroke-based icon set
  - **Sizing**: Responsive sizing via className props

- **Fonts**:
  - **Provider**: Google Fonts
  - **Loading**: Self-hosted for performance via Next.js Font Optimization
  - **Default**: Inter for UI, system fonts as fallback

### UI Architecture Patterns

- **Layout System**: CSS Grid + Flexbox
  - **Primary**: CSS Grid for page layouts
  - **Secondary**: Flexbox for component layouts
  - **Responsive**: Mobile-first with Tailwind breakpoints

- **Navigation Pattern**: Hybrid (Sidebar + Top Bar)
  - **Desktop**: Persistent sidebar navigation
  - **Mobile**: Collapsible hamburger menu
  - **Breadcrumbs**: Context-aware breadcrumb navigation
  - **Top Bar**: User menu, notifications, search

- **State Management**: React Context API (default)
  - **Global State**: Context for auth, theme, user preferences
  - **Server State**: React Query / SWR for API data caching
  - **Form State**: React Hook Form
  - **Alternative**: Zustand for complex client state (if needed)

- **Routing**: Next.js App Router
  - **File-Based**: App directory routing
  - **Layouts**: Nested layouts for consistent structure
  - **Protection**: Middleware for auth route guards

## Backend Stack

- **Primary Database**: PostgreSQL 17+
- **ORM**: Active Record
- **API Pattern**: REST APIs (default) or tRPC for type-safe APIs
- **Authentication**: NextAuth.js or JWT-based custom auth
- **Session Management**: Server-side sessions with encrypted cookies

## Infrastructure

- **Application Hosting**: Self-Hosted Docker Compose Stacks
- **Hosting Region**: Primary region based on user base
- **Database Hosting**: Digital Ocean Managed PostgreSQL
- **Database Backups**: Daily automated
- **Asset Storage**: Amazon S3
- **CDN**: CloudFront
- **Asset Access**: Private with signed URLs

## CI/CD

- **Platform**: GitHub Actions
- **Trigger**: Push to main/staging branches
- **Tests**: Run before deployment
- **Production Environment**: main branch
- **Staging Environment**: staging branch

## Notes for Project-Specific Overrides

When creating project-specific tech stack files (`.agent-os/product/tech-stack.md`), specify:

1. **UI Component Library**: If not using shadcn/ui, specify alternative:
   - Material-UI (MUI)
   - Ant Design
   - Chakra UI
   - Headless UI
   - Custom components

2. **CSS Approach**: If not using TailwindCSS, specify:
   - CSS Modules
   - Styled Components
   - Emotion
   - SCSS/Sass
   - Plain CSS

3. **Frontend Framework**: If not using React, specify:
   - Vue.js (with Pinia, Element Plus, etc.)
   - Svelte (with SvelteKit)
   - Angular

4. **State Management**: If different from defaults, specify:
   - Redux Toolkit
   - MobX
   - Zustand
   - Pinia (Vue)
   - Vuex (Vue)

5. **Navigation Pattern**: If different from hybrid, specify:
   - Sidebar-only
   - Top bar-only
   - Mobile-first with drawer
   - Tab-based navigation
