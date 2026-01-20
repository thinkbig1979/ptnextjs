#!/usr/bin/env node

/**
 * Claude Code Hook - PreCompact Graceful Shutdown Signal
 *
 * This script is triggered automatically by Claude Code before context compaction.
 * Instead of auto-generating a ledger (which may miss in-flight subagent work),
 * it signals the agent to gracefully wrap up and create the ledger itself.
 *
 * How it works:
 * 1. Compaction triggered (auto or manual) -> Claude Code triggers this hook
 * 2. Hook outputs clear instructions to the agent
 * 3. Agent wraps up: waits for subagents, creates ledger, commits, stops
 *
 * Why this approach:
 * - Subagents may still be running when PreCompact fires
 * - Auto-generated ledgers would miss their in-flight context
 * - The agent knows what's happening and can create a complete ledger
 *
 * Hook Input (JSON via stdin):
 *   {
 *     "session_id": "abc123",
 *     "transcript_path": "~/.claude/projects/.../session.jsonl",
 *     "trigger": "auto" | "manual",
 *     "custom_instructions": ""
 *   }
 *
 * Hook Output:
 *   Exit code 0 = success (don't block compaction)
 *   Stdout = instructions displayed to agent
 *
 * Version: 2.0.0
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Get project directory from environment or cwd
 */
function getProjectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

/**
 * Read JSON input from stdin
 */
async function readStdinJson() {
  return new Promise((resolve) => {
    let data = "";
    const timeout = setTimeout(() => {
      resolve(null);
    }, 1000);

    process.stdin.on("data", (chunk) => {
      clearTimeout(timeout);
      data += chunk;
    });

    process.stdin.on("end", () => {
      clearTimeout(timeout);
      try {
        resolve(data ? JSON.parse(data) : null);
      } catch (e) {
        resolve(null);
      }
    });

    process.stdin.on("error", () => {
      clearTimeout(timeout);
      resolve(null);
    });

    if (process.stdin.isTTY) {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

/**
 * Get current git branch
 */
function getGitBranch(projectDir) {
  try {
    return (
      execSync("git branch --show-current", {
        cwd: projectDir,
        encoding: "utf8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      }).trim() || null
    );
  } catch (e) {
    return null;
  }
}

/**
 * Get git status summary
 */
function getGitStatus(projectDir) {
  try {
    const status = execSync("git status --porcelain", {
      cwd: projectDir,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return status ? status.split("\n") : [];
  } catch (e) {
    return [];
  }
}

/**
 * Check if session ledger exists
 */
function hasExistingLedger(projectDir) {
  return fs.existsSync(path.join(projectDir, ".agent-os/session-ledger.md"));
}

/**
 * Main function
 */
async function main() {
  try {
    const projectDir = getProjectDir();
    const input = await readStdinJson();
    const trigger = input?.trigger || "auto";

    const gitBranch = getGitBranch(projectDir);
    const gitStatus = getGitStatus(projectDir);
    const hasLedger = hasExistingLedger(projectDir);

    // Build the signal message
    const lines = [];
    lines.push("");
    lines.push(
      "╔══════════════════════════════════════════════════════════════════╗",
    );
    lines.push(
      "║  CONTEXT COMPACTION IMMINENT - GRACEFUL SHUTDOWN REQUIRED        ║",
    );
    lines.push(
      "╚══════════════════════════════════════════════════════════════════╝",
    );
    lines.push("");
    lines.push(`Trigger: ${trigger} compaction`);
    lines.push(`Branch: ${gitBranch || "unknown"}`);
    lines.push(`Uncommitted changes: ${gitStatus.length}`);
    lines.push(
      `Existing ledger: ${hasLedger ? "yes (will be archived)" : "no"}`,
    );
    lines.push("");
    lines.push("REQUIRED ACTIONS:");
    lines.push("─────────────────");
    lines.push("1. DO NOT start any new tasks or subagents");
    lines.push("2. Wait for any running subagents to complete and report back");
    lines.push("3. Once all subagents are done, create a session ledger:");
    lines.push("");
    lines.push("   Copy template and fill in current state:");
    lines.push(
      "   cp templates/session-ledger.md.template .agent-os/session-ledger.md",
    );
    lines.push("");
    lines.push("   OR use the context-aware command which handles this:");
    lines.push("   The ledger should capture:");
    lines.push("   - Current task (bd show <id> or TodoWrite state)");
    lines.push("   - What was just completed");
    lines.push("   - What remains to be done");
    lines.push("   - Any blockers or decisions made");
    lines.push("");
    lines.push("4. Commit any uncommitted work:");
    lines.push('   git add -A && git commit -m "WIP: <description>"');
    lines.push("   bd sync");
    lines.push("");
    lines.push("5. After ledger is written, STOP. Do not continue work.");
    lines.push("");
    lines.push(
      "The next session will auto-detect the ledger for seamless resume.",
    );
    lines.push("");

    if (gitStatus.length > 0) {
      lines.push("UNCOMMITTED FILES:");
      lines.push("──────────────────");
      gitStatus.slice(0, 10).forEach((f) => lines.push(`  ${f}`));
      if (gitStatus.length > 10) {
        lines.push(`  ... and ${gitStatus.length - 10} more`);
      }
      lines.push("");
    }

    console.log(lines.join("\n"));

    process.exit(0);
  } catch (error) {
    // Fail gracefully - still output basic instructions
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  CONTEXT COMPACTION IMMINENT - GRACEFUL SHUTDOWN REQUIRED        ║
╚══════════════════════════════════════════════════════════════════╝

REQUIRED: Create session ledger before context is lost.

1. Wait for any running subagents to complete
2. Create ledger: cp templates/session-ledger.md.template .agent-os/session-ledger.md
3. Fill in current state (task, progress, next steps)
4. Commit: git add -A && git commit -m "WIP: session handoff"
5. STOP - do not continue work

Hook error: ${error.message}
`);
    process.exit(0);
  }
}

main();
