---
version: 5.1.0
last-updated: 2026-01-02
---


# Evolution Scoring Rubric

Version: 1.0.0
Last Updated: 2026-01-01

## Purpose

This rubric evaluates documentation and specifications for **timelessness** and **evolution-readiness**. Content that scores well remains valuable as tools, versions, and ecosystems change. Content that scores poorly becomes technical debt requiring frequent rewrites.

## Score Scale Overview

| Score | Category | Description | Action |
|-------|----------|-------------|--------|
| **1-4** | Reject | Ephemeral, tightly coupled to specific versions/tools | Do not merge; requires rewrite |
| **5-6** | Requires Revision | Sound core but contains hardcoded elements | Revise before merging |
| **7-8** | Approved | Principle-based with clear extension points | Ready for merge |
| **9-10** | Exemplary | Addresses fundamental problems, highly composable | Merge and consider as reference |

---

## Evaluation Criteria

### 1. Dependency Stability (25%)

Measures how well content isolates from external version changes.

| Score | Criteria | Examples |
|-------|----------|----------|
| **1-2** | Hardcoded versions throughout, will break with updates | `"Use React 18.2.0 createRoot"`, `"pnpm@8.6.1"` |
| **3-4** | Some version coupling, partial abstraction | Mixed pinned and ranges: `"Node 22+"` alongside `"Vite 5.0.0"` |
| **5-6** | Versions mentioned but with clear upgrade paths | `"Currently using X, see Alternatives section for migration"` |
| **7-8** | Version-agnostic with capability-based requirements | `"Requires ES2020+ runtime"`, `"Any SQL database with JSON support"` |
| **9-10** | Completely abstracted, implementation-neutral | `"Persistent key-value store"`, `"Build tool with hot reload support"` |

**Detection Heuristics**:
```regex
# High-risk patterns (score reducers)
version_pinning: /[a-z]+@\d+\.\d+\.\d+/i
exact_version: /version\s*[=:]\s*['"]?\d+\.\d+\.\d+['"]?/i
specific_api: /(React\.createRoot|useState|useEffect)\s*\(/

# Low-risk patterns (score neutral/positive)
version_range: /\d+\.\d+\+|\^?\d+\.\d+\.x|>=\s*\d+/
capability_based: /(requires|needs|supports)\s+(ES\d+|SQL|HTTP\/\d)/i
```

**Scoring Guide**:
- Count hardcoded version references
- 0 references: +2 points
- 1-3 references with upgrade notes: +0 points
- 4+ references or any blocking dependency: -2 points

---

### 2. Extension Points (25%)

Evaluates whether content provides hooks for customization and growth.

| Score | Criteria | Examples |
|-------|----------|----------|
| **1-2** | No extension mechanism, closed system | Monolithic instructions with no variation points |
| **3-4** | Limited extensibility, requires forking to customize | Config exists but core behavior unchangeable |
| **5-6** | Some extension points but poorly documented | `"Can be extended..."` without how/where |
| **7-8** | Clear extension points with documentation | Named hooks, plugin interfaces, override mechanisms |
| **9-10** | First-class extensibility, composition-focused | Everything is a plugin, mix-and-match components |

**Detection Heuristics**:
```regex
# Positive indicators (score boosters)
extension_mention: /\b(hook|plugin|middleware|extension|override|customize)\b/i
composability: /\b(compose|chain|pipe|combine|mix-?in)\b/i
interface_definition: /\b(interface|contract|protocol|adapter)\b/i

# Negative indicators (score reducers)
closed_phrases: /\b(must|always|never|only way|required to)\b/i
no_alternatives: /^(?!.*(or|alternatively|optionally|if needed)).*$/
```

**Scoring Guide**:
- Document mentions "extension points", "hooks", or "plugins": +2 points
- Document provides concrete extension examples: +1 point
- Document says "must" or "only way" without alternatives: -1 point per instance (max -3)
- No extensibility mechanisms mentioned: -2 points

---

### 3. Principle vs Implementation (20%)

Measures ratio of timeless principles to ephemeral implementation details.

| Score | Criteria | Examples |
|-------|----------|----------|
| **1-2** | Pure implementation, no underlying principles | Step-by-step tutorial without rationale |
| **3-4** | Implementations dominate, principles implied | `"Run npm install"` without explaining dependency management |
| **5-6** | Balance of both but implementation-heavy | Principles mentioned but buried in specifics |
| **7-8** | Principles lead, implementations illustrate | `"Principle: Fail fast. Implementation: Use TypeScript strict mode"` |
| **9-10** | Principle-first with implementation as examples | Clear separation: Why -> What -> How (current tooling) |

**Detection Heuristics**:
```regex
# Principle indicators (score boosters)
why_explanation: /\b(because|rationale|principle|reason|philosophy|ensures)\b/i
pattern_names: /\b(DRY|SOLID|YAGNI|separation of concerns|single responsibility)\b/i
conceptual_terms: /\b(abstraction|encapsulation|modularity|cohesion|coupling)\b/i

# Implementation indicators (score reducers when dominant)
tool_commands: /\b(npm|pnpm|yarn|pip|gem|cargo)\s+(install|add|run)\b/i
file_paths: /[a-z_-]+\/[a-z_-]+\.(js|ts|py|rb|go)/i
api_calls: /\.[a-zA-Z]+\([^)]*\)/
```

**Scoring Guide**:
- Clear "Why" section before "How": +2 points
- Principles explicitly named and explained: +2 points
- Implementation without any rationale: -2 points
- Tool-specific commands without principle context: -1 point per section (max -3)

---

### 4. Temporal Projection (15%)

Evaluates content's likely validity over time horizons.

| Score | Criteria | Time Horizon |
|-------|----------|--------------|
| **1-2** | Will break within months | Tied to beta features, pre-release APIs |
| **3-4** | Valid for 1 year | Current major version, common patterns |
| **5-6** | Valid for 2-3 years | Stable APIs, mature ecosystems |
| **7-8** | Valid for 5+ years | Industry standards, protocol-level patterns |
| **9-10** | Indefinitely valid | Fundamental CS/engineering principles |

**Detection Heuristics**:
```regex
# Short-lived indicators (score reducers)
experimental: /\b(experimental|beta|alpha|preview|unstable|deprecated)\b/i
recent_feature: /\b(new in|introduced in|as of) (v?\d+\.\d+|20\d{2})\b/i
framework_specific: /\b(React|Vue|Angular|Next\.js|Nuxt|Svelte)\s+\d+/i

# Long-lived indicators (score boosters)
standards: /\b(RFC|ISO|IEEE|W3C|ECMA|POSIX|SQL|HTTP)\b/
fundamentals: /\b(algorithm|data structure|protocol|specification|standard)\b/i
design_patterns: /\b(factory|singleton|observer|strategy|adapter|facade)\b/i
```

**Scoring Guide**:
- References to RFCs, ISO standards, or fundamental CS concepts: +2 points
- Uses experimental or beta features: -2 points
- Tied to specific framework version lifecycle: -1 point
- Based on design patterns or architectural principles: +1 point

---

### 5. Graceful Degradation (15%)

Measures how content handles partial obsolescence.

| Score | Criteria | Examples |
|-------|----------|----------|
| **1-2** | All-or-nothing, single point of failure | Entire workflow depends on one tool |
| **3-4** | Some fallbacks but manual intervention needed | `"If X fails, manually do Y"` |
| **5-6** | Documented alternatives with migration paths | Alternative section with trade-offs |
| **7-8** | Modular design, components replaceable independently | Swap storage layer without affecting business logic |
| **9-10** | Progressive enhancement, core works universally | Base functionality with optional enhancements |

**Detection Heuristics**:
```regex
# Positive indicators (score boosters)
alternatives: /\b(alternative(ly)?|fallback|if .+ unavailable|instead of)\b/i
modularity: /\b(module|component|layer|interface|boundary|swap|replace)\b/i
progressive: /\b(optional|enhance|degrade gracefully|base functionality)\b/i

# Negative indicators (score reducers)
single_dependency: /\b(requires?|depends on|needs)\s+[A-Z][a-z]+\b/
no_fallback: /\b(must use|only works with|requires exactly)\b/i
tight_coupling: /\b(tightly coupled|integrated with|built into)\b/i
```

**Scoring Guide**:
- Provides 2+ alternatives for critical components: +2 points
- Documents migration path when tools change: +1 point
- Single tool dependency with no alternatives: -2 points
- Components can be replaced independently: +1 point

---

## Anti-Pattern Catalog

### 1. Version Pinning

**Description**: Hardcoding exact versions without flexibility.

**Detection**:
```regex
pattern: /["']?[a-z@\/.-]+["']?\s*[=:]\s*["']?\d+\.\d+\.\d+["']?/gi
severity: high
example_matches:
  - '"react": "18.2.0"'
  - "node@22.0.0"
  - "version: 5.0.0"
```

**Impact**: Score -1 to -2 per instance
**Remediation**: Use version ranges (`^18.0.0`, `>=22`) or capability requirements

---

### 2. Tool-Specific Without Abstraction

**Description**: Instructions for specific tools without explaining the underlying pattern.

**Detection**:
```regex
pattern: /\b(npm|pnpm|yarn|pip|gem|cargo|docker|kubectl)\s+(install|add|run|build|deploy)/i
context_required: /\b(pattern|principle|concept|abstraction)[\s\S]{0,500}$/i  # Must have context nearby
severity: medium
example_matches:
  - "npm install express" (without explaining HTTP server abstraction)
  - "docker build ." (without explaining containerization concept)
```

**Impact**: Score -1 if no abstraction within 500 chars
**Remediation**: Add principle explanation before command

---

### 3. Missing Extension Points

**Description**: No mechanism for customization or growth.

**Detection**:
```regex
negative_pattern: /\b(hook|plugin|extend|override|customize|configure)\b/i
document_scope: entire_document
severity: high
threshold: 0  # If none found in a >500 word document
```

**Impact**: Score -2 if document >500 words with no extension mentions
**Remediation**: Add "Customization" or "Extension Points" section

---

### 4. Implicit Dependencies

**Description**: External references without documentation or fallbacks.

**Detection**:
```regex
pattern: /\b(assumes?|expects?|requires?)\s+(?!documented|specified).+\b(installed|available|running|configured)\b/i
severity: high
example_matches:
  - "assumes Docker is installed"
  - "requires Redis running"
```

**Impact**: Score -1 per implicit dependency
**Remediation**: Document dependencies explicitly with installation/fallback instructions

---

### 5. Temporal Anchoring

**Description**: Content tied to specific points in time without update mechanism.

**Detection**:
```regex
pattern: /\b(as of|currently|in 20\d{2}|latest version|recent(ly)?)\b/i
severity: medium
example_matches:
  - "as of 2024"
  - "currently the best approach"
  - "latest version of React"
```

**Impact**: Score -1 per instance (max -2)
**Remediation**: Add "Last Verified" date and update mechanism

---

### 6. Framework Worship

**Description**: Treating tool-specific patterns as universal truths.

**Detection**:
```regex
pattern: /\b(React|Vue|Angular|Next\.js|Express|Rails|Django)\s+(way|pattern|best practice|standard)\b/i
severity: medium
example_matches:
  - "the React way"
  - "Rails best practice"
```

**Impact**: Score -1 per instance
**Remediation**: Describe the underlying principle, then show framework implementation

---

### 7. Magic Numbers/Strings

**Description**: Unexplained hardcoded values.

**Detection**:
```regex
pattern: /(?<!\/\/.*)\b(timeout|limit|max|threshold|port)[:\s=]+\d+\b/i
context_required: /\b(because|reason|chosen|configured|default)\b/i
severity: low
example_matches:
  - "timeout: 30000" (without explaining why 30s)
  - "MAX_RETRIES = 3" (without retry strategy)
```

**Impact**: Score -0.5 per instance (max -1)
**Remediation**: Add inline comment or "Configuration Rationale" section

---

## Scoring Examples

### Example 1: Low Score (3/10)

```markdown
# Setup Guide

Install Node.js 22.0.0 exactly:
nvm install 22.0.0
nvm use 22.0.0

Install dependencies:
npm install react@18.2.0 next@14.0.0

Configure Vercel:
vercel link
vercel env pull
```

**Score Breakdown**:
- Dependency Stability: 1/10 (exact versions throughout)
- Extension Points: 2/10 (no customization options)
- Principle vs Implementation: 2/10 (pure commands, no rationale)
- Temporal Projection: 3/10 (will break with major releases)
- Graceful Degradation: 2/10 (single-vendor lock-in)

**Total**: 2.0/10 (weighted)

---

### Example 2: Medium Score (6/10)

```markdown
# Authentication Strategy

## Principle
Stateless authentication using JWT tokens provides horizontal scalability.

## Implementation (Node.js)
```javascript
// Using jsonwebtoken (npm install jsonwebtoken)
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: user.id }, SECRET_KEY);
```

## Alternatives
- Session-based auth for simpler setups
- OAuth2 for third-party integration
```

**Score Breakdown**:
- Dependency Stability: 5/10 (library mentioned but concept clear)
- Extension Points: 5/10 (alternatives listed but not detailed)
- Principle vs Implementation: 7/10 (principle leads)
- Temporal Projection: 6/10 (JWT is stable standard)
- Graceful Degradation: 6/10 (alternatives mentioned)

**Total**: 5.75/10 (weighted)

---

### Example 3: High Score (9/10)

```markdown
# Error Handling Strategy

## Principle
**Fail Fast, Recover Gracefully**: Surface errors early in development,
handle them gracefully in production.

## Why This Matters
1. Early detection reduces debugging time
2. Graceful recovery improves user experience
3. Structured errors enable automated monitoring

## Pattern: Error Boundary
Isolate failure domains so one component's error doesn't cascade.

### Concept
```
[Component A] → [Error Boundary] → [Fallback UI]
[Component B] → [Error Boundary] → [Fallback UI]
```

### Implementation Examples

**React (Class-based)**
```jsx
class ErrorBoundary extends React.Component {
  // ...
}
```

**React (Library: react-error-boundary)**
```jsx
import { ErrorBoundary } from 'react-error-boundary';
```

**Vue 3**
```vue
<script setup>
onErrorCaptured((err) => { /* ... */ })
</script>
```

**Vanilla JS**
```javascript
window.onerror = function(msg, url, line) { /* ... */ }
```

## Extension Points
- Custom error reporters (see `/hooks/error-reporter.js`)
- Error categorization schemas
- Retry strategies per error type

## When to Deviate
- Real-time systems may need fail-silent for non-critical paths
- Batch processing may aggregate errors rather than fail fast
```

**Score Breakdown**:
- Dependency Stability: 9/10 (concept-first, multiple implementations)
- Extension Points: 9/10 (clear hooks and customization)
- Principle vs Implementation: 10/10 (principle-first structure)
- Temporal Projection: 9/10 (fundamental pattern, not tool-specific)
- Graceful Degradation: 8/10 (multiple fallbacks, deviation guidance)

**Total**: 9.0/10 (weighted)

---

## Scoring Worksheet

Use this worksheet when evaluating content:

```yaml
document: "[Document Name]"
evaluator: "[Name]"
date: "[Date]"

scores:
  dependency_stability:
    raw_score: # 1-10
    weight: 0.25
    notes: ""

  extension_points:
    raw_score: # 1-10
    weight: 0.25
    notes: ""

  principle_vs_implementation:
    raw_score: # 1-10
    weight: 0.20
    notes: ""

  temporal_projection:
    raw_score: # 1-10
    weight: 0.15
    notes: ""

  graceful_degradation:
    raw_score: # 1-10
    weight: 0.15
    notes: ""

anti_patterns_found:
  - pattern: ""
    instances: 0
    impact: 0

weighted_total: # Calculate: sum(raw_score * weight) - anti_pattern_impacts
final_score: # Round to 1 decimal
recommendation: # "reject" | "revise" | "approve" | "exemplary"
```

---

## Inter-Rater Reliability

To ensure two reviewers score documents within +/- 1 point:

### Calibration Process

1. **Training Set**: Review 5 pre-scored documents together
2. **Blind Scoring**: Each reviewer scores independently
3. **Reconciliation**: Discuss any >1 point differences
4. **Threshold Check**: Must achieve 80% agreement within +/- 1

### Disambiguation Rules

| Ambiguous Situation | Resolution |
|---------------------|------------|
| Uncertain if version is pinned or ranged | Treat `x.y.z` as pinned, `x.y.x` or `^x.y.z` as ranged |
| Unclear if extension point exists | Search for "extend", "hook", "plugin", "override", "customize" |
| Principle vs implementation boundary | Principle = "why/what", Implementation = "how with specific tool" |
| Temporal projection disagreement | Use most conservative estimate |
| Missing section | Score that criterion as 5 (neutral) |

### Escalation

If reviewers cannot agree within +/- 1 point after discussion:
1. Document both scores and rationale
2. Request third reviewer
3. Use median of three scores

---

## Integration with Agent OS

### Workflow Integration

This rubric integrates at:

| Phase | Integration Point | Action |
|-------|-------------------|--------|
| Spec Creation | Step 9.5 | Score spec against rubric |
| Documentation | Before merge | Require 7+ score for standards/ |
| Templates | Template review | All templates must score 8+ |
| Upgrades | Version bumps | Re-score affected documents |

### Automated Checking

```bash
# Run evolution scoring check (future implementation)
~/.agent-os/hooks/validators/evolution_scoring.js <file>
```

### Configuration

```yaml
# config.yml addition
evolution_scoring:
  enabled: true
  minimum_score:
    standards: 7
    templates: 8
    specs: 6
    general_docs: 5
  anti_pattern_checking: true
  require_worksheet: false  # Set true for formal reviews
```

---

## References

- Agent OS Best Practices: `@.agent-os/standards/best-practices.md`
- Architecture Decisions Template: `@.agent-os/templates/spec-templates/architecture-decisions-template.md`
- Compound Engineering Philosophy: CLAUDE.md "Compounding Engineering"

---

**Template Version**: 1.0.0
**Last Updated**: 2026-01-01
**Next Review**: 2026-07-01
