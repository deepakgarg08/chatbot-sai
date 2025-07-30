import { io as Client } from "socket.io-client";
import jsonrpc from "jsonrpc-lite";
import { startServer, stopServer, httpServerAddr } from "./setup.js";

describe("Multi-user broadcast test", function () {
  this.timeout(20000); // extend timeout as multiple sockets involved

  const users = [
    { username: "TestUser1", socket: null, received: false },
    { username: "TestUser2", socket: null, received: false },
    { username: "TestUser3", socket: null, received: false },
  ];

  let sender;

  before(async function () {
    await startServer();
  });

  after(async function () {
    await stopServer();
  });

  afterEach(function () {
    // Disconnect all user sockets after each test if still connected
    users.forEach((u) => {
      if (u.socket) {
        u.socket.disconnect();
        u.socket = null;
        u.received = false;
      }
    });
    if (sender) {
      sender.disconnect();
      sender = null;
    }
  });

  it("should broadcast chat message to all connected users except sender", function () {
    return new Promise((resolve, reject) => {
      let resolved = false;

      // Timeout to avoid hanging test
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Test timed out: not all users received broadcast"));
      }, 18000);

      // Start connecting user sockets
      Promise.all(
        users.map(({ username }, i) => {
          return new Promise((res, rej) => {
            const sock = new Client(`http://localhost:${httpServerAddr.port}`);
            users[i].socket = sock;

            sock.on("connect", () => {
              const req = jsonrpc.request(100 + i, "registerUser", { username });
              sock.emit("rpc", req);
            });

            sock.on("rpc", (msg) => {
              try {
                const parsed = jsonrpc.parseObject(msg);

                if (
                  parsed.type === "success" &&
                  parsed.payload.id === 100 + i &&
                  parsed.payload.result &&
                  parsed.payload.result.registered === true
                ) {
                  // User registered successfully
                  res();
                } else if (
                  parsed.type === "notification" &&
                  parsed.payload.method === "chatMessage"
                ) {
                  // Received broadcast message
                  users[i].received = true;
                  checkAllReceived();
                }
              } catch (err) {
                rej(err);
              }
            });

            sock.on("error", rej);
          });
        })
      )
        .then(() => {
          // All users connected and registered, now connect sender and send message
          sender = new Client(`http://localhost:${httpServerAddr.port}`);

          sender.on("connect", () => {
            const regReq = jsonrpc.request(200, "registerUser", {
              username: "senderUser",
            });
            sender.emit("rpc", regReq);
          });

          sender.on("rpc", (msg) => {
            try {
              const parsed = jsonrpc.parseObject(msg);

              if (parsed.type === "success" && parsed.payload.id === 200) {
                // Sender registered, now send chat message
                const sendMsgReq = jsonrpc.request(201, "sendMessage", {
                  user: "senderUser",
                  text: "Hello, everyone!",
                });
                sender.emit("rpc", sendMsgReq);
              } else if (
                parsed.type === "success" &&
                parsed.payload.id === 201 &&
                parsed.payload.result &&
                parsed.payload.result.delivered === true
              ) {
                // Message delivered ack received; now just wait for broadcasts
              }
            } catch (err) {
              cleanup();
              reject(err);
            }
          });

          sender.on("error", (err) => {
            cleanup();
            reject(err);
          });
        })
        .catch((err) => {
          cleanup();
          reject(err);
        });

      function checkAllReceived() {
        // Check if all users received broadcast message
        if (users.every((u) => u.received) && !resolved) {
          resolved = true;
          cleanup();
          resolve();
        }
      }

      function cleanup() {
        clearTimeout(timeout);
        users.forEach((u) => {
          if (u.socket) {
            u.socket.disconnect();
            u.socket = null;
            u.received = false;
          }
        });
        if (sender) {
          sender.disconnect();
          sender = null;
        }
      }
    });
  });
});
