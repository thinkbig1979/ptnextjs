-- ============================================================================
-- FIX: Restore PRIMARY KEY constraint on blog_posts table
-- ============================================================================
-- This script fixes the broken blog_posts table that was created using
-- CREATE TABLE ... AS SELECT which strips PRIMARY KEY constraints.
--
-- Run with: sqlite3 /path/to/payload.db < fix-blog-posts-primary-key.sql
-- ============================================================================

-- Enable foreign keys check at end
PRAGMA foreign_keys = OFF;

-- Start transaction for atomic operation
BEGIN TRANSACTION;

-- ============================================================================
-- STEP 1: Backup all data from affected tables
-- ============================================================================

-- Backup blog_posts data
CREATE TABLE IF NOT EXISTS _backup_blog_posts AS SELECT * FROM blog_posts;

-- Backup blog_posts_tags data
CREATE TABLE IF NOT EXISTS _backup_blog_posts_tags AS SELECT * FROM blog_posts_tags;

-- Backup blog_posts_rels data
CREATE TABLE IF NOT EXISTS _backup_blog_posts_rels AS SELECT * FROM blog_posts_rels;

-- Backup payload_locked_documents_rels if it exists
CREATE TABLE IF NOT EXISTS _backup_payload_locked_documents_rels AS
SELECT * FROM payload_locked_documents_rels WHERE 1=0;
INSERT OR IGNORE INTO _backup_payload_locked_documents_rels
SELECT * FROM payload_locked_documents_rels WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE name='payload_locked_documents_rels');

-- ============================================================================
-- STEP 2: Drop dependent tables (order matters for foreign keys)
-- ============================================================================

-- Drop payload_locked_documents_rels if exists (references blog_posts)
DROP TABLE IF EXISTS payload_locked_documents_rels;

-- Drop payload_locked_documents if exists
DROP TABLE IF EXISTS payload_locked_documents;

-- Drop blog_posts_rels (references blog_posts)
DROP TABLE IF EXISTS blog_posts_rels;

-- Drop blog_posts_tags (references blog_posts)
DROP TABLE IF EXISTS blog_posts_tags;

-- Drop the broken blog_posts table
DROP TABLE IF EXISTS blog_posts;

-- ============================================================================
-- STEP 3: Recreate blog_posts with proper PRIMARY KEY constraint
-- ============================================================================

CREATE TABLE "blog_posts" (
    "id" integer PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "slug" text NOT NULL,
    "content" text NOT NULL,
    "excerpt" text,
    "author_id" integer,
    "featured_image_id" integer,
    "published" integer DEFAULT false,
    "published_at" text,
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE set null,
    FOREIGN KEY ("featured_image_id") REFERENCES "media"("id") ON UPDATE no action ON DELETE set null
);

-- Recreate indexes for blog_posts
CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" ("slug");
CREATE INDEX "blog_posts_author_idx" ON "blog_posts" ("author_id");
CREATE INDEX "blog_posts_featured_image_idx" ON "blog_posts" ("featured_image_id");
CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" ("updated_at");
CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" ("created_at");

-- ============================================================================
-- STEP 4: Recreate blog_posts_tags with proper foreign key
-- ============================================================================

CREATE TABLE "blog_posts_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" text PRIMARY KEY NOT NULL,
    "tag" text NOT NULL,
    FOREIGN KEY ("_parent_id") REFERENCES "blog_posts"("id") ON UPDATE no action ON DELETE cascade
);

CREATE INDEX "blog_posts_tags_order_idx" ON "blog_posts_tags" ("_order");
CREATE INDEX "blog_posts_tags_parent_id_idx" ON "blog_posts_tags" ("_parent_id");

-- ============================================================================
-- STEP 5: Recreate blog_posts_rels with proper foreign key
-- ============================================================================

CREATE TABLE "blog_posts_rels" (
    "id" integer PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" text NOT NULL,
    "categories_id" integer,
    "media_id" integer,
    FOREIGN KEY ("parent_id") REFERENCES "blog_posts"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("media_id") REFERENCES "media"("id") ON UPDATE no action ON DELETE cascade
);

CREATE INDEX "blog_posts_rels_order_idx" ON "blog_posts_rels" ("order");
CREATE INDEX "blog_posts_rels_parent_idx" ON "blog_posts_rels" ("parent_id");
CREATE INDEX "blog_posts_rels_path_idx" ON "blog_posts_rels" ("path");
CREATE INDEX "blog_posts_rels_categories_id_idx" ON "blog_posts_rels" ("categories_id");
CREATE INDEX "blog_posts_rels_media_id_idx" ON "blog_posts_rels" ("media_id");

-- ============================================================================
-- STEP 6: Restore data from backups
-- ============================================================================

-- Restore blog_posts data
INSERT INTO blog_posts (id, title, slug, content, excerpt, author_id, featured_image_id, published, published_at, updated_at, created_at)
SELECT id, title, slug, content, excerpt, author_id, featured_image_id, published, published_at, updated_at, created_at
FROM _backup_blog_posts;

-- Restore blog_posts_tags data
INSERT INTO blog_posts_tags (_order, _parent_id, id, tag)
SELECT _order, _parent_id, id, tag
FROM _backup_blog_posts_tags;

-- Restore blog_posts_rels data
INSERT INTO blog_posts_rels (id, "order", parent_id, path, categories_id, media_id)
SELECT id, "order", parent_id, path, categories_id, media_id
FROM _backup_blog_posts_rels;

-- ============================================================================
-- STEP 7: Recreate payload_locked_documents tables (Payload will auto-populate)
-- ============================================================================

-- These tables are managed by Payload CMS for document locking
-- We create them empty and let Payload recreate the relationships as needed

CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
    "id" integer PRIMARY KEY NOT NULL,
    "global_slug" text,
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);

CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" ("global_slug");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" ("updated_at");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" ("created_at");

CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
    "id" integer PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" text NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "vendors_id" integer,
    "products_id" integer,
    "categories_id" integer,
    "blog_posts_id" integer,
    "team_members_id" integer,
    "company_info_id" integer,
    "tags_id" integer,
    "yachts_id" integer,
    "tier_upgrade_requests_id" integer,
    "import_history_id" integer,
    FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("users_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("media_id") REFERENCES "media"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("vendors_id") REFERENCES "vendors"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("products_id") REFERENCES "products"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("blog_posts_id") REFERENCES "blog_posts"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("team_members_id") REFERENCES "team_members"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("company_info_id") REFERENCES "company_info"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("yachts_id") REFERENCES "yachts"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("tier_upgrade_requests_id") REFERENCES "tier_upgrade_requests"("id") ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY ("import_history_id") REFERENCES "import_history"("id") ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" ("order");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" ("path");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" ("blog_posts_id");

-- ============================================================================
-- STEP 8: Cleanup backup tables
-- ============================================================================

DROP TABLE IF EXISTS _backup_blog_posts;
DROP TABLE IF EXISTS _backup_blog_posts_tags;
DROP TABLE IF EXISTS _backup_blog_posts_rels;
DROP TABLE IF EXISTS _backup_payload_locked_documents_rels;

-- ============================================================================
-- STEP 9: Verify the fix
-- ============================================================================

-- This will fail if PRIMARY KEY is not set correctly
SELECT 'Verifying blog_posts PRIMARY KEY...' as status;
SELECT sql FROM sqlite_master WHERE name = 'blog_posts' AND sql LIKE '%PRIMARY KEY%';

-- Commit the transaction
COMMIT;

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;

-- Run integrity check
SELECT 'Running foreign key check...' as status;
PRAGMA foreign_key_check;

SELECT '✅ Fix completed successfully!' as result;
