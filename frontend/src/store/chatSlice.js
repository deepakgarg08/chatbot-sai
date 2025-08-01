import { createSlice } from "@reduxjs/toolkit";
import { log } from "../config";

const initialState = {
  messages: [], // public chat messages
  username: "",
  typingUsers: [],
  animationTrigger: false, // new state to trigger 3D icon animation
  iconState: "static", // 'static' | 'sent' | 'received'
  onlineUsers: [],
  privateChats: {}, // { [username]: [ { from, text, timestamp } ] }
  activePrivateChat: null, // username of current private chat open
  unreadCounts: {}, // { [username]: number }
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setUsername: (state, action) => {
      log.info("Setting username", { username: action.payload });
      state.username = action.payload;
    },
    addMessage: (state, action) => {
      log.debug("Adding new message", { message: action.payload });
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      log.info("Setting messages", { messageCount: action.payload.length });
      state.messages = action.payload;
    },
    userTyping(state, action) {
      if (!state.typingUsers.includes(action.payload)) {
        log.debug("User started typing", { user: action.payload });
        state.typingUsers.push(action.payload);
      }
    },
    userStopTyping(state, action) {
      log.debug("User stopped typing", { user: action.payload });
      state.typingUsers = state.typingUsers.filter(
        (user) => user !== action.payload,
      );
    },
    clearTyping(state) {
      state.typingUsers = [];
    },
    triggerAnimation(state) {
      state.animationTrigger = true;
    },
    resetAnimation(state) {
      state.animationTrigger = false;
    },
    setIconState: (state, action) => {
      state.iconState = action.payload; // 'static', 'sent', or 'received'
    },
    setOnlineUsers(state, action) {
      log.info("Updating online users", {
        userCount: action.payload.length,
        users: action.payload,
      });
      state.onlineUsers = action.payload;
    },
    setActivePrivateChat(state, action) {
      log.info("Switching to private chat", { targetUser: action.payload });
      state.activePrivateChat = action.payload;
      state.typingUsers = []; // Clear typing on chat switch
      if (action.payload) {
        state.unreadCounts[action.payload] = 0;
      }
    },
    addPrivateMessage(state, action) {
      const { from, to, text, timestamp } = action.payload;
      log.debug("Adding private message", {
        from,
        to,
        messageLength: text.length,
      });
      const currentUser = state.username;

      // Determine the chat thread key as the OTHER user in the conversation
      let threadKey;
      if (from === currentUser && to) {
        threadKey = to; // you sent, so key is recipient
      } else {
        threadKey = from; // you received, so key is sender
      }

      if (!threadKey) {
        return; // safety check
      }

      if (!state.privateChats[threadKey]) {
        state.privateChats[threadKey] = [];
      }

      // Append message with normalized 'user' field for UI rendering
      state.privateChats[threadKey].push({
        user: from,
        text,
        timestamp,
      });

      // Update unread count if chat is not active
      if (state.activePrivateChat !== threadKey) {
        state.unreadCounts[threadKey] =
          (state.unreadCounts[threadKey] || 0) + 1;
      }
    },
    resetUnreadCount(state, action) {
      const user = action.payload;
      state.unreadCounts[user] = 0;
    },
    clearAllData(state) {
      log.warn("Clearing all chat data");
      state.messages = [];
      state.username = "";
      state.typingUsers = [];
      state.animationTrigger = false;
      state.iconState = "static";
      state.onlineUsers = [];
      state.privateChats = {};
      state.activePrivateChat = null;
      state.unreadCounts = {};
    },
  },
});

export const {
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
} = chatSlice.actions;

export default chatSlice.reducer;
