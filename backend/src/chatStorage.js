import logger from "./config/logger.js";

class ChatStorage {
  constructor() {
    logger.info("🏗️ ChatStorage() - ENTRY: Initializing ChatStorage class");

    try {
      // In-memory storage
      this.publicMessages = [];
      this.privateChats = {}; // { "user1_user2": [messages] }
      this.users = new Map(); // socket.id -> username
      this.userSessions = new Map(); // username -> { socketId, lastSeen, isOnline }

      logger.info(
        "✅ ChatStorage() - EXIT: ChatStorage initialized successfully",
      );
      logger.debug(
        "📊 ChatStorage() - Initial state: 0 public messages, 0 private chats, 0 users",
      );
    } catch (error) {
      logger.error(
        `❌ ChatStorage() - ERROR: Failed to initialize ChatStorage: ${error.message}`,
      );
      throw error;
    }
  }

  // Encoding/Decoding utilities
  encodeMessage(message) {
    logger.debug("🔐 encodeMessage() - ENTRY: Starting message encoding");

    try {
      const encoded = Buffer.from(JSON.stringify(message)).toString("base64");
      logger.debug(
        `🔐 encodeMessage() - Message encoded successfully: "${message.text?.substring(0, 20)}..."`,
      );
      logger.debug("✅ encodeMessage() - EXIT: Message encoding completed");
      return encoded;
    } catch (error) {
      logger.error(
        `❌ encodeMessage() - ERROR: Failed to encode message: ${error.message}`,
      );
      return null;
    }
  }

  decodeMessage(encodedMessage) {
    logger.debug("🔓 decodeMessage() - ENTRY: Starting message decoding");

    try {
      const decoded = JSON.parse(
        Buffer.from(encodedMessage, "base64").toString(),
      );
      logger.debug(
        `🔓 decodeMessage() - Message decoded successfully: "${decoded.text?.substring(0, 20)}..."`,
      );
      logger.debug("✅ decodeMessage() - EXIT: Message decoding completed");
      return decoded;
    } catch (error) {
      logger.error(
        `❌ decodeMessage() - ERROR: Failed to decode message: ${error.message}`,
      );
      return null;
    }
  }

  encodeMessages(messages) {
    logger.debug(
      `📦 encodeMessages() - ENTRY: Encoding ${messages.length} messages`,
    );

    try {
      const encoded = messages
        .map((msg) => this.encodeMessage(msg))
        .filter(Boolean);
      logger.info(
        `📦 encodeMessages() - Successfully encoded ${encoded.length}/${messages.length} messages`,
      );
      logger.debug(
        "✅ encodeMessages() - EXIT: Bulk message encoding completed",
      );
      return encoded;
    } catch (error) {
      logger.error(
        `❌ encodeMessages() - ERROR: Failed to encode messages: ${error.message}`,
      );
      return [];
    }
  }

  decodeMessages(encodedMessages) {
    logger.debug(
      `📦 decodeMessages() - ENTRY: Decoding ${encodedMessages.length} messages`,
    );

    try {
      const decoded = encodedMessages
        .map((msg) => this.decodeMessage(msg))
        .filter(Boolean);
      logger.info(
        `📦 decodeMessages() - Successfully decoded ${decoded.length}/${encodedMessages.length} messages`,
      );
      logger.debug(
        "✅ decodeMessages() - EXIT: Bulk message decoding completed",
      );
      return decoded;
    } catch (error) {
      logger.error(
        `❌ decodeMessages() - ERROR: Failed to decode messages: ${error.message}`,
      );
      return [];
    }
  }

  // User management
  addUser(socketId, username) {
    logger.debug(
      `👤 addUser() - ENTRY: Adding user '${username}' with socket ${socketId}`,
    );

    try {
      // Validate input
      if (
        !socketId ||
        !username ||
        socketId.trim() === "" ||
        username.trim() === ""
      ) {
        logger.warn(
          `⚠️ addUser() - Invalid input: socketId='${socketId}', username='${username}'`,
        );
        return {
          success: false,
          error: "Socket ID and username are required and cannot be empty",
        };
      }

      // Check if user already exists
      if (this.userSessions.has(username)) {
        logger.warn(`⚠️ addUser() - User '${username}' already exists`);
        return {
          success: false,
          error: `User '${username}' already exists`,
        };
      }

      // Add new user
      this.users.set(socketId, username);
      this.userSessions.set(username, {
        socketId,
        lastSeen: new Date(),
        isOnline: true,
      });

      const user = {
        username,
        socketId,
        isOnline: true,
        lastSeen: new Date(),
      };

      logger.info(
        `✅ addUser() - New user '${username}' added successfully with socket ${socketId}`,
      );
      logger.debug(
        `📊 addUser() - Current stats: ${this.users.size} active connections, ${this.userSessions.size} total users`,
      );
      logger.debug("✅ addUser() - EXIT: User addition completed");

      return {
        success: true,
        user,
      };
    } catch (error) {
      logger.error(
        `❌ addUser() - ERROR: Failed to add user '${username}': ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  removeUser(socketId) {
    logger.debug(
      `👋 removeUser() - ENTRY: Removing user with socket ${socketId}`,
    );

    try {
      const username = this.users.get(socketId);

      if (username) {
        this.users.delete(socketId);
        const session = this.userSessions.get(username);

        if (session) {
          session.isOnline = false;
          session.lastSeen = new Date();
          logger.info(
            `👋 removeUser() - User '${username}' marked as offline, socket ${socketId} removed`,
          );
        }

        logger.debug(
          `📊 removeUser() - Current stats: ${this.users.size} active connections remaining`,
        );
        logger.debug(
          `✅ removeUser() - EXIT: User '${username}' removal completed`,
        );

        return {
          success: true,
          removedUser: {
            username,
            socketId,
            wasOnline: true,
          },
        };
      } else {
        logger.warn(`⚠️ removeUser() - No user found for socket ${socketId}`);
        logger.debug("✅ removeUser() - EXIT: No user to remove");
        return {
          success: false,
          error: `User with socket ${socketId} not found`,
        };
      }
    } catch (error) {
      logger.error(
        `❌ removeUser() - ERROR: Failed to remove user: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getOnlineUsers() {
    logger.debug("👥 getOnlineUsers() - ENTRY: Retrieving online users list");

    try {
      // Get unique usernames only (remove duplicates from multiple browser instances)
      const uniqueUsernames = [...new Set(this.users.values())];
      logger.debug(
        `👥 getOnlineUsers() - Found ${uniqueUsernames.length} unique online users: [${uniqueUsernames.join(", ")}]`,
      );
      logger.debug("✅ getOnlineUsers() - EXIT: Online users list retrieved");
      return uniqueUsernames;
    } catch (error) {
      logger.error(
        `❌ getOnlineUsers() - ERROR: Failed to get online users: ${error.message}`,
      );
      return [];
    }
  }

  getUserBySocketId(socketId) {
    logger.debug(
      `🔍 getUserBySocketId() - ENTRY: Looking up user for socket ${socketId}`,
    );

    try {
      const username = this.users.get(socketId);
      if (username) {
        logger.debug(
          `🔍 getUserBySocketId() - Found user '${username}' for socket ${socketId}`,
        );
        logger.debug("✅ getUserBySocketId() - EXIT: User lookup completed");
        return {
          success: true,
          user: {
            username,
            socketId,
          },
        };
      } else {
        logger.debug(
          `🔍 getUserBySocketId() - No user found for socket ${socketId}`,
        );
        logger.debug("✅ getUserBySocketId() - EXIT: User lookup completed");
        return {
          success: false,
          error: `No user found for socket ${socketId}`,
        };
      }
    } catch (error) {
      logger.error(
        `❌ getUserBySocketId() - ERROR: Failed to get user by socket ID: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getSocketIdByUsername(username) {
    logger.debug(
      `🔍 getSocketIdByUsername() - ENTRY: Looking up socket for user '${username}'`,
    );

    try {
      for (const [socketId, storedUsername] of this.users) {
        if (storedUsername === username) {
          logger.debug(
            `🔍 getSocketIdByUsername() - Found socket ${socketId} for user '${username}'`,
          );
          logger.debug(
            "✅ getSocketIdByUsername() - EXIT: Socket lookup completed",
          );
          return {
            success: true,
            socketId,
          };
        }
      }

      logger.debug(
        `🔍 getSocketIdByUsername() - No socket found for user '${username}'`,
      );
      logger.debug(
        "✅ getSocketIdByUsername() - EXIT: Socket lookup completed (not found)",
      );
      return {
        success: false,
        error: `No socket found for user '${username}'`,
      };
    } catch (error) {
      logger.error(
        `❌ getSocketIdByUsername() - ERROR: Failed to get socket by username: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Public message management
  addPublicMessage(message) {
    logger.debug(
      `💬 addPublicMessage() - ENTRY: Adding public message from '${message.username || message.user}'`,
    );

    try {
      // Validate input
      if (!message || !message.text || (!message.user && !message.username)) {
        logger.warn(
          `⚠️ addPublicMessage() - Invalid message data: missing required fields`,
        );
        return {
          success: false,
          error: "Message must have user/username and text fields",
        };
      }

      // Normalize user field - accept both 'user' and 'username'
      if (message.username && !message.user) {
        message.user = message.username;
      }

      const messageWithId = {
        id: Date.now() + Math.random(),
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        type: "public",
      };

      this.publicMessages.push(messageWithId);

      // Keep only last 1000 messages to prevent memory overflow
      const previousLength = this.publicMessages.length;
      if (this.publicMessages.length > 1000) {
        this.publicMessages = this.publicMessages.slice(-1000);
        logger.warn(
          `⚠️ addPublicMessage() - Trimmed public messages from ${previousLength} to 1000`,
        );
      }

      logger.info(
        `💬 addPublicMessage() - Public message added from '${message.username}': "${message.text}"`,
      );
      logger.debug(
        `📊 addPublicMessage() - Total public messages: ${this.publicMessages.length}`,
      );
      logger.debug(
        "✅ addPublicMessage() - EXIT: Public message addition completed",
      );

      return {
        success: true,
        message: messageWithId,
      };
    } catch (error) {
      logger.error(
        `❌ addPublicMessage() - ERROR: Failed to add public message: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getPublicMessages(limit = 100) {
    logger.debug(
      `📖 getPublicMessages() - ENTRY: Retrieving public messages (limit: ${limit})`,
    );

    try {
      const messages = this.publicMessages.slice(-limit);
      logger.info(
        `📖 getPublicMessages() - Retrieved ${messages.length} public messages (limit: ${limit})`,
      );
      logger.debug(
        "✅ getPublicMessages() - EXIT: Message retrieval completed",
      );
      return {
        success: true,
        messages,
      };
    } catch (error) {
      logger.error(
        `❌ getPublicMessages() - ERROR: Failed to get public messages: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
        messages: [],
      };
    }
  }

  getEncodedPublicMessages(limit = 100) {
    logger.debug(
      `📦 getEncodedPublicMessages() - ENTRY: Getting encoded public messages (limit: ${limit})`,
    );

    try {
      const messagesResult = this.getPublicMessages(limit);
      if (!messagesResult.success) {
        return messagesResult;
      }

      const encodedMessages = this.encodeMessages(messagesResult.messages);
      logger.debug(
        "✅ getEncodedPublicMessages() - EXIT: Encoded public messages retrieved",
      );
      return {
        success: true,
        encodedMessages,
      };
    } catch (error) {
      logger.error(
        `❌ getEncodedPublicMessages() - ERROR: Failed to get encoded public messages: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
        encodedMessages: [],
      };
    }
  }

  // Private message management
  getPrivateChatKey(user1, user2) {
    logger.debug(
      `🔑 getPrivateChatKey() - ENTRY: Generating chat key for '${user1}' and '${user2}'`,
    );

    try {
      // Always sort usernames to ensure consistent key
      const key = [user1, user2].sort().join("_");
      logger.debug(`🔑 getPrivateChatKey() - Generated chat key: '${key}'`);
      logger.debug(
        "✅ getPrivateChatKey() - EXIT: Chat key generation completed",
      );
      return key;
    } catch (error) {
      logger.error(
        `❌ getPrivateChatKey() - ERROR: Failed to generate chat key: ${error.message}`,
      );
      return null;
    }
  }

  addPrivateMessage(messageData) {
    logger.debug(
      `🔒 addPrivateMessage() - ENTRY: Adding private message from '${messageData.from}' to '${messageData.to}'`,
    );

    try {
      // Validate input
      if (
        !messageData ||
        !messageData.from ||
        !messageData.to ||
        !messageData.text
      ) {
        logger.warn(
          `⚠️ addPrivateMessage() - Invalid message data: missing required fields`,
        );
        return {
          success: false,
          error: "Message must have from, to, and text fields",
        };
      }

      // Check if both users exist
      if (!this.hasUser(messageData.from) || !this.hasUser(messageData.to)) {
        logger.warn(`⚠️ addPrivateMessage() - One or both users do not exist`);
        return {
          success: false,
          error: "Both sender and recipient must be registered users",
        };
      }

      const chatKey = this.getPrivateChatKey(messageData.from, messageData.to);

      if (!chatKey) {
        logger.error(`❌ addPrivateMessage() - Failed to generate chat key`);
        return {
          success: false,
          error: "Failed to generate chat key",
        };
      }

      if (!this.privateChats[chatKey]) {
        this.privateChats[chatKey] = [];
        logger.debug(
          `🔒 addPrivateMessage() - Created new private chat thread: '${chatKey}'`,
        );
      }

      const messageWithId = {
        id: Date.now() + Math.random(),
        from: messageData.from,
        to: messageData.to,
        text: messageData.text,
        timestamp: messageData.timestamp || new Date().toISOString(),
        type: "private",
      };

      this.privateChats[chatKey].push(messageWithId);

      // Keep only last 500 messages per chat to prevent memory overflow
      const previousLength = this.privateChats[chatKey].length;
      if (this.privateChats[chatKey].length > 500) {
        this.privateChats[chatKey] = this.privateChats[chatKey].slice(-500);
        logger.warn(
          `⚠️ addPrivateMessage() - Trimmed private chat '${chatKey}' from ${previousLength} to 500 messages`,
        );
      }

      logger.info(
        `🔒 addPrivateMessage() - Private message added from '${messageData.from}' to '${messageData.to}': "${messageData.text}"`,
      );
      logger.debug(
        `📊 addPrivateMessage() - Chat '${chatKey}' now has ${this.privateChats[chatKey].length} messages`,
      );
      logger.debug(
        "✅ addPrivateMessage() - EXIT: Private message addition completed",
      );

      return {
        success: true,
        message: messageWithId,
      };
    } catch (error) {
      logger.error(
        `❌ addPrivateMessage() - ERROR: Failed to add private message: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getPrivateMessages(user1, user2, limit = 100) {
    logger.debug(
      `📖 getPrivateMessages() - ENTRY: Retrieving private messages between '${user1}' and '${user2}'`,
    );

    try {
      const chatKey = this.getPrivateChatKey(user1, user2);
      const messages = this.privateChats[chatKey] || [];
      const limitedMessages = messages.slice(-limit);

      logger.info(
        `📖 getPrivateMessages() - Retrieved ${limitedMessages.length} private messages between '${user1}' and '${user2}' (limit: ${limit})`,
      );
      logger.debug(
        "✅ getPrivateMessages() - EXIT: Private messages retrieval completed",
      );
      return {
        success: true,
        messages: limitedMessages,
      };
    } catch (error) {
      logger.error(
        `❌ getPrivateMessages() - ERROR: Failed to get private messages: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
        messages: [],
      };
    }
  }

  getEncodedPrivateMessages(user1, user2, limit = 100) {
    logger.debug(
      `📦 getEncodedPrivateMessages() - ENTRY: Getting encoded private messages between '${user1}' and '${user2}'`,
    );

    try {
      const messagesResult = this.getPrivateMessages(user1, user2, limit);
      if (!messagesResult.success) {
        return messagesResult;
      }

      const encodedMessages = this.encodeMessages(messagesResult.messages);
      logger.debug(
        "✅ getEncodedPrivateMessages() - EXIT: Encoded private messages retrieval completed",
      );
      return {
        success: true,
        encodedMessages,
      };
    } catch (error) {
      logger.error(
        `❌ getEncodedPrivateMessages() - ERROR: Failed to get encoded private messages: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
        encodedMessages: [],
      };
    }
  }

  getAllPrivateChatsForUser(username) {
    logger.debug(
      `📚 getAllPrivateChatsForUser() - ENTRY: Retrieving all private chats for '${username}'`,
    );

    try {
      const userChats = {};
      let totalChats = 0;
      let totalMessages = 0;

      for (const [chatKey, messages] of Object.entries(this.privateChats)) {
        const participants = chatKey.split("_");
        if (participants.includes(username)) {
          const otherUser = participants.find((user) => user !== username);
          const chatMessages = messages.slice(-50); // Last 50 messages per chat
          userChats[otherUser] = chatMessages;
          totalChats++;
          totalMessages += chatMessages.length;
        }
      }

      logger.info(
        `📚 getAllPrivateChatsForUser() - Retrieved ${totalChats} private chats with ${totalMessages} total messages for '${username}'`,
      );
      logger.debug(
        "✅ getAllPrivateChatsForUser() - EXIT: All private chats retrieval completed",
      );
      return userChats;
    } catch (error) {
      logger.error(
        `❌ getAllPrivateChatsForUser() - ERROR: Failed to get all private chats: ${error.message}`,
      );
      return {};
    }
  }

  getEncodedAllPrivateChatsForUser(username) {
    logger.debug(
      `🔐 getEncodedAllPrivateChatsForUser() - ENTRY: Retrieving encoded private chats for '${username}'`,
    );

    try {
      const userChats = this.getAllPrivateChatsForUser(username);
      const encodedChats = {};

      for (const [otherUser, messages] of Object.entries(userChats)) {
        encodedChats[otherUser] = this.encodeMessages(messages);
      }

      logger.debug(
        `🔐 getEncodedAllPrivateChatsForUser() - Encoded ${Object.keys(encodedChats).length} chat threads`,
      );
      logger.debug(
        "✅ getEncodedAllPrivateChatsForUser() - EXIT: Encoded private chats retrieval completed",
      );
      return encodedChats;
    } catch (error) {
      logger.error(
        `❌ getEncodedAllPrivateChatsForUser() - ERROR: Failed to get encoded private chats: ${error.message}`,
      );
      return {};
    }
  }

  // Session management
  hasUser(username) {
    logger.debug(`❓ hasUser() - ENTRY: Checking if user '${username}' exists`);

    try {
      const exists = this.userSessions.has(username);
      logger.debug(
        `❓ hasUser() - User '${username}' ${exists ? "exists" : "does not exist"}`,
      );
      logger.debug("✅ hasUser() - EXIT: User existence check completed");
      return exists;
    } catch (error) {
      logger.error(
        `❌ hasUser() - ERROR: Failed to check user existence: ${error.message}`,
      );
      return false;
    }
  }

  getUserSession(username) {
    logger.debug(
      `🔍 getUserSession() - ENTRY: Retrieving session for user '${username}'`,
    );

    try {
      const session = this.userSessions.get(username);
      if (session) {
        logger.debug(
          `🔍 getUserSession() - Found session for '${username}': online=${session.isOnline}, lastSeen=${session.lastSeen}`,
        );
      } else {
        logger.debug(
          `🔍 getUserSession() - No session found for '${username}'`,
        );
      }
      logger.debug("✅ getUserSession() - EXIT: Session retrieval completed");
      return session;
    } catch (error) {
      logger.error(
        `❌ getUserSession() - ERROR: Failed to get user session: ${error.message}`,
      );
      return null;
    }
  }

  updateUserSession(username, socketId) {
    logger.debug(
      `🔄 updateUserSession() - ENTRY: Updating session for '${username}' with socket ${socketId}`,
    );

    try {
      const session = this.userSessions.get(username);
      if (session) {
        // Remove old socket ID mapping if it exists
        const oldSocketId = session.socketId;
        if (oldSocketId && this.users.has(oldSocketId)) {
          this.users.delete(oldSocketId);
          logger.debug(
            `🧹 updateUserSession() - Removed old socket mapping for '${username}' (${oldSocketId})`,
          );
        }

        // Update session with new socket ID
        session.socketId = socketId;
        session.isOnline = true;
        session.lastSeen = new Date();

        // Update the users map with new socket ID
        this.users.set(socketId, username);

        logger.info(
          `🔄 updateUserSession() - Session updated for '${username}' (${socketId})`,
        );
        logger.debug("✅ updateUserSession() - EXIT: Session update completed");
        return true;
      } else {
        logger.warn(
          `⚠️ updateUserSession() - No existing session found for '${username}', creating new one`,
        );
        return this.addUser(socketId, username);
      }
    } catch (error) {
      logger.error(
        `❌ updateUserSession() - ERROR: Failed to update user session: ${error.message}`,
      );
      return false;
    }
  }

  // Statistics and cleanup
  getStorageStats() {
    logger.debug("📊 getStorageStats() - ENTRY: Generating storage statistics");

    try {
      const stats = {
        totalPublicMessages: this.publicMessages.length,
        totalPrivateChats: Object.keys(this.privateChats).length,
        totalPrivateMessages: Object.values(this.privateChats).reduce(
          (sum, messages) => sum + messages.length,
          0,
        ),
        onlineUsers: this.users.size,
        totalUsers: this.userSessions.size,
        memoryUsage: process.memoryUsage().heapUsed,
      };

      logger.info(
        `📊 getStorageStats() - Current stats: ${stats.totalPublicMessages} public messages, ${stats.totalPrivateChats} private chats, ${stats.totalPrivateMessages} private messages, ${stats.onlineUsers} online users, ${stats.totalUsers} total users`,
      );
      logger.debug("✅ getStorageStats() - EXIT: Storage statistics generated");

      return {
        success: true,
        stats,
      };
    } catch (error) {
      logger.error(
        `❌ getStorageStats() - ERROR: Failed to get storage stats: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Cleanup old sessions (can be called periodically)
  cleanupOldSessions(hoursOld = 24) {
    logger.info(
      `🧹 cleanupOldSessions() - ENTRY: Starting cleanup of sessions older than ${hoursOld} hours`,
    );

    try {
      const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
      let cleaned = 0;

      for (const [username, session] of this.userSessions.entries()) {
        if (!session.isOnline && session.lastSeen < cutoff) {
          this.userSessions.delete(username);
          cleaned++;
          logger.debug(
            `🧹 cleanupOldSessions() - Removed old session for '${username}' (last seen: ${session.lastSeen})`,
          );
        }
      }

      if (cleaned > 0) {
        logger.info(
          `🧹 cleanupOldSessions() - Cleaned up ${cleaned} old user sessions`,
        );
      } else {
        logger.debug(`🧹 cleanupOldSessions() - No old sessions to clean up`);
      }

      logger.debug("✅ cleanupOldSessions() - EXIT: Session cleanup completed");
      return cleaned;
    } catch (error) {
      logger.error(
        `❌ cleanupOldSessions() - ERROR: Failed to cleanup old sessions: ${error.message}`,
      );
      return 0;
    }
  }

  // Export/Import for backup (optional)
  exportData() {
    logger.info("💾 exportData() - ENTRY: Starting data export");

    try {
      const data = {
        publicMessages: this.publicMessages,
        privateChats: this.privateChats,
        userSessions: Object.fromEntries(this.userSessions),
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      const dataSize = JSON.stringify(data).length;
      logger.info(
        `💾 exportData() - Data exported successfully (${dataSize} bytes)`,
      );
      logger.debug("✅ exportData() - EXIT: Data export completed");
      return data;
    } catch (error) {
      logger.error(
        `❌ exportData() - ERROR: Failed to export data: ${error.message}`,
      );
      return null;
    }
  }

  importData(data) {
    logger.info(
      `📥 importData() - ENTRY: Starting data import from ${data.exportedAt || "unknown date"}`,
    );

    try {
      let importedItems = 0;

      if (data.publicMessages && Array.isArray(data.publicMessages)) {
        this.publicMessages = data.publicMessages;
        importedItems++;
        logger.debug(
          `📥 importData() - Imported ${data.publicMessages.length} public messages`,
        );
      }

      if (data.privateChats && typeof data.privateChats === "object") {
        this.privateChats = data.privateChats;
        importedItems++;
        const totalPrivateMessages = Object.values(data.privateChats).reduce(
          (sum, messages) => sum + messages.length,
          0,
        );
        logger.debug(
          `📥 importData() - Imported ${Object.keys(data.privateChats).length} private chats with ${totalPrivateMessages} messages`,
        );
      }

      if (data.userSessions && typeof data.userSessions === "object") {
        this.userSessions = new Map(Object.entries(data.userSessions));
        importedItems++;
        logger.debug(
          `📥 importData() - Imported ${this.userSessions.size} user sessions`,
        );
      }

      logger.info(
        `📥 importData() - Successfully imported ${importedItems} data categories from ${data.exportedAt || "unknown date"}`,
      );
      logger.debug(
        "✅ importData() - EXIT: Data import completed successfully",
      );
      return true;
    } catch (error) {
      logger.error(
        `❌ importData() - ERROR: Failed to import chat data: ${error.message}`,
      );
      return false;
    }
  }

  resetAllData() {
    logger.debug("🗑️ resetAllData() - ENTRY: Clearing all chat data");

    try {
      // Clear all data structures
      this.users.clear();
      this.userSessions.clear();
      this.publicMessages = [];
      this.privateChats = {};

      logger.info("🗑️ resetAllData() - All chat data cleared successfully");
      logger.debug("✅ resetAllData() - EXIT: Data reset completed");

      return {
        success: true,
        message: "All chat data cleared successfully",
      };
    } catch (error) {
      logger.error(
        `❌ resetAllData() - ERROR: Failed to reset chat data: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
logger.info("🏭 Creating ChatStorage singleton instance");
const chatStorage = new ChatStorage();

// Set up periodic cleanup (every 6 hours)
setInterval(
  () => {
    logger.debug("🕒 Scheduled cleanup starting");
    chatStorage.cleanupOldSessions(24);
  },
  6 * 60 * 60 * 1000,
);

logger.info("✅ ChatStorage module initialization completed");

export default chatStorage;
