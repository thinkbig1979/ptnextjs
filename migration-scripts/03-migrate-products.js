#!/usr/bin/env node

/**
 * Migration Script 03: Migrate Products  
 * 
 * Purpose: Transform product data from source format to Strapi-compatible format
 * with proper relations to partners, categories, and tags. Convert features to components.
 * 
 * Usage: node migration-scripts/03-migrate-products.js
 * Prerequisites: Run 01-extract-reference-data.js and 02-migrate-partners.js first
 */

const fs = require('fs');
const path = require('path');

// Load source data and reference data
const sourceDataPath = path.join(__dirname, '../superyacht_technology_research.json');
const sourceData = JSON.parse(fs.readFileSync(sourceDataPath, 'utf8'));

const migrationDataPath = path.join(__dirname, '../migration-data');
const categories = JSON.parse(fs.readFileSync(path.join(migrationDataPath, 'categories.json'), 'utf8')).data;
const tags = JSON.parse(fs.readFileSync(path.join(migrationDataPath, 'tags.json'), 'utf8')).data;
const partners = JSON.parse(fs.readFileSync(path.join(migrationDataPath, 'partners-raw.json'), 'utf8')).data;

console.log('🚀 Starting product migration...');

// Create lookup maps
const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));
const tagMap = new Map(tags.map(tag => [tag.name.toLowerCase(), tag.id]));
const partnerMap = new Map(partners.map(partner => [partner.name, partner.id]));

// Transform products
const products = [];
let productIdCounter = 1;

if (sourceData.partner_companies) {
  sourceData.partner_companies.forEach(sourcePartner => {
    const partnerId = partnerMap.get(sourcePartner.company);
    
    if (!partnerId) {
      console.warn(`⚠️  Partner not found: ${sourcePartner.company}`);
      return;
    }
    
    if (sourcePartner.sample_products) {
      sourcePartner.sample_products.forEach(sourceProduct => {
        // Generate unique ID and slug
        const productId = productIdCounter.toString();
        productIdCounter++;
        
        const productSlug = sourceProduct.name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // Remove special chars
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
        
        // Map to category (inherit from partner initially)
        const categoryId = categoryMap.get(sourcePartner.category);
        
        // Generate tags for this product
        const productTags = generateProductTags(sourceProduct, sourcePartner, tagMap);
        
        // Extract features from description
        const features = extractFeatures(sourceProduct.description);
        
        // Create product images component data
        const productImages = [
          {
            id: productId,
            image: null, // Will need to be populated with actual media
            alt_text: `${sourceProduct.name} product image`,
            is_main: true,
            caption: null,
            order: 1
          }
        ];
        
        // Transform to Strapi format
        const product = {
          id: productId,
          name: sourceProduct.name,
          slug: productSlug,
          description: sourceProduct.description,
          partner: partnerId,
          category: categoryId,
          tags: productTags,
          product_images: productImages,
          features: features,
          price: null, // Not available in source data
          image: null, // Legacy field - will be deprecated
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        products.push(product);
      });
    }
  });
}

// Helper functions
function generateProductTags(product, partner, tagMap) {
  const productTags = [];
  
  // Add category-based tag (inherit from partner)
  const categoryTag = partner.category.replace(' Systems', '').replace(' Technology', '');
  const categoryTagId = tagMap.get(categoryTag.toLowerCase());
  if (categoryTagId) {
    productTags.push(categoryTagId);
  }
  
  // Extract tags from product name and description
  const productText = (product.name + ' ' + product.description).toLowerCase();
  
  // Technical terms specific to products
  const productTerms = [
    'gps', 'radar', 'sonar', 'display', 'multitouch', 'ips', 'ethernet',
    'engine', 'turbo', 'injection', 'power', 'bhp', 'kw',
    'water', 'ballast', 'filtration', 'treatment', 'desalination',
    'media', 'platform', 'control', 'app', 'ios', 'ipad',
    'communication', 'vsat', 'satellite', 'connectivity',
    'safety', 'liferaft', 'beacon', 'survival', 'solas'
  ];
  
  productTerms.forEach(term => {
    if (productText.includes(term)) {
      const tagId = tagMap.get(term);
      if (tagId && !productTags.includes(tagId)) {
        productTags.push(tagId);
      }
    }
  });
  
  // Add specific technology tags based on product details
  if (productText.includes('touchscreen') || productText.includes('multi-touch')) {
    const touchTagId = tagMap.get('multitouch');
    if (touchTagId && !productTags.includes(touchTagId)) {
      productTags.push(touchTagId);
    }
  }
  
  if (productText.includes('network') || productText.includes('ethernet')) {
    const networkTagId = tagMap.get('network');
    if (networkTagId && !productTags.includes(networkTagId)) {
      productTags.push(networkTagId);
    }
  }
  
  // Ensure at least 2 tags per product
  if (productTags.length < 2) {
    const marineTagId = tagMap.get('marine');
    if (marineTagId && !productTags.includes(marineTagId)) {
      productTags.push(marineTagId);
    }
  }
  
  return productTags.slice(0, 6); // Limit to 6 tags per product
}

function extractFeatures(description) {
  // Extract key features from product description
  const features = [];
  
  // Look for technical specifications and features
  const featurePatterns = [
    /(\d+(?:\.\d+)?)\s*(kW|bhp|GT|NM|MHz|GHz)/gi, // Power/performance specs
    /(\d+)\s*(inch|"|mm|cm|m)\s*(display|screen|array)/gi, // Display/size specs
    /(GPS|GLONASS|ECDIS|ARPA|TMI|SCR|IMO|SOLAS)/gi, // Technology standards
    /(quad-core|multi-touch|ethernet|bluetooth|wi-fi)/gi, // Technology features
  ];
  
  let featureOrder = 1;
  
  // Extract specification-based features
  featurePatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (features.length < 8) { // Limit features
          features.push({
            id: features.length + 1,
            title: match.trim(),
            description: null,
            icon: 'check-circle',
            order: featureOrder++
          });
        }
      });
    }
  });
  
  // Add general capability features if not many specs found
  if (features.length < 3) {
    const generalFeatures = [
      'Professional Grade',
      'Marine Certified',
      'Easy Installation',
      'Technical Support'
    ];
    
    generalFeatures.forEach(featureTitle => {
      if (features.length < 6) {
        features.push({
          id: features.length + 1,
          title: featureTitle,
          description: null,
          icon: 'check-circle',
          order: featureOrder++
        });
      }
    });
  }
  
  return features;
}

// Create Strapi import format
const strapiProducts = {
  data: products.map(product => ({
    attributes: {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      publishedAt: product.publishedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Components
      product_images: product.product_images,
      features: product.features,
      // Relations
      partner: {
        data: product.partner ? { id: parseInt(product.partner) } : null
      },
      category: {
        data: product.category ? { id: parseInt(product.category) } : null
      },
      tags: {
        data: product.tags.map(tagId => ({ id: parseInt(tagId) }))
      }
    }
  }))
};

// Write migration files
fs.writeFileSync(
  path.join(migrationDataPath, 'products-raw.json'),
  JSON.stringify({ data: products }, null, 2)
);

fs.writeFileSync(
  path.join(migrationDataPath, 'products-strapi.json'),
  JSON.stringify(strapiProducts, null, 2)
);

// Create product-partner mapping
const productPartnerMapping = products.map(product => ({
  product_id: product.id,
  product_name: product.name,
  partner_id: product.partner,
  partner_name: partners.find(p => p.id === product.partner)?.name || 'Unknown'
}));

fs.writeFileSync(
  path.join(migrationDataPath, 'product-partner-mapping.json'),
  JSON.stringify(productPartnerMapping, null, 2)
);

// Create product-tags mapping
const productTagsMapping = products.flatMap(product =>
  product.tags.map(tagId => ({
    product_id: product.id,
    product_name: product.name,
    tag_id: tagId,
    tag_name: tags.find(tag => tag.id === tagId)?.name || 'Unknown'
  }))
);

fs.writeFileSync(
  path.join(migrationDataPath, 'product-tags-mapping.json'),
  JSON.stringify(productTagsMapping, null, 2)
);

// Create features summary
const featuresStatistics = {
  total_products: products.length,
  total_features: products.reduce((sum, product) => sum + product.features.length, 0),
  average_features_per_product: (products.reduce((sum, product) => sum + product.features.length, 0) / products.length).toFixed(1),
  feature_distribution: {
    '1-3 features': products.filter(p => p.features.length <= 3).length,
    '4-6 features': products.filter(p => p.features.length > 3 && p.features.length <= 6).length,
    '7+ features': products.filter(p => p.features.length > 6).length
  }
};

fs.writeFileSync(
  path.join(migrationDataPath, 'product-features-stats.json'),
  JSON.stringify(featuresStatistics, null, 2)
);

// Create summary report
const summary = {
  migration_date: new Date().toISOString(),
  source_products: sourceData.partner_companies?.reduce((sum, partner) => 
    sum + (partner.sample_products?.length || 0), 0
  ) || 0,
  migrated_products: products.length,
  products_per_partner: Object.values(
    products.reduce((acc, product) => {
      const partnerName = partners.find(p => p.id === product.partner)?.name || 'Unknown';
      acc[partnerName] = (acc[partnerName] || 0) + 1;
      return acc;
    }, {})
  ),
  average_tags_per_product: (productTagsMapping.length / products.length).toFixed(1),
  component_statistics: {
    product_images: products.reduce((sum, p) => sum + p.product_images.length, 0),
    features: products.reduce((sum, p) => sum + p.features.length, 0),
    average_features_per_product: featuresStatistics.average_features_per_product
  },
  validation_notes: [
    'All products have been linked to partners',
    'Categories inherited from partner categories',
    'Product images need actual media files to be uploaded',
    'Features extracted from descriptions using pattern matching',
    'Tags generated from product names and descriptions',
    'Pricing information not available in source data'
  ],
  next_step: 'Review product data and run 04-create-sample-content.js'
};

fs.writeFileSync(
  path.join(migrationDataPath, 'products-migration-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`✅ Product migration complete!`);
console.log(`📊 Migrated: ${products.length} products`);
console.log(`🏷️  Tag mappings: ${productTagsMapping.length}`);
console.log(`🔧 Total features: ${products.reduce((sum, p) => sum + p.features.length, 0)}`);
console.log(`📊 Avg features per product: ${featuresStatistics.average_features_per_product}`);
console.log(`📁 Files saved to: ${migrationDataPath}`);
console.log(`📋 Next step: Review product data and run 04-create-sample-content.js`);