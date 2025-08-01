import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../../store/chatSlice";
import { log } from "../../config";

/**
 * Creates a test store with optional preloaded state
 * @param {Object} preloadedState - Initial state for the store
 * @returns {Object} Configured Redux store
 */
export const createTestStore = (preloadedState = {}) => {
  const defaultState = {
    chat: {
      messages: [],
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

  const mergedState = {
    ...defaultState,
    ...preloadedState,
    chat: {
      ...defaultState.chat,
      ...preloadedState.chat,
    },
  };

  const store = configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState: mergedState,
  });

  log.debug("Test store created", { preloadedState: mergedState });
  return store;
};

/**
 * Renders a component wrapped with Redux Provider
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.preloadedState - Initial store state
 * @param {Object} options.store - Custom store instance
 * @param {Object} options.renderOptions - Additional render options
 * @returns {Object} Render result with store
 */
export const renderWithRedux = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {},
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

  log.debug("Rendering component with Redux provider");
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
};

/**
 * Creates sample message data for testing
 * @param {Object} options - Message options
 * @param {string} options.user - Message sender
 * @param {string} options.text - Message content
 * @param {number} options.timestamp - Message timestamp
 * @returns {Object} Message object
 */
export const createMockMessage = ({
  user = "TestUser",
  text = "Test message",
  timestamp = Date.now(),
} = {}) => ({
  user,
  text,
  timestamp,
});

/**
 * Creates sample private message data for testing
 * @param {Object} options - Private message options
 * @param {string} options.from - Message sender
 * @param {string} options.to - Message recipient
 * @param {string} options.text - Message content
 * @param {number} options.timestamp - Message timestamp
 * @returns {Object} Private message object
 */
export const createMockPrivateMessage = ({
  from = "Sender",
  to = "Recipient",
  text = "Private message",
  timestamp = Date.now(),
} = {}) => ({
  from,
  to,
  text,
  timestamp,
});

/**
 * Creates a mock chat state with multiple messages
 * @param {number} messageCount - Number of messages to create
 * @param {string} baseUsername - Base username for messages
 * @returns {Object} Mock chat state
 */
export const createMockChatState = (
  messageCount = 5,
  baseUsername = "User",
) => {
  const messages = Array.from({ length: messageCount }, (_, i) =>
    createMockMessage({
      user: `${baseUsername}${i + 1}`,
      text: `Message ${i + 1}`,
      timestamp: Date.now() + i,
    }),
  );

  log.debug("Mock chat state created", { messageCount, baseUsername });
  return {
    messages,
    username: "TestUser",
    typingUsers: [],
    animationTrigger: false,
    iconState: "static",
    onlineUsers: [`${baseUsername}1`, `${baseUsername}2`, `${baseUsername}3`],
    privateChats: {},
    activePrivateChat: null,
    unreadCounts: {},
  };
};

/**
 * Creates a mock private chat state with conversations
 * @param {Array} users - Array of usernames to create conversations with
 * @param {number} messagesPerUser - Number of messages per conversation
 * @returns {Object} Mock chat state with private conversations
 */
export const createMockPrivateChatState = (
  users = ["Friend1", "Friend2"],
  messagesPerUser = 3,
) => {
  const privateChats = {};
  const unreadCounts = {};

  users.forEach((user, userIndex) => {
    privateChats[user] = Array.from({ length: messagesPerUser }, (_, i) => ({
      user: i % 2 === 0 ? "TestUser" : user, // Alternate between current user and friend
      text: `Message ${i + 1} in ${user} chat`,
      timestamp: Date.now() + userIndex * messagesPerUser + i,
    }));
    unreadCounts[user] = Math.floor(Math.random() * 5); // Random unread count
  });

  log.debug("Mock private chat state created", { users, messagesPerUser });
  return {
    messages: [],
    username: "TestUser",
    typingUsers: [],
    animationTrigger: false,
    iconState: "static",
    onlineUsers: users,
    privateChats,
    activePrivateChat: users[0],
    unreadCounts,
  };
};

/**
 * Helper to wait for store state to change
 * @param {Object} store - Redux store
 * @param {Function} predicate - Function that returns true when condition is met
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Promise that resolves when condition is met
 */
export const waitForStoreChange = (store, predicate, timeout = 5000) => {
  log.debug("Waiting for store change", { timeout });
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      log.warn("Timeout waiting for store change");
      reject(new Error("Timeout waiting for store change"));
    }, timeout);

    const unsubscribe = store.subscribe(() => {
      if (predicate(store.getState())) {
        clearTimeout(timeoutId);
        unsubscribe();
        log.debug("Store change condition met");
        resolve(store.getState());
      }
    });

    // Check immediately in case condition is already met
    if (predicate(store.getState())) {
      clearTimeout(timeoutId);
      unsubscribe();
      log.debug("Store change condition already met");
      resolve(store.getState());
    }
  });
};

/**
 * Helper to dispatch multiple actions and wait for completion
 * @param {Object} store - Redux store
 * @param {Array} actions - Array of action objects
 * @returns {Promise} Promise that resolves after all actions are dispatched
 */
export const dispatchSequence = async (store, actions) => {
  log.debug("Dispatching action sequence", { actionCount: actions.length });
  for (const action of actions) {
    log.debug("Dispatching action", { type: action.type });
    store.dispatch(action);
    // Small delay to ensure actions are processed in order
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  return store.getState();
};

/**
 * Creates a mock typing scenario for testing
 * @param {Array} users - Users who will be typing
 * @param {Object} store - Redux store
 * @returns {Object} Helper functions for typing scenario
 */
export const createTypingScenario = (users = ["User1", "User2"], store) => {
  return {
    startTyping: (user) =>
      store.dispatch({ type: "chat/userTyping", payload: user }),
    stopTyping: (user) =>
      store.dispatch({ type: "chat/userStopTyping", payload: user }),
    clearTyping: () => store.dispatch({ type: "chat/clearTyping" }),
    startAllTyping: () =>
      users.forEach((user) =>
        store.dispatch({ type: "chat/userTyping", payload: user }),
      ),
    stopAllTyping: () =>
      users.forEach((user) =>
        store.dispatch({ type: "chat/userStopTyping", payload: user }),
      ),
  };
};

/**
 * Validates the structure of the chat state
 * @param {Object} chatState - Chat state to validate
 * @returns {boolean} True if state structure is valid
 */
export const validateChatStateStructure = (chatState) => {
  const requiredKeys = [
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

  return (
    requiredKeys.every((key) => chatState.hasOwnProperty(key)) &&
    Array.isArray(chatState.messages) &&
    typeof chatState.username === "string" &&
    Array.isArray(chatState.typingUsers) &&
    typeof chatState.animationTrigger === "boolean" &&
    typeof chatState.iconState === "string" &&
    Array.isArray(chatState.onlineUsers) &&
    typeof chatState.privateChats === "object" &&
    (chatState.activePrivateChat === null ||
      typeof chatState.activePrivateChat === "string") &&
    typeof chatState.unreadCounts === "object"
  );
};

/**
 * Performance testing helper
 * @param {Function} fn - Function to test performance of
 * @param {string} description - Description of the operation
 * @returns {Object} Performance results
 */
export const measurePerformance = (fn, description = "Operation") => {
  log.debug("Starting performance measurement", { description });
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;

  log.debug("Performance measurement completed", { description, duration });
  return {
    result,
    duration,
    description,
    isUnderThreshold: (threshold) => duration < threshold,
  };
};

/**
 * Creates a deep copy of an object (for state comparison)
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep copy of the object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Assertion helpers for testing
 */
export const assertions = {
  expectMessageInState: (state, messageText) => {
    return state.chat.messages.some((msg) => msg.text === messageText);
  },

  expectUserTyping: (state, username) => {
    return state.chat.typingUsers.includes(username);
  },

  expectUserOnline: (state, username) => {
    return state.chat.onlineUsers.includes(username);
  },

  expectPrivateChatExists: (state, username) => {
    return state.chat.privateChats.hasOwnProperty(username);
  },

  expectUnreadCount: (state, username, count) => {
    return state.chat.unreadCounts[username] === count;
  },
};

// Export default for convenience
export default {
  createTestStore,
  renderWithRedux,
  createMockMessage,
  createMockPrivateMessage,
  createMockChatState,
  createMockPrivateChatState,
  waitForStoreChange,
  dispatchSequence,
  createTypingScenario,
  validateChatStateStructure,
  measurePerformance,
  deepClone,
  assertions,
};
