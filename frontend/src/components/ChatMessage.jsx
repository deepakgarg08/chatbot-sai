import React from "react";
import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { log } from "../config";

export default function ChatMessage({ message, isOwnMessage }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Log message rendering
  React.useEffect(() => {
    log.debug("Rendering chat message", {
      user: message.user,
      isOwnMessage,
      messageLength: message.text.length,
      timestamp: message.timestamp,
    });
  }, [message, isOwnMessage]);

  return (
    <div
      className={`flex items-end mb-6 ${isOwnMessage ? "justify-end" : "justify-start"} group animate-fade-in`}
    >
      {/* Avatar for other users */}
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xl border-3 border-white/50 backdrop-blur-sm transform hover:scale-110 transition-all duration-300">
              {message.user.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
              <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            {/* User Indicator */}
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full border border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-xs">💬</span>
            </div>
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div className="flex flex-col max-w-[75%]">
        {/* Username for other users */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-600 mb-2 ml-5 font-semibold flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {message.user}
            </span>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span className="text-gray-400">User</span>
          </div>
        )}

        <div
          className={`
            relative px-6 py-4 shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl backdrop-blur-sm
            ${
              isOwnMessage
                ? "bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white rounded-3xl rounded-br-lg ml-auto border border-blue-400/30"
                : "bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-3xl rounded-bl-lg border border-gray-200/50 shadow-2xl"
            }
          `}
        >
          {/* Message Background Pattern */}
          <div
            className={`absolute inset-0 opacity-5 ${isOwnMessage ? "text-white" : "text-blue-500"}`}
          >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id={`msg-pattern-${isOwnMessage ? "own" : "other"}`}
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
                    fill="currentColor"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill={`url(#msg-pattern-${isOwnMessage ? "own" : "other"})`}
              />
            </svg>
          </div>
          {/* Message Text */}
          <div className="relative z-10">
            <p className="text-sm leading-relaxed break-words font-medium">
              {message.text}
            </p>
          </div>

          {/* Time and Status */}
          <div
            className={`relative z-10 flex items-center gap-2 mt-3 text-xs ${
              isOwnMessage
                ? "text-blue-100/80 justify-end"
                : "text-gray-500 justify-start"
            }`}
          >
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/10">
              <ClockIcon className="w-3 h-3" />
              <span className="font-medium">
                {formatTime(message.timestamp)}
              </span>
            </div>
            {isOwnMessage && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/10">
                <CheckIcon className="w-3 h-3 text-green-300" />
                <span className="font-medium">Sent</span>
              </div>
            )}
          </div>

          {/* Enhanced Message tail */}
          <div
            className={`absolute bottom-0 w-4 h-4 ${
              isOwnMessage
                ? "right-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-bl-2xl transform translate-x-2 translate-y-2"
                : "left-0 bg-gradient-to-br from-white to-gray-50 border-l border-b border-gray-200/50 rounded-br-2xl transform -translate-x-2 translate-y-2"
            }`}
          ></div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
        </div>
      </div>

      {/* Enhanced Avatar for own messages */}
      {isOwnMessage && (
        <div className="flex-shrink-0 ml-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xl border-3 border-white/50 backdrop-blur-sm transform hover:scale-110 transition-all duration-300">
              {message.user.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
              <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            {/* User Indicator */}
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-xs">👤</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
