/**
 * Seed Product Reviews Script
 * Adds realistic owner reviews and ratings to products
 */

import { getPayload } from 'payload';
import config from '../payload.config';
import { createLexicalContent } from '../lib/utils/lexical-helpers';

// Sample review templates by product category
const reviewTemplates = {
  excellent: [
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
      reviewText: "Outstanding system. After 18 months of continuous use across the Atlantic and Mediterranean, this has never let us down. The integration with our existing equipment was seamless, and the crew adapted quickly to the interface. Technical support has been exceptional - they're available 24/7 and always provide clear, helpful guidance.",
      pros: [
        { pro: "Rock-solid reliability even in challenging conditions" },
        { pro: "Intuitive interface that new crew members pick up quickly" },
        { pro: "Excellent integration with other onboard systems" },
        { pro: "Outstanding 24/7 technical support response times" },
        { pro: "Regular firmware updates that actually improve functionality" }
      ],
      cons: [
        { con: "Initial professional installation recommended for optimal setup" },
        { con: "Premium pricing, though justified by the quality" }
      ],
      verified: true,
      featured: true
    },
    {
      reviewerName: "Sarah Chen",
      reviewerRole: "Owner",
      yachtName: "Lady Luna",
      overallRating: 5,
      ratings: {
        reliability: 5,
        easeOfUse: 5,
        performance: 5,
        support: 4,
        valueForMoney: 4
      },
      reviewText: "Absolutely love this product! We've been using it for over a year on our 45m yacht and it's been flawless. The quality is immediately apparent, and it integrates perfectly with our yacht's systems. Our guests always comment on how impressive it is. Worth every penny for the peace of mind and superior performance.",
      pros: [
        { pro: "Exceptional build quality and attention to detail" },
        { pro: "Easy to use, even for non-technical guests" },
        { pro: "Integrates seamlessly with existing yacht systems" },
        { pro: "Consistently reliable performance" }
      ],
      cons: [
        { con: "Could use more detailed user manual" }
      ],
      verified: true,
      featured: false
    }
  ],

  good: [
    {
      reviewerName: "Chief Engineer Tom Bradley",
      reviewerRole: "Chief Engineer",
      yachtName: "Ocean Explorer",
      overallRating: 4,
      ratings: {
        reliability: 4,
        easeOfUse: 4,
        performance: 4,
        support: 3,
        valueForMoney: 4
      },
      reviewText: "Solid product that does what it promises. We've had it installed for 8 months and overall it's been reliable. A few minor issues during initial setup but nothing the manufacturer's support couldn't help resolve. Would recommend for professional yacht installations.",
      pros: [
        { pro: "Good build quality and marine-grade construction" },
        { pro: "Performs well under normal operating conditions" },
        { pro: "Reasonable price for the quality" },
        { pro: "Easy to integrate with standard marine equipment" }
      ],
      cons: [
        { con: "Setup documentation could be clearer" },
        { con: "Support response times vary - sometimes quick, sometimes slow" },
        { con: "A few minor software bugs that need addressing" }
      ],
      verified: true,
      featured: false
    },
    {
      reviewerName: "David Martinez",
      reviewerRole: "Captain",
      yachtName: "Blue Horizon",
      overallRating: 4,
      ratings: {
        reliability: 4,
        easeOfUse: 5,
        performance: 4,
        support: 4,
        valueForMoney: 3
      },
      reviewText: "Good product overall. The user interface is excellent - very intuitive and well thought out. Performance has been reliable with only minor issues. Price is on the high side but you get what you pay for. Would buy again but shop around for better pricing.",
      pros: [
        { pro: "Excellent user interface design" },
        { pro: "Reliable day-to-day performance" },
        { pro: "Good integration capabilities" }
      ],
      cons: [
        { con: "Pricing is premium compared to alternatives" },
        { con: "Some features feel like they should be standard but are optional" }
      ],
      verified: true,
      featured: false
    }
  ],

  average: [
    {
      reviewerName: "Chief Engineer Mike Roberts",
      reviewerRole: "Chief Engineer",
      yachtName: "Confidential",
      overallRating: 3,
      ratings: {
        reliability: 4,
        easeOfUse: 2,
        performance: 4,
        support: 3,
        valueForMoney: 3
      },
      reviewText: "Mixed experience with this product. The hardware is solid and reliable, but the software interface needs significant improvement. Documentation is confusing and support can be hit or miss. Once you figure it out, it works well, but the learning curve is unnecessarily steep. For the price point, expected better user experience.",
      pros: [
        { pro: "Hardware build quality is excellent" },
        { pro: "Core functionality is reliable once configured" },
        { pro: "Good performance when everything is set up correctly" }
      ],
      cons: [
        { con: "Steep learning curve - not user-friendly" },
        { con: "Documentation is confusing and incomplete" },
        { con: "Software interface needs modernization" },
        { con: "Support quality is inconsistent" }
      ],
      verified: true,
      featured: false
    }
  ]
};

// Function to randomly select reviews
function getRandomReviews(count: number = 2) {
  const reviews = [];
  const allTemplates = [
    ...reviewTemplates.excellent,
    ...reviewTemplates.good,
    ...reviewTemplates.average
  ];

  // Bias towards positive reviews (80% good/excellent, 20% average)
  const weightedTemplates = [
    ...reviewTemplates.excellent,
    ...reviewTemplates.excellent,
    ...reviewTemplates.good,
    ...reviewTemplates.good,
    ...reviewTemplates.average
  ];

  for (let i = 0; i < count; i++) {
    const template = weightedTemplates[Math.floor(Math.random() * weightedTemplates.length)];

    // Randomize review date within last 12 months
    const monthsAgo = Math.floor(Math.random() * 12);
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() - monthsAgo);

    reviews.push({
      ...template,
      reviewText: createLexicalContent(template.reviewText),
      reviewDate: reviewDate.toISOString(),
    });
  }

  return reviews;
}

async function seedProductReviews() {
  console.log('🌱 Starting product reviews seeding...\n');

  const payload = await getPayload({ config });

  // Get all products
  const products = await payload.find({
    collection: 'products',
    limit: 100,
  });

  console.log(`📦 Found ${products.totalDocs} products\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products.docs) {
    try {
      // Skip if already has reviews
      if (product.ownerReviews && product.ownerReviews.length > 0) {
        console.log(`⏭️  Skipping "${product.name}" - already has ${product.ownerReviews.length} review(s)`);
        skippedCount++;
        continue;
      }

      // Randomly decide how many reviews (1-3, weighted towards 2)
      const reviewCount = Math.random() < 0.3 ? 1 : Math.random() < 0.8 ? 2 : 3;
      const reviews = getRandomReviews(reviewCount);

      // Update product with reviews
      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          ownerReviews: reviews
        },
      });

      console.log(`✅ Added ${reviewCount} review(s) to "${product.name}"`);
      updatedCount++;

    } catch (error) {
      console.error(`❌ Error updating product "${product.name}":`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Product reviews seeding complete!`);
  console.log(`   📊 Added reviews to: ${updatedCount} products`);
  console.log(`   ⏭️  Skipped: ${skippedCount} products (already had reviews)`);
  console.log(`   📦 Total: ${products.totalDocs} products\n`);

  // Show sample products with reviews
  const productsWithReviews = await payload.find({
    collection: 'products',
    where: {
      'ownerReviews': {
        exists: true,
      },
    },
    limit: 5,
  });

  if (productsWithReviews.docs.length > 0) {
    console.log('📝 Sample products with reviews:\n');
    productsWithReviews.docs.forEach((product: any) => {
      const avgRating = product.ownerReviews?.reduce((sum: number, r: any) =>
        sum + (r.overallRating || 0), 0) / (product.ownerReviews?.length || 1);
      console.log(`   ⭐ ${product.name}`);
      console.log(`      Slug: /products/${product.slug}`);
      console.log(`      Reviews: ${product.ownerReviews?.length || 0}`);
      console.log(`      Avg Rating: ${avgRating.toFixed(1)}/5.0\n`);
    });

    console.log(`\nTest in browser: http://localhost:3000/products/${productsWithReviews.docs[0].slug}`);
    console.log('Click the "Reviews" tab to see the reviews!\n');
  }

  process.exit(0);
}

// Run the seeding
seedProductReviews().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
