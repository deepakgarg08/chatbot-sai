#!/usr/bin/env node

// Comprehensive Test Report Generator
// Creates detailed test reports with timestamps in test/testreport folder
// Usage: node test/generate-test-report.js

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate timestamp for report filename
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Test configuration
const testFiles = [
  'test/app.test.js',
  'test/chatStorage.test.js',
  'test/logger.test.js'
];

// Report configuration
const timestamp = generateTimestamp();
const reportDir = path.join(__dirname, 'testreport');
const reportFile = path.join(reportDir, `test-report-${timestamp}.md`);

// Ensure report directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Function to run tests and capture output
async function runTestsAndGenerateReport() {
  console.log('🧪 Generating comprehensive test report...');
  console.log(`📁 Report will be saved to: ${reportFile}`);

  const startTime = Date.now();

  // Initialize report content
  let reportContent = `# Test Execution Report
## Generated: ${new Date().toISOString()}
## Timestamp: ${timestamp}

---

## 📊 EXECUTIVE SUMMARY

`;

  const mochaArgs = [
    'mocha',
    '--timeout', '15000',
    '--reporter', 'spec',
    '--exit',
    ...testFiles
  ];

  return new Promise((resolve, reject) => {
    const mocha = spawn('npx', mochaArgs, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let stdout = '';
    let stderr = '';

    mocha.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output); // Show real-time output
    });

    mocha.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      // Filter out logger messages from stderr display
      if (!output.includes('"timestamp"') && !output.includes('info:') && !output.includes('error:')) {
        process.stderr.write(output);
      }
    });

    mocha.on('close', (code) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Parse test results from stdout
      const results = parseTestResults(stdout, stderr, duration, code);

      // Generate complete report
      reportContent += generateReportContent(results);

      // Write report to file
      try {
        fs.writeFileSync(reportFile, reportContent, 'utf8');
        console.log(`\n✅ Test report saved to: ${reportFile}`);
        console.log(`📊 Summary: ${results.total} tests, ${results.passed} passed, ${results.failed} failed`);
      } catch (error) {
        console.error(`❌ Failed to write report: ${error.message}`);
      }

      resolve(code);
    });

    mocha.on('error', (error) => {
      console.error(`❌ Failed to run tests: ${error.message}`);
      reject(error);
    });
  });
}

// Function to parse test results from mocha spec output
function parseTestResults(stdout, stderr, duration, exitCode) {
  const lines = stdout.split('\n');

  const results = {
    timestamp: new Date().toISOString(),
    duration: duration,
    exitCode: exitCode,
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    testCases: [],
    categories: {
      'HTTP Server': [],
      'ChatStorage - Basic Initialization': [],
      'ChatStorage - Message Encoding/Decoding': [],
      'ChatStorage - User Management': [],
      'ChatStorage - Public Message Management': [],
      'ChatStorage - Private Message Management': [],
      'ChatStorage - Storage Statistics and Management': [],
      'ChatStorage - Error Handling': [],
      'ChatStorage - Performance Tests': [],
      'Logger - Logger Initialization': [],
      'Logger - Basic Logging Functionality': [],
      'Logger - File Logging': [],
      'Logger - Log Message Content': [],
      'Logger - Performance Tests': [],
      'Logger - Integration Tests': [],
      'Logger - Error Handling': []
    },
    errors: []
  };

  let currentCategory = '';
  let testNumber = 0;

  lines.forEach((line, index) => {
    // Detect category headers
    if (line.trim() && !line.includes('✔') && !line.includes('✓') && !line.includes('✗') &&
        !line.includes('passing') && !line.includes('failing') && line.length > 5) {
      const trimmed = line.trim();
      if (trimmed.endsWith(':') || Object.keys(results.categories).some(cat => trimmed.includes(cat))) {
        currentCategory = trimmed.replace(':', '');
      }
    }

    // Detect passing tests
    if (line.includes('✔') || line.includes('✓')) {
      testNumber++;
      results.total++;
      results.passed++;

      const testName = line.trim()
        .replace(/^\s*✔\s*/, '')
        .replace(/✓/, '')
        .replace(/\(\d+ms\)/, '')
        .trim();

      const testCase = {
        number: testNumber,
        name: testName,
        status: 'PASS',
        category: currentCategory,
        duration: extractDuration(line)
      };

      results.testCases.push(testCase);

      // Categorize test
      categorizeTest(testCase, results.categories);
    }

    // Detect failing tests
    if (line.includes('✗') || line.includes('×')) {
      testNumber++;
      results.total++;
      results.failed++;

      const testName = line.trim()
        .replace(/^\s*✗\s*/, '')
        .replace(/×/, '')
        .trim();

      const testCase = {
        number: testNumber,
        name: testName,
        status: 'FAIL',
        category: currentCategory,
        duration: extractDuration(line)
      };

      results.testCases.push(testCase);
      categorizeTest(testCase, results.categories);
    }

    // Extract summary line
    if (line.includes('passing') || line.includes('failing')) {
      const match = line.match(/(\d+)\s+passing/);
      if (match) results.passed = parseInt(match[1]);

      const failMatch = line.match(/(\d+)\s+failing/);
      if (failMatch) results.failed = parseInt(failMatch[1]);
    }
  });

  // Extract errors from stderr if any
  if (stderr && !stderr.includes('"timestamp"')) {
    results.errors.push(stderr.trim());
  }

  return results;
}

// Helper function to extract duration from test line
function extractDuration(line) {
  const match = line.match(/\((\d+)ms\)/);
  return match ? parseInt(match[1]) : null;
}

// Helper function to categorize tests
function categorizeTest(testCase, categories) {
  const testName = testCase.name.toLowerCase();
  const category = testCase.category;

  // Find appropriate category
  for (const [catName, catTests] of Object.entries(categories)) {
    if (category && category.includes(catName) ||
        testName.includes(catName.toLowerCase()) ||
        (catName === 'HTTP Server' && testName.includes('server'))) {
      catTests.push(testCase);
      return;
    }
  }

  // If no category found, add to most relevant one
  if (testName.includes('chatstorage') || testName.includes('storage')) {
    categories['ChatStorage - Basic Initialization'].push(testCase);
  } else if (testName.includes('logger') || testName.includes('log')) {
    categories['Logger - Basic Logging Functionality'].push(testCase);
  }
}

// Function to generate complete report content
function generateReportContent(results) {
  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;

  let content = `**Status**: ${results.failed === 0 ? '🟢 ALL TESTS PASSED' : '🔴 SOME TESTS FAILED'}
**Total Tests**: ${results.total}
**Passed**: ✅ ${results.passed}
**Failed**: ❌ ${results.failed}
**Pass Rate**: ${passRate}%
**Duration**: ${results.duration < 1000 ? results.duration + 'ms' : (results.duration/1000).toFixed(2) + 's'}
**Exit Code**: ${results.exitCode}

---

## 📋 DETAILED TEST CASE LIST

`;

  // Add test cases by category
  Object.entries(results.categories).forEach(([categoryName, tests]) => {
    if (tests.length > 0) {
      content += `### ${categoryName}\n\n`;

      tests.forEach((test) => {
        const status = test.status === 'PASS' ? '✅' : '❌';
        const duration = test.duration ? ` (${test.duration}ms)` : '';
        const number = String(test.number).padStart(3, '0');

        content += `${number}. ${status} **${test.status}** | ${test.name}${duration}\n`;
      });

      content += '\n';
    }
  });

  // Add any remaining tests not categorized
  const categorizedNumbers = new Set();
  Object.values(results.categories).forEach(tests => {
    tests.forEach(test => categorizedNumbers.add(test.number));
  });

  const uncategorized = results.testCases.filter(test => !categorizedNumbers.has(test.number));
  if (uncategorized.length > 0) {
    content += `### Other Tests\n\n`;
    uncategorized.forEach((test) => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      const duration = test.duration ? ` (${test.duration}ms)` : '';
      const number = String(test.number).padStart(3, '0');

      content += `${number}. ${status} **${test.status}** | ${test.name}${duration}\n`;
    });
    content += '\n';
  }

  // Add performance summary
  content += `---

## ⚡ PERFORMANCE ANALYSIS

`;

  const avgDuration = results.testCases
    .filter(t => t.duration)
    .reduce((sum, t) => sum + t.duration, 0) / results.testCases.filter(t => t.duration).length;

  const slowTests = results.testCases
    .filter(t => t.duration && t.duration > 100)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  content += `**Average Test Duration**: ${avgDuration ? avgDuration.toFixed(1) + 'ms' : 'N/A'}
**Total Execution Time**: ${results.duration < 1000 ? results.duration + 'ms' : (results.duration/1000).toFixed(2) + 's'}
**Tests per Second**: ${(results.total / (results.duration/1000)).toFixed(1)}

`;

  if (slowTests.length > 0) {
    content += `**Slowest Tests**:
`;
    slowTests.forEach((test, index) => {
      content += `${index + 1}. ${test.name} (${test.duration}ms)\n`;
    });
    content += '\n';
  }

  // Add category summary
  content += `---

## 📊 CATEGORY BREAKDOWN

| Category | Tests | Passed | Failed | Success Rate |
|----------|-------|--------|--------|--------------|
`;

  Object.entries(results.categories).forEach(([categoryName, tests]) => {
    if (tests.length > 0) {
      const passed = tests.filter(t => t.status === 'PASS').length;
      const failed = tests.filter(t => t.status === 'FAIL').length;
      const rate = ((passed / tests.length) * 100).toFixed(1);

      content += `| ${categoryName} | ${tests.length} | ${passed} | ${failed} | ${rate}% |\n`;
    }
  });

  // Add error details if any
  if (results.failed > 0) {
    content += `
---

## 🚨 FAILED TESTS DETAILS

`;

    const failedTests = results.testCases.filter(t => t.status === 'FAIL');
    failedTests.forEach((test, index) => {
      content += `### ${index + 1}. ${test.name}

**Category**: ${test.category}
**Error**: Test failed during execution

`;
    });
  }

  // Add system info
  content += `---

## 🖥️ SYSTEM INFORMATION

**Node.js Version**: ${process.version}
**Platform**: ${process.platform}
**Architecture**: ${process.arch}
**Working Directory**: ${process.cwd()}
**Environment**: ${process.env.NODE_ENV || 'development'}
**Report Generated**: ${results.timestamp}

---

## 🎯 RECOMMENDATIONS

`;

  if (results.failed === 0) {
    content += `✅ **All tests are passing!** Your backend is ready for production deployment.

**Next Steps**:
- Deploy with confidence
- Monitor performance in production
- Set up automated testing in CI/CD pipeline
`;
  } else {
    content += `❌ **${results.failed} test(s) are failing.** Please address these issues before deployment.

**Action Items**:
- Review failed test details above
- Fix the underlying issues
- Re-run tests to verify fixes
- Consider adding additional test coverage
`;
  }

  content += `
---

## 📁 FILES TESTED

`;

  testFiles.forEach((file, index) => {
    content += `${index + 1}. \`${file}\`\n`;
  });

  content += `
---

*Report generated by AI Chatbot Socket Test Suite*
*Timestamp: ${timestamp}*
*Duration: ${results.duration}ms*
`;

  return content;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting test execution and report generation...\n');

    const exitCode = await runTestsAndGenerateReport();

    console.log('\n📋 Test execution completed!');
    console.log(`📄 Detailed report available at: test/testreport/test-report-${timestamp}.md`);

    process.exit(exitCode);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️ Test execution interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Test execution terminated');
  process.exit(1);
});

// Run the generator
main();
