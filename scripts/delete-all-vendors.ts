import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Delete All Vendors
 *
 * Removes ALL vendors and their associated users from the database.
 * Use this to clean up old test data before seeding fresh profiles.
 *
 * Usage: tsx scripts/delete-all-vendors.ts
 */

async function deleteAllVendors() {
  const payload = await getPayload({ config });

  console.log('🗑️  Deleting all vendors and associated users...\n');

  try {
    // Get all vendors
    const vendors = await payload.find({
      collection: 'vendors',
      limit: 1000,
    });

    console.log(`Found ${vendors.docs.length} vendors to delete\n`);

    let deletedVendors = 0;
    let deletedUsers = 0;

    for (const vendor of vendors.docs) {
      try {
        // Delete vendor
        await payload.delete({
          collection: 'vendors',
          id: vendor.id,
        });
        console.log(`  ✓ Deleted vendor: ${vendor.companyName}`);
        deletedVendors++;

        // Delete associated user if exists
        if (vendor.user) {
          const userId = typeof vendor.user === 'string' ? vendor.user : vendor.user.id;
          try {
            await payload.delete({
              collection: 'users',
              id: userId,
            });
            console.log(`  ✓ Deleted user for: ${vendor.companyName}`);
            deletedUsers++;
          } catch (userError) {
            console.log(`  ⚠️  Could not delete user for: ${vendor.companyName}`);
          }
        }
      } catch (error) {
        console.error(`  ❌ Failed to delete vendor: ${vendor.companyName}`, error);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Vendors deleted: ${deletedVendors}`);
    console.log(`  Users deleted: ${deletedUsers}`);
    console.log(`\n✅ All vendors deleted successfully!`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }

  process.exit(0);
}

deleteAllVendors();
