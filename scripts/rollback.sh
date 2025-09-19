#!/bin/bash
# Rollback Script for Platform Vision Expansion
# Usage: ./scripts/rollback.sh [version|commit-hash]

set -e

echo "🔄 Platform Vision Expansion Rollback Script"
echo "============================================="

# Configuration
BACKUP_DIR="./backups"
BUILD_DIR="./out"
CURRENT_BRANCH=$(git branch --show-current)

# Function to create backup
create_backup() {
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    echo "📦 Creating backup: $backup_name"

    mkdir -p "$BACKUP_DIR"

    # Backup current build if it exists
    if [ -d "$BUILD_DIR" ]; then
        cp -r "$BUILD_DIR" "$BACKUP_DIR/$backup_name-build"
        echo "✅ Build backed up to $BACKUP_DIR/$backup_name-build"
    fi

    # Backup current git state
    git stash push -m "Rollback backup - $backup_name" 2>/dev/null || true
    echo "✅ Git state backed up as stash"
}

# Function to rollback to specific commit
rollback_to_commit() {
    local target_commit=$1

    echo "🎯 Rolling back to commit: $target_commit"

    # Verify commit exists
    if ! git cat-file -e "$target_commit" 2>/dev/null; then
        echo "❌ Error: Commit $target_commit does not exist"
        exit 1
    fi

    # Create backup before rollback
    create_backup

    # Perform rollback
    git checkout "$target_commit"

    echo "✅ Rolled back to commit $target_commit"
}

# Function to rollback to previous stable release
rollback_to_stable() {
    echo "🎯 Rolling back to last stable release"

    # Find the last commit before platform-vision-expansion branch
    local main_commit=$(git merge-base main HEAD)

    if [ -z "$main_commit" ]; then
        echo "❌ Error: Could not find stable commit"
        exit 1
    fi

    rollback_to_commit "$main_commit"
}

# Function to rebuild after rollback
rebuild_after_rollback() {
    echo "🏗️  Rebuilding application after rollback"

    # Clean previous build
    rm -rf "$BUILD_DIR"
    rm -rf ".next"

    # Install dependencies
    echo "📦 Installing dependencies..."
    npm ci

    # Run quality checks
    echo "🧪 Running quality checks..."
    npm run type-check
    npm run lint

    # Build application
    echo "🔨 Building application..."
    npm run build

    echo "✅ Rebuild completed successfully"
}

# Function to verify rollback
verify_rollback() {
    echo "🔍 Verifying rollback..."

    # Check if build directory exists
    if [ ! -d "$BUILD_DIR" ]; then
        echo "❌ Error: Build directory not found after rollback"
        exit 1
    fi

    # Check for critical files
    local critical_files=("$BUILD_DIR/index.html" "$BUILD_DIR/_next")
    for file in "${critical_files[@]}"; do
        if [ ! -e "$file" ]; then
            echo "❌ Error: Critical file/directory missing: $file"
            exit 1
        fi
    done

    echo "✅ Rollback verification passed"
}

# Function to show rollback status
show_status() {
    echo "📊 Current Status:"
    echo "   Branch: $(git branch --show-current)"
    echo "   Commit: $(git rev-parse --short HEAD)"
    echo "   Build exists: $([ -d "$BUILD_DIR" ] && echo "Yes" || echo "No")"
    echo "   Last commit: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"
}

# Main execution
case "${1:-help}" in
    "commit")
        if [ -z "$2" ]; then
            echo "❌ Error: Please specify commit hash"
            echo "Usage: $0 commit <commit-hash>"
            exit 1
        fi
        rollback_to_commit "$2"
        rebuild_after_rollback
        verify_rollback
        ;;
    "stable")
        rollback_to_stable
        rebuild_after_rollback
        verify_rollback
        ;;
    "status")
        show_status
        ;;
    "verify")
        verify_rollback
        ;;
    "help"|*)
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  commit <hash>   Rollback to specific commit"
        echo "  stable          Rollback to last stable release (main branch)"
        echo "  status          Show current rollback status"
        echo "  verify          Verify current build integrity"
        echo "  help            Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 stable                    # Rollback to stable release"
        echo "  $0 commit abc123             # Rollback to specific commit"
        echo "  $0 status                    # Check current status"
        ;;
esac

echo ""
echo "🎉 Rollback script completed"
show_status