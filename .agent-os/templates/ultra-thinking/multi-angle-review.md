# Multi-Angle Review Framework Template

## Overview

This template provides a comprehensive framework for reviewing specifications and implementations from multiple analytical angles to ensure thorough evaluation and identify blind spots.

## Purpose

Multi-angle review ensures that:
- Technical decisions are sound across multiple dimensions
- Business and technical perspectives are balanced
- Risks are identified from various viewpoints
- Team dynamics and collaboration are considered
- Long-term implications are evaluated

## Review Angles

### 1. Technical Excellence Angle 🔧

**Focus**: Code quality, architecture, technical debt, maintainability

<review_framework>
  **Architecture Quality**:
  - [ ] Does this follow established architectural patterns?
  - [ ] Are components properly decoupled and cohesive?
  - [ ] Is the abstraction level appropriate?
  - [ ] Are dependencies well-managed and minimized?
  - [ ] Does this maintain separation of concerns?
  - [ ] Is the design extensible for future needs?

  **Code Quality Standards**:
  - [ ] Is code readable and self-documenting?
  - [ ] Are naming conventions clear and consistent?
  - [ ] Is complexity manageable (cyclomatic, cognitive)?
  - [ ] Are functions/methods appropriately sized?
  - [ ] Is there appropriate use of language features?
  - [ ] Are design patterns applied correctly?

  **Technical Debt Assessment**:
  - [ ] Does this introduce new technical debt?
  - [ ] Does this address existing technical debt?
  - [ ] Are there quick wins vs proper solutions trade-offs?
  - [ ] What future refactoring might be needed?
  - [ ] Is the debt documented and tracked?

  **Performance Considerations**:
  - [ ] Are there performance bottlenecks?
  - [ ] Is database access optimized (N+1 queries)?
  - [ ] Are algorithms efficient (time/space complexity)?
  - [ ] Is caching used appropriately?
  - [ ] Are there memory leaks or resource leaks?

  **Scalability Assessment**:
  - [ ] How does this scale with data growth?
  - [ ] How does this scale with user growth?
  - [ ] Are there concurrency or parallelism opportunities?
  - [ ] Are there scaling bottlenecks?
  - [ ] What are the resource requirements at scale?

  **Testability**:
  - [ ] Is this code easily testable?
  - [ ] Are dependencies injectable/mockable?
  - [ ] Are there clear test boundaries?
  - [ ] Can this be tested in isolation?
  - [ ] Is the test coverage adequate?

  **Technology Choices**:
  - [ ] Are the right tools/libraries being used?
  - [ ] Are dependencies up-to-date and maintained?
  - [ ] Are there simpler alternatives?
  - [ ] Is the learning curve justified?
  - [ ] What is the long-term support outlook?

  **Rating**: [1-5] ⭐
  **Key Strengths**: [List]
  **Key Concerns**: [List]
  **Recommendations**: [List]
</review_framework>

### 2. Business Value Angle 💼

**Focus**: ROI, business impact, competitive advantage, strategic alignment

<review_framework>
  **Business Alignment**:
  - [ ] Does this align with business objectives?
  - [ ] Does this support the product roadmap?
  - [ ] How does this contribute to KPIs?
  - [ ] Does this solve a real business problem?
  - [ ] Is the business value clearly articulated?

  **Market & Competition**:
  - [ ] How does this compare to competitors?
  - [ ] Does this provide competitive advantage?
  - [ ] What market opportunities does this enable?
  - [ ] Is this a market requirement or differentiator?
  - [ ] What is the market urgency?

  **Financial Impact**:
  - [ ] What is the expected ROI?
  - [ ] What are development costs?
  - [ ] What are operational costs?
  - [ ] What revenue impact is expected?
  - [ ] What is the break-even timeline?

  **Customer Value**:
  - [ ] What customer pain point is solved?
  - [ ] What customer segments benefit?
  - [ ] Is the value proposition clear?
  - [ ] How much will customers value this?
  - [ ] Will customers pay for this?

  **Time to Value**:
  - [ ] How long until customers see value?
  - [ ] Can value be delivered incrementally?
  - [ ] Are there MVP opportunities?
  - [ ] What is the opportunity cost of delay?

  **Strategic Importance**:
  - [ ] Is this strategic or tactical?
  - [ ] Does this open new opportunities?
  - [ ] Does this close strategic gaps?
  - [ ] What partnerships or integrations does this enable?

  **Rating**: [1-5] ⭐
  **Key Strengths**: [List]
  **Key Concerns**: [List]
  **Recommendations**: [List]
</review_framework>

### 3. Risk Management Angle ⚠️

**Focus**: Risks, mitigation strategies, contingency plans, failure modes

<review_framework>
  **Technical Risks**:
  - [ ] What could go wrong technically?
  - [ ] Are there unproven technologies?
  - [ ] Are there complex integrations?
  - [ ] What are the failure modes?
  - [ ] How likely are technical blockers?

  **Security Risks**:
  - [ ] What are the security vulnerabilities?
  - [ ] What is the attack surface?
  - [ ] What data is at risk?
  - [ ] Are there compliance risks?
  - [ ] What is the blast radius of a breach?

  **Operational Risks**:
  - [ ] What operational challenges exist?
  - [ ] What could cause outages?
  - [ ] What is the operational complexity?
  - [ ] Are there single points of failure?
  - [ ] What monitoring and alerting is needed?

  **Business Risks**:
  - [ ] What if adoption is lower than expected?
  - [ ] What if costs exceed estimates?
  - [ ] What if timeline slips?
  - [ ] What market or competitive risks exist?
  - [ ] What regulatory risks are there?

  **Team & Resource Risks**:
  - [ ] Do we have the right skills?
  - [ ] Are there knowledge gaps?
  - [ ] Are resources available when needed?
  - [ ] What if key people leave?
  - [ ] Are there competing priorities?

  **Dependency Risks**:
  - [ ] What external dependencies exist?
  - [ ] What if third-party services fail?
  - [ ] What if integrations change?
  - [ ] Are there vendor lock-in risks?

  **Mitigation Strategies**:
  - [ ] What can we do to reduce likelihood?
  - [ ] What can we do to reduce impact?
  - [ ] What is our contingency plan?
  - [ ] What is our rollback strategy?
  - [ ] How do we monitor and detect risks?

  **Rating**: [1-5 risk level]⚠️
  **Critical Risks**: [List with mitigation]
  **Acceptable Risks**: [List with justification]
  **Recommendations**: [List]
</review_framework>

### 4. Team Collaboration Angle 👥

**Focus**: Team dynamics, knowledge sharing, collaboration, maintainability

<review_framework>
  **Knowledge Distribution**:
  - [ ] Is knowledge concentrated in one person?
  - [ ] Can multiple team members work on this?
  - [ ] Is there adequate documentation?
  - [ ] Are there knowledge transfer needs?
  - [ ] What onboarding is needed for new team members?

  **Collaboration Requirements**:
  - [ ] What cross-team collaboration is needed?
  - [ ] Are interfaces and contracts clear?
  - [ ] Are there integration points?
  - [ ] How do teams coordinate changes?
  - [ ] What communication overhead exists?

  **Development Workflow**:
  - [ ] How does this fit the development process?
  - [ ] Are there workflow improvements needed?
  - [ ] What tools or infrastructure is needed?
  - [ ] How does this affect development velocity?
  - [ ] Are there process bottlenecks?

  **Code Review & Quality**:
  - [ ] Is this easy to code review?
  - [ ] Are changes atomic and focused?
  - [ ] Is the PR size reasonable?
  - [ ] Are there clear acceptance criteria?
  - [ ] Is the implementation approach clear?

  **Long-term Maintainability**:
  - [ ] Can someone unfamiliar maintain this?
  - [ ] Are there clear patterns to follow?
  - [ ] Is troubleshooting straightforward?
  - [ ] What future maintenance is expected?
  - [ ] How does this affect team productivity?

  **Team Skill Development**:
  - [ ] Does this help team learn new skills?
  - [ ] Is the learning curve reasonable?
  - [ ] Are there mentoring opportunities?
  - [ ] Does this align with career growth?

  **Rating**: [1-5] ⭐
  **Key Strengths**: [List]
  **Key Concerns**: [List]
  **Recommendations**: [List]
</review_framework>

### 5. User Experience Angle 🎨

**Focus**: Usability, accessibility, user satisfaction, user workflows

<review_framework>
  **Usability**:
  - [ ] Is this intuitive and easy to use?
  - [ ] Is the learning curve acceptable?
  - [ ] Are user workflows streamlined?
  - [ ] Is feedback clear and immediate?
  - [ ] Are error messages helpful?

  **Accessibility**:
  - [ ] Is this accessible to users with disabilities?
  - [ ] Does this work with screen readers?
  - [ ] Is keyboard navigation supported?
  - [ ] Are color contrasts sufficient?
  - [ ] Are ARIA labels appropriate?

  **Performance from User Perspective**:
  - [ ] Does this feel fast and responsive?
  - [ ] Are loading states appropriate?
  - [ ] Is perceived performance good?
  - [ ] Are animations smooth?
  - [ ] Does this work on slow connections?

  **Mobile & Responsive**:
  - [ ] Does this work well on mobile?
  - [ ] Is the layout responsive?
  - [ ] Are touch targets appropriately sized?
  - [ ] Does this work across devices?

  **User Expectations**:
  - [ ] Does this match user mental models?
  - [ ] Are there industry standard patterns?
  - [ ] Does this meet user expectations?
  - [ ] Are there delightful surprises?

  **User Support**:
  - [ ] Is help documentation needed?
  - [ ] Are there tutorials or tooltips?
  - [ ] Can users self-service support?
  - [ ] What training is needed?

  **Rating**: [1-5] ⭐
  **Key Strengths**: [List]
  **Key Concerns**: [List]
  **Recommendations**: [List]
</review_framework>

### 6. Long-term Vision Angle 🔭

**Focus**: Future-proofing, evolution, strategic direction, sustainability

<review_framework>
  **Future Evolution**:
  - [ ] How will this evolve over time?
  - [ ] Is this extensible for future needs?
  - [ ] What future features does this enable?
  - [ ] What future features does this block?
  - [ ] Is this a foundation or one-off?

  **Maintainability Over Time**:
  - [ ] Will this still make sense in 2 years?
  - [ ] How resistant is this to changing requirements?
  - [ ] What future refactoring is likely?
  - [ ] Will this scale with the product?

  **Technology Longevity**:
  - [ ] Will these technologies be supported long-term?
  - [ ] Is this technology mature or bleeding edge?
  - [ ] What is the upgrade path?
  - [ ] Are we building on stable foundations?

  **Strategic Direction**:
  - [ ] Does this align with long-term strategy?
  - [ ] Does this build capabilities we need?
  - [ ] Does this paint us into corners?
  - [ ] What doors does this open or close?

  **Sustainability**:
  - [ ] Is this sustainable operationally?
  - [ ] Is this sustainable financially?
  - [ ] Is this sustainable for the team?
  - [ ] What is the total cost of ownership?

  **Innovation vs Stability**:
  - [ ] Is this innovative enough?
  - [ ] Is this too risky or experimental?
  - [ ] What is the right balance?
  - [ ] How do we validate new approaches?

  **Rating**: [1-5] ⭐
  **Key Strengths**: [List]
  **Key Concerns**: [List]
  **Recommendations**: [List]
</review_framework>

## Review Process

### 1. Conduct Multi-Angle Review

<process>
  FOR each review angle:
    1. **Apply the review framework** systematically
    2. **Answer each question** honestly
    3. **Document findings** (strengths and concerns)
    4. **Assign rating** (1-5 scale)
    5. **List recommendations** for improvement

  AFTER all angles reviewed:
    1. **Identify patterns** across angles
    2. **Note conflicts** between angles
    3. **Assess overall quality** holistically
    4. **Prioritize recommendations**
</process>

### 2. Synthesize Findings

<synthesis>
  **Consistent Strengths** (appear across multiple angles):
  - [List strengths mentioned by 3+ angles]
  - These are the foundation to build on

  **Consistent Concerns** (appear across multiple angles):
  - [List concerns mentioned by 3+ angles]
  - These are critical issues requiring attention

  **Trade-offs** (strength in one angle, concern in another):
  - [List conflicting assessments]
  - These require careful balance

  **Blind Spots** (angles with major concerns):
  - [List angles with lowest ratings]
  - These need focused improvement

  **Overall Assessment**:
  - Average Rating: [Avg of all angle ratings] ⭐
  - Confidence Level: [High/Medium/Low]
  - Recommendation: [Proceed/Revise/Reconsider]
</synthesis>

### 3. Generate Action Items

<action_items>
  **Must Address (Before Proceeding)**:
  1. [Critical issue from review]
  2. [Critical issue from review]

  **Should Address (For Quality)**:
  1. [Important improvement]
  2. [Important improvement]

  **Nice to Address (Future Enhancement)**:
  1. [Optional improvement]
  2. [Optional improvement]

  **Questions Requiring Stakeholder Input**:
  1. [Question needing decision]
  2. [Question needing clarification]
</action_items>

## Output Format

### Multi-Angle Review Report Template

```markdown
# Multi-Angle Review Report

## Feature: [FEATURE_NAME]

**Review Date**: [DATE]
**Reviewer(s)**: [NAMES]
**Specification Version**: [VERSION]

---

## Review Ratings Summary

| Angle | Rating | Status |
|-------|--------|--------|
| Technical Excellence | [X/5] ⭐ | [Pass/Concern/Fail] |
| Business Value | [X/5] ⭐ | [Pass/Concern/Fail] |
| Risk Management | [X/5] ⚠️ | [Low/Medium/High] |
| Team Collaboration | [X/5] ⭐ | [Pass/Concern/Fail] |
| User Experience | [X/5] ⭐ | [Pass/Concern/Fail] |
| Long-term Vision | [X/5] ⭐ | [Pass/Concern/Fail] |

**Overall Rating**: [Avg] / 5.0 ⭐

**Overall Recommendation**: [✅ Proceed / ⚠️ Proceed with Caution / ❌ Needs Revision]

---

## Detailed Findings by Angle

### 1. Technical Excellence [X/5] ⭐

**Strengths**:
- [List key technical strengths]

**Concerns**:
- [List technical concerns]

**Recommendations**:
1. [Technical recommendation]
2. [Technical recommendation]

---

### 2. Business Value [X/5] ⭐

**Strengths**:
- [List business strengths]

**Concerns**:
- [List business concerns]

**Recommendations**:
1. [Business recommendation]
2. [Business recommendation]

---

### 3. Risk Management [X/5] ⚠️

**Critical Risks** (Must Mitigate):
- [Risk with mitigation plan]

**Acceptable Risks** (Monitored):
- [Risk with justification]

**Recommendations**:
1. [Risk mitigation recommendation]
2. [Risk mitigation recommendation]

---

### 4. Team Collaboration [X/5] ⭐

**Strengths**:
- [List collaboration strengths]

**Concerns**:
- [List collaboration concerns]

**Recommendations**:
1. [Collaboration recommendation]
2. [Collaboration recommendation]

---

### 5. User Experience [X/5] ⭐

**Strengths**:
- [List UX strengths]

**Concerns**:
- [List UX concerns]

**Recommendations**:
1. [UX recommendation]
2. [UX recommendation]

---

### 6. Long-term Vision [X/5] ⭐

**Strengths**:
- [List long-term strengths]

**Concerns**:
- [List long-term concerns]

**Recommendations**:
1. [Long-term recommendation]
2. [Long-term recommendation]

---

## Synthesis

### Cross-Angle Patterns

**Consistent Strengths**:
- [Strength mentioned across multiple angles]

**Consistent Concerns**:
- [Concern mentioned across multiple angles]

**Trade-offs**:
- [Conflicting assessments requiring balance]

**Blind Spots**:
- [Areas needing focused improvement]

---

## Action Items

### Must Address (P1)
1. [ ] [Critical action item]
2. [ ] [Critical action item]

### Should Address (P2)
1. [ ] [Important action item]
2. [ ] [Important action item]

### Nice to Have (P3)
1. [ ] [Optional improvement]
2. [ ] [Optional improvement]

---

## Open Questions

1. [Question for stakeholder]
2. [Question requiring clarification]

---

## Conclusion

**Overall Assessment**: [Summary paragraph]

**Confidence Level**: [High/Medium/Low]

**Next Steps**:
1. [Immediate next action]
2. [Follow-up actions]

**Approval Decision**: [Approved / Conditionally Approved / Needs Revision]
```

## Usage Guidelines

### When to Use This Framework

- Before finalizing major feature specifications
- During architecture decision records (ADR) creation
- For quarterly/annual technical planning
- When evaluating significant refactoring proposals
- During post-mortems (to identify missed angles)

### How to Use This Framework

1. **Gather context** (spec, design docs, prototypes)
2. **Work through each angle** systematically (don't skip)
3. **Be honest** about ratings and concerns
4. **Document findings** clearly and specifically
5. **Synthesize** patterns across angles
6. **Generate action items** with priorities
7. **Share with stakeholders** for feedback
8. **Update specification** based on findings

### Time Investment

- Quick review: 1-2 hours (all angles at high level)
- Thorough review: 3-4 hours (deep dive on each angle)
- Comprehensive review: 6-8 hours (includes stakeholder interviews)

## Best Practices

1. **Review Systematically**: Don't skip angles, even if they seem less relevant
2. **Be Objective**: Set aside biases and evaluate honestly
3. **Use Evidence**: Base assessments on concrete observations
4. **Balance Perspectives**: No single angle should dominate
5. **Identify Trade-offs**: Acknowledge where angles conflict
6. **Be Actionable**: Provide specific, implementable recommendations
7. **Iterate**: Review multiple times as spec evolves

## Integration with Agent OS

This template integrates with:
- **create-spec.md**: Used during specification finalization
- **validate-quality.md**: Used during quality validation
- **Architecture Decision Records**: Used for ADR evaluation

The multi-angle review ensures comprehensive evaluation from all critical perspectives.
