# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-18-platform-vision-expansion/spec.md

> Created: 2025-09-18
> Version: 1.0.0

## Technical Requirements

### Git Branch Management
- Create new "platform-vision" branch from current main branch
- Maintain existing build and deployment configurations
- Preserve all current functionality during development

### Enhanced Company Profiles
- Extend TinaCMS vendor schema with new fields: certifications[], awards[], socialProof{}, videoUrl, caseStudies[], innovationHighlights[], teamMembers[]
- Add yacht project portfolio data structure with systems[] and yachts[] relationships
- Implement interactive organizational chart component with LinkedIn integration
- Create video player component for company introductions
- Build case study detail pages with challenge/solution narrative structure

### Advanced Product Profiles
- Implement comparison matrix component with side-by-side product display
- Add integration compatibility field to product schema
- Create downloadable PDF spec sheet functionality
- Build 360° image viewer component for product demos
- Implement owner review system with testimonial display
- Add performance metrics table component

### Yacht Profiles System
- Create new yacht content type in TinaCMS with fields: timeline[], supplierMap[], sustainabilityScore, customizations[], maintenanceHistory[]
- Build yacht card grid component matching existing vendor/product card design
- Implement yacht detail pages with timeline visualization
- Create interactive supplier map component showing contractor disciplines
- Add sustainability scoring display with CO₂ metrics
- Build maintenance history timeline component

### Content Management Integration
- Extend existing TinaCMSDataService with yacht data methods
- Maintain 5-minute caching strategy for all new content types
- Preserve existing reference resolution system for yacht-vendor-product relationships
- Add content validation for new schema fields
- Ensure static site generation compatibility

### UI/UX Consistency
- Use existing shadcn/ui component library for all new interfaces
- Maintain current Tailwind CSS design tokens and spacing
- Follow established card component patterns for yacht profiles
- Preserve existing navigation and layout structure
- Implement Framer Motion animations consistent with current site

### Performance Optimization
- Lazy load 360° product demos and video content
- Optimize yacht timeline and supplier map rendering
- Implement progressive image loading for enhanced media
- Maintain existing static generation build times
- Preserve current SEO optimization patterns

## External Dependencies

**@react-three/fiber** - 3D product demo rendering
- **Justification:** Required for 360° product visualization and interactive demos

**react-pdf** - PDF spec sheet generation and download
- **Justification:** Enables downloadable performance metrics and technical specifications

**framer-motion** - Enhanced animations for new interactive components
- **Justification:** Already in use, extending for yacht timeline and org chart animations

**react-player** - Video integration for company introductions
- **Justification:** Robust video player with multiple format support for company showcases