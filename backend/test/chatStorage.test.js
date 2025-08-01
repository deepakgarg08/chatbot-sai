// test/chatStorage.test.js

import { expect } from "chai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import ChatStorage instance
let chatStorage;

describe("ChatStorage - Persistent Chat Storage Tests", function () {
  this.timeout(10000);

  before(async function () {
    try {
      // Import the chatStorage singleton instance
      const module = await import("../src/chatStorage.js");
      chatStorage = module.default;
    } catch (error) {
      console.error("Failed to import ChatStorage:", error);
      throw error;
    }
  });

  beforeEach(function () {
    // Reset the chatStorage instance before each test
    if (chatStorage && typeof chatStorage.resetAllData === "function") {
      chatStorage.resetAllData();
    }
  });

  afterEach(function () {
    // Clean up any created log files during testing
    try {
      const logsDir = path.join(__dirname, "../logs");
      if (fs.existsSync(logsDir)) {
        const testLogFiles = fs
          .readdirSync(logsDir)
          .filter((file) => file.includes("test"));
        testLogFiles.forEach((file) => {
          fs.unlinkSync(path.join(logsDir, file));
        });
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("Basic Initialization", function () {
    it("should initialize ChatStorage with proper data structures", function () {
      expect(chatStorage).to.exist;
      expect(chatStorage.publicMessages).to.be.an("array");
      expect(chatStorage.privateChats).to.be.an("object");
      expect(chatStorage.users).to.be.instanceOf(Map);
      expect(chatStorage.userSessions).to.be.instanceOf(Map);
    });

    it("should have essential methods available", function () {
      const requiredMethods = [
        "addUser",
        "removeUser",
        "addPublicMessage",
        "getPublicMessages",
        "addPrivateMessage",
        "getPrivateMessages",
        "resetAllData",
        "getStorageStats",
      ];

      requiredMethods.forEach((method) => {
        expect(chatStorage).to.have.property(method).that.is.a("function");
      });
    });
  });

  describe("Message Encoding/Decoding", function () {
    it("should encode message to base64 format", function () {
      const testMessage = {
        id: "test-id",
        username: "testuser",
        text: "Hello World",
        timestamp: new Date().toISOString(),
      };

      const encoded = chatStorage.encodeMessage(testMessage);
      expect(encoded).to.be.a("string");

      // Verify it's valid base64
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const parsedMessage = JSON.parse(decoded);
      expect(parsedMessage).to.deep.equal(testMessage);
    });

    it("should decode base64 message back to original format", function () {
      const testMessage = {
        id: "test-id",
        username: "testuser",
        text: "Hello World",
        timestamp: new Date().toISOString(),
      };

      const encoded = chatStorage.encodeMessage(testMessage);
      const decoded = chatStorage.decodeMessage(encoded);

      expect(decoded).to.deep.equal(testMessage);
    });

    it("should handle invalid encoding gracefully", function () {
      const invalidEncoded = "invalid-base64-data!!!";
      const result = chatStorage.decodeMessage(invalidEncoded);
      expect(result).to.be.null;
    });
  });

  describe("User Management", function () {
    it("should add a new user successfully", function () {
      const result = chatStorage.addUser("socket123", "testuser");

      expect(result.success).to.be.true;
      expect(result.user.username).to.equal("testuser");
      expect(result.user.socketId).to.equal("socket123");
      expect(chatStorage.users.get("socket123")).to.equal("testuser");
    });

    it("should not add duplicate usernames", function () {
      chatStorage.addUser("socket123", "testuser");
      const result = chatStorage.addUser("socket456", "testuser");

      expect(result.success).to.be.false;
      expect(result.error).to.include("already exists");
    });

    it("should remove user successfully", function () {
      chatStorage.addUser("socket123", "testuser");
      const result = chatStorage.removeUser("socket123");

      expect(result.success).to.be.true;
      expect(result.removedUser.username).to.equal("testuser");
      expect(chatStorage.users.has("socket123")).to.be.false;
    });

    it("should check if user exists", function () {
      chatStorage.addUser("socket123", "testuser");

      expect(chatStorage.hasUser("testuser")).to.be.true;
      expect(chatStorage.hasUser("nonexistent")).to.be.false;
    });
  });

  describe("Public Message Management", function () {
    beforeEach(function () {
      chatStorage.addUser("socket1", "user1");
      chatStorage.addUser("socket2", "user2");
    });

    it("should add public message successfully", function () {
      const messageData = {
        username: "user1",
        text: "Hello everyone!",
        timestamp: new Date().toISOString(),
      };

      const result = chatStorage.addPublicMessage(messageData);
      expect(result.success).to.be.true;
      expect(result.message.text).to.equal("Hello everyone!");
      expect(result.message.username).to.equal("user1");
      expect(chatStorage.publicMessages).to.have.length(1);
    });

    it("should get public messages", function () {
      const message1 = {
        username: "user1",
        text: "Message 1",
        timestamp: new Date().toISOString(),
      };
      const message2 = {
        username: "user2",
        text: "Message 2",
        timestamp: new Date().toISOString(),
      };

      chatStorage.addPublicMessage(message1);
      chatStorage.addPublicMessage(message2);

      const messages = chatStorage.getPublicMessages();
      expect(messages.success).to.be.true;
      expect(messages.messages).to.have.length(2);
      expect(messages.messages[0].text).to.equal("Message 1");
      expect(messages.messages[1].text).to.equal("Message 2");
    });

    it("should handle empty public messages gracefully", function () {
      const messages = chatStorage.getPublicMessages();
      expect(messages.success).to.be.true;
      expect(messages.messages).to.be.an("array").that.is.empty;
    });
  });

  describe("Private Message Management", function () {
    beforeEach(function () {
      chatStorage.addUser("socket1", "user1");
      chatStorage.addUser("socket2", "user2");
      chatStorage.addUser("socket3", "user3");
    });

    it("should generate consistent private chat keys", function () {
      const key1 = chatStorage.getPrivateChatKey("user1", "user2");
      const key2 = chatStorage.getPrivateChatKey("user2", "user1");

      expect(key1).to.equal(key2);
      expect(key1).to.be.a("string");
    });

    it("should add private message successfully", function () {
      const messageData = {
        from: "user1",
        to: "user2",
        text: "Private hello!",
        timestamp: new Date().toISOString(),
      };

      const result = chatStorage.addPrivateMessage(messageData);
      expect(result.success).to.be.true;
      expect(result.message.text).to.equal("Private hello!");
      expect(result.message.from).to.equal("user1");
      expect(result.message.to).to.equal("user2");
    });

    it("should get private messages between two users", function () {
      const message1 = {
        from: "user1",
        to: "user2",
        text: "Hi user2!",
        timestamp: new Date().toISOString(),
      };
      const message2 = {
        from: "user2",
        to: "user1",
        text: "Hi user1!",
        timestamp: new Date().toISOString(),
      };

      chatStorage.addPrivateMessage(message1);
      chatStorage.addPrivateMessage(message2);

      const result = chatStorage.getPrivateMessages("user1", "user2");
      expect(result.success).to.be.true;
      expect(result.messages).to.have.length(2);
      expect(result.messages[0].text).to.equal("Hi user2!");
      expect(result.messages[1].text).to.equal("Hi user1!");
    });

    it("should handle non-existent private chats gracefully", function () {
      const result = chatStorage.getPrivateMessages("user1", "user2");
      expect(result.success).to.be.true;
      expect(result.messages).to.be.an("array").that.is.empty;
    });
  });

  describe("Storage Statistics and Management", function () {
    beforeEach(function () {
      chatStorage.addUser("socket1", "user1");
      chatStorage.addUser("socket2", "user2");
      chatStorage.addPublicMessage({
        username: "user1",
        text: "Public message",
        timestamp: new Date().toISOString(),
      });
      chatStorage.addPrivateMessage({
        from: "user1",
        to: "user2",
        text: "Private message",
        timestamp: new Date().toISOString(),
      });
    });

    it("should get accurate storage statistics", function () {
      const stats = chatStorage.getStorageStats();

      expect(stats.success).to.be.true;
      expect(stats.stats.totalUsers).to.equal(2);
      expect(stats.stats.onlineUsers).to.equal(2);
      expect(stats.stats.totalPublicMessages).to.equal(1);
      expect(stats.stats.totalPrivateChats).to.equal(1);
      expect(stats.stats.totalPrivateMessages).to.equal(1);
      expect(stats.stats.memoryUsage).to.be.a("number");
    });

    it("should reset all data successfully", function () {
      const result = chatStorage.resetAllData();

      expect(result.success).to.be.true;
      expect(chatStorage.publicMessages).to.be.empty;
      expect(chatStorage.privateChats).to.be.empty;
      expect(chatStorage.users.size).to.equal(0);
      expect(chatStorage.userSessions.size).to.equal(0);
    });
  });

  describe("Error Handling", function () {
    it("should handle invalid user addition gracefully", function () {
      const result = chatStorage.addUser("", ""); // Empty values
      expect(result.success).to.be.false;
      expect(result.error).to.be.a("string");
    });

    it("should handle invalid message data gracefully", function () {
      const result = chatStorage.addPublicMessage({}); // Empty message
      expect(result.success).to.be.false;
      expect(result.error).to.be.a("string");
    });

    it("should handle removal of non-existent user gracefully", function () {
      const result = chatStorage.removeUser("nonexistent-socket");
      expect(result.success).to.be.false;
      expect(result.error).to.include("not found");
    });

    it("should handle private message between non-existent users", function () {
      const messageData = {
        from: "nonexistent1",
        to: "nonexistent2",
        text: "This should fail",
        timestamp: new Date().toISOString(),
      };

      const result = chatStorage.addPrivateMessage(messageData);
      expect(result.success).to.be.false;
      expect(result.error).to.be.a("string");
    });
  });

  describe("Performance Tests", function () {
    it("should handle multiple users efficiently", function () {
      const startTime = Date.now();

      // Add 100 users
      for (let i = 0; i < 100; i++) {
        chatStorage.addUser(`socket${i}`, `user${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).to.be.lessThan(2000); // Should complete within 2 seconds
      expect(chatStorage.users.size).to.equal(100);
    });

    it("should handle multiple messages efficiently", function () {
      chatStorage.addUser("socket1", "user1");

      const startTime = Date.now();

      // Add 100 public messages
      for (let i = 0; i < 100; i++) {
        chatStorage.addPublicMessage({
          username: "user1",
          text: `Message ${i}`,
          timestamp: new Date().toISOString(),
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).to.be.lessThan(2000); // Should complete within 2 seconds
      expect(chatStorage.publicMessages).to.have.length(100);
    });
  });
});
