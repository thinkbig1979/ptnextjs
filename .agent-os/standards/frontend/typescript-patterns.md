# TypeScript Development Patterns for Agent OS

## Context

TypeScript code style standards and patterns for Agent OS projects. This document embodies TypeScript philosophy: type safety through strict mode, progressive enhancement over runtime checks, and developer confidence through comprehensive typing. These patterns ensure consistency, security, and maintainability across TypeScript applications.

**When to reference this document:**
- Reviewing TypeScript/React/Next.js codebases for quality and conventions
- Creating new frontend features or applications
- Refactoring existing TypeScript code
- Security scanning TypeScript applications
- Training AI agents on TypeScript best practices

**Philosophy:** TypeScript is strict mode - it has opinions about type safety, and following them leads to better software. Embrace the compiler; it's your best debugging tool.

## TypeScript Philosophy & Core Principles

### Strict Mode Over Permissive

TypeScript's power comes from strict type checking. Always enable strict mode and embrace its constraints. The compiler prevents bugs before they reach production.

**✅ Good - Strict mode configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                     // Enable all strict type checking options
    "strictNullChecks": true,           // Enforce null/undefined handling
    "strictFunctionTypes": true,        // Strict function type checking
    "strictBindCallApply": true,        // Strict bind/call/apply methods
    "strictPropertyInitialization": true, // Ensure class properties are initialized
    "noImplicitAny": true,              // Error on implicit any types
    "noImplicitThis": true,             // Error on this with implicit any type
    "alwaysStrict": true,               // Emit "use strict" in JavaScript output
    "noUnusedLocals": true,             // Report errors on unused locals
    "noUnusedParameters": true,         // Report errors on unused parameters
    "noImplicitReturns": true,          // Report error when not all code paths return a value
    "noFallthroughCasesInSwitch": true  // Report errors for fallthrough cases in switch
  }
}
```

**🔴 Bad - Permissive configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,              // Don't disable strict mode!
    "noImplicitAny": false,       // Allows implicit any - defeats TypeScript's purpose
    "skipLibCheck": true          // Only this one is sometimes acceptable for performance
  }
}
```

### Type Inference Over Explicit Annotations

Let TypeScript infer types when possible. Explicit annotations are for function signatures, complex types, and when inference needs guidance.

**✅ Good - Strategic type annotations:**
```typescript
// Let TypeScript infer simple types
const userName = 'John Doe';              // TypeScript infers: string
const userAge = 30;                       // TypeScript infers: number
const isActive = true;                    // TypeScript infers: boolean

// Annotate function parameters and return types
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// Annotate when inference needs help
const user: User = await fetchUser(id);   // API response needs explicit type

// Infer array types from initialization
const numbers = [1, 2, 3];                // TypeScript infers: number[]
const users = [user1, user2];             // TypeScript infers: User[]
```

**🔴 Bad - Over-annotation:**
```typescript
// Don't over-annotate obvious types
const userName: string = 'John Doe';      // Redundant annotation
const userAge: number = 30;               // TypeScript already knows this
const numbers: number[] = [1, 2, 3];      // Unnecessary explicit type

// Don't omit function signatures
function calculateTotal(price, quantity) { // Missing parameter types!
  return price * quantity;
}
```

### Interfaces Over Types for Objects

Use `interface` for object shapes and class contracts. Use `type` for unions, intersections, primitives, and mapped types.

**✅ Good - Interface for objects:**
```typescript
// Interfaces for object shapes
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Interfaces can extend
interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// Interfaces can be augmented (declaration merging)
interface User {
  updatedAt?: Date;  // Added later in same codebase
}

// Types for unions and complex types
type UserStatus = 'active' | 'inactive' | 'pending';
type UserOrAdmin = User | AdminUser;
type Nullable<T> = T | null;
```

**🔴 Bad - Type for simple objects:**
```typescript
// Don't use type for simple object shapes
type User = {
  id: string;
  email: string;
  name: string;
};  // Use interface instead

// Don't use interface for unions
interface UserStatus extends 'active' | 'inactive' {}  // Won't work, use type
```

### Naming Convention Clarification

**IMPORTANT:** TypeScript follows JavaScript naming conventions, which differ from global Agent OS conventions:

- **TypeScript Functions/Variables**: `camelCase` (TypeScript convention)
- **TypeScript Classes/Interfaces**: `PascalCase` (TypeScript convention)
- **TypeScript Constants**: `UPPER_SNAKE_CASE` (matches global convention)

This document supersedes global `coding-style.md` for TypeScript files. Use TypeScript's idiomatic naming.

**✅ Good - TypeScript naming conventions:**
```typescript
// Variables and functions: camelCase
const userName = 'John';
const isActive = true;
function calculateTotal(price: number): number { }
const getUserById = async (id: string): Promise<User> => { };

// Classes and Interfaces: PascalCase
class UserService { }
interface UserRepository { }
type ApiResponse = { };

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

**🔴 Bad - Mixing naming conventions:**
```typescript
// Don't use snake_case for functions/variables (this is Rails convention)
const user_name = 'John';           // Use userName
function calculate_total() { }      // Use calculateTotal

// Don't use camelCase for classes
class userService { }               // Use UserService
interface apiResponse { }           // Use ApiResponse
```

## File Structure & Organization

### TypeScript File Extensions

Use `.ts` for TypeScript files and `.tsx` for files containing JSX (React components).

**✅ Good - File extension usage:**
```
src/
├── components/
│   ├── Button.tsx           # React component (JSX)
│   ├── UserCard.tsx         # React component (JSX)
│   └── UserCard.test.tsx    # Component test (JSX)
├── lib/
│   ├── auth.ts              # Utility functions (no JSX)
│   ├── validation.ts        # Validation logic (no JSX)
│   └── api-client.ts        # API utilities (no JSX)
├── types/
│   ├── user.ts              # Type definitions
│   └── api.ts               # API type definitions
└── hooks/
    ├── useAuth.ts           # Custom hook (no JSX usually)
    └── useUser.tsx          # Custom hook (if rendering JSX)
```

### Directory Structure for Next.js Apps

Follow Next.js App Router conventions with TypeScript best practices.

**✅ Good - Next.js TypeScript structure:**
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx         # Login page component
│   └── register/
│       └── page.tsx         # Register page component
├── dashboard/
│   ├── page.tsx             # Dashboard page
│   └── layout.tsx           # Dashboard layout
├── api/
│   ├── users/
│   │   └── route.ts         # API route handler
│   └── posts/
│       └── [id]/
│           └── route.ts     # Dynamic API route
├── layout.tsx               # Root layout
└── page.tsx                 # Home page

components/
├── ui/                      # shadcn components
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── forms/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
└── shared/
    ├── Header.tsx
    └── Footer.tsx

lib/
├── db.ts                    # Database client
├── auth.ts                  # Auth utilities
└── utils.ts                 # Helper functions

types/
├── user.ts                  # User type definitions
├── post.ts                  # Post type definitions
└── api.ts                   # API response types

hooks/
├── useAuth.ts               # Authentication hook
└── useUser.ts               # User data hook
```

### Barrel Exports (Use Sparingly)

Use index.ts barrel files for public API exports, but avoid over-using them to prevent circular dependencies.

**✅ Good - Strategic barrel exports:**
```typescript
// components/forms/index.ts - Export public API
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { ProfileForm } from './ProfileForm';

// Usage elsewhere
import { LoginForm, RegisterForm } from '@/components/forms';
```

**🔴 Bad - Over-using barrel exports:**
```typescript
// Don't create barrel exports for everything
// lib/index.ts
export * from './auth';
export * from './validation';
export * from './api-client';
export * from './db';
// This creates circular dependency risks and slows compilation
```

## Type System Mastery

### Type Annotations vs Inference

Understand when to annotate and when to let TypeScript infer.

**✅ Good - Strategic annotations:**
```typescript
// Always annotate function parameters
function greetUser(name: string, age: number): string {
  return `Hello ${name}, you are ${age} years old`;
}

// Annotate when API response needs clarity
const user: User = await fetch('/api/user').then(r => r.json());

// Let inference work for local variables
const isAdmin = user.role === 'admin';  // TypeScript infers: boolean
const userCount = users.length;         // TypeScript infers: number

// Annotate complex destructuring
const { data, error }: { data: User | null; error: Error | null } = await fetchUser();
```

**🔴 Bad - Missing critical annotations:**
```typescript
// Missing function parameter types (error in strict mode)
function greetUser(name, age) {  // Error: Parameter 'name' implicitly has an 'any' type
  return `Hello ${name}, you are ${age} years old`;
}

// Relying on any for API responses
const user = await fetch('/api/user').then(r => r.json());  // Type: any (unsafe!)
```

### Interfaces and Type Aliases

Use interfaces for object contracts and types for complex type operations.

**✅ Good - Interface usage:**
```typescript
// Base interface
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

// Extended interface
interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
  departmentId: string;
}

// Interface for function signatures
interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// Type for unions and mapped types
type UserStatus = 'active' | 'inactive' | 'pending';
type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
type UserKeys = keyof User;
```

**🔴 Bad - Misusing types and interfaces:**
```typescript
// Don't use type for simple object shapes that may be extended
type User = {
  id: string;
  name: string;
};  // Use interface instead for extensibility

// Don't try to extend literal unions with interface
interface Status extends 'active' | 'inactive' {}  // Error! Use type for unions
```

### Generics for Reusable Types

Use generics to create flexible, type-safe abstractions.

**✅ Good - Generic usage:**
```typescript
// Generic API response wrapper
interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

// Usage with different types
const userResponse: ApiResponse<User> = await fetchUser();
const postsResponse: ApiResponse<Post[]> = await fetchPosts();

// Generic function
function filterByProperty<T, K extends keyof T>(
  items: T[],
  key: K,
  value: T[K]
): T[] {
  return items.filter(item => item[key] === value);
}

// Type-safe usage
const activeUsers = filterByProperty(users, 'status', 'active');
const adminUsers = filterByProperty(users, 'role', 'admin');

// Generic with constraints
interface Identifiable {
  id: string;
}

function findById<T extends Identifiable>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// Generic React component
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
}

function Select<T>({ options, value, onChange, getLabel }: SelectProps<T>) {
  // Type-safe select component
}
```

**🔴 Bad - Avoiding generics with any:**
```typescript
// Don't use any when generics are appropriate
interface ApiResponse {
  data: any;              // Loses all type safety!
  error: string | null;
}

// Don't create duplicate non-generic versions
function filterUsersByStatus(users: User[], status: string): User[] { }
function filterPostsByStatus(posts: Post[], status: string): Post[] { }
// Use generics instead!
```

### Utility Types

Master TypeScript's built-in utility types for type transformations.

**✅ Good - Utility type usage:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Partial - make all properties optional
type PartialUser = Partial<User>;
const updateData: PartialUser = { name: 'New Name' };  // Only name is required

// Required - make all properties required
type RequiredUser = Required<User>;

// Readonly - make all properties readonly
type ReadonlyUser = Readonly<User>;
const user: ReadonlyUser = getUser();
// user.name = 'New';  // Error: Cannot assign to 'name' because it is read-only

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;
const preview: UserPreview = { id: '1', name: 'John', email: 'john@example.com' };

// Omit - exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;
const publicUser: UserWithoutPassword = { ...user };  // password excluded

// Record - create object type with keys
type UserRoles = 'admin' | 'user' | 'guest';
type RolePermissions = Record<UserRoles, string[]>;
const permissions: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};

// ReturnType - extract function return type
function getUser() {
  return { id: '1', name: 'John', email: 'john@example.com' };
}
type User = ReturnType<typeof getUser>;  // { id: string; name: string; email: string; }

// Parameters - extract function parameter types
function createUser(name: string, email: string, age: number) { }
type CreateUserParams = Parameters<typeof createUser>;  // [string, string, number]
```

**🔴 Bad - Manually recreating utility types:**
```typescript
// Don't manually create what utility types provide
interface User {
  id: string;
  name: string;
  email: string;
}

// Don't do this:
interface PartialUser {
  id?: string;
  name?: string;
  email?: string;
}
// Use Partial<User> instead!

// Don't do this:
interface UserPreview {
  id: string;
  name: string;
}
// Use Pick<User, 'id' | 'name'> instead!
```

### Type Guards and Narrowing

Use type guards to safely narrow types at runtime.

**✅ Good - Type guards:**
```typescript
// Type predicate function
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).email === 'string'
  );
}

// Usage
function processData(data: unknown) {
  if (isUser(data)) {
    console.log(data.email);  // TypeScript knows data is User
  }
}

// Discriminated unions
interface SuccessResult {
  status: 'success';
  data: User;
}

interface ErrorResult {
  status: 'error';
  error: string;
}

type Result = SuccessResult | ErrorResult;

function handleResult(result: Result) {
  if (result.status === 'success') {
    console.log(result.data);  // TypeScript knows result is SuccessResult
  } else {
    console.log(result.error);  // TypeScript knows result is ErrorResult
  }
}

// instanceof narrowing
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    console.log(`API Error ${error.statusCode}: ${error.message}`);
  } else if (error instanceof Error) {
    console.log(`Error: ${error.message}`);
  }
}

// in operator narrowing
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
  if ('radius' in shape) {
    return Math.PI * shape.radius ** 2;
  } else {
    return shape.width * shape.height;
  }
}
```

**🔴 Bad - Type assertions without validation:**
```typescript
// Don't use type assertions without runtime checks
function processData(data: unknown) {
  const user = data as User;  // Unsafe! No runtime validation
  console.log(user.email);    // Might crash if data isn't actually a User
}

// Don't ignore discriminated union patterns
type Result = SuccessResult | ErrorResult;

function handleResult(result: Result) {
  // Don't access properties without narrowing
  console.log(result.data);  // Error: Property 'data' does not exist on type 'Result'

  // Don't use type assertion
  console.log((result as SuccessResult).data);  // Unsafe if result is ErrorResult
}
```

### Literal Types and Template Literals

Use literal types for precise type constraints.

**✅ Good - Literal types:**
```typescript
// String literal types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type UserRole = 'admin' | 'user' | 'guest';

function makeRequest(method: HttpMethod, url: string) {
  // method can only be one of the specified values
}

makeRequest('GET', '/api/users');     // OK
// makeRequest('INVALID', '/api/users');  // Error

// Numeric literal types
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

function rollDice(): DiceRoll {
  return (Math.floor(Math.random() * 6) + 1) as DiceRoll;
}

// Template literal types
type Route = `/api/${'users' | 'posts' | 'comments'}`;
type ApiEndpoint = `${Route}/${string}`;

const validRoute: ApiEndpoint = '/api/users/123';  // OK
// const invalidRoute: ApiEndpoint = '/invalid/users/123';  // Error

// Combining template literals with unions
type HTTPStatusCode = 200 | 400 | 404 | 500;
type LogMessage = `[${HTTPStatusCode}] ${string}`;

const message: LogMessage = '[200] Request successful';  // OK

// Const assertions for literal types
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
} as const;

// config is now: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000; readonly retries: 3 }
// config.apiUrl = 'new-url';  // Error: Cannot assign to 'apiUrl' because it is read-only

type ConfigKeys = keyof typeof config;  // 'apiUrl' | 'timeout' | 'retries'
```

**🔴 Bad - Using strings instead of literal types:**
```typescript
// Don't use generic string types for limited options
function makeRequest(method: string, url: string) {  // Too permissive!
  // method could be anything: 'INVALID', 'asdf', etc.
}

// Don't skip const assertions for config
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};
// config properties are mutable and types are widened to string/number
```

## React Component Patterns

### Function Components with TypeScript

Use function components with explicit prop types. Avoid legacy `React.FC` type.

**✅ Good - Modern function component typing:**
```typescript
// Props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children?: React.ReactNode;
}

// Function component (preferred modern approach)
function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}

// With children
interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Card({ title, children, footer }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Generic component
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select onChange={e => {
      const selected = options.find(opt => getValue(opt) === e.target.value);
      if (selected) onChange(selected);
    }}>
      {options.map(option => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

**🔴 Bad - Legacy React.FC usage:**
```typescript
// Don't use React.FC (it's fallen out of favor)
const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  // React.FC has issues with generics and defaultProps
  return <button onClick={onClick}>{label}</button>;
};

// Don't omit prop types
function Button({ label, onClick }) {  // Error: Binding element 'label' implicitly has an 'any' type
  return <button onClick={onClick}>{label}</button>;
}

// Don't use PropTypes (use TypeScript instead)
import PropTypes from 'prop-types';

function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};  // Use TypeScript interfaces instead!
```

### Event Handler Typing

Type event handlers correctly for type-safe event handling.

**✅ Good - Typed event handlers:**
```typescript
interface FormProps {
  onSubmit: (data: FormData) => void;
}

function LoginForm({ onSubmit }: FormProps) {
  // Specific event types
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" onClick={handleClick}>
        Submit
      </button>
    </form>
  );
}

// Inline event handlers with correct types
function SearchInput() {
  return (
    <input
      type="search"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
      }}
    />
  );
}
```

**🔴 Bad - Untyped or generic event handlers:**
```typescript
function LoginForm() {
  // Don't use generic Event type
  const handleSubmit = (e: Event) => {  // Too generic! Use React.FormEvent<HTMLFormElement>
    e.preventDefault();
  };

  // Don't use any
  const handleClick = (e: any) => {  // No type safety!
    console.log(e);
  };

  // Don't omit event type in inline handlers
  return (
    <button onClick={(e) => {  // e is implicitly any
      console.log(e);
    }}>
      Click
    </button>
  );
}
```

### Hook Typing

Type custom hooks properly for reusable, type-safe logic.

**✅ Good - Typed hooks:**
```typescript
// useState with explicit type
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
}

// useRef typing
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();  // Safe access with optional chaining
  }, []);

  return <input ref={inputRef} />;
}

// Custom hook with return type
interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useUser(userId: string): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

// useCallback with typed parameters
function UserList() {
  const handleUserClick = useCallback((userId: string) => {
    console.log('User clicked:', userId);
  }, []);

  const handleUserDelete = useCallback(async (userId: string): Promise<void> => {
    await deleteUser(userId);
  }, []);
}

// Generic custom hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Usage
const [user, setUser] = useLocalStorage<User>('user', { id: '', name: '', email: '' });
```

**🔴 Bad - Untyped hooks:**
```typescript
// Don't omit useState type when initial value is null
function UserProfile() {
  const [user, setUser] = useState(null);  // Type: null, not User | null
  // Later: setUser(userData);  // Type error if userData is User
}

// Don't use any for useRef
function TextInput() {
  const inputRef = useRef<any>(null);  // Loses type safety!
  inputRef.current.focus();  // No autocomplete or type checking
}

// Don't skip return type annotation for custom hooks
function useUser(userId) {  // Missing parameter type
  // Hook implementation
  return { user, loading, error };  // Return type is inferred but unclear
}
```

### Context API with TypeScript

Type Context properly to avoid undefined values and ensure type safety.

**✅ Good - Typed Context:**
```typescript
// Define context value type
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create context with undefined as default (requires provider)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const userData = await response.json();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook with proper error handling
function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in components
function UserProfile() {
  const { user, logout } = useAuth();  // Type-safe!

  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**🔴 Bad - Poorly typed Context:**
```typescript
// Don't use createContext with null default and expect non-null
const AuthContext = createContext<AuthContextValue>(null!);  // Lying to TypeScript!

// Don't skip undefined check in useContext
function useAuth() {
  const context = useContext(AuthContext);
  return context;  // Could be undefined if used outside provider!
}

// Don't use any for context value
const AuthContext = createContext<any>(undefined);  // No type safety!
```

## Next.js Patterns

### Page Component Typing

Type Next.js page components with proper param and searchParam types.

**✅ Good - Next.js page typing:**
```typescript
// App Router page component (Next.js 13+)
interface PageProps {
  params: { id: string };
  searchParams: { sort?: string; filter?: string };
}

export default async function UserPage({ params, searchParams }: PageProps) {
  const user = await fetchUser(params.id);
  const sortBy = searchParams.sort || 'name';

  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
}

// Dynamic route with multiple params
interface PostPageProps {
  params: { userId: string; postId: string };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await fetchPost(params.userId, params.postId);
  return <div>{post.title}</div>;
}

// generateStaticParams for static generation
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const users = await fetchUsers();
  return users.map(user => ({ id: user.id }));
}
```

**🔴 Bad - Untyped page components:**
```typescript
// Don't omit param types
export default async function UserPage({ params, searchParams }) {  // No types!
  const user = await fetchUser(params.id);  // params is any
  return <div>{user.name}</div>;
}

// Don't use incorrect types
interface PageProps {
  params: any;           // Too permissive
  searchParams: any;     // No autocomplete or type checking
}
```

### API Route Typing (App Router)

Type Next.js API routes with proper request/response types.

**✅ Good - Typed API routes:**
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';

  const users = await fetchUsers(parseInt(page));

  return NextResponse.json({ users, page: parseInt(page) });
}

// POST handler with typed body
interface CreateUserBody {
  email: string;
  name: string;
  password: string;
}

export async function POST(request: NextRequest) {
  const body: CreateUserBody = await request.json();

  // Validate body
  if (!body.email || !body.name || !body.password) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const user = await createUser(body);

  return NextResponse.json(user, { status: 201 });
}

// Dynamic route API handler
// app/api/users/[id]/route.ts
interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const user = await fetchUser(params.id);

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const body: Partial<User> = await request.json();
  const updatedUser = await updateUser(params.id, body);

  return NextResponse.json(updatedUser);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  await deleteUser(params.id);
  return NextResponse.json({ success: true });
}
```

**🔴 Bad - Untyped API routes:**
```typescript
// Don't omit request/response types
export async function GET(request) {  // No type!
  const users = await fetchUsers();
  return NextResponse.json(users);
}

// Don't skip body validation
export async function POST(request: NextRequest) {
  const body = await request.json();  // Type: any
  const user = await createUser(body);  // No validation!
  return NextResponse.json(user);
}
```

### Server vs Client Components

Understand when to use 'use client' directive and type components accordingly.

**✅ Good - Server vs Client component usage:**
```typescript
// Server Component (default in App Router) - NO 'use client'
// app/users/page.tsx
async function UsersPage() {
  const users = await fetchUsers();  // Direct database/API call

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  );
}

// Client Component - uses 'use client' for interactivity
// components/UserList.tsx
'use client';

import { useState } from 'react';

interface UserListProps {
  users: User[];
}

function UserList({ users }: UserListProps) {
  const [filter, setFilter] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter users..."
      />
      {filteredUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// Client Component with event handlers
'use client';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

**🔴 Bad - Misusing client components:**
```typescript
// Don't add 'use client' to components that don't need it
'use client';  // Unnecessary if no hooks or event handlers

async function UsersPage() {
  const users = await fetchUsers();  // Should be server component!
  return <div>{users.length} users</div>;
}

// Don't use hooks in server components
async function UsersPage() {
  const [users, setUsers] = useState([]);  // Error! Can't use hooks in server components
  return <div>Users</div>;
}
```

## State Management

### Context API for Global State

Use Context API for simple global state management.

**✅ Good - Context for auth and theme:**
```typescript
// Theme context
type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Zustand for Complex Client State

Use Zustand for complex client-side state management with TypeScript.

**✅ Good - Typed Zustand store:**
```typescript
import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.id === id ? { ...i, quantity } : i
    )
  })),

  clearCart: () => set({ items: [] }),

  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}));

// Usage in component
function Cart() {
  const { items, total, removeItem, updateQuantity } = useCartStore();

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <div>Total: ${total}</div>
    </div>
  );
}
```

### Form Handling with React Hook Form + Zod

Use React Hook Form with Zod for type-safe form validation.

**✅ Good - Type-safe forms:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema defines validation and TypeScript type
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'Must be 18 or older').max(120)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Infer TypeScript type from Zod schema
type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    // data is fully typed and validated
    await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('email')} type="email" placeholder="Email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <input {...register('password')} type="password" placeholder="Password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <div>
        <input
          {...register('confirmPassword')}
          type="password"
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      <div>
        <input {...register('name')} placeholder="Name" />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <input
          {...register('age', { valueAsNumber: true })}
          type="number"
          placeholder="Age"
        />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
}
```

**🔴 Bad - Unvalidated forms:**
```typescript
// Don't use untyped form handling
function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {  // No type
    e.preventDefault();
    // No validation! Sends invalid data to API
    fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
}
```

## Security Patterns

### Type-Safe Input Validation

Always validate user input with Zod or similar type-safe validation library.

**✅ Good - Type-safe validation:**
```typescript
import { z } from 'zod';

// API endpoint validation
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(18).max(120),
  role: z.enum(['user', 'admin'])
});

// API route with validation
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate and parse in one step
  const result = createUserSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.errors },
      { status: 400 }
    );
  }

  // result.data is fully typed and validated
  const user = await createUser(result.data);
  return NextResponse.json(user, { status: 201 });
}

// Environmental variable validation
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test'])
});

// Validate at startup
export const env = envSchema.parse(process.env);
```

**🔴 Bad - Runtime validation without types:**
```typescript
// Don't validate without type safety
export async function POST(request: NextRequest) {
  const body = await request.json();  // Type: any

  // Manual validation (error-prone)
  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  if (!body.age || typeof body.age !== 'number' || body.age < 18) {
    return NextResponse.json({ error: 'Invalid age' }, { status: 400 });
  }

  // body is still type 'any', no type safety
  const user = await createUser(body);
}
```

### XSS Prevention with Type Safety

TypeScript + React provide automatic XSS protection. Never use `dangerouslySetInnerHTML` with user input.

**✅ Good - Safe rendering:**
```typescript
interface CommentProps {
  comment: {
    id: string;
    body: string;
    author: string;
  };
}

function Comment({ comment }: CommentProps) {
  // React automatically escapes strings
  return (
    <div>
      <p>{comment.body}</p>  {/* Safe - automatically escaped */}
      <span>By: {comment.author}</span>
    </div>
  );
}

// For trusted HTML (like markdown), use a library
import DOMPurify from 'isomorphic-dompurify';

interface ArticleProps {
  content: string;  // Markdown content
}

function Article({ content }: ArticleProps) {
  const sanitizedHtml = DOMPurify.sanitize(content);

  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
  );
}
```

**🔴 Bad - XSS vulnerability:**
```typescript
// NEVER do this with user input
function Comment({ comment }: CommentProps) {
  return (
    <div dangerouslySetInnerHTML={{ __html: comment.body }} />
    // If comment.body contains: <script>alert('XSS')</script>
    // Script will execute!
  );
}
```

### Authentication Type Safety

Type authentication state and user data consistently.

**✅ Good - Typed authentication:**
```typescript
// User type with role-based access
interface BaseUser {
  id: string;
  email: string;
  name: string;
}

interface RegularUser extends BaseUser {
  role: 'user';
}

interface AdminUser extends BaseUser {
  role: 'admin';
  permissions: string[];
}

type User = RegularUser | AdminUser;

// Type guard for admin check
function isAdmin(user: User): user is AdminUser {
  return user.role === 'admin';
}

// Protected route with type-safe user
function AdminDashboard() {
  const { user } = useAuth();

  if (!user || !isAdmin(user)) {
    redirect('/login');
  }

  // TypeScript knows user is AdminUser here
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Permissions: {user.permissions.join(', ')}</p>
    </div>
  );
}

// Session validation with Zod
const sessionSchema = z.object({
  userId: z.string().uuid(),
  expiresAt: z.number(),
  role: z.enum(['user', 'admin'])
});

async function validateSession(sessionId: string) {
  const sessionData = await getSessionFromDb(sessionId);
  const result = sessionSchema.safeParse(sessionData);

  if (!result.success) {
    throw new Error('Invalid session');
  }

  if (result.data.expiresAt < Date.now()) {
    throw new Error('Session expired');
  }

  return result.data;
}
```

## Testing Patterns

### Component Testing with Type Safety

Write type-safe component tests using React Testing Library.

**✅ Good - Typed component tests:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button label="Click me" onClick={() => {}} disabled />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});

// Test custom hooks
import { renderHook, act } from '@testing-library/react';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter(0));

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### Type Testing

Test that types are correct using type assertions.

**✅ Good - Type tests:**
```typescript
// Type test file: user.test-d.ts
import { expectType, expectError } from 'tsd';
import type { User, AdminUser } from './types';

// Test that User has required properties
const user: User = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
};

expectType<User>(user);

// Test that missing properties cause errors
expectError({
  id: '123',
  email: 'test@example.com'
  // Missing name and role
} as User);

// Test that AdminUser extends User
const admin: AdminUser = {
  id: '123',
  email: 'admin@example.com',
  name: 'Admin',
  role: 'admin',
  permissions: ['read', 'write']
};

expectType<User>(admin);  // AdminUser is assignable to User
```

## Performance Patterns

### Code Splitting and Lazy Loading

Use dynamic imports for code splitting with proper type safety.

**✅ Good - Type-safe lazy loading:**
```typescript
import { lazy, Suspense } from 'react';

// Lazy load component with type
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const UserProfile = lazy(() => import('./UserProfile'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}

// Next.js dynamic imports
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false  // Disable SSR for client-only components
});

// Dynamic import with named export
const { UserModal } = await import('./UserModal');
```

### Memoization with TypeScript

Use React.memo and useMemo with proper type annotations.

**✅ Good - Typed memoization:**
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize component
interface UserCardProps {
  user: User;
  onClick: (userId: string) => void;
}

const UserCard = memo<UserCardProps>(({ user, onClick }) => {
  return (
    <div onClick={() => onClick(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// useMemo for expensive calculations
function UserList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const userCount = useMemo(() => users.length, [users]);

  return <div>{sortedUsers.map(user => <UserCard key={user.id} user={user} />)}</div>;
}

// useCallback for stable function references
function UserList({ users, onUserClick }: { users: User[]; onUserClick: (id: string) => void }) {
  const handleClick = useCallback((userId: string) => {
    onUserClick(userId);
  }, [onUserClick]);

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} onClick={handleClick} />
      ))}
    </div>
  );
}
```

## Build Configuration

### tsconfig.json Best Practices

Configure TypeScript for optimal type safety and Next.js compatibility.

**✅ Good - Comprehensive tsconfig.json:**
```json
{
  "compilerOptions": {
    // Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // Module Resolution
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "isolatedModules": true,

    // JavaScript Support
    "allowJs": true,
    "checkJs": false,

    // Emit
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Interop Constraints
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Language and Environment
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",

    // Next.js Specific
    "incremental": true,
    "plugins": [{ "name": "next" }],

    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules", ".next", "out"]
}
```

### Path Aliases

Use path aliases for clean imports.

**✅ Good - Path alias usage:**
```typescript
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/user';
import { db } from '@/lib/db';
```

## Anti-Patterns to Avoid

### Avoiding Type Safety

**🔴 Bad - Disabling TypeScript:**
```typescript
// Don't use any
function processData(data: any) {  // Defeats purpose of TypeScript
  return data;
}

// Don't use @ts-ignore
// @ts-ignore
const value = user.nonExistentProperty;  // Hides real errors

// Don't use type assertions without validation
const user = response.data as User;  // Unsafe if data isn't actually User

// Don't disable strict mode
// tsconfig.json
{
  "compilerOptions": {
    "strict": false  // Don't do this!
  }
}
```

### Non-Null Assertions

**🔴 Bad - Overusing non-null assertions:**
```typescript
// Don't use non-null assertions without certainty
function getUser() {
  return users.find(u => u.id === currentId)!;  // Might be undefined!
}

// Better: Handle null case
function getUser() {
  const user = users.find(u => u.id === currentId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

// Or use optional chaining
const userName = users.find(u => u.id === currentId)?.name ?? 'Unknown';
```

### Type Assertion Abuse

**🔴 Bad - Unsafe type assertions:**
```typescript
// Don't assert without runtime validation
const user = apiResponse as User;  // No guarantee apiResponse is actually User

// Better: Validate with type guard
if (isUser(apiResponse)) {
  const user = apiResponse;  // Type guard ensures safety
}

// Or use Zod
const user = userSchema.parse(apiResponse);  // Validates and throws if invalid
```

## References & Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Official TypeScript documentation
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) - Community-maintained React + TypeScript guide
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript) - Next.js TypeScript configuration
- [Zod Documentation](https://zod.dev/) - Type-safe schema validation
- [Total TypeScript](https://www.totaltypescript.com/) - Advanced TypeScript patterns
- [Type Challenges](https://github.com/type-challenges/type-challenges) - Practice TypeScript type system
