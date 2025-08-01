import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import store from "../../store/store";
import chatReducer from "../../store/chatSlice";

describe("Redux Store", () => {
  describe("store configuration", () => {
    it("should be created with correct initial state", () => {
      const state = store.getState();

      expect(state).toHaveProperty("chat");
      expect(state.chat).toEqual({
        messages: [],
        username: "",
        typingUsers: [],
        animationTrigger: false,
        iconState: "static",
        onlineUsers: [],
        privateChats: {},
        activePrivateChat: null,
        unreadCounts: {},
      });
    });

    it("should have chat reducer properly configured", () => {
      const state = store.getState();
      expect(state.chat).toBeDefined();
    });

    it("should be an instance of Redux store", () => {
      expect(store.dispatch).toBeTypeOf("function");
      expect(store.getState).toBeTypeOf("function");
      expect(store.subscribe).toBeTypeOf("function");
    });

    it("should handle actions correctly", () => {
      const initialState = store.getState();

      // Dispatch an action
      store.dispatch({
        type: "chat/setUsername",
        payload: "testUser",
      });

      const newState = store.getState();
      expect(newState.chat.username).toBe("testUser");
      expect(newState.chat.username).not.toBe(initialState.chat.username);
    });

    it("should maintain state consistency across multiple dispatches", () => {
      // Create a fresh store for this test to avoid interference
      const testStore = configureStore({
        reducer: {
          chat: chatReducer,
        },
      });

      // Add a message
      testStore.dispatch({
        type: "chat/addMessage",
        payload: { user: "user1", text: "Hello", timestamp: Date.now() },
      });

      // Set username
      testStore.dispatch({
        type: "chat/setUsername",
        payload: "testUser",
      });

      // Add typing user
      testStore.dispatch({
        type: "chat/userTyping",
        payload: "typingUser",
      });

      const finalState = testStore.getState();
      expect(finalState.chat.messages).toHaveLength(1);
      expect(finalState.chat.username).toBe("testUser");
      expect(finalState.chat.typingUsers).toContain("typingUser");
    });

    it("should handle unknown actions gracefully", () => {
      const initialState = store.getState();

      store.dispatch({
        type: "UNKNOWN_ACTION",
        payload: "test",
      });

      const newState = store.getState();
      expect(newState).toEqual(initialState);
    });
  });

  describe("store subscription", () => {
    it("should notify subscribers when state changes", () => {
      let callCount = 0;
      let latestState = null;

      const unsubscribe = store.subscribe(() => {
        callCount++;
        latestState = store.getState();
      });

      // Dispatch an action
      store.dispatch({
        type: "chat/setUsername",
        payload: "subscriberTest",
      });

      expect(callCount).toBeGreaterThan(0);
      expect(latestState.chat.username).toBe("subscriberTest");

      unsubscribe();
    });

    it("should not notify unsubscribed listeners", () => {
      let callCount = 0;

      const unsubscribe = store.subscribe(() => {
        callCount++;
      });

      // Unsubscribe immediately
      unsubscribe();

      const initialCallCount = callCount;

      // Dispatch an action
      store.dispatch({
        type: "chat/setUsername",
        payload: "unsubscribedTest",
      });

      expect(callCount).toBe(initialCallCount);
    });
  });

  describe("store state shape", () => {
    it("should maintain expected state structure", () => {
      const state = store.getState();

      // Check top-level structure
      expect(Object.keys(state)).toEqual(["chat"]);

      // Check chat slice structure
      const chatState = state.chat;
      const expectedKeys = [
        "messages",
        "username",
        "typingUsers",
        "animationTrigger",
        "iconState",
        "onlineUsers",
        "privateChats",
        "activePrivateChat",
        "unreadCounts",
      ];

      expectedKeys.forEach((key) => {
        expect(chatState).toHaveProperty(key);
      });
    });

    it("should have correct initial data types", () => {
      const { chat } = store.getState();

      expect(Array.isArray(chat.messages)).toBe(true);
      expect(typeof chat.username).toBe("string");
      expect(Array.isArray(chat.typingUsers)).toBe(true);
      expect(typeof chat.animationTrigger).toBe("boolean");
      expect(typeof chat.iconState).toBe("string");
      expect(Array.isArray(chat.onlineUsers)).toBe(true);
      expect(typeof chat.privateChats).toBe("object");
      expect(
        chat.activePrivateChat === null ||
          typeof chat.activePrivateChat === "string",
      ).toBe(true);
      expect(typeof chat.unreadCounts).toBe("object");
    });
  });

  describe("store performance", () => {
    it("should handle rapid state changes efficiently", () => {
      const startTime = Date.now();

      // Perform many rapid updates
      for (let i = 0; i < 1000; i++) {
        store.dispatch({
          type: "chat/addMessage",
          payload: {
            user: `user${i}`,
            text: `Message ${i}`,
            timestamp: Date.now(),
          },
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds

      const finalState = store.getState();
      expect(finalState.chat.messages).toHaveLength(1000);
    });

    it("should maintain consistent performance with large state", () => {
      // Create a store with large initial state
      const largePrivateChats = {};
      for (let i = 0; i < 100; i++) {
        largePrivateChats[`user${i}`] = Array.from({ length: 100 }, (_, j) => ({
          user: `user${i}`,
          text: `Message ${j}`,
          timestamp: Date.now(),
        }));
      }

      const testStore = configureStore({
        reducer: {
          chat: chatReducer,
        },
        preloadedState: {
          chat: {
            messages: [],
            username: "",
            typingUsers: [],
            animationTrigger: false,
            iconState: "static",
            onlineUsers: [],
            privateChats: largePrivateChats,
            activePrivateChat: null,
            unreadCounts: {},
          },
        },
      });

      const startTime = Date.now();

      // Perform operations on large state
      testStore.dispatch({
        type: "chat/setActivePrivateChat",
        payload: "user50",
      });

      testStore.dispatch({
        type: "chat/addPrivateMessage",
        payload: {
          from: "newUser",
          to: "user50",
          text: "New message",
          timestamp: Date.now(),
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should be fast enough

      const finalState = testStore.getState();
      expect(finalState.chat.activePrivateChat).toBe("user50");
    });
  });
});
