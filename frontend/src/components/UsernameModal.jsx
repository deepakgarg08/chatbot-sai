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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Modal Background with animated entrance */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserIcon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
              {onClose && (
                <button
                  onClick={() => {
                    log.info("Username modal closed by user");
                    onClose();
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-indigo-100 text-sm mt-2">
              Choose a unique username to start chatting
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your username..."
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                    }`}
                    maxLength={20}
                    disabled={isLoading}
                  />
                  {username.trim().length >= 2 && !error && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>

                {/* Character count */}
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span
                    className={`${error ? "text-red-500" : "text-gray-500"}`}
                  >
                    {error || "Letters, numbers, underscores, and hyphens only"}
                  </span>
                  <span
                    className={`${username.length > 15 ? "text-orange-500" : "text-gray-400"}`}
                  >
                    {username.length}/20
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!username.trim() || isLoading || !!error}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                  !username.trim() || isLoading || !!error
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connecting...
                  </div>
                ) : (
                  "Start Chatting"
                )}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tips:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Choose a name that others can easily recognize</li>
                <li>• Keep it friendly and appropriate</li>
                <li>• You can change it later using the reset button</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
