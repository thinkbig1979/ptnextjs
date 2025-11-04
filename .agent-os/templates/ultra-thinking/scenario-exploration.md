# Scenario Exploration Checklist Template

## Overview

This template provides a systematic framework for exploring edge cases, failure scenarios, scale challenges, and unexpected situations that could impact a feature or system.

## Purpose

Scenario exploration ensures that:
- Edge cases are identified and handled before they cause production issues
- Failure modes are understood and mitigated
- Scale challenges are anticipated and addressed
- Unexpected user behaviors are considered
- System resilience is built in from the start

## Scenario Categories

### 1. Edge Cases & Boundary Conditions 🎯

**Purpose**: Identify and handle unusual but valid inputs and states

<exploration_checklist>
  **Input Boundaries**:
  - [ ] What happens with empty input?
  - [ ] What happens with maximum length/size input?
  - [ ] What happens with zero or negative numbers?
  - [ ] What happens with special characters or unicode?
  - [ ] What happens with null or undefined values?
  - [ ] What happens with malformed data?

  **State Boundaries**:
  - [ ] What happens when a resource is newly created (no history)?
  - [ ] What happens when a resource is being deleted?
  - [ ] What happens in partially completed states?
  - [ ] What happens during state transitions?
  - [ ] What happens with stale or expired data?

  **Time Boundaries**:
  - [ ] What happens at midnight or timezone boundaries?
  - [ ] What happens during daylight saving time transitions?
  - [ ] What happens with expired sessions or tokens?
  - [ ] What happens with future dates or invalid date ranges?
  - [ ] What happens with very old historical data?

  **Concurrent Scenarios**:
  - [ ] What happens when two users modify the same resource simultaneously?
  - [ ] What happens during parallel requests to the same endpoint?
  - [ ] What happens with race conditions?
  - [ ] What happens with concurrent transactions?

  **Data Validation**:
  - [ ] What format validation rules exist?
  - [ ] What business rule validations are enforced?
  - [ ] What cross-field validations are needed?
  - [ ] How are validation errors communicated?
</exploration_checklist>

### 2. Failure Scenarios & Error Handling ❌

**Purpose**: Understand and handle all the ways things can go wrong

<exploration_checklist>
  **Infrastructure Failures**:
  - [ ] What happens when the database is unavailable?
  - [ ] What happens when external APIs are down?
  - [ ] What happens when network connectivity is lost?
  - [ ] What happens when disk space is full?
  - [ ] What happens when memory is exhausted?
  - [ ] What happens during deployment or server restarts?

  **Data Failures**:
  - [ ] What happens when data is corrupted?
  - [ ] What happens when foreign key constraints fail?
  - [ ] What happens when unique constraints are violated?
  - [ ] What happens when required data is missing?
  - [ ] What happens when data migrations fail mid-way?

  **Dependency Failures**:
  - [ ] What happens when payment gateway fails?
  - [ ] What happens when email service is down?
  - [ ] What happens when authentication provider is unavailable?
  - [ ] What happens when CDN or asset delivery fails?
  - [ ] What happens when third-party services timeout?

  **Transaction Failures**:
  - [ ] What happens when a transaction is rolled back?
  - [ ] What happens when partial data is committed?
  - [ ] What happens when compensating transactions are needed?
  - [ ] What happens with distributed transaction failures?

  **User Error Scenarios**:
  - [ ] What happens when users submit invalid forms repeatedly?
  - [ ] What happens when users navigate away mid-process?
  - [ ] What happens when users refresh during submissions?
  - [ ] What happens when users click submit multiple times?
  - [ ] What happens when users bookmark mid-flow URLs?

  **Error Recovery**:
  - [ ] Can users retry failed operations?
  - [ ] Is data preserved during failures?
  - [ ] Are error messages helpful and actionable?
  - [ ] Can the system auto-recover?
  - [ ] Are failures logged for debugging?
</exploration_checklist>

### 3. Scale & Performance Scenarios 📈

**Purpose**: Ensure the system performs well under various load conditions

<exploration_checklist>
  **High Volume Scenarios**:
  - [ ] What happens with 10x current user count?
  - [ ] What happens with 100x current data volume?
  - [ ] What happens with 1000 concurrent requests?
  - [ ] What happens during traffic spikes (Black Friday, viral content)?
  - [ ] What happens when queues fill up?

  **Large Data Scenarios**:
  - [ ] What happens with a user who has 10,000+ records?
  - [ ] What happens with file uploads of maximum allowed size?
  - [ ] What happens with complex queries on millions of records?
  - [ ] What happens with pagination of huge result sets?
  - [ ] What happens with bulk operations on thousands of items?

  **Slow Network Scenarios**:
  - [ ] What happens on slow 3G connections?
  - [ ] What happens with high latency (500ms+ RTT)?
  - [ ] What happens with intermittent connectivity?
  - [ ] What happens with request timeouts?
  - [ ] Are there appropriate loading states?

  **Resource Constraints**:
  - [ ] What happens when CPU is maxed out?
  - [ ] What happens when memory is 90%+ utilized?
  - [ ] What happens when connection pools are exhausted?
  - [ ] What happens when rate limits are hit?
  - [ ] What happens with background job queue backlogs?

  **Growth Scenarios**:
  - [ ] How does this scale over time (6 months, 1 year, 3 years)?
  - [ ] What database indexes are needed for scale?
  - [ ] When do we need to shard or partition?
  - [ ] What caching strategies are needed?
  - [ ] What are the breaking points?
</exploration_checklist>

### 4. Security Attack Scenarios 🔐

**Purpose**: Think like an attacker to identify vulnerabilities

<exploration_checklist>
  **Injection Attacks**:
  - [ ] Can SQL injection be performed?
  - [ ] Can XSS attacks be executed?
  - [ ] Can command injection be performed?
  - [ ] Can LDAP or NoSQL injection occur?
  - [ ] Can template injection be exploited?

  **Authentication Attacks**:
  - [ ] Can authentication be bypassed?
  - [ ] Can brute force attacks succeed?
  - [ ] Can session tokens be stolen or forged?
  - [ ] Can password reset flows be abused?
  - [ ] Can multi-factor authentication be circumvented?

  **Authorization Attacks**:
  - [ ] Can users access unauthorized resources?
  - [ ] Can privilege escalation occur?
  - [ ] Can insecure direct object references be exploited?
  - [ ] Can horizontal access control be bypassed?
  - [ ] Can role/permission checks be avoided?

  **Data Attacks**:
  - [ ] Can sensitive data be exposed through errors?
  - [ ] Can data be exfiltrated through APIs?
  - [ ] Can mass assignment vulnerabilities be exploited?
  - [ ] Can data be manipulated without detection?
  - [ ] Can audit trails be bypassed or tampered with?

  **Denial of Service**:
  - [ ] Can the system be crashed with crafted input?
  - [ ] Can resource exhaustion be triggered?
  - [ ] Can algorithmic complexity be exploited?
  - [ ] Can rate limiting be bypassed?
  - [ ] Can the system be overwhelmed with requests?

  **Business Logic Attacks**:
  - [ ] Can workflows be manipulated out of order?
  - [ ] Can race conditions be exploited?
  - [ ] Can pricing or calculations be manipulated?
  - [ ] Can duplicate transactions be created?
  - [ ] Can referral or reward systems be gamed?
</exploration_checklist>

### 5. User Behavior Scenarios 👤

**Purpose**: Anticipate how users will actually interact with the system

<exploration_checklist>
  **Unexpected Usage Patterns**:
  - [ ] What if users use this feature differently than intended?
  - [ ] What if users automate interactions (bots, scripts)?
  - [ ] What if users share accounts or credentials?
  - [ ] What if users access from unexpected devices?
  - [ ] What if users use accessibility tools?

  **User Mistakes**:
  - [ ] What if users accidentally delete important data?
  - [ ] What if users misconfigure critical settings?
  - [ ] What if users submit the wrong information?
  - [ ] What if users don't understand the interface?
  - [ ] Can mistakes be easily undone?

  **Multi-Device Scenarios**:
  - [ ] What happens when users switch devices mid-flow?
  - [ ] What happens with simultaneous sessions on multiple devices?
  - [ ] What happens with different screen sizes?
  - [ ] What happens on mobile vs desktop?
  - [ ] What happens with old browsers or devices?

  **Localization & Internationalization**:
  - [ ] What happens in different timezones?
  - [ ] What happens with different date/time formats?
  - [ ] What happens with different number formats?
  - [ ] What happens with right-to-left languages?
  - [ ] What happens with very long translated text?

  **Power User Scenarios**:
  - [ ] What if users have thousands of items?
  - [ ] What if users use keyboard shortcuts extensively?
  - [ ] What if users want to bulk operations?
  - [ ] What if users want advanced filtering?
  - [ ] What if users want to export all their data?
</exploration_checklist>

### 6. Integration & Dependency Scenarios 🔗

**Purpose**: Ensure proper handling of external systems and dependencies

<exploration_checklist>
  **Third-Party Service Changes**:
  - [ ] What happens when API versions change?
  - [ ] What happens when API response formats change?
  - [ ] What happens when rate limits change?
  - [ ] What happens when service pricing changes?
  - [ ] What happens when services are deprecated?

  **Data Consistency Scenarios**:
  - [ ] What happens when data is out of sync between systems?
  - [ ] What happens during eventual consistency delays?
  - [ ] What happens when webhooks are missed or delayed?
  - [ ] What happens when caches are stale?
  - [ ] How is data reconciliation handled?

  **Migration Scenarios**:
  - [ ] What happens during data migrations?
  - [ ] What happens during version upgrades?
  - [ ] What happens with legacy data formats?
  - [ ] What happens when rolling back migrations?
  - [ ] How is backward compatibility maintained?

  **Cross-System Workflows**:
  - [ ] What happens when multi-step workflows span systems?
  - [ ] What happens when one system is updated but not others?
  - [ ] What happens with distributed transactions?
  - [ ] What happens when systems have different availability?
</exploration_checklist>

### 7. Operational Scenarios 🛠️

**Purpose**: Ensure smooth operation and maintenance in production

<exploration_checklist>
  **Deployment Scenarios**:
  - [ ] What happens during zero-downtime deployments?
  - [ ] What happens when rolling back to previous version?
  - [ ] What happens with database migration rollbacks?
  - [ ] What happens when deploy fails mid-way?
  - [ ] What happens with feature flags being toggled?

  **Monitoring & Debugging**:
  - [ ] How do we know if this is working correctly?
  - [ ] What metrics indicate problems?
  - [ ] How do we debug production issues?
  - [ ] What logging is available?
  - [ ] Can we trace requests end-to-end?

  **Maintenance Scenarios**:
  - [ ] What happens during database maintenance windows?
  - [ ] What happens during cache warming?
  - [ ] What happens during batch job execution?
  - [ ] What happens when cleaning up old data?
  - [ ] What happens when re-indexing search?

  **Configuration Changes**:
  - [ ] What happens when environment variables change?
  - [ ] What happens when feature flags are toggled?
  - [ ] What happens when configuration is reloaded?
  - [ ] What happens with bad configuration?
</exploration_checklist>

## Scenario Exploration Process

### 1. Systematic Exploration

<process>
  FOR each scenario category:
    1. **Review the checklist** for that category
    2. **Check each item** against your specification/implementation
    3. **Document findings** for uncovered scenarios
    4. **Assess risk** for each unhandled scenario
    5. **Prioritize scenarios** to address
    6. **Update specification** with handling approach
</process>

### 2. Risk Assessment Matrix

<risk_matrix>
  FOR each identified scenario:

  **Likelihood** (How likely is this to occur?)
    - Very Likely (Daily/Weekly)
    - Likely (Monthly/Quarterly)
    - Possible (Yearly)
    - Unlikely (Rarely)
    - Very Unlikely (Theoretical)

  **Impact** (What happens if this occurs?)
    - Critical (Data loss, security breach, system down)
    - High (Major functionality broken, significant user impact)
    - Medium (Degraded experience, workarounds available)
    - Low (Minor inconvenience, cosmetic issues)
    - Minimal (No significant impact)

  **Risk Level** = Likelihood × Impact

  Priority for handling:
    - Critical + Very Likely = P1 (Must handle)
    - High + Likely = P1 (Must handle)
    - Medium + Very Likely = P2 (Should handle)
    - High + Possible = P2 (Should handle)
    - All others = P3 (Nice to handle)
</risk_matrix>

### 3. Mitigation Strategies

<mitigation_approaches>
  **Prevention**: Design to prevent the scenario
    - Input validation
    - Proper error handling
    - Transaction boundaries
    - Idempotency keys

  **Detection**: Identify when scenario occurs
    - Monitoring and alerting
    - Logging and tracing
    - Health checks
    - Anomaly detection

  **Graceful Degradation**: Handle scenario elegantly
    - Fallback values
    - Circuit breakers
    - Retry logic with exponential backoff
    - User-friendly error messages

  **Recovery**: Restore normal operation
    - Auto-retry mechanisms
    - Manual recovery procedures
    - Data reconciliation
    - Rollback capabilities

  **Documentation**: Communicate about scenario
    - Runbooks for operators
    - User guidance for errors
    - Incident response procedures
    - Known limitations
</mitigation_approaches>

## Output Format

### Scenario Analysis Report Template

```markdown
# Scenario Exploration Report

## Feature: [FEATURE_NAME]

### Scenarios Identified: [TOTAL_COUNT]

**High Risk Scenarios**: [COUNT]
**Medium Risk Scenarios**: [COUNT]
**Low Risk Scenarios**: [COUNT]

---

## High Risk Scenarios (Must Address)

### Scenario 1: [SCENARIO_NAME]

**Category**: [Edge Case/Failure/Scale/Security/User/Integration/Operational]

**Description**: [What happens in this scenario]

**Likelihood**: [Very Likely/Likely/Possible/Unlikely/Very Unlikely]

**Impact**: [Critical/High/Medium/Low/Minimal]

**Current Handling**: [How this is currently handled, or "Unhandled"]

**Recommended Mitigation**:
1. [Prevention strategy]
2. [Detection strategy]
3. [Graceful degradation strategy]
4. [Recovery strategy]

**Implementation Priority**: [P1/P2/P3]

**Estimated Effort**: [Small/Medium/Large]

---

## Medium Risk Scenarios (Should Address)

[Same format as above]

---

## Low Risk Scenarios (Optional)

[Same format as above]

---

## Summary & Recommendations

**Critical Gaps**:
- [List critical unhandled scenarios]

**Recommended Actions**:
1. [Immediate action for P1 scenarios]
2. [Near-term action for P2 scenarios]
3. [Future consideration for P3 scenarios]

**Specification Updates Needed**:
- [List spec sections requiring updates]

**Implementation Requirements**:
- [List code changes needed for mitigation]

**Testing Requirements**:
- [List test cases for scenario coverage]
```

## Usage Guidelines

### When to Use This Template

- During specification creation (comprehensive scenario planning)
- Before implementing complex features (risk assessment)
- During security reviews (attack scenario exploration)
- When troubleshooting production issues (incident analysis)
- For capacity planning (scale scenario exploration)

### How to Use This Template

1. **Start with your specification** or feature description
2. **Work through each category** systematically
3. **Check each item** in the checklist
4. **Document uncovered scenarios** with risk assessment
5. **Prioritize scenarios** for handling
6. **Update specification** with mitigation strategies
7. **Create test cases** for critical scenarios

### Time Investment

- Simple features: 30-45 minutes
- Moderate features: 1-2 hours
- Complex features: 2-4 hours

## Best Practices

1. **Be Paranoid**: Assume things will go wrong
2. **Think Like an Attacker**: Consider malicious scenarios
3. **Think Like a User**: Consider unexpected usage
4. **Be Specific**: "Database down" is better than "things fail"
5. **Assess Risk**: Not all scenarios need handling
6. **Document Decisions**: Record why scenarios are accepted risks
7. **Test Critical Scenarios**: Implement tests for high-risk scenarios

## Integration with Agent OS

This template integrates with:
- **create-spec.md**: Used during specification creation
- **execute-tasks.md**: Informs implementation and testing
- **validate-quality.md**: Validates scenario coverage

The scenario analysis ensures robust, production-ready implementations.
