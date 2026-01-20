#!/usr/bin/env node

/**
 * Claude Code Hook - Session Start Ledger Auto-Load
 *
 * This script is triggered automatically by Claude Code on SessionStart.
 * It finds and displays the most recent session ledger to restore context.
 *
 * How it works:
 * 1. Session starts -> Claude Code triggers this hook
 * 2. Hook checks for active ledger at .agent-os/session-ledger.md (FIRST)
 * 3. If no active ledger, scans .agent-os/ledgers/ for archived ledgers
 * 4. If recent ledger found (<24h), displays summary with UNCONFIRMED items
 * 5. Agent receives context from previous session
 *
 * Ledger Locations:
 * - Active: .agent-os/session-ledger.md (current session, checked first)
 * - Archive: .agent-os/ledgers/LEDGER-<name>-<date>.md (completed sessions)
 *
 * Hook Output:
 *   Exit code 0 = success
 *   Stdout = ledger summary displayed to agent
 *
 * Version: 1.1.0
 */

const fs = require("fs");
const path = require("path");

// Configuration
const ACTIVE_LEDGER = ".agent-os/session-ledger.md";
const LEDGER_DIR = ".agent-os/ledgers";
const MAX_AGE_HOURS = 24;
const LEDGER_PATTERN = /^LEDGER-(.+)-(\d{4}-\d{2}-\d{2})\.md$/;

/**
 * Get project directory from environment or cwd
 */
function getProjectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

/**
 * Find all ledger files in the ledgers directory
 */
function findLedgerFiles(projectDir) {
  const ledgerPath = path.join(projectDir, LEDGER_DIR);

  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  try {
    const files = fs.readdirSync(ledgerPath);
    return files
      .filter((f) => LEDGER_PATTERN.test(f))
      .map((f) => ({
        name: f,
        path: path.join(ledgerPath, f),
        stats: fs.statSync(path.join(ledgerPath, f)),
      }))
      .sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs); // Most recent first
  } catch (error) {
    return [];
  }
}

/**
 * Parse ledger filename to extract session name and date
 */
function parseLedgerFilename(filename) {
  const match = filename.match(LEDGER_PATTERN);
  if (!match) return null;

  return {
    sessionName: match[1],
    date: match[2],
  };
}

/**
 * Calculate age of a file in hours
 */
function getAgeInHours(mtime) {
  const now = Date.now();
  const ageMs = now - mtime.getTime();
  return ageMs / (1000 * 60 * 60);
}

/**
 * Format relative time for display
 */
function formatRelativeTime(mtime) {
  const hours = getAgeInHours(mtime);

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${Math.round(hours)}h ago`;
  } else {
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  }
}

/**
 * Extract key sections from ledger content
 */
function extractKeyInfo(content) {
  const info = {
    goal: null,
    now: null,
    next: null,
    done: null,
    unconfirmed: [],
    workingSet: {
      files: null,
      branch: null,
      commands: null,
    },
    taskContext: null,
  };

  // Extract Task Context from header
  const taskMatch = content.match(/Task Context:\s*(.+)/);
  if (taskMatch) {
    info.taskContext = taskMatch[1].trim();
  }

  // Extract Goal section
  const goalMatch = content.match(/## Goal\n([^\n#]+)/);
  if (goalMatch) {
    info.goal = goalMatch[1].trim();
  }

  // Extract State section items
  const doneMatch = content.match(/\*\*DONE\*\*:\s*(.+)/);
  if (doneMatch) {
    info.done = doneMatch[1].trim();
  }

  const nowMatch = content.match(/\*\*NOW\*\*:\s*(.+)/);
  if (nowMatch) {
    info.now = nowMatch[1].trim();
  }

  const nextMatch = content.match(/\*\*NEXT\*\*:\s*(.+)/);
  if (nextMatch) {
    info.next = nextMatch[1].trim();
  }

  // Extract UNCONFIRMED items
  const unconfirmedRegex = /[-*]\s*UNCONFIRMED:\s*(.+)/g;
  let match;
  while ((match = unconfirmedRegex.exec(content)) !== null) {
    info.unconfirmed.push(match[1].trim());
  }

  // Extract Working Set
  const filesMatch = content.match(/\*\*Files\*\*:\s*(.+)/);
  if (filesMatch) {
    info.workingSet.files = filesMatch[1].trim();
  }

  const branchMatch = content.match(/\*\*Branch\*\*:\s*(.+)/);
  if (branchMatch) {
    info.workingSet.branch = branchMatch[1].trim();
  }

  const commandsMatch = content.match(/\*\*Commands\*\*:\s*(.+)/);
  if (commandsMatch) {
    info.workingSet.commands = commandsMatch[1].trim();
  }

  return info;
}

/**
 * Check for active session ledger at .agent-os/session-ledger.md
 */
function checkActiveLedger(projectDir) {
  const activePath = path.join(projectDir, ACTIVE_LEDGER);

  if (!fs.existsSync(activePath)) {
    return null;
  }

  try {
    const stats = fs.statSync(activePath);
    return {
      name: "session-ledger.md",
      path: activePath,
      stats: stats,
      isActive: true,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Format output for display to agent
 */
function formatOutput(ledgerFile, content, keyInfo) {
  const relativeTime = formatRelativeTime(ledgerFile.stats.mtime);

  // Determine session name based on ledger type
  let sessionName;
  if (ledgerFile.isActive) {
    // For active ledger, extract name from content or use default
    const nameMatch = content.match(/^# Session Ledger:\s*(.+)/m);
    sessionName = nameMatch ? nameMatch[1].trim() : "Active Session";
  } else {
    const parsed = parseLedgerFilename(ledgerFile.name);
    sessionName = parsed ? parsed.sessionName : "Unknown";
  }

  const lines = [];

  // Header - indicate if active or archived
  const ledgerType = ledgerFile.isActive ? "ACTIVE" : "Archived";
  lines.push(
    `Session Ledger Loaded [${ledgerType}]: ${sessionName} (updated ${relativeTime})`,
  );
  lines.push("");

  // Task context if not general
  if (keyInfo.taskContext && keyInfo.taskContext !== "general") {
    lines.push(`Task: ${keyInfo.taskContext}`);
  }

  // Goal
  if (keyInfo.goal && !keyInfo.goal.includes("[")) {
    lines.push(`Goal: ${keyInfo.goal}`);
  }

  // Current state
  if (keyInfo.now && !keyInfo.now.includes("[")) {
    lines.push("");
    lines.push(`NOW: ${keyInfo.now}`);
  }

  // UNCONFIRMED items (highlighted)
  if (keyInfo.unconfirmed.length > 0) {
    lines.push("");
    lines.push("UNCONFIRMED (verify these):");
    keyInfo.unconfirmed.forEach((item) => {
      lines.push(`  - ${item}`);
    });
  }

  // Working set summary
  if (keyInfo.workingSet.files && !keyInfo.workingSet.files.includes("[")) {
    lines.push("");
    lines.push(`Working Set: ${keyInfo.workingSet.files}`);
  }

  // Branch if available
  if (keyInfo.workingSet.branch && !keyInfo.workingSet.branch.includes("[")) {
    lines.push(`Branch: ${keyInfo.workingSet.branch}`);
  }

  return lines.join("\n");
}

/**
 * Format output for old ledger (>24h)
 */
function formatOldLedgerNotice(ledgerFile) {
  const parsed = parseLedgerFilename(ledgerFile.name);
  const relativeTime = formatRelativeTime(ledgerFile.stats.mtime);

  return `Previous ledger found: ${parsed.sessionName} (${relativeTime} - older than 24h)\nTo load it: Read .agent-os/ledgers/${ledgerFile.name}`;
}

/**
 * Main function
 */
function main() {
  try {
    const projectDir = getProjectDir();

    // PRIORITY 1: Check for active session ledger first
    const activeLedger = checkActiveLedger(projectDir);
    if (activeLedger) {
      const ageHours = getAgeInHours(activeLedger.stats.mtime);

      // Active ledger found - always load it (it represents in-progress work)
      const content = fs.readFileSync(activeLedger.path, "utf8");
      const keyInfo = extractKeyInfo(content);

      if (ageHours > MAX_AGE_HOURS) {
        // Old but still active - warn but load
        console.log(
          `Note: Active ledger is ${Math.round(ageHours)}h old. Consider archiving if work is complete.`,
        );
        console.log("");
      }

      console.log(formatOutput(activeLedger, content, keyInfo));
      process.exit(0);
    }

    // PRIORITY 2: Check archived ledgers
    const ledgerFiles = findLedgerFiles(projectDir);

    if (ledgerFiles.length === 0) {
      // No ledgers exist - suggest creating one if working on a task
      console.log("No session ledgers found. Consider creating one with:");
      console.log(
        "  cp templates/session-ledger.md.template .agent-os/session-ledger.md",
      );
      process.exit(0);
    }

    const mostRecent = ledgerFiles[0];
    const ageHours = getAgeInHours(mostRecent.stats.mtime);

    if (ageHours > MAX_AGE_HOURS) {
      // Ledger is old - notify but don't auto-load
      console.log(formatOldLedgerNotice(mostRecent));
      process.exit(0);
    }

    // Load and parse the ledger
    const content = fs.readFileSync(mostRecent.path, "utf8");
    const keyInfo = extractKeyInfo(content);

    // Output formatted summary
    console.log(formatOutput(mostRecent, content, keyInfo));

    process.exit(0);
  } catch (error) {
    // Fail gracefully - don't block session start
    console.error(`Ledger hook error: ${error.message}`);
    process.exit(0);
  }
}

main();
