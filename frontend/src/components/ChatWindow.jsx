import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

const ChatWindow = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);
console.log("ChatWindow rendered")
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    
    <div className="bg-red-300 flex flex-col h-full p-4 overflow-y-auto bg-white rounded-lg border border-gray-300 flex-grow mb-4 max-h-[60vh]">
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} isOwnMessage={msg.user === currentUser} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
