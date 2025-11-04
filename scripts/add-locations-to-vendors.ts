import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Add locations array to vendors
 */

const locationsByTier = {
  free: [
    { locationName: 'Main Office', address: '123 Harbor Street', city: 'Fort Lauderdale', country: 'United States', postalCode: '33316', latitude: 26.1224, longitude: -80.1373, isHQ: true },
  ],
  tier1: [
    { locationName: 'Headquarters', address: '456 Marina Boulevard', city: 'Monaco', country: 'Monaco', postalCode: '98000', latitude: 43.7384, longitude: 7.4246, isHQ: true },
  ],
  tier2: [
    { locationName: 'Global Headquarters', address: '789 Yacht Drive', city: 'Genoa', country: 'Italy', postalCode: '16145', latitude: 44.4056, longitude: 8.9463, isHQ: true },
    { locationName: 'European Office', address: '321 Port Avenue', city: 'Monaco', country: 'Monaco', postalCode: '98000', latitude: 43.7380, longitude: 7.4250, isHQ: false },
  ],
  tier3: [
    { locationName: 'International Headquarters', address: '1500 Superyacht Way', city: 'Fort Lauderdale', country: 'United States', postalCode: '33316', latitude: 26.1224, longitude: -80.1373, isHQ: true },
    { locationName: 'European Office', address: 'Rue du Commerce 45', city: 'Monaco', country: 'Monaco', postalCode: '98000', latitude: 43.7384, longitude: 7.4246, isHQ: false },
    { locationName: 'Asia Pacific Hub', address: '88 Marina Bay', city: 'Singapore', country: 'Singapore', postalCode: '018956', latitude: 1.3521, longitude: 103.8198, isHQ: false },
  ],
};

async function addLocationsToVendors() {
  const payload = await getPayload({ config });

  console.log('📍 Adding locations to all vendors...\n');

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 1000,
  });

  let updated = 0;

  for (const vendor of vendors.docs) {
    if (!vendor.locations || vendor.locations.length === 0) {
      const tier = vendor.tier || 'free';
      const locations = locationsByTier[tier as keyof typeof locationsByTier];

      await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: {
          locations: locations,
        },
      });

      console.log(`✅ ${vendor.companyName}: Added ${locations.length} location(s)`);
      updated++;
    } else {
      console.log(`ℹ️  ${vendor.companyName}: Already has ${vendor.locations.length} location(s)`);
    }
  }

  console.log(`\n✅ Updated ${updated} vendors with locations`);
}

addLocationsToVendors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
