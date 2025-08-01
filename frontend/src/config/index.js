/**
 * Configuration Index
 * Central export for all configuration files
 */

export { default as APP_CONFIG, ENV, IS_DEV, IS_PROD, API_URL, SOCKET_URL } from './app.js';
export { default as logger, log } from './logger.js';

// Re-export everything for convenience
export * from './app.js';
export * from './logger.js';
