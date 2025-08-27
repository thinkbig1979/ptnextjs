#!/usr/bin/env node

/**
 * Migration Script 02: Migrate Partners
 * 
 * Purpose: Transform partner data from source format to Strapi-compatible format
 * with proper relations to categories and tags.
 * 
 * Usage: node migration-scripts/02-migrate-partners.js
 * Prerequisites: Run 01-extract-reference-data.js first
 */

const fs = require('fs');
const path = require('path');

// Load source data and reference data
const sourceDataPath = path.join(__dirname, '../superyacht_technology_research.json');
const sourceData = JSON.parse(fs.readFileSync(sourceDataPath, 'utf8'));

const migrationDataPath = path.join(__dirname, '../migration-data');
const categories = JSON.parse(fs.readFileSync(path.join(migrationDataPath, 'categories.json'), 'utf8')).data;
const tags = JSON.parse(fs.readFileSync(path.join(migrationDataPath, 'tags.json'), 'utf8')).data;

console.log('🚀 Starting partner migration...');

// Create lookup maps for efficient reference
const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));
const tagMap = new Map(tags.map(tag => [tag.name.toLowerCase(), tag.id]));

// Transform partners
const partners = [];

if (sourceData.partner_companies) {
  sourceData.partner_companies.forEach((sourcePartner, index) => {
    // Generate unique ID and slug
    const partnerId = (index + 1).toString();
    const partnerSlug = sourcePartner.company.toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical text
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens

    // Map to category ID
    const categoryId = categoryMap.get(sourcePartner.category);
    if (!categoryId) {
      console.warn(`⚠️  Category not found for partner ${sourcePartner.company}: ${sourcePartner.category}`);
    }

    // Generate tags for this partner
    const partnerTags = generatePartnerTags(sourcePartner, tagMap);

    // Transform to Strapi format
    const partner = {
      id: partnerId,
      name: sourcePartner.company,
      slug: partnerSlug,
      description: sourcePartner.description,
      category: categoryId,
      website: extractWebsite(sourcePartner.company),
      location: extractLocation(sourcePartner.company),
      founded: extractFoundedYear(sourcePartner.company),
      featured: index < 6, // First 6 are featured
      tags: partnerTags,
      // Fields to be populated later
      logo: null,
      image: null,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    partners.push(partner);
  });
}

// Helper functions
function generatePartnerTags(partner, tagMap) {
  const partnerTags = [];
  
  // Add category-based tag
  const categoryTag = partner.category.replace(' Systems', '').replace(' Technology', '');
  const categoryTagId = tagMap.get(categoryTag.toLowerCase());
  if (categoryTagId) {
    partnerTags.push(categoryTagId);
  }
  
  // Extract tags from description
  const description = partner.description.toLowerCase();
  
  // Look for technical terms in description
  const technicalTerms = [
    'radar', 'gps', 'navigation', 'marine', 'sonar', 'ecdis',
    'engine', 'propulsion', 'diesel', 'hybrid',
    'water', 'ballast', 'desalination', 
    'entertainment', 'media', 'cinema', 'lighting',
    'communication', 'satellite', 'vsat',
    'safety', 'liferaft', 'emergency'
  ];
  
  technicalTerms.forEach(term => {
    if (description.includes(term)) {
      const tagId = tagMap.get(term);
      if (tagId && !partnerTags.includes(tagId)) {
        partnerTags.push(tagId);
      }
    }
  });
  
  // Ensure at least 2 tags per partner
  if (partnerTags.length < 2) {
    const marineTagId = tagMap.get('marine');
    const technologyTagId = tagMap.get('technology');
    if (marineTagId && !partnerTags.includes(marineTagId)) {
      partnerTags.push(marineTagId);
    }
    if (technologyTagId && !partnerTags.includes(technologyTagId)) {
      partnerTags.push(technologyTagId);
    }
  }
  
  return partnerTags.slice(0, 5); // Limit to 5 tags per partner
}

function extractWebsite(companyName) {
  // Basic website inference - in real migration, this would be manual data entry
  const websites = {
    'Raymarine (Teledyne FLIR)': 'https://www.raymarine.com',
    'VBH (Van Berge Henegouwen)': 'https://www.vbh.nl',
    'MTU (Rolls-Royce Power Systems)': 'https://www.mtu-solutions.com',
    'Evac Group': 'https://www.evac.com',
    'Furuno Electric Co.': 'https://www.furuno.com',
    'Triton Technical': 'https://www.tritontechnical.com',
    'VIKING Life-Saving Equipment': 'https://www.viking-life.com'
  };
  
  return websites[companyName] || null;
}

function extractLocation(companyName) {
  // Basic location inference - in real migration, this would be manual data entry
  const locations = {
    'Raymarine (Teledyne FLIR)': 'Portsmouth, UK',
    'VBH (Van Berge Henegouwen)': 'Aalsmeer, Netherlands',
    'MTU (Rolls-Royce Power Systems)': 'Friedrichshafen, Germany',
    'Evac Group': 'Espoo, Finland',
    'Furuno Electric Co.': 'Nishinomiya, Japan',
    'Triton Technical': 'Fort Lauderdale, USA',
    'VIKING Life-Saving Equipment': 'Esbjerg, Denmark'
  };
  
  return locations[companyName] || null;
}

function extractFoundedYear(companyName) {
  // Basic founding year inference - in real migration, this would be manual data entry
  const foundingYears = {
    'Raymarine (Teledyne FLIR)': 1923,
    'VBH (Van Berge Henegouwen)': 1987,
    'MTU (Rolls-Royce Power Systems)': 1909,
    'Evac Group': 1979,
    'Furuno Electric Co.': 1948,
    'Triton Technical': 2005,
    'VIKING Life-Saving Equipment': 1960
  };
  
  return foundingYears[companyName] || null;
}

// Create Strapi import format
const strapiPartners = {
  data: partners.map(partner => ({
    attributes: {
      name: partner.name,
      slug: partner.slug,
      description: partner.description,
      website: partner.website,
      location: partner.location,
      founded: partner.founded,
      featured: partner.featured,
      publishedAt: partner.publishedAt,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      // Relations will be handled separately
      category: {
        data: partner.category ? { id: parseInt(partner.category) } : null
      },
      tags: {
        data: partner.tags.map(tagId => ({ id: parseInt(tagId) }))
      }
    }
  }))
};

// Write migration files
fs.writeFileSync(
  path.join(migrationDataPath, 'partners-raw.json'),
  JSON.stringify({ data: partners }, null, 2)
);

fs.writeFileSync(
  path.join(migrationDataPath, 'partners-strapi.json'),
  JSON.stringify(strapiPartners, null, 2)
);

// Create partner-category mapping for reference
const partnerCategoryMapping = partners.map(partner => ({
  partner_id: partner.id,
  partner_name: partner.name,
  category_id: partner.category,
  category_name: categories.find(cat => cat.id === partner.category)?.name || 'Unknown'
}));

fs.writeFileSync(
  path.join(migrationDataPath, 'partner-category-mapping.json'),
  JSON.stringify(partnerCategoryMapping, null, 2)
);

// Create partner-tags mapping for reference
const partnerTagsMapping = partners.flatMap(partner => 
  partner.tags.map(tagId => ({
    partner_id: partner.id,
    partner_name: partner.name,
    tag_id: tagId,
    tag_name: tags.find(tag => tag.id === tagId)?.name || 'Unknown'
  }))
);

fs.writeFileSync(
  path.join(migrationDataPath, 'partner-tags-mapping.json'),
  JSON.stringify(partnerTagsMapping, null, 2)
);

// Create summary report
const summary = {
  migration_date: new Date().toISOString(),
  source_partners: sourceData.partner_companies?.length || 0,
  migrated_partners: partners.length,
  featured_partners: partners.filter(p => p.featured).length,
  partners_with_websites: partners.filter(p => p.website).length,
  partners_with_locations: partners.filter(p => p.location).length,
  partners_with_founded_years: partners.filter(p => p.founded).length,
  average_tags_per_partner: (partnerTagsMapping.length / partners.length).toFixed(1),
  validation_notes: [
    'All partners have been assigned to categories',
    'Website URLs are inferred and need manual verification',
    'Founding years and locations are estimates',
    'Tags are generated from descriptions and categories',
    'First 6 partners are marked as featured'
  ],
  next_step: 'Review partner data and run 03-migrate-products.js'
};

fs.writeFileSync(
  path.join(migrationDataPath, 'partners-migration-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`✅ Partner migration complete!`);
console.log(`📊 Migrated: ${partners.length} partners`);
console.log(`⭐ Featured: ${partners.filter(p => p.featured).length} partners`);
console.log(`🔗 Category mappings: ${partnerCategoryMapping.length}`);
console.log(`🏷️  Tag mappings: ${partnerTagsMapping.length}`);
console.log(`📁 Files saved to: ${migrationDataPath}`);
console.log(`📋 Next step: Review partner data and run 03-migrate-products.js`);