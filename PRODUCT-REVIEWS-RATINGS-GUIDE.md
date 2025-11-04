# Product Reviews & Ratings Guide

## Overview

The platform has a **comprehensive owner reviews and ratings system** already built into the CMS and frontend. This allows yacht owners, captains, and crew to share their real-world experiences with products.

## CMS Schema (`payload/collections/Products.ts`, lines 860-1030)

### Owner Reviews Array Field

The `ownerReviews` field is a fully-featured review system with the following capabilities:

### 1. **Reviewer Information**
```typescript
{
  reviewerName: string (required, max 200 chars)
  reviewerRole: string (required, max 100 chars) // e.g., "Captain", "Owner", "Chief Engineer"
  yachtName?: string (max 200 chars)
  yacht?: relationship to 'yachts' collection // Link to yacht profile if exists
}
```

### 2. **Rating System**
```typescript
{
  overallRating: number (required, 1-5)

  ratings: {
    reliability: number (1-5)      // Product reliability
    easeOfUse: number (1-5)        // How easy to use
    performance: number (1-5)      // Performance quality
    support: number (1-5)          // Vendor support quality
    valueForMoney: number (1-5)    // Value for money
  }
}
```

**Rating Breakdown:**
- **Overall Rating**: Required 1-5 star rating
- **Detailed Ratings**: Optional breakdown by 5 categories
  - Reliability
  - Ease of Use
  - Performance
  - Support Quality
  - Value for Money

### 3. **Review Content**
```typescript
{
  reviewText: richText (required)  // Lexical editor with formatting

  pros: [                          // List of positive aspects
    { pro: string (max 500 chars) }
  ]

  cons: [                          // List of negative aspects
    { con: string (max 500 chars) }
  ]
}
```

### 4. **Metadata**
```typescript
{
  reviewDate: date (required)      // When review was written
  verified: boolean (default: false) // Verified purchase/installation
  featured: boolean (default: false) // Feature this review prominently
}
```

## Frontend Display (`components/product-comparison/OwnerReviews.tsx`)

The `OwnerReviews` component is a **feature-rich review display system** with:

### Core Features

#### 1. **Review Display**
- Star rating visualization
- Reviewer information (name, role, yacht)
- Review text with rich formatting
- Pros and cons lists
- Review date
- Verified badge for verified purchases

#### 2. **Statistics Dashboard**
```typescript
showStatistics: boolean
```
When enabled, displays:
- **Average Rating** - Calculated from all reviews
- **Rating Distribution** - Bar chart showing 5-star to 1-star breakdown
- **Total Review Count**
- **Yacht Size Distribution** - Reviews grouped by yacht size (<30m, 30-40m, 40-50m, 50m+)

#### 3. **Filtering & Search**
```typescript
searchable: boolean
filterByRating: number
groupByUseCase: boolean
```

**Search Capabilities:**
- Search by reviewer name
- Search by review title
- Search by review content
- Real-time filtering

**Filter Options:**
- Filter by star rating (1-5)
- Group by use case
- Filter by yacht size

#### 4. **Sorting Options**
```typescript
sortBy: 'date' | 'rating' | 'helpful'
sortOrder: 'asc' | 'desc'
```

Sort reviews by:
- **Date** - Newest/oldest first
- **Rating** - Highest/lowest rated
- **Helpful** - Most helpful votes

#### 5. **Pagination**
```typescript
itemsPerPage: number (default: 10)
```
- Automatic pagination for large review sets
- Page navigation controls
- Configurable items per page

#### 6. **Interactive Features**

**Helpful Votes:**
```typescript
onVoteHelpful: (reviewId: string) => void
```
- Users can vote reviews as "helpful"
- Shows helpful vote count
- Thumb up icon

**Review Submission:**
```typescript
allowSubmission: boolean
onSubmitReview: (review: Partial<OwnerReview>) => void
```
- "Write a Review" button
- Review submission form
- Collects: name, yacht, rating, title, review text

#### 7. **Optional Display Features**

```typescript
showInstallationDates: boolean    // Show when product was installed
showYachtSizes: boolean           // Display yacht size/length
showModerationFlags: boolean      // Show flagged reviews (admin)
showVendorResponses: boolean      // Show vendor responses to reviews
```

## How to Add Reviews via CMS

### Method 1: Via Payload CMS Admin

1. **Access Admin Panel**
   - Navigate to: `http://localhost:3000/admin`
   - Log in with admin credentials

2. **Edit a Product**
   - Go to **Products** collection
   - Select the product you want to add a review to
   - Scroll to **"Owner Reviews & Testimonials"** section

3. **Add a Review**
   - Click **"Add Owner Reviews & Testimonials"**
   - Fill in the fields:

   **Basic Info:**
   - Reviewer Name (required)
   - Reviewer Role (required) - e.g., "Captain", "Owner", "Chief Engineer"
   - Yacht Name (optional)
   - Link to Yacht Profile (optional)

   **Ratings:**
   - Overall Rating (required) - 1 to 5 stars
   - Detailed Ratings (optional):
     - Reliability (1-5)
     - Ease of Use (1-5)
     - Performance (1-5)
     - Support (1-5)
     - Value for Money (1-5)

   **Review Content:**
   - Review Text (required) - Use rich text editor for formatting
   - Add Pros - Click "Add Pros" for each positive point
   - Add Cons - Click "Add Cons" for each negative point

   **Metadata:**
   - Review Date (required)
   - Verified Purchase? (checkbox)
   - Featured Review? (checkbox)

4. **Save**
   - Click **"Save"** at the bottom
   - Review will appear on the product page

### Method 2: Programmatic Seeding

Create a seeding script (see example below) to bulk-add reviews.

## Example Review Data

### Example 1: 5-Star Navigation System Review

```json
{
  "reviewerName": "Captain James Morrison",
  "reviewerRole": "Captain",
  "yachtName": "M/Y Serenity",
  "overallRating": 5,
  "ratings": {
    "reliability": 5,
    "easeOfUse": 4,
    "performance": 5,
    "support": 5,
    "valueForMoney": 4
  },
  "reviewText": "Outstanding navigation system. After 18 months of continuous use across the Atlantic and Mediterranean, this system has never let us down. The integration with our existing Garmin chartplotter was seamless.",
  "pros": [
    { "pro": "Rock-solid reliability even in rough seas" },
    { "pro": "Intuitive interface that crew picked up quickly" },
    { "pro": "Excellent integration with other onboard systems" },
    { "pro": "Outstanding 24/7 technical support" }
  ],
  "cons": [
    { "con": "Initial setup required professional assistance" },
    { "con": "Premium pricing, but worth every penny" }
  ],
  "reviewDate": "2024-10-15",
  "verified": true,
  "featured": true
}
```

### Example 2: 4-Star Entertainment System Review

```json
{
  "reviewerName": "Sarah Chen",
  "reviewerRole": "Owner",
  "yachtName": "Lady Luna",
  "overallRating": 4,
  "ratings": {
    "reliability": 5,
    "easeOfUse": 5,
    "performance": 4,
    "support": 3,
    "valueForMoney": 4
  },
  "reviewText": "Great entertainment system for our 45m yacht. The multi-room audio works flawlessly, and guests love the easy-to-use interface. Had some initial issues with Spotify integration that took a while to resolve.",
  "pros": [
    { "pro": "Crystal clear audio quality throughout the yacht" },
    { "pro": "Easy to use, even for non-technical guests" },
    { "pro": "Integrates well with our Crestron system" }
  ],
  "cons": [
    { "con": "Support response times could be better" },
    { "con": "Some streaming services require workarounds" }
  ],
  "reviewDate": "2024-09-20",
  "verified": true,
  "featured": false
}
```

### Example 3: 3-Star Mixed Review

```json
{
  "reviewerName": "Chief Engineer Mike Roberts",
  "reviewerRole": "Chief Engineer",
  "yachtName": "Confidential",
  "overallRating": 3,
  "ratings": {
    "reliability": 4,
    "easeOfUse": 2,
    "performance": 4,
    "support": 3,
    "valueForMoney": 3
  },
  "reviewText": "Solid hardware but the software needs work. The monitoring capabilities are comprehensive once you figure them out, but the learning curve is steep. Documentation could be much better.",
  "pros": [
    { "pro": "Comprehensive monitoring features" },
    { "pro": "Hardware build quality is excellent" },
    { "pro": "Good alarm system" }
  ],
  "cons": [
    { "con": "Steep learning curve for new crew" },
    { "con": "Documentation is confusing" },
    { "con": "Software updates sometimes break existing configurations" }
  ],
  "reviewDate": "2024-08-10",
  "verified": true,
  "featured": false
}
```

## Frontend Implementation on Product Page

On the product detail page (`app/(site)/products/[id]/page.tsx`), the Reviews tab shows:

**When Reviews Exist:**
```tsx
<OwnerReviews
  reviews={product.ownerReviews}
  showStatistics           // Shows average rating and distribution
  searchable               // Enables search box
  showInstallationDates    // Shows when installed
  showYachtSizes          // Shows yacht sizes
  groupByUseCase          // Groups reviews by use case
  allowSubmission          // Shows "Write a Review" button
/>
```

**When No Reviews:**
- Displays placeholder card
- "No reviews available yet" message
- "Write a Review" button
- Call-to-action to be the first reviewer

## Seeding Script Template

Here's a template for creating a review seeding script:

```typescript
// scripts/seed-product-reviews.ts
import { getPayload } from 'payload';
import config from '../payload.config';

const sampleReviews = [
  {
    reviewerName: "Captain James Morrison",
    reviewerRole: "Captain",
    yachtName: "M/Y Serenity",
    overallRating: 5,
    ratings: {
      reliability: 5,
      easeOfUse: 4,
      performance: 5,
      support: 5,
      valueForMoney: 4
    },
    reviewText: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Outstanding navigation system. After 18 months of continuous use across the Atlantic and Mediterranean, this system has never let us down.' }
            ]
          }
        ]
      }
    },
    pros: [
      { pro: "Rock-solid reliability even in rough seas" },
      { pro: "Intuitive interface that crew picked up quickly" },
      { pro: "Excellent integration with other onboard systems" }
    ],
    cons: [
      { pro: "Initial setup required professional assistance" }
    ],
    reviewDate: new Date('2024-10-15').toISOString(),
    verified: true,
    featured: true
  },
  // Add more reviews...
];

async function seedReviews() {
  const payload = await getPayload({ config });

  const products = await payload.find({
    collection: 'products',
    limit: 10,
  });

  for (const product of products.docs) {
    await payload.update({
      collection: 'products',
      id: product.id,
      data: {
        ownerReviews: sampleReviews.slice(0, 3) // Add 3 reviews per product
      },
    });

    console.log(`✅ Added reviews to ${product.name}`);
  }
}

seedReviews();
```

## Key Features Summary

### ✅ Already Built-In:
- **Multi-criteria ratings** (5 different rating categories)
- **Rich text reviews** with formatting
- **Pros and cons lists**
- **Verified reviews** badge system
- **Featured reviews** highlighting
- **Search and filtering**
- **Rating statistics** and distribution charts
- **Sorting options** (date, rating, helpfulness)
- **Pagination** for large review sets
- **Yacht integration** (can link to yacht profiles)
- **Review submission** interface
- **Helpful voting** system

### 🎨 Display Features:
- Star rating visualization
- Average rating calculation
- Rating distribution bar charts
- Yacht size distribution
- Verified badges
- Featured review highlighting
- Responsive design
- Search functionality
- Use case grouping

## Testing Reviews

1. **Add a review via CMS admin**
2. **Navigate to product page**: `http://localhost:3000/products/[slug]`
3. **Click the "Reviews" tab**
4. **Verify display**:
   - Star ratings displayed correctly
   - Review text formatted properly
   - Pros/cons lists shown
   - Statistics calculated
   - Search works
   - Verified badge shows

## Next Steps

Would you like me to:
1. ✅ **Create a seeding script** to add sample reviews to products?
2. 📊 **Add more review fields** (e.g., installation date, product version)?
3. 🎨 **Customize the review display** component?
4. 📧 **Add review notification** system?
5. 🔒 **Add review moderation** workflow?

The reviews system is **fully functional** and ready to use! Just need to add the review data.
