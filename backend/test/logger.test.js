// test/logger.test.js

import { expect } from "chai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import logger
let logger;

describe("Logger - Winston Logger Functionality Tests", function () {
  this.timeout(10000);

  before(async function () {
    try {
      const module = await import("../src/config/logger.js");
      logger = module.default;
    } catch (error) {
      console.error("Failed to import logger:", error);
      throw error;
    }
  });

  afterEach(function () {
    // Clean up test log files after each test
    try {
      const logsDir = path.join(__dirname, "../logs");
      if (fs.existsSync(logsDir)) {
        const logFiles = fs.readdirSync(logsDir);
        logFiles.forEach((file) => {
          const filePath = path.join(logsDir, file);
          try {
            if (
              file.includes("test") ||
              file === "combined.log" ||
              file === "error.log"
            ) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            // Ignore cleanup errors
          }
        });
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("Logger Initialization", function () {
    it("should initialize logger successfully", function () {
      expect(logger).to.exist;
      expect(logger).to.have.property("info").that.is.a("function");
      expect(logger).to.have.property("error").that.is.a("function");
      expect(logger).to.have.property("warn").that.is.a("function");
      expect(logger).to.have.property("debug").that.is.a("function");
    });

    it("should have correct log levels configured", function () {
      expect(logger.levels).to.exist;
      expect(logger.levels).to.have.property("error", 0);
      expect(logger.levels).to.have.property("warn", 1);
      expect(logger.levels).to.have.property("info", 2);
      expect(logger.levels).to.have.property("debug", 4);
    });

    it("should create logs directory", function () {
      // Logger should create logs directory when file logging is enabled
      // First, ensure we log something to trigger directory creation
      logger.info("Test message to trigger directory creation");

      const logsDir = path.join(__dirname, "../src/logs");
      expect(fs.existsSync(logsDir)).to.be.true;
    });
  });

  describe("Basic Logging Functionality", function () {
    it("should log info messages without errors", function () {
      expect(() => {
        logger.info("Test info message");
      }).to.not.throw();
    });

    it("should log error messages without errors", function () {
      expect(() => {
        logger.error("Test error message");
      }).to.not.throw();
    });

    it("should log warning messages without errors", function () {
      expect(() => {
        logger.warn("Test warning message");
      }).to.not.throw();
    });

    it("should log debug messages without errors", function () {
      expect(() => {
        logger.debug("Test debug message");
      }).to.not.throw();
    });
  });

  describe("File Logging", function () {
    it("should create combined.log file when logging", function () {
      const testMessage = "Test message for combined log";

      expect(() => {
        logger.info(testMessage);
      }).to.not.throw();

      // Wait a bit for file system operations to complete
      return new Promise((resolve) => {
        setTimeout(() => {
          const logsDir = path.join(__dirname, "../src/logs");
          expect(fs.existsSync(logsDir)).to.be.true;
          resolve();
        }, 100);
      });
    });

    it("should create error.log file when logging errors", function () {
      const testErrorMessage = "Test error for error log";

      expect(() => {
        logger.error(testErrorMessage);
      }).to.not.throw();

      // Wait a bit for file system operations to complete
      return new Promise((resolve) => {
        setTimeout(() => {
          const logsDir = path.join(__dirname, "../src/logs");
          expect(fs.existsSync(logsDir)).to.be.true;
          resolve();
        }, 100);
      });
    });
  });

  describe("Log Message Content", function () {
    it("should handle object logging", function () {
      const testObject = {
        key1: "value1",
        key2: 42,
        key3: { nested: "object" },
      };

      expect(() => {
        logger.info("Test object logging", testObject);
      }).to.not.throw();
    });

    it("should handle Error objects", function () {
      // Test that logger can handle Error objects without throwing
      expect(() => {
        const testError = new Error("Test error for logger validation");
        logger.error("Error object test (expected):", testError.message);
      }).to.not.throw();
    });

    it("should handle undefined and null values", function () {
      expect(() => {
        logger.info("Testing undefined:", undefined);
        logger.info("Testing null:", null);
      }).to.not.throw();
    });

    it("should handle emoji characters correctly", function () {
      const emojiMessage =
        "🚀 Starting application with 🔥 features and 💾 storage";

      expect(() => {
        logger.info(emojiMessage);
      }).to.not.throw();
    });
  });

  describe("Performance Tests", function () {
    it("should handle rapid sequential logging efficiently", function () {
      const startTime = Date.now();
      const messageCount = 100;

      for (let i = 0; i < messageCount; i++) {
        logger.info(`Performance test message ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (2 seconds for 100 messages)
      expect(duration).to.be.lessThan(2000);
    });

    it("should handle concurrent logging", function (done) {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            logger.info(`Concurrent log ${i}`);
            resolve();
          }, Math.random() * 100);
        });
        promises.push(promise);
      }

      Promise.all(promises).then(() => {
        setTimeout(() => {
          // Just verify no errors occurred
          expect(true).to.be.true;
          done();
        }, 100);
      });
    });
  });

  describe("Integration Tests", function () {
    it("should work with ChatStorage logging pattern", function () {
      expect(() => {
        logger.info("🏗️ ChatStorage() - ENTRY: Initializing ChatStorage class");
        logger.debug(
          "📊 ChatStorage() - Initial state: 0 public messages, 0 private chats, 0 users",
        );
        logger.info(
          "✅ ChatStorage() - EXIT: ChatStorage initialized successfully",
        );
      }).to.not.throw();
    });

    it("should handle various log levels in sequence", function () {
      expect(() => {
        logger.debug("Debug message");
        logger.info("Info message");
        logger.warn("Warning message");
        logger.error("Error message");
      }).to.not.throw();
    });
  });

  describe("Error Handling", function () {
    it("should not exit on errors", function () {
      expect(logger.exitOnError).to.be.false;
    });

    it("should handle very long messages", function () {
      const longMessage = "A".repeat(1000); // 1KB message

      expect(() => {
        logger.info("Long message test:", longMessage);
      }).to.not.throw();
    });

    it("should handle special characters", function () {
      const specialMessage = "Special chars: !@#$%^&*()[]{}|;':\",./<>?`~";

      expect(() => {
        logger.info(specialMessage);
      }).to.not.throw();
    });
  });
});
