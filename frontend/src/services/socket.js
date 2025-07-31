import { io } from "socket.io-client";
import { setOnlineUsers } from "../store/chatSlice"; // Import the Redux action
import store from "../store/store"; // Import your Redux store
import jsonrpc from "jsonrpc-lite"; // For decoding JSON-RPC messages

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const socket = io(backendUrl);

// Listen for JSON-RPC notifications when socket is connected
socket.on("rpc", (payload) => {
    let parsed;
    try {
        parsed = jsonrpc.parseObject(payload);
    } catch (err) {
        console.warn("Failed to parse JSON-RPC payload:", err);
        return;
    }

    if (parsed.type === "notification") {
        const { method, params } = parsed.payload;

        if (method === "onlineUsers" && params && Array.isArray(params.users)) {
            // Dispatch to update Redux state with the current online users list
            store.dispatch(setOnlineUsers(params.users));
        }
    }
});

export default socket;
