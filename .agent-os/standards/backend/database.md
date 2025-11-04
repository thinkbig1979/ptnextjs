
# Backend Database Standards for Agent OS

## Context

Database design, query patterns, and management standards for Agent OS backend development.

## Database Design Principles

### Schema Organization
- **Logical Grouping**: Group related tables in schemas (e.g., `auth`, `content`, `analytics`)
- **Consistent Naming**: Use descriptive, plural table names in snake_case
- **Version Control**: Use database migrations for all schema changes
- **Documentation**: Include table and column comments for complex business logic

### Primary Key Strategy
```sql
-- Use UUIDs for distributed systems
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- other columns
);

-- Use BIGINT auto-increment for single-database systems
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    -- other columns
);
```

### Foreign Key Relationships
```sql
-- Always define foreign key constraints
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for foreign keys
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
```

## Column Naming and Types

### Standard Column Types
```sql
-- Identifiers
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID NOT NULL REFERENCES users(id)

-- Timestamps
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
deleted_at TIMESTAMP WITH TIME ZONE NULL  -- For soft deletes

-- Status and flags
is_active BOOLEAN DEFAULT true
is_verified BOOLEAN DEFAULT false
status VARCHAR(20) DEFAULT 'pending'  -- pending, active, inactive, suspended

-- Common fields
name VARCHAR(255) NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
description TEXT
metadata JSONB  -- For flexible schema evolution

-- Numeric fields
price DECIMAL(10,2)
quantity INTEGER DEFAULT 0
rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5)
```

### Naming Conventions
- **Tables**: `users`, `blog_posts`, `user_profiles`, `order_items`
- **Columns**: `first_name`, `last_login_at`, `is_admin`, `total_amount`
- **Indexes**: `idx_users_email`, `idx_posts_user_id_created_at`
- **Constraints**: `chk_users_email_format`, `fk_posts_user_id`

## Indexing Strategy

### Primary Indexes
```sql
-- Unique indexes for natural keys
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Composite indexes for common query patterns
CREATE INDEX idx_posts_user_id_created_at ON posts(user_id, created_at DESC);
CREATE INDEX idx_orders_status_created_at ON orders(status, created_at);
```

### Partial Indexes
```sql
-- Index only active records
CREATE INDEX idx_active_users_email ON users(email) WHERE is_active = true;

-- Index recent records
CREATE INDEX idx_recent_posts ON posts(created_at) WHERE created_at > NOW() - INTERVAL '30 days';
```

### Full-Text Search
```sql
-- PostgreSQL full-text search
ALTER TABLE posts ADD COLUMN search_vector tsvector;

CREATE INDEX idx_posts_search ON posts USING gin(search_vector);

-- Update trigger
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.content, '') || ' ' || 
        COALESCE(NEW.tags, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_search_vector
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();
```

## Query Patterns

### Efficient Data Retrieval
```sql
-- Use specific columns instead of SELECT *
SELECT id, email, name, created_at FROM users WHERE id = $1;

-- Use LIMIT for pagination
SELECT * FROM posts 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 20 OFFSET $2;

-- Use EXISTS instead of IN for subqueries
SELECT * FROM users u 
WHERE EXISTS (
    SELECT 1 FROM posts p 
    WHERE p.user_id = u.id AND p.status = 'published'
);
```

### JOIN Optimization
```sql
-- Prefer INNER JOIN for required relationships
SELECT u.name, p.title, p.created_at
FROM users u
INNER JOIN posts p ON u.id = p.user_id
WHERE u.is_active = true
ORDER BY p.created_at DESC;

-- Use LEFT JOIN for optional relationships
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id AND p.status = 'published'
WHERE u.is_active = true;
```

### Aggregation Patterns
```sql
-- User statistics with single query
SELECT 
    u.id,
    u.name,
    COUNT(p.id) as post_count,
    MAX(p.created_at) as last_post_at,
    AVG(p.rating) as avg_rating
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name
ORDER BY post_count DESC NULLS LAST;

-- Time-based aggregations
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as new_users,
    COUNT(*) FILTER (WHERE is_verified = true) as verified_users
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

## Data Validation and Constraints

### Check Constraints
```sql
-- Email format validation
ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Age validation
ALTER TABLE users ADD CONSTRAINT chk_users_age 
CHECK (age IS NULL OR (age >= 13 AND age <= 120));

-- Price validation
ALTER TABLE products ADD CONSTRAINT chk_products_price 
CHECK (price >= 0);

-- Status validation
ALTER TABLE orders ADD CONSTRAINT chk_orders_status 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
```

### Domain Types
```sql
-- Create custom domain types for validation
CREATE DOMAIN email_address AS VARCHAR(255)
CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE DOMAIN positive_integer AS INTEGER
CHECK (VALUE > 0);

CREATE DOMAIN non_negative_decimal AS DECIMAL(10,2)
CHECK (VALUE >= 0);

-- Use domains in table definitions
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email email_address UNIQUE NOT NULL,
    age positive_integer,
    balance non_negative_decimal DEFAULT 0
);
```

## Migration Management

### Migration File Structure
```sql
-- migrations/001_create_users_table.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- migrations/001_create_users_table.down.sql
DROP TABLE IF EXISTS users;
```

### Safe Migration Patterns
```sql
-- Add column with default value safely
ALTER TABLE users ADD COLUMN bio TEXT;
UPDATE users SET bio = '' WHERE bio IS NULL;
ALTER TABLE users ALTER COLUMN bio SET NOT NULL;

-- Rename column safely (PostgreSQL 9.2+)
ALTER TABLE users RENAME COLUMN old_name TO new_name;

-- Add foreign key safely
ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

## Performance Optimization

### Query Analysis
```sql
-- Explain query execution plan
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Vacuum and Analyze
```sql
-- Regular maintenance
VACUUM ANALYZE users;

-- Auto-vacuum configuration
ALTER TABLE users SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);
```

### Connection Pooling
```javascript
// PostgreSQL connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,        // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Backup and Recovery

### Backup Strategy
```bash
# Daily full backup
pg_dump -h localhost -U postgres -d appdb -f backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -h localhost -U postgres -d appdb | gzip > backup_$(date +%Y%m%d).sql.gz

# Point-in-time recovery
pg_basebackup -h localhost -D /backup/base -U postgres -v -P -W
```

### Recovery Procedures
```bash
# Restore from backup
psql -h localhost -U postgres -d appdb < backup_20250115.sql

# Restore from compressed backup
gunzip -c backup_20250115.sql.gz | psql -h localhost -U postgres -d appdb

# Point-in-time recovery
pg_ctl start -D /backup/base -o "-c recovery_target_time='2025-01-15 10:30:00'"
```

## Security Best Practices

### Access Control
```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE appdb TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE appdb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Data Encryption
```sql
-- Enable transparent data encryption (PostgreSQL 15+)
ALTER SYSTEM SET transparent_data_encryption = 'on';

-- Column-level encryption with pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
INSERT INTO users (email, name, ssn_encrypted)
VALUES (
    'user@example.com',
    'John Doe',
    pgp_sym_encrypt('123-45-6789', 'encryption_key')
);

-- Decrypt sensitive data
SELECT 
    email,
    name,
    pgp_sym_decrypt(ssn_encrypted, 'encryption_key') as ssn
FROM users;
```

## Monitoring and Maintenance

### Health Monitoring
```sql
-- Check database size
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database
WHERE datname = current_database();
```

### Performance Monitoring
```sql
-- Slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

## Testing Database Operations

### Test Database Setup
```javascript
// Test database configuration
const testConfig = {
  host: 'localhost',
  port: 5433,
  database: 'appdb_test',
  user: 'test_user',
  password: 'test_password'
};

// Database truncation for clean test state
const truncateDatabase = async () => {
  await pool.query('TRUNCATE TABLE users, posts, comments RESTART IDENTITY CASCADE');
};
```

### Database Testing Patterns
```javascript
// Integration tests with database
describe('User Repository', () => {
  beforeEach(async () => {
    await truncateDatabase();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const user = await UserRepository.create(userData);
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).toBeUndefined(); // Password should be hashed
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      await UserRepository.create(userData);
      
      await expect(UserRepository.create(userData))
        .rejects.toThrow('duplicate key value violates unique constraint');
    });
  });
});