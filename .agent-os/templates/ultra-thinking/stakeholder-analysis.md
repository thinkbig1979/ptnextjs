# Stakeholder Perspective Analysis Template

## Overview

This template provides a framework for analyzing specifications and implementations from multiple stakeholder perspectives to ensure comprehensive consideration of all concerns, requirements, and potential impacts.

## Purpose

The stakeholder analysis ensures that:
- All affected parties' needs are identified and addressed
- Potential conflicts between stakeholder interests are surfaced early
- Implementation decisions consider diverse perspectives
- Success criteria reflect multi-stakeholder value

## Stakeholder Perspectives

### 1. Developer Perspective 👨‍💻

**Primary Concerns**: Maintainability, code quality, development velocity, technical debt

<analysis_framework>
  **Code Maintainability**:
  - How easy is this code to understand and modify?
  - Are naming conventions clear and consistent?
  - Is the code structure logical and well-organized?
  - Are there adequate comments and documentation?
  - Does this follow established patterns in the codebase?

  **Development Experience**:
  - How long will this take to implement?
  - What dependencies or tools are required?
  - Are there clear testing strategies?
  - How does this integrate with existing development workflow?
  - Will this create friction or streamline development?

  **Technical Debt Assessment**:
  - Does this introduce technical debt?
  - Are there quick wins vs proper solutions trade-offs?
  - What future refactoring might be needed?
  - How does this impact codebase complexity?

  **Knowledge Transfer**:
  - How quickly can other developers understand this?
  - Is specialized knowledge required?
  - Are there learning resources available?
  - Does this require documentation updates?

  **Developer Questions**:
  - What edge cases need handling?
  - What testing approach makes sense?
  - How will this be debugged when issues arise?
  - What monitoring or logging is needed?
</analysis_framework>

### 2. Operations/DevOps Perspective 🔧

**Primary Concerns**: Reliability, scalability, monitoring, deployment, operational overhead

<analysis_framework>
  **Deployment & Infrastructure**:
  - What infrastructure changes are required?
  - How does this deploy to production?
  - Are there migration requirements?
  - What rollback strategy exists?
  - Does this require new services or resources?

  **Scalability & Performance**:
  - How does this scale with increased load?
  - What are the resource requirements (CPU, memory, storage)?
  - Are there performance bottlenecks?
  - How does this impact overall system performance?
  - What are the scaling limits?

  **Reliability & Monitoring**:
  - What can go wrong and how do we detect it?
  - What monitoring and alerting is needed?
  - How do we know if this is working correctly?
  - What metrics should we track?
  - What are the SLAs and how do we meet them?

  **Operational Overhead**:
  - Does this require manual intervention?
  - What routine maintenance is needed?
  - How are errors handled and recovered?
  - What documentation do ops teams need?
  - How complex is the operational model?

  **Disaster Recovery**:
  - How is data backed up?
  - What is the recovery time objective (RTO)?
  - What is the recovery point objective (RPO)?
  - Are there failover mechanisms?
  - How do we test disaster recovery?

  **Operations Questions**:
  - What happens during peak load?
  - How do we troubleshoot production issues?
  - What are the dependencies and failure modes?
  - How do we handle version upgrades?
</analysis_framework>

### 3. End User Perspective 👥

**Primary Concerns**: Usability, functionality, performance, reliability, accessibility

<analysis_framework>
  **User Experience**:
  - Is this feature intuitive and easy to use?
  - Does this solve a real user problem?
  - How many steps are required to accomplish tasks?
  - Is feedback clear and helpful?
  - What user frustrations might this introduce?

  **Functionality & Value**:
  - Does this meet user needs and expectations?
  - What value does this provide to users?
  - Are there missing features users will expect?
  - How does this compare to user's mental model?
  - What user workflows are impacted?

  **Performance & Responsiveness**:
  - How fast does this respond to user actions?
  - Are there loading states or progress indicators?
  - Does this feel snappy or sluggish?
  - What happens during slow network conditions?
  - Are there performance degradations users will notice?

  **Accessibility**:
  - Is this accessible to users with disabilities?
  - Does this work with screen readers?
  - Is keyboard navigation supported?
  - Are color contrasts sufficient?
  - Are error messages clear and actionable?

  **Error Handling & Recovery**:
  - What happens when users make mistakes?
  - Can users easily recover from errors?
  - Are error messages helpful and non-technical?
  - Is there guidance on how to fix issues?
  - What validation and guardrails exist?

  **User Questions**:
  - How will users discover this feature?
  - What training or onboarding is needed?
  - How does this fit into user workflows?
  - What user feedback mechanisms exist?
</analysis_framework>

### 4. Security Perspective 🔒

**Primary Concerns**: Vulnerabilities, data protection, compliance, authentication, authorization

<analysis_framework>
  **Authentication & Authorization**:
  - Who can access this feature?
  - How are users authenticated?
  - Are authorization checks in place?
  - Can users access data they shouldn't?
  - Are privilege escalations possible?

  **Data Protection**:
  - What sensitive data is handled?
  - How is data encrypted (at rest and in transit)?
  - Are PII/PHI protections in place?
  - How is data sanitized and validated?
  - What data retention policies apply?

  **Vulnerability Assessment**:
  - Are there injection vulnerabilities (SQL, XSS, command)?
  - Is input properly validated and sanitized?
  - Are there CSRF protections?
  - Can this be abused for DoS attacks?
  - Are there information disclosure risks?

  **Compliance Requirements**:
  - What regulatory requirements apply (GDPR, HIPAA, PCI-DSS)?
  - Are audit trails maintained?
  - Is consent properly obtained and tracked?
  - Are data subject rights supported (deletion, export)?
  - What compliance evidence is needed?

  **Secure Development**:
  - Are secrets properly managed (no hardcoding)?
  - Are dependencies up-to-date and vulnerability-free?
  - Is security testing included?
  - Are security headers configured?
  - Is least privilege principle followed?

  **Security Questions**:
  - What is the attack surface?
  - How would an attacker try to exploit this?
  - What data could be exposed in a breach?
  - How do we detect and respond to attacks?
</analysis_framework>

### 5. Business Perspective 💼

**Primary Concerns**: ROI, time-to-market, business value, competitive advantage, costs

<analysis_framework>
  **Business Value**:
  - What business problem does this solve?
  - What is the expected ROI?
  - How does this align with business goals?
  - What competitive advantage does this provide?
  - What customer pain points are addressed?

  **Market & Competition**:
  - How does this compare to competitor offerings?
  - What market opportunities does this enable?
  - Are there differentiation factors?
  - What market trends does this address?
  - How urgent is this capability?

  **Financial Impact**:
  - What are the development costs?
  - What are the ongoing operational costs?
  - What revenue impact is expected?
  - What cost savings are anticipated?
  - What is the break-even timeline?

  **Time to Market**:
  - How long will this take to deliver?
  - Are there MVP opportunities?
  - What are the dependencies on other initiatives?
  - Can this be phased or delivered incrementally?
  - What is the opportunity cost of delay?

  **Risk & Opportunity**:
  - What business risks does this introduce?
  - What opportunities might we miss?
  - What is the cost of NOT doing this?
  - Are there regulatory or compliance risks?
  - How does this affect brand and reputation?

  **Metrics & Success**:
  - How do we measure business success?
  - What KPIs should we track?
  - What does success look like in 6/12/24 months?
  - How do we validate business assumptions?

  **Business Questions**:
  - What customer segments benefit most?
  - How does this fit the product roadmap?
  - What partnerships or integrations are needed?
  - What marketing or sales enablement is required?
</analysis_framework>

### 6. Quality Assurance Perspective ✅

**Primary Concerns**: Testability, test coverage, quality standards, bug prevention

<analysis_framework>
  **Testability**:
  - How easy is this to test?
  - Are there clear test boundaries?
  - Can this be tested in isolation?
  - Are dependencies mockable?
  - What test data is needed?

  **Test Coverage Strategy**:
  - What unit tests are required?
  - What integration tests are needed?
  - Should we have end-to-end tests?
  - What edge cases need testing?
  - How do we test error conditions?

  **Quality Standards**:
  - Does this meet coding standards?
  - Are there performance benchmarks?
  - What accessibility standards apply?
  - Are there security testing requirements?
  - What documentation standards must be met?

  **Bug Prevention**:
  - What common bugs might occur?
  - Are there validation gaps?
  - What race conditions could exist?
  - How are boundary conditions handled?
  - What null/undefined cases need handling?

  **Test Automation**:
  - Can testing be automated?
  - What CI/CD integration is needed?
  - How long do tests take to run?
  - Are tests flaky or reliable?
  - What test maintenance is required?

  **QA Questions**:
  - What manual testing is necessary?
  - How do we test production scenarios?
  - What regression testing is needed?
  - How do we validate fixes work correctly?
</analysis_framework>

## Conflict Resolution

### Identifying Conflicts

Common stakeholder conflicts:
- **Developer vs Operations**: Fast shipping vs stability
- **Business vs Security**: Speed to market vs thorough security review
- **User vs Business**: Feature richness vs simplicity/cost
- **Developer vs QA**: Code velocity vs comprehensive testing
- **Business vs Operations**: New features vs technical debt reduction

### Resolution Framework

<conflict_resolution>
  FOR each identified conflict:

  1. **Acknowledge Both Perspectives**:
     - Clearly state each stakeholder's concern
     - Validate the legitimacy of both positions
     - Identify the underlying needs driving each position

  2. **Find Common Ground**:
     - What goals do both stakeholders share?
     - What constraints must both respect?
     - What values are non-negotiable?

  3. **Explore Solutions**:
     - Can we phase the implementation to satisfy both?
     - Are there creative compromises?
     - Can we de-risk through prototyping or testing?
     - What minimal viable approaches exist?

  4. **Make Trade-offs Explicit**:
     - Document what we're optimizing for
     - State what we're deprioritizing and why
     - Get stakeholder buy-in on the trade-off
     - Plan for revisiting the decision later

  5. **Mitigate Risks**:
     - What can we do to reduce downside?
     - How do we monitor the decision?
     - What triggers would make us reconsider?
     - What is our rollback or pivot plan?
</conflict_resolution>

## Analysis Output Format

### Summary Template

```markdown
# Stakeholder Analysis Summary

## Feature: [FEATURE_NAME]

### Multi-Stakeholder Impact Assessment

**Developer Impact**: [1-5 rating] ⭐
- Positive: [Benefits to developers]
- Negative: [Concerns or challenges]
- Mitigation: [How to address concerns]

**Operations Impact**: [1-5 rating] ⭐
- Positive: [Operational benefits]
- Negative: [Operational challenges]
- Mitigation: [How to reduce operational burden]

**User Impact**: [1-5 rating] ⭐
- Positive: [User benefits]
- Negative: [User friction or limitations]
- Mitigation: [How to improve user experience]

**Security Impact**: [1-5 rating] ⭐
- Positive: [Security improvements]
- Negative: [Security risks or gaps]
- Mitigation: [How to address security concerns]

**Business Impact**: [1-5 rating] ⭐
- Positive: [Business value]
- Negative: [Business risks or costs]
- Mitigation: [How to maximize business value]

**Quality Impact**: [1-5 rating] ⭐
- Positive: [Quality improvements]
- Negative: [Quality challenges]
- Mitigation: [How to ensure quality]

### Identified Conflicts

1. **[Stakeholder A] vs [Stakeholder B]**: [Conflict description]
   - **Resolution**: [How we'll resolve this]
   - **Trade-off**: [What we're optimizing for]

### Open Questions Requiring Stakeholder Input

- [Question for specific stakeholder]
- [Question requiring multi-stakeholder discussion]

### Recommended Approach

Based on stakeholder analysis:
1. [Key recommendation]
2. [Approach to balance competing needs]
3. [Phasing or incremental delivery strategy]

### Success Criteria by Stakeholder

- **Developer**: [How developers measure success]
- **Operations**: [How ops measures success]
- **User**: [How users measure success]
- **Security**: [How security measures success]
- **Business**: [How business measures success]
- **QA**: [How QA measures success]
```

## Usage Guidelines

### When to Use This Template

- During specification creation (before implementation)
- When evaluating complex features with broad impact
- When stakeholders have expressed conflicting requirements
- For features with significant technical, business, or user risk
- During architectural decision-making

### How to Use This Template

1. **Read the full specification** first
2. **Work through each stakeholder perspective** systematically
3. **Document key concerns and questions** for each perspective
4. **Identify conflicts** between stakeholder interests
5. **Propose resolutions** and trade-offs
6. **Get stakeholder feedback** on the analysis
7. **Update the specification** to address identified concerns

### Time Investment

- Simple features: 30-60 minutes
- Moderate features: 1-2 hours
- Complex features: 2-4 hours

The time investment pays dividends by preventing:
- Rework due to missed requirements
- Production issues from overlooked concerns
- Stakeholder dissatisfaction from unmet expectations
- Technical debt from rushed decisions

## Best Practices

1. **Be Thorough**: Don't skip perspectives even if they seem less relevant
2. **Be Specific**: General concerns are less actionable than specific issues
3. **Be Realistic**: Acknowledge constraints and limitations honestly
4. **Be Collaborative**: Share analysis with actual stakeholders for validation
5. **Be Iterative**: Update analysis as new information emerges
6. **Document Decisions**: Record why trade-offs were made for future reference

## Integration with Agent OS

This template integrates with:
- **create-spec.md**: Used during Step 4.5 (ultra-thinking analysis)
- **validate-quality.md**: Referenced during quality validation
- **execute-tasks.md**: Informs implementation decisions

The analysis output becomes part of the specification documentation and guides implementation priorities.
