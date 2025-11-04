/**
 * Verify Integration Data Script
 * Check if products have the seeded integration data
 */

import { getPayload } from 'payload';
import config from '../payload.config';

async function verifyIntegrationData() {
  console.log('🔍 Verifying integration data...\n');

  const payload = await getPayload({ config });

  // Get products with integration data
  const products = await payload.find({
    collection: 'products',
    limit: 10,
    where: {
      'integrationCompatibility.systemRequirements.powerSupply': {
        exists: true,
      },
    },
  });

  console.log(`✅ Found ${products.totalDocs} products with system requirements\n`);

  if (products.docs.length > 0) {
    for (const product of products.docs.slice(0, 5)) {
      console.log(`📦 ${product.name}`);
      console.log(`   Slug: /products/${product.slug}`);

      if (product.integrationCompatibility?.systemRequirements) {
        console.log(`   System Requirements:`);
        console.log(`      Power: ${product.integrationCompatibility.systemRequirements.powerSupply || 'N/A'}`);
        console.log(`      IP Rating: ${product.integrationCompatibility.systemRequirements.ipRating || 'N/A'}`);
        console.log(`      Certifications: ${product.integrationCompatibility.systemRequirements.certification || 'N/A'}`);
      }

      if (product.integrationCompatibility?.compatibilityMatrix) {
        console.log(`   Compatibility Matrix: ${product.integrationCompatibility.compatibilityMatrix.length} systems`);
        product.integrationCompatibility.compatibilityMatrix.slice(0, 3).forEach((item: any) => {
          console.log(`      - ${item.system}: ${item.compatibility}`);
        });
      }

      console.log('');
    }

    console.log('\n🎉 Integration data verification complete!');
    console.log(`\nTest in browser:`);
    console.log(`   http://localhost:3000/products/${products.docs[0].slug}`);
    console.log(`   Click the "Integration" tab to see the data\n`);
  } else {
    console.log('⚠️ No products with integration data found');
  }

  process.exit(0);
}

verifyIntegrationData().catch(console.error);
