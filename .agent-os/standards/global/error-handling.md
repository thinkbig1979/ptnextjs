# Global Error Handling Standards for Agent OS

## Context

Comprehensive error handling patterns and standards for Agent OS projects across all development phases.

## Error Classification

### Error Types
- **Validation Errors**: Input validation failures (400, 422)
- **Authentication Errors**: Authentication failures (401)
- **Authorization Errors**: Permission failures (403)
- **Not Found Errors**: Resource not found (404)
- **Conflict Errors**: Resource conflicts (409)
- **Server Errors**: Internal server errors (500)
- **Service Errors**: External service failures (502, 503)
- **Rate Limit Errors**: Too many requests (429)

### Error Severity Levels
- **Critical**: System-breaking errors requiring immediate attention
- **High**: Major functionality broken but system partially operable
- **Medium**: Feature-specific issues affecting user experience
- **Low**: Minor issues with workarounds available
- **Info**: Informational messages for debugging

## Error Response Format

### Standard Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data provided",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      }
    ],
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_123456789",
    "path": "/api/users"
  },
  "meta": {
    "version": "v1",
    "environment": "production"
  }
}
```

### Error Codes Convention
```javascript
const ERROR_CODES = {
  // Validation Errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication Errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  MISSING_TOKEN: 'MISSING_TOKEN',
  
  // Authorization Errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Not Found Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict Errors (409)
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Server Errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};
```

## Error Handling Patterns

### Validation Error Handling
```javascript
class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.code = ERROR_CODES.VALIDATION_ERROR;
    this.statusCode = 422;
    this.details = details;
    this.isOperational = true;
  }
}

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      
      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        
        throw new ValidationError('Invalid input data', details);
      }
      
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};
```

### Authentication Error Handling
```javascript
class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.code = ERROR_CODES.UNAUTHORIZED;
    this.statusCode = 401;
    this.isOperational = true;
  }
}

class TokenExpiredError extends AuthenticationError {
  constructor() {
    super('Token has expired');
    this.code = ERROR_CODES.TOKEN_EXPIRED;
  }
}

// JWT verification middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('Missing authentication token');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      next(new TokenExpiredError());
    } else if (err.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(err);
    }
  }
};
```

### Database Error Handling
```javascript
class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.code = ERROR_CODES.DATABASE_ERROR;
    this.statusCode = 500;
    this.originalError = originalError;
    this.isOperational = false;
  }
}

const handleDatabaseError = (error) => {
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique violation
      throw new ValidationError('Resource already exists', [{
        field: error.detail?.match(/Key \((\w+)\)/)?.[1],
        message: 'Value already exists'
      }]);
    
    case '23503': // Foreign key violation
      throw new ValidationError('Referenced resource does not exist', [{
        field: error.detail?.match(/Key \((\w+)\)/)?.[1],
        message: 'Invalid reference'
      }]);
    
    case '23502': // Not null violation
      throw new ValidationError('Required field is missing', [{
        field: error.column,
        message: 'This field is required'
      }]);
    
    default:
      throw new DatabaseError('Database operation failed', error);
  }
};
```

### Global Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    },
    user: req.user
  }, 'Error occurred');
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Build error response
  const errorResponse = {
    success: false,
    error: {
      code: err.code || ERROR_CODES.INTERNAL_ERROR,
      message: err.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId: req.id,
      path: req.path
    },
    meta: {
      version: 'v1',
      environment: process.env.NODE_ENV
    }
  };
  
  // Include validation details if available
  if (err.details) {
    errorResponse.error.details = err.details;
  }
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};
```

## Logging and Monitoring

### Structured Logging
```javascript
const logger = require('pino')({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => {
      if (object.err) {
        object.err = {
          name: object.err.name,
          message: object.err.message,
          stack: object.err.stack
        };
      }
      return object;
    }
  }
});

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error({
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    },
    request: {
      id: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    },
    user: req.user?.id
  }, 'Request error');
  
  next(err);
};
```

### Error Monitoring Integration
```javascript
// Sentry integration
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

const sentryErrorHandler = (err, req, res, next) => {
  Sentry.captureException(err, {
    extra: {
      requestId: req.id,
      user: req.user,
      body: req.body
    }
  });
  
  next(err);
};
```

## Error Recovery Strategies

### Retry Mechanism
```javascript
class RetryableError extends Error {
  constructor(message, retryAfter = 1000) {
    super(message);
    this.name = 'RetryableError';
    this.retryAfter = retryAfter;
    this.isRetryable = true;
  }
}

const withRetry = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      if (!err.isRetryable || attempt === maxRetries) {
        throw err;
      }
      
      await new Promise(resolve => setTimeout(resolve, err.retryAfter * attempt));
    }
  }
  
  throw lastError;
};
```

### Circuit Breaker Pattern
```javascript
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
  
  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

## Frontend Error Handling

### Global Error Boundary (React)
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logger.error({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    }, 'React error boundary caught error');
    
    // Send to error monitoring service
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handling
```javascript
class ApiError extends Error {
  constructor(response, data) {
    super(data.error?.message || 'API request failed');
    this.name = 'ApiError';
    this.statusCode = response.status;
    this.code = data.error?.code;
    this.details = data.error?.details;
    this.response = response;
  }
}

const apiClient = {
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(response, data);
      }
      
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      
      throw new Error('Network error occurred');
    }
  }
};
```

## Testing Error Handling

### Error Testing Patterns
```javascript
describe('Error Handling', () => {
  describe('API Endpoints', () => {
    it('should return 422 for validation errors', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'invalid-email' })
        .expect(422);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toHaveLength(1);
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);
      
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
  
  describe('Error Classes', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Test message', [
        { field: 'email', message: 'Invalid format' }
      ]);
      
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(422);
      expect(error.details).toHaveLength(1);
      expect(error.isOperational).toBe(true);
    });
  });
});
```

## Error Handling Best Practices

### Do's
- Use specific error types for different error scenarios
- Include meaningful error messages with actionable information
- Log errors with sufficient context for debugging
- Implement graceful degradation for non-critical errors
- Use structured logging for consistent error monitoring
- Provide user-friendly error messages in production

### Don'ts
- Expose sensitive information in error messages
- Use generic error types for all scenarios
- Ignore errors or fail silently
- Log passwords or other sensitive data
- Return stack traces in production
- Create deeply nested error handling logic

### Error Handling Checklist
- [ ] All API endpoints have proper error handling
- [ ] Errors are logged with sufficient context
- [ ] User-friendly error messages are provided
- [ ] Sensitive information is not exposed
- [ ] Error monitoring is configured
- [ ] Circuit breakers are implemented for external services
- [ ] Retry mechanisms are implemented for transient failures
- [ ] Error boundaries are implemented in frontend
- [ ] Error scenarios are covered by tests
- [ ] Error handling documentation is maintained