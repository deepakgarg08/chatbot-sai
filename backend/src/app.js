import express from "express";
import http from "http";
import { Server } from "socket.io";
import setupSocket from "./socket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // adjust for production
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Real-time Chat Backend is running");
});

// Delegate socket logic to socket.js
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
