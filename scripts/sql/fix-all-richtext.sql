-- Fix ALL richText fields across all vendor-related tables
-- These should be Lexical JSON, not plain text

-- Main vendors table
UPDATE vendors SET long_description = NULL WHERE long_description NOT LIKE '{%' AND long_description IS NOT NULL;

-- Vendor reviews table
UPDATE vendors_vendor_reviews SET review_text = NULL WHERE review_text NOT LIKE '{%' AND review_text IS NOT NULL;

-- Vendor editorial content
UPDATE vendors_editorial_content SET content = NULL WHERE content NOT LIKE '{%' AND content IS NOT NULL;

-- Vendor case studies
UPDATE vendors_case_studies SET challenge = NULL WHERE challenge NOT LIKE '{%' AND challenge IS NOT NULL;
UPDATE vendors_case_studies SET solution = NULL WHERE solution NOT LIKE '{%' AND solution IS NOT NULL;
UPDATE vendors_case_studies SET results = NULL WHERE results NOT LIKE '{%' AND results IS NOT NULL;

-- Vendor company values
UPDATE vendors_company_values SET description = NULL WHERE description NOT LIKE '{%' AND description IS NOT NULL;

-- Vendor innovation highlights
UPDATE vendors_innovation_highlights SET description = NULL WHERE description NOT LIKE '{%' AND description IS NOT NULL;

-- Vendor service areas
UPDATE vendors_service_areas SET description = NULL WHERE description NOT LIKE '{%' AND description IS NOT NULL;

-- Verify - show counts of fixed fields
SELECT 'vendors.long_description' as field, COUNT(*) as fixed_count FROM vendors WHERE long_description IS NULL
UNION ALL
SELECT 'vendor_reviews.review_text', COUNT(*) FROM vendors_vendor_reviews WHERE review_text IS NULL
UNION ALL
SELECT 'editorial_content.content', COUNT(*) FROM vendors_editorial_content WHERE content IS NULL
UNION ALL
SELECT 'case_studies.challenge', COUNT(*) FROM vendors_case_studies WHERE challenge IS NULL;
