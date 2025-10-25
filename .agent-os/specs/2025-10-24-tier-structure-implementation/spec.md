# Spec Requirements Document

> Spec: Tier Structure Implementation
> Created: 2025-10-24

## Overview

Implement a comprehensive 4-tier subscription system for vendor profiles with progressive feature unlocking, tier-specific field visibility, and enhanced UI/UX for vendor profile management. This feature transforms the platform from a basic directory to a progressive profiling system that allows vendors to test the market with free basic listings before scaling to premium marketing services.

## User Stories

### Vendor Profile Enhancement

As a vendor user, I want to manage my company profile with access to features appropriate to my subscription tier, so that I can effectively showcase my business within my subscription level while understanding what additional features are available at higher tiers.

**Detailed Workflow:**
1. Vendor logs into dashboard and sees tier-appropriate profile editing interface
2. All available fields for current tier are editable with clear labels and help text
3. Premium fields (locked) are visible with upgrade prompts showing what tier unlocks them
4. Changes are saved with validation and immediate visual feedback
5. Profile preview shows how the profile appears to public visitors
6. Years in business is automatically calculated from founding year

### Public Profile Display

As a yacht industry professional, I want to view vendor profiles that display rich information based on their subscription tier, so that I can assess vendor credibility, capabilities, and offerings appropriate to their market positioning.

**Detailed Workflow:**
1. User searches for vendors or browses vendor listings
2. Vendor cards show tier-appropriate information (logo, description, key metrics)
3. Clicking vendor opens full profile with tier-specific sections
4. Free tier shows basic information, higher tiers progressively reveal more depth
5. All displayed information respects tier limits (e.g., locations, certifications, case studies)
6. Featured vendors (Tier 3) appear prominently in search results and category pages

### Admin Tier Management

As a platform administrator, I want to manage vendor subscription tiers and ensure field access is properly enforced, so that the business model is correctly implemented and vendors receive appropriate feature access.

**Detailed Workflow:**
1. Admin views vendor in CMS admin panel
2. Tier dropdown allows changing subscription level
3. Field visibility in admin reflects tier permissions
4. Tier changes trigger validation of existing data against new tier limits
5. Admin can override tier restrictions when necessary for special cases

## Spec Scope

1. **4-Tier Subscription Model Implementation** - Add Tier 3 (Promoted Visibility) and Free tier to existing structure, update all tier references throughout codebase
2. **Comprehensive Field Structure** - Implement all 40+ fields defined in tier structure document with proper types, validation, and tier-based access control
3. **Vendor Dashboard UI** - Create intuitive profile editing interface with tabbed sections, tier-aware field visibility, and upgrade prompts for locked features
4. **Public Profile Display** - Build tier-responsive vendor profile pages that progressively reveal features and vendor card components for listings
5. **Computed Fields Implementation** - Add "Founded Year" field and compute "Years in Business" automatically with current year calculation
6. **Tier Access Enforcement** - Implement hooks and middleware to validate tier-based field access, location limits, and feature availability
7. **Admin Tier Management** - Enhance CMS admin interface for tier assignment and feature flag management with audit logging

## Out of Scope

- Payment integration and subscription billing (future phase)
- Automated tier upgrade workflows based on payment
- Email notifications for tier changes or feature unlocks
- Analytics dashboard for tier performance metrics
- Migration scripts for existing vendor data (will handle in separate task)
- A/B testing framework for tier feature presentation

## Expected Deliverable

1. **Vendor Dashboard**: Fully functional profile editing interface with tabbed navigation, tier-appropriate field visibility, inline validation, and upgrade prompts for premium features
2. **Public Profiles**: Tier-responsive vendor profile pages that display rich content for higher tiers while maintaining clean presentation for free tier, with proper handling of all field types (arrays, rich text, media)
3. **Vendor Cards**: Responsive card components for listings that show tier-appropriate information with visual tier indicators and featured badges for Tier 3 vendors
4. **CMS Admin Integration**: Enhanced admin interface with tier management, field conditional visibility, and validation that prevents tier limit violations
5. **Automated Tests**: Comprehensive test coverage including unit tests for tier validation logic, integration tests for dashboard functionality, and E2E tests for complete vendor profile workflows
6. **Computed Fields**: Functioning "Years in Business" field that automatically calculates from "Founded Year" with proper handling of edge cases (future years, null values)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
