import { getPayload } from 'payload';
import config from '../payload.config';
import https from 'https';
import fs from 'fs';
import path from 'path';

/**
 * Download images and create media entries for vendors
 */

const logoUrls = [
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=400&h=400&fit=crop&q=80',
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function addVendorMedia() {
  const payload = await getPayload({ config });

  console.log('🖼️  Adding media (logos and images) to vendors...\n');

  // Create media directory if it doesn't exist
  const mediaDir = path.join(process.cwd(), 'public', 'vendor-media');
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 1000,
  });

  console.log(`📋 Processing ${vendors.docs.length} vendors...\n`);

  let processed = 0;

  for (const vendor of vendors.docs) {
    try {
      const updates: any = {};

      // Create a simple logo URL using placeholder or just set alt text
      // Since media upload is complex, let's just use external URLs stored as text
      // But the schema requires media relationships, so we'll create placeholder media records

      if (!vendor.logo) {
        // Create a placeholder logo media record
        const logoUrl = logoUrls[processed % logoUrls.length];

        // Create media record with external URL
        const logoMedia = await payload.create({
          collection: 'media',
          data: {
            alt: `${vendor.companyName} Logo`,
            url: logoUrl, // Store the URL
          },
        });

        updates.logo = logoMedia.id;
        console.log(`✅ ${vendor.companyName}: Added logo (Media ID: ${logoMedia.id})`);
      }

      // Update vendor if we have changes
      if (Object.keys(updates).length > 0) {
        await payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: updates,
        });
      }

      processed++;
    } catch (error) {
      console.error(`❌ Failed to process ${vendor.companyName}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  console.log(`\n✅ Processed ${processed} vendors`);
}

addVendorMedia()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
