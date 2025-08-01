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
  setMessages,
} from "../store/chatSlice";
import socket from "../services/socket";
import jsonrpc from "jsonrpc-lite";
import ThreeDIcon from "./ThreeDIcon";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import OnlineUsers from "./OnlineUsers";

// Session persistence functions
const SESSION_USERNAME_KEY = "chat_username";

const saveUsernameToStorage = (username) => {
  try {
    localStorage.setItem(SESSION_USERNAME_KEY, username);
    console.log("💾 Username saved to localStorage:", username);
  } catch (error) {
    console.warn("⚠️ Failed to save username to localStorage:", error);
  }
};

const getUsernameFromStorage = () => {
  try {
    const username = localStorage.getItem(SESSION_USERNAME_KEY);
    console.log("📖 Username loaded from localStorage:", username);
    return username;
  } catch (error) {
    console.warn("⚠️ Failed to load username from localStorage:", error);
    return null;
  }
};

const clearUsernameFromStorage = () => {
  try {
    localStorage.removeItem(SESSION_USERNAME_KEY);
    console.log("🗑️ Username cleared from localStorage");
  } catch (error) {
    console.warn("⚠️ Failed to clear username from localStorage:", error);
  }
};

const loadChatHistory = (socket, dispatch) => {
  console.log("📚 Requesting chat history from server...");
  const requestId = Date.now();
  const request = jsonrpc.request(requestId, "getChatHistory", {});
  socket.emit("rpc", request);
};

const Chat = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const username = useSelector((state) => state.chat.username);
  const messages = useSelector((state) => state.chat.messages);
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const animationTrigger = useSelector((state) => state.chat.animationTrigger);
  const iconState = useSelector((state) => state.chat.iconState);

  const onlineUsers = useSelector((state) => state.chat.onlineUsers || []);
  const activePrivateChat = useSelector(
    (state) => state.chat.activePrivateChat,
  );
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
    if (!map[msg.user])
      map[msg.user] = `https://ui-avatars.com/api/?name=${msg.user}`;
    return map;
  }, {});

  // Log privateChats whenever it changes
  useEffect(() => {
    console.log("Current privateChats state:", privateChats);
  }, [privateChats]);

  // Check for saved username or prompt for new one
  useEffect(() => {
    if (usernamePrompted.current) return;
    usernamePrompted.current = true;

    // First, try to get username from localStorage
    let name = getUsernameFromStorage();
    console.log("🔍 Session check - Found saved username:", name);

    // If no saved username, prompt for one
    if (!name) {
      console.log("❓ No saved username found, prompting user...");
      while (!name) {
        name = prompt("Enter your username (or type 'clear' to reset)")?.trim();
        if (name === "clear") {
          clearUsernameFromStorage();
          name = null;
          continue;
        }
        if (!name) alert("Please enter a valid username.");
      }
      console.log("✅ New username entered:", name);
    } else {
      console.log("🔄 Using saved username for session restoration");
    }

    dispatch(setUsername(name));
  }, [dispatch]);

  // Register user with backend once username is set
  useEffect(() => {
    if (!username) return;

    // Save username to localStorage for persistence
    saveUsernameToStorage(username);
    console.log("🔗 Registering user with backend:", username);

    const requestId = Date.now();
    const registerRequest = jsonrpc.request(requestId, "registerUser", {
      username,
    });
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
          case "chatHistory":

          case "privateMessage":
            dispatch(
              addPrivateMessage({
                from: params.from,
                to: username, // current user is recipient
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

        // Handle user registration success - load chat history
        if (result?.registered) {
          console.log(
            "✅ User registered successfully, loading chat history...",
          );
          // Small delay to ensure registration is complete
          setTimeout(() => {
            loadChatHistory(socket, dispatch);
          }, 100);
        }

        // Handle delivery confirmation
        if (result?.delivered) {
          dispatch(triggerAnimation());
          setTimeout(() => dispatch(resetAnimation()), 1500);
        }

        // Handle chat history response
        if (result?.publicMessages || result?.privateChats) {
          console.log("📚 Received chat history from server");

          // Load public messages
          if (result.publicMessages && Array.isArray(result.publicMessages)) {
            dispatch(setMessages(result.publicMessages));
            console.log(
              `📬 Loaded ${result.publicMessages.length} public messages`,
            );
          }

          // Load private chats
          if (result.privateChats && typeof result.privateChats === "object") {
            Object.entries(result.privateChats).forEach(
              ([otherUser, messages]) => {
                messages.forEach((message) => {
                  dispatch(
                    addPrivateMessage({
                      from: message.from,
                      to: message.to,
                      text: message.text,
                      timestamp: message.timestamp,
                    }),
                  );
                });
              },
            );
            console.log(
              `🔒 Loaded private chats with ${Object.keys(result.privateChats).length} users`,
            );
          }
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
        to: activePrivateChat, // recipient username
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

  // Add a "Public Chat" button click handler to switch back to public chat
  const handlePublicChatClick = () => {
    dispatch(setActivePrivateChat(null));
    setInput("");
  };

  // Handle clearing session and reloading
  const handleClearSession = () => {
    clearUsernameFromStorage();
    window.location.reload();
  };

  // Messages to display depend on chat mode: public or private
  const displayedMessages = activePrivateChat
    ? privateChats[activePrivateChat] || []
    : messages;

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto h-screen flex gap-6 py-6">
        {/* Left 3D Icon */}
        <div className="hidden xl:flex items-center">
          <ThreeDIcon
            state={iconState}
            side="receiver"
            size="large"
            animTrigger={animationTrigger}
          />
        </div>

        {/* Online Users Sidebar */}
        <div className="w-80 hidden md:block">
          <OnlineUsers
            onlineUsers={onlineUsers}
            currentUsername={username}
            activePrivateChat={activePrivateChat}
            unreadCounts={unreadCounts}
            onUserClick={handleUserClick}
            onPublicChatClick={handlePublicChatClick}
            onClearSession={handleClearSession}
          />
        </div>

        {/* Main Chat Container */}
        <div className="flex-1 max-w-4xl mx-auto">
          <div className="h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">
                    {activePrivateChat ? `${activePrivateChat}` : "Public Chat"}
                  </h1>
                  <p className="text-indigo-100 text-sm">
                    {activePrivateChat
                      ? `Private conversation with ${activePrivateChat}`
                      : `Chatting as ${username} • ${onlineUsers.length} users online`}
                  </p>
                </div>

                {/* Mobile Users Button */}
                <button className="md:hidden p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </button>
              </div>
            </header>

            {/* Chat Window */}
            <ChatWindow
              messages={displayedMessages}
              currentUser={username}
              avatars={avatars}
            />

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <div className="text-sm text-gray-500 italic flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  {typingUsers
                    .filter((user) => user !== username)
                    .map((user) => `${user} is typing...`)
                    .join(", ")}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <ChatInput
              inputValue={input}
              setInputValue={setInput}
              onSend={activePrivateChat ? sendPrivateMessage : sendMessage}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Right 3D Icon */}
        <div className="hidden xl:flex items-center">
          <ThreeDIcon
            state={iconState}
            side="sender"
            size="large"
            animTrigger={animationTrigger}
          />
        </div>
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default Chat;
