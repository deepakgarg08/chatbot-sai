import React, { useEffect } from "react";
import Chat from "./components/Chat";
import { log } from "./config";
import "./App.css";

function App() {
  useEffect(() => {
    log.info("App component mounted");
    log.debug("Starting chat application");
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
      <div className="container mx-auto h-full px-4 md:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-500/15 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>

          {/* Circuit-like Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="circuit-pattern"
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M0 30h15v-15h15v15h15v15h-15v15h-15v-15H0z"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="15"
                    cy="15"
                    r="2"
                    fill="rgba(59, 130, 246, 0.4)"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="2"
                    fill="rgba(147, 51, 234, 0.4)"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
            </svg>
          </div>

          {/* Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"></div>
        </div>

        {/* App Header */}
        <div className="relative z-10 text-center py-6 border-b border-white/10 backdrop-blur-sm bg-white/5 mx-4 md:mx-0">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Chat Application
            </h1>
          </div>
          <p className="text-blue-200 text-sm font-medium">
            ✨ Real-time Messaging • Group Chat • Private Messages
          </p>
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-[calc(100vh-120px)] px-2 md:px-0">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default App;
