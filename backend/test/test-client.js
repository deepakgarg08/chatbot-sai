import { io } from "socket.io-client";
import jsonrpc from "jsonrpc-lite";

const socket = io("http://localhost:YOUR_BACKEND_PORT"); // Replace with your backend URL/port

socket.on("connect", () => {
  console.log("Connected to server with id:", socket.id);

  // 1. Register a user
  const registerReq = jsonrpc.request(1, "registerUser", { username: "testUser" });
  socket.emit("rpc", registerReq);

  // Listen for JSON-RPC responses and notifications
  socket.on("rpc", (payload) => {
    const parsed = jsonrpc.parseObject(payload);

    if (parsed.type === "success" && parsed.payload.id === 1) {
      console.log("Register user success:", parsed.payload.result);

      // 2. Send a message after user is registered
      const messageReq = jsonrpc.request(2, "sendMessage", {
        user: "testUser",
        text: "Hello from test client",
      });
      socket.emit("rpc", messageReq);
    }

    if (parsed.type === "notification" && parsed.payload.method === "chatMessage") {
      console.log("Notification chatMessage:", parsed.payload.params);
    }

    if (parsed.type === "success" && parsed.payload.id === 2) {
      console.log("Message send acknowledged:", parsed.payload.result);

      // 3. Send typing event
      const typingReq = jsonrpc.request(3, "typing", { username: "testUser" });
      socket.emit("rpc", typingReq);
    }

    if (parsed.type === "notification" && parsed.payload.method === "typing") {
      console.log("Typing notification:", parsed.payload.params);
    }

    if (parsed.type === "success" && parsed.payload.id === 3) {
      console.log("Typing event acknowledged");

      // 4. Send stopTyping event
      const stopTypingReq = jsonrpc.request(4, "stopTyping", { username: "testUser" });
      socket.emit("rpc", stopTypingReq);
    }

    if (parsed.type === "notification" && parsed.payload.method === "stopTyping") {
      console.log("Stop typing notification:", parsed.payload.params);
    }

    if (parsed.type === "success" && parsed.payload.id === 4) {
      console.log("Stop typing event acknowledged");

      // Disconnect after tests
      socket.disconnect();
    }
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from server.");
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err);
});
