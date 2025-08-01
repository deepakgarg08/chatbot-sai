import { expect } from "chai";
import { io as Client } from "socket.io-client";
import jsonrpc from "jsonrpc-lite";
import { startServer, stopServer, httpServerAddr } from "./setup.js";

describe("Private Chat (1-to-1) Tests", function () {
  before(async function () {
    await startServer();
  });

  after(async function () {
    await stopServer();
  });

  it("should send private message between two users", function () {
    this.timeout(8000);

    return new Promise((resolve, reject) => {
      const alice = new Client(`http://localhost:${httpServerAddr.port}`);
      const bob = new Client(`http://localhost:${httpServerAddr.port}`);

      let aliceRegistered = false;
      let bobRegistered = false;
      let privateMessageReceived = false;
      let senderAckReceived = false;

      // Alice connects and registers
      alice.on("connect", () => {
        const registerReq = jsonrpc.request(1, "registerUser", {
          username: "alice",
        });
        alice.emit("rpc", registerReq);
      });

      // Bob connects and registers
      bob.on("connect", () => {
        const registerReq = jsonrpc.request(2, "registerUser", {
          username: "bob",
        });
        bob.emit("rpc", registerReq);
      });

      // Handle Alice's registration response
      alice.on("rpc", (msg) => {
        try {
          const parsed = jsonrpc.parseObject(msg);

          if (parsed.type === "success" && parsed.payload.id === 1) {
            expect(parsed.payload.result).to.have.property("registered", true);
            aliceRegistered = true;
            checkIfBothRegistered();
          } else if (parsed.type === "success" && parsed.payload.id === 3) {
            expect(parsed.payload.result).to.have.property("delivered", true);
            senderAckReceived = true;
            checkDone();
          }
        } catch (err) {
          cleanup();
          reject(err);
        }
      });

      // Handle Bob's registration response and private messages
      bob.on("rpc", (msg) => {
        try {
          const parsed = jsonrpc.parseObject(msg);

          if (parsed.type === "success" && parsed.payload.id === 2) {
            expect(parsed.payload.result).to.have.property("registered", true);
            bobRegistered = true;
            checkIfBothRegistered();
          } else if (
            parsed.type === "notification" &&
            parsed.payload.method === "privateMessage"
          ) {
            expect(parsed.payload.params.from).to.equal("alice");
            expect(parsed.payload.params.text).to.equal(
              "Hi Bob, this is Alice!",
            );
            privateMessageReceived = true;
            checkDone();
          }
        } catch (err) {
          cleanup();
          reject(err);
        }
      });

      function checkIfBothRegistered() {
        if (aliceRegistered && bobRegistered) {
          setTimeout(() => {
            const privateMessageReq = jsonrpc.request(3, "sendPrivateMessage", {
              sender: "alice",
              recipient: "bob",
              text: "Hi Bob, this is Alice!",
              timestamp: Date.now(),
            });
            alice.emit("rpc", privateMessageReq);
          }, 100);
        }
      }

      function checkDone() {
        if (privateMessageReceived && senderAckReceived) {
          cleanup();
          resolve();
        }
      }

      function cleanup() {
        alice.disconnect();
        bob.disconnect();
      }

      alice.on("error", (err) => {
        cleanup();
        reject(err);
      });

      bob.on("error", (err) => {
        cleanup();
        reject(err);
      });
    });
  });

  it("should fail to send private message to non-existent user", function () {
    this.timeout(5000);

    return new Promise((resolve, reject) => {
      const alice = new Client(`http://localhost:${httpServerAddr.port}`);

      alice.on("connect", () => {
        const registerReq = jsonrpc.request(1, "registerUser", {
          username: "alice",
        });
        alice.emit("rpc", registerReq);
      });

      alice.on("rpc", (msg) => {
        try {
          const parsed = jsonrpc.parseObject(msg);

          if (parsed.type === "success" && parsed.payload.id === 1) {
            expect(parsed.payload.result).to.have.property("registered", true);
            setTimeout(() => {
              const privateMessageReq = jsonrpc.request(
                2,
                "sendPrivateMessage",
                {
                  sender: "alice",
                  recipient: "nonexistent",
                  text: "This should fail",
                  timestamp: Date.now(),
                },
              );
              alice.emit("rpc", privateMessageReq);
            }, 100);
          } else if (parsed.type === "error" && parsed.payload.id === 2) {
            expect(parsed.payload.error.code).to.equal(-32004);
            expect(parsed.payload.error.message).to.include(
              "not found or offline",
            );
            alice.disconnect();
            resolve();
          }
        } catch (err) {
          alice.disconnect();
          reject(err);
        }
      });

      alice.on("error", (err) => {
        alice.disconnect();
        reject(err);
      });
    });
  });
});
