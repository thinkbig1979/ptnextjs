# Field Mappings - TinaCMS to Payload CMS

> Created: 2025-10-14
> Task: PRE-1
> Author: integration-coordinator

## Overview

This document provides complete field mapping specifications for all 8 collections in the migration from TinaCMS markdown to Payload CMS database. Each table includes TinaCMS field names, Payload field names, data type conversions, default values for enhanced fields, and transformation logic.

---

## 1. Vendors Collection

### Base Fields

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `name` | `companyName` | string → string | (required) | Direct mapping |
| `slug` | `slug` | string → string | (required) | Direct mapping, must be unique |
| `description` | `description` | string → richText | `"Description coming soon."` | Extract from markdown body or frontmatter |
| `logo` | `logo` | string → string | `""` | Transform via `transformMediaPath()` |
| `image` | `image` | string → string | `""` | Transform via `transformMediaPath()` |
| `website` | `website` | string → string | `""` | Direct mapping |
| `founded` | `founded` | number → number | `undefined` | Direct mapping |
| `location` | `location` | string → string | `""` | Direct mapping |
| `featured` | `featured` | boolean → boolean | `false` | Direct mapping |
| `partner` | `partner` | boolean → boolean | `true` | **Default `true` for existing content** |
| `category` | `category` | fileRef → relationship | `null` | Resolve file path → database ID |
| `tags` | `tags` | fileRef[] → relationship[] | `[]` | Resolve file paths → database IDs |
| (N/A) | `published` | (N/A) | `true` | **New field - all existing content is published** |

### Services & Company Content

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `services` | `services` | array → array | `[]` | Map `{ service }` structure |
| `statistics` | `statistics` | array → array | `[]` | Map `{ label, value, order }` |
| `achievements` | `achievements` | array → array | `[]` | Map `{ title, description, icon, order }` |
| `mission` | (not in Payload) | string | (N/A) | **Deprecated - not migrated** |

### Enhanced Fields - Certifications

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `certifications[].name` | `certifications[].name` | string → string | `""` | Required field |
| `certifications[].issuer` | `certifications[].issuer` | string → string | `""` | Required field |
| `certifications[].year` | `certifications[].year` | number → number | `undefined` | Optional |
| `certifications[].expiryDate` | `certifications[].expiryDate` | string → date | `undefined` | Parse ISO date string |
| `certifications[].certificateUrl` | `certifications[].certificateUrl` | string → string | `undefined` | Direct mapping |
| `certifications[].logo` | `certifications[].logo` | string → string | `""` | Transform via `transformMediaPath()` |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Awards

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `awards[].title` | `awards[].title` | string → string | `""` | Required field |
| `awards[].year` | `awards[].year` | number → number | Current year | Required, defaults to current year if missing |
| `awards[].organization` | `awards[].organization` | string → string | `undefined` | Optional |
| `awards[].category` | `awards[].category` | string → string | `undefined` | Optional |
| `awards[].description` | `awards[].description` | string → richText | `undefined` | Optional, convert markdown if present |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Social Proof

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `socialProof.followers` | `socialProof.followers` | number → number | `undefined` | Optional |
| `socialProof.projectsCompleted` | `socialProof.projectsCompleted` | number → number | `undefined` | Optional |
| `socialProof.yearsInBusiness` | `socialProof.yearsInBusiness` | number → number | `undefined` | Optional |
| `socialProof.customerList` | `socialProof.customerList` | string[] → array | `[]` | Map customer names |

**Default if not present:** `undefined` (no social proof group)

### Enhanced Fields - Video Introduction

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `videoIntroduction.videoUrl` | `videoIntroduction.videoUrl` | string → string | `undefined` | Direct mapping |
| `videoIntroduction.thumbnailImage` | `videoIntroduction.thumbnailImage` | string → string | `""` | Transform via `transformMediaPath()` |
| `videoIntroduction.title` | `videoIntroduction.title` | string → string | `undefined` | Optional |
| `videoIntroduction.description` | `videoIntroduction.description` | string → textarea | `undefined` | Optional |

**Default if not present:** `undefined` (no video group)

### Enhanced Fields - Case Studies

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `caseStudies[].title` | `caseStudies[].title` | string → string | `""` | Required field |
| `caseStudies[].slug` | `caseStudies[].slug` | string → string | `""` | Required field |
| `caseStudies[].client` | `caseStudies[].client` | string → string | `undefined` | Optional |
| `caseStudies[].challenge` | `caseStudies[].challenge` | string → richText | `""` | Required, convert markdown |
| `caseStudies[].solution` | `caseStudies[].solution` | string → richText | `""` | Required, convert markdown |
| `caseStudies[].results` | `caseStudies[].results` | string → richText | `undefined` | Optional, convert markdown |
| `caseStudies[].images` | `caseStudies[].images` | string[] → array | `[]` | Transform each via `transformMediaPath()` |
| `caseStudies[].technologies` | `caseStudies[].technologies` | string[] → array | `[]` | Map technology names |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Innovation Highlights

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `innovationHighlights[].technology` | `innovationHighlights[].technology` | string → string | `""` | Required field |
| `innovationHighlights[].description` | `innovationHighlights[].description` | string → richText | `undefined` | Optional, convert markdown |
| `innovationHighlights[].uniqueApproach` | `innovationHighlights[].uniqueApproach` | string → textarea | `undefined` | Optional |
| `innovationHighlights[].benefitsToClients` | `innovationHighlights[].benefitsToClients` | string[] → array | `[]` | Map benefit strings |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Team Members

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `teamMembers[].name` | `teamMembers[].name` | string → string | `""` | Required field |
| `teamMembers[].position` | `teamMembers[].position` | string → string | `""` | Required field |
| `teamMembers[].bio` | `teamMembers[].bio` | string → richText | `undefined` | Optional, convert markdown |
| `teamMembers[].photo` | `teamMembers[].photo` | string → string | `""` | Transform via `transformMediaPath()` |
| `teamMembers[].linkedinUrl` | `teamMembers[].linkedinUrl` | string → string | `undefined` | Optional |
| `teamMembers[].expertise` | `teamMembers[].expertise` | string[] → array | `[]` | Map expertise areas |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Yacht Projects

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `yachtProjects[].yachtName` | `yachtProjects[].yachtName` | string → string | `""` | Required field |
| `yachtProjects[].systems` | `yachtProjects[].systems` | string[] → array | `[]` | Required, map system names |
| `yachtProjects[].projectYear` | `yachtProjects[].projectYear` | number → number | `undefined` | Optional |
| `yachtProjects[].role` | `yachtProjects[].role` | string → string | `undefined` | Optional |
| `yachtProjects[].description` | `yachtProjects[].description` | string → textarea | `undefined` | Optional |

**Default if not present:** `[]` (empty array)

### SEO Fields

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `seo.metaTitle` | `seo.metaTitle` | string → string | `undefined` | Optional |
| `seo.metaDescription` | `seo.metaDescription` | string → textarea | `undefined` | Optional |
| `seo.keywords` | `seo.keywords` | string → string | `undefined` | Optional |
| `seo.ogImage` | `seo.ogImage` | string → string | `""` | Transform via `transformMediaPath()` |

**Default if not present:** `undefined` (no SEO group)

---

## 2. Products Collection

### Base Fields

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `name` | `name` | string → string | (required) | Direct mapping |
| `slug` | `slug` | string → string | (required) | Direct mapping, must be unique |
| `description` | `description` | string → richText | (required) | Direct mapping |
| (derived) | `shortDescription` | (derived) | First 200 chars | Truncate description |
| `price` | `price` | string → string | `undefined` | Direct mapping |
| `vendor` OR `partner` | `vendor` | fileRef → relationship | `null` | Resolve file path → database ID |
| `category` | `categories` | fileRef → relationship[] | `[]` | Resolve file path → database ID, store in array |
| `tags` | `tags` | fileRef[] → relationship[] | `[]` | Resolve file paths → database IDs |
| (N/A) | `published` | (N/A) | `true` | **New field - all existing content is published** |

### Product Images

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `product_images[].image` | `images[].url` | string → string | `""` | Transform via `transformMediaPath()` |
| `product_images[].alt_text` | `images[].altText` | string → string | Product name | Fallback to product name |
| `product_images[].is_main` | `images[].isMain` | boolean → boolean | `false` | Direct mapping, first image defaults to true if none marked |
| `product_images[].caption` | `images[].caption` | string → string | `undefined` | Optional |
| (derived) | `images[].order` | (derived) | Array index | Auto-assign based on position |

### Features

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `features[].title` | `features[].title` | string → string | `""` | Required field |
| `features[].description` | `features[].description` | string → textarea | `undefined` | Optional |
| `features[].icon` | `features[].icon` | string → string | `undefined` | Lucide icon name |
| `features[].order` | `features[].order` | number → number | Array index | Auto-assign if not present |

**Default if not present:** `[]` (empty array)

### Specifications

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `specifications[].label` | `specifications[].label` | string → string | `""` | Required field |
| `specifications[].value` | `specifications[].value` | string → string | `""` | Required field |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Benefits

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `benefits[].benefit` | `benefits[].benefit` | string → string | `""` | Required field |
| `benefits[].icon` | `benefits[].icon` | string → string | `undefined` | Lucide icon name |
| `benefits[].order` | `benefits[].order` | number → number | Array index | Auto-assign if not present |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Services

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `services[].title` | `services[].title` | string → string | `""` | Required field |
| `services[].description` | `services[].description` | string → textarea | `""` | Required field |
| `services[].icon` | `services[].icon` | string → string | `undefined` | Lucide icon name |
| `services[].order` | `services[].order` | number → number | Array index | Auto-assign if not present |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Pricing

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `pricing.display_text` | `pricing.displayText` | string → string | `undefined` | Optional |
| `pricing.subtitle` | `pricing.subtitle` | string → string | `undefined` | Optional |
| `pricing.show_contact_form` | `pricing.showContactForm` | boolean → boolean | `false` | Direct mapping |
| `pricing.currency` | `pricing.currency` | string → string | `"USD"` | Default to USD |

**Default if not present:** `undefined` (no pricing group)

### Enhanced Fields - Action Buttons

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `action_buttons[].label` | `actionButtons[].label` | string → string | `""` | Required field |
| `action_buttons[].type` | `actionButtons[].type` | string → select | `"primary"` | Enum: primary, secondary, outline |
| `action_buttons[].action` | `actionButtons[].action` | string → select | `"contact"` | Enum: contact, quote, download, external_link, video |
| `action_buttons[].action_data` | `actionButtons[].actionData` | string → string | `undefined` | Optional URL or data |
| `action_buttons[].icon` | `actionButtons[].icon` | string → string | `undefined` | Lucide icon name |
| `action_buttons[].order` | `actionButtons[].order` | number → number | Array index | Auto-assign if not present |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Badges

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `badges[].label` | `badges[].label` | string → string | `""` | Required field |
| `badges[].type` | `badges[].type` | string → select | `"secondary"` | Enum: secondary, outline, success, warning, info |
| `badges[].icon` | `badges[].icon` | string → string | `undefined` | Lucide icon name |
| `badges[].order` | `badges[].order` | number → number | Array index | Auto-assign if not present |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Comparison Metrics

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `comparisonMetrics[].metricId` | `comparisonMetrics[].metricId` | string → string | `""` | Required field |
| `comparisonMetrics[].name` | `comparisonMetrics[].name` | string → string | `""` | Required field |
| `comparisonMetrics[].value` | `comparisonMetrics[].value` | number → number | `0` | Required field |
| `comparisonMetrics[].unit` | `comparisonMetrics[].unit` | string → string | `undefined` | Optional |
| `comparisonMetrics[].category` | `comparisonMetrics[].category` | string → select | `"performance"` | Enum: performance, efficiency, reliability, physical, environmental |
| `comparisonMetrics[].weight` | `comparisonMetrics[].weight` | number → number | `1.0` | 0.0 - 1.0 range |
| `comparisonMetrics[].toleranceMin` | `comparisonMetrics[].toleranceMin` | number → number | `undefined` | Optional |
| `comparisonMetrics[].toleranceMax` | `comparisonMetrics[].toleranceMax` | number → number | `undefined` | Optional |
| `comparisonMetrics[].benchmarkValue` | `comparisonMetrics[].benchmarkValue` | number → number | `undefined` | Optional |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Integration Compatibility

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `integrationCompatibility.supportedProtocols` | `integrationCompatibility.supportedProtocols` | string[] → array | `[]` | Map protocol names |
| `integrationCompatibility.systemRequirements.powerSupply` | `integrationCompatibility.systemRequirements.powerSupply` | string → string | `undefined` | Optional |
| `integrationCompatibility.systemRequirements.mounting` | `integrationCompatibility.systemRequirements.mounting` | string → string | `undefined` | Optional |
| `integrationCompatibility.systemRequirements.operatingTemp` | `integrationCompatibility.systemRequirements.operatingTemp` | string → string | `undefined` | Optional |
| `integrationCompatibility.systemRequirements.certification` | `integrationCompatibility.systemRequirements.certification` | string → string | `undefined` | Optional |
| `integrationCompatibility.systemRequirements.ipRating` | `integrationCompatibility.systemRequirements.ipRating` | string → string | `undefined` | Optional |
| `integrationCompatibility.compatibilityMatrix[].system` | `integrationCompatibility.compatibilityMatrix[].system` | string → string | `""` | Required field |
| `integrationCompatibility.compatibilityMatrix[].compatibility` | `integrationCompatibility.compatibilityMatrix[].compatibility` | string → select | `"none"` | Enum: full, partial, adapter, none |
| `integrationCompatibility.compatibilityMatrix[].notes` | `integrationCompatibility.compatibilityMatrix[].notes` | string → textarea | `undefined` | Optional |
| `integrationCompatibility.compatibilityMatrix[].requirements` | `integrationCompatibility.compatibilityMatrix[].requirements` | string[] → array | `[]` | Map requirement strings |
| `integrationCompatibility.compatibilityMatrix[].complexity` | `integrationCompatibility.compatibilityMatrix[].complexity` | string → select | `"moderate"` | Enum: simple, moderate, complex |
| `integrationCompatibility.compatibilityMatrix[].estimatedCost` | `integrationCompatibility.compatibilityMatrix[].estimatedCost` | string → string | `undefined` | Optional |

**Default if not present:** `undefined` (no integration compatibility group)

### Enhanced Fields - Owner Reviews

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `ownerReviews[].reviewId` | `ownerReviews[].reviewId` | string → string | `""` | Required field |
| `ownerReviews[].ownerName` | `ownerReviews[].ownerName` | string → string | `""` | Required field |
| `ownerReviews[].yachtName` | `ownerReviews[].yachtName` | string → string | `undefined` | Optional |
| `ownerReviews[].yachtLength` | `ownerReviews[].yachtLength` | string → string | `undefined` | Optional |
| `ownerReviews[].rating` | `ownerReviews[].rating` | number → number | `0` | Required, 0-5 range |
| `ownerReviews[].title` | `ownerReviews[].title` | string → string | `""` | Required field |
| `ownerReviews[].review` | `ownerReviews[].review` | string → textarea | `""` | Required field |
| `ownerReviews[].pros` | `ownerReviews[].pros` | string[] → array | `[]` | Map pro strings |
| `ownerReviews[].cons` | `ownerReviews[].cons` | string[] → array | `[]` | Map con strings |
| `ownerReviews[].installationDate` | `ownerReviews[].installationDate` | string → date | `undefined` | Parse ISO date |
| `ownerReviews[].verified` | `ownerReviews[].verified` | boolean → boolean | `false` | Direct mapping |
| `ownerReviews[].helpful` | `ownerReviews[].helpful` | number → number | `0` | Helpful votes count |
| `ownerReviews[].images` | `ownerReviews[].images` | string[] → array | `[]` | Transform each via `transformMediaPath()` |
| `ownerReviews[].useCase` | `ownerReviews[].useCase` | string → select | `undefined` | Enum: commercial_charter, private_use, racing, expedition, day_sailing |

**Default if not present:** `[]` (empty array)

### Enhanced Fields - Visual Demo

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `visualDemo.type` | `visualDemo.type` | string → select | `"360-image"` | Required, Enum: 360-image, 3d-model, video, interactive |
| `visualDemo.title` | `visualDemo.title` | string → string | `""` | Required field |
| `visualDemo.description` | `visualDemo.description` | string → textarea | `undefined` | Optional |
| `visualDemo.imageUrl` | `visualDemo.imageUrl` | string → string | `""` | For 360° images, transform via `transformMediaPath()` |
| `visualDemo.modelUrl` | `visualDemo.modelUrl` | string → string | `""` | For 3D models (.glb, .gltf) |
| `visualDemo.videoUrl` | `visualDemo.videoUrl` | string → string | `""` | For video demos |
| `visualDemo.hotspots[].positionX` | `visualDemo.hotspots[].positionX` | number → number | `0` | Required field |
| `visualDemo.hotspots[].positionY` | `visualDemo.hotspots[].positionY` | number → number | `0` | Required field |
| `visualDemo.hotspots[].title` | `visualDemo.hotspots[].title` | string → string | `""` | Required field |
| `visualDemo.hotspots[].description` | `visualDemo.hotspots[].description` | string → string | `undefined` | Optional |
| `visualDemo.hotspots[].action` | `visualDemo.hotspots[].action` | string → select | `"info"` | Enum: highlight, zoom, info, navigate |
| `visualDemo.animations` | `visualDemo.animations` | string[] → array | `[]` | Map animation names |
| `visualDemo.cameraPositions[].name` | `visualDemo.cameraPositions[].name` | string → string | `""` | Required field |
| `visualDemo.cameraPositions[].positionX` | `visualDemo.cameraPositions[].positionX` | number → number | `0` | Required field |
| `visualDemo.cameraPositions[].positionY` | `visualDemo.cameraPositions[].positionY` | number → number | `0` | Required field |
| `visualDemo.cameraPositions[].positionZ` | `visualDemo.cameraPositions[].positionZ` | number → number | `0` | Required field |

**Default if not present:** `undefined` (no visual demo group)

### SEO Fields

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `seo.metaTitle` | `seo.metaTitle` | string → string | `undefined` | Optional |
| `seo.metaDescription` | `seo.metaDescription` | string → textarea | `undefined` | Optional |
| `seo.keywords` | `seo.keywords` | string → string | `undefined` | Optional |
| `seo.ogImage` | `seo.ogImage` | string → string | `""` | Transform via `transformMediaPath()` |

**Default if not present:** `undefined` (no SEO group)

---

## 3. Yachts Collection (New)

### Base Fields

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `name` | `name` | string → string | (required) | Direct mapping |
| `slug` | `slug` | string → string | (required) | Direct mapping, must be unique |
| `description` | `description` | string → richText | (required) | Extract from markdown body or frontmatter |
| `image` | `image` | string → string | `""` | Main yacht image, transform via `transformMediaPath()` |
| `images` | `images` | string[] → array | `[]` | Gallery images, transform each via `transformMediaPath()` |
| `length` | `length` | number → number | `undefined` | Length in meters |
| `beam` | `beam` | number → number | `undefined` | Beam in meters |
| `draft` | `draft` | number → number | `undefined` | Draft in meters |
| `displacement` | `displacement` | number → number | `undefined` | Displacement in tons |
| `builder` | `builder` | string → string | `undefined` | Shipyard |
| `designer` | `designer` | string → string | `undefined` | Naval architect |
| `launchYear` | `launchYear` | number → number | `undefined` | Year launched |
| `deliveryYear` | `deliveryYear` | number → number | `undefined` | Year delivered |
| `homePort` | `homePort` | string → string | `undefined` | Home port |
| `flag` | `flag` | string → string | `undefined` | Flag country |
| `classification` | `classification` | string → string | `undefined` | Lloyd's Register, ABS, etc. |
| `cruisingSpeed` | `cruisingSpeed` | number → number | `undefined` | Knots |
| `maxSpeed` | `maxSpeed` | number → number | `undefined` | Knots |
| `range` | `range` | number → number | `undefined` | Nautical miles |
| `guests` | `guests` | number → number | `undefined` | Guest capacity |
| `crew` | `crew` | number → number | `undefined` | Crew capacity |
| `featured` | `featured` | boolean → boolean | `false` | Direct mapping |
| `category` | `category` | fileRef → relationship | `null` | Resolve file path → database ID |
| `tags` | `tags` | fileRef[] → relationship[] | `[]` | Resolve file paths → database IDs |
| (N/A) | `published` | (N/A) | `true` | **New field - all existing content is published** |

### Timeline

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `timeline[].date` | `timeline[].date` | string → date | `""` | Required, parse ISO date |
| `timeline[].event` | `timeline[].event` | string → string | `""` | Required field |
| `timeline[].description` | `timeline[].description` | string → textarea | `undefined` | Optional |
| `timeline[].category` | `timeline[].category` | string → select | `"milestone"` | Required, Enum: launch, delivery, refit, milestone, service |
| `timeline[].location` | `timeline[].location` | string → string | `undefined` | Optional |
| `timeline[].images` | `timeline[].images` | string[] → array | `[]` | Transform each via `transformMediaPath()` |

**Default if not present:** `[]` (empty array)

### Supplier Map

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `supplierMap[].vendor` | `supplierMap[].vendor` | fileRef → relationship | `null` | Required, resolve file path → database ID |
| `supplierMap[].discipline` | `supplierMap[].discipline` | string → string | `""` | Required field (Electronics, Lighting, etc.) |
| `supplierMap[].systems` | `supplierMap[].systems` | string[] → array | `[]` | Required, map system names |
| `supplierMap[].role` | `supplierMap[].role` | string → select | `"primary"` | Required, Enum: primary, subcontractor, consultant |
| `supplierMap[].projectPhase` | `supplierMap[].projectPhase` | string → string | `undefined` | Optional |

**Default if not present:** `[]` (empty array)

### Sustainability Score

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `sustainabilityScore.co2Emissions` | `sustainabilityScore.co2Emissions` | number → number | `undefined` | kg CO2 equivalent |
| `sustainabilityScore.energyEfficiency` | `sustainabilityScore.energyEfficiency` | number → number | `undefined` | kWh per nautical mile |
| `sustainabilityScore.wasteManagement` | `sustainabilityScore.wasteManagement` | string → select | `undefined` | Enum: excellent, good, fair, poor |
| `sustainabilityScore.waterConservation` | `sustainabilityScore.waterConservation` | string → select | `undefined` | Enum: excellent, good, fair, poor |
| `sustainabilityScore.materialSustainability` | `sustainabilityScore.materialSustainability` | string → select | `undefined` | Enum: excellent, good, fair, poor |
| `sustainabilityScore.overallScore` | `sustainabilityScore.overallScore` | number → number | `undefined` | 1-100 scale |
| `sustainabilityScore.certifications` | `sustainabilityScore.certifications` | string[] → array | `[]` | Map certification names |

**Default if not present:** `undefined` (no sustainability score group)

### Customizations

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `customizations[].category` | `customizations[].category` | string → string | `""` | Required field |
| `customizations[].description` | `customizations[].description` | string → textarea | `""` | Required field |
| `customizations[].vendor` | `customizations[].vendor` | string → string | `undefined` | Optional vendor name |
| `customizations[].images` | `customizations[].images` | string[] → array | `[]` | Transform each via `transformMediaPath()` |
| `customizations[].cost` | `customizations[].cost` | string → string | `undefined` | Optional cost information |
| `customizations[].completedDate` | `customizations[].completedDate` | string → date | `undefined` | Parse ISO date |

**Default if not present:** `[]` (empty array)

### Maintenance History

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `maintenanceHistory[].date` | `maintenanceHistory[].date` | string → date | `""` | Required, parse ISO date |
| `maintenanceHistory[].type` | `maintenanceHistory[].type` | string → select | `"routine"` | Required, Enum: routine, repair, upgrade, inspection |
| `maintenanceHistory[].system` | `maintenanceHistory[].system` | string → string | `""` | Required field |
| `maintenanceHistory[].description` | `maintenanceHistory[].description` | string → textarea | `""` | Required field |
| `maintenanceHistory[].vendor` | `maintenanceHistory[].vendor` | string → string | `undefined` | Optional vendor name |
| `maintenanceHistory[].cost` | `maintenanceHistory[].cost` | string → string | `undefined` | Optional cost information |
| `maintenanceHistory[].nextService` | `maintenanceHistory[].nextService` | string → date | `undefined` | Parse ISO date |
| `maintenanceHistory[].status` | `maintenanceHistory[].status` | string → select | `"completed"` | Required, Enum: completed, in-progress, scheduled |

**Default if not present:** `[]` (empty array)

### SEO Fields

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `seo.metaTitle` | `seo.metaTitle` | string → string | `undefined` | Optional |
| `seo.metaDescription` | `seo.metaDescription` | string → textarea | `undefined` | Optional |
| `seo.keywords` | `seo.keywords` | string → string | `undefined` | Optional |
| `seo.ogImage` | `seo.ogImage` | string → string | `""` | Transform via `transformMediaPath()` |
| `seo.canonicalUrl` | `seo.canonicalUrl` | string → string | `undefined` | Optional |
| `seo.noIndex` | `seo.noIndex` | boolean → boolean | `false` | Direct mapping |

**Default if not present:** `undefined` (no SEO group)

---

## 4. Blog Posts Collection

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `title` | `title` | string → string | (required) | Direct mapping |
| `slug` | `slug` | string → string | (required) | Direct mapping, must be unique |
| `excerpt` | `excerpt` | string → textarea | (required) | Direct mapping |
| `content` | `content` | markdown → richText | (required) | Convert markdown to Lexical JSON |
| `author` | `author` | string → relationship | `null` | Map to Users collection by email/name |
| `published_at` | `publishedAt` | string → date | Current date | Parse ISO date string |
| `featured_image` | `featuredImage` | string → string | `""` | Transform via `transformMediaPath()` |
| `blog_category` | `categories` | fileRef → relationship[] | `[]` | Resolve file path → database ID, store in array |
| `tags` | `tags` | fileRef[] → relationship[] | `[]` | Resolve file paths → database IDs |
| `featured` | `published` | boolean → boolean | `false` | Map featured to published status |
| `read_time` | `readTime` | string → string | `"5 min"` | Direct mapping |
| `seo.metaTitle` | `seo.metaTitle` | string → string | `undefined` | Optional |
| `seo.metaDescription` | `seo.metaDescription` | string → textarea | `undefined` | Optional |
| `seo.keywords` | `seo.keywords` | string → string | `undefined` | Optional |
| `seo.ogImage` | `seo.ogImage` | string → string | `""` | Transform via `transformMediaPath()` |

---

## 5. Team Members Collection

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `name` | `name` | string → string | (required) | Direct mapping |
| `role` | `role` | string → string | (required) | Direct mapping |
| `bio` | `bio` | string → richText | `""` | Convert markdown to Lexical if present |
| `image` | `image` | string → string | `""` | Transform via `transformMediaPath()` |
| `email` | `email` | string → email | `undefined` | Direct mapping |
| `linkedin` | `linkedin` | string → string | `undefined` | Direct mapping |
| `order` | `order` | number → number | `999` | Direct mapping, defaults to end of list |

---

## 6. Company Info Collection (Singleton)

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `name` | `name` | string → string | (required) | Direct mapping |
| `tagline` | `tagline` | string → string | `""` | Direct mapping |
| `description` | `description` | string → richText | `""` | Convert markdown to Lexical if present |
| `founded` | `founded` | number → number | Current year | Direct mapping |
| `location` | `location` | string → string | `""` | Direct mapping |
| `address` | `address` | string → textarea | `""` | Direct mapping |
| `phone` | `phone` | string → string | `""` | Direct mapping |
| `email` | `email` | string → email | (required) | Direct mapping |
| `story` | `story` | string → richText | `""` | Convert markdown to Lexical if present |
| `logo` | `logo` | string → string | `""` | Transform via `transformMediaPath()` |
| `socialMedia.facebook` | `socialMedia.facebook` | string → string | `undefined` | Direct mapping |
| `socialMedia.twitter` | `socialMedia.twitter` | string → string | `undefined` | Direct mapping |
| `socialMedia.linkedin` | `socialMedia.linkedin` | string → string | `undefined` | Direct mapping |
| `socialMedia.instagram` | `socialMedia.instagram` | string → string | `undefined` | Direct mapping |
| `socialMedia.youtube` | `socialMedia.youtube` | string → string | `undefined` | Direct mapping |
| `seo.metaTitle` | `seo.metaTitle` | string → string | `undefined` | Optional |
| `seo.metaDescription` | `seo.metaDescription` | string → textarea | `undefined` | Optional |
| `seo.keywords` | `seo.keywords` | string → string | `undefined` | Optional |
| `seo.ogImage` | `seo.ogImage` | string → string | `""` | Transform via `transformMediaPath()` |

---

## 7. Categories Collection

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| `name` | `name` | string → string | (required) | Direct mapping |
| `slug` | `slug` | string → string | (required) | Direct mapping, must be unique |
| `description` | `description` | string → textarea | `""` | Direct mapping |
| `icon` | `icon` | string → string | `""` | Lucide icon name or URL |
| `color` | `color` | string → string | `"#0066cc"` | Hex color code |
| `order` | `order` | number → number | `999` | Direct mapping, defaults to end of list |

---

## 8. Tags Collection (New)

| TinaCMS Field | Payload Field | Type Conversion | Default Value | Transformation Logic |
|---------------|---------------|----------------|---------------|---------------------|
| (extracted from content) | `name` | (derived) | (required) | Extract from content references |
| (derived from name) | `slug` | (derived) | (required) | Generate from name (lowercase, hyphenated) |
| (N/A) | `description` | (N/A) | `""` | Empty by default, can be filled manually |
| (N/A) | `color` | (N/A) | `"#0066cc"` | Default color, can be customized |
| (computed) | `usageCount` | (computed) | `0` | Count references in content (vendors, products, blog, yachts) |

**Note:** Tags are extracted during migration from all content that references them, then deduplicated and inserted into the Tags collection.

---

## Transformation Logic Summary

### Common Transformations

1. **Media Paths**: All image/media fields use `transformMediaPath()` utility
2. **Rich Text**: All long-form text fields use `convertMarkdownToLexical()` utility
3. **File References**: All relationship fields use `resolveFileReference()` utility
4. **Arrays**: All array fields use `transformArray()` utility with null filtering
5. **Dates**: All date fields parse ISO 8601 strings
6. **Enums**: All select fields validate against predefined options

### Default Value Strategy

- **Required fields without defaults**: Migration fails if missing
- **Optional fields**: Default to `undefined` or empty equivalent (`""`, `[]`, `{}`)
- **Boolean fields**: Default to `false` unless specified otherwise
- **Numeric fields**: Default to `undefined` for optional, `0` for counters
- **Enhanced fields**: Default to empty arrays `[]` or `undefined` for groups

---

## Verification Checklist

- [ ] All 8 collections have complete field mappings
- [ ] 100% TinaCMS field coverage (no fields missing)
- [ ] All enhanced fields have specified defaults
- [ ] Type conversions are explicit
- [ ] Relationship resolution strategy is clear
- [ ] Media path transformations are documented
- [ ] Markdown-to-Lexical conversions are specified
- [ ] Backward compatibility (vendor/partner) maintained
