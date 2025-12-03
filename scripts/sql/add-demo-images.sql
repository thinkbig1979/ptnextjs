-- Demo Images with External URLs
-- Use this script to quickly add professional images from Unsplash to your demo database

-- Yacht Images
INSERT INTO media (filename, alt, external_url, caption, created_at, updated_at) VALUES
  ('luxury-yacht-1', 'Luxury superyacht at sunset', 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a', 'Modern superyacht cruising at golden hour', datetime('now'), datetime('now')),
  ('yacht-interior-1', 'Luxury yacht interior', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', 'High-end yacht interior design', datetime('now'), datetime('now')),
  ('yacht-technology-1', 'Yacht navigation system', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', 'Advanced marine navigation technology', datetime('now'), datetime('now'));

-- Technology/Electronics Images
INSERT INTO media (filename, alt, external_url, caption, created_at, updated_at) VALUES
  ('marine-electronics-1', 'Marine electronics dashboard', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31', 'Modern marine electronics interface', datetime('now'), datetime('now')),
  ('tech-circuit-1', 'Advanced circuit board', 'https://images.unsplash.com/photo-1518770660439-4636190af475', 'High-tech marine system components', datetime('now'), datetime('now')),
  ('tech-workspace-1', 'Technology workspace', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'Marine technology development workspace', datetime('now'), datetime('now'));

-- Professional/Business Images
INSERT INTO media (filename, alt, external_url, caption, created_at, updated_at) VALUES
  ('professional-team-1', 'Professional engineering team', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', 'Marine technology professionals collaborating', datetime('now'), datetime('now')),
  ('handshake-partnership-1', 'Business handshake', 'https://images.unsplash.com/photo-1556761175-4b46a572b786', 'Professional partnership agreement', datetime('now'), datetime('now'));

-- Show newly added images
SELECT id, filename, alt, external_url
FROM media
WHERE external_url IS NOT NULL
ORDER BY id DESC;
