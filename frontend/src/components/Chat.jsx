// frontend/src/components/Chat.jsx

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setUsername,
  addMessage,
  userTyping,
  userStopTyping,
  triggerAnimation,
  resetAnimation,
} from "../store/chatSlice";
import socket from "../services/socket";
import jsonrpc from "jsonrpc-lite";
import MessageList from "./MessageList";
import ThreeDIcon from "./ThreeDIcon";

const Chat = () => {
  const dispatch = useDispatch();

  const username = useSelector((state) => state.chat.username);
  const messages = useSelector((state) => state.chat.messages);
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const animationTrigger = useSelector((state) => state.chat.animationTrigger);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const usernamePrompted = useRef(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Prompt once after mount to get username
  useEffect(() => {
    if (usernamePrompted.current) return;
    usernamePrompted.current = true;

    let name = "";
    while (!name) {
      name = prompt("Enter your username")?.trim();
      if (!name) alert("Please enter a valid username.");
    }
    dispatch(setUsername(name));
  }, [dispatch]);

  // Setup JSON-RPC listener on 'rpc' socket event
  useEffect(() => {
    if (!username) return;

    // Remove any existing rpc listeners to prevent duplicates
    socket.off("rpc");

    const handleRpc = (payload) => {
      const parsed = jsonrpc.parseObject(payload);

      if (parsed.type === "notification") {
        const { method, params } = parsed.payload;

        switch (method) {
          case "chatMessage":
            dispatch(addMessage(params));
            break;
          case "typing":
            dispatch(userTyping(params.username));
            break;
          case "stopTyping":
            dispatch(userStopTyping(params.username));
            break;
          default:
            console.warn("Unknown notification method:", method);
        }
      } else if (parsed.type === "success") {
        // Handle JSON-RPC success responses
        const { result } = parsed.payload;
        if (result?.delivered) {
          dispatch(triggerAnimation());
          setTimeout(() => dispatch(resetAnimation()), 1500);
        }
      } else if (parsed.type === "error") {
        console.error("RPC error:", parsed.payload.error);
      }
    };

    socket.on("rpc", handleRpc);

    return () => {
      socket.off("rpc", handleRpc);
    };
  }, [username, dispatch]);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message as JSON-RPC request
  const sendMessage = () => {
    if (input.trim() === "") return;

    const requestId = Date.now(); // unique JSON-RPC request ID
    const params = { user: username, text: input, timestamp: Date.now() };
    const request = jsonrpc.request(requestId, "sendMessage", params);

    socket.emit("rpc", request);
    setInput("");
  };

  // Handle typing notifications as JSON-RPC requests
  const sendTypingNotification = (eventName) => {
    if (!username) return;
    const requestId = Date.now();
    const request = jsonrpc.request(requestId, eventName, { username });
    socket.emit("rpc", request);
  };

  // Handle input changes and manage typing start/stop
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingNotification("typing");
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingNotification("stopTyping");
    }, 1000); // 1 second after user stops typing
  };

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">
        Chat as <span className="text-indigo-600">{username}</span>
      </h2>

      <MessageList messages={messages} currentUsername={username} />
      <ThreeDIcon trigger={animationTrigger} />
      <div ref={messagesEndRef} />

      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 italic mb-2">
          {typingUsers
            .filter((user) => user !== username) // Don't show "You are typing..."
            .map((user) => `${user} is typing...`)
            .join(", ")}
        </div>
      )}

      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          autoFocus
        />
        <button
          className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
