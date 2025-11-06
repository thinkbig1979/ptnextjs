# Task VAL-2: Performance Validation

**Status:** 🔒 Blocked (waiting for INT-4)
**Agent:** quality-assurance
**Estimated Time:** 4 hours
**Phase:** Final Validation
**Dependencies:** INT-4

## Objective

Validate performance of Excel import/export feature under various load conditions and optimize bottlenecks.

## Acceptance Criteria

- [ ] Template generation <500ms
- [ ] Export (100 vendors) <2s
- [ ] Parse (1000 rows) <3s
- [ ] Validate (1000 rows) <5s
- [ ] Import (1000 rows) <10s
- [ ] Memory usage acceptable (<500MB)
- [ ] No memory leaks
- [ ] Concurrent user handling tested
- [ ] Database query optimization verified
- [ ] Performance report generated

## Detailed Specifications

### Performance Benchmarks

**Template Generation:**
- Target: <500ms
- Test: Generate template for each tier
- Metric: Time to first byte

**Data Export:**
- Target: <2s for 100 vendors
- Test: Export with all fields
- Metric: End-to-end response time

**Excel Parsing:**
- Target: <3s for 1000 rows
- Test: Parse large Excel file
- Metric: Parse completion time

**Validation:**
- Target: <5s for 1000 rows
- Test: Validate complex business rules
- Metric: Validation completion time

**Import Execution:**
- Target: <10s for 1000 rows
- Test: Atomic import with transaction
- Metric: Database commit time

### Load Testing Scenarios

```typescript
// Artillery load test config
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5  // 5 users per second
scenarios:
  - name: 'Template Download'
    flow:
      - get:
          url: '/api/portal/vendors/{{ vendorId }}/excel-template'
  - name: 'Data Export'
    flow:
      - get:
          url: '/api/portal/vendors/{{ vendorId }}/excel-export'
  - name: 'Import Workflow'
    flow:
      - post:
          url: '/api/portal/vendors/{{ vendorId }}/excel-import?phase=preview'
          formData:
            file: '@fixtures/test-data.xlsx'
```

### Memory Profiling

```bash
# Run with memory profiling
node --inspect app.js

# Monitor memory usage during import
while true; do
  ps aux | grep node | awk '{print $6}'
  sleep 1
done
```

### Database Query Optimization

- [ ] Add indexes for import history queries
- [ ] Optimize vendor lookup queries
- [ ] Use batch inserts for import
- [ ] Profile slow queries with EXPLAIN

## Testing Requirements

### Performance Tests

```bash
# Run load tests
npm run test:load

# Profile memory
npm run profile:memory

# Benchmark critical functions
npm run benchmark
```

### Metrics to Track

- Response time (p50, p95, p99)
- Throughput (requests/second)
- Memory usage (heap, RSS)
- CPU usage
- Database query time
- Error rate

## Evidence Requirements

- [ ] Performance test results
- [ ] Load test report (Artillery)
- [ ] Memory profile screenshots
- [ ] Database query analysis
- [ ] Optimization recommendations

## Optimization Strategies

**If Performance Issues Found:**

1. **Slow Parsing:**
   - Stream Excel parsing instead of loading all
   - Use worker threads for parallel processing

2. **Slow Validation:**
   - Batch database queries
   - Cache tier access checks
   - Parallelize independent validations

3. **Slow Import:**
   - Use bulk insert operations
   - Optimize transaction scope
   - Add database indexes

4. **Memory Issues:**
   - Stream large files
   - Clear buffers after processing
   - Implement pagination for large datasets

## Success Metrics

- All benchmarks met or exceeded
- No performance degradation under load
- Memory stable during stress test
- 99th percentile response time acceptable
- Zero timeouts during load test
