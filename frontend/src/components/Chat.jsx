import React, { useState, useEffect } from 'react';
import socket from '../services/socket';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === '') return;
    socket.emit('chat message', input);
    setMessages((prev) => [...prev, input]);
    setInput('');
  };

  return (
    <div className="app-container">
      <div className="messages-list">
        {messages.map((msg, idx) => (
          <div key={idx} className="message-item">{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;