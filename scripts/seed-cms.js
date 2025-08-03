
const payload = require('payload');
const path = require('path');
const fs = require('fs');

// Import the existing data
const researchData = require('../data/superyacht_technology_research.json');

// Create slug from title function
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Blog content mapping (simplified version)
const blogContent = {
  'ai-driven-automation-and-smart-systems': `
# AI-Driven Automation and Smart Systems

The superyacht industry is experiencing a technological revolution with AI-powered automation systems transforming how vessels operate and guests experience luxury on the water.

## Voice and App-Controlled Management

Modern superyachts now feature sophisticated automation platforms that respond to voice commands and intuitive mobile applications. Guests can control:

- **Lighting Systems**: Adjust ambient lighting throughout the yacht with simple voice commands
- **Climate Control**: Optimize temperature zones automatically based on occupancy and preferences  
- **Security Systems**: Monitor and control access points with real-time alerts
- **Entertainment Systems**: Seamlessly integrate audio, video, and streaming services

## AI Navigation Assistants

Advanced AI navigation systems are revolutionizing route planning and vessel safety:

- **Real-time Route Optimization**: AI algorithms analyze weather patterns, sea conditions, and traffic to suggest optimal routes
- **Fuel Efficiency**: Smart systems reduce fuel consumption by up to 20% through intelligent route planning
- **Safety Enhancement**: Predictive analytics identify potential hazards before they become critical
- **Automated Docking**: AI-assisted docking systems provide precision control in challenging conditions

## IoT Sensors and Predictive Maintenance

The integration of Internet of Things (IoT) sensors throughout the yacht enables:

- **Predictive Maintenance**: Sensors monitor equipment health and predict failures before they occur
- **Remote Monitoring**: Shore-based teams can monitor yacht systems in real-time
- **Energy Management**: Smart power distribution optimizes energy usage across all systems
- **Environmental Monitoring**: Continuous tracking of water quality, air filtration, and system efficiency

## Future Implications

As AI technology continues to advance, we can expect even more sophisticated automation that learns guest preferences and adapts yacht operations accordingly. The future of superyacht technology lies in seamless integration between human desires and intelligent systems.`,

  'sustainable-propulsion-technologies': `
# Sustainable Propulsion Technologies

The superyacht industry is undergoing a green revolution with innovative propulsion technologies that promise to reduce environmental impact while maintaining luxury and performance standards.

## Hydrogen Fuel Cell Revolution

Hydrogen fuel cells represent the cutting edge of zero-emission marine propulsion:

- **Project 821 by Feadship**: The world's first hydrogen-fuel-cell superyacht, setting new standards for sustainable luxury
- **Zero Emissions**: Hydrogen fuel cells produce only water vapor as a byproduct
- **Silent Operation**: Near-silent running for enhanced guest comfort and marine wildlife protection
- **Extended Range**: Long-distance cruising capability without emissions

## Alternative Fuel Solutions

Beyond hydrogen, the industry is exploring various sustainable fuel options:

- **Methanol Fuel Cells**: Clean-burning alternative with existing supply chain infrastructure
- **Ammonia-Powered Systems**: Zero-carbon fuel that can be produced from renewable sources
- **Synthetic Fuels**: Carbon-neutral alternatives to traditional marine diesel
- **Biofuels**: Renewable diesel alternatives from sustainable sources

## Hybrid Diesel-Electric Systems

Hybrid propulsion systems offer immediate benefits while transitioning to fully sustainable solutions:

- **30% Fuel Reduction**: Significant decrease in fuel consumption compared to traditional systems
- **Electric Mode**: Silent electric operation for sensitive marine areas
- **Regenerative Systems**: Energy recovery during sailing and anchoring
- **Flexible Operation**: Seamless switching between diesel and electric power

## Implementation Challenges and Solutions

The transition to sustainable propulsion faces several challenges:

- **Infrastructure Development**: Building hydrogen and alternative fuel supply networks
- **Cost Considerations**: Balancing initial investment with long-term savings
- **Range and Performance**: Maintaining superyacht performance standards
- **Regulatory Compliance**: Meeting evolving environmental regulations

## Industry Impact

The push toward sustainable propulsion is reshaping the entire superyacht ecosystem, from designers and builders to marinas and fuel suppliers. This transformation represents not just an environmental necessity but a competitive advantage for forward-thinking owners and operators.`,
};

// Initialize and seed the database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
      local: true,
    });

    console.log('✅ Payload initialized');

    // Clear existing data (optional - comment out if you want to keep existing data)
    try {
      await payload.delete({
        collection: 'blog-posts',
        where: {},
      });
      await payload.delete({
        collection: 'products',
        where: {},
      });
      await payload.delete({
        collection: 'partners',
        where: {},
      });
      await payload.delete({
        collection: 'categories',
        where: {},
      });
      await payload.delete({
        collection: 'authors',
        where: {},
      });
      console.log('🧹 Cleared existing data');
    } catch (error) {
      console.log('ℹ️  No existing data to clear');
    }

    // Step 1: Create Categories
    console.log('📁 Creating categories...');
    
    // Get unique categories from partners
    const partnerCategories = [...new Set(researchData.partner_companies.map(p => p.category))];
    
    // Blog categories
    const blogCategories = ['Technology Trends', 'Industry News', 'Innovation', 'Product Updates'];
    
    const categoryMap = new Map();
    
    // Create partner categories
    for (const categoryName of partnerCategories) {
      const category = await payload.create({
        collection: 'categories',
        data: {
          name: categoryName,
          slug: createSlug(categoryName),
          description: `${categoryName} related content and partners`,
          type: 'partner',
        },
      });
      categoryMap.set(categoryName, category.id);
      console.log(`  ✅ Created partner category: ${categoryName}`);
    }
    
    // Create blog categories
    for (const categoryName of blogCategories) {
      const category = await payload.create({
        collection: 'categories',
        data: {
          name: categoryName,
          slug: createSlug(categoryName),
          description: `${categoryName} blog posts and articles`,
          type: 'blog',
        },
      });
      categoryMap.set(categoryName, category.id);
      console.log(`  ✅ Created blog category: ${categoryName}`);
    }

    // Step 2: Create Authors
    console.log('👥 Creating authors...');
    
    const authors = [
      { name: 'Paul Thames', role: 'CEO & Founder', email: 'paul@paulthames.com' },
      { name: 'Sarah Johnson', role: 'Chief Technology Officer', email: 'sarah@paulthames.com' },
      { name: 'Michael Chen', role: 'Marketing Manager', email: 'michael@paulthames.com' },
      { name: 'Lisa Rodriguez', role: 'Sales Manager', email: 'lisa@paulthames.com' },
    ];
    
    const authorMap = new Map();
    
    for (const authorData of authors) {
      const author = await payload.create({
        collection: 'authors',
        data: authorData,
      });
      authorMap.set(authorData.name, author.id);
      console.log(`  ✅ Created author: ${authorData.name}`);
    }

    // Step 3: Create Partners
    console.log('🤝 Creating partners...');
    
    const partnerMap = new Map();
    
    for (let index = 0; index < researchData.partner_companies.length; index++) {
      const partnerData = researchData.partner_companies[index];
      
      const partner = await payload.create({
        collection: 'partners',
        data: {
          name: partnerData.company,
          category: categoryMap.get(partnerData.category),
          description: partnerData.description,
          founded: partnerData.founded || 2000 + (index % 20) + 5,
          location: partnerData.location || 'Netherlands',
          tags: partnerData.tags ? partnerData.tags.map(tag => ({ tag })) : [{ tag: partnerData.category }],
          featured: index < 6, // Mark first 6 as featured
        },
      });
      
      partnerMap.set(`partner-${index + 1}`, partner.id);
      partnerMap.set(partnerData.company, partner.id);
      console.log(`  ✅ Created partner: ${partnerData.company}`);
    }

    // Step 4: Create Products
    console.log('🛠️ Creating products...');
    
    let productCount = 0;
    for (let partnerIndex = 0; partnerIndex < researchData.partner_companies.length; partnerIndex++) {
      const partnerData = researchData.partner_companies[partnerIndex];
      
      if (partnerData.sample_products && partnerData.sample_products.length > 0) {
        for (let productIndex = 0; productIndex < partnerData.sample_products.length; productIndex++) {
          const productData = partnerData.sample_products[productIndex];
          
          const product = await payload.create({
            collection: 'products',
            data: {
              name: productData.name,
              partner: partnerMap.get(partnerData.company),
              category: categoryMap.get(partnerData.category),
              description: productData.description,
              features: productData.features ? productData.features.map(feature => ({ feature })) : [],
              tags: [
                { tag: partnerData.category },
                ...(productData.features || []).slice(0, 2).map(f => ({ tag: f }))
              ],
              price: 'Contact for pricing', // Default price
            },
          });
          
          productCount++;
          console.log(`  ✅ Created product: ${productData.name} (${partnerData.company})`);
        }
      }
    }

    // Step 5: Create Blog Posts
    console.log('📝 Creating blog posts...');
    
    for (let index = 0; index < researchData.industry_trends.length; index++) {
      const trendData = researchData.industry_trends[index];
      const slug = createSlug(trendData.title);
      
      const fullExcerpt = trendData.summary.length > 200 
        ? trendData.summary.substring(0, 200) + '...' 
        : trendData.summary;
      
      // Get content from blog content mapping or use summary as fallback
      const content = blogContent[slug] || trendData.summary;
      
      // Get author and category cyclically
      const authorNames = ['Paul Thames', 'Sarah Johnson', 'Michael Chen', 'Lisa Rodriguez'];
      const blogCategoryNames = ['Technology Trends', 'Industry News', 'Innovation', 'Product Updates'];
      
      const authorName = authorNames[index % 4];
      const categoryName = blogCategoryNames[index % 4];
      
      // Create tags based on content and index
      const baseTags = ['superyacht', 'technology', 'innovation'];
      const indexSpecificTags = [
        ...(index === 0 ? ['ai', 'automation'] : []),
        ...(index === 1 ? ['sustainability', 'propulsion'] : []),
        ...(index === 2 ? ['renewable energy', 'solar'] : []),
        ...(index === 3 ? ['AR', 'maintenance'] : []),
        ...(index === 4 ? ['connectivity', 'satellite'] : []),
        ...(index === 5 ? ['entertainment', 'VR'] : []),
        ...(index === 6 ? ['smart materials', 'efficiency'] : []),
        ...(index === 7 ? ['exploration', 'submersibles'] : []),
      ];
      
      const allTags = [...baseTags, ...indexSpecificTags].slice(0, 6);
      
      const blogPost = await payload.create({
        collection: 'blog-posts',
        data: {
          title: trendData.title,
          slug: slug,
          excerpt: fullExcerpt,
          content: content,
          author: authorMap.get(authorName),
          publishedAt: new Date(2024, 11 - index, 15 - (index * 3)).toISOString(),
          category: categoryMap.get(categoryName),
          tags: allTags.map(tag => ({ tag })),
          featured: index < 3, // Mark first 3 as featured
          readTime: `${Math.max(5, Math.min(15, (index % 5) + 8))} min read`,
        },
      });
      
      console.log(`  ✅ Created blog post: ${trendData.title}`);
    }

    // Step 6: Create admin user (if it doesn't exist)
    console.log('👤 Creating admin user...');
    
    try {
      const existingUsers = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: 'admin@paulthames.com',
          },
        },
      });
      
      if (existingUsers.docs.length === 0) {
        await payload.create({
          collection: 'users',
          data: {
            email: 'admin@paulthames.com',
            password: 'admin123456',
            name: 'Admin User',
            role: 'admin',
          },
        });
        console.log('  ✅ Created admin user: admin@paulthames.com (password: admin123456)');
      } else {
        console.log('  ℹ️  Admin user already exists');
      }
    } catch (error) {
      console.log('  ⚠️  Could not create admin user:', error.message);
    }

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Seeded data summary:`);
    console.log(`   • ${partnerCategories.length + blogCategories.length} categories`);
    console.log(`   • ${authors.length} authors`);
    console.log(`   • ${researchData.partner_companies.length} partners`);
    console.log(`   • ${productCount} products`);
    console.log(`   • ${researchData.industry_trends.length} blog posts`);
    console.log(`   • 1 admin user`);
    console.log('\n🚀 CMS is now ready for use!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
