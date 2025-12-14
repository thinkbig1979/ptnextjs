# E2E Test Failures - Beads Tasks Summary

## Overview
Created beads tasks for all 76 E2E test failures organized into 13 epics with 76 subtasks.

**Total Tasks Created:** 89 (13 EPICs + 76 subtasks)

---

## Epic Summary

| Epic ID | Title | Subtasks | Status |
|---------|-------|----------|--------|
| ptnextjs-bu7h | EPIC: Fix Computed Fields E2E Tests | 6 | open |
| ptnextjs-hmz9 | EPIC: Fix Dashboard Integration E2E Tests | 3 | open |
| ptnextjs-io2s | EPIC: Fix Data Integrity E2E Tests | 3 | open |
| ptnextjs-08pd | EPIC: Fix Logout Functionality E2E Test | 1 | open |
| ptnextjs-u0t9 | EPIC: Fix Migration E2E Tests | 15 | open |
| ptnextjs-1voc | EPIC: Fix Mobile Viewport E2E Tests | 2 | open |
| ptnextjs-h8a9 | EPIC: Fix Notification E2E Tests | 11 | open |
| ptnextjs-7jit | EPIC: Fix Partner Filter E2E Tests | 4 | open |
| ptnextjs-emit | EPIC: Fix Product E2E Tests | 8 | open |
| ptnextjs-ly2w | EPIC: Fix Promotion Pack Form E2E Test | 1 | open |
| ptnextjs-hds7 | EPIC: Fix Tier Restriction Flow E2E Tests | 4 | open |
| ptnextjs-sq8w | EPIC: Fix Vendor E2E Tests | 8 | open |
| ptnextjs-2sgh | EPIC: Fix Verification E2E Tests | 10 | open |

---

## 1. EPIC: Fix Computed Fields E2E Tests (6 failures)
**Epic ID:** ptnextjs-bu7h

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-zkbu | Fix: Future year (2030) validation | computed-fields.spec.ts:69 | `npx playwright test computed-fields.spec.ts:69 --project=chromium` |
| ptnextjs-kat9 | Fix: Edge case foundedYear 1800 | computed-fields.spec.ts:93 | `npx playwright test computed-fields.spec.ts:93 --project=chromium` |
| ptnextjs-69qm | Fix: Year below minimum (1799) validation | computed-fields.spec.ts:124 | `npx playwright test computed-fields.spec.ts:124 --project=chromium` |
| ptnextjs-zt5w | Fix: Same computed value in dashboard and public profile | computed-fields.spec.ts:168 | `npx playwright test computed-fields.spec.ts:168 --project=chromium` |
| ptnextjs-79c4 | Fix: Immediate update of computed field after foundedYear change | computed-fields.spec.ts:222 | `npx playwright test computed-fields.spec.ts:222 --project=chromium` |
| ptnextjs-z3vv | Fix: Years in business display on vendor card | computed-fields.spec.ts:266 | `npx playwright test computed-fields.spec.ts:266 --project=chromium` |

**Expected Behavior:**
- Future years and years below 1800 should be treated as invalid
- foundedYear 1800 should be treated as valid edge case
- Computed "years in business" field should display consistently in dashboard and public profile
- Changes to foundedYear should update computed field immediately
- Vendor cards in listing should display years in business

---

## 2. EPIC: Fix Dashboard Integration E2E Tests (3 failures)
**Epic ID:** ptnextjs-hmz9

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-q2za | Fix: Basic Info Form Save | dashboard-integration.spec.ts:50 | `npx playwright test dashboard-integration.spec.ts:50 --project=chromium` |
| ptnextjs-j91c | Fix: Brand Story Founded Year & Computed Field | dashboard-integration.spec.ts:90 | `npx playwright test dashboard-integration.spec.ts:90 --project=chromium` |
| ptnextjs-0c3h | Fix: Optimistic Update & Error Handling | dashboard-integration.spec.ts:204 | `npx playwright test dashboard-integration.spec.ts:204 --project=chromium` |

**Expected Behavior:**
- Basic info form should save successfully
- Brand story form should handle foundedYear and computed field correctly
- Dashboard should handle optimistic updates and error scenarios properly

---

## 3. EPIC: Fix Data Integrity E2E Tests (3 failures)
**Epic ID:** ptnextjs-io2s

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-wo66 | Fix: CONCURRENT-01 Simultaneous profile updates | concurrent-updates.spec.ts:77 | `npx playwright test concurrent-updates.spec.ts:77 --project=chromium` |
| ptnextjs-pstn | Fix: ISOLATION-01 Prevent dirty reads | concurrent-updates.spec.ts:282 | `npx playwright test concurrent-updates.spec.ts:282 --project=chromium` |
| ptnextjs-jkvy | Fix: FK-02 Product-vendor relationship | foreign-key-constraints.spec.ts:138 | `npx playwright test foreign-key-constraints.spec.ts:138 --project=chromium` |

**Expected Behavior:**
- System should handle simultaneous profile updates without data corruption
- Dirty reads should be prevented with proper isolation
- Foreign key constraints should enforce product-vendor relationships

---

## 4. EPIC: Fix Logout Functionality E2E Test (1 failure)
**Epic ID:** ptnextjs-08pd

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-pdzb | Fix: Admin login page accessibility | logout-functionality.spec.ts:47 | `npx playwright test logout-functionality.spec.ts:47 --project=chromium` |

**Expected Behavior:**
- Admin login page should be accessible after logout

---

## 5. EPIC: Fix Migration E2E Tests (15 failures)
**Epic ID:** ptnextjs-u0t9

### Subtasks - Navigation (3):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-sqnw | Fix: Navigate to all main pages | migration.spec.ts:39 | `npx playwright test migration.spec.ts:39 --project=chromium` |
| ptnextjs-c1kl | Fix: Navigate vendors list to detail | migration.spec.ts:70 | `npx playwright test migration.spec.ts:70 --project=chromium` |
| ptnextjs-xjel | Fix: Navigate yachts list to detail | migration.spec.ts:104 | `npx playwright test migration.spec.ts:104 --project=chromium` |

### Subtasks - Content Display (2):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-w4pj | Fix: Display all yachts on /yachts page | migration.spec.ts:200 | `npx playwright test migration.spec.ts:200 --project=chromium` |
| ptnextjs-2lkc | Fix: Display team members on /team page | migration.spec.ts:230 | `npx playwright test migration.spec.ts:230 --project=chromium` |

### Subtasks - Relationships (2):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-hmiz | Fix: Display products on vendor detail | migration.spec.ts:273 | `npx playwright test migration.spec.ts:273 --project=chromium` |
| ptnextjs-al29 | Fix: Display supplier map on yacht detail | migration.spec.ts:288 | `npx playwright test migration.spec.ts:288 --project=chromium` |

### Subtasks - Enhanced Fields (5):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-sdg3 | Fix: Display vendor certifications | migration.spec.ts:314 | `npx playwright test migration.spec.ts:314 --project=chromium` |
| ptnextjs-qxmm | Fix: Display vendor awards | migration.spec.ts:329 | `npx playwright test migration.spec.ts:329 --project=chromium` |
| ptnextjs-xj86 | Fix: Display vendor case studies | migration.spec.ts:344 | `npx playwright test migration.spec.ts:344 --project=chromium` |
| ptnextjs-4ns2 | Fix: Display yacht timeline | migration.spec.ts:389 | `npx playwright test migration.spec.ts:389 --project=chromium` |
| ptnextjs-lp8n | Fix: Display yacht sustainability metrics | migration.spec.ts:410 | `npx playwright test migration.spec.ts:410 --project=chromium` |

### Subtasks - Rich Text (1):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-b224 | Fix: Render vendor Lexical to HTML | migration.spec.ts:430 | `npx playwright test migration.spec.ts:430 --project=chromium` |

### Subtasks - Error Detection (2):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-awcq | Fix: No console errors on major pages | migration.spec.ts:644 | `npx playwright test migration.spec.ts:644 --project=chromium` |
| ptnextjs-15t3 | Fix: No 404 errors on major pages | migration.spec.ts:676 | `npx playwright test migration.spec.ts:676 --project=chromium` |

**Expected Behavior:**
- All navigation paths should work without errors
- Content should display correctly on all pages
- Relationships between entities should be properly displayed
- Enhanced fields (certifications, awards, case studies, timelines, metrics) should render
- Lexical rich text should convert to HTML properly
- No console errors or 404 errors on major pages

---

## 6. EPIC: Fix Mobile Viewport E2E Tests (2 failures)
**Epic ID:** ptnextjs-1voc

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-yoiv | Fix: MOB-REG-02 Touch-friendly 44x44 targets | mobile-viewport.spec.ts:53 | `npx playwright test mobile-viewport.spec.ts:53 --project=chromium` |
| ptnextjs-p9zz | Fix: MOB-PUB-03 Contact actions on mobile | mobile-viewport.spec.ts:244 | `npx playwright test mobile-viewport.spec.ts:244 --project=chromium` |

**Expected Behavior:**
- Form inputs should meet minimum 44x44px touch target size
- Contact actions should work properly on mobile viewport

---

## 7. EPIC: Fix Notification E2E Tests (11 failures)
**Epic ID:** ptnextjs-h8a9

### Subtasks - Registration (1):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-oay0 | Fix: EMAIL-REG-05 Multiple registrations | registration-email.spec.ts:187 | `npx playwright test registration-email.spec.ts:187 --project=chromium` |

### Subtasks - Tier Changes (6):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-jikg | Fix: EMAIL-TIER-01 Upgrade admin notification | tier-change-email.spec.ts:94 | `npx playwright test tier-change-email.spec.ts:94 --project=chromium` |
| ptnextjs-t9wf | Fix: EMAIL-TIER-02 Approved upgrade notification | tier-change-email.spec.ts:131 | `npx playwright test tier-change-email.spec.ts:131 --project=chromium` |
| ptnextjs-iux0 | Fix: EMAIL-TIER-03 Rejected upgrade with reason | tier-change-email.spec.ts:159 | `npx playwright test tier-change-email.spec.ts:159 --project=chromium` |
| ptnextjs-bq17 | Fix: EMAIL-TIER-04 Downgrade admin notification | tier-change-email.spec.ts:197 | `npx playwright test tier-change-email.spec.ts:197 --project=chromium` |
| ptnextjs-fxbs | Fix: EMAIL-TIER-05 Approved downgrade notification | tier-change-email.spec.ts:234 | `npx playwright test tier-change-email.spec.ts:234 --project=chromium` |
| ptnextjs-cqnl | Fix: EMAIL-TIER-UI-02 Dashboard request status | tier-change-email.spec.ts:344 | `npx playwright test tier-change-email.spec.ts:344 --project=chromium` |

### Subtasks - Edge Cases (4):
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-be1u | Fix: EMAIL-TIER-EDGE-01 Cancelled request no email | tier-change-email.spec.ts:384 | `npx playwright test tier-change-email.spec.ts:384 --project=chromium` |
| ptnextjs-n371 | Fix: EMAIL-TIER-EDGE-02 Duplicate requests | tier-change-email.spec.ts:411 | `npx playwright test tier-change-email.spec.ts:411 --project=chromium` |
| ptnextjs-s36d | Fix: EMAIL-TIER-EDGE-03 Long notes accepted | tier-change-email.spec.ts:436 | `npx playwright test tier-change-email.spec.ts:436 --project=chromium` |
| ptnextjs-enbq | Fix: EMAIL-TIER-EDGE-04 Email failure resilience | tier-change-email.spec.ts:456 | `npx playwright test tier-change-email.spec.ts:456 --project=chromium` |

**Expected Behavior:**
- Multiple registrations should trigger separate email processes
- Tier upgrade/downgrade requests should trigger appropriate admin notifications
- Approved/rejected tier changes should notify vendors
- Dashboard should show tier request status
- Cancelled requests should not trigger emails
- System should handle duplicate requests, long notes, and email failures gracefully

---

## 8. EPIC: Fix Partner Filter E2E Tests (4 failures)
**Epic ID:** ptnextjs-7jit

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-4jn5 | Fix: Show only partner products filter | partner-filter-validation.spec.ts:4 | `npx playwright test partner-filter-validation.spec.ts:4 --project=chromium` |
| ptnextjs-i9bo | Fix: Show all products filter | partner-filter-validation.spec.ts:45 | `npx playwright test partner-filter-validation.spec.ts:45 --project=chromium` |
| ptnextjs-8why | Fix: Toggle partner/all vendor views | partner-filter-validation.spec.ts:80 | `npx playwright test partner-filter-validation.spec.ts:80 --project=chromium` |
| ptnextjs-05xz | Fix: Filter shows 10 partner products | partner-filter-validation.spec.ts:109 | `npx playwright test partner-filter-validation.spec.ts:109 --project=chromium` |

**Expected Behavior:**
- Partner filter should show only partner products
- All vendors filter should show all products
- Should toggle correctly between partner and all vendor views
- Partner filter should show exactly 10 partner products

---

## 9. EPIC: Fix Product E2E Tests (8 failures)
**Epic ID:** ptnextjs-emit

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-2qhd | Fix: No HTML tags in product description | product-description-rendering.spec.ts:27 | `npx playwright test product-description-rendering.spec.ts:27 --project=chromium` |
| ptnextjs-7e85 | Fix: Submit review without page reload | product-review-submission.spec.ts:24 | `npx playwright test product-review-submission.spec.ts:24 --project=chromium` |
| ptnextjs-wop4 | Fix: Show only 3 tabs | product-tabs-simplified.spec.ts:11 | `npx playwright test product-tabs-simplified.spec.ts:11 --project=chromium` |
| ptnextjs-5c74 | Fix: Default to Integration tab | product-tabs-simplified.spec.ts:33 | `npx playwright test product-tabs-simplified.spec.ts:33 --project=chromium` |
| ptnextjs-h76c | Fix: Switch between tabs correctly | product-tabs-simplified.spec.ts:38 | `npx playwright test product-tabs-simplified.spec.ts:38 --project=chromium` |
| ptnextjs-q8ng | Fix: Display Integration tab content | product-tabs-simplified.spec.ts:52 | `npx playwright test product-tabs-simplified.spec.ts:52 --project=chromium` |
| ptnextjs-mfni | Fix: Display Reviews tab content | product-tabs-simplified.spec.ts:60 | `npx playwright test product-tabs-simplified.spec.ts:60 --project=chromium` |
| ptnextjs-shia | Fix: Display Demo tab content | product-tabs-simplified.spec.ts:68 | `npx playwright test product-tabs-simplified.spec.ts:68 --project=chromium` |
| ptnextjs-qt0u | Fix: Proper grid layout for 3 tabs | product-tabs-simplified.spec.ts:76 | `npx playwright test product-tabs-simplified.spec.ts:76 --project=chromium` |

**Expected Behavior:**
- Product descriptions should not show raw HTML tags
- Review submission should work without page reload
- Product detail page should show exactly 3 tabs: Integration, Reviews, Demo
- Should default to Integration tab
- Tab switching should work correctly
- Each tab should display its specific content
- Tabs should have proper grid layout

---

## 10. EPIC: Fix Promotion Pack Form E2E Test (1 failure)
**Epic ID:** ptnextjs-ly2w

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-tghh | Fix: Verify Promotion Features Display | promotion-pack-form.spec.ts:37 | `npx playwright test promotion-pack-form.spec.ts:37 --project=chromium` |

**Expected Behavior:**
- Promotion features should display correctly in the form

---

## 11. EPIC: Fix Tier Restriction Flow E2E Tests (4 failures)
**Epic ID:** ptnextjs-hds7

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-yp4g | Fix: Free tier should not see tier1+ fields | tier-restriction-flow.spec.ts:89 | `npx playwright test tier-restriction-flow.spec.ts:89 --project=chromium` |
| ptnextjs-s85b | Fix: Tier1 vendor access tier1 fields | tier-restriction-flow.spec.ts:208 | `npx playwright test tier-restriction-flow.spec.ts:208 --project=chromium` |
| ptnextjs-9gpc | Fix: Tier2 vendor product management | tier-restriction-flow.spec.ts:291 | `npx playwright test tier-restriction-flow.spec.ts:291 --project=chromium` |
| ptnextjs-gnly | Fix: Display tier badge for each tier | tier-restriction-flow.spec.ts:338 | `npx playwright test tier-restriction-flow.spec.ts:338 --project=chromium` |

**Expected Behavior:**
- Free tier vendors should not see tier1+ restricted fields
- Tier1 vendors should access tier1-specific fields
- Tier2 vendors should see product management section
- Tier badges should display correctly for each tier level

---

## 12. EPIC: Fix Vendor E2E Tests (8 failures)
**Epic ID:** ptnextjs-sq8w

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-d6ru | Fix: Vendor card content display | vendor-card-listing.spec.ts:33 | `npx playwright test vendor-card-listing.spec.ts:33 --project=chromium` |
| ptnextjs-n0ta | Fix: Load map tiles successfully | vendor-map-detailed-test.spec.ts:6 | `npx playwright test vendor-map-detailed-test.spec.ts:6 --project=chromium` |
| ptnextjs-sjmi | Fix: Display map tiles with coordinates | vendor-map-tiles-test.spec.ts:6 | `npx playwright test vendor-map-tiles-test.spec.ts:6 --project=chromium` |
| ptnextjs-iqmu | Fix: Complete functional map display | vendor-map-verification.spec.ts:6 | `npx playwright test vendor-map-verification.spec.ts:6 --project=chromium` |
| ptnextjs-5236 | Fix: Tier 3 featured badge and editorial | vendor-profile-tiers.spec.ts:149 | `npx playwright test vendor-profile-tiers.spec.ts:149 --project=chromium` |
| ptnextjs-naoj | Fix: Display submitted review details | vendor-review-display.spec.ts:11 | `npx playwright test vendor-review-display.spec.ts:11 --project=chromium` |
| ptnextjs-ff4w | Fix: Allow name search | vendor-search-ux.spec.ts:53 | `npx playwright test vendor-search-ux.spec.ts:53 --project=chromium` |

**Expected Behavior:**
- Vendor cards should display logo, name, description, and tier badge
- Vendor maps should load tiles successfully
- Maps should display with proper coordinates
- Maps should be fully functional with tiles and markers
- Tier 3 vendors should show featured badge and editorial content
- Submitted reviews should display with all details
- Vendor name search should work correctly

---

## 13. EPIC: Fix Verification E2E Tests (10 failures)
**Epic ID:** ptnextjs-2sgh

### Subtasks:
| Task ID | Title | Test Location | Run Command |
|---------|-------|---------------|-------------|
| ptnextjs-7x3v | Fix: companyName to name mapping | verify-data-mapping.spec.ts:10 | `npx playwright test verify-data-mapping.spec.ts:10 --project=chromium` |
| ptnextjs-cr5v | Fix: Featured vendors before non-featured | verify-featured-priority.spec.ts:6 | `npx playwright test verify-featured-priority.spec.ts:6 --project=chromium` |
| ptnextjs-0jrk | Fix: Featured badge styling | verify-featured-priority.spec.ts:60 | `npx playwright test verify-featured-priority.spec.ts:60 --project=chromium` |
| ptnextjs-m5nr | Fix: No Products tab for free tier | verify-free-tier-product-restrictions.spec.ts:38 | `npx playwright test verify-free-tier-product-restrictions.spec.ts:38 --project=chromium` |
| ptnextjs-a5bd | Fix: Show Products tab for Tier 2+ | verify-free-tier-product-restrictions.spec.ts:69 | `npx playwright test verify-free-tier-product-restrictions.spec.ts:69 --project=chromium` |
| ptnextjs-z2zg | Fix: Products page excludes free tier vendors | verify-free-tier-product-restrictions.spec.ts:85 | `npx playwright test verify-free-tier-product-restrictions.spec.ts:85 --project=chromium` |
| ptnextjs-mepm | Fix: Product reviews display all elements | verify-product-reviews-full-display.spec.ts:10 | `npx playwright test verify-product-reviews-full-display.spec.ts:10 --project=chromium` |
| ptnextjs-2742 | Fix: Display category in Quick Info | verify-vendor-category.spec.ts:8 | `npx playwright test verify-vendor-category.spec.ts:8 --project=chromium` |
| ptnextjs-0906 | Fix: Display different categories | verify-vendor-category.spec.ts:33 | `npx playwright test verify-vendor-category.spec.ts:33 --project=chromium` |
| ptnextjs-008s | Fix: Display tags in Specializations | verify-vendor-category.spec.ts:57 | `npx playwright test verify-vendor-category.spec.ts:57 --project=chromium` |

**Expected Behavior:**
- companyName field should map to name correctly in save flow
- Featured vendors should display before non-featured vendors
- Featured badge should have correct styling
- Free tier vendors should NOT see Products tab
- Tier 2+ vendors should see Products tab
- Products page should exclude products from free tier vendors
- Product reviews should display all required elements
- Vendor categories should display in Quick Info section
- Different vendors should show different categories
- Tags should display in Specializations section

---

## Next Steps

1. **Priority Order**: Address epics in this recommended order:
   - Data Integrity (critical for database consistency)
   - Computed Fields (foundation for many features)
   - Dashboard Integration (depends on computed fields)
   - Migration Tests (validates core functionality)
   - Tier Restriction Flow (business logic)
   - Notifications (user communication)
   - Partner Filter (filtering functionality)
   - Product Tests (product features)
   - Vendor Tests (vendor features)
   - Verification Tests (data validation)
   - Mobile Viewport (mobile UX)
   - Logout Functionality (authentication)
   - Promotion Pack Form (single isolated issue)

2. **Run Tests in Isolation**: Each task includes the specific command to run only that test
   - Use `--project=chromium` to run in single browser
   - Run one test at a time to isolate issues
   - Do NOT run full test suite until individual fixes are verified

3. **Common Patterns to Watch For**:
   - Computed fields issues likely share root cause
   - Map display issues across multiple vendor tests suggest common mapping component issue
   - Product tab issues might be related to same tab component
   - Tier restriction issues may share common authorization logic

4. **Documentation**: Update this file as tasks are completed with:
   - Root cause identified
   - Fix applied
   - Test verification result

---

**Generated:** 2025-12-14
**Total Tasks:** 89 (13 epics + 76 subtasks)
**Test Framework:** Playwright
**Test Location:** /home/edwin/development/ptnextjs/e2e/
