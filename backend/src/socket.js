export default function setupSocket(io) {
  const users = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("register user", (username) => {
      users.set(socket.id, username);
      console.log(`User registered: ${username} (socket ${socket.id})`);
    });

    socket.on("chat message", (data) => {
      if (!data || !data.user || !data.text) {
        console.warn("Invalid message data:", data);
        return;
      }
      console.log(`Message from ${data.user}: ${data.text}`);

      io.emit("chat message", data); // Broadcast to all including sender
    });


    socket.on('typing', (username) => {
      // broadcast to everyone except sender that 'username' is typing
      socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', (username) => {
      // broadcast to everyone except sender that 'username' stopped typing
      socket.broadcast.emit('stop typing', username);
    });

    socket.on("disconnect", () => {
      const username = users.get(socket.id);
      users.delete(socket.id);
      console.log(`User disconnected: ${username || "Unknown"} (socket ${socket.id})`);
    });

  });
}
