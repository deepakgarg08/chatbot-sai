import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import chatReducer, {
  setUsername,
  addMessage,
  setActivePrivateChat,
  addPrivateMessage,
  userTyping,
  userStopTyping,
  setOnlineUsers,
  triggerAnimation,
  setIconState,
} from "../../store/chatSlice";

// Mock components for testing
const MockChatComponent = () => {
  const dispatch = useDispatch();
  const { messages, username, typingUsers, onlineUsers } = useSelector(
    (state) => state.chat,
  );

  return (
    <div>
      <div data-testid="username">{username}</div>
      <div data-testid="message-count">{messages.length}</div>
      <div data-testid="typing-users">{typingUsers.join(", ")}</div>
      <div data-testid="online-users">{onlineUsers.join(", ")}</div>
      <button
        data-testid="set-username"
        onClick={() => dispatch(setUsername("TestUser"))}
      >
        Set Username
      </button>
      <button
        data-testid="add-message"
        onClick={() =>
          dispatch(
            addMessage({
              user: "TestUser",
              text: "Test message",
              timestamp: Date.now(),
            }),
          )
        }
      >
        Add Message
      </button>
      <button
        data-testid="start-typing"
        onClick={() => dispatch(userTyping("TypingUser"))}
      >
        Start Typing
      </button>
      <button
        data-testid="stop-typing"
        onClick={() => dispatch(userStopTyping("TypingUser"))}
      >
        Stop Typing
      </button>
    </div>
  );
};

const MockPrivateChatComponent = () => {
  const dispatch = useDispatch();
  const { privateChats, activePrivateChat, unreadCounts, username } =
    useSelector((state) => state.chat);

  const activeMessages = activePrivateChat
    ? privateChats[activePrivateChat] || []
    : [];

  return (
    <div>
      <div data-testid="active-chat">{activePrivateChat || "none"}</div>
      <div data-testid="active-messages">{activeMessages.length}</div>
      <div data-testid="unread-count">
        {activePrivateChat ? unreadCounts[activePrivateChat] || 0 : 0}
      </div>
      <button
        data-testid="set-active-chat"
        onClick={() => dispatch(setActivePrivateChat("Friend1"))}
      >
        Open Friend1 Chat
      </button>
      <button
        data-testid="send-private-message"
        onClick={() =>
          dispatch(
            addPrivateMessage({
              from: username,
              to: "Friend1",
              text: "Private message",
              timestamp: Date.now(),
            }),
          )
        }
      >
        Send Private Message
      </button>
      <button
        data-testid="receive-private-message"
        onClick={() =>
          dispatch(
            addPrivateMessage({
              from: "Friend1",
              to: username,
              text: "Received message",
              timestamp: Date.now(),
            }),
          )
        }
      >
        Receive Private Message
      </button>
    </div>
  );
};

const MockAnimationComponent = () => {
  const dispatch = useDispatch();
  const { animationTrigger, iconState } = useSelector((state) => state.chat);

  return (
    <div>
      <div data-testid="animation-trigger">{animationTrigger.toString()}</div>
      <div data-testid="icon-state">{iconState}</div>
      <button
        data-testid="trigger-animation"
        onClick={() => dispatch(triggerAnimation())}
      >
        Trigger Animation
      </button>
      <button
        data-testid="set-icon-sent"
        onClick={() => dispatch(setIconState("sent"))}
      >
        Set Icon Sent
      </button>
      <button
        data-testid="set-icon-received"
        onClick={() => dispatch(setIconState("received"))}
      >
        Set Icon Received
      </button>
    </div>
  );
};

// Helper function to create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState,
  });
};

// Helper function to render component with store
const renderWithStore = (component, store) => {
  return render(<Provider store={store}>{component}</Provider>);
};

// Import hooks after component definitions to avoid hoisting issues
import { useDispatch, useSelector } from "react-redux";

describe("Redux Store Integration Tests", () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("Basic Chat Functionality", () => {
    it("should handle username setting and message adding through components", async () => {
      renderWithStore(<MockChatComponent />, store);

      // Initial state
      expect(screen.getByTestId("username")).toHaveTextContent("");
      expect(screen.getByTestId("message-count")).toHaveTextContent("0");

      // Set username
      fireEvent.click(screen.getByTestId("set-username"));
      expect(screen.getByTestId("username")).toHaveTextContent("TestUser");

      // Add message
      fireEvent.click(screen.getByTestId("add-message"));
      expect(screen.getByTestId("message-count")).toHaveTextContent("1");
    });

    it("should handle typing indicators through components", async () => {
      renderWithStore(<MockChatComponent />, store);

      // Initial state
      expect(screen.getByTestId("typing-users")).toHaveTextContent("");

      // Start typing
      fireEvent.click(screen.getByTestId("start-typing"));
      expect(screen.getByTestId("typing-users")).toHaveTextContent(
        "TypingUser",
      );

      // Stop typing
      fireEvent.click(screen.getByTestId("stop-typing"));
      expect(screen.getByTestId("typing-users")).toHaveTextContent("");
    });

    it("should handle online users updates", async () => {
      renderWithStore(<MockChatComponent />, store);

      // Dispatch online users update
      await act(async () => {
        store.dispatch(setOnlineUsers(["User1", "User2", "User3"]));
      });

      await waitFor(() => {
        expect(screen.getByTestId("online-users")).toHaveTextContent(
          "User1, User2, User3",
        );
      });
    });
  });

  describe("Private Chat Integration", () => {
    beforeEach(() => {
      // Set up initial state with username
      store.dispatch(setUsername("CurrentUser"));
    });

    it("should handle private chat activation and messaging", async () => {
      renderWithStore(<MockPrivateChatComponent />, store);

      // Initial state
      expect(screen.getByTestId("active-chat")).toHaveTextContent("none");
      expect(screen.getByTestId("active-messages")).toHaveTextContent("0");

      // Set active chat
      fireEvent.click(screen.getByTestId("set-active-chat"));
      expect(screen.getByTestId("active-chat")).toHaveTextContent("Friend1");

      // Send private message
      fireEvent.click(screen.getByTestId("send-private-message"));
      expect(screen.getByTestId("active-messages")).toHaveTextContent("1");
    });

    it("should handle unread count management", async () => {
      renderWithStore(<MockPrivateChatComponent />, store);

      // Open chat first
      fireEvent.click(screen.getByTestId("set-active-chat"));

      // Close chat by setting active to null
      await act(async () => {
        store.dispatch(setActivePrivateChat(null));
      });

      await waitFor(() => {
        expect(screen.getByTestId("active-chat")).toHaveTextContent("none");
      });

      // Receive message while chat is not active (should increment unread)
      fireEvent.click(screen.getByTestId("receive-private-message"));

      // Reopen chat
      fireEvent.click(screen.getByTestId("set-active-chat"));

      await waitFor(() => {
        expect(screen.getByTestId("unread-count")).toHaveTextContent("0"); // Should be reset
        expect(screen.getByTestId("active-messages")).toHaveTextContent("1");
      });
    });

    it("should maintain separate message threads for different users", async () => {
      const TestComponent = () => {
        const dispatch = useDispatch();
        const { privateChats, username } = useSelector((state) => state.chat);

        return (
          <div>
            <div data-testid="friend1-messages">
              {(privateChats["Friend1"] || []).length}
            </div>
            <div data-testid="friend2-messages">
              {(privateChats["Friend2"] || []).length}
            </div>
            <button
              data-testid="message-friend1"
              onClick={() =>
                dispatch(
                  addPrivateMessage({
                    from: username,
                    to: "Friend1",
                    text: "Message to Friend1",
                    timestamp: Date.now(),
                  }),
                )
              }
            >
              Message Friend1
            </button>
            <button
              data-testid="message-friend2"
              onClick={() =>
                dispatch(
                  addPrivateMessage({
                    from: username,
                    to: "Friend2",
                    text: "Message to Friend2",
                    timestamp: Date.now(),
                  }),
                )
              }
            >
              Message Friend2
            </button>
          </div>
        );
      };

      renderWithStore(<TestComponent />, store);

      // Send messages to different friends
      fireEvent.click(screen.getByTestId("message-friend1"));
      fireEvent.click(screen.getByTestId("message-friend2"));
      fireEvent.click(screen.getByTestId("message-friend1")); // Another to Friend1

      expect(screen.getByTestId("friend1-messages")).toHaveTextContent("2");
      expect(screen.getByTestId("friend2-messages")).toHaveTextContent("1");
    });
  });

  describe("Animation and UI State Integration", () => {
    it("should handle animation triggers and icon state changes", async () => {
      renderWithStore(<MockAnimationComponent />, store);

      // Initial state
      expect(screen.getByTestId("animation-trigger")).toHaveTextContent(
        "false",
      );
      expect(screen.getByTestId("icon-state")).toHaveTextContent("static");

      // Trigger animation
      fireEvent.click(screen.getByTestId("trigger-animation"));
      expect(screen.getByTestId("animation-trigger")).toHaveTextContent("true");

      // Change icon state
      fireEvent.click(screen.getByTestId("set-icon-sent"));
      expect(screen.getByTestId("icon-state")).toHaveTextContent("sent");

      fireEvent.click(screen.getByTestId("set-icon-received"));
      expect(screen.getByTestId("icon-state")).toHaveTextContent("received");
    });
  });

  describe("Multiple Component Synchronization", () => {
    it("should keep multiple components in sync", async () => {
      const { rerender } = renderWithStore(
        <div>
          <MockChatComponent />
          <MockPrivateChatComponent />
        </div>,
        store,
      );

      // Set username in one component
      fireEvent.click(screen.getByTestId("set-username"));

      // Both components should reflect the same state
      expect(screen.getByTestId("username")).toHaveTextContent("TestUser");

      // Add messages and verify count
      fireEvent.click(screen.getByTestId("add-message"));
      expect(screen.getByTestId("message-count")).toHaveTextContent("1");

      // Open private chat and send message
      fireEvent.click(screen.getByTestId("set-active-chat"));
      fireEvent.click(screen.getByTestId("send-private-message"));

      expect(screen.getByTestId("active-chat")).toHaveTextContent("Friend1");
      expect(screen.getByTestId("active-messages")).toHaveTextContent("1");
    });
  });

  describe("Store State Persistence Across Re-renders", () => {
    it("should maintain state when components unmount and remount", async () => {
      const { unmount } = renderWithStore(<MockChatComponent />, store);

      // Set some state
      fireEvent.click(screen.getByTestId("set-username"));
      fireEvent.click(screen.getByTestId("add-message"));

      // Unmount component
      unmount();

      // Remount and verify state persists
      renderWithStore(<MockChatComponent />, store);

      expect(screen.getByTestId("username")).toHaveTextContent("TestUser");
      expect(screen.getByTestId("message-count")).toHaveTextContent("1");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid actions gracefully", async () => {
      renderWithStore(<MockChatComponent />, store);

      // Dispatch invalid action
      store.dispatch({ type: "INVALID_ACTION", payload: "test" });

      // Component should still function normally
      fireEvent.click(screen.getByTestId("set-username"));
      expect(screen.getByTestId("username")).toHaveTextContent("TestUser");
    });

    it("should handle undefined payload gracefully", async () => {
      renderWithStore(<MockChatComponent />, store);

      // Dispatch action with undefined payload
      await act(async () => {
        store.dispatch(setUsername(undefined));
      });

      // Should not crash
      expect(screen.getByTestId("username")).toHaveTextContent("");
    });
  });

  describe("Performance with Large State", () => {
    it("should handle large number of messages efficiently", async () => {
      // Pre-populate store with many messages
      const manyMessages = Array.from({ length: 1000 }, (_, i) => ({
        user: `User${i}`,
        text: `Message ${i}`,
        timestamp: Date.now() + i,
      }));

      const preloadedState = {
        chat: {
          messages: manyMessages,
          username: "",
          typingUsers: [],
          animationTrigger: false,
          iconState: "static",
          onlineUsers: [],
          privateChats: {},
          activePrivateChat: null,
          unreadCounts: {},
        },
      };

      const largeStore = createTestStore(preloadedState);

      const startTime = Date.now();
      renderWithStore(<MockChatComponent />, largeStore);
      const renderTime = Date.now() - startTime;

      // Should render quickly even with large state
      expect(renderTime).toBeLessThan(5000);
      expect(screen.getByTestId("message-count")).toHaveTextContent("1000");

      // Adding one more message should be fast
      const addMessageStart = Date.now();
      fireEvent.click(screen.getByTestId("add-message"));
      const addMessageTime = Date.now() - addMessageStart;

      expect(addMessageTime).toBeLessThan(500);
      expect(screen.getByTestId("message-count")).toHaveTextContent("1001");
    });
  });

  describe("Store State Shape Validation", () => {
    it("should maintain correct state shape through component interactions", async () => {
      renderWithStore(<MockChatComponent />, store);

      // Perform various actions
      fireEvent.click(screen.getByTestId("set-username"));
      fireEvent.click(screen.getByTestId("add-message"));
      fireEvent.click(screen.getByTestId("start-typing"));

      const state = store.getState();

      // Validate state shape
      expect(state.chat).toHaveProperty("messages");
      expect(state.chat).toHaveProperty("username");
      expect(state.chat).toHaveProperty("typingUsers");
      expect(state.chat).toHaveProperty("animationTrigger");
      expect(state.chat).toHaveProperty("iconState");
      expect(state.chat).toHaveProperty("onlineUsers");
      expect(state.chat).toHaveProperty("privateChats");
      expect(state.chat).toHaveProperty("activePrivateChat");
      expect(state.chat).toHaveProperty("unreadCounts");

      // Validate data types
      expect(Array.isArray(state.chat.messages)).toBe(true);
      expect(typeof state.chat.username).toBe("string");
      expect(Array.isArray(state.chat.typingUsers)).toBe(true);
      expect(typeof state.chat.animationTrigger).toBe("boolean");
    });
  });
});
