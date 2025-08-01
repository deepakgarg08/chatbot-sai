import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import { log } from "../config";

// Redux middleware for logging actions
const loggerMiddleware = (store) => (next) => (action) => {
  log.debug("Redux action dispatched", {
    type: action.type,
    payload: action.payload,
  });

  const result = next(action);

  log.debug("Redux state updated", {
    action: action.type,
    newState: store.getState(),
  });

  return result;
};

const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});

log.info("Redux store configured successfully");

export default store;
