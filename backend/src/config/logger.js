import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels (0 = highest priority, 4 = lowest priority)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston about the colors
winston.addColors(colors);

// Configuration object for easy level management
const logConfig = {
  // Set LOG_LEVEL environment variable to control logging
  // Examples: LOG_LEVEL=error, LOG_LEVEL=warn, LOG_LEVEL=info, LOG_LEVEL=debug
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production"
      ? "warn"
      : process.env.NODE_ENV === "test"
        ? "error"
        : "debug"),

  // Enable/disable console logging
  enableConsole: process.env.ENABLE_CONSOLE_LOG !== "false",

  // Enable/disable file logging
  enableFileLogging: process.env.ENABLE_FILE_LOG !== "false",

  // Custom log directory
  logDirectory: process.env.LOG_DIR || path.join(__dirname, "../logs"),

  // Maximum file size before rotation
  maxFileSize: process.env.LOG_MAX_SIZE || "20m",

  // Maximum number of log files to keep
  maxFiles: process.env.LOG_MAX_FILES || "14d",
};

// Create logs directory if it doesn't exist
import fs from "fs";
if (logConfig.enableFileLogging && !fs.existsSync(logConfig.logDirectory)) {
  fs.mkdirSync(logConfig.logDirectory, { recursive: true });
}

// Console format with colors and simple layout
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const emoji = {
      error: "❌",
      warn: "⚠️ ",
      info: "ℹ️ ",
      http: "🌐",
      debug: "🔍",
    };
    return `${emoji[info.level.replace(/\x1B\[[0-9;]*m/g, "")] || ""} ${info.timestamp} [${info.level}]: ${info.message}`;
  }),
);

// File format with structured JSON
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Build transports array based on configuration
const transports = [];

// Console transport (if enabled)
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

if (logConfig.enableConsole) {
  transports.push(consoleTransport);
}

// File transports (if enabled)
const errorFileTransport = new winston.transports.File({
  filename: path.join(logConfig.logDirectory, "error.log"),
  level: "error",
  format: fileFormat,
  maxsize: logConfig.maxFileSize,
  maxFiles: logConfig.maxFiles,
});

const combinedFileTransport = new winston.transports.File({
  filename: path.join(logConfig.logDirectory, "combined.log"),
  format: fileFormat,
  maxsize: logConfig.maxFileSize,
  maxFiles: logConfig.maxFiles,
});

const httpFileTransport = new winston.transports.File({
  filename: path.join(logConfig.logDirectory, "http.log"),
  level: "http",
  format: fileFormat,
  maxsize: logConfig.maxFileSize,
  maxFiles: logConfig.maxFiles,
});

if (logConfig.enableFileLogging) {
  transports.push(errorFileTransport, combinedFileTransport, httpFileTransport);
}

// Create the logger
const logger = winston.createLogger({
  level: logConfig.level,
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
  ),
  transports,
  exitOnError: false,
});

// Helper functions for easy level management
logger.setLevel = (newLevel) => {
  if (levels.hasOwnProperty(newLevel)) {
    logger.level = newLevel;

    // Update console transport level if it exists
    if (consoleTransport) {
      consoleTransport.level = newLevel;
    }

    // Update combined file transport level if it exists
    if (combinedFileTransport) {
      combinedFileTransport.level = newLevel;
    }

    logger.info(`🔧 Log level changed to: ${newLevel}`);
  } else {
    logger.warn(
      `⚠️  Invalid log level: ${newLevel}. Valid levels: ${Object.keys(levels).join(", ")}`,
    );
  }
};

logger.enableOnlyErrors = () => logger.setLevel("error");
logger.enableErrorsAndWarnings = () => logger.setLevel("warn");
logger.enableInfoAndAbove = () => logger.setLevel("info");
logger.enableHttpAndAbove = () => logger.setLevel("http");
logger.enableAllLogs = () => logger.setLevel("debug");

// Method to get current configuration
logger.getConfig = () => ({
  currentLevel: logger.level,
  availableLevels: Object.keys(levels),
  consoleEnabled: logConfig.enableConsole,
  fileLoggingEnabled: logConfig.enableFileLogging,
  logDirectory: logConfig.logDirectory,
});

// Log startup information
logger.info("🚀 Logger initialized with configuration:", {
  level: logConfig.level,
  consoleEnabled: logConfig.enableConsole,
  fileLoggingEnabled: logConfig.enableFileLogging,
  logDirectory: logConfig.enableFileLogging
    ? logConfig.logDirectory
    : "disabled",
});

// Export the configured logger
export default logger;

// Export helper functions for direct use
export const {
  setLevel,
  enableOnlyErrors,
  enableErrorsAndWarnings,
  enableInfoAndAbove,
  enableHttpAndAbove,
  enableAllLogs,
  getConfig,
} = logger;

/*
USAGE EXAMPLES:

1. Environment Variables (recommended):
   LOG_LEVEL=error npm start          # Only errors
   LOG_LEVEL=warn npm start           # Errors and warnings
   LOG_LEVEL=info npm start           # Info, warnings, and errors
   LOG_LEVEL=debug npm start          # All logs

   ENABLE_CONSOLE_LOG=false npm start # Disable console output
   ENABLE_FILE_LOG=false npm start    # Disable file logging

2. Programmatic control:
   import logger from './logger.js';

   logger.enableOnlyErrors();         // Only errors
   logger.enableErrorsAndWarnings();  // Errors and warnings
   logger.enableInfoAndAbove();       // Info, warnings, and errors
   logger.enableAllLogs();            // All logs including debug

   // Custom level
   logger.setLevel('warn');

   // Check current config
   console.log(logger.getConfig());

3. Usage in code:
   logger.error('Something went wrong!');
   logger.warn('This is a warning');
   logger.info('Information message');
   logger.http('HTTP request details');
   logger.debug('Debug information');
*/
