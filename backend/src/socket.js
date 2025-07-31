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

    function sendResponse(response) {
      socket.emit("rpc", response);
    }

    socket.on("rpc", (payload) => {
      let parsed;
      try {
        parsed = jsonrpc.parseObject(payload);
      } catch (err) {
        console.warn("Failed to parse JSON-RPC payload:", err);
        if (payload && payload.id) {
          const error = jsonrpc.error(
            payload.id,
            new jsonrpc.JsonRpcError("Parse error", -32700)
          );
          sendResponse(error);
        }
        return;
      }

      if (parsed.type === "request") {
        const { id, method, params } = parsed.payload;

        switch (method) {
          case "registerUser":
            if (!params || !params.username) {
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Missing username", -32602)
              );
              sendResponse(error);
              return;
            }
            users.set(socket.id, params.username);
            console.log(`User registered: ${params.username} (socket ${socket.id})`);
            sendResponse(jsonrpc.success(id, { registered: true }));

            broadcastOnlineUsers();
            break;

          case "sendMessage":
            if (
              !params ||
              typeof params.user !== "string" ||
              typeof params.text !== "string"
            ) {
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Invalid params for sendMessage", -32602)
              );
              sendResponse(error);
              return;
            }
            console.log(`Message from ${params.user}: ${params.text}`);

            io.emit("rpc", jsonrpc.notification("chatMessage", params));
            sendResponse(jsonrpc.success(id, { delivered: true }));
            break;

          case "typing":
            if (!params || typeof params.username !== "string") {
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Missing typing username", -32602)
              );
              sendResponse(error);
              return;
            }
            if (params.target) {
              // Private typing notification only to target user
              const targetSocketId = [...users.entries()].find(
                ([socketId, username]) => username === params.target
              )?.[0];
              if (targetSocketId) {
                io.to(targetSocketId).emit(
                  "rpc",
                  jsonrpc.notification("typing", {
                    username: params.username,
                    target: params.target,
                  })
                );
              }
            } else {
              // Broadcast public typing notification to all except sender
              socket.broadcast.emit(
                "rpc",
                jsonrpc.notification("typing", { username: params.username })
              );
            }
            sendResponse(jsonrpc.success(id, {}));
            break;

          case "stopTyping":
            if (!params || typeof params.username !== "string") {
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Missing stopTyping username", -32602)
              );
              sendResponse(error);
              return;
            }
            if (params.target) {
              const targetSocketId = [...users.entries()].find(
                ([socketId, username]) => username === params.target
              )?.[0];
              if (targetSocketId) {
                io.to(targetSocketId).emit(
                  "rpc",
                  jsonrpc.notification("stopTyping", {
                    username: params.username,
                    target: params.target,
                  })
                );
              }
            } else {
              socket.broadcast.emit(
                "rpc",
                jsonrpc.notification("stopTyping", { username: params.username })
              );
            }
            sendResponse(jsonrpc.success(id, {}));
            break;

          case "getOnlineUsers":
            sendResponse(
              jsonrpc.success(id, { users: Array.from(users.values()) })
            );
            break;

          case "sendPrivateMessage":
            if (
              !params ||
              typeof params.sender !== "string" ||
              typeof params.recipient !== "string" ||
              typeof params.text !== "string"
            ) {
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Invalid params for sendPrivateMessage", -32602)
              );
              sendResponse(error);
              return;
            }
            const recipientSocketId = [...users.entries()].find(
              ([socketId, username]) => username === params.recipient
            )?.[0];

            if (!recipientSocketId) {
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Recipient user not found or offline", -32004)
              );
              sendResponse(error);
              return;
            }

            io.to(recipientSocketId).emit(
              "rpc",
              jsonrpc.notification("privateMessage", {
                from: params.sender,
                text: params.text,
                timestamp: params.timestamp || Date.now(),
              })
            );
            // Also notify sender socket
            io.to(socket.id).emit("rpc", jsonrpc.notification("privateMessage", {
              from: params.sender,
              text: params.text,
              timestamp: params.timestamp || Date.now(),
            }));
            
            sendResponse(jsonrpc.success(id, { delivered: true }));
            break;

          default:
            const error = jsonrpc.error(
              id,
              new jsonrpc.JsonRpcError("Method not found", -32601)
            );
            sendResponse(error);
            break;
        }
      } else if (parsed.type === "invalid") {
        console.warn("Invalid JSON-RPC message format:", payload);
        if (payload && payload.id) {
          const error = jsonrpc.error(
            payload.id,
            new jsonrpc.JsonRpcError("Invalid Request", -32600)
          );
          sendResponse(error);
        }
      }
    });

    socket.on("disconnect", () => {
      const username = users.get(socket.id);
      users.delete(socket.id);
      console.log(`User disconnected: ${username || "Unknown"} (socket ${socket.id})`);

      broadcastOnlineUsers();
    });
  });
}
