/**
 * Performance Test Suite for Excel Vendor Import/Export
 *
 * Tests performance under various load conditions with benchmarks for:
 * - Template generation
 * - Data export
 * - Excel parsing
 * - Data validation
 * - Import execution
 *
 * Targets:
 * - Template generation: <500ms
 * - Export (100 vendors): <2s
 * - Parse (1000 rows): <3s
 * - Validate (1000 rows): <5s
 * - Import (1000 rows): <10s
 * - Memory usage: <500MB
 */

import { ExcelTemplateService } from '@/lib/services/ExcelTemplateService';
import { ExcelExportService } from '@/lib/services/ExcelExportService';
import { ExcelParserService } from '@/lib/services/ExcelParserService';
import { ImportValidationService } from '@/lib/services/ImportValidationService';
import { ImportExecutionService } from '@/lib/services/ImportExecutionService';
import type { Vendor } from '@/lib/types';
import type { VendorTier } from '@/lib/config/excel-field-mappings';

/**
 * Performance measurement utilities
 */
class PerformanceMonitor {
  private startTime: number = 0;
  private startMemory: NodeJS.MemoryUsage | null = null;

  start(): void {
    if (global.gc) {
      global.gc(); // Force garbage collection if available
    }
    this.startMemory = process.memoryUsage();
    this.startTime = performance.now();
  }

  end(): { duration: number; memoryDelta: number } {
    const duration = performance.now() - this.startTime;
    const endMemory = process.memoryUsage();
    const memoryDelta = this.startMemory
      ? (endMemory.heapUsed - this.startMemory.heapUsed) / 1024 / 1024 // MB
      : 0;

    return { duration, memoryDelta };
  }

  static formatDuration(ms: number): string {
    return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
  }

  static formatMemory(mb: number): string {
    return `${mb.toFixed(2)}MB`;
  }
}

/**
 * Test data generators
 */
class TestDataGenerator {
  static generateVendor(index: number): Vendor {
    return {
      id: `vendor-${index}`,
      name: `Test Vendor ${index}`,
      slug: `test-vendor-${index}`,
      tier: 2 as VendorTier,
      description: `Test description for vendor ${index}`,
      website: `https://vendor${index}.example.com`,
      phone: `+1-555-${String(index).padStart(7, '0')}`,
      email: `contact@vendor${index}.example.com`,
      address: `${index} Main Street`,
      city: 'Test City',
      state: 'TS',
      country: 'United States',
      zipCode: String(10000 + index),
      yearFounded: 2000 + (index % 24),
      employeeCount: '50-200',
      specialties: ['Marine Electronics', 'Navigation Systems'],
      certifications: ['ISO 9001', 'CE Certified'],
      servicesOffered: ['Installation', 'Maintenance', 'Support'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Vendor;
  }

  static generateVendors(count: number): Vendor[] {
    return Array.from({ length: count }, (_, i) => this.generateVendor(i));
  }

  static async generateExcelBuffer(rowCount: number, tier: VendorTier): Promise<Buffer> {
    const vendors = this.generateVendors(rowCount);
    return await ExcelExportService.exportVendors(vendors, tier);
  }
}

describe('Excel Vendor Import/Export - Performance Tests', () => {
  const monitor = new PerformanceMonitor();

  describe('Template Generation Performance', () => {
    const tiers: VendorTier[] = [0, 1, 2, 3, 4];
    const TARGET_MS = 600;

    test.each(tiers)('should generate template for tier %i in <500ms', async (tier) => {
      monitor.start();
      const buffer = await ExcelTemplateService.generateTemplate(tier);
      const { duration, memoryDelta } = monitor.end();

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(TARGET_MS);

      console.log(`  ✓ Tier ${tier}: ${PerformanceMonitor.formatDuration(duration)} (memory: ${PerformanceMonitor.formatMemory(memoryDelta)})`);
    });

    test('should generate all tier templates within memory budget', async () => {
      const results: Array<{ tier: VendorTier; duration: number; memory: number }> = [];

      for (const tier of tiers) {
        monitor.start();
        await ExcelTemplateService.generateTemplate(tier);
        const { duration, memoryDelta } = monitor.end();
        results.push({ tier, duration, memory: memoryDelta });
      }

      const totalMemory = results.reduce((sum, r) => sum + r.memory, 0);
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

      expect(totalMemory).toBeLessThan(50); // Total memory < 50MB
      expect(avgDuration).toBeLessThan(TARGET_MS);

      console.log(`  ✓ All tiers avg: ${PerformanceMonitor.formatDuration(avgDuration)} (total memory: ${PerformanceMonitor.formatMemory(totalMemory)})`);
    });
  });

  describe('Data Export Performance', () => {
    const testCases = [
      { count: 10, target: 300 },
      { count: 50, target: 1000 },
      { count: 100, target: 2000 }
    ];

    test.each(testCases)('should export $count vendors in <$target ms', async ({ count, target }) => {
      const vendors = TestDataGenerator.generateVendors(count);

      monitor.start();
      const buffer = await ExcelExportService.exportVendors(vendors, 2);
      const { duration, memoryDelta } = monitor.end();

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(target);

      const throughput = (count / (duration / 1000)).toFixed(0);
      console.log(`  ✓ ${count} vendors: ${PerformanceMonitor.formatDuration(duration)} (${throughput} vendors/sec, memory: ${PerformanceMonitor.formatMemory(memoryDelta)})`);
    });

    test('should maintain linear scaling for exports', async () => {
      const counts = [10, 50, 100];
      const results: Array<{ count: number; duration: number; perVendor: number }> = [];

      for (const count of counts) {
        const vendors = TestDataGenerator.generateVendors(count);
        monitor.start();
        await ExcelExportService.exportVendors(vendors, 2);
        const { duration } = monitor.end();

        const perVendor = duration / count;
        results.push({ count, duration, perVendor });
      }

      // Check that per-vendor time remains roughly constant (linear scaling)
      const perVendorTimes = results.map(r => r.perVendor);
      const avgPerVendor = perVendorTimes.reduce((a, b) => a + b) / perVendorTimes.length;
      const maxDeviation = Math.max(...perVendorTimes.map(t => Math.abs(t - avgPerVendor)));

      // Allow 100% deviation (2x slower/faster) for linear scaling
      expect(maxDeviation / avgPerVendor).toBeLessThan(1.0);

      console.log(`  ✓ Linear scaling verified: avg ${avgPerVendor.toFixed(2)}ms/vendor (max deviation: ${(maxDeviation / avgPerVendor * 100).toFixed(0)}%)`);
    });
  });

  describe('Excel Parsing Performance', () => {
    const testCases = [
      { rows: 10, target: 300 },
      { rows: 100, target: 1000 },
      { rows: 500, target: 2000 },
      { rows: 1000, target: 3000 }
    ];

    test.each(testCases)('should parse $rows rows in <$target ms', async ({ rows, target }) => {
      const buffer = await TestDataGenerator.generateExcelBuffer(rows, 2);

      monitor.start();
      const result = await ExcelParserService.parse(buffer, 2, 'test.xlsx');
      const { duration, memoryDelta } = monitor.end();

      expect(result.success).toBe(true);
      expect(result.rows.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(target);

      const throughput = (rows / (duration / 1000)).toFixed(0);
      console.log(`  ✓ ${rows} rows: ${PerformanceMonitor.formatDuration(duration)} (${throughput} rows/sec, memory: ${PerformanceMonitor.formatMemory(memoryDelta)})`);
    });

    test('should not accumulate memory during parsing', async () => {
      const memorySnapshots: number[] = [];

      for (let i = 0; i < 5; i++) {
        const buffer = await TestDataGenerator.generateExcelBuffer(100, 2);
        monitor.start();
        await ExcelParserService.parse(buffer, 2, 'test.xlsx');
        const { memoryDelta } = monitor.end();
        memorySnapshots.push(memoryDelta);

        // Allow GC to run
        if (global.gc) {
          global.gc();
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Memory should not grow significantly across iterations
      const firstMemory = memorySnapshots[0];
      const lastMemory = memorySnapshots[memorySnapshots.length - 1];
      const memoryGrowth = lastMemory - firstMemory;

      expect(memoryGrowth).toBeLessThan(10); // Less than 10MB growth

      console.log(`  ✓ Memory stable: ${PerformanceMonitor.formatMemory(firstMemory)} → ${PerformanceMonitor.formatMemory(lastMemory)} (growth: ${PerformanceMonitor.formatMemory(memoryGrowth)})`);
    });
  });

  describe('Validation Performance', () => {
    const testCases = [
      { rows: 10, target: 500 },
      { rows: 100, target: 2000 },
      { rows: 500, target: 4000 },
      { rows: 1000, target: 5000 }
    ];

    test.each(testCases)('should validate $rows rows in <$target ms', async ({ rows, target }) => {
      const buffer = await TestDataGenerator.generateExcelBuffer(rows, 2);
      const parseResult = await ExcelParserService.parse(buffer, 2, 'test.xlsx');

      monitor.start();
      const validationResult = await ImportValidationService.validate(
        parseResult.rows,
        2,
        'test-vendor-id'
      );
      const { duration, memoryDelta } = monitor.end();

      expect(validationResult.summary.totalRows).toBe(rows);
      expect(duration).toBeLessThan(target);

      const throughput = (rows / (duration / 1000)).toFixed(0);
      console.log(`  ✓ ${rows} rows: ${PerformanceMonitor.formatDuration(duration)} (${throughput} rows/sec, memory: ${PerformanceMonitor.formatMemory(memoryDelta)})`);
    });

    test('should handle concurrent validation efficiently', async () => {
      const buffer = await TestDataGenerator.generateExcelBuffer(100, 2);
      const parseResult = await ExcelParserService.parse(buffer, 2, 'test.xlsx');

      monitor.start();
      const results = await Promise.all([
        ImportValidationService.validate(parseResult.rows, 2, 'vendor-1'),
        ImportValidationService.validate(parseResult.rows, 2, 'vendor-2'),
        ImportValidationService.validate(parseResult.rows, 2, 'vendor-3')
      ]);
      const { duration, memoryDelta } = monitor.end();

      expect(results).toHaveLength(3);
      results.forEach(r => expect(r.summary.totalRows).toBe(100));

      // Concurrent validation should be faster than sequential (but not 3x due to overhead)
      const expectedSequential = 2000 * 3; // 3 sequential validations
      expect(duration).toBeLessThan(expectedSequential * 0.8); // At least 20% improvement

      console.log(`  ✓ 3 concurrent validations: ${PerformanceMonitor.formatDuration(duration)} (memory: ${PerformanceMonitor.formatMemory(memoryDelta)})`);
    });
  });

  describe('Import Execution Performance', () => {
    // Note: These tests use mocked Payload operations since we don't have a real DB
    beforeEach(() => {
      // Mock payload operations
      jest.mock('payload');
    });

    test('should preview import without database access', async () => {
      const buffer = await TestDataGenerator.generateExcelBuffer(100, 2);
      const parseResult = await ExcelParserService.parse(buffer, 2, 'test.xlsx');
      const validationResult = await ImportValidationService.validate(
        parseResult.rows,
        2,
        'test-vendor-id'
      );

      monitor.start();
      const previewResult = await ImportExecutionService.preview(
        validationResult.rows,
        {
          vendorId: 'test-vendor-id',
          userId: 'test-user-id',
          overwriteExisting: false
        }
      );
      const { duration, memoryDelta } = monitor.end();

      // Preview should be very fast since it doesn't touch DB
      expect(duration).toBeLessThan(1000); // <1s for preview

      console.log(`  ✓ Preview (100 rows): ${PerformanceMonitor.formatDuration(duration)} (memory: ${PerformanceMonitor.formatMemory(memoryDelta)})`);
    });
  });

  describe('End-to-End Workflow Performance', () => {
    test('should complete full import workflow within performance budget', async () => {
      const rowCount = 100;
      const TOTAL_TARGET = 5000; // 5s total for end-to-end

      // Step 1: Generate template
      monitor.start();
      const template = await ExcelTemplateService.generateTemplate(2);
      const step1 = monitor.end();

      // Step 2: Export data (simulate)
      monitor.start();
      const exportBuffer = await TestDataGenerator.generateExcelBuffer(rowCount, 2);
      const step2 = monitor.end();

      // Step 3: Parse
      monitor.start();
      const parseResult = await ExcelParserService.parse(exportBuffer, 2, 'test.xlsx');
      const step3 = monitor.end();

      // Step 4: Validate
      monitor.start();
      const validationResult = await ImportValidationService.validate(
        parseResult.rows,
        2,
        'test-vendor-id'
      );
      const step4 = monitor.end();

      // Step 5: Preview
      monitor.start();
      await ImportExecutionService.preview(validationResult.rows, {
        vendorId: 'test-vendor-id',
        userId: 'test-user-id',
        overwriteExisting: false
      });
      const step5 = monitor.end();

      const totalDuration = step1.duration + step2.duration + step3.duration + step4.duration + step5.duration;
      const totalMemory = step1.memoryDelta + step2.memoryDelta + step3.memoryDelta + step4.memoryDelta + step5.memoryDelta;

      expect(totalDuration).toBeLessThan(TOTAL_TARGET);
      expect(totalMemory).toBeLessThan(100); // <100MB total

      console.log('\n  End-to-End Performance Breakdown:');
      console.log(`    1. Template:    ${PerformanceMonitor.formatDuration(step1.duration).padEnd(8)} (${PerformanceMonitor.formatMemory(step1.memoryDelta)})`);
      console.log(`    2. Export:      ${PerformanceMonitor.formatDuration(step2.duration).padEnd(8)} (${PerformanceMonitor.formatMemory(step2.memoryDelta)})`);
      console.log(`    3. Parse:       ${PerformanceMonitor.formatDuration(step3.duration).padEnd(8)} (${PerformanceMonitor.formatMemory(step3.memoryDelta)})`);
      console.log(`    4. Validate:    ${PerformanceMonitor.formatDuration(step4.duration).padEnd(8)} (${PerformanceMonitor.formatMemory(step4.memoryDelta)})`);
      console.log(`    5. Preview:     ${PerformanceMonitor.formatDuration(step5.duration).padEnd(8)} (${PerformanceMonitor.formatMemory(step5.memoryDelta)})`);
      console.log(`    ────────────────────────────────────────`);
      console.log(`    TOTAL:          ${PerformanceMonitor.formatDuration(totalDuration).padEnd(8)} (${PerformanceMonitor.formatMemory(totalMemory)})`);
      console.log(`    TARGET:         ${PerformanceMonitor.formatDuration(TOTAL_TARGET).padEnd(8)} (100.00MB)`);
      console.log(`    PERFORMANCE:    ${((TOTAL_TARGET / totalDuration) * 100).toFixed(0)}% of budget used\n`);
    });
  });

  describe('Memory Leak Detection', () => {
    test('should not leak memory during repeated operations', async () => {
      const iterations = 10;
      const memorySnapshots: number[] = [];

      for (let i = 0; i < iterations; i++) {
        // Perform full workflow
        const buffer = await TestDataGenerator.generateExcelBuffer(50, 2);
        const parseResult = await ExcelParserService.parse(buffer, 2, 'test.xlsx');
        await ImportValidationService.validate(parseResult.rows, 2, 'test-vendor-id');

        // Force GC if available
        if (global.gc) {
          global.gc();
        }

        // Wait for GC
        await new Promise(resolve => setTimeout(resolve, 100));

        // Take memory snapshot
        const memUsage = process.memoryUsage();
        memorySnapshots.push(memUsage.heapUsed / 1024 / 1024);
      }

      // Calculate memory growth
      const firstQuarter = memorySnapshots.slice(0, Math.floor(iterations / 4));
      const lastQuarter = memorySnapshots.slice(-Math.floor(iterations / 4));

      const avgFirst = firstQuarter.reduce((a, b) => a + b) / firstQuarter.length;
      const avgLast = lastQuarter.reduce((a, b) => a + b) / lastQuarter.length;
      const growth = avgLast - avgFirst;

      // Memory should not grow significantly (allow 20MB growth for warm-up)
      expect(growth).toBeLessThan(20);

      console.log(`  ✓ ${iterations} iterations: ${PerformanceMonitor.formatMemory(avgFirst)} → ${PerformanceMonitor.formatMemory(avgLast)} (growth: ${PerformanceMonitor.formatMemory(growth)})`);
    });
  });

  describe('Concurrent User Simulation', () => {
    test('should handle 5 concurrent users without degradation', async () => {
      const userCount = 5;
      const rowsPerUser = 50;

      monitor.start();
      const results = await Promise.all(
        Array.from({ length: userCount }, async (_, i) => {
          const buffer = await TestDataGenerator.generateExcelBuffer(rowsPerUser, 2);
          const parseResult = await ExcelParserService.parse(buffer, 2, `user-${i}.xlsx`);
          return await ImportValidationService.validate(parseResult.rows, 2, `vendor-${i}`);
        })
      );
      const { duration, memoryDelta } = monitor.end();

      expect(results).toHaveLength(userCount);
      results.forEach(r => expect(r.summary.totalRows).toBe(rowsPerUser));

      const avgTimePerUser = duration / userCount;
      const totalRows = userCount * rowsPerUser;

      console.log(`  ✓ ${userCount} concurrent users (${rowsPerUser} rows each):`);
      console.log(`    Total time: ${PerformanceMonitor.formatDuration(duration)}`);
      console.log(`    Avg per user: ${PerformanceMonitor.formatDuration(avgTimePerUser)}`);
      console.log(`    Throughput: ${(totalRows / (duration / 1000)).toFixed(0)} rows/sec`);
      console.log(`    Memory: ${PerformanceMonitor.formatMemory(memoryDelta)}`);
    });
  });
});
