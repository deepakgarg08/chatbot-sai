import React from "react";

const ChatMessage = ({ message, isOwnMessage }) => {
  return (
    <div
      className={`flex flex-col max-w-xs mb-2 ${
        isOwnMessage ? "items-end ml-auto" : "items-start mr-auto"
      }`}
    >
      {!isOwnMessage && (
        <span className="text-sm font-semibold text-gray-700">{message.user}</span>
      )}
      <div
        className={`px-4 py-2 rounded-lg whitespace-pre-wrap break-words ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-300 text-gray-800 rounded-bl-none"
        }`}
      >
        {message.text}
      </div>
      <span className="text-xs text-gray-500 mt-0.5">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};

export default ChatMessage;
