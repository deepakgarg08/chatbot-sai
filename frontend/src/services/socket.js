import { io } from "socket.io-client";
import { setOnlineUsers } from "../store/chatSlice"; // Import the Redux action
import store from "../store/store"; // Import your Redux store
import jsonrpc from "jsonrpc-lite"; // For decoding JSON-RPC messages
import { log } from "../config";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
log.info("Connecting to socket server", { url: backendUrl });
const socket = io(backendUrl);

// Socket connection events
socket.on("connect", () => {
  log.info("Socket connected successfully", { socketId: socket.id });
});

socket.on("disconnect", (reason) => {
  log.warn("Socket disconnected", { reason });
});

socket.on("connect_error", (error) => {
  log.error("Socket connection error", { error: error.message });
});

// Listen for JSON-RPC notifications when socket is connected
socket.on("rpc", (payload) => {
  log.debug("Received RPC payload", { payload });
  let parsed;
  try {
    parsed = jsonrpc.parseObject(payload);
  } catch (err) {
    log.error("Failed to parse JSON-RPC payload", {
      error: err.message,
      payload,
    });
    return;
  }

  if (parsed.type === "notification") {
    const { method, params } = parsed.payload;
    log.debug("Processing RPC notification", { method, params });

    if (method === "onlineUsers" && params && Array.isArray(params.users)) {
      log.info("Updating online users", { userCount: params.users.length });
      // Dispatch to update Redux state with the current online users list
      store.dispatch(setOnlineUsers(params.users));
    }
  }
});

export default socket;
