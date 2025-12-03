-- Add product images using picsum.photos
-- Each product gets 2-3 images with unique seeds
-- First image is marked as main image (is_main = 1)

-- ============================================================================
-- Clean up any test data first
-- ============================================================================
DELETE FROM products_images WHERE _parent_id = 89;

-- ============================================================================
-- Add images for all 34 published products
-- Format: 800x600 landscape images suitable for product photography
-- ============================================================================

-- Vendor 17 products (7 products: IDs 25-31)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 25, 'img-25-1', 'https://picsum.photos/seed/product-25-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Professional marine navigation display'),
  (2, 25, 'img-25-2', 'https://picsum.photos/seed/product-25-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'Detailed view of navigation controls'),

  (1, 26, 'img-26-1', 'https://picsum.photos/seed/product-26-1/800/600', 'Premium Audio Entertainment System - Main View', 1, 'High-end audio system for yachts'),
  (2, 26, 'img-26-2', 'https://picsum.photos/seed/product-26-2/800/600', 'Premium Audio Entertainment System - Detail', 0, 'Audio control interface'),

  (1, 27, 'img-27-1', 'https://picsum.photos/seed/product-27-1/800/600', 'Intelligent Lighting Control System - Main View', 1, 'Smart lighting management system'),
  (2, 27, 'img-27-2', 'https://picsum.photos/seed/product-27-2/800/600', 'Intelligent Lighting Control System - Detail', 0, 'Lighting control panel'),

  (1, 28, 'img-28-1', 'https://picsum.photos/seed/product-28-1/800/600', 'Advanced Climate Control System - Main View', 1, 'Climate management interface'),
  (2, 28, 'img-28-2', 'https://picsum.photos/seed/product-28-2/800/600', 'Advanced Climate Control System - Detail', 0, 'HVAC control system'),

  (1, 29, 'img-29-1', 'https://picsum.photos/seed/product-29-1/800/600', 'Complete System Integration - Main View', 1, 'Integrated system dashboard'),
  (2, 29, 'img-29-2', 'https://picsum.photos/seed/product-29-2/800/600', 'Complete System Integration - Detail', 0, 'System integration interface'),

  (1, 30, 'img-30-1', 'https://picsum.photos/seed/product-30-1/800/600', 'Annual Maintenance Program - Main View', 1, 'Maintenance service overview'),
  (2, 30, 'img-30-2', 'https://picsum.photos/seed/product-30-2/800/600', 'Annual Maintenance Program - Detail', 0, 'Service schedule and support'),

  (1, 31, 'img-31-1', 'https://picsum.photos/seed/product-31-1/800/600', 'Remote Monitoring & Diagnostics - Main View', 1, 'Remote monitoring dashboard'),
  (2, 31, 'img-31-2', 'https://picsum.photos/seed/product-31-2/800/600', 'Remote Monitoring & Diagnostics - Detail', 0, 'Diagnostic interface');

-- Vendor 16 products (7 products: IDs 32-38)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 32, 'img-32-1', 'https://picsum.photos/seed/product-32-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Professional navigation equipment'),
  (2, 32, 'img-32-2', 'https://picsum.photos/seed/product-32-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'Navigation system components'),

  (1, 33, 'img-33-1', 'https://picsum.photos/seed/product-33-1/800/600', 'Premium Audio Entertainment System - Main View', 1, 'Premium audio solution'),
  (2, 33, 'img-33-2', 'https://picsum.photos/seed/product-33-2/800/600', 'Premium Audio Entertainment System - Detail', 0, 'Audio system details'),

  (1, 34, 'img-34-1', 'https://picsum.photos/seed/product-34-1/800/600', 'Intelligent Lighting Control System - Main View', 1, 'Lighting control technology'),
  (2, 34, 'img-34-2', 'https://picsum.photos/seed/product-34-2/800/600', 'Intelligent Lighting Control System - Detail', 0, 'Control panel features'),

  (1, 35, 'img-35-1', 'https://picsum.photos/seed/product-35-1/800/600', 'Advanced Climate Control System - Main View', 1, 'Climate control unit'),
  (2, 35, 'img-35-2', 'https://picsum.photos/seed/product-35-2/800/600', 'Advanced Climate Control System - Detail', 0, 'System controls'),

  (1, 36, 'img-36-1', 'https://picsum.photos/seed/product-36-1/800/600', 'Complete System Integration - Main View', 1, 'Integration platform'),
  (2, 36, 'img-36-2', 'https://picsum.photos/seed/product-36-2/800/600', 'Complete System Integration - Detail', 0, 'Platform features'),

  (1, 37, 'img-37-1', 'https://picsum.photos/seed/product-37-1/800/600', 'Annual Maintenance Program - Main View', 1, 'Maintenance services'),
  (2, 37, 'img-37-2', 'https://picsum.photos/seed/product-37-2/800/600', 'Annual Maintenance Program - Detail', 0, 'Service details'),

  (1, 38, 'img-38-1', 'https://picsum.photos/seed/product-38-1/800/600', 'Remote Monitoring & Diagnostics - Main View', 1, 'Monitoring system'),
  (2, 38, 'img-38-2', 'https://picsum.photos/seed/product-38-2/800/600', 'Remote Monitoring & Diagnostics - Detail', 0, 'Diagnostics features');

-- Vendor 13 products (5 products: IDs 49-53)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 49, 'img-49-1', 'https://picsum.photos/seed/product-49-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Navigation technology'),
  (2, 49, 'img-49-2', 'https://picsum.photos/seed/product-49-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'System interface'),

  (1, 50, 'img-50-1', 'https://picsum.photos/seed/product-50-1/800/600', 'Premium Audio Entertainment System - Main View', 1, 'Entertainment system'),
  (2, 50, 'img-50-2', 'https://picsum.photos/seed/product-50-2/800/600', 'Premium Audio Entertainment System - Detail', 0, 'Audio controls'),

  (1, 51, 'img-51-1', 'https://picsum.photos/seed/product-51-1/800/600', 'Intelligent Lighting Control System - Main View', 1, 'Lighting system'),
  (2, 51, 'img-51-2', 'https://picsum.photos/seed/product-51-2/800/600', 'Intelligent Lighting Control System - Detail', 0, 'Control features'),

  (1, 52, 'img-52-1', 'https://picsum.photos/seed/product-52-1/800/600', 'Complete System Integration - Main View', 1, 'Integration solution'),
  (2, 52, 'img-52-2', 'https://picsum.photos/seed/product-52-2/800/600', 'Complete System Integration - Detail', 0, 'System details'),

  (1, 53, 'img-53-1', 'https://picsum.photos/seed/product-53-1/800/600', 'Annual Maintenance Program - Main View', 1, 'Maintenance package'),
  (2, 53, 'img-53-2', 'https://picsum.photos/seed/product-53-2/800/600', 'Annual Maintenance Program - Detail', 0, 'Service package');

-- Vendor 12 products (5 products: IDs 54-58)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 54, 'img-54-1', 'https://picsum.photos/seed/product-54-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Navigation equipment'),
  (2, 54, 'img-54-2', 'https://picsum.photos/seed/product-54-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'Equipment details'),

  (1, 55, 'img-55-1', 'https://picsum.photos/seed/product-55-1/800/600', 'Premium Audio Entertainment System - Main View', 1, 'Audio entertainment'),
  (2, 55, 'img-55-2', 'https://picsum.photos/seed/product-55-2/800/600', 'Premium Audio Entertainment System - Detail', 0, 'System components'),

  (1, 56, 'img-56-1', 'https://picsum.photos/seed/product-56-1/800/600', 'Intelligent Lighting Control System - Main View', 1, 'Lighting technology'),
  (2, 56, 'img-56-2', 'https://picsum.photos/seed/product-56-2/800/600', 'Intelligent Lighting Control System - Detail', 0, 'Technology features'),

  (1, 57, 'img-57-1', 'https://picsum.photos/seed/product-57-1/800/600', 'Complete System Integration - Main View', 1, 'System integration'),
  (2, 57, 'img-57-2', 'https://picsum.photos/seed/product-57-2/800/600', 'Complete System Integration - Detail', 0, 'Integration platform'),

  (1, 58, 'img-58-1', 'https://picsum.photos/seed/product-58-1/800/600', 'Annual Maintenance Program - Main View', 1, 'Service program'),
  (2, 58, 'img-58-2', 'https://picsum.photos/seed/product-58-2/800/600', 'Annual Maintenance Program - Detail', 0, 'Program benefits');

-- Vendor 9 products (3 products: IDs 65-67)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 65, 'img-65-1', 'https://picsum.photos/seed/product-65-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Marine navigation'),
  (2, 65, 'img-65-2', 'https://picsum.photos/seed/product-65-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'Navigation features'),

  (1, 66, 'img-66-1', 'https://picsum.photos/seed/product-66-1/800/600', 'Premium Audio Entertainment System - Main View', 1, 'Audio system'),
  (2, 66, 'img-66-2', 'https://picsum.photos/seed/product-66-2/800/600', 'Premium Audio Entertainment System - Detail', 0, 'Entertainment features'),

  (1, 67, 'img-67-1', 'https://picsum.photos/seed/product-67-1/800/600', 'Complete System Integration - Main View', 1, 'System integration'),
  (2, 67, 'img-67-2', 'https://picsum.photos/seed/product-67-2/800/600', 'Complete System Integration - Detail', 0, 'Integration details');

-- Vendor 7 products (3 products: IDs 71-73)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 71, 'img-71-1', 'https://picsum.photos/seed/product-71-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Navigation system'),
  (2, 71, 'img-71-2', 'https://picsum.photos/seed/product-71-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'System details'),

  (1, 72, 'img-72-1', 'https://picsum.photos/seed/product-72-1/800/600', 'Premium Audio Entertainment System - Main View', 1, 'Premium audio'),
  (2, 72, 'img-72-2', 'https://picsum.photos/seed/product-72-2/800/600', 'Premium Audio Entertainment System - Detail', 0, 'Audio details'),

  (1, 73, 'img-73-1', 'https://picsum.photos/seed/product-73-1/800/600', 'Complete System Integration - Main View', 1, 'Integration platform'),
  (2, 73, 'img-73-2', 'https://picsum.photos/seed/product-73-2/800/600', 'Complete System Integration - Detail', 0, 'Platform details');

-- Vendor 4 products (2 products: IDs 78-79)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 78, 'img-78-1', 'https://picsum.photos/seed/product-78-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Navigation solution'),
  (2, 78, 'img-78-2', 'https://picsum.photos/seed/product-78-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'Solution features'),

  (1, 79, 'img-79-1', 'https://picsum.photos/seed/product-79-1/800/600', 'Complete System Integration - Main View', 1, 'System solution'),
  (2, 79, 'img-79-2', 'https://picsum.photos/seed/product-79-2/800/600', 'Complete System Integration - Detail', 0, 'Solution details');

-- Vendor 1 products (2 products: IDs 84-85)
INSERT INTO products_images (_order, _parent_id, id, url, alt_text, is_main, caption) VALUES
  (1, 84, 'img-84-1', 'https://picsum.photos/seed/product-84-1/800/600', 'Advanced Marine Navigation System - Main View', 1, 'Navigation technology'),
  (2, 84, 'img-84-2', 'https://picsum.photos/seed/product-84-2/800/600', 'Advanced Marine Navigation System - Detail', 0, 'Technology details'),

  (1, 85, 'img-85-1', 'https://picsum.photos/seed/product-85-1/800/600', 'Complete System Integration - Main View', 1, 'Integration service'),
  (2, 85, 'img-85-2', 'https://picsum.photos/seed/product-85-2/800/600', 'Complete System Integration - Detail', 0, 'Service details');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show product image counts
SELECT
  p.id,
  p.name,
  p.vendor_id,
  COUNT(pi.id) as image_count,
  SUM(CASE WHEN pi.is_main = 1 THEN 1 ELSE 0 END) as main_images
FROM products p
LEFT JOIN products_images pi ON p.id = pi._parent_id
WHERE p.published = 1
GROUP BY p.id, p.name, p.vendor_id
ORDER BY p.vendor_id, p.id;

-- Summary stats
SELECT
  'Total products:' as metric,
  COUNT(DISTINCT _parent_id) as count
FROM products_images
UNION ALL
SELECT
  'Total images:',
  COUNT(*) as count
FROM products_images
UNION ALL
SELECT
  'Products with main image:',
  COUNT(DISTINCT _parent_id)
FROM products_images
WHERE is_main = 1;
