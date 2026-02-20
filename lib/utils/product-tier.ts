import { TierService, type Tier } from '@/lib/services/TierService';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Tier-restricted product fields (require tier2+)
const TIER2_FIELDS = [
  'images', 'pricing', 'specifications', 'features',
  'categories', 'tags', 'actionButtons', 'badges', 'seo'
] as const;

// Helper to get vendor with tier
export async function getVendorWithTier(vendorId: string) {
  const payload = await getPayload({ config: configPromise });
  const vendor = await payload.findByID({
    collection: 'vendors',
    id: Number(vendorId),
  });
  return vendor;
}

// Sanitize product data based on tier (defense in depth)
export function sanitizeForTier(data: Record<string, unknown>, tier: Tier | undefined): Record<string, unknown> {
  if (TierService.isTierOrHigher(tier, 'tier2')) {
    return data; // Tier2+ can use all fields
  }

  const sanitized = { ...data };
  TIER2_FIELDS.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  return sanitized;
}
