-- Vendor Tier Rebalancing
-- Date: 2025-11-16
-- Purpose: Fix partner products toggle by creating a balanced mix of partner and non-partner vendors across all tier levels

BEGIN TRANSACTION;

-- Partner vendors: Upgrade to tier2/tier3 for visibility
UPDATE vendors SET tier = 'tier2' WHERE id = 7;  -- NavTech Marine Systems (3 products)
UPDATE vendors SET tier = 'tier3' WHERE id = 9;  -- Marine AV Technologies (3 products)

-- Partner vendors: Keep at lower tiers
UPDATE vendors SET tier = 'free' WHERE id = 1;   -- NauticTech Solutions (2 products)
UPDATE vendors SET tier = 'tier1' WHERE id = 4;  -- MarineAudio Pro (2 products)

-- Non-Partner vendors: Move some to lower tiers for balance
UPDATE vendors SET tier = 'free' WHERE id = 12;  -- Superyacht Integration Solutions (5 products)
UPDATE vendors SET tier = 'tier1' WHERE id = 13; -- Maritime Technology Partners (5 products)
UPDATE vendors SET tier = 'tier2' WHERE id = 16; -- Superyacht Systems Global (7 products)
UPDATE vendors SET tier = 'tier3' WHERE id = 17; -- Marine Tech Innovations (7 products)

COMMIT;

-- Results:
-- Products Page Visibility (tier2+ only):
--   Total visible: 20 products
--   Partner products: 6 (30%)
--     - NavTech Marine Systems (tier2): 3 products
--     - Marine AV Technologies (tier3): 3 products
--   Non-Partner products: 14 (70%)
--     - Superyacht Systems Global (tier2): 7 products
--     - Marine Tech Innovations (tier3): 7 products
