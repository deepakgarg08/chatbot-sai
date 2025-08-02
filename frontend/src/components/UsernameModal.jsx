import React, { useState, useEffect, useRef } from "react";
import { UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { log } from "../config";

const UsernameModal = ({
  isOpen,
  onSubmit,
  onClose,
  title = "Enter Your Name",
}) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      log.debug("Username modal opened, focusing input");
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();

    log.info("Username submission attempt", { username: trimmedUsername });

    if (!trimmedUsername) {
      log.warn("Username submission failed: empty username");
      setError("Please enter a valid username");
      return;
    }

    if (trimmedUsername.length < 2) {
      log.warn("Username submission failed: too short", {
        length: trimmedUsername.length,
      });
      setError("Username must be at least 2 characters long");
      return;
    }

    if (trimmedUsername.length > 20) {
      log.warn("Username submission failed: too long", {
        length: trimmedUsername.length,
      });
      setError("Username must be less than 20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      log.warn("Username submission failed: invalid characters", {
        username: trimmedUsername,
      });
      setError(
        "Username can only contain letters, numbers, underscores, and hyphens",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      log.info("Submitting username", { username: trimmedUsername });
      await onSubmit(trimmedUsername);
      log.info("Username submitted successfully");
    } catch (err) {
      log.error("Username submission failed", { error: err.message });
      setError("Failed to set username. Please try again.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setUsername(e.target.value);
    if (error) setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* Enhanced Modal Background with glass effect */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 scale-100 animate-fade-in">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-800 p-8 text-white relative overflow-hidden">
            {/* Header Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="modal-pattern"
                    x="0"
                    y="0"
                    width="30"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="15"
                      cy="15"
                      r="1"
                      fill="rgba(255,255,255,0.3)"
                    />
                    <path
                      d="M0 15h30M15 0v30"
                      stroke="rgba(59, 130, 246, 0.1)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#modal-pattern)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <UserIcon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-transparent">
                    {title}
                  </h2>
                  <div className="text-sm text-blue-200">Chat Access</div>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={() => {
                    log.info("Username modal closed by user");
                    onClose();
                  }}
                  className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
            </div>
            <p className="relative z-10 text-blue-200 text-sm mt-3 flex items-center gap-2">
              <span>🚀</span>
              Choose your identity for conversations
            </p>
          </div>

          {/* Enhanced Content */}
          <div className="p-8 bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-purple-50/20 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="content-pattern"
                    x="0"
                    y="0"
                    width="25"
                    height="25"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="12.5"
                      cy="12.5"
                      r="1"
                      fill="rgba(59, 130, 246, 0.2)"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#content-pattern)" />
              </svg>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              {/* Enhanced Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3"
                >
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">👤</span>
                  </span>
                  Your Chat Identity
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="✨ Enter your username..."
                    className={`w-full px-6 py-4 border-2 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 backdrop-blur-sm bg-white/90 font-medium ${
                      error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200/50"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200/50 hover:border-gray-300"
                    }`}
                    maxLength={20}
                    disabled={isLoading}
                  />
                  {username.trim().length >= 2 && !error && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Input Focus Ring */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Enhanced Character count and validation */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    {error ? (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        <span className="text-xs">⚠️</span>
                        <span className="text-xs font-medium">{error}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                        <span className="text-xs">ℹ️</span>
                        <span className="text-xs">
                          Letters, numbers, - and _ only
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      username.length > 15
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-500 bg-gray-50"
                    }`}
                  >
                    {username.length}/20
                  </div>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={!username.trim() || isLoading || !!error}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform relative overflow-hidden ${
                  !username.trim() || isLoading || !!error
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1"
                }`}
              >
                {/* Button Background Effect */}
                {!(!username.trim() || isLoading || !!error) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                )}

                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Connecting to Chat...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Start Chatting</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Enhanced Tips Section */}
            <div className="relative z-10 mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">💡</span>
                </div>
                <h4 className="text-sm font-bold text-gray-800">
                  Quick Setup Tips
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                  <span className="text-green-500 text-sm">✅</span>
                  <span className="text-xs text-gray-700 font-medium">
                    Choose a memorable, unique identity
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                  <span className="text-blue-500 text-sm">🤝</span>
                  <span className="text-xs text-gray-700 font-medium">
                    Keep it friendly for better interactions
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                  <span className="text-purple-500 text-sm">🔄</span>
                  <span className="text-xs text-gray-700 font-medium">
                    You can reset and change it anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
