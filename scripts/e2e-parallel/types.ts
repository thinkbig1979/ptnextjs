/**
 * Types for Parallel E2E Test Runner
 *
 * These types define the structure of test results for minimal context aggregation.
 */

export interface TestFailure {
  /** Test file path relative to test directory */
  file: string;
  /** Full test title including describe blocks */
  title: string;
  /** Error message */
  error: string;
  /** Stack trace (truncated) */
  stack?: string;
  /** Duration in ms */
  duration: number;
}

export interface ShardResult {
  /** Shard index (1-based) */
  shard: number;
  /** Total shards in this run */
  totalShards: number;
  /** Statistics */
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
  };
  /** Duration in seconds */
  durationSeconds: number;
  /** Only failed tests - keeps context minimal */
  failures: TestFailure[];
  /** Exit code from Playwright */
  exitCode: number;
  /** Any stderr output (errors only) */
  stderr?: string;
}

export interface AggregatedResults {
  /** Timestamp of run */
  timestamp: string;
  /** Total duration (wall clock time, not sum of shards) */
  totalDurationSeconds: number;
  /** Aggregated statistics */
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
  };
  /** All failures from all shards */
  failures: TestFailure[];
  /** Per-shard summary (no test details, just stats) */
  shardSummaries: Array<{
    shard: number;
    stats: ShardResult['stats'];
    durationSeconds: number;
    exitCode: number;
  }>;
  /** Overall success */
  success: boolean;
}

export interface ParallelRunnerConfig {
  /** Number of shards to split tests into (default: 4) */
  shardCount: number;
  /** Workers per shard (default: 1 for single dev server) */
  workersPerShard: number;
  /** Base URL for dev server */
  baseUrl: string;
  /** Output directory for results */
  outputDir: string;
  /** Max failures before stopping a shard (0 = no limit) */
  maxFailuresPerShard: number;
  /** Timeout per test in ms */
  testTimeout: number;
  /** Whether to fail fast across all shards */
  failFast: boolean;
  /** Additional Playwright args */
  playwrightArgs: string[];
}

export const DEFAULT_CONFIG: ParallelRunnerConfig = {
  shardCount: 4,
  workersPerShard: 1,
  baseUrl: 'http://localhost:3000',
  outputDir: './test-results/parallel',
  maxFailuresPerShard: 0,
  testTimeout: 60000,
  failFast: false,
  playwrightArgs: [],
};
