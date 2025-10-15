# Spec Requirements Document

> Spec: Complete TinaCMS to Payload CMS Migration
> Created: 2025-10-14

## Overview

Complete the migration of all TinaCMS content schema and fields to Payload CMS, replacing the current minimal implementation with full feature parity. This migration will transition the entire application from markdown-based content management (TinaCMS) to a database-backed CMS (Payload CMS), enabling vendor self-service while preserving all existing rich content capabilities.

## User Stories

### Complete Content Schema Migration

As a platform administrator, I want all TinaCMS content fields migrated to Payload CMS collections, so that no content functionality is lost during the CMS transition and vendors can manage comprehensive profiles through the database-backed system.

**Workflow**: Admin reviews TinaCMS schema (vendors, products, yachts, blog posts, team members, company info, categories, tags) and verifies that ALL fields are present in corresponding Payload collections with proper field types, validation, and relationships. Migration includes complex nested structures (certifications, awards, case studies, comparison metrics, visual demos, yacht timelines, supplier maps, maintenance history) as Payload array/group fields.

### Frontend Data Layer Migration

As a developer, I want the entire frontend to fetch data exclusively from Payload CMS REST API instead of TinaCMS markdown files, so that the application uses the new database-backed content management system throughout.

**Workflow**: Developer updates all data fetching logic in Next.js app to use PayloadCMSDataService instead of TinaCMSDataService. All pages (vendor detail, product detail, yacht profiles, blog posts, team pages) retrieve data from Payload CMS API. Static generation continues to work with Payload data source.

### Content Data Migration

As a platform administrator, I want existing TinaCMS markdown content automatically migrated to Payload CMS database, so that all current vendors, products, and content are preserved in the new system without manual re-entry.

**Workflow**: Admin runs migration scripts that read all markdown files from content/ directories (vendors, products, categories, blog posts, team members, company info, yachts), parse frontmatter and content, transform to Payload schema format, and insert into Payload CMS database via API. Migration includes validation, error handling, and rollback capabilities.

## Spec Scope

1. **Vendors Collection Enhancement** - Migrate ALL vendor fields from TinaCMS including certifications, awards, social proof (followers, projects completed, years in business), video introductions, case studies, innovation highlights, team members array, yacht projects portfolio, services array, statistics, achievements, and SEO settings.

2. **Products Collection Enhancement** - Migrate ALL product fields including product images array with ordering, features array, specifications array, benefits, installation services, pricing configuration, action buttons, quality badges, comparison metrics (performance, efficiency, reliability), integration compatibility matrix, owner reviews with ratings and yacht attribution, visual demos (360° images, 3D models, interactive hotspots), and complete SEO settings.

3. **New Collections Creation** - Create missing Payload collections for Yachts (with timeline, supplier map, sustainability metrics, customizations, maintenance history), Blog Posts (with rich text content, author, categories, tags), Team Members (with bio, role, image, LinkedIn), Company Info (global settings with mission, contact info, social media), Categories (product/blog categorization), and Tags (flexible tagging system).

4. **Complete Data Migration** - Migrate ALL existing markdown content from content/ directories to Payload database, preserving relationships (vendor ↔ products, categories ↔ products/vendors, tags ↔ content), media paths, rich text formatting, and maintaining data integrity throughout migration process.

5. **Frontend Integration Replacement** - Replace ALL instances of TinaCMSDataService with PayloadCMSDataService throughout the application, update all components to consume Payload data structures, ensure static site generation works with Payload data source, and maintain build performance with proper caching.

## Out of Scope

- TinaCMS UI removal (keep TinaCMS files for reference during migration but switch to Payload admin interface)
- Advanced Payload features like versions, drafts, or workflows (implement only basic published/unpublished)
- Real-time content preview (maintain static generation approach)
- Content localization/internationalization (not required in current phase)
- Advanced media management beyond basic file storage (can enhance later)

## Expected Deliverable

1. **Complete Payload Collections** - All 8+ Payload collections (Vendors, Products, Yachts, BlogPosts, TeamMembers, CompanyInfo, Categories, Tags) with full field parity to TinaCMS schema, proper validation, relationships, and access control configured.

2. **Successful Data Migration** - All existing markdown content successfully migrated to Payload database with zero data loss, all relationships intact, media paths correct, and validation passing for 100% of migrated content.

3. **Frontend Using Payload Exclusively** - Application fetches all data from Payload CMS API, zero dependencies on TinaCMS data service, all pages render correctly with Payload data, and static site generation builds successfully with proper performance (build time < 5 minutes for full site).
