import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  username: '',
  typingUsers: [], // Keep track of who is typing (array of usernames)
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
  },
});

export const {
  setUsername,
  addMessage,
  setMessages,
  userTyping,
  userStopTyping,
  clearTyping,
} = chatSlice.actions;
export default chatSlice.reducer;
