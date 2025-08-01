# Winston Logging Configuration

This directory contains a flexible and easy-to-use Winston logging configuration system that allows you to quickly manage logging levels and output formats.

## 📁 Files Overview

- **`logger.js`** - Main Winston logger configuration with enhanced features
- **`logging.js`** - Utility functions and presets for easy logging management
- **`logging-demo.js`** - Comprehensive demo showing all logging features
- **`README.md`** - This documentation file

## 🚀 Quick Start

### Basic Usage

```javascript
import logger from './config/logger.js';

logger.error('Something went wrong!');
logger.warn('This is a warning');
logger.info('Information message');
logger.http('HTTP request details');
logger.debug('Debug information');
```

### Easy Level Management

```javascript
import { QUICK_CONFIGS } from './config/logging.js';

// Only show errors
QUICK_CONFIGS.errorsOnly(logger);

// Show errors and warnings
QUICK_CONFIGS.errorsAndWarnings(logger);

// Show info, warnings, and errors
QUICK_CONFIGS.infoAndAbove(logger);

// Show everything including debug
QUICK_CONFIGS.everything(logger);
```

## 🎯 Environment Variables (Recommended)

The easiest way to control logging is through environment variables:

```bash
# Only errors
LOG_LEVEL=error npm start

# Errors and warnings
LOG_LEVEL=warn npm start

# Info and above (default for production)
LOG_LEVEL=info npm start

# Everything including debug (default for development)
LOG_LEVEL=debug npm start

# Disable console output
ENABLE_CONSOLE_LOG=false npm start

# Disable file logging
ENABLE_FILE_LOG=false npm start

# Custom log directory
LOG_DIR=/custom/path/logs npm start
```

## 🎨 Presets for Common Scenarios

```javascript
import { applyLoggingPreset } from './config/logging.js';

// Production: only errors and warnings
applyLoggingPreset('PRODUCTION', logger);

// Development: all logs including debug
applyLoggingPreset('DEVELOPMENT', logger);

// Testing: only errors, no console output
applyLoggingPreset('TESTING', logger);

// Debug: maximum verbosity
applyLoggingPreset('DEBUG', logger);

// Silent: no logging
applyLoggingPreset('SILENT', logger);

// Monitoring: info and above, file only
applyLoggingPreset('MONITORING', logger);

// Critical: only errors
applyLoggingPreset('CRITICAL_ONLY', logger);
```

## 🏷️ Context-Aware Logging

Create specialized loggers for different parts of your application:

```javascript
import { createContextLogger } from './config/logging.js';

const authLogger = createContextLogger(logger, 'AUTH');
const dbLogger = createContextLogger(logger, 'DATABASE');
const apiLogger = createContextLogger(logger, 'API');

authLogger.info('User logged in successfully');
// Output: [AUTH] User logged in successfully

dbLogger.error('Connection failed');
// Output: [DATABASE] Connection failed

apiLogger.http('GET /api/users');
// Output: [API] GET /api/users
```

## ⏱️ Performance Logging

Monitor the performance of operations:

```javascript
import { logPerformance } from './config/logging.js';

const result = await logPerformance(logger, 'Database Query', async () => {
  return await db.findUser(userId);
});

// Automatically logs:
// ⏱️  Starting Database Query
// ✅ Database Query completed in 150ms
```

## 📊 Log Levels Hierarchy

```
error: 0    (highest priority)
warn:  1
info:  2
http:  3
debug: 4    (lowest priority)
```

When you set a level, you see that level and all higher priority levels:
- `error`: Only errors
- `warn`: Errors and warnings
- `info`: Errors, warnings, and info
- `http`: Errors, warnings, info, and HTTP requests
- `debug`: Everything

## 📁 File Outputs

Logs are automatically saved to files in the `logs/` directory:

- **`error.log`** - Only error messages
- **`combined.log`** - All log messages
- **`http.log`** - HTTP requests and above

Files are automatically rotated when they exceed 20MB, keeping 14 days of history.

## 🛠️ Configuration Options

### Logger Methods

```javascript
// Quick level changes
logger.enableOnlyErrors();         // Only errors
logger.enableErrorsAndWarnings();  // Errors and warnings
logger.enableInfoAndAbove();       // Info, warnings, and errors
logger.enableAllLogs();            // Everything including debug

// Custom level
logger.setLevel('warn');

// Get current configuration
console.log(logger.getConfig());
```

### Environment-Based Setup

```javascript
import { setupEnvironmentLogging } from './config/logging.js';

// Automatically configure based on NODE_ENV
setupEnvironmentLogging(logger);

// Or specify environment manually
setupEnvironmentLogging(logger, 'production');
```

## 🎮 Interactive Demo

Run the comprehensive demo to see all features in action:

```bash
node src/config/logging-demo.js
```

This demo shows:
- Basic logging at all levels
- Quick configuration methods
- Preset usage
- Context-aware logging
- Performance logging
- Environment-based configuration
- Practical usage examples

## 💡 Best Practices

### 1. Use Environment Variables in Production

```bash
# Production
NODE_ENV=production LOG_LEVEL=warn npm start

# Development
NODE_ENV=development LOG_LEVEL=debug npm start

# Testing
NODE_ENV=test LOG_LEVEL=error npm start
```

### 2. Use Context Loggers

```javascript
// Instead of generic logging
logger.info('User registration failed');

// Use context for better organization
const authLogger = createContextLogger(logger, 'AUTH');
authLogger.error('Registration failed: invalid email format');
```

### 3. Include Metadata for Errors

```javascript
logger.error('Database connection failed', {
  errorCode: 'DB_CONNECTION_TIMEOUT',
  host: 'localhost',
  port: 5432,
  retryAttempt: 3,
  timestamp: new Date().toISOString()
});
```

### 4. Use Performance Logging for Critical Operations

```javascript
// Monitor important operations
await logPerformance(logger, 'User Authentication', async () => {
  return await authenticateUser(credentials);
});

await logPerformance(logger, 'Database Migration', async () => {
  return await runMigrations();
});
```

## 🔧 Troubleshooting

### Logs Not Appearing

1. **Check the log level:**
   ```javascript
   console.log(logger.getConfig());
   ```

2. **Verify environment variables:**
   ```bash
   echo $LOG_LEVEL
   echo $ENABLE_CONSOLE_LOG
   ```

3. **Test with the highest verbosity:**
   ```javascript
   QUICK_CONFIGS.everything(logger);
   logger.debug('Test message');
   ```

### File Logging Issues

1. **Check directory permissions:**
   ```bash
   ls -la logs/
   ```

2. **Verify log directory exists:**
   ```javascript
   console.log(logger.getConfig().logDirectory);
   ```

3. **Check if file logging is enabled:**
   ```javascript
   console.log(logger.getConfig().fileLoggingEnabled);
   ```

## 📋 Common Use Cases

### Scenario 1: Production Deployment
```bash
NODE_ENV=production LOG_LEVEL=warn ENABLE_CONSOLE_LOG=false npm start
```

### Scenario 2: Development with Debugging
```bash
NODE_ENV=development LOG_LEVEL=debug npm start
```

### Scenario 3: Testing (Minimal Output)
```bash
NODE_ENV=test LOG_LEVEL=error ENABLE_CONSOLE_LOG=false npm test
```

### Scenario 4: Monitoring/Debugging Issues
```javascript
// Temporarily increase verbosity
QUICK_CONFIGS.everything(logger);

// Or use preset
applyLoggingPreset('DEBUG', logger);
```

### Scenario 5: Performance Analysis
```bash
LOG_PERFORMANCE=true LOG_LEVEL=info npm start
```

## 🎯 Quick Reference

| Goal | Method |
|------|--------|
| Only errors | `QUICK_CONFIGS.errorsOnly(logger)` |
| Errors + warnings | `QUICK_CONFIGS.errorsAndWarnings(logger)` |
| Standard logging | `QUICK_CONFIGS.infoAndAbove(logger)` |
| Full debugging | `QUICK_CONFIGS.everything(logger)` |
| Production setup | `applyLoggingPreset('PRODUCTION', logger)` |
| Development setup | `applyLoggingPreset('DEVELOPMENT', logger)` |
| Custom level | `logger.setLevel('warn')` |
| Check config | `logger.getConfig()` |

## 🤝 Contributing

When adding new logging functionality:

1. Update the logger configuration in `logger.js`
2. Add utility functions to `logging.js`
3. Include examples in `logging-demo.js`
4. Update this README with new features

---

**Need help?** Run the demo script or check the configuration with `logger.getConfig()`.