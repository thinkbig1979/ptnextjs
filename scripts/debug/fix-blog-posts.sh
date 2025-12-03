#!/bin/bash
# ============================================================================
# FIX: Restore PRIMARY KEY constraint on blog_posts table
# ============================================================================
# Usage: ./fix-blog-posts.sh [database_path]
# Default: /home/dockge/stacks/ptnext-app/data/payload.db
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default database path (production)
DB_PATH="${1:-/home/dockge/stacks/ptnext-app/data/payload.db}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FIX="${SCRIPT_DIR}/fix-blog-posts-primary-key.sql"

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}Blog Posts Primary Key Fix Script${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}ERROR: Database not found at: $DB_PATH${NC}"
    echo "Usage: $0 [database_path]"
    exit 1
fi

# Check if SQL fix file exists
if [ ! -f "$SQL_FIX" ]; then
    echo -e "${RED}ERROR: SQL fix file not found at: $SQL_FIX${NC}"
    exit 1
fi

# Check if sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
    echo -e "${RED}ERROR: sqlite3 is not installed${NC}"
    exit 1
fi

echo -e "Database: ${GREEN}$DB_PATH${NC}"
echo ""

# Step 1: Create backup
BACKUP_PATH="${DB_PATH}.backup-fix-$(date +%Y%m%d-%H%M%S)"
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
cp "$DB_PATH" "$BACKUP_PATH"
echo -e "  Backup created: ${GREEN}$BACKUP_PATH${NC}"
echo ""

# Step 2: Check current state
echo -e "${YELLOW}Step 2: Checking current blog_posts table...${NC}"
CURRENT_SCHEMA=$(sqlite3 "$DB_PATH" ".schema blog_posts" 2>/dev/null || echo "TABLE NOT FOUND")
if echo "$CURRENT_SCHEMA" | grep -q "PRIMARY KEY"; then
    echo -e "  ${GREEN}blog_posts already has PRIMARY KEY constraint${NC}"
    echo ""
    echo -e "${YELLOW}Checking for blog_posts foreign key issues...${NC}"
    FK_CHECK=$(sqlite3 "$DB_PATH" "PRAGMA foreign_key_check(blog_posts);" 2>/dev/null || echo "")
    FK_CHECK_TAGS=$(sqlite3 "$DB_PATH" "PRAGMA foreign_key_check(blog_posts_tags);" 2>/dev/null || echo "")
    FK_CHECK_RELS=$(sqlite3 "$DB_PATH" "PRAGMA foreign_key_check(blog_posts_rels);" 2>/dev/null || echo "")

    if [ -z "$FK_CHECK" ] && [ -z "$FK_CHECK_TAGS" ] && [ -z "$FK_CHECK_RELS" ]; then
        echo -e "  ${GREEN}No blog_posts foreign key violations found${NC}"
        echo ""
        echo -e "${GREEN}blog_posts tables appear healthy. No fix needed.${NC}"
        echo -e "Removing unnecessary backup..."
        rm "$BACKUP_PATH"
        exit 0
    else
        echo -e "  ${YELLOW}Foreign key violations found in blog_posts tables:${NC}"
        [ -n "$FK_CHECK" ] && echo "$FK_CHECK"
        [ -n "$FK_CHECK_TAGS" ] && echo "$FK_CHECK_TAGS"
        [ -n "$FK_CHECK_RELS" ] && echo "$FK_CHECK_RELS"
        echo ""
        echo -e "  ${YELLOW}Proceeding with fix to repair relationships...${NC}"
    fi
else
    echo -e "  ${RED}blog_posts is MISSING PRIMARY KEY constraint!${NC}"
fi
echo ""

# Step 3: Count existing records
echo -e "${YELLOW}Step 3: Counting records to preserve...${NC}"
BLOG_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM blog_posts;" 2>/dev/null || echo "0")
TAGS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM blog_posts_tags;" 2>/dev/null || echo "0")
RELS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM blog_posts_rels;" 2>/dev/null || echo "0")
echo -e "  blog_posts: ${GREEN}$BLOG_COUNT${NC} records"
echo -e "  blog_posts_tags: ${GREEN}$TAGS_COUNT${NC} records"
echo -e "  blog_posts_rels: ${GREEN}$RELS_COUNT${NC} records"
echo ""

# Step 4: Apply the fix
echo -e "${YELLOW}Step 4: Applying fix...${NC}"
if sqlite3 "$DB_PATH" < "$SQL_FIX" 2>&1; then
    echo -e "  ${GREEN}SQL fix applied successfully${NC}"
else
    echo -e "  ${RED}ERROR applying fix!${NC}"
    echo -e "  ${YELLOW}Restoring from backup...${NC}"
    cp "$BACKUP_PATH" "$DB_PATH"
    echo -e "  ${GREEN}Database restored from backup${NC}"
    exit 1
fi
echo ""

# Step 5: Verify the fix
echo -e "${YELLOW}Step 5: Verifying fix...${NC}"

# Check PRIMARY KEY
NEW_SCHEMA=$(sqlite3 "$DB_PATH" ".schema blog_posts" 2>/dev/null)
if echo "$NEW_SCHEMA" | grep -q "PRIMARY KEY"; then
    echo -e "  ${GREEN}✓ PRIMARY KEY constraint restored${NC}"
else
    echo -e "  ${RED}✗ PRIMARY KEY still missing!${NC}"
    echo -e "  ${YELLOW}Restoring from backup...${NC}"
    cp "$BACKUP_PATH" "$DB_PATH"
    exit 1
fi

# Check record counts
NEW_BLOG_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM blog_posts;" 2>/dev/null || echo "0")
NEW_TAGS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM blog_posts_tags;" 2>/dev/null || echo "0")
NEW_RELS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM blog_posts_rels;" 2>/dev/null || echo "0")

if [ "$BLOG_COUNT" -eq "$NEW_BLOG_COUNT" ]; then
    echo -e "  ${GREEN}✓ blog_posts: $NEW_BLOG_COUNT records preserved${NC}"
else
    echo -e "  ${RED}✗ blog_posts record count mismatch: was $BLOG_COUNT, now $NEW_BLOG_COUNT${NC}"
fi

if [ "$TAGS_COUNT" -eq "$NEW_TAGS_COUNT" ]; then
    echo -e "  ${GREEN}✓ blog_posts_tags: $NEW_TAGS_COUNT records preserved${NC}"
else
    echo -e "  ${RED}✗ blog_posts_tags record count mismatch: was $TAGS_COUNT, now $NEW_TAGS_COUNT${NC}"
fi

if [ "$RELS_COUNT" -eq "$NEW_RELS_COUNT" ]; then
    echo -e "  ${GREEN}✓ blog_posts_rels: $NEW_RELS_COUNT records preserved${NC}"
else
    echo -e "  ${RED}✗ blog_posts_rels record count mismatch: was $RELS_COUNT, now $NEW_RELS_COUNT${NC}"
fi

# Check foreign keys for blog_posts tables only
echo ""
echo -e "${YELLOW}Step 6: Running blog_posts foreign key integrity check...${NC}"
FK_RESULT=$(sqlite3 "$DB_PATH" "PRAGMA foreign_key_check(blog_posts);" 2>/dev/null || echo "")
FK_RESULT_TAGS=$(sqlite3 "$DB_PATH" "PRAGMA foreign_key_check(blog_posts_tags);" 2>/dev/null || echo "")
FK_RESULT_RELS=$(sqlite3 "$DB_PATH" "PRAGMA foreign_key_check(blog_posts_rels);" 2>/dev/null || echo "")
if [ -z "$FK_RESULT" ] && [ -z "$FK_RESULT_TAGS" ] && [ -z "$FK_RESULT_RELS" ]; then
    echo -e "  ${GREEN}✓ No foreign key violations in blog_posts tables${NC}"
else
    echo -e "  ${YELLOW}⚠ Foreign key issues found:${NC}"
    [ -n "$FK_RESULT" ] && echo "$FK_RESULT"
    [ -n "$FK_RESULT_TAGS" ] && echo "$FK_RESULT_TAGS"
    [ -n "$FK_RESULT_RELS" ] && echo "$FK_RESULT_RELS"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Fix completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Backup saved at: ${YELLOW}$BACKUP_PATH${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Restart your Payload CMS container"
echo "2. Test editing a blog post in the admin panel"
echo "3. If working, you can delete the backup file"
echo ""
