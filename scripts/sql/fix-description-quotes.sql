-- Fix double-quoted long_description fields
-- Remove leading and trailing quotes from long_description

UPDATE vendors
SET long_description = substr(long_description, 2, length(long_description) - 2)
WHERE long_description LIKE '"%"';

-- Verify the fix
SELECT id, company_name, substr(long_description, 1, 50) as desc_preview
FROM vendors
WHERE long_description IS NOT NULL
ORDER BY id;
