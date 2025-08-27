#!/usr/bin/env node

/**
 * Migration Script 01: Extract Reference Data
 * 
 * Purpose: Extract categories and tags from existing data structures
 * to create normalized reference data for Strapi.
 * 
 * Usage: node migration-scripts/01-extract-reference-data.js
 */

const fs = require('fs');
const path = require('path');

// Load source data
const sourceDataPath = path.join(__dirname, '../superyacht_technology_research.json');
const sourceData = JSON.parse(fs.readFileSync(sourceDataPath, 'utf8'));

console.log('🚀 Starting reference data extraction...');

// Extract unique categories from partners
const partnerCategories = new Set();
const productCategories = new Set();
const allTags = new Set();

// Process partner data
if (sourceData.partner_companies) {
  sourceData.partner_companies.forEach((partner, index) => {
    // Extract categories
    if (partner.category) {
      partnerCategories.add(partner.category);
    }
    
    // Extract tags (if they exist in source data)
    // Note: Current source data doesn't have explicit tags,
    // but we can derive them from categories and descriptions
    if (partner.category) {
      allTags.add(partner.category.replace(' Systems', '').replace(' Technology', ''));
    }
    
    // Process products for each partner
    if (partner.sample_products) {
      partner.sample_products.forEach(product => {
        // Products might have different categories than partners
        productCategories.add(partner.category); // Inherit from partner for now
        
        // Extract potential tags from product names and descriptions
        const productWords = product.name.split(' ').concat(product.description.split(' '));
        productWords.forEach(word => {
          // Add meaningful technical terms as tags
          const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
          if (cleanWord.length > 3 && isValidTag(cleanWord)) {
            allTags.add(cleanWord);
          }
        });
      });
    }
  });
}

// Helper function to determine if a word should be a tag
function isValidTag(word) {
  const technicalTerms = [
    'radar', 'gps', 'navigation', 'marine', 'sonar', 'chart', 'display',
    'engine', 'propulsion', 'power', 'hybrid', 'diesel', 'turbo',
    'water', 'treatment', 'ballast', 'desalination', 'reverse', 'osmosis',
    'entertainment', 'media', 'control', 'cinema', 'lighting', 'audio',
    'communication', 'satellite', 'vsat', 'connectivity', 'network',
    'safety', 'liferaft', 'emergency', 'beacon', 'survival',
    'ecdis', 'autopilot', 'chirp', 'doppler', 'multitouch'
  ];
  
  return technicalTerms.includes(word) || word.length > 4;
}

// Create normalized category data
const categories = Array.from(partnerCategories).map((categoryName, index) => ({
  id: (index + 1).toString(),
  name: categoryName,
  slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description: `${categoryName} for marine technology`,
  icon: getCategoryIcon(categoryName),
  color: getCategoryColor(index),
  order: index + 1
}));

// Create normalized tag data
const tags = Array.from(allTags).filter(tag => tag.length > 2).slice(0, 50).map((tagName, index) => ({
  id: (index + 1).toString(),
  name: tagName.charAt(0).toUpperCase() + tagName.slice(1),
  slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description: `Technology tag: ${tagName}`,
  color: getTagColor(index),
  usage_count: 0
}));

// Create blog categories (separate from main categories)
const blogCategories = [
  {
    id: "1",
    name: "Technology Insights",
    slug: "technology-insights",
    description: "Deep dives into marine technology trends",
    color: "#0066CC"
  },
  {
    id: "2", 
    name: "Industry News",
    slug: "industry-news",
    description: "Latest news from the marine technology industry",
    color: "#00AA44"
  },
  {
    id: "3",
    name: "Product Spotlights",
    slug: "product-spotlights", 
    description: "Featured products and innovations",
    color: "#FF6600"
  },
  {
    id: "4",
    name: "Company Updates",
    slug: "company-updates",
    description: "Company announcements and updates",
    color: "#9900CC"
  }
];

// Helper functions
function getCategoryIcon(categoryName) {
  const iconMap = {
    'Navigation Systems': 'compass',
    'Entertainment Technology': 'play-circle',
    'Propulsion Systems': 'zap',
    'Water Management Systems': 'droplet',
    'Communication & Entertainment': 'radio',
    'Safety Equipment': 'shield-check'
  };
  return iconMap[categoryName] || 'package';
}

function getCategoryColor(index) {
  const colors = ['#0066CC', '#00AA44', '#FF6600', '#9900CC', '#CC0066', '#00CCAA'];
  return colors[index % colors.length];
}

function getTagColor(index) {
  const colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#0099C6'];
  return colors[index % colors.length];
}

// Write output files
const outputDir = path.join(__dirname, '../migration-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'categories.json'),
  JSON.stringify({ data: categories }, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'tags.json'),
  JSON.stringify({ data: tags }, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'blog-categories.json'),
  JSON.stringify({ data: blogCategories }, null, 2)
);

// Create summary report
const summary = {
  extraction_date: new Date().toISOString(),
  source_file: 'superyacht_technology_research.json',
  extracted_data: {
    categories: {
      count: categories.length,
      items: categories.map(c => c.name)
    },
    tags: {
      count: tags.length,
      items: tags.map(t => t.name).slice(0, 10) // First 10 for preview
    },
    blog_categories: {
      count: blogCategories.length,
      items: blogCategories.map(c => c.name)
    }
  },
  next_step: 'Run 02-migrate-partners.js to create partner entities'
};

fs.writeFileSync(
  path.join(outputDir, 'extraction-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`✅ Reference data extraction complete!`);
console.log(`📊 Extracted:`);
console.log(`   - ${categories.length} categories`);
console.log(`   - ${tags.length} tags`);
console.log(`   - ${blogCategories.length} blog categories`);
console.log(`📁 Files saved to: ${outputDir}`);
console.log(`📋 Next step: Review extracted data and run 02-migrate-partners.js`);