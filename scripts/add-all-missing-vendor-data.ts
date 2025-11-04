import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Add ALL Missing Vendor Data - COMPREHENSIVE UPDATE
 *
 * This script adds EVERY missing field to vendor profiles:
 * - Locations with full addresses
 * - Social media links (linkedin, twitter)
 * - Employee count
 * - Total projects
 * - Social proof metrics
 * - Long descriptions
 * - Contact phone numbers
 * - Founded year (if missing)
 * - Categories and tags
 */

const locationsByCity = {
  'Fort Lauderdale': { lat: 26.1224, lng: -80.1373, country: 'United States', state: 'Florida' },
  'Monaco': { lat: 43.7384, lng: 7.4246, country: 'Monaco', state: 'Monaco' },
  'Genoa': { lat: 44.4056, lng: 8.9463, country: 'Italy', state: 'Liguria' },
  'London': { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', state: 'England' },
  'Rotterdam': { lat: 51.9225, lng: 4.4792, country: 'Netherlands', state: 'South Holland' },
  'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore', state: 'Singapore' },
  'Miami': { lat: 25.7617, lng: -80.1918, country: 'United States', state: 'Florida' },
  'Hamburg': { lat: 53.5511, lng: 9.9937, country: 'Germany', state: 'Hamburg' },
  'Antibes': { lat: 43.5808, lng: 7.1250, country: 'France', state: 'Provence-Alpes-Côte d\'Azur' },
  'Livorno': { lat: 43.5485, lng: 10.3106, country: 'Italy', state: 'Tuscany' },
  'Southampton': { lat: 50.9097, lng: -1.4044, country: 'United Kingdom', state: 'Hampshire' },
  'Palma': { lat: 39.5696, lng: 2.6502, country: 'Spain', state: 'Balearic Islands' },
  'Amsterdam': { lat: 52.3676, lng: 4.9041, country: 'Netherlands', state: 'North Holland' },
};

async function addAllMissingVendorData() {
  const payload = await getPayload({ config });

  console.log('🔄 Adding ALL missing vendor data...\n');

  try {
    const vendors = await payload.find({
      collection: 'vendors',
      limit: 1000,
    });

    console.log(`📋 Found ${vendors.docs.length} vendors to update\n`);

    let updated = 0;

    for (const vendor of vendors.docs) {
      console.log(`\nUpdating: ${vendor.companyName} (${vendor.tier})...`);

      const updates: any = {};
      const cities = Object.keys(locationsByCity);
      const cityIndex = updated % cities.length;
      const city = cities[cityIndex];
      const locationData = locationsByCity[city as keyof typeof locationsByCity];

      // Add contact phone if missing
      if (!vendor.contactPhone) {
        const areaCodes = ['954', '377', '010', '020', '031', '065', '305', '040', '033', '055'];
        updates.contactPhone = `+${areaCodes[cityIndex % areaCodes.length]}-555-${String(1000 + updated).padStart(4, '0')}`;
      }

      // Add website if missing (Tier 1+)
      if (!vendor.website && vendor.tier !== 'free') {
        updates.website = `https://www.${vendor.slug}.com`;
      }

      // Add LinkedIn URL if missing (Tier 1+)
      if (!vendor.linkedinUrl && vendor.tier !== 'free') {
        updates.linkedinUrl = `https://linkedin.com/company/${vendor.slug}`;
      }

      // Add Twitter URL if missing (Tier 1+)
      if (!vendor.twitterUrl && vendor.tier !== 'free') {
        updates.twitterUrl = `https://twitter.com/${vendor.slug.substring(0, 15)}`;
      }

      // Add employee count if missing (Tier 1+)
      if (!vendor.employeeCount && vendor.tier !== 'free') {
        const counts = { tier1: 45, tier2: 120, tier3: 280 };
        updates.employeeCount = counts[vendor.tier as keyof typeof counts] || 30;
      }

      // Add total projects if missing (Tier 1+)
      if (!vendor.totalProjects && vendor.tier !== 'free') {
        const projects = { tier1: 85, tier2: 180, tier3: 450 };
        updates.totalProjects = projects[vendor.tier as keyof typeof projects] || 50;
      }

      // Add social proof metrics if missing (Tier 1+)
      if (vendor.tier !== 'free') {
        if (!vendor.linkedinFollowers) {
          updates.linkedinFollowers = vendor.tier === 'tier3' ? 12500 : vendor.tier === 'tier2' ? 6800 : 2300;
        }
        if (!vendor.instagramFollowers) {
          updates.instagramFollowers = vendor.tier === 'tier3' ? 8900 : vendor.tier === 'tier2' ? 4200 : 1800;
        }
        if (!vendor.clientSatisfactionScore) {
          updates.clientSatisfactionScore = vendor.tier === 'tier3' ? 9.8 : vendor.tier === 'tier2' ? 9.2 : 8.7;
        }
        if (!vendor.repeatClientPercentage) {
          updates.repeatClientPercentage = vendor.tier === 'tier3' ? 92 : vendor.tier === 'tier2' ? 78 : 65;
        }
      }

      // Add founded year if missing
      if (!vendor.foundedYear) {
        const years = [2005, 2008, 2010, 2012, 2015, 2018, 1998, 2003, 2007, 2011];
        updates.foundedYear = years[updated % years.length];
      }

      // Add long description if missing (Tier 1+)
      if (!vendor.longDescription && vendor.tier !== 'free') {
        updates.longDescription = `${vendor.description} With over ${new Date().getFullYear() - (vendor.foundedYear || 2010)} years of experience in the superyacht industry, we provide comprehensive solutions that combine cutting-edge technology with exceptional service. Our team of experienced professionals is dedicated to delivering innovation and reliability to clients worldwide.`;
      }

      // Add category if missing
      if (!vendor.category) {
        const categories = [
          'Navigation & Communication',
          'Audio Visual Systems',
          'Propulsion & Engineering',
          'Interior Design',
          'Safety & Security',
          'Lighting & Electrical',
          'Deck Equipment',
          'Galley Equipment',
        ];
        updates.category = categories[updated % categories.length];
      }

      // Add tags if missing
      if (!vendor.tags || vendor.tags.length === 0) {
        const tagSets = [
          ['Navigation', 'GPS', 'ECDIS'],
          ['Audio', 'Video', 'Entertainment'],
          ['Propulsion', 'Thrusters', 'Engineering'],
          ['Design', 'Interior', 'Luxury'],
          ['Security', 'Surveillance', 'Safety'],
          ['Lighting', 'LED', 'Electrical'],
          ['Deck', 'Hardware', 'Rigging'],
          ['Galley', 'Appliances', 'Catering'],
        ];
        updates.tags = tagSets[updated % tagSets.length];
      }

      // Update vendor with all new data
      if (Object.keys(updates).length > 0) {
        await payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: updates,
        });

        console.log(`  ✅ Updated ${vendor.companyName}`);
        Object.keys(updates).forEach(key => {
          console.log(`    - Added/updated: ${key}`);
        });
      }

      // Now add locations using vendor_locations collection
      try {
        // Check if vendor already has locations
        const existingLocations = await payload.find({
          collection: 'vendor_locations',
          where: {
            vendor: {
              equals: vendor.id,
            },
          },
        });

        if (existingLocations.docs.length === 0) {
          console.log(`  📍 Adding locations...`);

          const tierLocationCounts = {
            free: 1,
            tier1: 1,
            tier2: 2,
            tier3: 3,
          };

          const locationCount = tierLocationCounts[vendor.tier as keyof typeof tierLocationCounts] || 1;
          const availableCities = Object.keys(locationsByCity);

          for (let i = 0; i < locationCount; i++) {
            const cityIdx = (cityIndex + i) % availableCities.length;
            const locationCity = availableCities[cityIdx];
            const locData = locationsByCity[locationCity as keyof typeof locationsByCity];

            await payload.create({
              collection: 'vendor_locations',
              data: {
                vendor: vendor.id,
                name: i === 0 ? 'Headquarters' : `${locationCity} Office`,
                address: `${100 + i * 50} Main Street`,
                city: locationCity,
                state: locData.state,
                postalCode: String(10000 + updated * 10 + i),
                country: locData.country,
                latitude: locData.lat + (Math.random() - 0.5) * 0.01,
                longitude: locData.lng + (Math.random() - 0.5) * 0.01,
                isHQ: i === 0,
                phone: updates.contactPhone || vendor.contactPhone,
                email: vendor.contactEmail,
              },
            });

            console.log(`    ✅ Added location: ${locationCity}`);
          }
        } else {
          console.log(`  ℹ️  Locations already exist (${existingLocations.docs.length} locations)`);
        }
      } catch (locError) {
        console.log(`    ⚠️  Could not add locations: ${locError instanceof Error ? locError.message : 'Unknown error'}`);
      }

      updated++;
    }

    console.log('\n\n✅ ALL vendor data updated successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`  - Total vendors updated: ${updated}`);
    console.log(`  - Added contact phone numbers`);
    console.log(`  - Added websites (Tier 1+)`);
    console.log(`  - Added social media links (Tier 1+)`);
    console.log(`  - Added employee counts (Tier 1+)`);
    console.log(`  - Added project counts (Tier 1+)`);
    console.log(`  - Added social proof metrics (Tier 1+)`);
    console.log(`  - Added founded years`);
    console.log(`  - Added long descriptions (Tier 1+)`);
    console.log(`  - Added categories and tags`);
    console.log(`  - Added physical office locations (tier-based)`);
    console.log('\n🎉 Vendor profiles are now COMPLETE with all data!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

addAllMissingVendorData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
