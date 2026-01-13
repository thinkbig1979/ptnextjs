/**
 * Evolution Scoring Validator
 *
 * Evaluates documentation and specifications for timelessness and evolution-readiness.
 * Content that scores well remains valuable as tools, versions, and ecosystems change.
 * Content that scores poorly becomes technical debt requiring frequent rewrites.
 *
 * Scoring Criteria (weighted):
 * - Dependency Stability: 25%
 * - Extension Points: 25%
 * - Principle vs Implementation: 20%
 * - Temporal Projection: 15%
 * - Graceful Degradation: 15%
 *
 * @version 1.0.0
 * @see standards/evolution-scoring.md
 */

const fs = require('fs');
const path = require('path');

class EvolutionScoringValidator {
  constructor(config = null) {
    this.config = config || this.loadConfig();
    this.evolutionConfig = this.config?.evolution_scoring || {};

    // Scoring weights from rubric
    this.weights = {
      dependency_stability: 0.25,
      extension_points: 0.25,
      principle_based: 0.20,
      temporal_projection: 0.15,
      graceful_degradation: 0.15
    };

    // Minimum score thresholds
    this.thresholds = {
      standards: this.evolutionConfig?.minimum_score?.standards ?? 7,
      templates: this.evolutionConfig?.minimum_score?.templates ?? 8,
      specs: this.evolutionConfig?.minimum_score?.specs ?? 6,
      general_docs: this.evolutionConfig?.minimum_score?.general_docs ?? 5
    };

    // Initialize detection patterns
    this.initializePatterns();
  }

  /**
   * Initialize regex patterns for scoring and anti-pattern detection
   */
  initializePatterns() {
    // === DEPENDENCY STABILITY PATTERNS ===
    this.dependencyPatterns = {
      // High-risk (score reducers)
      version_pinning: /[a-z]+@\d+\.\d+\.\d+/gi,
      exact_version: /version\s*[=:]\s*['"]?\d+\.\d+\.\d+['"]?/gi,
      specific_api: /(React\.createRoot|useState|useEffect|createSignal|onMount)\s*\(/g,
      package_exact: /["'][a-z@/.-]+["']\s*:\s*["']\d+\.\d+\.\d+["']/gi,
      node_exact: /node@\d+\.\d+\.\d+/gi,

      // Low-risk (score neutral/positive)
      version_range: /\d+\.\d+\+|\^?\d+\.\d+\.x|>=\s*\d+/g,
      capability_based: /(requires|needs|supports)\s+(ES\d+|SQL|HTTP\/\d)/gi,
      abstract_requirement: /\b(persistent|key-value store|build tool|runtime|environment)\b/gi
    };

    // === EXTENSION POINTS PATTERNS ===
    this.extensionPatterns = {
      // Positive indicators
      extension_mention: /\b(hook|plugin|middleware|extension|override|customize|configur(e|able))\b/gi,
      composability: /\b(compose|chain|pipe|combine|mix-?in)\b/gi,
      interface_definition: /\b(interface|contract|protocol|adapter|abstraction)\b/gi,
      extension_section: /##\s*(extension|customiz|hook|plugin)/gi,

      // Negative indicators
      closed_phrases: /\b(must|always|never|only way|required to)\b/gi,
      no_alternatives_sentence: /^[^(or|alternatively|optionally|if needed)]*$/
    };

    // === PRINCIPLE VS IMPLEMENTATION PATTERNS ===
    this.principlePatterns = {
      // Principle indicators (score boosters)
      why_explanation: /\b(because|rationale|principle|reason|philosophy|ensures|purpose|goal)\b/gi,
      pattern_names: /\b(DRY|SOLID|YAGNI|separation of concerns|single responsibility|dependency injection|inversion of control)\b/gi,
      conceptual_terms: /\b(abstraction|encapsulation|modularity|cohesion|coupling|composability|extensibility)\b/gi,
      why_section: /##\s*(why|rationale|principle|philosophy|purpose)/gi,

      // Implementation indicators (score reducers when dominant)
      tool_commands: /\b(npm|pnpm|yarn|pip|gem|cargo|docker|kubectl)\s+(install|add|run|build|deploy|exec)\b/gi,
      file_paths: /[a-z_-]+\/[a-z_-]+\.(js|ts|py|rb|go|rs)/gi,
      api_calls: /\.[a-zA-Z]+\([^)]*\)/g
    };

    // === TEMPORAL PROJECTION PATTERNS ===
    this.temporalPatterns = {
      // Short-lived indicators (score reducers)
      experimental: /\b(experimental|beta|alpha|preview|unstable|deprecated|canary)\b/gi,
      recent_feature: /\b(new in|introduced in|as of)\s+(v?\d+\.\d+|20\d{2})\b/gi,
      framework_specific: /\b(React|Vue|Angular|Next\.js|Nuxt|Svelte|SvelteKit|Remix|Astro)\s+\d+/gi,
      current_year: /\b(in 20\d{2}|as of 20\d{2}|currently)\b/gi,

      // Long-lived indicators (score boosters)
      standards: /\b(RFC|ISO|IEEE|W3C|ECMA|POSIX|SQL|HTTP|REST|GraphQL)\b/g,
      fundamentals: /\b(algorithm|data structure|protocol|specification|standard|design pattern)\b/gi,
      design_patterns: /\b(factory|singleton|observer|strategy|adapter|facade|decorator|proxy|command)\b/gi,
      cs_concepts: /\b(recursion|iteration|memoization|caching|hashing|indexing|concurrency)\b/gi
    };

    // === GRACEFUL DEGRADATION PATTERNS ===
    this.degradationPatterns = {
      // Positive indicators
      alternatives: /\b(alternative(ly)?|fallback|if .+ unavailable|instead of|or use|option(ally)?)\b/gi,
      modularity: /\b(module|component|layer|interface|boundary|swap|replace|pluggable)\b/gi,
      progressive: /\b(optional|enhance|degrade gracefully|base functionality|progressive enhancement)\b/gi,
      migration_path: /\b(migration|upgrade path|backwards compatible|deprecation)\b/gi,

      // Negative indicators
      single_dependency: /\b(requires?|depends on|needs)\s+[A-Z][a-z]+\s+(installed|available|running|configured)\b/gi,
      no_fallback: /\b(must use|only works with|requires exactly|depends entirely)\b/gi,
      tight_coupling: /\b(tightly coupled|integrated with|built into|hardcoded)\b/gi
    };

    // === ANTI-PATTERN DETECTION ===
    this.antiPatterns = {
      version_pinning: {
        pattern: /["']?[a-z@/.-]+["']?\s*[=:]\s*["']?\d+\.\d+\.\d+["']?/gi,
        severity: 'warning',
        impact: -1,
        remediation: 'Use version ranges (^x.y.z, >=x.y) or capability requirements'
      },
      tool_specific: {
        pattern: /\b(npm|pnpm|yarn|pip|gem|cargo|docker|kubectl)\s+(install|add|run|build|deploy)/gi,
        contextPattern: /\b(pattern|principle|concept|abstraction|why|because|rationale)\b/gi,
        contextWindow: 500,
        severity: 'info',
        impact: -0.5,
        remediation: 'Add principle explanation before command'
      },
      missing_extensions: {
        positivePattern: /\b(hook|plugin|extend|override|customize|configure|extensi(on|ble))\b/gi,
        wordThreshold: 500,
        severity: 'warning',
        impact: -2,
        remediation: 'Add "Customization" or "Extension Points" section'
      },
      implicit_deps: {
        pattern: /\b(assumes?|expects?|requires?)\s+(?!documented|specified).+\b(installed|available|running|configured)\b/gi,
        severity: 'warning',
        impact: -1,
        remediation: 'Document dependencies explicitly with installation/fallback instructions'
      },
      temporal_anchoring: {
        pattern: /\b(as of|currently|in 20\d{2}|latest version|recent(ly)?)\b/gi,
        severity: 'info',
        impact: -0.5,
        maxImpact: -2,
        remediation: 'Add "Last Verified" date and update mechanism'
      },
      framework_worship: {
        pattern: /\b(React|Vue|Angular|Next\.js|Express|Rails|Django)\s+(way|pattern|best practice|standard)\b/gi,
        severity: 'info',
        impact: -0.5,
        remediation: 'Describe the underlying principle, then show framework implementation'
      },
      magic_numbers: {
        pattern: /(?<!\/\/.*)\b(timeout|limit|max|threshold|port)[:\s=]+\d+\b/gi,
        contextPattern: /\b(because|reason|chosen|configured|default|rationale)\b/gi,
        contextWindow: 100,
        severity: 'info',
        impact: -0.25,
        maxImpact: -1,
        remediation: 'Add inline comment or "Configuration Rationale" section'
      }
    };
  }

  /**
   * Load configuration from Agent OS config.yml
   */
  loadConfig() {
    try {
      const yaml = require('js-yaml');
      const configPaths = [
        path.join(process.cwd(), '.agent-os', 'config.yml'),
        path.join(process.env.HOME || '', '.agent-os', 'config.yml')
      ];

      for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf8');
          return yaml.load(configContent);
        }
      }
    } catch (error) {
      // Silently use defaults if config can't be loaded
    }
    return {};
  }

  /**
   * Count pattern matches in content
   * @param {RegExp} pattern - Regex pattern to match
   * @param {string} content - Content to search
   * @returns {number} Number of matches
   */
  countMatches(pattern, content) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
  }

  /**
   * Find all matches with locations
   * @param {RegExp} pattern - Regex pattern to match
   * @param {string} content - Content to search
   * @returns {Array} Array of {match, line, column}
   */
  findMatchesWithLocation(pattern, content) {
    const results = [];
    const lines = content.split('\n');
    let lineNum = 1;
    let charIndex = 0;

    // Reset lastIndex for global patterns
    const patternCopy = new RegExp(pattern.source, pattern.flags);
    patternCopy.lastIndex = 0;

    let match;
    while ((match = patternCopy.exec(content)) !== null) {
      // Calculate line number
      while (charIndex + lines[lineNum - 1]?.length + 1 <= match.index && lineNum <= lines.length) {
        charIndex += lines[lineNum - 1].length + 1; // +1 for newline
        lineNum++;
      }

      results.push({
        match: match[0],
        line: lineNum,
        index: match.index
      });
    }

    return results;
  }

  /**
   * Check if context exists near a match
   * @param {string} content - Full content
   * @param {number} matchIndex - Index of the match
   * @param {RegExp} contextPattern - Pattern to look for in context
   * @param {number} window - Characters to look around
   * @returns {boolean}
   */
  hasContextNearby(content, matchIndex, contextPattern, window = 500) {
    const start = Math.max(0, matchIndex - window);
    const end = Math.min(content.length, matchIndex + window);
    const contextArea = content.substring(start, end);

    contextPattern.lastIndex = 0;
    return contextPattern.test(contextArea);
  }

  /**
   * Count words in content
   * @param {string} content - Content to count words in
   * @returns {number}
   */
  countWords(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Determine document type from file path
   * @param {string} filePath - Path to file
   * @returns {string} Document type: 'standards' | 'templates' | 'specs' | 'general_docs'
   */
  getDocumentType(filePath) {
    const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');

    if (normalizedPath.includes('/standards/') || normalizedPath.includes('-standards.md')) {
      return 'standards';
    }
    if (normalizedPath.includes('/templates/') || normalizedPath.includes('.template')) {
      return 'templates';
    }
    if (normalizedPath.includes('/specs/') || normalizedPath.includes('spec.md') || normalizedPath.includes('-spec/')) {
      return 'specs';
    }
    return 'general_docs';
  }

  /**
   * Score dependency stability criterion
   * @param {string} content - Document content
   * @returns {Object} {score, notes, adjustments}
   */
  scoreDependencyStability(content) {
    let baseScore = 7; // Start neutral-good
    const adjustments = [];

    // Count negative patterns
    const versionPins = this.countMatches(this.dependencyPatterns.version_pinning, content);
    const exactVersions = this.countMatches(this.dependencyPatterns.exact_version, content);
    const packageExacts = this.countMatches(this.dependencyPatterns.package_exact, content);
    const totalPins = versionPins + exactVersions + packageExacts;

    // Count positive patterns
    const versionRanges = this.countMatches(this.dependencyPatterns.version_range, content);
    const capabilityBased = this.countMatches(this.dependencyPatterns.capability_based, content);
    const abstractReqs = this.countMatches(this.dependencyPatterns.abstract_requirement, content);

    // Apply scoring logic from rubric
    if (totalPins === 0) {
      baseScore += 2;
      adjustments.push('+2: No hardcoded version references');
    } else if (totalPins <= 3 && versionRanges > 0) {
      adjustments.push(`0: ${totalPins} version references with ranges present`);
    } else if (totalPins >= 4) {
      baseScore -= 2;
      adjustments.push(`-2: ${totalPins} hardcoded version references (4+ is high risk)`);
    } else {
      baseScore -= 1;
      adjustments.push(`-1: ${totalPins} version references without upgrade paths`);
    }

    // Bonus for capability-based requirements
    if (capabilityBased > 0 || abstractReqs > 0) {
      baseScore += 1;
      adjustments.push(`+1: Uses capability-based or abstract requirements`);
    }

    // Clamp score to 1-10
    const score = Math.min(10, Math.max(1, baseScore));

    return {
      score,
      notes: `Pins: ${totalPins}, Ranges: ${versionRanges}, Abstract: ${abstractReqs}`,
      adjustments
    };
  }

  /**
   * Score extension points criterion
   * @param {string} content - Document content
   * @returns {Object} {score, notes, adjustments}
   */
  scoreExtensionPoints(content) {
    let baseScore = 5; // Start neutral
    const adjustments = [];

    // Count positive patterns
    const extensionMentions = this.countMatches(this.extensionPatterns.extension_mention, content);
    const composability = this.countMatches(this.extensionPatterns.composability, content);
    const interfaces = this.countMatches(this.extensionPatterns.interface_definition, content);
    const extensionSections = this.countMatches(this.extensionPatterns.extension_section, content);

    // Count negative patterns
    const closedPhrases = this.countMatches(this.extensionPatterns.closed_phrases, content);

    // Apply scoring logic from rubric
    if (extensionMentions > 0 || extensionSections > 0) {
      baseScore += 2;
      adjustments.push(`+2: Mentions extension points/hooks/plugins (${extensionMentions} refs)`);
    } else if (this.countWords(content) > 500) {
      baseScore -= 2;
      adjustments.push('-2: No extensibility mechanisms in >500 word document');
    }

    // Check for concrete extension examples (code blocks with extension-related content)
    const extensionExamples = content.match(/```[\s\S]*?(extend|hook|plugin|override)[\s\S]*?```/gi);
    if (extensionExamples && extensionExamples.length > 0) {
      baseScore += 1;
      adjustments.push(`+1: Provides concrete extension examples`);
    }

    // Penalty for closed phrases without alternatives
    const closedPenalty = Math.min(3, closedPhrases);
    if (closedPenalty > 0) {
      // Check if alternatives are nearby
      const alternativeMentions = this.countMatches(/\b(or|alternatively|optionally|if needed)\b/gi, content);
      if (alternativeMentions < closedPhrases) {
        baseScore -= Math.min(closedPenalty, 2);
        adjustments.push(`-${Math.min(closedPenalty, 2)}: Closed phrases ("must", "only way") without alternatives`);
      }
    }

    // Bonus for interface/contract definitions
    if (interfaces > 0) {
      baseScore += 1;
      adjustments.push(`+1: Defines interfaces/contracts/protocols`);
    }

    const score = Math.min(10, Math.max(1, baseScore));

    return {
      score,
      notes: `Extensions: ${extensionMentions}, Composability: ${composability}, Interfaces: ${interfaces}`,
      adjustments
    };
  }

  /**
   * Score principle vs implementation criterion
   * @param {string} content - Document content
   * @returns {Object} {score, notes, adjustments}
   */
  scorePrincipleBased(content) {
    let baseScore = 5; // Start neutral
    const adjustments = [];

    // Count principle indicators
    const whyExplanations = this.countMatches(this.principlePatterns.why_explanation, content);
    const patternNames = this.countMatches(this.principlePatterns.pattern_names, content);
    const conceptualTerms = this.countMatches(this.principlePatterns.conceptual_terms, content);
    const whySections = this.countMatches(this.principlePatterns.why_section, content);

    // Count implementation indicators
    const toolCommands = this.countMatches(this.principlePatterns.tool_commands, content);
    const filePaths = this.countMatches(this.principlePatterns.file_paths, content);
    const apiCalls = this.countMatches(this.principlePatterns.api_calls, content);

    const principleScore = whyExplanations + patternNames * 2 + conceptualTerms + whySections * 3;
    const implementationScore = toolCommands + filePaths * 0.5 + apiCalls * 0.2;

    // Check for "Why" section before "How"
    const whyIndex = content.search(/##\s*(why|rationale|principle|purpose)/i);
    const howIndex = content.search(/##\s*(how|implementation|setup|install)/i);

    if (whyIndex !== -1 && (howIndex === -1 || whyIndex < howIndex)) {
      baseScore += 2;
      adjustments.push('+2: "Why" section before "How" section');
    }

    // Principle naming bonus
    if (patternNames > 0) {
      baseScore += 2;
      adjustments.push(`+2: Explicitly names principles (${patternNames} refs)`);
    }

    // Implementation without rationale penalty
    if (implementationScore > principleScore * 2 && whyExplanations < 3) {
      baseScore -= 2;
      adjustments.push('-2: Implementation-heavy without sufficient rationale');
    }

    // Tool commands without principle context
    if (toolCommands > 0 && whyExplanations < toolCommands) {
      const penalty = Math.min(3, Math.floor(toolCommands / 2));
      baseScore -= penalty;
      adjustments.push(`-${penalty}: Tool commands without principle context`);
    }

    const score = Math.min(10, Math.max(1, baseScore));

    return {
      score,
      notes: `Principles: ${principleScore.toFixed(0)}, Implementation: ${implementationScore.toFixed(0)}`,
      adjustments
    };
  }

  /**
   * Score temporal projection criterion
   * @param {string} content - Document content
   * @returns {Object} {score, notes, adjustments}
   */
  scoreTemporalProjection(content) {
    let baseScore = 6; // Start slightly above neutral
    const adjustments = [];

    // Count short-lived indicators
    const experimental = this.countMatches(this.temporalPatterns.experimental, content);
    const recentFeature = this.countMatches(this.temporalPatterns.recent_feature, content);
    const frameworkSpecific = this.countMatches(this.temporalPatterns.framework_specific, content);
    const currentYear = this.countMatches(this.temporalPatterns.current_year, content);

    // Count long-lived indicators
    const standards = this.countMatches(this.temporalPatterns.standards, content);
    const fundamentals = this.countMatches(this.temporalPatterns.fundamentals, content);
    const designPatterns = this.countMatches(this.temporalPatterns.design_patterns, content);
    const csConcepts = this.countMatches(this.temporalPatterns.cs_concepts, content);

    // Apply scoring logic
    if (standards > 0 || csConcepts > 0) {
      baseScore += 2;
      adjustments.push(`+2: References standards/RFCs or CS fundamentals`);
    }

    if (designPatterns > 0) {
      baseScore += 1;
      adjustments.push(`+1: Uses design patterns (${designPatterns} refs)`);
    }

    if (experimental > 0) {
      baseScore -= 2;
      adjustments.push(`-2: Uses experimental/beta/preview features`);
    }

    if (frameworkSpecific > 0) {
      baseScore -= 1;
      adjustments.push(`-1: Tied to specific framework versions`);
    }

    if (currentYear > 2) {
      baseScore -= 1;
      adjustments.push(`-1: Multiple temporal anchors ("currently", "as of 20XX")`);
    }

    const score = Math.min(10, Math.max(1, baseScore));

    return {
      score,
      notes: `Ephemeral: ${experimental + recentFeature + frameworkSpecific}, Timeless: ${standards + designPatterns + csConcepts}`,
      adjustments
    };
  }

  /**
   * Score graceful degradation criterion
   * @param {string} content - Document content
   * @returns {Object} {score, notes, adjustments}
   */
  scoreGracefulDegradation(content) {
    let baseScore = 5; // Start neutral
    const adjustments = [];

    // Count positive patterns
    const alternatives = this.countMatches(this.degradationPatterns.alternatives, content);
    const modularity = this.countMatches(this.degradationPatterns.modularity, content);
    const progressive = this.countMatches(this.degradationPatterns.progressive, content);
    const migrationPath = this.countMatches(this.degradationPatterns.migration_path, content);

    // Count negative patterns
    const singleDependency = this.countMatches(this.degradationPatterns.single_dependency, content);
    const noFallback = this.countMatches(this.degradationPatterns.no_fallback, content);
    const tightCoupling = this.countMatches(this.degradationPatterns.tight_coupling, content);

    // Apply scoring logic
    if (alternatives >= 2) {
      baseScore += 2;
      adjustments.push(`+2: Provides 2+ alternatives for components`);
    } else if (alternatives > 0) {
      baseScore += 1;
      adjustments.push(`+1: Mentions alternatives`);
    }

    if (migrationPath > 0) {
      baseScore += 1;
      adjustments.push(`+1: Documents migration/upgrade paths`);
    }

    if (modularity > 2) {
      baseScore += 1;
      adjustments.push(`+1: Modular/replaceable component design`);
    }

    if (singleDependency > 0 && alternatives === 0) {
      baseScore -= 2;
      adjustments.push(`-2: Single-tool dependency with no alternatives`);
    }

    if (noFallback > 0) {
      baseScore -= 1;
      adjustments.push(`-1: Uses "must use"/"only works with" phrases`);
    }

    if (tightCoupling > 0) {
      baseScore -= 1;
      adjustments.push(`-1: Mentions tight coupling without alternatives`);
    }

    const score = Math.min(10, Math.max(1, baseScore));

    return {
      score,
      notes: `Alternatives: ${alternatives}, Modularity: ${modularity}, Single deps: ${singleDependency}`,
      adjustments
    };
  }

  /**
   * Detect anti-patterns in content
   * @param {string} content - Document content
   * @returns {Array} Array of anti-pattern findings
   */
  detectAntiPatterns(content) {
    const findings = [];
    const wordCount = this.countWords(content);

    // 1. Version Pinning
    const versionPins = this.findMatchesWithLocation(this.antiPatterns.version_pinning.pattern, content);
    for (const pin of versionPins) {
      findings.push({
        type: 'version_pinning',
        location: `line ${pin.line}`,
        match: pin.match,
        severity: this.antiPatterns.version_pinning.severity,
        remediation: this.antiPatterns.version_pinning.remediation
      });
    }

    // 2. Tool-Specific Without Abstraction
    const toolCommands = this.findMatchesWithLocation(this.antiPatterns.tool_specific.pattern, content);
    for (const cmd of toolCommands) {
      const hasContext = this.hasContextNearby(
        content,
        cmd.index,
        this.antiPatterns.tool_specific.contextPattern,
        this.antiPatterns.tool_specific.contextWindow
      );
      if (!hasContext) {
        findings.push({
          type: 'tool_specific',
          location: `line ${cmd.line}`,
          match: cmd.match,
          severity: this.antiPatterns.tool_specific.severity,
          remediation: this.antiPatterns.tool_specific.remediation
        });
      }
    }

    // 3. Missing Extension Points
    const extensionMatches = this.countMatches(this.antiPatterns.missing_extensions.positivePattern, content);
    if (extensionMatches === 0 && wordCount > this.antiPatterns.missing_extensions.wordThreshold) {
      findings.push({
        type: 'missing_extensions',
        location: 'document-level',
        match: `${wordCount} words with no extension mentions`,
        severity: this.antiPatterns.missing_extensions.severity,
        remediation: this.antiPatterns.missing_extensions.remediation
      });
    }

    // 4. Implicit Dependencies
    const implicitDeps = this.findMatchesWithLocation(this.antiPatterns.implicit_deps.pattern, content);
    for (const dep of implicitDeps) {
      findings.push({
        type: 'implicit_deps',
        location: `line ${dep.line}`,
        match: dep.match,
        severity: this.antiPatterns.implicit_deps.severity,
        remediation: this.antiPatterns.implicit_deps.remediation
      });
    }

    // 5. Temporal Anchoring
    const temporalAnchors = this.findMatchesWithLocation(this.antiPatterns.temporal_anchoring.pattern, content);
    for (const anchor of temporalAnchors.slice(0, 4)) { // Cap at 4 findings
      findings.push({
        type: 'temporal_anchoring',
        location: `line ${anchor.line}`,
        match: anchor.match,
        severity: this.antiPatterns.temporal_anchoring.severity,
        remediation: this.antiPatterns.temporal_anchoring.remediation
      });
    }

    // 6. Framework Worship
    const frameworkWorship = this.findMatchesWithLocation(this.antiPatterns.framework_worship.pattern, content);
    for (const fw of frameworkWorship) {
      findings.push({
        type: 'framework_worship',
        location: `line ${fw.line}`,
        match: fw.match,
        severity: this.antiPatterns.framework_worship.severity,
        remediation: this.antiPatterns.framework_worship.remediation
      });
    }

    // 7. Magic Numbers
    const magicNumbers = this.findMatchesWithLocation(this.antiPatterns.magic_numbers.pattern, content);
    for (const num of magicNumbers.slice(0, 4)) { // Cap at 4 findings
      const hasContext = this.hasContextNearby(
        content,
        num.index,
        this.antiPatterns.magic_numbers.contextPattern,
        this.antiPatterns.magic_numbers.contextWindow
      );
      if (!hasContext) {
        findings.push({
          type: 'magic_numbers',
          location: `line ${num.line}`,
          match: num.match,
          severity: this.antiPatterns.magic_numbers.severity,
          remediation: this.antiPatterns.magic_numbers.remediation
        });
      }
    }

    return findings;
  }

  /**
   * Calculate anti-pattern impact on score
   * @param {Array} antiPatterns - Array of anti-pattern findings
   * @returns {number} Total score adjustment (negative)
   */
  calculateAntiPatternImpact(antiPatterns) {
    const impactByType = {};
    let totalImpact = 0;

    for (const ap of antiPatterns) {
      const config = this.antiPatterns[ap.type];
      if (!config) continue;

      if (!impactByType[ap.type]) {
        impactByType[ap.type] = 0;
      }

      const maxImpact = config.maxImpact || (config.impact * 5);
      const currentImpact = impactByType[ap.type] + config.impact;

      if (currentImpact >= maxImpact) {
        impactByType[ap.type] = maxImpact;
      } else {
        impactByType[ap.type] = currentImpact;
      }
    }

    for (const type in impactByType) {
      totalImpact += impactByType[type];
    }

    return totalImpact;
  }

  /**
   * Generate recommendations based on scores and anti-patterns
   * @param {Object} breakdown - Score breakdown
   * @param {Array} antiPatterns - Anti-pattern findings
   * @returns {Array} Array of recommendation strings
   */
  generateRecommendations(breakdown, antiPatterns) {
    const recommendations = [];

    // Low score recommendations
    if (breakdown.dependency_stability < 6) {
      recommendations.push('Use version ranges (^x.y.z, >=x) instead of exact versions');
      recommendations.push('Add capability-based requirements instead of tool-specific versions');
    }

    if (breakdown.extension_points < 6) {
      recommendations.push('Add "Extension Points" or "Customization" section');
      recommendations.push('Define interfaces/contracts for pluggable components');
    }

    if (breakdown.principle_based < 6) {
      recommendations.push('Add "Why" section before implementation details');
      recommendations.push('Name the underlying principles (DRY, SOLID, etc.)');
    }

    if (breakdown.temporal_projection < 6) {
      recommendations.push('Reference standards (RFC, ISO) instead of framework versions');
      recommendations.push('Remove temporal anchors ("currently", "as of 2024")');
    }

    if (breakdown.graceful_degradation < 6) {
      recommendations.push('Provide alternatives for critical dependencies');
      recommendations.push('Document migration paths for when tools change');
    }

    // Anti-pattern specific recommendations
    const antiPatternTypes = [...new Set(antiPatterns.map(ap => ap.type))];
    for (const type of antiPatternTypes) {
      const config = this.antiPatterns[type];
      if (config && config.remediation && !recommendations.includes(config.remediation)) {
        recommendations.push(config.remediation);
      }
    }

    // Deduplicate and limit
    return [...new Set(recommendations)].slice(0, 5);
  }

  /**
   * Determine verdict based on score and document type
   * @param {number} score - Final weighted score
   * @param {string} docType - Document type
   * @returns {string} 'approved' | 'requires_revision' | 'rejected'
   */
  getVerdict(score, docType) {
    const threshold = this.thresholds[docType] || this.thresholds.general_docs;

    if (score >= threshold) {
      return 'approved';
    } else if (score >= threshold - 2) {
      return 'requires_revision';
    } else {
      return 'rejected';
    }
  }

  /**
   * Main validation method
   * @param {string} filePath - Path to markdown file to validate
   * @param {Object} options - Validation options
   * @returns {Object} Scoring result
   */
  async validate(filePath, options = {}) {
    const startTime = Date.now();

    const result = {
      score: 0,
      breakdown: {
        dependency_stability: 0,
        extension_points: 0,
        principle_based: 0,
        temporal_projection: 0,
        graceful_degradation: 0
      },
      anti_patterns: [],
      verdict: 'requires_revision',
      recommendations: [],
      passed: true,
      errors: [],
      warnings: [],
      metadata: {
        file: filePath,
        document_type: 'general_docs',
        word_count: 0,
        evaluation_time_ms: 0
      }
    };

    try {
      // Check file exists
      if (!fs.existsSync(filePath)) {
        result.passed = false;
        result.errors.push(`File not found: ${filePath}`);
        return result;
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.md' && ext !== '.markdown') {
        result.warnings.push(`File is not markdown (${ext}) - scoring may be less accurate`);
      }

      // Read content
      const content = fs.readFileSync(filePath, 'utf8');
      const wordCount = this.countWords(content);

      result.metadata.word_count = wordCount;
      result.metadata.document_type = this.getDocumentType(filePath);

      // Skip very short documents
      if (wordCount < 50) {
        result.warnings.push('Document too short for meaningful evolution scoring (<50 words)');
        result.score = 5; // Neutral score
        result.verdict = 'approved';
        result.metadata.evaluation_time_ms = Date.now() - startTime;
        return result;
      }

      // Score each criterion
      const depStability = this.scoreDependencyStability(content);
      const extPoints = this.scoreExtensionPoints(content);
      const principle = this.scorePrincipleBased(content);
      const temporal = this.scoreTemporalProjection(content);
      const degradation = this.scoreGracefulDegradation(content);

      result.breakdown = {
        dependency_stability: depStability.score,
        extension_points: extPoints.score,
        principle_based: principle.score,
        temporal_projection: temporal.score,
        graceful_degradation: degradation.score
      };

      // Detect anti-patterns
      result.anti_patterns = this.detectAntiPatterns(content);

      // Calculate weighted score
      let weightedScore =
        depStability.score * this.weights.dependency_stability +
        extPoints.score * this.weights.extension_points +
        principle.score * this.weights.principle_based +
        temporal.score * this.weights.temporal_projection +
        degradation.score * this.weights.graceful_degradation;

      // Apply anti-pattern impact (capped at -3)
      const antiPatternImpact = Math.max(-3, this.calculateAntiPatternImpact(result.anti_patterns));
      weightedScore += antiPatternImpact;

      // Clamp final score
      result.score = Math.round(Math.max(1, Math.min(10, weightedScore)) * 10) / 10;

      // Determine verdict
      result.verdict = this.getVerdict(result.score, result.metadata.document_type);

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result.breakdown, result.anti_patterns);

      // Set pass/fail based on verdict
      result.passed = result.verdict === 'approved';

      // Add scoring notes to metadata for debugging
      result.metadata.scoring_notes = {
        dependency_stability: depStability.adjustments,
        extension_points: extPoints.adjustments,
        principle_based: principle.adjustments,
        temporal_projection: temporal.adjustments,
        graceful_degradation: degradation.adjustments,
        anti_pattern_impact: antiPatternImpact
      };

      result.metadata.evaluation_time_ms = Date.now() - startTime;

    } catch (error) {
      result.passed = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Generate human-readable report
   * @param {Object} result - Validation result from validate()
   * @returns {string} Formatted report
   */
  generateReport(result) {
    const lines = [
      '═══════════════════════════════════════════════════════════════════',
      'EVOLUTION SCORING REPORT',
      '═══════════════════════════════════════════════════════════════════',
      '',
      `File: ${result.metadata.file}`,
      `Type: ${result.metadata.document_type}`,
      `Words: ${result.metadata.word_count}`,
      `Time: ${result.metadata.evaluation_time_ms}ms`,
      '',
      '───────────────────────────────────────────────────────────────────',
      `FINAL SCORE: ${result.score}/10 - ${result.verdict.toUpperCase()}`,
      '───────────────────────────────────────────────────────────────────',
      '',
      'BREAKDOWN:',
      `  Dependency Stability (25%):    ${result.breakdown.dependency_stability}/10`,
      `  Extension Points (25%):        ${result.breakdown.extension_points}/10`,
      `  Principle-Based (20%):         ${result.breakdown.principle_based}/10`,
      `  Temporal Projection (15%):     ${result.breakdown.temporal_projection}/10`,
      `  Graceful Degradation (15%):    ${result.breakdown.graceful_degradation}/10`,
      ''
    ];

    if (result.anti_patterns.length > 0) {
      lines.push('ANTI-PATTERNS DETECTED:');
      for (const ap of result.anti_patterns.slice(0, 10)) {
        const icon = ap.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
        lines.push(`  ${icon}[${ap.type}] ${ap.location}: ${ap.match}`);
      }
      if (result.anti_patterns.length > 10) {
        lines.push(`  ... and ${result.anti_patterns.length - 10} more`);
      }
      lines.push('');
    }

    if (result.recommendations.length > 0) {
      lines.push('RECOMMENDATIONS:');
      for (const rec of result.recommendations) {
        lines.push(`  → ${rec}`);
      }
      lines.push('');
    }

    if (result.errors.length > 0) {
      lines.push('ERRORS:');
      for (const err of result.errors) {
        lines.push(`  ❌ ${err}`);
      }
      lines.push('');
    }

    lines.push('───────────────────────────────────────────────────────────────────');
    lines.push('SCORE SCALE:');
    lines.push('  1-4: Reject (requires rewrite)');
    lines.push('  5-6: Requires Revision (sound core, hardcoded elements)');
    lines.push('  7-8: Approved (principle-based with extension points)');
    lines.push('  9-10: Exemplary (fundamental, highly composable)');
    lines.push('═══════════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}

// Export both the class and a default instance
const validator = new EvolutionScoringValidator();

module.exports = validator;
module.exports.EvolutionScoringValidator = EvolutionScoringValidator;

// CLI support when run directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node evolution_scoring.js <file.md> [--verbose]');
    process.exit(1);
  }

  const filePath = args[0];
  const verbose = args.includes('--verbose') || args.includes('-v');

  validator.validate(filePath).then(result => {
    if (verbose) {
      console.log(validator.generateReport(result));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(result.passed ? 0 : 1);
  }).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
