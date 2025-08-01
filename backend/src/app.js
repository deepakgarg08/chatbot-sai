// src/app.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import setupSocket from "./socket.js";
import logger from "./config/logger.js";

logger.info("🚀 Starting application initialization");

const app = express();
const server = http.createServer(app);

logger.info("📡 Creating Socket.IO server with CORS configuration");
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, but should be restricted in production.
    methods: ["GET", "POST"],
  },
});

logger.info("✅ Socket.IO server created successfully");

// HTTP Routes
app.get("/", (req, res) => {
  logger.http(
    `📨 GET / - Request from IP: ${req.ip || req.connection.remoteAddress}`,
  );

  try {
    res.send("Real-time Chat Backend is running");
    logger.http("📤 GET / - Response sent successfully");
  } catch (error) {
    logger.error(`❌ GET / - Error sending response: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  logger.http(
    `🏥 GET /health - Health check request from IP: ${req.ip || req.connection.remoteAddress}`,
  );

  try {
    const healthData = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    res.json(healthData);
    logger.http("📤 GET /health - Health check response sent successfully");
  } catch (error) {
    logger.error(`❌ GET /health - Error in health check: ${error.message}`);
    res.status(500).json({ status: "ERROR", message: "Health check failed" });
  }
});

// Setup socket handlers
logger.info("🔌 Initializing Socket.IO handlers");
try {
  setupSocket(io);
  logger.info("✅ Socket.IO handlers initialized successfully");
} catch (error) {
  logger.error(`❌ Failed to initialize Socket.IO handlers: ${error.message}`);
  process.exit(1);
}

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error(`💥 Unhandled application error: ${error.message}`, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
  });

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// ✅ Only start listening if not in test mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;

  logger.info(`🌐 Attempting to start server on port ${PORT}`);

  try {
    server.listen(PORT, () => {
      logger.info(
        `🎉 Server successfully started and listening on port ${PORT}`,
      );
      logger.info(`🔗 Server accessible at http://localhost:${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🆔 Process ID: ${process.pid}`);
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error(`❌ Server error: ${error.message}`);
      }
      process.exit(1);
    });

    // Graceful shutdown handling
    process.on("SIGTERM", () => {
      logger.info("🛑 SIGTERM received, starting graceful shutdown");
      server.close(() => {
        logger.info("✅ Server closed successfully");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("🛑 SIGINT received, starting graceful shutdown");
      server.close(() => {
        logger.info("✅ Server closed successfully");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
} else {
  logger.info("🧪 Running in test mode - server start skipped");
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error(`💀 Uncaught Exception: ${error.message}`, {
    stack: error.stack,
    pid: process.pid,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `💀 Unhandled Promise Rejection at: ${promise}, reason: ${reason}`,
  );
  process.exit(1);
});

logger.info("📋 Application initialization completed");

export { app, server };
