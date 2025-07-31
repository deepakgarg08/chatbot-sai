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
  setOnlineUsers
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
  const iconState = useSelector(state => state.chat.iconState);

  const onlineUsers = useSelector((state) => state.chat.onlineUsers || []);

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

  useEffect(() => {
    if (!username) return;

    // Send registration request once username is set
    const requestId = Date.now(); // or any unique id
    const registerRequest = jsonrpc.request(requestId, "registerUser", { username });
    socket.emit("rpc", registerRequest);

    // Optionally listen for response to confirm registration succeeded
  }, [username]);

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

            if (params.user !== username) {
              dispatch(setIconState('received'));
              setTimeout(() => dispatch(setIconState('static')), 800);
            }
            break;
          case "typing":
            dispatch(userTyping(params.username));
            break;
          case "stopTyping":
            dispatch(userStopTyping(params.username));
            break;
          case "onlineUsers":
            if (params && Array.isArray(params.users)) {
              dispatch(setOnlineUsers(params.users));
            }
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
    dispatch(setIconState('sent'));
    setTimeout(() => dispatch(setIconState('static')), 800);
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
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">

      {/* Left 3D Icon */}
      <div className="hidden lg:flex items-center mr-8">
        <ThreeDIcon state={iconState} side="receiver" size="large" animTrigger={animationTrigger} />
      </div>

      <div className="flex flex-col w-full max-w-lg h-[80vh] bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Header */}
        <header className="px-6 py-4 bg-white border-b border-gray-200 text-xl font-semibold sticky top-0 z-10">
          <span className="text-indigo-600">{username}</span>
        </header>

        {/* Online users panel */}
        <aside className="bg-gray-50 border-r border-gray-300 p-4 max-h-[300px] overflow-auto mb-2">
          <h4 className="font-semibold mb-2">Online Users</h4>
          {onlineUsers.length === 0 ? (
            <p>No users online</p>
          ) : (
            <ul>
              {onlineUsers.map((user) => (
                <li key={user} className={`py-1 ${user === username ? "font-bold text-indigo-600" : ""}`}>
                  {user}
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat messages */}
        <div className="flex-grow overflow-hidden p-6 bg-gray-50 rounded-3xl mx-6 my-4 shadow-inner max-w-full md:max-w-3xl mx-auto">
          <ChatWindow messages={messages} currentUser={username} avatars={avatars} />
        </div>

        {/* Typing users */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic mb-2 px-6">
            {typingUsers
              .filter((user) => user !== username)
              .map((user) => `${user} is typing...`)
              .join(", ")}
          </div>
        )}

        {/* Input */}
        <ChatInput inputValue={input} setInputValue={setInput} onSend={sendMessage} />
      </div>

      {/* Right 3D Icon */}
      <div className="hidden lg:flex items-center ml-8">
        <ThreeDIcon state={iconState} side="sender" size="large" animTrigger={animationTrigger} />
      </div>
    </div>

  );


};

export default Chat;
