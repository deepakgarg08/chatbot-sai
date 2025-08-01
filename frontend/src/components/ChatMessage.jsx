import React from "react";
import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { log } from "../config";

export default function ChatMessage({ message, isOwnMessage, avatarUrl }) {
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
      className={`flex items-end mb-4 ${isOwnMessage ? "justify-end" : "justify-start"} group`}
    >
      {/* Avatar for other users */}
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white">
              {message.user.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div className="flex flex-col max-w-[70%]">
        {/* Username for other users */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1 ml-4 font-medium">
            {message.user}
          </div>
        )}

        <div
          className={`
            relative px-4 py-3 shadow-lg transform transition-all duration-200 hover:scale-[1.02]
            ${
              isOwnMessage
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md ml-auto"
                : "bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200"
            }
          `}
        >
          {/* Message Text */}
          <p className="text-sm leading-relaxed break-words">{message.text}</p>

          {/* Time and Status */}
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${
              isOwnMessage
                ? "text-blue-100 justify-end"
                : "text-gray-400 justify-start"
            }`}
          >
            <ClockIcon className="w-3 h-3" />
            <span>{formatTime(message.timestamp)}</span>
            {isOwnMessage && <CheckIcon className="w-3 h-3 ml-1" />}
          </div>

          {/* Message tail */}
          <div
            className={`absolute bottom-0 w-3 h-3 ${
              isOwnMessage
                ? "right-0 bg-blue-600 rounded-bl-full transform translate-x-1 translate-y-1"
                : "left-0 bg-white border-l border-b border-gray-200 rounded-br-full transform -translate-x-1 translate-y-1"
            }`}
          ></div>
        </div>
      </div>

      {/* Spacer for own messages */}
      {isOwnMessage && <div className="w-10 ml-3 flex-shrink-0" />}
    </div>
  );
}
