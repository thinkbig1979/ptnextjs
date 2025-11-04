# Python Development Patterns for Agent OS

## Context

Python code style standards and patterns for Agent OS projects. This document embodies Python philosophy: explicit is better than implicit, readability counts, and there should be one obvious way to do it. These patterns ensure consistency, security, and maintainability across Python applications.

**When to reference this document:**
- Reviewing Python codebases for quality and conventions
- Creating new Python backend services or scripts
- Refactoring existing Python code
- Security scanning Python applications
- Training AI agents on Python best practices

**Philosophy:** Python is Pythonic - the Zen of Python guides us toward code that is readable, explicit, and simple. Follow PEP 8, embrace type hints, and write code that other developers can understand at a glance.

## Python Philosophy & Core Principles

### The Zen of Python (PEP 20)

The Zen of Python should guide every Python decision. These principles are not just philosophy—they're practical guidance.

**Key Principles:**
```python
# Beautiful is better than ugly
# Explicit is better than implicit
# Simple is better than complex
# Complex is better than complicated
# Flat is better than nested
# Sparse is better than dense
# Readability counts
# Special cases aren't special enough to break the rules
# Although practicality beats purity
# Errors should never pass silently
# Unless explicitly silenced
# In the face of ambiguity, refuse the temptation to guess
# There should be one-- and preferably only one --obvious way to do it
# Now is better than never
# Although never is often better than *right* now
```

**✅ Good - Pythonic code:**
```python
# Explicit and readable
from typing import Optional, List
from datetime import datetime

def get_active_users(min_posts: int = 5) -> List[dict]:
    """Get users with at least min_posts published posts."""
    active_users = []
    for user in users:
        if user.status == 'active' and user.post_count >= min_posts:
            active_users.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'post_count': user.post_count
            })
    return active_users

# List comprehension for simple filtering
def get_active_users_pythonic(min_posts: int = 5) -> List[dict]:
    """Get users with at least min_posts published posts."""
    return [
        {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'post_count': user.post_count
        }
        for user in users
        if user.status == 'active' and user.post_count >= min_posts
    ]
```

**🔴 Bad - Un-Pythonic code:**
```python
# Implicit, hard to understand
def gau(m=5):  # Unclear function name and parameter
    a = []
    for u in users:
        if u.s == 'a' and u.pc >= m:  # Unclear variable names
            a.append({'i': u.i, 'n': u.n, 'e': u.e, 'pc': u.pc})
    return a

# Over-complicated when simple would work
def get_active_users_bad(min_posts=5):
    try:
        result = list(
            map(
                lambda u: dict(
                    zip(
                        ['id', 'name', 'email', 'post_count'],
                        [u.id, u.name, u.email, u.post_count]
                    )
                ),
                filter(
                    lambda u: u.status == 'active' and u.post_count >= min_posts,
                    users
                )
            )
        )
    except:  # Bare except - never do this!
        result = []
    return result
```

### PEP 8 - Style Guide for Python Code

Follow PEP 8 religiously. Use tools like `black` and `flake8` to enforce consistency.

**✅ Good - PEP 8 compliant:**
```python
# Proper spacing and naming
from typing import Optional, Dict, List
import os
import sys

# Constants in UPPER_SNAKE_CASE
MAX_CONNECTIONS = 100
DEFAULT_TIMEOUT = 30

# Classes in PascalCase
class UserRepository:
    """Repository for user data access."""

    def __init__(self, connection_string: str) -> None:
        self.connection_string = connection_string
        self._connection: Optional[object] = None

    # Methods and variables in snake_case
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Retrieve user by ID."""
        # Proper spacing around operators
        if user_id <= 0:
            return None

        # Line length under 88 characters (Black default) or 79 (PEP 8)
        query = """
            SELECT id, name, email, created_at
            FROM users
            WHERE id = %s AND deleted_at IS NULL
        """

        return self._execute_query(query, (user_id,))
```

**🔴 Bad - PEP 8 violations:**
```python
# Poor spacing and naming
from typing import Optional,Dict,List  # No spaces after commas
import os,sys  # Multiple imports on one line

# Incorrect naming conventions
maxConnections=100  # Should be MAX_CONNECTIONS
defaultTimeout=30   # Should be DEFAULT_TIMEOUT

class userRepository:  # Should be UserRepository (PascalCase)
    def __init__(self,connection_string:str)->None:  # No spaces around annotations
        self.connectionString=connection_string  # Should be snake_case
        self._connection:Optional[object]=None

    def GetUserById(self,userId:int)->Optional[Dict]:  # Should be snake_case
        if userId<=0:return None  # Multiple statements on one line, no spacing
        # Line too long --------------------------------------------------------------------------------------
        query="SELECT id, name, email, created_at FROM users WHERE id = %s AND deleted_at IS NULL"
        return self._execute_query(query,(userId,))
```

### Type Hints Over Dynamic Typing

Python is dynamically typed, but type hints make code more maintainable and catch bugs early. Use type hints everywhere, especially in function signatures.

**✅ Good - Comprehensive type hints:**
```python
from typing import Optional, List, Dict, Union, Tuple, Any, Callable
from datetime import datetime
from dataclasses import dataclass

# Type aliases for clarity
UserId = int
UserData = Dict[str, Any]

@dataclass
class User:
    """User data model."""
    id: UserId
    name: str
    email: str
    created_at: datetime
    is_active: bool = True
    metadata: Optional[Dict[str, Any]] = None

def create_user(
    name: str,
    email: str,
    *,  # Force keyword-only arguments after this
    is_active: bool = True,
    metadata: Optional[Dict[str, Any]] = None
) -> User:
    """Create a new user with provided details."""
    return User(
        id=generate_id(),
        name=name,
        email=email,
        created_at=datetime.now(),
        is_active=is_active,
        metadata=metadata
    )

def get_users(
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[User]:
    """Get users with optional filtering."""
    query_params: Dict[str, Any] = {'limit': limit, 'offset': offset}
    if status:
        query_params['status'] = status
    return fetch_users(query_params)

# Type hints for callbacks
def process_users(
    users: List[User],
    callback: Callable[[User], bool]
) -> List[User]:
    """Process users through callback function."""
    return [user for user in users if callback(user)]
```

**🔴 Bad - Missing type hints:**
```python
# No type hints - loses all type safety
def create_user(name, email, is_active=True, metadata=None):
    return {
        'id': generate_id(),
        'name': name,
        'email': email,
        'created_at': datetime.now(),
        'is_active': is_active,
        'metadata': metadata
    }

def get_users(status=None, limit=100, offset=0):
    query_params = {'limit': limit, 'offset': offset}
    if status:
        query_params['status'] = status
    return fetch_users(query_params)

def process_users(users, callback):
    return [user for user in users if callback(user)]
```

## File Structure & Organization

### Module and Package Structure

Follow Python package conventions with proper `__init__.py` files and logical organization.

**✅ Good - Organized package structure:**
```
backend/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── post.py
│   │   └── comment.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user_repository.py
│   │   └── post_repository.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── user_service.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── users.py
│   │   │   └── posts.py
│   │   └── v2/
│   │       ├── __init__.py
│   │       └── users.py
│   └── utils/
│       ├── __init__.py
│       ├── validators.py
│       └── formatters.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_models/
│   ├── test_repositories/
│   └── test_services/
└── migrations/              # Database migrations (Alembic)
    └── versions/
```

**✅ Good - __init__.py for clean imports:**
```python
# app/models/__init__.py
"""Data models for the application."""
from .user import User
from .post import Post
from .comment import Comment

__all__ = ['User', 'Post', 'Comment']

# Usage in other files:
# from app.models import User, Post  # Clean imports
```

### Module Naming Conventions

Use lowercase with underscores for module names, PascalCase for classes.

**✅ Good - Module naming:**
```python
# user_service.py
from typing import Optional, List
from app.models import User
from app.repositories import UserRepository

class UserService:
    """Service layer for user operations."""

    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.repository.find_by_id(user_id)
```

**🔴 Bad - Module naming:**
```python
# UserService.py - DON'T use PascalCase for module names
# user-service.py - DON'T use hyphens
# userService.py - DON'T use camelCase
```

### Import Organization

Organize imports in three groups: standard library, third-party, local. Sort alphabetically within groups.

**✅ Good - Import organization:**
```python
# Standard library imports
import os
import sys
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# Third-party imports
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

# Local application imports
from app.config import settings
from app.database import get_db
from app.models import User
from app.repositories import UserRepository
```

**🔴 Bad - Disorganized imports:**
```python
# Mixed order, no grouping
from app.models import User
import os
from fastapi import FastAPI
from app.config import settings
from datetime import datetime
from sqlalchemy import Column
import sys
```

## Type Hints & Type Safety

### Basic Type Annotations

Use type hints for all function signatures and complex variables.

**✅ Good - Comprehensive type hints:**
```python
from typing import Optional, List, Dict, Tuple, Union, Any, Set

# Simple types
name: str = "John Doe"
age: int = 30
height: float = 5.9
is_active: bool = True

# Collections
user_ids: List[int] = [1, 2, 3, 4]
user_data: Dict[str, Any] = {'name': 'John', 'age': 30}
coordinates: Tuple[float, float] = (10.5, 20.3)
unique_ids: Set[int] = {1, 2, 3}

# Optional types
middle_name: Optional[str] = None
error_message: Optional[str] = "Something went wrong"

# Union types
result: Union[str, int] = "success"
response: Union[Dict[str, Any], None] = None

# Function with type hints
def calculate_total(
    prices: List[float],
    tax_rate: float = 0.1,
    discount: Optional[float] = None
) -> float:
    """Calculate total price with tax and optional discount."""
    subtotal: float = sum(prices)
    tax: float = subtotal * tax_rate
    total: float = subtotal + tax

    if discount is not None:
        total -= discount

    return round(total, 2)
```

**🔴 Bad - Missing or inconsistent type hints:**
```python
# No type hints
name = "John Doe"
age = 30

def calculate_total(prices, tax_rate=0.1, discount=None):
    subtotal = sum(prices)
    tax = subtotal * tax_rate
    total = subtotal + tax
    if discount:  # Unsafe - what if discount is 0?
        total -= discount
    return round(total, 2)
```

### Generic Types and Type Variables

Use TypeVar for generic functions and classes that work with multiple types.

**✅ Good - Generic types:**
```python
from typing import TypeVar, Generic, List, Optional, Callable, Protocol

T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')

# Generic function
def get_first_element(items: List[T]) -> Optional[T]:
    """Get first element from list, or None if empty."""
    return items[0] if items else None

# Usage is type-safe
numbers: List[int] = [1, 2, 3]
first_number: Optional[int] = get_first_element(numbers)  # Type: Optional[int]

names: List[str] = ["Alice", "Bob"]
first_name: Optional[str] = get_first_element(names)  # Type: Optional[str]

# Generic class
class Repository(Generic[T]):
    """Generic repository for any model type."""

    def __init__(self, model_class: type[T]) -> None:
        self.model_class = model_class
        self.items: List[T] = []

    def add(self, item: T) -> None:
        """Add item to repository."""
        self.items.append(item)

    def get_all(self) -> List[T]:
        """Get all items."""
        return self.items

    def find_by(self, predicate: Callable[[T], bool]) -> Optional[T]:
        """Find first item matching predicate."""
        for item in self.items:
            if predicate(item):
                return item
        return None

# Type-safe usage
from app.models import User

user_repo: Repository[User] = Repository(User)
user_repo.add(User(id=1, name="Alice"))
users: List[User] = user_repo.get_all()  # Fully typed!

# Protocol for structural subtyping (duck typing with type safety)
class Drawable(Protocol):
    """Protocol for objects that can be drawn."""
    def draw(self) -> str:
        ...

def render(obj: Drawable) -> str:
    """Render any drawable object."""
    return obj.draw()

# Any class with a draw() method satisfies Drawable
class Circle:
    def draw(self) -> str:
        return "Drawing circle"

class Square:
    def draw(self) -> str:
        return "Drawing square"

render(Circle())  # Valid
render(Square())  # Valid
```

**🔴 Bad - Using Any or avoiding generics:**
```python
from typing import Any, List

# Don't use Any when generics would work
def get_first_element(items: List[Any]) -> Any:  # Loses type information
    return items[0] if items else None

# Don't create non-generic versions
class UserRepository:
    def __init__(self):
        self.users = []

    def add(self, user):  # No type hints
        self.users.append(user)

class PostRepository:
    def __init__(self):
        self.posts = []

    def add(self, post):  # No type hints
        self.posts.append(post)

# Should use generic Repository[T] instead!
```

### Type Aliases and NewType

Use type aliases for complex types and NewType for distinct types.

**✅ Good - Type aliases and NewType:**
```python
from typing import Dict, List, Any, NewType

# Type aliases for readability
UserId = NewType('UserId', int)  # Distinct type - not just an int
PostId = NewType('PostId', int)
JSON = Dict[str, Any]
Headers = Dict[str, str]
QueryParams = Dict[str, Union[str, int, bool]]

# NewType creates distinct types that can't be confused
def get_user(user_id: UserId) -> Optional[User]:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()

def get_post(post_id: PostId) -> Optional[Post]:
    """Get post by ID."""
    return db.query(Post).filter(Post.id == post_id).first()

# Type safety prevents mixing up IDs
user_id = UserId(123)
post_id = PostId(456)

user = get_user(user_id)  # OK
# user = get_user(post_id)  # Type error! PostId is not UserId
# post = get_post(user_id)  # Type error! UserId is not PostId

# Complex type aliases
APIResponse = Dict[str, Union[str, int, List[Dict[str, Any]]]]

def fetch_data(url: str, params: QueryParams) -> APIResponse:
    """Fetch data from API."""
    response = requests.get(url, params=params)
    return response.json()
```

**🔴 Bad - Not using type aliases or NewType:**
```python
# Hard to read complex types inline
def fetch_data(
    url: str,
    params: Dict[str, Union[str, int, bool]]
) -> Dict[str, Union[str, int, List[Dict[str, Any]]]]:
    response = requests.get(url, params=params)
    return response.json()

# IDs are just ints - easy to mix up
def get_user(user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_post(post_id: int) -> Optional[Post]:
    return db.query(Post).filter(Post.id == post_id).first()

# Easy to make mistakes - no type safety
user = get_user(456)  # Is this really a user ID or a post ID? Compiler doesn't know!
```

### TypedDict for Structured Dictionaries

Use TypedDict for dictionaries with known structure instead of Dict[str, Any].

**✅ Good - TypedDict usage:**
```python
from typing import TypedDict, Optional, List

# Define structure with TypedDict
class UserDict(TypedDict):
    """User data dictionary structure."""
    id: int
    name: str
    email: str
    is_active: bool

class PostDict(TypedDict, total=False):  # total=False makes all fields optional
    """Post data dictionary structure."""
    id: int
    title: str
    body: str
    author_id: int
    tags: List[str]

# Type-safe dictionary operations
def create_user_dict(id: int, name: str, email: str) -> UserDict:
    """Create typed user dictionary."""
    return {
        'id': id,
        'name': name,
        'email': email,
        'is_active': True
    }

def serialize_user(user: User) -> UserDict:
    """Serialize user model to dictionary."""
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'is_active': user.is_active
    }

# IDE provides autocomplete and type checking
user_data: UserDict = create_user_dict(1, "Alice", "alice@example.com")
print(user_data['name'])  # Type-safe access
# print(user_data['invalid'])  # Type error!
```

**🔴 Bad - Using Dict[str, Any]:**
```python
from typing import Dict, Any

# No structure - anything goes
def create_user_dict(id: int, name: str, email: str) -> Dict[str, Any]:
    return {
        'id': id,
        'name': name,
        'email': email,
        'is_active': True,
        'random_field': 'oops'  # No error, but shouldn't be here
    }

# No IDE help, no type safety
user_data: Dict[str, Any] = create_user_dict(1, "Alice", "alice@example.com")
print(user_data['nmae'])  # Typo not caught! Returns None or KeyError at runtime
```

## Dataclasses and Pydantic Models

### Dataclasses for Simple Data Structures

Use dataclasses for simple data containers with automatic `__init__`, `__repr__`, and `__eq__`.

**✅ Good - Dataclass usage:**
```python
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime

@dataclass
class User:
    """User data model."""
    id: int
    name: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True
    tags: List[str] = field(default_factory=list)  # Mutable defaults must use field()
    metadata: Optional[dict] = None

    def __post_init__(self) -> None:
        """Validate after initialization."""
        if not self.email or '@' not in self.email:
            raise ValueError(f"Invalid email: {self.email}")

# Automatic __init__, __repr__, __eq__
user = User(id=1, name="Alice", email="alice@example.com")
print(user)  # User(id=1, name='Alice', email='alice@example.com', ...)

# Equality works automatically
user2 = User(id=1, name="Alice", email="alice@example.com")
assert user == user2

@dataclass(frozen=True)  # Immutable dataclass
class Point:
    """Immutable point in 2D space."""
    x: float
    y: float

    def distance_from_origin(self) -> float:
        """Calculate distance from origin."""
        return (self.x ** 2 + self.y ** 2) ** 0.5

# Can't modify frozen dataclass
point = Point(3.0, 4.0)
# point.x = 5.0  # Error: can't assign to frozen dataclass

@dataclass(order=True)  # Enable comparison operators
class Person:
    """Person with sortable age."""
    name: str = field(compare=False)  # Don't include in comparison
    age: int

# Comparison works
people = [Person("Alice", 30), Person("Bob", 25), Person("Charlie", 35)]
sorted_people = sorted(people)  # Sorts by age
```

**🔴 Bad - Manual class definition:**
```python
# Don't write boilerplate when dataclass can do it
class User:
    def __init__(self, id, name, email, created_at=None, is_active=True, tags=None, metadata=None):
        self.id = id
        self.name = name
        self.email = email
        self.created_at = created_at or datetime.now()
        self.is_active = is_active
        self.tags = tags or []  # Bug: mutable default
        self.metadata = metadata

    def __repr__(self):
        return f"User(id={self.id}, name={self.name}, email={self.email}...)"

    def __eq__(self, other):
        if not isinstance(other, User):
            return False
        return (self.id == other.id and self.name == other.name and
                self.email == other.email and self.is_active == other.is_active)

    # So much boilerplate! Use @dataclass instead
```

### Pydantic for Validation and API Models

Use Pydantic for data validation, especially for API request/response models.

**✅ Good - Pydantic models:**
```python
from pydantic import BaseModel, EmailStr, Field, validator, root_validator
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    """User creation request model."""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr  # Validates email format
    password: str = Field(..., min_length=8)
    age: int = Field(..., ge=18, le=120)  # Greater than or equal to 18
    tags: List[str] = Field(default_factory=list, max_items=10)

    @validator('name')
    def name_must_not_contain_numbers(cls, v: str) -> str:
        """Validate name doesn't contain numbers."""
        if any(char.isdigit() for char in v):
            raise ValueError('Name must not contain numbers')
        return v.strip()

    @validator('password')
    def password_strength(cls, v: str) -> str:
        """Validate password strength."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserResponse(BaseModel):
    """User response model (without sensitive data)."""
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    is_active: bool
    tags: List[str]

    class Config:
        """Pydantic configuration."""
        orm_mode = True  # Allow creation from ORM models
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserUpdate(BaseModel):
    """User update request model (all fields optional)."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None

    @root_validator
    def at_least_one_field(cls, values: dict) -> dict:
        """Ensure at least one field is provided."""
        if not any(values.values()):
            raise ValueError('At least one field must be provided')
        return values

# Automatic validation
try:
    user = UserCreate(
        name="Alice",
        email="alice@example.com",
        password="SecurePass123",
        age=25
    )
except ValueError as e:
    print(f"Validation error: {e}")

# Parse from JSON
user_dict = {
    'name': 'Bob',
    'email': 'bob@example.com',
    'password': 'StrongPass456',
    'age': 30,
    'tags': ['developer', 'python']
}
user = UserCreate(**user_dict)

# Convert to dict
user_data = user.dict()  # Excludes None values by default
user_json = user.json()  # JSON string
```

**🔴 Bad - Manual validation:**
```python
# Don't manually validate when Pydantic can do it
class UserCreate:
    def __init__(self, name, email, password, age, tags=None):
        # Manual validation - error-prone
        if not name or len(name) < 2 or len(name) > 100:
            raise ValueError("Invalid name length")

        if not email or '@' not in email:
            raise ValueError("Invalid email")

        if not password or len(password) < 8:
            raise ValueError("Password too short")

        if age < 18 or age > 120:
            raise ValueError("Invalid age")

        # No automatic parsing, no type safety
        self.name = name
        self.email = email
        self.password = password
        self.age = age
        self.tags = tags or []
```

## Framework Patterns - Flask, Django, FastAPI

### Flask Application Structure

Flask is lightweight and flexible. Use blueprints for organization and application factory pattern.

**✅ Good - Flask application:**
```python
# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config) -> Flask:
    """Application factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from app.api import users_bp, posts_bp
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')

    return app

# app/api/users.py
from flask import Blueprint, request, jsonify
from typing import Tuple, Dict, Any
from app.models import User
from app.schemas import UserSchema, UserCreateSchema
from app.services import UserService

users_bp = Blueprint('users', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)

@users_bp.route('/', methods=['GET'])
def get_users() -> Tuple[Dict[str, Any], int]:
    """Get all users."""
    users = UserService.get_all_users()
    return {'users': users_schema.dump(users)}, 200

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id: int) -> Tuple[Dict[str, Any], int]:
    """Get user by ID."""
    user = UserService.get_user_by_id(user_id)
    if not user:
        return {'error': 'User not found'}, 404
    return {'user': user_schema.dump(user)}, 200

@users_bp.route('/', methods=['POST'])
def create_user() -> Tuple[Dict[str, Any], int]:
    """Create new user."""
    data = request.get_json()

    # Validate with marshmallow schema
    schema = UserCreateSchema()
    errors = schema.validate(data)
    if errors:
        return {'errors': errors}, 400

    user = UserService.create_user(schema.load(data))
    return {'user': user_schema.dump(user)}, 201

@users_bp.errorhandler(Exception)
def handle_error(error: Exception) -> Tuple[Dict[str, str], int]:
    """Global error handler for blueprint."""
    return {'error': str(error)}, 500
```

**🔴 Bad - Flask anti-patterns:**
```python
# Don't put everything in one file
from flask import Flask, request
app = Flask(__name__)

@app.route('/users')
def get_users():
    # Business logic in route handler - bad!
    users = db.session.query(User).all()
    return jsonify([{'id': u.id, 'name': u.name} for u in users])

@app.route('/users/<user_id>')
def get_user(user_id):  # No type hints
    user = db.session.query(User).filter_by(id=user_id).first()
    if not user:
        return {'error': 'Not found'}, 404
    # No schema validation, manual dict construction
    return {'id': user.id, 'name': user.name, 'email': user.email}

# No application factory, no blueprints, no separation of concerns
```

### Django Models and Views

Django is batteries-included. Use class-based views and follow Django conventions.

**✅ Good - Django patterns:**
```python
# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from typing import Optional

class User(AbstractUser):
    """Custom user model."""
    bio = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at'])
        ]

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}".strip()

class Post(models.Model):
    """Blog post model."""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('published', 'Published'),
            ('archived', 'Archived')
        ],
        default='draft'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['author', 'status'])
        ]

    def __str__(self) -> str:
        return self.title

    def get_absolute_url(self) -> str:
        """Get post URL."""
        from django.urls import reverse
        return reverse('post-detail', kwargs={'slug': self.slug})

# views.py
from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from typing import Any
from .models import Post, User
from .forms import PostForm

class PostListView(ListView):
    """List all published posts."""
    model = Post
    template_name = 'posts/list.html'
    context_object_name = 'posts'
    paginate_by = 20

    def get_queryset(self):
        """Get published posts with author prefetched."""
        return Post.objects.filter(
            status='published'
        ).select_related('author').order_by('-created_at')

class PostDetailView(DetailView):
    """Show post detail."""
    model = Post
    template_name = 'posts/detail.html'
    context_object_name = 'post'

    def get_queryset(self):
        """Get post with related data."""
        return Post.objects.select_related('author').prefetch_related('comments')

class PostCreateView(LoginRequiredMixin, CreateView):
    """Create new post."""
    model = Post
    form_class = PostForm
    template_name = 'posts/create.html'

    def form_valid(self, form):
        """Set author before saving."""
        form.instance.author = self.request.user
        return super().form_valid(form)

# serializers.py (Django REST Framework)
from rest_framework import serializers
from .models import User, Post

class UserSerializer(serializers.ModelSerializer):
    """User serializer for API."""
    full_name = serializers.ReadOnlyField()
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'bio', 'post_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_post_count(self, obj: User) -> int:
        """Get number of published posts."""
        return obj.posts.filter(status='published').count()

class PostSerializer(serializers.ModelSerializer):
    """Post serializer for API."""
    author = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'body', 'author', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
```

### FastAPI - Modern Python API Framework

FastAPI is built on Pydantic and type hints. It's async-first and generates OpenAPI docs automatically.

**✅ Good - FastAPI application:**
```python
# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import get_db, engine
from app import models, schemas, crud
from app.dependencies import get_current_user

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="User API",
    description="API for user management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root() -> dict:
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
) -> models.User:
    """Create a new user."""
    # Check if user exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[models.User]:
    """Get all users with pagination."""
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> models.User:
    """Get user by ID."""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@app.put("/users/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Update user (authentication required)."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    db_user = crud.update_user(db, user_id=user_id, user_update=user_update)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> None:
    """Delete user (authentication required)."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this user"
        )

    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

# Async endpoint example
@app.get("/users/{user_id}/posts", response_model=List[schemas.PostResponse])
async def get_user_posts(
    user_id: int,
    db: Session = Depends(get_db)
) -> List[models.Post]:
    """Get all posts by user."""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user.posts
```

**🔴 Bad - FastAPI anti-patterns:**
```python
# Don't skip type hints and validation
@app.post("/users/")
def create_user(user):  # No type hints!
    # Manual validation - defeats FastAPI's purpose
    if not user.get('email'):
        return {'error': 'Email required'}, 400

    # No automatic docs, no validation
    db_user = User(**user)
    db.add(db_user)
    db.commit()
    return db_user

# Don't use synchronous code for I/O operations
@app.get("/users/{user_id}")
def get_user(user_id: int):
    # Synchronous database call - blocks event loop
    time.sleep(1)  # Simulating slow query
    return db.query(User).filter(User.id == user_id).first()
```

## SQLAlchemy ORM Patterns

### Defining Models

Use SQLAlchemy declarative base for clean ORM models.

**✅ Good - SQLAlchemy models:**
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import List, Optional

Base = declarative_base()

class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class User(Base, TimestampMixin):
    """User model."""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    posts = relationship('Post', back_populates='author', cascade='all, delete-orphan')
    comments = relationship('Comment', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"

class Post(Base, TimestampMixin):
    """Post model."""
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    status = Column(String(20), default='draft', nullable=False, index=True)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)

    # Relationships
    author = relationship('User', back_populates='posts')
    comments = relationship('Comment', back_populates='post', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f"<Post(id={self.id}, title='{self.title}')>"

class Comment(Base, TimestampMixin):
    """Comment model."""
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    body = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False, index=True)

    # Relationships
    user = relationship('User', back_populates='comments')
    post = relationship('Post', back_populates='comments')

    def __repr__(self) -> str:
        return f"<Comment(id={self.id}, user_id={self.user_id})>"
```

### Query Patterns and N+1 Prevention

Use eager loading to prevent N+1 queries.

**✅ Good - Efficient queries:**
```python
from sqlalchemy.orm import Session, selectinload, joinedload
from typing import List, Optional

def get_users_with_posts(db: Session, limit: int = 100) -> List[User]:
    """Get users with their posts (prevents N+1)."""
    return db.query(User).options(
        selectinload(User.posts)
    ).limit(limit).all()

def get_post_with_details(db: Session, post_id: int) -> Optional[Post]:
    """Get post with author and comments."""
    return db.query(Post).options(
        joinedload(Post.author),
        selectinload(Post.comments).joinedload(Comment.user)
    ).filter(Post.id == post_id).first()

def get_active_users(db: Session) -> List[User]:
    """Get active users efficiently."""
    return db.query(User).filter(
        User.is_active == True
    ).order_by(User.created_at.desc()).all()

def search_posts(db: Session, query: str, limit: int = 50) -> List[Post]:
    """Search posts by title or body."""
    search_term = f"%{query}%"
    return db.query(Post).filter(
        (Post.title.ilike(search_term)) | (Post.body.ilike(search_term))
    ).options(joinedload(Post.author)).limit(limit).all()

# Bulk operations
def create_users_bulk(db: Session, users_data: List[dict]) -> None:
    """Create multiple users efficiently."""
    users = [User(**user_data) for user_data in users_data]
    db.bulk_save_objects(users)
    db.commit()
```

**🔴 Bad - N+1 queries:**
```python
# Don't trigger N+1 queries
def get_users_with_posts_bad(db: Session):
    users = db.query(User).all()  # 1 query
    for user in users:
        print(user.posts)  # N queries (one per user)!
    return users

# Don't fetch unnecessary data
def get_user_names_bad(db: Session):
    users = db.query(User).all()  # Fetches all columns
    return [user.name for user in users]

# Should use: db.query(User.name).all()
```

## Testing with pytest

### Test Structure and Fixtures

Use pytest fixtures for reusable test setup and teardown.

**✅ Good - pytest patterns:**
```python
# conftest.py
import pytest
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models import User

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create test database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Create test client with test database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db: Session) -> User:
    """Create test user."""
    user = User(
        email="test@example.com",
        name="Test User",
        password_hash="hashed_password",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# test_users.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models import User

def test_create_user(client: TestClient) -> None:
    """Test user creation."""
    response = client.post(
        "/users/",
        json={
            "email": "new@example.com",
            "name": "New User",
            "password": "SecurePass123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert data["name"] == "New User"
    assert "id" in data

def test_create_user_duplicate_email(client: TestClient, test_user: User) -> None:
    """Test user creation with duplicate email fails."""
    response = client.post(
        "/users/",
        json={
            "email": test_user.email,
            "name": "Another User",
            "password": "SecurePass123"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_get_user(client: TestClient, test_user: User) -> None:
    """Test getting user by ID."""
    response = client.get(f"/users/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email

def test_get_nonexistent_user(client: TestClient) -> None:
    """Test getting non-existent user returns 404."""
    response = client.get("/users/99999")
    assert response.status_code == 404

@pytest.mark.parametrize("email,name,password,expected_status", [
    ("valid@example.com", "Valid Name", "SecurePass123", 201),
    ("invalid-email", "Valid Name", "SecurePass123", 422),  # Invalid email
    ("valid@example.com", "A", "SecurePass123", 422),  # Name too short
    ("valid@example.com", "Valid Name", "short", 422),  # Password too short
])
def test_create_user_validation(
    client: TestClient,
    email: str,
    name: str,
    password: str,
    expected_status: int
) -> None:
    """Test user creation validation."""
    response = client.post(
        "/users/",
        json={"email": email, "name": name, "password": password}
    )
    assert response.status_code == expected_status

# test_models.py
def test_user_creation(db: Session) -> None:
    """Test user model creation."""
    user = User(
        email="model@example.com",
        name="Model Test",
        password_hash="hashed",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    assert user.id is not None
    assert user.email == "model@example.com"
    assert user.created_at is not None

def test_user_posts_relationship(db: Session) -> None:
    """Test user-posts relationship."""
    from app.models import Post

    user = User(email="user@example.com", name="User", password_hash="hash")
    db.add(user)
    db.commit()

    post1 = Post(title="Post 1", body="Body 1", author_id=user.id)
    post2 = Post(title="Post 2", body="Body 2", author_id=user.id)
    db.add_all([post1, post2])
    db.commit()

    db.refresh(user)
    assert len(user.posts) == 2
    assert user.posts[0].title == "Post 1"
```

### Mocking and Patching

Use pytest-mock for mocking external dependencies.

**✅ Good - Mocking patterns:**
```python
import pytest
from unittest.mock import Mock, patch, MagicMock
from pytest_mock import MockerFixture
from app.services import EmailService, UserService

def test_send_email(mocker: MockerFixture) -> None:
    """Test email sending with mocked SMTP."""
    mock_smtp = mocker.patch('smtplib.SMTP')
    mock_instance = mock_smtp.return_value

    EmailService.send_welcome_email("user@example.com", "User Name")

    mock_smtp.assert_called_once()
    mock_instance.sendmail.assert_called_once()

def test_external_api_call(mocker: MockerFixture) -> None:
    """Test external API call with mocked requests."""
    mock_response = Mock()
    mock_response.json.return_value = {"status": "success"}
    mock_response.status_code = 200

    mocker.patch('requests.get', return_value=mock_response)

    from app.services import ExternalAPIService
    result = ExternalAPIService.fetch_data("https://api.example.com/data")

    assert result["status"] == "success"

@pytest.fixture
def mock_db_session(mocker: MockerFixture) -> MagicMock:
    """Mock database session."""
    mock_session = mocker.MagicMock()
    mock_session.query.return_value.filter.return_value.first.return_value = None
    return mock_session

def test_user_service_with_mock_db(mock_db_session: MagicMock) -> None:
    """Test user service with mocked database."""
    user_service = UserService(mock_db_session)
    user = user_service.get_user_by_id(1)

    mock_db_session.query.assert_called_once()
    assert user is None
```

## Async Python with asyncio

### Async Functions and await

Use async/await for I/O-bound operations like database queries, HTTP requests, file I/O.

**✅ Good - Async patterns:**
```python
import asyncio
from typing import List, Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Async database setup
async_engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
async_session = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

async def get_user_async(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user asynchronously."""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()

async def fetch_external_data(url: str) -> dict:
    """Fetch data from external API asynchronously."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()

async def process_multiple_users(user_ids: List[int]) -> List[User]:
    """Process multiple users concurrently."""
    async with async_session() as db:
        tasks = [get_user_async(db, user_id) for user_id in user_ids]
        users = await asyncio.gather(*tasks)
        return [user for user in users if user is not None]

async def fetch_multiple_apis(urls: List[str]) -> List[dict]:
    """Fetch from multiple APIs concurrently."""
    tasks = [fetch_external_data(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle exceptions
    successful_results = []
    for result in results:
        if isinstance(result, Exception):
            print(f"Error: {result}")
        else:
            successful_results.append(result)

    return successful_results

# Async context manager
class AsyncDatabaseConnection:
    """Async database connection context manager."""

    async def __aenter__(self) -> AsyncSession:
        """Enter async context."""
        self.session = async_session()
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Exit async context."""
        await self.session.close()

async def use_async_context_manager() -> None:
    """Use async context manager."""
    async with AsyncDatabaseConnection() as db:
        user = await get_user_async(db, 1)
        print(user)

# Async generator
async def async_user_generator(db: AsyncSession) -> AsyncGenerator[User, None]:
    """Generate users asynchronously."""
    result = await db.execute(select(User))
    for user in result.scalars():
        await asyncio.sleep(0.1)  # Simulate processing
        yield user

async def process_users_with_generator() -> None:
    """Process users with async generator."""
    async with async_session() as db:
        async for user in async_user_generator(db):
            print(f"Processing {user.name}")

# Run async code
if __name__ == "__main__":
    asyncio.run(process_multiple_users([1, 2, 3, 4, 5]))
```

**🔴 Bad - Blocking async code:**
```python
import time

# Don't use blocking I/O in async functions
async def bad_async_function():
    time.sleep(5)  # Blocks entire event loop!
    return "done"

# Don't mix sync and async incorrectly
async def bad_database_call():
    # Using synchronous SQLAlchemy in async function
    result = db.query(User).all()  # Blocks event loop
    return result

# Don't forget await
async def missing_await():
    user = get_user_async(db, 1)  # Returns coroutine, not User!
    print(user.name)  # Error: coroutine has no attribute 'name'

    # Should be:
    # user = await get_user_async(db, 1)
```

## Security Patterns

### Input Validation and Sanitization

Always validate and sanitize user input. Never trust external data.

**✅ Good - Input validation:**
```python
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
import re

class UserInput(BaseModel):
    """Validated user input."""
    email: EmailStr  # Automatic email validation
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=18, le=120)
    phone: Optional[str] = None

    @validator('name')
    def validate_name(cls, v: str) -> str:
        """Validate name contains only letters and spaces."""
        if not re.match(r'^[a-zA-Z\s]+$', v):
            raise ValueError('Name must contain only letters and spaces')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number format."""
        if v is None:
            return v

        # Remove all non-digit characters
        digits = re.sub(r'\D', '', v)

        if len(digits) < 10 or len(digits) > 15:
            raise ValueError('Phone number must be between 10-15 digits')

        return digits

# SQL injection prevention with parameterized queries
def get_user_safe(db: Session, email: str) -> Optional[User]:
    """Safe database query with parameterized statement."""
    return db.query(User).filter(User.email == email).first()

def search_users_safe(db: Session, search_term: str) -> List[User]:
    """Safe search with parameterized query."""
    # SQLAlchemy automatically parameterizes this
    return db.query(User).filter(
        User.name.ilike(f"%{search_term}%")
    ).all()
```

**🔴 Bad - SQL injection vulnerability:**
```python
# NEVER construct SQL queries with string interpolation
def get_user_unsafe(db, email):
    # SQL INJECTION VULNERABILITY!
    query = f"SELECT * FROM users WHERE email = '{email}'"
    result = db.execute(query)
    # Attacker can input: "' OR '1'='1" to bypass authentication
    return result.fetchone()

def search_users_unsafe(db, search_term):
    # SQL INJECTION VULNERABILITY!
    query = f"SELECT * FROM users WHERE name LIKE '%{search_term}%'"
    return db.execute(query).fetchall()

# No input validation
def create_user_unsafe(name, email, age):
    # No validation - accepts any input
    user = User(name=name, email=email, age=age)
    db.add(user)
    db.commit()
```

### Password Hashing and Authentication

Always hash passwords with bcrypt or argon2. Never store plaintext passwords.

**✅ Good - Password security:**
```python
from passlib.context import CryptContext
from typing import Optional
import secrets

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)

def generate_secure_token(length: int = 32) -> str:
    """Generate cryptographically secure random token."""
    return secrets.token_urlsafe(length)

class AuthService:
    """Authentication service."""

    @staticmethod
    def create_user(db: Session, email: str, password: str) -> User:
        """Create user with hashed password."""
        password_hash = hash_password(password)
        user = User(email=email, password_hash=password_hash)
        db.add(user)
        db.commit()
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    @staticmethod
    def create_reset_token(user: User) -> str:
        """Create password reset token."""
        token = generate_secure_token()
        # Store token in database with expiration
        user.reset_token = hash_password(token)
        user.reset_token_expires = datetime.now() + timedelta(hours=1)
        return token
```

**🔴 Bad - Insecure password handling:**
```python
# NEVER store passwords in plaintext
def create_user_insecure(db, email, password):
    user = User(email=email, password=password)  # Plaintext password!
    db.add(user)
    db.commit()

# NEVER use weak hashing
import hashlib
def hash_password_weak(password):
    return hashlib.md5(password.encode()).hexdigest()  # MD5 is broken!

# NEVER compare passwords without timing-attack protection
def verify_password_insecure(password, stored_password):
    return password == stored_password  # Timing attack vulnerability
```

### Environment Variables and Secrets Management

Store secrets in environment variables, never in code.

**✅ Good - Secrets management:**
```python
import os
from typing import Optional
from pydantic import BaseSettings, PostgresDsn, validator

class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Database
    DATABASE_URL: PostgresDsn

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # External APIs
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    SENDGRID_API_KEY: str

    # Application
    APP_NAME: str = "My App"
    DEBUG: bool = False
    ALLOWED_HOSTS: str = "*"

    @validator('DATABASE_URL', pre=True)
    def validate_database_url(cls, v: Optional[str]) -> str:
        """Validate database URL is provided."""
        if not v:
            raise ValueError("DATABASE_URL must be set")
        return v

    class Config:
        """Pydantic config."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Load settings once at startup
settings = Settings()

# Usage
def get_database_connection():
    """Get database connection using settings."""
    return create_engine(settings.DATABASE_URL)

# .env file (never commit this!)
"""
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=super-secret-key-change-in-production
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SENDGRID_API_KEY=SG.example_key
DEBUG=false
"""
```

**🔴 Bad - Hardcoded secrets:**
```python
# NEVER hardcode secrets in code
DATABASE_URL = "postgresql://user:password123@localhost:5432/mydb"
SECRET_KEY = "my-secret-key"  # Exposed in version control!
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"  # Committed to git!

# NEVER log secrets
def connect_database():
    print(f"Connecting to: {DATABASE_URL}")  # Leaks credentials in logs!
    return create_engine(DATABASE_URL)
```

## Performance Patterns

### List Comprehensions and Generator Expressions

Use comprehensions for concise, fast iteration. Use generators for memory efficiency.

**✅ Good - Comprehensions and generators:**
```python
from typing import List, Generator, Iterator

# List comprehension - fast and readable
numbers: List[int] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares: List[int] = [n ** 2 for n in numbers]
even_squares: List[int] = [n ** 2 for n in numbers if n % 2 == 0]

# Dict comprehension
user_ids = [1, 2, 3, 4, 5]
users_dict = {user_id: f"User {user_id}" for user_id in user_ids}

# Set comprehension
unique_squares = {n ** 2 for n in numbers}

# Generator expression - memory efficient for large datasets
squares_gen: Generator[int, None, None] = (n ** 2 for n in numbers)

def process_large_file(filepath: str) -> Generator[str, None, None]:
    """Process large file line by line (memory efficient)."""
    with open(filepath) as f:
        for line in f:
            # Process line without loading entire file into memory
            yield line.strip().upper()

# Use generators for large datasets
def get_all_users_generator(db: Session) -> Generator[User, None, None]:
    """Get all users efficiently with generator."""
    offset = 0
    batch_size = 1000

    while True:
        users = db.query(User).offset(offset).limit(batch_size).all()
        if not users:
            break

        for user in users:
            yield user

        offset += batch_size

# Process users without loading all into memory
for user in get_all_users_generator(db):
    process_user(user)
```

**🔴 Bad - Inefficient iteration:**
```python
# Don't use loops when comprehensions work
squares = []
for n in numbers:
    squares.append(n ** 2)  # Use list comprehension instead

# Don't load large datasets into memory
def get_all_users_bad(db):
    return db.query(User).all()  # Loads millions of records into memory!

users = get_all_users_bad(db)  # Out of memory error
for user in users:
    process_user(user)
```

### Caching Strategies

Use caching for expensive computations and frequently accessed data.

**✅ Good - Caching patterns:**
```python
from functools import lru_cache, cached_property
from typing import List, Dict
import time

# LRU cache for pure functions
@lru_cache(maxsize=128)
def fibonacci(n: int) -> int:
    """Calculate Fibonacci number with caching."""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

@lru_cache(maxsize=1024)
def fetch_user_data(user_id: int) -> Dict:
    """Fetch user data with caching."""
    # Expensive database or API call
    time.sleep(1)
    return {'id': user_id, 'name': f'User {user_id}'}

# Cached property for expensive class computations
class DataAnalyzer:
    """Data analyzer with cached properties."""

    def __init__(self, data: List[float]) -> None:
        self.data = data

    @cached_property
    def mean(self) -> float:
        """Calculate mean (cached after first access)."""
        return sum(self.data) / len(self.data)

    @cached_property
    def variance(self) -> float:
        """Calculate variance (cached after first access)."""
        mean_val = self.mean  # Uses cached mean
        return sum((x - mean_val) ** 2 for x in self.data) / len(self.data)

    @cached_property
    def std_dev(self) -> float:
        """Calculate standard deviation (cached)."""
        return self.variance ** 0.5

# Manual caching with dictionaries
class UserCache:
    """Simple user cache."""

    def __init__(self) -> None:
        self._cache: Dict[int, User] = {}

    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """Get user with caching."""
        if user_id not in self._cache:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                self._cache[user_id] = user
        return self._cache.get(user_id)

    def invalidate(self, user_id: int) -> None:
        """Invalidate cache entry."""
        self._cache.pop(user_id, None)
```

### Database Query Optimization

Optimize queries with proper indexing, batching, and connection pooling.

**✅ Good - Query optimization:**
```python
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List

# Use indexes (defined in model)
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)  # Index for fast lookups
    created_at = Column(DateTime, index=True)  # Index for sorting/filtering

    __table_args__ = (
        Index('idx_email_created', 'email', 'created_at'),  # Composite index
    )

# Efficient queries with eager loading
def get_users_with_posts_efficient(db: Session) -> List[User]:
    """Get users with posts (no N+1 queries)."""
    return db.query(User).options(
        selectinload(User.posts)
    ).all()

# Pagination for large result sets
def get_users_paginated(
    db: Session,
    page: int = 1,
    per_page: int = 50
) -> List[User]:
    """Get users with pagination."""
    offset = (page - 1) * per_page
    return db.query(User).offset(offset).limit(per_page).all()

# Bulk operations
def create_users_bulk(db: Session, users_data: List[dict]) -> None:
    """Create users in bulk efficiently."""
    users = [User(**data) for data in users_data]
    db.bulk_save_objects(users)
    db.commit()

# Aggregation queries
def get_post_counts_by_user(db: Session) -> List[tuple]:
    """Get post counts per user efficiently."""
    return db.query(
        User.id,
        User.name,
        func.count(Post.id).label('post_count')
    ).join(Post).group_by(User.id, User.name).all()

# Connection pooling (in database setup)
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # Number of connections to maintain
    max_overflow=10,       # Additional connections when pool is full
    pool_pre_ping=True,    # Verify connections before using
    pool_recycle=3600      # Recycle connections after 1 hour
)
```

## Error Handling and Logging

### Exception Handling Patterns

Use specific exceptions and proper error handling.

**✅ Good - Exception handling:**
```python
from typing import Optional
import logging
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom exceptions
class UserNotFoundError(Exception):
    """User not found exception."""
    pass

class InvalidCredentialsError(Exception):
    """Invalid credentials exception."""
    pass

class UserService:
    """User service with proper error handling."""

    @staticmethod
    def get_user(db: Session, user_id: int) -> User:
        """Get user by ID or raise exception."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise UserNotFoundError(f"User with ID {user_id} not found")
        return user

    @staticmethod
    def create_user(db: Session, email: str, name: str) -> Optional[User]:
        """Create user with error handling."""
        try:
            user = User(email=email, name=name)
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created user: {user.email}")
            return user

        except IntegrityError as e:
            db.rollback()
            logger.error(f"User with email {email} already exists")
            return None

        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error creating user: {str(e)}")
            raise

        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error creating user: {str(e)}")
            raise

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """Authenticate user or raise exception."""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning(f"Login attempt for non-existent user: {email}")
            raise InvalidCredentialsError("Invalid email or password")

        if not verify_password(password, user.password_hash):
            logger.warning(f"Failed login attempt for user: {email}")
            raise InvalidCredentialsError("Invalid email or password")

        logger.info(f"User authenticated: {email}")
        return user

# Context manager for error handling
from contextlib import contextmanager

@contextmanager
def database_transaction(db: Session):
    """Database transaction context manager."""
    try:
        yield db
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database transaction failed: {str(e)}")
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error in transaction: {str(e)}")
        raise

# Usage
with database_transaction(db) as session:
    user = User(email="test@example.com", name="Test")
    session.add(user)
```

**🔴 Bad - Poor error handling:**
```python
# Don't use bare except
try:
    user = db.query(User).filter(User.id == user_id).first()
except:  # Catches everything, including KeyboardInterrupt!
    pass

# Don't silently swallow errors
try:
    create_user(db, email, name)
except Exception:
    pass  # Error lost forever

# Don't log without context
try:
    process_payment(order)
except Exception as e:
    print("Error")  # What error? Where? When?

# Don't return None for errors that should raise
def get_user(user_id):
    try:
        return db.query(User).filter(User.id == user_id).first()
    except:
        return None  # Hides the real error
```

## Anti-Patterns to Avoid

### Avoid Mutable Default Arguments

Never use mutable objects as default arguments.

**🔴 Bad - Mutable default argument:**
```python
def add_item(item: str, items: List[str] = []) -> List[str]:
    """BROKEN: Default list is shared across all calls!"""
    items.append(item)
    return items

result1 = add_item("apple")  # ['apple']
result2 = add_item("banana")  # ['apple', 'banana'] - unexpected!
```

**✅ Good - None default:**
```python
def add_item(item: str, items: Optional[List[str]] = None) -> List[str]:
    """Correct: Create new list if None."""
    if items is None:
        items = []
    items.append(item)
    return items

result1 = add_item("apple")  # ['apple']
result2 = add_item("banana")  # ['banana'] - correct!
```

### Avoid Global State

Minimize global variables. Use dependency injection instead.

**🔴 Bad - Global state:**
```python
# Global database connection - bad!
db_connection = create_connection()

def get_user(user_id):
    return db_connection.query(User).filter(User.id == user_id).first()
```

**✅ Good - Dependency injection:**
```python
def get_user(db: Session, user_id: int) -> Optional[User]:
    """Pass dependencies as parameters."""
    return db.query(User).filter(User.id == user_id).first()
```

### Avoid Import *

Never use wildcard imports.

**🔴 Bad - Wildcard imports:**
```python
from models import *  # What did we import?
from utils import *   # Namespace pollution!
```

**✅ Good - Explicit imports:**
```python
from models import User, Post, Comment
from utils import hash_password, verify_password
```

## References & Resources

### Official Documentation
- [Python Documentation](https://docs.python.org/3/) - Official Python docs
- [PEP 8](https://pep.python.org/pep-0008/) - Style Guide for Python Code
- [PEP 484](https://pep.python.org/pep-0484/) - Type Hints
- [PEP 20](https://pep.python.org/pep-0020/) - The Zen of Python

### Type Hints & Validation
- [mypy Documentation](https://mypy.readthedocs.io/) - Static type checker
- [Pydantic Documentation](https://docs.pydantic.dev/) - Data validation

### Web Frameworks
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - Modern async API framework
- [Flask Documentation](https://flask.palletsprojects.com/) - Lightweight web framework
- [Django Documentation](https://docs.djangoproject.com/) - Full-featured web framework

### Database & ORM
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/) - SQL toolkit and ORM
- [Alembic Documentation](https://alembic.sqlalchemy.org/) - Database migrations

### Testing
- [pytest Documentation](https://docs.pytest.org/) - Testing framework
- [pytest-mock Documentation](https://pytest-mock.readthedocs.io/) - Mocking plugin

### Async Programming
- [asyncio Documentation](https://docs.python.org/3/library/asyncio.html) - Async I/O
- [httpx Documentation](https://www.python-httpx.org/) - Async HTTP client

### Security
- [passlib Documentation](https://passlib.readthedocs.io/) - Password hashing
- [OWASP Python Security](https://owasp.org/www-project-python-security/) - Security best practices

### Code Quality Tools
- [Black](https://black.readthedocs.io/) - Code formatter
- [flake8](https://flake8.pycqa.org/) - Style guide enforcement
- [pylint](https://pylint.pycqa.org/) - Code analysis
- [isort](https://pycqa.github.io/isort/) - Import sorting
