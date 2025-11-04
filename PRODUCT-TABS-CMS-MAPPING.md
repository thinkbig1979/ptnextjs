# Product Detail Page Tabs - CMS Field Mapping

## Location
File: `app/(site)/products/[id]/page.tsx` (lines 335-475)

## Tab Component Overview

The product detail page has a tabbed interface at the bottom with 5 tabs. Here's the mapping between each tab and the CMS fields:

---

## Tab 1: Overview
**Component Line:** 359-371
**Content:** Static hardcoded text
**CMS Fields:** ❌ **NONE**

```typescript
<TabsContent value="overview">
  <p className="text-muted-foreground leading-relaxed">
    Get comprehensive insights into this product's capabilities...
  </p>
</TabsContent>
```

**Status:** This tab shows generic placeholder text. There are NO CMS fields connected to this tab.

**Recommendation:** Consider adding a `longDescription` or `productOverview` Lexical rich text field to Products collection.

---

## Tab 2: Performance
**Component Line:** 373-398
**Data Source:** `product.performanceMetrics`
**Component:** `<PerformanceMetrics>` from `components/product-comparison/PerformanceMetrics.tsx`

**CMS Fields:** ❌ **FIELD DOES NOT EXIST IN SCHEMA**

The code looks for `product.performanceMetrics` but this field **does not exist** in `payload/collections/Products.ts`.

**Available Related Fields:**
- `comparisonMetrics` - Array of metrics with category, metricName, numericValue (lines 515-590)

**Status:** Shows fallback message: "Performance metrics will be available soon."

**Recommendation:** Either:
1. Use existing `comparisonMetrics` field and transform it to `performanceMetrics` format
2. Add a dedicated `performanceMetrics` array field to Products schema

---

## Tab 3: Integration
**Component Line:** 400-412
**Data Source:** `product.compatibilityMatrix`
**Component:** `<IntegrationNotes>` from `components/product-comparison/IntegrationNotes.tsx`

**CMS Fields:** ✅ **PARTIALLY EXISTS**

```typescript
{
  name: 'integrationCompatibility',
  type: 'group',
  fields: [
    {
      name: 'supportedProtocols',
      type: 'array', // Array of protocol objects
    },
    {
      name: 'compatibilityMatrix',
      type: 'array', // Array of compatibility entries
      fields: [
        { name: 'partner', type: 'text' },
        { name: 'compatibilityLevel', type: 'select' },
        { name: 'notes', type: 'textarea' },
        { name: 'integrationComplexity', type: 'select' },
        { name: 'estimatedCost', type: 'text' },
      ]
    }
  ]
}
```

**Status:** Field exists at `integrationCompatibility.compatibilityMatrix` (lines 640-700).

**Transform Location:** `lib/payload-cms-data-service.ts` line 600 extracts this as `compatibilityMatrix`

**Actual Usage:** The component receives the data correctly from the CMS.

---

## Tab 4: Reviews
**Component Line:** 414-441
**Data Source:** `product.ownerReviews`
**Component:** `<OwnerReviews>` from `components/product-comparison/OwnerReviews.tsx`

**CMS Fields:** ✅ **EXISTS**

```typescript
{
  name: 'ownerReviews',
  type: 'array',
  fields: [
    { name: 'reviewerName', type: 'text' },
    { name: 'yachtName', type: 'text' },
    { name: 'overallRating', type: 'number' },
    { name: 'reviewText', type: 'richText', editor: lexicalEditor() },
    { name: 'pros', type: 'array' },
    { name: 'cons', type: 'array' },
    { name: 'verified', type: 'checkbox' },
  ]
}
```

**Status:** Field exists (lines 725-820).

**Transform Location:** `lib/payload-cms-data-service.ts` lines 362-379 transforms this data

**Actual Usage:** Shows "No reviews available yet" if empty, otherwise displays reviews.

---

## Tab 5: Demo
**Component Line:** 443-475
**Data Source:** `product.visualDemo`
**Component:** `<VisualDemo>` from `components/product-comparison/VisualDemo.tsx`

**CMS Fields:** ✅ **EXISTS**

```typescript
{
  name: 'visualDemoContent',
  type: 'group',
  fields: [
    {
      name: 'model3d',
      type: 'group',
      fields: [
        { name: 'modelUrl', type: 'text' },
        { name: 'thumbnailImage', type: 'upload' },
        { name: 'glbModelUrl', type: 'text' },
        { name: 'scaleReference', type: 'text' },
      ]
    },
    {
      name: 'videoWalkthrough',
      type: 'group',
      fields: [
        { name: 'videoUrl', type: 'text' },
        { name: 'thumbnail', type: 'upload' },
      ]
    },
    {
      name: 'images360',
      type: 'array',
    },
    {
      name: 'interactiveHotspots',
      type: 'array',
    }
  ]
}
```

**Status:** Field exists (lines 902-1080).

**Transform Location:** `lib/payload-cms-data-service.ts` lines 381-419 transforms this to `visualDemo`

**Actual Usage:** Shows interactive demo if available, otherwise shows "Interactive demo coming soon."

---

## Summary Table

| Tab | Field Name | Exists in CMS | Populated | Component Works |
|-----|------------|---------------|-----------|-----------------|
| Overview | *(none)* | ❌ No | N/A | Static text only |
| Performance | `performanceMetrics` | ❌ No | No | Shows fallback |
| Integration | `compatibilityMatrix` | ✅ Yes | Depends on data | ✅ Yes |
| Reviews | `ownerReviews` | ✅ Yes | Depends on data | ✅ Yes |
| Demo | `visualDemo` | ✅ Yes | Depends on data | ✅ Yes |

---

## Issues & Recommendations

### Issue 1: Overview Tab - No CMS Content
**Problem:** Hardcoded generic text, not editable via CMS

**Solution:** Add field to Products collection:
```typescript
{
  name: 'detailedOverview',
  type: 'richText',
  editor: lexicalEditor(),
  label: 'Detailed Product Overview',
  admin: {
    description: 'Comprehensive product overview for the Overview tab'
  }
}
```

### Issue 2: Performance Tab - Missing Field
**Problem:** Code expects `performanceMetrics` but field doesn't exist

**Solution Option A:** Transform existing `comparisonMetrics`:
```typescript
// In transformPayloadProduct()
performanceMetrics: doc.comparisonMetrics?.map(metric => ({
  category: metric.category,
  name: metric.metricName,
  value: metric.numericValue,
  unit: metric.unit,
}))
```

**Solution Option B:** Add dedicated field:
```typescript
{
  name: 'performanceMetrics',
  type: 'array',
  label: 'Performance Metrics',
  fields: [
    { name: 'category', type: 'text' },
    { name: 'metricName', type: 'text' },
    { name: 'value', type: 'number' },
    { name: 'unit', type: 'text' },
    { name: 'benchmark', type: 'number' },
  ]
}
```

---

## Data Population Status

To check if products have actual data in these fields:

```sql
-- Check ownerReviews
SELECT id, name, (SELECT COUNT(*) FROM product_owner_reviews WHERE product_id = products.id) as review_count
FROM products;

-- Check integration compatibility
SELECT id, name, integration_compatibility_supported_protocols
FROM products WHERE integration_compatibility_supported_protocols IS NOT NULL;

-- Check visual demo
SELECT id, name, visual_demo_content_model3d_model_url, visual_demo_content_video_walkthrough_video_url
FROM products WHERE visual_demo_content_model3d_model_url IS NOT NULL
   OR visual_demo_content_video_walkthrough_video_url IS NOT NULL;
```

Most tabs will show fallback content unless data is explicitly added via CMS.
