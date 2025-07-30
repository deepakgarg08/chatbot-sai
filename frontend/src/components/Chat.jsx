import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUsername, addMessage } from "../store/chatSlice";
import socket from "../services/socket";

const Chat = () => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.chat.username);
  const messages = useSelector((state) => state.chat.messages);

  const [input, setInput] = useState("");
  const usernamePrompted = useRef(false);

  // Prompt once after mount
  useEffect(() => {
    if (usernamePrompted.current) return;
    usernamePrompted.current = true;

    let name = "";
    while (!name) {
      name = prompt("Enter your username")?.trim();
      if (!name) alert("Please enter a valid username.");
    }
    dispatch(setUsername(name));
  }, [dispatch]);

  // Register socket event listener once when username is set
  useEffect(() => {
    if (!username) return; // wait until username is set

    const messageHandler = (data) => {
      dispatch(addMessage(data));
    };

    socket.on("chat message", messageHandler);

    return () => {
      socket.off("chat message", messageHandler);
    };
  }, [username, dispatch]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    const messageData = { user: username, text: input };
    socket.emit("chat message", messageData);
    setInput("");
    // No local append; wait for server broadcast to update Redux state
  };

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">
        Chat as <span className="text-indigo-600">{username}</span>
      </h2>

      <div
        className="border rounded-md p-4 mb-4 h-80 overflow-y-auto bg-gray-50 flex flex-col"
        id="messages-container"
      >
        {messages.map(({ user, text }, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${
              user === username
                ? "bg-indigo-100 text-indigo-900 self-end"
                : "bg-gray-200 text-gray-900 self-start"
            }`}
          >
            <strong>{user}:</strong> {text}
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          autoFocus
        />
        <button
          className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
