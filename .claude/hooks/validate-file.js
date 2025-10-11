#!/usr/bin/env node

/**
 * Claude Code Hook - File Validation with Auto-Fix
 *
 * This script is triggered automatically by Claude Code AFTER Write/Edit operations.
 * It validates the file and auto-fixes issues using external tools (prettier, eslint, etc.).
 *
 * How it works:
 * 1. Agent writes file → Claude Code writes to disk
 * 2. PostToolUse hook triggers (this script)
 * 3. External tools (prettier, eslint) modify the file directly on disk
 * 4. Hook reports results to agent
 * 5. Done - no recursion because external tools don't trigger Claude Code's Write/Edit
 *
 * Hook Input (from Claude Code via environment variables):
 *   CLAUDE_HOOK_TOOL_NAME - The tool that was used (Write, Edit)
 *   CLAUDE_HOOK_TOOL_PARAMETERS - JSON string with tool parameters
 *   CLAUDE_PROJECT_DIR - Project root directory
 *
 * Hook Output:
 *   Exit code 0 = success (allows operation to proceed)
 *   Stdout = feedback message displayed to agent
 *
 * Version: 2.2.0 (PostToolUse - Auto-Fix Enabled)
 */

const path = require('path');
const fs = require('fs');

async function main() {
  try {
    // Parse Claude Code hook input
    const toolName = process.env.CLAUDE_HOOK_TOOL_NAME;
    const toolParameters = JSON.parse(process.env.CLAUDE_HOOK_TOOL_PARAMETERS || '{}');

    // Extract file path from tool parameters
    const filePath = toolParameters.file_path;
    if (!filePath) {
      process.exit(0);
    }

    // Skip validation for certain file patterns
    const skipPatterns = [
      /node_modules\//,
      /\.git\//,
      /\.agent-os\//,
      /dist\//,
      /build\//,
      /coverage\//,
      /\.min\.(js|css)$/,
      /\.map$/,
      /package-lock\.json$/,
      /yarn\.lock$/,
      /pnpm-lock\.yaml$/
    ];

    if (skipPatterns.some(pattern => pattern.test(filePath))) {
      process.exit(0);
    }

    // Check if file exists (might be deleted)
    if (!fs.existsSync(filePath)) {
      process.exit(0);
    }

    // Load HookRunner
    const HookRunner = require(path.join(process.env.HOME, '.agent-os', 'hooks', 'runner.js'));
    const runner = new HookRunner({ verbose: false });

    // Get content that was written
    const content = fs.readFileSync(filePath, 'utf8');

    // Run validation and auto-fix
    const result = await runner.runFileCreationHooks(filePath, content);

    // Check if any validator applied fixes and returned fixed content
    let fixedContent = null;
    if (result.results && result.results.validationResults) {
      for (const validationResult of result.results.validationResults) {
        if (validationResult.success && validationResult.result) {
          const vResult = validationResult.result;
          // If this validator fixed the content, use it
          if (vResult.fixed === true && vResult.content) {
            fixedContent = vResult.content;
            break; // Use the first fixed content (usually formatting validator)
          }
        }
      }
    }

    // Apply fixes to the file if content was modified
    if (fixedContent && fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`\n🔧 Auto-fixes applied to ${path.basename(filePath)}`);
    }

    process.exit(0);

  } catch (error) {
    // Don't block on hook errors
    console.error(`⚠️  Hook error: ${error.message}`);
    process.exit(0);
  }
}

main();
