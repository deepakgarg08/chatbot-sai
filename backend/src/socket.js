import jsonrpc from "jsonrpc-lite";

export default function setupSocket(io) {
  const users = new Map();

  function broadcastOnlineUsers() {
console.log('✌️broadcastOnlineUsers --->');
    const onlineUsers = Array.from(users.values());
    console.log('✌️onlineUsers --->', onlineUsers);

    io.emit("rpc", jsonrpc.notification("onlineUsers", { users: onlineUsers }));
  }

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Helper to send JSON-RPC responses or notifications
    function sendResponse(response) {
      socket.emit("rpc", response);
    }

    // Handler for incoming JSON-RPC messages on 'rpc' event
    socket.on("rpc", (payload) => {
      let parsed;
      try {
        parsed = jsonrpc.parseObject(payload);
      } catch (err) {
        console.warn("Failed to parse JSON-RPC payload:", err);
        // Send an error response if id exists
        if (payload && payload.id) {
          const error = jsonrpc.error(payload.id, new jsonrpc.JsonRpcError("Parse error", -32700));
          sendResponse(error);
        }
        return;
      }

      if (parsed.type === "request") {
        const { id, method, params } = parsed.payload;

        switch (method) {
          case "registerUser":
            if (!params || !params.username) {
              const error = jsonrpc.error(id, new jsonrpc.JsonRpcError("Missing username", -32602));
              sendResponse(error);
              return;
            }
            users.set(socket.id, params.username);
            console.log(`User registered: ${params.username} (socket ${socket.id})`);
            // Send successful response
            sendResponse(jsonrpc.success(id, { registered: true }));


            console.log("check am i fired")
            // Broadcast updated online users list to all clients
            broadcastOnlineUsers();
            break;

          case "sendMessage":
            if (
              !params ||
              typeof params.user !== "string" ||
              typeof params.text !== "string"
            ) {
              const error = jsonrpc.error(id, new jsonrpc.JsonRpcError("Invalid params for sendMessage", -32602));
              sendResponse(error);
              return;
            }
            console.log(`Message from ${params.user}: ${params.text}`);

            // Broadcast wrapped as JSON-RPC notification to all clients
            const notification = jsonrpc.notification("chatMessage", params);
            io.emit("rpc", notification);

            // Send ack to sender
            sendResponse(jsonrpc.success(id, { delivered: true }));
            break;

          case "typing":
            if (!params || typeof params.username !== "string") {
              const error = jsonrpc.error(id, new jsonrpc.JsonRpcError("Missing typing username", -32602));
              sendResponse(error);
              return;
            }
            // Broadcast typing notification to others
            const typingNotif = jsonrpc.notification("typing", { username: params.username });
            socket.broadcast.emit("rpc", typingNotif);
            sendResponse(jsonrpc.success(id, {}));
            break;

          case "stopTyping":
            if (!params || typeof params.username !== "string") {
              const error = jsonrpc.error(id, new jsonrpc.JsonRpcError("Missing stopTyping username", -32602));
              sendResponse(error);
              return;
            }
            // Broadcast stopTyping notification
            const stopTypingNotif = jsonrpc.notification("stopTyping", { username: params.username });
            socket.broadcast.emit("rpc", stopTypingNotif);
            sendResponse(jsonrpc.success(id, {}));
            break;

          case "getOnlineUsers":
            // Return the current list of online users
            sendResponse(jsonrpc.success(id, { users: Array.from(users.values()) }));
            break;

          default:
            // Method not found
            const error = jsonrpc.error(id, new jsonrpc.JsonRpcError("Method not found", -32601));
            sendResponse(error);
            break;
        }
      } else if (parsed.type === "invalid") {
        console.warn("Invalid JSON-RPC message format:", payload);
        if (payload && payload.id) {
          const error = jsonrpc.error(payload.id, new jsonrpc.JsonRpcError("Invalid Request", -32600));
          sendResponse(error);
        }
      }
    }); // end rpc handler

    socket.on("disconnect", () => {
      const username = users.get(socket.id);
      users.delete(socket.id);
      console.log(`User disconnected: ${username || "Unknown"} (socket ${socket.id})`);

      // Broadcast updated online users list after disconnect
      broadcastOnlineUsers();
    });
  });
}
