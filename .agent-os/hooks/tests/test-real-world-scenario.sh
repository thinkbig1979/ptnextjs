#!/bin/bash

# Real-world scenario test for issue .agent-os-d2f5
# Simulates the actual bug scenario where Agent OS itself is the project

set -e

echo "==========================================="
echo "Real-World Scenario Test"
echo "Simulating Agent OS as the project"
echo "==========================================="
echo ""

# Scenario: Agent OS itself as the project
echo "Scenario: Using Agent OS framework within itself"
echo "CLAUDE_PROJECT_DIR points to ~/.agent-os"
echo ""

# Set up environment as it would be in real use
export CLAUDE_PROJECT_DIR="$HOME/.agent-os"
export TDD_TASK_ID="test-task-123"

# Source the validator
source /home/edwin/.agent-os/hooks/tdd-validator.sh

echo "Environment:"
echo "  CLAUDE_PROJECT_DIR: $CLAUDE_PROJECT_DIR"
echo "  TDD_TASK_ID: $TDD_TASK_ID"
echo ""

echo "Calculated Paths:"
echo "  BASE_DIR: $BASE_DIR"
echo "  TDD_STATE_DIR: $TDD_STATE_DIR"
echo "  CONFIG_FILE: $CONFIG_FILE"
echo ""

# Verify paths are correct (no double .agent-os)
if [[ "$TDD_STATE_DIR" == *"/.agent-os/.agent-os/"* ]]; then
    echo "❌ FAIL: Path contains double .agent-os"
    echo "  TDD_STATE_DIR: $TDD_STATE_DIR"
    exit 1
fi

if [[ "$CONFIG_FILE" == *"/.agent-os/.agent-os/"* ]]; then
    echo "❌ FAIL: Config path contains double .agent-os"
    echo "  CONFIG_FILE: $CONFIG_FILE"
    exit 1
fi

# Verify expected paths
expected_state_dir="$HOME/.agent-os/tdd-state"
expected_config="$HOME/.agent-os/config.yml"

if [[ "$TDD_STATE_DIR" == "$expected_state_dir" ]]; then
    echo "✅ PASS: TDD_STATE_DIR is correct"
    echo "  Expected: $expected_state_dir"
    echo "  Actual:   $TDD_STATE_DIR"
else
    echo "❌ FAIL: TDD_STATE_DIR mismatch"
    echo "  Expected: $expected_state_dir"
    echo "  Actual:   $TDD_STATE_DIR"
    exit 1
fi

if [[ "$CONFIG_FILE" == "$expected_config" ]]; then
    echo "✅ PASS: CONFIG_FILE is correct"
    echo "  Expected: $expected_config"
    echo "  Actual:   $CONFIG_FILE"
else
    echo "❌ FAIL: CONFIG_FILE mismatch"
    echo "  Expected: $expected_config"
    echo "  Actual:   $CONFIG_FILE"
    exit 1
fi

echo ""

# Test state file path construction
expected_state_file="$HOME/.agent-os/tdd-state/${TDD_TASK_ID}.json"
echo "State file path construction:"
echo "  Expected: $expected_state_file"
echo "  Would be: $TDD_STATE_DIR/${TDD_TASK_ID}.json"

if [[ "$TDD_STATE_DIR/${TDD_TASK_ID}.json" == "$expected_state_file" ]]; then
    echo "  ✅ PASS: State file path is correct"
else
    echo "  ❌ FAIL: State file path mismatch"
    exit 1
fi

echo ""
echo "==========================================="
echo "✅ Real-world scenario test PASSED"
echo "==========================================="
echo ""
echo "Bug .agent-os-d2f5 is FIXED:"
echo "- When CLAUDE_PROJECT_DIR=~/.agent-os"
echo "- State file path: ~/.agent-os/tdd-state/task-123.json"
echo "- NOT: ~/.agent-os/.agent-os/tdd-state/task-123.json ✓"
