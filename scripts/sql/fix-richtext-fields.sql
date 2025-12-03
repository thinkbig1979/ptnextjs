-- Fix long_description field - convert plain text to Lexical JSON format
-- The Lexical editor expects JSON, not plain text

-- Option 1: NULL out the fields temporarily (quick fix)
UPDATE vendors
SET long_description = NULL
WHERE long_description IS NOT NULL
  AND long_description NOT LIKE '{%';

-- Verify
SELECT id, company_name,
  CASE
    WHEN long_description IS NULL THEN 'NULL (fixed)'
    WHEN long_description LIKE '{%' THEN 'JSON (ok)'
    ELSE 'TEXT (needs fix)'
  END as status
FROM vendors
WHERE tier IN ('tier1', 'tier2', 'tier3')
ORDER BY id;
