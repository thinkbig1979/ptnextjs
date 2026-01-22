/**
 * Static Site Export Script
 * Uses Playwright to render pages and save them as static HTML
 *
 * Usage: npx tsx scripts/export-static-site.ts
 */

import { chromium, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = process.env.HOME + '/tmp-pt';
const BASE_URL = 'http://localhost:3000';

// Pages to export (add more as needed)
const PAGES_TO_EXPORT = [
  '/',
  '/about',
  '/contact',
  '/custom-lighting',
  '/custom-lighting/services',
  '/consultancy',
  '/consultancy/clients',
  '/consultancy/suppliers',
  '/vendors',
  '/products',
  '/blog',
  '/info-for-vendors',
];

async function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Define the navigation structure for static export
const NAV_DROPDOWNS: Record<string, Array<{ label: string; href: string }>> = {
  'Consultancy': [
    { label: 'For Project Teams', href: '/consultancy/clients' },
    { label: 'For Suppliers', href: '/consultancy/suppliers' },
  ],
  'Industry Directory': [
    { label: 'Vendors', href: '/vendors' },
    { label: 'Products', href: '/products' },
  ],
};

async function inlineStyles(page: Page): Promise<string> {
  const navDropdowns = NAV_DROPDOWNS;

  // Get all stylesheets and inline them
  return await page.evaluate((dropdowns) => {
    const styles: string[] = [];

    // Collect all stylesheet content
    for (const sheet of document.styleSheets) {
      try {
        if (sheet.cssRules) {
          let css = '';
          for (const rule of sheet.cssRules) {
            css += rule.cssText + '\n';
          }
          styles.push(css);
        }
      } catch (e) {
        // Cross-origin stylesheets can't be accessed
        console.warn('Could not access stylesheet:', sheet.href);
      }
    }

    // Add CSS for hover dropdowns
    const dropdownCSS = `
      /* Static export dropdown styles */
      .static-dropdown {
        position: relative;
        display: inline-block;
      }
      .static-dropdown-trigger {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }
      .static-dropdown-content {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        min-width: 180px;
        background: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        padding: 0.5rem;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.15s, visibility 0.15s;
        z-index: 100;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .static-dropdown:hover .static-dropdown-content,
      .static-dropdown:focus-within .static-dropdown-content {
        opacity: 1;
        visibility: visible;
      }
      .static-dropdown-item {
        display: block;
        padding: 0.5rem 0.75rem;
        color: hsl(var(--foreground));
        text-decoration: none;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        white-space: nowrap;
      }
      .static-dropdown-item:hover {
        background: hsl(var(--accent) / 0.1);
        color: hsl(var(--accent));
      }
      .dropdown-chevron {
        width: 1rem;
        height: 1rem;
        transition: transform 0.2s;
      }
      .static-dropdown:hover .dropdown-chevron {
        transform: rotate(180deg);
      }
    `;
    styles.push(dropdownCSS);

    // Create a style tag with all CSS
    const styleTag = document.createElement('style');
    styleTag.textContent = styles.join('\n');

    // Remove existing link tags for stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());

    // Add the combined style tag to head
    document.head.appendChild(styleTag);

    // Convert Radix dropdown buttons to CSS hover dropdowns
    document.querySelectorAll('button[aria-haspopup="menu"]').forEach(button => {
      const buttonText = button.textContent?.trim().replace(/\s+/g, ' ').split(' ')[0] || '';

      // Find matching dropdown config
      const dropdownKey = Object.keys(dropdowns).find(key =>
        buttonText.toLowerCase().includes(key.toLowerCase().split(' ')[0])
      );

      if (dropdownKey && dropdowns[dropdownKey]) {
        const items = dropdowns[dropdownKey];
        const parent = button.parentElement;

        if (parent) {
          // Create new dropdown structure
          const dropdown = document.createElement('div');
          dropdown.className = 'static-dropdown';

          const trigger = document.createElement('span');
          trigger.className = 'static-dropdown-trigger font-poppins-medium text-sm text-foreground/80 hover:text-foreground';
          trigger.innerHTML = `${dropdownKey} <svg class="dropdown-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

          const content = document.createElement('div');
          content.className = 'static-dropdown-content';

          items.forEach(item => {
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'static-dropdown-item';
            link.textContent = item.label;
            content.appendChild(link);
          });

          dropdown.appendChild(trigger);
          dropdown.appendChild(content);

          // Replace button with dropdown
          parent.replaceChild(dropdown, button);
        }
      }
    });

    // Remove Next.js script tags (they won't work statically)
    document.querySelectorAll('script').forEach(el => {
      // Keep inline scripts that don't have src
      if (el.src) {
        el.remove();
      }
    });

    // Remove Next.js specific elements
    document.querySelectorAll('[id^="__next"]').forEach(el => {
      // Keep the content but unwrap from Next.js container
    });

    // Fix image paths to be relative
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('/_next/')) {
        // These are optimized images, try to get original
        const originalSrc = img.getAttribute('data-src') || src;
        img.setAttribute('src', originalSrc);
      }
    });

    // Fix internal links - keep clean URLs (serve handles /about -> /about/index.html)
    // Only fix root link for consistency
    document.querySelectorAll('a[href="/"]').forEach(a => {
      a.setAttribute('href', '/');
    });

    return document.documentElement.outerHTML;
  }, navDropdowns);
}

async function exportPage(page: Page, urlPath: string) {
  const url = BASE_URL + urlPath;
  console.log(`Exporting: ${urlPath}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for content to render
    await page.waitForTimeout(1000);

    // Get the rendered HTML with inlined styles
    const html = await inlineStyles(page);

    // Determine output path
    let outputPath: string;
    if (urlPath === '/') {
      outputPath = path.join(OUTPUT_DIR, 'index.html');
    } else {
      // Create directory structure and use index.html for clean URLs
      const dirPath = path.join(OUTPUT_DIR, urlPath);
      ensureDir(dirPath);
      outputPath = path.join(dirPath, 'index.html');

      // Also create a .html file for direct access
      const htmlFilePath = path.join(OUTPUT_DIR, urlPath + '.html');
      fs.writeFileSync(htmlFilePath, '<!DOCTYPE html>\n' + html);
    }

    // Write the HTML file
    fs.writeFileSync(outputPath, '<!DOCTYPE html>\n' + html);
    console.log(`  ✓ Saved: ${outputPath}`);
  } catch (error) {
    console.error(`  ✗ Failed: ${urlPath}`, error);
  }
}

async function copyPublicAssets() {
  const publicDir = path.join(process.cwd(), 'public');
  const targetDir = OUTPUT_DIR;

  console.log('\nCopying public assets...');

  function copyRecursive(src: string, dest: string) {
    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
      ensureDir(dest);
      for (const file of fs.readdirSync(src)) {
        copyRecursive(path.join(src, file), path.join(dest, file));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  if (fs.existsSync(publicDir)) {
    copyRecursive(publicDir, targetDir);
    console.log('  ✓ Public assets copied');
  }
}

async function createNetlifyConfig() {
  // Create a simple _redirects file for Netlify
  const redirects = `
# Handle clean URLs
/*    /index.html   200
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, '_redirects'), redirects.trim());
  console.log('  ✓ Created _redirects for Netlify');
}

async function main() {
  console.log('='.repeat(50));
  console.log('Static Site Export');
  console.log('='.repeat(50));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  // Clean and create output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  ensureDir(OUTPUT_DIR);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log('Exporting pages...\n');

  // Export each page
  for (const pagePath of PAGES_TO_EXPORT) {
    await exportPage(page, pagePath);
  }

  await browser.close();

  // Copy public assets (images, fonts, etc.)
  await copyPublicAssets();

  // Create Netlify config
  await createNetlifyConfig();

  console.log('\n' + '='.repeat(50));
  console.log('Export complete!');
  console.log(`Files saved to: ${OUTPUT_DIR}`);
  console.log('');
  console.log('To preview locally:');
  console.log(`  cd ${OUTPUT_DIR} && npx serve`);
  console.log('');
  console.log('To deploy to Netlify:');
  console.log('  Drag the folder to https://app.netlify.com/drop');
  console.log('='.repeat(50));
}

main().catch(console.error);
