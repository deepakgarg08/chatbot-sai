import jsonrpc from "jsonrpc-lite";
import logger from "./config/logger.js";
import chatStorage from "./chatStorage.js";

export default function setupSocket(io) {
  logger.info(
    "🔌 setupSocket() - ENTRY: Initializing Socket.IO event handlers with ChatStorage integration",
  );

  function broadcastOnlineUsers() {
    logger.debug(
      "📡 broadcastOnlineUsers() - ENTRY: Broadcasting online users list",
    );

    try {
      const onlineUsers = chatStorage.getOnlineUsers();
      logger.info(
        `📡 broadcastOnlineUsers() - Found ${onlineUsers.length} online users: [${onlineUsers.join(", ")}]`,
      );

      const notification = jsonrpc.notification("onlineUsers", {
        users: onlineUsers,
      });
      io.emit("rpc", notification);

      logger.debug(
        "📡 broadcastOnlineUsers() - EXIT: Successfully broadcasted online users",
      );
    } catch (error) {
      logger.error(
        `❌ broadcastOnlineUsers() - ERROR: Failed to broadcast online users: ${error.message}`,
      );
    }
  }

  io.on("connection", (socket) => {
    logger.info(
      `🔗 CONNECTION - New user connected with socket ID: ${socket.id}`,
    );

    function sendResponse(response) {
      logger.debug(
        `📤 sendResponse() - ENTRY: Sending response to socket ${socket.id}`,
      );

      try {
        socket.emit("rpc", response);
        logger.debug(
          `📤 sendResponse() - EXIT: Response sent successfully to ${socket.id}`,
        );
      } catch (error) {
        logger.error(
          `❌ sendResponse() - ERROR: Failed to send response to ${socket.id}: ${error.message}`,
        );
      }
    }

    socket.on("rpc", (payload) => {
      logger.debug(
        `📨 RPC_MESSAGE - ENTRY: Received RPC message from socket ${socket.id}`,
      );

      let parsed;
      try {
        parsed = jsonrpc.parseObject(payload);
        logger.debug(
          `🔍 RPC_MESSAGE - Successfully parsed JSON-RPC payload, type: ${parsed.type}`,
        );
      } catch (err) {
        logger.warn(
          `⚠️ RPC_MESSAGE - Failed to parse JSON-RPC payload from ${socket.id}: ${err.message}`,
        );

        if (payload && payload.id) {
          const error = jsonrpc.error(
            payload.id,
            new jsonrpc.JsonRpcError("Parse error", -32700),
          );
          sendResponse(error);
        }
        return;
      }

      if (parsed.type === "request") {
        const { id, method, params } = parsed.payload;
        logger.info(
          `🎯 RPC_REQUEST - Method: ${method}, ID: ${id}, Socket: ${socket.id}`,
        );

        switch (method) {
          case "registerUser":
            logger.debug(
              `👤 registerUser() - ENTRY: Processing user registration for socket ${socket.id}`,
            );

            if (!params || !params.username) {
              logger.warn(
                `⚠️ registerUser() - Missing username parameter from socket ${socket.id}`,
              );
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Missing username", -32602),
              );
              sendResponse(error);
              return;
            }

            try {
              // Check if user already exists and update session
              if (chatStorage.hasUser(params.username)) {
                logger.info(
                  `🔄 registerUser() - User '${params.username}' already exists, updating session`,
                );
                chatStorage.updateUserSession(params.username, socket.id);
              } else {
                chatStorage.addUser(socket.id, params.username);
              }

              logger.info(
                `✅ registerUser() - User '${params.username}' registered successfully with socket ${socket.id}`,
              );

              const successResponse = jsonrpc.success(id, { registered: true });
              sendResponse(successResponse);

              broadcastOnlineUsers();
              logger.debug(
                `👤 registerUser() - EXIT: Registration completed for ${params.username}`,
              );
            } catch (error) {
              logger.error(
                `❌ registerUser() - ERROR: Failed to register user: ${error.message}`,
              );
              const errorResponse = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Registration failed", -32603),
              );
              sendResponse(errorResponse);
            }
            break;

          case "sendMessage":
            logger.debug(
              `💬 sendMessage() - ENTRY: Processing public message from socket ${socket.id}`,
            );

            if (
              !params ||
              typeof params.user !== "string" ||
              typeof params.text !== "string"
            ) {
              logger.warn(
                `⚠️ sendMessage() - Invalid parameters from socket ${socket.id}`,
              );
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError(
                  "Invalid params for sendMessage",
                  -32602,
                ),
              );
              sendResponse(error);
              return;
            }

            try {
              // Store message in ChatStorage
              const storedMessage = chatStorage.addPublicMessage(params);

              if (storedMessage) {
                logger.info(
                  `💬 sendMessage() - Public message stored and broadcasting from ${params.user}: "${params.text}"`,
                );

                const notification = jsonrpc.notification(
                  "chatMessage",
                  params,
                );
                io.emit("rpc", notification);

                const successResponse = jsonrpc.success(id, {
                  delivered: true,
                });
                sendResponse(successResponse);

                logger.debug(
                  `💬 sendMessage() - EXIT: Message delivered and stored successfully`,
                );
              } else {
                throw new Error("Failed to store message");
              }
            } catch (error) {
              logger.error(
                `❌ sendMessage() - ERROR: Failed to send message: ${error.message}`,
              );
              const errorResponse = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Message delivery failed", -32603),
              );
              sendResponse(errorResponse);
            }
            break;

          case "sendPrivateMessage":
            logger.debug(
              `🔒 sendPrivateMessage() - ENTRY: Processing private message from socket ${socket.id}`,
            );

            if (
              !params ||
              typeof params.sender !== "string" ||
              typeof params.recipient !== "string" ||
              typeof params.text !== "string"
            ) {
              logger.warn(
                `⚠️ sendPrivateMessage() - Invalid parameters from socket ${socket.id}`,
              );
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError(
                  "Invalid params for sendPrivateMessage",
                  -32602,
                ),
              );
              sendResponse(error);
              return;
            }

            try {
              const recipientLookup = chatStorage.getSocketIdByUsername(
                params.recipient,
              );

              if (!recipientLookup.success) {
                logger.warn(
                  `⚠️ sendPrivateMessage() - Recipient '${params.recipient}' not found or offline`,
                );
                const error = jsonrpc.error(
                  id,
                  new jsonrpc.JsonRpcError(
                    "Recipient user not found or offline",
                    -32004,
                  ),
                );
                sendResponse(error);
                return;
              }

              const recipientSocketId = recipientLookup.socketId;

              // Store message in ChatStorage
              const storedMessage = chatStorage.addPrivateMessage({
                from: params.sender,
                to: params.recipient,
                text: params.text,
                timestamp: params.timestamp,
              });

              if (storedMessage.success) {
                logger.info(
                  `🔒 sendPrivateMessage() - Private message stored and delivering from ${params.sender} to ${params.recipient}: "${params.text}"`,
                );

                const privateNotification = jsonrpc.notification(
                  "privateMessage",
                  {
                    from: params.sender,
                    text: params.text,
                    timestamp: params.timestamp || Date.now(),
                  },
                );

                // Send to recipient
                io.to(recipientSocketId).emit("rpc", privateNotification);
                // Also notify sender socket
                io.to(socket.id).emit("rpc", privateNotification);

                const successResponse = jsonrpc.success(id, {
                  delivered: true,
                });
                sendResponse(successResponse);

                logger.debug(
                  `🔒 sendPrivateMessage() - EXIT: Private message delivered and stored successfully`,
                );
              } else {
                throw new Error(
                  storedMessage.error || "Failed to store private message",
                );
              }
            } catch (error) {
              logger.error(
                `❌ sendPrivateMessage() - ERROR: Failed to send private message: ${error.message}`,
              );
              const errorResponse = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError(
                  "Private message delivery failed",
                  -32603,
                ),
              );
              sendResponse(errorResponse);
            }
            break;

          case "getChatHistory":
            logger.debug(
              `📚 getChatHistory() - ENTRY: Retrieving chat history for socket ${socket.id}`,
            );

            try {
              const username = chatStorage.getUserBySocketId(socket.id);
              if (!username) {
                logger.warn(
                  `⚠️ getChatHistory() - No user found for socket ${socket.id}`,
                );
                const error = jsonrpc.error(
                  id,
                  new jsonrpc.JsonRpcError("User not registered", -32604),
                );
                sendResponse(error);
                return;
              }

              // Get public messages
              const publicMessages = chatStorage.getPublicMessages(100);

              // Get all private chats for the user
              const privateChats =
                chatStorage.getAllPrivateChatsForUser(username);

              const chatHistory = {
                publicMessages,
                privateChats,
                timestamp: Date.now(),
              };

              logger.info(
                `📚 getChatHistory() - Retrieved ${publicMessages.length} public messages and ${Object.keys(privateChats).length} private chats for '${username}'`,
              );

              const successResponse = jsonrpc.success(id, chatHistory);
              sendResponse(successResponse);

              logger.debug(
                `📚 getChatHistory() - EXIT: Chat history sent successfully`,
              );
            } catch (error) {
              logger.error(
                `❌ getChatHistory() - ERROR: Failed to get chat history: ${error.message}`,
              );
              const errorResponse = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError(
                  "Chat history retrieval failed",
                  -32603,
                ),
              );
              sendResponse(errorResponse);
            }
            break;

          case "typing":
            logger.debug(
              `⌨️ typing() - ENTRY: Processing typing notification from socket ${socket.id}`,
            );

            if (!params || typeof params.username !== "string") {
              logger.warn(
                `⚠️ typing() - Missing typing username from socket ${socket.id}`,
              );
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Missing typing username", -32602),
              );
              sendResponse(error);
              return;
            }

            try {
              if (params.target) {
                logger.debug(
                  `⌨️ typing() - Private typing notification from ${params.username} to ${params.target}`,
                );
                // Private typing notification only to target user
                const targetSocketId = chatStorage.getSocketIdByUsername(
                  params.target,
                );

                if (targetSocketId) {
                  io.to(targetSocketId).emit(
                    "rpc",
                    jsonrpc.notification("typing", {
                      username: params.username,
                      target: params.target,
                    }),
                  );
                  logger.debug(
                    `⌨️ typing() - Private typing notification sent to ${params.target}`,
                  );
                }
              } else {
                logger.debug(
                  `⌨️ typing() - Public typing notification from ${params.username}`,
                );
                // Broadcast public typing notification to all except sender
                socket.broadcast.emit(
                  "rpc",
                  jsonrpc.notification("typing", { username: params.username }),
                );
              }

              const successResponse = jsonrpc.success(id, {});
              sendResponse(successResponse);
              logger.debug(`⌨️ typing() - EXIT: Typing notification processed`);
            } catch (error) {
              logger.error(
                `❌ typing() - ERROR: Failed to process typing notification: ${error.message}`,
              );
            }
            break;

          case "stopTyping":
            logger.debug(
              `⌨️ stopTyping() - ENTRY: Processing stop typing notification from socket ${socket.id}`,
            );

            if (!params || typeof params.username !== "string") {
              logger.warn(
                `⚠️ stopTyping() - Missing stopTyping username from socket ${socket.id}`,
              );
              const error = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Missing stopTyping username", -32602),
              );
              sendResponse(error);
              return;
            }

            try {
              if (params.target) {
                logger.debug(
                  `⌨️ stopTyping() - Private stop typing from ${params.username} to ${params.target}`,
                );
                const targetSocketId = chatStorage.getSocketIdByUsername(
                  params.target,
                );

                if (targetSocketId) {
                  io.to(targetSocketId).emit(
                    "rpc",
                    jsonrpc.notification("stopTyping", {
                      username: params.username,
                      target: params.target,
                    }),
                  );
                }
              } else {
                logger.debug(
                  `⌨️ stopTyping() - Public stop typing from ${params.username}`,
                );
                socket.broadcast.emit(
                  "rpc",
                  jsonrpc.notification("stopTyping", {
                    username: params.username,
                  }),
                );
              }

              const successResponse = jsonrpc.success(id, {});
              sendResponse(successResponse);
              logger.debug(
                `⌨️ stopTyping() - EXIT: Stop typing notification processed`,
              );
            } catch (error) {
              logger.error(
                `❌ stopTyping() - ERROR: Failed to process stop typing: ${error.message}`,
              );
            }
            break;

          case "getOnlineUsers":
            logger.debug(
              `👥 getOnlineUsers() - ENTRY: Request for online users from socket ${socket.id}`,
            );

            try {
              const onlineUsers = chatStorage.getOnlineUsers();
              const successResponse = jsonrpc.success(id, {
                users: onlineUsers,
              });
              sendResponse(successResponse);

              logger.info(
                `👥 getOnlineUsers() - Sent ${onlineUsers.length} online users to socket ${socket.id}`,
              );
              logger.debug(
                `👥 getOnlineUsers() - EXIT: Online users list sent`,
              );
            } catch (error) {
              logger.error(
                `❌ getOnlineUsers() - ERROR: Failed to get online users: ${error.message}`,
              );
              const errorResponse = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Failed to get online users", -32603),
              );
              sendResponse(errorResponse);
            }
            break;

          case "getStorageStats":
            logger.debug(
              `📊 getStorageStats() - ENTRY: Request for storage stats from socket ${socket.id}`,
            );

            try {
              const stats = chatStorage.getStorageStats();
              const successResponse = jsonrpc.success(id, stats);
              sendResponse(successResponse);

              logger.info(
                `📊 getStorageStats() - Storage stats sent to socket ${socket.id}`,
              );
              logger.debug(`📊 getStorageStats() - EXIT: Storage stats sent`);
            } catch (error) {
              logger.error(
                `❌ getStorageStats() - ERROR: Failed to get storage stats: ${error.message}`,
              );
              const errorResponse = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Failed to get storage stats", -32603),
              );
              sendResponse(errorResponse);
            }
            break;

          case "resetAllData":
            logger.debug(
              `🗑️ resetAllData() - ENTRY: Request to reset all data from socket ${socket.id}`,
            );

            try {
              const resetSuccess = chatStorage.resetAllData();
              if (resetSuccess) {
                const successResponse = jsonrpc.success(id, { reset: true });
                sendResponse(successResponse);

                // Broadcast to all clients that data was reset
                io.emit("rpc", jsonrpc.notification("dataReset", {}));

                logger.info(
                  `🗑️ resetAllData() - All data reset successfully by socket ${socket.id}`,
                );
                logger.debug(`🗑️ resetAllData() - EXIT: Data reset completed`);
              } else {
                throw new Error("Failed to reset data");
              }
            } catch (error) {
              logger.error(
                `❌ resetAllData() - ERROR: Failed to reset data: ${error.message}`,
              );
              const errorResponse = jsonrpc.error(
                id,
                new jsonrpc.JsonRpcError("Failed to reset data", -32603),
              );
              sendResponse(errorResponse);
            }
            break;

          default:
            logger.warn(
              `❓ UNKNOWN_METHOD - Unknown method '${method}' from socket ${socket.id}`,
            );
            const error = jsonrpc.error(
              id,
              new jsonrpc.JsonRpcError("Method not found", -32601),
            );
            sendResponse(error);
            break;
        }
      } else if (parsed.type === "invalid") {
        logger.warn(
          `❌ INVALID_RPC - Invalid JSON-RPC message format from socket ${socket.id}:`,
          payload,
        );

        if (payload && payload.id) {
          const error = jsonrpc.error(
            payload.id,
            new jsonrpc.JsonRpcError("Invalid Request", -32600),
          );
          sendResponse(error);
        }
      }

      logger.debug(
        `📨 RPC_MESSAGE - EXIT: Finished processing RPC message from socket ${socket.id}`,
      );
    });

    socket.on("disconnect", () => {
      logger.info(
        `🔌 DISCONNECT - ENTRY: User disconnecting from socket ${socket.id}`,
      );

      try {
        const result = chatStorage.removeUser(socket.id);
        const username = result.success ? result.removedUser.username : null;

        logger.info(
          `👋 DISCONNECT - User '${username || "Unknown"}' disconnected from socket ${socket.id}`,
        );

        broadcastOnlineUsers();
        logger.debug(
          `🔌 DISCONNECT - EXIT: Disconnect cleanup completed for ${username || "Unknown"}`,
        );
      } catch (error) {
        logger.error(
          `❌ DISCONNECT - ERROR: Failed to handle disconnect: ${error.message}`,
        );
      }
    });

    logger.debug(
      `🔗 CONNECTION - Socket event handlers registered for ${socket.id}`,
    );
  });

  logger.info(
    "✅ setupSocket() - EXIT: Socket.IO event handlers initialized successfully with ChatStorage integration",
  );
}
