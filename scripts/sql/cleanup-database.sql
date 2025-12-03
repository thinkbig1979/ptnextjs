-- Database Cleanup Script for Paul Thames Superyacht Technology
-- This script removes test data and improves demo-ready content

-- ============================================================================
-- STEP 1: Delete test users (190 users with test/test. in email)
-- ============================================================================

DELETE FROM users
WHERE email LIKE '%test%'
   OR email LIKE '%@test.%';

-- ============================================================================
-- STEP 2: Delete orphaned user accounts (users without vendors)
-- ============================================================================

DELETE FROM users
WHERE id NOT IN (SELECT user_id FROM vendors)
  AND email != 'admin@paulthames.com'  -- Keep admin
  AND email NOT LIKE '%test%';          -- Already deleted above

-- ============================================================================
-- STEP 3: Fix product names (remove vendor name prefix)
-- ============================================================================

-- Free tier vendors
UPDATE products
SET name = REPLACE(name, 'NauticTech Solutions ', '')
WHERE vendor_id = 1;

UPDATE products
SET name = REPLACE(name, 'MarineAudio Pro ', '')
WHERE vendor_id = 4;

-- Tier 1 vendors
UPDATE products
SET name = REPLACE(name, 'NavTech Marine Systems ', '')
WHERE vendor_id = 7;

UPDATE products
SET name = REPLACE(name, 'Marine AV Technologies ', '')
WHERE vendor_id = 9;

-- Tier 2 vendors
UPDATE products
SET name = REPLACE(name, 'Superyacht Integration Solutions ', '')
WHERE vendor_id = 12;

UPDATE products
SET name = REPLACE(name, 'Maritime Technology Partners ', '')
WHERE vendor_id = 13;

-- Tier 3 vendors
UPDATE products
SET name = REPLACE(name, 'Superyacht Systems Global ', '')
WHERE vendor_id = 16;

UPDATE products
SET name = REPLACE(name, 'Marine Tech Innovations ', '')
WHERE vendor_id = 17;

-- ============================================================================
-- STEP 4: Improve website domains (remove .example, use realistic domains)
-- ============================================================================

UPDATE vendors SET website = 'https://nautictech-solutions.com' WHERE id = 1;
UPDATE vendors SET website = 'https://marineaudiopro.com' WHERE id = 4;
UPDATE vendors SET website = 'https://navtech-marine.com' WHERE id = 7;
UPDATE vendors SET website = 'https://marineavtech.com' WHERE id = 9;
UPDATE vendors SET website = 'https://superyacht-integration.com' WHERE id = 12;
UPDATE vendors SET website = 'https://maritime-tech-partners.com' WHERE id = 13;
UPDATE vendors SET website = 'https://superyacht-systems-global.com' WHERE id = 16;
UPDATE vendors SET website = 'https://marine-tech-innovations.com' WHERE id = 17;

-- ============================================================================
-- VERIFICATION QUERIES (run after cleanup)
-- ============================================================================

-- Verify user count
-- Expected: 9 users (1 admin + 8 vendor users)
SELECT 'User count:' as check_type, COUNT(*) as count FROM users;

-- Verify vendor count
-- Expected: 8 vendors
SELECT 'Vendor count:' as check_type, COUNT(*) as count FROM vendors;

-- Verify product count
-- Expected: 34 products
SELECT 'Product count:' as check_type, COUNT(*) as count FROM products;

-- Verify tier distribution
-- Expected: 2 per tier for free/tier1/tier2/tier3
SELECT 'Tier distribution:' as check_type, tier, COUNT(*) as count
FROM vendors
GROUP BY tier
ORDER BY tier;

-- Verify product names (should not contain vendor names)
SELECT 'Product names check:' as check_type, name
FROM products
WHERE name LIKE '%NauticTech%'
   OR name LIKE '%MarineAudio%'
   OR name LIKE '%NavTech%'
   OR name LIKE '%Marine AV%'
   OR name LIKE '%Superyacht Integration%'
   OR name LIKE '%Maritime Technology%'
   OR name LIKE '%Superyacht Systems%'
   OR name LIKE '%Marine Tech%'
ORDER BY name;

-- Verify websites (should not contain .example)
SELECT 'Website check:' as check_type, company_name, website
FROM vendors
WHERE website LIKE '%.example.%';

SELECT 'Cleanup complete!' as status;
