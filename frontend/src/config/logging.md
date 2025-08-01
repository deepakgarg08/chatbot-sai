# Logging Configuration Guide

This document explains how to configure and use the logging system in the React frontend application.

## 🚀 Quick Start

The logging system is **enabled by default** with smart defaults:
- **Development**: Shows all logs (debug level)
- **Production**: Shows only warnings and errors (warn level)

```javascript
import { log } from './config';

log.info('User logged in', { userId: 123 });
log.error('Something went wrong', { error: 'Connection failed' });
```

## ⚙️ Configuration Options

### Environment Variables

Create a `.env.local` file with these options:

```bash
# Log Level Control (choose one)
VITE_LOG_LEVEL=error    # Only errors
VITE_LOG_LEVEL=warn     # Warnings and errors (default for production)
VITE_LOG_LEVEL=info     # Info, warnings, and errors
VITE_LOG_LEVEL=debug    # All logs (default for development)

# Enable/Disable Logging
VITE_ENABLE_LOGGING=true     # Default: enabled
VITE_ENABLE_LOGGING=false    # Disable all logging

# Force Disable (overrides everything)
VITE_DISABLE_ALL_LOGGING=true   # Completely disable logging
```

### Log Levels (in order of severity)

1. **ERROR** (0) - Critical errors only
2. **WARN** (1) - Warnings and errors
3. **INFO** (2) - General information, warnings, and errors
4. **DEBUG** (3) - Everything (detailed debugging info)

## 📖 Usage Examples

### Basic Logging

```javascript
import { log } from './config';

// Different log levels
log.error('Critical error occurred', { userId: 123, error: 'Database connection failed' });
log.warn('Performance warning', { loadTime: 5000 });
log.info('User action completed', { action: 'login', success: true });
log.debug('Detailed debug info', { component: 'ChatInput', state: {...} });
```

### Component Logging

```javascript
const MyComponent = () => {
  useEffect(() => {
    log.info('Component mounted', { component: 'MyComponent' });
    
    return () => {
      log.debug('Component unmounting', { component: 'MyComponent' });
    };
  }, []);

  const handleClick = () => {
    log.debug('Button clicked', { 
      component: 'MyComponent',
      action: 'click',
      timestamp: Date.now()
    });
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

### API Call Logging

```javascript
const apiCall = async (endpoint) => {
  log.info('API call started', { endpoint });
  
  try {
    const response = await fetch(endpoint);
    
    if (response.ok) {
      log.info('API call successful', { endpoint, status: response.status });
    } else {
      log.warn('API call failed', { endpoint, status: response.status });
    }
    
    return response.json();
  } catch (error) {
    log.error('API call error', { endpoint, error: error.message });
    throw error;
  }
};
```

### Advanced Features

```javascript
// Grouped logging
log.group('User Registration Process');
log.info('Step 1: Validate email');
log.info('Step 2: Create account');
log.info('Step 3: Send welcome email');
log.groupEnd();

// Performance timing
log.time('Data Processing');
// ... your code ...
log.timeEnd('Data Processing');

// Table display for arrays
const users = [
  { id: 1, name: 'John', status: 'active' },
  { id: 2, name: 'Jane', status: 'inactive' }
];
log.table(users);
```

## 🔧 Runtime Control

### Check Current Configuration

```javascript
import logger from './config/logger';

console.log(logger.getConfig());
// Output:
// {
//   level: "debug",
//   enabled: true,
//   isDevelopment: true,
//   availableLevels: ["error", "warn", "info", "debug"],
//   recommendations: {...}
// }
```

### Check if Level is Enabled

```javascript
if (logger.isLevelEnabled('debug')) {
  // Expensive debug operation only if debug logging is enabled
  log.debug('Expensive debug data', computeExpensiveData());
}
```

## 🎯 Common Scenarios

### 1. Development (Show Everything)
```bash
VITE_LOG_LEVEL=debug
VITE_ENABLE_LOGGING=true
```

### 2. Production (Errors and Warnings Only)
```bash
VITE_LOG_LEVEL=warn
VITE_ENABLE_LOGGING=true
```

### 3. Production (Errors Only)
```bash
VITE_LOG_LEVEL=error
VITE_ENABLE_LOGGING=true
```

### 4. Completely Disable Logging
```bash
VITE_DISABLE_ALL_LOGGING=true
```

### 5. Testing Environment
```bash
VITE_LOG_LEVEL=error
VITE_ENABLE_LOGGING=false
```

## 📝 Best Practices

### 1. Use Appropriate Log Levels
```javascript
// ❌ Don't do this
log.error('User clicked button'); // Not an error!

// ✅ Do this
log.debug('User clicked button', { buttonId: 'submit' });
```

### 2. Include Context Data
```javascript
// ❌ Limited information
log.error('API failed');

// ✅ Rich context
log.error('API call failed', {
  endpoint: '/api/users',
  method: 'POST',
  status: 500,
  duration: '2.3s',
  userId: 'user_123'
});
```

### 3. Sanitize Sensitive Data
```javascript
const sanitizeData = (data) => {
  const sanitized = { ...data };
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  return sanitized;
};

log.info('User login attempt', sanitizeData(userData));
```

### 4. Use Performance Logging Wisely
```javascript
// Only in development
if (import.meta.env.MODE === 'development') {
  log.time('Component Render');
  // ... component logic ...
  log.timeEnd('Component Render');
}
```

## 🔍 Troubleshooting

### Logs Not Appearing?
1. Check if logging is enabled: `logger.getConfig()`
2. Verify log level: Higher severity logs (error) always show, lower (debug) may be filtered
3. Check browser console settings
4. Verify environment variables are loaded

### Too Many Logs?
1. Increase log level: `VITE_LOG_LEVEL=warn` or `VITE_LOG_LEVEL=error`
2. Disable specific components' debug logs
3. Use conditional logging for expensive operations

### Production Performance?
1. Set `VITE_LOG_LEVEL=warn` or `VITE_LOG_LEVEL=error`
2. Avoid expensive operations in log statements
3. Consider using `VITE_DISABLE_ALL_LOGGING=true` for critical performance

## 📊 Log Level Hierarchy

```
ERROR (0)  ← Only critical errors
  ↑
WARN (1)   ← Warnings + errors
  ↑
INFO (2)   ← General info + warnings + errors
  ↑
DEBUG (3)  ← Everything (most verbose)
```

When you set `VITE_LOG_LEVEL=warn`, you'll see WARN and ERROR logs, but not INFO or DEBUG.

## 🎨 Visual Output

The logger provides colored, timestamped output in development:

```
14:30:25 [ERROR]: API call failed { endpoint: "/api/users", status: 500 }
14:30:26 [WARN]: Slow response detected { duration: "3.2s" }
14:30:27 [INFO]: User logged in { userId: "user_123" }
14:30:28 [DEBUG]: Component state updated { component: "Chat" }
```

## 🚀 Default Behavior Summary

- **Development**: All logs shown (debug level) with colors and timestamps
- **Production**: Only warnings and errors shown (warn level) without colors
- **Always enabled** unless explicitly disabled
- **Browser-compatible** - no Node.js dependencies
- **Zero configuration required** - works out of the box with smart defaults