import React from "react";

const MessageList = ({ messages, currentUsername, className }) => {
  return (
    <div
      className={`border rounded-md p-4 mb-4 overflow-y-auto bg-gray-50 flex flex-col ${className}`}
      id="messages-container"
    >
      {messages.map(({ user, text, timestamp, id }, idx) => (
        <div
          key={id || idx}
          className={`mb-2 p-2 rounded ${
            user === currentUsername
              ? "bg-indigo-100 text-indigo-900 self-end"
              : "bg-gray-200 text-gray-900 self-start"
          }`}
        >
          <strong>{user}:</strong> {text}
          <div className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;