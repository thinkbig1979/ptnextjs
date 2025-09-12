# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-12-two-pillar-landing-redesign/spec.md

> Created: 2025-09-12
> Version: 1.0.0

## Technical Requirements

### Next.js Component Modifications for Homepage

**Primary Components:**
- Modify `app/page.tsx` to implement two-pillar layout structure
- Create new `app/components/TwoPillarHero.tsx` component for main hero section
- Develop `app/components/PillarCard.tsx` reusable component for each business pillar presentation
- Create new `app/components/FounderProfileCard.tsx` component for founder profile display
- Update `app/components/Navigation.tsx` to support dual-offering structure
- Enhance `app/layout.tsx` if navigation changes require layout modifications

**Component Architecture:**
- Implement container-presenter pattern for pillar components
- Use composition over inheritance for pillar-specific content
- Maintain existing component naming conventions and file structure
- Preserve existing prop interfaces where applicable

### Tailwind CSS Styling Updates Using Existing Design System

**Layout Implementation:**
- Utilize existing Tailwind configuration and custom CSS variables
- Implement responsive grid system using `grid-cols-1 md:grid-cols-2` for pillar layout
- Preserve existing color scheme variables and theme switching functionality
- Maintain consistency with existing typography scale (`text-lg`, `text-xl`, etc.)
- Use existing spacing system (`space-y-8`, `gap-8`, etc.)

**Design System Adherence:**
- Maintain existing brand colors and gradients from current theme
- Preserve typography hierarchy and font families
- Use established border radius and shadow patterns
- Implement existing hover and transition effects
- Maintain consistent padding and margin patterns

### Component Structure for Two-Pillar Layout

**Hero Section Structure:**
```
TwoPillarHero
├── IntroSection (brand messaging)
├── PillarContainer
│   ├── PillarCard (Discovery Platform)
│   │   ├── PillarHeader
│   │   ├── PillarDescription
│   │   ├── FounderTeamSection
│   │   │   ├── FounderProfileCard (Thijs)
│   │   │   ├── FounderProfileCard (Nigel)
│   │   │   └── FounderProfileCard (Roel)
│   │   ├── PillarFeaturesList
│   │   └── PillarCTA
│   └── PillarCard (Bespoke Solutions)
│       ├── PillarHeader
│       ├── PillarDescription
│       ├── FounderTeamSection
│       │   └── FounderProfileCard (Edwin)
│       ├── PillarSpecialtiesList
│       └── PillarCTA
└── AdditionalContent (stats, consultation offer)
```

**State Management:**
- Use React hooks for any interactive state (theme, navigation)
- Maintain existing theme context and providers
- Implement client-side interactivity using existing patterns

### Founder Profile Card Component Requirements

**FounderProfileCard Component Structure:**
```typescript
interface FounderProfile {
  name: string;
  role: string;
  avatar?: string;
  specialties?: string[];
  description?: string;
}
```

**Visual Design Requirements:**
- Professional profile card with rounded avatar image placeholder
- Name and role clearly displayed with appropriate typography hierarchy  
- Subtle shadow and border consistent with existing card components
- Hover effects matching current component interaction patterns
- **Consistent sizing across all founder cards** (same dimensions for all founders regardless of pillar)
- Responsive scaling (cards scale proportionally on all screen sizes)
- Minimum width constraints to prevent layout inconsistencies

**Content Integration:**
- Support for future avatar image integration from TinaCMS
- Fallback to elegant initials-based avatar generation
- Role descriptions that align with pillar positioning
- Optional specialties/expertise areas display

**Accessibility Requirements:**
- Proper ARIA labels for profile information
- Keyboard navigation support
- Screen reader optimized content structure
- High contrast compliance for both light and dark themes

### Responsive Design Requirements

**Breakpoint Implementation:**
- Mobile (< 768px): Single column layout with stacked pillars
- Tablet (768px - 1024px): Two-column layout with adjusted spacing
- Desktop (> 1024px): Full two-pillar layout with optimal spacing
- Large Desktop (> 1280px): Maximum width constraints with centered content

**Touch and Interaction:**
- Ensure CTAs are appropriately sized for touch targets (44px minimum)
- Implement smooth scrolling and transitions for mobile navigation
- Maintain keyboard navigation accessibility across all breakpoints

### Integration with Existing TinaCMS Data Service

**Data Access Patterns:**
- Use existing `TinaCMSDataService` methods for content retrieval
- Maintain static generation compatibility with current data fetching patterns
- Preserve existing content structure and markdown file organization
- Implement content caching consistent with current 5-minute TTL strategy

**Content Integration:**
- Use existing company content from `content/company/` directory
- Integrate with current vendor and product data for supporting sections
- Maintain existing image optimization and transformation patterns
- Preserve current SEO metadata generation approach

### Preservation of Existing Theme Switching Functionality

**Theme Context Integration:**
- Maintain existing `ThemeProvider` and theme context implementation
- Preserve current dark/light mode toggle functionality
- Ensure new components respond to theme changes appropriately
- Maintain existing CSS custom property updates for theme switching

**Component Theme Compatibility:**
- Use existing theme-aware utility classes and CSS variables
- Implement theme-responsive styling for new pillar components and founder profile cards
- Preserve existing animation and transition behaviors during theme switches
- Ensure founder profile cards adapt properly to dark/light mode transitions
- Implement proper contrast ratios and accessibility in both themes

### Performance Requirements for Static Generation

**Build Performance:**
- Maintain compatibility with Next.js static export configuration
- Ensure new components are statically renderable at build time
- Preserve existing image optimization settings (unoptimized: true)
- Maintain current bundle size targets and code splitting patterns

**Runtime Performance:**
- Minimize JavaScript bundle impact of new components
- Use React.memo() for components that don't need frequent re-renders
- Implement lazy loading for non-critical pillar content
- Maintain existing Core Web Vitals performance metrics

**SEO and Metadata:**
- Preserve existing static generation SEO optimization
- Maintain current structured data and meta tag implementation
- Ensure new content is properly indexed for search engines
- Maintain existing trailing slash and URL structure requirements

## Approach

**Implementation Strategy:**
1. Create new components following existing architectural patterns
2. Implement responsive layout using established Tailwind utilities
3. Integrate with current TinaCMS data service without modifications
4. Test theme switching functionality across all new components
5. Validate static generation compatibility and performance

**Development Workflow:**
1. Component development in isolation with existing design system
2. Integration testing with current homepage structure
3. Responsive design validation across all breakpoints
4. Performance testing with static generation build process
5. Accessibility audit using existing WCAG compliance standards