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
import ThreeDIcon from "./ThreeDIcon";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

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

  const avatars = messages.reduce((map, msg) => {
    if (!map[msg.user]) map[msg.user] = `https://ui-avatars.com/api/?name=${msg.user}`;
    return map;
  }, {});

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
  const sendMessage = (messageText = input) => {
    if (messageText.trim() === "") return;

    const requestId = Date.now();
    const params = { user: username, text: messageText, timestamp: Date.now() };
    const request = jsonrpc.request(requestId, "sendMessage", params);

    socket.emit("rpc", request);

    // Only clear input if sending the current input value
    if (messageText === input) {
      setInput("");
    }
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
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="flex flex-col w-full max-w-lg h-[80vh] bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        <header className="px-6 py-4 bg-white border-b border-gray-200 text-xl font-semibold sticky top-0 z-10">
          <span className="text-indigo-600">Chat as {username}</span>
        </header>

        <ChatWindow messages={messages} currentUser={username} avatars={avatars} />

        {/* 3D Icon */}
        <ThreeDIcon trigger={animationTrigger} className="mb-4 w-20 h-20 sm:w-24 sm:h-24" />

        {/* Typing Notifications */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic mb-2">
            {typingUsers
              .filter((user) => user !== username)
              .map((user) => `${user} is typing...`)
              .join(", ")}
          </div>
        )}

        {/* Input Area */}
        <ChatInput
          inputValue={input}
          setInputValue={setInput}
          onSend={sendMessage}
        />
      </div>
    </div>
  );

};

export default Chat;
