import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  username: '',
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
  },
});

export const { setUsername, addMessage, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
