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
    <div className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-purple-50/20">
      {/* Advanced Chat Background */}
      <div className="absolute inset-0">
        {/* Floating Elements */}
        <div className="absolute top-10 left-5 w-16 h-16 bg-blue-400/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-8 w-12 h-12 bg-purple-400/5 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-cyan-400/5 rounded-full blur-2xl animate-pulse"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="chat-grid"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 40L40 0M0 0L40 40"
                  stroke="rgba(59, 130, 246, 0.1)"
                  strokeWidth="0.5"
                />
                <circle cx="20" cy="20" r="1" fill="rgba(147, 51, 234, 0.2)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#chat-grid)" />
          </svg>
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/2 via-transparent to-purple-500/2"></div>
      </div>

      {/* Messages Container */}
      <div className="relative z-10 px-4 py-6 min-h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 relative">
            {/* Enhanced Empty State */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-white text-xs font-bold">✨</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Welcome to Chat!
            </h3>
            <p className="text-gray-600 max-w-md leading-relaxed mb-4">
              Start a conversation with other users. Your messages will appear
              here in real-time.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Ready to chat
            </div>
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
