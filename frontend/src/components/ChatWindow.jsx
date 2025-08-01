import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { log } from "../config";

const ChatWindow = ({ messages, currentUser, avatars = {} }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Log when messages change
  useEffect(() => {
    log.debug("ChatWindow messages updated", {
      messageCount: messages.length,
      currentUser,
    });
  }, [messages, currentUser]);

  return (
    <div className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Chat Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="chat-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="#e0e7ff" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chat-pattern)" />
        </svg>
      </div>

      {/* Messages Container */}
      <div className="relative z-10 px-4 py-6 min-h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-full mb-4">
              <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Start a conversation!
            </h3>
            <p className="text-gray-500 max-w-sm">
              Send a message to begin chatting. Your messages will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                message={msg}
                isOwnMessage={msg.user === currentUser}
                avatarUrl={avatars[msg.user]}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
