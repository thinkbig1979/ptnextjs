/**
 * Generate Test Image Fixtures
 *
 * This script creates placeholder images for E2E tests.
 * Images are simple colored rectangles for fast generation and small file sizes.
 *
 * Usage: npx ts-node scripts/generate-test-fixtures.ts
 */

import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures');

interface ImageFixture {
  name: string;
  width: number;
  height: number;
  color: string;
  description: string;
}

/**
 * Image fixtures with dimensions and colors
 * Colors represent different content types
 */
const fixtures: ImageFixture[] = [
  {
    name: 'team-member.jpg',
    width: 300,
    height: 300,
    color: '#4F46E5', // Indigo - professional team
    description: 'Team member headshot placeholder (300x300px)',
  },
  {
    name: 'case-study-1.jpg',
    width: 800,
    height: 600,
    color: '#10B981', // Emerald - success/growth
    description: 'Case study project image placeholder (800x600px)',
  },
  {
    name: 'product-image.jpg',
    width: 600,
    height: 600,
    color: '#F59E0B', // Amber - product/premium
    description: 'Product image placeholder (600x600px)',
  },
];

/**
 * Generate a simple colored rectangle image
 */
async function generateImage(fixture: ImageFixture): Promise<void> {
  const outputPath = path.join(FIXTURES_DIR, fixture.name);

  console.log(`Generating ${fixture.description}...`);

  // Create a simple colored rectangle
  await sharp({
    create: {
      width: fixture.width,
      height: fixture.height,
      channels: 3,
      background: fixture.color,
    },
  })
    .jpeg({ quality: 80, progressive: true })
    .toFile(outputPath);

  console.log(`  Created: ${outputPath}`);

  // Get file size
  const stats = await fs.stat(outputPath);
  console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Ensure fixtures directory exists
    try {
      await fs.mkdir(FIXTURES_DIR, { recursive: true });
      console.log(`Fixtures directory ready: ${FIXTURES_DIR}`);
    } catch (error) {
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }

    console.log('\nGenerating test image fixtures...\n');

    // Generate all images
    for (const fixture of fixtures) {
      try {
        await generateImage(fixture);
      } catch (error) {
        console.error(`  Error generating ${fixture.name}:`, error);
        throw error;
      }
    }

    console.log('\nAll test fixtures generated successfully!');
    console.log(`Location: ${FIXTURES_DIR}`);
    console.log(
      '\nFixtures can now be used in E2E tests for faster, more reliable testing.'
    );
  } catch (error) {
    console.error('Error generating test fixtures:', error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
