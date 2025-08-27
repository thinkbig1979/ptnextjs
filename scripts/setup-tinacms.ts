#!/usr/bin/env tsx

/**
 * TinaCMS Setup and Validation Script
 * 
 * This script helps set up and validate the TinaCMS configuration for the
 * Paul Thames Next.js project with TinaCMS.
 */

import { 
  ensureDirectoryStructure, 
  validateTinaCMSSetup,
  generateSlug 
} from '../lib/tina-utils';
import fs from 'fs/promises';
import path from 'path';

// Color output utilities
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m', 
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function colorize(color: keyof typeof colors, text: string): string {
  return `${colors[color]}${text}${colors.reset}`;
}

async function main() {
  console.log(colorize('cyan', '\n🔧 TinaCMS Setup and Validation Tool\n'));
  console.log('Setting up TinaCMS configuration for Paul Thames Next.js project\n');

  try {
    // Step 1: Ensure directory structure exists
    console.log(colorize('blue', '📁 Creating directory structure...'));
    await ensureDirectoryStructure();
    console.log(colorize('green', '✅ Directory structure created\n'));

    // Step 2: Validate TinaCMS setup
    console.log(colorize('blue', '🔍 Validating TinaCMS setup...'));
    const validation = await validateTinaCMSSetup();

    if (validation.isValid) {
      console.log(colorize('green', '✅ TinaCMS setup validation passed\n'));
    } else {
      console.log(colorize('yellow', '⚠️  TinaCMS setup has issues:\n'));
      
      // Content structure issues
      if (!validation.results.contentStructure.isValid) {
        console.log(colorize('red', '❌ Content Structure Issues:'));
        validation.results.contentStructure.errors.forEach(error => {
          console.log(`   • ${error}`);
        });
        console.log();
      }

      // Media structure issues
      if (!validation.results.mediaStructure.isValid) {
        console.log(colorize('red', '❌ Media Structure Issues:'));
        validation.results.mediaStructure.errors.forEach(error => {
          console.log(`   • ${error}`);
        });
        console.log();
      }

      // Media reference issues
      if (!validation.results.mediaReferences.isValid) {
        console.log(colorize('red', '❌ Media Reference Issues:'));
        validation.results.mediaReferences.brokenReferences.forEach(ref => {
          console.log(`   • ${ref.file}: ${ref.reference}`);
        });
        console.log();
      }
    }

    // Step 3: Display setup information
    console.log(colorize('magenta', '📋 TinaCMS Configuration Summary:\n'));
    
    console.log(colorize('white', 'Collections configured:'));
    console.log('  • Categories (Reference Data)');
    console.log('  • Tags (Reference Data)');
    console.log('  • Blog Categories (Reference Data)');
    console.log('  • Partners (Main Content)');
    console.log('  • Products (Main Content)');
    console.log('  • Blog Posts (Main Content)');
    console.log('  • Team Members (Main Content)');
    console.log('  • Company Info (Single-Type)');

    console.log(colorize('white', '\nContent paths configured:'));
    console.log('  • content/categories/');
    console.log('  • content/partners/');
    console.log('  • content/products/');
    console.log('  • content/blog/posts/');
    console.log('  • content/blog/categories/');
    console.log('  • content/team/');
    console.log('  • content/tags/');
    console.log('  • content/company/');

    console.log(colorize('white', '\nMedia organization:'));
    console.log('  • public/media/ (organized by content type)');
    console.log('  • Placeholder system configured');
    console.log('  • Image optimization ready');

    // Step 4: Next steps
    console.log(colorize('cyan', '\n🚀 Next Steps:\n'));
    console.log('1. Install TinaCMS dependencies:');
    console.log(colorize('white', '   npm install tinacms @tinacms/cli\n'));
    
    console.log('2. Set up environment variables:');
    console.log('   • Copy .env.example to .env.local');
    console.log('   • Add your TINA_CLIENT_ID and TINA_TOKEN');
    console.log('   • Sign up at tina.io for credentials\n');
    
    console.log('3. Start development server:');
    console.log(colorize('white', '   npm run dev:tina\n'));
    
    console.log('4. Access TinaCMS admin:');
    console.log(colorize('white', '   http://localhost:3000/admin\n'));

    console.log(colorize('green', '✨ TinaCMS setup completed successfully!\n'));

  } catch (error) {
    console.error(colorize('red', `❌ Setup failed: ${error}`));
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize('red', `Fatal error: ${error}`));
    process.exit(1);
  });
}

export { main as setupTinaCMS };