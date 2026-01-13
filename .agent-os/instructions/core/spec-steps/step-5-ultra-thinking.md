---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 5: Ultra-Thinking Protocol

Systematic deep analysis using 3 templates.

**When**: New features, architecture changes, security, performance-critical, complex workflows

**Skip** (ALL true):
- [ ] <50 lines in single file
- [ ] No new dependencies/integrations
- [ ] No auth/authz/validation changes
- [ ] No performance-critical paths
- [ ] No schema/data model changes
- [ ] No new user-facing features

## Analysis 1: Stakeholder Perspective (30-120 min)

Template: `templates/ultra-thinking/stakeholder-analysis.md`

For each perspective (Developer, Operations, User, Security, Business, QA):
- Rate impact (1-5)
- Document positive/negative
- Propose mitigations
- Identify conflicts
- Define success criteria

**Output**:
```markdown
## Stakeholder Analysis

**Developer Impact**: [1-5]
- Positive: [benefits]
- Negative: [concerns]
- Mitigation: [how to address]

[Repeat for Operations, User, Security, Business, QA]

### Conflicts
1. [A] vs [B]: [conflict]
   - Resolution: [approach]
   - Trade-off: [what we optimize for]

### Success Criteria by Stakeholder
- Developer: [metrics]
- Operations: [metrics]
- User: [metrics]
- Security: [metrics]
- Business: [metrics]
- QA: [metrics]
```

## Analysis 2: Scenario Exploration (30-120 min)

Template: `templates/ultra-thinking/scenario-exploration.md`

**Categories**:
- Edge Cases: Empty input, max size, concurrent access
- Failures: Infrastructure, data, dependencies
- Scale: High volume, large data, slow networks
- Security: Injection, auth bypass, privilege escalation, DoS
- User: Unexpected usage, mistakes, multi-device
- Integration: Third-party changes, consistency, migrations
- Operational: Deployment, monitoring, maintenance

For each scenario:
- Likelihood (Very Likely -> Very Unlikely)
- Impact (Critical -> Minimal)
- Risk = Likelihood x Impact
- Priority (P1/P2/P3)

**P1 Mitigation**:
1. Prevention (design to prevent)
2. Detection (identify when occurs)
3. Graceful degradation (handle elegantly)
4. Recovery (restore normal)

**Output**:
```markdown
## Scenario Exploration

### High Risk (P1): [COUNT]

#### Scenario: [NAME]
**Category**: [category]
**Likelihood**: [level]
**Impact**: [level]
**Current Handling**: [approach or "Unhandled"]

**Mitigation**:
1. Prevention: [strategy]
2. Detection: [strategy]
3. Degradation: [strategy]
4. Recovery: [strategy]

**Implementation**: P1
**Effort**: [Small/Medium/Large]

[Repeat for all P1 scenarios]
```

## Analysis 3: Multi-Angle Review (30-90 min)

Template: `templates/ultra-thinking/multi-angle-review.md`

**Angles**:
- Technical Excellence: Quality, architecture, debt
- Business Value: ROI, competitive advantage, alignment
- Risk Management: Technical risks, security, compliance
- Team Collaboration: Onboarding, docs, velocity
- User Experience: Usability, accessibility, performance
- Long-term Vision: Scalability, maintainability, evolution

For each angle:
- Strengths
- Concerns
- Rating (1-5)
- Recommendations

**Output**:
```markdown
## Multi-Angle Review

#### 1. Technical Excellence
**Rating**: [1-5]
**Strengths**: [list]
**Concerns**: [list]
**Recommendations**: [list]

[Repeat for all 6 angles]

### Synthesis
**Overall**: [Average]
**Recommendation**: [Proceed | Caution | Needs Revision]

**Critical Issues** (must address):
1. [issue]

**Important Improvements** (should address):
1. [improvement]

**Nice-to-Have**:
1. [enhancement]

### Implementation Readiness
- [ ] Technical architecture sound
- [ ] Business value clear/measurable
- [ ] Risks identified/mitigated
- [ ] Team can execute
- [ ] UX meets standards
- [ ] Long-term maintainability acceptable

**Ready**: [YES/NO/CONDITIONAL]
```

## Final Spec Update

1. Consolidate findings
2. Update core sections
3. Save analysis artifacts:
   - `analysis-stakeholder.md`
   - `analysis-scenarios.md`
   - `analysis-multi-angle.md`
4. Reference in main spec

## Time Investment

| Complexity | Stakeholder | Scenarios | Multi-Angle | Total |
|------------|-------------|-----------|-------------|-------|
| Simple | 30-60 | 30-60 | 30-90 | 1.5-3h |
| Moderate | 60-90 | 60-90 | 45-90 | 2.5-4h |
| Complex | 90-120 | 90-120 | 60-90 | 4-5.5h |
