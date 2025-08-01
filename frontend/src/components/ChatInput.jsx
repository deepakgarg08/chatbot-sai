import React from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { log } from "../config";

const ChatInput = ({ inputValue, setInputValue, onSend, onChange }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      log.info("Sending message", { messageLength: trimmed.length });
      onSend(trimmed);
      setInputValue("");
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 p-2 bg-white rounded-2xl shadow-lg border border-gray-200"
      >
        {/* Emoji Button */}
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          title="Add emoji"
          onClick={() => log.debug("Emoji button clicked")}
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>

        {/* Input Field */}
        <input
          type="text"
          className="flex-1 py-3 px-4 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
          placeholder="Type your message..."
          value={inputValue}
          onChange={onChange || ((e) => setInputValue(e.target.value))}
          maxLength={500}
          autoComplete="off"
        />

        {/* Character Count */}
        {inputValue.length > 400 && (
          <span className="text-xs text-gray-400 px-2">
            {500 - inputValue.length}
          </span>
        )}

        {/* Send Button */}
        <button
          type="submit"
          className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
            inputValue.trim()
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          disabled={inputValue.trim() === ""}
          title="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>

      {/* Typing indicator space */}
      <div className="h-1 mt-2"></div>
    </div>
  );
};

export default ChatInput;
