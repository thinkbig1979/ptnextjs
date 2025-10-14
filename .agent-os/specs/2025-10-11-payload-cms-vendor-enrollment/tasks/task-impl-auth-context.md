# Task: impl-auth-context - Implement Authentication Context Provider

## Task Metadata
- **Task ID**: impl-auth-context
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: [test-frontend]
- **Status**: [x] ✅ COMPLETE

## Task Description
Create AuthContext using React Context API to manage global authentication state including user, role, tier, and authentication actions (login, logout, refresh).

## Specifics
- **File to Create**: `/home/edwin/development/ptnextjs/lib/context/AuthContext.tsx`
- **State Shape**:
  ```typescript
  {
    user: User | null
    isAuthenticated: boolean
    role: 'admin' | 'vendor' | null
    tier: 'free' | 'tier1' | 'tier2' | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
  }
  ```
- **Actions**:
  - `login(email, password)` - Calls POST /api/auth/login, stores token, updates user state
  - `logout()` - Clears token, resets user state, redirects to login
  - `refreshUser()` - Fetches current user data, updates state
- **Key Requirements**:
  - Token stored in httpOnly cookie (set by API)
  - Automatic token validation on mount
  - Redirect to login on 401 errors
  - Persist authentication across page reloads
  - Provide `useAuth()` hook for components

## Acceptance Criteria
- [x] AuthContext created with all state fields and actions
- [x] useAuth() hook exported for component consumption
- [x] login() action calls API and updates state on success
- [x] logout() action clears state and redirects
- [x] refreshUser() action updates user data
- [x] Token validation on mount (check if user logged in)
- [x] 401 errors automatically trigger logout and redirect
- [x] Context wrapped around app in root layout

## Testing Requirements
- Unit tests: login success/failure, logout, refreshUser, token validation
- Integration tests: Context provider with child components, useAuth() hook usage

## Related Files
- Technical Spec: State Management section
