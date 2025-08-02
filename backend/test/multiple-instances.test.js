import { strict as assert } from "assert";
import chatStorage from "../src/chatStorage.js";

describe("Multiple Browser Instance Fix Tests", () => {
  beforeEach(() => {
    // Reset chat storage before each test
    chatStorage.resetAllData();
  });

  describe("Single User Multiple Instances", () => {
    it("should handle multiple browser tabs for same user without duplicates", () => {
      const username = "john";
      const socketId1 = "socket-12345";
      const socketId2 = "socket-67890";
      const socketId3 = "socket-11111";

      console.log("🧪 Testing Multiple Browser Instance Fix");
      console.log('📋 Test Scenario: User "john" opens 3 browser tabs');

      // First tab connects
      console.log("\n1️⃣ First tab connects...");
      const result1 = chatStorage.addUser(socketId1, username);
      console.log(`   Result: ${JSON.stringify(result1)}`);

      assert.strictEqual(
        result1.success,
        true,
        "First connection should succeed",
      );
      assert.strictEqual(
        result1.user.username,
        username,
        "Username should match",
      );

      const onlineUsers1 = chatStorage.getOnlineUsers();
      console.log(`   Online users: [${onlineUsers1.join(", ")}]`);
      assert.strictEqual(
        onlineUsers1.length,
        1,
        "Should have 1 unique user online",
      );
      assert.strictEqual(onlineUsers1[0], username, "User should be john");

      // Second tab connects (should update session)
      console.log("\n2️⃣ Second tab connects...");
      const result2 = chatStorage.hasUser(username)
        ? chatStorage.updateUserSession(username, socketId2)
        : chatStorage.addUser(socketId2, username);
      console.log(`   Update session result: ${result2}`);

      assert.strictEqual(result2, true, "Session update should succeed");

      const onlineUsers2 = chatStorage.getOnlineUsers();
      console.log(`   Online users: [${onlineUsers2.join(", ")}]`);
      assert.strictEqual(
        onlineUsers2.length,
        1,
        "Should still have 1 unique user online",
      );
      assert.strictEqual(
        onlineUsers2[0],
        username,
        "User should still be john",
      );

      // Third tab connects
      console.log("\n3️⃣ Third tab connects...");
      const result3 = chatStorage.hasUser(username)
        ? chatStorage.updateUserSession(username, socketId3)
        : chatStorage.addUser(socketId3, username);
      console.log(`   Update session result: ${result3}`);

      assert.strictEqual(result3, true, "Session update should succeed");

      const onlineUsers3 = chatStorage.getOnlineUsers();
      console.log(`   Online users: [${onlineUsers3.join(", ")}]`);
      assert.strictEqual(
        onlineUsers3.length,
        1,
        "Should still have 1 unique user online",
      );
      assert.strictEqual(
        onlineUsers3[0],
        username,
        "User should still be john",
      );

      // Verify internal state
      console.log("\n📊 Current state:");
      console.log(`   Total socket connections: ${chatStorage.users.size}`);
      console.log(`   Total user sessions: ${chatStorage.userSessions.size}`);

      assert.strictEqual(
        chatStorage.users.size,
        1,
        "Should have only 1 active socket connection",
      );
      assert.strictEqual(
        chatStorage.userSessions.size,
        1,
        "Should have only 1 user session",
      );

      // Verify user session details
      const session = chatStorage.userSessions.get(username);
      assert.strictEqual(
        session.socketId,
        socketId3,
        "Session should have latest socket ID",
      );
      assert.strictEqual(session.isOnline, true, "User should be online");
    });

    it("should properly handle tab closures", () => {
      const username = "jane";
      const socketId1 = "socket-aaa";
      const socketId2 = "socket-bbb";
      const socketId3 = "socket-ccc";

      // Setup: user with 3 tabs
      chatStorage.addUser(socketId1, username);
      chatStorage.updateUserSession(username, socketId2);
      chatStorage.updateUserSession(username, socketId3);

      console.log("\n🔌 Simulating tab closures...");

      // Close first tab (old socket that's no longer active)
      console.log("\n❌ First tab closes...");
      const removed1 = chatStorage.removeUser(socketId1);
      console.log(`   Removed user: ${removed1}`);

      // Should return false since this socket was already replaced
      assert.strictEqual(
        removed1.success,
        false,
        "Should return false for inactive socket",
      );

      const onlineUsers1 = chatStorage.getOnlineUsers();
      console.log(`   Online users: [${onlineUsers1.join(", ")}]`);
      assert.strictEqual(onlineUsers1.length, 1, "User should still be online");
      assert.strictEqual(onlineUsers1[0], username, "User should be jane");

      // Close second tab (also inactive)
      console.log("\n❌ Second tab closes...");
      const removed2 = chatStorage.removeUser(socketId2);
      console.log(`   Removed user: ${removed2}`);

      assert.strictEqual(
        removed2.success,
        false,
        "Should return false for inactive socket",
      );

      const onlineUsers2 = chatStorage.getOnlineUsers();
      console.log(`   Online users: [${onlineUsers2.join(", ")}]`);
      assert.strictEqual(onlineUsers2.length, 1, "User should still be online");

      // Close third tab (the active one)
      console.log("\n❌ Third tab closes...");
      const removed3 = chatStorage.removeUser(socketId3);
      console.log(`   Removed user: ${removed3}`);

      assert.strictEqual(
        removed3.success,
        true,
        "Should return success for active socket",
      );
      assert.strictEqual(
        removed3.removedUser.username,
        username,
        "Should return correct username for active socket",
      );

      const onlineUsers3 = chatStorage.getOnlineUsers();
      console.log(`   Online users: [${onlineUsers3.join(", ")}]`);
      assert.strictEqual(onlineUsers3.length, 0, "Should have no users online");

      // Verify user is marked offline
      const session = chatStorage.userSessions.get(username);
      assert.strictEqual(
        session.isOnline,
        false,
        "User should be marked offline",
      );

      console.log("\n✅ Tab closure test passed!");
    });
  });

  describe("Multiple Users with Multiple Instances", () => {
    it("should handle multiple users each having multiple instances", () => {
      console.log("\n🧪 Testing Multiple Users with Multiple Instances");

      // User alice with 2 instances
      chatStorage.addUser("alice-1", "alice");
      chatStorage.updateUserSession("alice", "alice-2");

      // User bob with 3 instances
      chatStorage.addUser("bob-1", "bob");
      chatStorage.updateUserSession("bob", "bob-2");
      chatStorage.updateUserSession("bob", "bob-3");

      // User charlie with 1 instance
      chatStorage.addUser("charlie-1", "charlie");

      const onlineUsers = chatStorage.getOnlineUsers();
      console.log(`📊 Final online users: [${onlineUsers.join(", ")}]`);

      assert.strictEqual(
        onlineUsers.length,
        3,
        "Should have exactly 3 unique users",
      );
      assert(onlineUsers.includes("alice"), "Should include alice");
      assert(onlineUsers.includes("bob"), "Should include bob");
      assert(onlineUsers.includes("charlie"), "Should include charlie");

      // Verify no duplicates
      const uniqueUsers = [...new Set(onlineUsers)];
      assert.strictEqual(
        onlineUsers.length,
        uniqueUsers.length,
        "Should have no duplicate users in online list",
      );

      console.log("✅ Multiple users with multiple instances test passed!");
    });

    it("should maintain correct socket mapping after multiple updates", () => {
      const username = "testuser";
      const sockets = ["sock-1", "sock-2", "sock-3", "sock-4"];

      // Add user with first socket
      chatStorage.addUser(sockets[0], username);
      assert.strictEqual(chatStorage.users.get(sockets[0]), username);

      // Update session multiple times
      for (let i = 1; i < sockets.length; i++) {
        chatStorage.updateUserSession(username, sockets[i]);

        // Verify only the latest socket is mapped
        assert.strictEqual(
          chatStorage.users.get(sockets[i]),
          username,
          `Socket ${sockets[i]} should be mapped`,
        );

        // Verify old sockets are cleaned up
        for (let j = 0; j < i; j++) {
          assert.strictEqual(
            chatStorage.users.has(sockets[j]),
            false,
            `Old socket ${sockets[j]} should be removed`,
          );
        }
      }

      // Verify final state
      assert.strictEqual(
        chatStorage.users.size,
        1,
        "Should have only 1 socket mapping",
      );
      assert.strictEqual(
        chatStorage.getOnlineUsers().length,
        1,
        "Should show 1 unique user",
      );

      const session = chatStorage.userSessions.get(username);
      assert.strictEqual(
        session.socketId,
        sockets[sockets.length - 1],
        "Session should have latest socket ID",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid connection/disconnection cycles", () => {
      const username = "rapiduser";
      const sockets = ["rapid-1", "rapid-2", "rapid-3"];

      // Rapid connect/update cycle
      chatStorage.addUser(sockets[0], username);
      chatStorage.updateUserSession(username, sockets[1]);
      chatStorage.updateUserSession(username, sockets[2]);

      assert.strictEqual(
        chatStorage.getOnlineUsers().length,
        1,
        "Should have 1 user after rapid updates",
      );
      assert.strictEqual(
        chatStorage.users.size,
        1,
        "Should have 1 socket connection",
      );

      // Remove the active socket
      const removed = chatStorage.removeUser(sockets[2]);
      assert.strictEqual(removed.success, true, "Should remove the user");
      assert.strictEqual(
        removed.removedUser.username,
        username,
        "Should return correct username",
      );
      assert.strictEqual(
        chatStorage.getOnlineUsers().length,
        0,
        "Should have no users online",
      );
    });

    it("should handle attempt to remove non-existent socket", () => {
      const result = chatStorage.removeUser("non-existent-socket");
      assert.strictEqual(
        result.success,
        false,
        "Should return false for non-existent socket",
      );
    });

    it("should handle update session for non-existent user", () => {
      const result = chatStorage.updateUserSession("nonexistent", "socket-123");
      assert.strictEqual(
        result.success,
        true,
        "Should create new user when updating non-existent session",
      );
      assert.strictEqual(
        chatStorage.getOnlineUsers().length,
        1,
        "Should have 1 user online",
      );
    });
  });

  describe("Data Consistency", () => {
    it("should maintain data consistency between users Map and userSessions Map", () => {
      const users = ["alice", "bob", "charlie"];
      const sockets = ["s1", "s2", "s3"];

      // Add users
      users.forEach((user, index) => {
        chatStorage.addUser(sockets[index], user);
      });

      // Verify consistency
      assert.strictEqual(
        chatStorage.users.size,
        users.length,
        "users Map should have correct size",
      );
      assert.strictEqual(
        chatStorage.userSessions.size,
        users.length,
        "userSessions Map should have correct size",
      );

      // Update one user's session
      chatStorage.updateUserSession("alice", "new-socket");

      // Verify consistency after update
      assert.strictEqual(
        chatStorage.users.size,
        users.length,
        "users Map size should remain consistent",
      );
      assert.strictEqual(
        chatStorage.userSessions.size,
        users.length,
        "userSessions Map size should remain consistent",
      );
      assert.strictEqual(
        chatStorage.getOnlineUsers().length,
        users.length,
        "Online users count should be consistent",
      );

      // Verify alice has the new socket
      assert.strictEqual(
        chatStorage.users.get("new-socket"),
        "alice",
        "Alice should have new socket",
      );
      assert.strictEqual(
        chatStorage.users.has("s1"),
        false,
        "Old alice socket should be removed",
      );
    });
  });

  afterEach(() => {
    console.log("\n🧹 Cleaning up test data...");
    chatStorage.resetAllData();
  });
});

// Export for potential standalone execution
export default {
  runTests: () => {
    console.log("🚀 Running Multiple Instance Fix Tests...");
    // Tests will be run by the test runner
  },
};
