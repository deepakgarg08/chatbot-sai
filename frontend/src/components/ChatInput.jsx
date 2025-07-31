import React from 'react';

const ChatInput = ({ inputValue, setInputValue, onSend, onChange }) => {
  const handleSubmit = e => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSend(trimmed);
      setInputValue('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center p-3 border-t border-gray-200 bg-white rounded-b-3xl shadow-inner mb-6"
    >
      <input
        type="text"
        className="flex-grow mr-4 py-3 px-5 bg-gray-100 rounded-full text-base placeholder-gray-400 border border-gray-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-400"
        placeholder="Type your message..."
        value={inputValue}
        onChange={onChange || (e => setInputValue(e.target.value))}
        maxLength={500}
        autoComplete="off"
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-600 text-white font-extrabold text-lg rounded-full px-7 py-2 shadow-md hover:from-pink-600 hover:to-indigo-700 transition disabled:opacity-50"
        disabled={inputValue.trim() === ''}
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
