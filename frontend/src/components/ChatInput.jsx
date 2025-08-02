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
    <div className="p-6 bg-gradient-to-r from-slate-50/50 via-blue-50/30 to-purple-50/20 border-t border-white/20 backdrop-blur-sm relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="input-pattern"
              x="0"
              y="0"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="15" cy="15" r="1" fill="rgba(59, 130, 246, 0.3)" />
              <path
                d="M0 15h30M15 0v30"
                stroke="rgba(147, 51, 234, 0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#input-pattern)" />
        </svg>
      </div>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-4 p-3 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-300"
      >
        {/* Enhanced Emoji Button */}
        <button
          type="button"
          className="flex-shrink-0 p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group"
          title="Add emoji"
          onClick={() => log.debug("Emoji button clicked")}
        >
          <FaceSmileIcon className="w-6 h-6 group-hover:animate-bounce" />
        </button>

        {/* Enhanced Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full py-4 px-6 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm font-medium rounded-2xl focus:bg-blue-50/50 transition-all duration-300"
            placeholder="✨ Type your message..."
            value={inputValue}
            onChange={onChange || ((e) => setInputValue(e.target.value))}
            maxLength={500}
            autoComplete="off"
          />
          {/* Input Focus Ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>

        {/* Enhanced Character Count */}
        {inputValue.length > 400 && (
          <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <span
              className={`text-xs font-bold ${inputValue.length > 450 ? "text-red-500" : "text-amber-600"}`}
            >
              {500 - inputValue.length} left
            </span>
          </div>
        )}

        {/* Enhanced Send Button */}
        <button
          type="submit"
          className={`flex-shrink-0 p-4 rounded-2xl transition-all duration-300 transform relative overflow-hidden ${
            inputValue.trim()
              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 hover:rotate-3 group"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          disabled={inputValue.trim() === ""}
          title="Send message"
        >
          {/* Button Background Effect */}
          {inputValue.trim() && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
          <PaperAirplaneIcon
            className={`w-6 h-6 relative z-10 ${inputValue.trim() ? "group-hover:animate-pulse" : ""}`}
          />
        </button>
      </form>

      {/* Enhanced Footer with AI Status */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">Chat is ready</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>Instant responses</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔒</span>
            <span>Secure chat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
