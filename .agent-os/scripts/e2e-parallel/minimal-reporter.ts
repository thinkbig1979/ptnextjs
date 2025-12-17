/**
 * Minimal JSON Reporter for Parallel E2E Tests
 *
 * This reporter outputs ONLY the essential information:
 * - Pass/fail/skip counts
 * - Failure details (file, title, error, stack)
 *
 * Designed for minimal context consumption when aggregating across shards.
 *
 * Usage in playwright.config.ts:
 *   reporter: [['./scripts/e2e-parallel/minimal-reporter.ts', { outputFile: 'shard-1.json' }]]
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import type { ShardResult, TestFailure } from './types';

interface MinimalReporterOptions {
  outputFile?: string;
  shard?: number;
  totalShards?: number;
}

class MinimalReporter implements Reporter {
  private outputFile: string;
  private shard: number;
  private totalShards: number;
  private failures: TestFailure[] = [];
  private stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
  };
  private startTime: number = 0;

  constructor(options: MinimalReporterOptions = {}) {
    // Priority: env vars > options > defaults
    this.outputFile = process.env.PARALLEL_OUTPUT_FILE || options.outputFile || 'test-results.json';
    this.shard = parseInt(process.env.PARALLEL_SHARD || '', 10) || options.shard || 1;
    this.totalShards = parseInt(process.env.PARALLEL_TOTAL_SHARDS || '', 10) || options.totalShards || 1;
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();

    // Extract shard info from config if available
    if (config.shard) {
      this.shard = config.shard.current;
      this.totalShards = config.shard.total;
    }

    // Count total tests
    this.stats.total = this.countTests(suite);
  }

  private countTests(suite: Suite): number {
    let count = suite.tests.length;
    for (const child of suite.suites) {
      count += this.countTests(child);
    }
    return count;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    switch (result.status) {
      case 'passed':
        this.stats.passed++;
        break;
      case 'failed':
      case 'timedOut':
        this.stats.failed++;
        this.recordFailure(test, result);
        break;
      case 'skipped':
        this.stats.skipped++;
        break;
    }

    // Track flaky tests (passed on retry)
    if (result.status === 'passed' && result.retry > 0) {
      this.stats.flaky++;
    }
  }

  private recordFailure(test: TestCase, result: TestResult): void {
    const error = result.errors[0];
    const errorMessage = error?.message || 'Unknown error';
    const stack = error?.stack || '';

    // Truncate stack trace to first 10 lines to minimize context
    const truncatedStack = stack
      .split('\n')
      .slice(0, 10)
      .join('\n');

    this.failures.push({
      file: test.location.file.replace(process.cwd(), '').replace(/^\//, ''),
      title: test.titlePath().join(' > '),
      error: errorMessage.substring(0, 500), // Truncate long errors
      stack: truncatedStack,
      duration: result.duration,
    });
  }

  onEnd(result: FullResult): void {
    const durationSeconds = (Date.now() - this.startTime) / 1000;

    const output: ShardResult = {
      shard: this.shard,
      totalShards: this.totalShards,
      stats: this.stats,
      durationSeconds: Math.round(durationSeconds * 10) / 10,
      failures: this.failures,
      exitCode: result.status === 'passed' ? 0 : 1,
    };

    // Ensure output directory exists
    const outputDir = path.dirname(this.outputFile);
    if (outputDir && outputDir !== '.') {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write compact JSON (no pretty printing to minimize size)
    fs.writeFileSync(this.outputFile, JSON.stringify(output));

    // Also output a summary line to stdout for real-time monitoring
    const statusEmoji = this.stats.failed > 0 ? '❌' : '✅';
    console.log(
      `\n${statusEmoji} Shard ${this.shard}/${this.totalShards}: ` +
      `${this.stats.passed}/${this.stats.total} passed, ` +
      `${this.stats.failed} failed, ` +
      `${this.stats.skipped} skipped ` +
      `(${durationSeconds.toFixed(1)}s)`
    );
  }
}

export default MinimalReporter;
