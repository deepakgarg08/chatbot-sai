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
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-r border-indigo-200 shadow-lg">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <UserIconSolid className="w-5 h-5" />
            <h3 className="font-bold text-lg">Online Users</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleClearSession}
              className="text-xs px-2 py-1 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              title="Clear session and reload"
            >
              Reset
            </button>
            <button
              onClick={handleCompleteReset}
              className="text-xs px-2 py-1 bg-red-500/80 text-white rounded-full hover:bg-red-600/80 transition-colors"
              title="Reset ALL data (for everyone)"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="text-sm opacity-90">
          {otherUsers.length} user{otherUsers.length !== 1 ? "s" : ""} online
        </div>
      </div>

      {/* Public Chat Button */}
      <div className="p-3 border-b border-indigo-100">
        <button
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
            activePrivateChat === null
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105"
              : "bg-white hover:bg-indigo-50 text-gray-700 border border-gray-200 hover:border-indigo-300"
          }`}
          onClick={handlePublicChatClick}
        >
          <div
            className={`p-2 rounded-lg ${
              activePrivateChat === null ? "bg-white/20" : "bg-indigo-100"
            }`}
          >
            <GlobeAltIcon
              className={`w-5 h-5 ${
                activePrivateChat === null ? "text-white" : "text-indigo-600"
              }`}
            />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold">Public Chat</div>
            <div
              className={`text-sm ${
                activePrivateChat === null ? "text-white/80" : "text-gray-500"
              }`}
            >
              Everyone can see
            </div>
          </div>
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {otherUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No other users online</p>
            <p className="text-xs mt-1">Invite friends to chat!</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {otherUsers.map((user) => {
              const isActive = activePrivateChat === user;
              const hasUnread = unreadCounts[user] > 0;

              return (
                <div
                  key={user}
                  className={`group relative cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                      : "bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 hover:shadow-md"
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gradient-to-br from-purple-400 to-pink-400 text-white"
                        }`}
                      >
                        {user.charAt(0).toUpperCase()}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm">
                        <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold truncate ${
                          isActive ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {user}
                      </div>
                      <div
                        className={`text-sm flex items-center gap-1 ${
                          isActive ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Online
                      </div>
                    </div>

                    {/* Chat action */}
                    <div className="flex items-center gap-2">
                      {hasUnread && (
                        <div className="relative">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {unreadCounts[user] > 9
                                ? "9+"
                                : unreadCounts[user]}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                      )}

                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? "bg-white/20"
                            : "bg-purple-100 group-hover:bg-purple-200"
                        }`}
                      >
                        <ChatBubbleLeftRightIcon
                          className={`w-4 h-4 ${
                            isActive ? "text-white" : "text-purple-600"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with current user info */}
      <div className="p-3 border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {currentUsername.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">
              {currentUsername}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              That's you!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;
