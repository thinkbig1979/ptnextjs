# Tier-Based Profile Rendering Audit

## Executive Summary

The vendor profile rendering system **implements most tier-based feature hiding correctly**, with 6 out of 7 profile components properly checking vendor tier before displaying tier-restricted content.

**Critical Gap Found**: The **VendorMediaGallery component lacks tier validation** and displays media content for all tiers when it should be restricted to Tier 1+ vendors.

The "Hide, don't delete" design principle is correctly implemented throughout - all tier-restricted data remains safely in the database and will reappear if a vendor upgrades.

## Tier Feature Matrix

| Feature | Free | Tier 1 | Tier 2 | Tier 3 | Status |
|---------|------|--------|--------|--------|--------|
| Basic Profile (name, logo, description) | ✓ | ✓ | ✓ | ✓ | Always visible |
| Contact Info (email, phone) | ✓ | ✓ | ✓ | ✓ | Always visible |
| Category & Tags | ✓ | ✓ | ✓ | ✓ | Always visible |
| Locations | 1 (HQ) | 1 (HQ) | 10 | Unlimited | Filtered display |
| Video Introduction | ✗ | ✓ | ✓ | ✓ | Tier1+ only |
| Social Proof Metrics | ✗ | ✓ | ✓ | ✓ | Tier1+ only |
| Service Areas | ✗ | ✓ | ✓ | ✓ | Tier1+ only |
| Company Values | ✗ | ✓ | ✓ | ✓ | Tier1+ only |
| Team Members | ✗ | ✓ | ✓ | ✓ | Tier1+ only |
| Certifications & Awards | ✗ | ✓ | ✓ | ✓ | Tier1+ only |
| Case Studies | ✗ | ✓ | ✓ | ✓ | Tier1+ only |
| Products | ✗ | ✗ | ✓ | ✓ | Tier2+ only |
| **Media Gallery** | ? | ? | ? | ? | **MISSING CHECK** |

## Component Audit Summary

| Component | Tier Check | Status |
|-----------|-----------|--------|
| VendorCaseStudiesSection | ✅ Line 27: `vendor.tier === 'free'` check | READY |
| VendorCertificationsSection | ✅ Line 27: `vendor.tier === 'free'` check | READY |
| VendorTeamSection | ✅ Line 28: `vendor.tier === 'free'` check | READY |
| VendorAboutSection | ✅ Lines 30-43: Multiple tier checks for subsections | READY |
| LocationsDisplaySection | ✅ Lines 75-93: Tier-aware location filtering | READY |
| VendorProductsSection | ✅ Line 37: Tier2+ check | READY |
| VendorHero | ✅ Line 90: Product count Tier2+ only | READY |
| **VendorMediaGallery** | ❌ No tier check | **NEEDS FIX** |

## Critical Fix Required

### VendorMediaGallery.tsx

**Location**: `components/vendors/VendorMediaGallery.tsx`

**Current Issue**: No tier validation - displays media to all tiers including Free.

**Required Changes**:
1. Add `vendorTier` prop to component interface
2. Add tier check to return null for Free tier
3. Update profile page to pass tier prop

## Risk Assessment: Tier 3 → Tier 1 Downgrade

**Hidden from Public Profile**:
- ✅ Products Tab - Disappears from tab list
- ✅ Locations - Only HQ visible on map
- ✅ Case Studies - Hidden completely
- ✅ Certifications & Awards - Hidden completely
- ✅ Team Members - Hidden completely
- ✅ Video & Social Proof - Hidden from About section
- ⚠️ **Media Gallery - STILL VISIBLE** (gap)

**Data Integrity**: All data preserved in database - can be restored on re-upgrade.

## Files to Modify

1. `components/vendors/VendorMediaGallery.tsx` - Add tier check
2. `app/(site)/vendors/[slug]/page.tsx` (Line 211) - Pass vendorTier prop

---

Audit completed: December 5, 2025
