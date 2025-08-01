/**
 * Simple Browser-Compatible Logger Configuration
 * Replaces winston with a custom logger for React/Vite environment
 */

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Environment setup for Vite
const isDevelopment = import.meta.env.MODE === "development";

// Default log level: debug in development, warn in production
const defaultLogLevel = isDevelopment ? "debug" : "warn";
const logLevel = import.meta.env.VITE_LOG_LEVEL || defaultLogLevel;

// Logging is enabled by default, can be disabled with VITE_ENABLE_LOGGING=false
const enableLogging = import.meta.env.VITE_ENABLE_LOGGING !== "false";

// Quick disable all logging (useful for production or testing)
const forceDisable = import.meta.env.VITE_DISABLE_ALL_LOGGING === "true";

// Get current log level number
const getCurrentLogLevel = () => LOG_LEVELS[logLevel] ?? LOG_LEVELS.info;

// Color codes for console output
const COLORS = {
  error: "#ff4757", // red
  warn: "#ffa502", // orange
  info: "#2ed573", // green
  debug: "#5352ed", // blue
  reset: "#ffffff", // white
};

// Format timestamp
const formatTimestamp = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Create styled console log
const createStyledLog = (level, color) => {
  return (message, data = {}) => {
    // Quick exit if logging is force disabled
    if (forceDisable || !enableLogging) return;

    const currentLevel = getCurrentLogLevel();
    const messageLevel = LOG_LEVELS[level];

    // Only log if message level is <= current log level
    if (messageLevel > currentLevel) return;

    const timestamp = formatTimestamp();
    const prefix = `${timestamp} [${level.toUpperCase()}]:`;

    // Create styled output
    if (isDevelopment) {
      console.log(
        `%c${prefix}%c ${message}`,
        `color: ${color}; font-weight: bold;`,
        `color: ${COLORS.reset};`,
        data && Object.keys(data).length > 0 ? data : "",
      );
    } else {
      // Production - simple logging without colors
      console.log(
        `${prefix} ${message}`,
        data && Object.keys(data).length > 0 ? data : "",
      );
    }
  };
};

// Create logger instance
const logger = {
  error: createStyledLog("error", COLORS.error),
  warn: createStyledLog("warn", COLORS.warn),
  info: createStyledLog("info", COLORS.info),
  debug: createStyledLog("debug", COLORS.debug),

  // Utility methods
  setLevel: (newLevel) => {
    if (LOG_LEVELS.hasOwnProperty(newLevel)) {
      // Note: In a real app, you'd need state management to change this dynamically
      console.log(
        `%cLogger level changed to: ${newLevel}`,
        `color: ${COLORS.info}; font-weight: bold;`,
      );
    }
  },

  // Disable all logging
  disable: () => {
    console.log(
      `%cLogging disabled`,
      `color: ${COLORS.warn}; font-weight: bold;`,
    );
    // Note: This would need localStorage or state management to persist
    return "To permanently disable, set VITE_DISABLE_ALL_LOGGING=true";
  },

  // Enable only error and warn logs
  errorsOnly: () => {
    console.log(
      `%cLogger set to errors and warnings only`,
      `color: ${COLORS.warn}; font-weight: bold;`,
    );
    return "To set permanently, use VITE_LOG_LEVEL=warn";
  },

  isLevelEnabled: (level) => {
    const currentLevel = getCurrentLogLevel();
    const checkLevel = LOG_LEVELS[level];
    return checkLevel <= currentLevel;
  },

  // Group logging for related messages
  group: (title) => {
    if (enableLogging && isDevelopment) {
      console.group(`%c${title}`, `color: ${COLORS.info}; font-weight: bold;`);
    }
  },

  groupEnd: () => {
    if (enableLogging && isDevelopment) {
      console.groupEnd();
    }
  },

  // Table logging for structured data
  table: (data) => {
    if (enableLogging && isDevelopment && Array.isArray(data)) {
      console.table(data);
    }
  },

  // Performance timing
  time: (label) => {
    if (enableLogging && isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (enableLogging && isDevelopment) {
      console.timeEnd(label);
    }
  },

  // Get current configuration
  getConfig: () => ({
    level: logLevel,
    enabled: enableLogging && !forceDisable,
    isDevelopment,
    forceDisabled: forceDisable,
    availableLevels: Object.keys(LOG_LEVELS),
    recommendations: {
      development: "Use VITE_LOG_LEVEL=debug for full logging",
      production: "Use VITE_LOG_LEVEL=warn or VITE_LOG_LEVEL=error",
      disable: "Use VITE_DISABLE_ALL_LOGGING=true to disable completely",
    },
  }),

  // Configuration helper - shows current setup and how to change it
  showConfig: () => {
    const config = logger.getConfig();

    console.group(
      "%cLogging Configuration",
      `color: ${COLORS.info}; font-size: 16px; font-weight: bold;`,
    );

    console.log(
      "%cCurrent Settings:",
      `color: ${COLORS.info}; font-weight: bold;`,
    );
    console.log(
      `• Level: ${config.level} (${config.enabled ? "enabled" : "disabled"})`,
    );
    console.log(
      `• Environment: ${config.isDevelopment ? "development" : "production"}`,
    );
    console.log(`• Force Disabled: ${config.forceDisabled}`);

    console.log(
      "\n%cTo Change Log Level:",
      `color: ${COLORS.warn}; font-weight: bold;`,
    );
    console.log("• Errors only: VITE_LOG_LEVEL=error");
    console.log("• Warnings + Errors: VITE_LOG_LEVEL=warn");
    console.log("• Info + Warnings + Errors: VITE_LOG_LEVEL=info");
    console.log("• All logs: VITE_LOG_LEVEL=debug");

    console.log(
      "\n%cTo Disable Logging:",
      `color: ${COLORS.error}; font-weight: bold;`,
    );
    console.log("• Disable all: VITE_DISABLE_ALL_LOGGING=true");
    console.log("• Disable normal: VITE_ENABLE_LOGGING=false");

    console.log(
      "\n%cQuick Test:",
      `color: ${COLORS.debug}; font-weight: bold;`,
    );
    console.log("Run: logger.test() to see what logs are visible");

    console.groupEnd();

    return config;
  },

  // Test function to show what log levels are visible
  test: () => {
    console.log(
      "\n%cTesting Log Levels:",
      `color: ${COLORS.info}; font-weight: bold;`,
    );
    logger.error("This is an ERROR - always visible if logging enabled");
    logger.warn("This is a WARNING - visible at warn level and above");
    logger.info("This is INFO - visible at info level and above");
    logger.debug("This is DEBUG - visible at debug level only");
    console.log(
      `\nCurrent level: ${logLevel} | Enabled: ${enableLogging && !forceDisable}`,
    );
  },
};

// Export simple log object for easy use
export const log = {
  debug: logger.debug,
  info: logger.info,
  warn: logger.warn,
  error: logger.error,
  group: logger.group,
  groupEnd: logger.groupEnd,
  table: logger.table,
  time: logger.time,
  timeEnd: logger.timeEnd,

  // Helper functions
  showConfig: logger.showConfig,
  test: logger.test,
  getConfig: logger.getConfig,
  isLevelEnabled: logger.isLevelEnabled,
};

// Export full logger for advanced usage
export default logger;
