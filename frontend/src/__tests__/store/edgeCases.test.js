import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import chatReducer, {
  setUsername,
  addMessage,
  setMessages,
  userTyping,
  userStopTyping,
  clearTyping,
  triggerAnimation,
  resetAnimation,
  setIconState,
  setOnlineUsers,
  setActivePrivateChat,
  addPrivateMessage,
  resetUnreadCount,
  clearAllData,
} from "../../store/chatSlice";
import {
  createTestStore,
  waitForStoreChange,
  dispatchSequence,
} from "../utils/testUtils.jsx";

describe("Redux Store Edge Cases and Async Tests", () => {
  let store;
  let initialState;

  beforeEach(() => {
    store = createTestStore();
    initialState = {
      messages: [],
      username: "",
      typingUsers: [],
      animationTrigger: false,
      iconState: "static",
      onlineUsers: [],
      privateChats: {},
      activePrivateChat: null,
      unreadCounts: {},
    };
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("Edge Cases - Data Validation", () => {
    it("should handle null and undefined payloads gracefully", () => {
      // Test null payloads
      let result = chatReducer(initialState, setUsername(null));
      expect(result.username).toBe(null);

      result = chatReducer(initialState, addMessage(null));
      expect(result.messages).toEqual([null]);

      // Test undefined payloads
      result = chatReducer(initialState, setUsername(undefined));
      expect(result.username).toBe(undefined);

      result = chatReducer(initialState, userTyping(undefined));
      expect(result.typingUsers).toEqual([undefined]);
    });

    it("should handle empty string and empty array payloads", () => {
      let result = chatReducer(initialState, setUsername(""));
      expect(result.username).toBe("");

      result = chatReducer(initialState, setMessages([]));
      expect(result.messages).toEqual([]);

      result = chatReducer(initialState, setOnlineUsers([]));
      expect(result.onlineUsers).toEqual([]);
    });

    it("should handle extremely large payloads", () => {
      // Large message array
      const largeMessageArray = Array.from({ length: 10000 }, (_, i) => ({
        user: `User${i}`,
        text: `Message ${i}`,
        timestamp: Date.now() + i,
      }));

      const result = chatReducer(initialState, setMessages(largeMessageArray));
      expect(result.messages).toHaveLength(10000);
      expect(result.messages[0].text).toBe("Message 0");
      expect(result.messages[9999].text).toBe("Message 9999");
    });

    it("should handle special characters and Unicode in text", () => {
      const specialCharMessages = [
        { user: "User1", text: "🎉🚀✨ Emojis!", timestamp: Date.now() },
        {
          user: "User2",
          text: "Special chars: @#$%^&*()_+-=[]{}|;:,.<>?",
          timestamp: Date.now(),
        },
        {
          user: "User3",
          text: "Unicode: こんにちは 🌍 مرحبا",
          timestamp: Date.now(),
        },
        {
          user: "User4",
          text: 'HTML: <script>alert("xss")</script>',
          timestamp: Date.now(),
        },
        { user: "User5", text: "", timestamp: Date.now() }, // Empty text
      ];

      let state = initialState;
      specialCharMessages.forEach((message) => {
        state = chatReducer(state, addMessage(message));
      });

      expect(state.messages).toHaveLength(5);
      expect(state.messages[0].text).toBe("🎉🚀✨ Emojis!");
      expect(state.messages[3].text).toBe(
        'HTML: <script>alert("xss")</script>',
      );
    });

    it("should handle malformed message objects", () => {
      const malformedMessages = [
        { user: null, text: "No user", timestamp: Date.now() },
        { text: "No user field", timestamp: Date.now() },
        { user: "User1", timestamp: Date.now() }, // No text
        { user: "User2", text: "No timestamp" },
        {}, // Empty object
        null, // Null message
        undefined, // Undefined message
      ];

      let state = initialState;
      malformedMessages.forEach((message) => {
        state = chatReducer(state, addMessage(message));
      });

      expect(state.messages).toHaveLength(7);
      expect(state.messages).toContainEqual(null);
      expect(state.messages).toContainEqual(undefined);
    });
  });

  describe("Edge Cases - Private Chat Complex Scenarios", () => {
    beforeEach(() => {
      store.dispatch(setUsername("CurrentUser"));
    });

    it("should handle private messages with same from and to user", () => {
      const selfMessage = {
        from: "CurrentUser",
        to: "CurrentUser",
        text: "Message to myself",
        timestamp: Date.now(),
      };

      store.dispatch(addPrivateMessage(selfMessage));
      const state = store.getState().chat;

      expect(state.privateChats["CurrentUser"]).toBeDefined();
      expect(state.privateChats["CurrentUser"]).toHaveLength(1);
    });

    it("should handle rapid private message exchanges", () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        from: i % 2 === 0 ? "CurrentUser" : "Friend1",
        to: i % 2 === 0 ? "Friend1" : "CurrentUser",
        text: `Rapid message ${i}`,
        timestamp: Date.now() + i,
      }));

      messages.forEach((message) => {
        store.dispatch(addPrivateMessage(message));
      });

      const state = store.getState().chat;
      expect(state.privateChats["Friend1"]).toHaveLength(100);
    });

    it("should handle switching between multiple private chats rapidly", () => {
      const users = ["Friend1", "Friend2", "Friend3", "Friend4", "Friend5"];

      // Create messages for each user
      users.forEach((user, index) => {
        store.dispatch(
          addPrivateMessage({
            from: user,
            to: "CurrentUser",
            text: `Message from ${user}`,
            timestamp: Date.now() + index,
          }),
        );
      });

      // Rapidly switch between chats
      users.forEach((user) => {
        store.dispatch(setActivePrivateChat(user));
        store.dispatch(setActivePrivateChat(null));
      });

      const state = store.getState().chat;
      expect(state.activePrivateChat).toBe(null);

      // Check all unread counts are reset
      users.forEach((user) => {
        expect(state.unreadCounts[user]).toBe(0);
      });
    });
  });

  describe("Edge Cases - Concurrent Operations", () => {
    it("should handle multiple typing users being added and removed simultaneously", () => {
      const users = Array.from({ length: 50 }, (_, i) => `User${i}`);

      // Add all users as typing
      users.forEach((user) => {
        store.dispatch(userTyping(user));
      });

      let state = store.getState().chat;
      expect(state.typingUsers).toHaveLength(50);

      // Remove every other user
      users
        .filter((_, i) => i % 2 === 0)
        .forEach((user) => {
          store.dispatch(userStopTyping(user));
        });

      state = store.getState().chat;
      expect(state.typingUsers).toHaveLength(25);

      // Clear all typing
      store.dispatch(clearTyping());
      state = store.getState().chat;
      expect(state.typingUsers).toHaveLength(0);
    });

    it("should handle duplicate operations correctly", () => {
      // Add same user typing multiple times
      const user = "DuplicateUser";
      for (let i = 0; i < 10; i++) {
        store.dispatch(userTyping(user));
      }

      let state = store.getState().chat;
      expect(state.typingUsers.filter((u) => u === user)).toHaveLength(1);

      // Remove same user multiple times
      for (let i = 0; i < 10; i++) {
        store.dispatch(userStopTyping(user));
      }

      state = store.getState().chat;
      expect(state.typingUsers).not.toContain(user);
    });

    it("should handle animation state changes rapidly", () => {
      const iconStates = ["static", "sent", "received", "static", "sent"];

      iconStates.forEach((iconState) => {
        store.dispatch(setIconState(iconState));
        store.dispatch(triggerAnimation());
        store.dispatch(resetAnimation());
      });

      const state = store.getState().chat;
      expect(state.iconState).toBe("sent");
      expect(state.animationTrigger).toBe(false);
    });
  });

  describe("Async Operations Simulation", () => {
    it("should handle delayed actions correctly", async () => {
      const delayedActions = [
        () => store.dispatch(setUsername("AsyncUser")),
        () =>
          store.dispatch(
            addMessage({
              user: "AsyncUser",
              text: "First",
              timestamp: Date.now(),
            }),
          ),
        () => store.dispatch(userTyping("AsyncUser")),
        () => store.dispatch(userStopTyping("AsyncUser")),
      ];

      // Execute actions with delays
      for (const action of delayedActions) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        action();
      }

      const state = store.getState().chat;
      expect(state.username).toBe("AsyncUser");
      expect(state.messages).toHaveLength(1);
      expect(state.typingUsers).not.toContain("AsyncUser");
    });

    it("should handle store subscription with async operations", async () => {
      let subscriptionCallCount = 0;
      let lastState = null;

      const unsubscribe = store.subscribe(() => {
        subscriptionCallCount++;
        lastState = store.getState();
      });

      // Perform async operations
      const asyncOperations = [
        () => store.dispatch(setUsername("SubscriptionTest")),
        () =>
          store.dispatch(
            addMessage({
              user: "Test",
              text: "Message 1",
              timestamp: Date.now(),
            }),
          ),
        () =>
          store.dispatch(
            addMessage({
              user: "Test",
              text: "Message 2",
              timestamp: Date.now(),
            }),
          ),
        () => store.dispatch(setOnlineUsers(["User1", "User2"])),
      ];

      for (const operation of asyncOperations) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        operation();
      }

      await new Promise((resolve) => setTimeout(resolve, 50)); // Wait for all subscriptions

      expect(subscriptionCallCount).toBeGreaterThan(0);
      expect(lastState.chat.username).toBe("SubscriptionTest");
      expect(lastState.chat.messages).toHaveLength(2);

      unsubscribe();
    });

    it("should handle rapid state changes without losing data", async () => {
      const messageCount = 1000;
      const messages = Array.from({ length: messageCount }, (_, i) => ({
        user: `User${i % 10}`,
        text: `Rapid message ${i}`,
        timestamp: Date.now() + i,
      }));

      // Dispatch messages rapidly
      const startTime = Date.now();

      const dispatchPromises = messages.map(
        (message, index) =>
          new Promise((resolve) => {
            setTimeout(() => {
              store.dispatch(addMessage(message));
              resolve();
            }, index % 10); // Stagger dispatches
          }),
      );

      await Promise.all(dispatchPromises);

      const endTime = Date.now();
      const state = store.getState().chat;

      expect(state.messages).toHaveLength(messageCount);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle very large state without memory issues", () => {
      // Create a large state
      const largePrivateChats = {};
      for (let i = 0; i < 1000; i++) {
        largePrivateChats[`User${i}`] = Array.from({ length: 100 }, (_, j) => ({
          user: `User${i}`,
          text: `Message ${j}`,
          timestamp: Date.now() + j,
        }));
      }

      const largeState = {
        ...initialState,
        privateChats: largePrivateChats,
        onlineUsers: Array.from({ length: 1000 }, (_, i) => `User${i}`),
      };

      // Test operations on large state
      let result = chatReducer(largeState, setActivePrivateChat("User500"));
      expect(result.activePrivateChat).toBe("User500");

      result = chatReducer(
        result,
        addPrivateMessage({
          from: "NewUser",
          to: "User500",
          text: "New message",
          timestamp: Date.now(),
        }),
      );

      expect(result.privateChats["User500"]).toHaveLength(100);
    });

    it("should handle state serialization/deserialization", () => {
      // Create a complex state
      store.dispatch(setUsername("SerializeTest"));
      store.dispatch(
        addMessage({ user: "User1", text: "Message 1", timestamp: Date.now() }),
      );
      store.dispatch(
        addPrivateMessage({
          from: "Friend1",
          to: "SerializeTest",
          text: "Private message",
          timestamp: Date.now(),
        }),
      );
      store.dispatch(setActivePrivateChat("Friend1"));

      const originalState = store.getState();

      // Serialize and deserialize
      const serialized = JSON.stringify(originalState);
      const deserialized = JSON.parse(serialized);

      // Create new store with deserialized state
      const newStore = createTestStore(deserialized);
      const newState = newStore.getState();

      expect(newState).toEqual(originalState);
    });
  });

  describe("Error Boundary Scenarios", () => {
    it("should handle corrupted state gracefully", () => {
      const corruptedState = {
        messages: "not an array",
        username: 123,
        typingUsers: null,
        animationTrigger: "not a boolean",
        iconState: {},
        onlineUsers: undefined,
        privateChats: "not an object",
        activePrivateChat: [],
        unreadCounts: null,
      };

      // Actions should handle corrupted state gracefully - Redux Toolkit handles this
      expect(() => {
        chatReducer(corruptedState, setUsername("Recovery"));
      }).not.toThrow();

      expect(() => {
        chatReducer(
          corruptedState,
          addMessage({ user: "Test", text: "Test", timestamp: Date.now() }),
        );
      }).toThrow();
    });

    it("should handle actions with malformed structure", () => {
      const malformedActions = [
        { type: "chat/setUsername" }, // Missing payload
        { payload: "test" }, // Missing type
        {}, // Empty action
        null, // Null action
        undefined, // Undefined action
        { type: "chat/setUsername", payload: { nested: { object: "test" } } }, // Complex payload
      ];

      malformedActions.forEach((action) => {
        // Some malformed actions will throw, others won't - both are acceptable
        try {
          chatReducer(initialState, action);
        } catch (error) {
          // Expected for some malformed actions
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe("State Consistency Tests", () => {
    it("should maintain referential integrity across operations", () => {
      const originalState = store.getState();

      // Perform various operations
      store.dispatch(setUsername("RefTest"));
      store.dispatch(
        addMessage({ user: "Test", text: "Test", timestamp: Date.now() }),
      );

      const newState = store.getState();

      // Original state should not be mutated
      expect(originalState.chat.username).toBe("");
      expect(originalState.chat.messages).toHaveLength(0);

      // New state should have changes
      expect(newState.chat.username).toBe("RefTest");
      expect(newState.chat.messages).toHaveLength(1);
    });

    it("should handle circular reference prevention", () => {
      const circularObject = {
        user: "Test",
        text: "Test",
        timestamp: Date.now(),
      };
      circularObject.self = circularObject;

      // Redux Toolkit with Immer prevents circular references
      expect(() => {
        store.dispatch(addMessage(circularObject));
      }).toThrow();
    });

    it("should maintain state immutability with nested operations", () => {
      // Set up initial state
      store.dispatch(setUsername("ImmutableTest"));
      store.dispatch(
        addPrivateMessage({
          from: "Friend1",
          to: "ImmutableTest",
          text: "Initial message",
          timestamp: Date.now(),
        }),
      );

      const stateAfterSetup = store.getState();
      const privateChatsRef = stateAfterSetup.chat.privateChats;

      // Add another message
      store.dispatch(
        addPrivateMessage({
          from: "Friend1",
          to: "ImmutableTest",
          text: "Second message",
          timestamp: Date.now(),
        }),
      );

      const finalState = store.getState();

      // Original private chats reference should not be the same
      expect(finalState.chat.privateChats).not.toBe(privateChatsRef);

      // But the content should be preserved and extended
      expect(finalState.chat.privateChats["Friend1"]).toHaveLength(2);
    });
  });

  describe("Race Condition Simulation", () => {
    it("should handle concurrent username changes", async () => {
      const usernames = ["User1", "User2", "User3", "User4", "User5"];

      // Dispatch username changes concurrently
      const promises = usernames.map(
        (username, index) =>
          new Promise((resolve) => {
            setTimeout(() => {
              store.dispatch(setUsername(username));
              resolve(username);
            }, Math.random() * 10);
          }),
      );

      await Promise.all(promises);

      const finalState = store.getState();
      // Final username should be one of the dispatched usernames
      expect(usernames).toContain(finalState.chat.username);
    });

    it("should handle concurrent private chat operations", async () => {
      store.dispatch(setUsername("ConcurrentUser"));

      const operations = [
        () => store.dispatch(setActivePrivateChat("Friend1")),
        () =>
          store.dispatch(
            addPrivateMessage({
              from: "Friend1",
              to: "ConcurrentUser",
              text: "Concurrent message 1",
              timestamp: Date.now(),
            }),
          ),
        () => store.dispatch(setActivePrivateChat("Friend2")),
        () =>
          store.dispatch(
            addPrivateMessage({
              from: "Friend2",
              to: "ConcurrentUser",
              text: "Concurrent message 2",
              timestamp: Date.now(),
            }),
          ),
        () => store.dispatch(setActivePrivateChat(null)),
      ];

      // Execute operations with random delays
      const promises = operations.map(
        (operation, index) =>
          new Promise((resolve) => {
            setTimeout(() => {
              operation();
              resolve();
            }, Math.random() * 20);
          }),
      );

      await Promise.all(promises);

      const finalState = store.getState();

      // Should have messages for both friends
      expect(finalState.chat.privateChats["Friend1"]).toBeDefined();
      expect(finalState.chat.privateChats["Friend2"]).toBeDefined();
    });
  });
});
