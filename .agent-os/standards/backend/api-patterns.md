---
version: 5.1.0
last-updated: 2026-01-02
---


# Backend API Patterns for Agent OS

## Context

Backend development standards and patterns for Agent OS projects.

## RESTful API Design Principles

### Endpoint Structure
- Use nouns, not verbs: `/users` instead of `/getUsers`
- Use plural nouns for collections: `/users`, `/posts`, `/comments`
- Use specific resource identifiers: `/users/:id`, `/posts/:postId/comments`

### HTTP Methods
- **GET**: Retrieve resources (idempotent, safe)
- **POST**: Create new resources (non-idempotent)
- **PUT**: Update entire resources (idempotent)
- **PATCH**: Partial updates (idempotent if same operations)
- **DELETE**: Remove resources (idempotent)

### Status Codes
- **200 OK**: Successful GET, PUT, DELETE
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE with no response body
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflict (duplicate, version mismatch)
- **422 Unprocessable Entity**: Valid request but semantic errors

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "v1"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [
    // Array of resources
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

## Database Schema Patterns

### Table Naming
- Use plural snake_case: `users`, `blog_posts`, `user_profiles`
- Use descriptive names: `user_roles` instead of `uroles`
- Avoid abbreviations unless widely understood: `category` not `cat`

### Column Naming
- Use snake_case: `first_name`, `created_at`, `is_active`
- Use consistent prefixes: `is_`, `has_`, `can_` for booleans
- Use timestamp columns: `created_at`, `updated_at`
- Use foreign key pattern: `user_id`, `post_id`, `category_id`

### Common Column Types
```sql
-- Primary keys
id BIGINT PRIMARY KEY AUTO_INCREMENT
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Timestamps
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Soft deletes
deleted_at TIMESTAMP WITH TIME ZONE NULL

-- Status flags
is_active BOOLEAN DEFAULT true
is_verified BOOLEAN DEFAULT false

-- Foreign keys
user_id BIGINT NOT NULL REFERENCES users(id)
```

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_123456",
  "email": "user@example.com",
  "role": "user",
  "permissions": ["read:posts", "write:posts"],
  "iat": 1642234567,
  "exp": 1642238167
}
```

### API Key Authentication
- Use `X-API-Key` header for service-to-service authentication
- Include key identifier and permissions in token payload
- Implement key rotation and expiration policies

### Permission-Based Access Control
```javascript
const permissions = {
  'user': ['read:own_profile', 'update:own_profile'],
  'moderator': ['read:posts', 'update:posts', 'delete:posts'],
  'admin': ['*'] // All permissions
};

function hasPermission(user, resource, action) {
  const requiredPermission = `${action}:${resource}`;
  return user.permissions.includes('*') || 
         user.permissions.includes(requiredPermission);
}
```

## Error Handling Patterns

### Validation Errors
```javascript
// Input validation middleware
const validateUserInput = (req, res, next) => {
  const errors = [];
  
  if (!req.body.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(req.body.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (!req.body.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (req.body.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors
      }
    });
  }
  
  next();
};
```

### Database Error Handling
```javascript
// Handle common database errors
const handleDatabaseError = (error) => {
  if (error.code === '23505') { // Unique violation
    return {
      code: 'DUPLICATE_RESOURCE',
      message: 'Resource already exists',
      field: error.detail?.match(/Key \((\w+)\)/)?.[1]
    };
  }
  
  if (error.code === '23503') { // Foreign key violation
    return {
      code: 'FOREIGN_KEY_VIOLATION',
      message: 'Referenced resource does not exist'
    };
  }
  
  if (error.code === '23502') { // Not null violation
    return {
      code: 'REQUIRED_FIELD_MISSING',
      message: 'Required field is missing',
      field: error.column
    };
  }
  
  return {
    code: 'DATABASE_ERROR',
    message: 'Internal database error'
  };
};
```

## Performance Patterns

### Database Query Optimization
```javascript
// Use indexed columns in WHERE clauses
const getUserByEmail = async (email) => {
  return await db.query('SELECT * FROM users WHERE email = $1', [email]);
};

// Use LIMIT for pagination
const getUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return await db.query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
};

// Use JOINs efficiently - avoid N+1 queries
const getUsersWithPosts = async () => {
  return await db.query(`
    SELECT 
      u.*, 
      array_agg(p.*) as posts
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id
  `);
};
```

### Caching Strategy
```javascript
// Cache frequently accessed data
const getUserById = async (id) => {
  const cacheKey = `user:${id}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  await redis.setex(cacheKey, 3600, JSON.stringify(user)); // 1 hour cache
  
  return user;
};

// Cache invalidation
const updateUser = async (id, data) => {
  const user = await db.query('UPDATE users SET ... WHERE id = $1 RETURNING *', [id, data]);
  await redis.del(`user:${id}`); // Invalidate cache
  return user;
};
```

## Security Patterns

### Input Sanitization
```javascript
// SQL injection prevention
const getUserByFilter = async (filters) => {
  const { name, email, status } = filters;
  const conditions = [];
  const values = [];
  let paramCount = 1;
  
  if (name) {
    conditions.push(`name ILIKE $${paramCount++}`);
    values.push(`%${name}%`);
  }
  
  if (email) {
    conditions.push(`email = $${paramCount++}`);
    values.push(email);
  }
  
  if (status) {
    conditions.push(`status = $${paramCount++}`);
    values.push(status);
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return await db.query(
    `SELECT * FROM users ${whereClause} ORDER BY created_at DESC`,
    values
  );
};
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true
});
```

## Testing Patterns

### Unit Testing
```javascript
// Test service layer
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      const user = await UserService.createUser(userData);
      
      expect(user.email).toBe(userData.email);
      expect(user.id).toBeDefined();
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });
    
    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };
      
      await expect(UserService.createUser(userData))
        .rejects.toThrow('DUPLICATE_RESOURCE');
    });
  });
});
```

### Integration Testing
```javascript
// Test API endpoints
describe('POST /api/users', () => {
  it('should create user and return 201', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
    expect(response.body.data.password).toBeUndefined(); // Password should not be returned
  });
  
  it('should return 422 for invalid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid-email' })
      .expect(422);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Environment Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/appdb
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# API
API_PORT=3000
API_HOST=localhost
API_VERSION=v1

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Configuration Management
```javascript
const config = {
  development: {
    database: {
      url: process.env.DATABASE_URL,
      pool: {
        min: parseInt(process.env.DATABASE_POOL_MIN) || 2,
        max: parseInt(process.env.DATABASE_POOL_MAX) || 10
      }
    },
    redis: {
      url: process.env.REDIS_URL,
      ttl: parseInt(process.env.REDIS_TTL) || 3600
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  },
  
  production: {
    // Production-specific overrides
    logging: {
      level: 'warn',
      format: 'json'
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

## Monitoring & Logging

### Structured Logging
```javascript
const logger = require('pino')({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }, 'HTTP Request');
  });
  
  next();
};
```

### Health Checks
```javascript
const healthCheck = async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    checks: {
      database: 'unknown',
      redis: 'unknown'
    }
  };
  
  try {
    await db.query('SELECT 1');
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'error';
  }
  
  try {
    await redis.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'error';
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};
```
