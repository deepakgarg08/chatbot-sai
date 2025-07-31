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
  setIconState,
  setOnlineUsers,
  addPrivateMessage,
  setActivePrivateChat,
  resetUnreadCount,
} from "../store/chatSlice";
import socket from "../services/socket";
import jsonrpc from "jsonrpc-lite";
import ThreeDIcon from "./ThreeDIcon";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

const Chat = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const username = useSelector((state) => state.chat.username);
  const messages = useSelector((state) => state.chat.messages);
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const animationTrigger = useSelector((state) => state.chat.animationTrigger);
  const iconState = useSelector((state) => state.chat.iconState);

  const onlineUsers = useSelector((state) => state.chat.onlineUsers || []);
  const activePrivateChat = useSelector((state) => state.chat.activePrivateChat);
  const unreadCounts = useSelector((state) => state.chat.unreadCounts);
  const privateChats = useSelector((state) => state.chat.privateChats || {});

  // Local state
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const usernamePrompted = useRef(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Avatars for public chat messages (You can extend avatars for private chat if needed)
  const avatars = messages.reduce((map, msg) => {
    if (!map[msg.user]) map[msg.user] = `https://ui-avatars.com/api/?name=${msg.user}`;
    return map;
  }, {});


  // Log privateChats whenever it changes
  useEffect(() => {
    console.log("Current privateChats state:", privateChats);
  }, [privateChats]);

  // Prompt username once on mount
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

  // Register user with backend once username is set
  useEffect(() => {
    if (!username) return;
    const requestId = Date.now();
    const registerRequest = jsonrpc.request(requestId, "registerUser", { username });
    socket.emit("rpc", registerRequest);
  }, [username]);

  // Listen for JSON-RPC notifications and responses
  useEffect(() => {
    if (!username) return;
    socket.off("rpc");

    const handleRpc = (payload) => {
      let parsed;
      try {
        parsed = jsonrpc.parseObject(payload);
      } catch (err) {
        console.warn("Failed to parse JSON-RPC payload:", err);
        return;
      }

      if (parsed.type === "notification") {
        const { method, params } = parsed.payload;
        switch (method) {
          case "chatMessage":
            dispatch(addMessage(params));
            if (params.user !== username) {
              dispatch(setIconState("received"));
              setTimeout(() => dispatch(setIconState("static")), 800);
            }
            break;

          case "typing":
            if (!params.target || params.target === username) {
              dispatch(userTyping(params.username));
            }
            break;

          case "stopTyping":
            if (!params.target || params.target === username) {
              dispatch(userStopTyping(params.username));
            }
            break;

          case "onlineUsers":
            if (params && Array.isArray(params.users)) {
              dispatch(setOnlineUsers(params.users));
            }
            break;
          case "privateMessage":
            dispatch(
              addPrivateMessage({
                from: params.from,
                to: username,          // current user is recipient
                text: params.text,
                timestamp: params.timestamp,
              }),
            );
            break;

          default:
            console.warn("Unknown notification method:", method);
        }
      } else if (parsed.type === "success") {
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
    return () => socket.off("rpc", handleRpc);
  }, [username, dispatch]);

  // Auto-scroll on new messages or chat switches
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, privateChats, activePrivateChat]);

  // Send public message
  const sendMessage = (messageText = input) => {
    if (messageText.trim() === "") return;
    const requestId = Date.now();
    const params = { user: username, text: messageText, timestamp: Date.now() };
    const request = jsonrpc.request(requestId, "sendMessage", params);
    dispatch(setIconState("sent"));
    setTimeout(() => dispatch(setIconState("static")), 5000);
    // Trigger 3D icon animation
    dispatch(setIconState("sent"));
    setTimeout(() => dispatch(setIconState("static")), 5000);

    socket.emit("rpc", request);
    if (messageText === input) setInput("");
  };

  // Send private message
  const sendPrivateMessage = (messageText = input) => {
    if (messageText.trim() === "" || !activePrivateChat) return;

    const requestId = Date.now();
    const params = {
      sender: username,
      recipient: activePrivateChat,
      text: messageText,
      timestamp: Date.now(),
    };
    const request = jsonrpc.request(requestId, "sendPrivateMessage", params);

    // Trigger 3D icon animation
    dispatch(setIconState("sent"));
    setTimeout(() => dispatch(setIconState("static")), 800);

    socket.emit("rpc", request);

    // Add your own message locally under correct thread
    dispatch(
      addPrivateMessage({
        from: username,
        to: activePrivateChat,     // recipient username
        text: messageText,
        timestamp: params.timestamp,
      }),
    );

    if (messageText === input) {
      setInput("");
    }
  };


  // Send typing notifications including activePrivateChat target if in private chat
  const sendTypingNotification = (eventName) => {
    if (!username) return;
    const requestId = Date.now();
    const params = { username };
    if (activePrivateChat) params.target = activePrivateChat;
    const request = jsonrpc.request(requestId, eventName, params);
    // Trigger 3D icon animation
    dispatch(setIconState("sent"));
    setTimeout(() => dispatch(setIconState("static")), 800);

    socket.emit("rpc", request);
  };

  // Handle input change with typing start/stop
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
    }, 1000);
  };

  // Handle switching between private chat users and reset unread counts
  const handleUserClick = (user) => {
    dispatch(setActivePrivateChat(user));
    dispatch(resetUnreadCount(user));
    setInput("");
  };

  // Add a “Public Chat” button click handler to switch back to public chat
  const handlePublicChatClick = () => {
    dispatch(setActivePrivateChat(null));
    setInput("");
  };

  // Messages to display depend on chat mode: public or private
  const displayedMessages = activePrivateChat ? (privateChats[activePrivateChat] || []) : messages;

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      {/* Left 3D Icon */}
      <div className="hidden lg:flex items-center mr-8">
        <ThreeDIcon state={iconState} side="receiver" size="large" animTrigger={animationTrigger} />
      </div>

      {/* Main Chat Container */}
      <div className="flex flex-col w-full max-w-lg h-[80vh] bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Header */}
        <header className="px-6 py-4 bg-white border-b border-gray-200 text-xl font-semibold sticky top-0 z-10">
          <span className="text-indigo-600">
            {username}
            {activePrivateChat ? ` (Chatting privately with ${activePrivateChat})` : " (Public Chat)"}
          </span>
        </header>

        {/* Online Users Panel + Public Chat button */}
        <aside className="bg-gray-50 border-r border-gray-300 p-4 max-h-[300px] overflow-auto mb-2">
          <h4 className="font-semibold mb-2">Online Users</h4>

          <button
            className={`mb-2 px-3 py-1 rounded border w-full ${activePrivateChat === null ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            onClick={handlePublicChatClick}
          >
            Public Chat
          </button>

          {onlineUsers.length === 0 ? <p>No users online</p> : (
            <ul>
              {onlineUsers.filter(user => user !== username).map((user) => (
                <li
                  key={user}
                  className={`py-1 cursor-pointer flex justify-between items-center ${user === username
                    ? "font-bold text-indigo-600"
                    : activePrivateChat === user
                      ? "font-semibold text-indigo-700"
                      : ""
                    }`}
                  onClick={() => handleUserClick(user)}
                  
                >
                  <span>{user}</span>
                  {unreadCounts[user] > 0 && (
                    <span
                      className="inline-block w-3 h-3 bg-red-500 rounded-full ml-2"
                      title={`${unreadCounts[user]} new message${unreadCounts[user] > 1 ? "s" : ""}`}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat message window and input */}
        <div className="flex-grow overflow-hidden p-6 bg-gray-50 rounded-3xl mx-6 my-4 shadow-inner max-w-full md:max-w-3xl mx-auto flex flex-col">
          <ChatWindow
            messages={displayedMessages}
            currentUser={username}
            avatars={avatars}
          />
          <div ref={messagesEndRef} />
          <ChatInput
            inputValue={input}
            setInputValue={setInput}
            onSend={activePrivateChat ? sendPrivateMessage : sendMessage}
            onChange={handleInputChange}
          />
        </div>

        {/* Typing status */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic mb-2 px-6">
            {typingUsers
              .filter((user) => user !== username)
              .map((user) => `${user} is typing...`)
              .join(", ")}
          </div>
        )}
      </div>

      {/* Right 3D Icon */}
      <div className="hidden lg:flex items-center ml-8">
        <ThreeDIcon state={iconState} side="sender" size="large" animTrigger={animationTrigger} />
      </div>
    </div>
  );
};

export default Chat;
