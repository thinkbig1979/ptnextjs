# Spec Requirements Document

> Spec: Phase 3A - Enhanced Discovery & Premium Services
> Created: 2025-10-18

## Overview

Implement location-based vendor discovery with intelligent geographic matching and complete the subscription tier management system with enhanced premium profile features for Tier 2 and Tier 3 vendors. This phase establishes the foundation for monetization by enabling vendors to discover regional opportunities and upgrade their profiles with advanced marketing capabilities, while maintaining a functionality-first approach (payment integration deferred to Phase 3B).

## User Stories

### Vendor Discovery by Location

As a yacht owner or industry professional, I want to find marine technology vendors that serve my specific geographic region, so that I can connect with local service providers who can support my needs efficiently.

**Workflow**: User browses product categories (e.g., "Navigation Systems") and views products with technical specifications. When interested in a specific product, they click to view vendors offering that product. The system displays all vendors carrying that product, filtered and sorted by geographic proximity to the user's location or specified region. Vendors display their service regions on interactive maps, making it clear which providers can serve the user's area.

### Subscription Tier Selection

As a vendor, I want to view available subscription tiers with clear feature comparisons and pricing, so that I can choose the tier that best fits my business needs and marketing budget.

**Workflow**: Vendor logs into their dashboard and navigates to "Subscription" section. They see a comparison table showing Free, Tier 1 (Basic), and Tier 2 (Premium) tiers with feature breakdowns. Each tier clearly shows what capabilities it unlocks (e.g., certification badges, case studies, analytics). The vendor selects their desired tier and submits an upgrade request for admin approval (payment integration comes in Phase 3B).

### Premium Profile Enhancement

As a Tier 2 or Tier 3 vendor, I want to showcase my certifications, case studies, and advanced capabilities, so that I can differentiate my business and attract more qualified leads.

**Workflow**: After tier upgrade approval, vendor accesses enhanced profile editing features. Tier 2 vendors can add certification badges with verification details, upload case study content with project highlights, create rich media galleries (videos, 3D models), add team member profiles with expertise areas, and map their service regions geographically. Tier 3 vendors get all Tier 2 features plus comprehensive product catalogs with specifications/pricing, performance metrics dashboards, lead inquiry analytics, featured placement in search results, and priority support badges.

## Spec Scope

1. **Geographic Vendor Profiles** - Extend Payload CMS vendor schema with service region fields (countries, states/provinces, cities) and geographic coordinates for map display, enabling location-based filtering and search.

2. **Location-Based Search & Filtering** - Implement intelligent vendor discovery that matches products to regional vendors using category relationships (not hard-coded product-vendor links), with geographic filtering on vendor listing pages.

3. **Subscription Tier Selection UI** - Create tier comparison interface with feature breakdown cards, clear pricing display (preparation for Phase 3B payment integration), and upgrade/downgrade request workflow.

4. **Tier Upgrade Request System** - Build admin-approved tier change workflow with vendor-initiated requests, admin approval queue, automated tier assignment after approval, and notification system for request status updates.

5. **Enhanced Tier Gates** - Refine existing TierGate component with granular feature access control throughout vendor dashboard, clear messaging about tier requirements, and strategically placed upgrade CTAs at restriction points.

6. **Admin Tier Management Tools** - Develop admin interface for manual tier assignment with bulk operations, tier change history/audit log, and override capabilities for special cases.

7. **Tier 2 Profile Features** - Implement advanced certification display with verification badges, case study showcase with project highlights, enhanced media galleries (video, 3D models), team member profiles with expertise areas, and service region mapping with geographic coverage.

8. **Tier 3 Premium Features** - Build comprehensive product catalog with specifications and pricing, performance metrics and ROI tracking dashboards, lead inquiry analytics and management, featured placement logic in search results, and priority support badge/contact options.

## Out of Scope

- **Payment Processing Integration** - Stripe integration and automated billing deferred to Phase 3B (functionality-first approach)
- **Email Marketing Tools** - Campaign management and bulk email services deferred to Phase 3C
- **CRM Integration** - HubSpot/Salesforce lead scoring and pipeline integration deferred to Phase 3C
- **Advanced Analytics Platform** - Comprehensive vendor success metrics and competitive analysis deferred to Phase 3C
- **AI-Powered Matching** - Machine learning-based vendor-buyer matching algorithms deferred to Phase 4
- **Public User Accounts** - This phase focuses on vendor profiles; buyer/user accounts remain out of scope

## Expected Deliverable

1. **Location-Based Vendor Discovery** - Users can filter vendors by geographic region on product and vendor listing pages, with interactive maps showing vendor service areas and intelligent category-based product-to-vendor matching.

2. **Functional Tier Management System** - Vendors can view tier comparison, submit upgrade/downgrade requests, and admins can approve tier changes with full audit trail, all without payment processing (manual approval replaces automated payment flow).

3. **Enhanced Profile Capabilities** - Tier 2 vendors can showcase certifications, case studies, media galleries, team profiles, and service regions; Tier 3 vendors access all Tier 2 features plus product catalogs, analytics dashboards, and featured placement, with all features properly gated and upgrade prompts in place.
