class HookPerformanceMonitor {
  constructor() {
    this.metrics = [];
  }

  /**
   * Track validator execution time and collect metrics
   * @param {string} validatorName - Name of the validator being tracked
   * @param {Function} fn - The validator function to execute
   * @returns {*} - The result of the validator function
   */
  async trackValidation(validatorName, fn) {
    const startTime = performance.now();
    let success = true;
    let error = null;
    let result;

    try {
      result = await fn();
      return result;
    } catch (err) {
      success = false;
      error = err.message || String(err);
      throw err;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Store metric
      this.metrics.push({
        validator: validatorName,
        duration: duration,
        success: success,
        timestamp: new Date().toISOString(),
        error: error
      });

      // Warn if validator is slow
      if (duration > 1000) {
        console.warn(`[Performance Warning] Validator "${validatorName}" took ${duration.toFixed(2)}ms (>1000ms threshold)`);
      }
    }
  }

  /**
   * Calculate statistics per validator
   * @returns {Object} - Statistics grouped by validator name
   */
  getStats() {
    const stats = {};

    this.metrics.forEach(metric => {
      if (!stats[metric.validator]) {
        stats[metric.validator] = {
          durations: [],
          successCount: 0,
          failureCount: 0,
          totalCount: 0
        };
      }

      const validatorStats = stats[metric.validator];
      validatorStats.durations.push(metric.duration);
      validatorStats.totalCount++;

      if (metric.success) {
        validatorStats.successCount++;
      } else {
        validatorStats.failureCount++;
      }
    });

    // Calculate avg, min, max for each validator
    Object.keys(stats).forEach(validatorName => {
      const validatorStats = stats[validatorName];
      const durations = validatorStats.durations;

      validatorStats.avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      validatorStats.min = Math.min(...durations);
      validatorStats.max = Math.max(...durations);

      // Clean up temporary durations array
      delete validatorStats.durations;
    });

    return stats;
  }

  /**
   * Print formatted statistics table to console
   */
  printStats() {
    const stats = this.getStats();
    const validatorNames = Object.keys(stats);

    if (validatorNames.length === 0) {
      console.log('No performance metrics collected yet.');
      return;
    }

    console.log('\n=== Hook Performance Statistics ===\n');

    // Calculate column widths
    const maxNameLength = Math.max(
      'Validator'.length,
      ...validatorNames.map(name => name.length)
    );

    // Header
    const header = [
      'Validator'.padEnd(maxNameLength),
      'Count'.padStart(7),
      'Success'.padStart(7),
      'Failed'.padStart(7),
      'Avg (ms)'.padStart(10),
      'Min (ms)'.padStart(10),
      'Max (ms)'.padStart(10)
    ].join(' | ');

    console.log(header);
    console.log('-'.repeat(header.length));

    // Rows
    validatorNames.forEach(validatorName => {
      const stat = stats[validatorName];
      const row = [
        validatorName.padEnd(maxNameLength),
        stat.totalCount.toString().padStart(7),
        stat.successCount.toString().padStart(7),
        stat.failureCount.toString().padStart(7),
        stat.avg.toFixed(2).padStart(10),
        stat.min.toFixed(2).padStart(10),
        stat.max.toFixed(2).padStart(10)
      ].join(' | ');

      console.log(row);
    });

    console.log('\n');
  }
}

module.exports = HookPerformanceMonitor;
