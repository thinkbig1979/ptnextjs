import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Script to assign categories and tags to vendors programmatically
 * This uses proper relationship IDs instead of strings
 */

// Mapping of vendor name patterns to category names
const vendorCategoryMapping: Record<string, string> = {
  'NauticTech': 'Navigation & Communication',
  'NavTech': 'Navigation & Communication',
  'YachtComm': 'Navigation & Communication',
  'OceanWave': 'Propulsion & Engineering',
  'AquaSystems': 'Climate Control',
  'MarineAudio': 'Audio & Entertainment',
  'Marine AV': 'Audio & Entertainment',
  'Yacht Lighting': 'Lighting Systems',
  'Lighting Systems': 'Lighting Systems',
  'DeckSolutions': 'Safety & Fire Protection',
  'Yacht Automation': 'Automation & Integration',
  'Security': 'Security & Surveillance',
  'Surveillance': 'Security & Surveillance',
  'Propulsion': 'Propulsion & Engineering',
  'Engineering': 'Propulsion & Engineering',
  'Climate': 'Climate Control',
  'HVAC': 'Climate Control',
};

// Default tags for each category
const categoryTagsMapping: Record<string, string[]> = {
  'Navigation & Communication': ['Marine Grade', 'High Performance', 'Smart Control'],
  'Audio & Entertainment': ['Luxury', 'High Performance', 'Remote Monitoring'],
  'Lighting Systems': ['Energy Efficient', 'Smart Control', 'Easy Installation'],
  'Climate Control': ['Energy Efficient', 'Smart Control', 'Weather Resistant'],
  'Security & Surveillance': ['Marine Grade', 'Remote Monitoring', 'Smart Control'],
  'Automation & Integration': ['Smart Control', 'Remote Monitoring', 'Industry Leading'],
  'Propulsion & Engineering': ['High Performance', 'Marine Grade', 'IMO Certified'],
  'Safety & Fire Protection': ['Marine Grade', 'IMO Certified', 'Industry Leading'],
};

async function assignVendorCategories() {
  console.log('🚀 Starting vendor category assignment...\n');

  const payload = await getPayload({ config });

  // Fetch all categories and tags first
  console.log('📋 Fetching categories and tags...');
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 1000,
  });

  const tagsResult = await payload.find({
    collection: 'tags',
    limit: 1000,
  });

  const categories = categoriesResult.docs;
  const tags = tagsResult.docs;

  console.log(`✅ Found ${categories.length} categories and ${tags.length} tags\n`);

  // Create lookup maps
  const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));
  const tagMap = new Map(tags.map(tag => [tag.name, tag.id]));

  // Fetch all vendors
  console.log('👥 Fetching vendors...');
  const vendorsResult = await payload.find({
    collection: 'vendors',
    limit: 1000,
  });

  const vendors = vendorsResult.docs;
  console.log(`✅ Found ${vendors.length} vendors\n`);

  let updated = 0;
  let skipped = 0;

  for (const vendor of vendors) {
    const vendorName = vendor.companyName as string;

    // Find matching category based on vendor name
    let categoryName: string | null = null;
    for (const [pattern, category] of Object.entries(vendorCategoryMapping)) {
      if (vendorName.includes(pattern)) {
        categoryName = category;
        break;
      }
    }

    // If no match found, assign based on round-robin
    if (!categoryName) {
      const allCategories = Array.from(categoryMap.keys());
      categoryName = allCategories[updated % allCategories.length];
    }

    const categoryId = categoryMap.get(categoryName);

    if (!categoryId) {
      console.log(`⚠️  Category "${categoryName}" not found for ${vendorName}, skipping...`);
      skipped++;
      continue;
    }

    // Get tags for this category
    const tagNames = categoryTagsMapping[categoryName || ''] || ['Marine Grade', 'High Performance'];
    const tagIds = tagNames
      .map((tagName: string) => tagMap.get(tagName))
      .filter(Boolean) as (string | number)[];

    try {
      await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: {
          category: categoryId,
          tags: tagIds,
        },
      });

      console.log(`✅ ${vendorName}`);
      console.log(`   └─ Category: ${categoryName}`);
      console.log(`   └─ Tags: ${tagNames.join(', ')}\n`);
      updated++;
    } catch (error) {
      console.error(`❌ Failed to update ${vendorName}:`, error);
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully updated ${updated} vendors`);
  console.log(`⚠️  Skipped ${skipped} vendors`);
  console.log('='.repeat(60));
}

assignVendorCategories()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
