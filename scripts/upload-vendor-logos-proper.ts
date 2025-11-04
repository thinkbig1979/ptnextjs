import { getPayload } from 'payload';
import config from '../payload.config';
import fs from 'fs';
import path from 'path';

/**
 * Properly upload vendor logos to Payload CMS media collection
 * Using Local API with file buffer data
 */

async function uploadVendorLogos() {
  const payload = await getPayload({ config });

  console.log('🖼️  Uploading vendor logos to Payload CMS...\n');

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 1000,
  });

  console.log(`📋 Processing ${vendors.docs.length} vendors...\n`);

  const logosDir = path.join(process.cwd(), 'public', 'vendor-logos');
  let uploaded = 0;

  for (let i = 0; i < vendors.docs.length; i++) {
    const vendor = vendors.docs[i];
    const logoFileName = `vendor-logo-${i + 1}.svg`;
    const logoPath = path.join(logosDir, logoFileName);

    // Check if logo file exists
    if (!fs.existsSync(logoPath)) {
      console.log(`⚠️  ${vendor.companyName}: Logo file not found at ${logoPath}`);
      continue;
    }

    // Skip if vendor already has a logo
    if (vendor.logo) {
      console.log(`ℹ️  ${vendor.companyName}: Already has logo`);
      continue;
    }

    try {
      // Read the file as buffer
      const fileBuffer = fs.readFileSync(logoPath);
      const stats = fs.statSync(logoPath);

      // Create media entry with file data
      const mediaEntry = await payload.create({
        collection: 'media',
        data: {
          alt: `${vendor.companyName} logo`,
        },
        file: {
          data: fileBuffer,
          mimetype: 'image/svg+xml',
          name: logoFileName,
          size: stats.size,
        },
      });

      // Update vendor with logo reference
      await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: {
          logo: mediaEntry.id,
        },
      });

      console.log(`✅ ${vendor.companyName}: Uploaded and linked logo (Media ID: ${mediaEntry.id})`);
      uploaded++;

    } catch (error) {
      console.error(`❌ ${vendor.companyName}: Failed -`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully uploaded and linked: ${uploaded} logos`);
  console.log(`Total vendors: ${vendors.docs.length}`);
}

uploadVendorLogos()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
