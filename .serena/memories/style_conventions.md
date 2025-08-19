# Code Style and Conventions

## TypeScript
- Full TypeScript usage throughout the project
- Strict type checking enabled
- Type definitions in dedicated files (lib/types.ts)

## Code Style
- ESLint with Next.js config
- Prettier for formatting
- Component-based architecture
- Functional components with hooks

## File Organization
- `app/` - Next.js app router structure
- `components/` - Reusable UI components
- `components/ui/` - shadcn/ui components
- `lib/` - Utility functions and data access
- `hooks/` - Custom React hooks
- Private components in `_components/` folders

## Naming Conventions
- Components: PascalCase (e.g., `HeroSection`)
- Files: kebab-case (e.g., `hero-section.tsx`)
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Component Patterns
- Client components explicitly marked with 'use client'
- Server components by default
- Separate client wrapper components when needed
- Props interfaces defined inline or in types.ts