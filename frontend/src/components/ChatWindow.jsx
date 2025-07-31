import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ messages, currentUser, avatars = {} }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
      {messages.map((msg, idx) => (
        <ChatMessage
          key={idx}
          message={msg}
          isOwnMessage={msg.user === currentUser}
          avatarUrl={avatars[msg.user]}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>

  );
};

export default ChatWindow;
