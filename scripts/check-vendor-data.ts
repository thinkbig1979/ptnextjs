import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Check what data is actually in the database for vendors
 */

async function checkVendorData() {
  const payload = await getPayload({ config });

  console.log('🔍 Checking vendor data in database...\n');

  const vendor = await payload.findByID({
    collection: 'vendors',
    id: '22', // Tier 3 test vendor
  });

  console.log('Vendor:', vendor.companyName);
  console.log('Tier:', vendor.tier);
  console.log('\nCertifications:', vendor.certifications);
  console.log('\nAwards:', vendor.awards);
  console.log('\nTeam Members:', vendor.teamMembers);
  console.log('\nService Areas:', vendor.serviceAreas);
  console.log('\nCompany Values:', vendor.companyValues);
}

checkVendorData()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
