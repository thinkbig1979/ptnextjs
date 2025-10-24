This CMS structure gives us a clear technical foundation to align with your refined business model.
Below is the **updated and fully reconciled vendor field and tier structure**, adapted to match your **4-tier subscription model** while maintaining internal consistency and expandability within your CMS.

I’ve also annotated certain fields that are newly emphasized or repositioned (e.g., “featured positioning” now correctly belongs to Tier 3 and above).

---

## **Paul Thames Discovery Platform – Updated Tier Framework**

### **Tier System Overview**

Your platform now operates on a **4-tier subscription model** for vendors, structured to align visibility, storytelling depth, and engagement level.

| Tier   | Label                                        | Access Level                                                                    |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------- |
| Free   | **Basic Company Profile**                    | 1 location (HQ only) + core fields for basic visibility                         |
| Tier 1 | **Enhanced Brand Profile**                   | Up to 3 locations + enhanced storytelling and credibility features              |
| Tier 2 | **Product Showcase Profile**                 | Unlimited locations + product management + featured visibility options          |
| Tier 3 | **Promoted Visibility & Editorial Features** | All Tier 2 features + on-platform promotion tools and editorial content options |

---

## **Field Access by Tier**

### **ALL TIERS (Free – Tier 3)**

Basic visibility across the platform.

**Basic Information**

* `user` – Associated user account
* `tier` – Subscription tier (admin-only modification)
* `companyName` – Company name
* `slug` – URL-friendly identifier
* `description` – Short company description
* `logo` – Company logo
* `contactEmail` – Contact email
* `contactPhone` – Contact phone number
* `partner` – Strategic partner flag
* `featured` – Featured vendor flag *(UI display conditional on Tier ≥ 3)*
* `published` – Publication status

**Location (legacy)**

* `location.address`, `latitude`, `longitude`, `city`, `country`
  *(Deprecated – use `locations[]` array instead)*

---

### **TIER 1+ (Enhanced Brand Profile and above)**

Adds credibility, proof points, and brand story depth.

**Social Media Links**

* `website`, `linkedinUrl`, `twitterUrl`

**Certifications Array**

* `certifications[].{name, issuer, year, expiryDate, certificateNumber, logo, verificationUrl}`

**Awards Array**

* `awards[].{title, organization, year, category, description, image}`

**Social Proof Metrics**

* `totalProjects`, `yearsInBusiness`, `employeeCount`,
  `linkedinFollowers`, `instagramFollowers`,
  `clientSatisfactionScore`, `repeatClientPercentage`

**Video Introduction**

* `videoUrl`, `videoThumbnail`, `videoDuration`,
  `videoTitle`, `videoDescription`

**Case Studies Array**

* `caseStudies[].{title, yachtName, yacht, projectDate, challenge, solution, results, testimonyQuote, testimonyAuthor, testimonyRole, images[], featured}`

**Innovation Highlights Array**

* `innovationHighlights[].{title, description, year, patentNumber, benefits[], image}`

**Team Members Array**

* `teamMembers[].{name, role, bio, photo, linkedinUrl, email, displayOrder}`

**Yacht Projects Array**

* `yachtProjects[].{yacht, yachtName, role, completionDate, systemsInstalled[], image, featured}`

**Extended Content**

* `longDescription` – Rich text
* `serviceAreas[]` – { `area`, `description`, `icon` }
* `companyValues[]` – { `value`, `description` }

---

### **TIER 1+ with Location Limits**

**Multi-Location Support**

* `locations[]` – Full location objects

  * `address`, `latitude`, `longitude`, `city`, `country`, `isHQ`

**Location Limits**

* Free Tier: 1 (HQ only)
* Tier 1: 3 locations max
* Tier 2 + Tier 3: Unlimited locations

---

### **TIER 2 – Product Showcase Profile**

Full product and advanced presentation capabilities.

**Product Management**

* Full CRUD access to Products collection
* Vendor-product relationship management

**Product Fields**

* `productName`, `slug`, `description`, `specifications`, `brochureDownload`, `manualDownload`, `imageGallery[]`, `categoryTags[]`
* Visibility in platform search and comparison tools

**Premium Features**

* `featuredInCategory` – Featured positioning within category listings (Tier 2 and above)
* `advancedAnalytics` – Profile and product performance metrics
* `apiAccess` – Integration capability for external systems
* `customDomain` – Optional custom URL mapping

**Display Behavior**

* All locations visible in search and maps
* Appears in category feature blocks and “Related Solutions” sections

---

### **TIER 3 – Promoted Visibility & Editorial Features**

The highest on-platform visibility level.

**On-Platform Promotion Tools**

* `promotionPack.featuredPlacement` – Homepage or category feature slots
* `promotionPack.editorialCoverage` – Inclusion in news or insight sections
* `promotionPack.searchHighlight` – Highlighted search result display

**Editorial Integration**

* `editorialContent[].{title, summary, body, image, publishDate}`
  *(For PT-curated editorials and feature articles)*

**Analytics Enhancements**

* Campaign performance tracking for active promotions

---

## **Search & Public Display Behavior by Tier**

| Tier   | Locations Visible | Appears in Search                    | Featured Options                       |
| ------ | ----------------- | ------------------------------------ | -------------------------------------- |
| Free   | HQ only           | If HQ within radius                  | None                                   |
| Tier 1 | Up to 3           | If any listed location within radius | None                                   |
| Tier 2 | Unlimited         | All locations included               | Featured in category lists             |
| Tier 3 | Unlimited         | All locations included               | Homepage + Editorial Promotion Options |

---

### ✅ **Summary of Improvements**

* Tier structure expanded from 3 → 4 for better alignment with commercial messaging.
* “Featured in category listings” moved to Tier 2 and above (per your instruction).
* On-platform promotion split into defined fields (`promotionPack.*`) for clear CMS management.
* Product management and analytics fields clarified under Tier 2+.
* Tier names and descriptions aligned with marketing language (“Enhanced Brand Profile,” “Product Showcase Profile,” etc.).

