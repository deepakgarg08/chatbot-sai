import express from "express";
import http from "http";
import { Server } from "socket.io";
import setupSocket from "./socket.js";
import logger from "./config/logger.js";
import path from "path";
import { fileURLToPath } from "url"; 
import setupApp from "./helpers/appSetup.js";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from backend/dist directory
app.use(express.static(path.join(__dirname, "..", "dist")));

// React SPA Fallback for client-side routes
app.get(/^(?!.*\.(js|css|png|jpg|svg|webp|ico)$).*/, (req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});


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

// Setup socket handlers
logger.info("🔌 Initializing Socket.IO handlers");
try {
  setupSocket(io);
  logger.info("✅ Socket.IO handlers initialized successfully");
} catch (error) {
  logger.error(`❌ Failed to initialize Socket.IO handlers: ${error.message}`);
  process.exit(1);
}

// Call the setup function that applies the rest of the app setup
setupApp({ app, server, io, logger });

// Export for tests or other usage if needed
export { app, server, io };
