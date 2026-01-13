---
version: 5.1.0
last-updated: 2026-01-02
---


# Naming Conventions (Canonical Reference)

**Version**: 1.0.0 | Agent OS v5.1.0
**Status**: CANONICAL - Single source of truth for all naming conventions

---

## Overview

Naming conventions vary by language and context. This document consolidates all naming rules and clarifies when each convention applies.

---

## 1. General Principle: Follow Language Idioms

Each programming language has established naming conventions. **Always follow the idiomatic conventions of the language you're writing in.**

| Language | Variables/Functions | Classes/Types | Constants |
|----------|---------------------|---------------|-----------|
| TypeScript/JavaScript | `camelCase` | `PascalCase` | `UPPER_SNAKE_CASE` |
| Python | `snake_case` | `PascalCase` | `UPPER_SNAKE_CASE` |
| Ruby/Rails | `snake_case` | `PascalCase` | `UPPER_SNAKE_CASE` |
| SQL/Database | `snake_case` | N/A | `UPPER_SNAKE_CASE` |
| CSS Classes | `kebab-case` | N/A | N/A |

---

## 2. TypeScript/JavaScript

**Reference**: `@standards/frontend/typescript-patterns.md`

### Variables and Functions: `camelCase`

```typescript
// Good
const userName = 'John';
const isActive = true;
function calculateTotal(price: number): number { }
const getUserById = async (id: string): Promise<User> => { };

// Bad - don't use snake_case in TypeScript
const user_name = 'John';           // Wrong
function calculate_total() { }      // Wrong
```

### Classes, Interfaces, Types: `PascalCase`

```typescript
// Good
class UserService { }
interface UserRepository { }
type ApiResponse = { };

// Bad
class userService { }               // Wrong
interface api_response { }          // Wrong
```

### Constants: `UPPER_SNAKE_CASE`

```typescript
// Good
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Bad
const maxRetryCount = 3;            // Use UPPER_SNAKE_CASE for true constants
```

### React Components: `PascalCase`

```typescript
// Good
function UserProfile() { }
const LoginForm = () => { };

// Bad
function userProfile() { }          // Wrong
```

---

## 3. Python

**Reference**: `@standards/backend/python-patterns.md`

### Variables and Functions: `snake_case`

```python
# Good
user_name = 'John'
is_active = True
def calculate_total(price: float) -> float:
    pass

# Bad
userName = 'John'                   # Wrong - not Pythonic
def calculateTotal():               # Wrong
    pass
```

### Classes: `PascalCase`

```python
# Good
class UserService:
    pass

class DatabaseConnection:
    pass

# Bad
class user_service:                 # Wrong
    pass
```

### Constants: `UPPER_SNAKE_CASE`

```python
# Good
MAX_CONNECTIONS = 100
DEFAULT_TIMEOUT = 30

# Bad
maxConnections = 100                # Wrong
```

### Modules: `snake_case`

```python
# Good
user_service.py
database_connection.py

# Bad
UserService.py                      # Wrong
user-service.py                     # Wrong - no hyphens
```

---

## 4. Ruby/Rails

**Reference**: `@standards/backend/rails-patterns.md`

### Variables and Methods: `snake_case`

```ruby
# Good
user_profile = User.find(id)
def calculate_total(price)
end

# Bad
userProfile = User.find(id)         # Wrong
def calculateTotal(price)           # Wrong
end
```

### Classes and Modules: `PascalCase`

```ruby
# Good
class UserProfile < ApplicationRecord
end

module AuthenticationHelper
end

# Bad
class user_profile < ApplicationRecord   # Wrong
end
```

### Constants: `UPPER_SNAKE_CASE`

```ruby
# Good
MAX_RETRY_COUNT = 3
API_BASE_URL = 'https://api.example.com'
```

---

## 5. Database (SQL/PostgreSQL)

**Reference**: `@standards/backend/database.md`

### Tables: `snake_case` (plural)

```sql
-- Good
users
blog_posts
user_profiles
order_items

-- Bad
Users                               -- Wrong - don't capitalize
blogPosts                           -- Wrong - use snake_case
user_profile                        -- Wrong - use plural
```

### Columns: `snake_case`

```sql
-- Good
first_name
last_login_at
is_active
user_id

-- Bad
firstName                           -- Wrong
lastLoginAt                         -- Wrong
```

### Indexes: `idx_[table]_[columns]`

```sql
-- Good
idx_users_email
idx_posts_user_id_created_at

-- Bad
users_email_idx                     -- Wrong format
```

### Constraints: `[type]_[table]_[description]`

```sql
-- Good
chk_users_email_format
fk_posts_user_id
```

---

## 6. CSS/Styling

### CSS Classes: `kebab-case`

```css
/* Good */
.user-profile { }
.nav-bar-item { }
.btn-primary { }

/* Bad */
.userProfile { }                    /* Wrong */
.user_profile { }                   /* Wrong */
```

### Tailwind CSS: Utility classes as-is

```html
<!-- Good - use Tailwind utilities directly -->
<div class="bg-gray-50 dark:bg-gray-900 p-4 rounded">
```

### BEM (Block-Element-Modifier): When needed

```css
/* Good - BEM format */
.card { }
.card__header { }
.card--featured { }
```

### data-testid: `kebab-case`

```html
<!-- Good -->
<button data-testid="login-submit-button">Login</button>
<input data-testid="login-email-input" />

<!-- Pattern: [feature]-[component]-[element] -->
```

---

## 7. File Naming

### TypeScript/JavaScript Files: `kebab-case`

```
// Good
user-service.ts
api-client.ts
login-form.tsx

// Bad
userService.ts                      // Use kebab-case
UserService.ts                      // Use kebab-case
user_service.ts                     // Use kebab-case
```

**Exception**: React components can use `PascalCase.tsx`

```
// Also acceptable for components
LoginForm.tsx
UserProfile.tsx
```

### Python Files: `snake_case`

```
# Good
user_service.py
database_connection.py

# Bad
UserService.py                      # Wrong
user-service.py                     # Wrong
```

### Test Files

| Type | Pattern | Example |
|------|---------|---------|
| Unit | `*.test.{ts,tsx}` or `*_test.py` | `Button.test.tsx`, `user_test.py` |
| Integration | `*.integration.ts` | `api.integration.ts` |
| E2E | `*.spec.ts` | `login.spec.ts` |

---

## 8. API Endpoints

### REST URLs: `kebab-case`

```
# Good
GET /api/users
GET /api/users/:id
GET /api/user-profiles
POST /api/blog-posts

# Bad
GET /api/userProfiles              # Wrong
GET /api/user_profiles             # Wrong
```

### Query Parameters: `snake_case`

```
# Good
GET /api/users?sort_by=created_at&page_size=20

# Bad
GET /api/users?sortBy=created_at   # Wrong
```

### JSON Response Fields: Match language convention

For JavaScript/TypeScript APIs, use `camelCase`:

```json
{
  "userId": 123,
  "firstName": "John",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

For Python APIs, `snake_case` is also acceptable:

```json
{
  "user_id": 123,
  "first_name": "John",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## 9. Environment Variables

### Format: `UPPER_SNAKE_CASE`

```bash
# Good
DATABASE_URL=postgresql://...
API_BASE_URL=https://...
JWT_SECRET=...
NODE_ENV=production

# Bad
databaseUrl=...                     # Wrong
apiBaseUrl=...                      # Wrong
```

---

## 10. Quick Reference Table

| Context | Format | Example |
|---------|--------|---------|
| TS/JS variables | `camelCase` | `userName`, `isActive` |
| TS/JS functions | `camelCase` | `calculateTotal()` |
| TS/JS classes | `PascalCase` | `UserService` |
| TS/JS interfaces | `PascalCase` | `UserRepository` |
| TS/JS constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Python variables | `snake_case` | `user_name`, `is_active` |
| Python functions | `snake_case` | `calculate_total()` |
| Python classes | `PascalCase` | `UserService` |
| Python constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Ruby variables | `snake_case` | `user_name` |
| Ruby methods | `snake_case` | `calculate_total` |
| Ruby classes | `PascalCase` | `UserService` |
| DB tables | `snake_case` (plural) | `users`, `blog_posts` |
| DB columns | `snake_case` | `first_name`, `created_at` |
| CSS classes | `kebab-case` | `user-profile`, `btn-primary` |
| File names (TS) | `kebab-case` | `user-service.ts` |
| File names (Python) | `snake_case` | `user_service.py` |
| REST URLs | `kebab-case` | `/api/user-profiles` |
| Env variables | `UPPER_SNAKE_CASE` | `DATABASE_URL` |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `global/coding-style.md` | General formatting (indentation, comments) |
| `frontend/typescript-patterns.md` | TypeScript-specific patterns |
| `backend/python-patterns.md` | Python-specific patterns |
| `backend/rails-patterns.md` | Ruby/Rails-specific patterns |
| `backend/database.md` | Database naming conventions |
