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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="bg-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="white" opacity="0.5" />
              <circle cx="0" cy="0" r="1" fill="white" opacity="0.3" />
              <circle cx="40" cy="40" r="1" fill="white" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-pattern)" />
        </svg>
      </div>

      {/* App Header */}
      <div className="relative z-10 text-center py-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white mb-1">
          Real-Time Chat App
        </h1>
        <p className="text-purple-200 text-sm">
          Connect, chat, and collaborate in real-time
        </p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100vh-120px)]">
        <Chat />
      </div>
    </div>
  );
}

export default App;
