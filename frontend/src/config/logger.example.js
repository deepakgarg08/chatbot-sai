/**
 * Logger Usage Examples
 * This file demonstrates how to use the browser-compatible logging system
 */

import { log } from './logger.js';

// ============================================================================
// BASIC LOGGING EXAMPLES
// ============================================================================

// Simple logging
log.info('Application started successfully');
log.debug('Debug information', { userId: 123, sessionId: 'abc123' });
log.warn('This is a warning message');
log.error('An error occurred', { error: 'Connection failed' });

// ============================================================================
// COMPONENT LOGGING EXAMPLES
// ============================================================================

// Example: React component logging
const ExampleComponent = () => {
  const handleClick = () => {
    log.info('Button clicked', {
      component: 'ExampleComponent',
      action: 'click',
      timestamp: Date.now()
    });
  };

  const handleError = (error) => {
    log.error('Component error occurred', {
      component: 'ExampleComponent',
      error: error.message,
      stack: error.stack
    });
  };

  // Component lifecycle logging
  React.useEffect(() => {
    log.debug('Component mounted', { component: 'ExampleComponent' });

    return () => {
      log.debug('Component unmounting', { component: 'ExampleComponent' });
    };
  }, []);

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
};

// ============================================================================
// API CALL LOGGING EXAMPLES
// ============================================================================

// Example: API call logging
const apiCall = async (endpoint, data) => {
  const startTime = Date.now();

  log.info('API call started', {
    endpoint,
    method: 'POST',
    data: Object.keys(data)
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      log.info('API call successful', {
        endpoint,
        status: response.status,
        duration: `${duration}ms`
      });
    } else {
      log.warn('API call failed', {
        endpoint,
        status: response.status,
        duration: `${duration}ms`
      });
    }

    return response.json();
  } catch (error) {
    const duration = Date.now() - startTime;

    log.error('API call error', {
      endpoint,
      error: error.message,
      duration: `${duration}ms`
    });

    throw error;
  }
};

// ============================================================================
// SOCKET EVENT LOGGING EXAMPLES
// ============================================================================

// Example: Socket event logging
const socketLogger = {
  onConnect: (socket) => {
    log.info('Socket connected', {
      socketId: socket.id,
      url: socket.io.uri
    });
  },

  onDisconnect: (reason) => {
    log.warn('Socket disconnected', { reason });
  },

  onMessage: (event, data) => {
    log.debug('Socket message received', {
      event,
      dataSize: JSON.stringify(data).length
    });
  },

  onError: (error) => {
    log.error('Socket error', {
      error: error.message,
      type: error.type
    });
  }
};

// ============================================================================
// REDUX/STATE LOGGING EXAMPLES
// ============================================================================

// Example: Redux action logging
const logReduxAction = (action, prevState, nextState) => {
  log.debug('Redux action dispatched', {
    type: action.type,
    payload: action.payload,
    stateChanged: JSON.stringify(prevState) !== JSON.stringify(nextState)
  });
};

// Example: State change logging
const logStateChange = (componentName, oldState, newState) => {
  log.debug('State changed', {
    component: componentName,
    changes: Object.keys(newState).filter(key =>
      oldState[key] !== newState[key]
    )
  });
};

// ============================================================================
// PERFORMANCE LOGGING EXAMPLES
// ============================================================================

// Example: Performance timing
const performanceLogger = {
  startTimer: (operation) => {
    log.time(operation);
    log.debug('Performance timer started', { operation });
  },

  endTimer: (operation) => {
    log.timeEnd(operation);
    log.debug('Performance timer ended', { operation });
  },

  measureFunction: (fn, description = 'Function execution') => {
    const startTime = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - startTime;

      log.debug('Function performance', {
        description,
        duration: `${duration.toFixed(2)}ms`,
        success: true
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      log.error('Function performance (error)', {
        description,
        duration: `${duration.toFixed(2)}ms`,
        error: error.message
      });

      throw error;
    }
  }
};

// ============================================================================
// GROUPED LOGGING EXAMPLES
// ============================================================================

// Example: Grouped logging for related operations
const userLoginProcess = async (username, password) => {
  log.group('User Login Process');

  try {
    log.info('Starting login', { username });

    // Validate credentials
    log.debug('Validating credentials');
    const isValid = await validateCredentials(username, password);

    if (!isValid) {
      log.warn('Invalid credentials provided');
      throw new Error('Invalid credentials');
    }

    // Create session
    log.debug('Creating user session');
    const session = await createSession(username);

    log.info('Login successful', {
      username,
      sessionId: session.id
    });

    return session;
  } catch (error) {
    log.error('Login failed', {
      username,
      error: error.message
    });
    throw error;
  } finally {
    log.groupEnd();
  }
};

// ============================================================================
// TABLE LOGGING EXAMPLES
// ============================================================================

// Example: Table logging for structured data
const logUserData = (users) => {
  log.info('Displaying user data table');
  log.table(users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.isActive ? 'Active' : 'Inactive'
  })));
};

// ============================================================================
// ERROR BOUNDARY LOGGING EXAMPLES
// ============================================================================

// Example: Error boundary logging
const logComponentError = (error, errorInfo, componentName) => {
  log.group('Component Error Boundary');

  log.error('React component error', {
    component: componentName,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    errorInfo: {
      componentStack: errorInfo.componentStack
    }
  });

  log.groupEnd();
};

// ============================================================================
// CONDITIONAL LOGGING EXAMPLES
// ============================================================================

// Example: Feature flag logging
const logFeatureUsage = (featureName, enabled, userId) => {
  if (enabled) {
    log.info('Feature used', {
      feature: featureName,
      userId,
      timestamp: new Date().toISOString()
    });
  } else {
    log.debug('Feature disabled', {
      feature: featureName,
      userId
    });
  }
};

// Example: Environment-specific logging
const logEnvironmentInfo = () => {
  const isDev = import.meta.env.MODE === 'development';

  if (isDev) {
    log.debug('Development environment detected', {
      mode: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_API_URL
    });
  } else {
    log.info('Production environment', {
      version: import.meta.env.VITE_APP_VERSION
    });
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper function to sanitize sensitive data before logging
const sanitizeForLogging = (data) => {
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret'];
  const sanitized = { ...data };

  sensitiveKeys.forEach(key => {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
};

// Helper function to log with context
const logWithContext = (level, message, data = {}) => {
  const context = {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    ...data
  };

  log[level](message, sanitizeForLogging(context));
};

// ============================================================================
// EXPORT EXAMPLES FOR USE
// ============================================================================

export {
  ExampleComponent,
  apiCall,
  socketLogger,
  logReduxAction,
  logStateChange,
  performanceLogger,
  userLoginProcess,
  logUserData,
  logComponentError,
  logFeatureUsage,
  logEnvironmentInfo,
  sanitizeForLogging,
  logWithContext
};

// Example usage in your components:
/*
import { log } from './config/logger.js';

const MyComponent = () => {
  useEffect(() => {
    log.info('MyComponent mounted');
  }, []);

  const handleClick = () => {
    log.debug('Button clicked', { buttonId: 'submit' });
  };

  return <button onClick={handleClick}>Submit</button>;
};
*/
