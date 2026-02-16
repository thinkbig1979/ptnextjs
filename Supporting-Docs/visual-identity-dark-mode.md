# Dark Mode Visual Identity Guide

**Paul Thames Superyacht Technology**

A comprehensive style guide for applying the web application's dark mode aesthetic to presentations, documents, and other media.

---

## Color Palette (Dark Mode)

### Core Colors

| Element | HSL | Hex | RGB | Usage |
|---------|-----|-----|-----|-------|
| **Background** | 240 100% 8% | `#000029` | 0, 0, 41 | Primary page background - deep navy |
| **Foreground** | 0 0% 96% | `#F5F5F5` | 245, 245, 245 | Primary text - near white |
| **Card** | 222 47% 16% | `#1F2847` | 31, 40, 71 | Card surfaces - lighter navy |
| **Border** | 215 28% 17% | `#2A2D47` | 42, 45, 71 | Subtle borders and dividers |
| **Muted Text** | 215 20% 65% | `#A4A6B8` | 164, 166, 184 | Helper text, placeholders |

### Brand & Accent

| Element | HSL | Hex | RGB | Usage |
|---------|-----|-----|-----|-------|
| **Accent (Orange)** | 18 100% 50% | `#FF8000` | 255, 128, 0 | CTAs, highlights, brand moments |
| **Accent Foreground** | 0 0% 100% | `#FFFFFF` | 255, 255, 255 | Text on accent backgrounds |

### Semantic Colors

| State | Hex | Usage |
|-------|-----|-------|
| **Success** | `#38B958` | Confirmations, completed states |
| **Warning** | `#FFA800` | Cautions, important notes |
| **Destructive** | `#D93A3A` | Errors, delete actions |

---

## Typography

### Font Families

| Type | Font | Weights | Usage |
|------|------|---------|-------|
| **Headings** | Cormorant (serif) | 300–700 | h1–h6, display text, card titles |
| **Body** | Poppins (sans-serif) | 300 (light), 500 (medium) | Body text, UI labels, badges |

### Size Scale

| Element | Desktop | Mobile | Line Height |
|---------|---------|--------|-------------|
| h1 | 48px (3rem) | 30px | 1.1 |
| h2 | 36px (2.25rem) | 24px | 1.2 |
| h3 | 30px (1.875rem) | 20px | 1.25 |
| h4 | 20px (1.25rem) | 16px | 1.3 |
| Body | 16px (1rem) | 16px | 1.5–1.6 |
| Small | 14px (0.875rem) | 14px | 1.5 |
| Badge | 12px (0.75rem) | 12px | 1.5 |

### Font Weights

- **Headings**: 600–700 (semibold to bold)
- **Body**: 300–400 (light to regular)
- **Badges/Labels**: 600 (semibold)

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Pixels |
|-------|-------|--------|
| xs | 0.25rem | 4px |
| sm | 0.5rem | 8px |
| md | 1rem | 16px |
| lg | 1.5rem | 24px |
| xl | 2rem | 32px |
| 2xl | 3rem | 48px |

### Border Radius

| Size | Value |
|------|-------|
| Base (lg) | 8px |
| Medium (md) | 6px |
| Small (sm) | 4px |
| Full | 9999px (pills/badges) |

### Container

- **Max-width**: 1400px
- **Padding**: 32px (2rem)

---

## Visual Effects

### Shadows

| Type | CSS | Usage |
|------|-----|-------|
| Subtle | `shadow-sm` | Cards at rest |
| Elevated | `shadow-lg` | Dialogs, dropdowns |
| Hover | `0 10px 25px rgba(0,0,0,0.3)` | Interactive lift |

### Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Default transition | 200–300ms | ease |
| Accordion | 200ms | ease-out |
| Fade-in | 600ms | ease-out |
| Slide-in | 600ms | ease-out |

### Special Effects

- **Glow**: Text shadow with accent color at 25px/50px blur
- **Hover lift**: translateY(-5px) with enhanced shadow

---

## Component Patterns

### Buttons

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| **Default** | White | Black | Primary actions |
| **Accent** | `#FF8000` | White | Featured/brand actions |
| **Secondary** | Navy | Light gray | Secondary actions |
| **Ghost** | Transparent | White | Minimal/tertiary |
| **Destructive** | `#D93A3A` | White | Delete/critical |

**Sizes**: Default 40px, Small 36px, Large 44px

### Cards

- Background: `#1F2847`
- Border: 1px `#2A2D47`
- Radius: 8px
- Padding: 24px
- Shadow: subtle (shadow-sm)
- Hover: lift effect

### Form Inputs

- Height: 40px
- Border: 1px `#2A2D47`
- Radius: 6px
- Focus: 2px ring in `#FF8000`

---

## Presentation Theme

### PowerPoint / Google Slides Setup

**Color Theme:**

| Role | Hex | Name |
|------|-----|------|
| Background | `#000029` | Deep Navy |
| Text 1 | `#F5F5F5` | Near White |
| Text 2 | `#A4A6B8` | Muted Gray |
| Accent 1 | `#FF8000` | Brand Orange |
| Accent 2 | `#1F2847` | Card Navy |
| Accent 3 | `#38B958` | Success Green |
| Accent 4 | `#D93A3A` | Alert Red |

**Font Theme:**

| Role | Font | Weight | Size (suggested) |
|------|------|--------|------------------|
| Title | Cormorant | Bold (700) | 44px |
| Subtitle | Cormorant | Regular (400) | 28px |
| Body | Poppins | Light (300) | 18px |
| Caption | Poppins | Light (300) | 14px |

**Slide Master Recommendations:**

1. **Background**: Solid `#000029`
2. **Title text**: `#FF8000` or `#F5F5F5`
3. **Body text**: `#F5F5F5`
4. **Dividers/lines**: `#2A2D47`
5. **Charts**: Use accent colors (`#FF8000`, `#38B958`, `#FFA800`)

---

## Do's & Don'ts

### Do

- Use Cormorant for headings, Poppins Light for body
- Apply `#FF8000` accent sparingly (15–20% of interface)
- Use `#F5F5F5` for text, not pure white
- Maintain 1.5+ line-height for readability
- Add subtle shadows for depth
- Keep focus rings visible for accessibility

### Don't

- Avoid pure white (#FFFFFF) text - too harsh
- Don't use background color for text (no contrast)
- Avoid heavy shadows in dark mode
- Don't mix more than 2 font families
- Avoid disabling focus states
- Don't animate for users with reduced-motion preference

---

## Accessibility Notes

- **Contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Focus**: 2px accent ring with 2px offset
- **Motion**: Respect `prefers-reduced-motion`
- **Min font size**: 14px body, 16px preferred on mobile

---

## Quick Reference Card

```
BACKGROUNDS
  Page:    #000029 (deep navy)
  Card:    #1F2847 (lighter navy)
  Input:   #2A2D47 (muted navy)

TEXT
  Primary: #F5F5F5 (near white)
  Muted:   #A4A6B8 (gray)

ACCENTS
  Brand:   #FF8000 (orange)
  Success: #38B958 (green)
  Warning: #FFA800 (amber)
  Error:   #D93A3A (red)

FONTS
  Headings: Cormorant, 600-700
  Body:     Poppins Light, 300

BORDER/RADIUS
  Color:  #2A2D47
  Radius: 8px (cards), 6px (buttons), 4px (inputs)
```
