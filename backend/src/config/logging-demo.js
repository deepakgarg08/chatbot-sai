// src/config/logging-demo.js

/**
 * Winston Logging Configuration Demo
 *
 * This script demonstrates all the different ways to configure and use
 * the enhanced Winston logging system with easy level management.
 */

import logger from './logger.js';
import {
  applyLoggingPreset,
  LOGGING_PRESETS,
  QUICK_CONFIGS,
  createContextLogger,
  logPerformance,
  setupEnvironmentLogging
} from './logging.js';

console.log('\n🎭 Winston Logging Configuration Demo\n');
console.log('=' .repeat(50));

// Demo 1: Basic logging at all levels
console.log('\n📝 Demo 1: Basic Logging at All Levels');
console.log('-'.repeat(30));

logger.error('This is an ERROR message');
logger.warn('This is a WARNING message');
logger.info('This is an INFO message');
logger.http('This is an HTTP message');
logger.debug('This is a DEBUG message');

// Demo 2: Quick configuration methods
console.log('\n⚡ Demo 2: Quick Configuration Methods');
console.log('-'.repeat(30));

console.log('\n🔴 Setting to ERRORS ONLY:');
QUICK_CONFIGS.errorsOnly(logger);
logger.error('You should see this error');
logger.warn('You should NOT see this warning');
logger.info('You should NOT see this info');

console.log('\n🟡 Setting to ERRORS AND WARNINGS:');
QUICK_CONFIGS.errorsAndWarnings(logger);
logger.error('You should see this error');
logger.warn('You should see this warning');
logger.info('You should NOT see this info');

console.log('\n🔵 Setting to INFO AND ABOVE:');
QUICK_CONFIGS.infoAndAbove(logger);
logger.error('You should see this error');
logger.warn('You should see this warning');
logger.info('You should see this info');
logger.debug('You should NOT see this debug');

console.log('\n🟢 Setting to EVERYTHING:');
QUICK_CONFIGS.everything(logger);
logger.error('You should see this error');
logger.warn('You should see this warning');
logger.info('You should see this info');
logger.debug('You should see this debug');

// Demo 3: Using presets
console.log('\n🎨 Demo 3: Using Logging Presets');
console.log('-'.repeat(30));

console.log('\n📊 Available presets:');
Object.keys(LOGGING_PRESETS).forEach(preset => {
  console.log(`  • ${preset}: ${LOGGING_PRESETS[preset].description}`);
});

console.log('\n🏭 Applying PRODUCTION preset:');
applyLoggingPreset('PRODUCTION', logger);
logger.error('Production error - visible');
logger.warn('Production warning - visible');
logger.info('Production info - NOT visible');
logger.debug('Production debug - NOT visible');

console.log('\n🛠️  Applying DEVELOPMENT preset:');
applyLoggingPreset('DEVELOPMENT', logger);
logger.error('Development error - visible');
logger.warn('Development warning - visible');
logger.info('Development info - visible');
logger.debug('Development debug - visible');

// Demo 4: Context-aware logging
console.log('\n🏷️  Demo 4: Context-Aware Logging');
console.log('-'.repeat(30));

const authLogger = createContextLogger(logger, 'AUTH');
const dbLogger = createContextLogger(logger, 'DATABASE');
const socketLogger = createContextLogger(logger, 'SOCKET');

authLogger.info('User authentication successful');
authLogger.warn('Failed login attempt detected');
authLogger.error('Authentication service unavailable');

dbLogger.info('Database connection established');
dbLogger.warn('Slow query detected (>1000ms)');
dbLogger.error('Database connection failed');

socketLogger.info('New client connected');
socketLogger.debug('Socket event received');
socketLogger.error('Socket connection lost');

// Demo 5: Performance logging
console.log('\n⏱️  Demo 5: Performance Logging');
console.log('-'.repeat(30));

// Simulate a fast operation
await logPerformance(logger, 'Fast Operation', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return 'Fast result';
});

// Simulate a slow operation
await logPerformance(logger, 'Slow Operation', async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return 'Slow result';
});

// Simulate an operation that fails
try {
  await logPerformance(logger, 'Failing Operation', async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    throw new Error('Something went wrong');
  });
} catch (error) {
  // Error is already logged by logPerformance
}

// Demo 6: Environment-based configuration
console.log('\n🌍 Demo 6: Environment-Based Configuration');
console.log('-'.repeat(30));

// Show current configuration
const currentConfig = logger.getConfig();
console.log('\n📊 Current Logger Configuration:');
console.log(`  • Level: ${currentConfig.currentLevel}`);
console.log(`  • Available Levels: ${currentConfig.availableLevels.join(', ')}`);
console.log(`  • Console Enabled: ${currentConfig.consoleEnabled}`);
console.log(`  • File Logging Enabled: ${currentConfig.fileLoggingEnabled}`);
console.log(`  • Log Directory: ${currentConfig.logDirectory}`);

// Demo different environments
console.log('\n🏭 Simulating different environments:');

console.log('\n  Production environment:');
setupEnvironmentLogging(logger, 'production');
logger.error('Production error');
logger.warn('Production warning');
logger.info('Production info - should not appear');

console.log('\n  Development environment:');
setupEnvironmentLogging(logger, 'development');
logger.error('Development error');
logger.warn('Development warning');
logger.info('Development info');
logger.debug('Development debug');

console.log('\n  Test environment:');
setupEnvironmentLogging(logger, 'test');
logger.error('Test error - should appear');
logger.warn('Test warning - should not appear');
logger.info('Test info - should not appear');

// Demo 7: Manual level setting
console.log('\n🔧 Demo 7: Manual Level Setting');
console.log('-'.repeat(30));

console.log('\n⚙️  Setting custom levels:');

logger.setLevel('http');
logger.info('Testing HTTP level');
logger.http('HTTP request logged');
logger.debug('Debug message - should not appear');

logger.setLevel('info');
logger.info('Back to info level');
logger.debug('Debug still not visible');

// Demo 8: Practical usage examples
console.log('\n💡 Demo 8: Practical Usage Examples');
console.log('-'.repeat(30));

// Example: API endpoint logging
const apiLogger = createContextLogger(logger, 'API');

function simulateApiCall(endpoint, method) {
  apiLogger.info(`${method} ${endpoint} - Request received`);

  // Simulate processing time
  const startTime = Date.now();

  // Simulate some work
  const processingTime = Math.random() * 500 + 100;

  setTimeout(() => {
    const duration = Date.now() - startTime;

    if (processingTime > 400) {
      apiLogger.warn(`${method} ${endpoint} - Slow response: ${duration}ms`);
    } else {
      apiLogger.info(`${method} ${endpoint} - Completed in ${duration}ms`);
    }
  }, processingTime);
}

simulateApiCall('/api/users', 'GET');
simulateApiCall('/api/auth/login', 'POST');
simulateApiCall('/api/messages', 'POST');

// Example: Error handling with context
function simulateErrorScenarios() {
  const errorLogger = createContextLogger(logger, 'ERROR_HANDLER');

  // Different types of errors
  try {
    throw new Error('Database connection timeout');
  } catch (error) {
    errorLogger.error(`Database error: ${error.message}`, {
      errorCode: 'DB_TIMEOUT',
      timestamp: new Date().toISOString(),
      context: 'user_registration'
    });
  }

  try {
    throw new Error('Invalid user credentials');
  } catch (error) {
    errorLogger.warn(`Authentication warning: ${error.message}`, {
      errorCode: 'AUTH_INVALID',
      attempt: 3,
      ip: '192.168.1.100'
    });
  }
}

simulateErrorScenarios();

console.log('\n✅ Demo completed! Check your logs folder for file outputs.');
console.log('💡 Tips for easy logging management:');
console.log('  • Use environment variables: LOG_LEVEL=error npm start');
console.log('  • Use presets for common scenarios');
console.log('  • Use context loggers for better organization');
console.log('  • Use performance logging for monitoring');
console.log('  • Check logger.getConfig() to see current settings');

console.log('\n🎯 Quick Commands Summary:');
console.log('  • QUICK_CONFIGS.errorsOnly(logger)');
console.log('  • QUICK_CONFIGS.errorsAndWarnings(logger)');
console.log('  • QUICK_CONFIGS.infoAndAbove(logger)');
console.log('  • QUICK_CONFIGS.everything(logger)');
console.log('  • applyLoggingPreset("PRODUCTION", logger)');
console.log('  • logger.setLevel("warn")');

console.log('\n' + '='.repeat(50));
console.log('🎉 Winston Logging Demo Complete!');
