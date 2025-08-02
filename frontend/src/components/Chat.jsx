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
  clearAllData,
} from "../store/chatSlice";
import socket from "../services/socket";
import jsonrpc from "jsonrpc-lite";
import ThreeDIcon from "./ThreeDIcon";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import OnlineUsers from "./OnlineUsers";
import UsernameModal from "./UsernameModal";
import { log } from "../config";

// Session persistence functions
const SESSION_USERNAME_KEY = "chat_username";

const saveUsernameToStorage = (username) => {
  try {
    localStorage.setItem(SESSION_USERNAME_KEY, username);
    log.info("Username saved to localStorage", { username });
  } catch (error) {
    log.error("Failed to save username to localStorage", {
      error: error.message,
    });
  }
};

const getUsernameFromStorage = () => {
  try {
    const username = localStorage.getItem(SESSION_USERNAME_KEY);
    log.debug("Username loaded from localStorage", { username });
    return username;
  } catch (error) {
    log.error("Failed to load username from localStorage", {
      error: error.message,
    });
    return null;
  }
};

const clearUsernameFromStorage = () => {
  try {
    localStorage.removeItem(SESSION_USERNAME_KEY);
    log.info("Username cleared from localStorage");
  } catch (error) {
    log.error("Failed to clear username from localStorage", {
      error: error.message,
    });
  }
};

const loadChatHistory = (socket) => {
  log.info("Requesting chat history from server");
  const requestId = Date.now();
  const request = jsonrpc.request(requestId, "getChatHistory", {});
  socket.emit("rpc", request);
};

const resetAllData = (socket) => {
  log.warn("Requesting complete data reset from server");
  const requestId = Date.now();
  const request = jsonrpc.request(requestId, "resetAllData", {});
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
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);

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
    log.debug("Private chats state updated", {
      chatCount: Object.keys(privateChats).length,
      chats: Object.keys(privateChats),
    });
  }, [privateChats]);

  // Check for saved username or show modal
  useEffect(() => {
    if (usernamePrompted.current) return;
    usernamePrompted.current = true;

    // First, try to get username from localStorage
    let name = getUsernameFromStorage();
    log.info("Session check completed", { foundSavedUsername: !!name });

    if (name) {
      log.info("Using saved username for session restoration", {
        username: name,
      });
      dispatch(setUsername(name));
    } else {
      log.info("No saved username found, showing modal");
      setShowUsernameModal(true);
    }
  }, [dispatch]);

  // Register user with backend once username is set
  useEffect(() => {
    if (!username) return;

    // Save username to localStorage for persistence
    saveUsernameToStorage(username);
    log.info("Registering user with backend", { username });

    // Request notification permission
    requestNotificationPermission();

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

    // Define notification function inside useEffect to avoid dependency issues
    const showNotification = (sender, message, isPrivate) => {
      if (!hasNotificationPermission || document.hasFocus()) return;

      const title = isPrivate
        ? `Private message from ${sender}`
        : `${sender} in Public Chat`;
      const body =
        message.length > 50 ? message.substring(0, 50) + "..." : message;

      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: isPrivate ? `private-${sender}` : "public-chat",
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
    };

    const handleRpc = (payload) => {
      let parsed;
      try {
        parsed = jsonrpc.parseObject(payload);
      } catch (err) {
        log.error("Failed to parse JSON-RPC payload", { error: err.message });
        return;
      }

      if (parsed.type === "notification") {
        const { method, params } = parsed.payload;
        log.debug("Processing RPC notification", { method, params });

        switch (method) {
          case "chatMessage":
            log.info("Received chat message", { from: params.user });
            dispatch(addMessage(params));
            if (params.user !== username) {
              dispatch(setIconState("received"));
              setTimeout(() => dispatch(setIconState("static")), 800);
              // Show notification for public chat messages
              if (!activePrivateChat) {
                showNotification(params.user, params.text, false);
              }
            }
            break;

          case "typing":
            if (!params.target || params.target === username) {
              log.debug("User started typing", { user: params.username });
              dispatch(userTyping(params.username));
            }
            break;

          case "stopTyping":
            if (!params.target || params.target === username) {
              log.debug("User stopped typing", { user: params.username });
              dispatch(userStopTyping(params.username));
            }
            break;

          case "onlineUsers":
            if (params && Array.isArray(params.users)) {
              log.info("Received online users update", {
                userCount: params.users.length,
              });
              dispatch(setOnlineUsers(params.users));
            }
            break;
          case "chatHistory":
            // Handle chat history if needed
            break;

          case "privateMessage":
            log.info("Received private message", { from: params.from });
            dispatch(
              addPrivateMessage({
                from: params.from,
                to: username, // current user is recipient
                text: params.text,
                timestamp: params.timestamp,
              }),
            );
            // Show notification for private messages
            showNotification(params.from, params.text, true);
            break;

          case "dataReset":
            log.warn("Server data was reset, clearing local state");
            // Clear all local state using Redux action
            dispatch(clearAllData());
            // Clear localStorage
            clearUsernameFromStorage();
            // Show username modal again
            setShowUsernameModal(true);
            break;

          default:
            log.warn("Unknown notification method", { method });
        }
      } else if (parsed.type === "success") {
        const { result } = parsed.payload;

        // Handle user registration success - load chat history
        if (result?.registered) {
          log.info("User registered successfully, loading chat history");
          setTimeout(() => {
            loadChatHistory(socket);
          }, 100);
        }

        // Handle data reset success
        if (result?.reset) {
          log.info("All data reset successfully");
        }

        // Handle delivery confirmation
        if (result?.delivered) {
          log.debug("Message delivery confirmed");
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
            Object.entries(result.privateChats).forEach(([, messages]) => {
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
            });
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
  }, [username, dispatch, activePrivateChat, hasNotificationPermission]);

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

  // Handle complete reset (clear server data + session)
  const handleCompleteReset = () => {
    if (
      confirm(
        "Are you sure you want to reset ALL chat data? This will clear all messages and user sessions for everyone.",
      )
    ) {
      resetAllData(socket);
    }
  };

  // Handle username modal submission
  // Handle username submit for modal
  const handleUsernameSubmit = async (newUsername) => {
    dispatch(setUsername(newUsername));
    setShowUsernameModal(false);
    return Promise.resolve();
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setHasNotificationPermission(permission === "granted");
    }
  };

  // Toggle mobile users panel
  const toggleMobileUsers = () => {
    setShowMobileUsers(!showMobileUsers);
  };

  // Handle username modal close (if closeable)
  const handleUsernameModalClose = () => {
    // Only allow closing if we already have a username
    if (username) {
      setShowUsernameModal(false);
    }
  };

  // Messages to display depend on chat mode: public or private
  const displayedMessages = activePrivateChat
    ? privateChats[activePrivateChat] || []
    : messages;

  if (!username && !showUsernameModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onSubmit={handleUsernameSubmit}
        onClose={username ? handleUsernameModalClose : undefined}
        title={username ? "Change Username" : "Welcome to Chat"}
      />

      <div className="min-h-screen bg-transparent p-4 md:p-6">
        {/* Notification Permission Banner */}
        {!hasNotificationPermission && (
          <div className="max-w-7xl mx-auto mb-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-300/30 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🔔</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    Enable Smart Notifications
                  </div>
                  <div className="text-xs text-amber-100">
                    Get instant alerts for new messages and responses
                  </div>
                </div>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                Enable
              </button>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto h-screen flex gap-6 py-4 md:py-6 px-2 md:px-4">
          {/* Left 3D Icon */}
          <div className="hidden xl:flex items-center">
            <ThreeDIcon
              state={iconState}
              side="receiver"
              size="large"
              animTrigger={animationTrigger}
            />
          </div>

          {/* Online Users Sidebar - Hidden on mobile and tablet */}
          <div className="w-80 hidden xl:block">
            <OnlineUsers
              onlineUsers={onlineUsers}
              currentUsername={username}
              activePrivateChat={activePrivateChat}
              unreadCounts={unreadCounts}
              onUserClick={handleUserClick}
              onPublicChatClick={handlePublicChatClick}
              onClearSession={handleClearSession}
              onCompleteReset={handleCompleteReset}
            />
          </div>

          {/* Main Chat Container */}
          <div className="flex-1 max-w-4xl mx-auto px-2 md:px-4">
            <div className="h-full bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
              {/* Header */}
              <header className="px-6 py-4 bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-800 text-white relative overflow-hidden">
                {/* Header Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20"></div>
                  <svg
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="header-pattern"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="1"
                          fill="rgba(255,255,255,0.3)"
                        />
                      </pattern>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#header-pattern)"
                    />
                  </svg>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      {activePrivateChat ? (
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-transparent">
                        {activePrivateChat
                          ? `Chat with ${activePrivateChat}`
                          : "Public Group Chat"}
                      </h1>
                      <div className="text-blue-200 text-sm flex items-center gap-2">
                        {activePrivateChat ? (
                          <>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Private conversation</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>
                              {username} • {onlineUsers.length} users connected
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Settings & Mobile Users Button */}
                  <div className="relative z-10 flex items-center gap-3">
                    <button
                      onClick={() => setShowUsernameModal(true)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="Change username"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </button>

                    {/* Notification Status Indicator */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div
                        className={`w-3 h-3 rounded-full shadow-lg ${
                          hasNotificationPermission
                            ? "bg-green-400 animate-pulse"
                            : "bg-red-400"
                        }`}
                        title={
                          hasNotificationPermission
                            ? "Notifications enabled"
                            : "Notifications disabled"
                        }
                      ></div>
                      <span className="text-xs text-white/90 hidden sm:inline font-medium">
                        {hasNotificationPermission ? "🔔 ON" : "🔕 OFF"}
                      </span>
                    </div>

                    <button
                      className="xl:hidden p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 relative"
                      onClick={toggleMobileUsers}
                      title="Show online users"
                    >
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
                      {Object.values(unreadCounts).some(
                        (count) => count > 0,
                      ) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            !
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
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

        {/* Mobile Users Modal */}
        {showMobileUsers && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden animate-fade-in"
            onClick={toggleMobileUsers}
          >
            <div
              className="absolute inset-y-0 right-0 w-80 max-w-[80vw] bg-white shadow-lg transform transition-transform duration-300 ease-in-out animate-slide-in-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <h3 className="text-lg font-semibold">Online Users</h3>
                <button
                  onClick={toggleMobileUsers}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="h-full overflow-hidden pb-16">
                <OnlineUsers
                  onlineUsers={onlineUsers}
                  currentUsername={username}
                  activePrivateChat={activePrivateChat}
                  unreadCounts={unreadCounts}
                  onUserClick={(user) => {
                    handleUserClick(user);
                    setShowMobileUsers(false);
                  }}
                  onPublicChatClick={() => {
                    handlePublicChatClick();
                    setShowMobileUsers(false);
                  }}
                  onClearSession={handleClearSession}
                  onCompleteReset={handleCompleteReset}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
