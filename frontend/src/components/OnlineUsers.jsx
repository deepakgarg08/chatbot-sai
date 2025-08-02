import React from "react";
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { log } from "../config";

const OnlineUsers = ({
  onlineUsers,
  currentUsername,
  activePrivateChat,
  unreadCounts,
  onUserClick,
  onPublicChatClick,
  onClearSession,
  onCompleteReset,
}) => {
  const otherUsers = onlineUsers.filter((user) => user !== currentUsername);

  // Log when component renders
  React.useEffect(() => {
    log.debug("OnlineUsers component rendered", {
      totalUsers: onlineUsers.length,
      otherUsers: otherUsers.length,
      currentUsername,
      activePrivateChat,
    });
  }, [onlineUsers, otherUsers, currentUsername, activePrivateChat]);

  const handleUserClick = (user) => {
    log.info("User clicked for private chat", { targetUser: user });
    onUserClick(user);
  };

  const handlePublicChatClick = () => {
    log.info("Switching to public chat");
    onPublicChatClick();
  };

  const handleClearSession = () => {
    log.warn("Clearing user session");
    onClearSession();
  };

  const handleCompleteReset = () => {
    log.warn("Requesting complete data reset");
    onCompleteReset();
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl h-full flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="users-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1" fill="rgba(59, 130, 246, 0.3)" />
              <path
                d="M0 20h40M20 0v40"
                stroke="rgba(147, 51, 234, 0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#users-pattern)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-800 text-white border-b border-white/10">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserIconSolid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Connected Users
              </h3>
              <div className="text-xs text-blue-200">Chat Network</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearSession}
              className="text-xs px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 transform hover:scale-105 shadow-lg"
              title="Clear session and reload"
            >
              🔄 Reset
            </button>
            <button
              onClick={handleCompleteReset}
              className="text-xs px-3 py-2 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-600/80 transition-all duration-200 transform hover:scale-105 shadow-lg"
              title="Reset ALL data (for everyone)"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-200">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">
            {otherUsers.length} user{otherUsers.length !== 1 ? "s" : ""} online
          </span>
        </div>
      </div>

      {/* Public Chat Button */}
      <div className="relative z-10 p-4 border-b border-white/10">
        <button
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-xl backdrop-blur-sm ${
            activePrivateChat === null
              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl scale-105 border border-blue-400/30"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40"
          }`}
          onClick={handlePublicChatClick}
        >
          <div
            className={`p-3 rounded-xl shadow-lg ${
              activePrivateChat === null
                ? "bg-white/20 backdrop-blur-sm"
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            }`}
          >
            <GlobeAltIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-lg">Public Group Chat</div>
            <div className="text-sm text-blue-200 flex items-center gap-2">
              <span>🌐</span>
              <span>Public conversations</span>
            </div>
          </div>
          {activePrivateChat === null && (
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
          )}
        </button>
      </div>

      {/* Users List */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        {otherUsers.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/10">
                <UserIcon className="w-8 h-8 text-white/40" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👋</span>
              </div>
            </div>
            <p className="text-sm font-medium text-white/80 mb-2">
              Waiting for connections
            </p>
            <p className="text-xs text-blue-200">
              Share the link to invite others!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {otherUsers.map((user) => {
              const isActive = activePrivateChat === user;
              const hasUnread = unreadCounts[user] > 0;

              return (
                <div
                  key={user}
                  className={`group relative cursor-pointer p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white shadow-2xl scale-105 border border-purple-400/30"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 hover:shadow-xl"
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center gap-4">
                    {/* Enhanced Avatar */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xl ${
                          isActive
                            ? "bg-white/20 text-white backdrop-blur-sm border border-white/30"
                            : "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white border border-white/20"
                        }`}
                      >
                        {user.charAt(0).toUpperCase()}
                      </div>
                      {/* Enhanced Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
                        <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                      {/* User Indicator */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full border border-white shadow-lg flex items-center justify-center">
                        <span className="text-white text-xs">💬</span>
                      </div>
                    </div>

                    {/* Enhanced User info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate text-white">
                        {user}
                      </div>
                      <div className="text-sm flex items-center gap-2 text-blue-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Online & Active</span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                          User
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Chat action */}
                    <div className="flex items-center gap-3">
                      {hasUnread && (
                        <div className="relative">
                          <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xs text-white font-bold">
                              {unreadCounts[user] > 9
                                ? "9+"
                                : unreadCounts[user]}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
                          isActive
                            ? "bg-white/20 backdrop-blur-sm"
                            : "bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-purple-600 group-hover:to-pink-600"
                        }`}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-blue-400/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="absolute inset-0 border border-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Footer with current user info */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-indigo-800/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl">
              {currentUsername.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
              <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-xs">👤</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-lg">
              {currentUsername}
            </div>
            <div className="text-sm text-blue-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>You are connected</span>
              <span className="text-xs bg-green-400/20 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;
