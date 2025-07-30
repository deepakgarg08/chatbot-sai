import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUsername, addMessage, userTyping, userStopTyping } from "../store/chatSlice";
import socket from "../services/socket";
import MessageList from "./MessageList";

const Chat = () => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.chat.username);
  const messages = useSelector((state) => state.chat.messages);
  const typingUsers = useSelector((state) => state.chat.typingUsers);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const usernamePrompted = useRef(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Prompt once after mount
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

  // Register socket event listener once when username is set
  useEffect(() => {
    if (!username) return; // wait until username is set

    const messageHandler = (data) => {
      dispatch(addMessage(data));
    };

    const typingHandler = (user) => {
      dispatch(userTyping(user));
    };

    const stopTypingHandler = (user) => {
      dispatch(userStopTyping(user));
    };

    socket.on("chat message", messageHandler);
    socket.on("typing", typingHandler);
    socket.on("stop typing", stopTypingHandler);

    return () => {
      socket.off("chat message", messageHandler);
      socket.off("typing", typingHandler);
      socket.off("stop typing", stopTypingHandler);
    };
  }, [username, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    const messageData = { user: username, text: input, timestamp: Date.now() };
    socket.emit("chat message", messageData);
    setInput("");
    // No local append; wait for server broadcast to update Redux state
  };
  
  
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", username);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop typing", username);
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
      <div ref={messagesEndRef} />
      
      {
          typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic mb-2">
              {typingUsers
                .filter((user) => user !== username)  // Don't show "You are typing..."
                .map((user) => `${user} is typing...`)
                .join(", ")}
            </div>
          )
        }

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
