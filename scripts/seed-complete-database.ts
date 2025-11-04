import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * Complete Database Seeding Script
 *
 * Seeds all collections with realistic data and proper relationships:
 * - Categories (product categories)
 * - Tags (for products, vendors, blog posts)
 * - Relationships between products/vendors/categories/tags
 * - Company info
 * - Sets all vendors as partners
 */

async function seedCompleteDatabase() {
  console.log('🌱 Starting complete database seeding...\n');

  const payload = await getPayload({ config });

  // ============================================================================
  // STEP 1: Seed Categories
  // ============================================================================
  console.log('📁 Step 1: Seeding Categories...');

  const categoryData = [
    {
      name: 'Navigation & Communication',
      slug: 'navigation-communication',
      description: 'Advanced navigation systems, communication equipment, and maritime connectivity solutions',
      icon: 'Compass',
      color: '#0066cc',
      order: 1,
      published: true,
    },
    {
      name: 'Audio & Entertainment',
      slug: 'audio-entertainment',
      description: 'Premium audio systems, entertainment solutions, and multi-zone media control',
      icon: 'Music',
      color: '#9333ea',
      order: 2,
      published: true,
    },
    {
      name: 'Lighting Systems',
      slug: 'lighting-systems',
      description: 'Intelligent LED lighting, control systems, and decorative illumination',
      icon: 'Lightbulb',
      color: '#f59e0b',
      order: 3,
      published: true,
    },
    {
      name: 'Climate Control',
      slug: 'climate-control',
      description: 'HVAC systems, air quality management, and environmental control solutions',
      icon: 'Thermometer',
      color: '#10b981',
      order: 4,
      published: true,
    },
    {
      name: 'Security & Surveillance',
      slug: 'security-surveillance',
      description: 'Advanced security systems, CCTV, access control, and monitoring solutions',
      icon: 'Shield',
      color: '#ef4444',
      order: 5,
      published: true,
    },
    {
      name: 'Automation & Integration',
      slug: 'automation-integration',
      description: 'System integration, automation control, and smart yacht solutions',
      icon: 'Cpu',
      color: '#06b6d4',
      order: 6,
      published: true,
    },
    {
      name: 'Propulsion & Engineering',
      slug: 'propulsion-engineering',
      description: 'Propulsion systems, engine monitoring, and engineering equipment',
      icon: 'Settings',
      color: '#6366f1',
      order: 7,
      published: true,
    },
    {
      name: 'Safety & Fire Protection',
      slug: 'safety-fire-protection',
      description: 'Fire detection and suppression, safety equipment, and emergency systems',
      icon: 'AlertTriangle',
      color: '#dc2626',
      order: 8,
      published: true,
    },
  ];

  const createdCategories: any[] = [];

  for (const catData of categoryData) {
    try {
      const category = await payload.create({
        collection: 'categories',
        data: catData,
      });
      createdCategories.push(category);
      console.log(`  ✓ Created category: ${catData.name}`);
    } catch (error: any) {
      console.error(`  ✗ Failed to create category ${catData.name}: ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${createdCategories.length} categories\n`);

  // ============================================================================
  // STEP 2: Seed Tags
  // ============================================================================
  console.log('🏷️  Step 2: Seeding Tags...');

  const tagData = [
    { name: 'Marine Grade', slug: 'marine-grade', description: 'Certified for marine environment', color: '#0066cc' },
    { name: 'IMO Certified', slug: 'imo-certified', description: 'International Maritime Organization certified', color: '#10b981' },
    { name: 'Energy Efficient', slug: 'energy-efficient', description: 'Low power consumption', color: '#22c55e' },
    { name: 'Smart Control', slug: 'smart-control', description: 'IoT and smart home integration', color: '#8b5cf6' },
    { name: 'Wireless', slug: 'wireless', description: 'Wireless connectivity', color: '#06b6d4' },
    { name: 'High Performance', slug: 'high-performance', description: 'Premium performance tier', color: '#f59e0b' },
    { name: 'Luxury', slug: 'luxury', description: 'Luxury tier product', color: '#d97706' },
    { name: 'AI-Powered', slug: 'ai-powered', description: 'Artificial intelligence features', color: '#7c3aed' },
    { name: 'Voice Control', slug: 'voice-control', description: 'Voice assistant integration', color: '#ec4899' },
    { name: 'Remote Monitoring', slug: 'remote-monitoring', description: '24/7 remote monitoring capability', color: '#3b82f6' },
    { name: 'Weather Resistant', slug: 'weather-resistant', description: 'All-weather operation', color: '#14b8a6' },
    { name: 'Easy Installation', slug: 'easy-installation', description: 'Simplified installation process', color: '#84cc16' },
    { name: 'Modular Design', slug: 'modular-design', description: 'Expandable modular architecture', color: '#a855f7' },
    { name: 'Industry Leading', slug: 'industry-leading', description: 'Market leader in category', color: '#eab308' },
    { name: 'Award Winning', slug: 'award-winning', description: 'Industry award recipient', color: '#f97316' },
  ];

  const createdTags: any[] = [];

  for (const tagInfo of tagData) {
    try {
      const tag = await payload.create({
        collection: 'tags',
        data: tagInfo,
      });
      createdTags.push(tag);
      console.log(`  ✓ Created tag: ${tagInfo.name}`);
    } catch (error: any) {
      console.error(`  ✗ Failed to create tag ${tagInfo.name}: ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${createdTags.length} tags\n`);

  // ============================================================================
  // STEP 3: Update All Vendors to be Partners
  // ============================================================================
  console.log('🤝 Step 3: Setting all vendors as partners...');

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 1000,
  });

  let vendorsUpdated = 0;
  for (const vendor of vendors.docs) {
    if (!vendor.partner) {
      try {
        await payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: {
            partner: true,
          },
        });
        vendorsUpdated++;
      } catch (error: any) {
        console.error(`  ✗ Failed to update vendor ${vendor.id}: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Updated ${vendorsUpdated} vendors to partner status\n`);

  // ============================================================================
  // STEP 4: Assign Categories and Tags to Products
  // ============================================================================
  console.log('🔗 Step 4: Assigning categories and tags to products...');

  const products = await payload.find({
    collection: 'products',
    limit: 1000,
  });

  // Create category and tag mapping
  const categoryMap: { [key: string]: number } = {};
  createdCategories.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  const tagMap: { [key: string]: number } = {};
  createdTags.forEach(tag => {
    tagMap[tag.slug] = tag.id;
  });

  // Define product-to-category mapping based on product name keywords
  const productCategoryMapping: { [key: string]: string } = {
    'navigation': 'navigation-communication',
    'audio': 'audio-entertainment',
    'entertainment': 'audio-entertainment',
    'lighting': 'lighting-systems',
    'climate': 'climate-control',
    'hvac': 'climate-control',
    'security': 'security-surveillance',
    'integration': 'automation-integration',
    'automation': 'automation-integration',
    'monitoring': 'automation-integration',
    'maintenance': 'automation-integration',
  };

  // Define tags for different product types
  const navigationTags = ['marine-grade', 'imo-certified', 'ai-powered', 'high-performance', 'industry-leading'];
  const audioTags = ['luxury', 'high-performance', 'smart-control', 'voice-control', 'award-winning'];
  const lightingTags = ['energy-efficient', 'smart-control', 'weather-resistant', 'easy-installation'];
  const climateTags = ['energy-efficient', 'smart-control', 'remote-monitoring', 'high-performance'];
  const integrationTags = ['smart-control', 'modular-design', 'wireless', 'ai-powered', 'remote-monitoring'];
  const maintenanceTags = ['remote-monitoring', 'ai-powered', 'smart-control', 'industry-leading'];

  let productsUpdated = 0;
  for (const product of products.docs) {
    const productName = product.name.toLowerCase();

    // Determine category based on product name
    let categorySlug = 'automation-integration'; // default
    for (const [keyword, slug] of Object.entries(productCategoryMapping)) {
      if (productName.includes(keyword)) {
        categorySlug = slug;
        break;
      }
    }

    // Determine tags based on product type
    let tagSlugs: string[] = [];
    if (productName.includes('navigation')) {
      tagSlugs = navigationTags;
    } else if (productName.includes('audio') || productName.includes('entertainment')) {
      tagSlugs = audioTags;
    } else if (productName.includes('lighting')) {
      tagSlugs = lightingTags;
    } else if (productName.includes('climate')) {
      tagSlugs = climateTags;
    } else if (productName.includes('integration')) {
      tagSlugs = integrationTags;
    } else if (productName.includes('maintenance') || productName.includes('monitoring')) {
      tagSlugs = maintenanceTags;
    } else {
      // Default tags for services
      tagSlugs = ['smart-control', 'remote-monitoring', 'industry-leading'];
    }

    // Get category and tag IDs
    const categoryId = categoryMap[categorySlug];
    const tagIds = tagSlugs
      .map(slug => tagMap[slug])
      .filter(id => id !== undefined)
      .slice(0, 5); // Limit to 5 tags per product

    try {
      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          categories: categoryId ? [categoryId] : [],
          tags: tagIds,
        },
      });
      productsUpdated++;
      console.log(`  ✓ Updated product: ${product.name} (Category: ${categorySlug}, Tags: ${tagIds.length})`);
    } catch (error: any) {
      console.error(`  ✗ Failed to update product ${product.id}: ${error.message}`);
    }
  }

  console.log(`\n✅ Updated ${productsUpdated} products with categories and tags\n`);

  // ============================================================================
  // STEP 5: Create Company Info
  // ============================================================================
  console.log('🏢 Step 5: Creating company info...');

  try {
    await payload.create({
      collection: 'company-info',
      data: {
        name: 'Paul Thames Superyacht Technology',
        tagline: 'Connecting the Superyacht Industry',
        description: 'The premier platform connecting superyacht owners, captains, and crew with the world\'s leading marine technology providers.',
        email: 'contact@paulthames.com',
        phone: '+44 20 7123 4567',
        address: '123 Marine Way, London, UK',
        socialMedia: {
          linkedin: 'https://linkedin.com/company/paulthames',
          twitter: 'https://twitter.com/paulthames',
          instagram: 'https://instagram.com/paulthames',
        },
      },
    });
    console.log('  ✓ Created company info');
  } catch (error: any) {
    console.error(`  ✗ Failed to create company info: ${error.message}`);
  }

  console.log('\n');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('='.repeat(80));
  console.log('🎉 DATABASE SEEDING COMPLETE!');
  console.log('='.repeat(80));
  console.log(`✅ Categories created: ${createdCategories.length}`);
  console.log(`✅ Tags created: ${createdTags.length}`);
  console.log(`✅ Vendors updated to partners: ${vendorsUpdated}`);
  console.log(`✅ Products updated with categories/tags: ${productsUpdated}`);
  console.log(`✅ Company info created: 1`);
  console.log('='.repeat(80));
  console.log('\n📊 Final Database State:');
  console.log(`   - Vendors: ${vendors.docs.length} (all partners)`);
  console.log(`   - Products: ${products.docs.length} (with categories & tags)`);
  console.log(`   - Categories: ${createdCategories.length}`);
  console.log(`   - Tags: ${createdTags.length}`);
  console.log('='.repeat(80));
  console.log('\n✨ Your application is now fully seeded and ready for testing!\n');

  process.exit(0);
}

seedCompleteDatabase().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
