import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  messages: [],
  username: '',
  typingUsers: [],
  animationTrigger: false, // new state to trigger 3D icon animation
  iconState: 'static', // 'static' | 'sent' | 'received'
  onlineUsers: [],
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    userTyping(state, action) {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    userStopTyping(state, action) {
      state.typingUsers = state.typingUsers.filter(
        (user) => user !== action.payload
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
      state.onlineUsers = action.payload;
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
} = chatSlice.actions;

export default chatSlice.reducer;
