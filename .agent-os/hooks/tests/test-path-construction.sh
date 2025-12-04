#!/bin/bash

# Test script to verify path construction fix for issue .agent-os-d2f5
# Tests that TDD_STATE_DIR doesn't double .agent-os when CLAUDE_PROJECT_DIR already ends with it

set -e

echo "==========================================="
echo "Path Construction Fix Test"
echo "Testing fix for issue .agent-os-d2f5"
echo "==========================================="
echo ""

# Test 1: CLAUDE_PROJECT_DIR ends with .agent-os (absolute path)
echo "Test 1: CLAUDE_PROJECT_DIR=/home/user/.agent-os"
export CLAUDE_PROJECT_DIR="/home/user/.agent-os"
export TDD_DEBUG=1

# Source the validator to get the path construction logic
source /home/edwin/.agent-os/hooks/tdd-validator.sh

echo "  BASE_DIR: $BASE_DIR"
echo "  TDD_STATE_DIR: $TDD_STATE_DIR"
echo "  CONFIG_FILE: $CONFIG_FILE"

if [[ "$TDD_STATE_DIR" == "/home/user/.agent-os/tdd-state" ]]; then
    echo "  ✅ PASS: TDD_STATE_DIR correctly set (no double .agent-os)"
else
    echo "  ❌ FAIL: Expected /home/user/.agent-os/tdd-state, got $TDD_STATE_DIR"
    exit 1
fi

if [[ "$CONFIG_FILE" == "/home/user/.agent-os/config.yml" ]]; then
    echo "  ✅ PASS: CONFIG_FILE correctly set (no double .agent-os)"
else
    echo "  ❌ FAIL: Expected /home/user/.agent-os/config.yml, got $CONFIG_FILE"
    exit 1
fi

echo ""

# Test 2: CLAUDE_PROJECT_DIR ends with .agent-os (HOME shortcut)
echo "Test 2: CLAUDE_PROJECT_DIR=~/.agent-os"
export CLAUDE_PROJECT_DIR="$HOME/.agent-os"

# Re-source to re-evaluate
unset BASE_DIR TDD_STATE_DIR CONFIG_FILE
source /home/edwin/.agent-os/hooks/tdd-validator.sh

echo "  BASE_DIR: $BASE_DIR"
echo "  TDD_STATE_DIR: $TDD_STATE_DIR"
echo "  CONFIG_FILE: $CONFIG_FILE"

if [[ "$TDD_STATE_DIR" == "$HOME/.agent-os/tdd-state" ]]; then
    echo "  ✅ PASS: TDD_STATE_DIR correctly set with HOME (no double .agent-os)"
else
    echo "  ❌ FAIL: Expected $HOME/.agent-os/tdd-state, got $TDD_STATE_DIR"
    exit 1
fi

echo ""

# Test 3: CLAUDE_PROJECT_DIR points to regular project (should append .agent-os)
echo "Test 3: CLAUDE_PROJECT_DIR=/home/user/my-project"
export CLAUDE_PROJECT_DIR="/home/user/my-project"

# Re-source to re-evaluate
unset BASE_DIR TDD_STATE_DIR CONFIG_FILE
source /home/edwin/.agent-os/hooks/tdd-validator.sh

echo "  BASE_DIR: $BASE_DIR"
echo "  TDD_STATE_DIR: $TDD_STATE_DIR"
echo "  CONFIG_FILE: $CONFIG_FILE"

if [[ "$TDD_STATE_DIR" == "/home/user/my-project/.agent-os/tdd-state" ]]; then
    echo "  ✅ PASS: TDD_STATE_DIR correctly appends .agent-os for regular project"
else
    echo "  ❌ FAIL: Expected /home/user/my-project/.agent-os/tdd-state, got $TDD_STATE_DIR"
    exit 1
fi

if [[ "$CONFIG_FILE" == "/home/user/my-project/.agent-os/config.yml" ]]; then
    echo "  ✅ PASS: CONFIG_FILE correctly appends .agent-os for regular project"
else
    echo "  ❌ FAIL: Expected /home/user/my-project/.agent-os/config.yml, got $CONFIG_FILE"
    exit 1
fi

echo ""

# Test 4: CLAUDE_PROJECT_DIR not set (should use current directory)
echo "Test 4: CLAUDE_PROJECT_DIR not set (defaults to .)"
unset CLAUDE_PROJECT_DIR

# Re-source to re-evaluate
unset BASE_DIR TDD_STATE_DIR CONFIG_FILE
source /home/edwin/.agent-os/hooks/tdd-validator.sh

echo "  BASE_DIR: $BASE_DIR"
echo "  TDD_STATE_DIR: $TDD_STATE_DIR"
echo "  CONFIG_FILE: $CONFIG_FILE"

if [[ "$TDD_STATE_DIR" == "./.agent-os/tdd-state" ]]; then
    echo "  ✅ PASS: TDD_STATE_DIR defaults to current directory"
else
    echo "  ❌ FAIL: Expected ./.agent-os/tdd-state, got $TDD_STATE_DIR"
    exit 1
fi

echo ""

# Test 5: Edge case - directory name contains .agent-os but doesn't end with it
echo "Test 5: CLAUDE_PROJECT_DIR=/home/user/.agent-os-backup/project"
export CLAUDE_PROJECT_DIR="/home/user/.agent-os-backup/project"

# Re-source to re-evaluate
unset BASE_DIR TDD_STATE_DIR CONFIG_FILE
source /home/edwin/.agent-os/hooks/tdd-validator.sh

echo "  BASE_DIR: $BASE_DIR"
echo "  TDD_STATE_DIR: $TDD_STATE_DIR"
echo "  CONFIG_FILE: $CONFIG_FILE"

if [[ "$TDD_STATE_DIR" == "/home/user/.agent-os-backup/project/.agent-os/tdd-state" ]]; then
    echo "  ✅ PASS: TDD_STATE_DIR correctly handles directory with .agent-os in middle"
else
    echo "  ❌ FAIL: Expected /home/user/.agent-os-backup/project/.agent-os/tdd-state, got $TDD_STATE_DIR"
    exit 1
fi

echo ""
echo "==========================================="
echo "✅ All path construction tests PASSED"
echo "==========================================="
echo ""
echo "Fix verified for issue .agent-os-d2f5:"
echo "- Correctly detects when CLAUDE_PROJECT_DIR ends with .agent-os"
echo "- Avoids doubling .agent-os in path construction"
echo "- Handles regular projects correctly (appends .agent-os)"
echo "- Handles default current directory case"
echo "- Handles edge cases (directory names containing .agent-os)"
