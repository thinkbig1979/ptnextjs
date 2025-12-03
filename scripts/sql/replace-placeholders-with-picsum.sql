-- Replace all placeholder images with picsum.photos URLs
-- Using unique seeds to ensure different images for each item

-- ============================================================================
-- VENDOR LOGOS (22 items)
-- Using 400x400 square format, professional business/tech themes
-- ============================================================================

-- Active vendor logos (those still referenced by existing vendors)
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-6/400/400' WHERE id = 6;   -- Marine Tech Innovations
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-7/400/400' WHERE id = 7;   -- Superyacht Systems Global
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-10/400/400' WHERE id = 10; -- Maritime Technology Partners
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-11/400/400' WHERE id = 11; -- Superyacht Integration Solutions
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-14/400/400' WHERE id = 14; -- Marine AV Technologies
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-16/400/400' WHERE id = 16; -- NavTech Marine Systems
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-19/400/400' WHERE id = 19; -- MarineAudio Pro
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-22/400/400' WHERE id = 22; -- NauticTech Solutions

-- Legacy/unused vendor logos (for completeness)
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-1/400/400' WHERE id = 1;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-2/400/400' WHERE id = 2;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-3/400/400' WHERE id = 3;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-4/400/400' WHERE id = 4;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-5/400/400' WHERE id = 5;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-8/400/400' WHERE id = 8;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-9/400/400' WHERE id = 9;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-12/400/400' WHERE id = 12;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-13/400/400' WHERE id = 13;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-15/400/400' WHERE id = 15;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-17/400/400' WHERE id = 17;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-18/400/400' WHERE id = 18;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-20/400/400' WHERE id = 20;
UPDATE media SET external_url = 'https://picsum.photos/seed/vendor-logo-21/400/400' WHERE id = 21;

-- ============================================================================
-- VERIFY CHANGES
-- ============================================================================

-- Show all media items with their new external URLs
SELECT
  id,
  filename,
  alt,
  CASE
    WHEN external_url IS NOT NULL THEN 'HAS URL'
    ELSE 'NO URL'
  END as status,
  external_url
FROM media
ORDER BY id;

-- Count media with external URLs
SELECT
  'Total media items:' as metric,
  COUNT(*) as count
FROM media
UNION ALL
SELECT
  'With external URL:' as metric,
  COUNT(*) as count
FROM media
WHERE external_url IS NOT NULL
UNION ALL
SELECT
  'Without external URL:' as metric,
  COUNT(*) as count
FROM media
WHERE external_url IS NULL;
