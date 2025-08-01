// src/config/logging.js

/**
 * Logging Configuration Utility
 *
 * This file provides easy-to-use presets and utilities for managing
 * Winston logging levels in different environments and scenarios.
 */

// Predefined logging configurations for different scenarios
export const LOGGING_PRESETS = {
  // Production: Only errors and warnings
  PRODUCTION: {
    level: 'warn',
    console: true,
    file: true,
    description: 'Production mode - errors and warnings only'
  },

  // Development: All logs including debug
  DEVELOPMENT: {
    level: 'debug',
    console: true,
    file: true,
    description: 'Development mode - all logs including debug'
  },

  // Testing: Only errors to keep test output clean
  TESTING: {
    level: 'error',
    console: false,
    file: true,
    description: 'Testing mode - errors only, no console output'
  },

  // Debugging: Maximum verbosity
  DEBUG: {
    level: 'debug',
    console: true,
    file: true,
    description: 'Debug mode - maximum verbosity'
  },

  // Silent: No logging (useful for testing or specific scenarios)
  SILENT: {
    level: 'error',
    console: false,
    file: false,
    description: 'Silent mode - no logging output'
  },

  // Monitoring: Info and above for monitoring systems
  MONITORING: {
    level: 'info',
    console: false,
    file: true,
    description: 'Monitoring mode - info level and above, file only'
  },

  // Critical: Only errors
  CRITICAL_ONLY: {
    level: 'error',
    console: true,
    file: true,
    description: 'Critical errors only'
  }
};

/**
 * Apply a logging preset
 * @param {string} presetName - Name of the preset from LOGGING_PRESETS
 * @param {Object} logger - Winston logger instance
 * @returns {Object} Applied configuration
 */
export function applyLoggingPreset(presetName, logger) {
  const preset = LOGGING_PRESETS[presetName.toUpperCase()];

  if (!preset) {
    const availablePresets = Object.keys(LOGGING_PRESETS).join(', ');
    throw new Error(`Invalid preset: ${presetName}. Available presets: ${availablePresets}`);
  }

  // Apply the preset configuration
  logger.setLevel(preset.level);

  // Log the configuration change
  logger.info(`📋 Applied logging preset: ${presetName} - ${preset.description}`);

  return preset;
}

/**
 * Get logging configuration based on environment
 * @param {string} environment - Environment name (development, production, test)
 * @returns {Object} Logging configuration
 */
export function getEnvironmentLoggingConfig(environment = process.env.NODE_ENV) {
  const configs = {
    production: LOGGING_PRESETS.PRODUCTION,
    development: LOGGING_PRESETS.DEVELOPMENT,
    test: LOGGING_PRESETS.TESTING,
    testing: LOGGING_PRESETS.TESTING,
    debug: LOGGING_PRESETS.DEBUG
  };

  return configs[environment?.toLowerCase()] || LOGGING_PRESETS.DEVELOPMENT;
}

/**
 * Create environment-specific logging setup
 * @param {Object} logger - Winston logger instance
 * @param {string} environment - Environment name
 */
export function setupEnvironmentLogging(logger, environment = process.env.NODE_ENV) {
  const config = getEnvironmentLoggingConfig(environment);
  logger.setLevel(config.level);

  logger.info(`🌍 Environment-based logging configured for: ${environment || 'development'}`);
  logger.info(`📊 Current logging level: ${config.level}`);

  return config;
}

/**
 * Utility functions for quick level changes
 */
export const QUICK_CONFIGS = {
  /**
   * Enable only critical errors
   */
  errorsOnly: (logger) => {
    logger.setLevel('error');
    logger.info('🔴 Logging set to ERRORS ONLY');
  },

  /**
   * Enable errors and warnings
   */
  errorsAndWarnings: (logger) => {
    logger.setLevel('warn');
    logger.info('🟡 Logging set to ERRORS AND WARNINGS');
  },

  /**
   * Enable informational logs and above
   */
  infoAndAbove: (logger) => {
    logger.setLevel('info');
    logger.info('🔵 Logging set to INFO AND ABOVE');
  },

  /**
   * Enable all logs including debug
   */
  everything: (logger) => {
    logger.setLevel('debug');
    logger.info('🟢 Logging set to EVERYTHING (including debug)');
  },

  /**
   * Enable HTTP request logging
   */
  withHttp: (logger) => {
    logger.setLevel('http');
    logger.info('🌐 Logging set to include HTTP requests');
  }
};

/**
 * Feature flags for logging (can be controlled via environment variables)
 */
export const LOGGING_FEATURES = {
  // Enable performance logging
  PERFORMANCE: process.env.LOG_PERFORMANCE === 'true',

  // Enable request/response logging
  HTTP_DETAILS: process.env.LOG_HTTP_DETAILS === 'true',

  // Enable database query logging
  DATABASE: process.env.LOG_DATABASE === 'true',

  // Enable socket event logging
  SOCKET_EVENTS: process.env.LOG_SOCKET_EVENTS === 'true',

  // Enable memory usage logging
  MEMORY_USAGE: process.env.LOG_MEMORY === 'true'
};

/**
 * Context-aware logging helper
 * @param {Object} logger - Winston logger instance
 * @param {string} context - Context identifier (e.g., 'AUTH', 'SOCKET', 'DB')
 * @returns {Object} Context-aware logger methods
 */
export function createContextLogger(logger, context) {
  const prefix = `[${context}]`;

  return {
    error: (message, meta) => logger.error(`${prefix} ${message}`, meta),
    warn: (message, meta) => logger.warn(`${prefix} ${message}`, meta),
    info: (message, meta) => logger.info(`${prefix} ${message}`, meta),
    http: (message, meta) => logger.http(`${prefix} ${message}`, meta),
    debug: (message, meta) => logger.debug(`${prefix} ${message}`, meta),
  };
}

/**
 * Performance logging wrapper
 * @param {Object} logger - Winston logger instance
 * @param {string} operation - Operation name
 * @param {Function} fn - Function to measure
 * @returns {*} Function result
 */
export async function logPerformance(logger, operation, fn) {
  if (!LOGGING_FEATURES.PERFORMANCE) {
    return await fn();
  }

  const start = Date.now();
  logger.debug(`⏱️  Starting ${operation}`);

  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.info(`✅ ${operation} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`❌ ${operation} failed after ${duration}ms: ${error.message}`);
    throw error;
  }
}

// Example usage documentation
export const USAGE_EXAMPLES = `
USAGE EXAMPLES:

1. Environment Variables:
   NODE_ENV=production npm start          # Production preset
   LOG_LEVEL=error npm start              # Custom level
   LOG_PERFORMANCE=true npm start         # Enable performance logging

2. Using Presets:
   import { applyLoggingPreset } from './config/logging.js';
   import logger from './logger.js';

   applyLoggingPreset('PRODUCTION', logger);
   applyLoggingPreset('DEBUG', logger);

3. Quick Configuration:
   import { QUICK_CONFIGS } from './config/logging.js';

   QUICK_CONFIGS.errorsOnly(logger);
   QUICK_CONFIGS.everything(logger);

4. Context Logging:
   import { createContextLogger } from './config/logging.js';

   const authLogger = createContextLogger(logger, 'AUTH');
   authLogger.info('User logged in successfully');
   // Output: [AUTH] User logged in successfully

5. Performance Logging:
   import { logPerformance } from './config/logging.js';

   const result = await logPerformance(logger, 'Database Query', async () => {
     return await db.findUser(userId);
   });
`;
