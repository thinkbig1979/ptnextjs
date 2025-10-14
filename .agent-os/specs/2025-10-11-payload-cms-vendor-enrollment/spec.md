# Spec Requirements Document

> Spec: Payload CMS Migration with Vendor Self-Enrollment
> Created: 2025-10-11

## Overview

Migrate the Marine Technology Discovery Platform from TinaCMS (markdown-based) to Payload CMS 3+ (database-backed) to enable vendor self-service enrollment and profile management. This migration will transition all existing content to a database-backed system using SQLite for local development (zero configuration) and PostgreSQL for production (scalability). All schema changes will be managed through Payload CMS migration functions to ensure database portability. The migration introduces a tiered subscription model where vendors can register, manage their profiles, and optionally add products/services based on their subscription level.

## User Stories

### Vendor Registration and Profile Management

As a marine technology vendor, I want to create an account and manage my company profile, so that I can gain visibility in the yachting market without relying on platform administrators.

**Workflow:** Vendors visit the platform, click "Register as Vendor," provide company name and contact information, and submit for admin approval. Once approved, they log in to access their profile dashboard where they can edit their basic company information (free tier), upgrade to enhanced profile features (tier 1), or add products and services (tier 2).

### Content Migration from TinaCMS to Payload CMS

As a platform administrator, I want all existing TinaCMS content automatically migrated to Payload CMS, so that we can switch to the new system without data loss or manual re-entry.

**Workflow:** Admin runs a migration script that reads all markdown files from the `/content` directory, transforms them into Payload CMS collection entries, uploads them to PostgreSQL database, validates data integrity, and creates a backup of the original markdown files. The admin verifies the migration by spot-checking content in the new Payload CMS admin interface.

### Tiered Vendor Access Control

As a platform administrator, I want vendors to have different levels of access based on their subscription tier, so that we can offer progressive profiling from free basic listings to premium product showcases.

**Workflow:** Admin defines three subscription tiers in Payload CMS: Free (basic company profile), Tier 1 (enhanced profile with additional fields), and Tier 2 (full product/service management). When vendors log in, their dashboard displays only the content types and fields available to their tier. The system prevents lower-tier vendors from accessing premium features through both UI restrictions and API-level validation.

## Spec Scope

1. **Payload CMS 3+ Integration** - Install and configure Payload CMS 3+ with SQLite (development) and PostgreSQL (production), replacing TinaCMS entirely
2. **Schema Management via Payload Migrations** - Use Payload CMS migration functions for all schema changes to ensure portability between SQLite and PostgreSQL
3. **Content Schema Migration** - Redesign and optimize content models (vendors, products, categories, blog, team, company) for Payload CMS while maintaining functional equivalence
4. **Automated Data Migration** - Build migration scripts to convert all markdown content to Payload CMS collections with validation and rollback capability
5. **Vendor Authentication System** - Implement email/password authentication with strong password requirements using Payload CMS built-in auth
6. **Role-Based Access Control** - Create Admin and Vendor roles with tiered vendor permissions (Free, Tier 1, Tier 2)
7. **Vendor Self-Enrollment** - Build registration flow with admin approval workflow and vendor dashboard for profile management
8. **Tiered Content Access** - Implement field-level and collection-level permissions based on vendor subscription tier
9. **Admin Approval Workflow** - Create admin interface to review, approve, or reject pending vendor registrations
10. **Frontend Integration** - Update Next.js frontend to consume Payload CMS APIs instead of markdown files
11. **Data Backup Strategy** - Preserve original markdown files as backup during and after migration

## Out of Scope

- Payment processing and subscription management (Stripe integration deferred to future phase)
- Advanced search functionality (Algolia or full-text search deferred)
- Email verification for vendor accounts
- Multi-user support per vendor company (one login per vendor)
- Two-factor authentication (2FA)
- OAuth integration (Google, LinkedIn login)
- Lead tracking and CRM integration
- Analytics and monitoring enhancements

## Expected Deliverable

1. **Functional Payload CMS 3+ Installation** - Payload CMS 3 running with SQLite (development) and PostgreSQL (production), accessible admin interface, all content types defined and functional, migrations working across both databases
2. **Complete Content Migration** - All TinaCMS content successfully migrated to Payload CMS with verified data integrity and markdown backup preserved
3. **Working Vendor Registration** - Vendors can register, await admin approval, receive approval notification, and log in to manage their tiered profile
4. **Tiered Access System** - Vendors with different subscription tiers see appropriate content types and fields, with backend validation preventing unauthorized access
5. **Updated Next.js Frontend** - Public-facing website displays migrated content from Payload CMS APIs with no functionality regression
6. **Admin Management Tools** - Admins can approve/reject vendor registrations, manage vendor tiers, and perform full CRUD operations on all content
7. **Database Portability** - All schema changes managed through Payload CMS migrations, ensuring smooth transition from SQLite (dev) to PostgreSQL (prod)
