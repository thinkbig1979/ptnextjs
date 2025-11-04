import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Add logos and images to all vendors using Unsplash
 *
 * Using high-quality, royalty-free images from Unsplash
 * All images are from the marine/technology/business categories
 */

// Unsplash image URLs - free to use, high quality
// Using specific IDs for consistent, relevant images
const logoImages = [
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop', // Tech logo style
  'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=400&h=400&fit=crop', // Modern tech
  'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=400&h=400&fit=crop', // Abstract tech
  'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=400&h=400&fit=crop', // Minimalist
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop', // Analytics
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop', // Business tech
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=400&fit=crop', // Innovation
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=400&fit=crop', // Team work
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop', // Corporate
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop', // Modern office
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop', // Geometric
  'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=400&h=400&fit=crop', // Professional
];

const bannerImages = [
  'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&h=600&fit=crop', // Luxury yacht
  'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&h=600&fit=crop', // Yacht at sea
  'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&h=600&fit=crop', // Superyacht
  'https://images.unsplash.com/photo-1535024966862-0be7e43e0e1e?w=1200&h=600&fit=crop', // Marina
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=600&fit=crop', // Modern yacht
  'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&h=600&fit=crop', // Yacht interior
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop', // Technology
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop', // Tech abstract
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop', // Innovation
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop', // Office/professional
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=600&fit=crop', // Modern workspace
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop', // Teamwork
];

async function addVendorImages() {
  const payload = await getPayload({ config });

  console.log('🖼️  Adding logos and images to all vendors...\n');

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 1000,
  });

  console.log(`📋 Found ${vendors.docs.length} vendors to update\n`);

  let updated = 0;

  for (const vendor of vendors.docs) {
    const logoIndex = updated % logoImages.length;
    const bannerIndex = updated % bannerImages.length;

    const updates: any = {};

    // Add logo if missing
    if (!vendor.logo) {
      updates.logo = logoImages[logoIndex];
    }

    // Add banner/hero image if missing
    if (!vendor.image) {
      updates.image = bannerImages[bannerIndex];
    }

    if (Object.keys(updates).length > 0) {
      await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: updates,
      });

      console.log(`✅ ${vendor.companyName}`);
      if (updates.logo) {
        console.log(`   🏷️  Logo: ${updates.logo.substring(0, 60)}...`);
      }
      if (updates.image) {
        console.log(`   🖼️  Image: ${updates.image.substring(0, 60)}...`);
      }
    } else {
      console.log(`ℹ️  ${vendor.companyName}: Already has logo and image`);
    }

    updated++;
  }

  console.log('\n✅ All vendors now have logos and images!');
  console.log('\n📊 Summary:');
  console.log(`  - Total vendors updated: ${updated}`);
  console.log(`  - Images source: Unsplash (royalty-free)`);
  console.log(`  - Logo format: Square (400x400)`);
  console.log(`  - Banner format: Wide (1200x600)`);
}

addVendorImages()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
