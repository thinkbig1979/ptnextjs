import { getPayload } from 'payload';
import config from '../payload.config';

async function resetVendors() {
  const payload = await getPayload({ config });
  
  const emails = [
    'testvendor-free@test.com',
    'testvendor-tier1@test.com',
    'testvendor-tier2@test.com',
    'testvendor-tier3@test.com',
    'testvendor-mobile@test.com',
    'testvendor-tablet@test.com',
  ];

  for (const email of emails) {
    // Delete user
    const users = await payload.find({ collection: 'users', where: { email: { equals: email } } });
    for (const user of users.docs) {
      // Delete vendor first
      const vendors = await payload.find({ collection: 'vendors', where: { user: { equals: user.id } } });
      for (const vendor of vendors.docs) {
        await payload.delete({ collection: 'vendors', id: vendor.id });
        console.log(`🗑️  Deleted vendor for ${email}`);
      }
      // Delete user
      await payload.delete({ collection: 'users', id: user.id });
      console.log(`🗑️  Deleted user ${email}`);
    }
  }
  
  console.log('\n✅ All test vendors deleted. Run create-test-vendors.ts to recreate.\n');
  process.exit(0);
}

resetVendors();
