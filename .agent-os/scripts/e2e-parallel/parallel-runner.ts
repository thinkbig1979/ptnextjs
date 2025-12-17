#!/usr/bin/env npx tsx
/**
 * Parallel E2E Test Runner
 *
 * Orchestrates parallel Playwright test execution across multiple shards,
 * designed for minimal main-thread context consumption.
 *
 * Features:
 * - Splits tests into N shards using Playwright's native sharding
 * - Each shard runs with --workers=1 to avoid overloading single dev server
 * - Aggregates results with ONLY failure details (minimal context)
 * - Real-time progress updates via stdout
 * - Configurable fail-fast behavior
 *
 * Usage:
 *   npx tsx scripts/e2e-parallel/parallel-runner.ts [options]
 *
 * Options:
 *   --shards=N       Number of parallel shards (default: 4)
 *   --fail-fast      Stop all shards on first failure
 *   --timeout=MS     Test timeout in milliseconds (default: 60000)
 *   --max-failures=N Stop shard after N failures (default: 0 = no limit)
 *   --output=DIR     Output directory (default: ./test-results/parallel)
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type {
  ShardResult,
  AggregatedResults,
  ParallelRunnerConfig,
  DEFAULT_CONFIG,
} from './types';

// Parse command line arguments
function parseArgs(): Partial<ParallelRunnerConfig> {
  const args: Partial<ParallelRunnerConfig> = {};

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--shards=')) {
      args.shardCount = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--fail-fast') {
      args.failFast = true;
    } else if (arg.startsWith('--timeout=')) {
      args.testTimeout = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--max-failures=')) {
      args.maxFailuresPerShard = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--output=')) {
      args.outputDir = arg.split('=')[1];
    } else if (arg.startsWith('--workers=')) {
      args.workersPerShard = parseInt(arg.split('=')[1], 10);
    }
  }

  return args;
}

// Default configuration
const defaultConfig: ParallelRunnerConfig = {
  shardCount: 4,
  workersPerShard: 1,
  baseUrl: 'http://localhost:3000',
  outputDir: './test-results/parallel',
  maxFailuresPerShard: 0,
  testTimeout: 60000,
  failFast: false,
  playwrightArgs: [],
};

class ParallelTestRunner {
  private config: ParallelRunnerConfig;
  private processes: Map<number, ChildProcess> = new Map();
  private results: Map<number, ShardResult> = new Map();
  private startTime: number = 0;
  private aborted: boolean = false;

  constructor(config: Partial<ParallelRunnerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async run(): Promise<AggregatedResults> {
    this.startTime = Date.now();

    console.log('\n' + '═'.repeat(60));
    console.log('  PARALLEL E2E TEST RUNNER');
    console.log('═'.repeat(60));
    console.log(`  Shards: ${this.config.shardCount}`);
    console.log(`  Workers per shard: ${this.config.workersPerShard}`);
    console.log(`  Output: ${this.config.outputDir}`);
    console.log(`  Fail fast: ${this.config.failFast}`);
    console.log(`  Rate limiting: DISABLED`);
    console.log('═'.repeat(60) + '\n');

    // Ensure output directory exists
    fs.mkdirSync(this.config.outputDir, { recursive: true });

    // Check server is available
    const serverOk = await this.checkServer();
    if (!serverOk) {
      console.error('❌ Dev server not available at', this.config.baseUrl);
      console.error('   Start it with: DISABLE_EMAILS=true DISABLE_RATE_LIMIT=true npm run dev');
      process.exit(1);
    }
    console.log('✅ Dev server is ready');

    // Clear any existing rate limits before starting tests
    await this.clearRateLimits();
    console.log('✅ Rate limits cleared\n');

    // Launch all shards in parallel
    const shardPromises: Promise<ShardResult>[] = [];
    for (let i = 1; i <= this.config.shardCount; i++) {
      shardPromises.push(this.runShard(i));
    }

    // Wait for all shards to complete
    const shardResults = await Promise.all(shardPromises);

    // Store results
    for (const result of shardResults) {
      this.results.set(result.shard, result);
    }

    // Aggregate and return results
    return this.aggregateResults();
  }

  private async checkServer(): Promise<boolean> {
    const maxAttempts = 3;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(this.config.baseUrl, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok || response.status === 200) {
          return true;
        }
      } catch {
        // Server not ready
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
  }

  private async clearRateLimits(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/test/rate-limit/clear`, {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        console.warn('⚠️  Could not clear rate limits (non-critical)');
      }
    } catch {
      // Non-critical - rate limiting may be disabled anyway
      console.warn('⚠️  Rate limit clear endpoint not available (non-critical)');
    }
  }

  private async runShard(shardIndex: number): Promise<ShardResult> {
    const outputFile = path.join(
      this.config.outputDir,
      `shard-${shardIndex}.json`
    );

    const args = [
      'playwright',
      'test',
      `--shard=${shardIndex}/${this.config.shardCount}`,
      `--workers=${this.config.workersPerShard}`,
      '--reporter=./scripts/e2e-parallel/minimal-reporter.ts',
    ];

    if (this.config.maxFailuresPerShard > 0) {
      args.push(`--max-failures=${this.config.maxFailuresPerShard}`);
    }

    // Add any extra args
    args.push(...this.config.playwrightArgs);

    console.log(`🚀 Starting shard ${shardIndex}/${this.config.shardCount}...`);

    return new Promise((resolve) => {
      const proc = spawn('npx', args, {
        env: {
          ...process.env,
          DISABLE_EMAILS: 'true',
          DISABLE_RATE_LIMIT: 'true', // Prevent 429 errors during parallel test runs
          // Pass shard info to reporter via env
          PARALLEL_SHARD: String(shardIndex),
          PARALLEL_TOTAL_SHARDS: String(this.config.shardCount),
          PARALLEL_OUTPUT_FILE: outputFile,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: process.cwd(),
      });

      this.processes.set(shardIndex, proc);

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
        // Echo summary lines (from minimal reporter)
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.includes('Shard') && (line.includes('✅') || line.includes('❌'))) {
            console.log(line);
          }
        }
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        this.processes.delete(shardIndex);

        // Try to read the JSON output file
        let result: ShardResult;
        try {
          if (fs.existsSync(outputFile)) {
            result = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
          } else {
            // Reporter didn't write file - construct from process info
            result = {
              shard: shardIndex,
              totalShards: this.config.shardCount,
              stats: { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 },
              durationSeconds: 0,
              failures: [],
              exitCode: code || 1,
              stderr: stderr.substring(0, 1000),
            };
          }
        } catch {
          result = {
            shard: shardIndex,
            totalShards: this.config.shardCount,
            stats: { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 },
            durationSeconds: 0,
            failures: [{
              file: 'unknown',
              title: 'Shard execution failed',
              error: stderr.substring(0, 500) || 'Unknown error',
              duration: 0,
            }],
            exitCode: code || 1,
            stderr: stderr.substring(0, 1000),
          };
        }

        // Handle fail-fast
        if (this.config.failFast && result.stats.failed > 0 && !this.aborted) {
          this.aborted = true;
          console.log('\n⚠️  Fail-fast triggered by shard', shardIndex);
          this.abortAllShards();
        }

        resolve(result);
      });
    });
  }

  private abortAllShards(): void {
    Array.from(this.processes.entries()).forEach(([shardIndex, proc]) => {
      console.log(`   Killing shard ${shardIndex}...`);
      proc.kill('SIGTERM');
    });
  }

  private aggregateResults(): AggregatedResults {
    const totalDuration = (Date.now() - this.startTime) / 1000;

    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
    };

    const allFailures: ShardResult['failures'] = [];
    const shardSummaries: AggregatedResults['shardSummaries'] = [];

    Array.from(this.results.values()).forEach((result) => {
      stats.total += result.stats.total;
      stats.passed += result.stats.passed;
      stats.failed += result.stats.failed;
      stats.skipped += result.stats.skipped;
      stats.flaky += result.stats.flaky;

      allFailures.push(...result.failures);

      shardSummaries.push({
        shard: result.shard,
        stats: result.stats,
        durationSeconds: result.durationSeconds,
        exitCode: result.exitCode,
      });
    });

    // Sort summaries by shard number
    shardSummaries.sort((a, b) => a.shard - b.shard);

    const aggregated: AggregatedResults = {
      timestamp: new Date().toISOString(),
      totalDurationSeconds: Math.round(totalDuration * 10) / 10,
      stats,
      failures: allFailures,
      shardSummaries,
      success: stats.failed === 0,
    };

    // Write aggregated results
    const aggregatedFile = path.join(this.config.outputDir, 'aggregated.json');
    fs.writeFileSync(aggregatedFile, JSON.stringify(aggregated, null, 2));

    // Print summary
    this.printSummary(aggregated);

    return aggregated;
  }

  private printSummary(results: AggregatedResults): void {
    console.log('\n' + '═'.repeat(60));
    console.log('  AGGREGATED RESULTS');
    console.log('═'.repeat(60));
    console.log(`  Total tests:    ${results.stats.total}`);
    console.log(`  Passed:         ${results.stats.passed} ✅`);
    console.log(`  Failed:         ${results.stats.failed} ${results.stats.failed > 0 ? '❌' : ''}`);
    console.log(`  Skipped:        ${results.stats.skipped}`);
    console.log(`  Flaky:          ${results.stats.flaky}`);
    console.log(`  Duration:       ${results.totalDurationSeconds}s (wall clock)`);
    console.log('═'.repeat(60));

    if (results.failures.length > 0) {
      console.log('\n❌ FAILURES:\n');
      for (const failure of results.failures) {
        console.log(`  📁 ${failure.file}`);
        console.log(`     ${failure.title}`);
        console.log(`     Error: ${failure.error.substring(0, 200)}`);
        console.log('');
      }
    }

    console.log(`\n📄 Full results: ${this.config.outputDir}/aggregated.json\n`);
  }
}

// Main execution
async function main() {
  const config = parseArgs();
  const runner = new ParallelTestRunner(config);

  try {
    const results = await runner.run();
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
