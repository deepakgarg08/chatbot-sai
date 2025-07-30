import http from "http";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import setupSocket from "../../src/socket.js";

let ioServer, httpServer, httpServerAddr;

async function startServer() {
  const app = express();
  httpServer = http.createServer(app);
  ioServer = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });
  setupSocket(ioServer);
  await new Promise((resolve) => httpServer.listen(resolve));
  httpServerAddr = httpServer.address();
}

async function stopServer() {
  if (ioServer) ioServer.close();
  if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
}

export { startServer, stopServer, httpServerAddr };
