# Pattern Documentation Template

This template provides a comprehensive, standardized format for documenting reusable patterns discovered during development. Use this template to capture knowledge that compounds value by making future work easier.

## When to Use This Template

Document a pattern when it meets at least one of these criteria:

- **Reusability**: Code that could be used in 2+ future features
- **Problem-Solution**: A non-obvious solution to a challenge others will face
- **Integration Knowledge**: Working configuration or integration with external tools
- **Architecture Decision**: Design choice with meaningful trade-offs
- **Performance Optimization**: Measurable improvement in speed or memory
- **Security Pattern**: Security implementation worth replicating

**DON'T document**:
- ❌ Code highly specific to a single feature
- ❌ Obvious patterns already well-documented
- ❌ Simple one-liners with no complexity
- ❌ Patterns that may change soon

## Where to Document Patterns

Choose the appropriate location based on pattern scope:

### 1. `.agent-os/CLAUDE.md` - Project-Specific Patterns
**Use for**:
- Codebase conventions and patterns
- Framework configuration and setup
- Common utilities and where to find them
- Integration approaches with existing code

**Example**: "How to add a new API endpoint in this codebase"

### 2. `.agent-os/standards/` - General Standards
**Use for**:
- `best-practices.md` - Development principles
- `code-style.md` - Formatting and naming
- `tech-stack.md` - Technology choices and rationale
- `code-style/[language].md` - Language-specific patterns

**Example**: "Service object pattern for business logic"

### 3. `docs/patterns/` - Detailed Pattern Documentation
**Use for**:
- Complex patterns needing examples
- Multi-file implementations
- Step-by-step guides
- Architecture decision records (ADRs)

**Example**: "Implementing optimistic updates across the application"

### 4. Code Comments - Inline Documentation
**Use for**:
- Non-obvious implementation details
- Performance considerations
- Security considerations
- Links to pattern documentation

**Example**: "// See docs/patterns/caching-strategy.md for details"

---

## Pattern Documentation Format

Copy and customize this template for each pattern:

```markdown
## Pattern: [Pattern Name]

### Category
[Choose one: Reusable Component | Problem-Solution | Framework Integration | Architecture Decision | Performance Optimization | Security Pattern]

### When to Use
[Describe the situations where this pattern applies. Be specific about the conditions that make this pattern appropriate.]

**Examples**:
- When you need to...
- In situations where...
- If you're building...

### Problem It Solves
[Explain the specific challenge or pain point this pattern addresses. What goes wrong without this pattern?]

**Without this pattern**:
- [Consequence 1]
- [Consequence 2]

**With this pattern**:
- [Benefit 1]
- [Benefit 2]

### Implementation Example

**File Reference**: `path/to/file.ext:15-30`

```[language]
# Actual code example from implementation
# Include enough context to understand the pattern
class ExampleImplementation
  def pattern_method
    # Core pattern implementation
    # Show the key parts clearly
  end
end
```

**Key Points**:
- [Highlight the critical aspects of the implementation]
- [Explain non-obvious choices]
- [Note important details]

### Step-by-Step Guide

If the pattern requires multiple steps, provide a clear implementation guide:

1. **Step 1**: [First action]
   ```[language]
   # Code example for step 1
   ```

2. **Step 2**: [Second action]
   ```[language]
   # Code example for step 2
   ```

3. **Step 3**: [Third action]
   ```[language]
   # Code example for step 3
   ```

### Configuration

If the pattern requires configuration, document it clearly:

```[config-format]
# Configuration example
setting_name: value
another_setting: value
```

**Configuration options**:
- `setting_name`: [Description and when to use]
- `another_setting`: [Description and when to use]

### Benefits

Explain why this pattern compounds value:

- **[Benefit 1 Name]**: [How it makes future work easier]
- **[Benefit 2 Name]**: [How it improves code quality]
- **[Benefit 3 Name]**: [How it enhances maintainability]
- **[Benefit 4 Name]**: [How it speeds up development]

### Trade-offs

Be honest about limitations and considerations:

**Advantages**:
- ✅ [Pro 1]
- ✅ [Pro 2]

**Disadvantages**:
- ⚠️ [Con 1]
- ⚠️ [Con 2]

**When NOT to use**:
- [Situation 1 where this pattern is inappropriate]
- [Situation 2 where a different approach is better]

### Testing Strategy

How to test code using this pattern:

```[language]
# Test example
describe 'PatternImplementation' do
  it 'demonstrates pattern behavior' do
    # Test code
  end
end
```

**Testing considerations**:
- [What to test]
- [Edge cases to cover]
- [Common testing pitfalls]

### Related Patterns

Link to similar or complementary patterns:

- **[Related Pattern 1]**: [Brief description and relationship]
  - Location: `path/to/pattern-doc.md`
  - When to choose this instead: [Criteria]

- **[Related Pattern 2]**: [Brief description and relationship]
  - Location: `path/to/pattern-doc.md`
  - Use together: [How they complement each other]

### Common Mistakes

Document pitfalls to avoid:

❌ **Mistake 1**: [What people do wrong]
- **Why it fails**: [Explanation]
- **Correct approach**: [How to do it right]

❌ **Mistake 2**: [Another common error]
- **Why it fails**: [Explanation]
- **Correct approach**: [How to do it right]

### Performance Considerations

If relevant, document performance implications:

**Performance characteristics**:
- Time complexity: O(?)
- Space complexity: O(?)
- Scalability: [How it scales with data]

**Optimizations**:
- [Optimization 1 and when to apply it]
- [Optimization 2 and when to apply it]

### Security Considerations

If relevant, document security implications:

**Security benefits**:
- ✅ [Security improvement 1]
- ✅ [Security improvement 2]

**Security risks to mitigate**:
- ⚠️ [Risk 1 and how to address it]
- ⚠️ [Risk 2 and how to address it]

### Dependencies

List any dependencies this pattern requires:

**Required libraries/gems**:
- `library-name` (version X.Y.Z+): [Purpose]
- `another-library` (version A.B.C+): [Purpose]

**Configuration requirements**:
- [Environment variable or config needed]
- [Service or external dependency]

### Version History

Track evolution of this pattern:

- **v1.0** (YYYY-MM-DD): Initial implementation
  - Task: `task-id-1`
  - Implemented in: `file1.ext`, `file2.ext`

- **v1.1** (YYYY-MM-DD): [Enhancement description]
  - Task: `task-id-2`
  - Changes: [What changed and why]

### Used In

Track where this pattern is currently used:

**Features using this pattern**:
- [Feature 1 name] - `path/to/implementation1.ext:20`
- [Feature 2 name] - `path/to/implementation2.ext:45`

**Task IDs where implemented**:
- `task-id-1`: [Description]
- `task-id-2`: [Description]

### References

Links to external documentation or resources:

- [Official documentation link]
- [Blog post or article explaining the pattern]
- [Related GitHub issue or PR]
- [Stack Overflow discussion]

### Maintainer Notes

Additional context for maintainers:

**Known issues**:
- [Issue 1 and status]
- [Issue 2 and status]

**Future improvements**:
- [Potential improvement 1]
- [Potential improvement 2]

**Last reviewed**: YYYY-MM-DD by [Reviewer]
```

---

## Pattern Types and Examples

### 1. Reusable Components

**What to document**: Code that could be used in 2+ future features

**Examples**:
- Utility functions (validation, formatting, parsing)
- Service classes (email sending, file processing, API clients)
- React components (forms, displays, layouts)
- Database query patterns (complex joins, optimized queries)
- Middleware/decorators (auth, logging, caching)

**Template focus**: Implementation example, usage scenarios, API documentation

### 2. Problem-Solution Pairs

**What to document**: Challenges solved that others will face

**Examples**:
- "How to handle large file uploads without blocking"
- "How to implement secure password reset flow"
- "How to optimize slow N+1 queries"
- "How to test async operations reliably"

**Template focus**: Problem description, solution approach, before/after comparison

### 3. Framework/Library Integration

**What to document**: Working with external tools

**Examples**:
- "How to configure Stripe webhooks in Rails"
- "How to set up React Query with authentication"
- "How to use Playwright for visual regression testing"
- Include version numbers and gotchas

**Template focus**: Configuration, dependencies, version compatibility, common issues

### 4. Architecture Decisions

**What to document**: Design choices with trade-offs

**Examples**:
- "Why we chose PostgreSQL JSON over separate table"
- "Why we use optimistic updates for better UX"
- "Why we batch notifications instead of real-time"
- Document alternatives considered and reasoning

**Template focus**: Decision rationale, alternatives considered, trade-offs, constraints

### 5. Performance Optimizations

**What to document**: Speed/memory improvements

**Examples**:
- Database indexing strategies
- Caching layer implementations
- Query optimization techniques
- Frontend bundle size reductions

**Template focus**: Metrics (before/after), approach, measurement methodology, profiling

### 6. Security Patterns

**What to document**: Security implementations

**Examples**:
- Input sanitization approaches
- Authentication flow implementations
- CSRF protection strategies
- Rate limiting configurations

**Template focus**: Threat model, mitigation approach, testing strategy, compliance

---

## Pattern Documentation Workflow

### During Implementation (Step 2)
- ✅ Note patterns as you create them
- ✅ Mark reusable components with TODOs
- ✅ Keep track of learnings and challenges solved
- ✅ Take before/after screenshots or metrics

### Before Task Completion (Step 4)
- ✅ Review implementation for reusable patterns
- ✅ Decide which patterns are worth documenting (see criteria above)
- ✅ Write pattern documentation in appropriate location
- ✅ Update relevant files (CLAUDE.md, standards/, docs/)

### Verification (Step 4)
- ✅ Confirm pattern documentation exists
- ✅ Verify code examples are accurate and include references
- ✅ Check that future value is explicitly stated
- ✅ Ensure integration with existing documentation

### Task Completion Checklist
- [ ] Reviewed implementation for reusable patterns
- [ ] Identified 0+ patterns worth documenting
- [ ] Documented patterns in appropriate locations
- [ ] Included code examples with file:line references
- [ ] Stated future value and use cases explicitly
- [ ] Updated CLAUDE.md or standards/ as needed

---

## Quick Start Guide

### 1. Identify a Pattern Worth Documenting

Ask yourself:
- Will this be useful in 2+ future features?
- Does this solve a non-obvious problem?
- Is this configuration/integration tricky to get right?
- Is this a design choice with meaningful trade-offs?

### 2. Choose the Right Location

- **Project-specific?** → `.agent-os/CLAUDE.md`
- **General standard?** → `.agent-os/standards/`
- **Complex multi-file pattern?** → `docs/patterns/`
- **Simple implementation detail?** → Code comments

### 3. Copy the Template

```bash
# For detailed patterns
cp templates/pattern-documentation-template.md docs/patterns/my-pattern.md

# For simple patterns, use the inline format in CLAUDE.md or standards/
```

### 4. Fill in the Sections

Focus on these critical sections:
- **When to Use**: Be specific about conditions
- **Problem It Solves**: Explain the "why"
- **Implementation Example**: Include working code with file references
- **Benefits**: Explain how it compounds value
- **Trade-offs**: Be honest about limitations

### 5. Link from Other Documentation

Add references to your pattern from:
- `.agent-os/CLAUDE.md` (project patterns section)
- Relevant standards files
- Code comments pointing to the pattern
- Related pattern documentation

---

## Tips for Great Pattern Documentation

### ✅ DO:
- **Use real code examples** from actual implementations
- **Include file:line references** so readers can see full context
- **Explain the "why"** not just the "what"
- **Document trade-offs honestly** - every pattern has limitations
- **Update patterns** when you improve them in future tasks
- **Link related patterns** to build a knowledge web
- **Include version numbers** for dependencies
- **Add metrics** for performance patterns (before/after)

### ❌ DON'T:
- **Don't document obvious patterns** - waste of time
- **Don't skip code examples** - they're the most valuable part
- **Don't forget file references** - readers need to see real usage
- **Don't oversell** - be realistic about benefits
- **Don't create orphan patterns** - link them into the documentation
- **Don't skip the "when NOT to use" section** - it's critical
- **Don't forget to update** - outdated patterns are worse than none

---

## Compounding Engineering Principle

**Each task should make future tasks easier through pattern documentation.**

Without pattern capture, knowledge is lost and work doesn't compound. With pattern documentation:

- **Future tasks reference patterns** instead of solving from scratch
- **Teams learn from past solutions** and avoid repeating mistakes
- **Codebase consistency improves** as patterns are reused
- **Development velocity increases** as the pattern library grows
- **Quality improves** as proven patterns replace ad-hoc solutions

**Pattern documentation is the key to compounding engineering success.**

---

## Example Pattern Documentation

Here's a complete example following the template:

```markdown
## Pattern: Service Object for Business Logic

### Category
Reusable Component

### When to Use
Use service objects when you need to encapsulate complex business logic that doesn't belong in models or controllers.

**Examples**:
- When business logic involves multiple models
- When an operation requires external API calls
- When logic is complex and deserves dedicated testing
- When you want to make controllers thin and focused

### Problem It Solves
Without service objects, business logic often ends up in controllers (fat controllers) or models (fat models), making code hard to test and maintain.

**Without this pattern**:
- Controllers become bloated with business logic
- Testing requires full request/response cycle
- Logic is harder to reuse across different contexts
- Models take on too many responsibilities

**With this pattern**:
- Business logic is isolated and testable
- Controllers remain thin and focused on HTTP concerns
- Service objects can be called from controllers, jobs, or other services
- Single Responsibility Principle is maintained

### Implementation Example

**File Reference**: `app/services/user_registration_service.rb:1-45`

```ruby
# app/services/user_registration_service.rb
class UserRegistrationService
  def initialize(user_params, invite_code: nil)
    @user_params = user_params
    @invite_code = invite_code
  end

  def call
    ActiveRecord::Base.transaction do
      @user = create_user
      apply_invite_code if @invite_code
      send_welcome_email
      track_registration_event

      Result.success(@user)
    end
  rescue StandardError => e
    Result.failure(error: e.message)
  end

  private

  def create_user
    User.create!(@user_params)
  end

  def apply_invite_code
    invite = Invite.find_by(code: @invite_code)
    invite&.apply_to(@user)
  end

  def send_welcome_email
    UserMailer.welcome(@user).deliver_later
  end

  def track_registration_event
    Analytics.track(
      user_id: @user.id,
      event: 'user_registered',
      properties: { invite_used: @invite_code.present? }
    )
  end
end
```

**Key Points**:
- Single public method `call` for execution
- Uses transaction to ensure atomicity
- Returns Result object for success/failure handling
- All business logic is private and focused

### Step-by-Step Guide

1. **Create the service file**:
   ```bash
   touch app/services/user_registration_service.rb
   ```

2. **Define the service class**:
   ```ruby
   class UserRegistrationService
     def initialize(params)
       @params = params
     end

     def call
       # Business logic here
     end
   end
   ```

3. **Add transaction safety**:
   ```ruby
   def call
     ActiveRecord::Base.transaction do
       # All operations here
     end
   rescue StandardError => e
     # Error handling
   end
   ```

4. **Call from controller**:
   ```ruby
   def create
     result = UserRegistrationService.new(user_params).call

     if result.success?
       redirect_to dashboard_path
     else
       flash[:error] = result.error
       render :new
     end
   end
   ```

### Benefits

- **Testability**: Service objects can be tested in isolation without Rails stack
- **Reusability**: Can be called from controllers, background jobs, rake tasks, console
- **Maintainability**: Business logic is in one place, easy to find and modify
- **Single Responsibility**: Each service does one thing well
- **Thin Controllers**: Controllers stay focused on HTTP request/response

### Trade-offs

**Advantages**:
- ✅ Isolated, testable business logic
- ✅ Easy to understand and maintain
- ✅ Reusable across contexts

**Disadvantages**:
- ⚠️ More files to navigate (but better organized)
- ⚠️ Can be overused for simple operations
- ⚠️ Requires discipline to avoid "god services"

**When NOT to use**:
- Simple CRUD operations (create, read, update, delete)
- Operations that only touch a single model
- Very simple logic (1-2 lines)

### Testing Strategy

```ruby
# spec/services/user_registration_service_spec.rb
RSpec.describe UserRegistrationService do
  describe '#call' do
    let(:user_params) { { email: 'test@example.com', password: 'password' } }
    let(:service) { described_class.new(user_params) }

    it 'creates a user' do
      expect { service.call }.to change(User, :count).by(1)
    end

    it 'sends welcome email' do
      expect(UserMailer).to receive(:welcome).and_return(double(deliver_later: true))
      service.call
    end

    it 'tracks registration event' do
      expect(Analytics).to receive(:track).with(hash_including(event: 'user_registered'))
      service.call
    end

    context 'with invite code' do
      let(:invite) { create(:invite) }
      let(:service) { described_class.new(user_params, invite_code: invite.code) }

      it 'applies invite code' do
        service.call
        expect(invite.reload).to be_used
      end
    end

    context 'when user creation fails' do
      before { allow(User).to receive(:create!).and_raise(ActiveRecord::RecordInvalid) }

      it 'returns failure result' do
        result = service.call
        expect(result).to be_failure
      end

      it 'does not send email' do
        expect(UserMailer).not_to receive(:welcome)
        service.call
      end
    end
  end
end
```

**Testing considerations**:
- Test happy path and error paths
- Mock external dependencies (email, analytics)
- Test transaction rollback on failures
- Test all side effects (emails, events, etc.)

### Related Patterns

- **Result Object Pattern**: Used for returning success/failure from services
  - Location: `docs/patterns/result-object.md`
  - Use together: Services should return Result objects

- **Form Object Pattern**: For complex parameter validation
  - Location: `docs/patterns/form-object.md`
  - When to choose this instead: When validation logic is complex

### Common Mistakes

❌ **Mistake 1**: Creating "god services" that do too much
- **Why it fails**: Hard to test, hard to maintain, violates SRP
- **Correct approach**: Break into multiple focused services

❌ **Mistake 2**: Using services for simple CRUD
- **Why it fails**: Unnecessary abstraction, makes code harder to follow
- **Correct approach**: Keep simple operations in controllers

❌ **Mistake 3**: Not handling errors properly
- **Why it fails**: Exceptions leak out, hard to handle in controllers
- **Correct approach**: Catch exceptions and return Result objects

### Dependencies

**Required gems**:
- None (uses standard Rails)

**Optional enhancements**:
- `dry-monads` (for Result object): Provides `Success()` and `Failure()` helpers

### Version History

- **v1.0** (2024-01-15): Initial implementation
  - Task: `user-auth-1`
  - Implemented in: `app/services/user_registration_service.rb`

### Used In

**Features using this pattern**:
- User Registration - `app/services/user_registration_service.rb:1`
- Password Reset - `app/services/password_reset_service.rb:1`
- Invoice Generation - `app/services/invoice_generation_service.rb:1`

**Task IDs where implemented**:
- `user-auth-1`: User registration flow
- `user-auth-3`: Password reset
- `billing-2`: Invoice generation

### References

- [Rails Service Objects: A Comprehensive Guide](https://www.toptal.com/ruby-on-rails/rails-service-objects-tutorial)
- [Thoughtbot: Skinny Controller, Fat Model](https://thoughtbot.com/blog/skinny-controller-fat-model)

### Maintainer Notes

**Known issues**:
- None

**Future improvements**:
- Consider adding dry-monads for better Result handling
- Add standardized logging across all services

**Last reviewed**: 2024-01-15
```

---

## Template Maintenance

This template should evolve based on usage:

- **Add new sections** when patterns consistently need them
- **Remove sections** that are rarely used
- **Update examples** to reflect current best practices
- **Incorporate feedback** from pattern documentation users

**Last updated**: 2025-10-26 (v1.0)
**Maintained by**: Agent OS Framework
