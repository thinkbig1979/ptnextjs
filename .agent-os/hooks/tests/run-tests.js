#!/usr/bin/env node

const HookRunner = require('../runner.js');
const fs = require('fs');
const path = require('path');

class HookSystemTester {
  constructor() {
    this.results = [];
    this.testDir = __dirname;
  }

  async runAllTests() {
    console.log('🧪 Agent OS Hook System - Test Suite\n');
    console.log('='.repeat(60));
    
    await this.testFormattingFix();
    await this.testSecurityDetection();
    await this.testSyntaxError();
    
    this.printResults();
  }

  async testFormattingFix() {
    console.log('\n📝 Test 1: Formatting Auto-Fix');
    console.log('-'.repeat(60));
    
    const testFile = path.join(this.testDir, 'test-sample.js');
    const content = fs.readFileSync(testFile, 'utf-8');
    
    const runner = new HookRunner();
    const result = await runner.runFileCreationHooks(testFile, content);
    
    const passed = result.results.fixed.length > 0;
    this.results.push({
      name: 'Formatting Auto-Fix',
      passed,
      details: `Fixed ${result.results.fixed.length} issues`
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  }

  async testSecurityDetection() {
    console.log('\n🔒 Test 2: Security Issue Detection');
    console.log('-'.repeat(60));
    
    const testFile = path.join(this.testDir, 'test-security.js');
    const content = fs.readFileSync(testFile, 'utf-8');
    
    const runner = new HookRunner();
    const result = await runner.runFileCreationHooks(testFile, content);
    
    const passed = result.results.errors.length > 0 || result.results.warnings.length > 0;
    this.results.push({
      name: 'Security Detection',
      passed,
      details: `Found ${result.results.errors.length} errors, ${result.results.warnings.length} warnings`
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  }

  async testSyntaxError() {
    console.log('\n⚠️  Test 3: Syntax Error Detection');
    console.log('-'.repeat(60));
    
    const testFile = path.join(this.testDir, 'test-syntax-error.js');
    const content = fs.readFileSync(testFile, 'utf-8');
    
    const runner = new HookRunner();
    const result = await runner.runFileCreationHooks(testFile, content);
    
    const passed = result.results.errors.length > 0;
    this.results.push({
      name: 'Syntax Error Detection',
      passed,
      details: `Caught ${result.results.errors.length} syntax errors`
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.details}`);
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`Total: ${passed}/${total} tests passed`);
    console.log('='.repeat(60) + '\n');
    
    process.exit(passed === total ? 0 : 1);
  }
}

const tester = new HookSystemTester();
tester.runAllTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
