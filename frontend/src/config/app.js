/**
 * Simple App Configuration
 */

// Environment
export const ENV = import.meta.env.MODE || "development";
export const IS_DEV = ENV === "development";
export const IS_PROD = ENV === "production";

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// App Settings
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || "AI Chatbot Socket",
  version: import.meta.env.VITE_APP_VERSION || "1.0.0",
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,

  // Feature flags
  features: {
    logging: import.meta.env.VITE_ENABLE_LOGGING !== "false", // Default: enabled
    devTools: IS_DEV,
  },

  // Logging configuration
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || (IS_DEV ? "debug" : "warn"),
    enabled: import.meta.env.VITE_ENABLE_LOGGING !== "false",
    forceDisabled: import.meta.env.VITE_DISABLE_ALL_LOGGING === "true",
    availableLevels: ["error", "warn", "info", "debug"],
    defaults: {
      development: "debug", // Shows all logs in development
      production: "warn", // Only warnings and errors in production
    },
    examples: {
      errorsOnly: "VITE_LOG_LEVEL=error",
      warningsAndErrors: "VITE_LOG_LEVEL=warn",
      infoAndAbove: "VITE_LOG_LEVEL=info",
      allLogs: "VITE_LOG_LEVEL=debug",
      disabled: "VITE_DISABLE_ALL_LOGGING=true",
    },
  },

  // UI Settings
  ui: {
    theme: "system", // light, dark, system
    maxMessageLength: 4000,
    typingTimeout: 3000,
  },
};

export default APP_CONFIG;
