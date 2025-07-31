import React from 'react';

const ChatInput = ({ inputValue, setInputValue, onSend }) => {
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
      className="flex items-center p-4 border-t border-gray-100 bg-white"
      style={{ minHeight: '72px' }}
    >
      {/* Camera icon button removed */}

      <input
        type="text"
        className="flex-grow py-2 px-4 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Message..."
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        maxLength={500}
        autoComplete="off"
      />
      <button
        type="submit"
        className="ml-3 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold shadow-sm hover:from-indigo-600 hover:to-purple-700 transition-colors duration-200 disabled:opacity-50"
        disabled={inputValue.trim() === ''}
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
