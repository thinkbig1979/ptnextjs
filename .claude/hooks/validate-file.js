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
 *   Exit code 1 = block operation (validation errors with fail_on_error)
 *   Stdout = feedback message displayed to agent
 *
 * Version: 3.0.0 (Per-validator fail_on_error support)
 */

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

/**
 * Load hooks config to get per-validator settings
 */
function loadHooksConfig() {
  const configPath = path.join(
    process.env.HOME,
    ".agent-os",
    "hooks",
    "config.yml",
  );
  try {
    if (fs.existsSync(configPath)) {
      return yaml.load(fs.readFileSync(configPath, "utf8"));
    }
  } catch (error) {
    console.error(`⚠️  Failed to load hooks config: ${error.message}`);
  }
  return {};
}

/**
 * Get fail_on_error setting for a specific validator
 * Priority: validator-specific > global > false
 */
function shouldFailOnError(config, validatorName) {
  // Check for validator-specific setting
  const validatorConfig = config.validators?.[validatorName];
  if (validatorConfig?.fail_on_error !== undefined) {
    return validatorConfig.fail_on_error;
  }

  // Check for global setting
  if (config.hooks?.fail_on_error !== undefined) {
    return config.hooks.fail_on_error;
  }

  // Default to false
  return false;
}

/**
 * Format error for display
 */
function formatError(error) {
  if (typeof error === "string") {
    return error;
  }
  if (error.message) {
    const location = error.line
      ? `:${error.line}${error.column ? `:${error.column}` : ""}`
      : "";
    const rule = error.rule ? ` [${error.rule}]` : "";
    return `${location}${rule} ${error.message}`;
  }
  return JSON.stringify(error);
}

async function main() {
  try {
    // Parse Claude Code hook input
    const toolName = process.env.CLAUDE_HOOK_TOOL_NAME;
    const toolParameters = JSON.parse(
      process.env.CLAUDE_HOOK_TOOL_PARAMETERS || "{}",
    );

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
      /pnpm-lock\.yaml$/,
    ];

    if (skipPatterns.some((pattern) => pattern.test(filePath))) {
      process.exit(0);
    }

    // Check if file exists (might be deleted)
    if (!fs.existsSync(filePath)) {
      process.exit(0);
    }

    // Load hooks config for per-validator settings
    const hooksConfig = loadHooksConfig();

    // Load HookRunner
    const HookRunner = require(
      path.join(process.env.HOME, ".agent-os", "hooks", "runner.js"),
    );
    const runner = new HookRunner({ verbose: false });

    // Get content that was written
    const content = fs.readFileSync(filePath, "utf8");

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
      fs.writeFileSync(filePath, fixedContent, "utf8");
      console.log(`\n🔧 Auto-fixes applied to ${path.basename(filePath)}`);
    }

    // Check for validation errors, respecting per-validator fail_on_error settings
    let hasBlockingErrors = false;
    let blockingValidators = [];

    if (result.results && result.results.validationResults) {
      for (const validationResult of result.results.validationResults) {
        if (validationResult.success && validationResult.result) {
          const vResult = validationResult.result;
          const validatorName = validationResult.validator;

          // Check if this validator reported errors
          if (
            vResult.passed === false &&
            vResult.errors &&
            vResult.errors.length > 0
          ) {
            // Check if this validator should block on error
            const shouldBlock = shouldFailOnError(hooksConfig, validatorName);

            console.error(
              `\n❌ ${validatorName}: ${vResult.errors.length} error(s)${shouldBlock ? " [BLOCKING]" : ""}`,
            );

            // Display each error
            vResult.errors.forEach((error, index) => {
              console.error(`   ${index + 1}. ${formatError(error)}`);
            });

            // Display guidance if available
            if (vResult.guidance) {
              console.error(`\n   💡 ${vResult.guidance}`);
            }

            if (shouldBlock) {
              hasBlockingErrors = true;
              blockingValidators.push(validatorName);
            }
          }
        }
      }
    }

    // Block the operation if blocking errors exist
    if (hasBlockingErrors) {
      console.error(
        `\n⛔ File write BLOCKED by: ${blockingValidators.join(", ")}`,
      );
      console.error(
        `   Fix the errors above or disable fail_on_error for these validators in hooks/config.yml`,
      );
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    // Don't block on hook errors
    console.error(`⚠️  Hook error: ${error.message}`);
    process.exit(0);
  }
}

main();
