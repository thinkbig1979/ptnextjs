#!/usr/bin/env node

/**
 * Agent OS Deliverable Verification Utility v1.0.0
 *
 * Extracts deliverable manifests from task files and verifies file existence.
 * Supports both CLI usage and programmatic import.
 *
 * Usage:
 *   CLI:
 *     node verify-deliverables.js --task-file tasks/task-001.md --project-root .
 *     node verify-deliverables.js --task-file tasks/task-001.md
 *
 *   Programmatic:
 *     const { extractDeliverables, verifyDeliverables, generateReport } = require('./verify-deliverables.js');
 *     const deliverables = extractDeliverables('/path/to/task-file.md');
 *     const results = verifyDeliverables(deliverables, '/project/root');
 *     console.log(generateReport(results));
 *
 * Markdown Parsing:
 *   Looks for "## Deliverables" or "### Expected Files" sections
 *   Extracts paths from:
 *   - Backtick-wrapped: `src/components/Button.tsx`
 *   - Plain list items: - src/utils/helper.ts
 *   - Checkbox items: - [ ] `path/to/file.ext`
 *
 * @see Agent OS v4.3.0+ Deliverable Verification
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract deliverable file paths from a task markdown file
 *
 * @param {string} taskFilePath - Absolute path to task file
 * @returns {Array<{path: string, source: string, lineNumber: number}>} - Array of deliverable objects
 */
function extractDeliverables(taskFilePath) {
  if (!fs.existsSync(taskFilePath)) {
    throw new Error(`Task file not found: ${taskFilePath}`);
  }

  const content = fs.readFileSync(taskFilePath, 'utf8');
  const lines = content.split('\n');
  const deliverables = [];

  let inDeliverableSection = false;
  let currentSection = null;
  let sectionLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Detect section headers
    const headerMatch = line.match(/^(#{2,})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2].trim();

      // Check if this is a deliverables section
      if (
        title.toLowerCase().includes('deliverable') ||
        title.toLowerCase().includes('expected files') ||
        title.toLowerCase().includes('files to be created') ||
        title.toLowerCase().includes('files to be modified')
      ) {
        inDeliverableSection = true;
        currentSection = title;
        sectionLevel = level;
        continue;
      }

      // If we hit a same-level or higher-level header, exit deliverable section
      if (inDeliverableSection && level <= sectionLevel) {
        inDeliverableSection = false;
        currentSection = null;
      }

      continue;
    }

    // Extract file paths from deliverable section
    if (inDeliverableSection) {
      const extracted = extractPathsFromLine(line, currentSection, lineNumber);
      deliverables.push(...extracted);
    }
  }

  return deliverables;
}

/**
 * Extract file paths from a single line of markdown
 *
 * @param {string} line - Line of markdown
 * @param {string} section - Section name for context
 * @param {number} lineNumber - Line number for reference
 * @returns {Array<{path: string, source: string, lineNumber: number}>} - Extracted paths
 */
function extractPathsFromLine(line, section, lineNumber) {
  const paths = [];
  const trimmed = line.trim();

  // Skip empty lines
  if (!trimmed) return paths;

  // Skip lines that are just descriptions (no code-like content)
  if (!trimmed.includes('/') && !trimmed.includes('`')) {
    return paths;
  }

  // Pattern 1: Backtick-wrapped paths: `src/components/Button.tsx`
  const backtickMatches = trimmed.matchAll(/`([^`]+\.[a-zA-Z0-9]+)`/g);
  for (const match of backtickMatches) {
    const filePath = match[1].trim();
    if (isValidFilePath(filePath)) {
      paths.push({
        path: filePath,
        source: section || 'unknown',
        lineNumber
      });
    }
  }

  // Pattern 2: List items with plain paths: - src/utils/helper.ts
  // Match: "- path/to/file.ext" or "- [ ] path/to/file.ext"
  const listMatch = trimmed.match(/^[-*]\s+(?:\[[ x]\]\s+)?([^\s`-][^\s]*\.[a-zA-Z0-9]+)/);
  if (listMatch) {
    const filePath = listMatch[1].trim();
    // Remove any trailing description after the path
    const cleanPath = filePath.split(/\s+/)[0];
    if (isValidFilePath(cleanPath) && !paths.some(p => p.path === cleanPath)) {
      paths.push({
        path: cleanPath,
        source: section || 'unknown',
        lineNumber
      });
    }
  }

  return paths;
}

/**
 * Check if a string looks like a valid file path
 *
 * @param {string} str - String to check
 * @returns {boolean} - True if looks like a file path
 */
function isValidFilePath(str) {
  // Must have an extension
  if (!/\.[a-zA-Z0-9]+$/.test(str)) return false;

  // Must not be a URL
  if (str.startsWith('http://') || str.startsWith('https://')) return false;

  // Must not have spaces (file paths shouldn't have spaces in deliverables)
  if (str.includes(' ')) return false;

  // Must have at least one directory separator or be just a filename
  // (allowing both "src/file.ts" and "file.ts")
  return true;
}

/**
 * Verify that deliverable files exist
 *
 * @param {Array<{path: string, source: string, lineNumber: number}>} deliverables - Deliverables to verify
 * @param {string} projectRoot - Project root directory (absolute path)
 * @returns {Object} - Verification results
 */
function verifyDeliverables(deliverables, projectRoot) {
  const results = {
    verified: [],
    missing: [],
    total: deliverables.length,
    projectRoot: path.resolve(projectRoot)
  };

  for (const deliverable of deliverables) {
    const fullPath = path.resolve(projectRoot, deliverable.path);

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      results.verified.push({
        ...deliverable,
        fullPath,
        size: stats.size,
        modified: stats.mtime
      });
    } else {
      results.missing.push({
        ...deliverable,
        fullPath
      });
    }
  }

  return results;
}

/**
 * Generate a human-readable report from verification results
 *
 * @param {Object} results - Results from verifyDeliverables()
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted report
 */
function generateReport(results, options = {}) {
  const { colors = true, verbose = false } = options;

  // ANSI colors
  const c = colors ? {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
  } : {
    reset: '', green: '', red: '', yellow: '', cyan: '', bold: '', dim: ''
  };

  const lines = [];

  // Header
  lines.push('');
  lines.push(`${c.bold}═══════════════════════════════════════════════════════════════${c.reset}`);
  lines.push(`${c.bold}  Deliverable Verification Report${c.reset}`);
  lines.push(`${c.bold}═══════════════════════════════════════════════════════════════${c.reset}`);
  lines.push('');

  // Summary
  lines.push(`  Total Deliverables: ${results.total}`);
  lines.push(`  ${c.green}✓ Verified:${c.reset}         ${results.verified.length}`);

  if (results.missing.length > 0) {
    lines.push(`  ${c.red}✗ Missing:${c.reset}          ${results.missing.length}`);
  } else {
    lines.push(`  Missing:            ${results.missing.length}`);
  }

  lines.push('');
  lines.push(`  Project Root: ${c.dim}${results.projectRoot}${c.reset}`);
  lines.push('');

  // Verified files
  if (results.verified.length > 0) {
    lines.push(`${c.green}${c.bold}Verified Files:${c.reset}`);
    for (const file of results.verified) {
      const sizeKB = (file.size / 1024).toFixed(1);
      if (verbose) {
        lines.push(`  ${c.green}✓${c.reset} ${file.path}`);
        lines.push(`    ${c.dim}Source: ${file.source} (line ${file.lineNumber})${c.reset}`);
        lines.push(`    ${c.dim}Size: ${sizeKB} KB | Modified: ${file.modified.toISOString()}${c.reset}`);
      } else {
        lines.push(`  ${c.green}✓${c.reset} ${file.path} ${c.dim}(${sizeKB} KB)${c.reset}`);
      }
    }
    lines.push('');
  }

  // Missing files
  if (results.missing.length > 0) {
    lines.push(`${c.red}${c.bold}Missing Files:${c.reset}`);
    for (const file of results.missing) {
      if (verbose) {
        lines.push(`  ${c.red}✗${c.reset} ${file.path}`);
        lines.push(`    ${c.dim}Source: ${file.source} (line ${file.lineNumber})${c.reset}`);
        lines.push(`    ${c.dim}Expected at: ${file.fullPath}${c.reset}`);
      } else {
        lines.push(`  ${c.red}✗${c.reset} ${file.path}`);
      }
    }
    lines.push('');
  }

  // Status
  const allVerified = results.missing.length === 0 && results.total > 0;
  const noDeliverables = results.total === 0;

  if (noDeliverables) {
    lines.push(`${c.yellow}${c.bold}⚠ No deliverables found${c.reset}`);
    lines.push(`${c.dim}Check that the task file has a "## Deliverables" or "### Expected Files" section.${c.reset}`);
  } else if (allVerified) {
    lines.push(`${c.green}${c.bold}✓ All deliverables verified${c.reset}`);
    lines.push(`${c.dim}All ${results.total} expected files exist.${c.reset}`);
  } else {
    lines.push(`${c.red}${c.bold}✗ Verification failed${c.reset}`);
    lines.push(`${c.dim}${results.missing.length} of ${results.total} deliverable(s) missing.${c.reset}`);
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {
    taskFile: null,
    projectRoot: process.cwd(),
    verbose: false,
    json: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--task-file':
      case '-t':
        options.taskFile = args[++i];
        break;
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--json':
      case '-j':
        options.json = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  // Show help
  if (options.help || !options.taskFile) {
    console.log('Agent OS Deliverable Verification Utility v1.0.0');
    console.log('');
    console.log('Usage: verify-deliverables [options]');
    console.log('');
    console.log('Options:');
    console.log('  -t, --task-file <path>      Path to task markdown file (required)');
    console.log('  -p, --project-root <path>   Project root directory (default: current directory)');
    console.log('  -v, --verbose               Show detailed information');
    console.log('  -j, --json                  Output results as JSON');
    console.log('  -h, --help                  Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  verify-deliverables --task-file tasks/task-001.md');
    console.log('  verify-deliverables -t tasks/task-001.md -p /path/to/project');
    console.log('  verify-deliverables -t tasks/task-001.md --verbose --json');
    console.log('');
    process.exit(options.help ? 0 : 1);
  }

  try {
    // Resolve paths
    const taskFilePath = path.resolve(options.taskFile);
    const projectRoot = path.resolve(options.projectRoot);

    // Extract deliverables
    const deliverables = extractDeliverables(taskFilePath);

    // Verify deliverables
    const results = verifyDeliverables(deliverables, projectRoot);

    // Output results
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      const report = generateReport(results, { verbose: options.verbose });
      console.log(report);
    }

    // Exit code: 0 if all verified, 1 if missing files, 2 if no deliverables
    if (results.total === 0) {
      process.exit(2);
    } else if (results.missing.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (options.verbose) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  extractDeliverables,
  verifyDeliverables,
  generateReport
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
