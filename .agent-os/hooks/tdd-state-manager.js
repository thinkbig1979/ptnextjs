/**
 * TDD State Manager
 *
 * Tracks RED-GREEN-REFACTOR cycle progression for each task to enforce
 * test-first development. Provides state persistence, validation, and
 * metrics tracking.
 *
 * Usage:
 *   const { TDDStateManager } = require('./hooks/tdd-state-manager.js');
 *   const manager = new TDDStateManager();
 *
 *   // Load or create state for a task
 *   const state = await manager.loadState('task-001');
 *
 *   // Transition phase
 *   await manager.transitionPhase('task-001', 'RED');
 *   await manager.transitionPhase('task-001', 'GREEN');
 *
 *   // Update metrics
 *   await manager.updateMetrics('task-001', { tests_written: 5 });
 *
 *   // Validate action is allowed in current phase
 *   const allowed = await manager.validatePhaseForAction('task-001', 'implement');
 *
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class TDDStateManager {
  constructor(options = {}) {
    // State directory - can be project-local or global
    this.stateDirectory = options.stateDirectory ||
      path.join(process.env.HOME, '.agent-os', 'tdd-state');

    // Load configuration
    this.config = options.config || this.loadConfig();
    this.tddConfig = this.config?.tdd_enforcement || {};

    // Ensure state directory exists
    this.ensureStateDirectory();

    // Valid TDD phases
    this.phases = ['INIT', 'RED', 'GREEN', 'REFACTOR', 'COMPLETE'];

    // Valid phase transitions
    this.validTransitions = {
      'INIT': ['RED'],
      'RED': ['GREEN', 'RED'],  // Can stay in RED if tests still failing
      'GREEN': ['REFACTOR', 'COMPLETE'],
      'REFACTOR': ['RED', 'COMPLETE'],  // New feature = back to RED
      'COMPLETE': []  // Terminal state
    };

    // Actions allowed per phase
    this.allowedActions = {
      'INIT': ['write_tests'],
      'RED': ['write_tests', 'run_tests'],
      'GREEN': ['implement', 'refactor', 'run_tests'],
      'REFACTOR': ['refactor', 'run_tests', 'write_tests']
    };
  }

  /**
   * Load configuration from Agent OS config.yml
   */
  loadConfig() {
    try {
      const configPaths = [
        path.join(process.cwd(), '.agent-os', 'config.yml'),
        path.join(process.env.HOME, '.agent-os', 'config.yml'),
      ];

      for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf8');
          return yaml.load(configContent);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not load config: ${error.message}`);
    }
    return {};
  }

  /**
   * Ensure state directory exists
   */
  ensureStateDirectory() {
    if (!fs.existsSync(this.stateDirectory)) {
      fs.mkdirSync(this.stateDirectory, { recursive: true });
    }
  }

  /**
   * Get state file path for a task
   */
  getStatePath(taskId) {
    // Normalize task ID to be filesystem-safe
    const safeTaskId = taskId.replace(/[^a-zA-Z0-9-_]/g, '-');
    return path.join(this.stateDirectory, `test-${safeTaskId}.json`);
  }

  /**
   * Load state for a task, creating initial state if needed
   */
  async loadState(taskId) {
    const statePath = this.getStatePath(taskId);

    if (fs.existsSync(statePath)) {
      try {
        const content = fs.readFileSync(statePath, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.warn(`Warning: Could not parse state for ${taskId}, creating new state`);
      }
    }

    return this.createInitialState(taskId);
  }

  /**
   * Create initial state for a new task
   */
  createInitialState(taskId) {
    const now = new Date().toISOString();
    return {
      task_id: taskId,
      current_phase: 'INIT',
      enforcement_level: this.tddConfig?.enforcement_level || 'STANDARD',
      test_failures: 0,
      created_at: now,
      updated_at: now,
      phase_history: [{
        phase: 'INIT',
        timestamp: now,
        reason: 'Task initialized'
      }],
      metrics: {
        tests_written: 0,
        tests_passing: 0,
        tests_failing: 0,
        coverage: 0,
        implementation_loc: 0,
        refactoring_count: 0
      },
      blocking_issues: [],
      notes: []
    };
  }

  /**
   * Save state to disk
   */
  async saveState(taskId, state) {
    const statePath = this.getStatePath(taskId);
    state.updated_at = new Date().toISOString();
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Transition to a new TDD phase
   */
  async transitionPhase(taskId, newPhase, metadata = {}) {
    const state = await this.loadState(taskId);
    const currentPhase = state.current_phase;

    // Validate new phase is valid
    if (!this.phases.includes(newPhase)) {
      throw new Error(
        `Invalid TDD phase: ${newPhase}. Valid phases: ${this.phases.join(', ')}`
      );
    }

    // Validate transition is allowed
    if (!this.validTransitions[currentPhase]?.includes(newPhase)) {
      const validOptions = this.validTransitions[currentPhase];
      throw new TDDTransitionError(
        `Invalid TDD transition: ${currentPhase} → ${newPhase}. ` +
        `Valid transitions from ${currentPhase}: ${validOptions.join(', ') || 'none (terminal state)'}`,
        currentPhase,
        newPhase,
        validOptions
      );
    }

    // Perform transition
    state.current_phase = newPhase;
    state.phase_history.push({
      phase: newPhase,
      from_phase: currentPhase,
      timestamp: new Date().toISOString(),
      ...metadata
    });

    // Clear blocking issues on successful transition
    if (newPhase !== currentPhase) {
      state.blocking_issues = [];
    }

    await this.saveState(taskId, state);
    return state;
  }

  /**
   * Update metrics for a task
   */
  async updateMetrics(taskId, metrics) {
    const state = await this.loadState(taskId);

    // Merge new metrics with existing
    state.metrics = {
      ...state.metrics,
      ...metrics,
      last_updated: new Date().toISOString()
    };

    // Auto-transition based on metrics
    await this.checkAutoTransition(state, metrics);

    await this.saveState(taskId, state);
    return state;
  }

  /**
   * Check if automatic phase transition should occur based on metrics
   */
  async checkAutoTransition(state, metrics) {
    const { current_phase } = state;
    const { tests_passing, tests_failing } = { ...state.metrics, ...metrics };

    // RED → GREEN: All tests passing
    if (current_phase === 'RED' && tests_failing === 0 && tests_passing > 0) {
      state.phase_history.push({
        phase: 'GREEN',
        from_phase: 'RED',
        timestamp: new Date().toISOString(),
        reason: 'auto_transition',
        trigger: 'All tests passing'
      });
      state.current_phase = 'GREEN';
    }
  }

  /**
   * Validate that an action is allowed in the current phase
   */
  async validatePhaseForAction(taskId, action) {
    const state = await this.loadState(taskId);
    const currentPhase = state.current_phase;
    const allowed = this.allowedActions[currentPhase] || [];

    return {
      allowed: allowed.includes(action),
      current_phase: currentPhase,
      allowed_actions: allowed,
      enforcement_level: state.enforcement_level
    };
  }

  /**
   * Block implementation if not in correct phase
   */
  async blockImplementation(taskId) {
    const { allowed, current_phase, enforcement_level } = await this.validatePhaseForAction(taskId, 'implement');

    if (!allowed) {
      const message = `TDD violation: Cannot implement in ${current_phase} phase. ` +
        `Write and pass tests first (RED → GREEN transition required).`;

      if (enforcement_level === 'strict') {
        throw new TDDViolationError(message, current_phase, 'implement');
      } else if (enforcement_level === 'standard') {
        console.warn(`⚠️  ${message}`);
        return { blocked: false, warning: message };
      }
      // relaxed: just log
      console.log(`ℹ️  ${message}`);
    }

    return { blocked: false };
  }

  /**
   * Add a blocking issue
   */
  async addBlockingIssue(taskId, issue) {
    const state = await this.loadState(taskId);
    state.blocking_issues.push({
      ...issue,
      added_at: new Date().toISOString()
    });
    await this.saveState(taskId, state);
    return state;
  }

  /**
   * Add a note to the task
   */
  async addNote(taskId, note) {
    const state = await this.loadState(taskId);
    state.notes.push({
      content: note,
      added_at: new Date().toISOString()
    });
    await this.saveState(taskId, state);
    return state;
  }

  /**
   * Get summary of TDD progress for a task
   */
  async getSummary(taskId) {
    const state = await this.loadState(taskId);
    const { metrics, phase_history, current_phase } = state;

    // Calculate time in each phase
    const phaseTime = {};
    for (let i = 0; i < phase_history.length; i++) {
      const entry = phase_history[i];
      const nextEntry = phase_history[i + 1];
      const duration = nextEntry
        ? new Date(nextEntry.timestamp) - new Date(entry.timestamp)
        : Date.now() - new Date(entry.timestamp);
      phaseTime[entry.phase] = (phaseTime[entry.phase] || 0) + duration;
    }

    return {
      task_id: state.task_id,
      current_phase,
      enforcement_level: state.enforcement_level,
      metrics,
      phase_transitions: phase_history.length,
      time_in_phases: Object.fromEntries(
        Object.entries(phaseTime).map(([phase, ms]) => [
          phase,
          `${Math.round(ms / 1000)}s`
        ])
      ),
      blocking_issues: state.blocking_issues,
      notes: state.notes
    };
  }

  /**
   * List all tracked tasks
   */
  async listTasks() {
    const files = fs.readdirSync(this.stateDirectory)
      .filter(f => f.startsWith('test-') && f.endsWith('.json'));

    const tasks = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.stateDirectory, file), 'utf8');
        const state = JSON.parse(content);
        tasks.push({
          task_id: state.task_id,
          current_phase: state.current_phase,
          updated_at: state.updated_at,
          tests_written: state.metrics.tests_written,
          tests_passing: state.metrics.tests_passing
        });
      } catch (error) {
        // Skip invalid files
      }
    }

    return tasks;
  }

  /**
   * Archive a completed task
   */
  async archiveTask(taskId) {
    const statePath = this.getStatePath(taskId);
    if (!fs.existsSync(statePath)) {
      throw new Error(`No state found for task: ${taskId}`);
    }

    const archiveDir = path.join(this.stateDirectory, 'archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const archivePath = path.join(archiveDir, path.basename(statePath));
    fs.renameSync(statePath, archivePath);

    return { archived: true, path: archivePath };
  }
}

/**
 * Custom error for TDD transition violations
 */
class TDDTransitionError extends Error {
  constructor(message, fromPhase, toPhase, validTransitions) {
    super(message);
    this.name = 'TDDTransitionError';
    this.fromPhase = fromPhase;
    this.toPhase = toPhase;
    this.validTransitions = validTransitions;
  }
}

/**
 * Custom error for TDD action violations
 */
class TDDViolationError extends Error {
  constructor(message, currentPhase, attemptedAction) {
    super(message);
    this.name = 'TDDViolationError';
    this.currentPhase = currentPhase;
    this.attemptedAction = attemptedAction;
  }
}

module.exports = {
  TDDStateManager,
  TDDTransitionError,
  TDDViolationError
};
