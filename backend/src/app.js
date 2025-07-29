import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production for security, allow your frontend URL(s)
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Basic REST endpoint
app.get("/", (req, res) => {
  res.send("Real-time Chat Backend is running");
});

// Socket.IO connection event
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for chat messages from clients
  socket.on("chat message", (msg) => {
    console.log(`Message received: ${msg}`);

    // Broadcast the message to all other clients
    socket.broadcast.emit("chat message", msg);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
