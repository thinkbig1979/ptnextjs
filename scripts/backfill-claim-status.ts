import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Backfill claimStatus for existing vendors
 *
 * Sets claimStatus to 'claimed' for all vendors that have a linked user account.
 * Safe to run multiple times (idempotent).
 *
 * Usage: tsx scripts/backfill-claim-status.ts
 */

async function backfillClaimStatus() {
  const payload = await getPayload({ config });

  console.log('Backfilling claimStatus for existing vendors...\n');

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 1000,
    overrideAccess: true,
  });

  let updated = 0;
  let skipped = 0;
  let alreadyClaimed = 0;

  for (const vendor of vendors.docs) {
    const hasUser = Boolean(vendor.user);
    const currentStatus = vendor.claimStatus ?? 'unclaimed';

    if (currentStatus === 'claimed') {
      alreadyClaimed++;
      continue;
    }

    if (hasUser) {
      await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { claimStatus: 'claimed' },
        overrideAccess: true,
      });
      console.log(`  Updated: ${vendor.companyName} -> claimed`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone.`);
  console.log(`  Updated:         ${updated}`);
  console.log(`  Already claimed: ${alreadyClaimed}`);
  console.log(`  Skipped (no user): ${skipped}`);
  console.log(`  Total vendors:   ${vendors.docs.length}`);

  process.exit(0);
}

backfillClaimStatus().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
